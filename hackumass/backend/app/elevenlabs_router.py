# backend/app/elevenlabs_router.py
import os
import json
import re
import uuid
import asyncio
import queue
import threading
import io
import base64
from typing import Dict, Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
try:
    from fastapi.websockets import WebSocketState
except ImportError:
    # Fallback for older FastAPI versions
    from starlette.websockets import WebSocketState
from pydantic import BaseModel
from elevenlabs.client import ElevenLabs
from elevenlabs.conversational_ai.conversation import Conversation
from elevenlabs.conversational_ai.default_audio_interface import DefaultAudioInterface

router = APIRouter(prefix="/elevenlabs", tags=["elevenlabs"])

# Store active conversations and workout data
active_conversations: Dict[str, dict] = {}
workout_data_store: Dict[str, dict] = {}

class ConversationRequest(BaseModel):
    agent_id: Optional[str] = None
    api_key: Optional[str] = None

class WorkoutData(BaseModel):
    activity: str
    duration: int
    difficulty: Optional[str] = None

class WebSocketAudioBridge:
    """
    Bridge between WebSocket and ElevenLabs conversation.
    Handles audio streaming in both directions.
    """
    def __init__(self, websocket: WebSocket, conversation_id: str):
        self.websocket = websocket
        self.conversation_id = conversation_id
        self.audio_input_buffer = queue.Queue()
        self.audio_output_buffer = queue.Queue()
        self.is_active = True
        self.audio_lock = threading.Lock()
        
    def add_audio_input(self, audio_data: bytes):
        """Add audio data from WebSocket to input buffer"""
        if self.is_active and audio_data:
            self.audio_input_buffer.put(audio_data)
    
    def get_audio_output(self) -> Optional[bytes]:
        """Get audio data from output buffer to send to WebSocket"""
        try:
            return self.audio_output_buffer.get_nowait()
        except queue.Empty:
            return None
    
    def add_audio_output(self, audio_data: bytes):
        """Add audio data from ElevenLabs to output buffer"""
        if self.is_active and audio_data:
            self.audio_output_buffer.put(audio_data)
    
    def stop(self):
        """Stop the audio bridge"""
        self.is_active = False

