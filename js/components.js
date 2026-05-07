/* ═══ COMPONENTS.JS — CONRAD ═══ */

// ── NAVBAR ──
function renderNavbar(activePage = '', isRoot = true) {
  const base = isRoot ? '' : '../';
  const pages = [
    { href: '/',               label: 'Inicio',              id: 'home' },
    { href: '/pages/servicios.html',     label: 'Servicios',           id: 'servicios' },
    { href: '/pages/instalaciones.html', label: 'Instalaciones',       id: 'instalaciones' },
    { href: '/pages/recorrido.html',     label: 'Recorrido',           id: 'recorrido' },
    { href: '/pages/referentes.html',    label: 'Médicos Referentes',  id: 'referentes' },
    { href: '/pages/contacto.html',      label: 'Contacto',            id: 'contacto' },
  ];
  return `
<nav class="navbar" id="mainNav">
  <a class="navbar-logo" href="/">
    <img src="${base}assets/img/logo.png" alt="CONRAD" onerror="this.style.display='none'">
    <span class="navbar-brand">CON<span>RAD</span></span>
  </a>
  <button class="nav-toggle" id="navToggle" aria-label="Menú">☰</button>
  <div class="navbar-links" id="navLinks">
    ${pages.map(p => `<a href="${p.href}" class="${activePage===p.id?'active':''}">${p.label}</a>`).join('')}
    <a href="https://wa.me/50254605569" target="_blank" class="btn nav-cta">💬 WhatsApp</a>
  </div>
</nav>`;
}

// ── FOOTER ──
function renderFooter(isRoot = true) {
  const base = isRoot ? '' : '../';
  return `
<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <img src="${base}assets/img/logo.png" alt="CONRAD" onerror="this.style.display='none'">
        <p>Centro de Diagnóstico CONRAD – diagnóstico de precisión para tu salud. Chimaltenango, Guatemala.</p>
      </div>
      <div class="footer-col">
        <h4>Servicios</h4>
        <a href="${base}pages/servicios.html#rayos-x">Rayos X</a>
        <a href="${base}pages/servicios.html#ultrasonido">Ultrasonidos</a>
        <a href="${base}pages/servicios.html#tomografia">Tomografías</a>
        <a href="${base}pages/servicios.html#laboratorio">Laboratorio</a>
        <a href="${base}pages/servicios.html#mamografia">Mamografías</a>
        <a href="${base}pages/servicios.html#ecg">Electrocardiograma</a>
      </div>
      <div class="footer-col">
        <h4>Empresa</h4>
        <a href="/">Inicio</a>
        <a href="${base}pages/instalaciones.html">Instalaciones</a>
        <a href="${base}pages/recorrido.html">Recorrido Virtual</a>
        <a href="${base}pages/referentes.html">Médicos Referentes</a>
        <a href="${base}pages/contacto.html">Contacto</a>
      </div>
      <div class="footer-col">
        <h4>Contacto</h4>
        <a href="tel:77252722">📞 7725-2722</a>
        <a href="https://wa.me/50254605569" target="_blank">💬 WhatsApp 5460-5569</a>
        <a href="${base}pages/referentes.html">👩‍⚕️ Visitadora Médica</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 CONRAD Centro de Diagnóstico. Todos los derechos reservados.</span>
      <span style="color:rgba(255,255,255,0.25);">Chimaltenango, Guatemala</span>
    </div>
  </div>
</footer>`;
}

// ── CHATBOT ──
function renderChatbot() {
  return `
<button class="chatbot-toggle" id="chatToggle" title="Chat con CONRAD">🤖</button>
<div class="chatbot-window" id="chatWindow">
  <div class="chat-header">
    <div class="chat-avatar">🏥</div>
    <div class="chat-header-info">
      <strong>Asistente CONRAD</strong>
      <span>Centro de Diagnóstico</span>
    </div>
    <button class="chat-close" id="chatClose">✕</button>
  </div>
  <div class="chat-messages" id="chatMessages">
    <div class="msg msg-bot">¡Hola! Soy el asistente virtual de CONRAD. ¿En qué puedo ayudarte?</div>
  </div>
  <div class="chat-input-row">
    <input class="chat-input" id="chatInput" type="text" placeholder="Escribe tu consulta..." autocomplete="off">
    <button class="chat-send" id="chatSend">
      <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
    </button>
  </div>
</div>`;
}

// ── INIT NAV ──
function initNav() {
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
    toggle.textContent = links.classList.contains('open') ? '✕' : '☰';
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open');
    toggle.textContent = '☰';
  }));
}

// ── CHATBOT INIT ──
function initChatbot() {
  const toggle  = document.getElementById('chatToggle');
  const win     = document.getElementById('chatWindow');
  const closeBtn= document.getElementById('chatClose');
  const input   = document.getElementById('chatInput');
  const send    = document.getElementById('chatSend');
  const msgs    = document.getElementById('chatMessages');
  if (!toggle) return;

  toggle.addEventListener('click', () => win.classList.toggle('open'));
  closeBtn.addEventListener('click', () => win.classList.remove('open'));

  // Auto-detect path: root or /pages/ subfolder
  const isRoot = !window.location.pathname.includes('/pages/');
  const apiPath = isRoot ? 'api/chat' : '../api/chat';

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    appendMsg(text, 'user');
    const typing = appendTyping();
    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      }).catch(() => null);
      typing.remove();
      if (res && res.ok) {
        const data = await res.json();
        appendMsg(data.reply || 'Sin respuesta.', 'bot');
      } else {
        appendMsg('Lo siento, intenta de nuevo.', 'bot');
      }
    } catch(e) {
      typing.remove();
      appendMsg('Error de conexión.', 'bot');
    }
  }
  send.addEventListener('click', sendMessage);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

  function appendMsg(text, who) {
    const div = document.createElement('div');
    div.className = `msg msg-${who}`;
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }
  function appendTyping() {
    const div = document.createElement('div');
    div.className = 'msg msg-bot msg-typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }
}

// ── FADE-IN (handles both .fade-in and .fi classes) ──
function initFadeIn() {
  const els = document.querySelectorAll('.fade-in, .fi');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -10px 0px' });
  els.forEach(el => io.observe(el));
  // Immediately show elements already in viewport (hero, above-fold)
  requestAnimationFrame(() => {
    els.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight + 100) el.classList.add('visible');
    });
  });
}

// ── ACCORDION ──
function initAccordion() {
  document.querySelectorAll('.service-group-header').forEach(header => {
    header.addEventListener('click', () => {
      const isOpen = header.classList.contains('open');
      document.querySelectorAll('.service-group-header').forEach(h => {
        h.classList.remove('open');
        h.nextElementSibling?.classList.remove('open');
        h.querySelector('.chevron')?.classList.remove('open');
      });
      if (!isOpen) {
        header.classList.add('open');
        header.nextElementSibling?.classList.add('open');
        header.querySelector('.chevron')?.classList.add('open');
      }
    });
  });
  const first = document.querySelector('.service-group-header');
  if (first) first.click();
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initChatbot();
  initFadeIn();
  initAccordion();
});
