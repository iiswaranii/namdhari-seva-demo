/* Namdhari Seva & Community — Member experience v3 (follows UX Redesign V2.0)
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
const at = (dayOffset, h, m = 0) => { const d = new Date(); d.setDate(d.getDate() + dayOffset); d.setHours(h, m, 0, 0); return d.toISOString(); };
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
const minsAgo = (s) => { const m = Math.max(1, Math.round((now() - T(s)) / MIN)); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`; };
const initials = (n) => n.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
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
  community: svg('<path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z"/>'),
  profile: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
  scan: svg('<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/>'),
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
  alert: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5h.01"/>', 2),
  hourglass: svg('<path d="M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9"/>'),
  cal: svg('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
  calup: svg('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4M12 13v5M9.5 15.5 12 13l2.5 2.5"/>'),
  done: svg('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4M8.5 15.5l2.5 2.5 4.5-5"/>'),
  info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/>', 2),
  sparkle: svg('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>'),
  globe: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
  wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.8-1.2s.2-1.1.1-1.2-.2-.2-.4-.3z"/></svg>',
  map: svg('<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>'),
  download: svg('<path d="M12 4v11M7 10l5 5 5-5"/><path d="M5 20h14"/>'),
  copy: svg('<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>'),
  leaf: svg('<path d="M5 19c0-8 5-14 15-15-1 10-7 15-15 15z"/><path d="M5 19l8-8"/>'),
  lock: svg('<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
  wifi: svg('<path d="M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0M12 19h.01"/><path d="M3 3l18 18"/>'),
};
const chev = I.chev.replace('<svg', '<svg class="chev"');
const CAT = {
  langar: { label: 'Langar', svg: '<svg viewBox="0 0 64 64"><path d="M8 30h48a24 22 0 0 1-48 0z" fill="#C9935A"/><rect x="6" y="27" width="52" height="5" rx="2.5" fill="#8C5E33"/><path d="M24 22c0-4 4-4 4-8M32 22c0-4 4-4 4-8M40 22c0-4 4-4 4-8" stroke="#B3A089" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>' },
  cleanup: { label: 'Clean-up', svg: '<svg viewBox="0 0 64 64"><path d="M14 50C14 28 30 14 52 12c0 24-14 38-36 38" fill="#6FA583"/><path d="M14 50C24 38 34 30 46 22" stroke="#2F5A45" stroke-width="3" fill="none" stroke-linecap="round"/></svg>' },
  tree: { label: 'Tree planting', svg: '<svg viewBox="0 0 64 64"><rect x="29" y="34" width="6" height="18" rx="2" fill="#8C6A43"/><circle cx="32" cy="26" r="14" fill="#5E9470"/><circle cx="24" cy="30" r="8" fill="#7FB18E"/><path d="M14 54h36" stroke="#8C6A43" stroke-width="3" stroke-linecap="round"/></svg>' },
  education: { label: 'Education', svg: '<svg viewBox="0 0 64 64"><path d="M8 16c10-4 18-2 24 4v32c-6-6-14-8-24-4z" fill="#6E86B3"/><path d="M56 16c-10-4-18-2-24 4v32c6-6 14-8 24-4z" fill="#90A6CF"/></svg>' },
  blanket: { label: 'Relief', svg: '<svg viewBox="0 0 64 64"><rect x="10" y="18" width="44" height="30" rx="6" fill="#C9686A"/><path d="M10 28h44M10 38h44" stroke="#E9A3A4" stroke-width="3"/><path d="M22 18v30M42 18v30" stroke="#A8484B" stroke-width="2"/></svg>' },
  event: { label: 'Event', svg: '<svg viewBox="0 0 64 64"><rect x="10" y="14" width="44" height="40" rx="8" fill="#fff" stroke="#6B66C9" stroke-width="3"/><path d="M10 26h44" stroke="#6B66C9" stroke-width="3"/><path d="M22 9v10M42 9v10" stroke="#6B66C9" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="40" r="6" fill="#D89B5B"/></svg>' },
  milestone: { label: 'Milestone', svg: '<svg viewBox="0 0 64 64"><g fill="#E39AA8"><circle cx="32" cy="18" r="9"/><circle cx="46" cy="28" r="9"/><circle cx="41" cy="44" r="9"/><circle cx="23" cy="44" r="9"/><circle cx="18" cy="28" r="9"/></g><circle cx="32" cy="32" r="8" fill="#F3C969"/></svg>' },
  update: { label: 'Update', svg: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="#E9B44C"/><rect x="29.5" y="18" width="5" height="18" rx="2.5" fill="#fff"/><circle cx="32" cy="44" r="3.2" fill="#fff"/></svg>' },
};
const ico = (c) => `<div class="ico t-${c}">${CAT[c]?.svg || ''}</div>`;

// ---------- Scenario data ----------
const GROUPS = [
  { id: 'delhi', name: 'Delhi Central', city: 'Delhi', country: 'India' },
  { id: 'ludhiana', name: 'Ludhiana Sangat', city: 'Ludhiana', country: 'India' },
  { id: 'london', name: 'London Sangat', city: 'London', country: 'UK' },
];
function baseSeva() {
  return [
    { id: 's0', title: 'Morning Langar Prep', cat: 'langar', start: rel(-45), end: rel(165), place: 'Namdhari Gurdwara, Karol Bagh', meet: 'Kitchen side entrance, ground floor', lead: 'Manjit Kaur', purpose: 'Chopping, kneading and prep for today\'s langar (about 250 sangat).', instructions: 'Head covered, closed shoes. Aprons provided.', created: at(-6, 9),
      roles: [ { id: 'r1', name: 'Prep team', cap: 6, filled: 5 }, { id: 'r2', name: 'Dish washing', cap: 3, filled: 3 } ],
      tasks: { r1: ['Wash hands and wear an apron', 'Collect vegetables from the store room', 'Chop onions and tomatoes (2 crates)', 'Hand over to the cooks by 10:30'] },
      updates: [ { t: 'Extra 40 sangat expected — prep 2 more crates', d: rel(-30) } ] },
    { id: 's1', title: 'Sunday Langar Seva', cat: 'langar', start: at(1, 9), end: at(1, 13), place: 'Namdhari Gurdwara, Karol Bagh', meet: 'Langar hall, main door', lead: 'Gurpreet Singh', purpose: 'Prepare and serve langar for around 300 sangat after the morning diwan.', instructions: 'Arrive 15 minutes early. Head covered.', created: at(-10, 9), recur: 'Every Sunday',
      roles: [ { id: 'r1', name: 'Cooks', cap: 6, filled: 3 }, { id: 'r2', name: 'Servers', cap: 8, filled: 5 }, { id: 'r3', name: 'Drivers', cap: 2, filled: 2 } ],
      tasks: { r1: ['Arrive by 8:45', 'Dal and sabzi station', 'Clean the station after service'] }, updates: [] },
    { id: 's2', title: 'Yamuna Ghat Clean-up', cat: 'cleanup', start: at(4, 7), end: at(4, 9, 30), place: 'Kudesia Ghat, Gate 2', meet: 'Gate 2 (changed from Gate 1)', lead: 'Simran Kaur', purpose: 'Clear plastic waste along 400 m of the riverbank. Gloves and bags provided.', instructions: 'Wear old clothes and closed shoes. Bring a water bottle.', created: at(-8, 9),
      roles: [ { id: 'r1', name: 'Clean-up volunteers', cap: 20, filled: 7 }, { id: 'r2', name: 'Supplies & water', cap: 2, filled: 0 } ],
      tasks: { r1: ['Collect gloves and bags at Gate 2', 'Work in pairs along the marked stretch', 'Sort plastic for recycling'] },
      updates: [ { t: 'Venue changed: meet at Gate 2, not Gate 1', d: rel(-120) } ] },
    { id: 's3', title: 'Tree Planting Drive', cat: 'tree', start: at(9, 8), end: at(9, 11), place: 'Sanjay Van, South Delhi', meet: 'Main gate parking', lead: 'Ravinder Singh', purpose: 'Plant 120 native saplings with the forest department.', instructions: 'Tools provided. Wear a cap.', created: rel(-300),
      roles: [ { id: 'r1', name: 'Planters', cap: 15, filled: 2 }, { id: 'r2', name: 'Water carriers', cap: 4, filled: 0 } ], tasks: {}, updates: [] },
    { id: 's6', title: 'Blanket Distribution', cat: 'blanket', start: at(12, 18), end: at(12, 20), place: 'Night shelters, Old Delhi', meet: 'Chandni Chowk metro, gate 5', lead: 'Gurpreet Singh', purpose: 'Distribute 200 blankets ahead of winter.', instructions: 'Teams of 4. Your lead will brief you at the meeting point.', created: rel(-90),
      roles: [ { id: 'r1', name: 'Distribution team', cap: 10, filled: 1 }, { id: 'r2', name: 'Drivers', cap: 3, filled: 0 } ], tasks: {}, updates: [] },
    { id: 's7', title: 'Punjabi Reading Circle for Kids', cat: 'education', start: at(6, 17), end: at(6, 18, 30), place: 'Community Hall, Karol Bagh', meet: 'Room 2', lead: 'Harpreet Kaur', purpose: 'Help children practise Gurmukhi reading in small groups.', instructions: 'Books provided.', created: at(-20, 9), recur: 'Every Saturday',
      roles: [ { id: 'r1', name: 'Reading helpers', cap: 5, filled: 4 } ], tasks: {}, updates: [] },
  ];
}
function baseEvents() {
  return [
    { id: 'e1', title: 'Monthly Satsang', kind: 'Satsang', start: at(6, 18), end: at(6, 20), place: 'Namdhari Gurdwara, Karol Bagh', organizer: 'Delhi Central', audience: 'Delhi Central members', agenda: ['Kirtan', 'Katha', 'Ardas', 'Langar'], going: 86, cap: 200, linked: 's1', created: at(-12, 9) },
    { id: 'e2', title: 'New Volunteer Orientation', kind: 'Online session', start: at(3, 19), end: at(3, 19, 45), place: 'Online — link shared after RSVP', organizer: 'Delhi Central', audience: 'New and returning volunteers', agenda: ['How seva works', 'Roles and safety', 'Q&A'], going: 14, cap: 40, created: rel(-200) },
    { id: 'e3', title: 'Hola Mohalla Gathering', kind: 'Gathering', start: at(24, 10), end: at(24, 17), place: 'Sri Bhaini Sahib, Punjab', organizer: 'Worldwide sangat', audience: 'All members', agenda: ['Gathering', 'Seva', 'Celebration'], going: 1240, created: at(-15, 9) },
  ];
}
function basePosts() {
  return [
    { id: 'p1', type: 'seva', scope: 'local', cat: 'cleanup', title: 'Karol Bagh street clean-up', city: 'Delhi', date: at(-3, 10), text: '22 volunteers cleared 18 bags of waste from 3 lanes.', r: { g: 31, a: 12, c: 9 } },
    { id: 'u1', type: 'update', scope: 'local', cat: 'update', title: 'Yamuna clean-up moved to Gate 2', city: 'Delhi', date: rel(-120), text: 'Same time, 7:00 AM Thursday. Gate 1 is closed for repairs.', link: 'seva:s2', r: { g: 3, a: 8, c: 1 } },
    { id: 'v1', type: 'event', scope: 'local', cat: 'event', title: 'Monthly Satsang this Saturday', city: 'Delhi', date: at(-1, 12), text: 'Kirtan, katha and langar. 86 sangat going so far.', link: 'event:e1', r: { g: 22, a: 14, c: 5 } },
    { id: 'm1', type: 'milestone', scope: 'local', cat: 'milestone', title: 'Delhi garden: lanterns are lit', city: 'Delhi', date: at(-2, 9), text: 'Our 40th verified seva this year lit the garden lanterns.', link: 'garden', r: { g: 64, a: 30, c: 41 } },
    { id: 'p2', type: 'seva', scope: 'world', cat: 'langar', title: 'Langar for 450 at Southall', city: 'London', date: at(-2, 13), text: '16 volunteers served 450 sangat in under 2 hours.', r: { g: 88, a: 40, c: 27 } },
    { id: 'v2', type: 'event', scope: 'world', cat: 'event', title: 'Hola Mohalla — RSVPs open', city: 'Sri Bhaini Sahib', date: at(-4, 9), text: 'Gathering at Sri Bhaini Sahib in 3 weeks. 1,240 going.', link: 'event:e3', r: { g: 210, a: 96, c: 120 } },
    { id: 'p5', type: 'seva', scope: 'world', cat: 'tree', title: '300 saplings planted in Toronto', city: 'Toronto', date: at(-8, 9), text: '41 volunteers, partnered with the city parks team.', r: { g: 104, a: 55, c: 38 } },
  ];
}
function scenario(kind) {
  const d = { seva: baseSeva(), events: baseEvents(), posts: basePosts(), assign: {}, rsvp: {}, actions: [], history: [], notifs: [], checklist: {}, garden: 5, mine: {} };
  if (kind === 'active') {
    d.assign = {
      s0: { state: 'accepted', role: 'r1', attendance: 'none' },
      s1: { state: 'accepted', role: 'r1', attendance: 'none' },
      s2: { state: 'accepted', role: 'r1', attendance: 'none' },
      s3: { state: 'invited', role: 'r2', attendance: 'none' },
    };
    d.rsvp = { e1: 'going' };
    d.actions = [
      { id: 'a1', kind: 'confirm', ref: 's1', title: 'Confirm you\'re still coming', text: 'Sunday Langar Seva · tomorrow 9:00 AM · Cooks', due: at(0, 21) },
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
    ];
    d.notifs = [
      { id: 'n1', level: 'info', t: 'Morning Langar Prep has started — you\'re on Prep team', d: rel(-45), ref: 'seva:s0' },
      { id: 'n2', level: 'attention', t: 'Please confirm Sunday Langar Seva', d: rel(-60), ref: 'action:a1' },
      { id: 'n3', level: 'attention', t: 'Venue changed: Yamuna clean-up → Gate 2', d: rel(-120), ref: 'seva:s2' },
      { id: 'n4', level: 'new', t: 'New seva near you: Blanket Distribution', d: rel(-90), ref: 'seva:s6' },
      { id: 'n5', level: 'success', t: 'Karol Bagh clean-up verified — thank you', d: at(-3, 18), ref: 'history:h1', read: true },
    ];
  } else if (kind === 'less') {
    d.history = [
      { id: 'h4', title: 'Sunday Langar Seva', cat: 'langar', date: at(-68, 9), hrs: 4, role: 'Cook', state: 'verified' },
      { id: 'h6', title: 'Tree Planting Drive', cat: 'tree', date: at(-96, 8), hrs: 3, role: 'Planter', state: 'verified' },
      { id: 'h7', title: 'Karol Bagh clean-up', cat: 'cleanup', date: at(-130, 10), hrs: 2, role: 'Volunteer', state: 'verified' },
    ];
    d.notifs = [ { id: 'n4', level: 'new', t: 'New seva near you: Blanket Distribution', d: rel(-90), ref: 'seva:s6' } ];
  } else {
    d.notifs = [ { id: 'n0', level: 'success', t: 'Welcome to Delhi Central 🙏', d: rel(-5), ref: 'tab:seva' } ];
  }
  return d;
}

const KEY = 'namdhari-seva-member-v3';
let S;
function fresh(kind = 'active') { return { v: 3, onboarded: false, name: '', group: 'delhi', minor: false, scenario: kind, mode: 'auto', accent: 'forest', seen: {}, ...scenario(kind) }; }
try { S = JSON.parse(localStorage.getItem(KEY)); if (!S || S.v !== 3) S = fresh(); } catch (e) { S = fresh(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
function setScenario(kind) {
  const keep = { onboarded: S.onboarded, name: S.name, group: S.group, minor: S.minor, mode: S.mode, accent: S.accent };
  S = { ...fresh(kind), ...keep, scenario: kind }; save();
}

// ---------- Derived model (canonical counts) ----------
const ME = () => S.name || 'Member';
const grp = () => GROUPS.find((g) => g.id === S.group) || GROUPS[0];
const sv = (id) => S.seva.find((x) => x.id === id);
const ev = (id) => S.events.find((x) => x.id === id);
const roleOf = (s, a) => s.roles.find((r) => r.id === a?.role);
const isLiveTime = (x) => T(x.start) <= now() && T(x.end) > now();
const isFuture = (x) => T(x.start) > now();
const openActions = () => S.actions.filter((a) => !a.resolved);
const actionFor = (sid) => openActions().find((a) => a.ref === sid);
function myStatus(s) {
  const a = S.assign[s.id];
  if (!a || a.state === 'declined') return null;
  if (a.state === 'invited') return { key: 'invited', label: 'Invitation', cls: 'event', icon: I.sparkle };
  if (a.state === 'waitlist') return { key: 'waitlist', label: 'Waitlist', cls: 'attention', icon: I.hourglass };
  if (isLiveTime(s)) return { key: 'ongoing', label: 'Happening now', cls: 'info', live: true };
  if (isFuture(s)) return actionFor(s.id) ? { key: 'upcoming', label: 'Needs action', cls: 'attention', icon: I.alert } : { key: 'upcoming', label: 'Confirmed', cls: 'success', icon: I.checkc };
  return null;
}
const mySeva = (k) => S.seva.filter((s) => myStatus(s)?.key === k).sort((a, b) => T(a.start) - T(b.start));
const liveMine = () => mySeva('ongoing');
const monthStart = () => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d.getTime(); };
const verified = () => S.history.filter((h) => h.state === 'verified').sort((a, b) => T(b.date) - T(a.date));
const awaiting = () => S.history.filter((h) => h.state === 'awaiting');
const completedThisMonth = () => verified().filter((h) => T(h.date) >= monthStart()).length;
const upcoming30 = () => S.seva.filter((s) => S.assign[s.id]?.state === 'accepted' && isFuture(s) && T(s.start) < now() + 30 * DAY).sort((a, b) => T(a.start) - T(b.start));
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

// ---------- Theme ----------
const mq = window.matchMedia('(prefers-color-scheme: dark)');
function applyTheme() {
  const dark = S.mode === 'dark' || (S.mode === 'auto' && mq.matches);
  document.documentElement.dataset.mode = dark ? 'dark' : 'light';
  document.documentElement.dataset.accent = S.accent;
  $$('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', dark ? '#141C19' : '#F8F7F2'));
}
mq.addEventListener && mq.addEventListener('change', applyTheme);

// ---------- Navigation: tabs + detail stack, scroll preserved ----------
let tab = 'home';
let stack = [];
const scrollMem = {};
let sevaSeg = 'explore', exploreFilter = 'all', mySevaTab = 'action', feedScope = 'local', feedType = 'all';
const key = () => tab + '/' + stack.map((v) => v.v + (v.id || '')).join('/');
function push(view) { scrollMem[key()] = window.scrollY; stack.push(view); history.pushState({ d: stack.length }, ''); render(); window.scrollTo(0, 0); }
function pop() { if (stack.length) history.back(); }
window.addEventListener('popstate', () => { if (stack.length) { stack.pop(); closeSheet(); render(); window.scrollTo(0, scrollMem[key()] || 0); } });
function go(t) {
  closeSheet();
  if (stack.length) { const n = stack.length; stack = []; history.go(-n); }
  scrollMem[key()] = window.scrollY; tab = t; render(); window.scrollTo(0, scrollMem[key()] || 0);
}

// ---------- Render ----------
function render() {
  applyTheme();
  if (!S.onboarded) return renderOnboarding();
  const top = stack[stack.length - 1];
  if (top) {
    const V = { seva: SevaDetail, event: EventDetail, myseva: MySeva, garden: GardenPage, inbox: Inbox, history: HistoryDetail };
    $('#app').innerHTML = `<main class="screen detail">${offlineBanner()}${V[top.v](top)}</main>`;
    return;
  }
  const screens = { home: Home, seva: SevaTab, community: Community, profile: Profile };
  $('#app').innerHTML = `<main class="screen">${offlineBanner()}${screens[tab]()}</main>${nav()}`;
}
function rerender() { const y = window.scrollY; render(); window.scrollTo(0, y); }
function nav() {
  const n = newCount();
  const items = [['home', 'Home', I.home, 0], ['seva', 'Seva', I.seva, n], ['community', 'Community', I.community, 0], ['profile', 'Profile', I.profile, 0]];
  return `<div class="navwrap"><div class="navin"><nav class="nav" aria-label="Main">${items.map(([id, l, ic, b]) => `<button data-tab="${id}" ${tab === id ? 'aria-current="page"' : ''} aria-label="${l}${b ? `, ${b} new` : ''}">${ic}${b ? `<span class="nb">${b}</span>` : ''}${l}</button>`).join('')}</nav>
    <button class="fab ${liveMine().length ? 'live' : ''}" data-act="scan" aria-label="Check in with QR code">${I.scan}</button></div></div>`;
}
const offlineBanner = () => navigator.onLine ? '' : `<div class="banner bg-attention">${I.wifi}<span>Offline — showing saved information. Actions wait until you're back online.</span></div>`;
const backHead = (title, right = '') => `<div class="dhead"><button class="iconbtn" data-act="back" aria-label="Back">${I.back}</button><span class="t">${title}</span>${right || '<span style="width:44px"></span>'}</div>`;
const statusChip = (st) => st ? `<span class="chip bg-${st.cls}">${st.live ? '<span class="livedot"></span>' : st.icon || ''}${st.label}</span>` : '';

// ----- Onboarding -----
let onb = 0;
function renderOnboarding() {
  const g = GROUPS[0]; const nx = baseSeva()[1];
  $('#app').innerHTML = onb === 0 ? `<div class="onb"><div>
      <p class="muted small">You've been invited to</p>
      <h1 style="margin-top:6px">${g.name}</h1>
      <p class="muted" style="margin-top:6px">Namdhari Seva &amp; Community · ${g.city}</p>
      <div class="garden-wrap" style="margin:24px 0">${gardenSVG(5, true)}</div>
      <div class="card"><p class="label s-success">${I.calup}Next seva in this group</p>
        <div class="act" style="margin-top:12px">${ico(nx.cat)}<div class="grow"><h3>${nx.title}</h3><p class="l2">${relDay(nx.start)} · ${fmtTime(nx.start)} · ${nx.place}</p></div></div></div>
    </div><div style="margin-top:24px"><button class="btn block" data-act="onb-next">Join ${g.name}</button><p class="faint xs" style="text-align:center;margin-top:12px">Prototype — nothing leaves this phone.</p></div></div>`
  : `<div class="onb"><div>
      <p class="muted small">Step 2 of 2</p><h1 style="margin-top:6px">A little about you</h1>
      <label class="f" for="onb-name">Your name</label><input class="in" id="onb-name" autocomplete="name" placeholder="e.g. Harjeet Kaur" value="${esc(S.name)}">
      <label class="f" for="onb-age">Age group</label><select class="in" id="onb-age"><option value="adult">18 or older</option><option value="minor">Under 18</option></select>
      <p class="muted xs" style="margin-top:8px">Under-18 members need a guardian's approval before joining seva.</p>
    </div><button class="btn block" data-act="onb-finish" style="margin-top:24px">Continue</button></div>`;
}

// ----- Home (V2 §3 order) -----
function Home() {
  const h = new Date().getHours();
  const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const pr = priority();
  return `
    <div class="hdr"><span class="date">${new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
      <div class="pillgroup"><button data-act="inbox" aria-label="Inbox, ${unread()} unread">${I.bell}${unread() ? '<span class="dotbadge"></span>' : ''}</button><button data-act="share" aria-label="Share my seva">${I.share}</button><button data-tab="profile" aria-label="Profile"><span class="avatar">${initials(ME())}</span></button></div></div>
    <div class="greet"><h1>${greet}, ${esc(ME().split(' ')[0])}</h1><p>${I.pin}${grp().name} · ${grp().city}</p></div>
    ${S.minor ? `<div class="banner bg-attention">${I.info}<span><b>Waiting for guardian approval.</b> You can browse; joining opens once approved.</span></div>` : ''}
    ${priorityCard(pr)}
    ${snapshot()}
    ${nextUp(pr)}
    ${communityMoment()}
    ${installRow()}`;
}
function priorityCard(pr) {
  const more = pr.items.length > 1 ? `<button class="viewall" data-act="viewall" data-k="${pr.kind}">View all (${pr.items.length})</button>` : '';
  if (pr.kind === 'live') {
    const s = pr.items[0], a = S.assign[s.id], r = roleOf(s, a);
    return `<div class="card priority k-live" role="region" aria-label="Happening now">
      <span class="label s-info"><span class="livedot"></span>Happening now</span>
      <h3>${esc(s.title)}</h3>
      <div class="meta"><div>${I.clock}Started ${minsAgo(s.start)} ago · ends ${fmtTime(s.end)}</div><div>${I.pin}${esc(s.meet)}</div></div>
      <div class="rel">${I.user}<span class="grow">You're assigned · <b>${esc(r.name)}</b></span>${a.attendance === 'checked_in' ? `<span class="chip bg-success">${I.check}Checked in</span>` : ''}</div>
      <div class="cta"><button class="btn grow" data-open="seva:${s.id}">View live seva ${I.arrow}</button>${more}</div></div>`;
  }
  if (pr.kind === 'action') {
    const a = pr.items[0];
    return `<div class="card priority k-action" role="region" aria-label="Needs your action">
      <span class="label s-attention">${I.alert}Needs your action</span>
      <h3>${esc(a.title)}</h3>
      <div class="meta"><div>${I.cal}${esc(a.text)}</div><div>${I.clock}Please respond by ${relDay(a.due).toLowerCase()}, ${fmtTime(a.due)}</div></div>
      <div class="cta"><button class="btn grow" data-act="action" data-id="${a.id}">Review ${I.arrow}</button>${more}</div></div>`;
  }
  if (pr.kind === 'soon') {
    const { t, x } = pr.items[0]; const r = t === 'seva' ? roleOf(x, S.assign[x.id]) : null;
    return `<div class="card priority k-soon" role="region" aria-label="Coming up">
      <span class="label s-success">${I.calup}Coming up</span>
      <h3>${esc(x.title)}</h3>
      <div class="meta"><div>${I.clock}${span(x.start, x.end)}</div><div>${I.pin}${esc(x.place)}</div></div>
      <div class="rel">${t === 'seva' ? `${I.user}<span>You're confirmed · <b>${esc(r.name)}</b></span>` : `${I.checkc}<span>You're going</span>`}</div>
      <div class="cta"><button class="btn grow" data-open="${t}:${x.id}">View details ${I.arrow}</button>${more}</div></div>`;
  }
  if (pr.kind === 'invite') {
    const a = pr.items[0];
    return `<div class="card priority k-invite" role="region" aria-label="Invitation"><span class="label s-event">${I.sparkle}Invitation</span><h3>${esc(a.title)}</h3>
      <div class="meta"><div>${I.cal}${esc(a.text)}</div></div>
      <div class="cta"><button class="btn grow" data-act="action" data-id="${a.id}">Respond ${I.arrow}</button>${more}</div></div>`;
  }
  const s = pr.items[0]; const p = participation();
  const head = p.key === 'new' ? 'Your seva journey starts here' : p.key === 'less' ? 'Ready when you are' : 'Find your next seva';
  return `<div class="card priority k-discover" role="region" aria-label="Your next opportunity"><span class="label" style="color:var(--accent)">${I.leaf}Your next opportunity</span>
    <h3>${head}</h3>
    ${s ? `<button class="rel tap" style="border:0;margin-top:14px" data-open="seva:${s.id}">${ico(s.cat)}<span class="grow"><b class="small" style="display:block">${esc(s.title)}</b><span class="xs muted">${relDay(s.start)} · ${fmtTime(s.start)} · ${s.roles.reduce((n, r) => n + r.cap - r.filled, 0)} spots open</span></span>${chev}</button>` : ''}
    <div class="cta"><button class="btn grow" data-act="explore">${p.key === 'less' ? 'Find a seva near you' : 'Explore opportunities'} ${I.arrow}</button></div></div>`;
}
function snapshot() {
  const p = participation(); const c = completedThisMonth(), u = upcoming30().length, n = openActions().length;
  const lv = verified()[0];
  const tile = (k, ic, label, num, cls, st, sticon) => `<button class="tile tap" data-act="myseva" data-tab="${k}" aria-label="${label}: ${num}, ${st}"><div class="top">${ic.replace('<svg', '<svg class="ic"')}${chev}</div><div class="num">${num}</div><div class="lbl">${label}</div><div class="st s-${cls}">${sticon || ''}${st}</div></button>`;
  return `<div class="section"><div class="section-h"><h2>My Seva</h2><span class="xs muted">${p.text}</span></div>
    <div class="mosaic">
      ${tile('completed', I.done, 'Completed', c, c ? 'success' : 'neutral', c ? 'This month' : 'This month', c ? I.checkc : '')}
      ${tile('upcoming', I.calup, 'Upcoming', u, 'neutral', 'Next 30 days')}
      ${tile('action', I.alert, 'Needs action', n, n ? 'attention' : 'success', n ? 'To respond' : 'All clear', n ? I.alert : I.checkc)}
    </div>
    ${lv ? `<button class="minitl tap" data-open="history:${lv.id}"><span class="ln"></span><span class="grow"><span class="xs muted">${p.key === 'less' ? 'Last recorded seva' : 'Latest verified'}</span><b class="small ellipsis" style="display:block">${esc(lv.title)}</b><span class="xs muted">${fmtLong(lv.date)} · ${esc(lv.role)}</span></span><span class="chip bg-success">${I.check}Verified</span></button>`
      : `<div class="minitl" style="justify-content:center"><span class="xs muted">Your verified seva will appear here.</span></div>`}
    <button class="link" data-act="myseva" data-tab="${n ? 'action' : 'upcoming'}">View My Seva ${I.chev}</button></div>`;
}
function nextUp(pr) {
  const shown = new Set();
  if (pr.kind === 'live') shown.add(pr.items[0].id);
  if (pr.kind === 'soon') shown.add(pr.items[0].x.id);
  const list = [...upcoming30().map((x) => ({ t: 'seva', x })), ...myEventsUpcoming().map((x) => ({ t: 'event', x }))].filter((i) => !shown.has(i.x.id)).sort((a, b) => T(a.x.start) - T(b.x.start));
  const it = list[0]; if (!it) return '';
  const st = it.t === 'seva' ? myStatus(it.x) : { cls: 'event', label: 'Going', icon: I.checkc };
  return `<div class="section"><div class="section-h"><h2>Next up</h2>${list.length > 1 ? `<button class="link" data-act="myseva" data-tab="upcoming">All ${list.length} ${I.chev}</button>` : ''}</div>${actCard(it.t, it.x, st)}</div>`;
}
function communityMoment() {
  const m = S.posts.find((p) => p.type === 'milestone');
  return `<div class="section"><div class="section-h"><h2>Together this week</h2><button class="link" data-tab="community">Community ${I.chev}</button></div>
    <div class="card post p-milestone"><button class="tap" style="border:0;background:none;padding:0" data-open="garden" aria-label="Open the ${grp().city} community garden"><div class="garden-wrap" style="border-radius:0">${gardenSVG(S.garden)}</div></button>
    <div class="body"><span class="label" style="color:var(--accent)">${I.leaf}${grp().city} garden · milestone</span><h3 style="margin-top:6px">${esc(m.title)}</h3><p class="small muted" style="margin-top:4px">${esc(m.text)}</p>${reacts(m)}</div></div></div>`;
}
function installRow() {
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (standalone || sessionStorage.getItem('noinstall')) return '';
  return `<div class="section"><button class="card tap row" data-act="install"><img src="icons/icon-192.png" width="42" height="42" alt="" style="border-radius:11px"><span class="grow"><b class="small" style="display:block">Add to Home Screen</b><span class="xs muted">Opens full screen and can send reminders</span></span>${chev}</button></div>`;
}

// Activity card (V2 §7 anatomy)
function actCard(t, x, st, extra = '') {
  const isS = t === 'seva'; const a = isS ? S.assign[x.id] : null; const r = isS ? roleOf(x, a) : null;
  const nw = isNew(x) && !(isS ? a : S.rsvp[x.id]);
  return `<button class="card tap ${nw ? 'is-new' : ''}" data-open="${t}:${x.id}"><div class="act">${ico(isS ? x.cat : 'event')}<div class="grow">
    <div class="row" style="gap:8px;align-items:flex-start"><h3 class="grow">${esc(x.title)}</h3>${nw ? '<span class="newtag">NEW</span>' : ''}</div>
    <p class="l2 ellipsis">${relDay(x.start)} · ${fmtTime(x.start)} · ${esc(x.place)}</p>
    <div class="l3">${statusChip(st)}${r && a.state !== 'invited' && a.state !== 'declined' ? `<span class="role">${esc(r.name)}</span>` : ''}${extra}</div></div>${chev}</div></button>`;
}

// ----- Seva tab: Explore | My Seva | History -----
function SevaTab() {
  const n = newCount(); const nAct = openActions().length;
  let body = '';
  if (sevaSeg === 'explore') {
    const show = (f) => exploreFilter === 'all' || exploreFilter === f;
    const items = [...(show('seva') ? exploreSeva().map((x) => ({ t: 'seva', x })) : []), ...(show('events') ? exploreEvents().map((x) => ({ t: 'event', x })) : [])].sort((a, b) => (isNew(b.x) - isNew(a.x)) || T(a.x.start) - T(b.x.start));
    body = `<div class="fchips" style="margin-top:14px" role="group" aria-label="Type">${[['all', 'All'], ['seva', 'Seva'], ['events', 'Events']].map(([v, l]) => `<button class="fchip" data-xf="${v}" aria-pressed="${exploreFilter === v}">${l}</button>`).join('')}</div>
      <div class="stack" style="margin-top:12px">${items.map((i) => i.t === 'seva' ? actCard('seva', i.x, openSpots(i.x)) : actCard('event', i.x, { cls: 'event', label: i.x.kind, icon: I.cal }, `<span class="role">${i.x.going.toLocaleString()} going</span>`)).join('') || emptyState('Nothing open right now', 'New seva and events from your group will appear here.')}</div>`;
  } else if (sevaSeg === 'mine') {
    body = `<div style="margin-top:14px">${mySevaList()}</div>`;
  } else body = historyList();
  return `<div class="greet" style="margin-top:12px"><h1>Seva</h1><p>${grp().name}</p></div>
    <div class="seg" role="group" aria-label="Seva sections"><button data-seg="explore" aria-pressed="${sevaSeg === 'explore'}">Explore${n ? ` <span class="count">${n}</span>` : ''}</button><button data-seg="mine" aria-pressed="${sevaSeg === 'mine'}">My Seva${nAct ? ` <span class="count n">${nAct}</span>` : ''}</button><button data-seg="history" aria-pressed="${sevaSeg === 'history'}">History</button></div>
    ${body}`;
}
function openSpots(s) { const left = s.roles.reduce((n, r) => n + r.cap - r.filled, 0); return left <= 0 ? { cls: 'neutral', label: 'Full · waitlist open', icon: I.hourglass } : { cls: 'success', label: `${left} spot${left > 1 ? 's' : ''} open`, icon: I.users }; }
const emptyState = (t, d, cta = '') => `<div class="empty"><svg class="big" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="28" fill="var(--surface2)"/><g transform="translate(14 12) scale(.56)">${CAT.tree.svg.replace(/<\/?svg[^>]*>/g, '')}</g></svg><b>${t}</b><p class="muted small" style="margin-top:4px">${d}</p>${cta}</div>`;

function mySevaList() {
  const tabs = [['action', 'Needs action', openActions().length], ['upcoming', 'Upcoming', upcoming30().length + myEventsUpcoming().length], ['ongoing', 'Ongoing', liveMine().length], ['completed', 'Completed', verified().length + awaiting().length]];
  let list = '';
  if (mySevaTab === 'action') {
    const acts = openActions();
    list = acts.length ? acts.map((a) => { const s = sv(a.ref); const lbl = a.kind === 'invite' ? { cls: 'event', label: 'Invitation', icon: I.sparkle } : { cls: 'attention', label: a.kind === 'ack' ? 'Acknowledge' : 'Confirm', icon: I.alert };
      return `<button class="card tap" data-act="action" data-id="${a.id}"><div class="act">${ico(s.cat)}<div class="grow"><h3>${esc(a.title)}</h3><p class="l2">${esc(a.text)}</p><div class="l3">${statusChip(lbl)}<span class="role">Due ${relDay(a.due).toLowerCase()}</span></div></div>${chev}</div></button>`; }).join('')
      : emptyState('Nothing needs your action', 'Invitations, confirmations and changes will show here.');
  } else if (mySevaTab === 'upcoming') {
    const items = [...upcoming30().map((x) => ({ t: 'seva', x })), ...myEventsUpcoming().map((x) => ({ t: 'event', x })), ...S.seva.filter((s) => S.assign[s.id]?.state === 'waitlist' && isFuture(s)).map((x) => ({ t: 'seva', x }))].sort((a, b) => T(a.x.start) - T(b.x.start));
    list = items.length ? items.map((i) => i.t === 'seva' ? actCard('seva', i.x, myStatus(i.x)) : actCard('event', i.x, { cls: 'event', label: 'Going', icon: I.checkc })).join('') : emptyState('No upcoming commitments', 'Join a seva and it will appear here.', '<button class="btn sm" style="margin-top:12px" data-act="explore">Explore seva</button>');
  } else if (mySevaTab === 'ongoing') {
    const l = liveMine(); list = l.length ? l.map((s) => actCard('seva', s, myStatus(s))).join('') : emptyState('Nothing happening right now', 'When a seva you joined starts, it shows here with your role and tasks.');
  } else {
    const all = [...awaiting(), ...verified()];
    list = all.length ? all.map(histCard).join('') : emptyState('No completed seva yet', 'A seva counts as completed after your lead verifies attendance.');
  }
  return `<div class="fchips" role="group" aria-label="My Seva status">${tabs.map(([k, l, c]) => `<button class="fchip" data-mst="${k}" aria-pressed="${mySevaTab === k}">${l}${c ? ` <span class="count ${mySevaTab === k ? '' : 'n'}" ${mySevaTab === k ? 'style="background:var(--canvas);color:var(--ink)"' : ''}>${c}</span>` : ''}</button>`).join('')}</div>
    <div class="stack" style="margin-top:12px">${list}</div>`;
}
function histCard(h) {
  const st = h.state === 'verified' ? { cls: 'success', label: 'Verified', icon: I.checkc } : { cls: 'attention', label: 'Awaiting verification', icon: I.hourglass };
  return `<button class="card tap" data-open="history:${h.id}"><div class="act">${ico(h.cat)}<div class="grow"><h3>${esc(h.title)}</h3><p class="l2">${fmtLong(h.date)} · ${h.hrs} h</p><div class="l3">${statusChip(st)}<span class="role">${esc(h.role)}</span></div></div>${chev}</div></button>`;
}
function historyList() {
  const all = [...awaiting(), ...verified()].sort((a, b) => T(b.date) - T(a.date));
  if (!all.length) return `<div style="margin-top:14px">${emptyState('Your history starts with your first seva', 'Each verified seva is recorded here, privately.')}</div>`;
  let lastM = ''; let out = '<div class="tl" style="margin-top:6px">';
  all.forEach((h) => { const m = new Date(h.date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }); if (m !== lastM) { out += `<p class="month">${m}</p>`; lastM = m; } out += `<div class="ti ${h.state === 'verified' ? '' : 'pending'}">${histCard(h)}</div>`; });
  return out + '</div>';
}
function MySeva() { return `${backHead('My Seva')}<div class="greet" style="margin-top:4px"><h1>My Seva</h1><p>${participation().text}</p></div>${mySevaList()}`; }

// ----- Seva detail (live / upcoming / explore) -----
function SevaDetail({ id }) {
  const s = sv(id); if (!s) return backHead('Seva') + emptyState('This seva is no longer available', 'It may have been cancelled or moved.');
  markSeen(id);
  const a = S.assign[id]; const st = myStatus(s); const r = roleOf(s, a);
  const live = st?.key === 'ongoing'; const act = actionFor(id); const mine = a && a.state !== 'declined';
  let h = `<div class="hero ${live ? 'live' : ''}">
    ${live ? `<span class="label s-info"><span class="livedot"></span>Happening now</span>` : `<span class="label" style="color:var(--muted)">${CAT[s.cat].label} seva</span>`}
    <h1>${esc(s.title)}</h1>
    <p class="when">${span(s.start, s.end)}${s.recur ? ` · ${s.recur}` : ''}</p>
    ${mine ? `<div class="relbox">${I.user}<span class="grow small">${a.state === 'invited' ? 'You\'re invited as' : a.state === 'waitlist' ? 'On the waitlist for' : live ? 'You are assigned ·' : 'You joined as'} <b>${esc(r.name)}</b></span>${statusChip(st)}</div>` : ''}
  </div>`;
  if (live) {
    const tasks = s.tasks[a.role] || []; const done = S.checklist[id] || {};
    h += `<div class="section"><div class="section-h"><h2>Your next steps</h2>${tasks.length ? `<span class="xs muted">${Object.values(done).filter(Boolean).length} of ${tasks.length} done</span>` : ''}</div>
      <div class="card">
        <div class="kv"><div class="r">${I.flag}<div><b>${esc(r.name)}</b><span>Your role</span></div></div><div class="r">${I.pin}<div><b>${esc(s.meet)}</b><span>Meeting point</span></div></div></div>
        ${tasks.length ? `<div style="border-top:1px solid var(--border)">${tasks.map((t, i) => `<button class="check" data-act="task" data-id="${id}" data-i="${i}" aria-pressed="${!!done[i]}"><span class="box">${done[i] ? I.check : ''}</span><span class="txt small">${esc(t)}</span></button>`).join('')}</div>` : ''}
      </div>
      ${a.attendance === 'checked_in' ? `<div class="banner bg-success" style="margin-top:10px">${I.checkc}<span>Checked in at ${fmtTime(a.at)}. Your lead will verify attendance.</span></div>` : `<button class="btn block" style="margin-top:10px" data-act="scan">${I.scan} Check in at the venue</button>`}
      <div class="btn-row" style="margin-top:8px"><button class="btn ghost" data-act="lead-wa" data-id="${id}">${I.wa} Message lead</button><button class="btn ghost" data-act="maps" data-id="${id}">${I.map} Directions</button></div></div>
      <div class="section"><div class="section-h"><h2>Progress</h2></div><div class="card">${steps(1)}<p class="xs muted" style="margin-top:14px">It counts as completed only after your lead verifies attendance.</p></div></div>`;
  } else if (!mine) {
    h += `<div class="section"><div class="section-h"><h2>Choose a role</h2></div><div class="card">${s.roles.map((ro) => { const left = ro.cap - ro.filled; return `<div class="slot"><div class="grow"><b class="small">${esc(ro.name)}</b><p class="xs muted">${ro.filled} of ${ro.cap} filled</p><div class="bar ${left <= 0 ? 'full' : ''}"><i style="width:${Math.round(ro.filled / ro.cap * 100)}%"></i></div></div>${S.minor ? `<span class="chip bg-neutral">${I.lock}Guardian approval</span>` : left > 0 ? `<button class="btn sm" data-act="join" data-id="${id}" data-role="${ro.id}">Join</button>` : `<button class="btn sm ghost" data-act="waitlist" data-id="${id}" data-role="${ro.id}">Waitlist</button>`}</div>`; }).join('')}</div>
      <p class="xs muted" style="margin-top:8px">Joining adds it to My Seva. If a role is full, the waitlist moves up automatically.</p></div>`;
  } else if (a.state === 'invited') {
    h += `<div class="section"><div class="card"><p class="small">Your lead invited you as <b>${esc(r.name)}</b>. Please respond so they can plan.</p><div class="btn-row" style="margin-top:12px"><button class="btn ghost" data-act="decline" data-id="${id}">Decline</button><button class="btn" data-act="accept" data-id="${id}">Accept</button></div></div></div>`;
  } else if (act) {
    h += `<div class="section"><div class="card" style="border-color:color-mix(in srgb,var(--attention) 45%,var(--border))"><span class="label s-attention">${I.alert}Needs your action</span><p class="small" style="margin-top:8px">${esc(act.title)}</p><button class="btn block" style="margin-top:12px" data-act="action" data-id="${act.id}">Review</button></div></div>`;
  }
  h += `<div class="section"><div class="section-h"><h2>Details</h2></div><div class="card"><div class="kv">
    <div class="r">${I.pin}<div><b>${esc(s.place)}</b><span>${esc(s.meet)}</span></div></div>
    <div class="r">${I.clock}<div><b>${fmtLong(s.start)}, ${fmtTime(s.start)} – ${fmtTime(s.end)}</b><span>Your local time (${esc(tz)})</span></div></div>
    <div class="r">${I.user}<div><b>${esc(s.lead)}</b><span>Seva lead · ${grp().name}</span></div></div>
    <div class="r">${I.users}<div><b>${s.roles.reduce((n, x) => n + x.filled, 0)} volunteers so far</b><span>Names are visible to leads only</span></div></div>
    <div class="r">${I.info}<div><b>${esc(s.purpose)}</b><span>${esc(s.instructions)}</span></div></div>
  </div></div></div>`;
  if (s.updates.length) h += `<div class="section"><div class="section-h"><h2>Updates</h2></div><div class="card list">${s.updates.map((u) => `<div class="lrow"><span class="chip bg-attention">${I.info}Update</span><div class="grow"><b class="small">${esc(u.t)}</b><p class="xs muted">${relDay(u.d)} · ${fmtTime(u.d)}</p></div></div>`).join('')}</div></div>`;
  h += `<div class="btn-row" style="margin-top:16px"><button class="btn soft" data-act="cal" data-id="${id}">${I.cal} Calendar</button><button class="btn soft" data-act="wa" data-id="${id}">${I.wa} WhatsApp</button></div>`;
  if (mine && ['accepted', 'waitlist'].includes(a.state) && !live) h += `<button class="btn danger block" style="margin-top:8px" data-act="drop" data-id="${id}">Can't make it</button>`;
  if (live) h += `<div class="demo"><p class="h">Prototype controls</p><button class="btn sm ghost" data-act="demo-end" data-id="${id}">End this seva now</button><p class="xs faint" style="margin-top:8px">Simulates the seva finishing, so you can see “Awaiting verification” and then the lead's verification.</p></div>`;
  return backHead(live ? 'Live seva' : 'Seva', `<button class="iconbtn" data-act="wa" data-id="${id}" aria-label="Share on WhatsApp">${I.share}</button>`) + h;
}
function steps(cur) {
  // cur: index of the current step (0-3); 4 = all done
  const L = ['Scheduled', 'In progress', 'Submitted', 'Verified'];
  return `<div class="steps" role="img" aria-label="Progress: ${cur > 3 ? 'Verified' : L[cur]}"><span class="bar" style="width:calc((100% - 24px) * ${Math.min(cur, 3) / 3})"></span>${L.map((l, i) => `<div class="step ${i < cur ? 'done' : i === cur ? 'now' : ''}"><i>${i < cur ? I.check : ''}</i>${l}</div>`).join('')}</div>`;
}
function HistoryDetail({ id }) {
  const h = S.history.find((x) => x.id === id); if (!h) return backHead('Record') + emptyState('Record not found', '');
  const ok = h.state === 'verified';
  return `${backHead('Seva record', ok ? `<button class="iconbtn" data-act="share" data-h="${id}" aria-label="Share">${I.share}</button>` : '')}
    <div class="hero"><span class="label ${ok ? 's-success' : 's-attention'}">${ok ? I.checkc + 'Verified' : I.hourglass + 'Awaiting verification'}</span><h1>${esc(h.title)}</h1><p class="when">${fmtLong(h.date)} · ${h.hrs} hours · ${esc(h.role)}</p></div>
    <div class="section"><div class="card">${steps(ok ? 4 : 2)}<p class="xs muted" style="margin-top:14px">${ok ? 'Your lead confirmed your attendance, so it counts toward Completed.' : 'Your check-in is recorded. It counts as completed once your lead verifies it.'}</p></div></div>
    ${ok ? `<button class="btn block" style="margin-top:16px" data-act="share" data-h="${id}">${I.share} Share this seva</button>` : `<div class="demo"><p class="h">Prototype controls</p><button class="btn sm ghost" data-act="demo-verify" data-id="${id}">Lead verifies attendance</button></div>`}`;
}

// ----- Event detail -----
function EventDetail({ id }) {
  const e = ev(id); if (!e) return backHead('Event') + emptyState('Event not found', '');
  markSeen(id);
  const going = S.rsvp[id] === 'going'; const linked = e.linked && sv(e.linked);
  const days = Math.max(0, Math.ceil((T(e.start) - now()) / DAY));
  return `${backHead('Event', `<button class="iconbtn" data-act="wa-e" data-id="${id}" aria-label="Share">${I.share}</button>`)}
    <div class="hero evt"><span class="label s-event">${I.cal}${esc(e.kind)}</span><h1>${esc(e.title)}</h1><p class="when">${span(e.start, e.end)}</p>
      ${going ? `<div class="relbox">${I.checkc}<span class="grow small">You're going</span></div>` : ''}</div>
    <div class="section"><div class="card"><div class="kv">
      <div class="r">${I.pin}<div><b>${esc(e.place)}</b><span>Venue</span></div></div>
      <div class="r">${I.clock}<div><b>${days} day${days === 1 ? '' : 's'} to go</b><span>${fmtLong(e.start)} · your local time (${esc(tz)})</span></div></div>
      <div class="r">${I.users}<div><b>${e.going.toLocaleString()} going${e.cap ? ` of ${e.cap}` : ''}</b><span>Audience: ${esc(e.audience)}</span></div></div>
      <div class="r">${I.user}<div><b>${esc(e.organizer)}</b><span>Organizer</span></div></div>
    </div></div></div>
    <div class="section"><div class="section-h"><h2>Agenda</h2></div><div class="card list">${e.agenda.map((x, i) => `<div class="lrow"><span class="avatar" style="width:30px;height:30px;font-size:12px">${i + 1}</span><b class="small">${esc(x)}</b></div>`).join('')}</div></div>
    ${linked ? `<div class="section"><div class="section-h"><h2>Volunteer at this event</h2></div>${actCard('seva', linked, myStatus(linked) || openSpots(linked))}</div>` : ''}
    <div class="btn-row" style="margin-top:16px"><button class="btn soft" data-act="cal-e" data-id="${id}">${I.cal} Calendar</button><button class="btn soft" data-act="wa-e" data-id="${id}">${I.wa} Share</button></div>
    <div class="seg" style="margin-top:12px" role="group" aria-label="RSVP"><button data-act="rsvp" data-id="${id}" data-v="going" aria-pressed="${going}">Going</button><button data-act="rsvp" data-id="${id}" data-v="no" aria-pressed="${S.rsvp[id] === 'no'}">Can't go</button></div>
    <p class="xs muted" style="margin-top:8px">Events are separate from seva and don't count toward completed seva.</p>`;
}

// ----- Community -----
function Community() {
  const types = [['all', 'All', null], ['seva', 'Seva stories', 'var(--success)'], ['event', 'Events', 'var(--event)'], ['update', 'Updates', 'var(--attention)']];
  const posts = S.posts.filter((p) => feedScope === 'local' ? p.scope === 'local' : true).filter((p) => feedType === 'all' || p.type === feedType || (feedType === 'seva' && p.type === 'milestone')).sort((a, b) => T(b.date) - T(a.date));
  return `<div class="greet" style="margin-top:12px"><h1>Community</h1><p>Official stories from seva and events</p></div>
    <div class="seg" role="group" aria-label="Scope"><button data-scope="local" aria-pressed="${feedScope === 'local'}">${grp().city}</button><button data-scope="world" aria-pressed="${feedScope === 'world'}">Worldwide</button></div>
    <button class="card tap" style="margin-top:14px;padding:0;overflow:hidden" data-open="garden"><div class="garden-wrap" style="border-radius:0">${gardenSVG(S.garden)}</div>
      <div class="row" style="padding:12px 16px"><div class="grow"><b class="small">${grp().city} community garden</b><p class="xs muted">Grows with every verified seva by the group · level ${S.garden} of 8</p></div>${chev}</div></button>
    <div class="fchips" style="margin-top:14px" role="group" aria-label="Story type">${types.map(([v, l, c]) => `<button class="fchip" data-ft="${v}" aria-pressed="${feedType === v}">${c ? `<i class="sw" style="background:${c}"></i>` : ''}${l}</button>`).join('')}</div>
    <div class="stack" style="margin-top:10px">${posts.map(postCard).join('') || emptyState('No stories here yet', '')}</div>
    <p class="xs faint" style="text-align:center;margin-top:16px">No comments, no member posts, no rankings.</p>`;
}
const PT = { seva: ['Seva story', 'success'], event: ['Event', 'event'], update: ['Important update', 'attention'], milestone: ['Garden milestone', 'neutral'] };
function postCard(p) {
  const [lbl, cls] = PT[p.type];
  return `<article class="card post p-${p.type}"><div class="head">${ico(p.cat)}<div class="grow"><span class="label s-${cls}" ${p.type === 'milestone' ? 'style="color:var(--accent)"' : ''}>${lbl}</span><p class="xs muted">${esc(p.city)} · ${relDay(p.date)}</p></div></div>
    <div class="body"><h3>${esc(p.title)}</h3><p class="small muted" style="margin-top:4px">${esc(p.text)}</p>
    ${p.link ? `<button class="link" data-open="${p.link}">${p.type === 'event' ? 'View event' : p.link === 'garden' ? 'Open garden' : 'View details'} ${I.chev}</button>` : ''}
    ${p.type !== 'update' ? reacts(p) : ''}</div></article>`;
}
function reacts(p) {
  const mine = S.mine[p.id];
  return `<div class="reacts">${[['g', '🙏', 'Gratitude'], ['a', '💚', 'Appreciate'], ['c', '👏', 'Applause']].map(([k, e, l]) => { const n = p.r[k] + (mine === k ? 1 : 0); return `<button class="react" data-react="${p.id}:${k}" aria-pressed="${mine === k}" aria-label="${l}, ${n}"><span aria-hidden="true">${e}</span>${n}</button>`; }).join('')}</div>`;
}
function GardenPage() {
  const L = ['First flowers', 'A garden path', 'Rose beds', 'The mango tree', 'Lanterns lit', 'The banyan', 'Lotus pond and bench', 'Peacocks arrive'];
  return `${backHead(grp().city + ' garden')}<div class="garden-wrap">${gardenSVG(S.garden)}</div>
    <p class="small muted" style="margin-top:12px">This garden belongs to everyone in ${grp().name}. It grows when the group completes verified seva together. It never wilts, and nobody is ranked.</p>
    <div class="section"><div class="section-h"><h2>Milestones</h2><span class="xs muted">Level ${S.garden} of 8</span></div><div class="card list">${L.map((t, i) => `<div class="lrow">${i < S.garden ? `<span class="chip bg-success">${I.check}Reached</span>` : `<span class="chip bg-neutral">Level ${i + 1}</span>`}<span class="small grow">${t}</span></div>`).join('')}</div></div>`;
}
function gardenSVG(level, still) {
  const P = (gx, gy) => [160 + (gx - gy) * 26, 54 + (gx + gy) * 15];
  let t = '';
  for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) { const [cx, cy] = P(x, y); const path = level >= 2 && (x === 2 || (level >= 4 && y === 2)); t += `<path d="M${cx} ${cy - 15}L${cx + 26} ${cy}L${cx} ${cy + 15}L${cx - 26} ${cy}Z" fill="${path ? '#E6D7BC' : (x + y) % 2 ? '#A9CBA8' : '#9EC29D'}" stroke="#8DB48C" stroke-width=".6"/>`; }
  const [lx, ly] = P(0, 4), [bx, by] = P(4, 4), [rx, ry] = P(4, 0);
  const edge = `<path d="M${lx - 26} ${ly}L${bx} ${by + 15}L${bx} ${by + 24}L${lx - 26} ${ly + 9}Z" fill="#8A6A48"/><path d="M${bx} ${by + 15}L${rx + 26} ${ry}L${rx + 26} ${ry + 9}L${bx} ${by + 24}Z" fill="#6E5236"/>`;
  const sw = still ? '' : 'sway';
  const F = (gx, gy, c) => { const [x, y] = P(gx, gy); return `<g class="${sw}"><path d="M${x} ${y}v-12" stroke="#4E8460" stroke-width="2"/><circle cx="${x}" cy="${y - 14}" r="4.5" fill="${c}"/><circle cx="${x}" cy="${y - 14}" r="1.8" fill="#F6D776"/></g>`; };
  const Tr = (gx, gy, s = 1) => { const [x, y] = P(gx, gy); return `<g><rect x="${x - 3}" y="${y - 20 * s}" width="6" height="${20 * s}" rx="2" fill="#7A5A38"/><circle cx="${x}" cy="${y - 30 * s}" r="${15 * s}" fill="#4E8A5E"/><circle cx="${x - 7 * s}" cy="${y - 25 * s}" r="${9 * s}" fill="#6BA678"/><circle cx="${x + 6}" cy="${y - 26 * s}" r="2.6" fill="#F2A33A"/><circle cx="${x - 4}" cy="${y - 36 * s}" r="2.6" fill="#F2B83A"/></g>`; };
  const Ln = (gx, gy) => { const [x, y] = P(gx, gy); return `<g><path d="M${x} ${y}v-26" stroke="#4A3B2D" stroke-width="2"/><circle cx="${x}" cy="${y - 30}" r="9" fill="#F6D776" opacity=".45"/><rect x="${x - 4}" y="${y - 34}" width="8" height="9" rx="2" fill="#F3C24F"/></g>`; };
  const Bn = (gx, gy) => { const [x, y] = P(gx, gy); return `<g transform="translate(${x} ${y})"><path d="M-14 -6v6M14 -6v6M0 1v6" stroke="#5B4330" stroke-width="2.4"/><path d="M-16 -8L0 0L16 -8L0 -16Z" fill="#C48A55"/><path d="M-16 -8L0 -16V-28L-16 -20Z" fill="#9A6A40"/></g>`; };
  const Pd = (gx, gy) => { const [x, y] = P(gx, gy); return `<g transform="translate(${x} ${y})"><ellipse rx="22" ry="11" fill="#6FB4D8"/><ellipse rx="16" ry="7.5" fill="#8CCBEA"/><path d="M4 -1c-3-5 0-9 2-9s5 4 2 9z" fill="#F29BB5"/></g>`; };
  const Pc = (gx, gy) => { const [x, y] = P(gx, gy); return `<g transform="translate(${x} ${y})"><path d="M0 -8C-22 -12 -22 -40 0 -44C22 -40 22 -12 0 -8z" fill="#2E8B6E"/>${[-12, -6, 0, 6, 12].map((dx) => `<circle cx="${dx}" cy="${-32 + Math.abs(dx)}" r="3" fill="#1F4E8C"/>`).join('')}<ellipse cy="-10" rx="5" ry="8" fill="#1F5FA8"/><circle cx="1" cy="-20" r="3.4" fill="#2069B8"/></g>`; };
  const Ba = (gx, gy) => { const [x, y] = P(gx, gy); return `<g transform="translate(${x} ${y})"><path d="M-12 0v-24M-4 0v-28M6 0v-28M13 0v-22" stroke="#7A5A38" stroke-width="3"/><ellipse cy="-40" rx="28" ry="16" fill="#3E7A52"/><ellipse cx="-10" cy="-44" rx="15" ry="10" fill="#4F8F62"/></g>`; };
  const it = [];
  if (level >= 1) it.push(F(0, 1, '#E39AA8'), F(1, 0, '#F2B66D'), F(1, 1, '#B79CE0'));
  if (level >= 3) it.push(F(4, 1, '#E25A6C'), F(3, 4, '#E39AA8'), F(0, 3, '#F2B66D'));
  if (level >= 4) it.push(Tr(0, 0, .9));
  if (level >= 5) it.push(Ln(3, 1), Ln(1, 3));
  if (level >= 6) it.push(Ba(4, 4));
  if (level >= 7) it.push(Pd(4, 0), Bn(3, 3));
  if (level >= 8) it.push(Pc(1, 4));
  return `<svg viewBox="0 -14 320 210" role="img" aria-label="Community garden at level ${level} of 8">${edge}${t}${it.join('')}</svg>`;
}

// ----- Profile -----
function Profile() {
  const v = verified(); const hrs = v.reduce((n, h) => n + h.hrs, 0); const cats = new Set(v.map((h) => h.cat));
  const allCats = ['langar', 'cleanup', 'tree', 'education', 'blanket'];
  const p = participation();
  return `<div class="hdr" style="margin-top:6px"><span class="date">Profile</span><div class="pillgroup"><button data-act="inbox" aria-label="Inbox, ${unread()} unread">${I.bell}${unread() ? '<span class="dotbadge"></span>' : ''}</button><button data-act="share" aria-label="Share my seva">${I.share}</button></div></div>
    <div class="row" style="margin:18px 0"><span class="avatar" style="width:60px;height:60px;font-size:20px">${initials(ME())}</span><div><h1 style="font-size:23px;letter-spacing:-.01em">${esc(ME())}</h1><p class="small muted">${grp().name} · Member</p></div></div>
    <div class="card"><div class="row" style="margin-bottom:14px"><b class="grow">My journey</b><span class="chip bg-neutral">${I.lock}Private</span></div>
      <div class="stats3"><div><b>${v.length}</b><span>Verified seva</span></div><div><b>${hrs % 1 ? hrs.toFixed(1) : hrs}</b><span>Hours given</span></div><div><b>${cats.size}</b><span>Kinds of seva</span></div></div>
      <div class="stamps" aria-label="Kinds of seva served: ${[...cats].map((c) => CAT[c].label).join(', ') || 'none yet'}">${allCats.map((c) => `<div class="stamp ${cats.has(c) ? '' : 'off'}" title="${CAT[c].label}">${CAT[c].svg}</div>`).join('')}</div>
      ${p.key === 'less' && p.last ? `<p class="xs muted" style="margin-top:12px">Last recorded seva: ${fmtLong(p.last.date)}. Only you can see this.</p>` : ''}
    </div>
    <div class="card list" style="margin-top:12px">
      <button class="lrow" data-act="myseva" data-tab="${openActions().length ? 'action' : 'upcoming'}"><span class="ico" style="width:38px;height:38px;min-width:38px;color:var(--accent)">${I.seva.replace('<svg', '<svg style="width:20px;height:20px"')}</span><span class="grow"><b class="small">My Seva</b><p class="xs muted">Needs action, upcoming, completed</p></span>${chev}</button>
      <button class="lrow" data-act="share"><span class="ico" style="width:38px;height:38px;min-width:38px;color:var(--accent)">${I.share.replace('<svg', '<svg style="width:20px;height:20px"')}</span><span class="grow"><b class="small">Share my seva</b><p class="xs muted">An image card for WhatsApp status or stories</p></span>${chev}</button>
    </div>
    <div class="section"><div class="section-h"><h2>Appearance</h2></div><div class="card">
      <div class="seg" role="group" aria-label="Light or dark">${[['auto', 'System'], ['light', 'Light'], ['dark', 'Dark']].map(([k, l]) => `<button data-setmode="${k}" aria-pressed="${S.mode === k}">${l}</button>`).join('')}</div>
      <p class="small" style="font-weight:600;margin:16px 0 8px">Accent colour</p>
      <div class="swatches">${[['forest', 'Forest', '#355E4B'], ['ocean', 'Ocean', '#275E7E'], ['dusk', 'Dusk', '#554B8C'], ['earth', 'Earth', '#8A5230']].map(([k, l, c]) => `<button class="swatch" data-setaccent="${k}" aria-pressed="${S.accent === k}"><i style="background:${c}"></i>${l}</button>`).join('')}</div>
      <p class="xs muted" style="margin-top:10px">Status colours (verified, needs action, happening now) stay the same in every theme.</p></div></div>
    <div class="section"><div class="section-h"><h2>Notifications</h2></div><div class="card list">
      <div class="lrow"><div class="grow"><b class="small">In-app inbox</b><p class="xs muted">Always on. Every update lands here.</p></div><span class="chip bg-success">${I.check}On</span></div>
      <div class="lrow"><div class="grow"><b class="small">Push reminders</b><p class="xs muted">${matchMedia('(display-mode: standalone)').matches || navigator.standalone ? 'Available in the installed app' : 'Add to Home Screen first (needed on iPhone)'}</p></div><button class="btn sm soft" data-act="push">Test</button></div>
      <div class="lrow"><div class="grow"><b class="small">Calendar</b><p class="xs muted">Add your upcoming commitments</p></div><button class="btn sm soft" data-act="cal-all">Add</button></div>
    </div></div>
    <div class="demo"><p class="h">Prototype: try member states</p>
      <div class="seg" role="group" aria-label="Member state">${[['new', 'New'], ['active', 'Active'], ['less', 'Less active']].map(([k, l]) => `<button data-scn="${k}" aria-pressed="${S.scenario === k}">${l}</button>`).join('')}</div>
      <p class="xs faint" style="margin-top:8px">New: first day, nothing yet. Active: a seva is happening now and some actions are pending. Less active: last seva about two months ago.</p>
      <button class="btn sm ghost block" style="margin-top:10px" data-act="reset">Reset prototype</button></div>
    <p class="xs faint" style="text-align:center;margin-top:20px">Namdhari Seva &amp; Community · member prototype v3</p>`;
}

// ----- Inbox -----
const NL = { info: ['info', I.info], attention: ['attention', I.alert], new: ['success', I.sparkle], success: ['success', I.checkc], critical: ['critical', I.alert] };
function Inbox() {
  const list = S.notifs.slice();
  setTimeout(() => { S.notifs.forEach((n) => n.read = true); save(); }, 0);
  return `${backHead('Inbox')}<div class="greet" style="margin-top:4px"><h1>Inbox</h1><p>Every update lands here, even without push.</p></div>
    <div class="card list">${list.map((n) => { const [c, ic] = NL[n.level] || NL.info; return `<button class="lrow" data-open="${n.ref}"><span class="ico bg-${c}" style="width:40px;height:40px;min-width:40px">${ic.replace('<svg', '<svg style="width:20px;height:20px"')}</span><span class="grow"><b class="small" style="display:block">${esc(n.t)}</b><span class="xs muted">${relDay(n.d)} · ${fmtTime(n.d)}</span></span>${n.read ? '' : '<span class="newtag">NEW</span>'}</button>`; }).join('') || '<p class="muted small" style="padding:14px 0">All caught up.</p>'}</div>`;
}

// ---------- Sheets ----------
function openSheet(html) { $('#sheet-root').innerHTML = `<div class="scrim" data-act="close-sheet"></div><div class="sheet" role="dialog" aria-modal="true"><div class="grabber"></div>${html}</div>`; document.body.style.overflow = 'hidden'; }
function closeSheet() { $('#sheet-root').innerHTML = ''; document.body.style.overflow = ''; }
const sheetHead = (t, sub) => `<div class="sheet-h"><div>${sub ? `<p class="xs muted">${sub}</p>` : ''}<h2>${t}</h2></div><button class="iconbtn" data-act="close-sheet" aria-label="Close">${I.close}</button></div>`;

function actionSheet(id) {
  const a = S.actions.find((x) => x.id === id); if (!a || a.resolved) return;
  const s = sv(a.ref); const r = roleOf(s, S.assign[s.id]);
  const label = a.kind === 'invite' ? `<span class="label s-event">${I.sparkle}Invitation</span>` : `<span class="label s-attention">${I.alert}Needs your action</span>`;
  const btns = a.kind === 'confirm' ? `<button class="btn ghost" data-act="act-no" data-id="${id}">Can't make it</button><button class="btn" data-act="act-yes" data-id="${id}">Yes, I'll be there</button>`
    : a.kind === 'ack' ? `<button class="btn block" data-act="act-yes" data-id="${id}">Got it</button>`
    : `<button class="btn ghost" data-act="act-no" data-id="${id}">Decline</button><button class="btn" data-act="act-yes" data-id="${id}">Accept</button>`;
  openSheet(`${sheetHead(esc(a.title))}${label}
    <button class="card tap" style="margin-top:12px" data-open="seva:${s.id}"><div class="act">${ico(s.cat)}<div class="grow"><h3>${esc(s.title)}</h3><p class="l2">${span(s.start, s.end)}</p><div class="l3"><span class="role">${esc(r.name)}</span></div></div>${chev}</div></button>
    ${a.kind === 'ack' ? `<div class="banner bg-attention" style="margin-top:12px">${I.pin}<span>${esc(s.updates[0]?.t || a.text)}</span></div>` : ''}
    <p class="xs muted" style="margin:12px 0">Please respond by ${relDay(a.due).toLowerCase()}, ${fmtTime(a.due)}. Your lead sees your answer straight away.</p>
    <div class="btn-row">${btns}</div>`);
}
function viewAllSheet(k) {
  const pr = priority(); const t = { live: 'Happening now', action: 'Needs your action', soon: 'Coming up', invite: 'Invitations' }[k];
  const items = pr.items.map((i) => k === 'live' ? actCard('seva', i, myStatus(i)) : k === 'soon' ? (i.t === 'seva' ? actCard('seva', i.x, myStatus(i.x)) : actCard('event', i.x, { cls: 'event', label: 'Going', icon: I.checkc })) : `<button class="card tap" data-act="action" data-id="${i.id}"><b class="small">${esc(i.title)}</b><p class="xs muted">${esc(i.text)}</p></button>`).join('');
  openSheet(`${sheetHead(t)}<div class="stack">${items}</div>`);
}
function scanSheet() {
  const l = liveMine()[0];
  if (!l) { openSheet(`${sheetHead('Check in')}${emptyState('No seva is happening right now', 'Check-in opens when a seva you joined starts. Scan the QR code your lead shows at the venue.')}`); return; }
  const a = S.assign[l.id];
  if (a.attendance === 'checked_in') { openSheet(`${sheetHead('You\'re checked in', esc(l.title))}<div class="banner bg-success">${I.checkc}<span>Checked in at ${fmtTime(a.at)}. Your lead will verify attendance after the seva.</span></div><button class="btn block" data-act="close-sheet">Done</button>`); return; }
  openSheet(`${sheetHead('Scan to check in', esc(l.title))}
    <div class="viewfinder"><div class="corners"></div><div class="scanline"></div><span style="color:#fff;font-size:13px;opacity:.75;position:absolute;bottom:14px;left:0;right:0;text-align:center">Point at the QR code your lead is showing</span></div>
    <button class="btn block" style="margin-top:14px" data-act="checkin" data-id="${l.id}">Simulate scan (prototype)</button>
    <button class="btn ghost block" style="margin-top:8px" data-act="checkin" data-id="${l.id}" data-code="1">Enter 6-digit code instead</button>
    <p class="xs muted" style="margin-top:10px">Check-in works offline and syncs later. It shows as “awaiting verification” until your lead confirms.</p>`);
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
  const bg = style === 'dark' ? '#141C19' : style === 'light' ? '#F8F7F2' : null;
  const panel = style === 'clear' ? 'rgba(20,28,25,.8)' : dark ? '#1D2723' : '#FFFFFF';
  const sub = dark ? '#25312C' : '#F1F0EA';
  const ink = dark ? '#EEF3EF' : '#1D2B25', mute = dark ? '#9DABA3' : '#66736C', ok = dark ? '#7DD7A7' : '#287A58', okbg = dark ? '#18302A' : '#E4F2EA';
  const F = 'font-family="Inter,-apple-system,Segoe UI,Roboto,sans-serif"';
  const inner = (c, x, y, s) => `<svg x="${x}" y="${y}" width="${s}" height="${s}" viewBox="0 0 64 64">${CAT[c].svg.replace(/<\/?svg[^>]*>/g, '')}</svg>`;
  let body;
  if (d.kind === 'seva') {
    const h = d.h; const tt = h.title.length > 24 ? h.title.slice(0, 23) + '…' : h.title;
    body = `<rect x="60" y="140" width="480" height="450" rx="36" fill="${panel}"/>
      <rect x="250" y="180" width="100" height="100" rx="26" fill="${sub}"/>${inner(h.cat, 268, 198, 64)}
      <text x="300" y="345" text-anchor="middle" font-size="34" font-weight="700" fill="${ink}" ${F}>${esc(tt)}</text>
      <text x="300" y="386" text-anchor="middle" font-size="20" fill="${mute}" ${F}>${esc(fmtLong(h.date))} • ${esc(grp().city)}</text>
      <rect x="205" y="414" width="190" height="46" rx="23" fill="${okbg}"/><text x="300" y="444" text-anchor="middle" font-size="19" font-weight="700" fill="${ok}" ${F}>✓ Verified seva</text>
      <text x="300" y="520" text-anchor="middle" font-size="20" fill="${mute}" ${F}>${esc(h.role)} • ${h.hrs} hours</text>`;
  } else {
    const month = new Date().toLocaleDateString(undefined, { month: 'long' });
    body = `<rect x="60" y="140" width="480" height="450" rx="36" fill="${panel}"/>
      <text x="300" y="205" text-anchor="middle" font-size="24" font-weight="700" fill="${ink}" ${F}>My Seva • ${esc(month)}</text>
      <text x="300" y="240" text-anchor="middle" font-size="18" fill="${mute}" ${F}>${esc(grp().name)}</text>
      <text x="180" y="355" text-anchor="middle" font-size="96" font-weight="700" fill="${ink}" ${F}>${d.n}</text>
      <text x="180" y="395" text-anchor="middle" font-size="19" fill="${mute}" ${F}>seva this month</text>
      <line x1="300" y1="285" x2="300" y2="400" stroke="${dark ? '#2B3833' : '#E6E4DC'}" stroke-width="2"/>
      <text x="420" y="355" text-anchor="middle" font-size="96" font-weight="700" fill="${ink}" ${F}>${d.hrs % 1 ? d.hrs.toFixed(1) : d.hrs}</text>
      <text x="420" y="395" text-anchor="middle" font-size="19" fill="${mute}" ${F}>hours given</text>
      ${d.cats.map((c, i) => { const x = 300 - (d.cats.length * 76 - 16) / 2 + i * 76; return `<rect x="${x}" y="436" width="60" height="60" rx="16" fill="${sub}"/>${inner(c, x + 10, 446, 40)}`; }).join('')}
      <text x="300" y="550" text-anchor="middle" font-size="18" fill="${ok}" font-weight="600" ${F}>${d.total} verified seva in total</text>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${bg ? `<rect width="${W}" height="${H}" fill="${bg}"/>` : ''}${body}
    <g transform="translate(300 650)"><rect x="-140" y="-26" width="280" height="52" rx="26" fill="${panel}"/><circle cx="-104" cy="0" r="15" fill="#355E4B"/><path d="M-104 8v-12M-104 -3c0-6 4-8 9-8 0 5-3 8-9 8zM-104 0c0-4-3-6-7-6 0 4 3 6 7 6z" fill="none" stroke="#fff" stroke-width="2"/><text x="-80" y="7" font-size="19" font-weight="700" fill="${ink}" ${F}>Namdhari Seva</text></g></svg>`;
}
function shareSheet(hid) {
  if (hid) { shareKind = 'seva'; shareH = hid; }
  if (!verified().length) shareKind = 'month';
  openSheet(`${sheetHead('Share', 'For WhatsApp status or stories')}
    <div class="share-tabs" role="group" aria-label="Card"><button data-sk="month" aria-pressed="${shareKind === 'month'}">This month</button>${verified().length ? `<button data-sk="seva" aria-pressed="${shareKind === 'seva'}">${shareH ? 'This seva' : 'Latest seva'}</button>` : ''}</div>
    <div class="carousel" id="car">${STYLES.map(([k, l]) => `<div class="slide ${k === 'clear' ? 'checker' : ''}"><span class="stl">${l}</span>${cardSVG(k)}</div>`).join('')}</div>
    <div class="dots">${STYLES.map((_, i) => `<i class="${i === shareIdx ? 'on' : ''}"></i>`).join('')}</div>
    <div class="share-acts">
      <button data-act="sh-save"><span class="c">${I.download}</span>Save image</button>
      <button data-act="sh-copy"><span class="c">${I.copy}</span>Copy image</button>
      <button data-act="sh-wa"><span class="c">${I.wa}</span>WhatsApp</button>
      <button data-act="sh-share"><span class="c">${I.share}</span>Share</button>
    </div>`);
  const car = $('#car'); const w = () => car.firstElementChild.offsetWidth + 14;
  car.scrollLeft = shareIdx * w();
  car.addEventListener('scroll', () => { const i = Math.round(car.scrollLeft / w()); if (i !== shareIdx) { shareIdx = i; $$('.dots i').forEach((d, j) => d.classList.toggle('on', j === i)); } }, { passive: true });
}
function cardPNG() {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => { const c = document.createElement('canvas'); c.width = 1200; c.height = 1500; c.getContext('2d').drawImage(img, 0, 0, 1200, 1500); c.toBlob((b) => b ? res(b) : rej(new Error('blob')), 'image/png'); };
    img.onerror = rej; img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(cardSVG(STYLES[shareIdx][0]));
  });
}
async function shareImage(mode) {
  try {
    const blob = await cardPNG(); const file = new File([blob], 'my-seva.png', { type: 'image/png' });
    const dl = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'my-seva.png'; document.body.appendChild(a); a.click(); a.remove(); };
    if (mode === 'save') { dl(); toast('Image saved'); return; }
    if (mode === 'copy') { if (navigator.clipboard && window.ClipboardItem) { await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]); toast('Image copied'); } else toast('Copy isn\'t supported here — use Save image'); return; }
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text: 'Seva with ' + grp().name + ' 🙏' }); return; }
    if (mode === 'wa') { window.open(`https://wa.me/?text=${encodeURIComponent('Seva with ' + grp().name + ' 🙏 ' + location.origin + location.pathname)}`, '_blank', 'noopener'); return; }
    dl(); toast('Sharing isn\'t supported here — image saved instead');
  } catch (e) { if (!e || e.name !== 'AbortError') toast('Couldn\'t create the image'); }
}

// ---------- Actions ----------
function resolveAction(id, yes) {
  const a = S.actions.find((x) => x.id === id); if (!a) return; a.resolved = true;
  const s = sv(a.ref); const as = S.assign[s.id];
  if (a.kind === 'invite') { if (yes) { as.state = 'accepted'; roleOf(s, as).filled++; } else as.state = 'declined'; }
  if (a.kind === 'confirm' && !yes) { roleOf(s, as).filled--; as.state = 'declined'; }
  save(); closeSheet(); rerender();
  toast(a.kind === 'ack' ? 'Thanks — noted' : yes ? (a.kind === 'invite' ? 'Accepted — added to Upcoming' : 'Confirmed. See you there 🙏') : 'Your lead has been told. Thank you for letting them know.');
}
function openRef(ref) {
  const [k, v] = ref.split(':');
  if (k === 'seva' || k === 'event' || k === 'history') push({ v: k, id: v });
  else if (k === 'garden') push({ v: 'garden' });
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

function handle(el) {
  const act = el.dataset.act, id = el.dataset.id; buzz();
  switch (act) {
    case 'onb-next': onb = 1; renderOnboarding(); break;
    case 'onb-finish': { const n = ($('#onb-name')?.value || '').trim(); if (!n) { toast('Please add your name'); return; } S.name = n; S.minor = $('#onb-age').value === 'minor'; S.onboarded = true; save(); tab = 'home'; render(); toast(S.minor ? 'Guardian approval link sent' : `Welcome to ${grp().name}`); break; }
    case 'back': pop(); break;
    case 'close-sheet': closeSheet(); rerender(); break;
    case 'inbox': push({ v: 'inbox' }); break;
    case 'share': closeSheet(); shareSheet(el.dataset.h); break;
    case 'myseva': mySevaTab = el.dataset.tab || 'upcoming'; closeSheet(); push({ v: 'myseva' }); break;
    case 'explore': sevaSeg = 'explore'; exploreFilter = 'all'; go('seva'); break;
    case 'viewall': viewAllSheet(el.dataset.k); break;
    case 'action': actionSheet(id); break;
    case 'act-yes': resolveAction(id, true); break;
    case 'act-no': resolveAction(id, false); break;
    case 'accept': case 'decline': { const a = S.actions.find((x) => x.ref === id && !x.resolved); if (a) resolveAction(a.id, act === 'accept'); break; }
    case 'join': { const s = sv(id); const r = s.roles.find((x) => x.id === el.dataset.role); r.filled++; S.assign[id] = { state: 'accepted', role: r.id, attendance: 'none' }; save(); rerender(); toast(`You're in — ${r.name}. Added to My Seva`); break; }
    case 'waitlist': S.assign[id] = { state: 'waitlist', role: el.dataset.role, attendance: 'none' }; save(); rerender(); toast('You\'re on the waitlist — we\'ll tell you if a spot opens'); break;
    case 'drop': { if (!confirm('Release your spot? Your lead is told and it goes to the next person waiting.')) return; const s = sv(id); const a = S.assign[id]; if (a.state === 'accepted') roleOf(s, a).filled--; a.state = 'declined'; S.actions.filter((x) => x.ref === id).forEach((x) => x.resolved = true); save(); rerender(); toast('Spot released. Thank you for letting your lead know.'); break; }
    case 'task': { S.checklist[id] = S.checklist[id] || {}; S.checklist[id][el.dataset.i] = !S.checklist[id][el.dataset.i]; save(); rerender(); break; }
    case 'scan': scanSheet(); break;
    case 'checkin': { if (el.dataset.code) { const c = prompt('Enter the 6-digit code from your lead (any 6 digits in this prototype)'); if (c === null) return; if (!/^\d{6}$/.test(c.trim())) { toast('Please enter 6 digits'); return; } } const a = S.assign[id]; a.attendance = 'checked_in'; a.at = iso(now()); save(); closeSheet(); rerender(); toast('Checked in ✓ Your lead will verify'); break; }
    case 'demo-end': {
      const s = sv(id); const a = S.assign[id]; s.end = iso(now() - MIN);
      if (a.attendance === 'checked_in') { const hid = 'h' + uid(); S.history.push({ id: hid, title: s.title, cat: s.cat, date: s.start, hrs: Math.max(.5, Math.round((T(s.end) - T(s.start)) / HOUR * 2) / 2), role: roleOf(s, a).name, state: 'awaiting' }); save(); stack[stack.length - 1] = { v: 'history', id: hid }; render(); window.scrollTo(0, 0); toast('Seva ended — awaiting verification'); }
      else { save(); pop(); toast('Seva ended. You didn\'t check in, so nothing was recorded.'); }
      break;
    }
    case 'demo-verify': { const h = S.history.find((x) => x.id === id); h.state = 'verified'; S.garden = Math.min(8, S.garden + 1); S.notifs.unshift({ id: uid(), level: 'success', t: `${h.title} verified — thank you`, d: iso(now()), ref: 'history:' + h.id }); save(); rerender(); toast('Verified ✓ Completed count updated · group garden grew'); break; }
    case 'cal': { const s = sv(id); ics([{ id, title: s.title, place: s.place, start: s.start, end: s.end }], 'seva'); break; }
    case 'cal-e': { const e = ev(id); ics([{ id, title: e.title, place: e.place, start: e.start, end: e.end }], 'event'); break; }
    case 'cal-all': { const items = [...upcoming30(), ...myEventsUpcoming()]; if (!items.length) { toast('Nothing upcoming yet'); return; } ics(items.map((x) => ({ id: x.id, title: x.title, place: x.place, start: x.start, end: x.end })), 'my-seva'); break; }
    case 'wa': window.open(`https://wa.me/?text=${encodeURIComponent(shareText('seva', sv(id)))}`, '_blank', 'noopener'); break;
    case 'wa-e': window.open(`https://wa.me/?text=${encodeURIComponent(shareText('event', ev(id)))}`, '_blank', 'noopener'); break;
    case 'lead-wa': toast(`In the real app this opens WhatsApp with ${sv(id).lead}, if they've allowed it`); break;
    case 'maps': window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sv(id).place)}`, '_blank', 'noopener'); break;
    case 'rsvp': { const e = ev(id); const v = el.dataset.v; if (S.rsvp[id] === 'going' && v !== 'going') e.going--; if (S.rsvp[id] !== 'going' && v === 'going') e.going++; S.rsvp[id] = v; save(); rerender(); toast(v === 'going' ? 'RSVP confirmed — added to Upcoming' : 'Thanks for letting the organizer know'); break; }
    case 'push': pushTest(); break;
    case 'install': install(); break;
    case 'noinstall': sessionStorage.setItem('noinstall', 1); closeSheet(); rerender(); break;
    case 'reset': if (confirm('Reset the prototype?')) { localStorage.removeItem(KEY); S = fresh(); onb = 0; stack = []; tab = 'home'; render(); } break;
    case 'sh-save': shareImage('save'); break;
    case 'sh-copy': shareImage('copy'); break;
    case 'sh-wa': shareImage('wa'); break;
    case 'sh-share': shareImage('share'); break;
  }
}

// ---------- Event delegation ----------
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-act],[data-open],[data-tab],[data-seg],[data-xf],[data-mst],[data-scope],[data-ft],[data-react],[data-setmode],[data-setaccent],[data-scn],[data-sk]');
  if (!t) return;
  if (t.dataset.act) return handle(t);
  if (t.dataset.open) { buzz(); closeSheet(); openRef(t.dataset.open); return; }
  if (t.dataset.tab) { buzz(); go(t.dataset.tab); return; }
  if (t.dataset.seg) { sevaSeg = t.dataset.seg; rerender(); return; }
  if (t.dataset.xf) { exploreFilter = t.dataset.xf; rerender(); return; }
  if (t.dataset.mst) { mySevaTab = t.dataset.mst; rerender(); return; }
  if (t.dataset.scope) { feedScope = t.dataset.scope; rerender(); return; }
  if (t.dataset.ft) { feedType = t.dataset.ft; rerender(); return; }
  if (t.dataset.setmode) { S.mode = t.dataset.setmode; save(); rerender(); return; }
  if (t.dataset.setaccent) { S.accent = t.dataset.setaccent; save(); rerender(); return; }
  if (t.dataset.scn) { setScenario(t.dataset.scn); stack = []; tab = 'home'; sevaSeg = 'explore'; render(); window.scrollTo(0, 0); toast({ new: 'New member: first day', active: 'Active member: a seva is live now', less: 'Less active: last seva two months ago' }[t.dataset.scn]); return; }
  if (t.dataset.sk) { shareKind = t.dataset.sk; if (shareKind === 'month') shareH = null; shareSheet(); return; }
  if (t.dataset.react) { const [pid, k] = t.dataset.react.split(':'); S.mine[pid] = S.mine[pid] === k ? undefined : k; save(); buzz(); t.closest('.reacts').outerHTML = reacts(S.posts.find((x) => x.id === pid)); }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if ($('#sheet-root').innerHTML) { closeSheet(); rerender(); } else if (stack.length) pop(); } });
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); window.__dp = e; });
window.addEventListener('online', rerender); window.addEventListener('offline', rerender);
setInterval(() => { if (!$('#sheet-root').innerHTML && S.onboarded && !document.hidden && document.activeElement?.tagName !== 'INPUT') rerender(); }, 60000);

function deepLink() { const m = location.hash.match(/^#(seva|event)=(\w+)/); if (m && S.onboarded) { history.replaceState(null, '', location.pathname); openRef(`${m[1]}:${m[2]}`); } }
applyTheme();
$('#app').innerHTML = `<main class="screen"><div class="skel" style="height:24px;width:45%;margin-top:14px"></div><div class="skel" style="height:34px;width:70%;margin-top:22px"></div><div class="skel" style="height:220px;margin-top:22px"></div><div class="skel" style="height:124px;margin-top:22px"></div></main>`;
setTimeout(() => { render(); deepLink(); }, 250);
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
})();