@router.websocket("/ws/conversation")
async def websocket_conversation(websocket: WebSocket):
    """
    WebSocket endpoint for voice conversation with ElevenLabs.
    Handles audio streaming: receives audio from client, processes with ElevenLabs,
    and sends audio responses back to client.
    
    Protocol:
    - Binary messages: Audio data (client -> server and server -> client)
    - JSON messages: Control messages (start, stop, ping, etc.)
    """
    await websocket.accept()
    conversation_id = str(uuid.uuid4())
    
    # Get ElevenLabs credentials
    agent_id = os.getenv("AGENT_ID")
    api_key = os.getenv("ELEVENLABS_API_KEY")
    
    if not agent_id or not api_key:
        await websocket.send_json({
            "type": "error",
            "message": "AGENT_ID or ELEVENLABS_API_KEY not configured"
        })
        await websocket.close()
        return
    
    # Create audio bridge
    audio_bridge = WebSocketAudioBridge(websocket, conversation_id)
    
    # Store conversation data
    workout_data_received = []
    conversation = None
    conversation_active = True
    
    # Callback for user transcripts
    def user_transcript_callback(transcript: str):
        """Callback when user speaks - extract workout data"""
        if conversation_active:
            asyncio.create_task(process_transcript_for_workout(transcript, conversation_id, workout_data_received, websocket))
            asyncio.create_task(send_transcript_update(websocket, "user", transcript))
    
    # Callback for agent responses
    def agent_response_callback(response: str):
        """Callback when agent responds"""
        if conversation_active:
            asyncio.create_task(send_transcript_update(websocket, "agent", response))
    
    # Initialize ElevenLabs client and conversation
    try:
        elevenlabs_client = ElevenLabs(api_key=api_key)
        
        # For now, we'll use a simplified approach:
        # Process transcripts instead of real-time audio streaming
        # This is a fallback until we can properly bridge audio
        # The client will send transcripts, and we'll process them
        
        active_conversations[conversation_id] = {
            "id": conversation_id,
            "active": True,
            "workout_data": None,
            "audio_bridge": audio_bridge,
            "workout_data_received": workout_data_received
        }
        
        # Send connection confirmation
        await websocket.send_json({
            "type": "connected",
            "conversation_id": conversation_id,
            "status": "ready",
            "mode": "transcript"  # For now, using transcript mode
        })
        
    except Exception as e:
        await websocket.send_json({
            "type": "error",
            "message": f"Failed to initialize: {str(e)}"
        })
        await websocket.close()
        return
    
    try:
        # Main message handling loop
        while conversation_active:
            try:
                # Receive data from client (can be binary audio or JSON messages)
                data = await websocket.receive()
                
                if "bytes" in data:
                    # Binary audio data from client
                    # For now, we'll need to convert this to transcripts or process differently
                    # This is a placeholder for future audio streaming implementation
                    audio_chunk = data["bytes"]
                    if audio_chunk:
                        # Store audio for processing
                        audio_bridge.add_audio_input(audio_chunk)
                        # Note: Real audio processing would require proper audio format handling
                        # For MVP, we'll use transcript-based approach
                
                elif "text" in data:
                    # JSON control message
                    try:
                        print(f"📥 Received JSON message: {data['text'][:100]}...")
                        message = json.loads(data["text"])
                        message_type = message.get("type")
                        print(f"📥 Message type: {message_type}")
                        
                        if message_type == "start":
                            # Start conversation - for transcript mode
                            print(f"🎬 Processing start message")
                            print(f"🔍 Connection state: {websocket.client_state}")
                            print(f"🔍 State type: {type(websocket.client_state)}")
                            print(f"🔍 CONNECTED enum: {WebSocketState.CONNECTED}")
                            print(f"🔍 State == CONNECTED: {websocket.client_state == WebSocketState.CONNECTED}")
                            
                            # Always try to send started response (connection should be open if we received a message)
                            try:
                                response = {
                                    "type": "started",
                                    "conversation_id": conversation_id
                                }
                                print(f"📤 Sending started response: {response}")
                                await websocket.send_json(response)
                                print(f"✅ Started response sent successfully")
                            except Exception as e:
                                print(f"❌ Error sending started response: {e}")
                                import traceback
                                traceback.print_exc()
                                # Don't silently fail - this is important
                        
                        elif message_type == "transcript":
                            # Process transcript from client (transcript mode)
                            transcript = message.get("text", "")
                            print(f"📥 Received transcript: {transcript}")
                            if transcript:
                                user_transcript_callback(transcript)
                                try:
                                    if websocket.client_state == WebSocketState.CONNECTED:
                                        await websocket.send_json({
                                            "type": "transcript_received",
                                            "conversation_id": conversation_id
                                        })
                                        print(f"✅ Sent transcript_received confirmation")
                                except:
                                    print("⚠️ Could not send transcript_received (connection closed)")
                                    pass  # Connection closed
                                
                                # Get agent response from ElevenLabs
                                try:
                                    print(f"🤖 Getting agent response for: {transcript}")
                                    agent_response = await get_agent_response(
                                        transcript, 
                                        elevenlabs_client, 
                                        agent_id,
                                        conversation_id
                                    )
                                    print(f"🤖 Agent response: {agent_response}")
                                    
                                    if agent_response:
                                        # Send agent response as transcript
                                        print(f"📤 Sending agent transcript: {agent_response}")
                                        await send_transcript_update(websocket, "agent", agent_response)
                                        
                                        # Generate audio from agent response
                                        print(f"🎵 Generating audio for agent response...")
                                        await generate_and_send_audio(
                                            agent_response,
                                            elevenlabs_client,
                                            websocket
                                        )
                                    else:
                                        print("⚠️ No agent response generated")
                                except Exception as e:
                                    print(f"❌ Error getting agent response: {e}")
                                    import traceback
                                    traceback.print_exc()
                                    # Send a fallback response
                                    fallback_response = "I understand you want to log a workout. Could you tell me what activity you did and for how long?"
                                    await send_transcript_update(websocket, "agent", fallback_response)
                                    await generate_and_send_audio(fallback_response, elevenlabs_client, websocket)
                            else:
                                print("⚠️ Empty transcript received")
                        
                        elif message_type == "stop" or message_type == "end":
                            # End conversation
                            conversation_active = False
                            active_conversations[conversation_id]["active"] = False
                            audio_bridge.stop()
                            if conversation:
                                try:
                                    conversation.end_session()
                                except:
                                    pass
                            try:
                                if websocket.client_state == WebSocketState.CONNECTED:
                                    await websocket.send_json({
                                        "type": "ended",
                                        "conversation_id": conversation_id
                                    })
                            except:
                                pass  # Connection closed
                            break
                        
                        elif message_type == "ping":
                            # Keep-alive ping
                            try:
                                if websocket.client_state == WebSocketState.CONNECTED:
                                    await websocket.send_json({"type": "pong"})
                            except:
                                pass  # Connection closed
                        
                        elif message_type == "get_workout_data":
                            # Client requests stored workout data
                            workout_data = active_conversations[conversation_id].get("workout_data")
                            try:
                                if websocket.client_state == WebSocketState.CONNECTED:
                                    await websocket.send_json({
                                        "type": "workout_data",
                                        "conversation_id": conversation_id,
                                        "data": workout_data
                                    })
                            except:
                                pass  # Connection closed
                    
                    except json.JSONDecodeError:
                        try:
                            if websocket.client_state == WebSocketState.CONNECTED:
                                await websocket.send_json({
                                    "type": "error",
                                    "message": "Invalid JSON format"
                                })
                        except:
                            pass  # Connection closed
                
            except WebSocketDisconnect:
                print("🔌 WebSocket disconnected by client")
                break
            except RuntimeError as e:
                # Handle "Cannot call receive once a disconnect message has been received"
                if "disconnect" in str(e).lower():
                    print("🔌 WebSocket disconnect detected")
                    break
                else:
                    print(f"❌ Runtime error in WebSocket handler: {e}")
                    try:
                        if websocket.client_state == WebSocketState.CONNECTED:
                            await websocket.send_json({
                                "type": "error",
                                "message": str(e)
                            })
                    except:
                        pass  # Connection already closed
            except Exception as e:
                print(f"❌ Error in WebSocket handler: {e}")
                try:
                    if websocket.client_state == WebSocketState.CONNECTED:
                        await websocket.send_json({
                            "type": "error",
                            "message": str(e)
                        })
                except:
                    pass  # Connection already closed
        
    except Exception as e:
        print(f"❌ Error in WebSocket conversation: {e}")
        try:
            if websocket.client_state == WebSocketState.CONNECTED:
                await websocket.send_json({
                    "type": "error",
                    "message": str(e)
                })
        except:
            pass  # Connection already closed
    finally:
        # Cleanup
        print("🧹 Cleaning up WebSocket connection...")
        conversation_active = False
        if conversation_id in active_conversations:
            active_conversations[conversation_id]["active"] = False
            audio_bridge.stop()
            if conversation:
                try:
                    conversation.end_session()
                except:
                    pass
            del active_conversations[conversation_id]
        
        # Only close if not already closed
        try:
            if websocket.client_state == WebSocketState.CONNECTED:
                await websocket.close()
        except:
            pass  # Already closed


