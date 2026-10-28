/* Namdhari Seva & Community — member prototype v6
   Home: Instagram-style stories (team leads, per group) + admin feed cards.
   Seva: date-block cards, big LIVE, detail with Overview / Tasks / Team / Updates.
   Garden: scenic garden, unlocks, points, cart. Profile: contributions + My Team.
   No backend: sample data lives on this device. */
(() => {
'use strict';

// ---------- Utilities ----------
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const MIN = 60000, HOUR = 3600000, DAY = 86400000;
const now = () => Date.now();
const iso = (t) => new Date(t).toISOString();
const at = (d, h, m = 0) => { const x = new Date(); x.setDate(x.getDate() + d); x.setHours(h, m, 0, 0); return x.toISOString(); };
const rel = (mins) => iso(now() + mins * MIN);
const T = (s) => new Date(s).getTime();
const ymd = (d) => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
const fmtTime = (s) => new Date(s).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
const fmtLong = (s) => new Date(s).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
const relDay = (s) => {
  const a = new Date(s); a.setHours(0, 0, 0, 0); const b = new Date(); b.setHours(0, 0, 0, 0);
  const d = Math.round((a - b) / DAY);
  if (d === 0) return 'Today'; if (d === 1) return 'Tomorrow'; if (d === -1) return 'Yesterday';
  if (d > 1 && d < 7) return new Date(s).toLocaleDateString(undefined, { weekday: 'long' });
  return fmtLong(s);
};
const ago = (s) => { const m = Math.round((now() - T(s)) / MIN); if (m < 1) return 'just now'; if (m < 60) return m + 'm'; if (m < 1440) return Math.round(m / 60) + 'h'; return Math.round(m / 1440) + 'd'; };
const initials = (n) => n.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
const first = (n) => n.split(' ')[0];
const uid = () => Math.random().toString(36).slice(2, 9);
const num = (n) => n.toLocaleString();
let toastT;
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600); }
const buzz = () => { try { navigator.vibrate && navigator.vibrate(8); } catch (e) {} };
const AVC = ['#E07A3A', '#2E9A8F', '#7B4FE0', '#D9467A', '#3B7BE0', '#4E9A3E', '#B7791F', '#C2410C', '#0F766E', '#6D28D9'];
const avColor = (n) => AVC[[...n].reduce((a, c) => a + c.charCodeAt(0), 0) % AVC.length];

// ---------- Icons ----------
const svg = (p, w = 1.8) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const I = {
  home: svg('<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>'),
  seva: svg('<path d="M7 11V7a2 2 0 1 1 4 0v4"/><path d="M11 10V5a2 2 0 1 1 4 0v6"/><path d="M15 9a2 2 0 1 1 4 0v5a7 7 0 0 1-7 7h-1a7 7 0 0 1-6-3.4L3 15a2 2 0 0 1 3.4-2l.6 1"/>'),
  garden: svg('<path d="M12 21v-9"/><path d="M12 12c0-4 3-7 8-7 0 5-3 7-8 7z"/><path d="M12 14c0-3-2.5-5.5-7-5.5 0 4 2.5 5.5 7 5.5z"/><path d="M5 21h14"/>'),
  profile: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
  bell: svg('<path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 0 0 4 0"/>'),
  share: svg('<path d="M22 3 11 14"/><path d="M22 3l-7 19-4-8-8-4z"/>'),
  back: svg('<path d="M15 6l-6 6 6 6"/>', 2.2),
  chev: svg('<path d="M9 6l6 6-6 6"/>', 2),
  chevL: svg('<path d="M15 6l-6 6 6 6"/>', 2),
  arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>', 2),
  close: svg('<path d="M6 6l12 12M18 6 6 18"/>', 2),
  clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  pin: svg('<path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>'),
  user: svg('<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>'),
  users: svg('<circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 4.5a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.6"/>'),
  check: svg('<path d="M5 12l5 5 9-10"/>', 2.6),
  checkc: svg('<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>', 2),
  help: svg('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 0 1 4.8 1c0 1.7-2.3 2-2.3 3.5M12 17h.01"/>', 2),
  xc: svg('<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>', 2),
  alert: svg('<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>', 2),
  info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/>', 2),
  sparkle: svg('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>'),
  more: svg('<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>', 2),
  moon: svg('<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>'),
  sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  khanda: svg('<path d="M12 2v20"/><path d="M12 2l-1.5 3h3z"/><path d="M8 7a6 6 0 0 0 0 10M16 7a6 6 0 0 1 0 10"/><circle cx="12" cy="12" r="3"/>'),
  heart: svg('<path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>', 2.2),
  cal: svg('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
  list: svg('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>', 2),
  megaphone: svg('<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M16 8a5 5 0 0 1 0 8M19 5a9 9 0 0 1 0 14"/>'),
  wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.8-1.2s.2-1.1.1-1.2-.2-.2-.4-.3z"/></svg>',
  msg: svg('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>'),
  leaf: svg('<path d="M5 19c0-8 5-14 15-15-1 10-7 15-15 15z"/><path d="M5 19l8-8"/>'),
  lock: svg('<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
  cube: svg('<path d="M12 2 3 7v10l9 5 9-5V7z"/><path d="M3 7l9 5 9-5M12 12v10"/>'),
  image: svg('<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>'),
  reset: svg('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'),
  bookmark: svg('<path d="M6 3h12v18l-6-4-6 4z"/>'),
  search: svg('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>', 2),
  settings: svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  journey: svg('<path d="M4 19c4 0 4-6 8-6s4 6 8 6"/><circle cx="4" cy="19" r="1.5"/><circle cx="20" cy="19" r="1.5"/><path d="M12 13V4l5 2.5L12 9"/>'),
  handshake: svg('<path d="M11 17l2 2a1.4 1.4 0 0 0 2-2"/><path d="M14 14l2.5 2.5a1.4 1.4 0 0 0 2-2L15 11l-1.5 1.5a2 2 0 0 1-3-3L13 7h3l5 5"/><path d="M3 11l5-5 3 1"/><path d="M3 11l5 5 1.5-1.5"/>'),
  cart: svg('<path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6"/><circle cx="10" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/>'),
  wifi: svg('<path d="M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0M12 19h.01"/><path d="M3 3l18 18"/>'),
  download: svg('<path d="M12 4v11M7 10l5 5 5-5"/><path d="M5 20h14"/>'),
  team: svg('<circle cx="12" cy="7" r="3"/><circle cx="5" cy="10" r="2.2"/><circle cx="19" cy="10" r="2.2"/><path d="M7 21a5 5 0 0 1 10 0M1.5 19a3.6 3.6 0 0 1 5.5-3M22.5 19a3.6 3.6 0 0 0-5.5-3"/>'),
  flag: svg('<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'),
  globe: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
};
const SEED = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#F6C453"/><circle cx="12" cy="12" r="10" fill="none" stroke="#D99A1E" stroke-width="1.4"/><path d="M12 17.5v-6M12 11.5c0-3 2-5 5-5 0 3-2 5-5 5zM12 13.5c0-2.4-1.7-4-4.2-4 0 2.4 1.7 4 4.2 4z" stroke="#7A4D00" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>';
const seed = (n) => `<span class="seed">${SEED}${n}</span>`;
const chev = I.chev.replace('<svg', '<svg class="chev"');
const CAT = {
  langar: { label: 'Langar', ic: svg('<path d="M4 12h16a8 7 0 0 1-16 0z"/><path d="M3 12h18M9 8c0-1.5 1.5-1.5 1.5-3M13 8c0-1.5 1.5-1.5 1.5-3"/>') },
  cleanup: { label: 'Cleaning', ic: svg('<path d="M14 3l-4 9"/><path d="M6 12h8l2 9H4z"/><path d="M8 16v5M12 16v5"/>') },
  tree: { label: 'Tree planting', ic: svg('<path d="M12 21v-8"/><path d="M12 13c0-4 3-6 7-6 0 4-3 6-7 6zM12 15c0-3-2.5-5-6-5 0 3.5 2.5 5 6 5z"/><path d="M6 21h12"/>') },
  education: { label: 'Education', ic: svg('<path d="M3 6c3-1.5 6-1.5 9 1 3-2.5 6-2.5 9-1v13c-3-1.5-6-1.5-9 1-3-2.5-6-2.5-9-1z"/><path d="M12 7v13"/>') },
  blanket: { label: 'Relief', ic: svg('<path d="M12 20s-7-4.4-7-9.5A3.5 3.5 0 0 1 12 8a3.5 3.5 0 0 1 7 2.5C19 15.6 12 20 12 20z"/>') },
  nasha: { label: 'Nasha Mukti', ic: svg('<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/><path d="M8 12h5"/>') },
  donation: { label: 'Donation', ic: svg('<path d="M12 7v10M9.5 9.5c0-1.4 1.1-2 2.5-2s2.5.7 2.5 2-1.1 1.8-2.5 2-2.5.7-2.5 2 1.1 2 2.5 2 2.5-.6 2.5-2"/><circle cx="12" cy="12" r="9"/>') },
  stall: { label: 'Langar stall', ic: svg('<path d="M3 10l2-6h14l2 6"/><path d="M3 10h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z"/><path d="M5 14v7h14v-7"/>') },
  clothes: { label: 'Clothes for needy', ic: svg('<path d="M8 3l-5 4 3 3 2-1v12h8V9l2 1 3-3-5-4c0 1.7-1.3 3-4 3S8 4.7 8 3z"/>') },
  social: { label: 'Social service', ic: svg('<path d="M11 17l2 2a1.4 1.4 0 0 0 2-2"/><path d="M14 14l2.5 2.5a1.4 1.4 0 0 0 2-2L15 11l-1.5 1.5a2 2 0 0 1-3-3L13 7h3l5 5"/><path d="M3 11l5-5 3 1"/><path d="M3 11l5 5 1.5-1.5"/>') },
  event: { label: 'Event', ic: svg('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>') },
};

// ---------- People ----------
const NAMES = ['Harpreet Kaur', 'Gurpreet Singh', 'Simran Kaur', 'Jaspreet Singh', 'Manjit Kaur', 'Balwinder Singh', 'Navneet Kaur', 'Amrit Singh', 'Kiranjit Kaur', 'Ravinder Singh', 'Parminder Kaur', 'Tejinder Singh', 'Sukhwinder Singh', 'Rajinder Kaur', 'Hardeep Singh', 'Gurleen Kaur', 'Mandeep Singh', 'Jasleen Kaur', 'Kuldeep Singh', 'Inderjit Kaur', 'Baljit Singh', 'Prabhjot Kaur', 'Daljit Singh', 'Sandeep Kaur', 'Arjan Singh', 'Mehar Kaur', 'Ishmeet Singh', 'Noor Kaur', 'Taranjit Singh', 'Ekam Kaur'];
const LEADS = ['Gurpreet Singh', 'Simran Kaur', 'Manjit Kaur', 'Ravinder Singh', 'Harpreet Kaur', 'Balwinder Singh'];
const GROUPS = [
  { id: 'delhi', name: 'Delhi Central', country: 'India', flag: '🇮🇳', lead: 'Gurpreet Singh', members: 248, q: { fill: .82, turn: .91, delay: .2, lag: 14, freq: 4, trend: .05 } },
  { id: 'ludhiana', name: 'Ludhiana Jatha', country: 'India', flag: '🇮🇳', lead: 'Jagdeep Singh', members: 312, q: { fill: .9, turn: .93, delay: .1, lag: 8, freq: 5, trend: .08 } },
  { id: 'bhaini', name: 'Sri Bhaini Sahib', country: 'India', flag: '🇮🇳', lead: 'Harbans Singh', members: 540, q: { fill: .94, turn: .95, delay: .08, lag: 6, freq: 7, trend: .04 } },
  { id: 'mumbai', name: 'Mumbai Sangat', country: 'India', flag: '🇮🇳', lead: 'Kamaljeet Kaur', members: 96, q: { fill: .8, turn: .86, delay: .25, lag: 20, freq: 2, trend: .02 } },
  { id: 'jammu', name: 'Jammu Sangat', country: 'India', flag: '🇮🇳', lead: 'Satnam Singh', members: 130, q: { fill: .78, turn: .84, delay: .22, lag: 30, freq: 2, trend: 0 } },
  { id: 'jaipur', name: 'Jaipur Sangat', country: 'India', flag: '🇮🇳', lead: 'Paramjit Singh', members: 64, q: { fill: .66, turn: .78, delay: .3, lag: 60, freq: 1.5, trend: -.35 } },
  { id: 'london', name: 'London Southall', country: 'UK', flag: '🇬🇧', lead: 'Ranjit Singh', members: 180, q: { fill: .88, turn: .9, delay: .12, lag: 10, freq: 3, trend: .06 } },
  { id: 'birmingham', name: 'Birmingham', country: 'UK', flag: '🇬🇧', lead: 'Amarjit Kaur', members: 88, q: { fill: .57, turn: .74, delay: .28, lag: 40, freq: 2, trend: -.15 } },
  { id: 'nairobi', name: 'Nairobi', country: 'Kenya', flag: '🇰🇪', lead: 'Balbir Singh', members: 72, q: { fill: .84, turn: .88, delay: .45, lag: 18, freq: 2, trend: .03 } },
  { id: 'toronto', name: 'Toronto', country: 'Canada', flag: '🇨🇦', lead: 'Navdeep Kaur', members: 110, q: { fill: .86, turn: .9, delay: .15, lag: 96, freq: 2.5, trend: .1 } },
  { id: 'bangkok', name: 'Bangkok', country: 'Thailand', flag: '🇹🇭', lead: 'Surinder Singh', members: 54, q: { fill: .8, turn: .87, delay: .18, lag: 22, freq: 1, trend: .12 } },
];
const crowd = (off, going, maybe, cant, here = 0) => { const o = []; let k = off; for (let i = 0; i < going; i++) o.push({ n: NAMES[k++ % 30], st: i < here ? 'here' : 'going' }); for (let i = 0; i < maybe; i++) o.push({ n: NAMES[k++ % 30], st: 'maybe' }); for (let i = 0; i < cant; i++) o.push({ n: NAMES[k++ % 30], st: 'cant' }); return o; };
const pts = (off, list) => list.map(([text, need, n, me, prog, extra], i) => ({ id: 't' + uid(), text, need, prog: prog || 0, takers: [...(me ? ['@me'] : []), ...NAMES.slice(off + i * 2, off + i * 2 + n)], at: extra?.at || at(-3, 9), live: !!extra?.live }));

// ---------- Scenario data ----------
function baseSeva(kind) {
  const meA = kind === 'active';
  return [
    { id: 's0', title: 'Gurdwara Hall Cleaning', cat: 'cleanup', start: rel(-45), end: rel(135), place: 'Namdhari Gurdwara, Karol Bagh', meet: 'Main hall entrance', lead: 'Gurpreet Singh', purpose: 'Get the main hall ready for this evening\'s diwan.', instructions: 'Head covered. Brooms, mops and cloths are in the store room.', created: at(-5, 9), people: crowd(2, 9, 1, 1, 7),
      points: pts(2, [['Lay carpets in the main hall', 4, 3, false, 1], ['Sweep and mop the hall floor', 3, 2, meA, .6], ['Clean windows and ceiling fans', 2, 0, false, 0], ['Arrange the shoe racks', 2, 1, meA, .3], ['Water for sangat at the entrance', 1, 0, false, 0, { at: rel(-8), live: true }]]),
      updates: [{ id: 'u1', t: 'New task added: Water for sangat at the entrance', d: rel(-8), by: 'Gurpreet Singh', kind: 'new' }, { id: 'u2', t: 'Carpets: start from the stage side, not the door side', d: rel(-14), by: 'Gurpreet Singh', kind: 'edit' }, { id: 'u0', t: 'Seva has started. Please meet at the main hall entrance.', d: rel(-45), by: 'Gurpreet Singh', kind: 'info' }] },
    { id: 's5', title: 'Morning Langar Prep', cat: 'langar', start: rel(-70), end: rel(110), place: 'Langar kitchen, Karol Bagh', meet: 'Kitchen side door', lead: 'Manjit Kaur', purpose: 'Prep for today\'s langar — about 250 sangat.', instructions: 'Aprons and gloves provided.', created: at(-6, 9), people: crowd(12, 7, 1, 0, 6),
      points: pts(12, [['Chop onions and tomatoes', 3, 2, meA, .7], ['Knead atta for rotis', 2, 2, false, .5], ['Wash dal and rice', 2, 1, false, 1]]),
      updates: [{ id: 'u3', t: 'Prep started — 40 extra sangat expected', d: rel(-60), by: 'Manjit Kaur', kind: 'info' }] },
    { id: 's1', title: 'Sunday Langar Seva', cat: 'langar', start: at(1, 9), end: at(1, 13), place: 'Namdhari Gurdwara, Karol Bagh', meet: 'Langar hall, main door', lead: 'Gurpreet Singh', purpose: 'Cook and serve langar for around 300 sangat after the morning diwan.', instructions: 'Arrive 15 minutes early.', created: at(-10, 9), recur: 'Every Sunday', people: crowd(0, 10, 3, 2),
      points: pts(0, [['Cook dal and sabzi', 3, 2, meA], ['Make rotis', 4, 3, false], ['Serve langar in the hall', 6, 4, false], ['Wash utensils after service', 3, 0, false]]), updates: [] },
    { id: 's2', title: 'Yamuna Ghat Clean-up', cat: 'cleanup', start: at(4, 7), end: at(4, 9, 30), place: 'Kudesia Ghat, Gate 2', meet: 'Gate 2 (changed from Gate 1)', lead: 'Simran Kaur', purpose: 'Clear plastic waste along 400 m of the riverbank.', instructions: 'Old clothes and closed shoes. Gloves and bags provided.', created: at(-8, 9), people: crowd(9, 8, 4, 1),
      points: pts(9, [['Pick up plastic along the bank', 10, 6, meA], ['Sort plastic for recycling', 3, 1, false], ['Water and first aid table', 2, 0, false]]),
      updates: [{ id: 'u4', t: 'Venue changed: meet at Gate 2, not Gate 1', d: rel(-120), by: 'Simran Kaur', kind: 'edit' }] },
    { id: 's3', title: 'Tree Planting Drive', cat: 'tree', start: at(9, 8), end: at(9, 11), place: 'Sanjay Van, South Delhi', meet: 'Main gate parking', lead: 'Ravinder Singh', purpose: 'Plant 120 native saplings with the forest department.', instructions: 'Tools provided. Wear a cap.', created: rel(-300), people: crowd(17, 3, 2, 0),
      points: pts(17, [['Dig pits for saplings', 6, 2, false], ['Plant and pat the soil', 6, 1, false], ['Carry water cans', 4, 0, false]]), updates: [] },
    { id: 's6', title: 'Blanket Distribution', cat: 'blanket', start: at(12, 18), end: at(12, 20), place: 'Night shelters, Old Delhi', meet: 'Chandni Chowk metro, gate 5', lead: 'Gurpreet Singh', purpose: 'Distribute 200 blankets ahead of winter.', instructions: 'Teams of 4. Your lead will brief you.', created: rel(-90), people: crowd(21, 2, 3, 0),
      points: pts(21, [['Load blankets into vans', 4, 1, false], ['Hand out blankets', 8, 1, false], ['Drive a van', 3, 0, false]]), updates: [] },
    { id: 's7', title: 'Punjabi Reading Circle', cat: 'education', start: at(6, 17), end: at(6, 18, 30), place: 'Community Hall, Karol Bagh', meet: 'Room 2', lead: 'Harpreet Kaur', purpose: 'Help children practise Gurmukhi reading.', instructions: 'Books provided.', created: at(-20, 9), recur: 'Every Saturday', people: crowd(24, 4, 1, 1),
      points: pts(24, [['Read with a small group', 4, 3, false], ['Set up the room', 1, 1, false]]), updates: [] },
    { id: 's10', title: 'Shoe Seva at the Gurdwara', cat: 'cleanup', start: rel(-30), end: rel(150), place: 'Namdhari Gurdwara, Karol Bagh', meet: 'Joda ghar (shoe room)', lead: 'Balwinder Singh', purpose: 'Look after the sangat\'s shoes during the evening diwan.', instructions: 'Gloves provided.', created: at(-2, 9), people: crowd(6, 5, 0, 0, 5),
      points: pts(6, [['Take and tag shoes', 3, 2, false, .5], ['Return shoes after diwan', 3, 1, false, 0]]), updates: [] },
    // Created by the Main Admin (Seva HQ): shown to every member, wherever they are
    { id: 's9', hq: true, region: 'Sri Bhaini Sahib', title: 'Annual Cleaning Seva', cat: 'cleanup', start: at(8, 7), end: at(8, 12), place: 'Sri Bhaini Sahib, Ludhiana, Punjab', meet: 'Main gate, near the langar hall', lead: 'Seva HQ team', purpose: 'Clean and prepare the whole complex before the winter gathering. Sangat from every city is welcome.', instructions: 'Travel and stay are arranged by your own jatha. Tell your team lead if you are coming.', created: rel(-60), people: crowd(4, 46, 12, 3),
      points: pts(4, [['Clean the main diwan hall', 20, 14, false], ['Langar hall and kitchen', 15, 9, false], ['Gardens and pathways', 12, 4, false], ['Water seva for arriving sangat', 6, 0, false]]), updates: [{ id: 'u9', t: 'Buses from Delhi and Ludhiana are being arranged — ask your team lead', d: rel(-40), by: 'Seva HQ team', kind: 'info' }] },
    { id: 's8', hq: true, region: 'Sri Bhaini Sahib', title: 'Hola Mohalla Langar Seva', cat: 'langar', start: at(23, 6), end: at(23, 14), place: 'Sri Bhaini Sahib, Ludhiana, Punjab', meet: 'Langar hall, gate 3', lead: 'Seva HQ team', purpose: 'Langar for thousands of sangat arriving for Hola Mohalla.', instructions: 'Register with your team lead so kitchens can plan.', created: at(-3, 9), people: crowd(10, 120, 30, 6),
      points: pts(10, [['Cook dal and sabzi', 40, 18, false], ['Make rotis', 60, 22, false], ['Serve in the pangat', 50, 10, false], ['Clean utensils', 30, 3, false]]), updates: [] },
  ];
}
function baseEvents() {
  return [
    { id: 'e1', title: 'Monthly Satsang', kind: 'Satsang', start: at(6, 18), end: at(6, 20), place: 'Namdhari Gurdwara, Karol Bagh', organizer: 'Delhi Central', agenda: ['Kirtan', 'Katha', 'Ardas', 'Langar'], going: 86, maybe: 21, cant: 9, created: at(-12, 9) },
    { id: 'e2', title: 'New Volunteer Orientation', kind: 'Online session', start: at(3, 19), end: at(3, 19, 45), place: 'Online — link shared after you RSVP', organizer: 'Delhi Central', agenda: ['How seva works', 'Picking tasks', 'Q&A'], going: 14, maybe: 6, cant: 2, created: rel(-200) },
    { id: 'e3', title: 'Hola Mohalla Gathering', kind: 'Gathering', start: at(24, 10), end: at(24, 17), place: 'Sri Bhaini Sahib, Punjab', organizer: 'Worldwide sangat', agenda: ['Gathering', 'Seva', 'Celebration'], going: 1240, maybe: 310, cant: 45, created: at(-15, 9) },
  ];
}
// Feed: only the Super Admin posts. Text only, rendered as designed cards.
function baseFeed() {
  return [
    { id: 'f0', type: 'seva', d: rel(-20), sid: 's9', title: 'Annual Cleaning Seva', text: 'Seva HQ invites sangat from every city to Sri Bhaini Sahib.', r: { g: 860, s: 410 } },
    { id: 'f1', type: 'thought', d: rel(-50), title: 'Thought of the Day', text: 'Seva done with a quiet heart is never small. Every roti rolled and every step swept is an offering.', r: { g: 1204, s: 312 } },
    { id: 'f2', type: 'alert', d: rel(-120), title: 'Venue changed', text: 'Yamuna Ghat Clean-up on Thursday now meets at Gate 2. Gate 1 is closed for repairs. Same time, 7:00 AM.', link: 'seva:s2', cta: 'View seva', r: { g: 88, s: 240 } },
    { id: 'f3', type: 'hukam', d: rel(-300), title: 'Satguru Ji\'s Hukam', text: 'This winter, every jatha is asked to hold one blanket seva for those sleeping in the cold. Plans for Delhi are now open — please give your name to your team lead.', link: 'seva:s6', cta: 'See the plan', r: { g: 2310, s: 1430 } },
    { id: 'f4', type: 'appreciation', d: at(-1, 19), title: 'Thank you, Delhi Central', text: '22 sevadars cleared 18 bags of waste from 3 lanes in Karol Bagh on Sunday.', stat: '18 bags', r: { g: 642, s: 120 } },
    { id: 'f5', type: 'event', d: at(-1, 12), title: 'Monthly Satsang', text: 'Kirtan, katha and langar. 86 sangat going so far.', link: 'event:e1', ev: 'e1', cta: 'RSVP', r: { g: 410, s: 96 } },
    { id: 'f6', type: 'info', d: at(-2, 10), title: 'New in the app', text: 'You can now pick the exact tasks you will do at a seva. Your team lead sees it instantly, and you get a reminder before it starts.', r: { g: 150, s: 77 } },
    { id: 'f7', type: 'thought', d: at(-3, 7), title: 'Thought of the Day', text: 'The sangat is a garden. It grows when each of us tends one small patch of it.', r: { g: 980, s: 205 } },
    { id: 'f8', type: 'seva', d: at(-3, 9), sid: 's8', title: 'Hola Mohalla Langar Seva', text: 'Kitchens for thousands of sangat. Register with your team lead.', r: { g: 1520, s: 890 } },
    { id: 'f9', type: 'appreciation', d: at(-4, 18), title: 'Thank you, London Sangat', text: '16 sevadars served langar to 450 sangat at Southall in under 2 hours.', stat: '450 served', r: { g: 733, s: 140 } },
    { id: 'f10', type: 'info', d: at(-5, 11), title: 'Winter timings', text: 'From next week, morning seva at Karol Bagh starts at 7:30 AM instead of 7:00 AM.', r: { g: 98, s: 44 } },
    { id: 'f11', type: 'thought', d: at(-6, 7), title: 'Thought of the Day', text: 'Serve without counting. The garden never asks the rain how many drops it gave.', r: { g: 1101, s: 260 } },
    { id: 'f12', type: 'alert', d: at(-7, 9), title: 'Heavy rain expected', text: 'Saturday\'s outdoor seva in Ludhiana may move indoors. Watch your seva updates.', r: { g: 61, s: 180 } },
    { id: 'f13', type: 'appreciation', d: at(-8, 19), title: 'Thank you, Jammu Sangat', text: '200 blankets packed in one evening for the winter relief drive.', stat: '200 blankets', r: { g: 512, s: 133 } },
  ];
}
// Stories: posted by team leads under their group name (max 2 per lead per day).
function baseStories() {
  return [
    { id: 'g-delhi', name: 'Delhi', code: 'DEL', full: 'Delhi Central', mine: true, hue: ['#F2780C', '#E0263F'], stories: [
      { id: 'st1', d: rel(-40), kind: 'Live now', title: 'Hall cleaning has started', msg: 'Carpets and shoe racks first. Water seva for sangat still needs one more pair of hands.', theme: 'live', link: 'seva:s0', cta: 'Open live seva' },
      { id: 'st2', d: rel(-95), kind: 'Langar', title: '40 extra sangat expected today', msg: 'Kitchen side door is open from 7 AM. Aprons and gloves are ready.', theme: 'langar', link: 'seva:s5', cta: 'View seva' },
      { id: 'st3', d: rel(-200), kind: 'This Thursday', title: 'Yamuna clean-up: meet at Gate 2', msg: 'Bring old clothes and closed shoes.', theme: 'river', link: 'seva:s2', cta: 'View seva' } ] },
    { id: 'g-ludhiana', name: 'Ludhiana', code: 'LDH', full: 'Ludhiana Jatha', hue: ['#2E9A4B', '#0E9F97'], stories: [
      { id: 'st4', d: rel(-180), kind: 'Thank you', title: '120 saplings planted', msg: 'Thank you to all 34 sevadars who came out at sunrise.', theme: 'tree' },
      { id: 'st5', d: rel(-260), kind: 'Next Sunday', title: 'Langar for 500', msg: 'Rotis team needs 6 more volunteers.', theme: 'langar' } ] },
    { id: 'g-bhaini', name: 'Sri Bhaini Sahib', code: 'SBS', full: 'Sri Bhaini Sahib', hue: ['#E7A93A', '#C2410C'], stories: [
      { id: 'st6', d: rel(-320), kind: 'Preparations', title: 'Hola Mohalla seva sign-ups open', msg: 'Kitchen, parking, water and cleaning teams are forming now.', theme: 'gold', link: 'event:e3', cta: 'See event' } ] },
    { id: 'g-london', name: 'London', code: 'LDN', full: 'London Sangat', hue: ['#3B7BE0', '#7B4FE0'], stories: [
      { id: 'st7', d: rel(-420), kind: 'Southall', title: 'Langar for 450 served', msg: '16 sevadars, under 2 hours. Shukar.', theme: 'night' } ] },
    { id: 'g-mumbai', name: 'Mumbai', code: 'MUM', full: 'Mumbai Sangat', hue: ['#E0458F', '#B23AC8'], stories: [
      { id: 'st8', d: rel(-500), kind: 'Reading circle', title: '30 children read Gurmukhi today', msg: 'Volunteers welcome every Saturday.', theme: 'edu' } ] },
    { id: 'g-jammu', name: 'Jammu', code: 'JMU', full: 'Jammu Sangat', hue: ['#0E9F97', '#3B7BE0'], stories: [
      { id: 'st9', d: rel(-650), kind: 'Winter relief', title: '200 blankets packed', msg: 'Distribution starts this weekend.', theme: 'river' } ] },
  ];
}
function scenario(kind) {
  const d = { seenTasks: {}, seva: baseSeva(kind), events: baseEvents(), feed: baseFeed(), groups: baseStories(), assign: {}, rsvp: {}, history: [], notifs: [], mydone: {}, seenUpd: {}, react: {}, saved: {}, storySeen: {}, owned: {}, cart: {}, pts: 0, earned: 0 };
  if (kind === 'active') {
    d.assign = { s0: { state: 'going' }, s5: { state: 'going' }, s1: { state: 'going' }, s2: { state: 'maybe' }, s3: { state: 'invited' } };
    d.rsvp = { e1: 'going' };
    d.seenUpd = { s0: T(rel(-30)), s5: now() };
    d.history = [
      { id: 'h1', title: 'Karol Bagh street clean-up', cat: 'cleanup', date: at(-3, 10), role: 'Picked up litter' },
      { id: 'h2', title: 'Punjabi Reading Circle', cat: 'education', date: at(-8, 17), role: 'Read with a group' },
      { id: 'h3', title: 'Sunday Langar Seva', cat: 'langar', date: at(-13, 9), role: 'Served langar' },
      { id: 'h5', title: 'Blanket Distribution', cat: 'blanket', date: at(-41, 18), role: 'Handed out blankets' },
      { id: 'h6', title: 'Tree Planting Drive', cat: 'tree', date: at(-55, 8), role: 'Planted saplings' },
      { id: 'h7', title: 'Gurdwara Hall Cleaning', cat: 'cleanup', date: at(-70, 9), role: 'Arranged shoe racks' },
      { id: 'h8', title: 'Punjabi Reading Circle', cat: 'education', date: at(-83, 17), role: 'Set up the room' },
    ];
    d.owned = { marigold: 3, sapling: 2, rose: 1, tulips: 2, bench: 1, cat: 1, butterflies: 1 };
    d.earned = 21; d.pts = 6;
    d.notifs = [
      { id: 'n1', level: 'live', t: 'New task added to Gurdwara Hall Cleaning: Water for sangat', d: rel(-8), ref: 'seva:s0' },
      { id: 'n2', level: 'live', t: 'Gurdwara Hall Cleaning has started — your tasks: Sweep and mop, Shoe racks', d: rel(-45), ref: 'seva:s0' },
      { id: 'n6', level: 'action', t: 'Reminder: tomorrow 9:00 AM you\'re cooking dal and sabzi', d: rel(-40), ref: 'seva:s1' },
      { id: 'n4', level: 'p', t: 'Gurpreet invited you to Tree Planting Drive', d: rel(-90), ref: 'seva:s3' },
      { id: 'n5', level: 'done', t: 'Karol Bagh clean-up verified — +3 garden points', d: at(-3, 18), ref: 'tab:garden', read: true },
    ];
  } else if (kind === 'less') {
    d.history = [
      { id: 'h4', title: 'Sunday Langar Seva', cat: 'langar', date: at(-68, 9), role: 'Cooked dal' },
      { id: 'h6', title: 'Tree Planting Drive', cat: 'tree', date: at(-96, 8), role: 'Planted saplings' },
    ];
    d.owned = { marigold: 2, sapling: 1 }; d.earned = 6; d.pts = 3;
    d.notifs = [{ id: 'n4', level: 'p', t: 'New seva near you: Blanket Distribution', d: rel(-90), ref: 'seva:s6' }];
  } else { d.pts = 2; d.earned = 2; d.notifs = [{ id: 'n0', level: 'done', t: 'Welcome to Delhi Central 🙏 Your first 2 garden points are waiting.', d: rel(-5), ref: 'tab:garden' }]; }
  leadSeed(d, kind); admSeed(d);
  return d;
}

const KEY = 'namdhari-seva-v9';
let S;
function fresh(kind = 'active') { return { v: 9, role: 'member', onboarded: false, name: '', scenario: kind, mode: 'auto', gview: '2d', seen: {}, ...scenario(kind) }; }
try {
  S = JSON.parse(localStorage.getItem(KEY));
  if (!S || S.v !== 9) { const old = JSON.parse(localStorage.getItem('namdhari-seva-v8') || localStorage.getItem('namdhari-seva-v7') || 'null'); S = fresh(old?.scenario || 'active'); if (old) Object.assign(S, { onboarded: old.onboarded, name: old.name, mode: old.mode, gview: old.gview }); }
} catch (e) { S = fresh(); }
// notifications created by your own actions in this role count as already seen
const seenIds = new Set();
const save = () => { (S.notifs || []).forEach((n) => { if ((n.role || 'member') === S.role) seenIds.add(n.id); }); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
function setScenario(kind) { const keep = { onboarded: S.onboarded, name: S.name, mode: S.mode, gview: S.gview, role: S.role }; S = { ...fresh(kind), ...keep, scenario: kind }; save(); }

// ---------- Derived model ----------
const ME = () => S.name || 'Member';
const sv = (id) => S.seva.find((x) => x.id === id);
const ev = (id) => S.events.find((x) => x.id === id);
const st = (s) => S.assign[s.id]?.state;
const going = (s) => st(s) === 'going';
const isLive = (x) => T(x.start) <= now() && T(x.end) > now();
const isFuture = (x) => T(x.start) > now();
const myPoints = (s) => s.points.filter((p) => p.takers.includes('@me'));
const nameOf = (t) => t === '@me' ? ME() : t;
const seenAt = (sid) => S.seenUpd[sid] ?? 0;
const unreadUpd = (s) => s.updates.filter((u) => T(u.d) > seenAt(s.id));
const liveMine = () => S.seva.filter((s) => isLive(s) && going(s)).sort((a, b) => T(a.start) - T(b.start));
const liveAll = () => S.seva.filter(isLive);
const liveHome = () => S.seva.filter((s) => isLive(s) && !s.hq).sort((a, b) => going(b) - going(a) || T(a.start) - T(b.start));
const pendingMine = (s) => going(s) && isLive(s) ? myPoints(s).filter((p) => !S.mydone[p.id]) : [];
const newTasks = (s) => s.points.filter((p) => p.live && T(p.at) > (S.seenTasks[s.id] ?? 0));
const needsPick = (s) => going(s) && T(s.end) > now() && !myPoints(s).length;
const contributions = () => S.history.slice().sort((a, b) => T(b.date) - T(a.date));
const isNew = (x) => !S.seen[x.id] && x.created && now() - T(x.created) < 5 * DAY && isFuture(x);
const markSeen = (id) => { if (!S.seen[id]) { S.seen[id] = now(); save(); } };
const notifsFor = () => S.notifs.filter((n) => (n.role || 'member') === S.role);
const unread = () => notifsFor().filter((n) => !n.read).length;
const progress = (s) => { if (!s.points.length) return 0; return Math.round(s.points.reduce((a, p) => a + (S.mydone[p.id] ? 1 : Math.min(1, p.prog || 0)), 0) / s.points.length * 100); };
const filled = (s) => { const need = s.points.reduce((a, p) => a + p.need, 0); const got = s.points.reduce((a, p) => a + Math.min(p.need, p.takers.length), 0); return need ? Math.round(got / need * 100) : 0; };
function peopleOf(s) {
  const list = s.people.map((p) => ({ ...p })); const a = st(s);
  if (a && ['going', 'maybe', 'cant'].includes(a)) list.unshift({ n: ME(), me: true, st: a === 'going' ? (isLive(s) ? 'here' : 'going') : a });
  return list;
}
const goingCount = (s) => peopleOf(s).filter((p) => p.st === 'going' || p.st === 'here').length;

// ---------- Garden item art (2D) ----------
const GI = {
  marigold: { name: 'Marigolds', u: { n: 1 }, desc: 'Bright and cheerful — your very first bloom.', d: () => [-8, 0, 8].map((x, i) => `<g class="sway s${i + 1}"><path d="M${x} 0v-${12 + i * 2}" stroke="#4E8460" stroke-width="2"/><circle cx="${x}" cy="-${14 + i * 2}" r="5" fill="#F29A2E"/><circle cx="${x}" cy="-${14 + i * 2}" r="2" fill="#E0701A"/></g>`).join('') },
  rose: { name: 'Rose bush', u: { n: 2 }, desc: 'A small bush that flowers all season.', d: () => `<g class="sway s2"><ellipse cx="0" cy="-8" rx="15" ry="10" fill="#4F8A5D"/><ellipse cx="-5" cy="-12" rx="9" ry="7" fill="#62A06F"/><circle cx="-7" cy="-13" r="3.2" fill="#D9475B"/><circle cx="5" cy="-10" r="3.2" fill="#E25A6C"/><circle cx="0" cy="-17" r="3.2" fill="#D9475B"/><circle cx="9" cy="-15" r="2.6" fill="#F07A8A"/></g>` },
  sapling: { name: 'Neem sapling', u: { n: 3 }, desc: 'A young neem. It will give shade one day.', d: () => `<g class="sway s3"><path d="M0 0v-26" stroke="#7A5A38" stroke-width="3"/><ellipse cx="-7" cy="-22" rx="8" ry="4" fill="#6BAA74" transform="rotate(-25 -7 -22)"/><ellipse cx="7" cy="-26" rx="8" ry="4" fill="#5E9A68" transform="rotate(25 7 -26)"/><ellipse cx="0" cy="-31" rx="5" ry="7" fill="#7FBA86"/></g>` },
  bench: { name: 'Wooden bench', u: { n: 4 }, desc: 'A place to sit with the sangat.', d: () => `<path d="M-14 -8v8M14 -8v8M0 -1v7M-2 -17v6" stroke="#5B4330" stroke-width="2.5"/><path d="M-18 -10L-2 -18L-2 -30L-18 -22Z" fill="#9A6A40"/><path d="M-18 -10L0 -1L18 -10L2 -18Z" fill="#C48A55"/><path d="M-18 -10L0 -1L0 2L-18 -7Z" fill="#8A5E38"/><path d="M0 -1L18 -10L18 -7L0 2Z" fill="#6E4A2C"/>` },
  lantern: { name: 'Lantern', u: { n: 5 }, desc: 'Glows softly in the evening.', d: () => `<path d="M0 0v-30" stroke="#4A3B2D" stroke-width="2.5"/><circle class="glow" cx="0" cy="-34" r="11" fill="#F6D776" opacity=".5"/><rect x="-5" y="-40" width="10" height="11" rx="2.5" fill="#F3C24F" stroke="#8A6A2A" stroke-width="1.2"/>` },
  cat: { name: 'Cat', u: { n: 6 }, desc: 'A curious cat who naps on the bench and chases butterflies.', d: () => `<g><ellipse cx="0" cy="-7" rx="10" ry="6" fill="#E8A15A"/><circle cx="9" cy="-13" r="5.5" fill="#E8A15A"/><path d="M6 -17l1.5-5 3 4zM10 -18l3-4 1 5z" fill="#E8A15A"/><circle cx="10.5" cy="-13.5" r=".9" fill="#222"/><path class="wag" d="M-10 -8c-6-2-7-9-3-12" stroke="#E8A15A" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M-6 -2v3M5 -2v3" stroke="#C9813F" stroke-width="2.4" stroke-linecap="round"/></g>` },
  pond: { name: 'Lotus pond', u: { n: 8 }, desc: 'Still water with a lotus in bloom.', d: () => `<ellipse cx="0" cy="0" rx="22" ry="11" fill="#6FB4D8"/><ellipse cx="0" cy="-1" rx="17" ry="8" fill="#8CCBEA"/><ellipse cx="-7" cy="1" rx="5" ry="2.5" fill="#5E9A68"/><path d="M4 -1c-3-5 0-9 2-9s5 4 2 9z" fill="#F29BB5"/>` },
  dog: { name: 'Dog', u: { n: 10 }, desc: 'A happy dog who loves to play with the cat.', d: () => `<g><ellipse cx="0" cy="-9" rx="12" ry="7" fill="#B07A4F"/><circle cx="11" cy="-16" r="6.5" fill="#B07A4F"/><ellipse cx="9" cy="-13" rx="2.6" ry="5" fill="#7E5233"/><circle cx="13" cy="-17" r="1" fill="#222"/><circle cx="17" cy="-15" r="1.4" fill="#222"/><path class="wag" d="M-12 -11l-6-6" stroke="#B07A4F" stroke-width="3" stroke-linecap="round"/><path d="M-7 -3v4M6 -3v4" stroke="#8C5D39" stroke-width="2.6" stroke-linecap="round"/></g>` },
  banyan: { name: 'Banyan tree', u: { n: 12 }, desc: 'Wide and generous, like a sangat that keeps growing.', d: () => `<path d="M-14 0v-26M-6 0v-30M6 0v-30M14 0v-24" stroke="#7A5A38" stroke-width="3"/><g class="sway"><ellipse cx="0" cy="-42" rx="30" ry="18" fill="#3E7A52"/><ellipse cx="-12" cy="-46" rx="16" ry="11" fill="#4F8F62"/><ellipse cx="12" cy="-48" rx="14" ry="10" fill="#5A9A6C"/></g>` },
  peacock: { name: 'Peacock', u: { n: 15 }, desc: 'A rare visitor — it comes when the garden is full of life.', d: () => `<g class="sway"><path d="M0 -8C-26 -12 -26 -44 0 -48C26 -44 26 -12 0 -8z" fill="#2E8B6E"/>${[-14, -7, 0, 7, 14].map((x) => `<circle cx="${x}" cy="${-36 + Math.abs(x) * .9}" r="3.4" fill="#1F4E8C"/><circle cx="${x}" cy="${-36 + Math.abs(x) * .9}" r="1.4" fill="#F2C94C"/>`).join('')}</g><ellipse cx="0" cy="-10" rx="5" ry="8" fill="#1F5FA8"/><circle cx="1" cy="-20" r="3.5" fill="#2069B8"/><path d="M4 -20l4 1-4 1" fill="#E3A33B"/>` },
  sunflower: { name: 'Sunflowers', u: { cat: 'langar' }, desc: 'Unlocked by doing langar seva.', d: () => [-6, 7].map((x, i) => `<g class="sway s${i + 2}"><path d="M${x} 0v-${26 + i * 6}" stroke="#4E8460" stroke-width="2.5"/><circle cx="${x}" cy="-${28 + i * 6}" r="8" fill="#F6C42E"/><circle cx="${x}" cy="-${28 + i * 6}" r="3.5" fill="#7A4A1E"/></g>`).join('') },
  mango: { name: 'Mango tree', u: { cat: 'tree' }, desc: 'Unlocked by joining a tree-planting seva.', d: () => `<rect x="-3" y="-24" width="6" height="24" rx="2" fill="#7A5A38"/><g class="sway"><circle cx="0" cy="-38" r="18" fill="#3F7F55"/><circle cx="-10" cy="-32" r="10" fill="#4E9064"/><circle cx="9" cy="-30" r="3.4" fill="#F2A33A"/><circle cx="-6" cy="-42" r="3.4" fill="#F2B83A"/><circle cx="6" cy="-46" r="3" fill="#F2A33A"/></g>` },
  butterflies: { name: 'Butterflies', u: { cat: 'cleanup' }, desc: 'They return to clean places. Unlocked by cleaning seva.', d: () => `<ellipse cx="0" cy="-1" rx="10" ry="3" fill="#6BAA74" opacity=".45"/><g><animateTransform attributeName="transform" type="translate" values="0 0; 8 -6; -6 -10; -10 -2; 0 0" dur="6s" repeatCount="indefinite"/><g transform="translate(-6 -24)"><path class="flap" d="M-7 0c-5-6-10-2-6 3 3 3 6 0 6-3zm0 0c5-6 10-2 6 3-3 3-6 0-6-3z" fill="#B48CE0"/></g></g><g><animateTransform attributeName="transform" type="translate" values="0 0; -8 -4; 4 -8; 8 0; 0 0" dur="5s" repeatCount="indefinite"/><g transform="translate(8 -14)"><path class="flap" d="M-5 0c-4-4-8-1-5 2 2 2 5 0 5-2zm0 0c4-4 8-1 5 2-2 2-5 0-5-2z" fill="#F29A2E"/></g></g>` },
  swing: { name: 'Swing', u: { cat: 'education' }, desc: 'For the children. Unlocked by education seva.', d: () => `<path d="M-16 0l4-34M-4 0l-8-34M16 0l-4-34M4 0l8-34M-12 -34h24" stroke="#8C6A43" stroke-width="2.5" fill="none"/><path d="M-4 -34v22M4 -34v22" stroke="#555" stroke-width="1.2"/><rect x="-6" y="-13" width="12" height="3" rx="1" fill="#C0392B"/>` },
};
GI.tulips = { name: 'Tulips', desc: 'Three tulips in red, gold and pink.', d: () => [-8, 0, 8].map((x, i) => `<g class="sway s${i + 1}"><path d="M${x} 0v-${14 + i * 3}" stroke="#4E8460" stroke-width="2"/><path d="M${x} -4q-6 -3 -7 -10" stroke="#5E9A62" stroke-width="2.2" fill="none"/><path d="M${x - 4.5} -${14 + i * 3}q0 -8 4.5 -9q4.5 1 4.5 9q-4.5 3 -9 0z" fill="${['#E8506A', '#F4B23C', '#E879A8'][i]}"/></g>`).join('') };
GI.cherry = { name: 'Cherry blossom', desc: 'A rare pink tree that blooms for those who serve langar.', d: () => `<path d="M0 0v-22M0 -14l-9 -9M0 -17l8 -8" stroke="#6B4A33" stroke-width="3.5" stroke-linecap="round"/><g class="sway"><circle cx="-11" cy="-30" r="11" fill="#F5A8C5"/><circle cx="9" cy="-32" r="12" fill="#F7B9D1"/><circle cx="-1" cy="-43" r="13" fill="#F29BBE"/><circle cx="-5" cy="-46" r="4" fill="#fff" opacity=".55"/><circle cx="7" cy="-36" r="3" fill="#fff" opacity=".5"/><circle cx="-12" cy="-32" r="2.5" fill="#fff" opacity=".5"/></g><circle class="petal" cx="6" cy="-24" r="2" fill="#F7B9D1"/><circle class="petal" style="animation-delay:-3s" cx="-8" cy="-22" r="1.8" fill="#F29BBE"/>` };
GI.rabbit = { name: 'Rabbit', desc: 'A soft white rabbit that hops between the flower beds.', d: () => `<g class="hop"><ellipse cx="0" cy="-7" rx="9" ry="6.5" fill="#F4F1EC"/><circle cx="8" cy="-13" r="5" fill="#F4F1EC"/><ellipse cx="6.5" cy="-23" rx="1.8" ry="6" fill="#F4F1EC"/><ellipse cx="10" cy="-22" rx="1.8" ry="6" fill="#EDE7DF"/><ellipse cx="6.5" cy="-23" rx=".8" ry="4" fill="#F2B8C6"/><circle cx="10" cy="-14" r="1" fill="#333"/><circle cx="-9" cy="-8" r="2.6" fill="#fff"/><ellipse cx="3" cy="-1" rx="3" ry="1.5" fill="#E6E0D7"/></g>` };
GI.sapling.name = 'Neem tree'; GI.sunflower.desc = 'Tall and bright. Blooms for those who teach and read with children.'; GI.butterflies.desc = 'They return to clean places. Unlocked by cleaning seva.';

// Garden shop: one item unlocks per contribution; specials need conditions.
const SHOP = {
  marigold: { cat: 'flower', cost: 1, ord: 0, max: 6 }, sapling: { cat: 'tree', cost: 1, ord: 1, max: 6 }, tulips: { cat: 'flower', cost: 1, ord: 2, max: 6 }, rose: { cat: 'flower', cost: 2, ord: 3, max: 4 },
  bench: { cat: 'decor', cost: 2, ord: 4, max: 2 }, cat: { cat: 'pet', cost: 4, ord: 5, max: 1 }, lantern: { cat: 'decor', cost: 2, ord: 6, max: 3 }, mango: { cat: 'tree', cost: 3, ord: 7, max: 4 },
  dog: { cat: 'pet', cost: 4, ord: 8, max: 1 }, swing: { cat: 'decor', cost: 3, ord: 9, max: 1 }, pond: { cat: 'decor', cost: 4, ord: 10, max: 1 }, rabbit: { cat: 'pet', cost: 4, ord: 11, max: 2 }, banyan: { cat: 'tree', cost: 5, ord: 12, max: 2 },
  cherry: { cat: 'tree', cost: 3, max: 3, sp: { c: 'langar', k: 2, label: 'Complete 2 Langar seva' } },
  butterflies: { cat: 'decor', cost: 2, max: 2, sp: { c: 'cleanup', k: 1, label: 'Complete 1 Cleaning seva' } },
  sunflower: { cat: 'flower', cost: 2, max: 4, sp: { c: 'education', k: 1, label: 'Complete 1 Education seva' } },
  peacock: { cat: 'pet', cost: 6, max: 1, sp: { n: 10, label: 'Reach 10 contributions' } },
};
const SHOP_ORDER = ['marigold', 'sapling', 'tulips', 'rose', 'bench', 'cat', 'lantern', 'mango', 'cherry', 'butterflies', 'sunflower', 'dog', 'swing', 'pond', 'rabbit', 'banyan', 'peacock'];
const KIND = { tree: 'Trees', flower: 'Flowers', decor: 'Decor', pet: 'Pets' };
const nContrib = () => S.history.length;
const catCount = (c) => S.history.filter((h) => h.cat === c).length;
const spProg = (sp) => sp.c ? [Math.min(sp.k, catCount(sp.c)), sp.k] : [Math.min(sp.n, nContrib()), sp.n];
const isUnlocked = (id) => { const x = SHOP[id]; if (x.sp) { const [a, b] = spProg(x.sp); return a >= b; } return nContrib() >= x.ord; };
const lockText = (id) => { const x = SHOP[id]; if (x.sp) return x.sp.label; const n = x.ord - nContrib(); return `Unlocks after ${n} more seva`; };
const unlockedCount = () => SHOP_ORDER.filter(isUnlocked).length;
const owned = (id) => S.owned[id] || 0;
const inCart = (id) => S.cart[id] || 0;
const cartItems = () => Object.keys(S.cart).filter((k) => S.cart[k] > 0);
const cartQty = () => cartItems().reduce((a, k) => a + S.cart[k], 0);
const cartTotal = () => cartItems().reduce((a, k) => a + S.cart[k] * SHOP[k].cost, 0);
const ownedTotal = () => Object.values(S.owned).reduce((a, b) => a + b, 0);
const art = (id, extra = '') => `<svg viewBox="-34 -60 68 66" ${extra}>${GI[id].d()}</svg>`;
function nextBloom() {
  const sp = SHOP_ORDER.filter((id) => SHOP[id].sp && !isUnlocked(id)).map((id) => { const [a, b] = spProg(SHOP[id].sp); return { id, a, b, r: a / b }; }).sort((x, y) => (y.r < 1) - (x.r < 1) || y.r - x.r).slice(0, 2);
  const seq = SHOP_ORDER.filter((id) => !SHOP[id].sp && !isUnlocked(id)).sort((a, b) => SHOP[a].ord - SHOP[b].ord)[0];
  const seqO = seq ? { id: seq, a: nContrib(), b: SHOP[seq].ord, r: nContrib() / SHOP[seq].ord, seq: true } : null;
  return [...sp, seqO].filter(Boolean);
}

// ---------- Theme ----------
const mq = window.matchMedia('(prefers-color-scheme: dark)');
const isDark = () => S.mode === 'dark' || (S.mode === 'auto' && mq.matches);
function applyTheme() {
  document.documentElement.dataset.mode = isDark() ? 'dark' : 'light';
  $$('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', isDark() ? '#0C0C0D' : '#F7F6F4'));
}
mq.addEventListener && mq.addEventListener('change', () => { applyTheme(); if (S.mode === 'auto') rerender(); });

// ---------- Navigation ----------
let tab = 'home', stack = [];
const scrollMem = {};
const smartSevaTab = () => liveMine().length ? 'ongoing' : 'upcoming';
let sevaSeg = 'mine', sevaChip = null, sevaView = 'list', shopKind = 'all', dtab = 'overview', teamFilter = 'here', teamQ = '';
let calY = new Date().getFullYear(), calM = new Date().getMonth(), calPop = null;
const key = () => tab + '/' + stack.map((v) => v.v + (v.id || '')).join('/');
function push(view) { scrollMem[key()] = window.scrollY; stack.push(view); history.pushState({ d: stack.length }, ''); if (view.v === 'seva') dtab = 'overview'; render(); window.scrollTo(0, 0); }
function pop() { if (stack.length) history.back(); }
window.addEventListener('popstate', () => { if (ignorePop) { ignorePop = false; if (pendingRef) { const r = pendingRef; pendingRef = null; openRef(r); } return; } if ($('.sv')) { closeStory(true); return; } if ($('.sc')) { closeComposer(true); return; } if (stack.length) { leaveDetail(); stack.pop(); closeSheet(); render(); window.scrollTo(0, scrollMem[key()] || 0); } });
function go(t) { closeSheet(); GE = null; if (stack.length) { leaveDetail(); const n = stack.length; stack = []; history.go(-n); } scrollMem[key()] = window.scrollY; if (t === 'seva' && tab !== 'seva') sevaChip = null; tab = t; render(); window.scrollTo(0, scrollMem[key()] || 0); }
function leaveDetail() {} // updates and new tasks stay flagged until their tab is opened

// ---------- Render ----------
function render() {
  applyTheme(); unmount3D(); ensureHQGroup();
  S.groups.forEach((g) => { g.stories = g.stories.filter((x) => x.by !== '@me' || now() - T(x.d) < DAY); }); // own stories expire after 24 h
  if (!S.onboarded) return renderOnboarding();
  const top = stack[stack.length - 1];
  if (top) {
    const V = { report: ReportView, grp: GroupView, compose: Compose, user: UserProfile, seva: (v) => (isAdmin() || (isLead() && !sv(v.id)?.hq)) && !v.asMember ? LeadSevaDetail(v) : SevaDetail(v), event: EventDetail, history: HistoryDetail, inbox: Inbox, team: TeamScreen, journey: JourneyScreen, attend: AttendScreen, create: CreateSeva };
    $('#app').innerHTML = `<main class="screen detail">${offline()}${V[top.v](top)}</main>`;
  } else {
    if (tab === 'team' && !isLead()) tab = 'home';
    if (isAdmin() && !['stats', 'seva', 'feed', 'people', 'profile'].includes(tab)) tab = 'stats';
    if (!isAdmin() && ['stats', 'feed', 'people'].includes(tab)) tab = 'home';
    const screens = isAdmin() ? { stats: AdminStats, seva: AdminSeva, feed: Home, people: AdminPeople, profile: AdminProfile } : { home: Home, seva: SevaTab, garden: GardenTab, profile: Profile, team: LeadTeam };
    const flush = tab === 'garden'; const arr = tab === 'garden' && GE;
    $('#app').innerHTML = `<main class="screen ${flush ? 'flush' : ''}">${flush ? '' : offline()}${arr ? ArrangeView() : screens[tab]()}</main>${tab === 'garden' && cartQty() && !arr ? cartBar() : ''}${arr ? '' : tabbar()}`;
  }
  if (!stack.length && tab === 'garden' && S.gview === '3d' && !GE) mount3D(ensureLayout(), itemSheet);
  if (top?.v === 'user' && uview === '3d') mount3D(genLayout(top.n), (id) => toast(GI[id].name));
  if (!stack.length && (tab === 'home' || tab === 'feed')) { setupFeed(); setupLiveCarousel(); }
}
function rerender() { const y = window.scrollY; render(); window.scrollTo(0, y); }
function tabbar() {
  if (isAdmin()) { const al = alertsList().filter((a) => a[0] === 'bad').length; const items = [['stats', 'Stats', svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'), al ? `<span class="nb" style="background:var(--live)">${al}</span>` : ''], ['seva', 'Seva', I.seva, '<span class="livetag">LIVE</span>'], ['feed', 'Feed', I.megaphone, ''], ['people', 'People', I.team, ''], ['profile', 'Profile', I.profile, '']];
    return `<div class="tabbar"><nav aria-label="Main">${items.map(([id, l, ic, b]) => `<button data-tab="${id}" ${tab === id ? 'aria-current="page"' : ''} aria-label="${l}"><span class="ic">${ic}${b}</span>${l}</button>`).join('')}</nav></div>`; }
  const live = liveMine().length; const upd = liveMine().reduce((a, s) => a + unreadUpd(s).length, 0);
  const att = isLead() ? localSeva().filter(needsAttend).length : 0;
  const items = [['home', 'Home', I.home, ''], ['seva', 'Seva', I.seva, live || (isLead() && localSeva().some(isLive)) ? `<span class="livetag">LIVE</span>` : att ? `<span class="nb" style="background:var(--action-c);color:#2A1A00">${att}</span>` : ''], ...(isLead() ? [['team', 'Team', I.team, S.requests.length ? `<span class="nb">${S.requests.length}</span>` : '']] : []), ['garden', 'Garden', I.garden, S.pts >= 1 && isUnlocked('marigold') && !ownedTotal() ? '<span class="nb">!</span>' : ''], ['profile', 'Profile', I.profile, '']];
  return `<div class="tabbar"><nav aria-label="Main">${items.map(([id, l, ic, b]) => `<button data-tab="${id}" ${tab === id ? 'aria-current="page"' : ''} aria-label="${l}${id === 'seva' && live ? ', seva live now' + (upd ? `, ${upd} new updates` : '') : ''}"><span class="ic">${ic}${b}</span>${l}</button>`).join('')}</nav></div>`;
}
const offline = () => navigator.onLine ? '' : `<div class="banner" style="margin:8px 0">${I.wifi}<span>Offline — showing saved information.</span></div>`;
const LOGO = `<svg class="logo" viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6A5AE0"/><stop offset="1" stop-color="#3F2F99"/></linearGradient></defs><rect width="40" height="40" rx="12" fill="url(#lg1)"/><path d="M20 31v-10" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><path d="M20 21c0-5 3.5-8.5 9-8.5 0 5.5-3.5 8.5-9 8.5z" fill="#9AE6B4"/><path d="M20 23.5c0-4-2.8-6.8-7.5-6.8 0 4.4 2.8 6.8 7.5 6.8z" fill="#fff"/></svg>`;
const bellBtn = () => `<button class="iconbtn" data-act="inbox" aria-label="Notifications, ${unread()} unread">${I.bell}${unread() ? `<span class="nb">${unread()}</span>` : ''}</button>`;
const faceRow = (names, total, max = 4) => `<span class="faces">${names.slice(0, max).map((n) => `<span class="fa" style="background:${n === ME() ? 'var(--p)' : avColor(n)}" title="${esc(n)}">${initials(n)}</span>`).join('')}${total > max ? `<span class="fa plus">+${total - max}</span>` : ''}</span>`;
const dtop = (title, right = '') => `<div class="dtop"><button class="iconbtn" data-act="back" aria-label="Back">${I.back}</button><span class="t">${title}</span>${right || '<span style="width:42px"></span>'}</div>`;
const emptyState = (t, d, cta = '') => `<div class="empty"><div class="ill">${I.leaf}</div><b>${t}</b><p class="muted small" style="margin-top:4px">${d}</p>${cta}</div>`;
const sheetHead = (t, sub = '') => `<div class="sheet-h"><div><h2>${t}</h2>${sub ? `<p class="small muted">${sub}</p>` : ''}</div><button class="iconbtn solid" data-act="close-sheet" aria-label="Close">${I.close}</button></div>`;

// =================== HOME ===================
function groupAv(g) { return `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="ga-${g.id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${g.hue[0]}"/><stop offset="1" stop-color="${g.hue[1]}"/></linearGradient></defs><rect width="64" height="64" fill="url(#ga-${g.id})"/><path d="M0 48 Q16 38 32 46 T64 42 V64 H0Z" fill="#fff" opacity=".18"/><text x="32" y="38" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-weight="800" font-size="17" letter-spacing="1" fill="#fff">${g.code}</text></svg>`; }
// stories seen are tracked per viewer, so a lead's own post still shows as new to members
const SS = () => { if (!S.ssr) S.ssr = { member: { ...(S.storySeen || {}) }, lead: { ...(S.storySeen || {}) } }; return S.ssr[S.role] || (S.ssr[S.role] = {}); };
const lastStory = (g) => Math.max(...g.stories.map((x) => T(x.d)), 0);
const POSTERS = { st1: 'Gurpreet Singh', st2: 'Manjit Kaur', st3: 'Simran Kaur', st4: 'Jagdeep Singh', st5: 'Sarabjit Kaur', st6: 'Harbans Singh', st7: 'Ranjit Singh', st8: 'Kamaljeet Kaur', st9: 'Satnam Singh' };
const posterOf = (x) => x.by === '@me' ? ME() : x.poster || POSTERS[x.id] || 'Team lead';
const storyOrder = () => S.groups.filter((g) => g.stories.length).sort((a, b) => groupSeen(a) - groupSeen(b) || lastStory(b) - lastStory(a));
const groupSeen = (g) => g.stories.every((s) => SS()[s.id]);
function storiesRow() {
  const gs = storyOrder();
  return `<div class="stories" role="list" aria-label="Stories from team leads">${isLead() || isAdmin() ? yourStoryRing() : ''}${gs.filter((g) => g.stories.length).map((g) => `<button class="story ${groupSeen(g) ? 'seen' : ''}" role="listitem" data-story="${g.id}" aria-label="${esc(g.full)} stories${groupSeen(g) ? ', seen' : ''}"><span class="ring"><span>${groupAv(g)}</span></span><b>${esc(g.name)}</b></button>`).join('')}</div>`;
}
function liveBanner(s) {
  if (!going(s)) { const here = peopleOf(s).filter((p) => p.st === 'here').length; return `<button class="livebanner tap" data-open="seva:${s.id}"><span class="art cc-${s.cat}" style="color:var(--cc)">${CAT[s.cat].ic}</span><div class="grow"><span class="livepill"><i></i>LIVE NOW</span><h3 class="ellipsis">${esc(s.title)}</h3><p class="m ellipsis">${here} sevadars here · ${openPtsN(s)} task${openPtsN(s) === 1 ? '' : 's'} need help</p></div><span class="status st-up" style="flex:none">Join</span></button>`; }
  const n = unreadUpd(s).length + newTasks(s).length; const mine = pendingMine(s).length;
  return `<button class="livebanner tap" data-open="seva:${s.id}"><span class="art cc-${s.cat}" style="color:var(--cc)">${CAT[s.cat].ic}</span><div class="grow"><span class="livepill"><i></i>LIVE NOW</span><h3 class="ellipsis">${esc(s.title)}</h3><p class="m ellipsis">${mine ? `<b class="pend">${mine} to tick</b> · ` : needsPick(s) ? '<b class="pend">Pick a task</b> · ' : 'You\'re here · '}${progress(s)}% done · ends ${fmtTime(s.end)}</p></div>${n ? `<span class="newbadge">${I.bell}${n} new</span>` : ''}${chev}</button>`;
}
function Home() {
  const live = isAdmin() ? [] : liveHome();
  const next = !isAdmin() && !liveMine().length ? S.seva.filter((s) => isFuture(s) && going(s)).sort((a, b) => T(a.start) - T(b.start))[0] : null;
  return `<header class="apphdr">${LOGO}<h1>${isAdmin() ? 'Feed' : 'Namdhari Seva'}</h1><span class="sp"></span>${bellBtn()}</header>
    ${storiesRow()}
    ${isLead() ? leadGlance() : ''}
    ${live.length > 1 ? `<div class="lhead"><span class="livepill"><i></i>${live.length} LIVE NOW</span><span class="xs muted">Swipe to see all ${I.arrow.replace('<svg', '<svg style="width:13px;height:13px;vertical-align:-2px"')}</span></div><div class="lcar" id="lcar">${live.map(liveBanner).join('')}</div><div class="ldots" id="ldots">${live.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>` : live.map(liveBanner).join('')}
    ${next ? `<button class="livebanner tap" style="background:var(--surface);border-color:var(--border)" data-open="seva:${next.id}"><span class="art cc-${next.cat}" style="color:var(--cc);background:color-mix(in srgb,var(--cc) 14%,transparent)">${CAT[next.cat].ic}</span><div class="grow"><span class="status st-up">${I.clock}Your next seva</span><h3 class="ellipsis">${esc(next.title)}</h3><p class="m ellipsis">${relDay(next.start)} · ${fmtTime(next.start)}</p></div>${chev}</button>` : ''}
    ${isAdmin() ? `<button class="fab" data-act="compose" aria-label="New post">${I.plus}<span>New post</span></button>` : ''}
    <div style="margin-top:18px" id="feed">${S.feed.slice(0, feedShown).map(postCard).join('')}</div>
    ${feedShown < S.feed.length ? feedMore() : caughtUp()}`;
}
// Feed loads a few posts at a time as you scroll (keeps server and database load low)
const FEED_PAGE = 3;
let feedShown = FEED_PAGE, feedLoading = false, feedIO = null;
const caughtUp = () => `<p class="xs faint" id="feed-end" style="text-align:center;margin:20px 0 4px">You're all caught up 🙏</p>`;
const feedMore = () => `<div id="feed-more" aria-label="Loading more posts"><div class="post skelpost"><div class="ph"><span class="skel" style="width:38px;height:38px;border-radius:50%"></span><span class="skel" style="height:14px;width:45%;border-radius:6px"></span></div><div class="skel" style="height:220px;margin:0 12px 14px;border-radius:18px"></div></div></div>`;
function setupFeed() {
  feedIO && feedIO.disconnect(); const el = $('#feed-more'); if (!el || !('IntersectionObserver' in window)) return;
  feedIO = new IntersectionObserver((en) => { if (en[0].isIntersecting) loadMoreFeed(); }, { rootMargin: '400px 0px' }); feedIO.observe(el);
}
function loadMoreFeed() {
  if (feedLoading || feedShown >= S.feed.length) return; feedLoading = true;
  setTimeout(() => { // stands in for the network request for the next page
    feedLoading = false; const box = $('#feed'); if (!box) return;
    box.insertAdjacentHTML('beforeend', S.feed.slice(feedShown, feedShown + FEED_PAGE).map(postCard).join('')); feedShown += FEED_PAGE;
    if (feedShown >= S.feed.length) { feedIO && feedIO.disconnect(); $('#feed-more')?.insertAdjacentHTML('afterend', caughtUp()); $('#feed-more')?.remove(); }
  }, 650);
}
function setupLiveCarousel() {
  const c = $('#lcar'); if (!c) return; if (setupLiveCarousel.x) c.scrollLeft = setupLiveCarousel.x;
  const upd = () => { setupLiveCarousel.x = c.scrollLeft; const kids = [...c.children]; const mid = c.scrollLeft + c.clientWidth / 2; let best = 0, bd = 1e9; kids.forEach((k, i) => { const d = Math.abs(k.offsetLeft + k.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = i; } }); $$('#ldots i').forEach((d, i) => d.classList.toggle('on', i === best)); };
  c.addEventListener('scroll', upd, { passive: true }); upd();
}
const PK = {
  thought: { label: 'Thought of the Day', ic: I.sun, cls: '', grad: ['#FFE9C9', '#FFC9A6', '#F9A9BC'] },
  hukam: { label: 'Satguru Ji\'s Hukam', ic: I.sparkle, cls: 'light', grad: ['#F7A428', '#D9480F', '#8A1C3B'] },
  alert: { label: 'Important alert', ic: I.alert, cls: 'light', grad: ['#FF5A5F', '#E0263F', '#A3122E'] },
  appreciation: { label: 'Appreciation', ic: I.heart, cls: '', grad: ['#E3F9C6', '#A7F0C2', '#7DE3D6'] },
  event: { label: 'Upcoming event', ic: I.cal, cls: 'light', grad: ['#7C4DFF', '#9C3FD8', '#C2389E'] },
  info: { label: 'Information', ic: I.info, cls: '', grad: ['#E0ECFF', '#CBD8FF', '#D9CCFF'] },
  text: { label: 'Message', ic: I.msg, cls: '', grad: ['#FFFFFF', '#FFFFFF', '#FFFFFF'] },
  seva: { label: 'Seva from HQ', ic: I.globe, cls: '', grad: ['#FFF6DB', '#FFE08A', '#FFC24D'] },
};
function postArt(p) {
  const k = PK[p.type]; const g = `pg-${p.id}`;
  const deco = {
    thought: `<circle cx="330" cy="330" r="120" fill="#FFF3D6" opacity=".7"/><circle cx="330" cy="330" r="80" fill="#FFE0A3" opacity=".8"/><circle cx="60" cy="40" r="60" fill="#fff" opacity=".25"/><path d="M0 260 Q100 230 200 260 T400 250 V300 H0Z" fill="#fff" opacity=".22"/>`,
    hukam: `<g opacity=".18" stroke="#fff" fill="none" stroke-width="1.5" transform="translate(330 70)">${[30, 52, 74, 96].map((r) => `<circle r="${r}"/>`).join('')}${Array.from({ length: 16 }, (_, i) => `<path transform="rotate(${i * 22.5})" d="M0 -30 Q12 -60 0 -96 Q-12 -60 0 -30"/>`).join('')}</g><circle cx="40" cy="280" r="90" fill="#fff" opacity=".07"/>`,
    alert: `<g opacity=".22">${Array.from({ length: 14 }, (_, i) => `<path d="M${i * 34 - 40} 0 l20 0 l-26 26 l-20 0z" fill="#FFD43B"/>`).join('')}</g><path d="M300 120 L392 280 H208Z" fill="#fff" opacity=".1"/><text x="300" y="262" font-size="90" font-weight="900" fill="#fff" opacity=".12" text-anchor="middle" font-family="Inter,system-ui">!</text>`,
    appreciation: Array.from({ length: 26 }, (_, i) => `<rect x="${(i * 53) % 400}" y="${(i * 37) % 300}" width="8" height="4" rx="1" fill="${['#F59E0B', '#E0458F', '#3B7BE0', '#22C55E'][i % 4]}" opacity=".55" transform="rotate(${i * 29} ${(i * 53) % 400} ${(i * 37) % 300})"/>`).join(''),
    event: `<circle cx="340" cy="60" r="90" fill="#fff" opacity=".08"/><circle cx="40" cy="270" r="70" fill="#fff" opacity=".08"/>${Array.from({ length: 18 }, (_, i) => `<circle cx="${(i * 71) % 400}" cy="${(i * 43) % 300}" r="${1 + i % 3}" fill="#fff" opacity=".35"/>`).join('')}`,
    seva: `<g opacity=".16" fill="none" stroke="#7A3E00" stroke-width="1.4" transform="translate(340 70)">${[26, 46, 66, 86].map((r) => `<circle r="${r}"/>`).join('')}</g><path d="M0 250 Q120 215 240 245 T400 235 V300 H0Z" fill="#fff" opacity=".35"/>`,
    info: Array.from({ length: 12 }, (_, r) => Array.from({ length: 16 }, (_, c) => `<circle cx="${c * 26 + 8}" cy="${r * 26 + 8}" r="1.3" fill="#3B5BDB" opacity=".18"/>`).join('')).join(''),
  }[p.type];
  return `<svg class="bgart" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${k.grad[0]}"/><stop offset=".55" stop-color="${k.grad[1]}"/><stop offset="1" stop-color="${k.grad[2]}"/></linearGradient></defs><rect width="400" height="300" fill="url(#${g})"/>${deco}</svg>`;
}
const rx = (p) => S.react[p.id] || {};
function reactBar(p) {
  const r = rx(p); const g = p.r.g + (r.g ? 1 : 0), s = p.r.s + (r.s ? 1 : 0);
  return `<div class="pacts"><button class="pact grat" data-react="${p.id}:g" aria-pressed="${!!r.g}" aria-label="Gratitude">${gratIc(r.g)}${num(g)}</button><button class="pact supp" data-react="${p.id}:s" aria-pressed="${!!r.s}" aria-label="Support">${suppIc(r.s)}${num(s)}</button></div>`;
}
const gratIc = (on) => `<span class="em">🙏</span>`;
const suppIc = (on) => `<span class="em">🤝</span>`;
function postCard(p) {
  const k = PK[p.type]; const e = p.ev ? ev(p.ev) : null; const r = rx(p);
  const hs = p.sid ? sv(p.sid) : null;
  if (hs) return sevaPost(p, hs);
  if (p.type === 'text') return `<article class="post" id="post-${p.id}"><div class="ph"><span class="av">${LOGO}</span><div class="grow"><b>Namdhari Seva HQ</b><span class="adminpill">Official</span><p class="xs muted">Message · ${ago(p.d)}</p></div>${isAdmin() && p.id !== 'cp' ? `<button class="iconbtn" data-act="post-menu" data-id="${p.id}" aria-label="Post options">${I.more}</button>` : ''}</div><div class="ptext" data-dbl="${p.id}"><p class="${p.text.length > 280 ? 'clamp' : ''}">${esc(p.text).replace(/\n/g, '<br>')}</p>${p.text.length > 280 ? '<button class="link" data-act="more-text">Read more</button>' : ''}</div>${reactBar(p)}</article>`;
  const body = p.type === 'thought' ? `<p class="msg big">“${esc(p.text)}”</p>`
    : p.type === 'appreciation' ? `<p class="ttl" style="font-style:normal;font-family:var(--font);font-weight:800;font-size:44px;letter-spacing:-.03em">${esc(p.stat)}</p><p class="msg">${esc(p.text)}</p>`
    : p.type === 'event' && e ? `<div class="row" style="align-items:flex-end;gap:14px"><span class="datebox"><b>${new Date(e.start).getDate()}</b><span>${new Date(e.start).toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}</span></span><div><p class="ttl" style="margin:0">${esc(e.title)}</p><p class="small" style="opacity:.9;margin-top:4px">${relDay(e.start)} · ${fmtTime(e.start)}</p></div></div><p class="msg" style="font-size:16px">${esc(p.text)}</p>`
    : `<p class="ttl">${esc(p.title)}</p><p class="msg">${esc(p.text)}</p>`;
  const rsvp = e && S.rsvp[e.id] === 'going';
  return `<article class="post" id="post-${p.id}"><div class="ph"><span class="av">${LOGO}</span><div class="grow"><b>Namdhari Seva HQ</b><span class="adminpill">Official</span><p class="xs muted">${k.label} · ${ago(p.d)}</p></div></div>
    ${isAdmin() && p.id !== 'cp' ? `<button class="iconbtn postmenu" data-act="post-menu" data-id="${p.id}" aria-label="Post options">${I.more}</button>` : ''}<div class="pcard ${k.cls}" data-dbl="${p.id}">${postArt(p)}<span class="kind">${k.ic}${p.type === 'thought' || p.type === 'appreciation' ? k.label : p.type === 'event' ? 'Upcoming event' : k.label}</span>${body}${p.link ? `<button class="cta" data-open="${p.link}">${rsvp ? `${I.check} You're going` : p.cta}${rsvp ? '' : I.arrow}</button>` : ''}</div>
    ${reactBar(p)}<div class="pcap"><span class="muted">${r.g ? 'You and ' + num(p.r.g) + ' others said 🙏' : 'Double-tap the card to say 🙏'}</span></div></article>`;
}

// HQ seva in the feed: stays as a record; shows its state (upcoming, live, done)
function sevaPost(p, s) {
  const d = new Date(s.start); const ended = T(s.end) < now(); const live = isLive(s); const a = st(s); const g = peopleOf(s).filter((x) => x.st === 'going' || x.st === 'here');
  return `<article class="post hqpost" id="post-${p.id}"><div class="ph"><span class="av">${LOGO}</span><div class="grow"><b>Namdhari Seva HQ</b><span class="adminpill">Official</span><p class="xs muted">${ended ? 'Seva · completed' : live ? 'Seva · live now' : 'Upcoming seva'} · ${ago(p.d)}</p></div></div>
    <div class="pcard" data-dbl="${p.id}">${postArt(p)}<span class="kind">${I.globe}${ended ? 'Completed seva' : live ? 'Live seva' : 'Upcoming seva'}</span>
      <span class="hqtag">${I.pin}${esc(s.region)} · not your area</span>
      <div class="row" style="align-items:flex-end;gap:14px;margin-top:14px"><span class="datebox" style="color:#7A3E00"><b>${d.getDate()}</b><span>${d.toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}</span></span><div class="grow"><p class="ttl" style="margin:0;font-style:normal;font-family:var(--font);font-weight:800;font-size:25px;letter-spacing:-.02em">${esc(s.title)}</p><p class="small" style="margin-top:4px;opacity:.85">${relDay(s.start)} · ${fmtTime(s.start)}</p></div></div>
      <p class="msg" style="font-size:16px">${esc(p.text)}</p>
      <div class="row" style="margin-top:12px;gap:8px">${faceRow(g.map((x) => x.n), g.length, 4)}<span class="small" style="font-weight:650">${num(g.length)} going</span></div>
      <button class="cta" style="background:#2B1E14;color:#fff" data-open="seva:${s.id}">${a === 'going' ? `${I.check} You're going · View` : ended ? 'See seva' : 'View seva'}${a === 'going' ? '' : I.arrow}</button></div>
    ${reactBar(p)}</article>`;
}

// ----- Story viewer (Instagram-style) -----
// Tap right = next story (then next group), tap left = previous. Swipe left/right = next/previous group
// with a cube turn. Press and hold = pause. Swipe down = close.
const STH = { live: ['#FF5A6E', '#B5122F'], langar: ['#F7A428', '#D9480F'], river: ['#0EA5E9', '#0F766E'], tree: ['#34C76A', '#0F766E'], gold: ['#F6C453', '#C2410C'], night: ['#1E3A8A', '#6D28D9'], edu: ['#EC4899', '#7C3AED'] };
const STORY_MS = 5000;
let SV = null;
const grp = (id) => S.groups.find((x) => x.id === id);
const startIdx = (g) => { const i = g.stories.findIndex((s) => !SS()[s.id]); return i < 0 ? 0 : i; };
function storyArt(s) { const h = STH[s.theme] || STH.night; return `<svg class="bgart" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="sg-${s.id}" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="${h[0]}"/><stop offset="1" stop-color="${h[1]}"/></linearGradient></defs><rect width="400" height="800" fill="url(#sg-${s.id})"/><circle cx="360" cy="120" r="160" fill="#fff" opacity=".08"/><circle cx="40" cy="700" r="200" fill="#fff" opacity=".07"/><circle cx="300" cy="620" r="60" fill="#fff" opacity=".06"/>${s.theme === 'live' ? `<circle cx="200" cy="230" r="70" fill="#fff" opacity=".1"><animate attributeName="r" values="60;90;60" dur="2s" repeatCount="indefinite"/></circle>` : ''}</svg>`; }
function faceHTML(gid, i, active) {
  const g = grp(gid); const s = g.stories[i];
  const own = s.by === '@me';
  return `${s.custom ? customSlide(s) : `<div class="slide">${storyArt(s)}<span class="skind">${esc(s.kind)}</span><h2 class="sttl">${esc(s.title)}</h2><p class="smsg">${esc(s.msg)}</p></div>`}
    <div class="bars">${g.stories.map((x, k) => `<i class="${k < i ? 'done' : k === i && active ? 'cur' : ''}"><b></b></i>`).join('')}</div>
    <div class="top"><span class="gav">${groupAv(g)}</span><div class="who"><div><b>${esc(g.full)}</b> <span>${ago(s.d)}</span></div><button class="poster" data-act="story-user" data-n="${esc(posterOf(s))}">Posted by ${own ? 'you' : esc(posterOf(s))}</button></div>${own ? `<button data-act="story-del" data-id="${s.id}" aria-label="Delete story" style="margin-left:auto">${I.trash}</button>` : ''}<button data-act="story-close" aria-label="Close" ${own ? 'style="margin-left:0"' : ''}>${I.close}</button></div>
    ${own ? `<p class="by">Your story · ${Math.max(1, Math.round((DAY - (now() - T(s.d))) / HOUR))} h left</p>` : ''}
    ${s.link ? `<button class="sbtn" data-act="story-link" data-ref="${s.link}">${esc(s.cta || 'Open')}${I.arrow}</button>` : ''}<span class="shade"></span>`;
}
function openStory(gid) {
  const order = storyOrder().map((g) => g.id);
  if (!SV) history.pushState({ story: 1 }, '');
  if (SV?.raf) cancelAnimationFrame(SV.raf);
  SV = { order, gi: order.indexOf(gid), i: startIdx(grp(gid)), el: 0, last: 0, bar: null, busy: false, paused: false, loading: false };
  SV.raf = requestAnimationFrame(storyTick);
  let host = $('#sv-root'); if (!host) { host = document.createElement('div'); host.id = 'sv-root'; document.body.appendChild(host); }
  host.innerHTML = `<div class="sv" role="dialog" aria-label="Stories"><div class="stage"><div class="cube"></div></div></div>`;
  document.body.style.overflow = 'hidden';
  buildCube(); showStory();
}
const W = () => $('.sv .stage').clientWidth;
// three faces: previous group, current, next group
function buildCube(prevI) {
  const w = W(), h = w / 2; const cube = $('.sv .cube'); const cur = SV.order[SV.gi], pv = SV.order[SV.gi - 1], nx = SV.order[SV.gi + 1];
  cube.style.transition = 'none'; cube.style.transform = `translateZ(-${h}px) rotateY(0deg)`;
  cube.innerHTML = `${pv ? `<div class="face" data-f="prev" style="transform:rotateY(-90deg) translateZ(${h}px)">${faceHTML(pv, prevI ?? startIdx(grp(pv)), false)}</div>` : ''}
    <div class="face" data-f="cur" style="transform:rotateY(0deg) translateZ(${h}px)">${faceHTML(cur, SV.i, true)}</div>
    ${nx ? `<div class="face" data-f="next" style="transform:rotateY(90deg) translateZ(${h}px)">${faceHTML(nx, startIdx(grp(nx)), false)}</div>` : ''}`;
}
function showStory() {
  const g = grp(SV.order[SV.gi]); const s = g.stories[SV.i];
  SS()[s.id] = now(); save();
  const f = $('.sv .face[data-f="cur"]'); f.innerHTML = faceHTML(g.id, SV.i, true);
  SV.el = 0; SV.bar = f.querySelector('.bars i.cur b');
  // a photo story waits for its image before the clock starts (like Instagram)
  const im = f.querySelector('.simg'); SV.loading = !!(im && !im.complete); if (SV.loading) { const k = s.id; const go = () => { if (SV && grp(SV.order[SV.gi]).stories[SV.i]?.id === k) { SV.loading = false; SV.last = 0; } }; im.addEventListener('load', go, { once: true }); im.addEventListener('error', go, { once: true }); }
}
// One clock drives both the progress bar and the move to the next story, so they always match.
function storyTick() {
  if (!SV) return; const t = performance.now(); const dt = SV.last ? Math.min(100, t - SV.last) : 0; SV.last = t;
  if (!SV.paused && !SV.busy && !SV.loading) SV.el += dt;
  if (SV.bar) SV.bar.style.width = Math.min(100, SV.el / STORY_MS * 100) + '%';
  if (SV.el >= STORY_MS && !SV.busy && !SV.paused) { SV.el = 0; storyStep(1); }
  if (SV) SV.raf = requestAnimationFrame(storyTick);
}
function storyTimer() { if (SV) { SV.paused = false; SV.last = 0; } }
function pauseStory() { if (!SV || SV.paused) return; SV.paused = true; $('.sv')?.classList.add('paused'); }
function resumeStory() { if (!SV || !SV.paused) return; SV.paused = false; SV.last = 0; $('.sv')?.classList.remove('paused', 'holding'); }
// within a group first, then across groups
function storyStep(d) {
  if (!SV || SV.busy) return; const g = grp(SV.order[SV.gi]);
  if (d > 0 && SV.i < g.stories.length - 1) { SV.i++; showStory(); return; }
  if (d < 0 && SV.i > 0) { SV.i--; showStory(); return; }
  if (d < 0 && SV.gi === 0) { showStory(); return; }
  turnGroup(d, d < 0 ? 'last' : 'start');
}
function shade(angle) { const a = Math.abs(angle) / 90; const c = $('.sv .face[data-f="cur"] .shade'); if (c) c.style.opacity = a * .55; const o = $(`.sv .face[data-f="${angle < 0 ? 'next' : 'prev'}"] .shade`); if (o) o.style.opacity = (1 - a) * .55; }
function setAngle(angle, anim) { const cube = $('.sv .cube'); cube.style.transition = anim ? 'transform .38s cubic-bezier(.2,.75,.25,1)' : 'none'; cube.style.transform = `translateZ(-${W() / 2}px) rotateY(${angle}deg)`; $$('.sv .shade').forEach((s) => { s.style.transition = anim ? 'opacity .38s' : 'none'; }); shade(angle); }
function turnGroup(d, where) {
  if (!SV || SV.busy) return;
  const target = SV.gi + d;
  if (target >= SV.order.length) { closeStory(); return; }
  if (target < 0) { setAngle(0, true); return; }
  if (d < 0 && where === 'last') { const pg = grp(SV.order[target]); const pf = $('.sv .face[data-f="prev"]'); if (pf) pf.innerHTML = faceHTML(pg.id, pg.stories.length - 1, false); }
  SV.busy = true; clearTimeout(SV.t);
  setAngle(d > 0 ? -90 : 90, true);
  setTimeout(() => {
    if (!SV) return; SV.gi = target; const g = grp(SV.order[target]);
    SV.i = d < 0 && where === 'last' ? g.stories.length - 1 : startIdx(g);
    SV.busy = false; SV.paused = false; $('.sv')?.classList.remove('paused', 'holding');
    buildCube(); showStory();
  }, 390);
}
let ignorePop = false, pendingRef = null;
function closeStory(fromPop) {
  if (!SV) return; cancelAnimationFrame(SV.raf); SV = null; const el = $('.sv');
  const done = () => { $('#sv-root').innerHTML = ''; document.body.style.overflow = ''; if (!stack.length && tab === 'home') rerender(); };
  if (el) { el.classList.add('out'); setTimeout(done, 200); } else done();
  if (!fromPop) { ignorePop = true; history.back(); }
}
// gestures
let G = null;
function svDown(e) {
  if (!SV || SV.busy || e.target.closest('button')) return;
  G = { x: e.clientX, y: e.clientY, t: now(), axis: null, dx: 0, dy: 0, id: e.pointerId };
  try { e.target.setPointerCapture(e.pointerId); } catch (err) {}
  pauseStory(); G.hold = setTimeout(() => $('.sv')?.classList.add('holding'), 260);
}
function svMove(e) {
  if (!G || e.pointerId !== G.id) return;
  G.dx = e.clientX - G.x; G.dy = e.clientY - G.y;
  if (!G.axis && Math.hypot(G.dx, G.dy) > 10) { G.axis = Math.abs(G.dx) > Math.abs(G.dy) ? 'x' : 'y'; clearTimeout(G.hold); $('.sv')?.classList.remove('holding'); }
  if (G.axis === 'x') { let a = G.dx / W() * 90; if ((a > 0 && SV.gi === 0) || (a < 0 && SV.gi === SV.order.length - 1)) a *= .3; setAngle(Math.max(-90, Math.min(90, a)), false); }
  if (G.axis === 'y' && G.dy > 0) { const st = $('.sv .stage'); st.style.transition = 'none'; st.style.transform = `translateY(${G.dy}px) scale(${1 - Math.min(.25, G.dy / 1600)})`; st.style.borderRadius = '18px'; $('.sv').style.background = `rgba(0,0,0,${Math.max(.2, 1 - G.dy / 500)})`; }
}
function svUp(e) {
  if (!G || e.pointerId !== G.id) return; const g = G; G = null; clearTimeout(g.hold);
  const dt = now() - g.t, w = W();
  if (g.axis === 'x') {
    const v = g.dx / Math.max(1, dt);
    if (g.dx < -w * .25 || v < -.5) { if (SV.gi < SV.order.length - 1) turnGroup(1, 'start'); else closeStory(); }
    else if (g.dx > w * .25 || v > .5) { if (SV.gi > 0) turnGroup(-1, 'start'); else { setAngle(0, true); resumeStory(); } }
    else { setAngle(0, true); resumeStory(); }
    return;
  }
  if (g.axis === 'y') {
    const st = $('.sv .stage');
    if (g.dy > 110) { st.style.transition = 'transform .2s'; st.style.transform = `translateY(${window.innerHeight}px) scale(.8)`; closeStory(); return; }
    st.style.transition = 'transform .25s'; st.style.transform = ''; st.style.borderRadius = ''; $('.sv').style.background = ''; resumeStory(); return;
  }
  if (g.axis === 'none') { resumeStory(); return; }
  if (dt < 260) { SV.paused = false; $('.sv')?.classList.remove('paused', 'holding'); storyStep(g.x < w * .3 + $('.sv .stage').getBoundingClientRect().left ? -1 : 1); return; }
  resumeStory();
}
document.addEventListener('pointerdown', (e) => { if (e.target.closest('.sv')) svDown(e); });
document.addEventListener('pointermove', (e) => { if (G) svMove(e); });
document.addEventListener('pointerup', (e) => { if (G) svUp(e); });
document.addEventListener('pointercancel', (e) => { if (G) { G.axis = G.axis || 'none'; svUp(e); } });
document.addEventListener('visibilitychange', () => { if (!SV) return; if (document.hidden) pauseStory(); else resumeStory(); });

// =================== SEVA ===================
const dblock = (s, cat, live, endOf) => { const d = new Date(s); return `<span class="dblock cc-${cat}">${live ? `<span><span class="lv"><i></i>LIVE</span><span class="dn" style="font-size:24px;display:block;margin:6px 0 4px">NOW</span><span class="mo" style="font-size:10px;letter-spacing:.04em;opacity:.9">ENDS ${fmtTime(endOf)}</span></span>` : `<span><span class="wd" style="display:block">${d.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase()}</span><span class="dn" style="display:block">${d.getDate()}</span><span class="mo" style="display:block">${d.toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}</span></span>`}</span>`; };
function statusPill(s) {
  const a = st(s);
  if (a === 'going') return `<span class="status st-done">${I.check}Going</span>`;
  if (a === 'maybe') return `<span class="status st-maybe">${I.help}Maybe</span>`;
  if (a === 'invited') return `<span class="status st-plan">${I.flag}Invited</span>`;
  if (a === 'cant') return `<span class="status" style="background:var(--surface2);color:var(--muted)">Can't go</span>`;
  if (isNew(s)) return `<span class="status st-new">NEW</span>`;
  const open = s.points.reduce((x, p) => x + Math.max(0, p.need - p.takers.length), 0);
  return open ? `<span class="status st-plan">${open} spots open</span>` : `<span class="status st-up">Join</span>`;
}
function sevaCard(s) {
  const live = isLive(s); const ppl = peopleOf(s).filter((p) => p.st === 'going' || p.st === 'here'); const n = unreadUpd(s).length + newTasks(s).length; const pend = pendingMine(s).length;
  return `<button class="scard tap ${live ? 'live' : ''} ${s.hq ? 'hq' : ''}" data-open="seva:${s.id}">${s.hq && !isAdmin() ? `<span class="hqrib">${I.globe}${esc(s.region)} seva · not your area</span>` : ''}${dblock(s.start, s.cat, live, s.end)}
    <div class="grow"><span class="chip" style="background:color-mix(in srgb,var(--c-${s.cat}) 13%,transparent);color:var(--c-${s.cat})">${CAT[s.cat].label}</span>
      <h3>${esc(s.title)}</h3><p class="m ellipsis">${live ? `Ends ${fmtTime(s.end)} · ${progress(s)}% done` : `${fmtTime(s.start)} – ${fmtTime(s.end)}`}</p><p class="m ellipsis">${I.pin.replace('<svg', '<svg style="width:13px;height:13px;vertical-align:-2px"')} ${esc(s.place)}</p>
      <div class="foot">${faceRow(ppl.map((p) => p.n), ppl.length, 3)}${pend ? `<span class="status st-plan">${I.checkc}${pend} to tick</span>` : needsPick(s) ? `<span class="status st-plan">${I.alert}Pick a task</span>` : live && going(s) ? `<span class="status st-done">${I.check}You're here</span>` : statusPill(s)}</div></div>
    ${n && going(s) ? `<span class="newbadge" style="right:10px;${s.hq ? 'top:38px' : ''}">${n} new</span>` : ''}</button>`;
}
function eventCard(e) {
  const r = S.rsvp[e.id];
  return `<button class="scard tap" data-open="event:${e.id}">${dblock(e.start, 'event')}<div class="grow"><span class="chip event">${e.kind}</span><h3>${esc(e.title)}</h3><p class="m ellipsis">${fmtTime(e.start)} – ${fmtTime(e.end)}</p><p class="m ellipsis">${I.pin.replace('<svg', '<svg style="width:13px;height:13px;vertical-align:-2px"')} ${esc(e.place)}</p><div class="foot">${faceRow(NAMES.slice(5, 8), e.going, 3)}${r === 'going' ? `<span class="status st-done">${I.check}Going</span>` : r === 'maybe' ? `<span class="status st-maybe">Maybe</span>` : `<span class="status st-event">RSVP</span>`}</div></div></button>`;
}
function doneCard(h) {
  return `<button class="scard tap" data-open="history:${h.id}">${dblock(h.date, h.cat)}<div class="grow"><span class="chip" style="background:color-mix(in srgb,var(--c-${h.cat}) 13%,transparent);color:var(--c-${h.cat})">${CAT[h.cat].label}</span><h3>${esc(h.title)}</h3><p class="m ellipsis">${esc(h.role)}</p><div class="foot"><span class="status st-done">${I.checkc}Completed</span>${seed('+3')}</div></div></button>`;
}
function sevaLists() {
  const mine = sevaSeg === 'mine';
  const ongoing = (mine ? liveMine() : liveAll()).map((s) => ({ t: T(s.start), h: sevaCard(s) }));
  const upS = S.seva.filter((s) => isFuture(s) && (!mine || ['going', 'maybe', 'invited'].includes(st(s))));
  const upE = S.events.filter((e) => isFuture(e) && (!mine || ['going', 'maybe'].includes(S.rsvp[e.id])));
  const upcoming = [...upS.map((s) => ({ t: T(s.start), hq: !!s.hq, h: sevaCard(s) })), ...upE.map((e) => ({ t: T(e.start), h: eventCard(e) }))].sort((a, b) => (!mine && (b.hq ? 1 : 0) - (a.hq ? 1 : 0)) || a.t - b.t); // HQ seva pinned on top in All
  const done = contributions().map((h) => ({ h: doneCard(h) }));
  return { ongoing, upcoming, done };
}
function SevaTab() {
  if (sevaSeg === 'manage' && !isLead()) sevaSeg = 'mine';
  const L = sevaLists();
  if (!sevaChip) sevaChip = L.ongoing.length ? 'ongoing' : 'upcoming';
  const list = L[sevaChip];
  const chips = [['ongoing', 'Ongoing', L.ongoing.length], ['upcoming', 'Upcoming', L.upcoming.length], ['done', 'Completed', L.done.length]];
  return `<header class="apphdr"><h1 class="pagetitle" style="padding:6px 0 0">Seva</h1><span class="sp"></span><button class="iconbtn solid" data-act="seva-view" aria-label="${sevaView === 'list' ? 'Calendar view' : 'List view'}">${sevaView === 'list' ? I.cal : I.list}</button>${bellBtn()}</header>
    <div class="seg" style="margin-top:10px" role="group">${isLead() ? `<button data-seg="manage" aria-pressed="${sevaSeg === 'manage'}">${I.shield}Manage</button>` : ''}<button data-seg="mine" aria-pressed="${sevaSeg === 'mine'}">My Sevas</button><button data-seg="all" aria-pressed="${sevaSeg === 'all'}">${isLead() ? 'All' : 'All Opportunities'}</button></div>
    ${sevaSeg === 'manage' && isLead() ? LeadSeva() : sevaView === 'cal' ? calendar() : `<div class="chips fill" style="margin-top:12px">${chips.map(([k, l, n]) => `<button class="chip2" data-chip="${k}" aria-pressed="${sevaChip === k}">${k === 'ongoing' && n ? '<i class="ld"></i>' : ''}${l}<span class="n">${n}</span></button>`).join('')}</div>
    <div style="margin-top:12px">${list.length ? list.map((x) => x.h).join('') : sevaChip === 'ongoing' ? emptyState('No seva live right now', 'When a seva you joined starts, it appears here with a big LIVE label.', `<button class="btn soft sm" style="margin-top:12px" data-chip="upcoming">See upcoming</button>`) : sevaChip === 'upcoming' ? emptyState('Nothing planned yet', 'Find a seva that suits you in All Opportunities.', `<button class="btn soft sm" style="margin-top:12px" data-seg="all">Browse seva</button>`) : emptyState('Your first seva is waiting', 'Completed seva show up here and grow your garden.')}</div>`}`;
}
function calItems() {
  const mine = sevaSeg === 'mine';
  return [...S.seva.filter((s) => !mine || ['going', 'maybe', 'invited'].includes(st(s))).map((s) => ({ k: 'seva', x: s, cat: s.cat, me: ['going', 'maybe'].includes(st(s)) })), ...S.events.filter((e) => !mine || S.rsvp[e.id]).map((e) => ({ k: 'event', x: e, cat: 'event', me: !!S.rsvp[e.id] }))];
}
function calendar() {
  const items = calItems(); const byDay = {}; items.forEach((i) => { (byDay[ymd(i.x.start)] = byDay[ymd(i.x.start)] || []).push(i); });
  const f = new Date(calY, calM, 1); const startDow = (f.getDay() + 6) % 7; const days = new Date(calY, calM + 1, 0).getDate(); const today = ymd(now());
  const cells = []; for (let i = 0; i < startDow; i++) cells.push('<span></span>');
  for (let d = 1; d <= days; d++) {
    const k = ymd(new Date(calY, calM, d)); const its = byDay[k] || []; const has = its.length; const anyMine = its.some((i) => i.me); const live = its.some((i) => isLive(i.x));
    const c = has ? `var(--c-${(its.find((i) => i.me) || its[0]).cat})` : '';
    cells.push(`<button class="day ${has ? 'has' : ''} ${has && !anyMine ? 'open' : ''} ${k === today ? 'today' : ''} ${calPop === k ? 'sel' : ''} ${k < today ? 'past' : ''}" data-day="${k}" style="${c ? `--dc:${c}` : ''}" aria-label="${d}${has ? `, ${has} item${has > 1 ? 's' : ''}` : ''}"><span class="n">${d}</span>${has > 1 ? `<span class="more">${has}</span>` : ''}${live ? '<span class="lv"></span>' : ''}</button>`);
  }
  while (cells.length % 7) cells.push('<span></span>');
  if (calPop && byDay[calPop] && calPop.startsWith(`${calY}-${String(calM + 1).padStart(2, '0')}`)) {
    const d = +calPop.slice(8); const idx = startDow + d - 1; const rowEnd = Math.floor(idx / 7) * 7 + 7; const col = idx % 7;
    const pop = `<div class="pop" style="--ax:${(col + .5) / 7 * 100}%"><div class="phd"><span>${relDay(calPop + 'T12:00')}</span><button data-act="cal-close" aria-label="Close">${I.close}</button></div>${byDay[calPop].map((i) => `<button class="prow cc-${i.cat}" data-open="${i.k}:${i.x.id}"><span class="b3"></span><div class="grow"><b class="ellipsis">${esc(i.x.title)}</b><span class="m">${isLive(i.x) ? '<b style="color:var(--live);display:inline">LIVE · </b>' : ''}${fmtTime(i.x.start)} · ${i.me ? 'You\'re in' : 'Not joined yet'}</span></div>${chev}</button>`).join('')}</div>`;
    cells.splice(rowEnd, 0, pop);
  }
  const mName = f.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  return `<div class="card cal" style="margin-top:12px" id="cal"><div class="cal-h"><div><h3>${mName}</h3><span class="sub">${sevaSeg === 'mine' ? 'Your seva & events' : 'Solid joined · dashed open'}</span></div><div class="nav"><button data-act="cal-prev" aria-label="Previous month">${I.chevL}</button><button data-act="cal-today">Today</button><button data-act="cal-next" aria-label="Next month">${I.chev}</button></div></div>
    <div class="cal-grid">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((w) => `<span class="wd">${w}</span>`).join('')}${cells.join('')}</div></div><p class="xs faint" style="text-align:center;margin-top:8px">Tap a date · swipe to change month</p>`;
}

// ----- Seva detail -----
function SevaDetail({ id }) {
  const s = sv(id); if (!s) return dtop('Seva') + emptyState('This seva is no longer available', 'It may have been cancelled by your team lead.');
  markSeen(s.id);
  const live = isLive(s), past = T(s.end) < now(), a = st(s), g = going(s); const ppl = peopleOf(s); const here = ppl.filter((p) => p.st === 'here' || p.st === 'going');
  const nU = unreadUpd(s).length;
  const tabs = [['overview', 'Overview'], ['tasks', 'Tasks'], ['team', 'Team'], ['updates', 'Updates']];
  const hero = `<div class="dhero cc-${s.cat} ${live ? 'islive' : ''}"><svg class="bgart" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice"><circle cx="350" cy="40" r="110" fill="#fff" opacity=".18"/><circle cx="30" cy="250" r="90" fill="#fff" opacity=".12"/></svg>
    <div class="row" style="gap:8px">${live ? '<span class="livepill big" style="background:#fff;color:#D81F3A"><i style="background:#D81F3A"></i>LIVE NOW</span>' : `<span class="chip" style="background:rgba(255,255,255,.22);color:#fff">${CAT[s.cat].label}</span>`}${s.recur ? `<span class="chip" style="background:rgba(255,255,255,.18);color:#fff">${s.recur}</span>` : ''}</div>
    ${s.hq ? `<div class="hqband">${I.globe}<span><b>${esc(s.region)} seva</b> · organised by Seva HQ for the whole sangat — not in your area</span></div>` : ''}
    <h1>${esc(s.title)}</h1>
    <div class="meta"><div>${I.cal}${relDay(s.start)}, ${fmtTime(s.start)} – ${fmtTime(s.end)}</div><div>${I.pin}${esc(s.place)}</div><div>${I.user}Lead: ${esc(s.lead)}</div></div>
    <div class="row" style="margin-top:14px">${faceRow(here.map((p) => p.n), here.length, 5)}<span class="small" style="opacity:.95">${here.length} ${live ? 'sevadars here' : 'going'}</span></div>
    ${live ? `<div class="tbar"><i style="width:${progress(s)}%"></i></div>` : ''}
    ${a === 'going' ? `<div class="partpill">${I.checkc}You're Participating</div>` : a === 'maybe' ? `<div class="partpill maybe">${I.help}You said maybe</div>` : a === 'invited' ? `<div class="partpill maybe">${I.flag}${first(s.lead)} invited you</div>` : ''}
  </div>`;
  let body = '';
  if (dtab === 'overview') body = overviewTab(s);
  else if (dtab === 'tasks') body = tasksTab(s);
  else if (dtab === 'team') body = teamTab(s);
  else body = updatesTab(s);
  // sticky action
  let act = '';
  if (!past) {
    if (g && live) { const left = myPoints(s).filter((p) => !S.mydone[p.id]); act = `<button class="btn block" data-act="mark-complete" data-id="${s.id}" ${left.length ? '' : 'disabled'}>${I.checkc}${left.length ? `Mark Task Complete${left.length > 1 ? ` (${left.length})` : ''}` : 'All your tasks are done 🙏'}</button>`; }
    else if (g) act = `<div class="btn-row"><button class="btn ghost" data-act="lead-wa" data-id="${s.id}">${I.msg}Message lead</button><button class="btn" data-act="cal" data-id="${s.id}">${I.cal}Add to calendar</button></div>`;
    else if (live) act = `<button class="btn block" data-act="respond" data-v="going" data-id="${s.id}">${I.plus}Join this seva now</button>`;
    else act = respButtons(s);
  }
  return `${dtop(live ? 'Live Seva' : 'Seva Details', `<button class="iconbtn" data-act="wa" data-id="${s.id}" aria-label="Share on WhatsApp">${I.share}</button>`)}${hero}
    <div class="dtabs" role="tablist">${tabs.map(([k, l]) => `<button role="tab" data-dtab="${k}" aria-selected="${dtab === k}">${l}${tabBadge(s, k)}</button>`).join('')}</div>
    <div style="margin-top:16px" class="stack">${body}</div>
    ${act ? `<div class="stickyact"><div>${act}</div></div>` : ''}`;
}
// Badges stay until the member deals with them: tasks to tick, new tasks, unread updates
function tabBadge(s, k) {
  if (k === 'overview') { const n = pendingMine(s).length; return n ? `<span class="n warn" aria-label="${n} to tick">${n}</span>` : ''; }
  if (k === 'tasks') { const n = newTasks(s).length; return n ? `<span class="n" aria-label="${n} new">${n}</span>` : needsPick(s) ? '<span class="n warn" aria-label="Pick a task">!</span>' : ''; }
  if (k === 'updates') { const n = unreadUpd(s).length; return n ? `<span class="n" aria-label="${n} new">${n}</span>` : ''; }
  return '';
}
function respButtons(s) {
  const a = st(s);
  return `<div class="resp" role="group" aria-label="Your response"><button class="r-go" data-act="respond" data-v="going" data-id="${s.id}" aria-pressed="${a === 'going'}">${I.checkc}Going</button><button class="r-maybe" data-act="respond" data-v="maybe" data-id="${s.id}" aria-pressed="${a === 'maybe'}">${I.help}Maybe</button><button class="r-cant" data-act="respond" data-v="cant" data-id="${s.id}" aria-pressed="${a === 'cant'}">${I.xc}Can't go</button></div>`;
}
function overviewTab(s) {
  const live = isLive(s), g = going(s); const mine = myPoints(s);
  const prog = live ? progress(s) : filled(s);
  const tasks = g ? `<div class="card"><div class="section-h" style="margin-bottom:4px"><h2 style="font-size:17px">Tasks for You</h2><button class="link" data-dtab="tasks">${mine.length ? 'Change' : 'Pick tasks'}${I.chev}</button></div>
      ${mine.length ? mine.map((p) => `<button class="task" data-act="${live ? 'ptdone' : 'noop-up'}" data-p="${p.id}" aria-pressed="${!!S.mydone[p.id]}"><span class="box">${S.mydone[p.id] ? I.check : ''}</span><span class="grow tx small" style="font-weight:600">${esc(p.text)}</span><span class="xs muted">${p.takers.length}/${p.need}</span></button>`).join('') : `<p class="small muted" style="padding:6px 0">You haven't picked a task yet. ${openPtsN(s)} task${openPtsN(s) === 1 ? '' : 's'} still need people.</p><button class="btn soft block" style="margin-top:8px" data-dtab="tasks">${I.plus}Pick your tasks</button>`}
      ${mine.length && !live ? `<p class="xs muted" style="margin-top:8px">You can tick tasks off once the seva starts. We'll remind you the evening before.</p>` : ''}</div>` : '';
  return `<div class="card"><div class="prog"><span>${live ? 'Seva progress' : 'Spots filled'}</span><span style="color:var(--done)">${prog}%</span></div><div class="pbar"><i style="width:${prog}%"></i></div><p class="xs muted" style="margin-top:8px">${live ? `${s.points.filter((p) => S.mydone[p.id] || p.prog >= 1).length} of ${s.points.length} tasks complete · ends ${fmtTime(s.end)}` : `${s.points.reduce((a, p) => a + Math.min(p.need, p.takers.length), 0)} of ${s.points.reduce((a, p) => a + p.need, 0)} places taken`}</p></div>
    ${tasks}
    <div class="card kv"><div class="r">${I.sparkle}<div><b>Why this seva</b><span>${esc(s.purpose)}</span></div></div><div class="r">${I.pin}<div><b>Meeting point</b><span>${esc(s.meet)}</span></div></div><div class="r">${I.info}<div><b>Please note</b><span>${esc(s.instructions)}</span></div></div></div>
    <div class="card"><div class="row"><span class="av2" style="background:${avColor(s.lead)}">${initials(s.lead)}</span><div class="grow"><b class="small">${esc(s.lead)}</b><p class="xs muted">Team lead</p></div><button class="btn ghost sm" data-act="lead-wa" data-id="${s.id}">${I.wa}Message</button></div></div>`;
}
const openPtsN = (s) => s.points.filter((p) => p.takers.length < p.need).length;
function tasksTab(s) {
  const g = going(s), live = isLive(s); const since = S.seenTasks[s.id] ?? 0;
  const nobody = s.points.filter((p) => !p.takers.length).length;
  return `${!g && !(T(s.end) < now()) ? `<div class="banner">${I.info}<span>Choose <b>Going</b> first, then pick the tasks you'll do.</span></div>` : ''}
    ${nobody ? `<div class="banner" style="background:var(--action-bg)">${I.alert}<span><b>${nobody} task${nobody > 1 ? 's have' : ' has'} no one yet</b> — highlighted below.</span></div>` : ''}
    <div class="card">${s.points.map((p) => { const n = p.takers.length; const me = p.takers.includes('@me'); const isN = p.live && T(p.at) > since;
      return `<div class="pt ${!n ? 'nobody' : ''}"><div class="grow"><b class="t">${esc(p.text)}${isN ? ' <span class="status st-new" style="vertical-align:2px">NEW</span>' : ''}</b><div class="sub">${n ? faceRow(p.takers.map(nameOf), n, 3) : ''}<span class="chip ${!n ? 'action' : n < p.need ? 'p' : 'done'}">${!n ? 'No one yet' : n < p.need ? `${p.need - n} more needed` : 'Covered'}</span><span class="xs muted">${n}/${p.need}</span></div></div>
        ${g ? `<button class="btn sm ${me ? '' : 'soft'} pick" data-act="ptpick" data-id="${s.id}" data-p="${p.id}" aria-pressed="${me}">${me ? `${I.check}Mine` : `${I.plus}Pick`}</button>` : ''}</div>`; }).join('')}</div>
    ${g ? `<p class="xs muted" style="text-align:center">Many people can pick the same task. ${first(s.lead)} sees who's doing what${live ? ' live' : ''}.</p>` : ''}`;
}
function teamTab(s) {
  const ppl = peopleOf(s); const live = isLive(s);
  const groups = live ? [['here', 'Here now', (p) => p.st === 'here'], ['going', 'Coming', (p) => p.st === 'going'], ['maybe', 'Maybe', (p) => p.st === 'maybe']] : [['going', 'Going', (p) => p.st === 'going'], ['maybe', 'Maybe', (p) => p.st === 'maybe'], ['cant', 'Can\'t go', (p) => p.st === 'cant']];
  if (!groups.find((x) => x[0] === teamFilter)) teamFilter = groups[0][0];
  const cur = groups.find((x) => x[0] === teamFilter); const list = ppl.filter(cur[2]);
  const taskOf = (n) => s.points.filter((p) => p.takers.map(nameOf).includes(n)).map((p) => p.text);
  return `<div class="card"><div class="row"><span class="av2" style="background:${avColor(s.lead)}">${initials(s.lead)}</span><div class="grow"><b class="small">${esc(s.lead)}</b><p class="xs muted">Team lead for this seva</p></div><button class="btn ghost sm" data-act="lead-wa" data-id="${s.id}">${I.wa}Message</button></div></div>
    <div class="seg">${groups.map(([k, l, f]) => `<button data-tf="${k}" aria-pressed="${teamFilter === k}">${l} · ${ppl.filter(f).length}</button>`).join('')}</div>
    <div class="card list">${list.length ? list.map((p) => { const t = taskOf(p.n); return `<div class="lrow tap" data-open="user:${esc(p.n)}" style="cursor:pointer"><span class="av2 ${p.st === 'here' ? 'here' : ''}" style="background:${p.me ? 'var(--p)' : avColor(p.n)}">${initials(p.n)}</span><div class="grow"><b class="small">${esc(p.n)}${p.me ? ' (you)' : ''}</b><p class="xs muted ellipsis">${t.length ? esc(t.join(' · ')) : 'No task picked yet'}</p></div></div>`; }).join('') : '<p class="small muted" style="padding:14px 0">No one here yet.</p>'}</div>`;
}
function updatesTab(s) {
  const since = seenAt(s.id);
  return s.updates.length ? `<div class="card">${s.updates.map((u) => `<div class="upd ${T(u.d) > since ? 'new' : ''}"><span class="ic">${u.kind === 'new' ? I.plus : u.kind === 'edit' ? I.alert : I.megaphone}</span><div class="grow"><b class="small" style="display:block">${esc(u.t)}</b><span class="xs muted">${esc(u.by)} · ${ago(u.d)}${ago(u.d) === 'just now' ? '' : ' ago'}${T(u.d) > since ? ' · <b style="color:var(--live)">New</b>' : ''}</span></div></div>`).join('')}</div>` : emptyState('No updates yet', `${first(s.lead)} will post changes and notes here. You'll get an alert.`);
}
function EventDetail({ id }) {
  const e = ev(id); markSeen(e.id); const r = S.rsvp[e.id]; const k = r === 'no' ? 'cant' : r;
  return `${dtop('Event', `<button class="iconbtn" data-act="wa-e" data-id="${e.id}" aria-label="Share">${I.share}</button>`)}
    <div class="dhero cc-event"><div class="row" style="gap:14px;align-items:flex-end"><span style="display:inline-grid;place-items:center;background:rgba(255,255,255,.9);color:#4C1D95;border-radius:16px;width:68px;height:74px;line-height:1"><span><b style="font-size:28px;display:block">${new Date(e.start).getDate()}</b><span style="font-size:11px;font-weight:800;letter-spacing:.1em">${new Date(e.start).toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}</span></span></span><span class="chip" style="background:rgba(255,255,255,.2);color:#fff">${e.kind}</span></div>
      <h1>${esc(e.title)}</h1><div class="meta"><div>${I.clock}${relDay(e.start)}, ${fmtTime(e.start)} – ${fmtTime(e.end)}</div><div>${I.pin}${esc(e.place)}</div><div>${I.users}${num(e.going)} going · ${esc(e.organizer)}</div></div>
      ${r === 'going' ? `<div class="partpill">${I.checkc}You're going</div>` : ''}</div>
    <div class="stack" style="margin-top:16px"><div class="resp" role="group"><button class="r-go" data-act="rsvp" data-v="going" data-id="${e.id}" aria-pressed="${k === 'going'}">${I.checkc}Going</button><button class="r-maybe" data-act="rsvp" data-v="maybe" data-id="${e.id}" aria-pressed="${k === 'maybe'}">${I.help}Maybe</button><button class="r-cant" data-act="rsvp" data-v="cant" data-id="${e.id}" aria-pressed="${k === 'cant'}">${I.xc}Can't go</button></div>
    <div class="card"><h2 style="font-size:17px;margin-bottom:6px">Programme</h2>${e.agenda.map((a2, i) => `<div class="lrow" style="min-height:44px"><span class="av2" style="width:28px;height:28px;font-size:12px;background:var(--event)">${i + 1}</span><span class="small" style="font-weight:600">${esc(a2)}</span></div>`).join('')}</div>
    <button class="btn ghost block" data-act="cal-e" data-id="${e.id}">${I.cal}Add to calendar</button></div>`;
}
function HistoryDetail({ id }) {
  const h = S.history.find((x) => x.id === id);
  return `${dtop('Contribution')}<div class="dhero cc-${h.cat}"><span class="chip" style="background:rgba(255,255,255,.22);color:#fff">${CAT[h.cat].label}</span><h1>${esc(h.title)}</h1><div class="meta"><div>${I.cal}${fmtLong(h.date)}</div><div>${I.check}${esc(h.role)}</div></div><div class="partpill">${I.checkc}Verified by your team lead</div></div>
    <div class="card" style="margin-top:16px;text-align:center"><p class="small muted">This seva added to your garden</p><p style="font-size:34px;font-weight:800;margin-top:4px">${seed('+3')}</p><p class="xs muted">points to spend in the garden shop</p><button class="btn block" style="margin-top:14px" data-tab="garden">${I.garden}Open my garden</button></div>`;
}

// =================== GARDEN ===================
// ----- Garden board: a 6×6 plot of squares. Items sit in boxes; you can arrange them. -----
const GW = 6;
const CELLS = []; for (let y = 0; y < GW; y++) for (let x = 0; x < GW; x++) CELLS.push(`${x},${y}`);
const DEFAULT_PATHS = ['2,3', '2,4', '2,5', '3,3', '4,3', '5,3'];
const emptyLayout = () => ({ cells: {}, paths: Object.fromEntries(DEFAULT_PATHS.map((c) => [c, 1])) });
const placedN = (L, id) => Object.values(L.cells).filter((v) => v === id).length;
// trees prefer the back rows, flowers the front, pets and decor the middle
function bestCell(L, id) {
  const c = SHOP[id]?.cat || 'flower'; const free = CELLS.filter((k) => !L.cells[k] && !L.paths[k]); if (!free.length) return null;
  const sc = (k) => { const [x, y] = k.split(',').map(Number); const d = x + y; return c === 'tree' ? d : c === 'flower' ? -d + (x % 2) * .3 : Math.abs(d - 5) + (x === 0 || y === 0 ? 1 : 0); };
  return free.sort((a, b) => sc(a) - sc(b) || a.localeCompare(b))[0];
}
function layoutFromOwned(owned, seedPaths = true) {
  const L = seedPaths ? emptyLayout() : { cells: {}, paths: {} };
  SHOP_ORDER.forEach((id) => { for (let n = 0; n < (owned[id] || 0); n++) { const k = bestCell(L, id); if (k) L.cells[k] = id; } });
  return L;
}
function ensureLayout() { if (!S.layout) { S.layout = layoutFromOwned(S.owned); save(); } return S.layout; }
const unplaced = (id, L = S.layout) => Math.max(0, owned(id) - placedN(L, id));
// a believable garden for any member, from their name
function genLayout(n) {
  if (n === ME()) return ensureLayout();
  let h = [...n].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7); const rnd = () => ((h = (h * 1103515245 + 12345) >>> 0) / 4294967296);
  const contrib = 3 + Math.floor(rnd() * 18); const own = {};
  SHOP_ORDER.filter((id) => !SHOP[id].sp ? SHOP[id].ord <= contrib : rnd() < .4).forEach((id) => { if (rnd() < .75) own[id] = Math.max(1, Math.min(SHOP[id].max, Math.floor(rnd() * 3))); });
  const L = layoutFromOwned(own, rnd() < .7); L.contrib = contrib; return L;
}
const A = 30, B = 15, OX = 200, OY = 112;
const isoC = (k) => { const [x, y] = k.split(',').map(Number); return [OX + (x - y) * A, OY + (x + y) * B + B]; };
const ITEM_SCALE = { tree: 1.22, flower: 1, decor: 1.05, pet: .98 };
function sceneBack(night) {
  const n = night;
  const sky = n ? ['#141B30', '#2D2A4A', '#4A3B5C'] : ['#A8DBF5', '#D6EEF7', '#F3F6EC'];
  const stars = n ? Array.from({ length: 26 }, (_, i) => `<circle cx="${(i * 67) % 400}" cy="${(i * 29) % 100 + 6}" r="${i % 3 ? .8 : 1.3}" fill="#fff" opacity="${.4 + (i % 4) * .15}" ${i % 5 === 0 ? 'class="glow"' : ''}/>`).join('') : '';
  return `<defs><linearGradient id="gsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset=".65" stop-color="${sky[1]}"/><stop offset="1" stop-color="${sky[2]}"/></linearGradient><radialGradient id="gsun"><stop offset="0" stop-color="${n ? '#FFF6D8' : '#FFF4C2'}"/><stop offset="1" stop-color="${n ? '#FFF6D8' : '#FFD86B'}" stop-opacity="0"/></radialGradient></defs>
    <rect width="400" height="330" fill="url(#gsky)"/>${stars}
    <circle cx="320" cy="50" r="40" fill="url(#gsun)" opacity=".8"/><circle cx="320" cy="50" r="${n ? 14 : 18}" fill="${n ? '#F4EFD9' : '#FFE27A'}"/>${n ? '<circle cx="326" cy="45" r="12" fill="#2D2A4A"/>' : ''}
    <g class="drift" opacity="${n ? .25 : .9}"><path d="M40 62a14 14 0 0 1 26-6 11 11 0 0 1 18 8H32a9 9 0 0 1 8-2z" fill="#fff"/></g><g class="drift d2" opacity="${n ? .2 : .85}"><path d="M120 38a12 12 0 0 1 22-5 9 9 0 0 1 15 7h-44a8 8 0 0 1 7-2z" fill="#fff"/></g>
    <path d="M0 140 L50 104 L92 128 L150 90 L214 130 L262 100 L318 136 L370 110 L400 122 V330 H0Z" fill="${n ? '#2A3048' : '#B7D3E3'}"/>
    <path d="M150 90 L164 100 L156 102 L150 96 L142 104 L138 99Z" fill="${n ? '#3C4462' : '#fff'}" opacity=".9"/>
    <path d="M0 158 Q70 132 140 150 T280 146 T400 150 V330 H0Z" fill="${n ? '#22322A' : '#A9D58C'}"/>
    <g><rect x="306" y="140" width="56" height="34" fill="${n ? '#8C7C66' : '#F5E6C8'}"/><path d="M298 142 L334 114 L370 142Z" fill="${n ? '#7A3328' : '#C9573E'}"/><rect x="350" y="118" width="7" height="14" fill="${n ? '#5C2A22' : '#9C3E2C'}"/><rect x="327" y="154" width="12" height="20" rx="2" fill="#8A5A3B"/><rect x="343" y="150" width="12" height="10" rx="1.5" fill="${n ? '#FFD27A' : '#A7D8F0'}" ${n ? 'class="glow"' : ''}/><rect x="311" y="150" width="11" height="10" rx="1.5" fill="${n ? '#FFD27A' : '#A7D8F0'}"/></g>
    ${[[28, 150], [58, 142], [92, 146]].map(([x, y], i) => `<g class="sway s${i + 1}"><rect x="${x - 2}" y="${y - 6}" width="4" height="10" fill="#7A5A38"/><circle cx="${x}" cy="${y - 12}" r="${9 + i}" fill="${n ? '#2E4A33' : '#5E9E58'}"/></g>`).join('')}`;
}
// opts: { edit, sel, mode, night, ghost: {cell:id}, interactive, aria, fresh }
function boardSVG(L, o = {}) {
  const n = !!o.night; const ghost = o.ghost || {};
  const corner = (k, which) => { const [X, Y] = isoC(k); return { t: [X, Y - B], r: [X + A, Y], b: [X, Y + B], l: [X - A, Y] }[which]; };
  const Lp = corner(`0,${GW - 1}`, 'l'), Bp = corner(`${GW - 1},${GW - 1}`, 'b'), Rp = corner(`${GW - 1},0`, 'r'), D = 12;
  const slab = `<path d="M${Lp[0]} ${Lp[1]}L${Bp[0]} ${Bp[1]}L${Bp[0]} ${Bp[1] + D}L${Lp[0]} ${Lp[1] + D}Z" fill="${n ? '#5E4630' : '#8A6A48'}"/><path d="M${Bp[0]} ${Bp[1]}L${Rp[0]} ${Rp[1]}L${Rp[0]} ${Rp[1] + D}L${Bp[0]} ${Bp[1] + D}Z" fill="${n ? '#4A3624' : '#6E5236'}"/>`;
  const tiles = CELLS.map((k) => {
    const [X, Y] = isoC(k); const [x, y] = k.split(',').map(Number); const path = L.paths[k];
    const fill = path ? (n ? '#6E604C' : '#E6D6B6') : (x + y) % 2 ? (n ? '#3D5A36' : '#A6CC8E') : (n ? '#37532F' : '#9CC383');
    const isSel = o.sel === k; const empty = !L.cells[k] && !path && !ghost[k];
    return `<path d="M${X} ${Y - B}L${X + A} ${Y}L${X} ${Y + B}L${X - A} ${Y}Z" fill="${fill}" ${o.edit ? `stroke="${isSel ? '#FFC93C' : 'rgba(255,255,255,.75)'}" stroke-width="${isSel ? 2.5 : 1}"` : `stroke="${n ? 'rgba(0,0,0,.18)' : 'rgba(255,255,255,.35)'}" stroke-width=".6"`} ${o.interactive ? `data-cell="${k}"` : ''} style="${o.interactive ? 'cursor:pointer' : ''}"/>
      ${path ? `<ellipse cx="${X - 7}" cy="${Y - 2}" rx="5" ry="2.4" fill="${n ? '#5A4E3D' : '#CDB892'}" pointer-events="none"/><ellipse cx="${X + 8}" cy="${Y + 3}" rx="4" ry="2" fill="${n ? '#5A4E3D' : '#CDB892'}" pointer-events="none"/>` : ''}
      ${o.edit && empty && o.mode ? `<path d="M${X - 4} ${Y}h8M${X} ${Y - 4}v8" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".85" pointer-events="none"/>` : ''}`;
  }).join('');
  const all = [...Object.entries(L.cells).map(([k, id]) => ({ k, id })), ...Object.entries(ghost).map(([k, id]) => ({ k, id, ghost: true }))]
    .sort((a, b) => { const [ax, ay] = a.k.split(',').map(Number), [bx, by] = b.k.split(',').map(Number); return ax + ay - (bx + by) || ax - bx; });
  const items = all.map(({ k, id, ghost: gh }) => {
    const [X, Y] = isoC(k); const c = SHOP[id]?.cat || 'flower'; const s = (ITEM_SCALE[c] || .8) * (id === 'banyan' ? .82 : id === 'pond' ? .95 : 1);
    const anim = c === 'pet' && id !== 'rabbit' ? 'bob' : ''; const sel = o.sel === k;
    return `<g transform="translate(${X} ${Y + 5})" ${o.interactive ? `data-cell="${k}"` : `data-gi="${id}"`} style="cursor:pointer;${gh ? 'opacity:.6' : ''}"><g transform="scale(${s})" class="${(o.fresh || []).includes(k) ? 'newpop' : ''} ${anim}">${sel ? '<ellipse cx="0" cy="1" rx="24" ry="9" fill="none" stroke="#FFC93C" stroke-width="3"/>' : ''}<ellipse cx="0" cy="1" rx="15" ry="4" fill="#000" opacity="${n ? .25 : .12}"/>${GI[id].d()}</g>${gh ? `<g transform="translate(0 -${c === 'tree' ? 58 : 40})"><rect x="-24" y="-9" width="48" height="15" rx="7.5" fill="#16151A"/><text y="2" text-anchor="middle" font-size="8.5" font-weight="700" fill="#fff" font-family="Inter,system-ui">Preview</text></g>` : ''}</g>`;
  }).join('');
  const flies = n ? Array.from({ length: 9 }, (_, i) => `<circle cx="${40 + (i * 41) % 320}" cy="${150 + (i * 23) % 130}" r="1.6" fill="#FFE98A" class="glow" style="animation-delay:-${i * .4}s"/>`).join('') : '';
  return `<svg class="scene board" viewBox="0 0 400 ${o.h || 318}" preserveAspectRatio="xMidYMid ${o.meet ? 'meet' : 'slice'}" role="img" aria-label="${o.aria || 'Garden'}">${sceneBack(n)}${slab}${tiles}${items}${flies}</svg>`;
}
// ----- Arrange mode (tap to pick, tap a box to place — like Animal Crossing / Pocket Camp) -----
let GE = null; // { L, sel, mode, tool, preview }
function startArrange(previewId) {
  ensureLayout(); GE = { L: JSON.parse(JSON.stringify(S.layout)), sel: null, tool: null, preview: previewId || null, ghost: {} };
  if (previewId) { GE.tool = 'preview'; const k = bestCell(GE.L, previewId); if (k) GE.ghost[k] = previewId; }
  S.gview = '2d'; tab = 'garden'; stack = []; render(); window.scrollTo(0, 0);
}
function trayItems() { return SHOP_ORDER.filter((id) => owned(id) - placedN(GE.L, id) > 0); }
function arrangeHint() {
  if (GE.preview) return GE.tool === 'preview' ? `Tap any empty box to try the ${GI[GE.preview].name.toLowerCase()} there` : 'Looks good? Add it to your cart';
  if (GE.tool === 'path') return 'Tap boxes to lay or lift stone path (free)';
  if (GE.tool) return `Tap an empty box to place the ${GI[GE.tool].name.toLowerCase()}`;
  if (GE.sel) return 'Tap another box to move it there, or use the buttons';
  return 'Tap something in your garden to move it, or pick from your items below';
}
function ArrangeView() {
  const L = GE.L; const sid = GE.sel ? L.cells[GE.sel] : null; const tray = trayItems();
  return `<div class="arrange"><div class="ahead"><button class="btn ghost sm" data-act="ga-cancel">Cancel</button><b>${GE.preview ? 'Preview' : 'Arrange garden'}</b><button class="btn sm" data-act="ga-done">${GE.preview ? 'Close' : 'Done'}</button></div>
    <div class="gscene" id="gscene-svg">${boardSVG(L, { edit: true, interactive: true, sel: GE.sel, mode: GE.tool, night: S.gnight, ghost: GE.ghost })}</div>
    <p class="ahint">${arrangeHint()}</p>
    ${sid ? `<div class="abar"><span class="art">${art(sid)}</span><b class="grow">${GI[sid].name}</b><button class="btn soft sm" data-act="ga-store">${I.download}Put away</button><button class="iconbtn" data-act="ga-desel" aria-label="Done with this">${I.close}</button></div>` : ''}
    ${GE.preview ? `<div class="btn-row" style="padding:0 16px"><button class="btn ghost" data-act="ga-cancel">Not now</button><button class="btn" data-act="ga-cartkeep" ${isUnlocked(GE.preview) ? '' : 'disabled'}>${I.cart}Add to cart</button></div>`
      : `<div class="tray2"><button class="titem2 ${GE.tool === 'path' ? 'on' : ''}" data-act="ga-tool" data-id="path"><span class="art"><svg viewBox="-30 -22 60 44"><path d="M0 -15L26 0L0 15L-26 0Z" fill="#E6D6B6" stroke="#C9B48E"/><ellipse cx="-6" cy="-1" rx="5" ry="2.4" fill="#CDB892"/><ellipse cx="7" cy="3" rx="4" ry="2" fill="#CDB892"/></svg></span>Path<small>free</small></button>
        ${tray.map((id) => `<button class="titem2 ${GE.tool === id ? 'on' : ''}" data-act="ga-tool" data-id="${id}"><span class="art">${art(id)}</span>${GI[id].name.split(' ')[0]}<small>×${owned(id) - placedN(L, id)}</small></button>`).join('')}
        ${!tray.length ? '<p class="xs muted" style="padding:14px 6px;white-space:normal">Everything you own is in the garden. Put something away to free a box, or buy more in the shop.</p>' : ''}</div>`}
  </div>`;
}
function arrangeTap(k) {
  const L = GE.L; buzz();
  if (GE.preview) { if (!L.cells[k] && !L.paths[k]) { GE.ghost = { [k]: GE.preview }; } else toast('That box is taken — pick an empty one'); return rerender(); }
  if (GE.tool === 'path') { if (L.cells[k]) { toast('Move the item first'); return; } if (L.paths[k]) delete L.paths[k]; else L.paths[k] = 1; return rerender(); }
  if (GE.tool) { if (L.cells[k]) { GE.sel = k; GE.tool = null; return rerender(); } if (L.paths[k]) delete L.paths[k]; L.cells[k] = GE.tool; if (!(owned(GE.tool) - placedN(L, GE.tool))) GE.tool = null; return rerender(); }
  if (GE.sel) { if (k === GE.sel) { GE.sel = null; return rerender(); } const a = L.cells[GE.sel], b = L.cells[k]; if (L.paths[k]) delete L.paths[k]; L.cells[k] = a; if (b) L.cells[GE.sel] = b; else delete L.cells[GE.sel]; GE.sel = b ? null : k; GE.sel = null; return rerender(); }
  if (L.cells[k]) { GE.sel = k; return rerender(); }
  toast(trayItems().length ? 'Pick an item below, then tap a box' : 'Tap something in your garden to move it');
}
// ----- 3D view (same layout) -----

function shopCard(id) {
  const x = SHOP[id]; const ok = isUnlocked(id); const o = owned(id); const c = inCart(id); const full = o + c >= x.max;
  return `<div class="sitem ${ok ? '' : 'locked'}"><div class="art">${art(id)}${!ok ? `<div class="lockov"><span>${I.lock}${esc(lockText(id))}</span></div>` : ''}</div>${o ? `<span class="own">×${o} planted</span>` : ''}${x.sp ? '<span class="tag">SPECIAL</span>' : ''}
    ${ok ? `<button class="trybtn" data-act="ga-preview" data-id="${id}" aria-label="Preview ${GI[id].name} in my garden">${I.eye}Try</button>` : ''}
    <b>${GI[id].name}</b><div class="meta"><span>${KIND[x.cat].replace(/s$/, '')}</span>${seed(x.cost)}</div>
    ${!ok ? `<button class="add" style="background:var(--surface2);color:var(--muted)" data-act="why-lock" data-id="${id}">${I.lock}Locked</button>` : c ? `<div class="stepper"><button data-act="cart-dec" data-id="${id}" aria-label="Remove one">−</button><span>${c} in cart</span><button data-act="cart-inc" data-id="${id}" aria-label="Add one" ${full ? 'style="opacity:.4"' : ''}>+</button></div>` : `<button class="add" data-act="cart-inc" data-id="${id}" ${full ? 'style="opacity:.5"' : ''}>${full ? (x.max === 1 ? `${I.check}You have one` : 'Max reached') : `${I.plus}Add`}</button>`}</div>`;
}
function GardenTab() {
  const nb = nextBloom(); const is3 = S.gview === '3d';
  const list = SHOP_ORDER.filter((id) => shopKind === 'all' || SHOP[id].cat === shopKind).sort((a, b) => isUnlocked(b) - isUnlocked(a));
  const L = ensureLayout(); const waiting = SHOP_ORDER.reduce((a, id) => a + unplaced(id), 0);
  return `<div class="gscene" style="margin-top:calc(-8px - var(--safe-t))">${is3 ? `<div class="g3d ${S.gnight ? 'night' : ''}" id="g3d" style="border-radius:0;height:min(56vh,440px)"><div class="loading">Planting your garden…</div></div>` : `<div id="gscene-svg">${boardSVG(L, { night: S.gnight, fresh: S.justPlanted, aria: `Your garden with ${Object.keys(L.cells).length} items` })}</div>`}
      <div class="gt"><h1>My Garden</h1><div class="row" style="gap:8px"><button data-act="gnight" aria-label="${S.gnight ? 'Day' : 'Night'}">${S.gnight ? I.sun : I.moon}</button><button data-act="gview" aria-label="${is3 ? '2D view' : '3D view'}">${is3 ? I.image : I.cube}</button>${is3 ? `<button data-act="g3-reset" aria-label="Reset view">${I.reset}</button>` : ''}</div></div>
      <button class="arrbtn" data-act="arrange">${I.edit}Arrange</button></div>
    <div class="gpanel card"><div class="row" style="justify-content:space-between"><h2 style="font-size:16px">My Garden Journey</h2><button class="link" data-act="how-points" style="min-height:30px;padding:0">How it works</button></div>
      <div class="gstats"><div><b>${nContrib()}</b><span>Contributions</span></div><div><b>${unlockedCount()}</b><span>Unlocked</span></div><div class="pts"><b>${S.pts}</b><span>Points</span></div></div>
      ${waiting ? `<button class="banner tap" style="margin-top:12px" data-act="arrange">${I.leaf}<span class="grow"><b>${waiting} item${waiting > 1 ? 's' : ''} waiting to be placed</b><br><span class="xs">Tap to put ${waiting > 1 ? 'them' : 'it'} in your garden</span></span>${chev}</button>` : ''}</div>
    <div style="padding:0 16px">
      ${nb.length ? `<div class="section"><div class="section-h"><h2>Next in Bloom</h2></div><div class="stack">${nb.map((n) => `<div class="card nib">${'<span class="art">' + art(n.id) + '</span>'}<div class="grow"><b>${GI[n.id].name}</b>${SHOP[n.id].sp ? ' <span class="status st-plan" style="font-size:10.5px">SPECIAL</span>' : ''}<p class="xs muted">${n.seq ? `Unlocks at ${n.b} contribution${n.b > 1 ? 's' : ''}` : esc(SHOP[n.id].sp.label)}</p><div class="bar"><i style="width:${Math.min(100, n.r * 100)}%"></i></div></div><b style="font-size:15px">${n.a}/${n.b}</b></div>`).join('')}</div></div>` : ''}
      <div class="section"><div class="section-h"><h2>Garden Shop</h2><span class="small muted">You have ${seed(S.pts)}</span></div>
        <div class="chips">${[['all', 'All'], ...Object.entries(KIND)].map(([k, l]) => `<button class="chip2" data-kind="${k}" aria-pressed="${shopKind === k}">${l}</button>`).join('')}</div>
        <div class="shop" style="margin-top:12px">${list.map(shopCard).join('')}</div></div>
      <div class="card section" style="background:linear-gradient(135deg,#FFF7E3,var(--surface) 70%)"><div class="row">${SEED.replace('<svg', '<svg style="width:40px;height:40px"')}<div class="grow"><b class="small">Every verified seva = 3 points</b><p class="xs muted">Spend them now on small things, or save up for a pet or a banyan tree. Points never expire.</p></div></div></div>
      <div class="demo"><p class="h">Prototype</p><button class="btn soft block" data-act="sim-seva">Pretend I finished a seva (+3 points)</button></div>
      ${cartQty() ? '<div style="height:70px"></div>' : ''}
    </div>`;
}
function cartBar() { return `<div class="cartbar"><button data-act="cart-open"><span class="cnt">${cartQty()}</span><div><b>View cart · ${cartTotal()} points</b><br><span>You have ${S.pts} points${cartTotal() > S.pts ? ` · need ${cartTotal() - S.pts} more` : ''}</span></div><span class="go">Review${I.chev}</span></button></div>`; }
function cartSheet() {
  const items = cartItems(); if (!items.length) { closeSheet(); rerender(); return; }
  const tot = cartTotal(); const left = S.pts - tot;
  openSheet(`${sheetHead('Your cart', `${cartQty()} item${cartQty() > 1 ? 's' : ''} for your garden`)}
    <div class="card">${items.map((id) => `<div class="cline"><span class="art">${art(id)}</span><div class="grow"><b class="small">${GI[id].name}</b><p class="xs muted">${seed(SHOP[id].cost)} each</p></div><div class="qty"><button data-act="cart-dec" data-id="${id}" data-sheet="1" aria-label="Remove one">−</button><span>${S.cart[id]}</span><button data-act="cart-inc" data-id="${id}" data-sheet="1" aria-label="Add one">+</button></div></div>`).join('')}</div>
    <div class="card" style="margin-top:12px"><div class="sumrow"><span class="muted">Your points</span><b>${S.pts}</b></div><div class="sumrow"><span class="muted">Cart total</span><b>− ${tot}</b></div><div class="sumrow tot"><span>Remaining after planting</span><span style="color:${left < 0 ? 'var(--live)' : 'var(--done)'}">${left}</span></div></div>
    ${left < 0 ? `<div class="banner" style="margin-top:12px">${I.info}<span>You need ${-left} more point${-left > 1 ? 's' : ''}. Remove something, or join a seva to earn more.</span></div>` : ''}
    <button class="btn block" style="margin-top:14px" data-act="cart-confirm" ${left < 0 ? 'disabled' : ''}>${I.leaf}Plant all · ${tot} points</button>
    <button class="btn ghost block" style="margin-top:8px" data-act="cart-clear">Empty cart</button>`);
}
function confirmSheet() {
  const items = cartItems(); const tot = cartTotal();
  openSheet(`<div style="text-align:center;padding:4px 4px 0"><div style="display:flex;justify-content:center;gap:4px;flex-wrap:wrap;margin:6px 0 10px">${items.slice(0, 5).map((id) => art(id, 'style="width:56px;height:56px"')).join('')}</div>
    <h2 style="font-size:22px;letter-spacing:-.02em">Plant all of this?</h2><p class="small muted" style="margin-top:6px">${items.map((id) => `${S.cart[id]} × ${GI[id].name}`).join(', ')}</p>
    <div class="card" style="margin-top:14px;text-align:left"><div class="sumrow"><span class="muted">Points used</span><b>${tot}</b></div><div class="sumrow tot"><span>Points left</span><span style="color:var(--done)">${S.pts - tot}</span></div></div>
    <div class="btn-row" style="margin-top:16px"><button class="btn ghost" data-act="cart-open">Go back</button><button class="btn" data-act="cart-buy">${I.check}Plant now</button></div></div>`);
}
function itemSheet(id) {
  const x = SHOP[id]; const ok = isUnlocked(id);
  openSheet(`${sheetHead(GI[id].name, KIND[x.cat].replace(/s$/, '') + (x.sp ? ' · Special' : ''))}<div style="height:150px;border-radius:20px;display:grid;place-items:center;background:linear-gradient(#EAF5E4,#F8F3E7)">${art(id, 'style="width:140px;height:140px"')}</div>
    <p class="small" style="margin-top:14px">${esc(GI[id].desc)}</p>
    <div class="card kv" style="margin-top:12px"><div class="r">${I.leaf}<div><b>In your garden</b><span>${owned(id)} planted · room for ${x.max}</span></div></div><div class="r">${I.lock}<div><b>${ok ? 'Unlocked' : 'How to unlock'}</b><span>${ok ? (x.sp ? x.sp.label + ' ✓' : `Unlocked at ${x.ord} contributions`) : esc(lockText(id))}</span></div></div><div class="r">${SEED.replace('<svg', '<svg style="width:20px;height:20px"')}<div><b>Cost</b><span>${x.cost} point${x.cost > 1 ? 's' : ''} each</span></div></div></div>
    <div class="btn-row" style="margin-top:14px">${ok ? `<button class="btn ghost" data-act="ga-preview" data-id="${id}">${I.eye}Preview in garden</button>` : ''}${ok && owned(id) + inCart(id) < x.max ? `<button class="btn" data-act="cart-inc" data-id="${id}" data-close="1">${I.cart}Add to cart</button>` : ''}</div>
    ${placedN(ensureLayout(), id) ? `<button class="btn soft block" style="margin-top:8px" data-act="arrange">${I.edit}Move it in my garden</button>` : ''}`);
}
// ----- 3D view (same layout) -----
let g3 = null;
function loadScript(src) { return new Promise((res, rej) => { if ([...document.scripts].some((s) => s.src.endsWith(src))) return res(); const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
const MAP3D = { tulips: 'marigold', cherry: 'mango', rabbit: 'cat' };
const to3D = (L) => ({ tiles: Object.fromEntries(Object.keys(L.paths).map((k) => [k, 'path'])), items: Object.fromEntries(Object.entries(L.cells).map(([k, id]) => [k, MAP3D[id] || id])) });
async function mount3D(L, onTapItem) {
  const host = $('#g3d'); if (!host) return;
  try { if (!window.THREE) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'); if (!window.Garden3D) await loadScript('garden3d.js'); }
  catch (e) { const l = host.querySelector('.loading'); if (l) l.textContent = '3D needs an internet connection the first time.'; return; }
  if (!document.body.contains(host)) return;
  host.querySelector('.loading')?.remove(); const M3 = to3D(L);
  g3 = window.Garden3D.mount(host, { size: GW, tiles: M3.tiles, items: M3.items, dark: !!S.gnight, onTap: (c) => { const id = L.cells[c]; if (id && onTapItem) onTapItem(id); } });
}
function unmount3D() { if (g3) { g3.destroy(); g3 = null; } }

// ----- Anyone's profile: view-only garden (2D / 3D) -----
let uview = '2d';
function UserProfile({ n }) {
  const me = n === ME(); const L = genLayout(n); const m = S.team.find((x) => x.n === n); const lead = LEADS.includes(n) || (me && isLead());
  const contrib = me ? nContrib() : m ? m.contrib : L.contrib; const items = Object.keys(L.cells).length;
  return `${dtop(me ? 'Your profile' : 'Profile')}
    <div class="card" style="text-align:center;padding-top:20px"><span class="av2" style="width:80px;height:80px;font-size:28px;margin:0 auto;background:${me ? 'var(--p)' : avColor(n)}">${initials(n)}</span>
      <h2 style="font-size:22px;margin-top:10px">${esc(n)}${me ? ' (you)' : ''}</h2><p class="small muted" style="display:inline-flex;align-items:center;gap:6px;margin-top:2px">${(lead ? I.shield : I.pin).replace('<svg', '<svg style="width:15px;height:15px"')}${lead ? 'Team Lead' : 'Member'} · Delhi Central</p>
      <div class="pstats"><div class="pstat">${I.handshake.replace('<svg', '<svg style="color:var(--done)"')}<b>${contrib}</b><span>Contributions</span></div><div class="pstat">${I.leaf.replace('<svg', '<svg style="color:var(--c-tree)"')}<b>${items}</b><span>In garden</span></div><div class="pstat">${I.cal.replace('<svg', '<svg style="color:var(--p)"')}<b>${m ? new Date(m.joined).getFullYear() : 2024}</b><span>Member since</span></div></div>
      ${me ? '' : `<button class="btn ghost block" style="margin-top:12px" data-act="wa-person" data-n="${esc(n)}">${I.wa}Message</button>`}</div>
    <div class="section"><div class="section-h"><h2>${me ? 'Your garden' : `${esc(first(n))}'s garden`}</h2><div class="row" style="gap:6px"><button class="iconbtn solid" data-act="gnight" aria-label="${S.gnight ? 'Day' : 'Night'}">${S.gnight ? I.sun : I.moon}</button></div></div>
      <div class="seg"><button data-uview="2d" aria-pressed="${uview === '2d'}">${I.image}2D</button><button data-uview="3d" aria-pressed="${uview === '3d'}">${I.cube}3D</button></div>
      <div class="ugarden">${uview === '3d' ? `<div class="g3d ${S.gnight ? 'night' : ''}" id="g3d"><div class="loading">Loading garden…</div></div>` : boardSVG(L, { night: S.gnight, meet: true, aria: `${n}'s garden` })}</div>
      <p class="xs faint" style="text-align:center;margin-top:8px">${uview === '3d' ? 'Drag to turn · pinch to zoom' : 'Tap anything to see what it is'} · view only</p>
      ${me ? `<button class="btn soft block" style="margin-top:10px" data-act="arrange">${I.edit}Arrange my garden</button>` : ''}</div>`;
}

// =================== PROFILE ===================
function Profile() {
  const up = S.seva.filter((s) => isFuture(s) && ['going', 'maybe'].includes(st(s))).length + S.events.filter((e) => isFuture(e) && S.rsvp[e.id] === 'going').length;
  const menu = [
    ['journey', I.journey, 'My Seva Journey', `${nContrib()} contributions`, 'open'],
    ['garden', I.garden, 'My Garden', `${ownedTotal()} planted`, 'tab'],
    ['commit', I.cal, 'My Commitments', `${up} upcoming`, 'act'],
    ['team', I.team, 'My Team', 'Delhi Central · 248', 'open'],
    ['inbox', I.bell, 'Notifications', unread() ? `${unread()} new` : '', 'open'],
    ['settings', I.settings, 'App Settings', '', 'act'],
  ];
  return `<div class="phead" style="margin-top:calc(-8px - var(--safe-t))">${boardSVG(ensureLayout(), { night: S.gnight }).replace('class="scene board"', 'class="scene board" style="height:190px;width:100%;display:block;pointer-events:none"')}</div>
    <div class="pcardp" style="margin:-44px -16px 0;padding-left:16px;padding-right:16px"><div class="bigav">${initials(ME())}</div>
      <h1>${esc(ME())}</h1><p class="sub">${isLead() ? I.shield : I.pin}${isLead() ? 'Team Lead' : 'Member'} · Delhi Central</p>
      <div class="pstats"><div class="pstat">${I.handshake.replace('<svg', '<svg style="color:var(--done)"')}<b>${nContrib()}</b><span>Contributions</span></div><div class="pstat">${I.leaf.replace('<svg', '<svg style="color:var(--c-tree)"')}<b>${unlockedCount()}</b><span>Unlocked</span></div><div class="pstat">${SEED}<b>${S.pts}</b><span>Points</span></div></div></div>
    ${roleSwitch()}
    <div class="menu">${menu.map(([k, ic, l, ct, how]) => `<button class="lrow" ${how === 'tab' ? `data-tab="${k}"` : how === 'open' ? `data-open="${k}"` : `data-act="${k}"`}>${ic.replace('<svg', '<svg class="mi"')}<b class="grow">${l}</b><span class="ct">${ct}</span>${chev}</button>`).join('')}</div>
    <p class="xs faint" style="text-align:center;margin-top:18px">Namdhari Seva · member prototype v6</p>`;
}
function TeamScreen() {
  const members = NAMES.filter((n) => !LEADS.includes(n)); const q = teamQ.trim().toLowerCase();
  const all = [{ n: ME(), me: true }, ...members.map((n) => ({ n }))].filter((m) => !q || m.n.toLowerCase().includes(q));
  return `${dtop('My Team')}
    <div class="dhero" style="--cc:#4C3FA8;background:linear-gradient(140deg,#6A5AE0,#3F2F99)"><svg class="bgart" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice"><circle cx="340" cy="30" r="100" fill="#fff" opacity=".15"/></svg><span class="chip" style="background:rgba(255,255,255,.2);color:#fff">${I.pin}Delhi</span><h1>Delhi Central</h1><p style="opacity:.9;margin-top:6px" class="small">Karol Bagh · since 1998</p>
      <div class="row" style="margin-top:14px">${faceRow(NAMES.slice(0, 6), 248, 6)}<span class="small">248 members</span></div></div>
    <div class="tstats" style="margin-top:14px"><div class="tstat" style="--tc:var(--p)"><b>248</b><span>Members</span></div><div class="tstat" style="--tc:var(--done)"><b>112</b><span>Active this month</span></div><div class="tstat" style="--tc:var(--c-langar)"><b>14</b><span>Seva this month</span></div></div>
    <div class="section"><div class="section-h"><h2>Team leads</h2><span class="xs muted">${LEADS.length}</span></div><div class="card list">${LEADS.map((n, i) => `<div class="lrow tap" data-open="user:${n}" style="cursor:pointer"><span class="av2" style="background:${avColor(n)}">${initials(n)}</span><div class="grow"><b class="small">${n}</b><span class="leadtag">Lead</span><p class="xs muted">${['Langar & kitchen', 'Clean-ups', 'Langar & kitchen', 'Tree planting', 'Education', 'Relief'][i]}</p></div><button class="iconbtn" data-act="wa-person" data-n="${esc(n)}" aria-label="Message ${n}" style="color:#25A35A">${I.wa}</button></div>`).join('')}</div></div>
    <div class="section"><div class="section-h"><h2>Members</h2><span class="xs muted">248</span></div>
      <label class="search">${I.search}<input id="team-q" placeholder="Search members" value="${esc(teamQ)}" autocomplete="off"></label>
      <div class="card list" style="margin-top:10px" id="team-list">${all.map((m) => `<div class="lrow tap" data-open="user:${esc(m.n)}" style="cursor:pointer"><span class="av2" style="background:${m.me ? 'var(--p)' : avColor(m.n)}">${initials(m.n)}</span><div class="grow"><b class="small">${esc(m.n)}${m.me ? ' (you)' : ''}</b><p class="xs muted">${m.me ? `${nContrib()} contributions` : `${3 + (m.n.length % 9)} contributions`}</p></div></div>`).join('') || '<p class="small muted" style="padding:14px 0">No one matches.</p>'}</div>
      <p class="xs faint" style="text-align:center;margin-top:10px">Showing ${all.length} of 248 · the full list loads in the real app</p></div>`;
}
function JourneyScreen() {
  const h = contributions(); const by = {}; h.forEach((x) => { by[x.cat] = (by[x.cat] || 0) + 1; });
  return `${dtop('My Seva Journey')}<div class="card" style="text-align:center;background:linear-gradient(135deg,#EAF7E6,var(--surface) 75%)"><p class="small muted">Contributions so far</p><p style="font-size:44px;font-weight:800;letter-spacing:-.03em">${h.length}</p><div class="chips" style="justify-content:center;flex-wrap:wrap">${Object.entries(by).map(([c, n]) => `<span class="chip" style="background:color-mix(in srgb,var(--c-${c}) 14%,transparent);color:var(--c-${c})">${CAT[c].label} · ${n}</span>`).join('')}</div></div>
    <div class="section">${h.length ? h.map(doneCard).join('') : emptyState('Your journey starts with one seva', 'Join a seva and it will appear here.', '<button class="btn soft sm" style="margin-top:12px" data-tab="seva">Find seva</button>')}</div>`;
}
function Inbox() {
  const ic = { live: I.bell, action: I.clock, p: I.sparkle, done: I.checkc };
  const col = { live: 'var(--live)', action: 'var(--action)', p: 'var(--p)', done: 'var(--done)' };
  return `${dtop('Notifications', notifsFor().some((n) => !n.read) ? `<button class="link" data-act="read-all">Mark all read</button>` : '')}
    ${notifsFor().length ? `<div class="card list">${notifsFor().map((n) => `<button class="lrow" data-act="notif" data-id="${n.id}"><span class="av2" style="background:color-mix(in srgb,${col[n.level]} 14%,transparent);color:${col[n.level]}">${ic[n.level].replace('<svg', '<svg style="width:20px;height:20px"')}</span><div class="grow"><b class="small" style="font-weight:${n.read ? 500 : 700}">${esc(n.t)}</b><p class="xs muted">${ago(n.d)}${ago(n.d) === 'just now' ? '' : ' ago'}</p></div>${n.read ? '' : '<span style="width:9px;height:9px;border-radius:50%;background:var(--p)"></span>'}</button>`).join('')}</div>` : emptyState('All quiet', 'Seva alerts and reminders appear here.')}
    <button class="btn ghost block" style="margin-top:14px" data-act="push">${I.bell}Test a phone notification</button>`;
}
function settingsSheet() {
  openSheet(`${sheetHead('App Settings')}
    <label class="f">Appearance</label><div class="seg">${[['auto', 'System'], ['light', 'Light'], ['dark', 'Dark']].map(([k, l]) => `<button data-setmode="${k}" aria-pressed="${S.mode === k}">${l}</button>`).join('')}</div>
    <label class="f">Your name</label><input class="in" id="set-name" value="${esc(S.name)}" placeholder="Your name">
    <label class="f">You are</label><div class="seg"><button data-act="set-gender" data-v="m" aria-pressed="${S.gender === 'm'}">Male</button><button data-act="set-gender" data-v="f" aria-pressed="${S.gender === 'f'}">Female</button></div>
    <button class="btn soft block" style="margin-top:14px" data-act="live-demo">${I.bell}Prototype: live updates from your lead · ${S.liveDemo === false ? 'off' : 'on'}</button>
    <button class="btn soft block" style="margin-top:8px" data-act="sim-story">${I.sparkle}Prototype: a lead posts a new story</button>
    <div class="demo"><p class="h">Prototype: member state</p><div class="seg">${[['new', 'New'], ['active', 'Active'], ['less', 'Less active']].map(([k, l]) => `<button data-scn="${k}" aria-pressed="${S.scenario === k}">${l}</button>`).join('')}</div></div>
    <div class="card list" style="margin-top:14px"><button class="lrow" data-act="install">${I.download}<b class="grow small">Add to Home Screen</b>${chev}</button><button class="lrow" data-act="push">${I.bell}<b class="grow small">Test a notification</b>${chev}</button><button class="lrow" data-act="reset" style="color:var(--live)">${I.reset}<b class="grow small">Reset prototype</b></button></div>
    <button class="btn block" style="margin-top:14px" data-act="save-settings">Done</button>`);
}
function howSheet() {
  openSheet(`${sheetHead('How your garden grows')}<div class="card kv"><div class="r">${I.handshake}<div><b>Do seva</b><span>Each seva your team lead verifies is one contribution.</span></div></div><div class="r">${I.lock}<div><b>Unlock, one at a time</b><span>Every contribution unlocks the next item. Special trees and pets need special seva, like 2 Langar seva for the cherry blossom.</span></div></div><div class="r">${SEED.replace('<svg', '<svg style="width:20px;height:20px"')}<div><b>Earn 3 points per seva</b><span>Spend on cheap flowers many times, or save for a 4-point pet. Points never expire.</span></div></div><div class="r">${I.cart}<div><b>Add to cart, then plant</b><span>Review your cart, confirm, and watch it appear in your garden.</span></div></div></div><p class="xs muted" style="margin-top:12px;text-align:center">No rankings. Your garden is yours.</p>`);
}

// ----- Onboarding -----
function renderOnboarding() {
  $('#app').innerHTML = `<div class="onb"><div>${LOGO.replace('class="logo"', 'class="logo" style="width:56px;height:56px"')}
      <h1 style="margin-top:22px">Seva together.<br><span style="color:var(--p)">Grow together.</span></h1>
      <p class="muted" style="margin-top:12px">See what the sangat is doing, pick the seva tasks you'll do, and grow your own garden with every contribution.</p>
      <div style="margin:22px -22px;overflow:hidden">${boardSVG(layoutFromOwned({ marigold: 3, sapling: 2, rose: 1, mango: 1, bench: 1, cat: 1, lantern: 1 })).replace('class="scene board"', 'class="scene board" style="display:block;width:100%;height:auto"')}</div>
      <label class="f" for="onb-name">Your name</label><input class="in" id="onb-name" placeholder="e.g. Harpreet Kaur" autocomplete="name">
      <label class="f">You are</label><div class="seg gseg"><button data-act="onb-gender" data-v="m" aria-pressed="${S.gender === 'm'}">Male</button><button data-act="onb-gender" data-v="f" aria-pressed="${S.gender === 'f'}">Female</button></div>
      <p class="xs muted" style="margin-top:6px">Helps your team plan seva. Only counted in overall numbers.</p>
      <p class="xs muted" style="margin-top:8px">You've been invited to <b style="color:var(--ink)">Delhi Central</b>.</p></div>
    <button class="btn block" style="margin-top:20px" data-act="onb-finish">Join Delhi Central</button></div>`;
}

// =================== TEAM LEAD ===================
// The prototype lead is a team lead of Delhi Central: manages all local (non-HQ) seva,
// posts group stories (max 2 a day, gone after 24 h), manages members and marks attendance.
const isLead = () => S.role === 'lead';
const STORY_LIMIT = 2; // per lead per day; Seva HQ gets 5
const SG = () => (isAdmin() ? 'g-hq' : 'g-delhi');
const storyLimit = () => (isAdmin() ? 5 : STORY_LIMIT);
function ensureHQGroup() { if (!S.groups.some((g) => g.id === 'g-hq')) S.groups.unshift({ id: 'g-hq', name: 'Seva HQ', code: 'HQ', full: 'Namdhari Seva HQ', hue: ['#6A5AE0', '#3F2F99'], stories: [] }); }
const localSeva = () => S.seva.filter((s) => !s.hq);
const needsAttend = (s) => !s.hq && T(s.end) < now() && !s.att && !s.cancelled;
const recipients = (s) => peopleOf(s).filter((p) => ['going', 'maybe', 'here'].includes(p.st));
const noReply = (s) => s.people.filter((p) => p.st === 'invited');
const myStoriesToday = () => { ensureHQGroup(); const g = grp(SG()); const d0 = new Date(); d0.setHours(0, 0, 0, 0); return g.stories.filter((s) => s.by === '@me' && T(s.d) >= d0.getTime()); };
const myActiveStories = () => { ensureHQGroup(); return grp(SG()).stories.filter((s) => s.by === '@me'); };
I.edit = svg('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z"/>');
I.trash = svg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>');
I.camera = svg('<rect x="3" y="7" width="18" height="13" rx="3"/><path d="M8 7l2-3h4l2 3"/><circle cx="12" cy="13.5" r="3.5"/>');
I.link = svg('<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>');
I.eye = svg('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>');
I.userplus = svg('<circle cx="9" cy="8" r="3.5"/><path d="M2 20a7 7 0 0 1 14 0M19 8v6M16 11h6"/>');
I.align = svg('<path d="M4 6h16M7 12h10M4 18h16"/>', 2);
I.clip = svg('<path d="M9 11h6M9 15h4"/><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2.5h6V4"/>');
I.shield = svg('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>');

function leadSeed(d, kind) {
  // a seva that ended yesterday and still needs attendance
  d.seva.push({ id: 's11', title: 'Langar Seva — Sunday', cat: 'langar', start: at(-1, 9), end: at(-1, 13), place: 'Namdhari Gurdwara, Karol Bagh', meet: 'Langar hall', lead: 'Gurpreet Singh', purpose: 'Weekly langar for about 300 sangat.', instructions: 'Arrive 15 minutes early.', created: at(-9, 9), people: crowd(14, 12, 2, 1), points: pts(14, [['Cook dal and sabzi', 3, 3, kind === 'active'], ['Make rotis', 4, 4, false], ['Serve langar', 5, 4, false]]), updates: [] });
  if (kind === 'active') d.assign.s11 = { state: 'going' };
  d.seva.find((s) => s.id === 's6').people.push(...['Amrit Singh', 'Noor Kaur', 'Ekam Kaur', 'Arjan Singh'].map((n) => ({ n, st: 'invited' })));
  d.team = NAMES.filter((n) => !LEADS.includes(n)).map((n, i) => ({ n, joined: at(-(40 + i * 37), 10), contrib: (n.length * 7 + i * 3) % 23, last: [2, 5, 9, 15, 75, 3, 120, 20, 8, 1, 66, 30][i % 12], ph: `98${String(10000000 + i * 7919).slice(0, 8)}` }));
  d.requests = [{ n: 'Amanpreet Kaur', d: rel(-50), note: 'Moved to Karol Bagh from Ludhiana' }, { n: 'Jaskaran Singh', d: rel(-200), note: 'Invited by Simran Kaur' }, { n: 'Rupinder Kaur', d: at(-1, 18), note: '' }];
  d.notifs.push({ id: 'nl1', role: 'lead', level: 'action', t: 'Langar Seva — Sunday ended. Mark attendance so sevadars get their points.', d: at(-1, 14), ref: 'attend:s11' }, { id: 'nl2', role: 'lead', level: 'p', t: '3 people asked to join Delhi Central', d: rel(-50), ref: 'tab:team' }, { id: 'nl3', role: 'lead', level: 'live', t: 'Gurdwara Hall Cleaning: "Clean windows and ceiling fans" still has no one', d: rel(-12), ref: 'seva:s0' });
}

// ----- Lead home strip -----
function leadGlance() {
  const live = localSeva().filter(isLive); const att = localSeva().filter(needsAttend); const nobody = localSeva().filter((s) => T(s.end) > now()).reduce((a, s) => a + s.points.filter((p) => !p.takers.length).length, 0);
  const tiles = [['seva', live.length, 'Live now', 'var(--live)', I.seva], ['attend', att.length, 'Attendance due', 'var(--action)', I.clip], ['nobody', nobody, 'Tasks with no one', '#B7791F', I.alert], ['team', S.requests.length, 'Join requests', 'var(--p)', I.userplus]];
  return `<div class="glance"><div class="row" style="justify-content:space-between"><b class="small">Today at Delhi Central</b><button class="link" style="min-height:30px;padding:0" data-act="glance" data-k="insights">Insights${I.chev}</button></div><div class="gtiles">${tiles.map(([k, n, l, c, ic]) => `<button class="gtile tap" data-act="glance" data-k="${k}" style="--gc:${c}"><span class="gi">${ic}</span><b>${n}</b><span>${l}</span></button>`).join('')}</div></div>`;
}
function yourStoryRing() {
  const mine = myActiveStories(); const unseen = mine.some((s) => !SS()[s.id]);
  return `<div class="story yours"><button class="ring-btn" data-act="${mine.length ? 'story-mine' : 'story-new'}" aria-label="${mine.length ? 'Your story' : 'Add a story'}"><span class="ring" style="${mine.length ? (unseen ? '' : 'background:var(--border)') : 'background:transparent'}"><span><span class="meav">${initials(ME())}</span></span></span></button><button class="addplus" data-act="story-new" aria-label="Add a story">${I.plus}</button><b>Your story</b></div>`;
}

// ----- Story composer (Instagram-like) -----
const BGS = { sunset: ['#FF7E5F', '#FEB47B'], saffron: ['#F7A428', '#D9480F'], rose: ['#F857A6', '#FF5858'], ocean: ['#2193B0', '#6DD5ED'], forest: ['#11998E', '#38EF7D'], night: ['#141E30', '#4B3F8F'], violet: ['#7F5AF0', '#C471ED'], grey: ['#3A3A40', '#8E8E96'] };
const FONTS = [['classic', 'Classic'], ['serif', 'Serif'], ['strong', 'Strong'], ['type', 'Typewriter']];
const TCOL = ['#FFFFFF', '#16151A', '#FFE27A', '#FFB4D2'];
let SC = null;
const bgCss = (k) => `linear-gradient(160deg, ${BGS[k][0]}, ${BGS[k][1]})`;
function openComposer() {
  if (myStoriesToday().length >= storyLimit()) { openSheet(`${sheetHead('Daily limit reached')}<div class="card" style="text-align:center"><div style="font-size:40px">⏳</div><p class="small" style="margin-top:6px">You can share <b>${storyLimit()} stories a day</b>, so the sangat's story row stays calm and useful.</p><p class="xs muted" style="margin-top:8px">You can share again after midnight. You can still delete one of today's stories to post a new one.</p></div><button class="btn block" style="margin-top:14px" data-act="story-mine">See your stories</button>`); return; }
  SC = { bg: 'saffron', img: null, font: 'classic', align: 'center', col: 0, x: 50, y: 42, link: null, text: '' };
  history.pushState({ sc: 1 }, '');
  let host = $('#sc-root'); if (!host) { host = document.createElement('div'); host.id = 'sc-root'; document.body.appendChild(host); }
  document.body.style.overflow = 'hidden'; drawComposer(true);
}
function drawComposer(focus) {
  const used = myStoriesToday().length; const l = SC.link ? (SC.link.startsWith('seva') ? sv(SC.link.split(':')[1]) : ev(SC.link.split(':')[1])) : null;
  const hadFocus = document.activeElement?.id === 'sc-text';
  $('#sc-root').innerHTML = `<div class="sc ${focus ? 'anim' : ''}"><div class="sc-stage">
    <div class="sc-canvas" id="sc-canvas" style="background:${SC.img ? '#000' : bgCss(SC.bg)}">${SC.img ? `<img src="${SC.img}" alt="">` : ''}
      <div class="sc-text f-${SC.font}" id="sc-text" contenteditable="true" spellcheck="false" data-ph="Type something…" style="left:${SC.x}%;top:${SC.y}%;text-align:${SC.align};color:${TCOL[SC.col]};${SC.img ? 'text-shadow:0 2px 12px rgba(0,0,0,.5)' : ''}">${esc(SC.text)}</div>
      ${l ? `<span class="sc-link">${I.link}${esc(l.title)}</span>` : ''}</div>
    <div class="sc-top"><button data-act="sc-close" aria-label="Discard">${I.close}</button><span class="sp"></span>
      <button data-act="sc-font" aria-label="Font"><b style="font-size:17px">Aa</b></button><button data-act="sc-align" aria-label="Align">${I.align}</button><button data-act="sc-col" aria-label="Text colour"><i class="dotc" style="background:${TCOL[SC.col]}"></i></button><button data-act="sc-photo" aria-label="Add photo">${I.camera}</button><button data-act="sc-link" aria-label="Link a seva">${I.link}</button></div>
    <div class="sc-bottom">${SC.img ? `<button class="sc-chip" data-act="sc-nophoto">${I.trash}Remove photo</button>` : `<div class="sc-bgs">${Object.keys(BGS).map((k) => `<button data-scbg="${k}" aria-label="${k} background" aria-pressed="${SC.bg === k}" style="background:${bgCss(k)}"></button>`).join('')}</div>`}
      <div class="row" style="margin-top:12px"><span class="sc-note">${used} of ${storyLimit()} today · lasts 24 h</span><span class="sp" style="flex:1"></span><button class="sc-share" data-act="sc-share"><span class="gav">${groupAv(grp(SG()))}</span>Share to ${isAdmin() ? 'all' : 'Delhi'}${I.chev}</button></div></div>
    <input type="file" id="sc-file" accept="image/*" hidden>
  </div></div>`;
  const t = $('#sc-text'); t.addEventListener('input', () => { SC.text = t.innerText; });
  $('#sc-file').addEventListener('change', (e) => scLoadImage(e.target.files[0]));
  if (focus) setTimeout(() => placeCaret(t), 120); else if (hadFocus) placeCaret(t);
}
// Small style changes are applied in place: no redraw, no flicker, the keyboard stays open.
function scPatch() {
  const t = $('#sc-text'), c = $('#sc-canvas'); if (!t || !c) return;
  if (!SC.img) c.style.background = bgCss(SC.bg);
  t.className = `sc-text f-${SC.font}`; t.style.textAlign = SC.align; t.style.color = TCOL[SC.col];
  const dot = $('.sc-top .dotc'); if (dot) dot.style.background = TCOL[SC.col];
  $$('[data-scbg]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.scbg === SC.bg));
}
// font name shows briefly in the middle, like Instagram, instead of a toast
function scHint(txt) { let h = $('#sc-hint'); if (!h) { h = document.createElement('div'); h.id = 'sc-hint'; h.className = 'sc-hint'; $('.sc-stage')?.appendChild(h); } h.textContent = txt; h.classList.remove('show'); void h.offsetWidth; h.classList.add('show'); }
// tapping a tool must not steal focus from the text (keeps the keyboard open)
document.addEventListener('pointerdown', (e) => { if (e.target.closest('.sc-top button:not([data-act=sc-close]):not([data-act=sc-photo]):not([data-act=sc-link]), .sc-bgs button')) e.preventDefault(); });
function placeCaret(el) { el.focus(); const r = document.createRange(); r.selectNodeContents(el); r.collapse(false); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
function scLoadImage(file) {
  if (!file) return; const fr = new FileReader();
  fr.onload = () => { const im = new Image(); im.onload = () => { const max = 1080; const k = Math.min(1, max / Math.max(im.width, im.height)); const c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); SC.img = c.toDataURL('image/jpeg', .76); if (SC.col === 1) SC.col = 0; drawComposer(); }; im.src = fr.result; };
  fr.readAsDataURL(file);
}
function closeComposer(fromPop) { if (!SC) return; SC = null; $('#sc-root').innerHTML = ''; document.body.style.overflow = ''; if (!fromPop) { ignorePop = true; history.back(); } }
function scShare() {
  const text = (SC.text || '').trim(); if (!text && !SC.img) { toast('Add some text or a photo first'); placeCaret($('#sc-text')); return; }
  if (myStoriesToday().length >= storyLimit()) { toast(`Limit: ${STORY_LIMIT} stories a day`); return; }
  const l = SC.link; const lt = l ? (l.startsWith('seva') ? sv(l.split(':')[1]) : ev(l.split(':')[1])) : null;
  const st2 = { id: 'my' + uid(), d: iso(now()), by: '@me', poster: ME(), custom: true, text, bg: SC.bg, img: SC.img, font: SC.font, align: SC.align, col: SC.col, x: SC.x, y: SC.y, link: l, cta: lt ? (isLive(lt) ? 'Open live seva' : 'View seva') : null, views: 0 };
  grp(SG()).stories.push(st2); SS()[st2.id] = now();
  try { save(); } catch (e) {}
  if (!localStorage.getItem(KEY)?.includes(st2.id)) { st2.img = null; save(); toast('Photo too large to keep on this device — saved the text only'); }
  closeComposer(); rerender(); setTimeout(() => toast(`Shared to ${isAdmin() ? 'every member' : 'Delhi'} · disappears in 24 hours`), 250);
}
// drag text to move it; tap to edit
let scDrag = null;
document.addEventListener('pointerdown', (e) => { const t = e.target.closest('#sc-text'); if (!t || !SC) return; scDrag = { x: e.clientX, y: e.clientY, ox: SC.x, oy: SC.y, moved: false, focused: document.activeElement === t }; if (!scDrag.focused) e.preventDefault(); });
document.addEventListener('pointermove', (e) => { if (!scDrag) return; const dx = e.clientX - scDrag.x, dy = e.clientY - scDrag.y; if (!scDrag.moved && Math.hypot(dx, dy) < 6) return; if (scDrag.focused) return; scDrag.moved = true; const r = $('#sc-canvas').getBoundingClientRect(); SC.x = Math.max(10, Math.min(90, scDrag.ox + dx / r.width * 100)); SC.y = Math.max(8, Math.min(88, scDrag.oy + dy / r.height * 100)); const t = $('#sc-text'); t.style.left = SC.x + '%'; t.style.top = SC.y + '%'; });
document.addEventListener('pointerup', () => { if (!scDrag) return; const d = scDrag; scDrag = null; if (!d.moved && !d.focused) placeCaret($('#sc-text')); });
function scLinkSheet() {
  const list = [...localSeva().filter((s) => T(s.end) > now()).map((s) => ({ k: 'seva', x: s })), ...S.events.filter(isFuture).map((e) => ({ k: 'event', x: e }))].sort((a, b) => T(a.x.start) - T(b.x.start));
  openSheet(`${sheetHead('Link a seva', 'Members can open it from your story')}<div class="card list">${SC.link ? `<button class="lrow" data-act="sc-setlink" data-ref=""><span class="av2" style="background:var(--surface2);color:var(--muted)">${I.close.replace('<svg', '<svg style="width:18px;height:18px"')}</span><b class="small grow">No link</b></button>` : ''}${list.map((i) => `<button class="lrow" data-act="sc-setlink" data-ref="${i.k}:${i.x.id}"><span class="av2" style="background:var(--c-${i.k === 'event' ? 'event' : i.x.cat})">${new Date(i.x.start).getDate()}</span><div class="grow"><b class="small">${esc(i.x.title)}</b><p class="xs muted">${isLive(i.x) ? '<b style="color:var(--live)">LIVE</b> · ' : ''}${relDay(i.x.start)} · ${fmtTime(i.x.start)}</p></div>${SC.link === `${i.k}:${i.x.id}` ? I.check.replace('<svg', '<svg style="width:20px;height:20px;color:var(--p)"') : ''}</button>`).join('')}</div>`);
}
function customSlide(s) {
  const bg = s.img ? `<img class="simg" src="${s.img}" alt="">` : `<div class="sbg" style="background:${bgCss(s.bg)}"></div>`;
  return `<div class="slide custom">${bg}<div class="sc-text f-${s.font} shown" style="left:${s.x}%;top:${s.y}%;text-align:${s.align};color:${TCOL[s.col]};${s.img ? 'text-shadow:0 2px 12px rgba(0,0,0,.5)' : ''}">${esc(s.text).replace(/\n/g, '<br>')}</div></div>`;
}
function deleteMyStory(id) {
  const g = grp(SG()); g.stories = g.stories.filter((s) => s.id !== id); save();
  if (!SV) return; if (!g.stories.length) { closeStory(); return; }
  SV.i = Math.min(SV.i, g.stories.length - 1); buildCube(); showStory(); toast('Story deleted');
}

// ----- Lead: manage seva list -----
let leadChip = null;
function leadLists() {
  const L = localSeva().filter((s) => !s.cancelled);
  return { live: L.filter(isLive), upcoming: L.filter(isFuture).sort((a, b) => T(a.start) - T(b.start)), attend: L.filter(needsAttend), done: L.filter((s) => s.att).sort((a, b) => T(b.start) - T(a.start)) };
}
function leadCard(s) {
  const live = isLive(s); const r = recipients(s); const nob = s.points.filter((p) => !p.takers.length).length; const nr = noReply(s).length;
  const need = s.points.reduce((a, p) => a + p.need, 0), got = s.points.reduce((a, p) => a + Math.min(p.need, p.takers.length), 0);
  const flags = needsAttend(s) ? `<span class="status st-plan">${I.clip}Mark attendance</span>` : s.att ? `<span class="status st-done">${I.check}${s.att.present.length} attended · ${s.att.present.length * s.att.pts} pts given</span>` : `${nob ? `<span class="status st-plan">${I.alert}${nob} task${nob > 1 ? 's' : ''} with no one</span>` : `<span class="status st-done">${I.check}All tasks covered</span>`}${nr ? `<span class="status" style="background:var(--surface2);color:var(--muted)">${nr} no reply</span>` : ''}`;
  return `<button class="scard tap ${live ? 'live' : ''}" data-open="seva:${s.id}">${dblock(s.start, s.cat, live, s.end)}<div class="grow"><span class="chip" style="background:color-mix(in srgb,var(--c-${s.cat}) 13%,transparent);color:var(--c-${s.cat})">${CAT[s.cat].label}</span><h3>${esc(s.title)}</h3>
    <p class="m ellipsis">${live ? `Ends ${fmtTime(s.end)} · ${progress(s)}% done` : `${relDay(s.start)} · ${fmtTime(s.start)}`}</p>
    ${s.att || needsAttend(s) ? '' : `<div class="mini"><i style="width:${need ? got / need * 100 : 0}%"></i></div><p class="xs muted" style="margin-top:4px">${got}/${need} places · ${r.length} going</p>`}
    <div class="foot">${flags}</div></div></button>`;
}
function LeadSeva() {
  const L = leadLists(); if (!leadChip) leadChip = L.attend.length ? 'attend' : L.live.length ? 'live' : 'upcoming';
  const chips = [['live', 'Live', L.live.length], ['upcoming', 'Upcoming', L.upcoming.length], ['attend', 'Attendance', L.attend.length], ['done', 'Done', L.done.length]];
  const list = L[leadChip];
  return `<div class="chips fill tight" style="margin-top:12px">${chips.map(([k, l, n]) => `<button class="chip2" data-lchip="${k}" aria-pressed="${leadChip === k}">${k === 'live' && n ? '<i class="ld"></i>' : ''}${l}<span class="n" ${k === 'attend' && n ? 'style="background:var(--action-c);color:#2A1A00"' : ''}>${n}</span></button>`).join('')}</div>
    <div style="margin-top:12px">${list.length ? list.map(leadCard).join('') : emptyState({ live: 'Nothing live right now', upcoming: 'No seva planned', attend: 'All attendance is done', done: 'No completed seva yet' }[leadChip], leadChip === 'attend' ? 'Sevadars have their points. 🙏' : 'Create a seva and members get notified.', leadChip === 'upcoming' ? '<button class="btn soft sm" style="margin-top:12px" data-act="seva-new">Create seva</button>' : '')}</div>
    <button class="fab" data-act="seva-new" aria-label="Create seva">${I.plus}<span>New seva</span></button>`;
}

// ----- Lead: seva detail (manage) -----
function LeadSevaDetail({ id }) {
  const s = sv(id); const live = isLive(s), ended = T(s.end) < now(); const r = recipients(s);
  const ppl = peopleOf(s); const c = (k) => ppl.filter((p) => k === 'going' ? ['going', 'here'].includes(p.st) : p.st === k).length;
  const nob = s.points.filter((p) => !p.takers.length).length; const nr = noReply(s).length;
  const tabs = [['overview', 'Overview', needsAttend(s) ? '<span class="n warn">!</span>' : ''], ['tasks', 'Tasks', nob && !ended ? `<span class="n warn">${nob}</span>` : ''], ['people', 'People', nr && !ended ? `<span class="n warn">${nr}</span>` : ''], ['updates', 'Updates', '']];
  if (!tabs.find((t) => t[0] === dtab)) dtab = 'overview';
  const hero = `<div class="dhero cc-${s.cat} ${live ? 'islive' : ''}"><svg class="bgart" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice"><circle cx="350" cy="40" r="110" fill="#fff" opacity=".18"/></svg>
    <div class="row" style="gap:8px">${live ? '<span class="livepill big" style="background:#fff;color:#D81F3A"><i style="background:#D81F3A"></i>LIVE NOW</span>' : `<span class="chip" style="background:rgba(255,255,255,.22);color:#fff">${CAT[s.cat].label}</span>`}<span class="chip" style="background:rgba(0,0,0,.18);color:#fff">${I.shield}You manage this</span></div>
    <h1>${esc(s.title)}</h1><div class="meta"><div>${I.cal}${relDay(s.start)}, ${fmtTime(s.start)} – ${fmtTime(s.end)}</div><div>${I.pin}${esc(s.place)}</div>${isAdmin() ? (() => { const g = sevaGroup(s); return `<div>${I.globe}${g.flag} ${g.country} · ${g.state} · ${esc(g.name)}${s.hq ? ' · HQ seva for all sangat' : ''}</div>`; })() : ''}</div>
    ${!ended ? `<button class="partpill" style="background:rgba(255,255,255,.95);color:#16151A" data-act="seva-edit" data-id="${s.id}">${I.edit}Edit details</button>` : ''}</div>`;
  let body = '';
  if (dtab === 'overview') {
    body = `${needsAttend(s) ? `<button class="banner tap" data-act="attend" data-id="${s.id}" style="font-size:14px">${I.clip}<span class="grow"><b>Seva ended — mark attendance</b><br><span class="xs">Sevadars get their garden points once you save it.</span></span>${chev}</button>` : ''}
      ${s.att ? `<div class="card" style="background:linear-gradient(135deg,var(--done-bg),var(--surface) 70%)"><div class="row"><span class="av2" style="background:var(--done-c)">${I.check.replace('<svg', '<svg style="width:20px;height:20px"')}</span><div class="grow"><b>Attendance saved</b><p class="xs muted">${s.att.present.length} present · ${s.att.pts} points each · ${s.att.present.length * s.att.pts} points given</p></div></div></div>` : ''}
      <div class="tstats four"><div class="tstat" style="--tc:var(--done)"><b>${c('going')}</b><span>Going</span></div><div class="tstat" style="--tc:var(--action)"><b>${c('maybe')}</b><span>Maybe</span></div><div class="tstat" style="--tc:var(--live)"><b>${c('cant')}</b><span>Can't</span></div><div class="tstat"><b>${nr}</b><span>No reply</span></div></div>
      <div class="card"><div class="prog"><span>${live ? 'Seva progress' : 'Places filled'}</span><span style="color:var(--done)">${live ? progress(s) : filled(s)}%</span></div><div class="pbar"><i style="width:${live ? progress(s) : filled(s)}%"></i></div></div>
      ${!ended && (nob || nr) ? `<div class="card"><h2 style="font-size:16px;margin-bottom:6px">Needs your attention</h2>${s.points.filter((p) => !p.takers.length).map((p) => `<div class="lrow"><span class="av2" style="background:var(--action-bg);color:var(--action)">${I.alert.replace('<svg', '<svg style="width:18px;height:18px"')}</span><div class="grow"><b class="small">${esc(p.text)}</b><p class="xs muted">No one yet · needs ${p.need}</p></div><button class="btn soft sm" data-act="ask-help" data-id="${s.id}" data-p="${p.id}">Ask for help</button></div>`).join('')}${nr ? `<div class="lrow"><span class="av2" style="background:var(--surface2);color:var(--muted)">${I.clock.replace('<svg', '<svg style="width:18px;height:18px"')}</span><div class="grow"><b class="small">${nr} invited, no reply yet</b><p class="xs muted">${noReply(s).slice(0, 3).map((p) => first(p.n)).join(', ')}${nr > 3 ? '…' : ''}</p></div><button class="btn soft sm" data-act="nudge" data-id="${s.id}">Remind</button></div>` : ''}</div>` : ''}
      <button class="btn ghost block" data-open="sevaas:${s.id}">${I.eye}See it as a sevadar</button>
      ${!ended ? `<button class="btn ghost block" style="color:var(--live)" data-act="seva-cancel" data-id="${s.id}">${I.xc}Cancel this seva</button>` : ''}`;
  } else if (dtab === 'tasks') {
    body = `<div class="card">${s.points.map((p) => { const n = p.takers.length; return `<div class="pt ${!n ? 'nobody' : ''}"><div class="grow"><b class="t">${esc(p.text)}</b><div class="sub">${n ? faceRow(p.takers.map(nameOf), n, 4) : ''}<span class="chip ${!n ? 'action' : n < p.need ? 'p' : 'done'}">${!n ? 'No one yet' : n < p.need ? `${p.need - n} more needed` : 'Covered'}</span><span class="xs muted">${n}/${p.need}</span></div>${n ? `<p class="xs muted" style="margin-top:6px">${esc(p.takers.map(nameOf).join(', '))}</p>` : ''}</div>${ended ? '' : `<div class="row" style="gap:4px"><button class="iconbtn" data-act="task-edit" data-id="${s.id}" data-p="${p.id}" aria-label="Edit task">${I.edit}</button><button class="iconbtn" data-act="task-del" data-id="${s.id}" data-p="${p.id}" aria-label="Delete task" style="color:var(--live)">${I.trash}</button></div>`}</div>`; }).join('') || '<p class="small muted">No tasks yet.</p>'}</div>
      ${ended ? '' : `<button class="btn soft block" data-act="task-edit" data-id="${s.id}">${I.plus}Add a task</button><p class="xs muted" style="text-align:center">${live ? `Changes alert all ${r.length} people at the seva right away.` : `Changes notify the ${r.length} people who said going or maybe.`}</p>`}`;
  } else if (dtab === 'people') {
    const groups = [['going', 'Going'], ['maybe', 'Maybe'], ['cant', 'Can\'t'], ['invited', 'No reply']];
    if (!groups.find((g) => g[0] === teamFilter)) teamFilter = 'going';
    const list = ppl.filter((p) => teamFilter === 'going' ? ['going', 'here'].includes(p.st) : p.st === teamFilter);
    body = `<div class="seg">${groups.map(([k, l]) => `<button data-tf="${k}" aria-pressed="${teamFilter === k}">${l} · ${ppl.filter((p) => k === 'going' ? ['going', 'here'].includes(p.st) : p.st === k).length}</button>`).join('')}</div>
      <div class="card list">${list.length ? list.map((p) => `<div class="lrow tap" data-open="user:${esc(p.n)}" style="cursor:pointer"><span class="av2 ${p.st === 'here' ? 'here' : ''}" style="background:${p.me ? 'var(--p)' : avColor(p.n)}">${initials(p.n)}</span><div class="grow"><b class="small">${esc(p.n)}${p.me ? ' (you)' : ''}</b><p class="xs muted ellipsis">${esc(s.points.filter((x) => x.takers.map(nameOf).includes(p.n)).map((x) => x.text).join(' · ') || (p.st === 'invited' ? 'Invited · waiting for reply' : 'No task picked'))}</p></div><button class="iconbtn" data-act="wa-person" data-n="${esc(p.n)}" aria-label="Message" style="color:#25A35A">${I.wa}</button></div>`).join('') : '<p class="small muted" style="padding:14px 0">No one here.</p>'}</div>
      ${ended ? '' : `<div class="btn-row"><button class="btn soft" data-act="invite-sheet" data-id="${s.id}">${I.userplus}Invite members</button>${nr ? `<button class="btn ghost" data-act="nudge" data-id="${s.id}">${I.bell}Remind ${nr}</button>` : ''}</div>`}`;
  } else {
    const q = ['Running 15 minutes late', 'Tea break in the courtyard', 'Please bring gloves', 'Thank you all 🙏'];
    body = `${ended ? '' : `<div class="card"><label class="f" style="margin-top:0" for="up-text">Post an update · goes to ${r.length} people</label><textarea class="in" id="up-text" rows="2" placeholder="e.g. Meet at Gate 2 instead"></textarea><div class="chips" style="margin-top:8px">${q.map((t) => `<button class="chip2" data-act="up-quick" data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div><button class="btn block" style="margin-top:10px" data-act="up-send" data-id="${s.id}">${I.megaphone}Send to everyone</button></div>`}
      ${s.updates.length ? `<div class="card">${s.updates.map((u) => `<div class="upd"><span class="ic">${u.kind === 'new' ? I.plus : u.kind === 'edit' ? I.alert : I.megaphone}</span><div class="grow"><b class="small" style="display:block">${esc(u.t)}</b><span class="xs muted">${esc(u.by === ME() ? 'You' : u.by)} · ${ago(u.d)}${ago(u.d) === 'just now' ? '' : ' ago'}${u.sent ? ` · sent to ${u.sent}` : ''}</span></div></div>`).join('')}</div>` : emptyState('No updates yet', 'Anything you post here reaches everyone in this seva as a notification.')}`;
  }
  const act = needsAttend(s) ? `<button class="btn block" data-act="attend" data-id="${s.id}">${I.clip}Mark attendance</button>` : live ? `<div class="btn-row"><button class="btn ghost" data-dtab="updates">${I.megaphone}Post update</button><button class="btn" data-act="seva-end" data-id="${s.id}">${I.check}End seva</button></div>` : '';
  return `${dtop('Manage seva', `<button class="iconbtn" data-act="wa" data-id="${s.id}" aria-label="Share on WhatsApp">${I.share}</button>`)}${hero}
    <div class="dtabs" role="tablist">${tabs.map(([k, l, b]) => `<button role="tab" data-dtab="${k}" aria-selected="${dtab === k}">${l}${b}</button>`).join('')}</div>
    <div style="margin-top:16px" class="stack">${body}</div>${act ? `<div class="stickyact"><div>${act}</div></div>` : ''}`;
}
// every change during a seva reaches the people in it
function broadcast(s, text, kind = 'info') {
  const r = recipients(s); s.updates.unshift({ id: 'u' + uid(), t: text, d: iso(now() + 500), by: ME(), kind, sent: r.length });
  if (['going', 'maybe'].includes(st(s))) S.notifs.unshift({ id: 'n' + uid(), level: isLive(s) ? 'live' : 'action', t: `${s.title}: ${text}`, d: iso(now()), ref: 'seva:' + s.id });
  save(); return r.length;
}
function taskSheet(sid, pid) {
  const s = sv(sid); const p = pid ? s.points.find((x) => x.id === pid) : null;
  openSheet(`${sheetHead(p ? 'Edit task' : 'Add a task', esc(s.title))}<label class="f" for="tk-text">What needs doing?</label><input class="in" id="tk-text" value="${p ? esc(p.text) : ''}" placeholder="e.g. Water for sangat at the entrance">
    <label class="f">People needed</label><div class="qty" style="width:max-content"><button data-act="tk-need" data-d="-1" aria-label="Fewer">−</button><span id="tk-need" style="min-width:36px">${p ? p.need : 2}</span><button data-act="tk-need" data-d="1" aria-label="More">+</button></div>
    ${isLive(s) ? `<div class="banner" style="margin-top:14px">${I.bell}<span>This seva is live — everyone there gets an alert.</span></div>` : ''}
    <button class="btn block" style="margin-top:16px" data-act="tk-save" data-id="${sid}" data-p="${pid || ''}">${p ? 'Save and notify' : 'Add and notify'}</button>`);
  setTimeout(() => $('#tk-text')?.focus(), 250);
}
function editSheet(sid) {
  const s = sv(sid); const tv = (d) => `${String(new Date(d).getHours()).padStart(2, '0')}:${String(new Date(d).getMinutes()).padStart(2, '0')}`;
  openSheet(`${sheetHead('Edit seva details', 'Members are notified of changes')}
    <label class="f" for="ed-title">Title</label><input class="in" id="ed-title" value="${esc(s.title)}">
    <label class="f" for="ed-date">Date</label><input class="in" type="date" id="ed-date" value="${ymd(s.start)}">
    <div class="btn-row"><div style="flex:1"><label class="f" for="ed-start">Starts</label><input class="in" type="time" id="ed-start" value="${tv(s.start)}"></div><div style="flex:1"><label class="f" for="ed-end">Ends</label><input class="in" type="time" id="ed-end" value="${tv(s.end)}"></div></div>
    <label class="f" for="ed-place">Place</label><input class="in" id="ed-place" value="${esc(s.place)}">
    <label class="f" for="ed-meet">Meeting point</label><input class="in" id="ed-meet" value="${esc(s.meet)}">
    <button class="btn block" style="margin-top:16px" data-act="ed-save" data-id="${sid}">Save and notify ${recipients(s).length} people</button>`);
}
function inviteSheet(sid) {
  const s = sv(sid); const inS = new Set(s.people.map((p) => p.n));
  const list = S.team.filter((m) => !inS.has(m.n));
  openSheet(`${sheetHead('Invite members', esc(s.title))}<p class="small muted" style="margin-bottom:10px">They get a notification and can reply Going, Maybe or Can't.</p><div class="card list" style="max-height:46vh;overflow:auto">${list.map((m) => `<label class="lrow" style="cursor:pointer"><span class="av2" style="background:${avColor(m.n)}">${initials(m.n)}</span><div class="grow"><b class="small">${esc(m.n)}</b><p class="xs muted">${m.last > 60 ? `Inactive · last seva ${m.last} days ago` : `${m.contrib} contributions`}</p></div><input type="checkbox" class="ck" value="${esc(m.n)}"></label>`).join('')}</div>
    <button class="btn block" style="margin-top:14px" data-act="invite-send" data-id="${sid}">${I.userplus}Send invites</button>`);
}
// ----- Seva creation -----
const TEMPLATES = { nasha: ['Nasha Mukti Awareness Camp', [['Set up the stall and banners', 3], ['Talk with visitors', 4], ['Hand out leaflets', 4], ['Counselling desk', 2]]], donation: ['Donation Drive', [['Collection desk', 2], ['Count and record', 2], ['Pack items for delivery', 4]]], stall: ['Roadside Langar Stall', [['Set up the stall', 4], ['Cook', 4], ['Serve passers-by', 6], ['Clean up after', 3]]], clothes: ['Clothes for the Needy', [['Sort clothes by size', 4], ['Pack bundles', 4], ['Hand out clothes', 6]]], social: ['Social Service Day', [['Visit the elderly home', 4], ['Help with errands', 3], ['Hospital visit', 3]]], cleanup: ['Gurdwara Hall Cleaning', [['Lay carpets', 4], ['Sweep and mop', 3], ['Windows and fans', 2], ['Shoe racks', 2]]], langar: ['Langar Seva', [['Cook dal and sabzi', 3], ['Make rotis', 4], ['Serve langar', 6], ['Wash utensils', 3]]], tree: ['Tree Planting Drive', [['Dig pits', 6], ['Plant saplings', 6], ['Carry water', 4]]], education: ['Reading Circle', [['Read with a group', 4], ['Set up the room', 1]]], blanket: ['Blanket Distribution', [['Load the vans', 4], ['Hand out blankets', 8], ['Drive a van', 3]]] };
let draft = null;
function newDraft(cat = 'cleanup') { const t = TEMPLATES[cat]; return { cat, title: t[0], date: ymd(now() + 3 * DAY), start: '09:00', end: '12:00', place: 'Namdhari Gurdwara, Karol Bagh', meet: 'Main entrance', about: '', repeat: false, tasks: t[1].map(([x, n]) => ({ t: x, n })) }; }
function syncDraft() { if (!draft || !$('#d-title')) return; draft.title = $('#d-title').value; draft.date = $('#d-date').value; draft.start = $('#d-start').value; draft.end = $('#d-end').value; draft.place = $('#d-place').value; draft.meet = $('#d-meet').value; draft.about = $('#d-about').value; draft.repeat = $('#d-repeat').checked; $$('[data-dt]').forEach((i) => { const tk = draft.tasks[+i.dataset.dt]; if (tk) tk.t = i.value; }); }
function CreateSeva() {
  if (!draft) draft = newDraft();
  if (isAdmin() && !draft.target) draft.target = 'hq';
  return `${dtop('New seva')}${isAdmin() ? `<label class="f">Who is it for?</label><div class="chips" style="flex-wrap:wrap"><button class="chip2" data-act="d-target" data-v="hq" aria-pressed="${draft.target === 'hq'}">${I.globe}Whole sangat (HQ)</button>${GROUPS.map((g) => `<button class="chip2" data-act="d-target" data-v="${g.id}" aria-pressed="${draft.target === g.id}">${g.flag} ${g.name.split(' ')[0]}</button>`).join('')}</div><p class="xs muted" style="margin-top:6px">${draft.target === 'hq' ? 'Shown to every member everywhere, highlighted as an HQ seva, and posted to the feed.' : `Only members of ${gOf(draft.target).name} are notified.`}</p>` : '<p class="small muted">Members of Delhi Central get notified and see it marked NEW.</p>'}
    <label class="f">Type of seva</label><div class="chips" style="flex-wrap:wrap">${Object.keys(TEMPLATES).map((k) => `<button class="chip2" data-dcat="${k}" aria-pressed="${draft.cat === k}"><i class="dotc" style="background:var(--c-${k})"></i>${CAT[k].label}</button>`).join('')}</div>
    <label class="f" for="d-title">Title</label><input class="in" id="d-title" value="${esc(draft.title)}">
    <label class="f" for="d-date">Date</label><input class="in" type="date" id="d-date" value="${draft.date}">
    <div class="btn-row"><div style="flex:1"><label class="f" for="d-start">Starts</label><input class="in" type="time" id="d-start" value="${draft.start}"></div><div style="flex:1"><label class="f" for="d-end">Ends</label><input class="in" type="time" id="d-end" value="${draft.end}"></div></div>
    <label class="f" for="d-place">Place</label><input class="in" id="d-place" value="${esc(draft.place)}">
    <label class="f" for="d-meet">Meeting point</label><input class="in" id="d-meet" value="${esc(draft.meet)}">
    <label class="f" for="d-about">Why this seva (optional)</label><textarea class="in" id="d-about" rows="2" placeholder="A line for the sangat">${esc(draft.about)}</textarea>
    <label class="lrow" style="margin-top:6px;cursor:pointer"><span class="grow small"><b>Repeat every week</b><br><span class="xs muted">Same day and time</span></span><input type="checkbox" id="d-repeat" class="ck" ${draft.repeat ? 'checked' : ''}></label>
    <div class="section-h" style="margin-top:16px"><h2 style="font-size:17px">Tasks</h2><span class="xs muted">Members pick these</span></div>
    <div class="card">${draft.tasks.map((t, i) => `<div class="row" style="padding:6px 0"><input class="in" data-dt="${i}" value="${esc(t.t)}" placeholder="Task" style="flex:1;min-height:42px;padding:8px 12px"><div class="qty"><button data-act="d-need" data-i="${i}" data-d="-1" aria-label="Fewer">−</button><span>${t.n}</span><button data-act="d-need" data-i="${i}" data-d="1" aria-label="More">+</button></div><button class="iconbtn" data-act="d-del" data-i="${i}" aria-label="Remove task" style="width:36px;color:var(--faint)">${I.close}</button></div>`).join('')}
      <button class="link" data-act="d-add">${I.plus}Add task</button></div>
    <div class="stickyact"><div><button class="btn block" data-act="d-publish">${I.megaphone}Publish & notify members</button></div></div>`;
}
// ----- Attendance -----
let attState = null;
function AttendScreen({ id }) {
  const s = sv(id);
  if (!attState || attState.id !== id) { const list = peopleOf(s).filter((p) => ['going', 'here', 'maybe'].includes(p.st)); attState = { id, pts: 3, rows: list.map((p) => ({ n: p.n, me: !!p.me, was: p.st, on: p.st !== 'maybe', task: s.points.filter((x) => x.takers.map(nameOf).includes(p.n)).map((x) => x.text).join(', ') })) }; }
  const A = attState; const on = A.rows.filter((r) => r.on).length;
  return `${dtop('Attendance')}<div class="card"><span class="chip" style="background:color-mix(in srgb,var(--c-${s.cat}) 13%,transparent);color:var(--c-${s.cat})">${CAT[s.cat].label}</span><h2 style="font-size:20px;margin-top:6px">${esc(s.title)}</h2><p class="small muted">${fmtLong(s.start)} · ${fmtTime(s.start)} – ${fmtTime(s.end)}</p></div>
    <div class="card row" style="margin-top:12px"><div class="grow"><b class="small">Points for each sevadar</b><p class="xs muted">Added to their garden</p></div><div class="qty"><button data-act="att-pts" data-d="-1" aria-label="Fewer points">−</button><span>${seed(A.pts)}</span><button data-act="att-pts" data-d="1" aria-label="More points">+</button></div></div>
    <div class="section-h" style="margin-top:18px"><h2 style="font-size:17px">Who came?</h2><button class="link" data-act="att-all">Mark all present</button></div>
    <div class="card list">${A.rows.map((r, i) => `<div class="lrow"><span class="av2" style="background:${r.me ? 'var(--p)' : avColor(r.n)}">${initials(r.n)}</span><div class="grow"><b class="small">${esc(r.n)}${r.me ? ' (you)' : ''}</b><p class="xs muted ellipsis">${r.was === 'walkin' ? 'Walk-in' : r.was === 'maybe' ? 'Said maybe' : 'Said going'}${r.task ? ' · ' + esc(r.task) : ''}</p></div><div class="pa"><button data-act="att-set" data-i="${i}" data-v="1" aria-pressed="${r.on}">Present</button><button data-act="att-set" data-i="${i}" data-v="0" aria-pressed="${!r.on}">Absent</button></div></div>`).join('')}</div>
    <button class="btn ghost block" style="margin-top:10px" data-act="att-walkin">${I.userplus}Add someone who came</button>
    <div class="stickyact"><div><button class="btn block" data-act="att-save" data-id="${id}">${I.check}Save · ${on} present · ${on * A.pts} points</button></div></div>`;
}
// ----- Lead: team management -----
let teamSeg = 'insights', teamF = 'all';
const tStatus = (m) => m.last > 60 ? 'inactive' : now() - T(m.joined) < 60 * DAY ? 'new' : 'active';
function LeadTeam() {
  const q = teamQ.trim().toLowerCase(); const inact = S.team.filter((m) => tStatus(m) === 'inactive');
  const list = S.team.filter((m) => teamF === 'all' || tStatus(m) === teamF).filter((m) => !q || m.n.toLowerCase().includes(q));
  const segs = [['insights', 'Insights'], ['members', 'Members'], ['requests', `Requests${S.requests.length ? ` · ${S.requests.length}` : ''}`], ['leads', 'Leads']];
  let body = '';
  if (teamSeg === 'insights') body = Insights();
  else if (teamSeg === 'members') body = `<label class="search" style="margin-top:12px">${I.search}<input id="team-q" placeholder="Search ${S.team.length + 218} members" value="${esc(teamQ)}" autocomplete="off"></label>
    <div class="chips" style="margin-top:10px">${[['all', 'All'], ['active', 'Active'], ['new', 'New'], ['inactive', 'Inactive']].map(([k, l]) => `<button class="chip2" data-tfil="${k}" aria-pressed="${teamF === k}">${l}<span class="n">${k === 'all' ? S.team.length : S.team.filter((m) => tStatus(m) === k).length}</span></button>`).join('')}</div>
    ${teamF === 'inactive' && inact.length ? `<button class="banner tap" style="margin-top:10px" data-act="nudge-inactive">${I.bell}<span class="grow"><b>Send a gentle reminder to ${inact.length} inactive members</b><br><span class="xs">"We miss you at seva — here's what's coming up."</span></span>${chev}</button>` : ''}
    <div class="card list" style="margin-top:10px">${list.map((m) => `<button class="lrow" data-act="member" data-n="${esc(m.n)}"><span class="av2" style="background:${avColor(m.n)}">${initials(m.n)}</span><div class="grow"><b class="small">${esc(m.n)}</b>${tStatus(m) === 'new' ? '<span class="leadtag" style="background:var(--done-bg);color:var(--done)">New</span>' : ''}<p class="xs muted">${m.contrib} contributions · last seva ${m.last === 1 ? 'yesterday' : `${m.last} days ago`}</p></div>${tStatus(m) === 'inactive' ? '<span class="status st-plan">Inactive</span>' : ''}${chev}</button>`).join('') || '<p class="small muted" style="padding:14px 0">No one matches.</p>'}</div>
    <p class="xs faint" style="text-align:center;margin-top:10px">Showing ${list.length} · the full list loads as you scroll in the real app</p>`;
  else if (teamSeg === 'requests') body = S.requests.length ? `<div class="card list" style="margin-top:12px">${S.requests.map((r, i) => `<div class="lrow" style="flex-wrap:wrap"><span class="av2" style="background:${avColor(r.n)}">${initials(r.n)}</span><div class="grow"><b class="small">${esc(r.n)}</b><p class="xs muted">${ago(r.d)}${ago(r.d) === 'just now' ? '' : ' ago'}${r.note ? ' · ' + esc(r.note) : ''}</p></div><div class="btn-row" style="flex:0 0 100%;padding-left:52px"><button class="btn sm" data-act="req" data-i="${i}" data-v="1">${I.check}Approve</button><button class="btn ghost sm" data-act="req" data-i="${i}" data-v="0">Decline</button></div></div>`).join('')}</div>` : `<div style="margin-top:12px">${emptyState('No pending requests', 'New join requests for Delhi Central appear here.')}</div>`;
  else body = `<div class="card list" style="margin-top:12px"><div class="lrow"><span class="av2" style="background:var(--p)">${initials(ME())}</span><div class="grow"><b class="small">${esc(ME())} (you)</b><span class="leadtag">Lead</span></div></div>${LEADS.map((n) => `<div class="lrow"><span class="av2" style="background:${avColor(n)}">${initials(n)}</span><div class="grow"><b class="small">${n}</b><span class="leadtag">Lead</span></div><button class="iconbtn" data-act="wa-person" data-n="${esc(n)}" aria-label="Message ${n}" style="color:#25A35A">${I.wa}</button></div>`).join('')}</div><p class="xs muted" style="text-align:center;margin-top:10px">${I.shield.replace('<svg', '<svg style="width:13px;height:13px;vertical-align:-2px"')} Only the Main Admin can add or remove team leads.</p>`;
  return `<header class="apphdr"><h1 class="pagetitle" style="padding:6px 0 0">Team</h1><span class="sp"></span><button class="btn sm" data-act="team-invite">${I.userplus}Invite</button>${bellBtn()}</header>
    <div class="tstats four" style="margin-top:8px"><div class="tstat" style="--tc:var(--p)"><b>248</b><span>Members</span></div><div class="tstat" style="--tc:var(--done)"><b>112</b><span>Active</span></div><div class="tstat" style="--tc:var(--action)"><b>41</b><span>Inactive</span></div><div class="tstat" style="--tc:var(--live)"><b>${S.requests.length}</b><span>Requests</span></div></div>
    <div class="seg" style="margin-top:12px">${segs.map(([k, l]) => `<button data-tseg="${k}" aria-pressed="${teamSeg === k}">${l}</button>`).join('')}</div>${body}`;
}
function memberSheet(n) {
  const m = S.team.find((x) => x.n === n); const up = localSeva().filter(isFuture);
  openSheet(`<div style="text-align:center"><span class="av2" style="width:72px;height:72px;font-size:24px;margin:4px auto 0;background:${avColor(n)}">${initials(n)}</span><h2 style="font-size:21px;margin-top:10px">${esc(n)}</h2><p class="small muted">Member · Delhi Central · joined ${new Date(m.joined).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</p></div>
    <div class="tstats" style="margin-top:14px"><div class="tstat" style="--tc:var(--done)"><b>${m.contrib}</b><span>Contributions</span></div><div class="tstat"><b>${m.last}d</b><span>Since last seva</span></div><div class="tstat" style="--tc:var(--gold)"><b>${m.contrib * 3}</b><span>Points earned</span></div></div>
    <div class="card list" style="margin-top:12px"><button class="lrow" data-open="user:${esc(n)}">${I.garden}<b class="small grow">View profile & garden</b>${chev}</button><button class="lrow" data-act="wa-person" data-n="${esc(n)}">${I.wa.replace('<svg', '<svg style="width:22px;height:22px;color:#25A35A"')}<b class="small grow">Message on WhatsApp</b>${chev}</button>
      <button class="lrow" data-act="invite-one" data-n="${esc(n)}" ${up.length ? '' : 'disabled'}>${I.userplus}<b class="small grow">Invite to ${up[0] ? esc(up[0].title) : 'a seva'}</b>${chev}</button>
      <button class="lrow" data-act="remove-member" data-n="${esc(n)}" style="color:var(--live)">${I.trash}<b class="small grow">Remove from Delhi Central</b></button></div>
    <p class="xs muted" style="text-align:center;margin-top:10px">Phone numbers stay private. Only the Main Admin can change roles.</p>`);
}
function teamInviteSheet() {
  const link = `${location.origin}${location.pathname}#join=delhi-central`;
  openSheet(`${sheetHead('Invite to Delhi Central')}<div class="card"><p class="xs muted">Invite link</p><p class="small" style="word-break:break-all;font-weight:600">${esc(link)}</p></div>
    <div class="btn-row" style="margin-top:12px"><button class="btn ghost" data-act="copy-link" data-l="${esc(link)}">Copy link</button><button class="btn" data-act="wa-invite" data-l="${esc(link)}">${I.wa}WhatsApp</button></div>
    <p class="xs muted" style="text-align:center;margin-top:12px">People who join with this link appear under Requests for you to approve.</p>`);
}

// ----- Lead: Insights (simple, glanceable charts) -----
let insP = 'month';
const INS = {
  month: { held: [14, 16], fill: [82, 85], turn: [91, 85], ontime: [11, 14], weeks: [['W1', 3], ['W2', 4], ['W3', 5], ['W4', 2]], wkTarget: 4,
    cats: [['langar', 'Langar', 94], ['cleanup', 'Cleaning', 64], ['tree', 'Tree planting', 81], ['education', 'Education', 100], ['blanket', 'Relief', 47]],
    recent: [['Langar Sun', 13, 2], ['Hall clean', 9, 3], ['Yamuna', 8, 4], ['Reading', 4, 0], ['Langar Sun', 15, 1], ['Blankets', 5, 3]],
    delays: [0, 5, 0, 22, 0, 3, 15, 0, 0, 18, 2, 0, 0, 4], active: [['May', 96], ['Jun', 101], ['Jul', 99], ['Aug', 104], ['Sep', 108], ['Oct', 112]] },
  q: { held: [44, 48], fill: [79, 85], turn: [88, 85], ontime: [36, 44], weeks: [['Aug', 13], ['Sep', 15], ['Oct', 16]], wkTarget: 16,
    cats: [['langar', 'Langar', 91], ['cleanup', 'Cleaning', 68], ['tree', 'Tree planting', 77], ['education', 'Education', 96], ['blanket', 'Relief', 52]],
    recent: [['Aug', 118, 19], ['Sep', 131, 16], ['Oct', 142, 14]],
    delays: [0, 12, 0, 5, 0, 0, 25, 3, 0, 9, 0, 14, 0, 0, 2, 0, 18, 0, 6, 0], active: [['Jan', 82], ['Mar', 88], ['May', 96], ['Jul', 99], ['Sep', 108], ['Oct', 112]] },
};
const ST = { good: ['On target', 'var(--done)', 'var(--done-bg)', I.checkc], warn: ['Watch', 'var(--action)', 'var(--action-bg)', I.alert], bad: ['Behind', 'var(--live)', 'var(--live-bg)', I.xc] };
const grade = (v, t, soft = .93) => v >= t ? 'good' : v >= t * soft ? 'warn' : 'bad';
const pill = (g) => `<span class="spill" style="color:${ST[g][1]};background:${ST[g][2]}">${ST[g][3]}${ST[g][0]}</span>`;
function ring(pct, g) { const r = 17, c = 2 * Math.PI * r; return `<svg viewBox="0 0 44 44" class="ring2" aria-hidden="true"><circle cx="22" cy="22" r="${r}" fill="none" stroke="var(--surface2)" stroke-width="5"/><circle cx="22" cy="22" r="${r}" fill="none" stroke="${ST[g][1]}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - Math.min(1, pct / 100))}" transform="rotate(-90 22 22)"/></svg>`; }
function weeksChart(d) {
  const W = 340, H = 150, L = 26, B = 22, T = 14; const max = Math.max(d.wkTarget * 1.4, ...d.weeks.map((w) => w[1])); const y = (v) => T + (H - T - B) * (1 - v / max);
  const bw = Math.min(44, (W - L - 10) / d.weeks.length - 14); const step = (W - L - 10) / d.weeks.length;
  const ticks = [0, Math.round(max / 2), Math.round(max)];
  return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Seva held per period against a target of ${d.wkTarget}">${ticks.map((t) => `<line x1="${L}" x2="${W}" y1="${y(t)}" y2="${y(t)}" class="grid"/><text x="${L - 6}" y="${y(t) + 4}" class="ax" text-anchor="end">${t}</text>`).join('')}
    ${d.weeks.map(([l, v], i) => { const x = L + 10 + i * step + (step - 14 - bw) / 2; const g = grade(v, d.wkTarget, .8); return `<g data-tip="${l}: ${v} seva · target ${d.wkTarget}"><rect x="${x - 6}" y="${T}" width="${bw + 12}" height="${H - T - B}" fill="transparent"/><path d="M${x} ${y(0)}V${y(v) + 4}a4 4 0 0 1 4 -4h${bw - 8}a4 4 0 0 1 4 4V${y(0)}z" fill="var(--ch1)" opacity="${g === 'good' ? 1 : .45}"/>${g !== 'good' ? `<text x="${x + bw / 2}" y="${y(v) - 6}" class="lbl warn" text-anchor="middle">${v}</text>` : `<text x="${x + bw / 2}" y="${y(v) - 6}" class="lbl" text-anchor="middle">${v}</text>`}<text x="${x + bw / 2}" y="${H - 6}" class="ax" text-anchor="middle">${l}</text></g>`; }).join('')}
    <line x1="${L}" x2="${W}" y1="${y(d.wkTarget)}" y2="${y(d.wkTarget)}" class="target"/><text x="${W}" y="${y(d.wkTarget) - 5}" class="ax tgt" text-anchor="end">Target ${d.wkTarget}</text></svg>`;
}
function catBars(d, target = 85) {
  return `<div class="hbars">${d.cats.slice().sort((a, b) => a[2] - b[2]).map(([k, l, v]) => { const g = grade(v, target, .88); return `<div class="hb" data-tip="${l}: ${v}% of places filled · target ${target}%"><span class="hl">${l}</span><span class="track"><i style="width:${v}%;background:${ST[g][1]}"></i><b class="tmark" style="left:${target}%"></b></span><span class="hv" style="color:${g === 'good' ? 'var(--ink)' : ST[g][1]}">${g !== 'good' ? ST[g][3] : ''}${v}%</span></div>`; }).join('')}<p class="xs muted" style="margin-top:6px"><b class="tkey"></b> Target ${target}% of places filled</p></div>`;
}
function turnChart(d) {
  const W = 340, H = 160, L = 8, B = 30, T = 16; const max = Math.max(...d.recent.map((r) => r[1] + r[2])); const step = (W - L * 2) / d.recent.length; const bw = Math.min(36, step - 16);
  const y = (v) => (H - T - B) * v / max;
  return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Sevadars who came versus said going but did not come"><line x1="0" x2="${W}" y1="${H - B}" y2="${H - B}" class="grid"/>
    ${d.recent.map(([l, came, no], i) => { const x = L + i * step + (step - bw) / 2; const h1 = y(came), h2 = y(no); const pct = Math.round(came / (came + no) * 100); return `<g data-tip="${l}: ${came} came, ${no} didn't come (${pct}%)"><rect x="${x - 6}" y="${T}" width="${bw + 12}" height="${H - T - B}" fill="transparent"/><rect x="${x}" y="${H - B - h1}" width="${bw}" height="${h1}" fill="var(--ch1)" rx="0"/>${no ? `<path d="M${x} ${H - B - h1 - 2}V${H - B - h1 - h2 + 4}a4 4 0 0 1 4 -4h${bw - 8}a4 4 0 0 1 4 4V${H - B - h1 - 2}z" fill="var(--ch2)"/>` : ''}<text x="${x + bw / 2}" y="${H - B - h1 - h2 - 6}" class="lbl" text-anchor="middle">${pct}%</text><text x="${x + bw / 2}" y="${H - 12}" class="ax" text-anchor="middle">${l.split(' ')[0]}</text></g>`; }).join('')}</svg>
    <div class="legend"><span><i style="background:var(--ch1)"></i>Came</span><span><i style="background:var(--ch2)"></i>Said going, didn't come</span></div>`;
}
function delayChart(d, limit = 10) {
  const W = 340, H = 120, L = 26, B = 18, T = 12; const max = Math.max(30, ...d.delays); const step = (W - L - 8) / d.delays.length; const y = (v) => T + (H - T - B) * (1 - v / max);
  return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Minutes late at the start of each seva">${[0, 15, 30].map((t) => `<line x1="${L}" x2="${W}" y1="${y(t)}" y2="${y(t)}" class="grid"/><text x="${L - 6}" y="${y(t) + 4}" class="ax" text-anchor="end">${t}</text>`).join('')}
    <line x1="${L}" x2="${W}" y1="${y(limit)}" y2="${y(limit)}" class="target"/>
    ${d.delays.map((v, i) => { const x = L + 8 + i * step; const late = v > limit; return `<g data-tip="Seva ${i + 1}: ${v ? v + ' min late' : 'on time'}"><rect x="${x - step / 2}" y="${T}" width="${step}" height="${H - T - B}" fill="transparent"/>${v ? `<line x1="${x}" x2="${x}" y1="${y(0)}" y2="${y(v)}" stroke="${late ? 'var(--action-c)' : 'var(--faint)'}" stroke-width="2"/>` : ''}<circle cx="${x}" cy="${y(v)}" r="4.5" fill="${late ? 'var(--action-c)' : v ? 'var(--faint)' : 'var(--done-c)'}" stroke="var(--surface)" stroke-width="2"/></g>`; }).join('')}
    <text x="${W}" y="${y(limit) - 5}" class="ax tgt" text-anchor="end">${limit} min</text></svg>
    <div class="legend"><span><i style="background:var(--done-c);border-radius:50%"></i>On time</span><span><i style="background:var(--faint);border-radius:50%"></i>A little late</span><span><i style="background:var(--action-c);border-radius:50%"></i>Over ${limit} min</span></div>`;
}
function activeChart(d) {
  const W = 340, H = 120, L = 8, R = 44, T = 14, B = 20; const vs = d.active.map((a) => a[1]); const lo = Math.min(...vs) - 10, hi = Math.max(...vs) + 6;
  const x = (i) => L + (W - L - R) * i / (vs.length - 1), y = (v) => T + (H - T - B) * (1 - (v - lo) / (hi - lo));
  const pts = vs.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Active members per month"><defs><linearGradient id="actg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--ch1)" stop-opacity=".22"/><stop offset="1" stop-color="var(--ch1)" stop-opacity="0"/></linearGradient></defs>
    <polygon points="${x(0)},${H - B} ${pts} ${x(vs.length - 1)},${H - B}" fill="url(#actg)"/><polyline points="${pts}" fill="none" stroke="var(--ch1)" stroke-width="2" stroke-linejoin="round"/>
    ${d.active.map(([l, v], i) => `<g data-tip="${l}: ${v} active members"><rect x="${x(i) - 22}" y="${T}" width="44" height="${H - T - B}" fill="transparent"/><circle cx="${x(i)}" cy="${y(v)}" r="${i === vs.length - 1 ? 5 : 3}" fill="${i === vs.length - 1 ? 'var(--ch1)' : 'var(--surface)'}" stroke="var(--ch1)" stroke-width="2"/><text x="${x(i)}" y="${H - 5}" class="ax" text-anchor="middle">${l}</text></g>`).join('')}
    <text x="${x(vs.length - 1) + 9}" y="${y(vs[vs.length - 1]) + 4}" class="lbl">${vs[vs.length - 1]}</text></svg>`;
}
function Insights() {
  const d = INS[insP]; const att = localSeva().filter(needsAttend).length; const inact = S.team.filter((m) => tStatus(m) === 'inactive').length;
  const tiles = [
    ['Seva held', Math.round(d.held[0] / d.held[1] * 100), `${d.held[0]}<small>/${d.held[1]}</small>`, `Target ${d.held[1]}`, grade(d.held[0], d.held[1], .85)],
    ['Places filled', d.fill[0], `${d.fill[0]}<small>%</small>`, `Target ${d.fill[1]}%`, grade(d.fill[0], d.fill[1])],
    ['Turned up', d.turn[0], `${d.turn[0]}<small>%</small>`, 'Came vs said going', grade(d.turn[0], d.turn[1])],
    ['Started on time', Math.round(d.ontime[0] / d.ontime[1] * 100), `${d.ontime[0]}<small>/${d.ontime[1]}</small>`, 'Target 90%', grade(d.ontime[0] / d.ontime[1] * 100, 90, .95)],
  ];
  const worst = d.cats.slice().sort((a, b) => a[2] - b[2]);
  const late = d.delays.filter((v) => v > 10);
  const issues = [
    worst[0][2] < 75 && ['bad', `${worst[0][1]} seva are short of people`, `Only ${worst[0][2]}% of places filled — ask early, invite inactive members`, 'Invite', `ins-invite`],
    worst[1][2] < 75 && ['bad', `${worst[1][1]} seva are short of people`, `${worst[1][2]}% of places filled`, null],
    late.length && ['warn', `${late.length} seva started more than 10 min late`, `Average ${Math.round(late.reduce((a, b) => a + b, 0) / late.length)} min late — share the meeting point the evening before`, null],
    att && ['warn', `Attendance not marked for ${att} seva`, 'Sevadars are waiting for their points', 'Mark now', 'ins-attend'],
    inact && ['warn', `${inact} members inactive for 2+ months`, 'A gentle reminder often brings people back', 'Remind', 'nudge-inactive'],
    ['good', `Turn-up is strong at ${d.turn[0]}%`, 'Most people who say "going" really come', null],
  ].filter(Boolean);
  const card = (title, sub, body) => `<div class="card ichart"><div class="ich"><div><h3>${title}</h3>${sub ? `<p class="xs muted">${sub}</p>` : ''}</div></div>${body}<div class="ctip" hidden></div></div>`;
  return `<div class="seg" style="margin-top:12px"><button data-insp="month" aria-pressed="${insP === 'month'}">This month</button><button data-insp="q" aria-pressed="${insP === 'q'}">Last 3 months</button></div>
    <div class="htiles">${tiles.map(([l, p, v, sub, g]) => `<div class="htile"><div class="row" style="gap:10px">${ring(p, g)}<div class="grow"><b class="hv2">${v}</b><p class="xs muted">${l}</p></div></div><div style="margin-top:8px">${pill(g)}</div><p class="xs faint" style="margin-top:4px">${sub}</p></div>`).join('')}</div>
    <div class="card" style="margin-top:12px"><h3 style="font-size:16px">What needs attention</h3>${issues.map(([g, t, s2, btn, act]) => `<div class="lrow" style="align-items:flex-start"><span class="av2" style="width:32px;height:32px;background:${ST[g][2]};color:${ST[g][1]}">${ST[g][3].replace('<svg', '<svg style="width:18px;height:18px"')}</span><div class="grow"><b class="small">${t}</b><p class="xs muted">${s2}</p></div>${btn ? `<button class="btn soft sm" data-act="${act}">${btn}</button>` : ''}</div>`).join('')}</div>
    ${card(insP === 'month' ? 'Seva held each week' : 'Seva held each month', 'Faded bars are below target', weeksChart(d))}
    ${card('Places filled by type of seva', 'Where we are short of people', catBars(d))}
    ${card('Did people turn up?', insP === 'month' ? 'Last 6 seva' : 'Per month', turnChart(d))}
    ${card('Start delays', 'Minutes late, each seva in order', delayChart(d))}
    ${card('Active members', 'Did at least one seva that month', activeChart(d))}
    <p class="xs faint" style="text-align:center;margin-top:10px">Tap any bar or dot for details · sample figures in this prototype</p>`;
}


// =================== REAL-TIME ===================
// In-app banner + bell badge update the moment something arrives. Across tabs on this device it is
// truly live (storage events). Across phones the real app needs a push service (see README).
const LV = { live: ['var(--live)', I.bell], action: ['var(--action)', I.clock], p: ['var(--p)', I.sparkle], done: ['var(--done)', I.checkc] };
function announceNew() {
  const fresh = notifsFor().filter((n) => !seenIds.has(n.id) && !n.read);
  S.notifs.forEach((n) => { if ((n.role || 'member') === S.role) seenIds.add(n.id); });
  if (!fresh.length) return;
  showBanner(fresh[0], fresh.length);
  if (document.hidden && 'Notification' in window && Notification.permission === 'granted') navigator.serviceWorker?.getRegistration().then((r) => r && r.showNotification('Namdhari Seva', { body: fresh[0].t, icon: 'icons/icon-192.png', tag: fresh[0].id }));
}
let bnT;
function showBanner(n, count) {
  let el = $('#nb-root'); if (!el) { el = document.createElement('div'); el.id = 'nb-root'; document.body.appendChild(el); }
  const [c, ic] = LV[n.level] || LV.p; buzz(); try { navigator.vibrate && navigator.vibrate([12, 60, 12]); } catch (e) {}
  el.innerHTML = `<button class="nbanner" data-act="nb-open" data-id="${n.id}"><span class="nbic" style="color:${c};background:color-mix(in srgb,${c} 14%,var(--surface))">${ic}</span><span class="grow"><b>${count > 1 ? `${count} new notifications` : 'Namdhari Seva'}<i>now</i></b><span>${esc(n.t)}</span></span></button>`;
  requestAnimationFrame(() => el.firstChild.classList.add('in'));
  updateBadges(); clearTimeout(bnT); bnT = setTimeout(hideBanner, 5000);
}
function hideBanner() { const b = $('#nb-root .nbanner'); if (b) { b.classList.remove('in'); setTimeout(() => { const r = $('#nb-root'); if (r) r.innerHTML = ''; }, 300); } }
// refresh only the little numbers, so nothing jumps while you read
function updateBadges() {
  $$('[data-act=inbox]').forEach((b) => { const u = unread(); b.querySelector('.nb')?.remove(); if (u) b.insertAdjacentHTML('beforeend', `<span class="nb">${u}</span>`); });
  const tb = $('.tabbar'); if (tb) tb.outerHTML = tabbar();
}
const busy = () => $('#sheet-root').innerHTML || SV || SC || GE || ['create', 'attend'].includes(stack[stack.length - 1]?.v) || document.activeElement?.matches?.('input,textarea,[contenteditable]');
// another tab of the app changed something → apply it now
window.addEventListener('storage', (e) => {
  if (e.key !== KEY || !e.newValue) return;
  try { const role = S.role; const next = JSON.parse(e.newValue); next.role = role; S = next; } catch (err) { return; }
  if (busy()) updateBadges(); else rerender();
  announceNew();
});
// Prototype: a lead sends live updates while a seva is running (so you can feel real-time on one phone)
const LIVE_SCRIPT = [
  { sid: 's0', t: 'Tea break in the courtyard at 11:00 🍵', kind: 'info' },
  { sid: 's0', t: 'New task added: Fold the rumalas after diwan', kind: 'new', task: ['Fold the rumalas after diwan', 2] },
  { sid: 's5', t: '40 more rotis needed — can someone help?', kind: 'info' },
];
let liveIdx = 0, liveT = null;
function scheduleLive(ms) { clearTimeout(liveT); if (S.liveDemo === false || liveIdx >= LIVE_SCRIPT.length) return; liveT = setTimeout(liveTick, ms); }
function liveTick() {
  const ev2 = LIVE_SCRIPT[liveIdx]; const s = ev2 && sv(ev2.sid);
  if (!ev2) return; if (!S.onboarded || S.role !== 'member' || !s || !isLive(s) || !going(s) || document.hidden) { scheduleLive(15000); return; }
  liveIdx++;
  if (ev2.task) s.points.push({ id: 't' + uid(), text: ev2.task[0], need: ev2.task[1], takers: [], at: iso(now()), live: true });
  s.updates.unshift({ id: 'u' + uid(), t: ev2.t, d: iso(now()), by: s.lead, kind: ev2.kind });
  S.notifs.unshift({ id: 'n' + uid(), level: 'live', t: `${s.title}: ${ev2.t}`, d: iso(now()), ref: 'seva:' + s.id });
  announceNew(); save();
  const top = stack[stack.length - 1];
  if (!busy() && (top?.v === 'seva' && top.id === s.id || !stack.length && ['home', 'seva'].includes(tab))) rerender(); else updateBadges();
  scheduleLive(45000);
}
// ----- Pull down to refresh -----
let PR = null;
function canPull(e) { return window.scrollY <= 0 && S.onboarded && !$('#sheet-root').innerHTML && !SV && !SC && !GE && !e.target.closest('.g3d,.lcar,.stories,.chips,.tray2,#cal,input,textarea'); }
document.addEventListener('touchstart', (e) => { PR = e.touches.length === 1 && canPull(e) ? { y: e.touches[0].clientY, x: e.touches[0].clientX, d: 0 } : null; }, { passive: true });
document.addEventListener('touchmove', (e) => {
  if (!PR) return; const dy = e.touches[0].clientY - PR.y, dx = e.touches[0].clientX - PR.x;
  if (PR.d === 0 && (dy < 6 || Math.abs(dx) > dy)) { if (dy < 0 || Math.abs(dx) > 10) PR = null; return; }
  if (window.scrollY > 0) { PR = null; return; }
  PR.d = Math.min(120, dy * .5); let el = $('#ptr'); if (!el) { el = document.createElement('div'); el.id = 'ptr'; el.innerHTML = `<span>${I.reset}</span>`; document.body.appendChild(el); }
  el.style.transform = `translate(-50%, ${PR.d}px) rotate(${PR.d * 4}deg)`; el.style.opacity = Math.min(1, PR.d / 50); el.classList.toggle('ready', PR.d > 64);
}, { passive: true });
document.addEventListener('touchend', () => {
  if (!PR) return; const d = PR.d; PR = null; const el = $('#ptr'); if (!el) return;
  if (d > 64) { el.classList.add('spin'); el.style.transform = 'translate(-50%, 60px)'; buzz(); doRefresh().then(() => { el.style.transition = 'transform .25s, opacity .25s'; el.style.opacity = 0; el.style.transform = 'translate(-50%, 0)'; setTimeout(() => el.remove(), 260); }); }
  else { el.style.transition = 'transform .2s, opacity .2s'; el.style.opacity = 0; el.style.transform = 'translate(-50%, 0)'; setTimeout(() => el.remove(), 210); }
}, { passive: true });
function doRefresh() {
  return new Promise((res) => setTimeout(() => { // stands in for re-fetching from the server
    try { const fresh = JSON.parse(localStorage.getItem(KEY)); if (fresh) { fresh.role = S.role; S = fresh; } } catch (e) {}
    feedShown = FEED_PAGE; render(); window.scrollTo(0, 0); announceNew(); toast('Up to date'); res();
  }, 750));
}

// =================== SUPER ADMIN ===================
// Seva HQ: sangat-wide stats with filters and drill-downs, all seva, feed posts, and team-lead assignment.
const isAdmin = () => S.role === 'admin';
const STATE = { delhi: 'Delhi', ludhiana: 'Punjab', bhaini: 'Punjab', mumbai: 'Maharashtra', jammu: 'Jammu & Kashmir', jaipur: 'Rajasthan', london: 'England', birmingham: 'England', nairobi: 'Nairobi County', toronto: 'Ontario', bangkok: 'Bangkok' };
GROUPS.forEach((g) => { g.state = STATE[g.id]; });
const COUNTRIES = [...new Set(GROUPS.map((g) => g.country))];
const FLAG = Object.fromEntries(GROUPS.map((g) => [g.country, g.flag]));
const CATW = [['langar', .22], ['cleanup', .17], ['stall', .1], ['education', .1], ['tree', .08], ['blanket', .08], ['clothes', .08], ['social', .07], ['nasha', .06], ['donation', .04]];
const FEM = { langar: .58, cleanup: .5, tree: .36, education: .64, blanket: .48, nasha: .3, donation: .52, stall: .46, clothes: .62, social: .55 };
const REASONS = ['Heavy rain', 'Venue not available', 'Not enough sevadars', 'Lead unwell'];
const GFEM = { delhi: .02, ludhiana: -.04, bhaini: 0, mumbai: .06, jammu: -.05, jaipur: 0, london: .05, birmingham: .03, nairobi: -.02, toronto: .07, bangkok: -.03 };
GROUPS.forEach((g) => { g.fem = GFEM[g.id] || 0; });
let ADM = null;
function admData() {
  if (ADM) return ADM; let h = 20261028; const r = () => ((h = (h * 1664525 + 1013904223) >>> 0) / 4294967296);
  const recs = []; const t0 = new Date(); t0.setHours(9, 0, 0, 0);
  GROUPS.forEach((g) => { const q = g.q; for (let a = 365; a >= 1; a--) {
    const age = a / 365; const p = (q.freq / 7) * (1 - q.trend * (age - .2) * 1.6) * (a < 14 && g.id === 'jaipur' ? 0 : 1); if (r() > p) continue;
    let c = r(), cat = 'langar'; for (const [k, w] of CATW) { if ((c -= w) <= 0) { cat = k; break; } }
    const need = Math.round((8 + r() * 30) * Math.sqrt(g.members / 120)); const fillR = Math.max(.2, Math.min(1, q.fill + (r() - .5) * .22 + q.trend * (.5 - age) * .5));
    const filled = Math.round(need * fillR); const going = filled + Math.round(r() * 3); const came = Math.min(going, Math.round(going * Math.max(.4, Math.min(1, q.turn + (r() - .5) * .14))));
    const cancelled = r() < .035; const delay = r() < q.delay ? Math.round(6 + r() * 26) : Math.round(r() * 6); const lag = Math.round(q.lag * (.3 + r() * 1.6));
    const fem = Math.round(came * Math.max(.15, Math.min(.85, FEM[cat] + (g.fem || 0) + (r() - .5) * .16)));
    recs.push({ d: t0.getTime() - a * DAY, g: g.id, cat, need, filled, going, came, fem, cancelled, reason: cancelled ? REASONS[Math.floor(r() * 4)] : '', delay, lag, newm: r() < .3 ? 1 + Math.floor(r() * 3) : 0 });
  } });
  ADM = { recs }; return ADM;
}
function admSeed(d) {
  d.adm = { leads: Object.fromEntries(GROUPS.map((g) => [g.id, g.id === 'delhi' ? ['Gurpreet Singh', 'Simran Kaur', 'Manjit Kaur', 'Ravinder Singh', 'Harpreet Kaur', 'Balwinder Singh'] : [g.lead]])),
    blockers: [{ id: 'b1', g: 'birmingham', t: 'Not enough sevadars for Sunday langar', d: rel(-60 * 30), st: 'open', sev: 'bad' }, { id: 'b2', g: 'jaipur', t: 'Gurdwara hall under repair — no venue for 3 weeks', d: rel(-60 * 72), st: 'open', sev: 'bad' }, { id: 'b3', g: 'nairobi', t: 'Seva starts late: transport from outer areas', d: rel(-60 * 120), st: 'open', sev: 'warn' }, { id: 'b4', g: 'toronto', t: 'Lead travelling — attendance not marked for 2 seva', d: rel(-60 * 50), st: 'open', sev: 'warn' }, { id: 'b5', g: 'delhi', t: 'Shortage of brooms and mops', d: at(-6, 10), st: 'resolved', sev: 'warn' }] };
  d.notifs.push({ id: 'na1', role: 'admin', level: 'live', t: 'Birmingham: only 57% of places filled this month', d: rel(-40), ref: 'grp:birmingham' }, { id: 'na2', role: 'admin', level: 'action', t: 'Jaipur Sangat has held no seva for 2 weeks', d: rel(-180), ref: 'grp:jaipur' }, { id: 'na3', role: 'admin', level: 'action', t: 'Toronto: attendance marked late for 2 seva', d: rel(-300), ref: 'grp:toronto' });
}
// ----- filters -----
const AFP = [[7, '7 days'], [30, '30 days'], [90, '3 months'], [365, '12 months']];
const af = () => { S.af = S.af || { p: 30, t: 'all' }; if (!Array.isArray(S.af.gs)) S.af.gs = []; return S.af; };
const gOf = (id) => GROUPS.find((g) => g.id === id);
const inScope = (g) => !af().gs.length || af().gs.includes(g.id);
const ctryInScope = (c) => GROUPS.some((g) => g.country === c && inScope(g));
function recsIn(fromA, toA, extra) { const F = af(); const lo = now() - fromA * DAY, hi = now() - toA * DAY; return admData().recs.filter((x) => x.d >= lo && x.d < hi && inScope(gOf(x.g)) && (F.t === 'all' || x.cat === F.t) && (!extra || extra(x))); }
function metrics(rs, groups, days) {
  const ok = rs.filter((x) => !x.cancelled); const sum = (k) => ok.reduce((a, x) => a + x[k], 0);
  const members = groups.reduce((a, g) => a + g.members, 0); const target = Math.round(groups.reduce((a, g) => a + g.q.freq, 0) * days / 7);
  const came = sum('came'); const active = Math.min(members, Math.round(came / Math.max(1.4, Math.min(4, days / 9))));
  return { held: ok.length, target, cancelled: rs.length - ok.length, fill: ok.length ? Math.round(sum('filled') / sum('need') * 100) : 0, turn: ok.length ? Math.round(came / Math.max(1, sum('going')) * 100) : 0,
    ontime: ok.length ? Math.round(ok.filter((x) => x.delay <= 10).length / ok.length * 100) : 0, att: ok.length ? Math.round(ok.filter((x) => x.lag <= 24).length / ok.length * 100) : 0,
    active, activePct: members ? Math.round(active / members * 100) : 0, members, newm: sum('newm'), came, femPct: came ? Math.round(sum('fem') / came * 100) : 0, memFemPct: members ? Math.round(groups.reduce((a, g) => a + g.members * (.5 + g.fem * .6), 0) / members * 100) : 0 };
}
const scopeGroups = () => GROUPS.filter(inScope);
function cur() { const p = af().p; return metrics(recsIn(p, 0), scopeGroups(), p); }
function prev() { const p = af().p; return metrics(recsIn(p * 2, p), scopeGroups(), p); }
// ----- status: red / amber / green, always with an icon and a word -----
const KPI = {
  held: { l: 'Seva held', fmt: (m) => m.held, sub: (m) => `of ${m.target} planned`, g: (m) => m.held >= m.target * .95 ? 'good' : m.held >= m.target * .8 ? 'warn' : 'bad', v: (m) => m.held, ic: I.seva },
  fill: { l: 'Places filled', fmt: (m) => m.fill + '%', sub: () => 'Target 85%', g: (m) => m.fill >= 85 ? 'good' : m.fill >= 70 ? 'warn' : 'bad', v: (m) => m.fill, ic: I.users, tgt: 85 },
  turn: { l: 'Turn-up', fmt: (m) => m.turn + '%', sub: () => 'Came vs said going', g: (m) => m.turn >= 85 ? 'good' : m.turn >= 75 ? 'warn' : 'bad', v: (m) => m.turn, ic: I.checkc, tgt: 85 },
  active: { l: 'Active members', fmt: (m) => num(m.active), sub: (m) => `${m.activePct}% of ${num(m.members)}`, g: (m) => m.activePct >= 45 ? 'good' : m.activePct >= 30 ? 'warn' : 'bad', v: (m) => m.active, ic: I.team },
  ontime: { l: 'Started on time', fmt: (m) => m.ontime + '%', sub: () => 'Within 10 min', g: (m) => m.ontime >= 85 ? 'good' : m.ontime >= 70 ? 'warn' : 'bad', v: (m) => m.ontime, ic: I.clock, tgt: 85 },
  att: { l: 'Attendance on time', fmt: (m) => m.att + '%', sub: () => 'Marked within 24 h', g: (m) => m.att >= 85 ? 'good' : m.att >= 65 ? 'warn' : 'bad', v: (m) => m.att, ic: I.clip, tgt: 85 },
};
const STL = { good: ['On track', 'var(--done)', 'var(--done-bg)', I.checkc], warn: ['Watch', 'var(--action)', 'var(--action-bg)', I.alert], bad: ['Needs action', 'var(--live)', 'var(--live-bg)', I.xc] };
const spill = (g) => `<span class="spill" style="color:${STL[g][1]};background:${STL[g][2]}">${STL[g][3]}${STL[g][0]}</span>`;
function delta(a, b, pct) { if (!b) return ''; const d = pct ? a - b : Math.round((a - b) / b * 100); if (!d) return '<span class="dl flat">— same</span>'; const up = d > 0; return `<span class="dl ${up ? 'up' : 'down'}">${up ? '▲' : '▼'} ${Math.abs(d)}${pct ? ' pts' : '%'}</span>`; }
function leadScore(m) { return Math.round(m.fill * .35 + m.turn * .25 + m.ontime * .15 + m.att * .15 + Math.min(100, m.held / Math.max(1, m.target) * 100) * .1); }
const scoreG = (s) => s >= 82 ? 'good' : s >= 70 ? 'warn' : 'bad';
function groupStats() {
  const p = af().p; const F = af();
  return GROUPS.filter(inScope).map((g) => { const one = (fa, ta) => metrics(admData().recs.filter((x) => x.g === g.id && x.d >= now() - fa * DAY && x.d < now() - ta * DAY && (F.t === 'all' || x.cat === F.t)), [g], p); const m = one(p, 0), pm = one(p * 2, p);
    const weeks = Array.from({ length: 8 }, (_, i) => admData().recs.filter((x) => x.g === g.id && !x.cancelled && x.d >= now() - (8 - i) * 7 * DAY && x.d < now() - (7 - i) * 7 * DAY).length);
    const last = Math.max(0, ...admData().recs.filter((x) => x.g === g.id).map((x) => x.d)); return { g, m, pm, score: leadScore(m), weeks, quiet: Math.round((now() - last) / DAY) }; });
}
function alertsList() {
  const out = [];
  groupStats().forEach(({ g, m, pm, quiet }) => {
    if (quiet >= 14) out.push(['bad', `${g.name}: no seva for ${quiet} days`, `Check in with ${g.lead}`, g.id]);
    if (m.held && m.fill < 70) out.push(['bad', `${g.name}: only ${m.fill}% of places filled`, 'Seva are running short of sevadars', g.id]);
    if (m.held && m.att < 65) out.push(['warn', `${g.name}: attendance marked late`, `Only ${m.att}% marked within 24 h — sevadars wait for points`, g.id]);
    if (m.held && m.ontime < 70) out.push(['warn', `${g.name}: seva start late`, `${100 - m.ontime}% started more than 10 min late`, g.id]);
    if (pm.held >= 4 && m.held < pm.held * .75 && quiet < 14) out.push(['warn', `${g.name}: ${Math.round((1 - m.held / pm.held) * 100)}% fewer seva`, 'Compared with the previous period', g.id]);
  });
  return out.sort((a, b) => (a[0] === 'bad' ? 0 : 1) - (b[0] === 'bad' ? 0 : 1));
}
// ----- charts (shared look with lead Insights) -----
function buckets() { const p = af().p; return p === 7 ? Array.from({ length: 7 }, (_, i) => [7 - i, 6 - i, new Date(now() - (6 - i) * DAY).toLocaleDateString(undefined, { weekday: 'narrow' })]) : p === 365 ? Array.from({ length: 12 }, (_, i) => [(12 - i) * 30.4, (11 - i) * 30.4, new Date(now() - (11 - i) * 30.4 * DAY).toLocaleDateString(undefined, { month: 'narrow' })]) : (() => { const n = Math.round(p / 7); return Array.from({ length: n }, (_, i) => [(n - i) * 7, (n - 1 - i) * 7, `W${i + 1}`]); })(); }
function trend(key) { const days = af().p === 365 ? 30.4 : af().p === 7 ? 1 : 7; return buckets().map(([fa, ta, l]) => { const m = metrics(recsIn(fa, ta), scopeGroups(), days); return { l, v: KPI[key].v(m), m }; }); }
function barChart(data, target, aria) {
  const W = 340, H = 150, L = 26, B = 22, T = 16; const max = Math.max(1, target ? target * 1.3 : 0, ...data.map((d) => d.v)); const y = (v) => T + (H - T - B) * (1 - v / max);
  const step = (W - L - 6) / data.length, bw = Math.max(6, Math.min(30, step - 6)); const ticks = [0, Math.round(max / 2), Math.round(max)];
  return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="${aria}">${ticks.map((t) => `<line x1="${L}" x2="${W}" y1="${y(t)}" y2="${y(t)}" class="grid"/><text x="${L - 6}" y="${y(t) + 4}" class="ax" text-anchor="end">${t}</text>`).join('')}
    ${data.map((d, i) => { const x = L + 3 + i * step + (step - bw) / 2; const h = y(0) - y(d.v); const lo = target && d.v < target * .8; return `<g data-tip="${d.l}: ${d.v}${target ? ` · target ${target}` : ''}"><rect x="${x - 3}" y="${T}" width="${bw + 6}" height="${H - T - B}" fill="transparent"/>${d.v ? `<path d="M${x} ${y(0)}V${y(d.v) + Math.min(4, h)}a${Math.min(4, h)} ${Math.min(4, h)} 0 0 1 ${Math.min(4, h)} -${Math.min(4, h)}h${bw - 2 * Math.min(4, h)}a${Math.min(4, h)} ${Math.min(4, h)} 0 0 1 ${Math.min(4, h)} ${Math.min(4, h)}V${y(0)}z" fill="var(--ch1)" opacity="${lo ? .45 : 1}"/>` : ''}${data.length <= 13 ? `<text x="${x + bw / 2}" y="${H - 6}" class="ax" text-anchor="middle">${d.l}</text>` : ''}</g>`; }).join('')}
    ${target ? `<line x1="${L}" x2="${W}" y1="${y(target)}" y2="${y(target)}" class="target"/><text x="${W}" y="${y(target) - 5}" class="ax tgt" text-anchor="end">Target ${target}</text>` : ''}</svg>`;
}
function lineChart(data, target, aria) {
  const W = 340, H = 140, L = 30, R = 34, T = 14, B = 22; const vs = data.map((d) => d.v); const lo = Math.max(0, Math.min(target || 100, ...vs) - 10), hi = Math.min(100, Math.max(target || 0, ...vs) + 5);
  const x = (i) => L + (W - L - R) * (data.length > 1 ? i / (data.length - 1) : .5), y = (v) => T + (H - T - B) * (1 - (v - lo) / Math.max(1, hi - lo));
  const pts = vs.map((v, i) => `${x(i)},${y(v)}`).join(' '); const lastG = KPI.fill.g({ fill: vs[vs.length - 1] });
  return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="${aria}">${[lo, Math.round((lo + hi) / 2), hi].map((t) => `<line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}" class="grid"/><text x="${L - 6}" y="${y(t) + 4}" class="ax" text-anchor="end">${Math.round(t)}%</text>`).join('')}
    ${target ? `<rect x="${L}" y="${y(hi)}" width="${W - L - R}" height="${Math.max(0, y(target) - y(hi))}" fill="var(--done-c)" opacity=".08"/><line x1="${L}" x2="${W - R}" y1="${y(target)}" y2="${y(target)}" class="target"/>` : ''}
    <polyline points="${pts}" fill="none" stroke="var(--ch1)" stroke-width="2" stroke-linejoin="round"/>
    ${data.map((d, i) => `<g data-tip="${d.l}: ${d.v}%"><rect x="${x(i) - 12}" y="${T}" width="24" height="${H - T - B}" fill="transparent"/><circle cx="${x(i)}" cy="${y(d.v)}" r="${i === data.length - 1 ? 5 : 3}" fill="${i === data.length - 1 ? 'var(--ch1)' : 'var(--surface)'}" stroke="var(--ch1)" stroke-width="2"/>${data.length <= 13 ? `<text x="${x(i)}" y="${H - 6}" class="ax" text-anchor="middle">${d.l}</text>` : ''}</g>`).join('')}
    <text x="${x(data.length - 1) + 9}" y="${y(vs[vs.length - 1]) + 4}" class="lbl">${vs[vs.length - 1]}%</text></svg>`;
}
const spark = (vs, c = 'var(--ch1)') => { const mx = Math.max(1, ...vs); const p = vs.map((v, i) => `${i * 8},${20 - v / mx * 18}`).join(' '); return `<svg viewBox="0 -1 56 22" class="spark" aria-hidden="true"><polyline points="${p}" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${(vs.length - 1) * 8}" cy="${20 - vs[vs.length - 1] / mx * 18}" r="2.4" fill="${c}"/></svg>`; };
function genderBar(label, f, sub) { return `<div class="gbar" data-tip="${label}: ${100 - f}% male · ${f}% female"><div class="row" style="justify-content:space-between"><span class="small" style="font-weight:650">${label}</span><span class="xs muted">${sub || ''}</span></div><div class="gtrack"><i style="width:${100 - f}%;background:var(--ch1)"><b>${100 - f}%</b></i><i style="width:${f}%;background:var(--ch2)"><b>${f}%</b></i></div></div>`; }
function genderChart(m, cats) {
  const rows = cats.filter((x) => x.mm.held).sort((a, b) => b.mm.femPct - a.mm.femPct);
  return `<div class="legend" style="margin:8px 0 2px"><span><i style="background:var(--ch1)"></i>Male</span><span><i style="background:var(--ch2)"></i>Female</span></div>
    ${genderBar('Members', m.memFemPct, `${num(m.members)} people`)}${genderBar('Came to seva', m.femPct, `${num(m.came)} sevadar visits`)}
    <p class="xs muted" style="margin:12px 0 2px;font-weight:700;letter-spacing:.04em;text-transform:uppercase">By type of seva</p>
    ${rows.map((x) => `<div class="gmini" data-tip="${CAT[x.c].label}: ${100 - x.mm.femPct}% male · ${x.mm.femPct}% female"><span class="hl ellipsis">${CAT[x.c].label}</span><div class="gtrack sm"><i style="width:${100 - x.mm.femPct}%;background:var(--ch1)"></i><i style="width:${x.mm.femPct}%;background:var(--ch2)"></i></div><span class="hv">${x.mm.femPct}%<small> F</small></span></div>`).join('')}`;
}
function heatmap() {
  const cells = []; const start = new Date(now() - 83 * DAY); start.setHours(0, 0, 0, 0); const off = (start.getDay() + 6) % 7;
  const counts = Array(84 + off).fill(null); recsIn(84, 0, (x) => !x.cancelled).forEach((x) => { const i = Math.floor((x.d - start.getTime()) / DAY) + off; if (i >= off && i < counts.length) counts[i] = (counts[i] || 0) + 1; });
  for (let i = off; i < counts.length; i++) if (counts[i] === null) counts[i] = 0;
  const mx = Math.max(1, ...counts.filter((c) => c !== null)); const weeks = Math.ceil(counts.length / 7); const cs = 19, gap = 3;
  for (let w = 0; w < weeks; w++) for (let d = 0; d < 7; d++) { const i = w * 7 + d; const c = counts[i]; if (c === null || c === undefined) continue; const lv = c === 0 ? 0 : Math.ceil(c / mx * 4); cells.push(`<rect x="${26 + w * (cs + gap)}" y="${d * (cs + gap)}" width="${cs}" height="${cs}" rx="4" fill="${lv ? 'var(--ch1)' : 'var(--surface2)'}" opacity="${lv ? [0, .25, .5, .75, 1][lv] : 1}" data-tip="${new Date(start.getTime() + (i - off) * DAY).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}: ${c} seva"/>`); }
  return `<svg viewBox="0 0 ${26 + weeks * (cs + gap)} ${7 * (cs + gap)}" class="chart" role="img" aria-label="Seva per day, last 12 weeks">${['M', '', 'W', '', 'F', '', 'S'].map((l, d) => `<text x="0" y="${d * (cs + gap) + 14}" class="ax">${l}</text>`).join('')}${cells.join('')}</svg>
    <div class="legend" style="justify-content:flex-end"><span>Less</span>${[0, .25, .5, .75, 1].map((o) => `<i style="background:${o ? 'var(--ch1)' : 'var(--surface2)'};opacity:${o || 1}"></i>`).join('')}<span>More</span></div>`;
}
const chartCard = (title, sub, body, more) => `<div class="card ichart"><div class="ich row" style="justify-content:space-between;align-items:flex-start"><div><h3>${title}</h3>${sub ? `<p class="xs muted">${sub}</p>` : ''}</div>${more ? `<button class="link" style="min-height:28px;padding:0" ${more}>Details${I.chev}</button>` : ''}</div>${body}<div class="ctip" hidden></div></div>`;
// ----- filter bar -----
function whereLabel(gs = af().gs) {
  if (!gs.length) return '🌍 All places';
  const full = COUNTRIES.filter((c) => GROUPS.filter((g) => g.country === c).every((g) => gs.includes(g.id)));
  const loose = gs.filter((id) => !full.includes(gOf(id).country));
  if (full.length === 1 && !loose.length) return `${FLAG[full[0]]} ${full[0]}`;
  if (!full.length && loose.length === 1) return `${gOf(loose[0]).flag} ${gOf(loose[0]).name}`;
  return !loose.length ? `${full.map((c) => FLAG[c]).join('')} ${full.length} countries` : `${[...new Set(gs.map((id) => gOf(id).flag))].join('')} ${gs.length} groups`;
}
function filterBar() {
  const F = af(); const chip = (k, label, on) => `<button class="fchip2 ${on ? 'on' : ''}" data-act="af-open" data-k="${k}"><span class="ellipsis">${label}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg></button>`;
  return `<div class="fbar">${chip('p', AFP.find((x) => x[0] === F.p)[1], true)}${chip('w', whereLabel(), F.gs.length)}${chip('t', F.t === 'all' ? 'All seva types' : CAT[F.t].label, F.t !== 'all')}${F.gs.length || F.t !== 'all' ? `<button class="fchip2 reset" data-act="af-reset" aria-label="Reset filters">${I.close}</button>` : ''}</div>`;
}
// one sheet: countries with their groups inside; tick a whole country or single groups
let wDraft = null, wTarget = 'stats';
const pgs = () => (S.pgs = S.pgs || []);
function whereSheet() {
  if (!wDraft) wDraft = new Set(wTarget === 'people' ? pgs() : af().gs);
  const all = !wDraft.size;
  openSheet(`${sheetHead('Where', 'Tick a whole country, or one or more groups')}
    <button class="wrow top ${all ? 'on' : ''}" data-act="w-all"><span class="ck2">${all ? I.check : ''}</span><b class="grow">🌍 All places</b><span class="xs muted">${GROUPS.length} groups</span></button>
    ${COUNTRIES.map((c) => { const gr = GROUPS.filter((g) => g.country === c); const n = gr.filter((g) => wDraft.has(g.id)).length; const st = n === gr.length ? 'on' : n ? 'some' : '';
      return `<div class="wbox"><button class="wrow ${st}" data-act="w-country" data-c="${c}"><span class="ck2">${st === 'on' ? I.check : st === 'some' ? '<i></i>' : ''}</span><b class="grow">${FLAG[c]} ${c}</b><span class="xs muted">${n ? `${n} of ${gr.length}` : `${gr.length} group${gr.length > 1 ? 's' : ''}`}</span></button>
        ${gr.map((g) => `<button class="wrow sub ${wDraft.has(g.id) ? 'on' : ''}" data-act="w-group" data-g="${g.id}"><span class="ck2">${wDraft.has(g.id) ? I.check : ''}</span><span class="grow small">${esc(g.name)}</span><span class="xs muted">${num(g.members)}</span></button>`).join('')}</div>`; }).join('')}
    <div class="stickyact" style="position:sticky;bottom:-24px;padding:12px 0 calc(12px + var(--safe-b))"><div class="btn-row"><button class="btn ghost" data-act="w-clear">Clear</button><button class="btn" data-act="w-apply">Show ${wDraft.size ? `${wDraft.size} group${wDraft.size > 1 ? 's' : ''}` : 'all places'}</button></div></div>`);
}
function afSheet(k) {
  if (k === 'w') { wDraft = null; wTarget = 'stats'; return whereSheet(); }
  const F = af(); const opts = k === 'p' ? AFP.map(([v, l]) => [v, l]) : [['all', 'All seva types'], ...Object.keys(CAT).filter((x) => x !== 'event').map((c) => [c, CAT[c].label])];
  openSheet(`${sheetHead({ p: 'Time period', t: 'Seva type' }[k])}<div class="card list">${opts.map(([v, l]) => `<button class="lrow" data-act="af-set" data-k="${k}" data-v="${v}"><b class="small grow">${l}</b>${String(F[k]) === String(v) ? I.check.replace('<svg', '<svg style="width:20px;height:20px;color:var(--p)"') : ''}</button>`).join('')}</div>`);
}
// ----- Stats home -----
function AdminStats() {
  const m = cur(), pm = prev(); const al = alertsList(); const gs = groupStats().sort((a, b) => b.score - a.score);
  const liveG = scopeGroups().filter((g, i) => (g.q.freq > 2 && i % 2 === 0) || g.id === 'delhi'); const live = liveG.length + (liveG.some((g) => g.id === 'delhi') ? 2 : 0); const liveC = new Set(liveG.map((g) => g.country)).size;
  const tiles = ['held', 'fill', 'turn', 'active', 'ontime', 'att'];
  const higherBetter = (k) => true;
  const ctry = COUNTRIES.filter(ctryInScope).map((c) => { const gr = GROUPS.filter((g) => g.country === c && inScope(g)); const F = af(); const mm = metrics(admData().recs.filter((x) => gr.some((g) => g.id === x.g) && x.d >= now() - F.p * DAY && (F.t === 'all' || x.cat === F.t)), gr, F.p); return { c, mm, n: gr.length }; }).filter((x) => x.n);
  const maxH = Math.max(1, ...ctry.map((x) => x.mm.held));
  const cats = Object.keys(CAT).filter((x) => x !== 'event').map((c) => { const rs = recsIn(af().p, 0, (x) => x.cat === c); return { c, mm: metrics(rs, scopeGroups(), af().p) }; });
  const open = (S.adm.blockers || []).filter((b) => b.st === 'open' && inScope(gOf(b.g)));
  return `<header class="apphdr">${LOGO}<div class="grow"><h1>Seva HQ</h1><p class="xs muted" style="margin-top:-2px">Sangat at a glance</p></div>${bellBtn()}</header>
    ${filterBar()}
    <div class="livestrip"><span class="livepill"><i></i>${live} LIVE NOW</span><span class="small">${live ? `running in ${liveG.length} group${liveG.length > 1 ? 's' : ''} · ${liveC} countr${liveC > 1 ? 'ies' : 'y'}` : 'Nothing live for this filter'}</span><button class="link" style="margin-left:auto;min-height:30px;padding:0" data-tab="seva">See${I.chev}</button></div>
    ${al.length ? `<div class="card alertcard"><div class="row" style="justify-content:space-between"><h3 style="font-size:16px">Needs your attention</h3><span class="chip" style="background:var(--live-bg);color:var(--live)">${al.filter((a) => a[0] === 'bad').length} urgent · ${al.filter((a) => a[0] === 'warn').length} watch</span></div>
      ${al.slice(0, 4).map(([g, t, s2, gid]) => `<button class="lrow" data-open="grp:${gid}" style="align-items:flex-start"><span class="av2" style="width:32px;height:32px;background:${STL[g][2]};color:${STL[g][1]}">${STL[g][3].replace('<svg', '<svg style="width:18px;height:18px"')}</span><div class="grow"><b class="small">${esc(t)}</b><p class="xs muted">${esc(s2)}</p></div>${chev}</button>`).join('')}
      ${al.length > 4 ? `<button class="btn ghost sm block" style="margin-top:6px" data-act="all-alerts">See all ${al.length} alerts</button>` : ''}</div>` : `<div class="card row" style="margin-top:12px">${STL.good[3].replace('<svg', '<svg style="width:26px;height:26px;color:var(--done)"')}<b class="small">Everything is on track for this filter 🙏</b></div>`}
    <div class="ktiles">${tiles.map((k) => { const K = KPI[k]; const g = K.g(m); const pct = ['fill', 'turn', 'ontime', 'att'].includes(k); return `<button class="ktile tap" data-open="report:${k}" style="--kc:${STL[g][1]}"><div class="row" style="justify-content:space-between"><span class="kic">${K.ic}</span>${delta(K.v(m), K.v(pm), pct)}</div><b class="kv">${K.fmt(m)}</b><span class="kl">${K.l}</span><div class="row" style="justify-content:space-between;margin-top:6px;gap:4px">${spill(g)}</div><span class="ks">${K.sub(m)}</span></button>`; }).join('')}</div>
    ${chartCard('Seva held', af().p === 365 ? 'Per month' : af().p === 7 ? 'Per day' : 'Per week', barChart(trend('held'), 0, 'Seva held over time'), 'data-open="report:held"')}
    ${chartCard('Places filled', 'Green band = on target (85%+)', lineChart(trend('fill'), 85, 'Places filled over time'), 'data-open="report:fill"')}
    ${chartCard('Countries', 'Seva held · dot shows places filled', `<div class="hbars">${ctry.sort((a, b) => b.mm.held - a.mm.held).map(({ c, mm }) => { const g = KPI.fill.g(mm); return `<div class="hb ctry" data-act="af-set" data-k="c" data-v="${c}" data-tip="${c}: ${mm.held} seva · ${mm.fill}% filled"><span class="hl">${FLAG[c]} ${c}</span><span class="track"><i style="width:${mm.held / maxH * 100}%;background:var(--ch1)"></i></span><span class="hv">${mm.held}<i class="sdot" style="background:${STL[g][1]}"></i></span></div>`; }).join('')}</div>`)}
    <div class="card ichart"><div class="row" style="justify-content:space-between;align-items:flex-start"><div><h3 style="font-size:16px">Team lead performance</h3><p class="xs muted">Score from places filled, turn-up, timing and attendance</p></div></div>
      ${gs.map((x, i) => `<button class="lrow" data-open="grp:${x.g.id}"><span class="rank">${i + 1}</span><div class="grow" style="min-width:0"><b class="small ellipsis" style="display:block">${x.g.flag} ${esc(x.g.name)}</b><p class="xs muted ellipsis">${esc((S.adm.leads[x.g.id] || [x.g.lead])[0])} · ${x.m.held} seva · ${x.m.fill}% filled</p></div>${spark(x.weeks)}<span class="score" style="color:${STL[scoreG(x.score)][1]};background:${STL[scoreG(x.score)][2]}">${x.score}</span></button>`).join('')}
      <p class="xs muted" style="margin-top:8px"><span class="score" style="color:var(--done);background:var(--done-bg)">82+</span> on track · <span class="score" style="color:var(--action);background:var(--action-bg)">70–81</span> watch · <span class="score" style="color:var(--live);background:var(--live-bg)">&lt;70</span> needs support</p></div>
    ${chartCard('Seva types', 'How many · and how well filled', `<div class="hbars">${cats.sort((a, b) => b.mm.held - a.mm.held).map(({ c, mm }) => { const g = KPI.fill.g(mm); return `<div class="hb" data-act="af-set" data-k="t" data-v="${c}" data-tip="${CAT[c].label}: ${mm.held} seva · ${mm.fill}% filled"><span class="hl"><i class="sdot" style="background:var(--c-${c});margin:0 6px 0 0"></i>${CAT[c].label}</span><span class="track"><i style="width:${mm.held / Math.max(1, ...cats.map((x) => x.mm.held)) * 100}%;background:var(--ch1)"></i></span><span class="hv" style="color:${g === 'good' ? 'var(--ink)' : STL[g][1]}">${mm.fill}%</span></div>`; }).join('')}</div>`)}
    ${chartCard('Sevadars: male & female', 'Who is in the sangat · who comes to seva · by type', genderChart(m, cats))}
    ${chartCard('When seva happen', 'Last 12 weeks · each square is a day', heatmap())}
    <div class="card ichart"><div class="row" style="justify-content:space-between"><h3 style="font-size:16px">Blockers reported by leads</h3><span class="xs muted">${open.length} open</span></div>
      ${(S.adm.blockers || []).filter((b) => inScope(gOf(b.g))).map((b) => `<div class="lrow" style="align-items:flex-start;${b.st === 'resolved' ? 'opacity:.55' : ''}"><span class="av2" style="width:32px;height:32px;background:${STL[b.st === 'resolved' ? 'good' : b.sev][2]};color:${STL[b.st === 'resolved' ? 'good' : b.sev][1]}">${STL[b.st === 'resolved' ? 'good' : b.sev][3].replace('<svg', '<svg style="width:18px;height:18px"')}</span><div class="grow"><b class="small">${esc(b.t)}</b><p class="xs muted">${gOf(b.g).flag} ${esc(gOf(b.g).name)} · ${ago(b.d)}${ago(b.d) === 'just now' ? '' : ' ago'}${b.st === 'resolved' ? ' · resolved' : ''}</p></div>${b.st === 'open' ? `<button class="btn soft sm" data-act="blk-done" data-id="${b.id}">Resolved</button>` : ''}</div>`).join('') || '<p class="small muted" style="padding:10px 0">No blockers reported.</p>'}</div>
    <p class="xs faint" style="text-align:center;margin-top:12px">Tap any tile, bar or row for details · sample data in this prototype</p>`;
}
function allAlertsSheet() { const al = alertsList(); openSheet(`${sheetHead('All alerts', `${al.length} for this filter`)}<div class="card list">${al.map(([g, t, s2, gid]) => `<button class="lrow" data-open="grp:${gid}" style="align-items:flex-start"><span class="av2" style="width:32px;height:32px;background:${STL[g][2]};color:${STL[g][1]}">${STL[g][3].replace('<svg', '<svg style="width:18px;height:18px"')}</span><div class="grow"><b class="small">${esc(t)}</b><p class="xs muted">${esc(s2)}</p></div>${chev}</button>`).join('')}</div>`); }
// ----- Detailed report for one KPI -----
function ReportView({ id }) {
  const K = KPI[id]; const m = cur(), pm = prev(); const g = K.g(m); const pct = ['fill', 'turn', 'ontime', 'att'].includes(id);
  const gs = groupStats(); const vals = gs.map((x) => ({ x, v: K.v(x.m), gr: K.g(x.m) })).sort((a, b) => a.v - b.v);
  const max = Math.max(1, ...vals.map((v) => v.v)); const best = vals[vals.length - 1], worst = vals[0];
  const ctry = COUNTRIES.filter(ctryInScope).map((c) => { const gr = gs.filter((x) => x.g.country === c).map((x) => x.g); const F = af(); const mm = metrics(admData().recs.filter((x) => gr.some((gg) => gg.id === x.g) && x.d >= now() - F.p * DAY && (F.t === 'all' || x.cat === F.t)), gr, F.p); return { c, v: K.v(mm), gr: K.g(mm), n: gr.length }; }).filter((x) => x.n);
  return `${dtop(K.l)}${filterBar()}
    <div class="card" style="margin-top:12px;background:linear-gradient(135deg,${STL[g][2]},var(--surface) 75%)"><div class="row" style="justify-content:space-between"><span class="xs muted">${AFP.find((x) => x[0] === af().p)[1]} · ${whereLabel()}</span>${spill(g)}</div><div class="row" style="align-items:baseline;gap:10px;margin-top:6px"><b style="font-size:40px;font-weight:800;letter-spacing:-.03em">${K.fmt(m)}</b>${delta(K.v(m), K.v(pm), pct)}</div><p class="small muted">${K.sub(m)} · previous period ${K.fmt(pm)}</p></div>
    ${chartCard('Over time', '', pct ? lineChart(trend(id), K.tgt, K.l + ' over time') : barChart(trend(id), 0, K.l + ' over time'))}
    ${ctry.length > 1 ? chartCard('By country', '', `<div class="hbars">${ctry.sort((a, b) => a.v - b.v).map((c) => `<div class="hb" data-tip="${c.c}: ${K.fmt({ ...m, [id]: c.v, held: c.v, active: c.v })}"><span class="hl">${FLAG[c.c]} ${c.c}</span><span class="track"><i style="width:${pct ? c.v : c.v / Math.max(1, ...ctry.map((x) => x.v)) * 100}%;background:${pct ? STL[c.gr][1] : 'var(--ch1)'}"></i>${pct && K.tgt ? `<b class="tmark" style="left:${K.tgt}%"></b>` : ''}</span><span class="hv">${pct ? c.v + '%' : num(c.v)}</span></div>`).join('')}</div>`) : ''}
    ${chartCard('By group', pct ? 'Worst first · line = target' : 'Lowest first', `<div class="hbars">${vals.map(({ x, v, gr }) => `<div class="hb" data-open="grp:${x.g.id}" data-tip="${x.g.name}: ${pct ? v + '%' : num(v)}"><span class="hl ellipsis">${x.g.flag} ${esc(x.g.name.replace(/ (Sangat|Jatha|Central|Southall)$/, ''))}</span><span class="track"><i style="width:${pct ? v : v / max * 100}%;background:${STL[gr][1]}"></i>${pct && K.tgt ? `<b class="tmark" style="left:${K.tgt}%"></b>` : ''}</span><span class="hv" style="color:${gr === 'good' ? 'var(--ink)' : STL[gr][1]}">${gr !== 'good' ? STL[gr][3] : ''}${pct ? v + '%' : num(v)}</span></div>`).join('')}</div>`)}
    ${vals.length > 1 ? `<div class="card"><h3 style="font-size:16px">What we see</h3><div class="lrow">${STL.good[3].replace('<svg', '<svg style="width:22px;height:22px;color:var(--done)"')}<p class="small"><b>${esc(best.x.g.name)}</b> leads with ${pct ? best.v + '%' : num(best.v)} — ask ${esc(first(best.x.g.lead))} what works.</p></div><div class="lrow">${STL[worst.gr === 'good' ? 'warn' : worst.gr][3].replace('<svg', `<svg style="width:22px;height:22px;color:${STL[worst.gr === 'good' ? 'warn' : worst.gr][1]}"`)}<p class="small"><b>${esc(worst.x.g.name)}</b> is lowest at ${pct ? worst.v + '%' : num(worst.v)}.</p><button class="btn soft sm" data-open="grp:${worst.x.g.id}">Open</button></div></div>` : ''}`;
}
// ----- One group, its lead and its health -----
function GroupView({ id }) {
  const g = gOf(id); const x = groupStats().find((y) => y.g.id === id) || { m: metrics([], [g], af().p), pm: metrics([], [g], af().p), score: 0, weeks: [0], quiet: 99 };
  const leads = S.adm.leads[id] || [g.lead]; const rs = admData().recs.filter((r) => r.g === id).slice(-8).reverse();
  const tiles = ['held', 'fill', 'turn', 'ontime', 'att', 'active'];
  return `${dtop(g.name)}<div class="dhero" style="background:linear-gradient(140deg,#6A5AE0,#3F2F99)"><span class="chip" style="background:rgba(255,255,255,.2);color:#fff">${g.flag} ${g.country}</span><h1>${esc(g.name)}</h1><p class="small" style="opacity:.9;margin-top:6px">${num(g.members)} members · ${leads.length} team lead${leads.length > 1 ? 's' : ''}</p>
      <div class="row" style="margin-top:14px;gap:10px"><span class="score big" style="color:${STL[scoreG(x.score)][1]};background:#fff">${x.score}</span><div><b>Lead score</b><p class="xs" style="opacity:.85">${STL[scoreG(x.score)][0]} · ${AFP.find((p) => p[0] === af().p)[1]}</p></div></div></div>
    ${x.quiet >= 14 ? `<div class="banner" style="margin-top:12px;background:var(--live-bg);border-color:var(--live)">${I.alert}<span><b>No seva for ${x.quiet} days.</b> Check in with the lead.</span></div>` : ''}
    <div class="ktiles">${tiles.map((k) => { const K = KPI[k]; const gr = K.g(x.m); return `<div class="ktile" style="--kc:${STL[gr][1]}"><div class="row" style="justify-content:space-between"><span class="kic">${K.ic}</span>${delta(K.v(x.m), K.v(x.pm), ['fill', 'turn', 'ontime', 'att'].includes(k))}</div><b class="kv">${K.fmt(x.m)}</b><span class="kl">${K.l}</span><div style="margin-top:6px">${spill(gr)}</div></div>`; }).join('')}</div>
    ${chartCard('Seva per week', 'Last 8 weeks', barChart(x.weeks.map((v, i) => ({ l: `W${i + 1}`, v })), Math.round(g.q.freq), 'Seva per week'))}
    <div class="card"><div class="section-h" style="margin-bottom:4px"><h2 style="font-size:16px">Team leads</h2><button class="link" data-act="lead-assign" data-g="${id}">${I.userplus}Assign</button></div>${leads.map((n) => `<div class="lrow"><span class="av2" style="background:${avColor(n)}">${initials(n)}</span><div class="grow"><b class="small">${esc(n)}</b><span class="leadtag">Lead</span></div><button class="iconbtn" data-act="wa-person" data-n="${esc(n)}" aria-label="Message ${esc(n)}" style="color:#25A35A">${I.wa}</button><button class="iconbtn" data-act="lead-remove" data-g="${id}" data-n="${esc(n)}" aria-label="Remove lead role" style="color:var(--live)">${I.trash}</button></div>`).join('')}</div>
    <div class="card" style="margin-top:12px"><h2 style="font-size:16px;margin-bottom:4px">Recent seva</h2>${rs.map((r) => { const gr = r.cancelled ? 'bad' : KPI.fill.g({ fill: Math.round(r.filled / r.need * 100) }); return `<div class="lrow"><span class="av2" style="width:34px;height:34px;font-size:12px;background:var(--c-${r.cat})">${new Date(r.d).getDate()}</span><div class="grow"><b class="small">${CAT[r.cat].label} seva</b><p class="xs muted">${fmtLong(iso(r.d))}${r.cancelled ? ` · cancelled: ${r.reason}` : ` · ${r.came} came · ${r.delay > 10 ? `${r.delay} min late` : 'on time'}`}</p></div><span class="spill" style="color:${STL[gr][1]};background:${STL[gr][2]}">${r.cancelled ? 'Cancelled' : Math.round(r.filled / r.need * 100) + '%'}</span></div>`; }).join('')}</div>
    ${(S.adm.blockers || []).filter((b) => b.g === id).map((b) => `<div class="banner" style="margin-top:12px">${I.flag}<span class="grow"><b>${esc(b.t)}</b><br><span class="xs">${b.st === 'open' ? 'Open blocker' : 'Resolved'}</span></span>${b.st === 'open' ? `<button class="btn soft sm" data-act="blk-done" data-id="${b.id}">Resolved</button>` : ''}</div>`).join('')}`;
}
// ----- People: groups, members, leads -----
const FN = ['Aman', 'Baljeet', 'Charanjit', 'Davinder', 'Gagan', 'Harnoor', 'Iqbal', 'Jaswinder', 'Karan', 'Lakhvir', 'Manpreet', 'Nirmal', 'Onkar', 'Pritpal', 'Rupinder', 'Sukhdeep', 'Tarlochan', 'Upkar', 'Varinder', 'Yadwinder'];
function membersOf(gid) { if (gid === 'delhi') return [...NAMES]; let h = [...gid].reduce((a, c) => a * 31 + c.charCodeAt(0), 3) >>> 0; const r = () => ((h = (h * 1103515245 + 12345) >>> 0) / 4294967296); return Array.from({ length: 16 }, () => `${FN[Math.floor(r() * FN.length)]} ${r() < .5 ? 'Singh' : 'Kaur'}`).filter((v, i, a) => a.indexOf(v) === i); }
let pSeg = 'groups', pQ = '', pG = 'all';
function AdminPeople() {
  const segs = [['groups', 'Groups'], ['members', 'Members'], ['leads', 'Team leads']]; const sel = pgs(); const inP = (g) => !sel.length || sel.includes(g.id);
  const q = pQ.trim().toLowerCase();
  const tools = `<div class="ptools"><button class="fchip2 ${sel.length ? 'on' : ''}" data-act="pw-open" style="flex:1"><span class="ellipsis">${whereLabel(sel)}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg></button>${sel.length ? `<button class="fchip2 reset" data-act="pw-reset" aria-label="Show all places">${I.close}</button>` : ''}</div>
    ${pSeg !== 'groups' ? `<label class="search" style="margin-top:10px">${I.search}<input id="adm-q" placeholder="Search ${pSeg === 'leads' ? 'team leads' : 'members'} by name" value="${esc(pQ)}" autocomplete="off"></label>` : ''}`;
  let body = '';
  if (pSeg === 'groups') body = COUNTRIES.filter((c) => GROUPS.some((g) => g.country === c && inP(g))).map((c) => `<div class="section-h" style="margin:16px 0 8px"><h2 style="font-size:15px">${FLAG[c]} ${c}</h2><span class="xs muted">${num(GROUPS.filter((g) => g.country === c && inP(g)).reduce((a, g) => a + g.members, 0))} members</span></div><div class="card list">${groupStats().filter((x) => x.g.country === c && inP(x.g)).map((x) => `<button class="lrow" data-open="grp:${x.g.id}"><div class="grow"><b class="small">${esc(x.g.name)}</b><p class="xs muted ellipsis">${num(x.g.members)} members · ${(S.adm.leads[x.g.id] || []).map(first).join(', ') || 'No lead'}</p></div><span class="score" style="color:${STL[scoreG(x.score)][1]};background:${STL[scoreG(x.score)][2]}">${x.score}</span>${chev}</button>`).join('')}</div>`).join('');
  else if (pSeg === 'members') { const all = GROUPS.filter(inP).flatMap((g) => membersOf(g.id).map((n) => ({ n, g }))).filter((m) => !q || m.n.toLowerCase().includes(q)); const list = all.slice(0, 60);
    body = `<p class="xs muted" style="margin:10px 2px 0">${num(all.length)} shown · ${num(GROUPS.filter(inP).reduce((a, g) => a + g.members, 0))} members in ${whereLabel(sel).replace('🌍 ', '').toLowerCase()}</p>
      <div class="card list" style="margin-top:8px">${list.map((m) => { const isL = (S.adm.leads[m.g.id] || []).includes(m.n); return `<button class="lrow" data-act="adm-member" data-n="${esc(m.n)}" data-g="${m.g.id}"><span class="av2" style="background:${avColor(m.n)}">${initials(m.n)}</span><div class="grow"><b class="small">${esc(m.n)}</b>${isL ? '<span class="leadtag">Lead</span>' : ''}<p class="xs muted">${m.g.flag} ${esc(m.g.name)}</p></div>${chev}</button>`; }).join('') || '<p class="small muted" style="padding:14px 0">No one matches.</p>'}</div>`; }
  else { const L = GROUPS.filter(inP).flatMap((g) => (S.adm.leads[g.id] || []).map((n) => ({ n, g }))).filter((m) => !q || m.n.toLowerCase().includes(q));
    body = `<p class="xs muted" style="margin:10px 2px 0">${L.length} team lead${L.length === 1 ? '' : 's'}</p><div class="card list" style="margin-top:8px">${L.map(({ n, g }) => `<div class="lrow"><span class="av2" style="background:${avColor(n)}">${initials(n)}</span><div class="grow"><b class="small">${esc(n)}</b><p class="xs muted">${g.flag} ${esc(g.name)}</p></div><button class="iconbtn" data-act="wa-person" data-n="${esc(n)}" aria-label="Message" style="color:#25A35A">${I.wa}</button><button class="iconbtn" data-act="lead-remove" data-g="${g.id}" data-n="${esc(n)}" aria-label="Remove lead role" style="color:var(--live)">${I.trash}</button></div>`).join('') || '<p class="small muted" style="padding:14px 0">No team leads match.</p>'}</div>`; }
  return `<header class="apphdr"><h1 class="pagetitle" style="padding:6px 0 0">People</h1><span class="sp"></span>${bellBtn()}</header>
    <div class="tstats four"><div class="tstat" style="--tc:var(--p)"><b>${num(GROUPS.filter(inP).reduce((a, g) => a + g.members, 0))}</b><span>Members</span></div><div class="tstat"><b>${GROUPS.filter(inP).length}</b><span>Groups</span></div><div class="tstat"><b>${new Set(GROUPS.filter(inP).map((g) => g.country)).size}</b><span>Countries</span></div><div class="tstat" style="--tc:var(--done)"><b>${GROUPS.filter(inP).reduce((a, g) => a + (S.adm.leads[g.id] || []).length, 0)}</b><span>Leads</span></div></div>
    <div class="seg" style="margin-top:12px">${segs.map(([k, l]) => `<button data-pseg="${k}" aria-pressed="${pSeg === k}">${l}</button>`).join('')}</div>${tools}${body}`;
}
function admMemberSheet(n, gid) {
  const g = gOf(gid); const isL = (S.adm.leads[gid] || []).includes(n); const c = (n.length * 7) % 23;
  openSheet(`<div style="text-align:center"><span class="av2" style="width:72px;height:72px;font-size:24px;margin:4px auto 0;background:${avColor(n)}">${initials(n)}</span><h2 style="font-size:21px;margin-top:10px">${esc(n)}</h2><p class="small muted">${isL ? 'Team Lead' : 'Member'} · ${g.flag} ${esc(g.name)}</p></div>
    <div class="tstats" style="margin-top:14px"><div class="tstat" style="--tc:var(--done)"><b>${c}</b><span>Contributions</span></div><div class="tstat"><b>${(n.length * 3) % 40}d</b><span>Since last seva</span></div><div class="tstat" style="--tc:var(--gold)"><b>${c * 3}</b><span>Points</span></div></div>
    <div class="card list" style="margin-top:12px">${isL ? `<button class="lrow" data-act="lead-remove" data-g="${gid}" data-n="${esc(n)}" style="color:var(--live)">${I.shield}<b class="small grow">Remove team lead role</b></button>` : `<button class="lrow" data-act="lead-make" data-g="${gid}" data-n="${esc(n)}" style="color:var(--p)">${I.shield}<b class="small grow">Make team lead of ${esc(g.name)}</b>${chev}</button>`}
      <button class="lrow" data-open="user:${esc(n)}">${I.garden}<b class="small grow">View profile</b>${chev}</button><button class="lrow" data-act="wa-person" data-n="${esc(n)}">${I.wa.replace('<svg', '<svg style="width:22px;height:22px;color:#25A35A"')}<b class="small grow">Message on WhatsApp</b>${chev}</button></div>`);
}
function leadAssignSheet(gid) { const g = gOf(gid); const L = S.adm.leads[gid] || []; openSheet(`${sheetHead('Assign a team lead', `${g.flag} ${esc(g.name)}`)}<div class="card list" style="max-height:56vh;overflow:auto">${membersOf(gid).filter((n) => !L.includes(n)).map((n) => `<button class="lrow" data-act="lead-make" data-g="${gid}" data-n="${esc(n)}"><span class="av2" style="background:${avColor(n)}">${initials(n)}</span><b class="small grow">${esc(n)}</b><span class="link" style="min-height:0">Make lead</span></button>`).join('')}</div>`); }
// ----- Admin: all seva -----
let aSeg = 'live';
// where a seva belongs: its group, state and country
const sevaGroup = (s) => gOf(s.gid || (s.hq ? 'bhaini' : 'delhi'));
const locRib = (g, hq) => `<span class="locrib ${hq ? 'hq' : ''}"><b>${g.flag} ${g.country}</b><i>›</i>${esc(g.state)}<i>›</i><span class="ellipsis">${esc(g.name)}</span>${hq ? '<em>HQ · all sangat</em>' : ''}</span>`;
const withLoc = (html, g, hq) => html.replace('class="scard', 'class="scard withloc').replace(/^(\s*<(button|div)[^>]*>)/, `$1${locRib(g, hq)}`);
function AdminSeva() {
  const F = af(); const others = GROUPS.filter((g) => g.id !== 'delhi' && inScope(g));
  const syn = (k) => others.filter((g, i) => k === 'live' ? (g.q.freq > 2 && i % 2 === 0) : g.id !== 'jaipur').map((g, i) => ({ g, title: `${CAT[CATW[i % 10][0]].label} Seva`, cat: CATW[i % 10][0], when: k === 'live' ? `Live now · ends ${fmtTime(at(0, 13))}` : `${relDay(at(1 + (i % 6), 9))} · 9:00 AM`, fill: Math.round(g.q.fill * 100), going: Math.round(g.members * .12), d: k === 'live' ? now() : T(at(1 + (i % 6), 9)) }));
  const items = [];
  if (aSeg !== 'attention') {
    S.seva.filter((s) => inScope(sevaGroup(s)) && (aSeg === 'live' ? isLive(s) : isFuture(s))).forEach((s) => items.push({ g: sevaGroup(s), d: T(s.start), html: withLoc(s.hq ? sevaCard(s) : leadCard(s), sevaGroup(s), s.hq) }));
    if (aSeg === 'upcoming') (S.otherSeva || []).filter((s) => inScope(gOf(s.gid))).forEach((s) => items.push({ g: gOf(s.gid), d: T(s.start), html: withLoc(`<div class="scard">${dblock(s.start, s.cat)}<div class="grow"><span class="chip" style="background:color-mix(in srgb,var(--c-${s.cat}) 13%,transparent);color:var(--c-${s.cat})">${CAT[s.cat].label}</span><h3>${esc(s.title)}</h3><p class="m">${relDay(s.start)} · ${fmtTime(s.start)} · created by you</p></div></div>`, gOf(s.gid)) }));
    syn(aSeg).forEach((x) => items.push({ g: x.g, d: x.d, html: withLoc(`<button class="scard tap ${aSeg === 'live' ? 'live' : ''}" data-open="grp:${x.g.id}">${dblock(at(1 + (x.g.id.length % 6), 9), x.cat, aSeg === 'live', at(0, 13))}<div class="grow"><span class="chip" style="background:color-mix(in srgb,var(--c-${x.cat}) 13%,transparent);color:var(--c-${x.cat})">${CAT[x.cat].label}</span><h3>${x.title}</h3><p class="m">${x.when} · lead ${esc((S.adm.leads[x.g.id] || [x.g.lead])[0])}</p><div class="mini"><i style="width:${x.fill}%;background:${STL[KPI.fill.g({ fill: x.fill })][1]}"></i></div><p class="xs muted" style="margin-top:4px">${x.fill}% places filled · ${x.going} going</p></div></button>`, x.g) }));
  }
  // grouped by country so the admin always knows where each seva is
  const byC = COUNTRIES.map((c) => ({ c, list: items.filter((x) => x.g.country === c).sort((a, b) => a.d - b.d) })).filter((x) => x.list.length);
  const alerts = aSeg === 'attention' ? alertsList() : [];
  return `<header class="apphdr"><h1 class="pagetitle" style="padding:6px 0 0">All seva</h1><span class="sp"></span>${bellBtn()}</header>${filterBar()}
    <div class="chips fill tight" style="margin-top:12px">${[['live', 'Live'], ['upcoming', 'Upcoming'], ['attention', 'Needs attention']].map(([k, l]) => `<button class="chip2" data-aseg="${k}" aria-pressed="${aSeg === k}">${k === 'live' ? '<i class="ld"></i>' : ''}${l}</button>`).join('')}</div>
    <div style="margin-top:4px">${aSeg === 'attention'
      ? (alerts.length ? alerts.map(([g, t, s2, gid]) => { const gg = gOf(gid); return `<button class="banner tap" data-open="grp:${gid}" style="margin-top:8px;background:${STL[g][2]};border-color:${STL[g][1]};flex-wrap:wrap">${STL[g][3]}<span class="grow"><span class="xs" style="font-weight:700;opacity:.8">${gg.flag} ${gg.country} · ${esc(gg.state)} · ${esc(gg.name)}</span><br><b>${esc(t)}</b><br><span class="xs">${esc(s2)}</span></span>${chev}</button>`; }).join('') : emptyState('Nothing needs attention', 'All groups in this filter are on track.'))
      : byC.length ? byC.map(({ c, list }) => `<div class="chead"><b>${FLAG[c]} ${c}</b><span>${list.length} seva · ${[...new Set(list.map((x) => x.g.name))].length} group${[...new Set(list.map((x) => x.g.name))].length > 1 ? 's' : ''}</span></div>${list.map((x) => x.html).join('')}`).join('') : emptyState(aSeg === 'live' ? 'Nothing live here right now' : 'No upcoming seva here', 'Try another place in the filter.')}</div>
    <button class="fab" data-act="seva-new" aria-label="Create seva">${I.plus}<span>New seva</span></button>`;
}
// ----- Admin: feed composer (designed cards, no images) -----
const CP_TYPES = [['thought', 'Thought of the Day'], ['hukam', 'Satguru Ji\'s Hukam'], ['alert', 'Alert'], ['info', 'Information'], ['appreciation', 'Appreciation'], ['event', 'Event'], ['text', 'Plain text']];
let CP = null;
function cpPost() { return { id: 'cp', type: CP.type, d: iso(now()), title: CP.title || PK[CP.type].label, text: CP.text || 'Your message appears here.', stat: CP.stat || '10 sevadars', link: CP.link || null, cta: CP.link ? (CP.link.startsWith('event') ? 'RSVP' : 'View seva') : null, ev: CP.type === 'event' && CP.link?.startsWith('event') ? CP.link.split(':')[1] : null, r: { g: 0, s: 0 } }; }
function Compose() {
  if (!CP) CP = { type: 'thought', title: '', text: '', stat: '', link: '' };
  const links = [...S.seva.filter((s) => T(s.end) > now()).map((s) => [`seva:${s.id}`, s.title]), ...S.events.filter(isFuture).map((e) => [`event:${e.id}`, e.title])];
  return `${dtop('New post')}<p class="small muted">Posts go to every member's Home feed. No photos — each type has its own designed card.</p>
    <label class="f">Card type</label><div class="cptypes">${CP_TYPES.map(([k, l]) => `<button class="cpt" data-cptype="${k}" aria-pressed="${CP.type === k}"><i style="background:${k === 'text' ? 'var(--surface2)' : `linear-gradient(135deg,${PK[k].grad[0]},${PK[k].grad[2]})`}"></i>${l}</button>`).join('')}</div>
    ${CP.type !== 'thought' && CP.type !== 'text' ? `<label class="f" for="cp-title">Heading</label><input class="in" id="cp-title" value="${esc(CP.title)}" placeholder="${esc(PK[CP.type].label)}">` : ''}
    ${CP.type === 'appreciation' ? `<label class="f" for="cp-stat">Big number</label><input class="in" id="cp-stat" value="${esc(CP.stat)}" placeholder="e.g. 450 served">` : ''}
    <label class="f" for="cp-text">${CP.type === 'text' ? 'Message (can be long)' : 'Message'}</label><textarea class="in" id="cp-text" rows="${CP.type === 'text' ? 7 : 3}" placeholder="Write here…">${esc(CP.text)}</textarea>
    ${['alert', 'info', 'hukam', 'event', 'appreciation'].includes(CP.type) ? `<label class="f" for="cp-link">Button links to (optional)</label><select class="in" id="cp-link"><option value="">No button</option>${links.map(([v, l]) => `<option value="${v}" ${CP.link === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>` : ''}
    <label class="f">Preview</label><div id="cp-prev">${postCard(cpPost()).replace(/data-react="[^"]*"/g, '').replace(/data-dbl="[^"]*"/g, '')}</div>
    <div class="stickyact"><div><button class="btn block" data-act="cp-publish">${I.megaphone}Publish to all members</button></div></div>`;
}
function cpSync() { if (!CP) return; ['title', 'text', 'stat', 'link'].forEach((k) => { const el = $('#cp-' + k); if (el) CP[k] = el.value; }); }
// ----- Admin profile -----
function AdminProfile() {
  return `<div class="card" style="text-align:center;margin-top:16px;padding-top:22px"><div class="bigav" style="position:static;transform:none;margin:0 auto">${initials(ME())}</div><h1 style="font-size:24px;margin-top:10px">${esc(ME())}</h1><p class="sub small muted" style="display:inline-flex;gap:6px;align-items:center">${I.shield.replace('<svg', '<svg style="width:15px;height:15px"')}Super Admin · Seva HQ</p></div>
    ${roleSwitch()}
    <div class="menu">${[['inbox', I.bell, 'Notifications', unread() ? `${unread()} new` : '', 'open'], ['settings', I.settings, 'App Settings', '', 'act']].map(([k, ic, l, ct, how]) => `<button class="lrow" ${how === 'open' ? `data-open="${k}"` : `data-act="${k}"`}>${ic.replace('<svg', '<svg class="mi"')}<b class="grow">${l}</b><span class="ct">${ct}</span>${chev}</button>`).join('')}</div>`;
}
const roleSwitch = () => `<div class="card rolesw"><b class="small">Viewing as</b><p class="xs muted">Prototype switch — try every side</p><div class="seg" style="margin-top:10px"><button data-role="member" aria-pressed="${S.role === 'member'}">Member</button><button data-role="lead" aria-pressed="${S.role === 'lead'}">Team Lead</button><button data-role="admin" aria-pressed="${S.role === 'admin'}">Admin</button></div></div>`;

// ---------- Sheets ----------
function openSheet(html) { const keep = $('#sheet-root .sheet')?.scrollTop || 0; $('#sheet-root').innerHTML = `<div class="scrim" data-act="close-sheet"></div><div class="sheet" role="dialog" aria-modal="true"><div class="grabber"></div>${html}</div>`; document.body.style.overflow = 'hidden'; if (keep) { const sh = $('#sheet-root .sheet'); sh.style.animation = 'none'; sh.scrollTop = keep; } }
function closeSheet() { $('#sheet-root').innerHTML = ''; document.body.style.overflow = ''; }
function install() {
  if (window.__dp) { window.__dp.prompt(); return; }
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const st2 = ios ? ['Open this page in <b>Safari</b>', 'Tap <b>Share</b> in the toolbar', 'Tap <b>Add to Home Screen</b>, then <b>Add</b>'] : ['Open in <b>Chrome</b>', 'Tap the <b>⋮</b> menu', 'Tap <b>Install app</b> or <b>Add to Home screen</b>'];
  openSheet(`${sheetHead('Add to Home Screen')}<div class="card list">${st2.map((t, i) => `<div class="lrow"><span class="av2" style="width:32px;height:32px;background:var(--p)">${i + 1}</span><span class="small">${t}</span></div>`).join('')}</div>`);
}

// ---------- Actions ----------
function notify(level, t, ref) { S.notifs.unshift({ id: 'n' + uid(), level, t, d: iso(now()), ref }); }
function setSevaResponse(sid, v) {
  const s = sv(sid); const prev = st(s);
  S.assign[sid] = { state: v };
  if (v !== 'going') s.points.forEach((p) => { p.takers = p.takers.filter((t) => t !== '@me'); });
  save(); toast(v === 'going' ? (isLive(s) ? 'Welcome! Pick a task to start' : prev === 'going' ? 'You\'re going' : 'You\'re going — now pick your tasks') : v === 'maybe' ? 'Marked as maybe' : 'Thanks for letting your lead know');
  if (v === 'going') dtab = 'tasks';
}
function setEventResponse(eid, v) { const e = ev(eid); const prev = S.rsvp[eid]; const k = (x) => x === 'no' ? 'cant' : x; if (prev) e[k(prev)]--; S.rsvp[eid] = v === 'cant' ? 'no' : v; e[v]++; save(); toast(v === 'going' ? 'RSVP confirmed' : v === 'maybe' ? 'Marked as maybe' : 'Thanks for letting the organizer know'); }
function openRef(ref) { const [k, v] = ref.split(':'); if (k === 'report' || k === 'grp') push({ v: k, id: v }); else if (k === 'compose') { CP = null; push({ v: 'compose' }); } else if (k === 'user') { uview = '2d'; push({ v: 'user', n: v }); } else if (k === 'sevaas') push({ v: 'seva', id: v, asMember: true }); else if (k === 'attend') push({ v: 'attend', id: v }); else if (k === 'seva' || k === 'event' || k === 'history') push({ v: k, id: v }); else if (['inbox', 'team', 'journey'].includes(k)) push({ v: k }); else if (k === 'tab') go(v); }
const shareText = (kind, x) => `🙏 ${x.title}\n${relDay(x.start)} · ${fmtTime(x.start)} · ${x.place}\n${location.origin}${location.pathname}#${kind}=${x.id}`;
function ics(items, name) {
  const z = (d) => iso(T(d)).replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const evs = items.map((i) => `BEGIN:VEVENT\r\nUID:${i.id}-${uid()}@namdhari-seva\r\nDTSTAMP:${z(iso(now()))}\r\nDTSTART:${z(i.start)}\r\nDTEND:${z(i.end)}\r\nSUMMARY:${i.title}\r\nLOCATION:${i.place}\r\nBEGIN:VALARM\r\nTRIGGER:-PT1H\r\nACTION:DISPLAY\r\nDESCRIPTION:Reminder\r\nEND:VALARM\r\nEND:VEVENT`).join('\r\n');
  const a = document.createElement('a'); a.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(`BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Namdhari Seva//EN\r\n${evs}\r\nEND:VCALENDAR`); a.download = name + '.ics'; document.body.appendChild(a); a.click(); a.remove(); toast('Calendar file ready — open it to add');
}
async function pushTest() {
  if (!('Notification' in window)) { toast(/iphone|ipad/i.test(navigator.userAgent) ? 'On iPhone, add to Home Screen first' : 'Notifications aren\'t supported here'); return; }
  const p = await Notification.requestPermission(); if (p !== 'granted') { toast('Notifications are off — your inbox still has everything'); return; }
  const reg = await navigator.serviceWorker?.getRegistration(); const body = 'Tomorrow 9:00 AM — you\'re cooking dal and sabzi at Sunday Langar Seva.';
  reg ? reg.showNotification('Seva reminder', { body, icon: 'icons/icon-192.png', tag: 'demo' }) : new Notification('Seva reminder', { body });
}
function burst(card) { const b = document.createElement('div'); b.className = 'burst'; b.innerHTML = '<span style="font-size:92px;line-height:110px;display:block;text-align:center;filter:drop-shadow(0 6px 16px rgba(0,0,0,.25))">🙏</span>'; card.appendChild(b); setTimeout(() => b.remove(), 850); }
function refreshBar(pid) { const p = S.feed.find((x) => x.id === pid); const el = $(`#post-${pid} .pacts`); if (el) el.outerHTML = reactBar(p); }
function setReact(pid, k, on) {
  const r = S.react[pid] = S.react[pid] || {}; r[k] = on ?? !r[k]; save(); refreshBar(pid);
  const b = $(`#post-${pid} .pact.${k === 'g' ? 'grat' : 'supp'}`); if (b && r[k]) b.classList.add('pop');
}

function handle(el) {
  const act = el.dataset.act, id = el.dataset.id; buzz();
  switch (act) {
    case 'story-new': if (SV) closeStory(); openComposer(); break;
    case 'story-mine': { closeSheet(); const g = grp(SG()); const k = g.stories.findIndex((x) => x.by === '@me'); if (k < 0) { openComposer(); break; } openStory(SG()); SV.i = k; buildCube(); showStory(); break; }
    case 'story-del': pauseStory(); if (confirm('Delete this story? Members will no longer see it.')) deleteMyStory(id); else resumeStory(); break;
    case 'sc-close': if (!(SC.text || '').trim() && !SC.img) closeComposer(); else if (confirm('Discard this story?')) closeComposer(); break;
    case 'sc-font': SC.font = FONTS[(FONTS.findIndex((f) => f[0] === SC.font) + 1) % FONTS.length][0]; scPatch(); scHint(FONTS.find((f) => f[0] === SC.font)[1]); break;
    case 'sc-align': SC.align = { center: 'left', left: 'right', right: 'center' }[SC.align]; scPatch(); break;
    case 'sc-col': SC.col = (SC.col + 1) % TCOL.length; scPatch(); break;
    case 'sc-photo': SC.text = $('#sc-text').innerText; $('#sc-file').click(); break;
    case 'sc-nophoto': SC.text = $('#sc-text').innerText; SC.img = null; drawComposer(); break;
    case 'sc-link': SC.text = $('#sc-text').innerText; scLinkSheet(); break;
    case 'sc-setlink': SC.link = el.dataset.ref || null; closeSheet(); drawComposer(); break;
    case 'sc-share': SC.text = $('#sc-text').innerText; scShare(); break;
    case 'glance': { const k = el.dataset.k; if (k === 'insights') { teamSeg = 'insights'; go('team'); } else if (k === 'team') { teamSeg = 'requests'; go('team'); } else { sevaSeg = 'manage'; leadChip = k === 'attend' ? 'attend' : k === 'seva' ? 'live' : 'upcoming'; go('seva'); } break; }
    case 'seva-new': draft = null; push({ v: 'create' }); break;
    case 'd-need': { syncDraft(); const tk = draft.tasks[+el.dataset.i]; tk.n = Math.max(1, Math.min(60, tk.n + +el.dataset.d)); rerender(); break; }
    case 'd-del': syncDraft(); draft.tasks.splice(+el.dataset.i, 1); rerender(); break;
    case 'd-add': syncDraft(); draft.tasks.push({ t: '', n: 2 }); rerender(); setTimeout(() => { const ins = $$('[data-dt]'); ins[ins.length - 1]?.focus(); }, 50); break;
    case 'd-publish': {
      syncDraft(); const tasks = draft.tasks.filter((x) => x.t.trim()); if (!draft.title.trim()) { toast('Please add a title'); return; } if (!tasks.length) { toast('Add at least one task'); return; }
      const st0 = new Date(`${draft.date}T${draft.start || '09:00'}`), en0 = new Date(`${draft.date}T${draft.end || '12:00'}`); if (en0 <= st0) en0.setTime(st0.getTime() + 2 * HOUR);
      const ns = { id: 's' + uid(), title: draft.title.trim(), cat: draft.cat, start: iso(st0), end: iso(en0), place: draft.place, meet: draft.meet, lead: ME(), purpose: draft.about || 'Seva for the sangat of Delhi Central.', instructions: 'Head covered. Your lead will brief you on the day.', created: iso(now()), recur: draft.repeat ? 'Every ' + st0.toLocaleDateString(undefined, { weekday: 'long' }) : '', people: [], points: tasks.map((x) => ({ id: 't' + uid(), text: x.t.trim(), need: x.n, takers: [], at: iso(now()) })), updates: [] };
      if (isAdmin() && draft.target !== 'hq' && draft.target !== 'delhi') { const g = gOf(draft.target); (S.otherSeva = S.otherSeva || []).push({ ...ns, gid: g.id }); save(); draft = null; pop(); toast(`Published — ${num(g.members)} members of ${g.name} notified`); break; }
      if (isAdmin() && draft.target === 'hq') { ns.hq = true; ns.region = (draft.place.split(',')[0] || 'Sri Bhaini Sahib').trim(); ns.lead = 'Seva HQ team'; S.feed.unshift({ id: 'f' + uid(), type: 'seva', d: iso(now()), sid: ns.id, title: ns.title, text: ns.purpose, r: { g: 0, s: 0 } }); }
      S.seva.push(ns); S.notifs.unshift({ id: 'n' + uid(), level: 'p', t: `New seva: ${ns.title} · ${relDay(ns.start)} ${fmtTime(ns.start)}`, d: iso(now()), ref: 'seva:' + ns.id });
      const reach = ns.hq ? num(GROUPS.reduce((a, g) => a + g.members, 0)) : '248';
      save(); draft = null; stack[stack.length - 1] = { v: 'seva', id: ns.id }; dtab = 'overview'; render(); window.scrollTo(0, 0); toast(`Published — ${reach} members notified`); break;
    }
    case 'seva-edit': editSheet(id); break;
    case 'ed-save': {
      const s = sv(id); const ch = []; const title = $('#ed-title').value.trim() || s.title; const d0 = $('#ed-date').value; const ns = new Date(`${d0}T${$('#ed-start').value}`), ne = new Date(`${d0}T${$('#ed-end').value}`);
      if (title !== s.title) { ch.push(`renamed to "${title}"`); s.title = title; }
      if (!isNaN(ns) && Math.abs(T(s.start) - ns) > MIN) { ch.push(`now starts ${relDay(iso(ns))} at ${fmtTime(iso(ns))}`); s.start = iso(ns); }
      if (!isNaN(ne) && Math.abs(T(s.end) - ne) > MIN) { if (!ch.some((c) => c.includes('starts'))) ch.push(`now ends at ${fmtTime(iso(ne))}`); s.end = iso(ne); }
      const pl = $('#ed-place').value.trim(); if (pl && pl !== s.place) { ch.push(`place changed to ${pl}`); s.place = pl; }
      const mt = $('#ed-meet').value.trim(); if (mt && mt !== s.meet) { ch.push(`meet at ${mt}`); s.meet = mt; }
      closeSheet(); if (!ch.length) { toast('No changes'); break; }
      const n = broadcast(s, 'Change: ' + ch.join(', '), 'edit'); rerender(); toast(`Saved — ${n} people notified`); break;
    }
    case 'seva-cancel': { const s = sv(id); if (!confirm(`Cancel "${s.title}"? Everyone who joined is told.`)) return; const n = broadcast(s, 'This seva has been cancelled. Thank you for your understanding.', 'edit'); S.seva = S.seva.filter((x) => x !== s); save(); pop(); toast(`Cancelled — ${n} people told`); break; }
    case 'seva-end': { const s = sv(id); if (!confirm('End this seva now and take attendance?')) return; s.end = iso(now() - 1000); broadcast(s, 'Seva has ended. Thank you, everyone 🙏', 'info'); save(); push({ v: 'attend', id: s.id }); break; }
    case 'task-edit': taskSheet(id, el.dataset.p); break;
    case 'tk-need': { const n = $('#tk-need'); n.textContent = Math.max(1, Math.min(60, +n.textContent + +el.dataset.d)); break; }
    case 'tk-save': {
      const s = sv(id); const text = $('#tk-text').value.trim(); const need = +$('#tk-need').textContent; if (!text) { toast('Please describe the task'); return; }
      let msg; if (el.dataset.p) { const p = s.points.find((x) => x.id === el.dataset.p); msg = p.text !== text ? `Task changed: "${p.text}" → "${text}"` : `"${text}" now needs ${need}`; p.text = text; p.need = need; p.at = iso(now() + 1000); p.live = true; }
      else { s.points.push({ id: 't' + uid(), text, need, takers: [], at: iso(now() + 1000), live: true }); msg = `New task added: ${text}`; }
      const n = broadcast(s, msg, el.dataset.p ? 'edit' : 'new'); closeSheet(); rerender(); toast(`Saved — ${n} people notified`); break;
    }
    case 'task-del': { const s = sv(id); const p = s.points.find((x) => x.id === el.dataset.p); if (!confirm(`Remove "${p.text}"?${p.takers.length ? ' The people who picked it are told.' : ''}`)) return; s.points = s.points.filter((x) => x !== p); const n = broadcast(s, `Task removed: ${p.text}`, 'edit'); rerender(); toast(`Removed — ${n} people notified`); break; }
    case 'ask-help': { const s = sv(id); const p = s.points.find((x) => x.id === el.dataset.p); broadcast(s, `Help needed: "${p.text}" has no one yet. Can you take it?`, 'new'); rerender(); toast('Request sent to everyone in this seva'); break; }
    case 'nudge': { const s = sv(id); toast(`Reminder sent to ${noReply(s).length} people who haven't replied`); break; }
    case 'invite-sheet': inviteSheet(id); break;
    case 'invite-send': { const s = sv(id); const names = $$('.ck:checked').map((c) => c.value); if (!names.length) { toast('Pick at least one person'); return; } names.forEach((n) => s.people.push({ n, st: 'invited' })); save(); closeSheet(); rerender(); toast(`${names.length} invite${names.length > 1 ? 's' : ''} sent`); break; }
    case 'up-quick': $('#up-text').value = el.dataset.t; break;
    case 'up-send': { const s = sv(id); const t2 = $('#up-text').value.trim(); if (!t2) { toast('Write an update first'); return; } const n = broadcast(s, t2, 'info'); rerender(); toast(`Sent to ${n} people`); break; }
    case 'attend': push({ v: 'attend', id }); break;
    case 'att-pts': attState.pts = Math.max(1, Math.min(5, attState.pts + +el.dataset.d)); rerender(); break;
    case 'att-all': attState.rows.forEach((r) => { r.on = true; }); rerender(); break;
    case 'att-set': attState.rows[+el.dataset.i].on = el.dataset.v === '1'; rerender(); break;
    case 'att-walkin': { const inA = new Set(attState.rows.map((r) => r.n)); openSheet(`${sheetHead('Add someone who came')}<div class="card list" style="max-height:52vh;overflow:auto">${S.team.filter((m) => !inA.has(m.n)).map((m) => `<button class="lrow" data-act="att-add" data-n="${esc(m.n)}"><span class="av2" style="background:${avColor(m.n)}">${initials(m.n)}</span><b class="small grow">${esc(m.n)}</b>${I.plus.replace('<svg', '<svg style="width:20px;height:20px;color:var(--p)"')}</button>`).join('')}</div>`); break; }
    case 'att-add': attState.rows.push({ n: el.dataset.n, was: 'walkin', on: true, task: '' }); closeSheet(); rerender(); break;
    case 'att-save': {
      const s = sv(id); const A = attState; const present = A.rows.filter((r) => r.on); if (!confirm(`Save attendance? ${present.length} sevadars get ${A.pts} points each.`)) return;
      s.att = { at: iso(now()), present: present.map((r) => r.n), pts: A.pts };
      if (present.some((r) => r.me)) { const h = { id: 'h' + uid(), title: s.title, cat: s.cat, date: s.start, role: myPoints(s).map((p) => p.text).join(', ') || 'Sevadar' }; S.history.push(h); S.pts += A.pts; S.earned += A.pts; S.notifs.unshift({ id: 'n' + uid(), level: 'done', t: `Attendance marked for ${s.title} — +${A.pts} garden points`, d: iso(now()), ref: 'history:' + h.id }); }
      S.notifs = S.notifs.filter((n) => n.ref !== 'attend:' + s.id); attState = null; save(); dtab = 'overview'; if (stack[stack.length - 2]?.v === 'seva') pop(); else { stack[stack.length - 1] = { v: 'seva', id: s.id }; render(); window.scrollTo(0, 0); } toast(`Saved — ${present.length * A.pts} points given to ${present.length} sevadars`); break;
    }
    case 'member': memberSheet(el.dataset.n); break;
    case 'invite-one': { const s = localSeva().filter(isFuture)[0]; if (s && !s.people.some((p) => p.n === el.dataset.n)) s.people.push({ n: el.dataset.n, st: 'invited' }); save(); closeSheet(); toast(`Invited ${first(el.dataset.n)} to ${s.title}`); break; }
    case 'remove-member': { const n = el.dataset.n; if (!confirm(`Remove ${n} from Delhi Central? They can ask to join again later.`)) return; S.team = S.team.filter((m) => m.n !== n); save(); closeSheet(); rerender(); toast(`${first(n)} removed`); break; }
    case 'req': { const r = S.requests.splice(+el.dataset.i, 1)[0]; if (el.dataset.v === '1') S.team.unshift({ n: r.n, joined: iso(now()), contrib: 0, last: 0 }); save(); rerender(); toast(el.dataset.v === '1' ? `${first(r.n)} joined Delhi Central 🙏` : 'Request declined'); break; }
    case 'nudge-inactive': toast(`Reminder sent to ${S.team.filter((m) => tStatus(m) === 'inactive').length} members`); break;
    case 'team-invite': teamInviteSheet(); break;
    case 'ins-attend': { const s = localSeva().find(needsAttend); if (s) push({ v: 'attend', id: s.id }); break; }
    case 'ins-invite': { const s = localSeva().filter((x) => isFuture(x) && x.cat === 'cleanup')[0] || localSeva().filter(isFuture)[0]; if (s) { push({ v: 'seva', id: s.id }); dtab = 'people'; teamFilter = 'going'; rerender(); inviteSheet(s.id); } break; }
    case 'copy-link': try { navigator.clipboard.writeText(el.dataset.l); toast('Link copied'); } catch (e) { toast('Copy not available here'); } break;
    case 'wa-invite': window.open(`https://wa.me/?text=${encodeURIComponent('Join Delhi Central on Namdhari Seva 🙏 ' + el.dataset.l)}`, '_blank', 'noopener'); break;
    case 'nb-open': { const n = S.notifs.find((x) => x.id === id); hideBanner(); if (n) { n.read = true; save(); openRef(n.ref); } break; }
    case 'live-demo': S.liveDemo = S.liveDemo === false; save(); if (S.liveDemo !== false) { liveIdx = 0; scheduleLive(4000); } toast(S.liveDemo === false ? 'Live demo updates off' : 'Live demo updates on — watch for a banner'); closeSheet(); break;
    case 'af-open': afSheet(el.dataset.k); break;
    case 'af-set': { const F = af(); const k = el.dataset.k; if (k === 'c') F.gs = GROUPS.filter((g) => g.country === el.dataset.v).map((g) => g.id); else F[k] = k === 'p' ? +el.dataset.v : el.dataset.v; save(); closeSheet(); rerender(); break; }
    case 'w-all': wDraft = new Set(); whereSheet(); break;
    case 'w-clear': wDraft = new Set(); whereSheet(); break;
    case 'w-country': { const gr = GROUPS.filter((g) => g.country === el.dataset.c).map((g) => g.id); const allOn = gr.every((id) => wDraft.has(id)); gr.forEach((id) => allOn ? wDraft.delete(id) : wDraft.add(id)); if (wDraft.size === GROUPS.length) wDraft = new Set(); whereSheet(); break; }
    case 'w-group': { const g = el.dataset.g; wDraft.has(g) ? wDraft.delete(g) : wDraft.add(g); if (wDraft.size === GROUPS.length) wDraft = new Set(); whereSheet(); break; }
    case 'w-apply': if (wTarget === 'people') S.pgs = [...wDraft]; else af().gs = [...wDraft]; wDraft = null; save(); closeSheet(); rerender(); break;
    case 'pw-open': wDraft = null; wTarget = 'people'; whereSheet(); break;
    case 'pw-reset': S.pgs = []; save(); rerender(); break;
    case 'af-reset': S.af = { p: af().p, t: 'all', gs: [] }; save(); rerender(); break;
    case 'all-alerts': allAlertsSheet(); break;
    case 'blk-done': { const b = S.adm.blockers.find((x) => x.id === id); b.st = 'resolved'; save(); rerender(); toast('Marked resolved — the lead is told'); break; }
    case 'lead-assign': leadAssignSheet(el.dataset.g); break;
    case 'lead-make': { const g = el.dataset.g, n = el.dataset.n; S.adm.leads[g] = S.adm.leads[g] || []; if (!S.adm.leads[g].includes(n)) S.adm.leads[g].push(n); save(); closeSheet(); rerender(); toast(`${first(n)} is now a team lead of ${gOf(g).name} — they've been notified`); break; }
    case 'lead-remove': { const g = el.dataset.g, n = el.dataset.n; if ((S.adm.leads[g] || []).length <= 1) { toast('Every group needs at least one team lead — assign another first'); return; } if (!confirm(`Remove ${n} as team lead of ${gOf(g).name}?`)) return; S.adm.leads[g] = S.adm.leads[g].filter((x) => x !== n); save(); closeSheet(); rerender(); toast(`${first(n)} is now a member`); break; }
    case 'adm-member': admMemberSheet(el.dataset.n, el.dataset.g); break;
    case 'compose': CP = null; push({ v: 'compose' }); break;
    case 'cp-publish': { cpSync(); if (!(CP.text || '').trim()) { toast('Write a message first'); $('#cp-text')?.focus(); return; } const p = { ...cpPost(), id: 'f' + uid(), title: CP.title || PK[CP.type].label }; S.feed.unshift(p); S.notifs.unshift({ id: 'n' + uid(), level: CP.type === 'alert' ? 'live' : 'p', t: `${PK[CP.type].label}: ${(CP.title || CP.text).slice(0, 70)}`, d: iso(now()), ref: 'tab:home' }); feedShown = FEED_PAGE; CP = null; save(); pop(); toast('Published to all members'); break; }
    case 'post-menu': openSheet(`${sheetHead('Post')}<div class="card list"><button class="lrow" data-act="post-del" data-id="${id}" style="color:var(--live)">${I.trash}<b class="small grow">Delete post</b></button></div>`); break;
    case 'post-del': if (!confirm('Delete this post for everyone?')) return; S.feed = S.feed.filter((p) => p.id !== id); save(); closeSheet(); rerender(); toast('Post deleted'); break;
    case 'more-text': { const pEl = el.previousElementSibling; pEl.classList.remove('clamp'); el.remove(); break; }
    case 'd-target': syncDraft(); draft.target = el.dataset.v; rerender(); break;
    case 'set-gender': S.gender = el.dataset.v; save(); $$('[data-act=set-gender]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === S.gender)); break;
    case 'onb-gender': S.gender = el.dataset.v; $$('[data-act=onb-gender]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === S.gender)); break;
    case 'onb-finish': { const n = ($('#onb-name')?.value || '').trim(); if (!n) { toast('Please add your name'); return; } if (!S.gender) { toast('Please choose Male or Female'); return; } S.name = n; S.onboarded = true; save(); tab = 'home'; render(); toast('Welcome to Delhi Central 🙏'); break; }
    case 'back': pop(); break;
    case 'close-sheet': closeSheet(); if (S.justPlanted) { rerender(); S.justPlanted = null; } break;
    case 'inbox': push({ v: 'inbox' }); break;
    case 'noop-up': toast('You can tick this off once the seva starts'); break;
    case 'story-close': closeStory(); break;
    case 'story-next': storyStep(1); break;
    case 'story-prev': storyStep(-1); break;
    case 'story-link': pendingRef = el.dataset.ref; closeStory(); break;
    case 'seva-view': sevaView = sevaView === 'list' ? 'cal' : 'list'; calPop = null; rerender(); break;
    case 'cal-prev': calM--; if (calM < 0) { calM = 11; calY--; } calPop = null; rerender(); break;
    case 'cal-next': calM++; if (calM > 11) { calM = 0; calY++; } calPop = null; rerender(); break;
    case 'cal-today': calY = new Date().getFullYear(); calM = new Date().getMonth(); calPop = ymd(now()); rerender(); break;
    case 'cal-close': calPop = null; rerender(); break;
    case 'respond': setSevaResponse(id, el.dataset.v); rerender(); break;
    case 'rsvp': setEventResponse(id, el.dataset.v); rerender(); break;
    case 'ptpick': {
      const s = sv(id); const p = s.points.find((x) => x.id === el.dataset.p);
      if (!going(s)) { toast('Choose Going first, then pick tasks'); return; }
      const i = p.takers.indexOf('@me');
      if (i > -1) { p.takers.splice(i, 1); delete S.mydone[p.id]; toast('Removed — your lead can see the change'); }
      else { p.takers.unshift('@me'); notify('action', `Reminder set: ${p.text} · ${relDay(s.start)} ${fmtTime(s.start)}`, 'seva:' + s.id); toast(isLive(s) ? `Thanks! ${first(s.lead)} can see you're on it` : 'Picked ✓ We\'ll remind you before the seva'); }
      save(); rerender(); break;
    }
    case 'ptdone': { S.mydone[el.dataset.p] = !S.mydone[el.dataset.p]; save(); rerender(); if (S.mydone[el.dataset.p]) toast('Task complete 🙏'); break; }
    case 'mark-complete': { const s = sv(id); const left = myPoints(s).filter((p) => !S.mydone[p.id]); left.forEach((p) => { S.mydone[p.id] = true; }); save(); dtab = 'overview'; rerender(); toast(`${left.length} task${left.length > 1 ? 's' : ''} marked complete — ${first(s.lead)} can see it 🙏`); break; }
    case 'cal': ics([sv(id)], 'seva'); break;
    case 'cal-e': ics([ev(id)], 'event'); break;
    case 'wa': window.open(`https://wa.me/?text=${encodeURIComponent(shareText('seva', sv(id)))}`, '_blank', 'noopener'); break;
    case 'wa-e': window.open(`https://wa.me/?text=${encodeURIComponent(shareText('event', ev(id)))}`, '_blank', 'noopener'); break;
    case 'lead-wa': window.open(`https://wa.me/?text=${encodeURIComponent(`Hi ${first(sv(id).lead)} ji, about ${sv(id).title}: `)}`, '_blank', 'noopener'); break;
    case 'wa-person': window.open(`https://wa.me/?text=${encodeURIComponent(`Hi ${first(el.dataset.n)} ji, `)}`, '_blank', 'noopener'); break;
    case 'notif': { const n = S.notifs.find((x) => x.id === id); n.read = true; save(); openRef(n.ref); break; }
    case 'read-all': notifsFor().forEach((n) => { n.read = true; }); save(); rerender(); break;
    case 'push': pushTest(); break;
    case 'install': install(); break;
    case 'commit': sevaSeg = 'mine'; sevaChip = 'upcoming'; sevaView = 'list'; go('seva'); break;
    case 'settings': settingsSheet(); break;
    case 'save-settings': { const n = ($('#set-name')?.value || '').trim(); if (n) S.name = n; save(); closeSheet(); rerender(); break; }
    case 'reset': if (confirm('Reset the prototype?')) { localStorage.removeItem(KEY); S = fresh(); stack = []; tab = 'home'; closeSheet(); render(); } break;
    case 'how-points': howSheet(); break;
    case 'gview': S.gview = S.gview === '3d' ? '2d' : '3d'; save(); rerender(); break;
    case 'gnight': S.gnight = !S.gnight; save(); rerender(); break;
    case 'arrange': closeSheet(); S.justPlanted = null; startArrange(); break;
    case 'ga-preview': closeSheet(); startArrange(id); break;
    case 'ga-tool': GE.tool = GE.tool === id ? null : id; GE.sel = null; rerender(); break;
    case 'ga-store': delete GE.L.cells[GE.sel]; GE.sel = null; rerender(); toast('Put away — find it in your items below'); break;
    case 'ga-desel': GE.sel = null; rerender(); break;
    case 'ga-cancel': GE = null; rerender(); break;
    case 'ga-done': if (!GE.preview) { S.layout = GE.L; save(); toast('Garden saved 🌱'); } GE = null; rerender(); break;
    case 'ga-cartkeep': { const id2 = GE.preview; const k = Object.keys(GE.ghost)[0]; if (owned(id2) + inCart(id2) >= SHOP[id2].max) { toast(`Room for ${SHOP[id2].max} in your garden`); break; } S.cart[id2] = inCart(id2) + 1; (S.reserve = S.reserve || []).push({ id: id2, k }); save(); GE = null; rerender(); toast(`Added to cart — it will go in that spot`); break; }
    case 'story-user': pendingRef = 'user:' + el.dataset.n; closeStory(); break;
    case 'sim-story': { const g = S.groups.filter((x) => x.id !== 'g-delhi').sort((a, b) => groupSeen(b) - groupSeen(a))[0]; const lead = POSTERS[g.stories[0]?.id] || 'Team lead'; g.stories.push({ id: 'sim' + uid(), d: iso(now()), poster: lead, kind: 'Just now', title: `New seva this Sunday in ${g.name}`, msg: 'Kitchen and cleaning teams need hands. Reply to your lead to join.', theme: 'langar' }); save(); closeSheet(); go('home'); toast(`${g.name} posted a new story`); break; }
    case 'g3-reset': g3 && g3.reset(); break;
    case 'why-lock': toast(`${GI[id].name}: ${lockText(id)}`); break;
    case 'cart-inc': {
      const x = SHOP[id]; if (owned(id) + inCart(id) >= x.max) { toast(`Room for ${x.max} ${GI[id].name.toLowerCase()} in your garden`); return; }
      S.cart[id] = inCart(id) + 1; save();
      if (el.dataset.sheet) cartSheet(); else if (el.dataset.close) { closeSheet(); rerender(); toast(`${GI[id].name} added to cart`); } else { rerender(); if (inCart(id) === 1) toast(`${GI[id].name} added to cart`); }
      break;
    }
    case 'cart-dec': S.cart[id] = Math.max(0, inCart(id) - 1); if (!S.cart[id]) delete S.cart[id]; save(); if (el.dataset.sheet) { cartSheet(); if (!cartQty()) rerender(); } else rerender(); break;
    case 'cart-open': cartSheet(); break;
    case 'cart-clear': S.cart = {}; save(); closeSheet(); rerender(); break;
    case 'cart-confirm': confirmSheet(); break;
    case 'cart-buy': {
      const tot = cartTotal(); if (tot > S.pts) return; const items = cartItems(); const q = cartQty();
      const L = ensureLayout(); const fresh = [];
      items.forEach((k) => { for (let n = 0; n < S.cart[k]; n++) { S.owned[k] = owned(k) + 1; const r = (S.reserve || []).findIndex((x) => x.id === k && !L.cells[x.k] && !L.paths[x.k]); let cell = r > -1 ? S.reserve.splice(r, 1)[0].k : bestCell(L, k); if (cell) { L.cells[cell] = k; fresh.push(cell); } } });
      S.reserve = []; S.pts -= tot; S.cart = {}; save(); rerender(); S.justPlanted = fresh;
      openSheet(`<div style="text-align:center;padding:8px 4px 0"><div style="font-size:46px">🌱</div><h2 style="font-size:22px;margin-top:6px">Planted in your garden!</h2><p class="small muted" style="margin-top:6px">${q} new item${q > 1 ? 's' : ''} · ${tot} points used</p>
        <div class="card" style="margin-top:14px;text-align:left"><div class="sumrow"><span class="muted">Points left</span><b>${seed(S.pts)}</b></div><div class="sumrow"><span class="muted">Your garden now</span><b>${ownedTotal()} items</b></div><div class="sumrow"><span class="muted">Grown from</span><b>${nContrib()} seva contributions</b></div></div>
        <div class="btn-row" style="margin-top:16px"><button class="btn ghost" data-act="arrange">${I.edit}Arrange</button><button class="btn" data-act="close-sheet-top">${I.garden}See my garden</button></div></div>`);
      break;
    }
    case 'close-sheet-top': closeSheet(); window.scrollTo(0, 0); render(); S.justPlanted = null; break;
    case 'sim-seva': {
      const before = SHOP_ORDER.filter(isUnlocked); const cats = ['langar', 'cleanup', 'tree', 'education', 'blanket']; const c = cats[S.history.length % 5];
      S.history.push({ id: 'h' + uid(), title: `${CAT[c].label} seva (prototype)`, cat: c, date: iso(now() - HOUR), role: 'Volunteer' }); S.pts += 3; S.earned += 3;
      notify('done', `${CAT[c].label} seva verified — +3 garden points`, 'tab:garden'); save(); rerender();
      const f = SHOP_ORDER.filter(isUnlocked).filter((x) => !before.includes(x));
      toast(f.length ? `+3 points · Unlocked: ${f.map((x) => GI[x].name).join(', ')} 🌸` : '+3 points added'); break;
    }
  }
}

// ---------- Event delegation ----------
let lastDbl = { id: null, t: 0 };
document.addEventListener('click', (e) => {
  if (e.target.closest('.sv') && !e.target.closest('[data-act]')) return;
  const cell = e.target.closest('[data-cell]'); if (cell && GE) { arrangeTap(cell.dataset.cell); return; }
  const gi = e.target.closest('[data-gi]'); if (gi) { buzz(); if (stack[stack.length - 1]?.v === 'user') toast(GI[gi.dataset.gi].name); else if (!e.target.closest('.phead')) itemSheet(gi.dataset.gi); return; }
  const t = e.target.closest('[data-act],[data-open],[data-tab],[data-seg],[data-chip],[data-story],[data-react],[data-setmode],[data-scn],[data-day],[data-dtab],[data-tf],[data-kind],[data-lchip],[data-scbg],[data-dcat],[data-tseg],[data-tfil],[data-role],[data-insp],[data-tip],[data-uview],[data-pseg],[data-pg],[data-aseg],[data-cptype]');
  if (!t || t.disabled) return;
  if (t.dataset.act) return handle(t);
  if (t.dataset.open) { buzz(); closeSheet(); openRef(t.dataset.open.includes(':') ? t.dataset.open : t.dataset.open + ':'); return; }
  if (t.dataset.tab) { buzz(); closeSheet(); go(t.dataset.tab); return; }
  if (t.dataset.story) { buzz(); openStory(t.dataset.story); return; }
  if (t.dataset.react) { const [pid, k] = t.dataset.react.split(':'); buzz(); setReact(pid, k); return; }
  if (t.dataset.seg) { sevaSeg = t.dataset.seg; sevaChip = null; calPop = null; rerender(); return; }
  if (t.dataset.chip) { sevaChip = t.dataset.chip; rerender(); return; }
  if (t.dataset.dtab) { dtab = t.dataset.dtab; const top = stack[stack.length - 1]; rerender(); if (top?.v === 'seva') { if (dtab === 'updates') S.seenUpd[top.id] = now(); if (dtab === 'tasks') S.seenTasks[top.id] = now(); save(); } return; }
  if (t.dataset.tf) { teamFilter = t.dataset.tf; rerender(); return; }
  if (t.dataset.lchip) { leadChip = t.dataset.lchip; rerender(); return; }
  if (t.dataset.scbg) { SC.bg = t.dataset.scbg; scPatch(); return; }
  if (t.dataset.dcat) { syncDraft(); const tt = draft.tasks.some((x, i) => x.t !== (TEMPLATES[draft.cat][1][i] || [])[0]); draft.cat = t.dataset.dcat; draft.title = TEMPLATES[draft.cat][0]; if (!tt) draft.tasks = TEMPLATES[draft.cat][1].map(([x, n]) => ({ t: x, n })); rerender(); return; }
  if (t.dataset.tseg) { teamSeg = t.dataset.tseg; rerender(); return; }
  if (t.dataset.tfil) { teamF = t.dataset.tfil; rerender(); return; }
  if (t.dataset.insp) { insP = t.dataset.insp; rerender(); return; }
  if (t.dataset.uview) { uview = t.dataset.uview; rerender(); return; }
  if (t.dataset.pseg) { pSeg = t.dataset.pseg; rerender(); return; }
  if (t.dataset.pg) { pG = t.dataset.pg; rerender(); return; }
  if (t.dataset.aseg) { aSeg = t.dataset.aseg; rerender(); return; }
  if (t.dataset.cptype) { cpSync(); CP.type = t.dataset.cptype; rerender(); return; }
  if (t.dataset.tip) { const card = t.closest('.ichart'); const tip = card?.querySelector('.ctip'); if (!tip) return; const r = t.getBoundingClientRect(), c = card.getBoundingClientRect(); $$('.ichart [data-tip].on').forEach((x) => x.classList.remove('on')); t.classList.add('on'); tip.textContent = t.dataset.tip; tip.hidden = false; const w = tip.offsetWidth; tip.style.left = Math.max(8, Math.min(c.width - w - 8, r.left - c.left + r.width / 2 - w / 2)) + 'px'; tip.style.top = Math.max(6, r.top - c.top - tip.offsetHeight - 6) + 'px'; buzz(); return; }
  if (t.dataset.role) { S.role = t.dataset.role; try { sessionStorage.setItem('seva-role', S.role); } catch (e) {} sevaSeg = isLead() ? 'manage' : 'mine'; leadChip = null; sevaChip = null; save(); stack = []; tab = isAdmin() ? 'stats' : 'home'; render(); window.scrollTo(0, 0); toast(isAdmin() ? 'Viewing as Super Admin · Seva HQ' : isLead() ? 'Viewing as Team Lead · Delhi Central' : 'Viewing as Member'); setTimeout(announceNew, 900); return; }
  if (t.dataset.kind) { shopKind = t.dataset.kind; rerender(); return; }
  if (t.dataset.day) { calPop = calPop === t.dataset.day ? null : t.dataset.day; buzz(); rerender(); return; }
  if (t.dataset.setmode) { S.mode = t.dataset.setmode; save(); applyTheme(); $$('[data-setmode]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.setmode === S.mode)); const y = window.scrollY; const sh = $('#sheet-root').innerHTML; render(); $('#sheet-root').innerHTML = sh; window.scrollTo(0, y); return; }
  if (t.dataset.scn) { setScenario(t.dataset.scn); stack = []; tab = 'home'; sevaChip = null; closeSheet(); render(); window.scrollTo(0, 0); toast({ new: 'New member: first day', active: 'Active: 2 seva live now', less: 'Less active: last seva 2 months ago' }[t.dataset.scn]); }
});
document.addEventListener('change', (e) => { if (e.target.id === 'cp-link') { cpSync(); const pv = $('#cp-prev'); if (pv) pv.innerHTML = postCard(cpPost()).replace(/data-react="[^"]*"/g, '').replace(/data-dbl="[^"]*"/g, ''); } });
document.addEventListener('input', (e) => {
  if (e.target.id === 'adm-q') { pQ = e.target.value; const y = window.scrollY; const pos = e.target.selectionStart; render(); window.scrollTo(0, y); const i2 = $('#adm-q'); i2.focus(); i2.setSelectionRange(pos, pos); return; }
  if (e.target.id && e.target.id.startsWith('cp-')) { cpSync(); const pv = $('#cp-prev'); if (pv) pv.innerHTML = postCard(cpPost()).replace(/data-react="[^"]*"/g, '').replace(/data-dbl="[^"]*"/g, ''); return; } if (e.target.id === 'team-q') { teamQ = e.target.value; const y = window.scrollY; const pos = e.target.selectionStart; render(); window.scrollTo(0, y); const i = $('#team-q'); i.focus(); i.setSelectionRange(pos, pos); } });
// swipe calendar
let sw = null;
document.addEventListener('touchstart', (e) => { const c = e.target.closest('#cal'); sw = c && e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null; }, { passive: true });
document.addEventListener('touchend', (e) => { if (!sw) return; const t = e.changedTouches[0]; const dx = t.clientX - sw.x, dy = t.clientY - sw.y; sw = null; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) handle({ dataset: { act: dx < 0 ? 'cal-next' : 'cal-prev' } }); }, { passive: true });
// no pinch / double-tap zoom anywhere (the 3D garden handles its own pinch)
['gesturestart', 'gesturechange', 'gestureend'].forEach((ev2) => document.addEventListener(ev2, (e) => e.preventDefault(), { passive: false }));
document.addEventListener('touchmove', (e) => { if (e.touches.length > 1 && !e.target.closest('.g3d')) e.preventDefault(); }, { passive: false });
// double-tap a feed card = gratitude (Instagram-style); elsewhere just block double-tap zoom
let lastTap = 0;
document.addEventListener('touchend', (e) => {
  const n = Date.now(); const card = e.target.closest('[data-dbl]');
  if (card && !e.target.closest('button')) { const pid = card.dataset.dbl; if (lastDbl.id === pid && n - lastDbl.t < 320) { e.preventDefault(); likeCard(card); lastDbl = { id: null, t: 0 }; } else lastDbl = { id: pid, t: n }; lastTap = n; return; }
  if (n - lastTap < 300 && !e.target.closest('input,textarea,select,button,.g3d')) e.preventDefault(); lastTap = n;
}, { passive: false });
document.addEventListener('dblclick', (e) => { const card = e.target.closest('[data-dbl]'); if (card && !e.target.closest('button')) likeCard(card); });
function likeCard(card) { burst(card); setReact(card.dataset.dbl, 'g', true); buzz(); }
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (SV) closeStory(); else if ($('#sheet-root').innerHTML) closeSheet(); else if (stack.length) pop(); } if (SV && e.key === 'ArrowRight') storyStep(1); if (SV && e.key === 'ArrowLeft') storyStep(-1); });
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); window.__dp = e; });
window.addEventListener('online', rerender); window.addEventListener('offline', rerender);
setInterval(() => { if (!$('#sheet-root').innerHTML && !SV && !SC && !['create', 'attend'].includes(stack[stack.length - 1]?.v) && S.onboarded && !document.hidden && !g3 && document.activeElement?.tagName !== 'INPUT') rerender(); }, 60000);
function deepLink() { const m = location.hash.match(/^#(seva|event)=(\w+)/); if (m && S.onboarded) { history.replaceState(null, '', location.pathname); openRef(`${m[1]}:${m[2]}`); } }
applyTheme();
$('#app').innerHTML = `<main class="screen"><div class="skel" style="height:34px;width:55%;margin-top:14px"></div><div class="row" style="margin-top:18px">${'<div class="skel" style="width:70px;height:70px;border-radius:50%"></div>'.repeat(4)}</div><div class="skel" style="height:90px;margin-top:18px"></div><div class="skel" style="height:340px;margin-top:18px"></div></main>`;
try { const r = sessionStorage.getItem('seva-role'); if (r) S.role = r; } catch (e) {} // role is per tab, so two tabs can be lead + member
S.notifs.forEach((n) => seenIds.add(n.id));
setTimeout(() => { render(); deepLink(); scheduleLive(15000); }, 200);
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
})();
