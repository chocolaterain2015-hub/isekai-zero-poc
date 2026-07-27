// ============================================================================
// ISEKAI ZERO PoC - Core Application Logic
// ============================================================================

// STATE
let character = {
  name: "Aurora",
  description: "A mysterious elf mage with silver hair",
  personality: "Curious, kind, loves books",
  appearance_url: ""
};

let conversation = [];
let currentModel = "qwen-3.5-9b";
let apiKey = localStorage.getItem("nanogpt_api_key") || "";
let isGenerating = false;

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  loadCharacter();
  loadAPIKey();
  restoreModel();
  updateStatus("charStatus", "✓ Ready");
});

// ============================================================================
// CHARACTER MANAGEMENT
// ============================================================================

function saveCharacter() {
  try {
    const jsonText = document.getElementById("characterJSON").value;
    const parsed = JSON.parse(jsonText);
    
    if (!parsed.name || !parsed.description) {
      throw new Error("Character must have 'name' and 'description'");
    }
    
    character = parsed;
    localStorage.setItem("character", JSON.stringify(character));
    updateStatus("charStatus", "✓ Character saved!");
  } catch (err) {
    updateStatus("charStatus", `✗ Error: ${err.message}`, "error");
  }
}

function loadCharacter() {
  try {
    const stored = localStorage.getItem("character");
    if (stored) {
      character = JSON.parse(stored);
      document.getElementById("characterJSON").value = JSON.stringify(character, null, 2);
      updateStatus("charStatus", "✓ Character loaded!");
    }
  } catch (err) {
    updateStatus("charStatus", `✗ Error loading character: ${err.message}`, "error");
  }
}

function clearCharacter() {
  if (confirm("Clear current character?")) {
    character = {
      name: "",
      description: "",
      personality: "",
      appearance_url: ""
    };
    document.getElementById("characterJSON").value = JSON.stringify(character, null, 2);
    localStorage.removeItem("character");
    updateStatus("charStatus", "✓ Cleared");
  }
}

// ============================================================================
// CHAT FUNCTIONS
// ============================================================================

async function sendMessage() {
  const input = document.getElementById("chatInput");
  const userMessage = input.value.trim();

  if (!userMessage) return;
  if (!apiKey) {
    updateStatus("chatStatus", "✗ API key not set!", "error");
    return;
  }
  if (isGenerating) {
    updateStatus("chatStatus", "⏳ Already generating...", "error");
    return;
  }

  // Add user message to UI and conversation
  addMessageToChat("user", userMessage);
  conversation.push({ role: "user", content: userMessage });
  input.value = "";
  isGenerating = true;
  updateStatus("chatStatus", "⏳ Generating response...");

  try {
    // Build system prompt
    const systemPrompt = `You are ${character.name}. ${character.description}${
      character.personality ? ` Your personality: ${character.personality}` : ""
    }`;

    // Prepare messages for API
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversation
    ];

    // Call nanogpt.com API with streaming
    const response = await fetch("https://api.nanogpt.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: currentModel,
        messages: messages,
        stream: true,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    // Stream response
    let aiMessage = "";
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let aiMessageId = addMessageToChat("ai", "");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const json = JSON.parse(data);
            if (json.choices?.[0]?.delta?.content) {
              const token = json.choices[0].delta.content;
              aiMessage += token;
              updateMessageInChat(aiMessageId, aiMessage);
            }
          } catch (e) {
            // Ignore parse errors in streaming
          }
        }
      }
    }

    // Save complete AI message to conversation
    conversation.push({ role: "assistant", content: aiMessage });
    updateStatus("chatStatus", "✓ Response complete");
    isGenerating = false;
  } catch (err) {
    updateStatus("chatStatus", `✗ Error: ${err.message}`, "error");
    addMessageToChat("ai", `[Error: ${err.message}]`);
    isGenerating = false;
  }
}

function addMessageToChat(role, content) {
  const chatDiv = document.getElementById("chat");
  const messageDiv = document.createElement("div");
  const messageId = `msg-${Date.now()}`;
  messageDiv.id = messageId;
  messageDiv.className = `message ${role}`;
  
  const label = document.createElement("div");
  label.className = "message-label";
  label.textContent = role === "user" ? "You:" : `${character.name}:`;
  
  const text = document.createElement("div");
  text.textContent = content;
  
  messageDiv.appendChild(label);
  messageDiv.appendChild(text);
  chatDiv.appendChild(messageDiv);
  chatDiv.scrollTop = chatDiv.scrollHeight;
  
  return messageId;
}