async def process_transcript_for_workout(transcript: str, conversation_id: str, workout_data_received: list, websocket: WebSocket):
    """Process transcript and extract workout data"""
    # Extract workout data from transcript
    workout_data = extract_workout_data(transcript)
    if workout_data:
        # Store workout data
        if conversation_id in active_conversations:
            active_conversations[conversation_id]["workout_data"] = workout_data
        workout_data_store[conversation_id] = workout_data
        workout_data_received.append(workout_data)
        
        # Send workout data to client
        try:
            await websocket.send_json({
                "type": "workout_data",
                "conversation_id": conversation_id,
                "data": workout_data
            })
        except Exception as e:
            print(f"Error sending workout data: {e}")


async def send_transcript_update(websocket: WebSocket, speaker: str, text: str):
    """Send transcript update to client"""
    try:
        # Check if WebSocket is still connected before sending
        if websocket.client_state != WebSocketState.CONNECTED:
            print(f"⚠️ WebSocket not connected, cannot send transcript update")
            return
            
        print(f"📤 Sending transcript update - {speaker}: {text[:50]}...")
        await websocket.send_json({
            "type": "transcript",
            "speaker": speaker,
            "text": text
        })
        print(f"✅ Transcript update sent successfully")
        
        # If it's a user transcript, check for workout data
        if speaker == "user":
            workout_data = extract_workout_data(text)
            if workout_data:
                print(f"💪 Extracted workout data: {workout_data}")
                if websocket.client_state == WebSocketState.CONNECTED:
                    await websocket.send_json({
                        "type": "workout_data",
                        "data": workout_data
                    })
    except Exception as e:
        print(f"❌ Error sending transcript update: {e}")
        # Don't print traceback for connection errors (expected when client disconnects)


