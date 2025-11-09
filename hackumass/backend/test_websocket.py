#!/usr/bin/env python3
"""
Simple WebSocket test script for the ElevenLabs router
"""
import asyncio
import json
import websockets

async def test_websocket():
    # Replace with your backend URL
    backend_url = "ws://localhost:8000/elevenlabs/ws/conversation"
    
    print(f"🔌 Connecting to {backend_url}...")
    
    try:
        async with websockets.connect(backend_url) as websocket:
            print("✅ Connected!")
            
            # Wait for initial "connected" message
            response = await websocket.recv()
            print(f"📥 Received: {response}")
            
            # Parse and check
            message = json.loads(response)
            if message.get("type") == "connected":
                print(f"✅ Connection confirmed! Conversation ID: {message.get('conversation_id')}")
            
            # Send "start" message
            print("\n📤 Sending 'start' message...")
            await websocket.send(json.dumps({"type": "start"}))
            
            # Wait for "started" response
            response = await websocket.recv()
            print(f"📥 Received: {response}")
            message = json.loads(response)
            if message.get("type") == "started":
                print("✅ Started response received!")
            
            # Send a test transcript
            print("\n📤 Sending test transcript...")
            await websocket.send(json.dumps({
                "type": "transcript",
                "text": "I ran for 30 minutes"
            }))
            
            # Wait for responses (should get transcript_received, transcript, and audio)
            for i in range(5):
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                    message = json.loads(response)
                    msg_type = message.get("type")
                    print(f"📥 Received ({i+1}): type={msg_type}")
                    
                    if msg_type == "transcript_received":
                        print("  ✅ Transcript confirmed")
                    elif msg_type == "transcript":
                        speaker = message.get("speaker", "unknown")
                        text = message.get("text", "")[:50]
                        print(f"  💬 {speaker}: {text}...")
                    elif msg_type == "audio":
                        audio_len = len(message.get("data", ""))
                        print(f"  🎵 Audio received ({audio_len} chars base64)")
                    elif msg_type == "workout_data":
                        print(f"  💪 Workout data: {message.get('data')}")
                    elif msg_type == "error":
                        print(f"  ❌ Error: {message.get('message')}")
                        
                except asyncio.TimeoutError:
                    print(f"⏱️ No response after 5 seconds")
                    break
            
            # Send stop message
            print("\n📤 Sending 'stop' message...")
            await websocket.send(json.dumps({"type": "stop"}))
            
            response = await websocket.recv()
            print(f"📥 Received: {response}")
            
            print("\n✅ Test completed successfully!")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_websocket())