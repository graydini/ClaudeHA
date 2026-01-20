# Home Assistant Gaget (Hag)

Hag is a browser-facing media portal that receives browser audio/video and routes it to Home Assistant as a media target, while providing an assistant interaction surface.

- **Media Receiver**: Receive browser audio/video and forward to Home Assistant
- **Assistant Interface**: Send/receive assistant messages (text + TTS)
- **Wake Word & Voice Input**: Optional wake-word detection and click-to-speak
- **PWA Support**: Install as a desktop or mobile app

## Quick Start (Standalone Mode)

1. **Configure credentials:**
   - Copy `credentials.ini.example` to `credentals.ini`
   - Edit `credentals.ini` with your Home Assistant URL and access token

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Open the widget:**
   - Navigate to `http://localhost:8099` in your browser
   - The widget will automatically connect using the credentials from `credentals.ini`

4. **Use the widget:**
   - Click the microphone button to speak
   - Type in the text box to send messages
   - Enable "Wake Word Detection" for hands-free activation

## Installing as Home Assistant Add-on

You can install this project as a Home Assistant add-on (development or from a Git repository). The add-on slug is `home_assistant_gaget` and the display name is **Home Assistant Gaget (Hag)**. The add-on uses Ingress (configured on port 8099) so the UI is available from the Supervisor Add-on page or the sidebar after installation.

Two common installation methods:

1. Local development install (recommended for testing):
   - Copy the repository to your Home Assistant host under `/addons/local/home_assistant_gaget` (use the folder name exactly `home_assistant_gaget`).
   - In Home Assistant, go to **Supervisor → Add-on store → three-dots menu → Reload**. The add-on will appear in the local add-ons list.
   - Install the add-on, set options if needed (device_name, wake_word, stt_timeout, auto_start_listening), and click **Start**. Use **Open Web UI** to open the widget (or use ingress from the sidebar).

2. Install from a GitHub repository (recommended for sharing):
   - In Home Assistant, go to **Supervisor → Add-on store → Repositories** and **Add** your repository URL, for example `https://github.com/graydini/home-assistant-gaget`.
   - Find **Home Assistant Gaget** in the Add-on store, install it, configure options, and start it. Use **Open Web UI** to access the widget (ingress will route to the app).

Notes:
- Because `ingress: true` is enabled in `config.yaml`, the add-on receives the required authentication context from Home Assistant; you should not need to provide `credentals.ini` when using the add-on.
- Adjust options in the Add-on configuration UI or via the Supervisor API: `device_name`, `wake_word`, `stt_timeout`, and `auto_start_listening`.
- For production deployments, run the add-on under HTTPS and ensure Home Assistant is up-to-date to get the latest security fixes.

## Configuration

### Credentials File (Standalone Mode)

For local development, create a `credentals.ini` file in the project root:

```ini
HomeAssistantURL=https://your-ha-instance.com:8123
AccessToken=your-long-lived-access-token
```

### Widget Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Device Name | Identifier for this widget in Home Assistant | "Hag" |
| Wake Word | Wake word model to use | "hey_gadget" |
| STT Timeout | Seconds to wait after last speech | 15 |

### Home Assistant Configuration

The widget uses these Home Assistant APIs:
- `/api/conversation/process` - For processing voice/text commands
- `/api/websocket` - For real-time events and assist pipeline

### Getting a Long-Lived Access Token

1. Go to your Home Assistant instance
2. Click your profile (bottom left)
3. Scroll to "Long-Lived Access Tokens"
4. Click "Create Token"
5. Give it a name (e.g., "Hag")
6. Copy the token (it will only be shown once!)

## Features

### Voice Interaction
- Click the microphone to start listening
- Audio visualizer shows when listening
- Automatic timeout after silence
- TTS playback of responses

### Wake Word Detection
- Uses OpenWakeWord (WASM) for browser-based wake word detection
- Supported wake words: Hey Gadget, Hey Jarvis, Alexa, Hey Mycroft, Hey Rhasspy, Timer, Weather (default: Hey Gadget)
- Enable via the toggle switch

### Media Player
- Receives media from Home Assistant automations
- Auto-plays video and audio content
- Example automation:
  ```yaml
  service: media_player.play_media
  target:
    entity_id: media_player.voice_widget
  data:
    media_content_id: "https://example.com/video.mp4"
    media_content_type: "video/mp4"
  ```