def extract_workout_data(transcript: str) -> Optional[dict]:
    """
    Extract workout information from conversation transcript.
    Uses pattern matching to find activity, duration, and difficulty.
    """
    transcript_lower = transcript.lower()
    
    # Extract activity type
    activities = {
        "running": ["run", "jog", "ran"],
        "cycling": ["bike", "cycle", "cycling", "rode"],
        "yoga": ["yoga", "stretch"],
        "weight training": ["weight", "lift", "gym", "strength"],
        "swimming": ["swim", "pool"],
        "walking": ["walk", "walked"],
    }
    
    activity = None
    for key, keywords in activities.items():
        if any(keyword in transcript_lower for keyword in keywords):
            activity = key
            break
    
    # Extract duration (look for numbers followed by min/minutes)
    duration_match = re.search(r'(\d+)\s*(?:min|minute|minutes)', transcript_lower)
    duration = int(duration_match.group(1)) if duration_match else None
    
    # Extract difficulty
    difficulty = None
    if any(word in transcript_lower for word in ["easy", "light", "gentle"]):
        difficulty = "easy"
    elif any(word in transcript_lower for word in ["medium", "moderate", "normal"]):
        difficulty = "medium"
    elif any(word in transcript_lower for word in ["hard", "intense", "difficult", "heavy"]):
        difficulty = "hard"
    
    # Return workout data if we have at least activity and duration
    if activity and duration:
        return {
            "activity": activity,
            "duration": duration,
            "difficulty": difficulty or "medium"
        }
    
    return None


def validate_workout_data(data: dict) -> bool:
    """Validate workout data structure."""
    required_fields = ["activity", "duration"]
    return all(field in data for field in required_fields) and \
           isinstance(data.get("duration"), int) and \
           data.get("duration", 0) > 0


@router.get("/conversation/{conversation_id}/workout")
async def get_workout_data(conversation_id: str):
    """
    Get workout data for a conversation (REST endpoint).
    """
    if conversation_id not in workout_data_store:
        raise HTTPException(status_code=404, detail="Workout data not found")
    
    return {
        "conversation_id": conversation_id,
        "workout_data": workout_data_store[conversation_id]
    }


@router.post("/conversation/process-transcript")
async def process_transcript_endpoint(data: dict):
    """
    Process a transcript and extract workout data (REST endpoint).
    Useful for testing or non-WebSocket clients.
    """
    transcript = data.get("transcript", "")
    workout_data = extract_workout_data(transcript)
    
    if workout_data:
        return {
            "success": True,
            "workout_data": workout_data
        }
    else:
        return {
            "success": False,
            "message": "Could not extract workout data from transcript"
        }


