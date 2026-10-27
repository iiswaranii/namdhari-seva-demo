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
  event: { label: 'Event', ic: svg('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>') },
};

// ---------- People ----------
const NAMES = ['Harpreet Kaur', 'Gurpreet Singh', 'Simran Kaur', 'Jaspreet Singh', 'Manjit Kaur', 'Balwinder Singh', 'Navneet Kaur', 'Amrit Singh', 'Kiranjit Kaur', 'Ravinder Singh', 'Parminder Kaur', 'Tejinder Singh', 'Sukhwinder Singh', 'Rajinder Kaur', 'Hardeep Singh', 'Gurleen Kaur', 'Mandeep Singh', 'Jasleen Kaur', 'Kuldeep Singh', 'Inderjit Kaur', 'Baljit Singh', 'Prabhjot Kaur', 'Daljit Singh', 'Sandeep Kaur', 'Arjan Singh', 'Mehar Kaur', 'Ishmeet Singh', 'Noor Kaur', 'Taranjit Singh', 'Ekam Kaur'];
const LEADS = ['Gurpreet Singh', 'Simran Kaur', 'Manjit Kaur', 'Ravinder Singh', 'Harpreet Kaur', 'Balwinder Singh'];
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
  return d;
}

const KEY = 'namdhari-seva-v7';
let S;
function fresh(kind = 'active') { return { v: 7, onboarded: false, name: '', scenario: kind, mode: 'auto', gview: '2d', seen: {}, ...scenario(kind) }; }
try {
  S = JSON.parse(localStorage.getItem(KEY));
  if (!S || S.v !== 7) { const old = JSON.parse(localStorage.getItem('namdhari-seva-v6') || 'null'); S = fresh(old?.scenario || 'active'); if (old) Object.assign(S, { onboarded: old.onboarded, name: old.name, mode: old.mode, gview: old.gview }); }
} catch (e) { S = fresh(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
function setScenario(kind) { const keep = { onboarded: S.onboarded, name: S.name, mode: S.mode, gview: S.gview }; S = { ...fresh(kind), ...keep, scenario: kind }; save(); }

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
const unread = () => S.notifs.filter((n) => !n.read).length;
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
window.addEventListener('popstate', () => { if (ignorePop) { ignorePop = false; if (pendingRef) { const r = pendingRef; pendingRef = null; openRef(r); } return; } if ($('.sv')) { closeStory(true); return; } if (stack.length) { leaveDetail(); stack.pop(); closeSheet(); render(); window.scrollTo(0, scrollMem[key()] || 0); } });
function go(t) { closeSheet(); if (stack.length) { leaveDetail(); const n = stack.length; stack = []; history.go(-n); } scrollMem[key()] = window.scrollY; if (t === 'seva' && tab !== 'seva') sevaChip = null; tab = t; render(); window.scrollTo(0, scrollMem[key()] || 0); }
function leaveDetail() {} // updates and new tasks stay flagged until their tab is opened

// ---------- Render ----------
function render() {
  applyTheme(); unmount3D();
  if (!S.onboarded) return renderOnboarding();
  const top = stack[stack.length - 1];
  if (top) {
    const V = { seva: SevaDetail, event: EventDetail, history: HistoryDetail, inbox: Inbox, team: TeamScreen, journey: JourneyScreen };
    $('#app').innerHTML = `<main class="screen detail">${offline()}${V[top.v](top)}</main>`;
  } else {
    const screens = { home: Home, seva: SevaTab, garden: GardenTab, profile: Profile };
    const flush = tab === 'garden';
    $('#app').innerHTML = `<main class="screen ${flush ? 'flush' : ''}">${flush ? '' : offline()}${screens[tab]()}</main>${tab === 'garden' && cartQty() ? cartBar() : ''}${tabbar()}`;
  }
  if (!stack.length && tab === 'garden' && S.gview === '3d') mount3D();
  if (!stack.length && tab === 'home') { setupFeed(); setupLiveCarousel(); }
}
function rerender() { const y = window.scrollY; render(); window.scrollTo(0, y); }
function tabbar() {
  const live = liveMine().length; const upd = liveMine().reduce((a, s) => a + unreadUpd(s).length, 0);
  const items = [['home', 'Home', I.home, ''], ['seva', 'Seva', I.seva, live ? `<span class="livetag">LIVE</span>` : ''], ['garden', 'Garden', I.garden, S.pts >= 1 && isUnlocked('marigold') && !ownedTotal() ? '<span class="nb">!</span>' : ''], ['profile', 'Profile', I.profile, '']];
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
const groupSeen = (g) => g.stories.every((s) => S.storySeen[s.id]);
function storiesRow() {
  const gs = S.groups.slice().sort((a, b) => (b.mine ? 1 : 0) - (a.mine ? 1 : 0) || groupSeen(a) - groupSeen(b));
  return `<div class="stories" role="list" aria-label="Stories from team leads">${gs.map((g) => `<button class="story ${groupSeen(g) ? 'seen' : ''}" role="listitem" data-story="${g.id}" aria-label="${esc(g.full)} stories${groupSeen(g) ? ', seen' : ''}"><span class="ring"><span>${groupAv(g)}</span></span><b>${esc(g.name)}</b></button>`).join('')}</div>`;
}
function liveBanner(s) {
  if (!going(s)) { const here = peopleOf(s).filter((p) => p.st === 'here').length; return `<button class="livebanner tap" data-open="seva:${s.id}"><span class="art cc-${s.cat}" style="color:var(--cc)">${CAT[s.cat].ic}</span><div class="grow"><span class="livepill"><i></i>LIVE NOW</span><h3 class="ellipsis">${esc(s.title)}</h3><p class="m ellipsis">${here} sevadars here · ${openPtsN(s)} task${openPtsN(s) === 1 ? '' : 's'} need help</p></div><span class="status st-up" style="flex:none">Join</span></button>`; }
  const n = unreadUpd(s).length + newTasks(s).length; const mine = pendingMine(s).length;
  return `<button class="livebanner tap" data-open="seva:${s.id}"><span class="art cc-${s.cat}" style="color:var(--cc)">${CAT[s.cat].ic}</span><div class="grow"><span class="livepill"><i></i>LIVE NOW</span><h3 class="ellipsis">${esc(s.title)}</h3><p class="m ellipsis">${mine ? `<b class="pend">${mine} to tick</b> · ` : needsPick(s) ? '<b class="pend">Pick a task</b> · ' : 'You\'re here · '}${progress(s)}% done · ends ${fmtTime(s.end)}</p></div>${n ? `<span class="newbadge">${I.bell}${n} new</span>` : ''}${chev}</button>`;
}
function Home() {
  const live = liveHome();
  const next = !liveMine().length ? S.seva.filter((s) => isFuture(s) && going(s)).sort((a, b) => T(a.start) - T(b.start))[0] : null;
  return `<header class="apphdr">${LOGO}<h1>Namdhari Seva</h1><span class="sp"></span>${bellBtn()}</header>
    ${storiesRow()}
    ${live.length > 1 ? `<div class="lhead"><span class="livepill"><i></i>${live.length} LIVE NOW</span><span class="xs muted">Swipe to see all ${I.arrow.replace('<svg', '<svg style="width:13px;height:13px;vertical-align:-2px"')}</span></div><div class="lcar" id="lcar">${live.map(liveBanner).join('')}</div><div class="ldots" id="ldots">${live.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>` : live.map(liveBanner).join('')}
    ${next ? `<button class="livebanner tap" style="background:var(--surface);border-color:var(--border)" data-open="seva:${next.id}"><span class="art cc-${next.cat}" style="color:var(--cc);background:color-mix(in srgb,var(--cc) 14%,transparent)">${CAT[next.cat].ic}</span><div class="grow"><span class="status st-up">${I.clock}Your next seva</span><h3 class="ellipsis">${esc(next.title)}</h3><p class="m ellipsis">${relDay(next.start)} · ${fmtTime(next.start)}</p></div>${chev}</button>` : ''}
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
  alert: { label: 'Important alert', ic: I.alert, cls: '', grad: ['#FFE4E0', '#FFC2B8', '#FF9C8F'] },
  appreciation: { label: 'Appreciation', ic: I.heart, cls: '', grad: ['#E3F9C6', '#A7F0C2', '#7DE3D6'] },
  event: { label: 'Upcoming event', ic: I.cal, cls: 'light', grad: ['#7C4DFF', '#9C3FD8', '#C2389E'] },
  info: { label: 'Information', ic: I.info, cls: '', grad: ['#E0ECFF', '#CBD8FF', '#D9CCFF'] },
  seva: { label: 'Seva from HQ', ic: I.globe, cls: '', grad: ['#FFF6DB', '#FFE08A', '#FFC24D'] },
};
function postArt(p) {
  const k = PK[p.type]; const g = `pg-${p.id}`;
  const deco = {
    thought: `<circle cx="330" cy="330" r="120" fill="#FFF3D6" opacity=".7"/><circle cx="330" cy="330" r="80" fill="#FFE0A3" opacity=".8"/><circle cx="60" cy="40" r="60" fill="#fff" opacity=".25"/><path d="M0 260 Q100 230 200 260 T400 250 V300 H0Z" fill="#fff" opacity=".22"/>`,
    hukam: `<g opacity=".18" stroke="#fff" fill="none" stroke-width="1.5" transform="translate(330 70)">${[30, 52, 74, 96].map((r) => `<circle r="${r}"/>`).join('')}${Array.from({ length: 16 }, (_, i) => `<path transform="rotate(${i * 22.5})" d="M0 -30 Q12 -60 0 -96 Q-12 -60 0 -30"/>`).join('')}</g><circle cx="40" cy="280" r="90" fill="#fff" opacity=".07"/>`,
    alert: `<g opacity=".18">${Array.from({ length: 14 }, (_, i) => `<path d="M${i * 34 - 40} 0 l20 0 l-26 26 l-20 0z" fill="#B42318"/>`).join('')}</g><path d="M330 150 L390 260 H270Z" fill="#B42318" opacity=".08"/>`,
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
  const body = p.type === 'thought' ? `<p class="msg big">“${esc(p.text)}”</p>`
    : p.type === 'appreciation' ? `<p class="ttl" style="font-style:normal;font-family:var(--font);font-weight:800;font-size:44px;letter-spacing:-.03em">${esc(p.stat)}</p><p class="msg">${esc(p.text)}</p>`
    : p.type === 'event' && e ? `<div class="row" style="align-items:flex-end;gap:14px"><span class="datebox"><b>${new Date(e.start).getDate()}</b><span>${new Date(e.start).toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}</span></span><div><p class="ttl" style="margin:0">${esc(e.title)}</p><p class="small" style="opacity:.9;margin-top:4px">${relDay(e.start)} · ${fmtTime(e.start)}</p></div></div><p class="msg" style="font-size:16px">${esc(p.text)}</p>`
    : `<p class="ttl">${esc(p.title)}</p><p class="msg">${esc(p.text)}</p>`;
  const rsvp = e && S.rsvp[e.id] === 'going';
  return `<article class="post" id="post-${p.id}"><div class="ph"><span class="av">${LOGO}</span><div class="grow"><b>Namdhari Seva HQ</b><span class="adminpill">Official</span><p class="xs muted">${k.label} · ${ago(p.d)}</p></div></div>
    <div class="pcard ${k.cls}" data-dbl="${p.id}">${postArt(p)}<span class="kind">${k.ic}${p.type === 'thought' || p.type === 'appreciation' ? k.label : p.type === 'event' ? 'Upcoming event' : k.label}</span>${body}${p.link ? `<button class="cta" data-open="${p.link}">${rsvp ? `${I.check} You're going` : p.cta}${rsvp ? '' : I.arrow}</button>` : ''}</div>
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
const startIdx = (g) => { const i = g.stories.findIndex((s) => !S.storySeen[s.id]); return i < 0 ? 0 : i; };
function storyArt(s) { const h = STH[s.theme] || STH.night; return `<svg class="bgart" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="sg-${s.id}" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="${h[0]}"/><stop offset="1" stop-color="${h[1]}"/></linearGradient></defs><rect width="400" height="800" fill="url(#sg-${s.id})"/><circle cx="360" cy="120" r="160" fill="#fff" opacity=".08"/><circle cx="40" cy="700" r="200" fill="#fff" opacity=".07"/><circle cx="300" cy="620" r="60" fill="#fff" opacity=".06"/>${s.theme === 'live' ? `<circle cx="200" cy="230" r="70" fill="#fff" opacity=".1"><animate attributeName="r" values="60;90;60" dur="2s" repeatCount="indefinite"/></circle>` : ''}</svg>`; }
function faceHTML(gid, i, active) {
  const g = grp(gid); const s = g.stories[i];
  return `<div class="slide">${storyArt(s)}<span class="skind">${esc(s.kind)}</span><h2 class="sttl">${esc(s.title)}</h2><p class="smsg">${esc(s.msg)}</p></div>
    <div class="bars">${g.stories.map((x, k) => `<i class="${k < i ? 'done' : k === i && active ? 'cur' : ''}"><b></b></i>`).join('')}</div>
    <div class="top"><span class="gav">${groupAv(g)}</span><div class="who"><b>${esc(g.full)}</b> <span>${ago(s.d)}</span></div><button data-act="story-close" aria-label="Close">${I.close}</button></div>
    <p class="by">Shared by ${esc(g.full)} team leads</p>
    ${s.link ? `<button class="sbtn" data-act="story-link" data-ref="${s.link}">${esc(s.cta || 'Open')}${I.arrow}</button>` : ''}<span class="shade"></span>`;
}
function openStory(gid) {
  const order = S.groups.slice().sort((a, b) => (b.mine ? 1 : 0) - (a.mine ? 1 : 0) || groupSeen(a) - groupSeen(b)).map((g) => g.id);
  if (!SV) history.pushState({ story: 1 }, '');
  SV = { order, gi: order.indexOf(gid), i: startIdx(grp(gid)), t: null, start: 0, remain: STORY_MS, busy: false, paused: false };
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
  S.storySeen[s.id] = now(); save();
  const f = $('.sv .face[data-f="cur"]'); f.innerHTML = faceHTML(g.id, SV.i, true);
  SV.remain = STORY_MS; if (!SV.paused) storyTimer();
}
function storyTimer() { clearTimeout(SV.t); SV.start = now(); SV.t = setTimeout(() => storyStep(1), SV.remain); }
function pauseStory() { if (!SV || SV.paused) return; SV.paused = true; clearTimeout(SV.t); SV.remain = Math.max(200, SV.remain - (now() - SV.start)); $('.sv')?.classList.add('paused'); }
function resumeStory() { if (!SV || !SV.paused) return; SV.paused = false; $('.sv')?.classList.remove('paused', 'holding'); storyTimer(); }
// within a group first, then across groups
function storyStep(d) {
  if (!SV || SV.busy) return; const g = grp(SV.order[SV.gi]);
  if (d > 0 && SV.i < g.stories.length - 1) { SV.i++; showStory(); return; }
  if (d < 0 && SV.i > 0) { SV.i--; showStory(); return; }
  if (d < 0 && SV.gi === 0) { SV.remain = STORY_MS; showStory(); return; }
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
  if (!SV) return; clearTimeout(SV.t); SV = null; const el = $('.sv');
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
  return `<button class="scard tap ${live ? 'live' : ''} ${s.hq ? 'hq' : ''}" data-open="seva:${s.id}">${s.hq ? `<span class="hqrib">${I.globe}${esc(s.region)} seva · not your area</span>` : ''}${dblock(s.start, s.cat, live, s.end)}
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
  const L = sevaLists();
  if (!sevaChip) sevaChip = L.ongoing.length ? 'ongoing' : 'upcoming';
  const list = L[sevaChip];
  const chips = [['ongoing', 'Ongoing', L.ongoing.length], ['upcoming', 'Upcoming', L.upcoming.length], ['done', 'Completed', L.done.length]];
  return `<header class="apphdr"><h1 class="pagetitle" style="padding:6px 0 0">Seva</h1><span class="sp"></span><button class="iconbtn solid" data-act="seva-view" aria-label="${sevaView === 'list' ? 'Calendar view' : 'List view'}">${sevaView === 'list' ? I.cal : I.list}</button>${bellBtn()}</header>
    <div class="seg" style="margin-top:10px" role="group"><button data-seg="mine" aria-pressed="${sevaSeg === 'mine'}">My Sevas</button><button data-seg="all" aria-pressed="${sevaSeg === 'all'}">All Opportunities</button></div>
    ${sevaView === 'cal' ? calendar() : `<div class="chips fill" style="margin-top:12px">${chips.map(([k, l, n]) => `<button class="chip2" data-chip="${k}" aria-pressed="${sevaChip === k}">${k === 'ongoing' && n ? '<i class="ld"></i>' : ''}${l}<span class="n">${n}</span></button>`).join('')}</div>
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
  const s = sv(id); if (!s) return dtop('Seva') + emptyState('Seva not found', '');
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
    <div class="card list">${list.length ? list.map((p) => { const t = taskOf(p.n); return `<div class="lrow"><span class="av2 ${p.st === 'here' ? 'here' : ''}" style="background:${p.me ? 'var(--p)' : avColor(p.n)}">${initials(p.n)}</span><div class="grow"><b class="small">${esc(p.n)}${p.me ? ' (you)' : ''}</b><p class="xs muted ellipsis">${t.length ? esc(t.join(' · ')) : 'No task picked yet'}</p></div></div>`; }).join('') : '<p class="small muted" style="padding:14px 0">No one here yet.</p>'}</div>`;
}
function updatesTab(s) {
  const since = seenAt(s.id);
  return s.updates.length ? `<div class="card">${s.updates.map((u) => `<div class="upd ${T(u.d) > since ? 'new' : ''}"><span class="ic">${u.kind === 'new' ? I.plus : u.kind === 'edit' ? I.alert : I.megaphone}</span><div class="grow"><b class="small" style="display:block">${esc(u.t)}</b><span class="xs muted">${esc(u.by)} · ${ago(u.d)} ago${T(u.d) > since ? ' · <b style="color:var(--live)">New</b>' : ''}</span></div></div>`).join('')}</div>` : emptyState('No updates yet', `${first(s.lead)} will post changes and notes here. You'll get an alert.`);
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
const SLOTS = {
  tree: [[46, 176], [96, 168], [146, 174], [258, 170], [22, 206], [120, 202], [232, 196], [376, 214], [68, 238], [188, 184], [292, 224], [18, 264]],
  flower: [[164, 284], [240, 286], [128, 260], [272, 262], [96, 290], [306, 292], [206, 240], [58, 280], [344, 278], [150, 234], [256, 236], [30, 292], [374, 296], [110, 228]],
  decor: [[104, 244], [246, 216], [52, 226], [324, 252], [178, 208], [358, 238], [212, 264]],
  pet: [[150, 268], [244, 252], [90, 276], [300, 246], [194, 292]],
};
function placed() {
  const used = { tree: 0, flower: 0, decor: 0, pet: 0 }; const out = [];
  SHOP_ORDER.forEach((id) => { const n = owned(id); const c = SHOP[id].cat; for (let k = 0; k < n; k++) { if (id === 'pond') { out.push({ id, x: 330, y: 262, c }); continue; } const sl = SLOTS[c][used[c]++]; if (sl) out.push({ id, x: sl[0], y: sl[1], c, k }); } });
  return out;
}
function gardenScene(opts = {}) {
  const dk = isDark(); const items = placed().sort((a, b) => a.y - b.y); const fresh = S.justPlanted || [];
  const sc = (it) => { const base = 0.95 + (it.y - 160) / 140 * 0.8; return base * ({ tree: 1.55, flower: 1.15, decor: 1.2, pet: 1.1 }[it.c]) * (it.id === 'banyan' ? .95 : 1); };
  const draw = items.map((it, i) => {
    const inner = `<g transform="scale(${sc(it).toFixed(3)})" ${fresh.includes(it.id) ? 'class="newpop"' : ''}><ellipse cx="0" cy="1" rx="15" ry="4" fill="#000" opacity="${dk ? .25 : .1}"/>${GI[it.id].d()}</g>`;
    if (it.c === 'pet') { const dx = 36 + (i % 3) * 14, dur = 14 + (i % 4) * 3; return `<g data-gi="${it.id}" transform="translate(${it.x} ${it.y})" style="cursor:pointer"><g><animateTransform attributeName="transform" type="translate" values="0 0;${dx} 0;${dx} 0;0 0;0 0" keyTimes="0;.42;.5;.92;1" dur="${dur}s" repeatCount="indefinite"/><g><animateTransform attributeName="transform" type="scale" values="1 1;-1 1" keyTimes="0;.5" calcMode="discrete" dur="${dur}s" repeatCount="indefinite"/>${inner}</g></g></g>`; }
    return `<g data-gi="${it.id}" transform="translate(${it.x} ${it.y})" style="cursor:pointer">${inner}</g>`;
  }).join('');
  const sky = dk ? ['#141B30', '#2D2A4A', '#4A3B5C'] : ['#A8DBF5', '#D6EEF7', '#F3F6EC'];
  const stars = dk ? Array.from({ length: 28 }, (_, i) => `<circle cx="${(i * 67) % 400}" cy="${(i * 29) % 120 + 6}" r="${i % 3 ? .8 : 1.3}" fill="#fff" opacity="${.4 + (i % 4) * .15}" ${i % 5 === 0 ? 'class="glow"' : ''}/>`).join('') : '';
  const flies = dk ? Array.from({ length: 10 }, (_, i) => `<circle cx="${30 + (i * 41) % 340}" cy="${200 + (i * 23) % 90}" r="1.6" fill="#FFE98A" class="glow" style="animation-delay:-${i * .4}s"><animateTransform attributeName="transform" type="translate" values="0 0;${(i % 2 ? 8 : -8)} -6;0 0" dur="${4 + i % 3}s" repeatCount="indefinite"/></circle>`).join('') : '';
  const empty = !items.length ? `<g transform="translate(198 252)"><path d="M0 0v-26" stroke="#7A5A38" stroke-width="3"/><rect x="-30" y="-44" width="60" height="22" rx="4" fill="#C79A63"/><text x="0" y="-29" text-anchor="middle" font-size="9.5" font-weight="700" fill="#4A2F14" font-family="Inter,system-ui">Plant here!</text></g>` : '';
  return `<svg class="scene" viewBox="0 0 400 ${opts.h || 310}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Your garden with ${ownedTotal()} items">
    <defs><linearGradient id="gsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset=".6" stop-color="${sky[1]}"/><stop offset="1" stop-color="${sky[2]}"/></linearGradient>
      <linearGradient id="gmead" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${dk ? '#24331F' : '#9BD07A'}"/><stop offset="1" stop-color="${dk ? '#16211A' : '#6DB257'}"/></linearGradient>
      <radialGradient id="gsun"><stop offset="0" stop-color="${dk ? '#FFF6D8' : '#FFF4C2'}"/><stop offset="1" stop-color="${dk ? '#FFF6D8' : '#FFD86B'}" stop-opacity="0"/></radialGradient></defs>
    <rect width="400" height="320" fill="url(#gsky)"/>${stars}
    <circle cx="316" cy="${dk ? 56 : 62}" r="44" fill="url(#gsun)" opacity=".8"/><circle cx="316" cy="${dk ? 56 : 62}" r="${dk ? 15 : 19}" fill="${dk ? '#F4EFD9' : '#FFE27A'}"/>${dk ? '<circle cx="322" cy="51" r="13" fill="#2D2A4A"/>' : ''}
    <g class="drift" opacity="${dk ? .25 : .9}"><path d="M40 70a14 14 0 0 1 26-6 11 11 0 0 1 18 8H32a9 9 0 0 1 8-2z" fill="#fff"/></g><g class="drift d2" opacity="${dk ? .2 : .85}"><path d="M120 44a12 12 0 0 1 22-5 9 9 0 0 1 15 7h-44a8 8 0 0 1 7-2z" fill="#fff"/></g>
    <path d="M0 150 L50 112 L92 138 L150 96 L214 140 L262 108 L318 146 L370 118 L400 132 V190 H0Z" fill="${dk ? '#2A3048' : '#B7D3E3'}"/>
    <path d="M150 96 L164 106 L156 108 L150 102 L142 110 L138 105Z" fill="${dk ? '#3C4462' : '#fff'}" opacity=".9"/><path d="M50 112 L60 120 L52 121 L46 116Z" fill="${dk ? '#3C4462' : '#fff'}" opacity=".9"/>
    <path d="M0 168 Q60 140 130 160 T260 156 T400 160 V200 H0Z" fill="${dk ? '#22322A' : '#A9D58C'}"/>
    <rect y="172" width="400" height="150" fill="url(#gmead)"/>
    <g opacity="${dk ? .6 : .9}">${Array.from({ length: 10 }, (_, i) => `<path d="M${8 + i * 12} 186v-12M${8 + i * 12 - 2} 176l2-4 2 4" stroke="${dk ? '#8A7458' : '#F3E6CF'}" stroke-width="2" fill="none"/>`).join('')}<path d="M4 180H124M4 184H124" stroke="${dk ? '#8A7458' : '#F3E6CF'}" stroke-width="1.6"/></g>
    <path d="M168 320 C182 262 246 236 326 192 L340 192 C272 240 226 262 238 320Z" fill="${dk ? '#5B4D3C' : '#EBDDBE'}"/><path d="M190 300 l8 -3M214 276 l7 -2M246 250 l7 -3M282 226 l6 -3" stroke="${dk ? '#6E5E49' : '#D6C49D'}" stroke-width="4" stroke-linecap="round"/>
    <g><rect x="304" y="152" width="62" height="40" fill="${dk ? '#8C7C66' : '#F5E6C8'}"/><path d="M296 154 L335 122 L374 154Z" fill="${dk ? '#7A3328' : '#C9573E'}"/><rect x="352" y="126" width="8" height="16" fill="${dk ? '#5C2A22' : '#9C3E2C'}"/><rect x="327" y="168" width="14" height="24" rx="2" fill="#8A5A3B"/><rect x="345" y="162" width="14" height="11" rx="1.5" fill="${dk ? '#FFD27A' : '#A7D8F0'}" ${dk ? 'class="glow"' : ''}/><rect x="310" y="162" width="12" height="11" rx="1.5" fill="${dk ? '#FFD27A' : '#A7D8F0'}"/></g>
    ${Array.from({ length: 22 }, (_, i) => `<path class="sway s${i % 3 + 1}" d="M${(i * 37) % 400} ${196 + (i * 53) % 120}l-2 -6M${(i * 37) % 400 + 3} ${196 + (i * 53) % 120}v-7M${(i * 37) % 400 + 6} ${196 + (i * 53) % 120}l2 -6" stroke="${dk ? '#3E5A36' : '#5E9E4C'}" stroke-width="1.4" stroke-linecap="round"/>`).join('')}
    ${empty}${draw}${flies}
  </svg>`;
}
function shopCard(id) {
  const x = SHOP[id]; const ok = isUnlocked(id); const o = owned(id); const c = inCart(id); const full = o + c >= x.max;
  return `<div class="sitem ${ok ? '' : 'locked'}"><div class="art">${art(id)}${!ok ? `<div class="lockov"><span>${I.lock}${esc(lockText(id))}</span></div>` : ''}</div>${o ? `<span class="own">×${o} planted</span>` : ''}${x.sp ? '<span class="tag">SPECIAL</span>' : ''}
    <b>${GI[id].name}</b><div class="meta"><span>${KIND[x.cat].replace(/s$/, '')}</span>${seed(x.cost)}</div>
    ${!ok ? `<button class="add" style="background:var(--surface2);color:var(--muted)" data-act="why-lock" data-id="${id}">${I.lock}Locked</button>` : c ? `<div class="stepper"><button data-act="cart-dec" data-id="${id}" aria-label="Remove one">−</button><span>${c} in cart</span><button data-act="cart-inc" data-id="${id}" aria-label="Add one" ${full ? 'style="opacity:.4"' : ''}>+</button></div>` : `<button class="add" data-act="cart-inc" data-id="${id}" ${full ? 'style="opacity:.5"' : ''}>${full ? (x.max === 1 ? `${I.check}You have one` : 'Max reached') : `${I.plus}Add`}</button>`}</div>`;
}
function GardenTab() {
  const nb = nextBloom(); const is3 = S.gview === '3d';
  const list = SHOP_ORDER.filter((id) => shopKind === 'all' || SHOP[id].cat === shopKind).sort((a, b) => isUnlocked(b) - isUnlocked(a));
  return `<div class="gscene" style="margin-top:calc(-8px - var(--safe-t))">${is3 ? `<div class="g3d" id="g3d" style="border-radius:0;height:min(56vh,440px)"><div class="loading">Planting your garden…</div></div>` : `<div id="gscene-svg">${gardenScene()}</div>`}
      <div class="gt"><h1>My Garden</h1><div class="row" style="gap:8px"><button data-act="gview" aria-label="${is3 ? '2D view' : '3D view'}">${is3 ? I.image : I.cube}</button>${is3 ? `<button data-act="g3-reset" aria-label="Reset view">${I.reset}</button>` : ''}</div></div></div>
    <div class="gpanel card"><div class="row" style="justify-content:space-between"><h2 style="font-size:16px">My Garden Journey</h2><button class="link" data-act="how-points" style="min-height:30px;padding:0">How it works</button></div>
      <div class="gstats"><div><b>${nContrib()}</b><span>Contributions</span></div><div><b>${unlockedCount()}</b><span>Unlocked</span></div><div class="pts"><b>${S.pts}</b><span>Points</span></div></div></div>
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
    ${ok && owned(id) + inCart(id) < x.max ? `<button class="btn block" style="margin-top:14px" data-act="cart-inc" data-id="${id}" data-close="1">${I.cart}Add another to cart</button>` : ''}`);
}
let g3 = null;
function loadScript(src) { return new Promise((res, rej) => { if ([...document.scripts].some((s) => s.src.endsWith(src))) return res(); const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
const MAP3D = { tulips: 'marigold', cherry: 'mango', rabbit: 'cat' };
function layout3D() {
  const tiles = { '2,0': 'path', '2,1': 'path', '2,2': 'path', '2,3': 'path', '2,4': 'path', '2,5': 'path', '3,3': 'path', '4,3': 'path', '5,3': 'path' };
  const free = []; for (let y = 0; y < 6; y++) for (let x = 0; x < 6; x++) if (!tiles[`${x},${y}`]) free.push(`${x},${y}`);
  const items = {}; const order = free.map((c, i) => free[(i * 7) % free.length]).filter((c, i, a) => a.indexOf(c) === i).concat(free); const seen = {}; let k = 0;
  SHOP_ORDER.forEach((id) => { for (let n = 0; n < Math.min(owned(id), 2); n++) { const m = MAP3D[id] || id; if ((m === 'cat' || m === 'dog') && seen[m]) continue; seen[m] = 1; while (k < order.length && items[order[k]]) k++; if (k >= order.length) return; items[order[k]] = m; k++; } });
  return { tiles, items };
}
async function mount3D() {
  const host = $('#g3d'); if (!host) return;
  try { if (!window.THREE) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'); if (!window.Garden3D) await loadScript('garden3d.js'); }
  catch (e) { const l = host.querySelector('.loading'); if (l) l.textContent = '3D needs an internet connection the first time.'; return; }
  if (!document.body.contains(host)) return;
  host.querySelector('.loading')?.remove(); const L = layout3D();
  g3 = window.Garden3D.mount(host, { size: 6, tiles: L.tiles, items: L.items, dark: isDark(), onTap: (c) => { const m = L.items[c]; const id = owned(m) ? m : Object.keys(MAP3D).find((k) => MAP3D[k] === m && owned(k)) || m; if (SHOP[id]) itemSheet(id); } });
}
function unmount3D() { if (g3) { g3.destroy(); g3 = null; } }

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
  return `<div class="phead" style="margin-top:calc(-8px - var(--safe-t))">${gardenScene().replace('class="scene"', 'class="scene" style="height:190px;pointer-events:none"')}</div>
    <div class="pcardp" style="margin:-44px -16px 0;padding-left:16px;padding-right:16px"><div class="bigav">${initials(ME())}</div>
      <h1>${esc(ME())}</h1><p class="sub">${I.pin}Member · Delhi Central</p>
      <div class="pstats"><div class="pstat">${I.handshake.replace('<svg', '<svg style="color:var(--done)"')}<b>${nContrib()}</b><span>Contributions</span></div><div class="pstat">${I.leaf.replace('<svg', '<svg style="color:var(--c-tree)"')}<b>${unlockedCount()}</b><span>Unlocked</span></div><div class="pstat">${SEED}<b>${S.pts}</b><span>Points</span></div></div></div>
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
    <div class="section"><div class="section-h"><h2>Team leads</h2><span class="xs muted">${LEADS.length}</span></div><div class="card list">${LEADS.map((n, i) => `<div class="lrow"><span class="av2" style="background:${avColor(n)}">${initials(n)}</span><div class="grow"><b class="small">${n}</b><span class="leadtag">Lead</span><p class="xs muted">${['Langar & kitchen', 'Clean-ups', 'Langar & kitchen', 'Tree planting', 'Education', 'Relief'][i]}</p></div><button class="iconbtn" data-act="wa-person" data-n="${esc(n)}" aria-label="Message ${n}" style="color:#25A35A">${I.wa}</button></div>`).join('')}</div></div>
    <div class="section"><div class="section-h"><h2>Members</h2><span class="xs muted">248</span></div>
      <label class="search">${I.search}<input id="team-q" placeholder="Search members" value="${esc(teamQ)}" autocomplete="off"></label>
      <div class="card list" style="margin-top:10px" id="team-list">${all.map((m) => `<div class="lrow"><span class="av2" style="background:${m.me ? 'var(--p)' : avColor(m.n)}">${initials(m.n)}</span><div class="grow"><b class="small">${esc(m.n)}${m.me ? ' (you)' : ''}</b><p class="xs muted">${m.me ? `${nContrib()} contributions` : `${3 + (m.n.length % 9)} contributions`}</p></div></div>`).join('') || '<p class="small muted" style="padding:14px 0">No one matches.</p>'}</div>
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
  return `${dtop('Notifications', S.notifs.some((n) => !n.read) ? `<button class="link" data-act="read-all">Mark all read</button>` : '')}
    ${S.notifs.length ? `<div class="card list">${S.notifs.map((n) => `<button class="lrow" data-act="notif" data-id="${n.id}"><span class="av2" style="background:color-mix(in srgb,${col[n.level]} 14%,transparent);color:${col[n.level]}">${ic[n.level].replace('<svg', '<svg style="width:20px;height:20px"')}</span><div class="grow"><b class="small" style="font-weight:${n.read ? 500 : 700}">${esc(n.t)}</b><p class="xs muted">${ago(n.d)} ago</p></div>${n.read ? '' : '<span style="width:9px;height:9px;border-radius:50%;background:var(--p)"></span>'}</button>`).join('')}</div>` : emptyState('All quiet', 'Seva alerts and reminders appear here.')}
    <button class="btn ghost block" style="margin-top:14px" data-act="push">${I.bell}Test a phone notification</button>`;
}
function settingsSheet() {
  openSheet(`${sheetHead('App Settings')}
    <label class="f">Appearance</label><div class="seg">${[['auto', 'System'], ['light', 'Light'], ['dark', 'Dark']].map(([k, l]) => `<button data-setmode="${k}" aria-pressed="${S.mode === k}">${l}</button>`).join('')}</div>
    <label class="f">Your name</label><input class="in" id="set-name" value="${esc(S.name)}" placeholder="Your name">
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
      <div style="margin:22px -22px;overflow:hidden">${gardenScene().replace('class="scene"', 'class="scene" style="display:block;width:100%;height:auto"')}</div>
      <label class="f" for="onb-name">Your name</label><input class="in" id="onb-name" placeholder="e.g. Harpreet Kaur" autocomplete="name">
      <p class="xs muted" style="margin-top:8px">You've been invited to <b style="color:var(--ink)">Delhi Central</b>.</p></div>
    <button class="btn block" style="margin-top:20px" data-act="onb-finish">Join Delhi Central</button></div>`;
}

// ---------- Sheets ----------
function openSheet(html) { $('#sheet-root').innerHTML = `<div class="scrim" data-act="close-sheet"></div><div class="sheet" role="dialog" aria-modal="true"><div class="grabber"></div>${html}</div>`; document.body.style.overflow = 'hidden'; }
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
function openRef(ref) { const [k, v] = ref.split(':'); if (k === 'seva' || k === 'event' || k === 'history') push({ v: k, id: v }); else if (['inbox', 'team', 'journey'].includes(k)) push({ v: k }); else if (k === 'tab') go(v); }
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
    case 'onb-finish': { const n = ($('#onb-name')?.value || '').trim(); if (!n) { toast('Please add your name'); return; } S.name = n; S.onboarded = true; save(); tab = 'home'; render(); toast('Welcome to Delhi Central 🙏'); break; }
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
    case 'read-all': S.notifs.forEach((n) => { n.read = true; }); save(); rerender(); break;
    case 'push': pushTest(); break;
    case 'install': install(); break;
    case 'commit': sevaSeg = 'mine'; sevaChip = 'upcoming'; sevaView = 'list'; go('seva'); break;
    case 'settings': settingsSheet(); break;
    case 'save-settings': { const n = ($('#set-name')?.value || '').trim(); if (n) S.name = n; save(); closeSheet(); rerender(); break; }
    case 'reset': if (confirm('Reset the prototype?')) { localStorage.removeItem(KEY); S = fresh(); stack = []; tab = 'home'; closeSheet(); render(); } break;
    case 'how-points': howSheet(); break;
    case 'gview': S.gview = S.gview === '3d' ? '2d' : '3d'; save(); rerender(); break;
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
      items.forEach((k) => { S.owned[k] = owned(k) + S.cart[k]; }); S.pts -= tot; S.cart = {}; save(); rerender(); S.justPlanted = items;
      openSheet(`<div style="text-align:center;padding:8px 4px 0"><div style="font-size:46px">🌱</div><h2 style="font-size:22px;margin-top:6px">Planted in your garden!</h2><p class="small muted" style="margin-top:6px">${q} new item${q > 1 ? 's' : ''} · ${tot} points used</p>
        <div class="card" style="margin-top:14px;text-align:left"><div class="sumrow"><span class="muted">Points left</span><b>${seed(S.pts)}</b></div><div class="sumrow"><span class="muted">Your garden now</span><b>${ownedTotal()} items</b></div><div class="sumrow"><span class="muted">Grown from</span><b>${nContrib()} seva contributions</b></div></div>
        <button class="btn block" style="margin-top:16px" data-act="close-sheet-top">${I.garden}See my garden</button></div>`);
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
  const gi = e.target.closest('[data-gi]'); if (gi) { buzz(); itemSheet(gi.dataset.gi); return; }
  const t = e.target.closest('[data-act],[data-open],[data-tab],[data-seg],[data-chip],[data-story],[data-react],[data-setmode],[data-scn],[data-day],[data-dtab],[data-tf],[data-kind]');
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
  if (t.dataset.kind) { shopKind = t.dataset.kind; rerender(); return; }
  if (t.dataset.day) { calPop = calPop === t.dataset.day ? null : t.dataset.day; buzz(); rerender(); return; }
  if (t.dataset.setmode) { S.mode = t.dataset.setmode; save(); applyTheme(); $$('[data-setmode]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.setmode === S.mode)); const y = window.scrollY; const sh = $('#sheet-root').innerHTML; render(); $('#sheet-root').innerHTML = sh; window.scrollTo(0, y); return; }
  if (t.dataset.scn) { setScenario(t.dataset.scn); stack = []; tab = 'home'; sevaChip = null; closeSheet(); render(); window.scrollTo(0, 0); toast({ new: 'New member: first day', active: 'Active: 2 seva live now', less: 'Less active: last seva 2 months ago' }[t.dataset.scn]); }
});
document.addEventListener('input', (e) => { if (e.target.id === 'team-q') { teamQ = e.target.value; const y = window.scrollY; const pos = e.target.selectionStart; render(); window.scrollTo(0, y); const i = $('#team-q'); i.focus(); i.setSelectionRange(pos, pos); } });
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
setInterval(() => { if (!$('#sheet-root').innerHTML && !SV && S.onboarded && !document.hidden && !g3 && document.activeElement?.tagName !== 'INPUT') rerender(); }, 60000);
function deepLink() { const m = location.hash.match(/^#(seva|event)=(\w+)/); if (m && S.onboarded) { history.replaceState(null, '', location.pathname); openRef(`${m[1]}:${m[2]}`); } }
applyTheme();
$('#app').innerHTML = `<main class="screen"><div class="skel" style="height:34px;width:55%;margin-top:14px"></div><div class="row" style="margin-top:18px">${'<div class="skel" style="width:70px;height:70px;border-radius:50%"></div>'.repeat(4)}</div><div class="skel" style="height:90px;margin-top:18px"></div><div class="skel" style="height:340px;margin-top:18px"></div></main>`;
setTimeout(() => { render(); deepLink(); }, 200);
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
})();
