# Isekai Zero PoC - Architecture Document

## Project Overview

**Goal**: Build a minimal, personal-use AI RPG chat + character management + image generation app inspired by isekaizero.ai.

**Target Users**: Solo (you only, at least initially)

**Scope**: Ultra-minimal viable product with focus on core loop (chat → character → image gen) without visual polish, mobile optimization, or social features.

**Timeline**: 5–7 calendar days with Copilot assistance.

---

## Core Features (MVP)

### 1. Chat Interface
- **What**: Real-time chat with character context injection
- **How**: Input field → send to nanogpt.com API → stream response to page
- **Tech**: vanilla JS or minimal React, localStorage for history
- **Why**: Core feedback loop; character interacts with you
- **Constraints**: Desktop-only, no animations, plain text bubbles

### 2. Character Management
- **What**: Create, save, load character profiles
- **How**: JSON textarea → save to localStorage → load on page refresh
- **Schema**: `{ name, description, personality, appearance_url }`
- **Why**: Characters persist across sessions; avoids re-describing every chat
- **Constraints**: Manual JSON editing (no fancy form builder)

### 3. Image Generation
- **What**: Generate character/scene images via nanogpt.com
- **How**: Prompt input + model selection → API call → display URL in new tab
- **Models**: wan-2.7-image, grok-imagine-image (or whichever nanogpt supports)
- **Why**: Visual reference for characters; iterate on appearance
- **Constraints**: No queue UI, no progress bar; just "fire and wait"

### 4. Conversation History
- **What**: In-memory chat history per session
- **How**: Keep array of `{ role: 'user' | 'ai', content: string }`
- **Persistence**: Cleared on page refresh (or optional: save to localStorage)
- **Why**: Context for follow-up messages; see past exchanges
- **Constraints**: No multi-session history yet (can add later)

### 5. Model Selection
- **What**: Dropdown to pick which LLM to use
- **Options**: Qwen 3.5 9B, DeepSeek V3.2, ERNIE 5.1, etc. (whatever nanogpt offers)
- **Why**: Experiment with different model behaviors/speeds
- **Constraints**: Model set at app load; doesn't switch mid-conversation

---

## Tech Stack

### Frontend
- **Framework**: Vanilla JavaScript (or minimal React if you prefer)
- **Styling**: Inline styles or minimal CSS (no Tailwind, no animations)
- **Storage**: localStorage (no database)
- **Deployment**: Vercel or GitHub Pages

### Backend
- **None** (direct API calls from frontend; CORS-enabled)

### APIs
- **Chat**: nanogpt.com `/chat` endpoint
- **Image Gen**: nanogpt.com `/imagine` endpoint
- **Auth**: Bearer token (stored in frontend, OK for personal use)

---

## File Structure

```
isekai-zero-poc/
├── index.html              # Single-page entry point
├── app.js                  # Main app logic (chat, character, image gen)
├── styles.css              # Minimal styling
├── ARCHITECTURE.md         # This file
├── README.md               # Quick start guide
└── .gitignore              # Ignore node_modules, .env, etc.
```

---

## Key Design Decisions

### 1. Why Vanilla JS (not React)?
- **Decision**: Start with vanilla JS; add React later if needed
- **Rationale**: Faster to scaffold, fewer dependencies, easier to understand for personal use
- **Trade-off**: Larger HTML file, manual DOM manipulation
- **Revert**: If state management gets complex (>10 pieces of state), switch to React

### 2. Why localStorage (not a database)?
- **Decision**: Store everything in browser localStorage
- **Rationale**: Zero backend infrastructure; works offline
- **Trade-off**: Limited to ~5MB per origin; no multi-device sync
- **Revert**: If you want multi-device access, switch to Supabase/Firebase

### 3. Why no visual novel mode (yet)?
- **Decision**: Skip VN rendering in MVP
- **Rationale**: Core loop is chat + character + image; VN is polish
- **Trade-off**: No scene composition or sprite layering
- **Revert**: Add after using MVP for 1–2 weeks; only if needed

### 4. Why direct API calls (no backend)?
- **Decision**: Call nanogpt.com directly from frontend
- **Rationale**: Faster to build; no server infrastructure
- **Trade-off**: API key exposed in frontend (security risk for production, OK for personal use)
- **Revert**: Add Node.js proxy if/when you deploy publicly

### 5. Why plain text UI?
- **Decision**: No animations, no dark mode, no responsive design
- **Rationale**: Fast to build; focus on features, not aesthetics
- **Trade-off**: Looks rough, desktop-only
- **Revert**: Add styling/polish after MVP validation

---

## API Integration

### nanogpt.com Chat Endpoint

**Endpoint**: `https://api.nanogpt.com/chat` (example; verify actual URL)

**Request**:
```json
{
  "model": "qwen-3.5-9b",
  "messages": [
    {
      "role": "system",
      "content": "You are {character.name}. {character.description}"
    },
    {
      "role": "user",
      "content": "Hello!"
    }
  ],
  "stream": true
}
```

**Response**: Server-Sent Events (SSE) stream of tokens

**Auth**: `Authorization: Bearer YOUR_NANOGPT_KEY`

### nanogpt.com Image Generation Endpoint

**Endpoint**: `https://api.nanogpt.com/imagine` (example; verify actual URL)

