/* Namdhari Seva & Community — Member prototype v4
   Clickable prototype. No backend: sample data lives on this device. */
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
const fmtTime = (s) => new Date(s).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
const fmtLong = (s) => new Date(s).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
const relDay = (s) => {
  const a = new Date(s); a.setHours(0, 0, 0, 0); const b = new Date(); b.setHours(0, 0, 0, 0);
  const d = Math.round((a - b) / DAY);
  if (d === 0) return 'Today'; if (d === 1) return 'Tomorrow'; if (d === -1) return 'Yesterday';
  if (d > 1 && d < 7) return new Date(s).toLocaleDateString(undefined, { weekday: 'long' });
  return fmtLong(s);
};
const span = (a, b) => `${relDay(a)} · ${fmtTime(a)} – ${fmtTime(b)}`;
const dur = (ms) => { const m = Math.max(1, Math.round(ms / MIN)); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ' ' + (m % 60) + ' min' : ''}`; };
const initials = (n) => n.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
const first = (n) => n.split(' ')[0];
const uid = () => Math.random().toString(36).slice(2, 9);
const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
let toastT;
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600); }
const buzz = () => { try { navigator.vibrate && navigator.vibrate(8); } catch (e) {} };

// ---------- Icons ----------
const svg = (p, w = 1.8) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const I = {
  home: svg('<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>'),
  seva: svg('<path d="M7 11V7a2 2 0 1 1 4 0v4"/><path d="M11 10V5a2 2 0 1 1 4 0v6"/><path d="M15 9a2 2 0 1 1 4 0v5a7 7 0 0 1-7 7h-1a7 7 0 0 1-6-3.4L3 15a2 2 0 0 1 3.4-2l.6 1"/>'),
  garden: svg('<path d="M12 21v-9"/><path d="M12 12c0-4 3-7 8-7 0 5-3 7-8 7z"/><path d="M12 14c0-3-2.5-5.5-7-5.5 0 4 2.5 5.5 7 5.5z"/><path d="M5 21h14"/>'),
  community: svg('<path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z"/>'),
  profile: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
  bell: svg('<path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 0 0 4 0"/>'),
  share: svg('<path d="M12 3v13M7 8l5-5 5 5"/><path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>'),
  back: svg('<path d="M15 6l-6 6 6 6"/>', 2.2),
  chev: svg('<path d="M9 6l6 6-6 6"/>', 2),
  arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>', 2),
  close: svg('<path d="M6 6l12 12M18 6 6 18"/>', 2),
  clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  pin: svg('<path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>'),
  flag: svg('<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'),
  user: svg('<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>'),
  users: svg('<circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 4.5a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.6"/>'),
  check: svg('<path d="M5 12l5 5 9-10"/>', 2.6),
  checkc: svg('<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>', 2),
  help: svg('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 0 1 4.8 1c0 1.7-2.3 2-2.3 3.5M12 17h.01"/>', 2),
  xc: svg('<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>', 2),
  alert: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5h.01"/>', 2),
  hourglass: svg('<path d="M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9"/>'),
  cal: svg('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
  calup: svg('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4M12 13v5M9.5 15.5 12 13l2.5 2.5"/>'),
  done: svg('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4M8.5 15.5l2.5 2.5 4.5-5"/>'),
  info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/>', 2),
  sparkle: svg('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>'),
  wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.8-1.2s.2-1.1.1-1.2-.2-.2-.4-.3z"/></svg>',
  phone: svg('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'),
  download: svg('<path d="M12 4v11M7 10l5 5 5-5"/><path d="M5 20h14"/>'),
  copy: svg('<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>'),
  leaf: svg('<path d="M5 19c0-8 5-14 15-15-1 10-7 15-15 15z"/><path d="M5 19l8-8"/>'),
  lock: svg('<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
  edit: svg('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z"/>'),
  cube: svg('<path d="M12 2 3 7v10l9 5 9-5V7z"/><path d="M3 7l9 5 9-5M12 12v10"/>'),
  square: svg('<path d="M12 3 21 8 12 13 3 8z"/><path d="M3 8v8l9 5 9-5V8"/>'),
  reset: svg('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'),
  erase: svg('<path d="M20 20H8l-5-5 10-10 8 8-6 6"/><path d="M6 12l6 6"/>'),
  wifi: svg('<path d="M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0M12 19h.01"/><path d="M3 3l18 18"/>'),
};
const chev = I.chev.replace('<svg', '<svg class="chev"');
const CAT = {
  langar: { label: 'Langar', svg: '<svg viewBox="0 0 64 64"><path d="M8 30h48a24 22 0 0 1-48 0z" fill="#C9935A"/><rect x="6" y="27" width="52" height="5" rx="2.5" fill="#8C5E33"/><path d="M24 22c0-4 4-4 4-8M32 22c0-4 4-4 4-8M40 22c0-4 4-4 4-8" stroke="#B3A089" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>' },
  cleanup: { label: 'Clean-up', svg: '<svg viewBox="0 0 64 64"><path d="M14 50C14 28 30 14 52 12c0 24-14 38-36 38" fill="#5FA67E"/><path d="M14 50C24 38 34 30 46 22" stroke="#2F5A45" stroke-width="3" fill="none" stroke-linecap="round"/></svg>' },
  tree: { label: 'Tree planting', svg: '<svg viewBox="0 0 64 64"><rect x="29" y="34" width="6" height="18" rx="2" fill="#8C6A43"/><circle cx="32" cy="26" r="14" fill="#5E9470"/><circle cx="24" cy="30" r="8" fill="#7FB18E"/><path d="M14 54h36" stroke="#8C6A43" stroke-width="3" stroke-linecap="round"/></svg>' },
  education: { label: 'Education', svg: '<svg viewBox="0 0 64 64"><path d="M8 16c10-4 18-2 24 4v32c-6-6-14-8-24-4z" fill="#6E86B3"/><path d="M56 16c-10-4-18-2-24 4v32c6-6 14-8 24-4z" fill="#90A6CF"/></svg>' },
  blanket: { label: 'Relief', svg: '<svg viewBox="0 0 64 64"><rect x="10" y="18" width="44" height="30" rx="6" fill="#C9686A"/><path d="M10 28h44M10 38h44" stroke="#E9A3A4" stroke-width="3"/><path d="M22 18v30M42 18v30" stroke="#A8484B" stroke-width="2"/></svg>' },
  event: { label: 'Event', svg: '<svg viewBox="0 0 64 64"><rect x="10" y="14" width="44" height="40" rx="8" fill="#fff" stroke="#6D4FD8" stroke-width="3"/><path d="M10 26h44" stroke="#6D4FD8" stroke-width="3"/><path d="M22 9v10M42 9v10" stroke="#6D4FD8" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="40" r="6" fill="#D89B5B"/></svg>' },
  milestone: { label: 'Milestone', svg: '<svg viewBox="0 0 64 64"><g fill="#E39AA8"><circle cx="32" cy="18" r="9"/><circle cx="46" cy="28" r="9"/><circle cx="41" cy="44" r="9"/><circle cx="23" cy="44" r="9"/><circle cx="18" cy="28" r="9"/></g><circle cx="32" cy="32" r="8" fill="#F3C969"/></svg>' },
  update: { label: 'Update', svg: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="#E9A23B"/><rect x="29.5" y="18" width="5" height="18" rx="2.5" fill="#fff"/><circle cx="32" cy="44" r="3.2" fill="#fff"/></svg>' },
};
const ico = (c) => `<div class="ico">${CAT[c]?.svg || ''}</div>`;

// ---------- People ----------
const NAMES = ['Harpreet Kaur', 'Gurpreet Singh', 'Simran Kaur', 'Jaspreet Singh', 'Manjit Kaur', 'Balwinder Singh', 'Navneet Kaur', 'Amrit Singh', 'Kiranjit Kaur', 'Ravinder Singh', 'Parminder Kaur', 'Tejinder Singh', 'Sukhwinder Singh', 'Rajinder Kaur', 'Hardeep Singh', 'Gurleen Kaur', 'Mandeep Singh', 'Jasleen Kaur', 'Kuldeep Singh', 'Inderjit Kaur', 'Baljit Singh', 'Prabhjot Kaur', 'Daljit Singh', 'Sandeep Kaur', 'Arjan Singh', 'Mehar Kaur', 'Ishmeet Singh', 'Noor Kaur', 'Taranjit Singh', 'Ekam Kaur'];
function crowd(off, roles, maybe, cant, here = 0) {
  const out = []; let k = off;
  roles.forEach((r) => { for (let i = 0; i < r.filled; i++) out.push({ n: NAMES[k++ % NAMES.length], role: r.id, st: 'going' }); });
  for (let i = 0; i < maybe; i++) out.push({ n: NAMES[k++ % NAMES.length], st: 'maybe' });
  for (let i = 0; i < cant; i++) out.push({ n: NAMES[k++ % NAMES.length], st: 'cant' });
  let h = 0; out.forEach((p) => { if (p.st === 'going' && h < here) { p.st = 'here'; p.at = rel(-40 + h * 3); h++; } });
  return out;
}

// ---------- Scenario data ----------
const GROUPS = [{ id: 'delhi', name: 'Delhi Central', city: 'Delhi' }];
function baseSeva() {
  const S0 = [{ id: 'r1', name: 'Prep team', cap: 6, filled: 4 }, { id: 'r2', name: 'Dish washing', cap: 3, filled: 2 }];
  const S1 = [{ id: 'r1', name: 'Cooks', cap: 6, filled: 3 }, { id: 'r2', name: 'Servers', cap: 8, filled: 5 }, { id: 'r3', name: 'Drivers', cap: 2, filled: 2 }];
  const S2 = [{ id: 'r1', name: 'Clean-up volunteers', cap: 20, filled: 7 }, { id: 'r2', name: 'Supplies & water', cap: 2, filled: 0 }];
  const S3 = [{ id: 'r1', name: 'Planters', cap: 15, filled: 2 }, { id: 'r2', name: 'Water carriers', cap: 4, filled: 0 }];
  const S6 = [{ id: 'r1', name: 'Distribution team', cap: 10, filled: 1 }, { id: 'r2', name: 'Drivers', cap: 3, filled: 0 }];
  const S7 = [{ id: 'r1', name: 'Reading helpers', cap: 5, filled: 4 }];
  return [
    { id: 's0', title: 'Morning Langar Prep', cat: 'langar', start: rel(-45), end: rel(165), place: 'Namdhari Gurdwara, Karol Bagh', meet: 'Kitchen side entrance, ground floor', lead: 'Manjit Kaur', purpose: 'Chopping, kneading and prep for today\'s langar — about 250 sangat expected.', instructions: 'Head covered, closed shoes. Aprons and gloves provided.', created: at(-6, 9), roles: S0, people: crowd(4, S0, 1, 1, 4),
      tasks: { r1: ['Wash hands and wear an apron', 'Collect vegetables from the store room', 'Chop onions and tomatoes (2 crates)', 'Hand over to the cooks by 10:30'] },
      updates: [{ t: 'Extra 40 sangat expected — prep 2 more crates', d: rel(-30), by: 'Manjit Kaur' }, { t: 'Seva started. Please report at the kitchen side entrance.', d: rel(-45), by: 'Manjit Kaur' }] },
    { id: 's1', title: 'Sunday Langar Seva', cat: 'langar', start: at(1, 9), end: at(1, 13), place: 'Namdhari Gurdwara, Karol Bagh', meet: 'Langar hall, main door', lead: 'Gurpreet Singh', purpose: 'Prepare and serve langar for around 300 sangat after the morning diwan.', instructions: 'Arrive 15 minutes early. Head covered.', created: at(-10, 9), recur: 'Every Sunday', roles: S1, people: crowd(0, S1, 3, 2),
      tasks: { r1: ['Arrive by 8:45', 'Dal and sabzi station', 'Clean the station after service'] }, updates: [] },
    { id: 's2', title: 'Yamuna Ghat Clean-up', cat: 'cleanup', start: at(4, 7), end: at(4, 9, 30), place: 'Kudesia Ghat, Gate 2', meet: 'Gate 2 (changed from Gate 1)', lead: 'Simran Kaur', purpose: 'Clear plastic waste along 400 m of the riverbank. Gloves and bags provided.', instructions: 'Wear old clothes and closed shoes. Bring a water bottle.', created: at(-8, 9), roles: S2, people: crowd(9, S2, 4, 1),
      tasks: {}, updates: [{ t: 'Venue changed: meet at Gate 2, not Gate 1', d: rel(-120), by: 'Simran Kaur' }] },
    { id: 's3', title: 'Tree Planting Drive', cat: 'tree', start: at(9, 8), end: at(9, 11), place: 'Sanjay Van, South Delhi', meet: 'Main gate parking', lead: 'Ravinder Singh', purpose: 'Plant 120 native saplings with the forest department.', instructions: 'Tools provided. Wear a cap.', created: rel(-300), roles: S3, people: crowd(17, S3, 2, 0), tasks: {}, updates: [] },
    { id: 's6', title: 'Blanket Distribution', cat: 'blanket', start: at(12, 18), end: at(12, 20), place: 'Night shelters, Old Delhi', meet: 'Chandni Chowk metro, gate 5', lead: 'Gurpreet Singh', purpose: 'Distribute 200 blankets ahead of winter.', instructions: 'Teams of 4. Your lead will brief you at the meeting point.', created: rel(-90), roles: S6, people: crowd(21, S6, 3, 0), tasks: {}, updates: [] },
    { id: 's7', title: 'Punjabi Reading Circle for Kids', cat: 'education', start: at(6, 17), end: at(6, 18, 30), place: 'Community Hall, Karol Bagh', meet: 'Room 2', lead: 'Harpreet Kaur', purpose: 'Help children practise Gurmukhi reading in small groups.', instructions: 'Books provided.', created: at(-20, 9), recur: 'Every Saturday', roles: S7, people: crowd(24, S7, 1, 1), tasks: {}, updates: [] },
  ];
}
function baseEvents() {
  return [
    { id: 'e1', title: 'Monthly Satsang', kind: 'Satsang', start: at(6, 18), end: at(6, 20), place: 'Namdhari Gurdwara, Karol Bagh', organizer: 'Delhi Central', audience: 'Delhi Central members', agenda: ['Kirtan', 'Katha', 'Ardas', 'Langar'], going: 86, maybe: 21, cant: 9, cap: 200, linked: 's1', created: at(-12, 9), sample: 0 },
    { id: 'e2', title: 'New Volunteer Orientation', kind: 'Online session', start: at(3, 19), end: at(3, 19, 45), place: 'Online — link shared after you RSVP', organizer: 'Delhi Central', audience: 'New and returning volunteers', agenda: ['How seva works', 'Roles and safety', 'Q&A'], going: 14, maybe: 6, cant: 2, cap: 40, created: rel(-200), sample: 11 },
    { id: 'e3', title: 'Hola Mohalla Gathering', kind: 'Gathering', start: at(24, 10), end: at(24, 17), place: 'Sri Bhaini Sahib, Punjab', organizer: 'Worldwide sangat', audience: 'All members', agenda: ['Gathering', 'Seva', 'Celebration'], going: 1240, maybe: 310, cant: 45, created: at(-15, 9), sample: 5 },
  ];
}
function basePosts() {
  return [
    { id: 'p1', type: 'seva', scope: 'local', cat: 'cleanup', title: 'Karol Bagh street clean-up', city: 'Delhi', date: at(-3, 10), text: '22 volunteers cleared 18 bags of waste from 3 lanes.', r: { g: 31, a: 12, c: 9 } },
    { id: 'u1', type: 'update', scope: 'local', cat: 'update', title: 'Yamuna clean-up moved to Gate 2', city: 'Delhi', date: rel(-120), text: 'Same time, 7:00 AM Thursday. Gate 1 is closed for repairs.', link: 'seva:s2', r: { g: 3, a: 8, c: 1 } },
    { id: 'v1', type: 'event', scope: 'local', cat: 'event', title: 'Monthly Satsang this Saturday', city: 'Delhi', date: at(-1, 12), text: 'Kirtan, katha and langar. 86 sangat going so far.', link: 'event:e1', r: { g: 22, a: 14, c: 5 } },
    { id: 'm1', type: 'milestone', scope: 'local', cat: 'milestone', title: 'Delhi garden: lanterns are lit', city: 'Delhi', date: at(-2, 9), text: 'Our 40th verified seva this year lit the garden lanterns.', link: 'ggarden', r: { g: 64, a: 30, c: 41 } },
    { id: 'p2', type: 'seva', scope: 'world', cat: 'langar', title: 'Langar for 450 at Southall', city: 'London', date: at(-2, 13), text: '16 volunteers served 450 sangat in under 2 hours.', r: { g: 88, a: 40, c: 27 } },
    { id: 'v2', type: 'event', scope: 'world', cat: 'event', title: 'Hola Mohalla — RSVPs open', city: 'Sri Bhaini Sahib', date: at(-4, 9), text: 'Gathering at Sri Bhaini Sahib in 3 weeks. 1,240 going.', link: 'event:e3', r: { g: 210, a: 96, c: 120 } },
    { id: 'p5', type: 'seva', scope: 'world', cat: 'tree', title: '300 saplings planted in Toronto', city: 'Toronto', date: at(-8, 9), text: '41 volunteers, partnered with the city parks team.', r: { g: 104, a: 55, c: 38 } },
  ];
}
const PATH_TILES = { '2,0': 'path', '2,1': 'path', '2,2': 'path', '2,3': 'path', '2,4': 'path', '2,5': 'path', '3,3': 'path', '4,3': 'path', '5,3': 'path' };
function scenario(kind) {
  const d = { seva: baseSeva(), events: baseEvents(), posts: basePosts(), assign: {}, rsvp: {}, actions: [], history: [], notifs: [], checklist: {}, ggarden: 5, mine: {}, pg: { tiles: {}, items: {} } };
  if (kind === 'active') {
    d.assign = { s0: { state: 'accepted', role: 'r1' }, s1: { state: 'accepted', role: 'r1' }, s2: { state: 'accepted', role: 'r1' }, s3: { state: 'invited', role: 'r2' } };
    d.rsvp = { e1: 'going' };
    d.actions = [
      { id: 'a1', kind: 'confirm', ref: 's1', title: 'Are you still coming?', text: 'Sunday Langar Seva · tomorrow 9:00 AM · Cooks', due: at(0, 21) },
      { id: 'a2', kind: 'ack', ref: 's2', title: 'Venue changed — please acknowledge', text: 'Yamuna clean-up now meets at Gate 2', due: at(3, 21) },
      { id: 'a3', kind: 'invite', ref: 's3', title: 'Invitation: Water carriers', text: 'Tree Planting Drive · ' + fmtLong(at(9, 8)), due: at(6, 21) },
    ];
    d.history = [
      { id: 'h1', title: 'Karol Bagh street clean-up', cat: 'cleanup', date: at(-3, 10), hrs: 2.5, role: 'Clean-up volunteer', state: 'verified' },
      { id: 'h2', title: 'Punjabi Reading Circle', cat: 'education', date: at(-8, 17), hrs: 1.5, role: 'Reading helper', state: 'verified' },
      { id: 'h3', title: 'Sunday Langar Seva', cat: 'langar', date: at(-13, 9), hrs: 4, role: 'Server', state: 'verified' },
      { id: 'h4', title: 'Sunday Langar Seva', cat: 'langar', date: at(-41, 9), hrs: 4, role: 'Cook', state: 'verified' },
      { id: 'h5', title: 'Blanket Distribution', cat: 'blanket', date: at(-62, 18), hrs: 2, role: 'Distribution team', state: 'verified' },
      { id: 'h6', title: 'Tree Planting Drive', cat: 'tree', date: at(-70, 8), hrs: 3, role: 'Planter', state: 'verified' },
      { id: 'h8', title: 'Sunday Langar Seva', cat: 'langar', date: at(-83, 9), hrs: 4, role: 'Server', state: 'verified' },
    ];
    d.notifs = [
      { id: 'n1', level: 'live', t: 'Morning Langar Prep has started — you\'re on Prep team', d: rel(-45), ref: 'seva:s0' },
      { id: 'n2', level: 'action', t: 'Are you still coming to Sunday Langar Seva?', d: rel(-60), ref: 'action:a1' },
      { id: 'n3', level: 'action', t: 'Venue changed: Yamuna clean-up → Gate 2', d: rel(-120), ref: 'seva:s2' },
      { id: 'n4', level: 'seva', t: 'New seva near you: Blanket Distribution', d: rel(-90), ref: 'seva:s6' },
      { id: 'n5', level: 'done', t: 'Karol Bagh clean-up verified — thank you', d: at(-3, 18), ref: 'history:h1', read: true },
    ];
    d.pg = { tiles: { ...PATH_TILES }, items: { '0,0': 'mango', '1,0': 'marigold', '4,0': 'rose', '5,1': 'sapling', '0,2': 'sunflower', '3,1': 'lantern', '1,3': 'bench', '0,5': 'cat', '4,5': 'butterflies', '5,5': 'swing', '1,1': 'marigold', '4,2': 'rose' } };
  } else if (kind === 'less') {
    d.history = [
      { id: 'h4', title: 'Sunday Langar Seva', cat: 'langar', date: at(-68, 9), hrs: 4, role: 'Cook', state: 'verified' },
      { id: 'h6', title: 'Tree Planting Drive', cat: 'tree', date: at(-96, 8), hrs: 3, role: 'Planter', state: 'verified' },
      { id: 'h7', title: 'Karol Bagh clean-up', cat: 'cleanup', date: at(-130, 10), hrs: 2, role: 'Volunteer', state: 'verified' },
    ];
    d.notifs = [{ id: 'n4', level: 'seva', t: 'New seva near you: Blanket Distribution', d: rel(-90), ref: 'seva:s6' }];
    d.pg = { tiles: { '2,1': 'path', '2,2': 'path', '2,3': 'path', '2,4': 'path' }, items: { '1,1': 'marigold', '3,2': 'rose', '1,3': 'sapling', '3,4': 'mango', '4,1': 'butterflies' } };
  } else {
    d.notifs = [{ id: 'n0', level: 'done', t: 'Welcome to Delhi Central 🙏', d: rel(-5), ref: 'tab:seva' }];
  }
  return d;
}

const KEY = 'namdhari-seva-member-v4';
let S;
function fresh(kind = 'active') { return { v: 4, onboarded: false, name: '', group: 'delhi', minor: false, scenario: kind, mode: 'auto', accent: 'forest', gview: '2d', seen: {}, ...scenario(kind) }; }
try { S = JSON.parse(localStorage.getItem(KEY)); if (!S || S.v !== 4) S = fresh(); } catch (e) { S = fresh(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
function setScenario(kind) { const keep = { onboarded: S.onboarded, name: S.name, minor: S.minor, mode: S.mode, accent: S.accent, gview: S.gview }; S = { ...fresh(kind), ...keep, scenario: kind }; save(); }

// ---------- Derived model ----------
const ME = () => S.name || 'Member';
const grp = () => GROUPS[0];
const sv = (id) => S.seva.find((x) => x.id === id);
const ev = (id) => S.events.find((x) => x.id === id);
const roleOf = (s, a) => s.roles.find((r) => r.id === a?.role);
const going = (s) => S.assign[s.id]?.state === 'accepted';
const filledOf = (s, r) => r.filled + (going(s) && S.assign[s.id].role === r.id ? 1 : 0);
const spotsLeft = (s) => s.roles.reduce((n, r) => n + Math.max(0, r.cap - filledOf(s, r)), 0);
const isLiveTime = (x) => T(x.start) <= now() && T(x.end) > now();
const isFuture = (x) => T(x.start) > now();
const openActions = () => S.actions.filter((a) => !a.resolved);
const actionFor = (sid) => openActions().find((a) => a.ref === sid);
function myStatus(s) {
  const a = S.assign[s.id];
  if (!a || a.state === 'declined') return null;
  if (a.state === 'invited') return { key: 'invited', label: 'Invitation', tone: 'event', icon: I.sparkle };
  if (a.state === 'waitlist') return { key: 'waitlist', label: 'Waitlist', tone: 'action', icon: I.hourglass };
  if (a.state === 'maybe') return isFuture(s) ? { key: 'maybe', label: 'Maybe', tone: 'action', icon: I.help } : null;
  if (isLiveTime(s)) return { key: 'ongoing', label: 'Happening now', tone: 'live', live: true };
  if (isFuture(s)) return actionFor(s.id) ? { key: 'upcoming', label: 'Needs your reply', tone: 'action', icon: I.alert } : { key: 'upcoming', label: 'Going', tone: 'seva', icon: I.checkc };
  return null;
}
const mySeva = (k) => S.seva.filter((s) => myStatus(s)?.key === k).sort((a, b) => T(a.start) - T(b.start));
const liveMine = () => mySeva('ongoing');
const monthStart = () => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d.getTime(); };
const verified = () => S.history.filter((h) => h.state === 'verified').sort((a, b) => T(b.date) - T(a.date));
const awaiting = () => S.history.filter((h) => h.state === 'awaiting');
const completedThisMonth = () => verified().filter((h) => T(h.date) >= monthStart()).length;
const upcoming30 = () => S.seva.filter((s) => going(s) && isFuture(s) && T(s.start) < now() + 30 * DAY).sort((a, b) => T(a.start) - T(b.start));
const myEventsUpcoming = () => S.events.filter((e) => S.rsvp[e.id] === 'going' && isFuture(e)).sort((a, b) => T(a.start) - T(b.start));
const isNew = (x) => !S.seen[x.id] && x.created && now() - T(x.created) < 5 * DAY && isFuture(x);
const exploreSeva = () => S.seva.filter((s) => isFuture(s) && (!S.assign[s.id] || S.assign[s.id].state === 'declined')).sort((a, b) => (isNew(b) - isNew(a)) || T(a.start) - T(b.start));
const exploreEvents = () => S.events.filter((e) => isFuture(e) && S.rsvp[e.id] !== 'going').sort((a, b) => (isNew(b) - isNew(a)) || T(a.start) - T(b.start));
const newCount = () => S.seva.filter((s) => isNew(s) && !S.assign[s.id]).length + S.events.filter((e) => isNew(e) && !S.rsvp[e.id]).length;
const markSeen = (id) => { if (!S.seen[id]) { S.seen[id] = now(); save(); } };
const unread = () => S.notifs.filter((n) => !n.read).length;
function participation() {
  const v = verified(); const lastV = v[0];
  if (liveMine().length || upcoming30().length || (lastV && now() - T(lastV.date) < 45 * DAY)) return { key: 'active', text: 'You are contributing' };
  if (!v.length) return { key: 'new', text: 'Your seva journey starts here' };
  return { key: 'less', text: 'Ready when you are', last: lastV };
}
// People on a seva, including me
function peopleOf(s) {
  const list = s.people.map((p) => ({ ...p }));
  const a = S.assign[s.id];
  if (a && ['accepted', 'maybe', 'declined'].includes(a.state)) list.unshift({ n: ME(), me: true, role: a.state === 'accepted' ? a.role : null, st: a.state === 'accepted' ? (isLiveTime(s) ? 'here' : 'going') : a.state === 'maybe' ? 'maybe' : 'cant' });
  return list;
}
const countSt = (list, st) => list.filter((p) => p.st === st).length;

// Priority engine — deterministic ranks (V2 §4)
function priority() {
  const live = liveMine();
  if (live.length) return { kind: 'live', items: live };
  const acts = openActions().filter((a) => a.kind !== 'invite' && T(a.due) - now() < 48 * HOUR);
  if (acts.length) return { kind: 'action', items: acts };
  const soon = [...upcoming30().filter((s) => T(s.start) - now() < 72 * HOUR).map((x) => ({ t: 'seva', x })), ...myEventsUpcoming().filter((e) => T(e.start) - now() < 72 * HOUR).map((x) => ({ t: 'event', x }))].sort((a, b) => T(a.x.start) - T(b.x.start));
  if (soon.length) return { kind: 'soon', items: soon };
  const inv = openActions().filter((a) => a.kind === 'invite');
  if (inv.length) return { kind: 'invite', items: inv };
  return { kind: 'discover', items: exploreSeva().slice(0, 1) };
}

// ---------- Personal garden: items and unlocks ----------
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
  butterflies: { name: 'Butterflies', u: { cat: 'cleanup' }, desc: 'They return to clean places. Unlocked by clean-up seva.', d: () => `<ellipse cx="0" cy="-1" rx="10" ry="3" fill="#6BAA74" opacity=".45"/><g><animateTransform attributeName="transform" type="translate" values="0 0; 8 -6; -6 -10; -10 -2; 0 0" dur="6s" repeatCount="indefinite"/><g transform="translate(-6 -24)"><path class="flap" d="M-7 0c-5-6-10-2-6 3 3 3 6 0 6-3zm0 0c5-6 10-2 6 3-3 3-6 0-6-3z" fill="#B48CE0"/></g></g><g><animateTransform attributeName="transform" type="translate" values="0 0; -8 -4; 4 -8; 8 0; 0 0" dur="5s" repeatCount="indefinite"/><g transform="translate(8 -14)"><path class="flap" d="M-5 0c-4-4-8-1-5 2 2 2 5 0 5-2zm0 0c4-4 8-1 5 2-2 2-5 0-5-2z" fill="#F29A2E"/></g></g>` },
  swing: { name: 'Swing', u: { cat: 'education' }, desc: 'For the children. Unlocked by education seva.', d: () => `<path d="M-16 0l4-34M-4 0l-8-34M16 0l-4-34M4 0l8-34M-12 -34h24" stroke="#8C6A43" stroke-width="2.5" fill="none"/><g class="sway s3" style="transform-origin:50% 0%"><path d="M-4 -34v22M4 -34v22" stroke="#555" stroke-width="1.2"/><rect x="-6" y="-13" width="12" height="3" rx="1" fill="#C0392B"/></g>` },
};
const TILES = { grass: { name: 'Grass', u: { n: 0 }, desc: 'Soft ground.' }, path: { name: 'Stone path', u: { n: 0 }, desc: 'Walkways between your plants.' } };
const ITEM_ORDER = ['path', 'grass', 'marigold', 'rose', 'sunflower', 'sapling', 'bench', 'butterflies', 'swing', 'lantern', 'cat', 'mango', 'pond', 'dog', 'banyan', 'peacock'];
const itemDef = (id) => GI[id] || TILES[id];
const unlockText = (u) => u.cat ? `Do a ${CAT[u.cat].label.toLowerCase()} seva` : u.n === 0 ? 'Available from the start' : `Complete ${u.n} verified seva`;
function isUnlocked(id) { const u = itemDef(id).u; const v = verified(); return u.cat ? v.some((h) => h.cat === u.cat) : v.length >= u.n; }
const thumb = (id, cls = '') => TILES[id]
  ? `<svg viewBox="-30 -22 60 44" class="${cls}"><path d="M0 -15L26 0L0 15L-26 0Z" fill="${id === 'path' ? '#E2D2B4' : '#9EC29D'}" stroke="${id === 'path' ? '#C9B48E' : '#86AE85'}"/>${id === 'path' ? '<ellipse cx="-6" cy="-2" rx="5" ry="2.5" fill="#CDB892"/><ellipse cx="7" cy="3" rx="4" ry="2" fill="#CDB892"/>' : ''}</svg>`
  : `<svg viewBox="-34 -58 68 66" class="${cls}"><ellipse cx="0" cy="2" rx="18" ry="5" fill="#000" opacity=".08"/>${GI[id].d()}</svg>`;
const GW = 6;
const isoP = (gx, gy) => [180 + (gx - gy) * 28, 40 + (gx + gy) * 16];
function personalSVG(still) {
  const g = S.pg; let tiles = ''; const items = [];
  for (let y = 0; y < GW; y++) for (let x = 0; x < GW; x++) {
    const [cx, cy] = isoP(x, y); const k = `${x},${y}`; const t = g.tiles[k] || 'grass';
    tiles += `<path class="tile" data-cell="${k}" d="M${cx} ${cy - 16}L${cx + 28} ${cy}L${cx} ${cy + 16}L${cx - 28} ${cy}Z" fill="${t === 'path' ? '#E2D2B4' : (x + y) % 2 ? '#A6C9A5' : '#9BC19A'}" stroke="${t === 'path' ? '#CDB892' : '#89B288'}" stroke-width=".7"/>`;
    if (t === 'path') tiles += `<ellipse cx="${cx - 7}" cy="${cy - 2}" rx="5" ry="2.4" fill="#CDB892" pointer-events="none"/><ellipse cx="${cx + 8}" cy="${cy + 3}" rx="4" ry="2" fill="#CDB892" pointer-events="none"/>`;
    else if (!g.items[k] && (x * 7 + y * 3) % 4 === 0) tiles += `<g pointer-events="none" class="${still ? '' : 'sway s' + ((x + y) % 3 + 1)}"><path d="M${cx - 4} ${cy + 2}l-2 -7M${cx} ${cy + 2}v-9M${cx + 4} ${cy + 2}l2 -7" stroke="#6FA06E" stroke-width="1.6" stroke-linecap="round"/></g>`;
    const it = g.items[k];
    if (it && GI[it]) { let s = GI[it].d(); if (still) s = s.replace(/class="[^"]*"/g, '').replace(/<animateTransform[^>]*\/>/g, ''); items.push({ d: x + y, s: `<g class="gitem" data-cell="${k}" transform="translate(${cx} ${cy + 3})" style="cursor:pointer"><ellipse cx="0" cy="1" rx="16" ry="5" fill="#000" opacity=".08"/>${s}</g>` }); }
  }
  // wandering pets (2D): the placed cat/dog stroll near their square
  const [lx, ly] = isoP(0, GW - 1), [rx, ry] = isoP(GW - 1, 0), [bx, by] = isoP(GW - 1, GW - 1);
  const edge = `<path d="M${lx - 28} ${ly}L${bx} ${by + 16}L${bx} ${by + 26}L${lx - 28} ${ly + 10}Z" fill="#8A6A48"/><path d="M${bx} ${by + 16}L${rx + 28} ${ry}L${rx + 28} ${ry + 10}L${bx} ${by + 26}Z" fill="#6E5236"/>`;
  items.sort((a, b) => a.d - b.d);
  return `<svg viewBox="0 -34 360 274" role="img" aria-label="Your personal garden">${edge}${tiles}${items.map((i) => i.s).join('')}</svg>`;
}
function groupGardenSVG(level, still) {
  const P = (gx, gy) => [160 + (gx - gy) * 26, 54 + (gx + gy) * 15];
  let t = '';
  for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) { const [cx, cy] = P(x, y); const path = level >= 2 && (x === 2 || (level >= 4 && y === 2)); t += `<path d="M${cx} ${cy - 15}L${cx + 26} ${cy}L${cx} ${cy + 15}L${cx - 26} ${cy}Z" fill="${path ? '#E6D7BC' : (x + y) % 2 ? '#A9CBA8' : '#9EC29D'}" stroke="#8DB48C" stroke-width=".6"/>`; }
  const [lx, ly] = P(0, 4), [bx, by] = P(4, 4), [rx, ry] = P(4, 0);
  const edge = `<path d="M${lx - 26} ${ly}L${bx} ${by + 15}L${bx} ${by + 24}L${lx - 26} ${ly + 9}Z" fill="#8A6A48"/><path d="M${bx} ${by + 15}L${rx + 26} ${ry}L${rx + 26} ${ry + 9}L${bx} ${by + 24}Z" fill="#6E5236"/>`;
  const put = (id, gx, gy, sc = .8) => { const [x, y] = P(gx, gy); let d = GI[id].d(); if (still) d = d.replace(/class="[^"]*"/g, '').replace(/<animateTransform[^>]*\/>/g, ''); return `<g transform="translate(${x} ${y}) scale(${sc})">${d}</g>`; };
  const it = [];
  if (level >= 1) it.push(put('marigold', 0, 1), put('marigold', 1, 0));
  if (level >= 3) it.push(put('rose', 4, 1), put('sunflower', 3, 4));
  if (level >= 4) it.push(put('mango', 0, 0, .9));
  if (level >= 5) it.push(put('lantern', 3, 1), put('lantern', 1, 3));
  if (level >= 6) it.push(put('banyan', 4, 4));
  if (level >= 7) it.push(put('pond', 4, 0), put('bench', 3, 3));
  if (level >= 8) it.push(put('peacock', 1, 4));
  return `<svg viewBox="0 -14 320 210" role="img" aria-label="Community garden at level ${level} of 8">${edge}${t}${it.join('')}</svg>`;
}

// ---------- Theme ----------
const mq = window.matchMedia('(prefers-color-scheme: dark)');
const isDark = () => S.mode === 'dark' || (S.mode === 'auto' && mq.matches);
function applyTheme() {
  document.documentElement.dataset.mode = isDark() ? 'dark' : 'light';
  document.documentElement.dataset.accent = S.accent;
  $$('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', isDark() ? '#111214' : '#F4F5F7'));
}
mq.addEventListener && mq.addEventListener('change', () => { applyTheme(); if (g3) remount3D(); });

// ---------- Navigation ----------
let tab = 'home', stack = [];
const scrollMem = {};
let sevaSeg = 'explore', exploreFilter = 'all', mySevaTab = 'action', feedScope = 'local', feedType = 'all', peopleFilter = {}, gardenEdit = false, gardenTool = 'marigold';
const key = () => tab + '/' + stack.map((v) => v.v + (v.id || '')).join('/');
function push(view) { scrollMem[key()] = window.scrollY; stack.push(view); history.pushState({ d: stack.length }, ''); render(); window.scrollTo(0, 0); }
function pop() { if (stack.length) history.back(); }
window.addEventListener('popstate', () => { if (stack.length) { stack.pop(); closeSheet(); render(); window.scrollTo(0, scrollMem[key()] || 0); } });
function go(t) { closeSheet(); if (stack.length) { const n = stack.length; stack = []; history.go(-n); } scrollMem[key()] = window.scrollY; tab = t; gardenEdit = false; render(); window.scrollTo(0, scrollMem[key()] || 0); }

// ---------- Render ----------
function render() {
  applyTheme(); unmount3D();
  if (!S.onboarded) return renderOnboarding();
  const top = stack[stack.length - 1];
  if (top) {
    const V = { seva: SevaDetail, event: EventDetail, myseva: MySeva, ggarden: GroupGarden, inbox: Inbox, history: HistoryDetail };
    $('#app').innerHTML = `<main class="screen detail">${offline()}${V[top.v](top)}</main>`;
  } else {
    const screens = { home: Home, seva: SevaTab, garden: GardenTab, community: Community, profile: Profile };
    $('#app').innerHTML = `<main class="screen">${offline()}${screens[tab]()}</main>${tabbar()}`;
  }
  if (!stack.length && tab === 'garden' && S.gview === '3d') mount3D();
}
function rerender() { const y = window.scrollY; render(); window.scrollTo(0, y); }
function tabbar() {
  const n = newCount();
  const items = [['home', 'Home', I.home, 0], ['seva', 'Seva', I.seva, n], ['garden', 'Garden', I.garden, 0], ['community', 'Community', I.community, 0], ['profile', 'Profile', I.profile, 0]];
  return `<div class="tabbar"><nav aria-label="Main">${items.map(([id, l, ic, b]) => `<button data-tab="${id}" ${tab === id ? 'aria-current="page"' : ''} aria-label="${l}${b ? `, ${b} new` : ''}"><span class="tb">${ic}${b ? `<span class="nb">${b}</span>` : ''}</span>${l}</button>`).join('')}</nav></div>`;
}
const offline = () => navigator.onLine ? '' : `<div class="banner tone-action">${I.wifi}<span>Offline — showing saved information.</span></div>`;
const backHead = (title, right = '') => `<div class="dhead"><button class="iconbtn" data-act="back" aria-label="Back">${I.back}</button><span class="t">${title}</span>${right || '<span style="width:44px"></span>'}</div>`;
const chip = (st) => st ? `<span class="chip tone-${st.tone}">${st.live ? '<span class="livedot"></span>' : st.icon || ''}${st.label}</span>` : '';
const faces = (list, max = 5) => `<span class="faces">${list.slice(0, max).map((p) => `<span class="avatar" title="${p.me ? 'You' : esc(p.n)}" ${p.me ? 'style="background:var(--accent);color:var(--accent-ink)"' : ''}>${initials(p.n)}</span>`).join('')}${list.length > max ? `<span class="avatar">+${list.length - max}</span>` : ''}</span>`;

// ----- Onboarding -----
let onb = 0;
function renderOnboarding() {
  const nx = baseSeva()[1];
  $('#app').innerHTML = onb === 0 ? `<div class="onb"><div>
      <p class="muted small">You've been invited to</p><h1 style="margin-top:6px">Delhi Central</h1>
      <p class="muted" style="margin-top:6px">Namdhari Seva &amp; Community · Delhi</p>
      <div class="garden-wrap" style="margin:24px 0">${groupGardenSVG(5, true)}</div>
      <div class="card striped tone-seva"><p class="label">${I.calup}Next seva in this group</p>
        <div class="act" style="margin-top:12px">${ico(nx.cat)}<div class="grow"><h3>${nx.title}</h3><p class="l2">${relDay(nx.start)} · ${fmtTime(nx.start)} · ${nx.place}</p></div></div></div>
    </div><div style="margin-top:24px"><button class="btn block" data-act="onb-next">Join Delhi Central</button><p class="faint xs" style="text-align:center;margin-top:12px">Prototype — nothing leaves this phone.</p></div></div>`
  : `<div class="onb"><div><p class="muted small">Step 2 of 2</p><h1 style="margin-top:6px">A little about you</h1>
      <label class="f" for="onb-name">Your name</label><input class="in" id="onb-name" autocomplete="name" placeholder="e.g. Harjeet Kaur" value="${esc(S.name)}">
      <label class="f" for="onb-age">Age group</label><select class="in" id="onb-age"><option value="adult">18 or older</option><option value="minor">Under 18</option></select>
      <p class="muted xs" style="margin-top:8px">Under-18 members need a guardian's approval before joining seva.</p>
    </div><button class="btn block" data-act="onb-finish" style="margin-top:24px">Continue</button></div>`;
}

// ----- Home -----
function Home() {
  const h = new Date().getHours(); const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const pr = priority();
  return `<div class="hdr"><span class="date">${new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
      <div class="pillgroup"><button data-act="inbox" aria-label="Inbox, ${unread()} unread">${I.bell}${unread() ? '<span class="dotbadge"></span>' : ''}</button><button data-act="share" aria-label="Share my seva">${I.share}</button><button data-tab="profile" aria-label="Profile"><span class="avatar">${initials(ME())}</span></button></div></div>
    <div class="greet"><h1>${greet}, ${esc(first(ME()))}</h1><p>${I.pin}Delhi Central · Delhi</p></div>
    ${S.minor ? `<div class="banner tone-action">${I.info}<span><b>Waiting for guardian approval.</b> You can browse; joining opens once approved.</span></div>` : ''}
    ${priorityCard(pr)}${snapshot()}${nextUp(pr)}${communityMoment()}`;
}
function priorityCard(pr) {
  const more = pr.items.length > 1 ? `<button class="viewall" data-act="viewall" data-k="${pr.kind}">View all (${pr.items.length})</button>` : '';
  if (pr.kind === 'live') {
    const s = pr.items[0], r = roleOf(s, S.assign[s.id]); const ppl = peopleOf(s); const here = ppl.filter((p) => p.st === 'here');
    return `<div class="card priority tinted tone-live" role="region" aria-label="Happening now">
      <span class="label"><span class="livedot"></span>Happening now</span><h3>${esc(s.title)}</h3>
      <div class="meta"><div>${I.clock}Started ${dur(now() - T(s.start))} ago · ${dur(T(s.end) - now())} left</div><div>${I.pin}${esc(s.meet)}</div></div>
      <div class="relrow">${faces(here, 4)}<span class="grow small"><b>${here.length} here now</b> · you're on <b>${esc(r.name)}</b></span></div>
      <div class="cta"><button class="btn grow tone" data-open="seva:${s.id}">View live seva ${I.arrow}</button>${more}</div></div>`;
  }
  if (pr.kind === 'action') {
    const a = pr.items[0];
    return `<div class="card priority tinted tone-action" role="region" aria-label="Needs your action">
      <span class="label">${I.alert}Needs your reply</span><h3>${esc(a.title)}</h3>
      <div class="meta"><div>${I.cal}${esc(a.text)}</div><div>${I.clock}Please reply by ${relDay(a.due).toLowerCase()}, ${fmtTime(a.due)}</div></div>
      <div class="cta"><button class="btn grow" data-act="action" data-id="${a.id}">Reply ${I.arrow}</button>${more}</div></div>`;
  }
  if (pr.kind === 'soon') {
    const { t, x } = pr.items[0]; const r = t === 'seva' ? roleOf(x, S.assign[x.id]) : null;
    return `<div class="card priority tinted tone-${t === 'seva' ? 'seva' : 'event'}" role="region" aria-label="Coming up">
      <span class="label">${I.calup}Coming up · ${t === 'seva' ? 'Seva' : 'Event'}</span><h3>${esc(x.title)}</h3>
      <div class="meta"><div>${I.clock}${span(x.start, x.end)}</div><div>${I.pin}${esc(x.place)}</div></div>
      <div class="relrow">${I.checkc}<span>${t === 'seva' ? `You're going · <b>${esc(r.name)}</b>` : 'You\'re going'}</span></div>
      <div class="cta"><button class="btn grow" data-open="${t}:${x.id}">View details ${I.arrow}</button>${more}</div></div>`;
  }
  if (pr.kind === 'invite') {
    const a = pr.items[0];
    return `<div class="card priority tinted tone-event" role="region" aria-label="Invitation"><span class="label">${I.sparkle}Invitation</span><h3>${esc(a.title)}</h3>
      <div class="meta"><div>${I.cal}${esc(a.text)}</div></div><div class="cta"><button class="btn grow" data-act="action" data-id="${a.id}">Reply ${I.arrow}</button>${more}</div></div>`;
  }
  const s = pr.items[0]; const p = participation();
  return `<div class="card priority tinted tone-seva" role="region" aria-label="Your next opportunity"><span class="label">${I.leaf}Your next opportunity</span>
    <h3>${p.key === 'new' ? 'Your seva journey starts here' : p.key === 'less' ? 'Ready when you are' : 'Find your next seva'}</h3>
    ${s ? `<button class="relrow tap" style="border:0" data-open="seva:${s.id}">${ico(s.cat)}<span class="grow"><b class="small" style="display:block">${esc(s.title)}</b><span class="xs muted">${relDay(s.start)} · ${fmtTime(s.start)} · ${spotsLeft(s)} spots open</span></span>${chev}</button>` : ''}
    <div class="cta"><button class="btn grow" data-act="explore">${p.key === 'less' ? 'Find a seva near you' : 'Explore opportunities'} ${I.arrow}</button></div></div>`;
}
function snapshot() {
  const p = participation(); const c = completedThisMonth(), u = upcoming30().length, n = openActions().length; const lv = verified()[0];
  const tile = (k, tone, ic, label, num, st) => `<button class="tile tap tone-${tone}" data-act="myseva" data-tab="${k}" aria-label="${label}: ${num}, ${st}"><div class="top"><span class="ic">${ic}</span>${chev}</div><div class="num">${num}</div><div class="lbl">${label}</div><div class="st">${st}</div></button>`;
  return `<div class="section"><div class="section-h"><h2>My Seva</h2><span class="xs muted">${p.text}</span></div>
    <div class="mosaic">${tile('completed', 'done', I.done, 'Completed', c, 'This month')}${tile('upcoming', 'seva', I.calup, 'Upcoming', u, 'Next 30 days')}${tile('action', n ? 'action' : 'done', n ? I.alert : I.checkc, n ? 'Needs reply' : 'All clear', n, n ? 'Waiting on you' : 'Nothing pending')}</div>
    ${lv ? `<button class="minitl tap" data-open="history:${lv.id}"><span class="ln"></span><span class="grow"><span class="xs muted">${p.key === 'less' ? 'Last recorded seva' : 'Latest verified'}</span><b class="small ellipsis" style="display:block">${esc(lv.title)}</b><span class="xs muted">${fmtLong(lv.date)} · ${esc(lv.role)}</span></span><span class="chip tone-done">${I.check}Verified</span></button>` : `<div class="minitl" style="justify-content:center"><span class="xs muted">Your verified seva will appear here.</span></div>`}
    <button class="link" data-act="myseva" data-tab="${n ? 'action' : 'upcoming'}">View My Seva ${I.chev}</button></div>`;
}
function nextUp(pr) {
  const shown = new Set(); if (pr.kind === 'live') shown.add(pr.items[0].id); if (pr.kind === 'soon') shown.add(pr.items[0].x.id);
  const list = [...upcoming30().map((x) => ({ t: 'seva', x })), ...myEventsUpcoming().map((x) => ({ t: 'event', x }))].filter((i) => !shown.has(i.x.id)).sort((a, b) => T(a.x.start) - T(b.x.start));
  const it = list[0]; if (!it) return '';
  return `<div class="section"><div class="section-h"><h2>Next up</h2>${list.length > 1 ? `<button class="link" data-act="myseva" data-tab="upcoming">All ${list.length} ${I.chev}</button>` : ''}</div>${it.t === 'seva' ? sevaCard(it.x, myStatus(it.x)) : eventCard(it.x)}</div>`;
}
function communityMoment() {
  const m = S.posts.find((p) => p.type === 'milestone');
  return `<div class="section"><div class="section-h"><h2>Together this week</h2><button class="link" data-tab="community">Community ${I.chev}</button></div>
    <div class="card post"><button class="tap" style="border:0;background:none;padding:0" data-open="ggarden" aria-label="Open the Delhi community garden"><div class="garden-wrap" style="border-radius:0">${groupGardenSVG(S.ggarden)}</div></button>
    <div class="body"><span class="label tone-done">${I.leaf}Delhi garden · milestone</span><h3 style="margin-top:6px">${esc(m.title)}</h3><p class="small muted" style="margin-top:4px">${esc(m.text)}</p>${reacts(m)}</div></div></div>${installRow()}`;
}
function installRow() {
  if (matchMedia('(display-mode: standalone)').matches || navigator.standalone || sessionStorage.getItem('noinstall')) return '';
  return `<div class="section"><button class="card tap row" data-act="install"><img src="icons/icon-192.png" width="42" height="42" alt="" style="border-radius:11px"><span class="grow"><b class="small" style="display:block">Add to Home Screen</b><span class="xs muted">Opens full screen and can send reminders</span></span>${chev}</button></div>`;
}

// Cards: seva (teal stripe), live (blue tint), event (violet stripe)
function sevaCard(s, st, extra = '') {
  const a = S.assign[s.id]; const r = roleOf(s, a); const nw = isNew(s) && !a; const live = st?.key === 'ongoing';
  return `<button class="card tap ${live ? 'tinted tone-live' : 'striped tone-seva'}" data-open="seva:${s.id}"><div class="act">${ico(s.cat)}<div class="grow">
    <div class="row" style="gap:8px;align-items:flex-start"><span class="grow"><span class="typetag">${live ? 'Live seva' : 'Seva'} · ${CAT[s.cat].label}</span><h3>${esc(s.title)}</h3></span>${nw ? '<span class="newtag">NEW</span>' : ''}</div>
    <p class="l2 ellipsis">${relDay(s.start)} · ${fmtTime(s.start)} · ${esc(s.place)}</p>
    <div class="l3">${chip(st)}${r && ['accepted', 'waitlist'].includes(a.state) ? `<span class="role">${esc(r.name)}</span>` : ''}${extra}</div></div>${chev}</div></button>`;
}
function eventCard(e) {
  const nw = isNew(e) && !S.rsvp[e.id]; const r = S.rsvp[e.id];
  const st = r === 'going' ? { tone: 'event', label: 'Going', icon: I.checkc } : r === 'maybe' ? { tone: 'action', label: 'Maybe', icon: I.help } : { tone: 'event', label: e.kind, icon: I.cal };
  return `<button class="card tap striped tone-event" data-open="event:${e.id}"><div class="act"><div class="ico" style="background:var(--event-bg)">${CAT.event.svg}</div><div class="grow">
    <div class="row" style="gap:8px;align-items:flex-start"><span class="grow"><span class="typetag">Event</span><h3>${esc(e.title)}</h3></span>${nw ? '<span class="newtag">NEW</span>' : ''}</div>
    <p class="l2 ellipsis">${relDay(e.start)} · ${fmtTime(e.start)} · ${esc(e.place)}</p>
    <div class="l3">${chip(st)}<span class="role">${e.going.toLocaleString()} going</span></div></div>${chev}</div></button>`;
}

// ----- Seva tab -----
function SevaTab() {
  const n = newCount(); const nAct = openActions().length; let body = '';
  if (sevaSeg === 'explore') {
    const show = (f) => exploreFilter === 'all' || exploreFilter === f;
    const items = [...(show('seva') ? exploreSeva().map((x) => ({ t: 'seva', x })) : []), ...(show('events') ? exploreEvents().map((x) => ({ t: 'event', x })) : [])].sort((a, b) => (isNew(b.x) - isNew(a.x)) || T(a.x.start) - T(b.x.start));
    body = `<div class="fchips" style="margin-top:14px" role="group" aria-label="Type">${[['all', 'All', null], ['seva', 'Seva', 'var(--seva)'], ['events', 'Events', 'var(--event)']].map(([v, l, c]) => `<button class="fchip" data-xf="${v}" aria-pressed="${exploreFilter === v}">${c ? `<i class="sw" style="background:${c}"></i>` : ''}${l}</button>`).join('')}</div>
      <div class="stack" style="margin-top:12px">${items.map((i) => i.t === 'seva' ? sevaCard(i.x, spotsChip(i.x), `<span class="role">${countSt(peopleOf(i.x), 'going')} going</span>`) : eventCard(i.x)).join('') || emptyState('Nothing open right now', 'New seva and events from your group will appear here.')}</div>`;
  } else if (sevaSeg === 'mine') body = `<div style="margin-top:14px">${mySevaList()}</div>`;
  else body = historyList();
  return `<div class="greet" style="margin-top:12px"><h1>Seva</h1><p>Delhi Central</p></div>
    <div class="seg" role="group" aria-label="Seva sections"><button data-seg="explore" aria-pressed="${sevaSeg === 'explore'}">Explore${n ? ` <span class="count">${n}</span>` : ''}</button><button data-seg="mine" aria-pressed="${sevaSeg === 'mine'}">My Seva${nAct ? ` <span class="count n">${nAct}</span>` : ''}</button><button data-seg="history" aria-pressed="${sevaSeg === 'history'}">History</button></div>${body}`;
}
const spotsChip = (s) => { const l = spotsLeft(s); return l <= 0 ? { tone: 'action', label: 'Full · waitlist', icon: I.hourglass } : { tone: 'seva', label: `${l} spot${l > 1 ? 's' : ''} open`, icon: I.users }; };
const emptyState = (t, d, cta = '') => `<div class="empty"><svg class="big" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="28" fill="var(--surface2)"/><g transform="translate(14 12) scale(.56)">${CAT.tree.svg.replace(/<\/?svg[^>]*>/g, '')}</g></svg><b>${t}</b><p class="muted small" style="margin-top:4px">${d}</p>${cta}</div>`;
function mySevaList() {
  const maybeS = mySeva('maybe');
  const tabs = [['action', 'Needs reply', openActions().length], ['upcoming', 'Upcoming', upcoming30().length + myEventsUpcoming().length + maybeS.length], ['ongoing', 'Live now', liveMine().length], ['completed', 'Completed', verified().length + awaiting().length]];
  let list = '';
  if (mySevaTab === 'action') {
    const acts = openActions();
    list = acts.length ? acts.map(actionCard).join('') : emptyState('Nothing needs your reply', 'Invitations, confirmations and changes will show here.');
  } else if (mySevaTab === 'upcoming') {
    const items = [...upcoming30().map((x) => ({ t: 'seva', x })), ...maybeS.map((x) => ({ t: 'seva', x })), ...myEventsUpcoming().map((x) => ({ t: 'event', x })), ...S.seva.filter((s) => S.assign[s.id]?.state === 'waitlist' && isFuture(s)).map((x) => ({ t: 'seva', x }))].sort((a, b) => T(a.x.start) - T(b.x.start));
    list = items.length ? items.map((i) => i.t === 'seva' ? sevaCard(i.x, myStatus(i.x)) : eventCard(i.x)).join('') : emptyState('No upcoming commitments', 'Join a seva and it will appear here.', '<button class="btn sm" style="margin-top:12px" data-act="explore">Explore seva</button>');
  } else if (mySevaTab === 'ongoing') {
    const l = liveMine(); list = l.length ? l.map((s) => sevaCard(s, myStatus(s))).join('') : emptyState('Nothing live right now', 'When a seva you joined starts, it shows here.');
  } else {
    const all = [...awaiting(), ...verified()]; list = all.length ? all.map(histCard).join('') : emptyState('No completed seva yet', 'A seva counts as completed after your lead verifies attendance.');
  }
  return `<div class="fchips" role="group" aria-label="My Seva status">${tabs.map(([k, l, c]) => `<button class="fchip" data-mst="${k}" aria-pressed="${mySevaTab === k}">${l}${c ? ` <span class="count">${c}</span>` : ''}</button>`).join('')}</div><div class="stack" style="margin-top:12px">${list}</div>`;
}
function actionCard(a) {
  const s = sv(a.ref); const inv = a.kind === 'invite';
  return `<button class="card tap striped tone-${inv ? 'event' : 'action'}" data-act="action" data-id="${a.id}"><div class="act">${ico(s.cat)}<div class="grow"><span class="typetag">${inv ? 'Invitation' : a.kind === 'ack' ? 'Change' : 'Reply needed'}</span><h3>${esc(a.title)}</h3><p class="l2">${esc(a.text)}</p><div class="l3"><span class="chip tone-${inv ? 'event' : 'action'}">${I.clock}Due ${relDay(a.due).toLowerCase()}</span></div></div>${chev}</div></button>`;
}
function histCard(h) {
  const ok = h.state === 'verified';
  return `<button class="card tap striped tone-${ok ? 'done' : 'action'}" data-open="history:${h.id}"><div class="act">${ico(h.cat)}<div class="grow"><h3>${esc(h.title)}</h3><p class="l2">${fmtLong(h.date)} · ${h.hrs} h</p><div class="l3"><span class="chip tone-${ok ? 'done' : 'action'}">${ok ? I.checkc + 'Verified' : I.hourglass + 'Awaiting verification'}</span><span class="role">${esc(h.role)}</span></div></div>${chev}</div></button>`;
}
function historyList() {
  const all = [...awaiting(), ...verified()].sort((a, b) => T(b.date) - T(a.date));
  if (!all.length) return `<div style="margin-top:14px">${emptyState('Your history starts with your first seva', 'Each verified seva is recorded here, privately.')}</div>`;
  let lastM = '', out = '<div class="tl" style="margin-top:6px">';
  all.forEach((h) => { const m = new Date(h.date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }); if (m !== lastM) { out += `<p class="month">${m}</p>`; lastM = m; } out += `<div class="ti ${h.state === 'verified' ? '' : 'pending'}">${histCard(h)}</div>`; });
  return out + '</div>';
}
function MySeva() { return `${backHead('My Seva')}<div class="greet" style="margin-top:4px"><h1>My Seva</h1><p>${participation().text}</p></div>${mySevaList()}`; }

// ----- Response buttons -----
function respButtons(kind, id, cur, disabled) {
  const B = [['going', 'Going', I.checkc, 'done'], ['maybe', 'Maybe', I.help, 'action'], ['cant', 'Can\'t go', I.xc, 'critical']];
  return `<div class="resp" role="group" aria-label="Your response">${B.map(([v, l, ic, tone]) => `<button class="tone-${tone}" data-act="respond" data-kind="${kind}" data-id="${id}" data-v="${v}" aria-pressed="${cur === v}" ${disabled ? 'disabled' : ''}>${ic}${l}</button>`).join('')}</div>`;
}
function peopleBlock(key, list, opts = {}) {
  const sts = opts.live ? [['here', 'Here now', 'done'], ['going', 'On the way', 'seva'], ['maybe', 'Maybe', 'action']] : [['going', 'Going', 'done'], ['maybe', 'Maybe', 'action'], ['cant', 'Can\'t go', 'critical']];
  const counts = opts.counts || Object.fromEntries(sts.map(([s]) => [s, countSt(list, s)]));
  const f = peopleFilter[key] || sts[0][0];
  const shown = list.filter((p) => p.st === f);
  const extra = (opts.counts ? counts[f] - shown.length : 0);
  const roleName = (p) => p.role && opts.roles ? (opts.roles.find((r) => r.id === p.role)?.name || '') : '';
  const L = { here: ['Here', 'done', I.checkc], going: [opts.live ? 'On the way' : 'Going', opts.live ? 'seva' : 'done', I.checkc], maybe: ['Maybe', 'action', I.help], cant: ['Can\'t go', 'critical', I.xc] };
  return `<div class="stat3">${sts.map(([s, l, tone]) => `<button class="tone-${tone}" data-pf="${key}:${s}" aria-pressed="${f === s}"><b>${counts[s].toLocaleString()}</b><span>${l}</span></button>`).join('')}</div>
    <div class="card list" style="margin-top:10px">${shown.length ? shown.slice(0, 40).map((p, i) => { const [lab, tone, ic] = L[p.st]; return `<div class="lrow person ${i === 0 ? 'first' : ''}"><span class="avatar ${p.me ? 'me' : ''} ${p.st === 'here' ? 'presence' : ''}">${initials(p.n)}</span><span class="grow"><b class="small" style="display:block">${p.me ? 'You' : esc(p.n)}</b><span class="xs muted">${roleName(p) ? esc(roleName(p)) : ''}${p.st === 'here' && p.at ? `${roleName(p) ? ' · ' : ''}arrived ${fmtTime(p.at)}` : ''}</span></span><span class="chip tone-${tone}">${ic}${lab}</span></div>`; }).join('') : `<p class="small muted" style="padding:14px 0">No one yet.</p>`}
    ${extra > 0 ? `<p class="xs muted" style="padding:10px 0 12px;border-top:1px solid var(--border)">+ ${extra.toLocaleString()} more</p>` : ''}</div>`;
}

// ----- Seva detail -----
function SevaDetail({ id }) {
  const s = sv(id); if (!s) return backHead('Seva') + emptyState('This seva is no longer available', 'It may have been cancelled or moved.');
  markSeen(id);
  const a = S.assign[id]; const st = myStatus(s); const r = roleOf(s, a); const live = st?.key === 'ongoing' || (isLiveTime(s) && going(s));
  return live ? LiveDetail(s, a, r) : UpcomingDetail(s, a, r, st);
}
function LiveDetail(s, a, r) {
  const id = s.id; const ppl = peopleOf(s);
  const pct = Math.min(100, Math.max(0, (now() - T(s.start)) / (T(s.end) - T(s.start)) * 100));
  const tasks = s.tasks[a.role] || []; const done = S.checklist[id] || {}; const nd = Object.values(done).filter(Boolean).length;
  const cov = s.roles.map((ro) => { const inR = ppl.filter((p) => p.role === ro.id); const h = countSt(inR, 'here'), g = countSt(inR, 'going'); const open = Math.max(0, ro.cap - h - g); return `<div class="slot" style="display:block"><div class="row"><b class="small grow">${esc(ro.name)}</b><span class="xs muted">${h} here · ${g} on the way${open ? ` · <span class="ttext tone-action" style="color:var(--action)">${open} open</span>` : ''}</span></div><div class="cbar"><i style="width:${h / ro.cap * 100}%;background:var(--done)"></i><i style="width:${g / ro.cap * 100}%;background:var(--seva);opacity:.6"></i></div></div>`; }).join('');
  return `${backHead('Live seva', `<button class="iconbtn" data-act="wa" data-id="${id}" aria-label="Share on WhatsApp">${I.share}</button>`)}
    <div class="hero tone-live"><span class="label"><span class="livedot"></span>Happening now</span><h1>${esc(s.title)}</h1><p class="when">${esc(s.place)}</p>
      <div class="timebar"><div class="tr"><i style="width:${pct}%"></i></div><div class="tl2"><span>Started ${fmtTime(s.start)} · ${dur(now() - T(s.start))} ago</span><span>${dur(T(s.end) - now())} left</span></div></div>
      <div class="relbox">${I.user}<span class="grow small">You are on <b>${esc(r.name)}</b></span><span class="chip tone-done">${I.checkc}Marked here</span></div></div>

    <div class="section"><div class="section-h"><h2>Sangat at this seva</h2><span class="xs muted">${ppl.length} responded</span></div>${peopleBlock(id, ppl, { live: true, roles: s.roles })}</div>

    ${tasks.length ? `<div class="section"><div class="section-h"><h2>Your tasks</h2><span class="xs muted">${nd} of ${tasks.length} done</span></div><div class="card" style="padding:4px 16px"><div class="bar" style="margin:12px 0 6px"><i style="width:${nd / tasks.length * 100}%;background:var(--done)"></i></div>${tasks.map((t, i) => `<button class="check" data-act="task" data-id="${id}" data-i="${i}" aria-pressed="${!!done[i]}"><span class="box">${done[i] ? I.check : ''}</span><span class="txt small">${esc(t)}</span></button>`).join('')}</div></div>` : ''}

    <div class="section"><div class="section-h"><h2>Role coverage</h2></div><div class="card coverage">${cov}<div class="row xs muted" style="margin-top:10px;gap:14px"><span class="row" style="gap:6px"><i style="width:10px;height:10px;border-radius:3px;background:var(--done)"></i>Here</span><span class="row" style="gap:6px"><i style="width:10px;height:10px;border-radius:3px;background:var(--seva);opacity:.6"></i>On the way</span><span class="row" style="gap:6px"><i style="width:10px;height:10px;border-radius:3px;background:var(--surface2);border:1px solid var(--border)"></i>Open</span></div></div></div>

    <div class="section"><div class="section-h"><h2>Seva lead</h2></div><div class="card"><div class="row"><span class="avatar" style="width:46px;height:46px;font-size:15px">${initials(s.lead)}</span><div class="grow"><b>${esc(s.lead)}</b><p class="xs muted">Leading today · Delhi Central</p></div></div>
      <div class="btn-row" style="margin-top:12px"><button class="btn" data-act="lead-wa" data-id="${id}">${I.wa} Message lead</button><button class="btn ghost" data-act="lead-call" data-id="${id}">${I.phone} Call</button></div></div></div>

    ${s.updates.length ? `<div class="section"><div class="section-h"><h2>Live updates</h2></div><div class="card"><div class="tl" style="padding-left:22px">${s.updates.map((u) => `<div class="ti" style="margin-bottom:12px"><b class="small" style="display:block">${esc(u.t)}</b><span class="xs muted">${fmtTime(u.d)} · ${esc(u.by || s.lead)}</span></div>`).join('')}</div></div></div>` : ''}

    <div class="section"><div class="section-h"><h2>Details</h2></div><div class="card"><div class="kv">
      <div class="r">${I.pin}<div><b>${esc(s.meet)}</b><span>Meeting point · ${esc(s.place)}</span></div></div>
      <div class="r">${I.clock}<div><b>${fmtTime(s.start)} – ${fmtTime(s.end)}</b><span>Your local time (${esc(tz)})</span></div></div>
      <div class="r">${I.info}<div><b>${esc(s.purpose)}</b><span>${esc(s.instructions)}</span></div></div></div></div></div>

    <div class="demo"><p class="h">Prototype controls</p><button class="btn sm ghost" data-act="demo-end" data-id="${id}">End this seva now</button><p class="xs faint" style="margin-top:8px">Simulates the seva finishing, so you can see "Awaiting verification" and the lead's verification.</p></div>`;
}
function UpcomingDetail(s, a, r, st) {
  const id = s.id; const ppl = peopleOf(s); const act = actionFor(id);
  const cur = a ? ({ accepted: 'going', maybe: 'maybe', declined: 'cant' }[a.state] || null) : null;
  let h = `${backHead('Seva', `<button class="iconbtn" data-act="wa" data-id="${id}" aria-label="Share on WhatsApp">${I.share}</button>`)}
    <div class="hero tone-seva"><span class="label">${I.seva.replace('<svg', '<svg style="width:14px;height:14px"')}Seva · ${CAT[s.cat].label}</span><h1>${esc(s.title)}</h1><p class="when">${span(s.start, s.end)}${s.recur ? ` · ${s.recur}` : ''}</p>
      ${a && a.state !== 'declined' ? `<div class="relbox">${I.user}<span class="grow small">${a.state === 'invited' ? 'You\'re invited as' : a.state === 'waitlist' ? 'Waitlist for' : a.state === 'maybe' ? 'You said maybe' : 'You\'re going as'} ${r && a.state !== 'maybe' ? `<b>${esc(r.name)}</b>` : ''}</span>${chip(st)}</div>` : ''}</div>`;
  if (act && act.kind === 'ack') h += `<div class="section"><div class="card tinted tone-action"><span class="label">${I.alert}Change — please acknowledge</span><p class="small" style="margin-top:8px">${esc(s.updates[0]?.t || act.text)}</p><button class="btn block" style="margin-top:12px" data-act="act-yes" data-id="${act.id}">Got it</button></div></div>`;
  h += `<div class="section"><p class="resp-h">${a?.state === 'invited' ? 'You\'re invited — will you come?' : 'Will you come?'}</p>${respButtons('seva', id, cur, S.minor)}${S.minor ? '<p class="xs muted" style="margin-top:8px">Joining opens after guardian approval.</p>' : ''}</div>`;
  h += `<div class="section"><div class="section-h"><h2>Roles</h2><span class="xs muted">${spotsLeft(s)} spots open</span></div><div class="card">${s.roles.map((ro) => { const f = filledOf(s, ro); const left = ro.cap - f; const mine = going(s) && a.role === ro.id; return `<div class="slot"><div class="grow"><b class="small">${esc(ro.name)}</b><p class="xs muted">${f} of ${ro.cap} filled</p><div class="bar"><i style="width:${Math.round(f / ro.cap * 100)}%"></i></div></div>${mine ? `<span class="chip tone-done">${I.check}You</span>` : S.minor ? '' : left > 0 ? `<button class="btn sm ${going(s) ? 'ghost' : ''}" data-act="join" data-id="${id}" data-role="${ro.id}">${going(s) ? 'Switch' : 'Join'}</button>` : `<button class="btn sm ghost" data-act="waitlist" data-id="${id}" data-role="${ro.id}">Waitlist</button>`}</div>`; }).join('')}</div></div>`;
  h += `<div class="section"><div class="section-h"><h2>Who's coming</h2></div>${peopleBlock(id, ppl, { roles: s.roles })}</div>`;
  h += `<div class="section"><div class="section-h"><h2>Details</h2></div><div class="card"><div class="kv">
    <div class="r">${I.pin}<div><b>${esc(s.place)}</b><span>Meet at: ${esc(s.meet)}</span></div></div>
    <div class="r">${I.clock}<div><b>${fmtLong(s.start)}, ${fmtTime(s.start)} – ${fmtTime(s.end)}</b><span>Your local time (${esc(tz)})</span></div></div>
    <div class="r">${I.user}<div><b>${esc(s.lead)}</b><span>Seva lead</span></div></div>
    <div class="r">${I.info}<div><b>${esc(s.purpose)}</b><span>${esc(s.instructions)}</span></div></div></div>
    <div class="btn-row" style="margin-top:14px"><button class="btn soft" data-act="lead-wa" data-id="${id}">${I.wa} Message lead</button></div></div></div>`;
  if (s.updates.length) h += `<div class="section"><div class="section-h"><h2>Updates</h2></div><div class="card list">${s.updates.map((u) => `<div class="lrow"><span class="chip tone-action">${I.info}Update</span><div class="grow"><b class="small">${esc(u.t)}</b><p class="xs muted">${relDay(u.d)} · ${fmtTime(u.d)}</p></div></div>`).join('')}</div></div>`;
  h += `<div class="btn-row" style="margin-top:16px"><button class="btn soft" data-act="cal" data-id="${id}">${I.cal} Calendar</button><button class="btn soft" data-act="wa" data-id="${id}">${I.wa} WhatsApp</button></div>`;
  return h;
}
function stepsHTML(cur) {
  const L = ['Scheduled', 'In progress', 'Submitted', 'Verified'];
  return `<div class="steps" role="img" aria-label="Progress: ${cur > 3 ? 'Verified' : L[cur]}"><span class="bar2" style="width:calc((100% - 24px) * ${Math.min(cur, 3) / 3})"></span>${L.map((l, i) => `<div class="step ${i < cur ? 'done' : i === cur ? 'now' : ''}"><i>${i < cur ? I.check : ''}</i>${l}</div>`).join('')}</div>`;
}
function HistoryDetail({ id }) {
  const h = S.history.find((x) => x.id === id); if (!h) return backHead('Record') + emptyState('Record not found', '');
  const ok = h.state === 'verified';
  return `${backHead('Seva record', ok ? `<button class="iconbtn" data-act="share" data-h="${id}" aria-label="Share">${I.share}</button>` : '')}
    <div class="hero tone-${ok ? 'done' : 'action'}"><span class="label">${ok ? I.checkc + 'Verified' : I.hourglass + 'Awaiting verification'}</span><h1>${esc(h.title)}</h1><p class="when">${fmtLong(h.date)} · ${h.hrs} hours · ${esc(h.role)}</p></div>
    <div class="section"><div class="card">${stepsHTML(ok ? 4 : 2)}<p class="xs muted" style="margin-top:14px">${ok ? 'Your lead confirmed your attendance, so it counts toward Completed and your garden.' : 'Your lead marked you present. It counts as completed once they verify it.'}</p></div></div>
    ${ok ? `<button class="btn block" style="margin-top:16px" data-act="share" data-h="${id}">${I.share} Share this seva</button>` : `<div class="demo"><p class="h">Prototype controls</p><button class="btn sm ghost" data-act="demo-verify" data-id="${id}">Lead verifies attendance</button></div>`}`;
}

