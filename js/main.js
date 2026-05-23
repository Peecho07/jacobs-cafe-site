/* ═══════════════════════════════════════
   Jacob's Cafe — Shared JS
   ═══════════════════════════════════════ */

// ── UPDATE THIS to your live Replit URL ──
const BOT_URL = "https://replit.com/@AnthonyPichardo/jacobs-cafe-chatbot";

// ── NAV: sticky shadow on scroll ──
const nav = document.querySelector('.nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

// ── MOBILE MENU ──
function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  const ham  = document.getElementById('hamburger');
  if (!menu || !ham) return;
  menu.classList.toggle('open');
  ham.classList.toggle('open');
}
// close on outside click
document.addEventListener('click', e => {
  const menu = document.getElementById('mobileMenu');
  const ham  = document.getElementById('hamburger');
  if (menu && menu.classList.contains('open')) {
    if (!menu.contains(e.target) && e.target !== ham && !ham.contains(e.target)) {
      menu.classList.remove('open');
      ham.classList.remove('open');
    }
  }
});

// ── ACTIVE NAV LINK ──
(function () {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
})();

// ── INTERSECTION OBSERVER: fade-up on scroll ──
(function () {
  const targets = document.querySelectorAll('.menu-card, .value-card, .stat, .gallery-cell');
  if (!targets.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(el => {
      if (el.isIntersecting) {
        el.target.style.opacity = '1';
        el.target.style.transform = 'translateY(0)';
        io.unobserve(el.target);
      }
    });
  }, { threshold: 0.1 });
  targets.forEach(t => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(16px)';
    t.style.transition = 'opacity .55s ease, transform .55s ease';
    io.observe(t);
  });
})();

// ── CHATBOT WIDGET ──
(function () {
  let history = [];
  let isOpen  = false;

  // inject toggle + panel
  const toggle = document.createElement('button');
  toggle.id = 'jc-toggle';
  toggle.setAttribute('aria-label', 'Open chat assistant');
  toggle.innerHTML = '<i class="ti ti-message-circle" style="font-size:22px"></i>';

  const panel = document.createElement('div');
  panel.id = 'jc-panel';
  panel.classList.add('hidden');
  panel.innerHTML = `
    <div id="jc-head">
      <span class="online-dot"></span>
      <div>
        <div id="jc-head-name">Jacob's Cafe Assistant</div>
        <div id="jc-head-sub">Replies instantly · 24/7</div>
      </div>
    </div>
    <div id="jc-messages">
      <div class="jcmsg jcmsg-bot">Hey! Welcome to Jacob's Cafe 👋 Ask me about our menu, hours, or anything else!</div>
    </div>
    <div id="jc-bar">
      <input id="jc-input" type="text" placeholder="Ask about menu, hours, catering..." autocomplete="off">
      <button id="jc-send">Send</button>
    </div>
  `;

  document.body.appendChild(toggle);
  document.body.appendChild(panel);

  // toggle open/close
  toggle.addEventListener('click', () => {
    isOpen = !isOpen;
    panel.classList.toggle('hidden', !isOpen);
    toggle.innerHTML = isOpen
      ? '<i class="ti ti-x" style="font-size:20px"></i>'
      : '<i class="ti ti-message-circle" style="font-size:22px"></i>';
    if (isOpen) document.getElementById('jc-input').focus();
  });

  function addMsg(text, role) {
    const msgs = document.getElementById('jc-messages');
    const d = document.createElement('div');
    d.className = `jcmsg jcmsg-${role}`;
    d.textContent = text;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return d;
  }

  function showTyping() {
    const msgs = document.getElementById('jc-messages');
    const d = document.createElement('div');
    d.className = 'jc-typing';
    d.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return d;
  }

  async function send() {
    const input = document.getElementById('jc-input');
    const btn   = document.getElementById('jc-send');
    const text  = input.value.trim();
    if (!text) return;

    input.value = '';
    btn.disabled = true;
    addMsg(text, 'user');
    const typing = showTyping();

    try {
      const res = await fetch(`${BOT_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history })
      });
      const data = await res.json();
      typing.remove();
      addMsg(data.message, 'bot');
      history = data.updatedHistory || history;
    } catch {
      typing.remove();
      addMsg("Having a moment — please call us at (407) 233-4080!", 'bot');
    } finally {
      btn.disabled = false;
      input.focus();
    }
  }

  document.getElementById('jc-send').addEventListener('click', send);
  document.getElementById('jc-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') send();
  });
})();
