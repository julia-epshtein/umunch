"""
Test script for ElevenLabs Conversational AI with voice input/output.
This script will:
1. Connect to your ElevenLabs agent
2. Listen to your microphone
3. Speak responses through your speakers
4. Send transcripts to your WebSocket endpoint for workout data extraction
"""
import os
import signal
import sys
import asyncio
import websockets
import json
import threading
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from elevenlabs.client import ElevenLabs
from elevenlabs.conversational_ai.conversation import Conversation
from elevenlabs.conversational_ai.default_audio_interface import DefaultAudioInterface

# Get credentials
agent_id = os.getenv("AGENT_ID")
api_key = os.getenv("ELEVENLABS_API_KEY")
backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")

if not agent_id or not api_key:
    print("❌ Error: AGENT_ID and ELEVENLABS_API_KEY must be set in .env file")
    print("   Please add them to your .env file:")
    print("   AGENT_ID=your_agent_id")
    print("   ELEVENLABS_API_KEY=your_api_key")
    sys.exit(1)

print("=" * 60)
print("🎤 ElevenLabs Voice Conversation Test")
print("=" * 60)
print(f"Agent ID: {agent_id[:20]}...")
print(f"Backend URL: {backend_url}")
print("=" * 60)
print()
print("📝 Instructions:")
print("  1. Speak into your microphone")
print("  2. The agent will respond through your speakers")
print("  3. Transcripts will be sent to the backend for workout data extraction")
print("  4. Press Ctrl+C to end the conversation")
print()
print("🎯 Try saying things like:")
print("  - 'I just ran for 30 minutes'")
print("  - 'I went cycling for 45 minutes at a hard pace'")
print("  - 'I did yoga for 20 minutes, it was easy'")
print()
print("=" * 60)
print()

# Store workout data
workout_data_received = []

def send_transcript_to_backend_sync(transcript: str):
    """Send transcript to backend WebSocket for workout data extraction (synchronous version)."""
    
    def send_async():
        try:
            async def send():
                ws_url = backend_url.replace("http://", "ws://").replace("https://", "wss://")
                ws_url += "/elevenlabs/ws/conversation"
                
                async with websockets.connect(ws_url, timeout=5) as websocket:
                    # Wait for connection confirmation
                    await websocket.recv()
                    
                    # Send transcript
                    await websocket.send(json.dumps({
                        "type": "transcript",
                        "text": transcript
                    }))
                    
                    # Wait for responses
                    try:
                        response1 = await asyncio.wait_for(websocket.recv(), timeout=2)
                        response2 = await asyncio.wait_for(websocket.recv(), timeout=2)
                        
                        data = json.loads(response2)
                        if data.get("type") == "workout_data":
                            workout = data.get("data")
                            workout_data_received.append(workout)
                            print(f"\n🏃 WORKOUT DATA EXTRACTED: {workout}")
                            print(f"   Activity: {workout.get('activity')}")
                            print(f"   Duration: {workout.get('duration')} minutes")
                            print(f"   Difficulty: {workout.get('difficulty')}")
                            print()
                    except asyncio.TimeoutError:
                        pass
            asyncio.run(send())
        except Exception as e:
            # Silently fail if backend is not available
            pass
    
    # Run in a separate thread to avoid blocking
    thread = threading.Thread(target=send_async, daemon=True)
    thread.start()

def user_transcript_callback(transcript: str):
    """Callback when user speaks."""
    print(f"\n👤 You: {transcript}")
    
    # Send to backend in a separate thread (don't block the conversation)
    send_transcript_to_backend_sync(transcript)

def agent_response_callback(response: str):
    """Callback when agent responds."""
    print(f"🤖 Agent: {response}")

def agent_response_correction_callback(original: str, corrected: str):
    """Callback when agent corrects its response."""
    print(f"🤖 Agent (corrected): {original} -> {corrected}")

# Initialize ElevenLabs client
elevenlabs = ElevenLabs(api_key=api_key)

# Create conversation with callbacks
conversation = Conversation(
    elevenlabs,
    agent_id,
    requires_auth=bool(api_key),
    audio_interface=DefaultAudioInterface(),
    callback_agent_response=agent_response_callback,
    callback_agent_response_correction=agent_response_correction_callback,
    callback_user_transcript=user_transcript_callback,
)

# Handle cleanup on Ctrl+C
def signal_handler(sig, frame):
    print("\n\n" + "=" * 60)
    print("🛑 Ending conversation...")
    print("=" * 60)
    if workout_data_received:
        print(f"\n📊 Workout data collected during conversation:")
        for i, workout in enumerate(workout_data_received, 1):
            print(f"  {i}. {workout.get('activity')} - {workout.get('duration')} min ({workout.get('difficulty')})")
    conversation.end_session()
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

# Start conversation
print("🎤 Starting conversation...")
print("   (Make sure your microphone is enabled)")
print()

try:
    conversation.start_session()
    conversation_id = conversation.wait_for_session_end()
    
    print("\n" + "=" * 60)
    print(f"✅ Conversation ended. ID: {conversation_id}")
    if workout_data_received:
        print(f"\n📊 Workout data collected:")
        for i, workout in enumerate(workout_data_received, 1):
            print(f"  {i}. {workout.get('activity')} - {workout.get('duration')} min ({workout.get('difficulty')})")
    print("=" * 60)
except KeyboardInterrupt:
    signal_handler(None, None)
except Exception as e:
    print(f"\n❌ Error: {e}")
    sys.exit(1)