// ----- Event detail -----
function EventDetail({ id }) {
  const e = ev(id); if (!e) return backHead('Event') + emptyState('Event not found', '');
  markSeen(id);
  const r = S.rsvp[id]; const linked = e.linked && sv(e.linked);
  const days = Math.max(0, Math.ceil((T(e.start) - now()) / DAY));
  const ppl = [];
  if (r) ppl.push({ n: ME(), me: true, st: r === 'no' ? 'cant' : r });
  NAMES.slice(e.sample, e.sample + 12).forEach((n, i) => ppl.push({ n, st: i < 8 ? 'going' : i < 11 ? 'maybe' : 'cant' }));
  return `${backHead('Event', `<button class="iconbtn" data-act="wa-e" data-id="${id}" aria-label="Share">${I.share}</button>`)}
    <div class="hero tone-event"><span class="label">${I.cal}Event · ${esc(e.kind)}</span><h1>${esc(e.title)}</h1><p class="when">${span(e.start, e.end)}</p>
      <div class="relbox">${I.clock}<span class="grow small"><b>${days} day${days === 1 ? '' : 's'}</b> to go</span>${r === 'going' ? `<span class="chip tone-event">${I.checkc}You're going</span>` : r === 'maybe' ? `<span class="chip tone-action">${I.help}Maybe</span>` : ''}</div></div>
    <div class="section"><p class="resp-h">Will you come?</p>${respButtons('event', id, r === 'no' ? 'cant' : r)}</div>
    <div class="section"><div class="section-h"><h2>Who's going</h2></div>${peopleBlock(id, ppl, { counts: { going: e.going, maybe: e.maybe, cant: e.cant } })}</div>
    <div class="section"><div class="section-h"><h2>Details</h2></div><div class="card"><div class="kv">
      <div class="r">${I.pin}<div><b>${esc(e.place)}</b><span>Venue</span></div></div>
      <div class="r">${I.clock}<div><b>${fmtLong(e.start)}, ${fmtTime(e.start)} – ${fmtTime(e.end)}</b><span>Your local time (${esc(tz)})</span></div></div>
      <div class="r">${I.users}<div><b>${esc(e.audience)}</b><span>${e.cap ? `Capacity ${e.cap}` : 'Open to all'}</span></div></div>
      <div class="r">${I.user}<div><b>${esc(e.organizer)}</b><span>Organizer</span></div></div></div></div></div>
    <div class="section"><div class="section-h"><h2>Agenda</h2></div><div class="card list">${e.agenda.map((x, i) => `<div class="lrow"><span class="avatar" style="width:30px;height:30px;font-size:12px;background:var(--event-bg);color:var(--event)">${i + 1}</span><b class="small">${esc(x)}</b></div>`).join('')}</div></div>
    ${linked ? `<div class="section"><div class="section-h"><h2>Volunteer at this event</h2></div>${sevaCard(linked, myStatus(linked) || spotsChip(linked))}</div>` : ''}
    <div class="btn-row" style="margin-top:16px"><button class="btn soft" data-act="cal-e" data-id="${id}">${I.cal} Calendar</button><button class="btn soft" data-act="wa-e" data-id="${id}">${I.wa} Share</button></div>
    <p class="xs muted" style="margin-top:10px">Events are separate from seva and don't count toward completed seva.</p>`;
}

