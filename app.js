/* Namdhari Seva & Community — clickable demo v2 (no backend; state lives on this device) */
(() => {
'use strict';

// ---------- Utilities ----------
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const DAY = 86400000, HOUR = 3600000;
const now = () => new Date();
const at = (dayOffset, h, m = 0) => { const d = new Date(); d.setDate(d.getDate() + dayOffset); d.setHours(h, m, 0, 0); return d.toISOString(); };
const ago = (mins) => new Date(Date.now() - mins * 60000).toISOString();
const fmtDay = (iso) => new Date(iso).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
const fmtTime = (iso) => new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
const tile = (iso) => { const d = new Date(iso); return `<div class="datetile" aria-hidden="true"><div><b>${d.getDate()}</b><span>${d.toLocaleDateString(undefined, { month: 'short' })}</span></div></div>`; };
const relDay = (iso) => {
  const d = new Date(iso); const t = new Date(); t.setHours(0, 0, 0, 0); const dd = new Date(d); dd.setHours(0, 0, 0, 0);
  const diff = Math.round((dd - t) / DAY);
  if (diff === 0) return 'Today'; if (diff === 1) return 'Tomorrow'; if (diff === -1) return 'Yesterday';
  if (diff > 1 && diff < 7) return d.toLocaleDateString(undefined, { weekday: 'long' });
  return fmtDay(iso);
};
const initials = (n) => n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
const uid = () => Math.random().toString(36).slice(2, 9);
let toastTimer;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600); }
const vibrate = () => { try { navigator.vibrate && navigator.vibrate(10); } catch (e) {} };

// ---------- Icons ----------
const I = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
  seva: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11V7a2 2 0 1 1 4 0v4"/><path d="M11 10V5a2 2 0 1 1 4 0v6"/><path d="M15 9a2 2 0 1 1 4 0v5a7 7 0 0 1-7 7h-1a7 7 0 0 1-6-3.4L3 15a2 2 0 0 1 3.4-2l.6 1"/></svg>',
  garden: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21v-9"/><path d="M12 12c0-4 3-7 8-7 0 5-3 7-8 7z"/><path d="M12 14c0-3-2.5-5.5-7-5.5 0 4 2.5 5.5 7 5.5z"/><path d="M5 21h14"/></svg>',
  community: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z"/></svg>',
  manage: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><path d="M17.5 14v7M14 17.5h7"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>',
  pin: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  clock: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  repeat: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/></svg>',
  cal: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  share: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v13M7 8l5-5 5 5"/><path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg>',
  wa: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.8-1.2s.2-1.1.1-1.2-.2-.2-.4-.3z"/></svg>',
  close: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  check: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></svg>',
  warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
  qr: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/></svg>',
  chev: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>',
  globe: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
  edit: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z"/></svg>',
  cube: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 2 3 7v10l9 5 9-5V7z"/><path d="M3 7l9 5 9-5M12 12v10"/></svg>',
  erase: '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20H8l-5-5 10-10 8 8-6 6"/><path d="M6 12l6 6"/></svg>',
};
const CAT = {
  cleanup: { label: 'Clean-up', svg: '<svg viewBox="0 0 64 64"><path d="M14 50C14 28 30 14 52 12c0 24-14 38-36 38" fill="#7FA98D"/><path d="M14 50C24 38 34 30 46 22" stroke="#2F5A45" stroke-width="3" fill="none" stroke-linecap="round"/></svg>' },
  langar: { label: 'Langar', svg: '<svg viewBox="0 0 64 64"><path d="M8 30h48a24 22 0 0 1-48 0z" fill="#C9935A"/><rect x="6" y="27" width="52" height="5" rx="2.5" fill="#8C5E33"/><path d="M24 22c0-4 4-4 4-8M32 22c0-4 4-4 4-8M40 22c0-4 4-4 4-8" stroke="#B3A089" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>' },
  tree: { label: 'Tree planting', svg: '<svg viewBox="0 0 64 64"><rect x="29" y="34" width="6" height="18" rx="2" fill="#8C6A43"/><circle cx="32" cy="26" r="14" fill="#5E9470"/><circle cx="24" cy="30" r="8" fill="#7FB18E"/><path d="M14 54h36" stroke="#8C6A43" stroke-width="3" stroke-linecap="round"/></svg>' },
  education: { label: 'Education', svg: '<svg viewBox="0 0 64 64"><path d="M8 16c10-4 18-2 24 4v32c-6-6-14-8-24-4z" fill="#6E86B3"/><path d="M56 16c-10-4-18-2-24 4v32c6-6 14-8 24-4z" fill="#90A6CF"/></svg>' },
  event: { label: 'Event', svg: '<svg viewBox="0 0 64 64"><rect x="10" y="14" width="44" height="40" rx="8" fill="#fff" stroke="#4C78C2" stroke-width="3"/><path d="M10 26h44" stroke="#4C78C2" stroke-width="3"/><path d="M22 9v10M42 9v10" stroke="#4C78C2" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="40" r="6" fill="#D89B5B"/></svg>' },
  milestone: { label: 'Milestone', svg: '<svg viewBox="0 0 64 64"><g fill="#E39AA8"><circle cx="32" cy="18" r="9"/><circle cx="46" cy="28" r="9"/><circle cx="41" cy="44" r="9"/><circle cx="23" cy="44" r="9"/><circle cx="18" cy="28" r="9"/></g><circle cx="32" cy="32" r="8" fill="#F3C969"/></svg>' },
  alert: { label: 'Alert', svg: '<svg viewBox="0 0 64 64"><path d="M29 10 6 50a4 4 0 0 0 3.5 6h45a4 4 0 0 0 3.5-6L35 10a3.5 3.5 0 0 0-6 0z" fill="#F08A4B"/><rect x="29.5" y="24" width="5" height="16" rx="2.5" fill="#fff"/><circle cx="32" cy="47" r="3" fill="#fff"/></svg>' },
};
const catIco = (c) => `<div class="ico">${CAT[c]?.svg || ''}</div>`;

// ---------- Personal garden items ----------
// Each item draws around a ground origin (0,0), extending upward (negative y).
const GI = {
  marigold: { name: 'Marigolds', unlock: { n: 1 }, desc: 'Bright and cheerful. Your very first bloom.', draw: () => [-8, 0, 8].map((x, i) => `<path d="M${x} 0v-${12 + i * 2}" stroke="#4E8460" stroke-width="2"/><circle cx="${x}" cy="-${14 + i * 2}" r="5" fill="#F29A2E"/><circle cx="${x}" cy="-${14 + i * 2}" r="2" fill="#E0701A"/>`).join('') },
  rose: { name: 'Rose bush', unlock: { n: 2 }, desc: 'A small bush that flowers all season.', draw: () => `<ellipse cx="0" cy="-8" rx="15" ry="10" fill="#4F8A5D"/><ellipse cx="-5" cy="-12" rx="9" ry="7" fill="#62A06F"/><circle cx="-7" cy="-13" r="3.2" fill="#D9475B"/><circle cx="5" cy="-10" r="3.2" fill="#E25A6C"/><circle cx="0" cy="-17" r="3.2" fill="#D9475B"/><circle cx="9" cy="-15" r="2.6" fill="#F07A8A"/>` },
  sapling: { name: 'Neem sapling', unlock: { n: 3 }, desc: 'A young neem. It will give shade one day.', draw: () => `<path d="M0 0v-26" stroke="#7A5A38" stroke-width="3"/><ellipse cx="-7" cy="-22" rx="8" ry="4" fill="#6BAA74" transform="rotate(-25 -7 -22)"/><ellipse cx="7" cy="-26" rx="8" ry="4" fill="#5E9A68" transform="rotate(25 7 -26)"/><ellipse cx="0" cy="-31" rx="5" ry="7" fill="#7FBA86"/>` },
  bench: { name: 'Wooden bench', unlock: { n: 4 }, desc: 'A place to sit with the sangat.', draw: () => `<path d="M-14 -8v8M14 -8v8M0 -1v7M-2 -17v6" stroke="#5B4330" stroke-width="2.5"/><path d="M-18 -10L-2 -18L-2 -30L-18 -22Z" fill="#9A6A40"/><path d="M-18 -16L-2 -24" stroke="#7E5532" stroke-width="1.2"/><path d="M-18 -10L0 -1L18 -10L2 -18Z" fill="#C48A55"/><path d="M-18 -10L0 -1L0 2L-18 -7Z" fill="#8A5E38"/><path d="M0 -1L18 -10L18 -7L0 2Z" fill="#6E4A2C"/>` },
  lantern: { name: 'Lantern', unlock: { n: 5 }, desc: 'Glows softly in the evening.', draw: () => `<path d="M0 0v-30" stroke="#4A3B2D" stroke-width="2.5"/><circle class="glow" cx="0" cy="-34" r="11" fill="#F6D776" opacity=".5"/><rect x="-5" y="-40" width="10" height="11" rx="2.5" fill="#F3C24F" stroke="#8A6A2A" stroke-width="1.2"/>` },
  pond: { name: 'Lotus pond', unlock: { n: 8 }, desc: 'Still water with a lotus in bloom.', draw: () => `<ellipse cx="0" cy="0" rx="22" ry="11" fill="#6FB4D8"/><ellipse cx="0" cy="-1" rx="17" ry="8" fill="#8CCBEA"/><ellipse cx="-7" cy="1" rx="5" ry="2.5" fill="#5E9A68"/><path d="M4 -1c-3-5 0-9 2-9s5 4 2 9z" fill="#F29BB5"/><path d="M6 -1c-5-2-6-6-4-7M6 -1c5-2 6-6 4-7" fill="#E77FA0"/>` },
  peacock: { name: 'Peacock', unlock: { n: 10 }, desc: 'A rare visitor — it comes when the garden is full of life.', draw: () => `<g class="sway"><path d="M0 -8C-26 -12 -26 -44 0 -48C26 -44 26 -12 0 -8z" fill="#2E8B6E"/>${[-14, -7, 0, 7, 14].map((x, i) => `<circle cx="${x}" cy="${-36 + Math.abs(x) * .9}" r="3.4" fill="#1F4E8C"/><circle cx="${x}" cy="${-36 + Math.abs(x) * .9}" r="1.4" fill="#F2C94C"/>`).join('')}</g><ellipse cx="0" cy="-10" rx="5" ry="8" fill="#1F5FA8"/><circle cx="1" cy="-20" r="3.5" fill="#2069B8"/><path d="M4 -20l4 1-4 1" fill="#E3A33B"/><path d="M-2 -3v4M2 -3v4" stroke="#8A6A3A" stroke-width="1.5"/>` },
  banyan: { name: 'Banyan tree', unlock: { n: 12 }, desc: 'Wide and generous, like a sangat that keeps growing.', draw: () => `<path d="M-14 0v-26M-6 0v-30M6 0v-30M14 0v-24" stroke="#7A5A38" stroke-width="3"/><ellipse cx="0" cy="-42" rx="30" ry="18" fill="#3E7A52"/><ellipse cx="-12" cy="-46" rx="16" ry="11" fill="#4F8F62"/><ellipse cx="12" cy="-48" rx="14" ry="10" fill="#5A9A6C"/>` },
  sunflower: { name: 'Sunflowers', unlock: { cat: 'langar' }, desc: 'Unlocked by doing langar seva.', draw: () => [-6, 7].map((x, i) => `<path d="M${x} 0v-${26 + i * 6}" stroke="#4E8460" stroke-width="2.5"/><ellipse cx="${x + 4}" cy="-${12 + i * 3}" rx="5" ry="2.5" fill="#5E9A68"/><circle cx="${x}" cy="-${28 + i * 6}" r="8" fill="#F6C42E"/><circle cx="${x}" cy="-${28 + i * 6}" r="3.5" fill="#7A4A1E"/>`).join('') },
  mango: { name: 'Mango tree', unlock: { cat: 'tree' }, desc: 'Unlocked by joining a tree-planting seva.', draw: () => `<rect x="-3" y="-24" width="6" height="24" rx="2" fill="#7A5A38"/><circle cx="0" cy="-38" r="18" fill="#3F7F55"/><circle cx="-10" cy="-32" r="10" fill="#4E9064"/><circle cx="9" cy="-30" r="3.4" fill="#F2A33A"/><circle cx="-6" cy="-42" r="3.4" fill="#F2B83A"/><circle cx="6" cy="-46" r="3" fill="#F2A33A"/>` },
  butterflies: { name: 'Butterflies', unlock: { cat: 'cleanup' }, desc: 'They return to clean places. Unlocked by clean-up seva.', draw: () => `<g class="sway"><path d="M-8 -26c-6-6-12-2-8 3 3 3 8 0 8-3zm0 0c6-6 12-2 8 3-3 3-8 0-8-3z" fill="#B48CE0"/><path d="M8 -12c-4-4-8-1-5 2 2 2 5 0 5-2zm0 0c4-4 8-1 5 2-2 2-5 0-5-2z" fill="#F29A2E"/></g><ellipse cx="0" cy="-2" rx="9" ry="3" fill="#6BAA74" opacity=".5"/>` },
  swing: { name: 'Swing', unlock: { cat: 'education' }, desc: 'For the children. Unlocked by education seva.', draw: () => `<path d="M-16 0l4-34M-4 0l-8-34M16 0l-4-34M4 0l8-34M-12 -34h24" stroke="#8C6A43" stroke-width="2.5" fill="none"/><path d="M-4 -34v22M4 -34v22" stroke="#555" stroke-width="1.2"/><rect x="-6" y="-13" width="12" height="3" rx="1" fill="#C0392B"/>` },
};
const TILES = {
  grass: { name: 'Grass', unlock: { n: 0 }, desc: 'Soft ground for your garden.' },
  path: { name: 'Stone path', unlock: { n: 1 }, desc: 'Lay out walkways between your plants.' },
};
const ITEM_ORDER = ['path', 'grass', 'marigold', 'rose', 'sunflower', 'sapling', 'bench', 'butterflies', 'swing', 'lantern', 'mango', 'pond', 'peacock', 'banyan'];
const itemDef = (id) => GI[id] || TILES[id];
function unlockText(u) {
  if (u.cat) return `Do a ${CAT[u.cat].label.toLowerCase()} seva`;
  if (u.n === 0) return 'Available from the start';
  return `Complete ${u.n} seva${u.n > 1 ? 's' : ''}`;
}
function isUnlocked(id) {
  const u = itemDef(id).unlock; const st = sevaStats();
  return u.cat ? st.cats.has(u.cat) : st.n >= u.n;
}
const thumb = (id, cls = '') => {
  if (TILES[id]) return `<svg viewBox="-30 -22 60 44" class="${cls}"><path d="M0 -15L26 0L0 15L-26 0Z" fill="${id === 'path' ? '#E2D2B4' : '#9EC29D'}" stroke="${id === 'path' ? '#C9B48E' : '#86AE85'}"/>${id === 'path' ? '<ellipse cx="-6" cy="-2" rx="5" ry="2.5" fill="#CDB892"/><ellipse cx="7" cy="3" rx="4" ry="2" fill="#CDB892"/>' : ''}</svg>`;
  return `<svg viewBox="-34 -58 68 66" class="${cls}"><ellipse cx="0" cy="2" rx="18" ry="5" fill="#000" opacity=".08"/>${GI[id].draw()}</svg>`;
};

