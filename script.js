let apiKey = localStorage.getItem("nebula_api_key");
let chats = JSON.parse(localStorage.getItem("nebula_chats")) || [];
let currentChatMessages = [];
let currentImages = []; 
let currentChatIndex = null;
let selectedModel = "stepfun/step-3.5-flash:free";

function toggleApiVisibility() {
  const input = document.getElementById("apiKeyInput");
  const eye = document.getElementById("eyeIcon");

  if (input.type === "password") {
    input.type = "text";
    eye.innerText = "🔒";
  } else {
    input.type = "password";
    eye.innerText = "👁️";
  }
}

function saveApiKey() {
  const key = document.getElementById("apiKeyInput").value.trim();
  if (key) {
    localStorage.setItem("nebula_api_key", key);
    document.getElementById("apiModal").classList.add("hidden");
    console.log("API Key saved successfully!");
  } else {
    alert("Please enter a valid API Key");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const savedKey = localStorage.getItem("nebula_api_key");
  if (!savedKey) {
    document.getElementById("apiModal").classList.remove("hidden");
  }
});

// Initialize
window.onload = () => {
  if (!apiKey) openKeyModal();
  initEmojiPicker();
  newChat(); // Start with a fresh UI
  renderHistory();
};

// --- New Chat Function ---
function newChat() {
  currentChatMessages = [];
  currentChatIndex = null;
  currentImages = []; 
  renderPreviews(); 
  const chatBox = document.getElementById("chatBox");
  const template = document.getElementById("welcomeTemplate");
  chatBox.innerHTML = "";
  chatBox.appendChild(template.content.cloneNode(true));
  renderHistory();
}

// --- UI Toggle Functions ---
function toggleTheme() {
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

document.addEventListener('DOMContentLoaded', () => {
    if (!apiKey) {
        openKeyModal();
    }
    
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
        document.documentElement.classList.remove("dark");
    } else {
        document.documentElement.classList.add("dark");
    }
});

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("-ml-80");
}

function toggleModelList() {
  const options = document.getElementById("modelOptions");
  options.classList.toggle("hidden");

  if (!options.classList.contains("hidden")) {
    setTimeout(() => {
      options.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  }
}

function selectModel(id, name) {
  selectedModel = id;
  document.getElementById("activeModelName").innerText = name;
  toggleModelList();
}

// --- Improved Emoji Picker ---
function initEmojiPicker() {
  const emojis = [
    "😊",
    "😂",
    "🔥",
    "💡",
    "❤️",
    "👍",
    "✨",
    "🚀",
    "💀",
    "👻",
    "👽",
    "🤖",
    "🎉",
    "🌟",
    "🍕",
    "🍔",
    "🎸",
    "📱",
    "💻",
    "⌚",
    "🔍",
    "🔑",
    "🚗",
    "✈️",
    "🏠",
    "🌍",
    "🌈",
    "☀️",
    "🌙",
    "🍎",
  ];
  const picker = document.getElementById("emojiPicker");
  picker.innerHTML = ""; // Clear picker
  emojis.forEach((emoji) => {
    const span = document.createElement("span");
    span.className =
      "p-2 cursor-pointer hover:bg-white/10 rounded-lg text-center transition hover:scale-125";
    span.innerText = emoji;
    span.onclick = () => {
      document.getElementById("messageInput").value += emoji;
      toggleEmoji();
    };
    picker.appendChild(span);
  });
}

function toggleEmoji() {
  document.getElementById("emojiPicker").classList.toggle("hidden");
}

// --- Chat History Logic ---
function renderHistory() {
  const container = document.getElementById("chatHistory");
  container.innerHTML = "";
  chats.forEach((chat, i) => {
    const div = document.createElement("div");
    div.className = `group flex items-center justify-between p-3 rounded-xl cursor-pointer transition text-sm ${currentChatIndex === i ? "bg-primary/20 text-primary" : "hover:bg-white/5 text-gray-400"}`;
    div.innerHTML = `
            <span onclick="loadChat(${i})" class="truncate flex-1">${chat.title}</span>
            <button onclick="deleteChat(${i}, event)" class="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500">✕</button>
        `;
    container.appendChild(div);
  });
}

function loadChat(index) {
  currentChatIndex = index;
  currentChatMessages = chats[index].messages;
  const chatBox = document.getElementById("chatBox");
  chatBox.innerHTML = "";
  currentChatMessages.forEach((msg) => {
    // Multi-image data compatibility
    const msgImages = msg.images || (msg.image ? [msg.image] : []);
    addMessageUI(msg.role, msg.content, msgImages);
  });
  renderHistory();
}

function deleteChat(index, event) {
  event.stopPropagation();
  if (confirm("Delete this chat?")) {
    chats.splice(index, 1);
    localStorage.setItem("nebula_chats", JSON.stringify(chats));
    if (currentChatIndex === index) newChat();
    else renderHistory();
  }
}

// --- Multiple Image Handling ---
document.getElementById("imageInput").addEventListener("change", function (e) {
  const files = Array.from(e.target.files);
  if (!files.length) return;

  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = () => {
      currentImages.push(reader.result);
      renderPreviews();
    };
    reader.readAsDataURL(file);
  });
});