// ----- Garden tab (personal) -----
function GardenTab() {
  const v = verified().length; const un = ITEM_ORDER.filter(isUnlocked); const locked = ITEM_ORDER.filter((x) => !isUnlocked(x));
  const nextL = locked.filter((x) => itemDef(x).u.n).sort((a, b) => itemDef(a).u.n - itemDef(b).u.n)[0];
  const is3 = S.gview === '3d';
  return `<div class="greet" style="margin-top:12px"><h1>My garden</h1><p>${I.lock.replace('<svg', '<svg style="width:14px;height:14px"')}Private · grows with every verified seva</p></div>
    <div class="seg" role="group" aria-label="View"><button data-gv="2d" aria-pressed="${!is3}">${I.square} 2D</button><button data-gv="3d" aria-pressed="${is3}">${I.cube} 3D</button></div>
    <div style="margin-top:12px">${is3
      ? `<div class="g3d" id="g3d"><div class="loading">Planting your garden…</div><div class="tools"><button data-act="g3-reset" aria-label="Reset view">${I.reset}</button></div><span class="hint" id="g3hint">Drag to turn · pinch to zoom · tap a plant</span></div>`
      : `<div class="garden-wrap ${gardenEdit ? 'editing' : ''}" id="pgarden">${personalSVG(false)}</div>`}</div>
    ${!v && !Object.keys(S.pg.items).length ? `<p class="small muted" style="margin-top:10px;text-align:center">Your garden starts with your first verified seva. Paths and grass are ready for you now.</p>` : ''}
    ${gardenEdit ? `<p class="small muted" style="margin:12px 2px 6px">Pick something, then tap a square to place it.</p>
      <div class="tray" role="toolbar" aria-label="Garden pieces">${ITEM_ORDER.map((id) => { const ok = isUnlocked(id); return `<button class="titem ${ok ? '' : 'locked'}" data-tool="${id}" aria-pressed="${gardenTool === id}" aria-label="${itemDef(id).name}${ok ? '' : ', locked'}">${ok ? '' : I.lock.replace('<svg', '<svg class="lk"')}${thumb(id)}${itemDef(id).name.split(' ')[0]}</button>`; }).join('')}<button class="titem" data-tool="erase" aria-pressed="${gardenTool === 'erase'}">${I.erase.replace('<svg', '<svg style="width:40px;height:40px;color:var(--muted)"')}Remove</button></div>
      <button class="btn block" style="margin-top:6px" data-act="garden-done">Done</button>`
    : `<div class="btn-row" style="margin-top:12px">${is3 ? `<button class="btn ghost" data-gv="2d">${I.edit} Design in 2D</button>` : `<button class="btn" data-act="garden-edit">${I.edit} Design my garden</button>`}</div>`}
    <div class="section"><div class="section-h"><h2>Unlocks</h2><span class="xs muted">${un.length} of ${ITEM_ORDER.length}</span></div>
      ${nextL ? `<div class="card tinted tone-done" style="margin-bottom:10px"><div class="row">${thumb(nextL, 'thumb').replace('<svg', '<svg style="width:52px;height:52px"')}<div class="grow"><span class="label">Next unlock</span><b style="display:block">${itemDef(nextL).name}</b><span class="xs muted">${v} of ${itemDef(nextL).u.n} verified seva</span><div class="bar"><i style="width:${Math.min(100, v / itemDef(nextL).u.n * 100)}%;background:var(--done)"></i></div></div></div></div>` : ''}
      <div class="card list unlock">${ITEM_ORDER.filter((x) => GI[x]).map((id) => { const ok = isUnlocked(id); return `<div class="lrow">${thumb(id, 'thumb')}<div class="grow"><b class="small">${GI[id].name}</b><p class="xs muted">${ok ? 'Unlocked · ' : ''}${unlockText(GI[id].u)}</p></div>${ok ? `<span class="chip tone-done">${I.check}Yours</span>` : `<span class="chip neutral">${I.lock}Locked</span>`}</div>`; }).join('')}</div>
      <button class="btn soft block" style="margin-top:10px" data-act="sim-seva">Prototype: pretend I finished a seva</button>
      <p class="xs muted" style="margin-top:8px">Only you can see your garden. It never wilts — no streaks, no rankings.</p></div>`;
}
function itemSheet(cell) {
  const id = S.pg.items[cell]; if (!id) return; const d = GI[id];
  openSheet(`${sheetHead(d.name, 'My garden')}<div class="item-hero"><svg viewBox="-36 -62 72 70">${d.d()}</svg></div>
    <p class="small" style="margin-top:14px">${esc(d.desc)}</p>
    <div class="card" style="margin-top:12px"><p class="xs muted">How you unlocked it</p><b class="small">${unlockText(d.u)}</b></div>
    <div class="btn-row" style="margin-top:16px"><button class="btn ghost" data-act="garden-edit-from-sheet">${I.edit} Move or change</button>${S.gview === '3d' ? '' : `<button class="btn" data-act="see3d" data-cell="${cell}">${I.cube} See in 3D</button>`}</div>`);
}