// ---------- Demo data ----------
const PEOPLE = ['Harpreet Kaur', 'Gurpreet Singh', 'Simran Kaur', 'Jaspreet Singh', 'Manjit Kaur', 'Balwinder Singh', 'Navneet Kaur', 'Amrit Singh', 'Kiranjit Kaur', 'Ravinder Singh', 'Parminder Kaur', 'Tejinder Singh'];
function seed() {
  return {
    v: 2, onboarded: false,
    me: { name: '', group: 'delhi', minor: false },
    role: 'member', mode: 'auto', accent: 'forest',
    groups: [
      { id: 'delhi', name: 'Delhi Central', city: 'Delhi', country: 'India' },
      { id: 'ludhiana', name: 'Ludhiana Sangat', city: 'Ludhiana', country: 'India' },
      { id: 'london', name: 'London Sangat', city: 'London', country: 'UK' },
    ],
    seva: [
      { id: 's0', title: 'Morning Langar Prep', cat: 'langar', group: 'delhi', start: ago(70), dur: 210, place: 'Namdhari Gurdwara, Karol Bagh', recur: 'Daily', purpose: 'Chopping and prep for today\'s langar.', status: 'open', created: at(-6, 9),
        roles: [ { id: 'r1', name: 'Prep team', cap: 6, filled: ['Harpreet Kaur', 'Manjit Kaur', 'Navneet Kaur', 'Simran Kaur', 'Parminder Kaur'], wait: [] } ] },
      { id: 's1', title: 'Sunday Langar Seva', cat: 'langar', group: 'delhi', start: at(1, 9), dur: 240, place: 'Namdhari Gurdwara, Karol Bagh', recur: 'Weekly · Sundays', purpose: 'Prepare and serve langar for around 300 sangat after the morning diwan.', status: 'open', created: at(-10, 9),
        roles: [ { id: 'r1', name: 'Cooks', cap: 6, filled: ['Harpreet Kaur', 'Manjit Kaur', 'Navneet Kaur'], wait: [] }, { id: 'r2', name: 'Servers', cap: 8, filled: ['Gurpreet Singh', 'Amrit Singh', 'Simran Kaur', 'Ravinder Singh', 'Kiranjit Kaur'], wait: [] }, { id: 'r3', name: 'Drivers (supplies)', cap: 2, filled: ['Balwinder Singh', 'Tejinder Singh'], wait: ['Jaspreet Singh'] } ] },
      { id: 's2', title: 'Yamuna Ghat Clean-up', cat: 'cleanup', group: 'delhi', start: at(4, 7), dur: 150, place: 'Kudesia Ghat, Gate 2, Delhi', recur: null, purpose: 'Clear plastic waste along 400 m of the riverbank. Gloves and bags provided.', status: 'open', created: at(-8, 9),
        roles: [ { id: 'r1', name: 'Clean-up volunteers', cap: 20, filled: ['Simran Kaur', 'Amrit Singh', 'Parminder Kaur', 'Jaspreet Singh', 'Tejinder Singh', 'Navneet Kaur', 'Gurpreet Singh'], wait: [] }, { id: 'r2', name: 'Supplies & water', cap: 2, filled: [], wait: [] } ] },
      { id: 's3', title: 'Tree Planting Drive', cat: 'tree', group: 'delhi', start: at(9, 8), dur: 180, place: 'Sanjay Van, South Delhi', recur: 'Monthly · 2nd Saturday', purpose: 'Plant 120 native saplings with the forest department.', status: 'open', created: ago(300),
        roles: [ { id: 'r1', name: 'Planters', cap: 15, filled: ['Kiranjit Kaur', 'Ravinder Singh'], wait: [] }, { id: 'r2', name: 'Water carriers', cap: 4, filled: [], wait: [] } ] },
      { id: 's6', title: 'Blanket Distribution', cat: 'langar', group: 'delhi', start: at(12, 18), dur: 120, place: 'Night shelters, Old Delhi', recur: null, purpose: 'Distribute 200 blankets ahead of winter.', status: 'open', created: ago(90),
        roles: [ { id: 'r1', name: 'Distribution team', cap: 10, filled: ['Gurpreet Singh'], wait: [] }, { id: 'r2', name: 'Drivers', cap: 3, filled: [], wait: [] } ] },
      { id: 's4', title: 'Punjabi Reading Circle for Kids', cat: 'education', group: 'delhi', start: at(-1, 17), dur: 90, place: 'Community Hall, Karol Bagh', recur: 'Weekly · Saturdays', purpose: 'Help children practise Gurmukhi reading in small groups.', status: 'pending', created: at(-20, 9),
        roles: [ { id: 'r1', name: 'Reading helpers', cap: 5, filled: ['Harpreet Kaur', 'Simran Kaur', 'Navneet Kaur', 'Amrit Singh'], wait: [] } ] },
      { id: 's5', title: 'Langar Seva — Southall', cat: 'langar', group: 'london', start: at(2, 11), dur: 180, place: 'Namdhari Gurdwara, Southall', recur: 'Weekly · Sundays', purpose: 'Serve langar after diwan.', status: 'open', created: at(-9, 9),
        roles: [ { id: 'r1', name: 'Kitchen', cap: 6, filled: ['Manjit Kaur', 'Balwinder Singh'], wait: [] } ] },
    ],
    events: [
      { id: 'e1', title: 'Monthly Satsang', cat: 'event', group: 'delhi', start: at(6, 18), place: 'Namdhari Gurdwara, Karol Bagh', host: 'Delhi Central', agenda: 'Kirtan · Katha · Ardas · Langar', going: 86, cap: 200, rsvp: null, linked: 's1', created: at(-12, 9) },
      { id: 'e2', title: 'New Volunteer Orientation', cat: 'education', group: 'delhi', start: at(3, 19), place: 'Online (link shared after RSVP)', host: 'Delhi Central', agenda: 'How seva works · Roles · Q&A (45 min)', going: 14, cap: 40, rsvp: null, linked: null, created: ago(200) },
      { id: 'e3', title: 'Hola Mohalla Gathering', cat: 'event', group: 'world', start: at(24, 10), place: 'Sri Bhaini Sahib, Punjab', host: 'Worldwide sangat', agenda: 'Gathering · Seva · Celebration', going: 1240, cap: null, rsvp: null, linked: null, created: at(-15, 9) },
    ],
    posts: [
      { id: 'a1', type: 'alert', scope: 'local', cat: 'alert', title: 'Venue change: Yamuna clean-up', city: 'Delhi', date: ago(120), text: 'Now meeting at Gate 2, Kudesia Ghat. Same time, 7:00 AM Thursday.', r: { g: 4, a: 9, c: 1 }, mine: null, link: 'seva:s2' },
      { id: 'p1', type: 'seva', scope: 'local', cat: 'cleanup', title: 'Karol Bagh street clean-up', city: 'Delhi', date: at(-3, 10), text: '18 bags of waste cleared from 3 lanes.', count: 22, r: { g: 31, a: 12, c: 9 }, mine: null },
      { id: 'v1', type: 'event', scope: 'local', cat: 'event', title: 'Monthly Satsang this Saturday', city: 'Delhi', date: at(-1, 12), text: 'Kirtan, katha and langar. 86 sangat going so far.', r: { g: 22, a: 14, c: 5 }, mine: null, link: 'event:e1' },
      { id: 'p2', type: 'seva', scope: 'world', cat: 'langar', title: 'Langar for 450 at Southall', city: 'London', date: at(-2, 13), text: 'Served 450 sangat in under 2 hours.', count: 16, r: { g: 88, a: 40, c: 27 }, mine: null },
      { id: 'v2', type: 'event', scope: 'world', cat: 'event', title: 'Hola Mohalla gathering — RSVPs open', city: 'Sri Bhaini Sahib', date: at(-4, 9), text: 'Gathering at Sri Bhaini Sahib in 3 weeks. 1,240 going.', r: { g: 210, a: 96, c: 120 }, mine: null, link: 'event:e3' },
      { id: 'p3', type: 'seva', scope: 'world', cat: 'milestone', title: 'Ludhiana sangat: 100 seva this year', city: 'Ludhiana', date: at(-5, 9), text: 'A new path bloomed in the Ludhiana garden.', r: { g: 140, a: 61, c: 73 }, mine: null },
      { id: 'p5', type: 'seva', scope: 'world', cat: 'tree', title: '300 saplings planted in Toronto', city: 'Toronto', date: at(-8, 9), text: 'Partnered with the city parks team.', count: 41, r: { g: 104, a: 55, c: 38 }, mine: null },
    ],
    alerts: [
      { id: 'al1', level: 'urgent', title: '3 more cooks needed', text: 'Sunday Langar Seva · tomorrow 9:00 AM', open: 'seva:s1', dismissed: false },
      { id: 'al2', level: 'warn', title: 'Venue changed', text: 'Yamuna clean-up now at Gate 2, Kudesia Ghat', open: 'seva:s2', dismissed: false },
    ],
    passport: [
      { cat: 'langar', title: 'Sunday Langar Seva', date: at(-40, 9), hrs: 4 },
      { cat: 'cleanup', title: 'Karol Bagh street clean-up', date: at(-3, 10), hrs: 2.5 },
      { cat: 'langar', title: 'Sunday Langar Seva', date: at(-13, 9), hrs: 4 },
      { cat: 'education', title: 'Punjabi Reading Circle', date: at(-8, 17), hrs: 1.5 },
    ],
    eventsAttended: 1,
    thanks: [ { from: 'Gurpreet Singh (Lead)', text: 'Thank you for serving at the street clean-up. Your help made it possible.', date: at(-3, 18) } ],
    notifs: [
      { id: uid(), level: 'urgent', t: 'Sunday Langar needs 3 more cooks', d: ago(40), read: false, open: 'seva:s1' },
      { id: uid(), level: 'new', t: 'New seva: Blanket Distribution', d: ago(90), read: false, open: 'seva:s6' },
      { id: uid(), level: 'warn', t: 'Venue changed: Yamuna clean-up → Gate 2', d: ago(120), read: false, open: 'seva:s2' },
      { id: uid(), level: 'info', t: 'Thank-you note from Gurpreet Singh', d: at(-3, 18), read: true, open: 'tab:profile' },
    ],
    seen: {},
    garden: {
      tiles: { '2,0': 'path', '2,1': 'path', '2,2': 'path', '2,3': 'path', '2,4': 'path', '2,5': 'path', '3,2': 'path', '4,2': 'path' },
      items: { '0,0': 'sapling', '1,1': 'marigold', '3,0': 'rose', '4,4': 'bench', '1,4': 'sunflower', '5,1': 'butterflies' },
    },
    groupGardenLevel: 4,
    intention: 4,
    feed: 'local', feedType: 'all', sevaView: 'seva', gardenView: 'mine', adminRegion: 'all',
    attendance: {},
  };
}
const KEY = 'namdhari-seva-demo-v2';
let S;
try { S = JSON.parse(localStorage.getItem(KEY)); if (!S || S.v !== 2) S = seed(); } catch (e) { S = seed(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

let tab = 'home';
let deferredPrompt = null;
let gardenEdit = false, gardenTool = 'path';
const standalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// ---------- Derived helpers ----------
const ME = () => S.me.name || 'You';
const myGroup = () => S.groups.find((g) => g.id === S.me.group) || S.groups[0];
const filled = (s) => s.roles.reduce((n, r) => n + r.filled.length, 0);
const cap = (s) => s.roles.reduce((n, r) => n + r.cap, 0);
const myRole = (s) => s.roles.find((r) => r.filled.includes(ME()));
const myWait = (s) => s.roles.find((r) => r.wait.includes(ME()));
const endOf = (s) => new Date(new Date(s.start).getTime() + (s.dur || 120) * 60000);
const isLive = (s) => s.status === 'open' && new Date(s.start) <= now() && endOf(s) > now();
const isUpcoming = (s) => s.status === 'open' && new Date(s.start) > now();
const visibleSeva = () => S.seva.filter((s) => s.group === S.me.group);
const visibleEvents = () => S.events.filter((e) => e.group === S.me.group || e.group === 'world');
const isNew = (x) => !S.seen[x.id] && x.created && (Date.now() - new Date(x.created)) < 5 * DAY && new Date(x.start) > now();
const newSeva = () => visibleSeva().filter((s) => s.status === 'open' && isNew(s));
const newEvents = () => visibleEvents().filter(isNew);
const markSeen = (id) => { if (!S.seen[id]) { S.seen[id] = Date.now(); save(); } };
function sevaStats() {
  const month = S.passport.filter((p) => new Date(p.date) > new Date(Date.now() - 30 * DAY));
  return { n: S.passport.length, cats: new Set(S.passport.map((p) => p.cat)), month: month.length, hrs: month.reduce((h, p) => h + (p.hrs || 2), 0) };
}
function fillState(s) {
  if (s.status === 'pending') return { cls: 'warn', t: 'Awaiting close' };
  if (s.status === 'closed') return { cls: 'ok', t: 'Completed' };
  if (isLive(s)) return { cls: 'live', t: 'Live now' };
  const left = cap(s) - filled(s);
  if (left <= 0) return { cls: 'ok', t: 'Ready' };
  const hrs = (new Date(s.start) - now()) / HOUR;
  if (hrs < 48 && left / cap(s) > 0.25) return { cls: 'urgent', t: `Urgent · needs ${left}` };
  return { cls: 'warn', t: `Needs ${left} more` };
}
function myCommitments() {
  const out = [];
  S.seva.forEach((s) => { const r = myRole(s); if (r && isUpcoming(s)) out.push({ kind: 'seva', id: s.id, title: s.title, start: s.start, place: s.place, sub: r.name, cat: s.cat }); });
  S.events.forEach((e) => { if (e.rsvp === 'going' && new Date(e.start) > now()) out.push({ kind: 'event', id: e.id, title: e.title, start: e.start, place: e.place, sub: 'Going', cat: e.cat }); });
  return out.sort((a, b) => new Date(a.start) - new Date(b.start));
}
const unread = () => S.notifs.filter((n) => !n.read).length;

// ---------- Theme ----------
const mq = window.matchMedia('(prefers-color-scheme: dark)');
function applyTheme() {
  const dark = S.mode === 'dark' || (S.mode === 'auto' && mq.matches);
  document.documentElement.dataset.mode = dark ? 'dark' : 'light';
  document.documentElement.dataset.accent = S.accent;
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--canvas').trim();
  $$('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', bg));
}
mq.addEventListener && mq.addEventListener('change', () => { applyTheme(); });
const ACCENTS = [
  ['forest', 'Forest', ['#3F6B55', '#DDE9DF', '#8CCB9F']],
  ['ocean', 'Ocean', ['#24658A', '#DCEAF3', '#7CC4E8']],
  ['dusk', 'Dusk', ['#5A4A8E', '#E7E3F5', '#B9A8F2']],
  ['earth', 'Earth', ['#94532C', '#F4E5DA', '#EBAA7E']],
];

// ---------- Rendering ----------
function render() {
  applyTheme();
  if (!S.onboarded) return renderOnboarding();
  const screens = { home: Home, seva: Seva, garden: Garden, community: Community, profile: Profile, manage: Manage };
  if (tab === 'manage' && S.role === 'member') tab = 'home';
  $('#app').innerHTML = `<main class="screen">${roleBar()}${screens[tab]()}</main>${tabBar()}`;
}
function rerender() { const y = window.scrollY; render(); window.scrollTo(0, y); }
function go(t) { tab = t; closeSheet(); render(); window.scrollTo(0, 0); }
function roleBar() {
  return `<div class="rolebar"><span class="muted">Demo view</span>
    <select id="role-select" aria-label="Switch demo role">
      <option value="member" ${S.role === 'member' ? 'selected' : ''}>Member</option>
      <option value="lead" ${S.role === 'lead' ? 'selected' : ''}>Team Lead</option>
      <option value="admin" ${S.role === 'admin' ? 'selected' : ''}>Main Admin</option>
    </select><span class="grow"></span><span class="muted">${esc(myGroup().name)}</span></div>`;
}
function tabBar() {
  const nNew = newSeva().length + newEvents().length;
  const items = [['home', 'Home', I.home, 0], ['seva', 'Seva', I.seva, nNew], ['garden', 'Garden', I.garden, 0], ['community', 'Community', I.community, 0]];
  if (S.role !== 'member') items.splice(2, 0, ['manage', 'Manage', I.manage, S.role === 'lead' ? visibleSeva().filter((s) => s.status === 'pending').length : S.posts.filter((p) => p.pendingWorld).length]);
  return `<div class="tabbar"><nav aria-label="Main">${items.map(([id, l, ic, b]) => `<button data-tab="${id}" ${tab === id ? 'aria-current="page"' : ''} aria-label="${l}${b ? `, ${b} new` : ''}"><span class="tb-ico">${ic}${b ? `<span class="badge">${b}</span>` : ''}</span>${l}</button>`).join('')}</nav></div>`;
}
const topActions = () => `<div class="row" style="gap:8px"><button class="iconbtn" data-act="notifs" aria-label="Notifications, ${unread()} unread">${I.bell}${unread() ? `<span class="badge">${unread()}</span>` : ''}</button><button class="avatar" style="width:44px;height:44px" data-tab="profile" aria-label="Profile">${initials(ME())}</button></div>`;

// ----- Onboarding -----
let onbStep = 0;
function renderOnboarding() {
  const g = S.groups[0]; const next = S.seva[1];
  const steps = [
    () => `<div class="onb"><div>
        <p class="eyebrow">You've been invited to</p>
        <h1 style="margin-top:6px">${esc(g.name)}</h1>
        <p class="muted" style="margin-top:8px">Namdhari Seva &amp; Community · ${esc(g.city)}</p>
        <div class="garden-wrap" style="margin:24px 0">${groupGardenSVG(5, true)}</div>
        <div class="card"><p class="eyebrow">Next seva in your group</p>
          <div class="row" style="margin-top:10px">${tile(next.start)}<div class="grow"><h3>${esc(next.title)}</h3><p class="muted small">${relDay(next.start)} · ${fmtTime(next.start)} · ${filled(next)}/${cap(next)} volunteers</p></div></div></div>
      </div>
      <div style="margin-top:24px"><button class="btn block" data-act="onb-next">Join ${esc(g.name)}</button>
      <p class="muted xs" style="text-align:center;margin-top:12px">Demo only — nothing leaves this phone.</p></div></div>`,
    () => `<div class="onb"><div>
        <p class="eyebrow">Step 2 of 2</p><h1 style="margin-top:6px">A little about you</h1>
        <label class="f" for="onb-name">Your name</label><input class="in" id="onb-name" autocomplete="name" placeholder="e.g. Harjeet Kaur" value="${esc(S.me.name)}">
        <label class="f" for="onb-age">Age group</label>
        <select class="in" id="onb-age"><option value="adult">18 or older</option><option value="minor">Under 18</option></select>
        <p class="muted xs" style="margin-top:8px">Under-18 members need a guardian's approval before joining seva.</p>
      </div>
      <button class="btn block" data-act="onb-finish" style="margin-top:24px">Continue</button></div>`,
  ];
  $('#app').innerHTML = steps[onbStep]();
}

// ----- Home -----
function alertsBlock(list) {
  const al = list.filter((a) => !a.dismissed);
  if (!al.length) return '';
  return `<div style="margin-bottom:16px">${al.map((a) => `<div class="alert ${a.level}" role="alert">${a.level === 'urgent' ? I.warn : I.info}
    <button class="grow" style="background:none;border:0;padding:0;text-align:left" data-open="${a.open}"><span class="lvl">${a.level === 'urgent' ? 'Urgent' : 'Changed'}</span><b class="small" style="display:block;margin-top:2px">${esc(a.title)}</b><span class="muted xs">${esc(a.text)}</span></button>
    <button class="x" data-act="dismiss" data-id="${a.id}" aria-label="Dismiss">${I.close}</button></div>`).join('')}</div>`;
}
function ringsSVG(vals) {
  // vals: [{p, color}] outer → inner
  const sz = 132, c = sz / 2, sw = 12, gap = 4;
  const all = vals.every((v) => v.p >= 1);
  return `<svg class="rings" viewBox="0 0 ${sz} ${sz}" role="img" aria-label="Seva rings">${vals.map((v, i) => {
    const r = c - sw / 2 - i * (sw + gap); const C = 2 * Math.PI * r; const p = Math.min(1, v.p);
    return `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${v.color}" stroke-opacity=".16" stroke-width="${sw}"/><circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${v.color}" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - p)}" transform="rotate(-90 ${c} ${c})"/>`;
  }).join('')}
  ${all ? `<g transform="translate(${c} ${c + 10}) scale(.55)">${GI.marigold.draw()}</g>` : `<g transform="translate(${c} ${c + 9}) scale(.5)">${GI.sapling.draw()}</g>`}</svg>`;
}
function ringsCard() {
  const st = sevaStats(); const H = 10, E = 2;
  const vals = [{ p: st.month / S.intention, color: 'var(--ring1)' }, { p: st.hrs / H, color: 'var(--ring2)' }, { p: S.eventsAttended / E, color: 'var(--ring3)' }];
  return `<button class="card tap rings-card" data-act="rings-info" aria-label="Your seva rings this month">
    ${ringsSVG(vals)}
    <div class="legend">
      <div class="li"><i class="sw" style="background:var(--ring1)"></i><div><b>${st.month}/${S.intention}</b><span>Seva this month</span></div></div>
      <div class="li"><i class="sw" style="background:var(--ring2)"></i><div><b>${st.hrs % 1 ? st.hrs.toFixed(1) : st.hrs}/${H} h</b><span>Hours given</span></div></div>
      <div class="li"><i class="sw" style="background:var(--ring3)"></i><div><b>${S.eventsAttended}/${E}</b><span>Sangat gatherings</span></div></div>
    </div></button>`;
}
function liveCard(s) {
  const mins = Math.round((now() - new Date(s.start)) / 60000);
  return `<button class="card tap live-card" data-open="seva:${s.id}"><div class="row">${catIco(s.cat)}<div class="grow"><span class="pill live">Live</span><h3 style="margin-top:6px">${esc(s.title)}</h3>
    <p class="muted small">Started ${mins < 60 ? mins + ' min' : Math.floor(mins / 60) + ' h ' + (mins % 60) + ' min'} ago · ends ${fmtTime(endOf(s).toISOString())}</p></div>${I.chev}</div></button>`;
}
function Home() {
  if (S.role === 'lead') return LeadHome();
  if (S.role === 'admin') return AdminHome();
  const hour = now().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const live = visibleSeva().filter(isLive);
  const commits = myCommitments();
  const fresh = [...newSeva(), ...newEvents()].sort((a, b) => new Date(b.created) - new Date(a.created));
  const st = sevaStats(); const unlocked = ITEM_ORDER.filter(isUnlocked).length;
  return `
    <div class="topbar"><div><p class="eyebrow">${greet}</p><h1>${esc(ME().split(' ')[0])}</h1></div>${topActions()}</div>
    ${installBanner()}
    ${S.me.minor ? `<div class="notice" style="margin-bottom:16px">${I.info}<div class="small"><b>Waiting for guardian approval.</b> You can browse; joining seva opens once a parent or guardian approves.</div></div>` : ''}
    ${alertsBlock(S.alerts)}
    ${ringsCard()}
    ${live.length ? `<div class="section"><div class="section-h"><h2>Happening now</h2></div><div class="stack">${live.map(liveCard).join('')}</div></div>` : ''}
    <div class="section"><div class="section-h"><h2>Up next for you</h2>${commits.length > 3 ? '<button class="link" data-tab="seva">All</button>' : ''}</div>
      ${commits.length ? `<div class="card" style="padding:4px 16px">${commits.slice(0, 3).map((c) => `<button class="list-row" data-open="${c.kind}:${c.id}">${tile(c.start)}<div class="grow"><b class="small ellipsis" style="display:block">${esc(c.title)}</b><p class="muted xs">${relDay(c.start)} · ${fmtTime(c.start)} · ${esc(c.sub)}</p></div>${I.chev}</button>`).join('')}</div>`
        : `<div class="card"><p class="small">Nothing planned yet.</p><button class="btn sm" style="margin-top:10px" data-tab="seva">Find a seva</button></div>`}</div>
    ${fresh.length ? `<div class="section"><div class="section-h"><h2>New for you <span class="count">${fresh.length}</span></h2><button class="link" data-tab="seva">See all</button></div>
      <div class="stack">${fresh.slice(0, 2).map((x) => x.roles ? sevaCard(x) : eventCard(x)).join('')}</div></div>` : ''}
    <div class="section"><button class="card tap row" data-tab="garden" style="display:flex;gap:14px;align-items:center">
      <div style="width:96px;flex:none" class="garden-wrap">${personalGardenSVG(true)}</div>
      <div class="grow"><b class="small">My garden</b><p class="muted xs">${unlocked} of ${ITEM_ORDER.length} plants and pieces unlocked through ${st.n} seva</p><span class="pill" style="margin-top:8px">Open garden</span></div></button></div>`;
}
function installBanner() {
  if (standalone() || sessionStorage.getItem('hide-install')) return '';
  return `<div class="card" style="margin-bottom:16px;display:flex;gap:12px;align-items:center;padding:12px 14px">
    <img src="icons/icon-192.png" width="40" height="40" alt="" style="border-radius:10px">
    <div class="grow"><b class="small">Add to Home Screen</b><p class="muted xs">Full screen, offline, reminders</p></div>
    <button class="btn sm" data-act="install">Add</button></div>`;
}
function sevaCard(s) {
  const st = fillState(s); const mine = myRole(s); const wait = myWait(s); const nw = isNew(s);
  const pct = Math.min(100, Math.round(filled(s) / cap(s) * 100));
  return `<button class="card tap ${nw ? 'is-new' : ''}" data-open="seva:${s.id}">${nw ? '<span class="newtag">NEW</span>' : ''}
    <div class="row">${catIco(s.cat)}<div class="grow" style="padding-right:${nw ? 40 : 0}px"><h3>${esc(s.title)}</h3><p class="muted small">${relDay(s.start)} · ${fmtTime(s.start)}${s.recur ? ` · ${esc(s.recur.split(' · ')[0])}` : ''}</p></div></div>
    <div class="row" style="margin-top:12px;justify-content:space-between">
      ${mine ? `<span class="pill ok dot">You're in · ${esc(mine.name)}</span>` : wait ? `<span class="pill warn dot">Waitlist · ${esc(wait.name)}</span>` : `<span class="pill ${st.cls} ${st.cls === 'live' ? '' : 'dot'}">${st.t}</span>`}
      <span class="muted xs">${filled(s)}/${cap(s)} volunteers</span></div>
    <div class="bar ${pct >= 100 ? 'full' : ''}"><i style="width:${pct}%"></i></div>
  </button>`;
}
function eventCard(e) {
  const nw = isNew(e);
  return `<button class="card tap ${nw ? 'is-new' : ''}" data-open="event:${e.id}">${nw ? '<span class="newtag">NEW</span>' : ''}<div class="row">${tile(e.start)}<div class="grow" style="padding-right:${nw ? 40 : 0}px"><h3>${esc(e.title)}</h3>
    <p class="muted small">${relDay(e.start)} · ${fmtTime(e.start)}</p><p class="muted xs ellipsis" style="display:flex;gap:4px;align-items:center">${I.pin}${esc(e.place)}</p></div></div>
    <div class="row" style="margin-top:12px;justify-content:space-between">${e.rsvp === 'going' ? '<span class="pill ok dot">Going</span>' : e.rsvp === 'no' ? '<span class="pill">Not going</span>' : '<span class="pill dot" style="background:var(--t-event-bg);color:var(--t-event)">RSVP open</span>'}<span class="muted xs">${e.going.toLocaleString()} going</span></div></button>`;
}

// ----- Seva tab -----
function Seva() {
  const ns = newSeva(), ne = newEvents();
  const live = visibleSeva().filter(isLive);
  const rest = visibleSeva().filter((s) => isUpcoming(s) && !isNew(s)).sort((a, b) => new Date(a.start) - new Date(b.start));
  const evs = visibleEvents().filter((e) => new Date(e.start) > now());
  const evNew = evs.filter(isNew), evRest = evs.filter((e) => !isNew(e)).sort((a, b) => new Date(a.start) - new Date(b.start));
  const body = S.sevaView === 'seva'
    ? `${live.length ? `<div class="section-h" style="margin-top:18px"><h2>Happening now</h2></div><div class="stack">${live.map(liveCard).join('')}</div>` : ''}
       ${ns.length ? `<div class="section-h" style="margin-top:18px"><h2>New for you <span class="count">${ns.length}</span></h2></div><div class="stack">${ns.map(sevaCard).join('')}</div>` : ''}
       <div class="section-h" style="margin-top:18px"><h2>Upcoming</h2></div><div class="stack">${rest.map(sevaCard).join('') || '<div class="empty">No other open seva.</div>'}</div>`
    : `${evNew.length ? `<div class="section-h" style="margin-top:18px"><h2>New for you <span class="count">${evNew.length}</span></h2></div><div class="stack">${evNew.map(eventCard).join('')}</div>` : ''}
       <div class="section-h" style="margin-top:18px"><h2>Upcoming events</h2></div><div class="stack">${evRest.map(eventCard).join('')}</div>`;
  return `<div class="topbar"><h1>Seva</h1>${S.role !== 'member' ? `<button class="btn sm" data-act="create">+ New</button>` : topActions()}</div>
    <div class="seg" role="group" aria-label="Seva or events"><button data-view="seva" aria-pressed="${S.sevaView === 'seva'}">Seva${ns.length ? ` <span class="count">${ns.length}</span>` : ''}</button><button data-view="events" aria-pressed="${S.sevaView === 'events'}">Events${ne.length ? ` <span class="count">${ne.length}</span>` : ''}</button></div>
    ${body}`;
}

// ----- Garden tab -----
function Garden() {
  const st = sevaStats();
  const unlocked = ITEM_ORDER.filter(isUnlocked);
  const nextLocked = ITEM_ORDER.filter((id) => !isUnlocked(id));
  const mine = S.gardenView === 'mine';
  return `<div class="topbar"><h1>Garden</h1>${topActions()}</div>
    <div class="seg" role="group" aria-label="Which garden"><button data-gview="mine" aria-pressed="${mine}">My garden</button><button data-gview="group" aria-pressed="${!mine}">${esc(myGroup().city)} garden</button></div>
    ${mine ? `
      <p class="muted small" style="margin:12px 2px">${gardenEdit ? 'Pick something below, then tap a square to place it.' : 'Tap any plant to see it up close. Every seva you do unlocks something new.'}</p>
      <div class="garden-wrap ${gardenEdit ? 'editing' : ''}" id="pgarden">${personalGardenSVG(false)}</div>
      ${gardenEdit ? `
        <div class="tray" style="margin-top:12px" role="toolbar" aria-label="Garden pieces">
          ${ITEM_ORDER.map((id) => { const ok = isUnlocked(id); return `<button class="titem ${ok ? '' : 'locked'}" data-tool="${id}" aria-pressed="${gardenTool === id}" aria-label="${itemDef(id).name}${ok ? '' : ', locked'}">${ok ? '' : '<span class="lock">🔒</span>'}${thumb(id)}${itemDef(id).name.split(' ')[0]}</button>`; }).join('')}
          <button class="titem" data-tool="erase" aria-pressed="${gardenTool === 'erase'}">${I.erase}Remove</button>
        </div>
        <button class="btn block" style="margin-top:8px" data-act="garden-done">Done</button>`
      : `<div class="btn-row" style="margin-top:12px"><button class="btn" data-act="garden-edit">${I.edit} Design</button><button class="btn ghost" data-act="walk">${I.cube} Walk in 3D</button></div>`}
      <div class="section"><div class="section-h"><h2>Unlocks</h2><span class="muted xs">${unlocked.length} of ${ITEM_ORDER.length}</span></div>
        <div class="card unlock-list" style="padding:4px 16px">
          ${nextLocked.slice(0, 3).map((id) => `<div class="list-row">${thumb(id, 'thumb')}<div class="grow"><b class="small">${itemDef(id).name}</b><p class="muted xs">🔒 ${unlockText(itemDef(id).unlock)}</p></div></div>`).join('')}
          ${unlocked.slice(-3).reverse().map((id) => `<div class="list-row">${thumb(id, 'thumb')}<div class="grow"><b class="small">${itemDef(id).name}</b><p class="muted xs">Unlocked · ${unlockText(itemDef(id).unlock)}</p></div><span class="pill ok">Yours</span></div>`).join('')}
        </div>
        <button class="btn soft block" style="margin-top:10px" data-act="sim-seva">Demo: pretend I finished a seva</button>
        <p class="muted xs" style="margin-top:8px">Your garden is private and never wilts. No streaks, no rankings.</p></div>`
    : `
      <p class="muted small" style="margin:12px 2px">Grows when ${esc(myGroup().name)} completes seva together.</p>
      <div class="garden-wrap">${groupGardenSVG(S.groupGardenLevel)}</div>
      <div class="card" style="margin-top:12px"><b class="small">Level ${S.groupGardenLevel} of 8</b><div class="bar"><i style="width:${S.groupGardenLevel / 8 * 100}%"></i></div><p class="muted xs" style="margin-top:8px">Every verified, completed seva by your group helps it grow.</p></div>`}`;
}
const GW = 6;
const iso = (gx, gy) => [180 + (gx - gy) * 28, 40 + (gx + gy) * 16];
function personalGardenSVG(still) {
  const g = S.garden; let tiles = '', items = [];
  for (let y = 0; y < GW; y++) for (let x = 0; x < GW; x++) {
    const [cx, cy] = iso(x, y); const k = `${x},${y}`; const t = g.tiles[k] || 'grass';
    const fill = t === 'path' ? '#E2D2B4' : (x + y) % 2 ? '#A6C9A5' : '#9BC19A';
    tiles += `<path class="tile" data-cell="${k}" d="M${cx} ${cy - 16}L${cx + 28} ${cy}L${cx} ${cy + 16}L${cx - 28} ${cy}Z" fill="${fill}" stroke="${t === 'path' ? '#CDB892' : '#89B288'}" stroke-width=".7"/>`;
    if (t === 'path') tiles += `<ellipse cx="${cx - 7}" cy="${cy - 2}" rx="5" ry="2.4" fill="#CDB892" pointer-events="none"/><ellipse cx="${cx + 8}" cy="${cy + 3}" rx="4" ry="2" fill="#CDB892" pointer-events="none"/>`;
    const it = g.items[k];
    if (it && GI[it]) items.push({ d: x + y, s: `<g class="gitem" data-cell="${k}" transform="translate(${cx} ${cy + 3})" style="cursor:pointer"><ellipse cx="0" cy="1" rx="16" ry="5" fill="#000" opacity=".08"/>${still ? GI[it].draw().replace(/class="(sway|glow)"/g, '') : GI[it].draw()}</g>` });
  }
  // edge depth
  const [lx, ly] = iso(0, GW - 1), [rx, ry] = iso(GW - 1, 0), [bx, by] = iso(GW - 1, GW - 1);
  const edge = `<path d="M${lx - 28} ${ly}L${bx} ${by + 16}L${bx} ${by + 26}L${lx - 28} ${ly + 10}Z" fill="#8A6A48"/><path d="M${bx} ${by + 16}L${rx + 28} ${ry}L${rx + 28} ${ry + 10}L${bx} ${by + 26}Z" fill="#6E5236"/>`;
  items.sort((a, b) => a.d - b.d);
  return `<svg viewBox="0 -30 360 270" role="img" aria-label="Your personal garden">${edge}${tiles}${items.map((i) => i.s).join('')}</svg>`;
}
function groupGardenSVG(level, still) {
  const isoG = (gx, gy) => [160 + (gx - gy) * 26, 52 + (gx + gy) * 15];
  let tiles = '';
  for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) {
    const [cx, cy] = isoG(x, y); const path = level >= 2 && (x === 2 || (level >= 6 && y === 2));
    tiles += `<path d="M${cx} ${cy - 15}L${cx + 26} ${cy}L${cx} ${cy + 15}L${cx - 26} ${cy}Z" fill="${path ? '#E6D7BC' : (x + y) % 2 ? '#A9CBA8' : '#9EC29D'}" stroke="#8DB48C" stroke-width=".6"/>`;
  }
  const put = (id, gx, gy, sc = 1) => { const [x, y] = isoG(gx, gy); const d = GI[id].draw(); return `<g transform="translate(${x} ${y}) scale(${sc})">${still ? d.replace(/class="(sway|glow)"/g, '') : d}</g>`; };
  const it = [];
  if (level >= 1) it.push(put('marigold', 0, 1, .8), put('marigold', 1, 0, .8));
  if (level >= 3) it.push(put('rose', 4, 1, .8), put('sunflower', 3, 4, .8));
  if (level >= 4) it.push(put('mango', 0, 0, .9));
  if (level >= 5) it.push(put('lantern', 3, 2, .8), put('lantern', 1, 2, .8));
  if (level >= 6) it.push(put('banyan', 4, 4, .8));
  if (level >= 7) it.push(put('pond', 4, 0, .8), put('bench', 1, 4, .8));
  if (level >= 8) it.push(put('peacock', 2, 3, .8));
  return `<svg viewBox="0 -10 320 200" role="img" aria-label="Community garden, level ${level} of 8">${tiles}${it.join('')}</svg>`;
}

// ----- Community -----
function Community() {
  const types = [['all', 'All', null], ['seva', 'Seva', 'var(--t-seva)'], ['event', 'Events', 'var(--t-event)'], ['alert', 'Alerts', 'var(--t-alert)']];
  const posts = S.posts
    .filter((p) => S.feed === 'local' ? (p.scope === 'local' || p.city === myGroup().city) : true)
    .filter((p) => S.feedType === 'all' || p.type === S.feedType)
    .sort((a, b) => (b.type === 'alert') - (a.type === 'alert') || new Date(b.date) - new Date(a.date));
  return `<div class="topbar"><h1>Community</h1>${topActions()}</div>
    <div class="seg" role="group" aria-label="Feed"><button data-feed="local" aria-pressed="${S.feed === 'local'}">${esc(myGroup().city)}</button><button data-feed="world" aria-pressed="${S.feed === 'world'}">Worldwide</button></div>
    <div class="chips" style="margin-top:12px" role="group" aria-label="Story type">${types.map(([v, l, c]) => `<button class="chip" data-ftype="${v}" aria-pressed="${S.feedType === v}">${c ? `<i class="sw" style="background:${c}"></i>` : ''}${l}</button>`).join('')}</div>
    <div class="stack" style="margin-top:6px">${posts.map(postCard).join('') || '<div class="empty">No stories here yet.</div>'}</div>
    <p class="muted xs" style="text-align:center;margin-top:16px">Only seva successes, events and important alerts appear here. No comments, no rankings.</p>`;
}
const TYPE_LABEL = { seva: 'Seva success', event: 'Event', alert: 'Important alert' };
function postCard(p) {
  const R = [['g', '🙏', 'Gratitude'], ['a', '💚', 'Appreciation'], ['c', '👏', 'Applause']];
  const cls = p.type === 'alert' ? 'alert-post' : p.type;
  return `<article class="card post ${cls}">
    <div class="head"><div class="art">${CAT[p.cat]?.svg || ''}</div><div class="grow"><span class="type">${TYPE_LABEL[p.type]}</span><p class="muted xs">${esc(p.city)} · ${relDay(p.date)}${p.count ? ` · ${p.count} volunteers` : ''}</p></div></div>
    <div class="body"><h3>${esc(p.title)}</h3><p class="small muted" style="margin-top:4px">${esc(p.text)}</p>
    ${p.link ? `<button class="btn sm soft" style="margin-top:10px" data-open="${p.link}">${p.type === 'event' ? 'View event' : 'View details'}</button>` : ''}
    ${p.type !== 'alert' ? `<div class="reacts">${R.map(([k, e, l]) => `<button class="react" data-react="${p.id}:${k}" aria-pressed="${p.mine === k}" aria-label="${l}, ${p.r[k]}"><span aria-hidden="true">${e}</span>${p.r[k]}</button>`).join('')}</div>` : ''}
    </div></article>`;
}

// ----- Profile -----
function Profile() {
  const all = ['langar', 'cleanup', 'tree', 'education', 'event', 'milestone'];
  const got = new Set(S.passport.map((p) => p.cat));
  return `<div class="topbar"><div class="row"><button class="iconbtn" data-tab="home" aria-label="Back" style="transform:rotate(180deg)">${I.chev}</button><div><h1 style="font-size:20px">${esc(ME())}</h1><p class="muted small">${esc(myGroup().name)} · ${S.role === 'member' ? 'Member' : S.role === 'lead' ? 'Team Lead' : 'Main Admin'}</p></div></div></div>
    <div class="card row"><div class="grow"><b class="small">My monthly intention</b><p class="muted xs">Seva ${S.intention}× a month. Private — sets your green ring.</p></div><button class="btn sm ghost" data-act="intention">Change</button></div>
    <div class="section"><div class="section-h"><h2>Seva Passport</h2><span class="muted xs">${S.passport.length} stamps</span></div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">${all.map((c) => `<div class="card" style="text-align:center;padding:12px;${got.has(c) ? 'border-color:var(--accent);background:var(--tint)' : 'opacity:.5;border-style:dashed'}"><div style="width:36px;margin:0 auto">${CAT[c].svg}</div><p class="xs" style="font-weight:600;margin-top:4px">${CAT[c].label}</p></div>`).join('')}</div></div>
    <div class="section"><div class="section-h"><h2>Thank-you notes</h2></div>
      <div class="stack">${S.thanks.map((t) => `<div class="card" style="background:var(--sand)"><p class="small">“${esc(t.text)}”</p><p class="muted xs" style="margin-top:6px">${esc(t.from)} · ${relDay(t.date)}</p></div>`).join('')}</div></div>
    <div class="section"><div class="section-h"><h2>Appearance</h2></div>
      <div class="card">
        <div class="seg" role="group" aria-label="Light or dark">${[['auto', 'System'], ['light', 'Light'], ['dark', 'Dark']].map(([v, l]) => `<button data-setmode="${v}" aria-pressed="${S.mode === v}">${l}</button>`).join('')}</div>
        <p class="small" style="font-weight:600;margin:16px 0 8px">Colour theme</p>
        <div class="swatches">${ACCENTS.map(([id, l, cs]) => `<button class="swatch" data-setaccent="${id}" aria-pressed="${S.accent === id}"><span class="chipset">${cs.map((c) => `<i style="background:${c}"></i>`).join('')}</span>${l}</button>`).join('')}</div>
      </div></div>
    <div class="section"><div class="section-h"><h2>Settings</h2></div>
      <div class="card" style="padding:4px 16px">
        <div class="list-row"><div class="grow"><b class="small">Reminders</b><p class="muted xs">${standalone() ? 'Push works in the installed app' : 'Install to Home Screen for push'}</p></div><button class="btn sm soft" data-act="notify-test">Test</button></div>
        <div class="list-row"><div class="grow"><b class="small">Calendar</b><p class="muted xs">Add all your commitments</p></div><button class="btn sm soft" data-act="cal-all">Add</button></div>
        <div class="list-row"><div class="grow"><b class="small">Primary group</b></div>
          <select class="in" style="width:auto;min-height:40px" id="group-select">${S.groups.map((g) => `<option value="${g.id}" ${g.id === S.me.group ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}</select></div>
        <div class="list-row"><div class="grow"><b class="small">Reset demo</b><p class="muted xs">Start over with fresh sample data</p></div><button class="btn sm danger" data-act="reset">Reset</button></div>
      </div></div>
    <p class="muted xs" style="text-align:center;margin-top:24px">Namdhari Seva &amp; Community · demo v2 · data stays on this device</p>`;
}

// ----- Lead -----
function needsAttention() {
  const items = [];
  visibleSeva().forEach((s) => {
    if (s.status === 'pending') items.push({ level: 'warn', title: `Close “${s.title}”`, text: 'Attendance and feedback pending', open: `close:${s.id}`, id: 'na-' + s.id });
    else if (isUpcoming(s)) s.roles.forEach((r) => { const left = r.cap - r.filled.length; if (left > 0 && (new Date(s.start) - now()) < 5 * DAY) items.push({ level: left / r.cap > 0.4 && (new Date(s.start) - now()) < 2 * DAY ? 'urgent' : 'warn', title: `${left} ${r.name.toLowerCase()} needed`, text: `${s.title} · ${relDay(s.start)}`, open: `seva:${s.id}`, id: `na-${s.id}-${r.id}` }); });
  });
  return items.sort((a, b) => (b.level === 'urgent') - (a.level === 'urgent'));
}
function LeadHome() {
  const att = needsAttention();
  const open = visibleSeva().filter(isUpcoming);
  const slots = open.reduce((n, s) => n + cap(s) - filled(s), 0);
  const uniq = new Set(); visibleSeva().forEach((s) => s.roles.forEach((r) => r.filled.forEach((p) => uniq.add(p))));
  const live = visibleSeva().filter(isLive);
  return `<div class="topbar"><div><p class="eyebrow">Team Lead · ${esc(myGroup().name)}</p><h1>Today</h1></div>${topActions()}</div>
    <div class="kpis"><div class="kpi"><b>${open.length}</b><span>Open seva</span></div><div class="kpi"><b>${slots}</b><span>Open slots</span></div>
      <div class="kpi"><b>${uniq.size}</b><span>Unique volunteers</span></div><div class="kpi"><b>${visibleSeva().filter((s) => s.status === 'pending').length}</b><span>Awaiting close</span></div></div>
    ${live.length ? `<div class="section"><div class="section-h"><h2>Happening now</h2></div><div class="stack">${live.map(liveCard).join('')}</div></div>` : ''}
    <div class="section"><div class="section-h"><h2>Needs attention</h2></div>
      ${att.length ? att.map((a) => `<button class="alert ${a.level}" data-open="${a.open}">${a.level === 'urgent' ? I.warn : I.info}<div class="grow"><span class="lvl">${a.level === 'urgent' ? 'Urgent' : 'To do'}</span><b class="small" style="display:block">${esc(a.title)}</b><span class="muted xs">${esc(a.text)}</span></div>${I.chev}</button>`).join('') : '<div class="card muted small">All clear.</div>'}</div>
    <div class="section"><div class="section-h"><h2>This week</h2><button class="link" data-act="create">+ New seva</button></div><div class="stack">${open.map(sevaCard).join('')}</div></div>`;
}
function Manage() {
  if (S.role === 'admin') return AdminManage();
  const pend = visibleSeva().filter((s) => s.status === 'pending');
  const up = visibleSeva().filter((s) => isUpcoming(s) || isLive(s)).sort((a, b) => new Date(a.start) - new Date(b.start));
  return `<div class="topbar"><h1>Manage</h1><button class="btn sm" data-act="create">+ New seva</button></div>
    <div class="section-h"><h2>Check-in &amp; close</h2></div>
    <div class="stack">${pend.map((s) => `<div class="card"><div class="row">${catIco(s.cat)}<div class="grow"><h3>${esc(s.title)}</h3><p class="muted small">${relDay(s.start)} · ${filled(s)} joined</p></div><span class="pill warn dot">Close</span></div>
      <div class="btn-row" style="margin-top:12px"><button class="btn sm ghost" data-act="roster" data-id="${s.id}">${I.check} Attendance</button><button class="btn sm" data-act="complete" data-id="${s.id}">Complete</button></div></div>`).join('') || '<div class="card muted small">Nothing waiting to close.</div>'}
    ${up[0] ? `<div class="card"><div class="row"><div class="grow"><b class="small">Check-in QR · ${esc(up[0].title)}</b><p class="muted xs">Members scan at the venue. Works offline.</p></div><button class="btn sm soft" data-act="qr" data-id="${up[0].id}">${I.qr} Show</button></div></div>` : ''}</div>
    <div class="section"><div class="section-h"><h2>Upcoming</h2></div><div class="stack">${up.map(sevaCard).join('')}</div></div>
    <div class="section"><div class="section-h"><h2>Group tools</h2></div><div class="card" style="padding:4px 16px">
      <button class="list-row" data-act="invite"><div class="ico">${I.qr}</div><div class="grow"><b class="small">Invite members</b><p class="muted xs">Group QR and WhatsApp link</p></div>${I.chev}</button>
      <button class="list-row" data-act="post-alert"><div class="ico">${CAT.alert.svg}</div><div class="grow"><b class="small">Post an important alert</b><p class="muted xs">Venue change, cancellation, urgent need</p></div>${I.chev}</button>
    </div></div>`;
}

// ----- Admin -----
function AdminHome() {
  const reg = S.adminRegion;
  const sv = S.seva.filter((s) => reg === 'all' || S.groups.find((g) => g.id === s.group)?.country === reg);
  const parts = sv.reduce((n, s) => n + filled(s), 0);
  const uniq = new Set(); sv.forEach((s) => s.roles.forEach((r) => r.filled.forEach((p) => uniq.add(p))));
  const fill = Math.round(parts / Math.max(1, sv.reduce((n, s) => n + cap(s), 0)) * 100);
  const weeks = [18, 24, 21, 30, 27, 35, 33, 41]; const max = Math.max(...weeks);
  return `<div class="topbar"><div><p class="eyebrow">Main Admin · Worldwide</p><h1>Global pulse</h1></div>${topActions()}</div>
    <div class="chips" role="group" aria-label="Region filter">${[['all', 'All regions'], ['India', 'India'], ['UK', 'UK']].map(([v, l]) => `<button class="chip" data-region="${v}" aria-pressed="${reg === v}">${l}</button>`).join('')}</div>
    <div class="kpis" style="margin-top:8px"><div class="kpi"><b>${fill}%</b><span>Slot fill rate</span></div><div class="kpi"><b>9%</b><span>No-show rate</span></div>
      <div class="kpi"><b>${uniq.size}</b><span>Unique volunteers</span></div><div class="kpi"><b>${parts}</b><span>Participations</span></div>
      <div class="kpi wide"><b>86%</b><span>Seva closed within 48 hours</span></div></div>
    <div class="section"><div class="section-h"><h2>Participations per week</h2></div>
      <div class="card"><svg viewBox="0 -12 320 162" role="img" aria-label="Participations per week rose from 18 to 41 over 8 weeks" style="width:100%;height:auto">
        ${weeks.map((w, i) => { const h = w / max * 110; return `<rect x="${12 + i * 38}" y="${122 - h}" width="26" height="${h}" rx="6" fill="var(--accent)" opacity="${i === weeks.length - 1 ? 1 : .5}"/><text x="${25 + i * 38}" y="140" text-anchor="middle" font-size="10" fill="var(--muted)">W${i + 1}</text>`; }).join('')}
        <text x="${25 + 7 * 38}" y="4" text-anchor="middle" font-size="11" font-weight="700" fill="var(--ink)">41</text></svg>
        <p class="muted xs">Up 24% on last week: 18 → 41 participations over 8 weeks.</p></div></div>
    <div class="section"><div class="section-h"><h2>Groups</h2></div><div class="card" style="padding:4px 16px">${S.groups.map((g) => { const ss = S.seva.filter((s) => s.group === g.id); const f = ss.reduce((n, s) => n + filled(s), 0), c = ss.reduce((n, s) => n + cap(s), 0); const p = c ? Math.round(f / c * 100) : 0; return `<div class="list-row"><div class="grow"><b class="small">${esc(g.name)}</b><p class="muted xs">${esc(g.city)}, ${esc(g.country)} · ${ss.length} seva</p><div class="bar"><i style="width:${p}%"></i></div></div><b class="small">${p}%</b></div>`; }).join('')}</div></div>`;
}
function AdminManage() {
  const reviews = S.posts.filter((p) => p.pendingWorld);
  return `<div class="topbar"><h1>Manage</h1></div>
    <div class="section-h"><h2>Review queue</h2></div>
    <div class="stack">${reviews.map((p) => `<div class="card"><p class="muted xs">Promote to Worldwide?</p><h3 style="margin-top:4px">${esc(p.title)}</h3><p class="muted small">${esc(p.text)}</p>
      <div class="btn-row" style="margin-top:12px"><button class="btn sm ghost" data-act="reject" data-id="${p.id}">Keep local</button><button class="btn sm" data-act="approve" data-id="${p.id}">${I.globe} Approve</button></div></div>`).join('') || '<div class="card muted small">No stories waiting. When a lead completes a seva, its story can be promoted here.</div>'}</div>
    <div class="section"><div class="section-h"><h2>Regions &amp; groups</h2></div><div class="card" style="padding:4px 16px">${S.groups.map((g) => `<div class="list-row"><div class="avatar">${initials(g.city)}</div><div class="grow"><b class="small">${esc(g.name)}</b><p class="muted xs">${esc(g.country)} › ${esc(g.city)} · 2 leads</p></div></div>`).join('')}</div></div>
    <div class="section"><button class="btn ghost block" data-act="csv">Download participation CSV</button></div>`;
}

// ---------- Sheets ----------
function openSheet(html) {
  $('#sheet-root').innerHTML = `<div class="scrim" data-act="close-sheet"></div><div class="sheet" role="dialog" aria-modal="true"><div class="grabber"></div>${html}</div>`;
  document.body.style.overflow = 'hidden';
}
function closeSheet() { $('#sheet-root').innerHTML = ''; document.body.style.overflow = ''; }
const sheetHead = (title, sub) => `<div class="sheet-h"><div>${sub ? `<p class="eyebrow">${sub}</p>` : ''}<h2>${title}</h2></div><button class="iconbtn" data-act="close-sheet" aria-label="Close">${I.close}</button></div>`;

function sevaSheet(id, keepScroll) {
  const s = S.seva.find((x) => x.id === id); if (!s) return;
  const wasNew = isNew(s); markSeen(id);
  const mine = myRole(s), wait = myWait(s), st = fillState(s);
  const y = keepScroll ? $('.sheet')?.scrollTop : 0;
  openSheet(`${sheetHead(esc(s.title), `${CAT[s.cat].label}${wasNew ? ' · <span class="newtag">NEW</span>' : ''}`)}
    <div class="card">
      <p class="small" style="display:flex;gap:8px;align-items:center">${I.clock}${relDay(s.start)} · ${fmtTime(s.start)} – ${fmtTime(endOf(s).toISOString())} ${isLive(s) ? '<span class="pill live">Live</span>' : ''}</p>
      <p class="small" style="display:flex;gap:8px;align-items:center;margin-top:6px">${I.pin}${esc(s.place)}</p>
      ${s.recur ? `<p class="small" style="display:flex;gap:8px;align-items:center;margin-top:6px">${I.repeat}${esc(s.recur)}</p>` : ''}
      <p class="muted small" style="margin-top:12px">${esc(s.purpose)}</p>
    </div>
    <div class="section" style="margin-top:16px"><div class="section-h"><h2>Roles</h2><span class="pill ${st.cls} ${st.cls === 'live' ? '' : 'dot'}">${st.t}</span></div>
      <div class="card">${s.roles.map((r) => {
        const left = r.cap - r.filled.length, inThis = r.filled.includes(ME()), w = r.wait.includes(ME());
        let btn;
        if (inThis) btn = `<span class="pill ok">You</span>`;
        else if (w) btn = `<span class="pill warn">#${r.wait.indexOf(ME()) + 1} waitlist</span>`;
        else if (mine || wait || S.me.minor || s.status !== 'open') btn = '';
        else if (left > 0) btn = `<button class="btn sm" data-act="join" data-id="${s.id}" data-role="${r.id}">Join</button>`;
        else btn = `<button class="btn sm ghost" data-act="wait" data-id="${s.id}" data-role="${r.id}">Waitlist</button>`;
        return `<div class="slot"><div class="grow"><b class="small">${esc(r.name)}</b><p class="muted xs">${r.filled.length} of ${r.cap} filled${r.wait.length ? ` · ${r.wait.length} waiting` : ''}</p><div class="bar ${left <= 0 ? 'full' : ''}"><i style="width:${Math.round(r.filled.length / r.cap * 100)}%"></i></div></div>${btn}</div>`;
      }).join('')}</div>
      <p class="muted xs" style="margin-top:8px">If someone drops out, the slot goes to the waitlist automatically.</p></div>
    <div class="btn-row" style="margin-top:16px"><button class="btn ghost" data-act="cal" data-id="${s.id}">${I.cal} Calendar</button><button class="btn ghost" data-act="wa" data-id="${s.id}">${I.wa} WhatsApp</button></div>
    ${mine || wait ? `<button class="btn danger block" style="margin-top:8px" data-act="drop" data-id="${s.id}">Can't make it</button>` : ''}
    ${S.role !== 'member' ? `<div class="divider"></div><div class="btn-row"><button class="btn sm soft" data-act="roster" data-id="${s.id}">${I.check} Roster</button><button class="btn sm soft" data-act="qr" data-id="${s.id}">${I.qr} QR</button><button class="btn sm soft" data-act="nudge" data-id="${s.id}">Nudge</button></div>` : ''}`);
  if (keepScroll) { $('.sheet').style.animation = 'none'; $('.sheet').scrollTop = y; }
  if (wasNew) rerender();
}
function eventSheet(id, keepScroll) {
  const e = S.events.find((x) => x.id === id); if (!e) return;
  const wasNew = isNew(e); markSeen(id);
  const linked = e.linked && S.seva.find((s) => s.id === e.linked);
  const days = Math.max(0, Math.ceil((new Date(e.start) - now()) / DAY));
  openSheet(`${sheetHead(esc(e.title), `Event${wasNew ? ' · <span class="newtag">NEW</span>' : ''}`)}
    <div class="card"><div class="row">${tile(e.start)}<div class="grow"><b>${relDay(e.start)} · ${fmtTime(e.start)}</b><p class="muted small">${esc(e.place)}</p><p class="muted xs">Hosted by ${esc(e.host)}</p></div></div>
      <div class="divider"></div><p class="small"><b>Agenda</b></p><p class="muted small">${esc(e.agenda)}</p></div>
    <div class="card" style="margin-top:12px;text-align:center;background:var(--t-event-bg);border-color:transparent"><b style="font-size:28px;color:var(--t-event)">${days}</b><p class="muted small">day${days === 1 ? '' : 's'} to go · ${e.going.toLocaleString()} going${e.cap ? ` of ${e.cap}` : ''}</p></div>
    ${linked ? `<button class="card tap" style="margin-top:12px" data-open="seva:${linked.id}"><div class="row">${catIco(linked.cat)}<div class="grow"><b class="small">This event needs volunteers</b><p class="muted xs">${esc(linked.title)} · ${cap(linked) - filled(linked)} slots open</p></div>${I.chev}</div></button>` : ''}
    <div class="btn-row" style="margin-top:16px"><button class="btn ghost" data-act="cal-e" data-id="${e.id}">${I.cal} Calendar</button><button class="btn ghost" data-act="wa-e" data-id="${e.id}">${I.wa} Share</button></div>
    <div class="sticky-cta"><div class="seg"><button data-act="rsvp" data-id="${e.id}" data-v="going" aria-pressed="${e.rsvp === 'going'}">Going</button><button data-act="rsvp" data-id="${e.id}" data-v="no" aria-pressed="${e.rsvp === 'no'}">Can't go</button></div></div>`);
  if (keepScroll) $('.sheet').style.animation = 'none';
  if (wasNew) rerender();
}
function rosterSheet(id) {
  const s = S.seva.find((x) => x.id === id);
  const people = s.roles.flatMap((r) => r.filled.map((p) => ({ p, r: r.name })));
  const A = S.attendance[id] = S.attendance[id] || {};
  const count = Object.values(A).filter(Boolean).length;
  const y = $('.sheet')?.scrollTop || 0;
  openSheet(`${sheetHead('Attendance', esc(s.title))}
    <p class="muted small" style="margin-bottom:12px">Tap who actually came. Joined ≠ attended. Saved on this phone; syncs when online.</p>
    ${people.map(({ p, r }) => `<button class="check" data-act="mark" data-id="${id}" data-p="${esc(p)}" aria-pressed="${!!A[p]}"><span class="box">${A[p] ? I.check : ''}</span><div class="avatar">${initials(p)}</div><div class="grow"><b class="small">${esc(p)}</b><p class="muted xs">${esc(r)}</p></div></button>`).join('')}
    <div class="sticky-cta"><button class="btn block" data-act="close-sheet">${count} of ${people.length} checked in · Done</button></div>`);
  $('.sheet').style.animation = 'none'; $('.sheet').scrollTop = y;
}
const WENT = { langar: ['On time', 'Enough food', 'Great teamwork', 'Clean kitchen'], cleanup: ['Area cleared', 'Great teamwork', 'Good turnout', 'Safe'], tree: ['All planted', 'Great teamwork', 'Good turnout'], education: ['Kids engaged', 'Good materials', 'Great teamwork'] };
const ISSUES = ['Volunteers short', 'Supplies', 'Timing', 'Transport', 'Weather', 'Coordination', 'Other'];
let form = {};
function completeSheet(id) {
  const s = S.seva.find((x) => x.id === id);
  form = { id, outcome: 'Completed', count: Object.values(S.attendance[id] || {}).filter(Boolean).length || filled(s), went: [], issues: [], next: '' };
  drawComplete();
}
function drawComplete() {
  const s = S.seva.find((x) => x.id === form.id); const tags = WENT[s.cat] || WENT.cleanup;
  openSheet(`${sheetHead('Complete seva', esc(s.title))}
    <p class="muted small">Takes under a minute.</p>
    <label class="f">Outcome</label><div class="seg">${['Completed', 'Partial', 'Cancelled'].map((o) => `<button data-form="outcome" data-v="${o}" aria-pressed="${form.outcome === o}">${o}</button>`).join('')}</div>
    <label class="f" for="f-count">Attended</label>
    <div class="row"><button class="iconbtn" data-form="dec" aria-label="Fewer">−</button><input class="in" id="f-count" type="number" inputmode="numeric" value="${form.count}" style="text-align:center;font-weight:700"><button class="iconbtn" data-form="inc" aria-label="More">+</button></div>
    <label class="f">What went well</label><div class="tagset">${tags.map((t) => `<button class="chip" data-form="went" data-v="${t}" aria-pressed="${form.went.includes(t)}">${t}</button>`).join('')}</div>
    <label class="f">Any issues?</label><div class="tagset">${ISSUES.map((t) => `<button class="chip" data-form="issues" data-v="${t}" aria-pressed="${form.issues.includes(t)}">${t}</button>`).join('')}</div>
    <label class="f" for="f-next">Next action (optional)</label><input class="in" id="f-next" placeholder="e.g. Confirm stock by Friday" value="${esc(form.next)}">
    <label class="f">Auto recap</label><div class="recap" id="recap">${esc(recapText(s))}</div>
    <div class="sticky-cta"><button class="btn block" data-act="submit-complete">Complete &amp; post success story</button></div>`);
}
function recapText(s) {
  const g = S.groups.find((x) => x.id === s.group);
  let r = `${g.city} • ${CAT[s.cat].label} seva • ${form.count} attended • ${form.outcome}`;
  if (form.went.length) r += ` • Went well: ${form.went.join(', ').toLowerCase()}`;
  if (form.issues.length) r += ` • Challenge: ${form.issues.join(', ').toLowerCase()}`;
  if (form.next) r += ` • Next: ${form.next}`;
  return r;
}
function createSheet() {
  const local = new Date(Date.now() + 3 * DAY - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 13) + ':00';
  openSheet(`${sheetHead('New seva', esc(myGroup().name))}
    <label class="f">Template</label>
    <div class="chips">${['langar', 'cleanup', 'tree', 'education'].map((c, i) => `<button class="chip" data-tpl="${c}" aria-pressed="${i === 0}">${CAT[c].label}</button>`).join('')}</div>
    <label class="f" for="c-title">Title</label><input class="in" id="c-title" value="Sunday Langar Seva">
    <label class="f" for="c-date">When</label><input class="in" id="c-date" type="datetime-local" value="${local}">
    <label class="f" for="c-place">Where</label><input class="in" id="c-place" value="Namdhari Gurdwara, Karol Bagh">
    <label class="f" for="c-recur">Repeats</label><select class="in" id="c-recur"><option value="">Does not repeat</option><option selected>Weekly · Sundays</option><option>Monthly · 1st Sunday</option></select>
    <label class="f">Roles</label>
    <div class="card"><div class="slot"><b class="small grow">Cooks</b><span class="muted small">6 people</span></div><div class="slot"><b class="small grow">Servers</b><span class="muted small">8 people</span></div><div class="slot"><b class="small grow">Drivers</b><span class="muted small">2 people</span></div></div>
    <div class="notice" style="background:var(--tint);margin-top:16px">${I.info.replace('<svg', '<svg style="color:var(--accent)"')}<p class="small"><b>Visible to:</b> ${esc(myGroup().name)} members (about 140 people). They'll see it marked NEW.</p></div>
    <div class="sticky-cta"><button class="btn block" data-act="publish">Publish &amp; open for volunteers</button></div>`);
}
function alertSheet() {
  openSheet(`${sheetHead('Post an important alert', esc(myGroup().name))}
    <p class="muted small">Use only for things members must know: venue changes, cancellations, urgent needs. It's shown in orange in the feed and at the top of Home.</p>
    <label class="f">Type</label><div class="seg" id="al-level"><button data-allevel="urgent" aria-pressed="true">Urgent</button><button data-allevel="warn" aria-pressed="false">Change</button></div>
    <label class="f" for="al-title">Headline</label><input class="in" id="al-title" value="Langar start moved to 10:00 AM">
    <label class="f" for="al-text">Detail</label><input class="in" id="al-text" value="Sunday Langar Seva · please arrive by 9:45">
    <div class="sticky-cta"><button class="btn block" data-act="publish-alert">Post alert</button></div>`);
}
function qrSheet(id) {
  const s = S.seva.find((x) => x.id === id);
  let cells = ''; let sd = id.charCodeAt(1) * 9301 + Math.floor(Date.now() / 30000);
  const rnd = () => (sd = (sd * 9301 + 49297) % 233280) / 233280;
  for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++) {
    const finder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
    if (finder) { const fx = x > 13 ? x - 14 : x, fy = y > 13 ? y - 14 : y; if (fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx > 1 && fx < 5 && fy > 1 && fy < 5)) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`; }
    else if (rnd() > 0.52) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
  }
  openSheet(`${sheetHead('Check-in QR', esc(s.title))}
    <div class="card" style="text-align:center;background:#fff"><svg viewBox="-1 -1 23 23" width="230" height="230" fill="#1F2E28" aria-label="Check-in QR code (demo)">${cells}</svg>
    <p class="small" style="color:#1F2E28;margin-top:8px"><b>Refreshes every 30 seconds</b></p><p class="xs" style="color:#63716A">Members scan to check in. Works without signal.</p></div>
    <button class="btn block soft" style="margin-top:16px" data-act="roster" data-id="${id}">Use the tap roster instead</button>`);
}
const LVL = { urgent: ['var(--urgent-bg)', 'var(--urgent)', I.warn], warn: ['var(--warn-bg)', 'var(--warn)', I.info], new: ['var(--tint)', 'var(--accent)', I.seva], info: ['var(--surface2)', 'var(--muted)', I.bell] };
function notifSheet() {
  const list = S.notifs.slice();
  S.notifs.forEach((n) => n.read = true); save();
  openSheet(`${sheetHead('Notifications')}
    <div class="card" style="padding:4px 16px">${list.map((n) => { const [bg, fg, ic] = LVL[n.level] || LVL.info; return `<button class="list-row" data-open="${n.open}"><div class="ico" style="background:${bg};color:${fg}">${ic}</div><div class="grow"><b class="small">${esc(n.t)}</b><p class="muted xs">${relDay(n.d)} · ${fmtTime(n.d)}</p></div>${n.read ? '' : '<span class="newtag" style="position:static">NEW</span>'}</button>`; }).join('')}</div>
    <p class="muted xs" style="margin-top:12px">Red = urgent, amber = something changed, green = new seva.</p>`);
  rerender();
}
function installSheet() {
  if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt.userChoice.finally(() => { deferredPrompt = null; }); return; }
  const steps = isIOS() ? ['Open this page in <b>Safari</b>.', `Tap <b>Share</b> ${I.share} in the toolbar.`, 'Tap <b>Add to Home Screen</b>, then <b>Add</b>.'] : ['Open this page in <b>Chrome</b>.', 'Tap the <b>⋮</b> menu.', 'Tap <b>Install app</b> or <b>Add to Home screen</b>.'];
  openSheet(`${sheetHead('Add to Home Screen', 'Install the app')}
    <div class="stack">${steps.map((t, i) => `<div class="card row"><div class="avatar">${i + 1}</div><p class="small grow">${t}</p></div>`).join('')}</div>
    <button class="btn ghost block" style="margin-top:16px" data-act="hide-install">Not now</button>`);
}
function itemSheet(cell) {
  const id = S.garden.items[cell]; if (!id) return;
  const d = GI[id];
  const when = S.passport.find((p) => d.unlock.cat ? p.cat === d.unlock.cat : true);
  openSheet(`${sheetHead(d.name, 'My garden')}
    <div class="item-hero"><svg viewBox="-36 -62 72 70">${d.draw()}</svg></div>
    <p class="small" style="margin-top:14px">${esc(d.desc)}</p>
    <div class="card" style="margin-top:12px"><p class="muted xs">How you unlocked it</p><b class="small">${unlockText(d.unlock)}</b>${when ? `<p class="muted xs" style="margin-top:4px">e.g. ${esc(when.title)} · ${fmtDay(when.date)}</p>` : ''}</div>
    <div class="btn-row" style="margin-top:16px"><button class="btn ghost" data-act="garden-edit-from-sheet">${I.edit} Move or change</button><button class="btn" data-act="walk-to" data-cell="${cell}">${I.cube} See it in 3D</button></div>`);
}
function ringsSheet() {
  openSheet(`${sheetHead('Your seva rings', 'This month · private to you')}
    <div style="display:grid;place-items:center">${ringsSVG([{ p: sevaStats().month / S.intention, color: 'var(--ring1)' }, { p: sevaStats().hrs / 10, color: 'var(--ring2)' }, { p: S.eventsAttended / 2, color: 'var(--ring3)' }]).replace('class="rings"', 'class="rings" style="width:180px;height:180px"')}</div>
    <div class="stack" style="margin-top:16px">
      <div class="card row"><i class="sw" style="width:12px;height:12px;border-radius:50%;background:var(--ring1)"></i><div class="grow"><b class="small">Seva</b><p class="muted xs">Verified seva this month, towards your own intention (${S.intention}).</p></div></div>
      <div class="card row"><i class="sw" style="width:12px;height:12px;border-radius:50%;background:var(--ring2)"></i><div class="grow"><b class="small">Hours</b><p class="muted xs">Time given in seva. Gentle target: 10 hours.</p></div></div>
      <div class="card row"><i class="sw" style="width:12px;height:12px;border-radius:50%;background:var(--ring3)"></i><div class="grow"><b class="small">Sangat</b><p class="muted xs">Gatherings and events attended. Target: 2.</p></div></div>
    </div>
    <p class="muted xs" style="margin-top:12px">When all three close, a flower blooms in the middle. Rings reset each month — no streaks, nothing to lose.</p>`);
}

// ---------- 3D walk (lazy-loaded, only when asked) ----------
let walk = null;
function loadThree() {
  if (window.THREE) return Promise.resolve();
  return new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
}
async function openWalk(focusCell) {
  closeSheet();
  const ov = document.createElement('div'); ov.className = 'walk';
  ov.innerHTML = `<div class="loading">Planting your garden…</div><div class="hud"><span class="tag">${esc(ME().split(' ')[0])}'s garden</span><button class="closeb" aria-label="Close 3D view">${I.close}</button></div><div class="stick" aria-hidden="true"><div class="knob"></div></div><div class="hint">Left: move<br>Drag right side: look</div>`;
  document.body.appendChild(ov);
  ov.querySelector('.closeb').onclick = closeWalk;
  try { await loadThree(); } catch (e) { ov.querySelector('.loading').textContent = '3D view needs an internet connection the first time.'; return; }
  ov.querySelector('.loading').remove();
  const T = window.THREE;
  const renderer = new T.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio)); renderer.setSize(innerWidth, innerHeight);
  ov.insertBefore(renderer.domElement, ov.firstChild);
  const scene = new T.Scene(); scene.background = new T.Color(0xA8D8F0); scene.fog = new T.Fog(0xA8D8F0, 14, 40);
  const cam = new T.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 100);
  scene.add(new T.HemisphereLight(0xffffff, 0x5a7a50, 0.62));
  const sun = new T.DirectionalLight(0xfff4e0, 0.5); sun.position.set(6, 12, 4); scene.add(sun);
  const mats = {}; const M = (c, basic) => mats[c + (basic ? 'b' : '')] || (mats[c + (basic ? 'b' : '')] = basic ? new T.MeshBasicMaterial({ color: c }) : new T.MeshLambertMaterial({ color: c }));
  const geo = new T.BoxGeometry(1, 1, 1);
  const box = (x, y, z, sx, sy, sz, c, basic) => { const m = new T.Mesh(geo, M(c, basic)); m.position.set(x, y, z); m.scale.set(sx, sy, sz); scene.add(m); return m; };
  const S2 = 2; // world units per garden cell
  const off = -(GW * S2) / 2 + S2 / 2;
  const cx = (gx) => off + gx * S2, cz = (gy) => off + gy * S2;
  // ground + border hedge
  box(0, -0.6, 0, 60, 1, 60, 0x7FAE6E);
  for (let y = 0; y < GW; y++) for (let x = 0; x < GW; x++) {
    const t = S.garden.tiles[`${x},${y}`] || 'grass';
    box(cx(x), -0.05, cz(y), S2 * 0.98, 0.1, S2 * 0.98, t === 'path' ? 0xE2D2B4 : ((x + y) % 2 ? 0x9CCB8E : 0x92C284));
  }
  const edge = GW * S2 / 2 + 0.5;
  for (let i = -edge; i <= edge; i += 1) { [[i, -edge], [i, edge], [-edge, i], [edge, i]].forEach(([x, z]) => box(x, 0.45, z, 1, 0.9, 1, 0x4E7F4A)); }
  const animated = [];
  const builders = {
    marigold: (x, z) => { [[-.3, 0], [.3, .2], [0, -.3]].forEach(([a, b]) => { box(x + a, .25, z + b, .08, .5, .08, 0x4E8460); box(x + a, .55, z + b, .26, .2, .26, 0xF29A2E); }); },
    rose: (x, z) => { box(x, .4, z, .9, .8, .9, 0x4F8A5D); [[.3, .8, .2], [-.25, .7, -.3], [0, .85, -.1], [-.3, .6, .3]].forEach(([a, h, b]) => box(x + a, h, z + b, .18, .18, .18, 0xD9475B)); },
    sunflower: (x, z) => { [[-.25, 1.6], [.3, 2]].forEach(([a, h]) => { box(x + a, h / 2, z, .1, h, .1, 0x4E8460); box(x + a, h, z + .1, .55, .55, .1, 0xF6C42E); box(x + a, h, z + .16, .22, .22, .05, 0x7A4A1E); }); },
    sapling: (x, z) => { box(x, .5, z, .12, 1, .12, 0x7A5A38); box(x, 1.05, z, .5, .3, .5, 0x6BAA74); box(x, 1.3, z, .3, .3, .3, 0x7FBA86); },
    bench: (x, z) => { box(x, .45, z, 1.4, .1, .5, 0xB27B4C); box(x, .8, z - .22, 1.4, .5, .08, 0x9A6A40); [[-.6, .2], [.6, .2], [-.6, -.2], [.6, -.2]].forEach(([a, b]) => box(x + a, .2, z + b, .1, .4, .1, 0x5B4330)); },
    lantern: (x, z) => { box(x, .9, z, .1, 1.8, .1, 0x4A3B2D); box(x, 1.9, z, .35, .4, .35, 0xF6D776, true); },
    pond: (x, z) => { box(x, .02, z, 1.8, .06, 1.8, 0x6FB4D8); box(x + .3, .1, z - .2, .3, .1, .3, 0xF29BB5); box(x - .4, .07, z + .3, .4, .04, .4, 0x5E9A68); },
    peacock: (x, z) => { box(x, .5, z, .35, .6, .5, 0x1F5FA8); box(x, 1, z + .25, .2, .3, .2, 0x2069B8); const tail = box(x, 1, z - .45, 1.6, 1.2, .08, 0x2E8B6E); [-.5, 0, .5].forEach((a) => box(x + a, 1.1, z - .5, .2, .2, .04, 0x1F4E8C)); animated.push((t) => { tail.scale.x = 1.5 + Math.sin(t * 2) * .1; }); },
    banyan: (x, z) => { [[-.5, -.4], [.5, -.3], [-.3, .5], [.4, .4]].forEach(([a, b]) => box(x + a, 1.2, z + b, .2, 2.4, .2, 0x7A5A38)); box(x, 2.8, z, 3, 1.2, 3, 0x3E7A52); box(x, 3.6, z, 2, .8, 2, 0x4F8F62); },
    mango: (x, z) => { box(x, .9, z, .3, 1.8, .3, 0x7A5A38); box(x, 2.2, z, 1.8, 1.4, 1.8, 0x3F7F55); box(x, 3.1, z, 1.1, .6, 1.1, 0x4E9064); [[.6, 1.7, .9], [-.9, 2.1, .3], [.2, 2, -.92]].forEach(([a, h, b]) => box(x + a, h, z + b, .22, .28, .22, 0xF2A33A)); },
    butterflies: (x, z) => { const b1 = box(x, 1.2, z, .3, .02, .2, 0xB48CE0); const b2 = box(x + .5, .9, z + .3, .22, .02, .15, 0xF29A2E); animated.push((t) => { b1.position.set(x + Math.sin(t) * .6, 1.2 + Math.sin(t * 3) * .2, z + Math.cos(t) * .6); b1.scale.x = .3 * Math.abs(Math.sin(t * 12)) + .05; b2.position.set(x + Math.cos(t * 1.3) * .5, .9 + Math.sin(t * 4) * .15, z + Math.sin(t * 1.3) * .5); b2.scale.x = .22 * Math.abs(Math.sin(t * 14)) + .04; }); },
    swing: (x, z) => { [[-.7, -.3], [-.7, .3], [.7, -.3], [.7, .3]].forEach(([a, b]) => box(x + a, .9, z + b, .1, 1.8, .1, 0x8C6A43)); box(x, 1.8, z, 1.6, .1, .1, 0x8C6A43); const seat = box(x, .5, z, .5, .06, .3, 0xC0392B); animated.push((t) => { seat.position.z = z + Math.sin(t * 1.5) * .25; }); },
  };
  Object.entries(S.garden.items).forEach(([k, id]) => { const [gx, gy] = k.split(',').map(Number); builders[id] && builders[id](cx(gx), cz(gy)); });
  // camera start
  let yaw = 0, pitch = -0.1;
  cam.position.set(edge - 1.4, 1.7, edge - 1.4); yaw = Math.PI / 4; pitch = -0.22;
  if (focusCell) { const [gx, gy] = focusCell.split(',').map(Number); const tx = cx(gx), tz = cz(gy); cam.position.set(tx, 1.6, Math.min(edge - 1, tz + 3.2)); yaw = Math.atan2(-(tx - cam.position.x), -(tz - cam.position.z)); pitch = -0.15; }
  // controls
  const move = { x: 0, y: 0 }; const keys = {};
  const stick = ov.querySelector('.stick'), knob = ov.querySelector('.knob');
  let stickId = null, lookId = null, lx = 0, ly = 0;
  const onDown = (e) => { for (const t of e.changedTouches || [e]) { const id = t.identifier ?? 'm'; if (t.clientX < innerWidth / 2 && stickId === null) { stickId = id; } else if (lookId === null) { lookId = id; lx = t.clientX; ly = t.clientY; } } };
  const onMove = (e) => { for (const t of e.changedTouches || [e]) { const id = t.identifier ?? 'm';
    if (id === stickId) { const r = stick.getBoundingClientRect(); let dx = t.clientX - (r.left + 60), dy = t.clientY - (r.top + 60); const d = Math.hypot(dx, dy); if (d > 45) { dx *= 45 / d; dy *= 45 / d; } knob.style.transform = `translate(${dx}px,${dy}px)`; move.x = dx / 45; move.y = dy / 45; }
    else if (id === lookId) { yaw -= (t.clientX - lx) * 0.006; pitch = Math.max(-1.2, Math.min(1.2, pitch - (t.clientY - ly) * 0.005)); lx = t.clientX; ly = t.clientY; } } e.preventDefault && e.cancelable && e.preventDefault(); };
  const onUp = (e) => { for (const t of e.changedTouches || [e]) { const id = t.identifier ?? 'm'; if (id === stickId) { stickId = null; move.x = move.y = 0; knob.style.transform = ''; } if (id === lookId) lookId = null; } };
  ov.addEventListener('touchstart', onDown, { passive: true }); ov.addEventListener('touchmove', onMove, { passive: false }); ov.addEventListener('touchend', onUp); ov.addEventListener('touchcancel', onUp);
  let mdown = false; ov.addEventListener('mousedown', (e) => { mdown = true; onDown(e); }); window.addEventListener('mousemove', (e) => { if (mdown) onMove(e); }); window.addEventListener('mouseup', (e) => { mdown = false; onUp(e); });
  const kd = (e) => { keys[e.key.toLowerCase()] = e.type === 'keydown'; }; window.addEventListener('keydown', kd); window.addEventListener('keyup', kd);
  const onResize = () => { cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); }; window.addEventListener('resize', onResize);
  let last = performance.now(), raf;
  const loop = (tm) => {
    const dt = Math.min(0.05, (tm - last) / 1000); last = tm;
    let mx = move.x, my = move.y;
    if (keys.w || keys.arrowup) my = -1; if (keys.s || keys.arrowdown) my = 1; if (keys.a || keys.arrowleft) mx = -1; if (keys.d || keys.arrowright) mx = 1;
    const sp = 3.2 * dt; const sin = Math.sin(yaw), cos = Math.cos(yaw);
    cam.position.x += (mx * cos + my * sin) * sp; cam.position.z += (-mx * sin + my * cos) * sp;
    const lim = edge - 0.8; cam.position.x = Math.max(-lim, Math.min(lim, cam.position.x)); cam.position.z = Math.max(-lim, Math.min(lim, cam.position.z));
    cam.position.y = 1.6 + (Math.abs(mx) + Math.abs(my) > 0.1 ? Math.sin(tm / 120) * 0.04 : 0);
    cam.rotation.order = 'YXZ'; cam.rotation.y = yaw; cam.rotation.x = pitch;
    animated.forEach((f) => f(tm / 1000));
    renderer.render(scene, cam); raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  walk = { ov, renderer, stop: () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', kd); window.removeEventListener('keyup', kd); window.removeEventListener('resize', onResize); renderer.dispose(); geo.dispose(); Object.values(mats).forEach((m) => m.dispose()); } };
}
function closeWalk() { if (walk) { walk.stop(); walk = null; } $$('.walk').forEach((o) => o.remove()); }

// ---------- Actions ----------
function shareText(kind, x) {
  const url = `${location.origin}${location.pathname}#${kind}=${x.id}`;
  if (kind === 'seva') { const left = cap(x) - filled(x); return `🙏 ${x.title}\n${relDay(x.start)} · ${fmtTime(x.start)} · ${x.place}\n${left > 0 ? `${left} volunteer spots open` : 'Fully staffed — join the waitlist'}\nJoin here: ${url}`; }
  return `${x.title}\n${relDay(x.start)} · ${fmtTime(x.start)} · ${x.place}\nRSVP: ${url}`;
}
const openWA = (text) => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
function downloadICS(items, name) {
  const z = (d) => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const ev = items.map((i) => `BEGIN:VEVENT\r\nUID:${i.id}-${uid()}@namdhari-seva-demo\r\nDTSTAMP:${z(new Date())}\r\nDTSTART:${z(i.start)}\r\nDTEND:${z(i.end)}\r\nSUMMARY:${i.title}\r\nLOCATION:${i.place}\r\nBEGIN:VALARM\r\nTRIGGER:-PT2H\r\nACTION:DISPLAY\r\nDESCRIPTION:Reminder\r\nEND:VALARM\r\nEND:VEVENT`).join('\r\n');
  const a = document.createElement('a'); a.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(`BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Namdhari Seva Demo//EN\r\n${ev}\r\nEND:VCALENDAR`); a.download = name + '.ics'; document.body.appendChild(a); a.click(); a.remove();
  toast('Calendar file ready — open it to add');
}
async function notifyTest() {
  if (!('Notification' in window)) { toast(isIOS() && !standalone() ? 'Add to Home Screen first to enable reminders' : 'Notifications not supported here'); return; }
  const p = await Notification.requestPermission();
  if (p !== 'granted') { toast('Notifications are off — calendar reminders still work'); return; }
  const reg = await navigator.serviceWorker?.getRegistration();
  const body = 'Sunday Langar Seva starts tomorrow at 9:00 AM. You\'re on Cooks.';
  if (reg) reg.showNotification('Seva reminder', { body, icon: 'icons/icon-192.png', tag: 'demo' }); else new Notification('Seva reminder', { body });
  toast('Reminder sent');
}
function checkUnlocks(before) {
  const now2 = ITEM_ORDER.filter(isUnlocked);
  const fresh = now2.filter((id) => !before.includes(id));
  if (fresh.length) setTimeout(() => toast(`New unlock: ${fresh.map((f) => itemDef(f).name).join(', ')} 🌱`), 300);
}

function handle(el) {
  const act = el.dataset.act, id = el.dataset.id;
  vibrate();
  switch (act) {
    case 'onb-next': onbStep = 1; renderOnboarding(); break;
    case 'onb-finish': {
      const name = ($('#onb-name')?.value || '').trim();
      if (!name) { toast('Please add your name'); $('#onb-name')?.focus(); return; }
      S.me.name = name; S.me.minor = $('#onb-age')?.value === 'minor'; S.onboarded = true;
      if (!S.me.minor) { const r = S.seva[1].roles[0]; if (!r.filled.includes(name) && r.filled.length < r.cap) r.filled.push(name); }
      save(); go('home'); toast(S.me.minor ? 'Guardian approval link sent' : `Welcome to ${myGroup().name}`);
      break;
    }
    case 'close-sheet': closeSheet(); rerender(); break;
    case 'dismiss': { const a = S.alerts.find((x) => x.id === id); if (a) a.dismissed = true; save(); rerender(); break; }
    case 'join': { const s = S.seva.find((x) => x.id === id); const r = s.roles.find((x) => x.id === el.dataset.role); r.filled.push(ME()); save(); sevaSheet(id, true); rerender(); toast(`You're in — ${r.name}`); break; }
    case 'wait': { const s = S.seva.find((x) => x.id === id); const r = s.roles.find((x) => x.id === el.dataset.role); r.wait.push(ME()); save(); sevaSheet(id, true); rerender(); toast(`You're #${r.wait.length} on the waitlist`); break; }
    case 'drop': {
      if (!confirm('Release your spot? The lead is told and it goes to the waitlist.')) return;
      const s = S.seva.find((x) => x.id === id); let promoted = null;
      s.roles.forEach((r) => { const i = r.filled.indexOf(ME()); if (i > -1) { r.filled.splice(i, 1); if (r.wait.length) { promoted = r.wait.shift(); r.filled.push(promoted); } } const w = r.wait.indexOf(ME()); if (w > -1) r.wait.splice(w, 1); });
      save(); sevaSheet(id, true); rerender(); toast(promoted ? `Spot released — offered to ${promoted.split(' ')[0]}` : 'Spot released. Lead notified');
      break;
    }
    case 'cal': { const s = S.seva.find((x) => x.id === id); downloadICS([{ id: s.id, title: s.title, place: s.place, start: s.start, end: endOf(s).toISOString() }], 'seva'); break; }
    case 'cal-e': { const e = S.events.find((x) => x.id === id); downloadICS([{ id: e.id, title: e.title, place: e.place, start: e.start, end: new Date(new Date(e.start).getTime() + 2 * HOUR).toISOString() }], 'event'); break; }
    case 'cal-all': { const c = myCommitments(); if (!c.length) { toast('Join a seva first'); return; } downloadICS(c.map((x) => ({ ...x, end: new Date(new Date(x.start).getTime() + 2 * HOUR).toISOString() })), 'my-seva'); break; }
    case 'wa': openWA(shareText('seva', S.seva.find((x) => x.id === id))); break;
    case 'wa-e': { const e = S.events.find((x) => x.id === id); const t = shareText('event', e); if (navigator.share) navigator.share({ title: e.title, text: t }).catch(() => {}); else openWA(t); break; }
    case 'rsvp': { const e = S.events.find((x) => x.id === id); const v = el.dataset.v; if (e.rsvp === 'going' && v !== 'going') e.going--; if (e.rsvp !== 'going' && v === 'going') e.going++; e.rsvp = v; save(); eventSheet(id, true); rerender(); toast(v === 'going' ? 'RSVP confirmed — added to Up next' : 'Thanks for letting the host know'); break; }
    case 'notifs': notifSheet(); break;
    case 'install': installSheet(); break;
    case 'hide-install': sessionStorage.setItem('hide-install', '1'); closeSheet(); rerender(); break;
    case 'rings-info': ringsSheet(); break;
    case 'intention': S.intention = S.intention >= 5 ? 1 : S.intention + 1; save(); rerender(); toast(`Intention: seva ${S.intention}× a month`); break;
    case 'notify-test': notifyTest(); break;
    case 'reset': if (confirm('Reset the demo?')) { localStorage.removeItem(KEY); S = seed(); onbStep = 0; tab = 'home'; gardenEdit = false; render(); } break;
    case 'garden-edit': gardenEdit = true; rerender(); break;
    case 'garden-edit-from-sheet': closeSheet(); gardenEdit = true; go('garden'); break;
    case 'garden-done': gardenEdit = false; rerender(); toast('Garden saved'); break;
    case 'walk': openWalk(); break;
    case 'walk-to': openWalk(el.dataset.cell); break;
    case 'sim-seva': {
      const before = ITEM_ORDER.filter(isUnlocked);
      const cats = ['tree', 'langar', 'cleanup', 'education', 'langar'];
      const c = cats[S.passport.length % cats.length];
      S.passport.push({ cat: c, title: `${CAT[c].label} seva (demo)`, date: new Date().toISOString(), hrs: 2 });
      save(); rerender(); checkUnlocks(before);
      if (!ITEM_ORDER.filter((x) => !isUnlocked(x)).length) toast('Everything unlocked — your garden is complete 🌸');
      break;
    }
    case 'create': createSheet(); break;
    case 'publish': {
      const title = $('#c-title').value.trim() || 'New seva'; const when = new Date($('#c-date').value || Date.now() + 3 * DAY).toISOString();
      const ns = { id: 's' + uid(), title, cat: $('[data-tpl][aria-pressed="true"]')?.dataset.tpl || 'langar', group: S.me.group, start: when, dur: 180, place: $('#c-place').value, recur: $('#c-recur').value || null, purpose: 'Created from the demo.', status: 'open', created: new Date().toISOString(), roles: [ { id: 'r1', name: 'Cooks', cap: 6, filled: [], wait: [] }, { id: 'r2', name: 'Servers', cap: 8, filled: [], wait: [] }, { id: 'r3', name: 'Drivers', cap: 2, filled: [], wait: [] } ] };
      S.seva.push(ns); S.notifs.unshift({ id: uid(), level: 'new', t: `New seva: ${title}`, d: new Date().toISOString(), read: false, open: 'seva:' + ns.id });
      save(); S.sevaView = 'seva'; go('seva'); toast('Published — members will see it marked NEW');
      break;
    }
    case 'post-alert': alertSheet(); break;
    case 'publish-alert': {
      const level = $('[data-allevel][aria-pressed="true"]')?.dataset.allevel || 'urgent';
      const title = $('#al-title').value.trim(), text = $('#al-text').value.trim();
      S.alerts.unshift({ id: uid(), level, title, text, open: 'seva:s1', dismissed: false });
      S.posts.unshift({ id: uid(), type: 'alert', scope: 'local', cat: 'alert', title, city: myGroup().city, date: new Date().toISOString(), text, r: { g: 0, a: 0, c: 0 }, mine: null, link: 'seva:s1' });
      S.notifs.unshift({ id: uid(), level, t: title, d: new Date().toISOString(), read: false, open: 'seva:s1' });
      save(); closeSheet(); rerender(); toast('Alert posted to Home and Community');
      break;
    }
    case 'roster': rosterSheet(id); break;
    case 'mark': { const p = el.dataset.p; S.attendance[id] = S.attendance[id] || {}; S.attendance[id][p] = !S.attendance[id][p]; save(); rosterSheet(id); break; }
    case 'complete': completeSheet(id); break;
    case 'submit-complete': {
      const s = S.seva.find((x) => x.id === form.id); form.next = $('#f-next')?.value || form.next;
      s.status = 'closed'; s.recap = recapText(s);
      const g = S.groups.find((x) => x.id === s.group);
      if (form.outcome !== 'Cancelled') {
        S.posts.unshift({ id: 'p' + uid(), type: 'seva', scope: 'local', cat: s.cat, title: `${s.title} — ${form.outcome.toLowerCase()}`, city: g.city, date: new Date().toISOString(), text: `${form.count} volunteers${form.went[0] ? ' · ' + form.went[0].toLowerCase() : ''}.`, count: form.count, r: { g: 0, a: 0, c: 0 }, mine: null, pendingWorld: true });
        S.groupGardenLevel = Math.min(8, S.groupGardenLevel + 1);
        const before = ITEM_ORDER.filter(isUnlocked);
        if (s.roles.some((r) => r.filled.includes(ME()))) { S.passport.push({ cat: s.cat, title: s.title, date: s.start, hrs: s.dur / 60 }); checkUnlocks(before); }
      }
      save(); closeSheet(); rerender(); toast('Closed · success story posted · group garden grew');
      break;
    }
    case 'qr': qrSheet(id); break;
    case 'nudge': toast('Reminder queued to members who haven\'t responded'); break;
    case 'invite': openSheet(`${sheetHead('Invite to ' + esc(myGroup().name))}<p class="muted small">Share in your WhatsApp group or show the QR at the gurdwara.</p>
        <button class="btn block" style="margin-top:16px" data-act="invite-wa">${I.wa} Share invite on WhatsApp</button>
        <button class="btn block ghost" style="margin-top:8px" data-act="qr" data-id="s1">${I.qr} Show group QR</button>`); break;
    case 'invite-wa': openWA(`Join ${myGroup().name} on Namdhari Seva 🙏 ${location.origin}${location.pathname}`); break;
    case 'approve': case 'reject': { const p = S.posts.find((x) => x.id === id); p.pendingWorld = false; if (act === 'approve') p.scope = 'world'; save(); rerender(); toast(act === 'approve' ? 'Promoted to Worldwide' : 'Kept in local feed'); break; }
    case 'csv': {
      const rows = [['seva', 'group', 'date', 'role', 'volunteer']]; S.seva.forEach((s) => s.roles.forEach((r) => r.filled.forEach((p) => rows.push([s.title, s.group, s.start.slice(0, 10), r.name, p]))));
      const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')); a.download = 'participation.csv'; a.click(); toast('CSV downloaded'); break;
    }
  }
}

function openRef(ref) {
  const [k, v] = ref.split(':');
  if (k === 'seva') sevaSheet(v); else if (k === 'event') eventSheet(v); else if (k === 'close') { closeSheet(); completeSheet(v); } else if (k === 'tab') go(v);
}

// ---------- Event delegation ----------
document.addEventListener('click', (e) => {
  const cell = e.target.closest('#pgarden [data-cell]');
  if (cell) {
    const k = cell.dataset.cell;
    if (gardenEdit) {
      vibrate();
      if (gardenTool === 'erase') { delete S.garden.items[k]; delete S.garden.tiles[k]; }
      else if (TILES[gardenTool]) { if (gardenTool === 'grass') delete S.garden.tiles[k]; else S.garden.tiles[k] = gardenTool; }
      else { S.garden.items[k] = gardenTool; }
      save(); $('#pgarden').innerHTML = personalGardenSVG(false);
    } else if (S.garden.items[k]) itemSheet(k);
    else toast('Tap Design to add something here');
    return;
  }
  const t = e.target.closest('[data-tab],[data-open],[data-act],[data-view],[data-feed],[data-ftype],[data-react],[data-region],[data-form],[data-tpl],[data-gview],[data-tool],[data-setmode],[data-setaccent],[data-allevel]');
  if (!t) return;
  if (t.dataset.tab) { go(t.dataset.tab); return; }
  if (t.dataset.open) { openRef(t.dataset.open); return; }
  if (t.dataset.view) { S.sevaView = t.dataset.view; save(); rerender(); return; }
  if (t.dataset.feed) { S.feed = t.dataset.feed; save(); rerender(); return; }
  if (t.dataset.ftype) { S.feedType = t.dataset.ftype; save(); rerender(); return; }
  if (t.dataset.region) { S.adminRegion = t.dataset.region; save(); rerender(); return; }
  if (t.dataset.gview) { S.gardenView = t.dataset.gview; gardenEdit = false; save(); rerender(); return; }
  if (t.dataset.setmode) { S.mode = t.dataset.setmode; save(); rerender(); return; }
  if (t.dataset.setaccent) { S.accent = t.dataset.setaccent; save(); rerender(); toast(`${t.textContent.trim()} theme`); return; }
  if (t.dataset.allevel) { $$('[data-allevel]').forEach((b) => b.setAttribute('aria-pressed', b === t)); return; }
  if (t.dataset.tool) {
    const id = t.dataset.tool;
    if (id !== 'erase' && !isUnlocked(id)) { toast(`🔒 ${itemDef(id).name}: ${unlockText(itemDef(id).unlock)}`); return; }
    gardenTool = id; $$('[data-tool]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.tool === id)); return;
  }
  if (t.dataset.tpl) {
    $$('[data-tpl]').forEach((b) => b.setAttribute('aria-pressed', b === t));
    $('#c-title').value = { langar: 'Sunday Langar Seva', cleanup: 'Neighbourhood Clean-up', tree: 'Tree Planting Drive', education: 'Gurmukhi Reading Circle' }[t.dataset.tpl]; return;
  }
  if (t.dataset.react) {
    const [pid, k] = t.dataset.react.split(':'); const p = S.posts.find((x) => x.id === pid);
    if (p.mine === k) { p.r[k]--; p.mine = null; } else { if (p.mine) p.r[p.mine]--; p.r[k]++; p.mine = k; }
    vibrate(); save(); t.closest('.post').outerHTML = postCard(p); return;
  }
  if (t.dataset.form) {
    const f = t.dataset.form, v = t.dataset.v;
    form.count = parseInt($('#f-count')?.value, 10) || form.count; form.next = $('#f-next')?.value ?? form.next;
    if (f === 'outcome') form.outcome = v; if (f === 'inc') form.count++; if (f === 'dec') form.count = Math.max(0, form.count - 1);
    if (f === 'went' || f === 'issues') { const a = form[f]; const i = a.indexOf(v); i > -1 ? a.splice(i, 1) : a.push(v); }
    const y = $('.sheet').scrollTop; drawComplete(); $('.sheet').style.animation = 'none'; $('.sheet').scrollTop = y; return;
  }
  if (t.dataset.act) handle(t);
});
document.addEventListener('change', (e) => {
  if (e.target.id === 'role-select') { S.role = e.target.value; save(); go('home'); toast(`Viewing as ${e.target.selectedOptions[0].text}`); }
  if (e.target.id === 'group-select') { S.me.group = e.target.value; save(); rerender(); toast(`Primary group: ${myGroup().name}`); }
});
document.addEventListener('input', (e) => {
  if (e.target.id === 'f-count' || e.target.id === 'f-next') {
    form.count = parseInt($('#f-count').value, 10) || 0; form.next = $('#f-next').value;
    const r = $('#recap'); if (r) r.textContent = recapText(S.seva.find((x) => x.id === form.id));
  }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (walk) closeWalk(); else if ($('#sheet-root').innerHTML) { closeSheet(); rerender(); } } });
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; });
window.addEventListener('appinstalled', () => { toast('Installed — find Seva on your Home Screen'); rerender(); });

function openFromHash() {
  const m = location.hash.match(/^#(seva|event)=(\w+)/);
  if (m && S.onboarded) { m[1] === 'seva' ? sevaSheet(m[2]) : eventSheet(m[2]); history.replaceState(null, '', location.pathname); }
}
window.addEventListener('hashchange', openFromHash);

applyTheme();
$('#app').innerHTML = `<main class="screen"><div class="skel" style="height:28px;width:40%"></div><div class="skel" style="height:150px;margin-top:20px"></div><div class="skel" style="height:90px;margin-top:16px"></div><div class="skel" style="height:90px;margin-top:12px"></div></main>`;
setTimeout(() => { render(); openFromHash(); }, 300);

if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
})();