### PWA Support
- Install as a standalone app on desktop/mobile
- Offline capable (cached assets)
- App-like experience

## Project Structure

```
home-assistant-gaget/
├── config.yaml          # Home Assistant add-on configuration
├── Dockerfile           # Container build file
├── package.json         # Node.js dependencies
├── server.js            # Backend server
├── test.sh              # Test script
├── credentials.ini      # Your HA credentials (gitignore this!)
└── www/
    ├── index.html       # Main web interface
    ├── app.js           # Frontend application
    ├── sw.js            # Service worker for PWA
    ├── manifest.json    # PWA manifest
    └── icons/           # App icons
```

## Testing

Run the test script to verify connectivity:

```bash
./test.sh
```

Expected output:
```
=== Voice Assistant Widget Test Suite ===

1. Testing Home Assistant API Connection...
   ✓ API connection successful
2. Testing Conversation API...
   ✓ Conversation API working
3. Testing WebSocket authentication...
   ✓ API states accessible (WebSocket will work)
4. Testing local widget server...
   ✓ Local server running on port 8099
5. Testing local API config...
   ✓ Config API working

=== Test Complete ===
```

## Browser Requirements

- Modern browser with:
  - Web Audio API
  - MediaRecorder API
  - WebSocket support
  - Microphone access (requires HTTPS in production)

## Security Notes

- Never commit your access token to version control
- Use HTTPS in production for microphone access
- The token is stored in browser localStorage
- Consider using OAuth2 for production deployments

## Troubleshooting

### "Microphone access denied"
- Ensure you're using HTTPS (or localhost)
- Check browser permissions
- Grant microphone access when prompted

### "WebSocket connection failed"
- Check Home Assistant URL is accessible
- Verify the access token is valid
- Ensure WebSocket API is enabled in HA

### "No response from assistant"
- Verify your Home Assistant has a voice assistant configured
- Check the conversation integration is set up
- Look at Home Assistant logs for errors

### "git clone" / RPC failed / early EOF when installing add-on
- Symptom: The Supervisor can fail while cloning with errors such as "RPC failed", "early EOF", or "unexpected disconnect while reading sideband packet". These failures can be caused by network/proxy issues or by repository problems such as accidental Git submodules or nested `.git` folders.

Repository-side fix (what we did and expect contributors to follow):
- We added a repository validation script and CI check to prevent submodule problems and to detect nested `.git` folders or gitlink entries that cause Supervisor to attempt recursive clones. The script is at `scripts/validate-repo.sh` and an Action runs it on push/PR: `.github/workflows/validate-repo.yml`.

How to validate locally and fix a bad commit:
1. Run the local validation script before pushing:
```bash
./scripts/validate-repo.sh
```
2. If the script finds a submodule or nested `.git`, remove the submodule and vendor the code instead (example for a path `ext/openwakeword`):
```bash
git submodule deinit -f -- ext/openwakeword
git rm -f ext/openwakeword
rm -rf .git/modules/ext/openwakeword
# Copy or add the needed files directly under www/openwakeword then commit
```
3. Commit the removal and vendor the needed files in `www/openwakeword` (or use an npm dependency that is published on npm rather than a git submodule). Avoid committing `node_modules` or large built artifacts into the repo.

If you still see clone errors after ensuring there are no submodules, please open an issue with the output of `./scripts/validate-repo.sh` and the exact Supervisor clone log and we'll fix it immediately.
# In Home Assistant: Supervisor → Add-on store → three-dots → Reload
```
6. Manual install alternative: clone the repository on a machine that can reach GitHub, then copy the files to the HA host under `/addons/local/home_assistant_gaget` (preserve folder name exactly), and reload Add-ons.

If you want, I can add a small GitHub Action to produce `tar.gz` release artifacts automatically on push, or add explicit release zips so Supervisor can fetch an archive URL instead of performing a `git clone` — say which option you prefer.

## License

MIT License

Copyright (c) 2026 Home Assistant Gaget (Hag)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Attribution

This project uses the following third-party libraries and resources:

- **OpenWakeWord WASM** - Browser-based wake word detection
  - Repository: https://github.com/dnavarrom/openwakeword_wasm
  - License: MIT
  - Copyright (c) 2024 David Navarro

- **Express.js** - Web framework for Node.js
  - License: MIT

- **ws** - WebSocket library for Node.js
  - License: MIT

- **http-proxy-middleware** - HTTP proxy middleware
  - License: MIT
