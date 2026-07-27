# Isekai Zero PoC

A minimal personal-use AI RPG chat app inspired by isekaizero.ai. Chat with AI characters, manage their profiles, and generate images.

## Quick Start

### 1. Clone the repo
```bash
git clone https://github.com/chocolaterain2015-hub/isekai-zero-poc
cd isekai-zero-poc
```

### 2. Get a nanogpt.com API key
- Visit [nanogpt.com](https://nanogpt.com)
- Sign up / log in
- Create an API key (usually in account settings)
- Copy your key (starts with `sk-...`)

### 3. Run locally
```bash
# Option A: Use Python's built-in server
python -m http.server 8000

# Option B: Use Node.js http-server
npx http-server

# Option C: Just open the file
# Right-click index.html → Open with Browser
```

Then open `http://localhost:8000` (or whatever port shows)

### 4. Configure
- Paste your nanogpt.com API key in the "Configuration" section
- Click "Test Connection" to verify it works

### 5. Start using
- **Create a character**: Edit the JSON in the Character panel, click Save
- **Chat**: Type in the chat input, press Enter or click Send
- **Generate images**: Write a prompt, pick a model, click Generate Image
- **Switch models**: Select a different LLM from the dropdown

## Features

✅ **Chat with AI characters** — Real-time streaming responses  
✅ **Character management** — Save/load character profiles as JSON  
✅ **Image generation** — Create character art on demand  
✅ **Multiple LLM models** — Qwen, DeepSeek, ERNIE, MiniMax  
✅ **Persistent storage** — Character and API key saved in browser  
✅ **Minimal UI** — Focus on functionality, not aesthetics  

## Keyboard Shortcuts

- **Alt+S** — Save character
- **Alt+C** — Clear chat
- **Alt+G** — Generate image
- **Enter** — Send chat message

## Known Limitations

- Desktop-only (not mobile-friendly)
- API key stored in browser (OK for personal use; not production-safe)
- No visual novel rendering (yet)
- No character appearance auto-generation (yet)
- Chat history clears on page refresh (intentional, to keep it simple)

## API Configuration

This app calls nanogpt.com directly from your browser:

- **Chat**: `POST https://api.nanogpt.com/v1/messages`
- **Images**: `POST https://api.nanogpt.com/v1/images/generations`

Your API key is stored in browser localStorage. For production use, add a backend proxy to hide your key.

## What's Next?

After using this PoC for a week, consider adding:
- Visual Novel mode (canvas-based scene rendering)
- Character appearance auto-generation
- Multiple character management
- Conversation export to text file
- Backend proxy for better security
- Mobile-responsive UI
- Dark/light theme toggle

## Structure

```
isekai-zero-poc/
├── index.html       # UI and layout
├── app.js           # Core logic (chat, character, images)
├── ARCHITECTURE.md  # Design decisions and API docs
└── README.md        # This file
```

## Troubleshooting

**"API error: 401"**
- Your API key is invalid or expired
- Generate a new one on nanogpt.com

**"No response from AI"**
- Check your internet connection
- Verify nanogpt.com API is online
- Try a different model from the dropdown

**"Image generation failed"**
- Some image models may not be available on your nanogpt plan
- Try a different model
- Check nanogpt.com for current available models

**"Character won't save"**
- Make sure the JSON is valid (no syntax errors)
- Try pasting this valid example:
  ```json
  {
    "name": "Test",
    "description": "A test character",
    "personality": "Friendly",
    "appearance_url": ""
  }
  ```

## Support

For issues or feature requests, open a GitHub issue or check the ARCHITECTURE.md for design context.

---

**Built with**: Vanilla JavaScript, nanogpt.com API, localStorage  
**Status**: Ultra-minimal PoC (Week 1)  
**License**: MIT
