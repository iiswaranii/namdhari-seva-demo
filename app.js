/* Namdhari Seva & Community — prototype v5
   Calendar-first Home, points (tasks) that members pick, live alerts, Member / Team Lead / Admin views.
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
  alert: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5h.01"/>', 2),
  hourglass: svg('<path d="M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9"/>'),
  cal: svg('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
  info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/>', 2),
  sparkle: svg('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>', 2.2),
  edit: svg('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z"/>'),
  trash: svg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
  megaphone: svg('<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M16 8a5 5 0 0 1 0 8M19 5a9 9 0 0 1 0 14"/>'),
  wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.8-1.2s.2-1.1.1-1.2-.2-.2-.4-.3z"/></svg>',
  phone: svg('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'),
  download: svg('<path d="M12 4v11M7 10l5 5 5-5"/><path d="M5 20h14"/>'),
  copy: svg('<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>'),
  leaf: svg('<path d="M5 19c0-8 5-14 15-15-1 10-7 15-15 15z"/><path d="M5 19l8-8"/>'),
  lock: svg('<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
  cube: svg('<path d="M12 2 3 7v10l9 5 9-5V7z"/><path d="M3 7l9 5 9-5M12 12v10"/>'),
  square: svg('<path d="M12 3 21 8 12 13 3 8z"/><path d="M3 8v8l9 5 9-5V8"/>'),
  reset: svg('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'),
  erase: svg('<path d="M20 20H8l-5-5 10-10 8 8-6 6"/><path d="M6 12l6 6"/>'),
  shield: svg('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>'),
  flag: svg('<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'),
  globe: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
  wifi: svg('<path d="M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0M12 19h.01"/><path d="M3 3l18 18"/>'),
};
const chev = I.chev.replace('<svg', '<svg class="chev"');
// Category line icons + colours
const CAT = {
  langar: { label: 'Langar', ic: svg('<path d="M4 12h16a8 7 0 0 1-16 0z"/><path d="M3 12h18M9 8c0-1.5 1.5-1.5 1.5-3M13 8c0-1.5 1.5-1.5 1.5-3"/>') },
  cleanup: { label: 'Cleaning', ic: svg('<path d="M14 3l-4 9"/><path d="M6 12h8l2 9H4z"/><path d="M8 16v5M12 16v5"/>') },
  tree: { label: 'Tree planting', ic: svg('<path d="M12 21v-8"/><path d="M12 13c0-4 3-6 7-6 0 4-3 6-7 6zM12 15c0-3-2.5-5-6-5 0 3.5 2.5 5 6 5z"/><path d="M6 21h12"/>') },
  education: { label: 'Education', ic: svg('<path d="M3 6c3-1.5 6-1.5 9 1 3-2.5 6-2.5 9-1v13c-3-1.5-6-1.5-9 1-3-2.5-6-2.5-9-1z"/><path d="M12 7v13"/>') },
  blanket: { label: 'Relief', ic: svg('<path d="M12 20s-7-4.4-7-9.5A3.5 3.5 0 0 1 12 8a3.5 3.5 0 0 1 7 2.5C19 15.6 12 20 12 20z"/>') },
  event: { label: 'Event', ic: svg('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4M12 13l1 2 2 .3-1.5 1.4.4 2.1-1.9-1-1.9 1 .4-2.1L9 15.3l2-.3z"/>') },
};
const cico = (c, sm) => `<span class="cico cc-${c} ${sm ? 'sm' : ''}">${CAT[c].ic}</span>`;
const dtile = (s, c) => { const d = new Date(s); return `<span class="dtile cc-${c}"><span><b>${d.getDate()}</b><span>${d.toLocaleDateString(undefined, { month: 'short' })}</span></span></span>`; };

// ---------- People ----------
const NAMES = ['Harpreet Kaur', 'Gurpreet Singh', 'Simran Kaur', 'Jaspreet Singh', 'Manjit Kaur', 'Balwinder Singh', 'Navneet Kaur', 'Amrit Singh', 'Kiranjit Kaur', 'Ravinder Singh', 'Parminder Kaur', 'Tejinder Singh', 'Sukhwinder Singh', 'Rajinder Kaur', 'Hardeep Singh', 'Gurleen Kaur', 'Mandeep Singh', 'Jasleen Kaur', 'Kuldeep Singh', 'Inderjit Kaur', 'Baljit Singh', 'Prabhjot Kaur', 'Daljit Singh', 'Sandeep Kaur', 'Arjan Singh', 'Mehar Kaur', 'Ishmeet Singh', 'Noor Kaur', 'Taranjit Singh', 'Ekam Kaur'];
const crowd = (off, going, maybe, cant, here = 0) => { const o = []; let k = off; for (let i = 0; i < going; i++) o.push({ n: NAMES[k++ % 30], st: i < here ? 'here' : 'going' }); for (let i = 0; i < maybe; i++) o.push({ n: NAMES[k++ % 30], st: 'maybe' }); for (let i = 0; i < cant; i++) o.push({ n: NAMES[k++ % 30], st: 'cant' }); return o; };
const pts = (off, list) => list.map(([text, need, n, me, extra], i) => ({ id: 't' + uid(), text, need, takers: [...(me ? ['@me'] : []), ...NAMES.slice(off + i * 2, off + i * 2 + n)], at: extra?.at || at(-3, 9), live: !!extra?.live }));

// ---------- Scenario data ----------
function baseSeva(kind) {
  const meA = kind === 'active';
  return [
    { id: 's0', title: 'Gurdwara Hall Cleaning', cat: 'cleanup', start: rel(-25), end: rel(155), place: 'Namdhari Gurdwara, Karol Bagh', meet: 'Main hall entrance', lead: 'Gurpreet Singh', purpose: 'Get the main hall ready for this evening\'s diwan.', instructions: 'Head covered. Brooms, mops and cloths are in the store room.', created: at(-5, 9), people: crowd(2, 9, 1, 1, 7),
      points: pts(2, [['Lay carpets in the main hall', 4, 3, false], ['Sweep and mop the hall floor', 3, 2, meA], ['Clean windows and ceiling fans', 2, 0, false], ['Arrange the shoe racks', 2, 1, meA], ['Water for sangat at the entrance', 1, 0, false, { at: rel(-8), live: true }]]),
      updates: [{ id: 'u1', t: 'New point added: Water for sangat at the entrance', d: rel(-8), by: 'Gurpreet Singh', kind: 'new' }, { id: 'u2', t: 'Carpets: start from the stage side, not the door side', d: rel(-14), by: 'Gurpreet Singh', kind: 'edit' }, { id: 'u0', t: 'Seva has started. Please meet at the main hall entrance.', d: rel(-25), by: 'Gurpreet Singh', kind: 'info' }] },
    { id: 's5', title: 'Morning Langar Prep', cat: 'langar', start: rel(-70), end: rel(110), place: 'Langar kitchen, Karol Bagh', meet: 'Kitchen side door', lead: 'Manjit Kaur', purpose: 'Prep for today\'s langar — about 250 sangat.', instructions: 'Aprons and gloves provided.', created: at(-6, 9), people: crowd(12, 7, 1, 0, 6),
      points: pts(12, [['Chop onions and tomatoes', 3, 2, meA], ['Knead atta for rotis', 2, 2, false], ['Wash dal and rice', 2, 1, false]]),
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
  ];
}
function baseEvents() {
  return [
    { id: 'e1', title: 'Monthly Satsang', kind: 'Satsang', start: at(6, 18), end: at(6, 20), place: 'Namdhari Gurdwara, Karol Bagh', organizer: 'Delhi Central', audience: 'Delhi Central members', agenda: ['Kirtan', 'Katha', 'Ardas', 'Langar'], going: 86, maybe: 21, cant: 9, linked: 's1', created: at(-12, 9), sample: 0 },
    { id: 'e2', title: 'New Volunteer Orientation', kind: 'Online session', start: at(3, 19), end: at(3, 19, 45), place: 'Online — link shared after you RSVP', organizer: 'Delhi Central', audience: 'New and returning volunteers', agenda: ['How seva works', 'Picking points', 'Q&A'], going: 14, maybe: 6, cant: 2, created: rel(-200), sample: 11 },
    { id: 'e3', title: 'Hola Mohalla Gathering', kind: 'Gathering', start: at(24, 10), end: at(24, 17), place: 'Sri Bhaini Sahib, Punjab', organizer: 'Worldwide sangat', audience: 'All members', agenda: ['Gathering', 'Seva', 'Celebration'], going: 1240, maybe: 310, cant: 45, created: at(-15, 9), sample: 5 },
  ];
}
function basePosts() {
  return [
    { id: 'p1', type: 'seva', scope: 'local', cat: 'cleanup', title: 'Karol Bagh street clean-up', city: 'Delhi', date: at(-3, 10), text: '22 volunteers cleared 18 bags of waste from 3 lanes.', r: { g: 31, a: 12, c: 9 } },
    { id: 'u1', type: 'update', scope: 'local', cat: 'cleanup', title: 'Yamuna clean-up moved to Gate 2', city: 'Delhi', date: rel(-120), text: 'Same time, 7:00 AM Thursday. Gate 1 is closed for repairs.', link: 'seva:s2', r: { g: 3, a: 8, c: 1 } },
    { id: 'v1', type: 'event', scope: 'local', cat: 'event', title: 'Monthly Satsang this Saturday', city: 'Delhi', date: at(-1, 12), text: 'Kirtan, katha and langar. 86 sangat going so far.', link: 'event:e1', r: { g: 22, a: 14, c: 5 } },
    { id: 'm1', type: 'milestone', scope: 'local', cat: 'tree', title: 'Delhi garden: lanterns are lit', city: 'Delhi', date: at(-2, 9), text: 'Our 40th verified seva this year lit the garden lanterns.', link: 'ggarden', r: { g: 64, a: 30, c: 41 } },
    { id: 'p2', type: 'seva', scope: 'world', cat: 'langar', title: 'Langar for 450 at Southall', city: 'London', date: at(-2, 13), text: '16 volunteers served 450 sangat in under 2 hours.', r: { g: 88, a: 40, c: 27 } },
    { id: 'v2', type: 'event', scope: 'world', cat: 'event', title: 'Hola Mohalla — RSVPs open', city: 'Sri Bhaini Sahib', date: at(-4, 9), text: 'Gathering at Sri Bhaini Sahib in 3 weeks. 1,240 going.', link: 'event:e3', r: { g: 210, a: 96, c: 120 } },
  ];
}
const PATH_TILES = { '2,0': 'path', '2,1': 'path', '2,2': 'path', '2,3': 'path', '2,4': 'path', '2,5': 'path', '3,3': 'path', '4,3': 'path', '5,3': 'path' };
function scenario(kind) {
  const d = { seva: baseSeva(kind), events: baseEvents(), posts: basePosts(), assign: {}, rsvp: {}, actions: [], history: [], notifs: [], mydone: {}, seenUpd: {}, ggarden: 5, mine: {}, pg: { tiles: {}, items: {} } };
  if (kind === 'active') {
    d.assign = { s0: { state: 'going' }, s5: { state: 'going' }, s1: { state: 'going' }, s2: { state: 'going' }, s3: { state: 'invited' } };
    d.rsvp = { e1: 'going' };
    d.seenUpd = { 'member:s0': T(rel(-30)), 'member:s5': now() };
    d.actions = [
      { id: 'a1', kind: 'confirm', ref: 's1', title: 'Are you still coming?', text: 'Sunday Langar Seva · tomorrow 9:00 AM', due: at(0, 21) },
      { id: 'a3', kind: 'invite', ref: 's3', title: 'Gurpreet invited you', text: 'Tree Planting Drive · ' + fmtLong(at(9, 8)), due: at(6, 21) },
    ];
    d.history = [
      { id: 'h1', title: 'Karol Bagh street clean-up', cat: 'cleanup', date: at(-3, 10), hrs: 2.5, role: 'Picked up litter', state: 'verified' },
      { id: 'h2', title: 'Punjabi Reading Circle', cat: 'education', date: at(-8, 17), hrs: 1.5, role: 'Read with a group', state: 'verified' },
      { id: 'h3', title: 'Sunday Langar Seva', cat: 'langar', date: at(-13, 9), hrs: 4, role: 'Served langar', state: 'verified' },
      { id: 'h4', title: 'Sunday Langar Seva', cat: 'langar', date: at(-41, 9), hrs: 4, role: 'Cooked dal', state: 'verified' },
      { id: 'h5', title: 'Blanket Distribution', cat: 'blanket', date: at(-62, 18), hrs: 2, role: 'Handed out blankets', state: 'verified' },
      { id: 'h6', title: 'Tree Planting Drive', cat: 'tree', date: at(-70, 8), hrs: 3, role: 'Planted saplings', state: 'verified' },
      { id: 'h8', title: 'Sunday Langar Seva', cat: 'langar', date: at(-83, 9), hrs: 4, role: 'Served langar', state: 'verified' },
    ];
    d.notifs = [
      { id: 'n1', level: 'live', t: 'New point added to Gurdwara Hall Cleaning: Water for sangat', d: rel(-8), ref: 'seva:s0' },
      { id: 'n2', level: 'live', t: 'Gurdwara Hall Cleaning has started — your points: Sweep and mop, Shoe racks', d: rel(-25), ref: 'seva:s0' },
      { id: 'n6', level: 'action', t: 'Reminder: tomorrow 9:00 AM you\'re cooking dal and sabzi', d: rel(-40), ref: 'seva:s1' },
      { id: 'n3', level: 'action', t: 'Are you still coming to Sunday Langar Seva?', d: rel(-60), ref: 'action:a1' },
      { id: 'n4', level: 'p', t: 'New seva near you: Blanket Distribution', d: rel(-90), ref: 'seva:s6' },
      { id: 'n5', level: 'done', t: 'Karol Bagh clean-up verified — thank you', d: at(-3, 18), ref: 'history:h1', read: true },
    ];
    d.pg = { tiles: { ...PATH_TILES }, items: { '0,0': 'mango', '1,0': 'marigold', '4,0': 'rose', '5,1': 'sapling', '0,2': 'sunflower', '3,1': 'lantern', '1,3': 'bench', '0,5': 'cat', '4,5': 'butterflies', '5,5': 'swing', '1,1': 'marigold', '4,2': 'rose' } };
  } else if (kind === 'less') {
    d.history = [
      { id: 'h4', title: 'Sunday Langar Seva', cat: 'langar', date: at(-68, 9), hrs: 4, role: 'Cooked dal', state: 'verified' },
      { id: 'h6', title: 'Tree Planting Drive', cat: 'tree', date: at(-96, 8), hrs: 3, role: 'Planted saplings', state: 'verified' },
      { id: 'h7', title: 'Karol Bagh clean-up', cat: 'cleanup', date: at(-130, 10), hrs: 2, role: 'Picked up litter', state: 'verified' },
    ];
    d.notifs = [{ id: 'n4', level: 'p', t: 'New seva near you: Blanket Distribution', d: rel(-90), ref: 'seva:s6' }];
    d.pg = { tiles: { '2,1': 'path', '2,2': 'path', '2,3': 'path', '2,4': 'path' }, items: { '1,1': 'marigold', '3,2': 'rose', '1,3': 'sapling', '3,4': 'mango', '4,1': 'butterflies' } };
  } else d.notifs = [{ id: 'n0', level: 'done', t: 'Welcome to Delhi Central 🙏', d: rel(-5), ref: 'tab:seva' }];
  return d;
}

const KEY = 'namdhari-seva-v5';
let S;
function fresh(kind = 'active') { return { v: 5, onboarded: false, name: '', minor: false, scenario: kind, role: 'member', mode: 'auto', accent: 'indigo', gview: '2d', seen: {}, calMode: 'mine', ...scenario(kind) }; }
try { S = JSON.parse(localStorage.getItem(KEY)); if (!S || S.v !== 5) S = fresh(); } catch (e) { S = fresh(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
function setScenario(kind) { const keep = { onboarded: S.onboarded, name: S.name, minor: S.minor, mode: S.mode, accent: S.accent, gview: S.gview, role: S.role }; S = { ...fresh(kind), ...keep, scenario: kind }; save(); }

// ---------- Derived model ----------
const ME = () => S.name || 'Member';
const isLead = () => S.role !== 'member';
const sv = (id) => S.seva.find((x) => x.id === id);
const ev = (id) => S.events.find((x) => x.id === id);
const st = (s) => S.assign[s.id]?.state;
const going = (s) => st(s) === 'going';
const isLive = (x) => T(x.start) <= now() && T(x.end) > now();
const isFuture = (x) => T(x.start) > now();
const myPoints = (s) => s.points.filter((p) => p.takers.includes('@me'));
const nameOf = (t) => t === '@me' ? ME() : t;
const cover = (p) => { const n = p.takers.length; return n === 0 ? { k: 'nobody', label: 'No one yet', cls: 'action' } : n < p.need ? { k: 'short', label: `${p.need - n} more needed`, cls: 'p' } : { k: 'ok', label: 'Covered', cls: 'done' }; };
const nobodyPts = (s) => s.points.filter((p) => !p.takers.length);
const openPts = (s) => s.points.filter((p) => p.takers.length < p.need).length;
const seenKey = (sid) => `${S.role}:${sid}`;
const seenAt = (sid) => S.seenUpd[seenKey(sid)] ?? (S.role === 'member' ? 0 : T(at(0, 0)));
const unreadUpd = (s) => s.updates.filter((u) => T(u.d) > seenAt(s.id));
const openActions = () => S.actions.filter((a) => !a.resolved);
const liveMine = () => S.seva.filter((s) => isLive(s) && going(s)).sort((a, b) => unreadUpd(b).length - unreadUpd(a).length || T(a.start) - T(b.start));
const liveAll = () => S.seva.filter(isLive);
const upcomingMine = () => [...S.seva.filter((s) => isFuture(s) && ['going', 'maybe'].includes(st(s))).map((x) => ({ t: 'seva', x })), ...S.events.filter((e) => isFuture(e) && ['going', 'maybe'].includes(S.rsvp[e.id])).map((x) => ({ t: 'event', x }))].sort((a, b) => T(a.x.start) - T(b.x.start));
const verified = () => S.history.filter((h) => h.state === 'verified').sort((a, b) => T(b.date) - T(a.date));
const awaiting = () => S.history.filter((h) => h.state === 'awaiting');
const isNew = (x) => !S.seen[x.id] && x.created && now() - T(x.created) < 5 * DAY && isFuture(x);
const newCount = () => S.seva.filter((s) => isNew(s) && !S.assign[s.id]).length + S.events.filter((e) => isNew(e) && !S.rsvp[e.id]).length;
const markSeen = (id) => { if (!S.seen[id]) { S.seen[id] = now(); save(); } };
const unread = () => S.notifs.filter((n) => !n.read).length;
function peopleOf(s) {
  const list = s.people.map((p) => ({ ...p })); const a = st(s);
  if (a && ['going', 'maybe', 'cant'].includes(a)) list.unshift({ n: ME(), me: true, st: a === 'going' ? (isLive(s) ? 'here' : 'going') : a });
  return list;
}
const countSt = (l, k) => l.filter((p) => p.st === k).length;

// ---------- Personal garden ----------
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
const TILES = { grass: { name: 'Grass', u: { n: 0 } }, path: { name: 'Stone path', u: { n: 0 } } };
const ITEM_ORDER = ['path', 'grass', 'marigold', 'rose', 'sunflower', 'sapling', 'bench', 'butterflies', 'swing', 'lantern', 'cat', 'mango', 'pond', 'dog', 'banyan', 'peacock'];
const itemDef = (id) => GI[id] || TILES[id];
const unlockText = (u) => u.cat ? `Do a ${CAT[u.cat].label.toLowerCase()} seva` : u.n === 0 ? 'Available from the start' : `Complete ${u.n} verified seva`;
const isUnlocked = (id) => { const u = itemDef(id).u; const v = verified(); return u.cat ? v.some((h) => h.cat === u.cat) : v.length >= u.n; };
const thumb = (id, cls = 'thumb') => TILES[id] ? `<svg viewBox="-30 -22 60 44" class="${cls}"><path d="M0 -15L26 0L0 15L-26 0Z" fill="${id === 'path' ? '#E2D2B4' : '#9EC29D'}" stroke="${id === 'path' ? '#C9B48E' : '#86AE85'}"/></svg>` : `<svg viewBox="-34 -58 68 66" class="${cls}"><ellipse cx="0" cy="2" rx="18" ry="5" fill="#000" opacity=".08"/>${GI[id].d()}</svg>`;
const GW = 6;
const isoP = (gx, gy) => [180 + (gx - gy) * 28, 40 + (gx + gy) * 16];
const still = (s) => s.replace(/class="[^"]*"/g, '').replace(/<animateTransform[^>]*\/>/g, '');
function personalSVG() {
  const g = S.pg; let tiles = ''; const items = [];
  for (let y = 0; y < GW; y++) for (let x = 0; x < GW; x++) {
    const [cx, cy] = isoP(x, y); const k = `${x},${y}`; const t = g.tiles[k] || 'grass';
    tiles += `<path class="tile" data-cell="${k}" d="M${cx} ${cy - 16}L${cx + 28} ${cy}L${cx} ${cy + 16}L${cx - 28} ${cy}Z" fill="${t === 'path' ? '#E2D2B4' : (x + y) % 2 ? '#A6C9A5' : '#9BC19A'}" stroke="${t === 'path' ? '#CDB892' : '#89B288'}" stroke-width=".7"/>`;
    if (t === 'path') tiles += `<ellipse cx="${cx - 7}" cy="${cy - 2}" rx="5" ry="2.4" fill="#CDB892" pointer-events="none"/><ellipse cx="${cx + 8}" cy="${cy + 3}" rx="4" ry="2" fill="#CDB892" pointer-events="none"/>`;
    else if (!g.items[k] && (x * 7 + y * 3) % 4 === 0) tiles += `<g pointer-events="none" class="sway s${(x + y) % 3 + 1}"><path d="M${cx - 4} ${cy + 2}l-2 -7M${cx} ${cy + 2}v-9M${cx + 4} ${cy + 2}l2 -7" stroke="#6FA06E" stroke-width="1.6" stroke-linecap="round"/></g>`;
    const it = g.items[k];
    if (it && GI[it]) items.push({ d: x + y, s: `<g class="gitem" data-cell="${k}" transform="translate(${cx} ${cy + 3})" style="cursor:pointer"><ellipse cx="0" cy="1" rx="16" ry="5" fill="#000" opacity=".08"/>${GI[it].d()}</g>` });
  }
  const [lx, ly] = isoP(0, GW - 1), [rx, ry] = isoP(GW - 1, 0), [bx, by] = isoP(GW - 1, GW - 1);
  const edge = `<path d="M${lx - 28} ${ly}L${bx} ${by + 16}L${bx} ${by + 26}L${lx - 28} ${ly + 10}Z" fill="#8A6A48"/><path d="M${bx} ${by + 16}L${rx + 28} ${ry}L${rx + 28} ${ry + 10}L${bx} ${by + 26}Z" fill="#6E5236"/>`;
  items.sort((a, b) => a.d - b.d);
  return `<svg viewBox="0 -34 360 274" role="img" aria-label="Your personal garden">${edge}${tiles}${items.map((i) => i.s).join('')}</svg>`;
}
function groupGardenSVG(level, isStill) {
  const P = (gx, gy) => [160 + (gx - gy) * 26, 54 + (gx + gy) * 15];
  let t = '';
  for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) { const [cx, cy] = P(x, y); const path = level >= 2 && (x === 2 || (level >= 4 && y === 2)); t += `<path d="M${cx} ${cy - 15}L${cx + 26} ${cy}L${cx} ${cy + 15}L${cx - 26} ${cy}Z" fill="${path ? '#E6D7BC' : (x + y) % 2 ? '#A9CBA8' : '#9EC29D'}" stroke="#8DB48C" stroke-width=".6"/>`; }
  const [lx, ly] = P(0, 4), [bx, by] = P(4, 4), [rx, ry] = P(4, 0);
  const edge = `<path d="M${lx - 26} ${ly}L${bx} ${by + 15}L${bx} ${by + 24}L${lx - 26} ${ly + 9}Z" fill="#8A6A48"/><path d="M${bx} ${by + 15}L${rx + 26} ${ry}L${rx + 26} ${ry + 9}L${bx} ${by + 24}Z" fill="#6E5236"/>`;
  const put = (id, gx, gy, sc = .8) => { const [x, y] = P(gx, gy); const d = GI[id].d(); return `<g transform="translate(${x} ${y}) scale(${sc})">${isStill ? still(d) : d}</g>`; };
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
    $$('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', isDark() ? '#0B0B0C' : '#F6F6F7'));
}
mq.addEventListener && mq.addEventListener('change', () => { applyTheme(); remount3D(); });

// ---------- Navigation ----------
let tab = 'home', stack = [];
const scrollMem = {};
const smartMyTab = () => liveMine().length ? 'live' : upcomingMine().length ? 'upcoming' : openActions().length ? 'replies' : 'done';
let sevaSeg = 'explore', exploreFilter = 'all', mySevaTab = 'live', feedScope = 'local', feedType = 'all', peopleFilter = {}, gardenEdit = false, gardenTool = 'marigold';
let calY = new Date().getFullYear(), calM = new Date().getMonth();
const key = () => tab + '/' + stack.map((v) => v.v + (v.id || '')).join('/');
function push(view) { scrollMem[key()] = window.scrollY; stack.push(view); history.pushState({ d: stack.length }, ''); render(); window.scrollTo(0, 0); }
function pop() { if (stack.length) history.back(); }
window.addEventListener('popstate', () => { if (stack.length) { leaveDetail(); stack.pop(); closeSheet(); render(); window.scrollTo(0, scrollMem[key()] || 0); } });
function go(t) { closeSheet(); if (stack.length) { leaveDetail(); const n = stack.length; stack = []; history.go(-n); } scrollMem[key()] = window.scrollY; tab = t; gardenEdit = false; render(); window.scrollTo(0, scrollMem[key()] || 0); }
// mark updates as seen when leaving a seva page
function leaveDetail() { const top = stack[stack.length - 1]; if (top?.v === 'seva') { S.seenUpd[seenKey(top.id)] = now(); save(); } }

// ---------- Render ----------
function render() {
  applyTheme(); unmount3D();
  if (!S.onboarded) return renderOnboarding();
  const top = stack[stack.length - 1];
  if (top) {
    const V = { seva: SevaDetail, event: EventDetail, ggarden: GroupGarden, inbox: Inbox, history: HistoryDetail };
    $('#app').innerHTML = `<main class="screen detail">${offline()}${V[top.v](top)}</main>`;
  } else {
    const screens = { home: Home, seva: SevaTab, garden: GardenTab, community: Community, profile: Profile };
    $('#app').innerHTML = `<main class="screen">${offline()}${screens[tab]()}</main>${tabbar()}`;
  }
  if (!stack.length && tab === 'garden' && S.gview === '3d') mount3D();
}
function rerender() { const y = window.scrollY; render(); window.scrollTo(0, y); }
function tabbar() {
  const n = newCount() + liveMine().reduce((a, s) => a + unreadUpd(s).length, 0);
  const items = [['home', 'Home', I.home, 0], ['seva', 'Seva', I.seva, n], ['garden', 'Garden', I.garden, 0], ['community', 'Community', I.community, 0], ['profile', 'Profile', I.profile, 0]];
  return `<div class="tabbar"><nav aria-label="Main">${items.map(([id, l, ic, b]) => `<button data-tab="${id}" ${tab === id ? 'aria-current="page"' : ''} aria-label="${l}${b ? `, ${b} new` : ''}"><span class="tb">${ic}${b ? `<span class="nb">${b}</span>` : ''}</span>${l}</button>`).join('')}</nav></div>`;
}
const offline = () => navigator.onLine ? '' : `<div class="banner">${I.wifi}<span>Offline — showing saved information.</span></div>`;
const backHead = (title, right = '') => `<div class="dhead"><button class="iconbtn" data-act="back" aria-label="Back">${I.back}</button><span class="t">${title}</span>${right || '<span style="width:44px"></span>'}</div>`;
const faces = (names, max = 4) => `<span class="faces">${names.slice(0, max).map((t) => `<span class="avatar ${t === '@me' || t === ME() ? 'me' : ''}" title="${esc(nameOf(t))}">${initials(nameOf(t))}</span>`).join('')}${names.length > max ? `<span class="avatar">+${names.length - max}</span>` : ''}</span>`;
const emptyState = (t, d, cta = '') => `<div class="empty"><div class="ill">${I.leaf}</div><b>${t}</b><p class="muted small" style="margin-top:4px">${d}</p>${cta}</div>`;
const brand = () => `<span class="brand"><i>${'<b></b>'.repeat(9)}</i>Seva</span>`;
const headerBtns = () => `<div class="hbtns"><button class="iconbtn" data-act="inbox" aria-label="Inbox, ${unread()} unread">${I.bell}${unread() ? `<span class="nb">${unread()}</span>` : ''}</button><button class="avatar" style="width:44px;height:44px" data-tab="profile" aria-label="Profile">${initials(ME())}</button></div>`;

// ----- Onboarding -----
let onb = 0;
function renderOnboarding() {
  $('#app').innerHTML = onb === 0 ? `<div class="onb"><div>${brand()}
      <h1 style="margin-top:28px">Seva together,<br><span class="grad">never miss a moment.</span></h1>
      <p class="muted" style="margin-top:12px">Langar, cleaning, tree planting, satsang — see what's coming, pick what you'll do, and grow your garden.</p>
      <div class="garden-wrap" style="margin:24px 0">${groupGardenSVG(5, true)}</div>
      <p class="small muted">You've been invited to <b style="color:var(--ink)">Delhi Central</b></p>
    </div><div style="margin-top:20px"><button class="btn block" data-act="onb-next">Join Delhi Central ${I.arrow}</button><p class="faint xs" style="text-align:center;margin-top:12px">Prototype — nothing leaves this phone.</p></div></div>`
  : `<div class="onb"><div>${brand()}<h1 style="margin-top:28px">A little about you</h1>
      <label class="f" for="onb-name">Your name</label><input class="in" id="onb-name" autocomplete="name" placeholder="e.g. Harjeet Kaur" value="${esc(S.name)}">
      <label class="f" for="onb-age">Age group</label><select class="in" id="onb-age"><option value="adult">18 or older</option><option value="minor">Under 18</option></select>
      <p class="muted xs" style="margin-top:8px">Under-18 members need a guardian's approval before joining seva.</p>
    </div><button class="btn block" data-act="onb-finish" style="margin-top:24px">Continue ${I.arrow}</button></div>`;
}

// ----- Calendar -----
function calItems(mode) {
  const out = [];
  S.seva.forEach((s) => { const a = st(s); const mine = ['going', 'maybe', 'invited'].includes(a); if (mode === 'mine' ? mine : true) out.push({ t: 'seva', x: s, c: s.cat, mine }); });
  S.events.forEach((e) => { const mine = ['going', 'maybe'].includes(S.rsvp[e.id]); if (mode === 'mine' ? mine : true) out.push({ t: 'event', x: e, c: 'event', mine }); });
  S.history.forEach((h) => { if (mode === 'mine') out.push({ t: 'history', x: { ...h, start: h.date, end: h.date }, c: h.cat, mine: true, past: true }); });
  return out;
}
let calPop = null, calDir = 0;
function calendar() {
  const items = calItems(S.calMode);
  const byDay = {}; items.forEach((i) => { const k = ymd(i.x.start); (byDay[k] = byDay[k] || []).push(i); });
  const firstD = new Date(calY, calM, 1); const startW = (firstD.getDay() + 6) % 7; const days = new Date(calY, calM + 1, 0).getDate();
  const today = ymd(now());
  const mineCount = items.filter((i) => { const d = new Date(i.x.start); return i.mine && !i.past && d.getFullYear() === calY && d.getMonth() === calM; }).length;
  const allOpen = calItems('all').filter((i) => { const d = new Date(i.x.start); return !i.mine && !i.past && T(i.x.start) > now() && d.getFullYear() === calY && d.getMonth() === calM; }).length;
  let cells = ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d) => `<span class="wd">${d}</span>`).join('');
  for (let i = 0; i < startW; i++) cells += '<span></span>';
  let col = startW;
  for (let d = 1; d <= days; d++) {
    const k = `${calY}-${String(calM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const its = (byDay[k] || []).filter((i) => !i.past || S.calMode === 'mine').sort((a, b) => b.mine - a.mine || T(a.x.start) - T(b.x.start));
    const top = its[0]; const anyLive = its.some((i) => i.t === 'seva' && isLive(i.x));
    const cls = ['day', its.length ? 'has' : '', top?.mine ? 'mine' : (its.length ? 'open' : ''), k === today ? 'today' : '', k === calPop ? 'sel' : '', k < today ? 'past' : ''].join(' ');
    cells += `<button class="${cls}" data-day="${k}" style="${top ? `--dc:var(--c-${top.c})` : ''}" aria-label="${new Date(k + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}${its.length ? `, ${its.length} item${its.length > 1 ? 's' : ''}` : ''}" aria-expanded="${k === calPop}"><span class="n">${d}</span>${its.length > 1 ? `<span class="more">${its.length}</span>` : ''}${anyLive ? '<span class="lv"></span>' : ''}</button>`;
    col++;
    // inline pop-over after the week that contains the selected day
    const endOfWeek = col % 7 === 0 || d === days;
    if (endOfWeek && calPop) {
      const pd = new Date(calPop + 'T12:00:00');
      if (pd.getFullYear() === calY && pd.getMonth() === calM) {
        const pDay = pd.getDate(); const weekStart = d - ((col - 1) % 7);
        if (pDay >= weekStart && pDay <= d) {
          const pcol = (startW + pDay - 1) % 7; const list = (byDay[calPop] || []).sort((a, b) => T(a.x.start) - T(b.x.start));
          cells += `<div class="pop" style="--ax:${((pcol + .5) / 7) * 100}%" role="dialog" aria-label="Seva on ${pd.toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}">
            <div class="ph"><span>${(() => { const r = relDay(calPop + 'T12:00:00'); const full = pd.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }); return ['Today', 'Tomorrow', 'Yesterday'].includes(r) ? `${r} · ${full}` : full; })()}</span><button data-act="cal-close" aria-label="Close">${I.close}</button></div>
            ${list.length ? list.map(popRow).join('') : `<p class="none">Nothing on this day.${S.calMode === 'mine' ? ' <button class="link" data-calmode="all" style="min-height:0;padding:0">See everything</button>' : ''}</p>`}
          </div>`;
        }
      }
    }
  }
  return `<div class="card cal" id="cal">
      <div class="cal-h"><h3>${firstD.toLocaleDateString(undefined, { month: 'long' })}</h3><span class="sub">${calY}</span>
        <span class="nav">${calY !== new Date().getFullYear() || calM !== new Date().getMonth() ? '<button data-act="cal-today">Today</button>' : ''}<button data-act="cal-prev" aria-label="Previous month">${I.chevL}</button><button data-act="cal-next" aria-label="Next month">${I.chev}</button></span></div>
      <div class="seg" style="margin:10px 2px 0" role="group" aria-label="Which calendar"><button data-calmode="mine" aria-pressed="${S.calMode === 'mine'}">${I.user} My calendar</button><button data-calmode="all" aria-pressed="${S.calMode === 'all'}">${I.users} All activities${allOpen ? ` <span class="count">${allOpen}</span>` : ''}</button></div>
      <p class="xs muted" style="padding:8px 4px 0">${S.calMode === 'mine' ? 'Seva and events you\'ve joined.' : 'Everything in Delhi. Dashed dates are seva or events you haven\'t joined yet.'}</p>
      <div class="cal-grid ${calDir ? 'anim' : ''}" style="--dir:${calDir * 14}px">${cells}</div>
      <div class="cal-foot"><span><i style="background:var(--c-langar)"></i>Langar</span><span><i style="background:var(--c-cleanup)"></i>Cleaning</span><span><i style="background:var(--c-event)"></i>Event</span><span><i style="background:var(--live)"></i>Live</span><span style="margin-left:auto">Tap a date</span></div>
    </div>`;
}
function popRow(i) {
  const x = i.x; const live = i.t === 'seva' && isLive(x);
  const ref = i.t === 'history' ? `history:${x.id}` : `${i.t}:${x.id}`;
  let tag = '';
  if (live) tag = '<span class="livebadge"><i></i>LIVE</span>';
  else if (i.t === 'history') tag = `<span class="chip ${x.state === 'verified' ? 'done' : 'action'}">${x.state === 'verified' ? 'Done' : 'Awaiting'}</span>`;
  else if (i.t === 'seva') { const a = st(x); tag = a === 'going' ? `<span class="chip done">${I.check}Going</span>` : a === 'maybe' ? '<span class="chip action">Maybe</span>' : a === 'invited' ? '<span class="chip event">Invited</span>' : `<span class="chip p">${I.plus}Join</span>`; }
  else { const r = S.rsvp[x.id]; tag = r === 'going' ? `<span class="chip event">${I.check}Going</span>` : r === 'maybe' ? '<span class="chip action">Maybe</span>' : `<span class="chip p">${I.plus}RSVP</span>`; }
  const sub = i.t === 'history' ? esc(x.role) : `${fmtTime(x.start)} · ${esc(x.place.split(',')[0])}${!i.mine && i.t === 'seva' ? ` · ${openPts(x)} point${openPts(x) === 1 ? '' : 's'} open` : !i.mine ? ' · not joined' : ''}`;
  return `<button class="prow cc-${i.c}" data-open="${ref}"><span class="bar3"></span>${cico(i.c, true)}<span class="grow"><b>${esc(x.title)}</b><span class="m">${sub}</span></span>${tag}${chev}</button>`;
}
function itemRow(i) {
  if (i.t === 'history') { const h = i.x; return `<button class="item tap cc-${h.cat}" data-open="history:${h.id}">${dtile(h.date, h.cat)}<span class="grow"><h3>${esc(h.title)}</h3><span class="l2">${esc(h.role)} · ${h.hrs} h</span><span class="l3"><span class="chip ${h.state === 'verified' ? 'done' : 'action'}">${h.state === 'verified' ? I.checkc + 'Verified' : I.hourglass + 'Awaiting'}</span></span></span>${chev}</button>`; }
  return i.t === 'seva' ? sevaRow(i.x) : eventRow(i.x);
}
function sevaRow(s, opts = {}) {
  const a = st(s); const mp = myPoints(s); const live = isLive(s); const nw = isNew(s) && !a; const un = unreadUpd(s).length;
  let chipH = '';
  if (live) chipH = `<span class="livebadge"><i></i>LIVE</span>`;
  else if (a === 'going') chipH = `<span class="chip done">${I.checkc}Going</span>`;
  else if (a === 'maybe') chipH = `<span class="chip action">${I.help}Maybe</span>`;
  else if (a === 'invited') chipH = `<span class="chip event">${I.sparkle}Invited</span>`;
  else { const o = openPts(s); chipH = o ? `<span class="chip p">${I.users}${o} point${o > 1 ? 's' : ''} open</span>` : `<span class="chip done">${I.check}All covered</span>`; }
  return `<button class="item tap cc-${s.cat}" data-open="seva:${s.id}">${dtile(s.start, s.cat)}<span class="grow"><span class="row" style="gap:8px;align-items:flex-start"><h3 class="grow">${esc(s.title)}</h3>${nw ? '<span class="newtag">NEW</span>' : ''}${un && live ? `<span class="chip live">${I.bell}${un}</span>` : ''}</span>
    <span class="l2 ellipsis" style="display:block">${fmtTime(s.start)} · ${esc(s.place)}</span>
    <span class="l3">${chipH}${mp.length && a === 'going' ? `<span class="xs muted">You: ${esc(mp.map((p) => p.text.split(' ').slice(0, 3).join(' ')).join(', '))}</span>` : ''}</span></span>${chev}</button>`;
}
function eventRow(e) {
  const r = S.rsvp[e.id]; const nw = isNew(e) && !r;
  const c = r === 'going' ? `<span class="chip event">${I.checkc}Going</span>` : r === 'maybe' ? `<span class="chip action">${I.help}Maybe</span>` : `<span class="chip event">${I.cal}${esc(e.kind)}</span>`;
  return `<button class="item tap cc-event" data-open="event:${e.id}">${dtile(e.start, 'event')}<span class="grow"><span class="row" style="gap:8px;align-items:flex-start"><h3 class="grow">${esc(e.title)}</h3>${nw ? '<span class="newtag">NEW</span>' : ''}</span><span class="l2 ellipsis" style="display:block">${fmtTime(e.start)} · ${esc(e.place)}</span><span class="l3">${c}<span class="xs muted">${e.going.toLocaleString()} going</span></span></span>${chev}</button>`;
}

// ----- Home -----
function Home() {
  if (S.role === 'lead') return LeadHome();
  if (S.role === 'admin') return AdminHome();
  const h = new Date().getHours(); const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const live = liveMine(); const up = upcomingMine(); const acts = openActions();
  const sub = [live.length ? `${live.length} seva live now` : '', up.length ? `${up.length} coming up` : ''].filter(Boolean).join(' · ') || 'Find a seva that fits your week';
  const help = S.seva.filter((s) => isFuture(s) && nobodyPts(s).length).slice(0, 2);
  return `<div class="hdr">${brand()}${headerBtns()}</div>
    <h1 class="hero-title">${greet},<br><span class="grad">${esc(first(ME()))}</span></h1><p class="hero-sub">${sub}</p>
    ${S.minor ? `<div class="banner" style="margin-top:14px">${I.info}<span><b>Waiting for guardian approval.</b> You can browse; joining opens once approved.</span></div>` : ''}
    ${acts.length ? `<button class="reply" data-act="action" data-id="${acts[0].id}"><span class="ic">${I.alert}</span><span class="grow"><b class="small" style="display:block">${acts.length} ${acts.length > 1 ? 'replies' : 'reply'} needed</b><span class="xs muted">${esc(acts[0].title)} · ${esc(acts[0].text)}</span></span>${chev}</button>` : ''}
    ${live.length ? `<div class="section"><div class="section-h"><h2><span class="livebadge"><i></i>LIVE</span> Happening now</h2>${live.length > 1 ? `<span class="xs muted">${live.length} seva · swipe</span>` : ''}</div><div class="lstrip">${live.map((s) => liveCard(s, live.length === 1)).join('')}</div></div>` : ''}
    <div class="section">${calendar()}</div>
    ${help.length ? `<div class="section"><div class="section-h"><h2>Can you help?</h2></div><div class="stack">${help.map((s) => { const p = nobodyPts(s)[0]; return `<button class="item tap cc-${s.cat}" data-open="seva:${s.id}">${cico(s.cat)}<span class="grow"><span class="kicker" style="color:var(--action)">No one has picked this yet</span><h3>${esc(p.text)}</h3><span class="l2">${esc(s.title)} · ${relDay(s.start)}</span></span>${chev}</button>`; }).join('')}</div></div>` : ''}
    ${installRow()}`;
}
function liveCard(s, solo) {
  const mp = myPoints(s); const done = mp.filter((p) => S.mydone[p.id]).length; const un = unreadUpd(s);
  const pct = Math.min(100, Math.max(0, (now() - T(s.start)) / (T(s.end) - T(s.start)) * 100));
  const here = peopleOf(s).filter((p) => p.st === 'here');
  const C = 2 * Math.PI * 14; const frac = mp.length ? done / mp.length : 0;
  return `<button class="lcard tap ${solo ? 'solo' : ''}" data-open="seva:${s.id}">
    ${un.length ? `<span class="alertpin">${I.bell}${un.length} new</span>` : ''}
    <span class="livebadge"><i></i>LIVE</span>
    <h3>${esc(s.title)}</h3><p class="meta">${dur(T(s.end) - now())} left · ${esc(s.meet)}</p>
    <div class="tbar"><i style="width:${pct}%"></i></div>
    <div class="mypts"><svg class="ring2" viewBox="0 0 34 34"><circle cx="17" cy="17" r="14" fill="none" stroke="var(--surface2)" stroke-width="4"/><circle cx="17" cy="17" r="14" fill="none" stroke="var(--done-c)" stroke-width="4" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - frac)}" transform="rotate(-90 17 17)"/></svg>
      <span class="grow">${mp.length ? `<b>Your points ${done}/${mp.length}</b><span class="xs muted ellipsis" style="display:block">${esc(mp.map((p) => p.text).join(' · '))}</span>` : `<b>No points picked</b><span class="xs muted" style="display:block">Tap to pick what you'll do</span>`}</span>${faces(here.map((p) => p.me ? '@me' : p.n), 3)}</div>
    ${un.length ? `<p class="xs" style="margin-top:10px;color:var(--live);font-weight:650">${I.megaphone.replace('<svg', '<svg style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"')}${esc(un[0].t)}</p>` : ''}
  </button>`;
}
function installRow() {
  if (matchMedia('(display-mode: standalone)').matches || navigator.standalone || sessionStorage.getItem('noinstall')) return '';
  return `<div class="section"><button class="card tap row" data-act="install"><img src="icons/icon-192.png" width="42" height="42" alt="" style="border-radius:11px"><span class="grow"><b class="small" style="display:block">Add to Home Screen</b><span class="xs muted">Opens full screen and can send reminders</span></span>${chev}</button></div>`;
}

// ----- Lead / Admin home -----
function coverageCard(s) {
  const tot = s.points.length, cov = s.points.filter((p) => p.takers.length >= p.need).length, nb = nobodyPts(s).length; const live = isLive(s);
  return `<button class="item tap cc-${s.cat}" data-open="seva:${s.id}">${dtile(s.start, s.cat)}<span class="grow"><span class="row" style="gap:8px"><h3 class="grow">${esc(s.title)}</h3>${live ? '<span class="livebadge"><i></i>LIVE</span>' : ''}</span>
    <span class="l2">${live ? `${dur(T(s.end) - now())} left` : `${relDay(s.start)} · ${fmtTime(s.start)}`} · ${countSt(peopleOf(s), live ? 'here' : 'going') + (live ? 0 : countSt(peopleOf(s), 'here'))} ${live ? 'here' : 'going'}</span>
    <span class="l3"><span class="meter"><i style="width:${cov / tot * 100}%;background:var(--done-c)"></i></span><span class="xs muted">${cov}/${tot} points covered</span>${nb ? `<span class="chip action">${I.alert}${nb} with no one</span>` : ''}</span></span>${chev}</button>`;
}
function LeadHome() {
  const mine = S.seva.filter((s) => (isLive(s) || isFuture(s))).sort((a, b) => isLive(b) - isLive(a) || T(a.start) - T(b.start));
  const nb = []; mine.forEach((s) => nobodyPts(s).forEach((p) => nb.push({ s, p })));
  return `<div class="hdr">${brand()}${headerBtns()}</div>
    <div class="rolebanner" style="margin-top:16px">${I.flag}Team Lead view · Delhi Central</div>
    <h1 class="hero-title" style="margin-top:12px">Your seva,<br><span class="grad">at a glance</span></h1>
    <div class="kpis" style="margin-top:16px"><div class="kpi" style="--kc:var(--live)"><b>${liveAll().length}</b><span>Live now</span></div><div class="kpi" style="--kc:var(--done)"><b>${liveAll().reduce((n, s) => n + countSt(peopleOf(s), 'here'), 0)}</b><span>Volunteers here</span></div><div class="kpi" style="--kc:var(--action)"><b>${nb.length}</b><span>Points with no one</span></div></div>
    <button class="btn block" style="margin-top:14px" data-act="create">${I.plus} Create a seva</button>
    ${nb.length ? `<div class="section"><div class="section-h"><h2>No one has picked these</h2></div><div class="card list">${nb.slice(0, 5).map(({ s, p }) => `<button class="lrow" data-open="seva:${s.id}">${cico(s.cat, true)}<span class="grow"><b class="small" style="display:block">${esc(p.text)}</b><span class="xs muted">${esc(s.title)} · ${isLive(s) ? 'live now' : relDay(s.start)} · needs ${p.need}</span></span><span class="chip action">${I.alert}0/${p.need}</span></button>`).join('')}</div></div>` : ''}
    <div class="section"><div class="section-h"><h2>Seva you lead</h2></div><div class="stack">${mine.map(coverageCard).join('')}</div></div>
    <div class="section">${calendar()}</div>`;
}
function AdminHome() {
  const act = S.seva.filter((s) => isLive(s) || isFuture(s));
  const nbCount = act.reduce((n, s) => n + nobodyPts(s).length, 0);
  const totPts = act.reduce((n, s) => n + s.points.length, 0), cov = act.reduce((n, s) => n + s.points.filter((p) => p.takers.length >= p.need).length, 0);
  const groups = [['Delhi Central', 'Delhi', 82, 2], ['Ludhiana Sangat', 'Ludhiana', 74, 1], ['London Sangat', 'London', 91, 0], ['Toronto Sangat', 'Toronto', 66, 1]];
  return `<div class="hdr">${brand()}${headerBtns()}</div>
    <div class="rolebanner" style="margin-top:16px">${I.shield}Main Admin view · Worldwide</div>
    <h1 class="hero-title" style="margin-top:12px">Seva across<br><span class="grad">the sangat</span></h1>
    <div class="kpis" style="margin-top:16px"><div class="kpi" style="--kc:var(--live)"><b>${liveAll().length}</b><span>Live now</span></div><div class="kpi" style="--kc:var(--done)"><b>${Math.round(cov / totPts * 100)}%</b><span>Points covered</span></div><div class="kpi" style="--kc:var(--action)"><b>${nbCount}</b><span>With no one</span></div></div>
    <div class="section"><div class="section-h"><h2>Live and upcoming</h2></div><div class="stack">${act.slice(0, 5).map(coverageCard).join('')}</div></div>
    <div class="section"><div class="section-h"><h2>Groups</h2><span class="xs muted">points covered</span></div><div class="card list">${groups.map(([n, c, p, l]) => `<div class="lrow"><span class="avatar">${initials(c)}</span><span class="grow"><b class="small" style="display:block">${n}</b><span class="xs muted">${l ? `${l} live now` : 'Nothing live'}</span><div class="bar"><i style="width:${p}%;background:${p > 80 ? 'var(--done-c)' : 'var(--action-c)'}"></i></div></span><b class="small">${p}%</b></div>`).join('')}</div></div>
    <div class="section"><button class="btn ghost block" data-act="csv">${I.download} Download participation CSV</button></div>`;
}

// ----- Seva tab -----
function SevaTab() {
  const n = newCount(); let body = '';
  if (sevaSeg === 'explore') {
    const show = (f) => exploreFilter === 'all' || exploreFilter === f;
    const items = [...(show('seva') ? S.seva.filter((s) => isFuture(s) && !['going', 'maybe'].includes(st(s))).map((x) => ({ t: 'seva', x })) : []), ...(show('events') ? S.events.filter((e) => isFuture(e) && S.rsvp[e.id] !== 'going').map((x) => ({ t: 'event', x })) : [])].sort((a, b) => (isNew(b.x) - isNew(a.x)) || T(a.x.start) - T(b.x.start));
    body = `<div class="fchips" style="margin-top:14px" role="group">${[['all', 'All', null], ['seva', 'Seva', 'var(--c-langar)'], ['events', 'Events', 'var(--c-event)']].map(([v, l, c]) => `<button class="fchip" data-xf="${v}" aria-pressed="${exploreFilter === v}">${c ? `<i class="dotc" style="background:${c}"></i>` : ''}${l}</button>`).join('')}</div>
      <div class="stack" style="margin-top:12px">${items.map((i) => i.t === 'seva' ? sevaRow(i.x) : eventRow(i.x)).join('') || emptyState('Nothing open right now', 'New seva and events will appear here.')}</div>`;
  } else if (sevaSeg === 'mine') {
    const live = liveMine(), up = upcomingMine(), acts = openActions(), done = [...awaiting(), ...verified()];
    const tabs = [['live', 'Live', live.length], ['upcoming', 'Upcoming', up.length], ['replies', 'Replies', acts.length], ['done', 'Done', done.length]];
    let list = '';
    if (mySevaTab === 'live') list = live.length ? live.map((s) => liveCard(s, true)).join('') : emptyState('Nothing live right now', 'When a seva you joined starts, it shows here with your points.');
    else if (mySevaTab === 'upcoming') list = up.length ? up.map((i) => i.t === 'seva' ? sevaRow(i.x) : eventRow(i.x)).join('') : emptyState('No upcoming seva', 'Join a seva from Explore.');
    else if (mySevaTab === 'replies') list = acts.length ? acts.map((a) => { const s = sv(a.ref); return `<button class="item tap cc-${s.cat}" data-act="action" data-id="${a.id}">${cico(s.cat)}<span class="grow"><span class="kicker" style="color:${a.kind === 'invite' ? 'var(--event)' : 'var(--action)'}">${a.kind === 'invite' ? 'Invitation' : 'Reply needed'}</span><h3>${esc(a.title)}</h3><span class="l2">${esc(a.text)}</span></span>${chev}</button>`; }).join('') : emptyState('All caught up', 'Invitations and confirmations show here.');
    else list = done.length ? done.map((h) => itemRow({ t: 'history', x: h })).join('') : emptyState('No completed seva yet', 'A seva counts after your lead verifies attendance.');
    body = `<div class="fchips" style="margin-top:14px" role="group">${tabs.map(([k, l, c]) => `<button class="fchip" data-mst="${k}" aria-pressed="${mySevaTab === k}">${l}${c ? ` <span class="count">${c}</span>` : ''}</button>`).join('')}</div><div class="stack" style="margin-top:12px">${list}</div>`;
  }
  return `<div class="hdr">${brand()}${headerBtns()}</div>
    <h1 class="hero-title" style="font-size:28px">Seva</h1><p class="hero-sub">Delhi Central</p>
    <div class="seg" style="margin-top:16px" role="group"><button data-seg="explore" aria-pressed="${sevaSeg === 'explore'}">Explore${n ? ` <span class="count">${n}</span>` : ''}</button><button data-seg="mine" aria-pressed="${sevaSeg === 'mine'}">My Seva${liveMine().length ? ` <span class="count" style="background:var(--live)">${liveMine().length}</span>` : ''}</button></div>
    ${isLead() ? `<button class="btn soft block" style="margin-top:12px" data-act="create">${I.plus} Create a seva</button>` : ''}
    ${body}`;
}

// ----- Response buttons -----
function respButtons(kind, id, cur, disabled) {
  return `<div class="resp" role="group" aria-label="Your response">${[['going', 'Going', I.checkc, 'r-go'], ['maybe', 'Maybe', I.help, 'r-maybe'], ['cant', 'Can\'t go', I.xc, 'r-cant']].map(([v, l, ic, c]) => `<button class="${c}" data-act="respond" data-kind="${kind}" data-id="${id}" data-v="${v}" aria-pressed="${cur === v}" ${disabled ? 'disabled' : ''}>${ic}${l}</button>`).join('')}</div>`;
}
function peopleBlock(k, list, live, counts) {
  const sts = live ? [['here', 'Here now', 's-here'], ['going', 'On the way', 's-way'], ['maybe', 'Maybe', 's-maybe']] : [['going', 'Going', 's-go'], ['maybe', 'Maybe', 's-maybe'], ['cant', 'Can\'t go', 's-cant']];
  const cnt = counts || Object.fromEntries(sts.map(([s]) => [s, countSt(list, s)]));
  const f = peopleFilter[k] || sts[0][0]; const shown = list.filter((p) => p.st === f);
  const L = { here: ['Here', 'done', I.checkc], going: [live ? 'On the way' : 'Going', live ? 'p' : 'done', I.checkc], maybe: ['Maybe', 'action', I.help], cant: ['Can\'t go', 'live', I.xc] };
  const extra = counts ? cnt[f] - shown.length : 0;
  return `<div class="stat3">${sts.map(([s, l, c]) => `<button class="${c}" data-pf="${k}:${s}" aria-pressed="${f === s}"><b>${cnt[s].toLocaleString()}</b><span>${l}</span></button>`).join('')}</div>
    <div class="card list" style="margin-top:10px">${shown.length ? shown.slice(0, 30).map((p, i) => { const [lab, cls, ic] = L[p.st]; return `<div class="lrow ${i ? '' : 'first'}"><span class="avatar ${p.me ? 'me' : ''} ${p.st === 'here' ? 'presence' : ''}" ${p.me ? 'style="background:var(--p);color:#fff"' : ''}>${initials(p.n)}</span><b class="small grow">${p.me ? 'You' : esc(p.n)}</b><span class="chip ${cls}">${ic}${lab}</span></div>`; }).join('') : '<p class="small muted" style="padding:14px 0">No one yet.</p>'}${extra > 0 ? `<p class="xs muted" style="padding:10px 0 12px;border-top:1px solid var(--border)">+ ${extra.toLocaleString()} more</p>` : ''}</div>`;
}

// ----- Points board -----
function pointsBoard(s, mode, unreadSince) {
  // mode: 'join' (pick before), 'live' (help/done), 'lead' (manage)
  const a = st(s); const canPick = a === 'going' && !S.minor;
  return `<div class="card" style="padding:12px 16px">${s.points.map((p) => {
    const c = cover(p); const mine = p.takers.includes('@me'); const isNewPt = unreadSince && T(p.at) > unreadSince;
    const pickBtn = mode === 'lead' || (mode === 'live' && !mine) ? '' : mode === 'live'
      ? `<button class="pick done" data-act="ptdone" data-id="${s.id}" data-p="${p.id}" aria-pressed="${!!S.mydone[p.id]}" aria-label="Mark done">${S.mydone[p.id] ? I.check : ''}</button>`
      : `<button class="pick" data-act="ptpick" data-id="${s.id}" data-p="${p.id}" aria-pressed="${mine}" aria-label="${mine ? 'Remove me from' : 'I\'ll do'} ${esc(p.text)}" ${canPick ? '' : 'disabled style="opacity:.35"'}>${mine ? I.check : ''}</button>`;
    return `<div class="pt ${c.k === 'nobody' ? 'nobody' : ''} ${isNewPt ? 'isnew' : ''} ${mode === 'live' && mine && S.mydone[p.id] ? 'isdone' : ''}">${pickBtn}
      <div class="grow"><b class="t">${esc(p.text)}</b>
        <div class="sub">${isNewPt ? `<span class="chip live">${I.sparkle}New</span>` : ''}${p.takers.length ? faces(p.takers, 4) : ''}<span class="chip ${c.cls}">${c.k === 'nobody' ? I.alert : c.k === 'ok' ? I.check : I.users}${p.takers.length}/${p.need} · ${c.label}</span>${mine ? '<span class="xs" style="color:var(--p);font-weight:700">You</span>' : ''}</div>
        ${mode === 'lead' && p.takers.length ? `<p class="xs muted" style="margin-top:6px">${p.takers.map((t) => esc(nameOf(t))).join(', ')}</p>` : ''}
      </div>
      ${mode === 'lead' ? `<div class="tools"><button data-act="ptedit" data-id="${s.id}" data-p="${p.id}" aria-label="Edit point">${I.edit}</button><button data-act="ptdel" data-id="${s.id}" data-p="${p.id}" aria-label="Remove point">${I.trash}</button></div>` : mode === 'live' && !mine && a === 'going' ? `<button class="btn sm soft" data-act="ptpick" data-id="${s.id}" data-p="${p.id}">I'll help</button>` : ''}
    </div>`; }).join('')}
    ${mode === 'lead' ? `<div class="btn-row" style="margin-top:12px"><button class="btn sm soft" data-act="ptadd" data-id="${s.id}">${I.plus} Add point</button><button class="btn sm ghost" data-act="postupd" data-id="${s.id}">${I.megaphone} Post update</button></div>` : ''}
  </div>`;
}

// ----- Seva detail -----
function SevaDetail({ id }) {
  const s = sv(id); if (!s) return backHead('Seva') + emptyState('This seva is no longer available', 'It may have been cancelled or moved.');
  markSeen(id);
  const live = isLive(s); const a = st(s); const ppl = peopleOf(s); const un = unreadUpd(s); const since = seenAt(id);
  const lead = isLead();
  const pct = Math.min(100, Math.max(0, (now() - T(s.start)) / (T(s.end) - T(s.start)) * 100));
  let h = backHead(live ? 'Live seva' : 'Seva', `<button class="iconbtn" data-act="wa" data-id="${id}" aria-label="Share on WhatsApp">${I.share}</button>`);
  h += `<div class="dhero cc-${s.cat} ${live ? 'islive' : ''}">
    <div class="row" style="gap:8px">${live ? '<span class="livebadge"><i></i>LIVE</span>' : `<span class="chip" style="background:color-mix(in srgb,var(--cc) 14%,var(--surface));color:var(--cc)">${CAT[s.cat].ic.replace('<svg', '<svg style="width:13px;height:13px"')}${CAT[s.cat].label}</span>`}${s.recur ? `<span class="chip">${s.recur}</span>` : ''}</div>
    <h1>${esc(s.title)}</h1><p class="when">${span(s.start, s.end)}</p>
    ${live ? `<div class="tbar"><i style="width:${pct}%"></i></div><p class="xs muted" style="margin-top:6px">Started ${dur(now() - T(s.start))} ago · ${dur(T(s.end) - now())} left</p>` : ''}
    <div class="metal"><div>${I.pin}<span>${esc(s.place)} · ${esc(s.meet)}</span></div><div>${I.user}<span>Lead: <b>${esc(s.lead)}</b></span></div></div>
  </div>`;
  if (un.length) h += `<div class="upd" role="status"><span class="kicker" style="color:var(--live)">${I.bell.replace('<svg', '<svg style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"')}${un.length} new update${un.length > 1 ? 's' : ''} since you last looked</span>${un.map((u) => `<div class="u">${u.kind === 'new' ? I.sparkle : u.kind === 'edit' ? I.edit : I.megaphone}<span class="grow"><b>${esc(u.t)}</b><br><span class="xs muted">${fmtTime(u.d)} · ${esc(u.by)}</span></span></div>`).join('')}</div>`;

  if (lead) {
    const tot = s.points.length, cov = s.points.filter((p) => p.takers.length >= p.need).length, nb = nobodyPts(s).length;
    h += `<div class="section"><div class="rolebanner">${I.flag}You can edit points${live ? ' while this seva is live — members get an alert' : ''}</div>
      <div class="kpis" style="margin-top:10px"><div class="kpi" style="--kc:var(--done)"><b>${cov}/${tot}</b><span>Points covered</span></div><div class="kpi" style="--kc:var(--action)"><b>${nb}</b><span>With no one</span></div><div class="kpi" style="--kc:var(--p)"><b>${countSt(ppl, live ? 'here' : 'going')}</b><span>${live ? 'Here now' : 'Going'}</span></div></div></div>
      <div class="section"><div class="section-h"><h2>Points</h2><span class="xs muted">who is doing what</span></div>${pointsBoard(s, 'lead', since)}</div>`;
  } else if (live && a === 'going') {
    const mp = myPoints(s);
    h += `<div class="section"><div class="section-h"><h2>Your points</h2><span class="xs muted">${mp.filter((p) => S.mydone[p.id]).length}/${mp.length} done</span></div>${mp.length ? pointsBoard({ ...s, points: mp }, 'live', since) : `<div class="card"><p class="small muted">You haven't picked a point yet. Choose one below.</p></div>`}</div>
      <div class="section"><div class="section-h"><h2>All points</h2>${nobodyPts(s).length ? `<span class="chip action">${I.alert}${nobodyPts(s).length} with no one</span>` : ''}</div>${pointsBoard({ ...s, points: s.points.filter((p) => !p.takers.includes('@me')) }, 'live', since)}</div>`;
  } else {
    const cur = a === 'invited' ? null : a; const mp = myPoints(s);
    const s1 = cur ? 'ok' : 'on', s2 = cur === 'going' ? (mp.length ? 'ok' : 'on') : 'off', s3 = cur === 'going' && mp.length ? 'ok' : 'off';
    h += `<div class="section"><div class="card stepper">
      <div class="st ${s1}"><span class="num">${s1 === 'ok' ? I.check : 1}</span><div><h4>${a === 'invited' ? 'You\'re invited — will you come?' : 'Will you come?'}</h4>${respButtons('seva', id, cur, S.minor)}${S.minor ? '<p class="xs muted" style="margin-top:8px">Joining opens after guardian approval.</p>' : ''}</div></div>
      <div class="st ${s2}"><span class="num">${s2 === 'ok' ? I.check : 2}</span><div><h4>Pick the points you'll do</h4>${cur === 'going' ? `<p class="xs muted" style="margin:-4px 0 10px">Choose one or more. Others can pick the same point too.</p>${pointsBoard(s, 'join', 0)}` : `<p class="xs muted">${cur === 'maybe' ? 'Choose Going to pick points.' : 'After you choose Going, you\'ll pick what you\'ll do.'}</p>`}</div></div>
      <div class="st ${s3}"><span class="num">${s3 === 'ok' ? I.check : 3}</span><div><h4>${s3 === 'ok' ? 'You\'re all set' : 'Get reminders'}</h4>${s3 === 'ok' ? `<p class="small">You'll do: <b>${esc(mp.map((p) => p.text).join(', '))}</b></p><p class="xs muted" style="margin-top:6px">We'll remind you the evening before and 1 hour before. ${esc(first(s.lead))} can see your points.</p><div class="btn-row" style="margin-top:10px"><button class="btn sm soft" data-act="cal" data-id="${id}">${I.cal} Add to calendar</button></div>` : '<p class="xs muted">Reminders turn on when you pick a point.</p>'}</div></div>
    </div></div>`;
    if (cur !== 'going') h += `<div class="section"><div class="section-h"><h2>Points</h2><span class="xs muted">${openPts(s)} still need people</span></div>${pointsBoard(s, 'join', 0)}</div>`;
  }
  h += `<div class="section"><div class="section-h"><h2>${live ? 'Sangat at this seva' : 'Who\'s coming'}</h2></div>${peopleBlock(id, ppl, live)}</div>`;
  if (!lead) h += `<div class="section"><div class="card"><div class="row"><span class="avatar" style="width:46px;height:46px">${initials(s.lead)}</span><div class="grow"><b>${esc(s.lead)}</b><p class="xs muted">Seva lead</p></div></div><div class="btn-row" style="margin-top:12px"><button class="btn sm" data-act="lead-wa" data-id="${id}">${I.wa} Message lead</button><button class="btn sm ghost" data-act="lead-call" data-id="${id}">${I.phone} Call</button></div></div></div>`;
  if (s.updates.length) h += `<div class="section"><div class="section-h"><h2>Updates</h2></div><div class="card list">${s.updates.map((u) => `<div class="lrow">${(u.kind === 'new' ? I.sparkle : u.kind === 'edit' ? I.edit : I.megaphone).replace('<svg', '<svg style="width:20px;height:20px;color:var(--muted)"')}<span class="grow"><b class="small" style="display:block">${esc(u.t)}</b><span class="xs muted">${relDay(u.d)} · ${fmtTime(u.d)} · ${esc(u.by)}</span></span>${T(u.d) > since ? '<span class="newtag">NEW</span>' : ''}</div>`).join('')}</div></div>`;
  h += `<div class="section"><div class="section-h"><h2>Details</h2></div><div class="card"><div class="kv"><div class="r">${I.info}<div><b>${esc(s.purpose)}</b><span>${esc(s.instructions)}</span></div></div><div class="r">${I.clock}<div><b>${fmtLong(s.start)}, ${fmtTime(s.start)} – ${fmtTime(s.end)}</b><span>Your local time (${esc(tz)})</span></div></div></div></div></div>`;
  if (!live) h += `<div class="btn-row" style="margin-top:16px"><button class="btn ghost" data-act="cal" data-id="${id}">${I.cal} Calendar</button><button class="btn ghost" data-act="wa" data-id="${id}">${I.wa} WhatsApp</button></div>`;
  if (live && !lead && a === 'going') h += `<div class="demo"><p class="h">Prototype controls</p><button class="btn sm ghost" data-act="demo-end" data-id="${id}">End this seva now</button><p class="xs faint" style="margin-top:8px">Shows "Awaiting verification" and then the lead's verification.</p></div>`;
  return h;
}
function stepsHTML(cur) { const L = ['Scheduled', 'In progress', 'Submitted', 'Verified']; return `<div class="steps"><span class="bar2" style="width:calc((100% - 24px) * ${Math.min(cur, 3) / 3})"></span>${L.map((l, i) => `<div class="step ${i < cur ? 'done' : i === cur ? 'now' : ''}"><i>${i < cur ? I.check : ''}</i>${l}</div>`).join('')}</div>`; }
function HistoryDetail({ id }) {
  const h = S.history.find((x) => x.id === id); if (!h) return backHead('Record') + emptyState('Record not found', '');
  const ok = h.state === 'verified';
  return `${backHead('Seva record', ok ? `<button class="iconbtn" data-act="share" data-h="${id}" aria-label="Share">${I.share}</button>` : '')}
    <div class="dhero cc-${h.cat}"><span class="chip ${ok ? 'done' : 'action'}">${ok ? I.checkc + 'Verified' : I.hourglass + 'Awaiting verification'}</span><h1>${esc(h.title)}</h1><p class="when">${fmtLong(h.date)} · ${h.hrs} hours · ${esc(h.role)}</p></div>
    <div class="section"><div class="card">${stepsHTML(ok ? 4 : 2)}<p class="xs muted" style="margin-top:14px">${ok ? 'Your lead confirmed your attendance, so it counts toward your journey and garden.' : 'It counts once your lead verifies it.'}</p></div></div>
    ${ok ? `<button class="btn block" style="margin-top:16px" data-act="share" data-h="${id}">${I.share} Share this seva</button>` : `<div class="demo"><p class="h">Prototype controls</p><button class="btn sm ghost" data-act="demo-verify" data-id="${id}">Lead verifies attendance</button></div>`}`;
}

// ----- Event detail -----
function EventDetail({ id }) {
  const e = ev(id); if (!e) return backHead('Event') + emptyState('Event not found', '');
  markSeen(id); const r = S.rsvp[id]; const linked = e.linked && sv(e.linked);
  const days = Math.max(0, Math.ceil((T(e.start) - now()) / DAY));
  const ppl = []; if (r) ppl.push({ n: ME(), me: true, st: r === 'no' ? 'cant' : r });
  NAMES.slice(e.sample, e.sample + 12).forEach((n, i) => ppl.push({ n, st: i < 8 ? 'going' : i < 11 ? 'maybe' : 'cant' }));
  return `${backHead('Event', `<button class="iconbtn" data-act="wa-e" data-id="${id}" aria-label="Share">${I.share}</button>`)}
    <div class="dhero cc-event"><span class="chip event">${I.cal}${esc(e.kind)}</span><h1>${esc(e.title)}</h1><p class="when">${span(e.start, e.end)}</p>
      <div class="metal"><div>${I.pin}<span>${esc(e.place)}</span></div><div>${I.clock}<span><b>${days} day${days === 1 ? '' : 's'}</b> to go</span></div></div></div>
    <div class="section"><div class="card"><h4 style="margin:0 0 10px;font-size:15.5px">Will you come?</h4>${respButtons('event', id, r === 'no' ? 'cant' : r)}</div></div>
    <div class="section"><div class="section-h"><h2>Who's going</h2></div>${peopleBlock(id, ppl, false, { going: e.going, maybe: e.maybe, cant: e.cant })}</div>
    <div class="section"><div class="section-h"><h2>Agenda</h2></div><div class="card list">${e.agenda.map((x, i) => `<div class="lrow"><span class="avatar" style="width:30px;height:30px;font-size:12px;background:var(--event-bg);color:var(--event)">${i + 1}</span><b class="small">${esc(x)}</b></div>`).join('')}</div></div>
    ${linked ? `<div class="section"><div class="section-h"><h2>Volunteer at this event</h2></div>${sevaRow(linked)}</div>` : ''}
    <div class="btn-row" style="margin-top:16px"><button class="btn ghost" data-act="cal-e" data-id="${id}">${I.cal} Calendar</button><button class="btn ghost" data-act="wa-e" data-id="${id}">${I.wa} Share</button></div>`;
}

// ----- Garden -----
function GardenTab() {
  const v = verified().length; const un = ITEM_ORDER.filter(isUnlocked);
  const nextL = ITEM_ORDER.filter((x) => !isUnlocked(x) && itemDef(x).u.n).sort((a, b) => itemDef(a).u.n - itemDef(b).u.n)[0];
  const is3 = S.gview === '3d';
  return `<div class="hdr">${brand()}${headerBtns()}</div>
    <h1 class="hero-title" style="font-size:28px">My garden</h1><p class="hero-sub">Private · grows with every verified seva</p>
    <div class="seg" style="margin-top:16px" role="group"><button data-gv="2d" aria-pressed="${!is3}">${I.square} 2D</button><button data-gv="3d" aria-pressed="${is3}">${I.cube} 3D</button></div>
    <div style="margin-top:12px">${is3 ? `<div class="g3d" id="g3d"><div class="loading">Planting your garden…</div><div class="tools"><button data-act="g3-reset" aria-label="Reset view">${I.reset}</button></div><span class="hint" id="g3hint">Drag to turn · pinch to zoom · tap a plant</span></div>` : `<div class="garden-wrap ${gardenEdit ? 'editing' : ''}" id="pgarden">${personalSVG()}</div>`}</div>
    ${gardenEdit ? `<p class="small muted" style="margin:12px 2px 6px">Pick something, then tap a square to place it.</p><div class="tray">${ITEM_ORDER.map((id) => { const ok = isUnlocked(id); return `<button class="titem ${ok ? '' : 'locked'}" data-tool="${id}" aria-pressed="${gardenTool === id}">${ok ? '' : I.lock.replace('<svg', '<svg class="lk"')}${thumb(id, '')}${itemDef(id).name.split(' ')[0]}</button>`; }).join('')}<button class="titem" data-tool="erase" aria-pressed="${gardenTool === 'erase'}">${I.erase.replace('<svg', '<svg style="width:40px;height:40px;color:var(--muted)"')}Remove</button></div><button class="btn block" style="margin-top:6px" data-act="garden-done">Done</button>`
      : `<div class="btn-row" style="margin-top:12px">${is3 ? `<button class="btn ghost" data-gv="2d">${I.edit} Design in 2D</button>` : `<button class="btn" data-act="garden-edit">${I.edit} Design my garden</button>`}</div>`}
    <div class="section"><div class="section-h"><h2>Unlocks</h2><span class="xs muted">${un.length} of ${ITEM_ORDER.length}</span></div>
      ${nextL ? `<div class="card" style="margin-bottom:10px;background:linear-gradient(135deg,var(--p-soft),var(--surface) 70%)"><div class="row">${thumb(nextL, '').replace('<svg', '<svg style="width:54px;height:54px"')}<div class="grow"><span class="kicker" style="color:var(--p)">Next unlock</span><b style="display:block">${itemDef(nextL).name}</b><span class="xs muted">${v} of ${itemDef(nextL).u.n} verified seva</span><div class="bar"><i style="width:${Math.min(100, v / itemDef(nextL).u.n * 100)}%"></i></div></div></div></div>` : ''}
      <div class="card list">${ITEM_ORDER.filter((x) => GI[x]).map((id) => { const ok = isUnlocked(id); return `<div class="lrow">${thumb(id)}<div class="grow"><b class="small">${GI[id].name}</b><p class="xs muted">${ok ? 'Unlocked · ' : ''}${unlockText(GI[id].u)}</p></div>${ok ? `<span class="chip done">${I.check}Yours</span>` : `<span class="chip">${I.lock}Locked</span>`}</div>`; }).join('')}</div>
      <button class="btn soft block" style="margin-top:10px" data-act="sim-seva">Prototype: pretend I finished a seva</button></div>`;
}
function itemSheet(cell) {
  const id = S.pg.items[cell]; if (!id) return; const d = GI[id];
  openSheet(`${sheetHead(d.name, 'My garden')}<div class="item-hero"><svg viewBox="-36 -62 72 70">${d.d()}</svg></div><p class="small" style="margin-top:14px">${esc(d.desc)}</p><div class="card" style="margin-top:12px"><p class="xs muted">How you unlocked it</p><b class="small">${unlockText(d.u)}</b></div>
    <div class="btn-row" style="margin-top:16px"><button class="btn ghost" data-act="garden-edit-from-sheet">${I.edit} Move or change</button>${S.gview === '3d' ? '' : `<button class="btn" data-act="see3d" data-cell="${cell}">${I.cube} See in 3D</button>`}</div>`);
}
let g3 = null, g3focus = null;
function loadScript(src) { return new Promise((res, rej) => { if ([...document.scripts].some((s) => s.src.endsWith(src))) return res(); const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
async function mount3D() {
  const host = $('#g3d'); if (!host) return;
  try { if (!window.THREE) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'); if (!window.Garden3D) await loadScript('garden3d.js'); }
  catch (e) { const l = host.querySelector('.loading'); if (l) l.textContent = '3D needs an internet connection the first time.'; return; }
  if (!document.body.contains(host)) return;
  host.querySelector('.loading')?.remove();
  g3 = window.Garden3D.mount(host, { size: GW, tiles: S.pg.tiles, items: S.pg.items, dark: isDark(), focus: g3focus, onTap: (c) => itemSheet(c) });
  g3focus = null; setTimeout(() => { const h = $('#g3hint'); if (h) h.style.opacity = '0'; }, 4000);
}
function unmount3D() { if (g3) { g3.destroy(); g3 = null; } }
function remount3D() { if (tab === 'garden' && S.gview === '3d' && !stack.length) { unmount3D(); const host = $('#g3d'); if (host) mount3D(); } }

// ----- Community -----
function Community() {
  const types = [['all', 'All', null], ['seva', 'Seva stories', 'var(--c-cleanup)'], ['event', 'Events', 'var(--c-event)'], ['update', 'Alerts', 'var(--action-c)']];
  const posts = S.posts.filter((p) => feedScope === 'local' ? p.scope === 'local' : true).filter((p) => feedType === 'all' || p.type === feedType || (feedType === 'seva' && p.type === 'milestone')).sort((a, b) => (b.type === 'update') - (a.type === 'update') || T(b.date) - T(a.date));
  return `<div class="hdr">${brand()}${headerBtns()}</div>
    <h1 class="hero-title" style="font-size:28px">Community</h1><p class="hero-sub">Official stories from seva and events</p>
    <div class="seg" style="margin-top:16px" role="group"><button data-scope="local" aria-pressed="${feedScope === 'local'}">Delhi</button><button data-scope="world" aria-pressed="${feedScope === 'world'}">${I.globe} Worldwide</button></div>
    <button class="card tap" style="margin-top:14px;padding:0;overflow:hidden" data-open="ggarden"><div class="garden-wrap" style="border-radius:0">${groupGardenSVG(S.ggarden)}</div><div class="row" style="padding:12px 16px"><div class="grow"><b class="small">Delhi community garden</b><p class="xs muted">Grows with every verified seva by the group · level ${S.ggarden} of 8</p></div>${chev}</div></button>
    <div class="fchips" style="margin-top:14px">${types.map(([v, l, c]) => `<button class="fchip" data-ft="${v}" aria-pressed="${feedType === v}">${c ? `<i class="dotc" style="background:${c}"></i>` : ''}${l}</button>`).join('')}</div>
    <div class="stack" style="margin-top:10px">${posts.map(postCard).join('')}</div>
    <p class="xs faint" style="text-align:center;margin-top:16px">No comments, no member posts, no rankings.</p>`;
}
const PT = { seva: ['Seva story', 'done'], event: ['Event', 'event'], update: ['Important alert', 'action'], milestone: ['Garden milestone', 'p'] };
function postCard(p) {
  const [lbl, cls] = PT[p.type]; const c = p.type === 'update' ? 'langar' : p.cat;
  return `<article class="card post cc-${c}" ${p.type === 'update' ? 'style="--cc:var(--action-c);background:linear-gradient(180deg,var(--action-bg),var(--surface) 60%)"' : ''}><div class="head">${cico(p.cat)}<div class="grow"><span class="chip ${cls}">${lbl}</span><p class="xs muted" style="margin-top:4px">${esc(p.city)} · ${relDay(p.date)}</p></div></div>
    <div class="body"><h3>${esc(p.title)}</h3><p class="small muted" style="margin-top:4px">${esc(p.text)}</p>${p.link ? `<button class="link" data-open="${p.link}">${p.type === 'event' ? 'View event' : p.link === 'ggarden' ? 'Open garden' : 'View details'} ${I.chev}</button>` : ''}${p.type !== 'update' ? reacts(p) : ''}</div></article>`;
}
function reacts(p) { const mine = S.mine[p.id]; return `<div class="reacts">${[['g', '🙏', 'Gratitude'], ['a', '💚', 'Appreciate'], ['c', '👏', 'Applause']].map(([k, e, l]) => { const n = p.r[k] + (mine === k ? 1 : 0); return `<button class="react" data-react="${p.id}:${k}" aria-pressed="${mine === k}" aria-label="${l}, ${n}"><span aria-hidden="true">${e}</span>${n}</button>`; }).join('')}</div>`; }
function GroupGarden() {
  const L = ['First flowers', 'A garden path', 'Rose beds', 'The mango tree', 'Lanterns lit', 'The banyan', 'Lotus pond and bench', 'Peacocks arrive'];
  return `${backHead('Delhi garden')}<div class="garden-wrap">${groupGardenSVG(S.ggarden)}</div><p class="small muted" style="margin-top:12px">This garden belongs to everyone in Delhi Central. It grows when the group completes verified seva together. It never wilts, and nobody is ranked.</p>
    <div class="section"><div class="section-h"><h2>Milestones</h2><span class="xs muted">Level ${S.ggarden} of 8</span></div><div class="card list">${L.map((t, i) => `<div class="lrow">${i < S.ggarden ? `<span class="chip done">${I.check}Reached</span>` : `<span class="chip">Level ${i + 1}</span>`}<span class="small grow">${t}</span></div>`).join('')}</div></div>`;
}

// ----- Profile -----
function Profile() {
  const v = verified(); const hrs = v.reduce((n, h) => n + h.hrs, 0); const cats = new Set(v.map((h) => h.cat));
  return `<div class="hdr">${brand()}<div class="hbtns"><button class="iconbtn" data-act="inbox" aria-label="Inbox">${I.bell}${unread() ? `<span class="nb">${unread()}</span>` : ''}</button></div></div>
    <div class="row" style="margin:22px 0 18px"><span class="avatar" style="width:64px;height:64px;font-size:22px">${initials(ME())}</span><div><h1 style="font-size:25px;letter-spacing:-.02em">${esc(ME())}</h1><p class="small muted">Delhi Central · ${{ member: 'Member', lead: 'Team Lead', admin: 'Main Admin' }[S.role]}</p></div></div>
    <div class="card"><div class="row" style="margin-bottom:14px"><b class="grow">My journey</b><span class="chip">${I.lock}Private</span></div>
      <div class="stats3"><div><b class="grad">${v.length}</b><span>Verified seva</span></div><div><b class="grad">${hrs % 1 ? hrs.toFixed(1) : hrs}</b><span>Hours given</span></div><div><b class="grad">${cats.size}</b><span>Kinds of seva</span></div></div>
      <div class="legend" style="margin-top:14px">${['langar', 'cleanup', 'tree', 'education', 'blanket'].map((c) => `<span class="lchip cc-${c}" style="${cats.has(c) ? '' : 'opacity:.4'}">${cico(c, true)}<span class="t">${CAT[c].label}</span></span>`).join('')}</div></div>
    <div class="card list" style="margin-top:12px">
      <button class="lrow" data-act="goto-mine">${cico('langar', true)}<span class="grow"><b class="small">My Seva</b><p class="xs muted">Live, upcoming, replies, done</p></span>${chev}</button>
      <button class="lrow" data-tab="garden">${cico('tree', true)}<span class="grow"><b class="small">My garden</b><p class="xs muted">${ITEM_ORDER.filter(isUnlocked).length} of ${ITEM_ORDER.length} unlocked</p></span>${chev}</button>
      <button class="lrow" data-act="share">${cico('event', true)}<span class="grow"><b class="small">Share my seva</b><p class="xs muted">Image card for WhatsApp status or stories</p></span>${chev}</button></div>
    <div class="section"><div class="section-h"><h2>Appearance</h2></div><div class="card">
      <div class="seg">${[['auto', 'System'], ['light', 'Light'], ['dark', 'Dark']].map(([k, l]) => `<button data-setmode="${k}" aria-pressed="${S.mode === k}">${l}</button>`).join('')}</div>
      </div></div></div>
    <div class="section"><div class="section-h"><h2>Notifications</h2></div><div class="card list">
      <div class="lrow"><div class="grow"><b class="small">Seva reminders</b><p class="xs muted">Evening before and 1 hour before, for points you picked</p></div><span class="chip done">${I.check}On</span></div>
      <div class="lrow"><div class="grow"><b class="small">Live updates</b><p class="xs muted">When a lead adds or changes a point during seva</p></div><span class="chip done">${I.check}On</span></div>
      <div class="lrow"><div class="grow"><b class="small">Push on this phone</b><p class="xs muted">${matchMedia('(display-mode: standalone)').matches || navigator.standalone ? 'Available in the installed app' : 'Add to Home Screen first (needed on iPhone)'}</p></div><button class="btn sm soft" data-act="push">Test</button></div></div></div>
    <div class="section"><div class="section-h"><h2>View the app as</h2><span class="chip">Prototype</span></div><div class="card">
      <div class="roles3">${[['member', 'Member', I.user], ['lead', 'Team Lead', I.flag], ['admin', 'Main Admin', I.shield]].map(([k, l, ic]) => `<button data-role="${k}" aria-pressed="${S.role === k}">${ic}${l}</button>`).join('')}</div>
      <p class="xs muted" style="margin-top:10px">Team Lead can create seva, add or edit points (even while live) and see who is doing what. Main Admin sees every group.</p>
      <p class="small" style="font-weight:650;margin:16px 0 8px">Member state</p>
      <div class="seg">${[['new', 'New'], ['active', 'Active'], ['less', 'Less active']].map(([k, l]) => `<button data-scn="${k}" aria-pressed="${S.scenario === k}">${l}</button>`).join('')}</div>
      <button class="btn sm ghost block" style="margin-top:12px" data-act="reset">Reset prototype</button></div></div>
    <p class="xs faint" style="text-align:center;margin-top:20px">Namdhari Seva &amp; Community · prototype v5</p>`;
}

// ----- Inbox -----
const NL = { live: ['live', I.bell], action: ['action', I.alert], p: ['p', I.sparkle], done: ['done', I.checkc] };
function Inbox() {
  const list = S.notifs.slice(); setTimeout(() => { S.notifs.forEach((n) => n.read = true); save(); }, 0);
  return `${backHead('Inbox')}<h1 class="hero-title" style="font-size:28px;margin-top:4px">Inbox</h1><p class="hero-sub">Reminders, live updates and replies — even without push.</p>
    <div class="card list" style="margin-top:16px">${list.map((n) => { const [c, ic] = NL[n.level] || NL.p; return `<button class="lrow" data-open="${n.ref}"><span class="chip ${c}" style="width:40px;height:40px;padding:0;justify-content:center;border-radius:50%">${ic.replace('<svg', '<svg style="width:19px;height:19px"')}</span><span class="grow"><b class="small" style="display:block">${esc(n.t)}</b><span class="xs muted">${relDay(n.d)} · ${fmtTime(n.d)}</span></span>${n.read ? '' : '<span class="newtag">NEW</span>'}</button>`; }).join('')}</div>`;
}

// ---------- Sheets ----------
function openSheet(html) { $('#sheet-root').innerHTML = `<div class="scrim" data-act="close-sheet"></div><div class="sheet" role="dialog" aria-modal="true"><div class="grabber"></div>${html}</div>`; document.body.style.overflow = 'hidden'; }
function closeSheet() { $('#sheet-root').innerHTML = ''; document.body.style.overflow = ''; }
const sheetHead = (t, sub) => `<div class="sheet-h"><div>${sub ? `<p class="xs muted">${sub}</p>` : ''}<h2>${t}</h2></div><button class="iconbtn" data-act="close-sheet" aria-label="Close">${I.close}</button></div>`;
function actionSheet(id) {
  const a = S.actions.find((x) => x.id === id); if (!a || a.resolved) return; const s = sv(a.ref);
  openSheet(`${sheetHead(esc(a.title), a.kind === 'invite' ? 'Invitation' : 'Reply needed')}${sevaRow(s)}
    <p class="small" style="margin:16px 0 10px;font-weight:650">${a.kind === 'invite' ? 'Will you join?' : 'Are you still coming?'}</p>${respButtons('action', id, a.kind === 'invite' ? null : st(s))}
    <p class="xs muted" style="margin-top:12px">Please reply by ${relDay(a.due).toLowerCase()}, ${fmtTime(a.due)}. ${esc(first(s.lead))} sees your answer straight away.</p>`);
}
const TEMPLATES = { cleanup: [['Lay carpets in the main hall', 4], ['Sweep and mop the floor', 3], ['Clean windows and fans', 2], ['Arrange the shoe racks', 2]], langar: [['Cook dal and sabzi', 3], ['Make rotis', 4], ['Serve langar', 6], ['Wash utensils', 3]], tree: [['Dig pits', 6], ['Plant saplings', 6], ['Carry water', 4]], education: [['Read with a small group', 4], ['Set up the room', 1]], blanket: [['Load blankets', 4], ['Hand out blankets', 8], ['Drive a van', 3]] };
let draft = null;
function createSheet() {
  if (!draft) draft = { cat: 'cleanup', title: 'Gurdwara Hall Cleaning', points: TEMPLATES.cleanup.map(([t, n]) => ({ t, n })) };
  const local = new Date(now() + 3 * DAY - new Date().getTimezoneOffset() * MIN).toISOString().slice(0, 13) + ':00';
  openSheet(`${sheetHead('Create a seva', 'Team Lead')}
    <label class="f">Type</label><div class="fchips">${Object.keys(TEMPLATES).map((c) => `<button class="fchip" data-dcat="${c}" aria-pressed="${draft.cat === c}"><i class="dotc" style="background:var(--c-${c})"></i>${CAT[c].label}</button>`).join('')}</div>
    <label class="f" for="d-title">Title</label><input class="in" id="d-title" value="${esc(draft.title)}">
    <div class="btn-row"><div style="flex:1"><label class="f" for="d-date">When</label><input class="in" id="d-date" type="datetime-local" value="${local}"></div></div>
    <label class="f" for="d-place">Where</label><input class="in" id="d-place" value="Namdhari Gurdwara, Karol Bagh">
    <label class="f">Points — the work to be done</label>
    <p class="xs muted" style="margin-top:-2px">Members pick the points they'll do. Set how many people each needs.</p>
    <div id="d-points">${draft.points.map((p, i) => `<div class="ptedit"><input class="in" data-dpt="${i}" value="${esc(p.t)}" aria-label="Point ${i + 1}"><div class="stepnum"><button data-act="dneed" data-i="${i}" data-d="-1" aria-label="Fewer people">−</button><span>${p.n}</span><button data-act="dneed" data-i="${i}" data-d="1" aria-label="More people">+</button></div><button class="iconbtn" style="width:40px;height:40px;box-shadow:none" data-act="ddel" data-i="${i}" aria-label="Remove point">${I.trash.replace('<svg', '<svg style="width:17px;height:17px"')}</button></div>`).join('')}</div>
    <button class="btn sm soft" style="margin-top:10px" data-act="dadd">${I.plus} Add point</button>
    <div style="margin-top:20px"><button class="btn block" data-act="publish">Publish to Delhi Central</button><p class="xs muted" style="text-align:center;margin-top:8px">Members see it marked NEW and get a notification.</p></div>`);
}
function syncDraft() { $$('[data-dpt]').forEach((el) => { draft.points[+el.dataset.dpt].t = el.value; }); const t = $('#d-title'); if (t) draft.title = t.value; }
function pointSheet(sid, pid) {
  const s = sv(sid); const p = pid ? s.points.find((x) => x.id === pid) : { text: '', need: 2 };
  openSheet(`${sheetHead(pid ? 'Edit point' : 'Add a point', esc(s.title))}
    <label class="f" for="pt-text">What needs doing?</label><input class="in" id="pt-text" value="${esc(p.text)}" placeholder="e.g. Clean the stage area">
    <label class="f">People needed</label><div class="stepnum" style="width:max-content"><button data-act="ptneed" data-d="-1">−</button><span id="pt-need">${p.need}</span><button data-act="ptneed" data-d="1">+</button></div>
    ${isLive(s) ? `<div class="banner" style="margin-top:16px">${I.bell}<span>This seva is live. Everyone at the seva gets an alert about this change.</span></div>` : ''}
    <button class="btn block" style="margin-top:16px" data-act="ptsave" data-id="${sid}" data-p="${pid || ''}">${pid ? 'Save changes' : 'Add point'}</button>`);
  setTimeout(() => $('#pt-text')?.focus(), 250);
}
function updateSheet(sid) {
  openSheet(`${sheetHead('Post an update', esc(sv(sid).title))}<label class="f" for="up-text">Message</label><input class="in" id="up-text" placeholder="e.g. Tea break at 11:00 in the courtyard"><button class="btn block" style="margin-top:16px" data-act="updsave" data-id="${sid}">Send to everyone at this seva</button>`);
}
function install() {
  if (window.__dp) { window.__dp.prompt(); return; }
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const st2 = ios ? ['Open this page in <b>Safari</b>', 'Tap <b>Share</b> in the toolbar', 'Tap <b>Add to Home Screen</b>, then <b>Add</b>'] : ['Open in <b>Chrome</b>', 'Tap the <b>⋮</b> menu', 'Tap <b>Install app</b> or <b>Add to Home screen</b>'];
  openSheet(`${sheetHead('Add to Home Screen')}<div class="card list">${st2.map((t, i) => `<div class="lrow"><span class="avatar" style="width:32px;height:32px">${i + 1}</span><span class="small">${t}</span></div>`).join('')}</div><button class="btn ghost block" style="margin-top:12px" data-act="noinstall">Not now</button>`);
}

// ---------- Share cards ----------
let shareKind = 'month', shareH = null, shareIdx = 0;
const STYLES = [['dark', 'Dark'], ['light', 'Light'], ['clear', 'Transparent']];
function cardSVG(style) {
  const v = verified(); const m = v.filter((h) => { const d = new Date(h.date); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); });
  const one = shareKind === 'seva' ? ((shareH && S.history.find((x) => x.id === shareH && x.state === 'verified')) || v[0]) : null;
  const W = 600, H = 750; const dark = style !== 'light';
  const bg = style === 'dark' ? '#0D0E14' : style === 'light' ? '#F5F5FB' : null;
  const panel = style === 'clear' ? 'rgba(13,14,20,.82)' : dark ? '#161824' : '#FFFFFF'; const ink = dark ? '#F3F4F8' : '#12121A', mute = dark ? '#A3A7BC' : '#5F6274';
  const F = 'font-family="Inter,-apple-system,Segoe UI,Roboto,sans-serif"';
  const COL = { langar: '#F97316', cleanup: '#0EA5A0', tree: '#22A34A', education: '#3B82F6', blanket: '#EC4899', event: '#8B5CF6' };
  let body;
  if (one) {
    const tt = one.title.length > 24 ? one.title.slice(0, 23) + '…' : one.title;
    body = `<rect x="60" y="140" width="480" height="450" rx="36" fill="${panel}"/><circle cx="300" cy="230" r="50" fill="${COL[one.cat]}" opacity=".18"/><circle cx="300" cy="230" r="22" fill="${COL[one.cat]}"/>
      <text x="300" y="345" text-anchor="middle" font-size="34" font-weight="800" fill="${ink}" ${F}>${esc(tt)}</text><text x="300" y="386" text-anchor="middle" font-size="20" fill="${mute}" ${F}>${esc(fmtLong(one.date))} • Delhi</text>
      <rect x="205" y="414" width="190" height="46" rx="23" fill="${dark ? '#12301D' : '#DCFCE7'}"/><text x="300" y="444" text-anchor="middle" font-size="19" font-weight="700" fill="${dark ? '#4ADE80' : '#15803D'}" ${F}>✓ Verified seva</text>
      <text x="300" y="520" text-anchor="middle" font-size="20" fill="${mute}" ${F}>${esc(one.role)} • ${one.hrs} hours</text>`;
  } else {
    const hrs = m.reduce((s, h) => s + h.hrs, 0); const cats = [...new Set(v.map((h) => h.cat))].slice(0, 5);
    body = `<rect x="60" y="140" width="480" height="450" rx="36" fill="${panel}"/><text x="300" y="205" text-anchor="middle" font-size="24" font-weight="800" fill="${ink}" ${F}>My Seva • ${esc(new Date().toLocaleDateString(undefined, { month: 'long' }))}</text><text x="300" y="240" text-anchor="middle" font-size="18" fill="${mute}" ${F}>Delhi Central</text>
      <defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stop-color="#5B5BF0"/><stop offset="1" stop-color="#8B5CF6"/></linearGradient></defs>
      <text x="180" y="355" text-anchor="middle" font-size="96" font-weight="800" fill="url(#gg)" ${F}>${m.length}</text><text x="180" y="395" text-anchor="middle" font-size="19" fill="${mute}" ${F}>seva this month</text>
      <text x="420" y="355" text-anchor="middle" font-size="96" font-weight="800" fill="url(#gg)" ${F}>${hrs % 1 ? hrs.toFixed(1) : hrs}</text><text x="420" y="395" text-anchor="middle" font-size="19" fill="${mute}" ${F}>hours given</text>
      ${cats.map((c, i) => `<circle cx="${300 - (cats.length - 1) * 28 + i * 56}" cy="465" r="18" fill="${COL[c]}"/>`).join('')}
      <text x="300" y="545" text-anchor="middle" font-size="18" fill="${mute}" font-weight="600" ${F}>${v.length} verified seva in total</text>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${bg ? `<rect width="${W}" height="${H}" fill="${bg}"/>` : ''}${body}<g transform="translate(300 650)"><rect x="-120" y="-26" width="240" height="52" rx="26" fill="${panel}"/><text x="0" y="7" text-anchor="middle" font-size="19" font-weight="800" letter-spacing="3" fill="${ink}" ${F}>NAMDHARI SEVA</text></g></svg>`;
}
function shareSheet(hid) {
  if (hid) { shareKind = 'seva'; shareH = hid; } if (!verified().length) shareKind = 'month';
  openSheet(`${sheetHead('Share', 'For WhatsApp status or stories')}<div class="share-tabs"><button data-sk="month" aria-pressed="${shareKind === 'month'}">This month</button>${verified().length ? `<button data-sk="seva" aria-pressed="${shareKind === 'seva'}">${shareH ? 'This seva' : 'Latest seva'}</button>` : ''}</div>
    <div class="carousel" id="car">${STYLES.map(([k, l]) => `<div class="slide ${k === 'clear' ? 'checker' : ''}"><span class="stl">${l}</span>${cardSVG(k)}</div>`).join('')}</div><div class="dots">${STYLES.map((_, i) => `<i class="${i === shareIdx ? 'on' : ''}"></i>`).join('')}</div>
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
function notify(level, t, ref) { S.notifs.unshift({ id: uid(), level, t, d: iso(now()), ref }); }
function addUpdate(s, t, kind) { s.updates.unshift({ id: uid(), t, d: iso(now() + 1000), by: S.role === 'admin' ? 'Main Admin' : s.lead, kind }); S.seenUpd[seenKey(s.id)] = now() + 2000; }
function setSevaResponse(sid, v) {
  const s = sv(sid); const prev = st(s);
  if (v === 'cant' && myPoints(s).length && !confirm('Release your points? Your lead is told so someone else can pick them.')) return false;
  S.assign[sid] = { state: v };
  if (v !== 'going') s.points.forEach((p) => { p.takers = p.takers.filter((t) => t !== '@me'); });
  openActions().filter((a) => a.ref === sid).forEach((a) => a.resolved = true);
  save(); toast(v === 'going' ? (prev === 'going' ? 'You\'re going' : 'You\'re going — now pick your points') : v === 'maybe' ? 'Marked as maybe' : 'Thanks for letting your lead know');
  return true;
}
function setEventResponse(eid, v) { const e = ev(eid); const prev = S.rsvp[eid]; const k = (x) => x === 'no' ? 'cant' : x; if (prev) e[k(prev)]--; S.rsvp[eid] = v === 'cant' ? 'no' : v; e[v]++; save(); toast(v === 'going' ? 'RSVP confirmed — added to your calendar' : v === 'maybe' ? 'Marked as maybe' : 'Thanks for letting the organizer know'); }
function openRef(ref) { const [k, v] = ref.split(':'); if (k === 'seva' || k === 'event' || k === 'history') push({ v: k, id: v }); else if (k === 'ggarden') push({ v: 'ggarden' }); else if (k === 'action') actionSheet(v); else if (k === 'tab') go(v); }
const shareText = (kind, x) => `${kind === 'seva' ? '🙏 ' : ''}${x.title}\n${relDay(x.start)} · ${fmtTime(x.start)} · ${x.place}\n${location.origin}${location.pathname}#${kind}=${x.id}`;
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
function unlockToast(before) { const f = ITEM_ORDER.filter(isUnlocked).filter((x) => !before.includes(x)); if (f.length) setTimeout(() => toast(`New in your garden: ${f.map((x) => itemDef(x).name).join(', ')} 🌱`), 500); }

function handle(el) {
  const act = el.dataset.act, id = el.dataset.id; buzz();
  switch (act) {
    case 'onb-next': onb = 1; renderOnboarding(); break;
    case 'onb-finish': { const n = ($('#onb-name')?.value || '').trim(); if (!n) { toast('Please add your name'); return; } S.name = n; S.minor = $('#onb-age').value === 'minor'; S.onboarded = true; save(); tab = 'home'; render(); toast(S.minor ? 'Guardian approval link sent' : 'Welcome to Delhi Central'); break; }
    case 'back': pop(); break;
    case 'close-sheet': closeSheet(); if (!g3) rerender(); break;
    case 'inbox': push({ v: 'inbox' }); break;
    case 'share': closeSheet(); shareSheet(el.dataset.h); break;
    case 'goto-mine': sevaSeg = 'mine'; mySevaTab = smartMyTab(); go('seva'); break;
    case 'action': actionSheet(id); break;
    case 'cal-prev': calM--; if (calM < 0) { calM = 11; calY--; } calPop = null; calDir = -1; rerender(); calDir = 0; break;
    case 'cal-today': calY = new Date().getFullYear(); calM = new Date().getMonth(); calPop = ymd(now()); calDir = 0; rerender(); break;
    case 'cal-close': calPop = null; rerender(); break;
    case 'cal-next': calM++; if (calM > 11) { calM = 0; calY++; } calPop = null; calDir = 1; rerender(); calDir = 0; break;
    case 'respond': {
      const v = el.dataset.v, kind = el.dataset.kind;
      if (kind === 'event') { setEventResponse(id, v); rerender(); break; }
      let sid = id; if (kind === 'action') { sid = S.actions.find((x) => x.id === id).ref; }
      if (setSevaResponse(sid, v)) { closeSheet(); if (kind === 'action' && v === 'going') { push({ v: 'seva', id: sid }); } else rerender(); }
      break;
    }
    case 'ptpick': {
      const s = sv(id); const p = s.points.find((x) => x.id === el.dataset.p);
      if (!going(s)) { toast('Choose Going first, then pick points'); return; }
      const i = p.takers.indexOf('@me');
      if (i > -1) { p.takers.splice(i, 1); toast('Removed — your lead can see the change'); }
      else { p.takers.unshift('@me'); notify('action', `Reminder set: ${p.text} · ${relDay(s.start)} ${fmtTime(s.start)}`, 'seva:' + s.id); toast(isLive(s) ? `Thanks! ${first(s.lead)} can see you're on it` : 'Picked ✓ We\'ll remind you before the seva'); }
      save(); rerender(); break;
    }
    case 'ptdone': { S.mydone[el.dataset.p] = !S.mydone[el.dataset.p]; save(); rerender(); if (S.mydone[el.dataset.p]) toast('Marked done 🙏'); break; }
    case 'ptadd': pointSheet(id); break;
    case 'ptedit': pointSheet(id, el.dataset.p); break;
    case 'ptneed': { const n = $('#pt-need'); n.textContent = Math.max(1, Math.min(30, +n.textContent + +el.dataset.d)); break; }
    case 'ptsave': {
      const s = sv(id); const text = $('#pt-text').value.trim(); const need = +$('#pt-need').textContent; if (!text) { toast('Please describe the point'); return; }
      if (el.dataset.p) { const p = s.points.find((x) => x.id === el.dataset.p); const old = p.text; p.text = text; p.need = need; p.at = iso(now() + 1000); addUpdate(s, old === text ? `Point updated: ${text} now needs ${need}` : `Point changed: "${old}" → "${text}"`, 'edit'); }
      else { s.points.push({ id: 't' + uid(), text, need, takers: [], at: iso(now() + 1000), live: isLive(s) }); addUpdate(s, `New point added: ${text}`, 'new'); }
      notify('live', `${s.title}: ${s.updates[0].t}`, 'seva:' + s.id);
      save(); closeSheet(); rerender(); toast(isLive(s) ? 'Saved — everyone at the seva gets an alert' : 'Saved — members will see it'); break;
    }
    case 'ptdel': { const s = sv(id); const p = s.points.find((x) => x.id === el.dataset.p); if (!confirm(`Remove "${p.text}"?${p.takers.length ? ' People who picked it are told.' : ''}`)) return; s.points = s.points.filter((x) => x !== p); addUpdate(s, `Point removed: ${p.text}`, 'edit'); save(); rerender(); break; }
    case 'postupd': updateSheet(id); break;
    case 'updsave': { const s = sv(id); const t = $('#up-text').value.trim(); if (!t) return; addUpdate(s, t, 'info'); notify('live', `${s.title}: ${t}`, 'seva:' + s.id); save(); closeSheet(); rerender(); toast('Update sent'); break; }
    case 'create': draft = null; createSheet(); break;
    case 'dneed': { syncDraft(); const p = draft.points[+el.dataset.i]; p.n = Math.max(1, Math.min(30, p.n + +el.dataset.d)); createSheet(); break; }
    case 'ddel': syncDraft(); draft.points.splice(+el.dataset.i, 1); createSheet(); break;
    case 'dadd': syncDraft(); draft.points.push({ t: '', n: 2 }); createSheet(); setTimeout(() => { const ins = $$('[data-dpt]'); ins[ins.length - 1]?.focus(); }, 300); break;
    case 'publish': {
      syncDraft(); const when = new Date($('#d-date').value || now() + 3 * DAY).getTime(); const pl = draft.points.filter((p) => p.t.trim());
      if (!pl.length) { toast('Add at least one point'); return; }
      const ns = { id: 's' + uid(), title: draft.title || 'New seva', cat: draft.cat, start: iso(when), end: iso(when + 3 * HOUR), place: $('#d-place').value, meet: 'Main entrance', lead: S.role === 'admin' ? 'Gurpreet Singh' : (S.name || 'You'), purpose: 'Created in the prototype.', instructions: 'Head covered.', created: iso(now()), people: [], points: pl.map((p) => ({ id: 't' + uid(), text: p.t.trim(), need: p.n, takers: [], at: iso(now()) })), updates: [] };
      S.seva.push(ns); notify('p', `New seva: ${ns.title}`, 'seva:' + ns.id); save(); closeSheet(); draft = null; calY = new Date(when).getFullYear(); calM = new Date(when).getMonth(); calPop = ymd(when); push({ v: 'seva', id: ns.id }); toast('Published — members see it marked NEW'); break;
    }
    case 'demo-end': { const s = sv(id); s.end = iso(now() - MIN); const hid = 'h' + uid(); S.history.push({ id: hid, title: s.title, cat: s.cat, date: s.start, hrs: Math.max(.5, Math.round((T(s.end) - T(s.start)) / HOUR * 2) / 2), role: myPoints(s).map((p) => p.text).join(', ') || 'Volunteer', state: 'awaiting' }); save(); stack[stack.length - 1] = { v: 'history', id: hid }; render(); window.scrollTo(0, 0); toast('Seva ended — awaiting verification'); break; }
    case 'demo-verify': { const before = ITEM_ORDER.filter(isUnlocked); const h = S.history.find((x) => x.id === id); h.state = 'verified'; S.ggarden = Math.min(8, S.ggarden + 1); notify('done', `${h.title} verified — thank you`, 'history:' + h.id); save(); rerender(); toast('Verified ✓'); unlockToast(before); break; }
    case 'cal': { const s = sv(id); ics([s], 'seva'); break; }
    case 'cal-e': ics([ev(id)], 'event'); break;
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
    case 'sim-seva': { const before = ITEM_ORDER.filter(isUnlocked); const cats = ['langar', 'cleanup', 'tree', 'education', 'blanket']; const c = cats[S.history.length % 5]; S.history.push({ id: 'h' + uid(), title: `${CAT[c].label} seva (prototype)`, cat: c, date: iso(now() - HOUR), hrs: 2, role: 'Volunteer', state: 'verified' }); save(); rerender(); unlockToast(before); break; }
    case 'csv': { const rows = [['seva', 'date', 'point', 'volunteer']]; S.seva.forEach((s) => s.points.forEach((p) => p.takers.forEach((t) => rows.push([s.title, s.start.slice(0, 10), p.text, nameOf(t)])))); const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')); a.download = 'participation.csv'; a.click(); toast('CSV downloaded'); break; }
    case 'sh-save': shareImage('save'); break; case 'sh-copy': shareImage('copy'); break; case 'sh-wa': shareImage('wa'); break; case 'sh-share': shareImage('share'); break;
  }
}

// ---------- Event delegation ----------
document.addEventListener('click', (e) => {
  const cell = e.target.closest('#pgarden [data-cell]');
  if (cell) {
    const k = cell.dataset.cell;
    if (gardenEdit) { buzz(); if (gardenTool === 'erase') { delete S.pg.items[k]; delete S.pg.tiles[k]; } else if (TILES[gardenTool]) { if (gardenTool === 'grass') delete S.pg.tiles[k]; else { S.pg.tiles[k] = gardenTool; delete S.pg.items[k]; } } else { S.pg.items[k] = gardenTool; delete S.pg.tiles[k]; } save(); $('#pgarden').innerHTML = personalSVG(); }
    else if (S.pg.items[k]) itemSheet(k); else toast('Tap "Design my garden" to add something here');
    return;
  }
  const t = e.target.closest('[data-act],[data-open],[data-tab],[data-seg],[data-xf],[data-mst],[data-scope],[data-ft],[data-react],[data-setmode],[data-setaccent],[data-scn],[data-sk],[data-pf],[data-gv],[data-tool],[data-day],[data-calmode],[data-role],[data-dcat]');
  if (!t || t.disabled) return;
  if (t.dataset.act) return handle(t);
  if (t.dataset.open) { buzz(); closeSheet(); openRef(t.dataset.open); return; }
  if (t.dataset.tab) { buzz(); go(t.dataset.tab); return; }
  if (t.dataset.day) { calPop = calPop === t.dataset.day ? null : t.dataset.day; buzz(); rerender(); return; }
  if (t.dataset.calmode) { S.calMode = t.dataset.calmode; save(); rerender(); return; }
  if (t.dataset.seg) { if (t.dataset.seg === 'mine' && sevaSeg !== 'mine') mySevaTab = smartMyTab(); sevaSeg = t.dataset.seg; rerender(); return; }
  if (t.dataset.xf) { exploreFilter = t.dataset.xf; rerender(); return; }
  if (t.dataset.mst) { mySevaTab = t.dataset.mst; rerender(); return; }
  if (t.dataset.scope) { feedScope = t.dataset.scope; rerender(); return; }
  if (t.dataset.ft) { feedType = t.dataset.ft; rerender(); return; }
  if (t.dataset.pf) { const [k, v] = t.dataset.pf.split(':'); peopleFilter[k] = v; rerender(); return; }
  if (t.dataset.gv) { S.gview = t.dataset.gv; gardenEdit = false; save(); rerender(); return; }
  if (t.dataset.tool) { const id = t.dataset.tool; if (id !== 'erase' && !isUnlocked(id)) { toast(`${itemDef(id).name} is locked: ${unlockText(itemDef(id).u).toLowerCase()}`); return; } gardenTool = id; $$('[data-tool]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.tool === id)); return; }
  if (t.dataset.setmode) { S.mode = t.dataset.setmode; save(); rerender(); return; }
    if (t.dataset.role) { S.role = t.dataset.role; save(); stack = []; tab = 'home'; render(); window.scrollTo(0, 0); toast(`Viewing as ${{ member: 'Member', lead: 'Team Lead', admin: 'Main Admin' }[S.role]}`); return; }
  if (t.dataset.scn) { setScenario(t.dataset.scn); stack = []; tab = 'home'; render(); window.scrollTo(0, 0); toast({ new: 'New member: first day', active: 'Active: 2 seva live now', less: 'Less active: last seva 2 months ago' }[t.dataset.scn]); return; }
  if (t.dataset.dcat) { syncDraft(); draft.cat = t.dataset.dcat; draft.title = { cleanup: 'Gurdwara Hall Cleaning', langar: 'Langar Seva', tree: 'Tree Planting Drive', education: 'Reading Circle', blanket: 'Blanket Distribution' }[draft.cat]; draft.points = TEMPLATES[draft.cat].map(([t2, n]) => ({ t: t2, n })); createSheet(); return; }
  if (t.dataset.sk) { shareKind = t.dataset.sk; if (shareKind === 'month') shareH = null; shareSheet(); return; }
  if (t.dataset.react) { const [pid, k] = t.dataset.react.split(':'); S.mine[pid] = S.mine[pid] === k ? undefined : k; save(); buzz(); t.closest('.reacts').outerHTML = reacts(S.posts.find((x) => x.id === pid)); }
});
// swipe the calendar to change month
let sw = null;
document.addEventListener('touchstart', (e) => { const c = e.target.closest('#cal'); sw = c && e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null; }, { passive: true });
document.addEventListener('touchend', (e) => { if (!sw) return; const t = e.changedTouches[0]; const dx = t.clientX - sw.x, dy = t.clientY - sw.y; sw = null; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) handle({ dataset: { act: dx < 0 ? 'cal-next' : 'cal-prev' } }); }, { passive: true });
// no pinch / double-tap zoom anywhere (the 3D garden handles its own pinch)
['gesturestart', 'gesturechange', 'gestureend'].forEach((ev2) => document.addEventListener(ev2, (e) => e.preventDefault(), { passive: false }));
document.addEventListener('touchmove', (e) => { if (e.touches.length > 1 && !e.target.closest('.g3d')) e.preventDefault(); }, { passive: false });
let lastTap = 0; document.addEventListener('touchend', (e) => { const n = Date.now(); if (n - lastTap < 300 && !e.target.closest('input,textarea,select,.g3d')) e.preventDefault(); lastTap = n; }, { passive: false });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if ($('#sheet-root').innerHTML) closeSheet(); else if (stack.length) pop(); } });
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); window.__dp = e; });
window.addEventListener('online', rerender); window.addEventListener('offline', rerender);
setInterval(() => { if (!$('#sheet-root').innerHTML && S.onboarded && !document.hidden && !g3 && document.activeElement?.tagName !== 'INPUT' && !gardenEdit) rerender(); }, 60000);
function deepLink() { const m = location.hash.match(/^#(seva|event)=(\w+)/); if (m && S.onboarded) { history.replaceState(null, '', location.pathname); openRef(`${m[1]}:${m[2]}`); } }
applyTheme();
$('#app').innerHTML = `<main class="screen"><div class="skel" style="height:24px;width:40%;margin-top:14px"></div><div class="skel" style="height:70px;width:75%;margin-top:22px"></div><div class="skel" style="height:200px;margin-top:22px"></div><div class="skel" style="height:320px;margin-top:22px"></div></main>`;
setTimeout(() => { render(); deepLink(); }, 250);
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
})();