function updateMessageInChat(messageId, content) {
  const messageDiv = document.getElementById(messageId);
  if (messageDiv) {
    const textDiv = messageDiv.querySelector("div:last-child");
    if (textDiv) {
      textDiv.textContent = content;
      messageDiv.parentElement.scrollTop = messageDiv.parentElement.scrollHeight;
    }
  }
}

function clearChat() {
  if (confirm("Clear all messages?")) {
    document.getElementById("chat").innerHTML = "";
    conversation = [];
    updateStatus("chatStatus", "✓ Chat cleared");
  }
}

function selectModel() {
  const selected = document.getElementById("modelSelect").value;
  currentModel = selected;
  localStorage.setItem("currentModel", currentModel);
  updateStatus("chatStatus", `✓ Model switched to ${currentModel}`);
}

function restoreModel() {
  const saved = localStorage.getItem("currentModel");
  if (saved) {
    currentModel = saved;
    document.getElementById("modelSelect").value = currentModel;
  }
}

// ============================================================================
// IMAGE GENERATION
// ============================================================================

async function generateImage() {
  const prompt = document.getElementById("imagePrompt").value.trim();
  const model = document.getElementById("imageModel").value;

  if (!prompt) {
    updateStatus("imageStatus", "✗ Enter a prompt first", "error");
    return;
  }

  if (!apiKey) {
    updateStatus("imageStatus", "✗ API key not set!", "error");
    return;
  }

  if (isGenerating) {
    updateStatus("imageStatus", "⏳ Already generating...", "error");
    return;
  }

  isGenerating = true;
  updateStatus("imageStatus", "⏳ Generating image...");

  try {
    const response = await fetch("https://api.nanogpt.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        size: "1024x1024",
        quality: "standard",
        n: 1
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error("No image URL in response");
    }

    updateStatus("imageStatus", "✓ Image generated! Opening in new tab...");
    window.open(imageUrl, "_blank");
    isGenerating = false;
  } catch (err) {
    updateStatus("imageStatus", `✗ Error: ${err.message}`, "error");
    isGenerating = false;
  }
}

// ============================================================================
// API KEY MANAGEMENT
// ============================================================================

function saveAPIKey() {
  const input = document.getElementById("apiKey").value.trim();
  if (!input) {
    updateStatus("apiStatus", "✗ Enter an API key", "error");
    return;
  }
  apiKey = input;
  localStorage.setItem("nanogpt_api_key", apiKey);
  document.getElementById("apiKey").value = ""; // Clear the input for security
  updateStatus("apiStatus", "✓ API key saved securely");
}

function loadAPIKey() {
  const saved = localStorage.getItem("nanogpt_api_key");
  if (saved) {
    apiKey = saved;
    updateStatus("apiStatus", "✓ API key loaded from storage");
  }
}

async function testAPIKey() {
  if (!apiKey) {
    updateStatus("apiStatus", "✗ No API key set", "error");
    return;
  }

  updateStatus("apiStatus", "⏳ Testing connection...");

  try {
    const response = await fetch("https://api.nanogpt.com/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    if (response.ok) {
      updateStatus("apiStatus", "✓ API key is valid!", "success");
    } else if (response.status === 401) {
      updateStatus("apiStatus", "✗ Invalid API key (401)", "error");
    } else {
      updateStatus("apiStatus", `✗ API error: ${response.status}`, "error");
    }
  } catch (err) {
    updateStatus("apiStatus", `✗ Connection error: ${err.message}`, "error");
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function updateStatus(elementId, message, type = "info") {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    el.className = `status ${type === "error" ? "error" : type === "success" ? "success" : ""}`;
  }
}

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

document.addEventListener("keydown", (e) => {
  // Alt+S: Save character
  if (e.altKey && e.key === "s") {
    e.preventDefault();
    saveCharacter();
  }

  // Alt+C: Clear chat
  if (e.altKey && e.key === "c") {
    e.preventDefault();
    clearChat();
  }

  // Alt+G: Generate image
  if (e.altKey && e.key === "g") {
    e.preventDefault();
    generateImage();
  }
});