// 3D garden (lazy-loaded engine)
let g3 = null, g3focus = null;
function loadScript(src) { return new Promise((res, rej) => { if ([...document.scripts].some((s) => s.src.endsWith(src))) return res(); const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
async function mount3D() {
  const host = $('#g3d'); if (!host) return;
  try { if (!window.THREE) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'); if (!window.Garden3D) await loadScript('garden3d.js'); }
  catch (e) { const l = host.querySelector('.loading'); if (l) l.textContent = '3D needs an internet connection the first time.'; return; }
  if (!document.body.contains(host)) return;
  host.querySelector('.loading')?.remove();
  g3 = window.Garden3D.mount(host, { size: GW, tiles: S.pg.tiles, items: S.pg.items, dark: isDark(), focus: g3focus, onTap: (cell) => itemSheet(cell) });
  g3focus = null;
  setTimeout(() => { const h = $('#g3hint'); if (h) h.style.opacity = '0'; }, 4000);
}
function unmount3D() { if (g3) { g3.destroy(); g3 = null; } }
function remount3D() { if (tab === 'garden' && S.gview === '3d' && !stack.length) { unmount3D(); const host = $('#g3d'); if (host) { host.querySelectorAll('canvas').forEach((c) => c.remove()); mount3D(); } } }

// ----- Community -----
function Community() {
  const types = [['all', 'All', null], ['seva', 'Seva stories', 'var(--seva)'], ['event', 'Events', 'var(--event)'], ['update', 'Alerts', 'var(--action)']];
  const posts = S.posts.filter((p) => feedScope === 'local' ? p.scope === 'local' : true).filter((p) => feedType === 'all' || p.type === feedType || (feedType === 'seva' && p.type === 'milestone')).sort((a, b) => (b.type === 'update') - (a.type === 'update') || T(b.date) - T(a.date));
  return `<div class="greet" style="margin-top:12px"><h1>Community</h1><p>Official stories from seva and events</p></div>
    <div class="seg" role="group" aria-label="Scope"><button data-scope="local" aria-pressed="${feedScope === 'local'}">Delhi</button><button data-scope="world" aria-pressed="${feedScope === 'world'}">Worldwide</button></div>
    <button class="card tap" style="margin-top:14px;padding:0;overflow:hidden" data-open="ggarden"><div class="garden-wrap" style="border-radius:0">${groupGardenSVG(S.ggarden)}</div>
      <div class="row" style="padding:12px 16px"><div class="grow"><b class="small">Delhi community garden</b><p class="xs muted">Grows with every verified seva by the group · level ${S.ggarden} of 8</p></div>${chev}</div></button>
    <div class="fchips" style="margin-top:14px" role="group" aria-label="Story type">${types.map(([v, l, c]) => `<button class="fchip" data-ft="${v}" aria-pressed="${feedType === v}">${c ? `<i class="sw" style="background:${c}"></i>` : ''}${l}</button>`).join('')}</div>
    <div class="stack" style="margin-top:10px">${posts.map(postCard).join('') || emptyState('No stories here yet', '')}</div>
    <p class="xs faint" style="text-align:center;margin-top:16px">No comments, no member posts, no rankings.</p>`;
}
const PT = { seva: ['Seva story', 'seva'], event: ['Event', 'event'], update: ['Important alert', 'action'], milestone: ['Garden milestone', 'done'] };
function postCard(p) {
  const [lbl, tone] = PT[p.type];
  return `<article class="card post ${p.type === 'update' ? 'tinted' : 'striped'} tone-${tone}"><div class="head">${ico(p.cat)}<div class="grow"><span class="label">${lbl}</span><p class="xs muted">${esc(p.city)} · ${relDay(p.date)}</p></div></div>
    <div class="body"><h3>${esc(p.title)}</h3><p class="small muted" style="margin-top:4px">${esc(p.text)}</p>
    ${p.link ? `<button class="link" data-open="${p.link}">${p.type === 'event' ? 'View event' : p.link === 'ggarden' ? 'Open garden' : 'View details'} ${I.chev}</button>` : ''}
    ${p.type !== 'update' ? reacts(p) : ''}</div></article>`;
}
function reacts(p) {
  const mine = S.mine[p.id];
  return `<div class="reacts">${[['g', '🙏', 'Gratitude'], ['a', '💚', 'Appreciate'], ['c', '👏', 'Applause']].map(([k, e, l]) => { const n = p.r[k] + (mine === k ? 1 : 0); return `<button class="react" data-react="${p.id}:${k}" aria-pressed="${mine === k}" aria-label="${l}, ${n}"><span aria-hidden="true">${e}</span>${n}</button>`; }).join('')}</div>`;
}
function GroupGarden() {
  const L = ['First flowers', 'A garden path', 'Rose beds', 'The mango tree', 'Lanterns lit', 'The banyan', 'Lotus pond and bench', 'Peacocks arrive'];
  return `${backHead('Delhi garden')}<div class="garden-wrap">${groupGardenSVG(S.ggarden)}</div>
    <p class="small muted" style="margin-top:12px">This garden belongs to everyone in Delhi Central. It grows when the group completes verified seva together. It never wilts, and nobody is ranked.</p>
    <div class="section"><div class="section-h"><h2>Milestones</h2><span class="xs muted">Level ${S.ggarden} of 8</span></div><div class="card list">${L.map((t, i) => `<div class="lrow">${i < S.ggarden ? `<span class="chip tone-done">${I.check}Reached</span>` : `<span class="chip neutral">Level ${i + 1}</span>`}<span class="small grow">${t}</span></div>`).join('')}</div></div>`;
}

// ----- Profile -----
function Profile() {
  const v = verified(); const hrs = v.reduce((n, h) => n + h.hrs, 0); const cats = new Set(v.map((h) => h.cat)); const p = participation();
  return `<div class="hdr" style="margin-top:6px"><span class="date">Profile</span><div class="pillgroup"><button data-act="inbox" aria-label="Inbox, ${unread()} unread">${I.bell}${unread() ? '<span class="dotbadge"></span>' : ''}</button><button data-act="share" aria-label="Share my seva">${I.share}</button></div></div>
    <div class="row" style="margin:18px 0"><span class="avatar" style="width:60px;height:60px;font-size:20px">${initials(ME())}</span><div><h1 style="font-size:23px">${esc(ME())}</h1><p class="small muted">Delhi Central · Member</p></div></div>
    <div class="card"><div class="row" style="margin-bottom:14px"><b class="grow">My journey</b><span class="chip neutral">${I.lock}Private</span></div>
      <div class="stats3"><div><b>${v.length}</b><span>Verified seva</span></div><div><b>${hrs % 1 ? hrs.toFixed(1) : hrs}</b><span>Hours given</span></div><div><b>${cats.size}</b><span>Kinds of seva</span></div></div>
      <div class="stamps">${['langar', 'cleanup', 'tree', 'education', 'blanket'].map((c) => `<div class="stamp ${cats.has(c) ? '' : 'off'}" title="${CAT[c].label}">${CAT[c].svg}</div>`).join('')}</div>
      ${p.key === 'less' && p.last ? `<p class="xs muted" style="margin-top:12px">Last recorded seva: ${fmtLong(p.last.date)}. Only you can see this.</p>` : ''}</div>
    <div class="card list" style="margin-top:12px">
      <button class="lrow" data-act="myseva" data-tab="${openActions().length ? 'action' : 'upcoming'}"><span class="ico tone-seva" style="width:38px;height:38px;min-width:38px;color:var(--seva)">${I.seva.replace('<svg', '<svg style="width:20px;height:20px"')}</span><span class="grow"><b class="small">My Seva</b><p class="xs muted">Replies, upcoming, completed</p></span>${chev}</button>
      <button class="lrow" data-tab="garden"><span class="ico tone-done" style="width:38px;height:38px;min-width:38px;color:var(--done)">${I.garden.replace('<svg', '<svg style="width:20px;height:20px"')}</span><span class="grow"><b class="small">My garden</b><p class="xs muted">${ITEM_ORDER.filter(isUnlocked).length} of ${ITEM_ORDER.length} unlocked</p></span>${chev}</button>
      <button class="lrow" data-act="share"><span class="ico tone-event" style="width:38px;height:38px;min-width:38px;color:var(--event)">${I.share.replace('<svg', '<svg style="width:20px;height:20px"')}</span><span class="grow"><b class="small">Share my seva</b><p class="xs muted">An image card for WhatsApp status or stories</p></span>${chev}</button></div>
    <div class="section"><div class="section-h"><h2>Appearance</h2></div><div class="card">
      <div class="seg" role="group" aria-label="Theme">${[['auto', 'System'], ['light', 'Light'], ['dark', 'Dark']].map(([k, l]) => `<button data-setmode="${k}" aria-pressed="${S.mode === k}">${l}</button>`).join('')}</div>
      <p class="small" style="font-weight:600;margin:16px 0 8px">Accent colour</p>
      <div class="swatches">${[['forest', 'Forest', '#2F6B4F'], ['ocean', 'Ocean', '#1F5F8B'], ['dusk', 'Dusk', '#5B4A9B'], ['earth', 'Earth', '#8E4F2A']].map(([k, l, c]) => `<button class="swatch" data-setaccent="${k}" aria-pressed="${S.accent === k}"><i style="background:${c}"></i>${l}</button>`).join('')}</div>
      <p class="xs muted" style="margin-top:10px">Status colours stay the same in every theme: blue live, teal seva, violet events, amber needs reply, green verified.</p></div></div>
    <div class="section"><div class="section-h"><h2>Notifications</h2></div><div class="card list">
      <div class="lrow"><div class="grow"><b class="small">In-app inbox</b><p class="xs muted">Always on. Every update lands here.</p></div><span class="chip tone-done">${I.check}On</span></div>
      <div class="lrow"><div class="grow"><b class="small">Push reminders</b><p class="xs muted">${matchMedia('(display-mode: standalone)').matches || navigator.standalone ? 'Available in the installed app' : 'Add to Home Screen first (needed on iPhone)'}</p></div><button class="btn sm soft" data-act="push">Test</button></div>
      <div class="lrow"><div class="grow"><b class="small">Calendar</b><p class="xs muted">Add your upcoming commitments</p></div><button class="btn sm soft" data-act="cal-all">Add</button></div></div></div>
    <div class="demo"><p class="h">Prototype: try member states</p>
      <div class="seg" role="group" aria-label="Member state">${[['new', 'New'], ['active', 'Active'], ['less', 'Less active']].map(([k, l]) => `<button data-scn="${k}" aria-pressed="${S.scenario === k}">${l}</button>`).join('')}</div>
      <p class="xs faint" style="margin-top:8px">New: first day. Active: a seva is live now and replies are pending. Less active: last seva about two months ago.</p>
      <button class="btn sm ghost block" style="margin-top:10px" data-act="reset">Reset prototype</button></div>
    <p class="xs faint" style="text-align:center;margin-top:20px">Namdhari Seva &amp; Community · member prototype v4</p>`;
}

// ----- Inbox -----
const NL = { live: ['live', I.info], action: ['action', I.alert], seva: ['seva', I.sparkle], done: ['done', I.checkc], event: ['event', I.cal] };
function Inbox() {
  const list = S.notifs.slice(); setTimeout(() => { S.notifs.forEach((n) => n.read = true); save(); }, 0);
  return `${backHead('Inbox')}<div class="greet" style="margin-top:4px"><h1>Inbox</h1><p>Every update lands here, even without push.</p></div>
    <div class="card list">${list.map((n) => { const [tone, ic] = NL[n.level] || NL.live; return `<button class="lrow" data-open="${n.ref}"><span class="ico tone-${tone}" style="width:40px;height:40px;min-width:40px;color:var(--tc)">${ic.replace('<svg', '<svg style="width:20px;height:20px"')}</span><span class="grow"><b class="small" style="display:block">${esc(n.t)}</b><span class="xs muted">${relDay(n.d)} · ${fmtTime(n.d)}</span></span>${n.read ? '' : '<span class="newtag">NEW</span>'}</button>`; }).join('')}</div>`;
}

// ---------- Sheets ----------
function openSheet(html) { $('#sheet-root').innerHTML = `<div class="scrim" data-act="close-sheet"></div><div class="sheet" role="dialog" aria-modal="true"><div class="grabber"></div>${html}</div>`; document.body.style.overflow = 'hidden'; }
function closeSheet() { $('#sheet-root').innerHTML = ''; document.body.style.overflow = ''; }
const sheetHead = (t, sub) => `<div class="sheet-h"><div>${sub ? `<p class="xs muted">${sub}</p>` : ''}<h2>${t}</h2></div><button class="iconbtn" data-act="close-sheet" aria-label="Close">${I.close}</button></div>`;
function actionSheet(id) {
  const a = S.actions.find((x) => x.id === id); if (!a || a.resolved) return;
  const s = sv(a.ref); const r = roleOf(s, S.assign[s.id]); const inv = a.kind === 'invite';
  const cur = S.assign[s.id] ? ({ accepted: 'going', maybe: 'maybe', declined: 'cant' }[S.assign[s.id].state] || null) : null;
  openSheet(`${sheetHead(esc(a.title))}<span class="label tone-${inv ? 'event' : 'action'}">${inv ? I.sparkle + 'Invitation' : I.alert + (a.kind === 'ack' ? 'Change' : 'Reply needed')}</span>
    <button class="card tap striped tone-seva" style="margin-top:12px" data-open="seva:${s.id}"><div class="act">${ico(s.cat)}<div class="grow"><h3>${esc(s.title)}</h3><p class="l2">${span(s.start, s.end)}</p><div class="l3"><span class="role">${esc(r?.name || '')}</span></div></div>${chev}</div></button>
    ${a.kind === 'ack' ? `<div class="banner tone-action" style="margin-top:12px">${I.pin}<span>${esc(s.updates[0]?.t || a.text)}</span></div><button class="btn block" data-act="act-yes" data-id="${id}">Got it</button>`
      : `<p class="resp-h" style="margin-top:16px">${inv ? 'Will you take this role?' : 'Are you still coming?'}</p>${respButtons('action', id, inv ? null : cur)}`}
    <p class="xs muted" style="margin-top:12px">Please reply by ${relDay(a.due).toLowerCase()}, ${fmtTime(a.due)}. Your lead sees your answer straight away.</p>`);
}
function rolePicker(sid) {
  const s = sv(sid);
  openSheet(`${sheetHead('Choose your role', esc(s.title))}<div class="card">${s.roles.map((ro) => { const f = filledOf(s, ro), left = ro.cap - f; return `<div class="slot"><div class="grow"><b class="small">${esc(ro.name)}</b><p class="xs muted">${f} of ${ro.cap} filled</p></div>${left > 0 ? `<button class="btn sm" data-act="join" data-id="${sid}" data-role="${ro.id}">Join</button>` : `<button class="btn sm ghost" data-act="waitlist" data-id="${sid}" data-role="${ro.id}">Waitlist</button>`}</div>`; }).join('')}</div>`);
}
function viewAllSheet(k) {
  const pr = priority(); const t = { live: 'Happening now', action: 'Needs your reply', soon: 'Coming up', invite: 'Invitations' }[k];
  openSheet(`${sheetHead(t)}<div class="stack">${pr.items.map((i) => k === 'live' ? sevaCard(i, myStatus(i)) : k === 'soon' ? (i.t === 'seva' ? sevaCard(i.x, myStatus(i.x)) : eventCard(i.x)) : actionCard(i)).join('')}</div>`);
}

// ---------- Share cards ----------
let shareKind = 'month', shareH = null, shareIdx = 0;
const STYLES = [['dark', 'Dark'], ['light', 'Light'], ['clear', 'Transparent']];
function shareData() {
  if (shareKind === 'seva') { const h = (shareH && S.history.find((x) => x.id === shareH && x.state === 'verified')) || verified()[0]; if (h) return { kind: 'seva', h }; }
  const v = verified(); const m = v.filter((h) => T(h.date) >= monthStart());
  return { kind: 'month', n: m.length, hrs: m.reduce((s, h) => s + h.hrs, 0), total: v.length, cats: [...new Set(v.map((h) => h.cat))].slice(0, 4) };
}
function cardSVG(style) {
  const d = shareData(); const W = 600, H = 750; const dark = style !== 'light';
  const bg = style === 'dark' ? '#111214' : style === 'light' ? '#F4F5F7' : null;
  const panel = style === 'clear' ? 'rgba(17,18,20,.82)' : dark ? '#1B1C20' : '#FFFFFF';
  const sub = dark ? '#24262B' : '#EEF0F3'; const ink = dark ? '#F2F3F5' : '#15181D', mute = dark ? '#A0A6B0' : '#626A75', ok = dark ? '#74D69C' : '#2E8B57', okbg = dark ? '#152B1F' : '#E6F4EC';
  const F = 'font-family="Inter,-apple-system,Segoe UI,Roboto,sans-serif"';
  const inner = (c, x, y, s) => `<svg x="${x}" y="${y}" width="${s}" height="${s}" viewBox="0 0 64 64">${CAT[c].svg.replace(/<\/?svg[^>]*>/g, '')}</svg>`;
  let body;
  if (d.kind === 'seva') {
    const h = d.h; const tt = h.title.length > 24 ? h.title.slice(0, 23) + '…' : h.title;
    body = `<rect x="60" y="140" width="480" height="450" rx="36" fill="${panel}"/><rect x="250" y="180" width="100" height="100" rx="26" fill="${sub}"/>${inner(h.cat, 268, 198, 64)}
      <text x="300" y="345" text-anchor="middle" font-size="34" font-weight="700" fill="${ink}" ${F}>${esc(tt)}</text>
      <text x="300" y="386" text-anchor="middle" font-size="20" fill="${mute}" ${F}>${esc(fmtLong(h.date))} • Delhi</text>
      <rect x="205" y="414" width="190" height="46" rx="23" fill="${okbg}"/><text x="300" y="444" text-anchor="middle" font-size="19" font-weight="700" fill="${ok}" ${F}>✓ Verified seva</text>
      <text x="300" y="520" text-anchor="middle" font-size="20" fill="${mute}" ${F}>${esc(h.role)} • ${h.hrs} hours</text>`;
  } else {
    const month = new Date().toLocaleDateString(undefined, { month: 'long' });
    body = `<rect x="60" y="140" width="480" height="450" rx="36" fill="${panel}"/>
      <text x="300" y="205" text-anchor="middle" font-size="24" font-weight="700" fill="${ink}" ${F}>My Seva • ${esc(month)}</text><text x="300" y="240" text-anchor="middle" font-size="18" fill="${mute}" ${F}>Delhi Central</text>
      <text x="180" y="355" text-anchor="middle" font-size="96" font-weight="700" fill="${ink}" ${F}>${d.n}</text><text x="180" y="395" text-anchor="middle" font-size="19" fill="${mute}" ${F}>seva this month</text>
      <line x1="300" y1="285" x2="300" y2="400" stroke="${dark ? '#2B2D33' : '#E3E6EA'}" stroke-width="2"/>
      <text x="420" y="355" text-anchor="middle" font-size="96" font-weight="700" fill="${ink}" ${F}>${d.hrs % 1 ? d.hrs.toFixed(1) : d.hrs}</text><text x="420" y="395" text-anchor="middle" font-size="19" fill="${mute}" ${F}>hours given</text>
      ${d.cats.map((c, i) => { const x = 300 - (d.cats.length * 76 - 16) / 2 + i * 76; return `<rect x="${x}" y="436" width="60" height="60" rx="16" fill="${sub}"/>${inner(c, x + 10, 446, 40)}`; }).join('')}
      <text x="300" y="550" text-anchor="middle" font-size="18" fill="${ok}" font-weight="600" ${F}>${d.total} verified seva in total</text>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${bg ? `<rect width="${W}" height="${H}" fill="${bg}"/>` : ''}${body}
    <g transform="translate(300 650)"><rect x="-140" y="-26" width="280" height="52" rx="26" fill="${panel}"/><circle cx="-104" cy="0" r="15" fill="#2F6B4F"/><path d="M-104 8v-12M-104 -3c0-6 4-8 9-8 0 5-3 8-9 8zM-104 0c0-4-3-6-7-6 0 4 3 6 7 6z" fill="none" stroke="#fff" stroke-width="2"/><text x="-80" y="7" font-size="19" font-weight="700" fill="${ink}" ${F}>Namdhari Seva</text></g></svg>`;
}
function shareSheet(hid) {
  if (hid) { shareKind = 'seva'; shareH = hid; } if (!verified().length) shareKind = 'month';
  openSheet(`${sheetHead('Share', 'For WhatsApp status or stories')}
    <div class="share-tabs" role="group"><button data-sk="month" aria-pressed="${shareKind === 'month'}">This month</button>${verified().length ? `<button data-sk="seva" aria-pressed="${shareKind === 'seva'}">${shareH ? 'This seva' : 'Latest seva'}</button>` : ''}</div>
    <div class="carousel" id="car">${STYLES.map(([k, l]) => `<div class="slide ${k === 'clear' ? 'checker' : ''}"><span class="stl">${l}</span>${cardSVG(k)}</div>`).join('')}</div>
    <div class="dots">${STYLES.map((_, i) => `<i class="${i === shareIdx ? 'on' : ''}"></i>`).join('')}</div>
    <div class="share-acts"><button data-act="sh-save"><span class="c">${I.download}</span>Save image</button><button data-act="sh-copy"><span class="c">${I.copy}</span>Copy image</button><button data-act="sh-wa"><span class="c">${I.wa}</span>WhatsApp</button><button data-act="sh-share"><span class="c">${I.share}</span>Share</button></div>`);
  const car = $('#car'); const w = () => car.firstElementChild.offsetWidth + 14; car.scrollLeft = shareIdx * w();
  car.addEventListener('scroll', () => { const i = Math.round(car.scrollLeft / w()); if (i !== shareIdx) { shareIdx = i; $$('.dots i').forEach((d, j) => d.classList.toggle('on', j === i)); } }, { passive: true });
}
function cardPNG() { return new Promise((res, rej) => { const img = new Image(); img.onload = () => { const c = document.createElement('canvas'); c.width = 1200; c.height = 1500; c.getContext('2d').drawImage(img, 0, 0, 1200, 1500); c.toBlob((b) => b ? res(b) : rej(new Error('blob')), 'image/png'); }; img.onerror = rej; img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(cardSVG(STYLES[shareIdx][0])); }); }
async function shareImage(mode) {
  try {
    const blob = await cardPNG(); const file = new File([blob], 'my-seva.png', { type: 'image/png' });
    const dl = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'my-seva.png'; document.body.appendChild(a); a.click(); a.remove(); };
    if (mode === 'save') { dl(); toast('Image saved'); return; }
    if (mode === 'copy') { if (navigator.clipboard && window.ClipboardItem) { await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]); toast('Image copied'); } else toast('Copy isn\'t supported here — use Save image'); return; }
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text: 'Seva with Delhi Central 🙏' }); return; }
    if (mode === 'wa') { window.open(`https://wa.me/?text=${encodeURIComponent('Seva with Delhi Central 🙏 ' + location.origin + location.pathname)}`, '_blank', 'noopener'); return; }
    dl(); toast('Sharing isn\'t supported here — image saved instead');
  } catch (e) { if (!e || e.name !== 'AbortError') toast('Couldn\'t create the image'); }
}