function renderPreviews() {
  const previewDiv = document.getElementById("imagePreview");
  if (currentImages.length === 0) {
    previewDiv.innerHTML = "";
    previewDiv.classList.add("hidden");
    return;
  }

  previewDiv.classList.remove("hidden");
  previewDiv.innerHTML = currentImages
    .map(
      (img, index) => `
        <div class="preview-container" style="position: relative; display: inline-block; margin-right: 10px;">
            <img src="${img}" class="w-16 h-16 rounded-xl border border-primary object-cover shadow-lg"/>
            <div class="remove-btn" onclick="removeSpecificImage(${index})" style="position: absolute; top: -5px; right: -5px; background: #ef4444; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 10px; cursor: pointer; border: 2px solid #0f111a;">✕</div>
        </div>
    `,
    )
    .join("");
}

function removeSpecificImage(index) {
  currentImages.splice(index, 1);
  renderPreviews();
  if (currentImages.length === 0) {
    document.getElementById("imageInput").value = "";
  }
}

function removeImage() {
  currentImages = [];
  renderPreviews();
  document.getElementById("imageInput").value = "";
}

// --- Send Message ---
async function sendMessage() {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();
  if (!text && currentImages.length === 0) return;

  if (!apiKey) return openKeyModal();

  // UI Updates
  addMessageUI("user", text, currentImages);
  currentChatMessages.push({
    role: "user",
    content: text,
    images: [...currentImages],
  });

  if (currentChatIndex === null) {
    const title = text.substring(0, 20) || "Image Chat";
    chats.unshift({ title, messages: currentChatMessages });
    currentChatIndex = 0;
  }

  // Input reset
  input.value = "";
  const imagesToSubmit = [...currentImages];
  removeImage();
  showThinking();

  try {
    // Multi-modal content structure
    let contentPayload = [{ type: "text", text: text }];
    imagesToSubmit.forEach((url) => {
      contentPayload.push({ type: "image_url", image_url: { url: url } });
    });

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [{ role: "user", content: contentPayload }],
      }),
    });

    const data = await res.json();
    removeThinking();

    if (data.choices && data.choices[0]) {
      const reply = data.choices[0].message.content;
      addMessageUI("assistant", reply);
      currentChatMessages.push({ role: "assistant", content: reply });
      chats[currentChatIndex].messages = currentChatMessages;
      localStorage.setItem("nebula_chats", JSON.stringify(chats));
      renderHistory();
    } else {
      throw new Error("Invalid Response");
    }
  } catch (err) {
    removeThinking();
    addMessageUI("assistant", "Error: Connection failed or invalid API Key.");
  }
}

// --- Helpers ---
function addMessageUI(role, content, images = []) {
  const chatBox = document.getElementById("chatBox");
  if (document.getElementById("welcomeScreen"))
    document.getElementById("welcomeScreen").remove();

  const wrapper = document.createElement("div");
  wrapper.className = `flex ${role === "user" ? "justify-end" : "justify-start"}`;

  // Multiple image display in chat
  let imgHTML = "";
  if (images && images.length > 0) {
    imgHTML = `<div class="flex gap-2 flex-wrap mb-2">
            ${images.map((img) => `<img src="${img}" class="w-48 rounded-xl border border-white/10 shadow-md"/>`).join("")}
        </div>`;
  }

  wrapper.innerHTML = `
        <div class="p-4 rounded-3xl max-w-[85%] border border-white/5 ${role === "user" ? "bg-primary text-black rounded-tr-none" : "glass-effect text-inherit rounded-tl-none"}">
            ${imgHTML}
            <div class="text-sm whitespace-pre-wrap">${content}</div>
        </div>
    `;
  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showThinking() {
  const div = document.createElement("div");
  div.id = "thinking";
  div.className = "text-xs text-primary animate-pulse ml-4 p-2";
  div.innerText = "Nebula is thinking...";
  document.getElementById("chatBox").appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function removeThinking() {
  const t = document.getElementById("thinking");
  if (t) t.remove();
}

function quickPrompt(t) {
  document.getElementById("messageInput").value = t;
  sendMessage();
}

function openKeyModal() {
  const modal = document.getElementById("apiModal");
  const input = document.getElementById("apiKeyInput");

  if (apiKey) {
    input.value = apiKey;
  }

  modal.classList.remove("hidden");
}
function closeApiModal() {
  document.getElementById("apiModal").classList.add("hidden");
}

function saveApiKey() {
    const input = document.getElementById('apiKeyInput');
    const key = input.value.trim();

    if (key) {
        localStorage.setItem('nebula_api_key', key);
        apiKey = key; 
 
        alert("✅ API Key saved successfully!");
        
        closeApiModal();
    } else {
        alert("⚠️ Please enter a valid API Key");
    }
}