**Request**:
```json
{
  "model": "wan-2.7-image",
  "prompt": "A fantasy character with blue hair, standing in a forest",
  "size": "1024x1024"
}
```

**Response**:
```json
{
  "image_url": "https://...",
  "status": "success"
}
```

**Auth**: Same as chat

---

## State Management

### In-Memory State (JavaScript Variables)

```javascript
let character = {
  name: "Example",
  description: "A mysterious wanderer",
  personality: "Curious and cautious",
  appearance_url: null
};

let conversation = [
  // { role: 'user' | 'ai', content: string }
];

let currentModel = 'qwen-3.5-9b';
```

### localStorage Keys

- `character` → JSON stringified character object
- `conversation_history` → JSON stringified conversation array
- `last_model` → string (restore user's model preference)

---

## Core Functions (Pseudo-Code)

### `sendMessage(userInput)`
1. Append user message to UI
2. Append to conversation array
3. Build system prompt: `You are {character.name}. {character.description}`
4. Call nanogpt.com `/chat` with conversation + system prompt
5. Stream response token-by-token to UI
6. Append AI response to conversation array

### `saveCharacter()`
1. Read textarea (JSON)
2. Parse JSON; validate
3. Save to localStorage
4. Alert user "Saved"

### `loadCharacter()`
1. Fetch from localStorage
2. Populate textarea
3. Update in-memory `character` object

### `generateImage(prompt, model)`
1. Call nanogpt.com `/imagine` with prompt + model
2. Wait for response (no progress bar; just "generating...")
3. Open image URL in new tab

### `selectModel(modelName)`
1. Update `currentModel` variable
2. Save to localStorage
3. Update dropdown UI

---

## Future Enhancements (Not MVP)

- [ ] **Character appearance generation**: Auto-generate image based on description
- [ ] **Multiple characters**: Save/switch between characters
- [ ] **World/Lore system**: Inject additional context (location, time period, etc.)
- [ ] **Visual novel mode**: Canvas renderer for character poses + backgrounds
- [ ] **Conversation export**: Save chat as text file
- [ ] **Prompt templates**: Pre-built system prompts (detective, therapist, villain, etc.)
- [ ] **Adaptive generation**: Auto-gen new character appearance when story changes
- [ ] **Context summarization**: Compress old messages to fit longer conversations
- [ ] **Mobile UI**: Responsive design for tablets/phones
- [ ] **Dark mode**: Toggle theme
- [ ] **Backend proxy**: Hide API key; add rate limiting
- [ ] **Database**: Multi-device sync via Supabase/Firebase
- [ ] **Real-time audio**: Character voice generation

---

## Development Workflow

1. **Scaffolding**: Generate index.html + app.js skeleton
2. **Chat integration**: Test streaming from nanogpt.com
3. **Character CRUD**: Test save/load to localStorage
4. **Image generation**: Test image API
5. **Integration**: Wire everything together
6. **Iteration**: Use for 1–2 weeks; collect feedback
7. **Polish or pivot**: Decide what to add/change based on experience

---

## Testing Strategy

**No automated tests for MVP.** Manual testing workflow:

1. Open app locally (`http://localhost:3000` or just open `index.html`)
2. Create a character; save it
3. Refresh page; verify character loads
4. Send a chat message; verify response streams
5. Generate an image; verify URL opens
6. Switch model; verify next chat uses new model

**Bugs found**: Log as GitHub issues; Copilot fixes in next session

---

## Known Limitations

- **API key exposed** in frontend (OK for personal use; not production-ready)
- **No error handling** (errors print to console; not user-friendly)
- **Desktop-only UI** (doesn't work well on mobile)
- **No multi-session history** (chat clears on page refresh unless we add localStorage persistence)
- **No character appearance auto-gen** (manual image URL only)
- **No visual novel rendering** (just images in tabs)
- **No content moderation** (nanogpt.com handles it)

---

## Deployment

**Target**: Vercel (free tier, instant deployment)

**Steps**:
1. Push code to GitHub repo
2. Connect repo to Vercel
3. Set environment variable: `VITE_NANOGPT_KEY` (or hardcode for personal use)
4. Deploy
5. App live at `your-project.vercel.app`

---

## Questions / Decisions Pending

- [ ] React or vanilla JS? (decided: vanilla for MVP)
- [ ] Single or multiple characters? (decided: single for MVP; add multi later)
- [ ] Persist conversation history across page refresh? (TBD based on usage)
- [ ] Add visual novel mode in MVP or later? (decided: later)
- [ ] Which nanogpt.com models to support? (TBD; start with 3–5 most popular)

---

## Related Resources

- **Isekai Zero docs**: https://docs.isekaizero.ai/books/your-guide-to-isekai-zero/page/chat-basics-how-to-chat-as-a-beginner
- **Isekai Zero screenshots**: [Stored in session context as images 1–16]
- **nanogpt.com API docs**: [TBD; retrieve when building]
- **SillyTavern for reference**: https://github.com/SillyTavern/SillyTavern (character card format, prompt engineering patterns)

---

## Contact / Session Notes

**Built by**: You + Copilot  
**Started**: 2026-07-27  
**Last updated**: 2026-07-27

**Copilot context limit**: 200k tokens. If context gets stale (Week 4+), re-read this doc to catch me up.