// ---------- Actions ----------
function setSevaResponse(sid, v) {
  const s = sv(sid); const a = S.assign[sid];
  const act = openActions().find((x) => x.ref === sid && x.kind !== 'ack');
  if (v === 'going') {
    if (a && a.role && a.state !== 'declined') { a.state = 'accepted'; }
    else if (a && a.role && a.state === 'declined') { a.state = 'accepted'; }
    else { rolePicker(sid); return false; }
    if (act) act.resolved = true; toast(`You're going — ${roleOf(s, a).name}. Your lead can see it.`);
  } else if (v === 'maybe') { S.assign[sid] = { ...(a || {}), state: 'maybe' }; if (act) act.resolved = true; toast('Marked as maybe. You can change this anytime.'); }
  else { if (a?.state === 'accepted' && !confirm('Release your spot? Your lead is told and it goes to the next person waiting.')) return false; S.assign[sid] = { ...(a || {}), state: 'declined' }; if (act) act.resolved = true; toast('Thanks for letting your lead know.'); }
  save(); return true;
}
function setEventResponse(eid, v) {
  const e = ev(eid); const prev = S.rsvp[eid]; const map = { going: 'going', maybe: 'maybe', cant: 'cant' };
  const k = (x) => x === 'no' ? 'cant' : x;
  if (prev) e[map[k(prev)]]--; S.rsvp[eid] = v === 'cant' ? 'no' : v; e[map[v]]++;
  save(); toast(v === 'going' ? 'RSVP confirmed — added to Upcoming' : v === 'maybe' ? 'Marked as maybe' : 'Thanks for letting the organizer know');
}
function openRef(ref) {
  const [k, v] = ref.split(':');
  if (k === 'seva' || k === 'event' || k === 'history') push({ v: k, id: v });
  else if (k === 'ggarden') push({ v: 'ggarden' });
  else if (k === 'action') actionSheet(v);
  else if (k === 'tab') go(v);
}
const shareText = (kind, x) => `${kind === 'seva' ? '🙏 ' : ''}${x.title}\n${relDay(x.start)} · ${fmtTime(x.start)} · ${x.place}\n${location.origin}${location.pathname}#${kind}=${x.id}`;
function ics(items, name) {
  const z = (d) => iso(T(d)).replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const evs = items.map((i) => `BEGIN:VEVENT\r\nUID:${i.id}-${uid()}@namdhari-seva\r\nDTSTAMP:${z(iso(now()))}\r\nDTSTART:${z(i.start)}\r\nDTEND:${z(i.end)}\r\nSUMMARY:${i.title}\r\nLOCATION:${i.place}\r\nBEGIN:VALARM\r\nTRIGGER:-PT2H\r\nACTION:DISPLAY\r\nDESCRIPTION:Reminder\r\nEND:VALARM\r\nEND:VEVENT`).join('\r\n');
  const a = document.createElement('a'); a.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(`BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Namdhari Seva//EN\r\n${evs}\r\nEND:VCALENDAR`); a.download = name + '.ics'; document.body.appendChild(a); a.click(); a.remove();
  toast('Calendar file ready — open it to add');
}
async function pushTest() {
  if (!('Notification' in window)) { toast(/iphone|ipad/i.test(navigator.userAgent) ? 'On iPhone, add to Home Screen first' : 'Notifications aren\'t supported here'); return; }
  const p = await Notification.requestPermission(); if (p !== 'granted') { toast('Notifications are off — your inbox still has everything'); return; }
  const reg = await navigator.serviceWorker?.getRegistration(); const body = 'Sunday Langar Seva starts tomorrow at 9:00 AM. You\'re on Cooks.';
  reg ? reg.showNotification('Seva reminder', { body, icon: 'icons/icon-192.png', tag: 'demo' }) : new Notification('Seva reminder', { body });
}
function install() {
  if (window.__dp) { window.__dp.prompt(); return; }
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const st = ios ? ['Open this page in <b>Safari</b>', 'Tap <b>Share</b> in the toolbar', 'Tap <b>Add to Home Screen</b>, then <b>Add</b>'] : ['Open in <b>Chrome</b>', 'Tap the <b>⋮</b> menu', 'Tap <b>Install app</b> or <b>Add to Home screen</b>'];
  openSheet(`${sheetHead('Add to Home Screen')}<div class="card list">${st.map((t, i) => `<div class="lrow"><span class="avatar" style="width:32px;height:32px">${i + 1}</span><span class="small">${t}</span></div>`).join('')}</div><button class="btn ghost block" style="margin-top:12px" data-act="noinstall">Not now</button>`);
}
function unlockToast(before) { const fresh = ITEM_ORDER.filter(isUnlocked).filter((x) => !before.includes(x)); if (fresh.length) setTimeout(() => toast(`New in your garden: ${fresh.map((f) => itemDef(f).name).join(', ')} 🌱`), 500); }

