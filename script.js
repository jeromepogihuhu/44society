/* ============================================
   44SOCIETY TOOLS — SCRIPT.JS
   Discord license gate + buy modal logic
   ============================================ */

'use strict';

// ---- CONFIG ----
const DISCORD_SELLER = 'jeromejames28r';

// Storage key
const SESSION_KEY = '44soc_session';

// ---- DOM REFS ----
const licenseGate  = document.getElementById('licenseGate');
const mainSite     = document.getElementById('mainSite');
const discordInput = document.getElementById('discordInput');
const gateBtn      = document.getElementById('gateBtn');
const gateError    = document.getElementById('gateError');
const navUser      = document.getElementById('navUser');
const buyModal     = document.getElementById('buyModal');
const modalTitle   = document.getElementById('modalTitle');
const modalPrice   = document.getElementById('modalPrice');
const copyConfirm  = document.getElementById('copyConfirm');
const discordHandle = document.getElementById('discordHandle');

// ---- INIT ----
(function init() {
  discordHandle.textContent = DISCORD_SELLER;

  const saved = getSession();
  if (saved && validateDiscord(saved)) {
    unlockSite(saved);
    return;
  }
  showGate();
})();

// ---- GATE LOGIC ----
function showGate() {
  licenseGate.classList.remove('hidden');
  mainSite.classList.add('hidden');
  setTimeout(() => discordInput.focus(), 100);
}

function unlockSite(username) {
  licenseGate.classList.add('hidden');
  mainSite.classList.remove('hidden');
  navUser.textContent = username;
  saveSession(username);
  revealCards();
}

gateBtn.addEventListener('click', attemptVerify);
discordInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') attemptVerify();
  if (gateError.textContent) gateError.textContent = '';
});

function attemptVerify() {
  const raw = discordInput.value.trim();

  if (!raw) {
    setError('Enter your Discord username.');
    shake(discordInput);
    return;
  }

  if (!validateDiscord(raw)) {
    setError('Invalid format. Try: username or username#1234');
    shake(discordInput);
    return;
  }

  // Simulate license check with brief loading state
  gateBtn.textContent = 'VERIFYING...';
  gateBtn.disabled = true;

  setTimeout(() => {
    gateBtn.textContent = 'VERIFY ACCESS';
    gateBtn.disabled = false;
    unlockSite(raw);
  }, 820);
}

function validateDiscord(str) {
  if (!str || str.length < 2 || str.length > 64) return false;
  // Modern Discord usernames (no discriminator) OR old style with #0000
  const modern = /^[a-zA-Z0-9_.]{2,32}$/.test(str);
  const legacy = /^.{2,32}#\d{4}$/.test(str);
  return modern || legacy;
}

function setError(msg) {
  gateError.textContent = msg;
}

function shake(el) {
  el.classList.remove('shake');
  void el.offsetWidth;
  el.style.animation = 'none';
  el.getBoundingClientRect();
  el.style.animation = 'shakeX 0.4s ease';
  setTimeout(() => { el.style.animation = ''; }, 400);
}

// ---- SESSION ----
function saveSession(username) {
  try {
    sessionStorage.setItem(SESSION_KEY, username);
  } catch(e) {}
}

function getSession() {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch(e) {
    return null;
  }
}

// ---- CARD REVEAL ANIMATION ----
function revealCards() {
  const cards = document.querySelectorAll('.tool-card');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px)';
    card.style.transition = 'none';

    setTimeout(() => {
      card.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.4,0,0.2,1)';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 80 + (i * 90));
  });
}

// ---- BUY MODAL ----
function openBuy(btn) {
  const card = btn.closest('.tool-card');
  const tool  = card.dataset.tool;
  const price = card.dataset.price;

  modalTitle.textContent = tool;
  modalPrice.textContent = price;
  discordHandle.textContent = DISCORD_SELLER;

  buyModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  setTimeout(() => buyModal.querySelector('.modal-box').focus?.(), 50);
}

function closeModal() {
  buyModal.classList.add('hidden');
  document.body.style.overflow = '';
  copyConfirm.classList.remove('show');
}

// Close on overlay click
buyModal.addEventListener('click', e => {
  if (e.target === buyModal) closeModal();
});

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !buyModal.classList.contains('hidden')) closeModal();
});

// ---- COPY DISCORD ----
function copyDiscord() {
  const name = discordHandle.textContent;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(name).then(() => showCopied());
  } else {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = name;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showCopied();
  }
}

function showCopied() {
  copyConfirm.classList.add('show');
  setTimeout(() => copyConfirm.classList.remove('show'), 2000);
}

// ---- SHAKE KEYFRAME (inject) ----
(function injectShakeCSS() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shakeX {
      0%,100% { transform: translateX(0); }
      20%      { transform: translateX(-8px); }
      40%      { transform: translateX(8px); }
      60%      { transform: translateX(-6px); }
      80%      { transform: translateX(6px); }
    }
  `;
  document.head.appendChild(style);
})();
