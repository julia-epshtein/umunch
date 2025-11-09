# 🎤 Quick Start: Test ElevenLabs Voice Conversation

## Prerequisites

1. ✅ Your backend server is running (`uvicorn app.main:app --reload`)
2. ✅ Your `.env` file has `AGENT_ID` and `ELEVENLABS_API_KEY`
3. ✅ Your microphone is connected and enabled
4. ✅ PyAudio is installed (required for microphone/speaker access)

### Installing PyAudio (if needed)

**On macOS:**
```bash
# Install portaudio first (required dependency)
brew install portaudio

# Then install pyaudio
pip install pyaudio
```

**On Linux:**
```bash
# Install portaudio development libraries
sudo apt-get install portaudio19-dev python3-pyaudio

# Or on Fedora/CentOS
sudo yum install portaudio-devel
pip install pyaudio
```

**On Windows:**
```bash
pip install pyaudio
```

## Quick Test (3 Steps)

### Step 1: Start Backend Server (if not already running)
```bash
cd hackumass/backend
uvicorn app.main:app --reload
```

### Step 2: Run Voice Test Script
```bash
python3 test_voice_elevenlabs.py
```

### Step 3: Speak!
- The script will start listening
- Say something like: **"I just ran for 30 minutes"**
- The agent will respond through your speakers
- Workout data will be extracted automatically!

## What You'll See

```
============================================================
🎤 ElevenLabs Voice Conversation Test
============================================================
Agent ID: agent_9601k9jc2d7zfpq9w...
Backend URL: http://localhost:8000
============================================================

🎤 Starting conversation...
   (Make sure your microphone is enabled)

👤 You: I just ran for 30 minutes
🤖 Agent: Great job on your run! That's awesome.

🏃 WORKOUT DATA EXTRACTED: {'activity': 'running', 'duration': 30, 'difficulty': 'medium'}
   Activity: running
   Duration: 30 minutes
   Difficulty: medium
```

## Example Phrases to Try

- ✅ "I just ran for 30 minutes"
- ✅ "I went cycling for 45 minutes at a hard pace"
- ✅ "I did yoga for 20 minutes, it was easy"
- ✅ "I walked for 60 minutes today"
- ✅ "I swam for 15 minutes"

## Ending the Conversation

Press `Ctrl+C` to end. You'll see a summary:

```
============================================================
🛑 Ending conversation...
============================================================

📊 Workout data collected during conversation:
  1. running - 30 min (medium)
  2. cycling - 45 min (hard)
```

## Troubleshooting

### "AGENT_ID and ELEVENLABS_API_KEY must be set"
- Check your `.env` file in `hackumass/backend/`
- Make sure it has: `AGENT_ID=...` and `ELEVENLABS_API_KEY=...`

### "No microphone found"
- Check your system's microphone permissions
- On macOS: System Settings → Privacy & Security → Microphone
- Grant access to Terminal or Python

### "Backend connection failed"
- Make sure your FastAPI server is running
- The script will continue even if backend is down (just won't extract workout data)

### Audio issues
- Check your system volume
- Make sure speakers/headphones are connected
- Try speaking clearly and waiting for the agent to finish

## How It Works

1. **Voice Input**: Your microphone captures your voice
2. **ElevenLabs Processing**: The agent processes your speech
3. **Agent Response**: The agent responds through your speakers
4. **Transcript Extraction**: Your words are sent to the backend
5. **Workout Data**: The backend extracts workout information
6. **Display**: Workout data is shown in real-time

## Next Steps

Once voice testing works:
1. ✅ Test with different workout phrases
2. ✅ Verify workout data extraction
3. ⏭️ Integrate with React Native app
4. ⏭️ Connect to your workout tracking UI

## Tips

- Speak clearly and naturally
- Wait for the agent to finish speaking before you talk again
- The agent will respond to workout-related conversations
- Workout data is extracted automatically when detected
- Check the backend logs to see all transcripts being processed