function handle(el) {
  const act = el.dataset.act, id = el.dataset.id; buzz();
  switch (act) {
    case 'onb-next': onb = 1; renderOnboarding(); break;
    case 'onb-finish': { const n = ($('#onb-name')?.value || '').trim(); if (!n) { toast('Please add your name'); return; } S.name = n; S.minor = $('#onb-age').value === 'minor'; S.onboarded = true; save(); tab = 'home'; render(); toast(S.minor ? 'Guardian approval link sent' : 'Welcome to Delhi Central'); break; }
    case 'back': pop(); break;
    case 'close-sheet': closeSheet(); if (!g3) rerender(); break;
    case 'inbox': push({ v: 'inbox' }); break;
    case 'share': closeSheet(); shareSheet(el.dataset.h); break;
    case 'myseva': mySevaTab = el.dataset.tab || 'upcoming'; closeSheet(); push({ v: 'myseva' }); break;
    case 'explore': sevaSeg = 'explore'; exploreFilter = 'all'; go('seva'); break;
    case 'viewall': viewAllSheet(el.dataset.k); break;
    case 'action': actionSheet(id); break;
    case 'act-yes': { const a = S.actions.find((x) => x.id === id); a.resolved = true; save(); closeSheet(); rerender(); toast('Thanks — noted'); break; }
    case 'respond': {
      const v = el.dataset.v, kind = el.dataset.kind;
      if (kind === 'event') { setEventResponse(id, v); rerender(); break; }
      let sid = id;
      if (kind === 'action') { const a = S.actions.find((x) => x.id === id); sid = a.ref; if (a.kind === 'invite' && v === 'going') { S.assign[sid].state = 'accepted'; a.resolved = true; save(); closeSheet(); rerender(); toast(`Accepted — ${roleOf(sv(sid), S.assign[sid]).name}. Added to Upcoming`); break; } }
      if (setSevaResponse(sid, v)) { if (kind === 'action') closeSheet(); rerender(); }
      break;
    }
    case 'join': { const s = sv(id); const r = s.roles.find((x) => x.id === el.dataset.role); S.assign[id] = { state: 'accepted', role: r.id }; openActions().filter((x) => x.ref === id && x.kind !== 'ack').forEach((x) => x.resolved = true); save(); closeSheet(); rerender(); toast(`You're going — ${r.name}. Added to My Seva`); break; }
    case 'waitlist': S.assign[id] = { state: 'waitlist', role: el.dataset.role }; save(); closeSheet(); rerender(); toast('You\'re on the waitlist — we\'ll tell you if a spot opens'); break;
    case 'task': { S.checklist[id] = S.checklist[id] || {}; S.checklist[id][el.dataset.i] = !S.checklist[id][el.dataset.i]; save(); rerender(); break; }
    case 'demo-end': { const s = sv(id); const a = S.assign[id]; s.end = iso(now() - MIN); const hid = 'h' + uid(); S.history.push({ id: hid, title: s.title, cat: s.cat, date: s.start, hrs: Math.max(.5, Math.round((T(s.end) - T(s.start)) / HOUR * 2) / 2), role: roleOf(s, a).name, state: 'awaiting' }); save(); stack[stack.length - 1] = { v: 'history', id: hid }; render(); window.scrollTo(0, 0); toast('Seva ended — awaiting verification'); break; }
    case 'demo-verify': { const before = ITEM_ORDER.filter(isUnlocked); const h = S.history.find((x) => x.id === id); h.state = 'verified'; S.ggarden = Math.min(8, S.ggarden + 1); S.notifs.unshift({ id: uid(), level: 'done', t: `${h.title} verified — thank you`, d: iso(now()), ref: 'history:' + h.id }); save(); rerender(); toast('Verified ✓ Completed count updated'); unlockToast(before); break; }
    case 'cal': { const s = sv(id); ics([{ id, title: s.title, place: s.place, start: s.start, end: s.end }], 'seva'); break; }
    case 'cal-e': { const e = ev(id); ics([{ id, title: e.title, place: e.place, start: e.start, end: e.end }], 'event'); break; }
    case 'cal-all': { const items = [...upcoming30(), ...myEventsUpcoming()]; if (!items.length) { toast('Nothing upcoming yet'); return; } ics(items, 'my-seva'); break; }
    case 'wa': window.open(`https://wa.me/?text=${encodeURIComponent(shareText('seva', sv(id)))}`, '_blank', 'noopener'); break;
    case 'wa-e': window.open(`https://wa.me/?text=${encodeURIComponent(shareText('event', ev(id)))}`, '_blank', 'noopener'); break;
    case 'lead-wa': window.open(`https://wa.me/?text=${encodeURIComponent(`Hi ${first(sv(id).lead)} ji, about ${sv(id).title}: `)}`, '_blank', 'noopener'); break;
    case 'lead-call': toast(`In the real app this calls ${sv(id).lead}, if they've shared their number`); break;
    case 'push': pushTest(); break;
    case 'install': install(); break;
    case 'noinstall': sessionStorage.setItem('noinstall', 1); closeSheet(); rerender(); break;
    case 'reset': if (confirm('Reset the prototype?')) { localStorage.removeItem(KEY); S = fresh(); onb = 0; stack = []; tab = 'home'; render(); } break;
    case 'garden-edit': gardenEdit = true; rerender(); break;
    case 'garden-edit-from-sheet': closeSheet(); gardenEdit = true; S.gview = '2d'; save(); rerender(); break;
    case 'garden-done': gardenEdit = false; rerender(); toast('Garden saved'); break;
    case 'see3d': g3focus = el.dataset.cell; closeSheet(); S.gview = '3d'; save(); rerender(); break;
    case 'g3-reset': g3 && g3.reset(); break;
    case 'sim-seva': { const before = ITEM_ORDER.filter(isUnlocked); const cats = ['langar', 'cleanup', 'tree', 'education', 'blanket']; const c = cats[S.history.length % cats.length]; S.history.push({ id: 'h' + uid(), title: `${CAT[c].label} seva (prototype)`, cat: c, date: iso(now() - HOUR), hrs: 2, role: 'Volunteer', state: 'verified' }); save(); rerender(); unlockToast(before); if (ITEM_ORDER.every(isUnlocked)) toast('Everything unlocked — your garden is complete 🌸'); break; }
    case 'sh-save': shareImage('save'); break; case 'sh-copy': shareImage('copy'); break; case 'sh-wa': shareImage('wa'); break; case 'sh-share': shareImage('share'); break;
  }
}