async def get_agent_response(user_message: str, elevenlabs_client: ElevenLabs, agent_id: str, conversation_id: str) -> Optional[str]:
    """
    Get agent response using ElevenLabs conversational AI.
    For transcript mode, we'll use a simple prompt-based approach.
    """
    try:
        # For now, create a simple conversational response
        # In a full implementation, you'd use the ElevenLabs conversational API
        # to get a proper agent response
        
        # Simple response based on workout context
        user_lower = user_message.lower()
        
        if any(word in user_lower for word in ["run", "ran", "running", "jog"]):
            if "min" in user_lower or "minute" in user_lower:
                return "Great! I've logged your running workout"
            else:
                return "That sounds like a great run! How long did you run for?"
        
        elif any(word in user_lower for word in ["bike", "cycle", "cycling", "rode"]):
            if "min" in user_lower or "minute" in user_lower:
                return "Excellent! I've logged your cycling workout"
            else:
                return "Nice ride! How many minutes did you cycle?"
        
        elif any(word in user_lower for word in ["yoga", "stretch"]):
            if "min" in user_lower or "minute" in user_lower:
                return "Perfect! Your yoga session has been logged"
            else:
                return "That's wonderful! How long was your yoga session?"
        
        elif any(word in user_lower for word in ["workout", "exercise", "train"]):
            if "min" in user_lower or "minute" in user_lower:
                return "Awesome! I've logged your workout. Anything else you'd like to add?"
            else:
                return "What did you do for your workout and how long did your workout last?"
        
        else:
            return "I'd be happy to help you log your workout! What activity did you do, and for how long?"
    
    except Exception as e:
        print(f"Error getting agent response: {e}")
        return None


async def generate_and_send_audio(text: str, elevenlabs_client: ElevenLabs, websocket: WebSocket):
    """
    Generate audio from text using ElevenLabs TTS and send to client.
    """
    try:
        # Check if WebSocket is still connected
        if websocket.client_state != WebSocketState.CONNECTED:
            print(f"⚠️ WebSocket not connected, cannot send audio")
            return
            
        # Get a default voice ID (you can configure this)
        # For now, we'll use a default voice
        voice_id = "21m00Tcm4TlvDq8ikWAM"  # Rachel voice (ElevenLabs default)
        
        print(f"🎵 Generating audio for: {text[:50]}...")
        
        # Generate audio using text_to_speech method
        # This returns a generator that yields audio chunks
        audio_generator = elevenlabs_client.text_to_speech.convert(
            voice_id,
            text=text,
            model_id="eleven_monolingual_v1",
            output_format="mp3_44100_128"  # High quality MP3
        )
        
        # Collect audio chunks
        audio_chunks = []
        for chunk in audio_generator:
            if chunk:
                audio_chunks.append(chunk)
        
        # Combine audio chunks
        if audio_chunks:
            audio_data = b''.join(audio_chunks)
            
            # Check connection again before sending (client might have disconnected during audio generation)
            if websocket.client_state != WebSocketState.CONNECTED:
                print(f"⚠️ WebSocket disconnected during audio generation, cannot send audio")
                return
            
            # Send audio to client as base64
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
            
            await websocket.send_json({
                "type": "audio",
                "data": audio_base64,
                "format": "mp3"
            })
            
            print(f"✅ Sent audio response ({len(audio_data)} bytes)")
        else:
            print("⚠️ No audio data generated")
    
    except Exception as e:
        print(f"❌ Error generating audio: {e}")
        # Don't print full traceback for connection errors
        if "disconnect" not in str(e).lower() and "close" not in str(e).lower():
            import traceback
            traceback.print_exc()
        # If audio generation fails, the text response is still sent
        # so the user can at least see the response


@router.get("/config")
async def get_elevenlabs_config():
    """
    Get ElevenLabs configuration for client-side SDK.
    Returns agent_id that the React Native app needs.
    """
    agent_id = os.getenv("AGENT_ID")
    if not agent_id:
        raise HTTPException(status_code=500, detail="AGENT_ID not configured")
    
    return {
        "agent_id": agent_id,
        "ws_url": "/elevenlabs/ws/conversation",
        "backend_url": os.getenv("BACKEND_URL", "http://localhost:8000")
    }
