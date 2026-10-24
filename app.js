/* Namdhari Seva & Community — clickable demo (no backend; state lives on this device) */
(() => {
'use strict';

// ---------- Utilities ----------
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const DAY = 86400000;
const now = () => new Date();
const at = (dayOffset, h, m = 0) => { const d = new Date(); d.setDate(d.getDate() + dayOffset); d.setHours(h, m, 0, 0); return d.toISOString(); };
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
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2400); }
const vibrate = () => { try { navigator.vibrate && navigator.vibrate(12); } catch (e) {} };

// ---------- Icons (inline SVG, reused) ----------
const I = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
  seva: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11V7a2 2 0 1 1 4 0v4"/><path d="M11 10V5a2 2 0 1 1 4 0v6"/><path d="M15 9a2 2 0 1 1 4 0v5a7 7 0 0 1-7 7h-1a7 7 0 0 1-6-3.4L3 15a2 2 0 0 1 3.4-2l.6 1"/></svg>',
  community: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z"/></svg>',
  profile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
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
  qr: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/></svg>',
  chev: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>',
  globe: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
};
// Category illustrations (feed + passport)
const CAT = {
  cleanup: { label: 'Clean-up', tint: '#DCE8DC', svg: '<svg viewBox="0 0 64 64"><path d="M14 50C14 28 30 14 52 12c0 24-14 38-36 38" fill="#7FA98D"/><path d="M14 50C24 38 34 30 46 22" stroke="#2F5A45" stroke-width="3" fill="none" stroke-linecap="round"/></svg>' },
  langar: { label: 'Langar', tint: '#F1E9DC', svg: '<svg viewBox="0 0 64 64"><path d="M8 30h48a24 22 0 0 1-48 0z" fill="#C9935A"/><rect x="6" y="27" width="52" height="5" rx="2.5" fill="#8C5E33"/><path d="M24 22c0-4 4-4 4-8M32 22c0-4 4-4 4-8M40 22c0-4 4-4 4-8" stroke="#B3A089" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>' },
  tree: { label: 'Tree planting', tint: '#E3EEDC', svg: '<svg viewBox="0 0 64 64"><rect x="29" y="34" width="6" height="18" rx="2" fill="#8C6A43"/><circle cx="32" cy="26" r="14" fill="#5E9470"/><circle cx="24" cy="30" r="8" fill="#7FB18E"/><path d="M14 54h36" stroke="#8C6A43" stroke-width="3" stroke-linecap="round"/></svg>' },
  education: { label: 'Education', tint: '#E4E8F1', svg: '<svg viewBox="0 0 64 64"><path d="M8 16c10-4 18-2 24 4v32c-6-6-14-8-24-4z" fill="#6E86B3"/><path d="M56 16c-10-4-18-2-24 4v32c6-6 14-8 24-4z" fill="#90A6CF"/></svg>' },
  event: { label: 'Event', tint: '#EFE6DA', svg: '<svg viewBox="0 0 64 64"><rect x="10" y="14" width="44" height="40" rx="8" fill="#fff" stroke="#456C59" stroke-width="3"/><path d="M10 26h44" stroke="#456C59" stroke-width="3"/><path d="M22 9v10M42 9v10" stroke="#456C59" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="40" r="6" fill="#D89B5B"/></svg>' },
  milestone: { label: 'Milestone', tint: '#F3E4E6', svg: '<svg viewBox="0 0 64 64"><g fill="#E39AA8"><circle cx="32" cy="18" r="9"/><circle cx="46" cy="28" r="9"/><circle cx="41" cy="44" r="9"/><circle cx="23" cy="44" r="9"/><circle cx="18" cy="28" r="9"/></g><circle cx="32" cy="32" r="8" fill="#F3C969"/></svg>' },
  gratitude: { label: 'Gratitude', tint: '#F6EBD5', svg: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="#F3C969" opacity=".35"/><circle cx="32" cy="32" r="14" fill="#F3C969"/></svg>' },
  needed: { label: 'Volunteers needed', tint: '#DCE8DC', svg: '<svg viewBox="0 0 64 64"><path d="M6 38c8-2 14 0 20 6l6 4c2 1 4-1 3-3l-5-6c4 0 10 2 14 6" stroke="#456C59" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M58 30c-8 2-14 0-20-6l-4-2" stroke="#7FA98D" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="34" cy="16" r="5" fill="#D89B5B"/></svg>' },
};
const catIco = (c) => `<div class="ico" style="background:${CAT[c]?.tint || 'var(--sage)'}">${CAT[c]?.svg || ''}</div>`;

// ---------- Demo data ----------
const PEOPLE = ['Harpreet Kaur', 'Gurpreet Singh', 'Simran Kaur', 'Jaspreet Singh', 'Manjit Kaur', 'Balwinder Singh', 'Navneet Kaur', 'Amrit Singh', 'Kiranjit Kaur', 'Ravinder Singh', 'Parminder Kaur', 'Tejinder Singh'];
function seed() {
  return {
    v: 1,
    onboarded: false,
    me: { name: '', group: 'delhi', minor: false },
    role: 'member',
    theme: 'auto',
    groups: [
      { id: 'delhi', name: 'Delhi Central', city: 'Delhi', country: 'India' },
      { id: 'ludhiana', name: 'Ludhiana Sangat', city: 'Ludhiana', country: 'India' },
      { id: 'london', name: 'London Sangat', city: 'London', country: 'UK' },
    ],
    seva: [
      { id: 's1', title: 'Sunday Langar Seva', cat: 'langar', group: 'delhi', start: at(1, 9), dur: 240, place: 'Namdhari Gurdwara, Karol Bagh', recur: 'Weekly · Sundays', purpose: 'Prepare and serve langar for around 300 sangat after the morning diwan.', status: 'open',
        roles: [ { id: 'r1', name: 'Cooks', cap: 6, filled: ['Harpreet Kaur', 'Manjit Kaur', 'Navneet Kaur'], wait: [] }, { id: 'r2', name: 'Servers', cap: 8, filled: ['Gurpreet Singh', 'Amrit Singh', 'Simran Kaur', 'Ravinder Singh', 'Kiranjit Kaur'], wait: [] }, { id: 'r3', name: 'Drivers (supplies)', cap: 2, filled: ['Balwinder Singh', 'Tejinder Singh'], wait: ['Jaspreet Singh'] } ] },
      { id: 's2', title: 'Yamuna Ghat Clean-up', cat: 'cleanup', group: 'delhi', start: at(4, 7), dur: 150, place: 'Kudesia Ghat, Delhi', recur: null, purpose: 'Clear plastic waste along 400 m of the riverbank. Gloves and bags provided.', status: 'open',
        roles: [ { id: 'r1', name: 'Clean-up volunteers', cap: 20, filled: ['Simran Kaur', 'Amrit Singh', 'Parminder Kaur', 'Jaspreet Singh', 'Tejinder Singh', 'Navneet Kaur', 'Gurpreet Singh'], wait: [] }, { id: 'r2', name: 'Supplies & water', cap: 2, filled: [], wait: [] } ] },
      { id: 's3', title: 'Tree Planting Drive', cat: 'tree', group: 'delhi', start: at(9, 8), dur: 180, place: 'Sanjay Van, South Delhi', recur: 'Monthly · 2nd Saturday', purpose: 'Plant 120 native saplings with the forest department.', status: 'open',
        roles: [ { id: 'r1', name: 'Planters', cap: 15, filled: ['Kiranjit Kaur', 'Ravinder Singh'], wait: [] }, { id: 'r2', name: 'Water carriers', cap: 4, filled: [], wait: [] } ] },
      { id: 's4', title: 'Punjabi Reading Circle for Kids', cat: 'education', group: 'delhi', start: at(-1, 17), dur: 90, place: 'Community Hall, Karol Bagh', recur: 'Weekly · Saturdays', purpose: 'Help children practise Gurmukhi reading in small groups.', status: 'pending',
        roles: [ { id: 'r1', name: 'Reading helpers', cap: 5, filled: ['Harpreet Kaur', 'Simran Kaur', 'Navneet Kaur', 'Amrit Singh'], wait: [] } ] },
      { id: 's5', title: 'Langar Seva — Southall', cat: 'langar', group: 'london', start: at(2, 11), dur: 180, place: 'Namdhari Gurdwara, Southall', recur: 'Weekly · Sundays', purpose: 'Serve langar after diwan.', status: 'open',
        roles: [ { id: 'r1', name: 'Kitchen', cap: 6, filled: ['Manjit Kaur', 'Balwinder Singh'], wait: [] } ] },
    ],
    events: [
      { id: 'e1', title: 'Monthly Satsang', cat: 'event', group: 'delhi', start: at(6, 18), place: 'Namdhari Gurdwara, Karol Bagh', host: 'Delhi Central', agenda: 'Kirtan · Katha · Ardas · Langar', going: 86, cap: 200, rsvp: null, linked: 's1' },
      { id: 'e2', title: 'New Volunteer Orientation', cat: 'education', group: 'delhi', start: at(3, 19), place: 'Online (link shared after RSVP)', host: 'Delhi Central', agenda: 'How seva works · Roles · Q&A (45 min)', going: 14, cap: 40, rsvp: null, linked: null },
      { id: 'e3', title: 'Hola Mohalla Gathering', cat: 'event', group: 'world', start: at(24, 10), place: 'Sri Bhaini Sahib, Punjab', host: 'Worldwide sangat', agenda: 'Gathering · Seva · Celebration', going: 1240, cap: null, rsvp: null, linked: null },
    ],
    posts: [
      { id: 'p1', scope: 'local', cat: 'cleanup', title: 'Karol Bagh street clean-up', city: 'Delhi', date: at(-3, 10), outcome: '18 bags of waste cleared from 3 lanes', count: 22, r: { g: 31, a: 12, c: 9 }, mine: null },
      { id: 'p2', scope: 'world', cat: 'langar', title: 'Langar for 450 at Southall', city: 'London', date: at(-2, 13), outcome: 'Served 450 sangat in under 2 hours', count: 16, r: { g: 88, a: 40, c: 27 }, mine: null },
      { id: 'p3', scope: 'world', cat: 'milestone', title: 'Ludhiana sangat: 100 seva this year', city: 'Ludhiana', date: at(-5, 9), outcome: 'A new path bloomed in the Ludhiana garden', count: null, r: { g: 140, a: 61, c: 73 }, mine: null },
      { id: 'p4', scope: 'local', cat: 'needed', title: 'Volunteers needed: Yamuna clean-up', city: 'Delhi', date: at(-1, 8), outcome: '13 spots still open — join from the Seva tab', count: null, r: { g: 9, a: 6, c: 2 }, mine: null, link: 's2' },
      { id: 'p5', scope: 'world', cat: 'tree', title: '300 saplings planted in Toronto', city: 'Toronto', date: at(-8, 9), outcome: 'Partnered with the city parks team', count: 41, r: { g: 104, a: 55, c: 38 }, mine: null },
    ],
    passport: [
      { cat: 'langar', title: 'Sunday Langar Seva', date: at(-13, 9) },
      { cat: 'cleanup', title: 'Karol Bagh street clean-up', date: at(-3, 10) },
    ],
    thanks: [ { from: 'Gurpreet Singh (Lead)', text: 'Thank you for serving at the street clean-up. Your help made it possible.', date: at(-3, 18) } ],
    notifs: [
      { id: uid(), t: 'Yamuna Ghat Clean-up needs 13 more volunteers', d: at(-1, 8), read: false, open: 's2' },
      { id: uid(), t: 'Monthly Satsang — RSVP by Friday', d: at(-1, 12), read: false, open: 'e1' },
      { id: uid(), t: 'Thank-you note from Gurpreet Singh', d: at(-3, 18), read: true, open: 'profile' },
    ],
    gardenLevel: 4,
    intention: 2,
    feed: 'local',
    sevaView: 'seva',
    adminRegion: 'all',
    attendance: {},
  };
}
const KEY = 'namdhari-seva-demo-v1';
let S;
try { S = JSON.parse(localStorage.getItem(KEY)) || seed(); } catch (e) { S = seed(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

let tab = 'home';
let deferredPrompt = null;
const standalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// ---------- Derived helpers ----------
const ME = () => S.me.name || 'You';
const myGroup = () => S.groups.find((g) => g.id === S.me.group) || S.groups[0];
const filled = (s) => s.roles.reduce((n, r) => n + r.filled.length, 0);
const cap = (s) => s.roles.reduce((n, r) => n + r.cap, 0);
const myRole = (s) => s.roles.find((r) => r.filled.includes(ME()));
const myWait = (s) => s.roles.find((r) => r.wait.includes(ME()));
const visibleSeva = () => S.seva.filter((s) => s.group === S.me.group);
function fillState(s) {
  if (s.status === 'pending') return { cls: 'warn', t: 'Awaiting close' };
  if (s.status === 'closed') return { cls: 'ok', t: 'Completed' };
  const left = cap(s) - filled(s);
  if (left <= 0) return { cls: 'ok', t: 'Ready' };
  const hrs = (new Date(s.start) - now()) / 3600000;
  if (hrs < 48 && left / cap(s) > 0.3) return { cls: 'err', t: `Needs ${left} more` };
  return { cls: 'warn', t: `Needs ${left} more` };
}
function myCommitments() {
  const out = [];
  S.seva.forEach((s) => { const r = myRole(s); if (r && s.status === 'open') out.push({ kind: 'seva', id: s.id, title: s.title, start: s.start, place: s.place, sub: r.name, cat: s.cat }); });
  S.events.forEach((e) => { if (e.rsvp === 'going') out.push({ kind: 'event', id: e.id, title: e.title, start: e.start, place: e.place, sub: 'Going', cat: e.cat }); });
  return out.sort((a, b) => new Date(a.start) - new Date(b.start));
}
const unread = () => S.notifs.filter((n) => !n.read).length;

// ---------- Rendering ----------
function render() {
  document.documentElement.dataset.theme = S.theme === 'auto' ? '' : S.theme;
  if (S.theme === 'auto') delete document.documentElement.dataset.theme;
  if (!S.onboarded) return renderOnboarding();
  const app = $('#app');
  const screens = { home: Home, seva: Seva, community: Community, profile: Profile, manage: Manage };
  if (tab === 'manage' && S.role === 'member') tab = 'home';
  app.innerHTML = `<main class="screen">${roleBar()}${screens[tab]()}</main>${tabBar()}`;
  window.scrollTo(0, 0);
}
function roleBar() {
  return `<div class="rolebar"><span class="muted">Demo view as</span>
    <select id="role-select" aria-label="Switch demo role">
      <option value="member" ${S.role === 'member' ? 'selected' : ''}>Member</option>
      <option value="lead" ${S.role === 'lead' ? 'selected' : ''}>Team Lead</option>
      <option value="admin" ${S.role === 'admin' ? 'selected' : ''}>Main Admin</option>
    </select><span class="grow"></span><span class="muted xs">${esc(myGroup().name)}</span></div>`;
}
function tabBar() {
  const items = [['home', 'Home', I.home], ['seva', 'Seva', I.seva], ['community', 'Community', I.community], ['profile', 'Profile', I.profile]];
  if (S.role !== 'member') items.splice(2, 0, ['manage', 'Manage', I.manage]);
  return `<div class="tabbar"><nav aria-label="Main">${items.map(([id, l, ic]) => `<button data-tab="${id}" ${tab === id ? 'aria-current="page"' : ''}><span class="tb-ico">${ic}</span>${l}</button>`).join('')}</nav></div>`;
}

// ----- Onboarding -----
let onbStep = 0;
function renderOnboarding() {
  const g = S.groups[0];
  const steps = [
    () => `<div class="onb"><div>
        <p class="eyebrow">You've been invited to</p>
        <h1 style="margin-top:6px">${esc(g.name)}</h1>
        <p class="muted" style="margin-top:8px">Namdhari Seva &amp; Community · ${esc(g.city)}</p>
        <div class="art">${gardenSVG(5, true)}</div>
        <div class="card"><p class="eyebrow">Next seva in your group</p>
          <div class="row" style="margin-top:10px">${tile(S.seva[0].start)}<div class="grow"><h3>${esc(S.seva[0].title)}</h3><p class="muted small">${relDay(S.seva[0].start)} · ${fmtTime(S.seva[0].start)} · ${filled(S.seva[0])}/${cap(S.seva[0])} volunteers</p></div></div></div>
      </div>
      <div style="margin-top:24px"><button class="btn block" data-act="onb-next">Join ${esc(g.name)}</button>
      <p class="muted xs" style="text-align:center;margin-top:12px">Demo only — nothing leaves this phone.</p></div></div>`,
    () => `<div class="onb"><div>
        <p class="eyebrow">Step 2 of 2</p><h1 style="margin-top:6px">A little about you</h1>
        <label class="f" for="onb-name">Your name</label><input class="in" id="onb-name" autocomplete="name" placeholder="e.g. Harjeet Kaur" value="${esc(S.me.name)}">
        <label class="f" for="onb-age">Age group</label>
        <select class="in" id="onb-age"><option value="adult">18 or older</option><option value="minor">Under 18</option></select>
        <p class="muted xs" style="margin-top:8px">Under-18 members need a guardian's approval before joining seva (India's DPDP rules).</p>
        <label class="f">Sign in with</label>
        <div class="btn-row"><button class="btn ghost" data-act="onb-finish" data-m="google">Google</button><button class="btn ghost" data-act="onb-finish" data-m="email">Email link</button></div>
      </div>
      <button class="btn block" data-act="onb-finish" style="margin-top:24px">Continue</button></div>`,
  ];
  $('#app').innerHTML = steps[onbStep]();
}

// ----- Home -----
function Home() {
  if (S.role === 'lead') return LeadHome();
  if (S.role === 'admin') return AdminHome();
  const commits = myCommitments();
  const next = commits[0];
  const needs = visibleSeva().filter((s) => s.status === 'open' && !myRole(s) && filled(s) < cap(s)).sort((a, b) => new Date(a.start) - new Date(b.start));
  const hour = now().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const stories = S.posts.filter((p) => p.scope === 'local' || p.city === myGroup().city).slice(0, 2);
  return `
    <div class="topbar"><div><p class="eyebrow">${greet}</p><h1>${esc(ME().split(' ')[0])}</h1></div>
      <button class="iconbtn" data-act="notifs" aria-label="Notifications, ${unread()} unread">${I.bell}${unread() ? `<span class="badge">${unread()}</span>` : ''}</button></div>
    ${installBanner()}
    ${S.me.minor ? `<div class="notice" style="margin-bottom:16px">${I.info}<div class="small"><b>Waiting for guardian approval.</b> You can browse, and you'll be able to join seva once a parent or guardian approves.</div></div>` : ''}
    ${next ? `<button class="card tap hero" data-open="${next.kind}:${next.id}">
        <p class="small muted">Your next ${next.kind === 'seva' ? 'seva' : 'event'}</p>
        <div class="row" style="margin-top:10px">${tile(next.start)}<div class="grow"><h3 style="font-size:18px">${esc(next.title)}</h3>
        <p class="small muted">${relDay(next.start)} · ${fmtTime(next.start)} · ${esc(next.sub)}</p></div></div>
      </button>` : `<div class="card hero"><p class="small muted">Nothing planned yet</p><h3 style="font-size:18px;margin-top:6px">Find a seva that fits your week</h3><button class="btn sm" style="margin-top:12px" data-tab="seva">Browse seva</button></div>`}

    ${needs.length ? `<div class="section"><div class="section-h"><h2>Needs you</h2><button data-tab="seva">See all</button></div>
      <div class="stack">${needs.slice(0, 2).map(sevaCard).join('')}</div></div>` : ''}

    <div class="section"><div class="section-h"><h2>My commitments</h2></div>
      <div class="card">${commits.length ? commits.map((c) => `<button class="list-row" style="width:100%;background:none;border-left:0;border-right:0;border-bottom:0;text-align:left" data-open="${c.kind}:${c.id}">${catIco(c.cat)}<div class="grow"><b class="small">${esc(c.title)}</b><p class="muted xs">${relDay(c.start)} · ${fmtTime(c.start)} · ${esc(c.sub)}</p></div>${I.chev}</button>`).join('') : `<p class="muted small">When you join a seva or RSVP to an event, it shows up here and in your calendar.</p>`}</div></div>

    <div class="section"><div class="section-h"><h2>${esc(myGroup().name)} garden</h2><button data-act="garden">Open</button></div>
      <button class="garden" style="border:0;padding:0;width:100%" data-act="garden" aria-label="Open the community garden">${gardenSVG(S.gardenLevel)}</button>
      <p class="muted small" style="margin-top:8px">Grows when your group completes seva together. ${12 - (S.gardenLevel * 2) % 12} more verified seva to the next bloom.</p></div>

    <div class="section"><div class="section-h"><h2>Community stories</h2><button data-tab="community">More</button></div>
      <div class="stack">${stories.map(postCard).join('')}</div></div>`;
}

function installBanner() {
  if (standalone()) return '';
  if (sessionStorage.getItem('hide-install')) return '';
  return `<div class="card" style="margin-bottom:16px;display:flex;gap:12px;align-items:center">
    <img src="icons/icon-192.png" width="44" height="44" alt="" style="border-radius:12px">
    <div class="grow"><b class="small">Add Seva to your Home Screen</b><p class="muted xs">Opens full screen, works offline, and can send reminders.</p></div>
    <button class="btn sm" data-act="install">Add</button></div>`;
}

function sevaCard(s) {
  const st = fillState(s); const mine = myRole(s); const wait = myWait(s);
  const pct = Math.min(100, Math.round(filled(s) / cap(s) * 100));
  return `<button class="card tap" data-open="seva:${s.id}">
    <div class="row">${catIco(s.cat)}<div class="grow"><h3>${esc(s.title)}</h3><p class="muted small">${relDay(s.start)} · ${fmtTime(s.start)}${s.recur ? ` · <span title="Repeats">${esc(s.recur.split(' · ')[0])}</span>` : ''}</p></div></div>
    <div class="row" style="margin-top:12px;justify-content:space-between">
      ${mine ? `<span class="pill ok">You're in · ${esc(mine.name)}</span>` : wait ? `<span class="pill warn">Waitlist · ${esc(wait.name)}</span>` : `<span class="pill ${st.cls}">${st.t}</span>`}
      <span class="muted xs">${filled(s)}/${cap(s)} volunteers</span></div>
    <div class="bar ${pct >= 100 ? 'full' : ''}"><i style="width:${pct}%"></i></div>
  </button>`;
}
function eventCard(e) {
  return `<button class="card tap" data-open="event:${e.id}"><div class="row">${tile(e.start)}<div class="grow"><h3>${esc(e.title)}</h3>
    <p class="muted small">${relDay(e.start)} · ${fmtTime(e.start)}</p><p class="muted xs" style="display:flex;gap:4px;align-items:center">${I.pin}${esc(e.place)}</p></div></div>
    <div class="row" style="margin-top:12px;justify-content:space-between">${e.rsvp === 'going' ? '<span class="pill ok">Going</span>' : e.rsvp === 'no' ? '<span class="pill plain">Not going</span>' : '<span class="pill">RSVP open</span>'}<span class="muted xs">${e.going.toLocaleString()} going</span></div></button>`;
}

// ----- Seva tab -----
function Seva() {
  const list = visibleSeva().filter((s) => s.status === 'open').sort((a, b) => new Date(a.start) - new Date(b.start));
  const evs = S.events.filter((e) => e.group === S.me.group || e.group === 'world').sort((a, b) => new Date(a.start) - new Date(b.start));
  return `<div class="topbar"><h1>Seva</h1>${S.role !== 'member' ? `<button class="btn sm" data-act="create">+ New</button>` : ''}</div>
    <div class="seg" role="group" aria-label="Seva or events"><button data-view="seva" aria-pressed="${S.sevaView === 'seva'}">Seva</button><button data-view="events" aria-pressed="${S.sevaView === 'events'}">Events</button></div>
    <div class="stack" style="margin-top:16px">${S.sevaView === 'seva' ? (list.length ? list.map(sevaCard).join('') : '<div class="empty">No open seva right now.</div>') : evs.map(eventCard).join('')}</div>`;
}

// ----- Community -----
function Community() {
  const posts = S.posts.filter((p) => S.feed === 'local' ? (p.scope === 'local' || p.city === myGroup().city) : true).sort((a, b) => new Date(b.date) - new Date(a.date));
  return `<div class="topbar"><h1>Community</h1></div>
    <div class="seg" role="group" aria-label="Feed"><button data-feed="local" aria-pressed="${S.feed === 'local'}">${esc(myGroup().city)}</button><button data-feed="world" aria-pressed="${S.feed === 'world'}">Worldwide</button></div>
    <p class="muted xs" style="margin:10px 2px 0">Official stories from seva and events. No comments, no rankings — just gratitude.</p>
    <div class="stack" style="margin-top:12px">${posts.map(postCard).join('')}</div>`;
}
function postCard(p) {
  const c = CAT[p.cat];
  const R = [['g', '🙏', 'Gratitude'], ['a', '💚', 'Appreciation'], ['c', '👏', 'Applause']];
  const total = p.r.g + p.r.a + p.r.c;
  return `<article class="card post"><div class="art" style="background:${c.tint}">${c.svg}<span class="pill plain" style="position:absolute;top:10px;left:12px;background:rgba(255,255,255,.75);color:#24352F">${c.label}</span></div>
    <div class="body"><p class="muted xs">${esc(p.city)} · ${relDay(p.date)}${p.count ? ` · ${p.count} volunteers` : ''}</p>
    <h3 style="margin-top:4px">${esc(p.title)}</h3><p class="small muted" style="margin-top:4px">${esc(p.outcome)}</p>
    ${p.link ? `<button class="btn sm soft" style="margin-top:10px" data-open="seva:${p.link}">View seva</button>` : ''}
    <div class="reacts">${R.map(([k, e, l]) => `<button class="react" data-react="${p.id}:${k}" aria-pressed="${p.mine === k}" aria-label="${l}, ${p.r[k]}"><span class="e" aria-hidden="true">${e}</span>${p.r[k]}</button>`).join('')}</div>
    <p class="muted xs" style="margin-top:8px">${total} people shared gratitude</p></div></article>`;
}

// ----- Profile / Passport -----
function Profile() {
  const all = ['langar', 'cleanup', 'tree', 'education', 'event', 'gratitude'];
  const got = new Set(S.passport.map((p) => p.cat));
  const monthCount = S.passport.filter((p) => new Date(p.date) > new Date(Date.now() - 30 * DAY)).length;
  const pct = Math.min(1, monthCount / S.intention);
  const C = 2 * Math.PI * 26;
  return `<div class="topbar"><div class="row"><div class="avatar" style="width:52px;height:52px;font-size:18px">${initials(ME())}</div><div><h1 style="font-size:20px">${esc(ME())}</h1><p class="muted small">${esc(myGroup().name)} · ${S.role === 'member' ? 'Member' : S.role === 'lead' ? 'Team Lead' : 'Main Admin'}</p></div></div></div>

    <div class="card row"><svg class="ring" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="26" fill="none" stroke="var(--sage)" stroke-width="7"/><circle cx="32" cy="32" r="26" fill="none" stroke="var(--accent)" stroke-width="7" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}" transform="rotate(-90 32 32)"/><text x="32" y="37" text-anchor="middle" font-size="15" font-weight="700" fill="var(--ink)">${monthCount}/${S.intention}</text></svg>
      <div class="grow"><b class="small">My intention</b><p class="muted xs">Seva ${S.intention}× a month. Private to you — no streaks, no pressure.</p></div>
      <button class="btn sm ghost" data-act="intention">Edit</button></div>

    <div class="section"><div class="section-h"><h2>Seva Passport</h2><span class="muted xs">${S.passport.length} stamps</span></div>
      <div class="stamps">${all.map((c) => `<div class="stamp ${got.has(c) ? 'got' : 'locked'}">${CAT[c].svg}${CAT[c].label}</div>`).join('')}</div>
      <div class="card" style="margin-top:12px">${S.passport.slice().reverse().map((p) => `<div class="list-row">${catIco(p.cat)}<div class="grow"><b class="small">${esc(p.title)}</b><p class="muted xs">${fmtDay(p.date)}</p></div></div>`).join('')}</div></div>

    <div class="section"><div class="section-h"><h2>Thank-you notes</h2></div>
      <div class="stack">${S.thanks.map((t) => `<div class="card" style="background:var(--sand)"><p class="small">“${esc(t.text)}”</p><p class="muted xs" style="margin-top:6px">${esc(t.from)} · ${relDay(t.date)}</p></div>`).join('')}</div></div>

    <div class="section"><div class="section-h"><h2>Settings</h2></div>
      <div class="card">
        <div class="list-row"><div class="grow"><b class="small">Reminders</b><p class="muted xs">${standalone() ? 'Push available in installed app' : 'Install to Home Screen for push'}</p></div><button class="btn sm soft" data-act="notify-test">Test</button></div>
        <div class="list-row"><div class="grow"><b class="small">Calendar feed</b><p class="muted xs">All your commitments in your phone calendar</p></div><button class="btn sm soft" data-act="cal-all">Add</button></div>
        <div class="list-row"><div class="grow"><b class="small">Appearance</b></div>
          <select class="in" style="width:auto;min-height:40px" id="theme-select"><option value="auto" ${S.theme === 'auto' ? 'selected' : ''}>System</option><option value="light" ${S.theme === 'light' ? 'selected' : ''}>Light</option><option value="dark" ${S.theme === 'dark' ? 'selected' : ''}>Dark</option></select></div>
        <div class="list-row"><div class="grow"><b class="small">Primary group</b></div>
          <select class="in" style="width:auto;min-height:40px" id="group-select">${S.groups.map((g) => `<option value="${g.id}" ${g.id === S.me.group ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}</select></div>
        <div class="list-row"><div class="grow"><b class="small">Reset demo</b><p class="muted xs">Start over with fresh sample data</p></div><button class="btn sm danger" data-act="reset">Reset</button></div>
      </div></div>
    <p class="muted xs" style="text-align:center;margin-top:24px">Namdhari Seva &amp; Community · demo v1 · data stays on this device</p>`;
}

// ----- Lead -----
function needsAttention() {
  const items = [];
  visibleSeva().forEach((s) => {
    if (s.status === 'pending') items.push({ cls: 'warn', t: `Close “${s.title}”`, d: 'Attendance and feedback pending', act: `close:${s.id}` });
    else if (s.status === 'open') {
      s.roles.forEach((r) => { const left = r.cap - r.filled.length; if (left > 0 && (new Date(s.start) - now()) < 5 * DAY) items.push({ cls: left / r.cap > 0.5 ? 'err' : 'warn', t: `${left} ${r.name.toLowerCase()} needed`, d: `${s.title} · ${relDay(s.start)}`, act: `seva:${s.id}` }); });
    }
  });
  return items;
}
function LeadHome() {
  const att = needsAttention();
  const open = visibleSeva().filter((s) => s.status === 'open');
  const slots = open.reduce((n, s) => n + cap(s) - filled(s), 0);
  const uniq = new Set(); visibleSeva().forEach((s) => s.roles.forEach((r) => r.filled.forEach((p) => uniq.add(p))));
  return `<div class="topbar"><div><p class="eyebrow">Team Lead · ${esc(myGroup().name)}</p><h1>Needs attention</h1></div><button class="iconbtn" data-act="notifs" aria-label="Notifications">${I.bell}${unread() ? `<span class="badge">${unread()}</span>` : ''}</button></div>
    <div class="kpis"><div class="kpi"><b>${open.length}</b><span>Open seva</span></div><div class="kpi"><b>${slots}</b><span>Open slots</span></div>
      <div class="kpi"><b>${uniq.size}</b><span>Unique volunteers</span></div><div class="kpi"><b>${visibleSeva().filter((s) => s.status === 'pending').length}</b><span>Awaiting close</span></div></div>
    <div class="section"><div class="card">${att.length ? att.map((a) => `<button class="list-row" style="width:100%;background:none;border-left:0;border-right:0;border-bottom:0;text-align:left" data-open="${a.act}"><span class="pill ${a.cls}" style="min-width:12px;padding:4px 6px"></span><div class="grow"><b class="small">${esc(a.t)}</b><p class="muted xs">${esc(a.d)}</p></div>${I.chev}</button>`).join('') : '<p class="muted small">All clear. Nice work.</p>'}</div></div>
    <div class="section"><div class="section-h"><h2>This week</h2><button data-act="create">+ New seva</button></div><div class="stack">${open.map(sevaCard).join('')}</div></div>`;
}
function Manage() {
  if (S.role === 'admin') return AdminManage();
  const pend = visibleSeva().filter((s) => s.status === 'pending');
  const today = visibleSeva().filter((s) => s.status === 'open').sort((a, b) => new Date(a.start) - new Date(b.start));
  return `<div class="topbar"><h1>Manage</h1><button class="btn sm" data-act="create">+ New seva</button></div>
    <div class="section" style="margin-top:0"><div class="section-h"><h2>Check-in &amp; close</h2></div>
      <div class="stack">${pend.map((s) => `<div class="card"><div class="row">${catIco(s.cat)}<div class="grow"><h3>${esc(s.title)}</h3><p class="muted small">${relDay(s.start)} · ${filled(s)} joined</p></div><span class="pill warn">Close</span></div>
        <div class="btn-row" style="margin-top:12px"><button class="btn sm ghost" data-act="roster" data-id="${s.id}">${I.check} Attendance</button><button class="btn sm" data-act="complete" data-id="${s.id}">Complete</button></div></div>`).join('') || '<div class="empty small">Nothing waiting to close.</div>'}
      ${today[0] ? `<div class="card"><div class="row"><div class="grow"><b class="small">Check-in QR for ${esc(today[0].title)}</b><p class="muted xs">Members scan this at the venue. Works offline.</p></div><button class="btn sm soft" data-act="qr" data-id="${today[0].id}">${I.qr} Show</button></div></div>` : ''}</div>
      </div>
    <div class="section"><div class="section-h"><h2>Upcoming</h2></div><div class="stack">${today.map(sevaCard).join('')}</div></div>
    <div class="section"><div class="section-h"><h2>Group tools</h2></div><div class="card">
      <button class="list-row" style="width:100%;background:none;border:0;text-align:left" data-act="invite"><div class="ico">${I.qr}</div><div class="grow"><b class="small">Invite members</b><p class="muted xs">Group QR and WhatsApp link</p></div>${I.chev}</button>
      <button class="list-row" style="width:100%;background:none;border-left:0;border-right:0;border-bottom:0;text-align:left" data-act="garden"><div class="ico">${CAT.milestone.svg}</div><div class="grow"><b class="small">Group garden</b><p class="muted xs">Level ${S.gardenLevel}</p></div>${I.chev}</button>
    </div></div>`;
}

// ----- Admin -----
function adminData() {
  const reg = S.adminRegion;
  const sv = S.seva.filter((s) => reg === 'all' || S.groups.find((g) => g.id === s.group)?.country === reg);
  const parts = sv.reduce((n, s) => n + filled(s), 0);
  const uniq = new Set(); sv.forEach((s) => s.roles.forEach((r) => r.filled.forEach((p) => uniq.add(p))));
  const fill = Math.round(parts / Math.max(1, sv.reduce((n, s) => n + cap(s), 0)) * 100);
  return { sv, parts, uniq: uniq.size, fill };
}
function AdminHome() {
  const d = adminData();
  const weeks = [18, 24, 21, 30, 27, 35, 33, 41];
  const max = Math.max(...weeks);
  return `<div class="topbar"><div><p class="eyebrow">Main Admin · Worldwide</p><h1>Global pulse</h1></div></div>
    <div class="chips" role="group" aria-label="Region filter">${[['all', 'All regions'], ['India', 'India'], ['UK', 'UK']].map(([v, l]) => `<button class="chip" data-region="${v}" aria-pressed="${S.adminRegion === v}">${l}</button>`).join('')}</div>
    <div class="kpis" style="margin-top:8px"><div class="kpi"><b>${d.fill}%</b><span>Slot fill rate</span></div><div class="kpi"><b>9%</b><span>No-show rate</span></div>
      <div class="kpi"><b>${d.uniq}</b><span>Unique volunteers</span></div><div class="kpi"><b>${d.parts}</b><span>Participations</span></div>
      <div class="kpi wide"><b>86%</b><span>Seva closed within 48 hours</span></div></div>
    <div class="section"><div class="section-h"><h2>Participations per week</h2></div>
      <div class="card"><svg viewBox="0 -10 320 160" role="img" aria-label="Participations per week rose from 18 to 41 over 8 weeks" style="width:100%;height:auto">
        ${weeks.map((w, i) => { const h = w / max * 110; return `<rect x="${12 + i * 38}" y="${122 - h}" width="26" height="${h}" rx="6" fill="var(--accent)" opacity="${i === weeks.length - 1 ? 1 : .55}"/><text x="${25 + i * 38}" y="140" text-anchor="middle" font-size="10" fill="var(--muted)">W${i + 1}</text>`; }).join('')}
        <text x="${25 + 7 * 38}" y="${122 - 110 - 6}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--ink)">41</text></svg>
        <p class="muted xs">Up 24% on last week. Text summary: 8 weeks, from 18 to 41 participations.</p></div></div>
    <div class="section"><div class="section-h"><h2>Groups</h2></div><div class="card">${S.groups.map((g) => { const ss = S.seva.filter((s) => s.group === g.id); const f = ss.reduce((n, s) => n + filled(s), 0), c = ss.reduce((n, s) => n + cap(s), 0); const p = c ? Math.round(f / c * 100) : 0; return `<div class="list-row"><div class="grow"><b class="small">${esc(g.name)}</b><p class="muted xs">${esc(g.city)}, ${esc(g.country)} · ${ss.length} seva</p><div class="bar"><i style="width:${p}%"></i></div></div><b class="small">${p}%</b></div>`; }).join('')}</div></div>`;
}
function AdminManage() {
  const reviews = S.posts.filter((p) => p.pendingWorld);
  return `<div class="topbar"><h1>Manage</h1></div>
    <div class="section" style="margin-top:0"><div class="section-h"><h2>Review queue</h2></div>
      <div class="stack">${reviews.map((p) => `<div class="card"><p class="muted xs">Promote to Worldwide?</p><h3 style="margin-top:4px">${esc(p.title)}</h3><p class="muted small">${esc(p.outcome)}</p>
        <div class="btn-row" style="margin-top:12px"><button class="btn sm ghost" data-act="reject" data-id="${p.id}">Keep local</button><button class="btn sm" data-act="approve" data-id="${p.id}">${I.globe} Approve</button></div></div>`).join('') || '<div class="card muted small">No stories waiting. When a lead completes a seva, its story can be promoted here.</div>'}</div></div>
    <div class="section"><div class="section-h"><h2>Regions &amp; groups</h2></div><div class="card">${S.groups.map((g) => `<div class="list-row"><div class="avatar">${initials(g.city)}</div><div class="grow"><b class="small">${esc(g.name)}</b><p class="muted xs">${esc(g.country)} › ${esc(g.city)} · 2 leads</p></div></div>`).join('')}</div></div>
    <div class="section"><div class="section-h"><h2>Exports</h2></div><button class="btn ghost block" data-act="csv">Download participation CSV</button></div>`;
}

// ---------- Garden ----------
function gardenSVG(level, still) {
  // Isometric layered garden; items unlock with level (0-8)
  const iso = (gx, gy) => [160 + (gx - gy) * 26, 52 + (gx + gy) * 15];
  let tiles = '';
  for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) {
    const [cx, cy] = iso(x, y); const path = level >= 2 && (x === 2 || (level >= 6 && y === 2));
    tiles += `<path d="M${cx} ${cy - 15}L${cx + 26} ${cy}L${cx} ${cy + 15}L${cx - 26} ${cy}Z" fill="${path ? '#E6D7BC' : (x + y) % 2 ? '#A9CBA8' : '#9EC29D'}" stroke="#8DB48C" stroke-width=".6"/>`;
  }
  const anim = still ? '' : 'sway';
  const flower = (gx, gy, c, d = 0) => { const [x, y] = iso(gx, gy); return `<g class="${anim} pop" style="animation-delay:${d}s"><path d="M${x} ${y}v-12" stroke="#4E8460" stroke-width="2"/><circle cx="${x}" cy="${y - 14}" r="4.5" fill="${c}"/><circle cx="${x}" cy="${y - 14}" r="1.8" fill="#F6D776"/></g>`; };
  const tree = (gx, gy, s = 1) => { const [x, y] = iso(gx, gy); return `<g class="${anim}"><rect x="${x - 3}" y="${y - 20 * s}" width="6" height="${20 * s}" rx="2" fill="#8C6A43"/><circle cx="${x}" cy="${y - 30 * s}" r="${16 * s}" fill="#5E9470"/><circle cx="${x - 7 * s}" cy="${y - 24 * s}" r="${9 * s}" fill="#78AE88"/></g>`; };
  const lantern = (gx, gy) => { const [x, y] = iso(gx, gy); return `<g><path d="M${x} ${y}v-26" stroke="#5B4A3A" stroke-width="2"/><circle class="${still ? '' : 'glow'}" cx="${x}" cy="${y - 30}" r="9" fill="#F6D776" opacity=".45"/><rect x="${x - 4}" y="${y - 34}" width="8" height="9" rx="2" fill="#F3C969"/></g>`; };
  const items = [];
  if (level >= 1) items.push(flower(0, 1, '#E39AA8'), flower(1, 0, '#F2B66D', .1));
  if (level >= 3) items.push(flower(4, 1, '#B79CE0', .2), flower(3, 4, '#E39AA8', .3), flower(0, 3, '#F2B66D', .15));
  if (level >= 4) items.push(tree(0, 0, .9));
  if (level >= 5) items.push(lantern(3, 2), lantern(1, 2));
  if (level >= 6) items.push(tree(4, 4, 1));
  if (level >= 7) items.push(flower(4, 3, '#F2B66D', .2), flower(1, 4, '#B79CE0', .25), tree(4, 0, .8));
  if (level >= 8) items.push(lantern(2, 0), lantern(2, 4));
  return `<svg viewBox="0 0 320 190" role="img" aria-label="Community garden, level ${level} of 8">${tiles}${items.join('')}</svg>`;
}

// ---------- Sheets ----------
function openSheet(html) {
  const root = $('#sheet-root');
  root.innerHTML = `<div class="scrim" data-act="close-sheet"></div><div class="sheet" role="dialog" aria-modal="true"><div class="grabber"></div>${html}</div>`;
  document.body.style.overflow = 'hidden';
  setTimeout(() => { const f = root.querySelector('.sheet button, .sheet input'); f && f.focus({ preventScroll: true }); }, 50);
}
function closeSheet() { $('#sheet-root').innerHTML = ''; document.body.style.overflow = ''; }
const sheetHead = (title, sub) => `<div class="sheet-h"><div>${sub ? `<p class="eyebrow">${sub}</p>` : ''}<h2>${title}</h2></div><button class="iconbtn" data-act="close-sheet" aria-label="Close">${I.close}</button></div>`;

function sevaSheet(id) {
  const s = S.seva.find((x) => x.id === id); if (!s) return;
  const mine = myRole(s), wait = myWait(s), st = fillState(s);
  const end = new Date(new Date(s.start).getTime() + s.dur * 60000).toISOString();
  openSheet(`${sheetHead(esc(s.title), CAT[s.cat].label)}
    <div class="card">
      <p class="small" style="display:flex;gap:8px;align-items:center">${I.clock}${relDay(s.start)} · ${fmtTime(s.start)} – ${fmtTime(end)}</p>
      <p class="small" style="display:flex;gap:8px;align-items:center;margin-top:6px">${I.pin}${esc(s.place)}</p>
      ${s.recur ? `<p class="small" style="display:flex;gap:8px;align-items:center;margin-top:6px">${I.repeat}${esc(s.recur)}</p>` : ''}
      <p class="muted small" style="margin-top:12px">${esc(s.purpose)}</p>
    </div>
    <div class="section" style="margin-top:16px"><div class="section-h"><h2>Roles</h2><span class="pill ${st.cls}">${st.t}</span></div>
      <div class="card">${s.roles.map((r) => {
        const left = r.cap - r.filled.length, inThis = r.filled.includes(ME()), w = r.wait.includes(ME());
        const pct = Math.round(r.filled.length / r.cap * 100);
        let btn;
        if (inThis) btn = `<span class="pill ok">You</span>`;
        else if (w) btn = `<span class="pill warn">#${r.wait.indexOf(ME()) + 1} waitlist</span>`;
        else if (mine || wait || S.me.minor) btn = '';
        else if (left > 0) btn = `<button class="btn sm" data-act="join" data-id="${s.id}" data-role="${r.id}">Join</button>`;
        else btn = `<button class="btn sm ghost" data-act="wait" data-id="${s.id}" data-role="${r.id}">Waitlist</button>`;
        return `<div class="slot"><div class="grow"><b class="small">${esc(r.name)}</b><p class="muted xs">${r.filled.length} of ${r.cap} filled${r.wait.length ? ` · ${r.wait.length} waiting` : ''}</p><div class="bar ${left <= 0 ? 'full' : ''}"><i style="width:${pct}%"></i></div></div>${btn}</div>`;
      }).join('')}</div>
      <p class="muted xs" style="margin-top:8px">If someone drops out, the slot is offered to the waitlist automatically.</p></div>
    <div class="section" style="margin-top:16px"><div class="section-h"><h2>Who's coming</h2></div>
      <div class="row" style="flex-wrap:wrap;gap:6px">${s.roles.flatMap((r) => r.filled).slice(0, 10).map((p) => `<div class="avatar" title="${esc(p)}">${initials(p)}</div>`).join('')}${filled(s) > 10 ? `<div class="avatar">+${filled(s) - 10}</div>` : ''}</div></div>
    <div class="btn-row" style="margin-top:20px"><button class="btn ghost" data-act="cal" data-id="${s.id}">${I.cal} Calendar</button><button class="btn ghost" data-act="wa" data-id="${s.id}">${I.wa} WhatsApp</button></div>
    ${mine || wait ? `<button class="btn danger block" style="margin-top:8px" data-act="drop" data-id="${s.id}">Can't make it</button>` : ''}
    ${S.role !== 'member' ? `<div class="divider"></div><div class="btn-row"><button class="btn sm soft" data-act="roster" data-id="${s.id}">${I.check} Roster</button><button class="btn sm soft" data-act="qr" data-id="${s.id}">${I.qr} Check-in QR</button><button class="btn sm soft" data-act="nudge" data-id="${s.id}">Nudge group</button></div>` : ''}`);
}

function eventSheet(id) {
  const e = S.events.find((x) => x.id === id); if (!e) return;
  const linked = e.linked && S.seva.find((s) => s.id === e.linked);
  const days = Math.max(0, Math.ceil((new Date(e.start) - now()) / DAY));
  openSheet(`${sheetHead(esc(e.title), 'Event')}
    <div class="card"><div class="row">${tile(e.start)}<div class="grow"><b>${relDay(e.start)} · ${fmtTime(e.start)}</b><p class="muted small">${esc(e.place)}</p><p class="muted xs">Hosted by ${esc(e.host)}</p></div></div>
      <div class="divider"></div><p class="small"><b>Agenda</b></p><p class="muted small">${esc(e.agenda)}</p></div>
    <div class="card" style="margin-top:12px;text-align:center;background:var(--sand)"><b style="font-size:28px">${days}</b><p class="muted small">day${days === 1 ? '' : 's'} to go · ${e.going.toLocaleString()} going${e.cap ? ` of ${e.cap}` : ''}</p></div>
    ${linked ? `<div class="notice" style="margin-top:12px;background:var(--sage)">${CAT.needed.svg.replace('<svg', '<svg width="28" height="28"')}<div class="grow small"><b>This event needs volunteers</b><p class="muted xs">${esc(linked.title)} · ${cap(linked) - filled(linked)} slots open</p><button class="btn sm" style="margin-top:8px" data-open="seva:${linked.id}">See roles</button></div></div>` : ''}
    <div class="btn-row" style="margin-top:16px"><button class="btn ghost" data-act="cal-e" data-id="${e.id}">${I.cal} Calendar</button><button class="btn ghost" data-act="wa-e" data-id="${e.id}">${I.wa} Share</button></div>
    <div class="sticky-cta"><div class="seg"><button data-act="rsvp" data-id="${e.id}" data-v="going" aria-pressed="${e.rsvp === 'going'}">Going</button><button data-act="rsvp" data-id="${e.id}" data-v="no" aria-pressed="${e.rsvp === 'no'}">Can't go</button></div></div>`);
}

function rosterSheet(id) {
  const s = S.seva.find((x) => x.id === id);
  const people = s.roles.flatMap((r) => r.filled.map((p) => ({ p, r: r.name })));
  S.attendance[id] = S.attendance[id] || {};
  const A = S.attendance[id];
  const count = Object.values(A).filter(Boolean).length;
  openSheet(`${sheetHead('Attendance', esc(s.title))}
    <p class="muted small" style="margin-bottom:12px">Tap who actually came. Joined ≠ attended. Saved on this phone, syncs when online.</p>
    ${people.map(({ p, r }) => `<button class="check" data-act="mark" data-id="${id}" data-p="${esc(p)}" aria-pressed="${!!A[p]}"><span class="box">${A[p] ? I.check : ''}</span><div class="avatar">${initials(p)}</div><div class="grow"><b class="small">${esc(p)}</b><p class="muted xs">${esc(r)}</p></div></button>`).join('')}
    <div class="sticky-cta"><button class="btn block" data-act="close-sheet">${count} of ${people.length} checked in · Done</button></div>`);
}

const WENT = { langar: ['On time', 'Enough food', 'Great teamwork', 'Clean kitchen'], cleanup: ['Area cleared', 'Great teamwork', 'Good turnout', 'Safe'], tree: ['All planted', 'Great teamwork', 'Good turnout'], education: ['Kids engaged', 'Good materials', 'Great teamwork'] };
const ISSUES = ['Volunteers short', 'Supplies', 'Timing', 'Transport', 'Weather', 'Coordination', 'Other'];
let form = {};
function completeSheet(id) {
  const s = S.seva.find((x) => x.id === id);
  const att = Object.values(S.attendance[id] || {}).filter(Boolean).length || filled(s);
  form = { id, outcome: 'Completed', count: att, went: [], issues: [], next: '' };
  drawComplete();
}
function drawComplete() {
  const s = S.seva.find((x) => x.id === form.id);
  const tags = WENT[s.cat] || WENT.cleanup;
  openSheet(`${sheetHead('Complete seva', esc(s.title))}
    <p class="muted small">Takes under a minute. No essays.</p>
    <label class="f">Outcome</label><div class="seg">${['Completed', 'Partial', 'Cancelled'].map((o) => `<button data-form="outcome" data-v="${o}" aria-pressed="${form.outcome === o}">${o}</button>`).join('')}</div>
    <label class="f" for="f-count">Attended</label>
    <div class="row"><button class="iconbtn" data-form="dec" aria-label="Fewer">−</button><input class="in" id="f-count" type="number" inputmode="numeric" value="${form.count}" style="text-align:center;font-weight:700"><button class="iconbtn" data-form="inc" aria-label="More">+</button></div>
    <label class="f">What went well</label><div class="tagset">${tags.map((t) => `<button class="chip" data-form="went" data-v="${t}" aria-pressed="${form.went.includes(t)}">${t}</button>`).join('')}</div>
    <label class="f">Any issues?</label><div class="tagset">${ISSUES.map((t) => `<button class="chip" data-form="issues" data-v="${t}" aria-pressed="${form.issues.includes(t)}">${t}</button>`).join('')}</div>
    <label class="f" for="f-next">Next action (optional)</label><input class="in" id="f-next" placeholder="e.g. Confirm stock by Friday" value="${esc(form.next)}">
    <label class="f">Auto recap preview</label><div class="recap" id="recap">${esc(recapText(s))}</div>
    <div class="sticky-cta"><button class="btn block" data-act="submit-complete">Complete &amp; draft story</button></div>`);
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
  openSheet(`${sheetHead('New seva', esc(myGroup().name))}
    <label class="f">Start from a template</label>
    <div class="chips">${['langar', 'cleanup', 'tree', 'education'].map((c, i) => `<button class="chip" data-tpl="${c}" aria-pressed="${i === 0}">${CAT[c].label}</button>`).join('')}</div>
    <label class="f" for="c-title">Title</label><input class="in" id="c-title" value="Sunday Langar Seva">
    <label class="f" for="c-date">When</label><input class="in" id="c-date" type="datetime-local" value="${new Date(Date.now() + 3 * DAY - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 13)}:00">
    <label class="f" for="c-place">Where</label><input class="in" id="c-place" value="Namdhari Gurdwara, Karol Bagh">
    <label class="f" for="c-recur">Repeats</label><select class="in" id="c-recur"><option value="">Does not repeat</option><option selected>Weekly · Sundays</option><option>Monthly · 1st Sunday</option></select>
    <label class="f">Roles</label>
    <div class="card" id="c-roles"><div class="slot"><div class="grow"><b class="small">Cooks</b></div><span class="muted small">6 people</span></div><div class="slot"><div class="grow"><b class="small">Servers</b></div><span class="muted small">8 people</span></div><div class="slot"><div class="grow"><b class="small">Drivers</b></div><span class="muted small">2 people</span></div></div>
    <label class="f">Audience</label><div class="notice" style="background:var(--sage)">${I.info.replace('<svg', '<svg style="color:var(--accent)"')}<p class="small"><b>Visible to:</b> ${esc(myGroup().name)} members (about 140 people). Not shown to other groups.</p></div>
    <div class="sticky-cta"><button class="btn block" data-act="publish">Publish &amp; open for volunteers</button></div>`);
}

function qrSheet(id) {
  const s = S.seva.find((x) => x.id === id);
  // Decorative pseudo-QR (demo only)
  let cells = ''; let seed = id.charCodeAt(1) * 9301 + Math.floor(Date.now() / 30000);
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++) {
    const finder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
    if (finder) { const fx = x > 13 ? x - 14 : x, fy = y > 13 ? y - 14 : y; if (fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx > 1 && fx < 5 && fy > 1 && fy < 5)) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`; }
    else if (rnd() > 0.52) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
  }
  openSheet(`${sheetHead('Check-in QR', esc(s.title))}
    <div class="card" style="text-align:center;background:#fff"><svg viewBox="-1 -1 23 23" width="240" height="240" fill="#24352F" aria-label="Check-in QR code (demo)">${cells}</svg>
    <p class="small" style="color:#24352F;margin-top:8px"><b>Refreshes every 30 seconds</b></p><p class="xs" style="color:#65746D">Members scan with the app to check in. Works without signal; syncs later.</p></div>
    <button class="btn block soft" style="margin-top:16px" data-act="roster" data-id="${id}">Use the tap roster instead</button>`);
}

function notifSheet() {
  S.notifs.forEach((n) => n.read = true); save();
  openSheet(`${sheetHead('Notifications')}
    <div class="card">${S.notifs.map((n) => `<button class="list-row" style="width:100%;background:none;border-left:0;border-right:0;border-bottom:0;text-align:left" data-open="${n.open.startsWith('s') ? 'seva:' + n.open : n.open.startsWith('e') ? 'event:' + n.open : 'tab:profile'}"><div class="ico">${I.bell}</div><div class="grow"><b class="small">${esc(n.t)}</b><p class="muted xs">${relDay(n.d)} · ${fmtTime(n.d)}</p></div></button>`).join('')}</div>
    <p class="muted xs" style="margin-top:12px">The in-app inbox always has everything. Push, email and calendar are extra ways to reach you.</p>`);
  setTimeout(render, 0);
}

function installSheet() {
  if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt.userChoice.finally(() => { deferredPrompt = null; }); return; }
  const ios = isIOS();
  openSheet(`${sheetHead('Add to Home Screen', 'Install the app')}
    <div class="stack">
    ${ios ? `
      <div class="card row"><div class="avatar">1</div><p class="small grow">Open this page in <b>Safari</b>.</p></div>
      <div class="card row"><div class="avatar">2</div><p class="small grow">Tap the <b>Share</b> button ${I.share} in the toolbar.</p></div>
      <div class="card row"><div class="avatar">3</div><p class="small grow">Scroll and tap <b>Add to Home Screen</b>, then <b>Add</b>.</p></div>`
    : `
      <div class="card row"><div class="avatar">1</div><p class="small grow">Open this page in <b>Chrome</b>.</p></div>
      <div class="card row"><div class="avatar">2</div><p class="small grow">Tap the <b>⋮</b> menu at the top right.</p></div>
      <div class="card row"><div class="avatar">3</div><p class="small grow">Tap <b>Add to Home screen</b> or <b>Install app</b>.</p></div>`}
    </div>
    <p class="muted xs" style="margin-top:12px">Once installed it opens full screen, works offline and can show reminders.</p>
    <button class="btn ghost block" style="margin-top:16px" data-act="hide-install">Not now</button>`);
}

// ---------- Actions ----------
function shareSeva(s) {
  const url = `${location.origin}${location.pathname}#seva=${s.id}`;
  const left = cap(s) - filled(s);
  const text = `🙏 ${s.title}\n${relDay(s.start)} · ${fmtTime(s.start)} · ${s.place}\n${left > 0 ? `${left} volunteer spots open` : 'Fully staffed — join the waitlist'}\nJoin here: ${url}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
}
function shareEvent(e) {
  const url = `${location.origin}${location.pathname}#event=${e.id}`;
  const text = `${e.title}\n${relDay(e.start)} · ${fmtTime(e.start)} · ${e.place}\nRSVP: ${url}`;
  if (navigator.share) navigator.share({ title: e.title, text, url }).catch(() => {});
  else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
}
function icsFor(items) {
  const z = (d) => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const ev = items.map((i) => `BEGIN:VEVENT\r\nUID:${i.id}-${uid()}@namdhari-seva-demo\r\nDTSTAMP:${z(new Date())}\r\nDTSTART:${z(i.start)}\r\nDTEND:${z(i.end)}\r\nSUMMARY:${i.title}\r\nLOCATION:${i.place}\r\nBEGIN:VALARM\r\nTRIGGER:-PT2H\r\nACTION:DISPLAY\r\nDESCRIPTION:Reminder\r\nEND:VALARM\r\nEND:VEVENT`).join('\r\n');
  return `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Namdhari Seva Demo//EN\r\n${ev}\r\nEND:VCALENDAR`;
}
function downloadICS(items, name) {
  const data = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(icsFor(items));
  const a = document.createElement('a'); a.href = data; a.download = name + '.ics'; document.body.appendChild(a); a.click(); a.remove();
  toast('Calendar file ready — open it to add');
}
async function notifyTest() {
  if (!('Notification' in window)) { toast(isIOS() && !standalone() ? 'Add to Home Screen first to enable reminders' : 'Notifications not supported here'); return; }
  const p = await Notification.requestPermission();
  if (p !== 'granted') { toast('Notifications are off — you can still use calendar reminders'); return; }
  const reg = await navigator.serviceWorker?.getRegistration();
  const body = 'Sunday Langar Seva starts tomorrow at 9:00 AM. You\'re on Cooks.';
  if (reg) reg.showNotification('Seva reminder', { body, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: 'demo' });
  else new Notification('Seva reminder', { body, icon: 'icons/icon-192.png' });
  toast('Reminder sent');
}

function handle(el) {
  const act = el.dataset.act;
  const id = el.dataset.id;
  vibrate();
  switch (act) {
    case 'onb-next': onbStep = 1; renderOnboarding(); break;
    case 'onb-finish': {
      const name = ($('#onb-name')?.value || '').trim();
      if (!name) { toast('Please add your name'); $('#onb-name')?.focus(); return; }
      S.me.name = name; S.me.minor = $('#onb-age')?.value === 'minor'; S.onboarded = true;
      // Put the new member into a role so Home has a commitment
      if (!S.me.minor) { const r = S.seva[0].roles[0]; if (!r.filled.includes(name) && r.filled.length < r.cap) r.filled.push(name); }
      save(); tab = 'home'; render(); toast(S.me.minor ? 'Guardian approval link sent' : `Welcome to ${myGroup().name}`);
      break;
    }
    case 'close-sheet': closeSheet(); render(); break;
    case 'join': {
      const s = S.seva.find((x) => x.id === id); const r = s.roles.find((x) => x.id === el.dataset.role);
      r.filled.push(ME()); save(); sevaSheet(id); render(); toast(`You're in — ${r.name}. Added to My Commitments`);
      break;
    }
    case 'wait': {
      const s = S.seva.find((x) => x.id === id); const r = s.roles.find((x) => x.id === el.dataset.role);
      r.wait.push(ME()); save(); sevaSheet(id); render(); toast(`You're #${r.wait.length} on the waitlist`);
      break;
    }
    case 'drop': {
      if (!confirm('Release your spot? The lead is told and it\'s offered to the waitlist.')) return;
      const s = S.seva.find((x) => x.id === id); let promoted = null;
      s.roles.forEach((r) => {
        const i = r.filled.indexOf(ME()); if (i > -1) { r.filled.splice(i, 1); if (r.wait.length) { promoted = r.wait.shift(); r.filled.push(promoted); } }
        const w = r.wait.indexOf(ME()); if (w > -1) r.wait.splice(w, 1);
      });
      save(); sevaSheet(id); render(); toast(promoted ? `Spot released — offered to ${promoted.split(' ')[0]}` : 'Spot released. Lead notified');
      break;
    }
    case 'cal': { const s = S.seva.find((x) => x.id === id); downloadICS([{ id: s.id, title: s.title, place: s.place, start: s.start, end: new Date(new Date(s.start).getTime() + s.dur * 60000).toISOString() }], 'seva'); break; }
    case 'cal-e': { const e = S.events.find((x) => x.id === id); downloadICS([{ id: e.id, title: e.title, place: e.place, start: e.start, end: new Date(new Date(e.start).getTime() + 2 * 3600000).toISOString() }], 'event'); break; }
    case 'cal-all': { const c = myCommitments(); if (!c.length) { toast('Join a seva first'); return; } downloadICS(c.map((x) => ({ ...x, end: new Date(new Date(x.start).getTime() + 2 * 3600000).toISOString() })), 'my-seva'); break; }
    case 'wa': shareSeva(S.seva.find((x) => x.id === id)); break;
    case 'wa-e': shareEvent(S.events.find((x) => x.id === id)); break;
    case 'rsvp': { const e = S.events.find((x) => x.id === id); const v = el.dataset.v; if (e.rsvp === 'going' && v !== 'going') e.going--; if (e.rsvp !== 'going' && v === 'going') e.going++; e.rsvp = v; save(); eventSheet(id); render(); toast(v === 'going' ? 'RSVP confirmed — see you there' : 'Thanks for letting the host know'); break; }
    case 'notifs': notifSheet(); break;
    case 'install': installSheet(); break;
    case 'hide-install': sessionStorage.setItem('hide-install', '1'); closeSheet(); render(); break;
    case 'garden': openSheet(`${sheetHead(esc(myGroup().name) + ' garden', 'Community garden')}<div class="garden">${gardenSVG(S.gardenLevel)}</div>
        <div class="card" style="margin-top:12px"><b class="small">Level ${S.gardenLevel} of 8</b><div class="bar"><i style="width:${S.gardenLevel / 8 * 100}%"></i></div><p class="muted xs" style="margin-top:8px">Every verified, completed seva by your group helps it grow. It never wilts, and no one is ranked.</p></div>
        <div class="card" style="margin-top:12px">${['First flowers', 'A garden path', 'More blooms', 'First tree', 'Lanterns', 'Second tree & crossing path', 'Orchard corner', 'Festival lanterns'].map((t, i) => `<div class="list-row"><span class="pill ${i < S.gardenLevel ? 'ok' : 'plain'}">${i < S.gardenLevel ? 'Unlocked' : 'Level ' + (i + 1)}</span><span class="small grow">${t}</span></div>`).join('')}</div>`); break;
    case 'intention': S.intention = S.intention >= 4 ? 1 : S.intention + 1; save(); render(); toast(`Intention: seva ${S.intention}× a month`); break;
    case 'notify-test': notifyTest(); break;
    case 'reset': if (confirm('Reset the demo? Your sample changes will be cleared.')) { localStorage.removeItem(KEY); S = seed(); onbStep = 0; tab = 'home'; render(); } break;
    case 'create': createSheet(); break;
    case 'publish': {
      const title = $('#c-title').value.trim() || 'New seva'; const when = new Date($('#c-date').value || Date.now() + 3 * DAY).toISOString();
      S.seva.push({ id: 's' + uid(), title, cat: $('[data-tpl][aria-pressed="true"]')?.dataset.tpl || 'langar', group: S.me.group, start: when, dur: 180, place: $('#c-place').value, recur: $('#c-recur').value || null, purpose: 'Created from the demo.', status: 'open', roles: [ { id: 'r1', name: 'Cooks', cap: 6, filled: [], wait: [] }, { id: 'r2', name: 'Servers', cap: 8, filled: [], wait: [] }, { id: 'r3', name: 'Drivers', cap: 2, filled: [], wait: [] } ] });
      S.notifs.unshift({ id: uid(), t: `New seva: ${title}`, d: new Date().toISOString(), read: false, open: S.seva[S.seva.length - 1].id });
      save(); closeSheet(); tab = 'seva'; S.sevaView = 'seva'; render(); toast('Published — share the link in your WhatsApp group');
      break;
    }
    case 'roster': rosterSheet(id); break;
    case 'mark': { const p = el.dataset.p; S.attendance[id] = S.attendance[id] || {}; S.attendance[id][p] = !S.attendance[id][p]; save(); rosterSheet(id); break; }
    case 'complete': completeSheet(id); break;
    case 'submit-complete': {
      const s = S.seva.find((x) => x.id === form.id); form.next = $('#f-next')?.value || form.next;
      s.status = 'closed'; s.recap = recapText(s);
      const g = S.groups.find((x) => x.id === s.group);
      S.posts.unshift({ id: 'p' + uid(), scope: 'local', cat: s.cat, title: `${s.title} — ${form.outcome.toLowerCase()}`, city: g.city, date: new Date().toISOString(), outcome: `${form.count} volunteers${form.went[0] ? ' · ' + form.went[0] : ''}`, count: form.count, r: { g: 0, a: 0, c: 0 }, mine: null, pendingWorld: true });
      if (form.outcome !== 'Cancelled') { S.gardenLevel = Math.min(8, S.gardenLevel + 1); if (s.roles.some((r) => r.filled.includes(ME()))) S.passport.push({ cat: s.cat, title: s.title, date: s.start }); }
      save(); closeSheet(); render(); toast('Closed · story drafted · garden grew 🌱');
      break;
    }
    case 'qr': qrSheet(id); break;
    case 'nudge': toast('Reminder queued to members who haven\'t responded'); break;
    case 'invite': openSheet(`${sheetHead('Invite to ' + esc(myGroup().name))}<p class="muted small">Share in your WhatsApp group or show the QR at the gurdwara. New members see the next seva before signing up.</p>
        <button class="btn block" style="margin-top:16px" data-act="invite-wa">${I.wa} Share invite on WhatsApp</button>
        <button class="btn block ghost" style="margin-top:8px" data-act="qr" data-id="s1">${I.qr} Show group QR</button>`); break;
    case 'invite-wa': window.open(`https://wa.me/?text=${encodeURIComponent(`Join ${myGroup().name} on Namdhari Seva 🙏 ${location.origin}${location.pathname}`)}`, '_blank', 'noopener'); break;
    case 'approve': case 'reject': { const p = S.posts.find((x) => x.id === id); p.pendingWorld = false; if (act === 'approve') p.scope = 'world'; save(); render(); toast(act === 'approve' ? 'Promoted to Worldwide' : 'Kept in local feed'); break; }
    case 'csv': {
      const rows = [['seva', 'group', 'date', 'role', 'volunteer']]; S.seva.forEach((s) => s.roles.forEach((r) => r.filled.forEach((p) => rows.push([s.title, s.group, s.start.slice(0, 10), r.name, p]))));
      const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')); a.download = 'participation.csv'; a.click(); toast('CSV downloaded'); break;
    }
  }
}

// ---------- Event delegation ----------
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-tab],[data-open],[data-act],[data-view],[data-feed],[data-react],[data-region],[data-form],[data-tpl]');
  if (!t) return;
  if (t.dataset.tab) { tab = t.dataset.tab; closeSheet(); render(); return; }
  if (t.dataset.open) {
    const [k, v] = t.dataset.open.split(':');
    if (k === 'seva') sevaSheet(v); else if (k === 'event') eventSheet(v); else if (k === 'close') { closeSheet(); completeSheet(v); } else if (k === 'tab') { closeSheet(); tab = v; render(); }
    return;
  }
  if (t.dataset.view) { S.sevaView = t.dataset.view; save(); render(); return; }
  if (t.dataset.feed) { S.feed = t.dataset.feed; save(); render(); return; }
  if (t.dataset.region) { S.adminRegion = t.dataset.region; save(); render(); return; }
  if (t.dataset.tpl) {
    document.querySelectorAll('[data-tpl]').forEach((b) => b.setAttribute('aria-pressed', b === t));
    const titles = { langar: 'Sunday Langar Seva', cleanup: 'Neighbourhood Clean-up', tree: 'Tree Planting Drive', education: 'Gurmukhi Reading Circle' };
    $('#c-title').value = titles[t.dataset.tpl]; return;
  }
  if (t.dataset.react) {
    const [pid, k] = t.dataset.react.split(':'); const p = S.posts.find((x) => x.id === pid);
    if (p.mine === k) { p.r[k]--; p.mine = null; } else { if (p.mine) p.r[p.mine]--; p.r[k]++; p.mine = k; }
    vibrate(); save(); const card = t.closest('.post'); card.outerHTML = postCard(p); return;
  }
  if (t.dataset.form) {
    const f = t.dataset.form, v = t.dataset.v;
    form.count = parseInt($('#f-count')?.value, 10) || form.count; form.next = $('#f-next')?.value ?? form.next;
    if (f === 'outcome') form.outcome = v;
    if (f === 'inc') form.count++;
    if (f === 'dec') form.count = Math.max(0, form.count - 1);
    if (f === 'went' || f === 'issues') { const a = form[f]; const i = a.indexOf(v); i > -1 ? a.splice(i, 1) : a.push(v); }
    const y = $('.sheet').scrollTop; drawComplete(); $('.sheet').scrollTop = y; $('.sheet').style.animation = 'none'; return;
  }
  if (t.dataset.act) handle(t);
});
document.addEventListener('change', (e) => {
  if (e.target.id === 'role-select') { S.role = e.target.value; save(); tab = 'home'; render(); toast(`Viewing as ${e.target.selectedOptions[0].text}`); }
  if (e.target.id === 'theme-select') { S.theme = e.target.value; save(); render(); }
  if (e.target.id === 'group-select') { S.me.group = e.target.value; save(); render(); toast(`Primary group: ${myGroup().name}`); }
});
document.addEventListener('input', (e) => {
  if (e.target.id === 'f-count' || e.target.id === 'f-next') {
    form.count = parseInt($('#f-count').value, 10) || 0; form.next = $('#f-next').value;
    const s = S.seva.find((x) => x.id === form.id); const r = $('#recap'); if (r) r.textContent = recapText(s);
  }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && $('#sheet-root').innerHTML) { closeSheet(); render(); } });

window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; });
window.addEventListener('appinstalled', () => { toast('Installed — find Seva on your Home Screen'); render(); });

// Deep links from shared WhatsApp messages
function openFromHash() {
  const m = location.hash.match(/^#(seva|event)=(\w+)/);
  if (m && S.onboarded) { m[1] === 'seva' ? sevaSheet(m[2]) : eventSheet(m[2]); history.replaceState(null, '', location.pathname); }
}
window.addEventListener('hashchange', openFromHash);

// Skeleton then render (shows the loading pattern from the spec)
$('#app').innerHTML = `<main class="screen"><div class="skel" style="height:28px;width:40%"></div><div class="skel" style="height:120px;margin-top:20px"></div><div class="skel" style="height:90px;margin-top:16px"></div><div class="skel" style="height:90px;margin-top:12px"></div></main>`;
setTimeout(() => { render(); openFromHash(); }, 350);

if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
})();