// ---------- Event delegation ----------
document.addEventListener('click', (e) => {
  const cell = e.target.closest('#pgarden [data-cell]');
  if (cell) {
    const k = cell.dataset.cell;
    if (gardenEdit) { buzz(); if (gardenTool === 'erase') { delete S.pg.items[k]; delete S.pg.tiles[k]; } else if (TILES[gardenTool]) { if (gardenTool === 'grass') delete S.pg.tiles[k]; else { S.pg.tiles[k] = gardenTool; delete S.pg.items[k]; } } else { S.pg.items[k] = gardenTool; delete S.pg.tiles[k]; } save(); $('#pgarden').innerHTML = personalSVG(false); }
    else if (S.pg.items[k]) itemSheet(k); else toast('Tap "Design my garden" to add something here');
    return;
  }
  const t = e.target.closest('[data-act],[data-open],[data-tab],[data-seg],[data-xf],[data-mst],[data-scope],[data-ft],[data-react],[data-setmode],[data-setaccent],[data-scn],[data-sk],[data-pf],[data-gv],[data-tool]');
  if (!t || t.disabled) return;
  if (t.dataset.act) return handle(t);
  if (t.dataset.open) { buzz(); closeSheet(); openRef(t.dataset.open); return; }
  if (t.dataset.tab) { buzz(); go(t.dataset.tab); return; }
  if (t.dataset.seg) { sevaSeg = t.dataset.seg; rerender(); return; }
  if (t.dataset.xf) { exploreFilter = t.dataset.xf; rerender(); return; }
  if (t.dataset.mst) { mySevaTab = t.dataset.mst; rerender(); return; }
  if (t.dataset.scope) { feedScope = t.dataset.scope; rerender(); return; }
  if (t.dataset.ft) { feedType = t.dataset.ft; rerender(); return; }
  if (t.dataset.pf) { const [k, v] = t.dataset.pf.split(':'); peopleFilter[k] = v; rerender(); return; }
  if (t.dataset.gv) { S.gview = t.dataset.gv; gardenEdit = false; save(); rerender(); return; }
  if (t.dataset.tool) { const id = t.dataset.tool; if (id !== 'erase' && !isUnlocked(id)) { toast(`${itemDef(id).name} is locked: ${unlockText(itemDef(id).u).toLowerCase()}`); return; } gardenTool = id; $$('[data-tool]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.tool === id)); return; }
  if (t.dataset.setmode) { S.mode = t.dataset.setmode; save(); rerender(); return; }
  if (t.dataset.setaccent) { S.accent = t.dataset.setaccent; save(); rerender(); return; }
  if (t.dataset.scn) { setScenario(t.dataset.scn); stack = []; tab = 'home'; sevaSeg = 'explore'; render(); window.scrollTo(0, 0); toast({ new: 'New member: first day', active: 'Active member: a seva is live now', less: 'Less active: last seva two months ago' }[t.dataset.scn]); return; }
  if (t.dataset.sk) { shareKind = t.dataset.sk; if (shareKind === 'month') shareH = null; shareSheet(); return; }
  if (t.dataset.react) { const [pid, k] = t.dataset.react.split(':'); S.mine[pid] = S.mine[pid] === k ? undefined : k; save(); buzz(); t.closest('.reacts').outerHTML = reacts(S.posts.find((x) => x.id === pid)); }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if ($('#sheet-root').innerHTML) { closeSheet(); } else if (stack.length) pop(); } });
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); window.__dp = e; });
window.addEventListener('online', rerender); window.addEventListener('offline', rerender);
setInterval(() => { if (!$('#sheet-root').innerHTML && S.onboarded && !document.hidden && !g3 && document.activeElement?.tagName !== 'INPUT' && !gardenEdit) rerender(); }, 60000);
function deepLink() { const m = location.hash.match(/^#(seva|event)=(\w+)/); if (m && S.onboarded) { history.replaceState(null, '', location.pathname); openRef(`${m[1]}:${m[2]}`); } }
applyTheme();
$('#app').innerHTML = `<main class="screen"><div class="skel" style="height:24px;width:45%;margin-top:14px"></div><div class="skel" style="height:34px;width:70%;margin-top:22px"></div><div class="skel" style="height:220px;margin-top:22px"></div><div class="skel" style="height:124px;margin-top:22px"></div></main>`;
setTimeout(() => { render(); deepLink(); }, 250);
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
})();
