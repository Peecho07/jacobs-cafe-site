// ═══════════════════════════════════════════════════════
//  Jacob's Cafe Chat Widget — Production v2
//  Drop this ONE script tag before </body> on every page:
//
//  <script src="js/widget.js"></script>
//
//  Set BOT_URL below to your live Replit URL.
// ═══════════════════════════════════════════════════════

(function () {
  // ── UPDATE THIS to your live Replit URL ──
 const BOT_URL = "https://6471d799-76c1-469c-a387-ac5ac29f557a-00-2qg025s8436be.picard.replit.dev";
  

  // ── SUGGESTED PROMPTS shown before user types ──
  const SUGGESTIONS = [
    "What's your most popular dish?",
    "What time do you close today?",
    "Do you have outdoor seating?",
    "How do I order for delivery?",
    "Do you do catering?",
  ];

  let history     = [];
  let isOpen      = false;
  let isTyping    = false;
  let hasInteracted = false;
  let reviewNudgedThisSession = false;

  // ── INJECT STYLES ──
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500&display=swap');

    #jc-wrap * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Jost', -apple-system, sans-serif; }

    #jc-toggle {
      position: fixed; bottom: 28px; right: 28px;
      width: 58px; height: 58px; border-radius: 50%;
      background: #1C1A18; color: #FDFAF7;
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      z-index: 9999;
      box-shadow: 0 4px 20px rgba(28,26,24,.30);
      transition: transform .22s cubic-bezier(.4,0,.2,1), box-shadow .22s;
    }
    #jc-toggle:hover { transform: scale(1.08); box-shadow: 0 6px 26px rgba(28,26,24,.38); }
    #jc-toggle svg { width: 24px; height: 24px; transition: opacity .15s; }

    #jc-unread {
      position: absolute; top: -2px; right: -2px;
      width: 18px; height: 18px; border-radius: 50%;
      background: #D85A30; color: #fff;
      font-size: 11px; font-weight: 500;
      display: flex; align-items: center; justify-content: center;
      display: none;
    }

    #jc-panel {
      position: fixed; bottom: 100px; right: 28px;
      width: 348px;
      background: #FDFAF7;
      border: 0.5px solid rgba(28,26,24,.12);
      display: flex; flex-direction: column;
      z-index: 9998;
      box-shadow: 0 8px 40px rgba(28,26,24,.18);
      transition: opacity .22s cubic-bezier(.4,0,.2,1),
                  transform .22s cubic-bezier(.4,0,.2,1);
      max-height: 520px;
    }
    #jc-panel.hidden {
      opacity: 0; pointer-events: none;
      transform: translateY(14px) scale(.97);
    }

    #jc-header {
      background: #1C1A18;
      padding: 14px 18px;
      display: flex; align-items: center; gap: 10px;
      flex-shrink: 0;
    }
    #jc-avatar {
      width: 34px; height: 34px; border-radius: 50%;
      background: rgba(184,149,90,.2);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    #jc-header-name { font-size: 13px; font-weight: 500; color: #FDFAF7; }
    #jc-header-status {
      font-size: 11px; font-weight: 300;
      color: rgba(253,250,247,.45);
      margin-top: 1px;
      display: flex; align-items: center; gap: 5px;
    }
    .jc-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #4ade80; flex-shrink: 0;
      animation: jc-pulse 2.4s ease-in-out infinite;
    }
    @keyframes jc-pulse {
      0%,100% { opacity: 1; } 50% { opacity: .5; }
    }
    #jc-close {
      margin-left: auto; background: none; border: none;
      color: rgba(253,250,247,.45); cursor: pointer;
      font-size: 18px; line-height: 1; padding: 2px;
      transition: color .15s;
    }
    #jc-close:hover { color: #FDFAF7; }

    #jc-messages {
      flex: 1; overflow-y: auto;
      padding: 14px; display: flex; flex-direction: column;
      gap: 9px; background: #F7F3EE;
      scroll-behavior: smooth;
    }
    #jc-messages::-webkit-scrollbar { width: 4px; }
    #jc-messages::-webkit-scrollbar-track { background: transparent; }
    #jc-messages::-webkit-scrollbar-thumb { background: rgba(28,26,24,.12); border-radius: 2px; }

    .jcm {
      max-width: 87%; padding: 10px 13px;
      font-size: 13px; font-weight: 300; line-height: 1.62;
      word-wrap: break-word;
    }
    .jcm a { color: #B8955A; text-decoration: underline; }
    .jcm-bot {
      background: #FDFAF7; color: #1C1A18;
      align-self: flex-start;
      border-radius: 2px 12px 12px 12px;
    }
    .jcm-user {
      background: #1C1A18; color: #FDFAF7;
      align-self: flex-end;
      border-radius: 12px 2px 12px 12px;
    }
    .jcm-time {
      font-size: 10px; font-weight: 300;
      color: rgba(28,26,24,.35);
      align-self: flex-start; padding: 0 2px;
      margin-top: -4px;
    }
    .jcm-time.right { align-self: flex-end; }

    .jc-typing {
      display: flex; gap: 4px; padding: 12px 14px;
      background: #FDFAF7; align-self: flex-start;
      border-radius: 2px 12px 12px 12px;
      align-items: center;
    }
    .jc-typing span {
      width: 6px; height: 6px; border-radius: 50%;
      background: #8A8278;
      animation: jcbounce .8s ease-in-out infinite;
    }
    .jc-typing span:nth-child(2) { animation-delay: .16s; }
    .jc-typing span:nth-child(3) { animation-delay: .32s; }
    @keyframes jcbounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }

    #jc-suggestions {
      padding: 10px 12px 4px;
      display: flex; flex-wrap: wrap; gap: 6px;
      background: #F7F3EE;
      border-top: 0.5px solid rgba(28,26,24,.08);
      flex-shrink: 0;
    }
    #jc-suggestions.hidden { display: none; }
    .jc-suggestion {
      font-size: 11px; font-weight: 400;
      color: #5C5850; background: #FDFAF7;
      border: 0.5px solid rgba(28,26,24,.14);
      padding: 5px 10px; cursor: pointer;
      border-radius: 20px;
      transition: background .15s, color .15s;
    }
    .jc-suggestion:hover { background: #1C1A18; color: #FDFAF7; border-color: #1C1A18; }

    #jc-bar {
      display: flex;
      border-top: 0.5px solid rgba(28,26,24,.1);
      background: #FDFAF7;
      flex-shrink: 0;
    }
    #jc-input {
      flex: 1; border: none; background: transparent;
      padding: 13px 14px;
      font-size: 13px; font-weight: 300; color: #1C1A18;
      outline: none; resize: none; line-height: 1.4;
    }
    #jc-input::placeholder { color: #8A8278; }
    #jc-send {
      background: none; border: none;
      padding: 13px 16px; cursor: pointer;
      color: #8A8278; transition: color .15s;
      display: flex; align-items: center; justify-content: center;
    }
    #jc-send:hover { color: #1C1A18; }
    #jc-send:disabled { opacity: .35; cursor: not-allowed; }
    #jc-send svg { width: 20px; height: 20px; }

    #jc-footer {
      text-align: center; padding: 6px;
      font-size: 10px; font-weight: 300;
      color: rgba(28,26,24,.3); background: #FDFAF7;
      border-top: 0.5px solid rgba(28,26,24,.06);
      letter-spacing: .04em; flex-shrink: 0;
    }

    @media (max-width: 480px) {
      #jc-panel {
        width: calc(100vw - 24px);
        right: 12px; bottom: 84px;
        max-height: calc(100vh - 120px);
      }
      #jc-toggle { bottom: 20px; right: 16px; }
    }
  `;

  const styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── BUILD DOM ──
  const wrap = document.createElement("div");
  wrap.id = "jc-wrap";

  const toggle = document.createElement("button");
  toggle.id = "jc-toggle";
  toggle.setAttribute("aria-label", "Open Jacob's Cafe chat assistant");
  toggle.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
    <div id="jc-unread"></div>
  `;

  const panel = document.createElement("div");
  panel.id = "jc-panel";
  panel.classList.add("hidden");
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Jacob's Cafe Chat Assistant");
  panel.innerHTML = `
    <div id="jc-header">
      <div id="jc-avatar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B8955A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
      <div>
        <div id="jc-header-name">Jacob's Cafe Assistant</div>
        <div id="jc-header-status"><span class="jc-dot"></span> Online &nbsp;·&nbsp; Replies instantly</div>
      </div>
      <button id="jc-close" aria-label="Close chat">✕</button>
    </div>
    <div id="jc-messages" aria-live="polite" aria-label="Chat messages"></div>
    <div id="jc-suggestions"></div>
    <div id="jc-bar">
      <input id="jc-input" type="text" placeholder="Ask about menu, hours, catering…" autocomplete="off" aria-label="Your message" maxlength="500">
      <button id="jc-send" aria-label="Send message">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </div>
    <div id="jc-footer">Powered by Jacob's Cafe AI · Available 24/7</div>
  `;

  wrap.appendChild(toggle);
  wrap.appendChild(panel);
  document.body.appendChild(wrap);

  // ── REFS ──
  const messagesEl    = document.getElementById("jc-messages");
  const inputEl       = document.getElementById("jc-input");
  const sendBtn       = document.getElementById("jc-send");
  const suggestionsEl = document.getElementById("jc-suggestions");
  const unreadBadge   = document.getElementById("jc-unread");

  // ── SUGGESTIONS ──
  function buildSuggestions() {
    suggestionsEl.innerHTML = "";
    SUGGESTIONS.forEach(text => {
      const btn = document.createElement("button");
      btn.className = "jc-suggestion";
      btn.textContent = text;
      btn.onclick = () => {
        hideSuggestions();
        sendMessage(text);
      };
      suggestionsEl.appendChild(btn);
    });
  }

  function hideSuggestions() {
    suggestionsEl.classList.add("hidden");
  }

  buildSuggestions();

  // ── OPEN / CLOSE ──
  function openPanel() {
    isOpen = true;
    panel.classList.remove("hidden");
    toggle.setAttribute("aria-expanded", "true");
    toggle.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    `;
    unreadBadge.style.display = "none";
    setTimeout(() => inputEl.focus(), 120);

    // show welcome message first time
    if (!hasInteracted) {
      addMessage("Hey! 👋 Welcome to Jacob's Cafe. I can help with our menu, hours, catering, ordering, or anything else — what can I do for you?", "bot");
    }
  }

  function closePanel() {
    isOpen = false;
    panel.classList.add("hidden");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <div id="jc-unread" style="display:none"></div>
    `;
  }

  toggle.addEventListener("click", () => isOpen ? closePanel() : openPanel());
  document.getElementById("jc-close").addEventListener("click", closePanel);

  // ── ADD MESSAGE ──
  function addMessage(text, role) {
    hideSuggestions();
    hasInteracted = true;

    const msgEl = document.createElement("div");
    msgEl.className = `jcm jcm-${role}`;
    // convert plain URLs to clickable links
    msgEl.innerHTML = text.replace(
      /(https?:\/\/[^\s<>"]+)/g,
      '<a href="$1" target="_blank" rel="noopener">$1</a>'
    );

    const timeEl = document.createElement("div");
    timeEl.className = `jcm-time${role === "user" ? " right" : ""}`;
    timeEl.textContent = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

    messagesEl.appendChild(msgEl);
    messagesEl.appendChild(timeEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    // show unread badge if panel closed
    if (!isOpen && role === "bot") {
      const badge = document.getElementById("jc-unread");
      if (badge) badge.style.display = "flex";
    }

    return msgEl;
  }

  function showTyping() {
    const el = document.createElement("div");
    el.className = "jc-typing";
    el.innerHTML = "<span></span><span></span><span></span>";
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }

  // ── SEND MESSAGE ──
  async function sendMessage(text) {
    const trimmed = (text || inputEl.value).trim();
    if (!trimmed || isTyping) return;

    inputEl.value = "";
    sendBtn.disabled = true;
    isTyping = true;
    addMessage(trimmed, "user");

    const typing = showTyping();

    try {
      const res = await fetch(`${BOT_URL}/chat`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ message: trimmed, history }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      typing.remove();
      addMessage(data.message, "bot");
      history = data.updatedHistory || history;

      // track review nudge state for this session
      if (data.flags?.reviewNudged) reviewNudgedThisSession = true;

    } catch (err) {
      typing.remove();
      addMessage(
        "Sorry, I'm having a moment — please call us directly at (407) 233-4080 or visit jacobscafe.net!",
        "bot"
      );
      console.error("JC Widget error:", err);
    } finally {
      sendBtn.disabled = false;
      isTyping = false;
      inputEl.focus();
    }
  }

  // ── EVENT LISTENERS ──
  sendBtn.addEventListener("click", () => sendMessage());
  inputEl.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // close on Escape
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && isOpen) closePanel();
  });

})();
