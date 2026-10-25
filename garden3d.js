/* Namdhari Seva — personal garden in 3D (loaded only when the 3D view is opened).
   Low-poly scene with orbit/pinch controls, idle wind, inertia wiggle when turning,
   butterflies, and a cat and dog that wander and play. Needs three.js r128 on window.THREE. */
(() => {
'use strict';
const T3 = window.THREE;

function glowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,230,150,1)'); gr.addColorStop(.35, 'rgba(255,210,110,.55)'); gr.addColorStop(1, 'rgba(255,200,90,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new T3.CanvasTexture(c);
}

function mount(host, o) {
  const dark = !!o.dark;
  const W = () => Math.max(1, host.clientWidth), H = () => Math.max(1, host.clientHeight);
  const renderer = new T3.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setSize(W(), H());
  host.prepend(renderer.domElement);

  const scene = new T3.Scene();
  scene.fog = new T3.Fog(dark ? 0x0c1422 : 0xdcebf2, 34, 70);
  const cam = new T3.PerspectiveCamera(38, W() / H(), 0.1, 200);
  scene.add(new T3.HemisphereLight(dark ? 0x9db2e6 : 0xf4f8ff, dark ? 0x1b2416 : 0x5a7a4e, dark ? 0.6 : 0.62));
  const sun = new T3.DirectionalLight(dark ? 0xa8b8ff : 0xfff1d6, dark ? 0.35 : 0.62); sun.position.set(8, 14, 6); scene.add(sun);

  // shared resources (disposed on destroy)
  const geos = [], mats = {}, texs = [];
  const G = (g) => { geos.push(g); return g; };
  const M = (color, extra) => { const k = color + JSON.stringify(extra || {}); return mats[k] || (mats[k] = new T3.MeshPhongMaterial(Object.assign({ color, flatShading: true, shininess: 4 }, extra || {}))); };
  const MB = (color, extra) => { const k = 'b' + color + JSON.stringify(extra || {}); return mats[k] || (mats[k] = new T3.MeshBasicMaterial(Object.assign({ color }, extra || {}))); };
  const mesh = (geo, mat, x = 0, y = 0, z = 0) => { const m = new T3.Mesh(geo, mat); m.position.set(x, y, z); return m; };
  const glowTex = glowTexture(); texs.push(glowTex);

  const N = o.size, C = 2.2, half = (N - 1) * C / 2, board = N * C + 0.8;
  const cellXZ = (k) => { const [x, y] = k.split(',').map(Number); return [x * C - half, y * C - half]; };
  const flex = [];      // things that sway: { obj, amp, speed, phase, k }
  const anims = [];     // per-frame functions (t, dt)
  const tappables = [];

  // ---- Ground ----
  const dirt = M(0x8a6a48), dirtD = M(0x6e5236), grassTop = M(dark ? 0x6f9f62 : 0x7fb06c);
  const slab = mesh(G(new T3.BoxGeometry(board, 1, board)), [dirt, dirtD, grassTop, dirtD, dirt, dirtD], 0, -0.5, 0);
  scene.add(slab);
  const under = mesh(G(new T3.CylinderGeometry(board * 0.42, board * 0.18, 2.2, 7)), dirtD, 0, -2.05, 0); scene.add(under);
  // Path tiles
  const pathGeo = G(new T3.BoxGeometry(C * 0.98, 0.06, C * 0.98)), stoneGeo = G(new T3.CylinderGeometry(0.28, 0.3, 0.05, 7));
  const occupied = new Set(Object.keys(o.items));
  Object.entries(o.tiles).forEach(([k, t]) => {
    if (t !== 'path') return; const [x, z] = cellXZ(k);
    scene.add(mesh(pathGeo, M(0xd8c6a2), x, 0.03, z));
    scene.add(mesh(stoneGeo, M(0xcdb892), x - 0.45, 0.07, z - 0.3)); scene.add(mesh(stoneGeo, M(0xcdb892), x + 0.5, 0.07, z + 0.4));
  });
  // Grass blades (instanced)
  const bladeGeo = G(new T3.ConeGeometry(0.05, 0.42, 3)); bladeGeo.translate(0, 0.21, 0);
  const blades = []; const lim = board / 2 - 0.15;
  for (let i = 0; i < 1100 && blades.length < 850; i++) {
    const x = (Math.random() * 2 - 1) * lim, z = (Math.random() * 2 - 1) * lim;
    const cx = Math.round((x + half) / C), cz = Math.round((z + half) / C); const k = `${cx},${cz}`;
    if (o.tiles[k] === 'path' && Math.abs(x - (cx * C - half)) < C / 2 && Math.abs(z - (cz * C - half)) < C / 2) continue;
    if (occupied.has(k) && Math.hypot(x - (cx * C - half), z - (cz * C - half)) < 0.55) continue;
    blades.push({ x, z, ph: Math.random() * 6.28, s: 0.6 + Math.random() * 0.8, ry: Math.random() * 3.14 });
  }
  const grassMat = M(dark ? 0x5f9a5a : 0x5c9a52);
  const grass = new T3.InstancedMesh(bladeGeo, grassMat, blades.length); scene.add(grass);
  const dummy = new T3.Object3D();

  // ---- Blob shadow ----
  const shadowGeo = G(new T3.CircleGeometry(1, 20)); const shadowMat = MB(0x000000, { transparent: true, opacity: dark ? 0.28 : 0.14, depthWrite: false });
  const shadow = (r, x, z) => { const s = mesh(shadowGeo, shadowMat, x, 0.012, z); s.rotation.x = -Math.PI / 2; s.scale.set(r, r, r); scene.add(s); return s; };
  const pivot = (x, y, z) => { const g = new T3.Group(); g.position.set(x, y, z); return g; };
  const sway = (obj, amp, speed, k = 1) => flex.push({ obj, amp, speed, phase: Math.random() * 6.28, k, bx: obj.rotation.x, bz: obj.rotation.z });

  // ---- Builders (each returns a Group at the cell origin) ----
  const B = {
    marigold() { const g = new T3.Group(); [[-.3, .2], [.25, .3], [0, -.3], [.35, -.2], [-.3, -.25]].forEach(([x, z], i) => { const p = pivot(x, 0, z); p.add(mesh(G(new T3.CylinderGeometry(.025, .03, .5, 4)), M(0x4e8460), 0, .25, 0)); p.add(mesh(G(new T3.IcosahedronGeometry(.13, 0)), M(i % 2 ? 0xf29a2e : 0xe0701a), 0, .52, 0)); g.add(p); sway(p, .12, 2.2 + i * .2, 1.4); }); return g; },
    rose() { const g = new T3.Group(); const p = pivot(0, 0, 0); const b = mesh(G(new T3.IcosahedronGeometry(.55, 0)), M(0x4f8a5d), 0, .42, 0); b.scale.set(1, .75, 1); p.add(b); [[.3, .7, .25], [-.25, .62, -.3], [0, .82, -.1], [-.35, .5, .3], [.38, .5, -.2]].forEach(([x, y, z]) => p.add(mesh(G(new T3.IcosahedronGeometry(.1, 0)), M(0xd9475b), x, y, z))); g.add(p); sway(p, .04, 1.6, .7); return g; },
    sapling() { const g = new T3.Group(); const p = pivot(0, 0, 0); p.add(mesh(G(new T3.CylinderGeometry(.04, .06, 1, 5)), M(0x7a5a38), 0, .5, 0)); [[-.18, .9, 0], [.2, 1.05, .05], [0, 1.2, -.1]].forEach(([x, y, z]) => { const l = mesh(G(new T3.IcosahedronGeometry(.2, 0)), M(0x7fba86), x, y, z); l.scale.set(1, .6, 1); p.add(l); }); g.add(p); sway(p, .07, 1.8, 1.6); return g; },
    mango() { const g = new T3.Group(); g.add(mesh(G(new T3.CylinderGeometry(.14, .22, 1.4, 6)), M(0x7a5a38), 0, .7, 0)); const top = pivot(0, 1.3, 0); top.add(mesh(G(new T3.IcosahedronGeometry(.95, 0)), M(0x3f7f55), 0, .55, 0)); top.add(mesh(G(new T3.IcosahedronGeometry(.6, 0)), M(0x4e9064), -.55, .35, .3)); top.add(mesh(G(new T3.IcosahedronGeometry(.55, 0)), M(0x478a5d), .5, .75, -.25)); [[.6, .2, .55], [-.7, .55, -.1], [.15, .1, -.85], [.2, 1.1, .5]].forEach(([x, y, z]) => top.add(mesh(G(new T3.SphereGeometry(.11, 6, 5)), M(0xf2a33a), x, y, z))); g.add(top); sway(top, .03, 1.1, 1); return g; },
    banyan() { const g = new T3.Group(); [[-.5, -.4], [.5, -.3], [-.3, .5], [.45, .45], [0, 0]].forEach(([x, z]) => g.add(mesh(G(new T3.CylinderGeometry(.09, .13, 2.2, 5)), M(0x7a5a38), x, 1.1, z))); const top = pivot(0, 2.1, 0); const a = mesh(G(new T3.IcosahedronGeometry(1.5, 1)), M(0x3e7a52), 0, .4, 0); a.scale.set(1.2, .55, 1.2); top.add(a); const b = mesh(G(new T3.IcosahedronGeometry(.9, 0)), M(0x4f8f62), -.5, .85, .2); b.scale.set(1, .6, 1); top.add(b); g.add(top); sway(top, .02, .9, .8); return g; },
    sunflower() { const g = new T3.Group(); [[-.25, 1.5], [.3, 1.85]].forEach(([x, h], i) => { const p = pivot(x, 0, 0); p.add(mesh(G(new T3.CylinderGeometry(.035, .045, h, 5)), M(0x4e8460), 0, h / 2, 0)); const head = mesh(G(new T3.CylinderGeometry(.28, .28, .06, 10)), M(0xf6c42e), 0, h, .05); head.rotation.x = Math.PI / 2 - .3; p.add(head); const c = mesh(G(new T3.CylinderGeometry(.12, .12, .07, 8)), M(0x7a4a1e), 0, h, .09); c.rotation.x = Math.PI / 2 - .3; p.add(c); const leaf = mesh(G(new T3.IcosahedronGeometry(.14, 0)), M(0x5e9a68), .12, h * .45, 0); leaf.scale.set(1.4, .4, .8); p.add(leaf); g.add(p); sway(p, .06, 1.5 + i * .3, 1.5); }); return g; },
    bench() { const g = new T3.Group(); const w = M(0xc48a55), d = M(0x8a5e38); g.add(mesh(G(new T3.BoxGeometry(1.5, .09, .5)), w, 0, .45, 0)); g.add(mesh(G(new T3.BoxGeometry(1.5, .4, .07)), w, 0, .78, -.24)); [[-.65, .2], [.65, .2], [-.65, -.2], [.65, -.2]].forEach(([x, z]) => g.add(mesh(G(new T3.BoxGeometry(.08, .45, .08)), d, x, .22, z))); return g; },
    lantern() { const g = new T3.Group(); g.add(mesh(G(new T3.CylinderGeometry(.05, .07, 1.8, 6)), M(0x4a3b2d), 0, .9, 0)); g.add(mesh(G(new T3.BoxGeometry(.32, .38, .32)), MB(0xf6d776), 0, 1.95, 0)); g.add(mesh(G(new T3.ConeGeometry(.28, .2, 4)), M(0x4a3b2d), 0, 2.24, 0)); const sp = new T3.Sprite(new T3.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: T3.AdditiveBlending, opacity: dark ? .95 : .45 })); mats['spr' + Math.random()] = sp.material; sp.position.set(0, 1.95, 0); sp.scale.set(dark ? 2.2 : 1.3, dark ? 2.2 : 1.3, 1); g.add(sp); const ph = Math.random() * 6; anims.push((t) => { sp.material.opacity = (dark ? .8 : .35) + Math.sin(t * 2 + ph) * .12; }); return g; },
    pond() { const g = new T3.Group(); g.add(mesh(G(new T3.CylinderGeometry(1, 1.02, .08, 24)), M(0x8a7a62), 0, .02, 0)); const water = mesh(G(new T3.CylinderGeometry(.9, .9, .06, 24)), new T3.MeshPhongMaterial({ color: 0x6fb4d8, shininess: 90, specular: 0xffffff, transparent: true, opacity: .92 }), 0, .06, 0); mats['water' + Math.random()] = water.material; g.add(water); const pad = mesh(G(new T3.CylinderGeometry(.22, .22, .02, 10)), M(0x5e9a68), -.3, .1, .25); g.add(pad); const lotus = mesh(G(new T3.ConeGeometry(.12, .2, 6)), M(0xf29bb5), .25, .18, -.15); g.add(lotus); const ring = mesh(G(new T3.TorusGeometry(.3, .012, 4, 24)), MB(0xffffff, { transparent: true, opacity: .5 }), 0, .1, 0); ring.rotation.x = Math.PI / 2; g.add(ring); anims.push((t) => { const s = (t * .5) % 1; ring.scale.set(1 + s * 2, 1 + s * 2, 1); ring.material.opacity = .5 * (1 - s); pad.position.y = .1 + Math.sin(t * 1.5) * .01; }); return g; },
    swing() { const g = new T3.Group(); const wd = M(0x8c6a43); [[-.75, -.35, .2], [-.75, .35, -.2], [.75, -.35, .2], [.75, .35, -.2]].forEach(([x, z, r]) => { const p = mesh(G(new T3.CylinderGeometry(.05, .05, 1.9, 5)), wd, x, .93, z * .5); p.rotation.x = r; g.add(p); }); const bar = mesh(G(new T3.CylinderGeometry(.05, .05, 1.6, 5)), wd, 0, 1.85, 0); bar.rotation.z = Math.PI / 2; g.add(bar); const sw = pivot(0, 1.85, 0); [-.22, .22].forEach((x) => sw.add(mesh(G(new T3.CylinderGeometry(.012, .012, 1.3, 3)), M(0x555555), x, -.65, 0))); sw.add(mesh(G(new T3.BoxGeometry(.56, .05, .26)), M(0xc0392b), 0, -1.3, 0)); g.add(sw); anims.push((t) => { sw.rotation.x = Math.sin(t * 1.6) * .35; }); return g; },
    butterflies() { const g = new T3.Group(); [[0xb48ce0, 1.1, 0], [0xf29a2e, .8, 2.4], [0x7cc4e8, 1.3, 4.1]].forEach(([col, hgt, off]) => { const b = new T3.Group(); const wingGeo = G(new T3.PlaneGeometry(.22, .17)); wingGeo.translate(.11, 0, 0); const wm = M(col, { side: T3.DoubleSide }); const l = mesh(wingGeo, wm), r = mesh(wingGeo, wm); r.rotation.y = Math.PI; b.add(l, r); const bd = mesh(G(new T3.CylinderGeometry(.015, .015, .16, 4)), M(0x333333)); bd.rotation.x = Math.PI / 2; b.add(bd); g.add(b); anims.push((t) => { const tt = t * .6 + off; b.position.set(Math.sin(tt) * 1.3 + Math.sin(tt * 2.3) * .3, hgt + Math.sin(tt * 3.1) * .25, Math.cos(tt * .8) * 1.1); b.rotation.y = -tt + Math.PI / 2; const f = Math.sin(t * 22 + off) * 1.1; l.rotation.y = f; r.rotation.y = Math.PI - f; l.rotation.x = r.rotation.x = -Math.PI / 2 + .3; }); }); return g; },
    peacock() { const g = new T3.Group(); const fan = pivot(0, .45, -.18); const fg = G(new T3.CircleGeometry(1, 18, 0, Math.PI)); const f = mesh(fg, M(0x2e8b6e, { side: T3.DoubleSide })); fan.add(f); for (let i = 0; i < 7; i++) { const a = .2 + i * (Math.PI - .4) / 6; fan.add(mesh(G(new T3.CircleGeometry(.07, 8)), MB(0x1f4e8c, { side: T3.DoubleSide }), Math.cos(a) * .78, Math.sin(a) * .78, .01)); } g.add(fan); const body = mesh(G(new T3.SphereGeometry(.24, 8, 6)), M(0x1f5fa8), 0, .5, 0); body.scale.set(.8, 1.1, 1.2); g.add(body); g.add(mesh(G(new T3.CylinderGeometry(.05, .07, .4, 5)), M(0x2069b8), 0, .8, .12)); g.add(mesh(G(new T3.SphereGeometry(.1, 6, 5)), M(0x2069b8), 0, 1.02, .18)); const beak = mesh(G(new T3.ConeGeometry(.03, .1, 4)), M(0xe3a33b), 0, 1.0, .3); beak.rotation.x = Math.PI / 2; g.add(beak); [-.08, .08].forEach((x) => g.add(mesh(G(new T3.CylinderGeometry(.015, .015, .3, 3)), M(0x8a6a3a), x, .15, 0))); anims.push((t) => { const open = .55 + .45 * (Math.sin(t * .35) * .5 + .5); fan.scale.set(open, open, 1); }); return g; },
  };

  // ---- Place items ----
  const pets = [];
  Object.entries(o.items).forEach(([k, id]) => {
    const [x, z] = cellXZ(k);
    if (id === 'cat' || id === 'dog') { pets.push(makePet(id, x, z, k)); return; }
    if (!B[id]) return;
    const g = B[id](); g.position.set(x, 0, z); g.rotation.y = (k.length * 1.7) % 6.28 * 0.15; g.userData.cell = k; scene.add(g); tappables.push(g);
    shadow({ mango: 1.1, banyan: 1.7, rose: .7, bench: .9, pond: 0, swing: .9, peacock: .6, sapling: .4, sunflower: .5, marigold: .55, lantern: .3, butterflies: .3 }[id] || .5, x, z);
  });

  // ---- Pets ----
  function makePet(type, x, z, cell) {
    const cat = type === 'cat'; const col = cat ? 0xe8a15a : 0xb07a4f, darkc = cat ? 0xc9813f : 0x7e5233; const s = cat ? 1 : 1.25;
    const g = new T3.Group(); g.userData.cell = cell; const bodyP = pivot(0, 0, 0); g.add(bodyP);
    const body = mesh(G(new T3.SphereGeometry(.26, 8, 6)), M(col), 0, .34 * s, 0); body.scale.set(.85 * s, .75 * s, 1.35 * s); bodyP.add(body);
    const head = pivot(0, .55 * s, .36 * s); head.add(mesh(G(new T3.SphereGeometry(.19 * s, 8, 6)), M(col)));
    if (cat) { [-.09, .09].forEach((ex) => { const e = mesh(G(new T3.ConeGeometry(.06, .13, 4)), M(col), ex, .17, 0); head.add(e); }); }
    else { [-.15, .15].forEach((ex) => { const e = mesh(G(new T3.BoxGeometry(.07, .2, .12)), M(darkc), ex, .02, -.02); e.rotation.z = ex > 0 ? -.3 : .3; head.add(e); }); head.add(mesh(G(new T3.BoxGeometry(.14, .11, .16)), M(col), 0, -.05, .18)); head.add(mesh(G(new T3.SphereGeometry(.035, 5, 4)), M(0x222222), 0, -.02, .27)); }
    [-.07, .07].forEach((ex) => head.add(mesh(G(new T3.SphereGeometry(.025, 5, 4)), M(0x1a1a1a), ex * s, .04 * s, .16 * s)));
    bodyP.add(head);
    const tail = pivot(0, .42 * s, -.36 * s); const tm = mesh(G(new T3.CylinderGeometry(.03 * s, .035 * s, cat ? .5 : .3, 5)), M(col), 0, cat ? .24 : .14, 0); tail.add(tm); tail.rotation.x = cat ? -.5 : -.9; bodyP.add(tail);
    const legs = []; [[-.12, .2], [.12, .2], [-.12, -.2], [.12, -.2]].forEach(([lx, lz]) => { const lp = pivot(lx * s, .22 * s, lz * s); lp.add(mesh(G(new T3.CylinderGeometry(.04 * s, .04 * s, .22 * s, 5)), M(darkc), 0, -.11 * s, 0)); g.add(lp); legs.push(lp); });
    g.position.set(x, 0, z); scene.add(g); tappables.push(g);
    const sh = shadow(.42 * s, x, z);
    return { type, g, bodyP, head, tail, legs, sh, s, speed: cat ? .75 : 1.05, state: 'idle', timer: Math.random() * 2, target: null, heading: Math.random() * 6.28, hop: 0 };
  }
  const bound = board / 2 - .6;
  const rnd = () => (Math.random() * 2 - 1) * bound;
  function updatePets(t, dt) {
    const catP = pets.find((p) => p.type === 'cat');
    pets.forEach((p) => {
      p.timer -= dt;
      if (p.state === 'idle' && p.timer <= 0) {
        if (p.type === 'dog' && catP && Math.random() < .4) { p.state = 'chase'; p.timer = 6; }
        else { p.state = 'walk'; p.target = [rnd(), rnd()]; p.timer = 12; }
      }
      let moving = false;
      if (p.state === 'walk' || p.state === 'chase') {
        const tgt = p.state === 'chase' ? [catP.g.position.x, catP.g.position.z] : p.target;
        const dx = tgt[0] - p.g.position.x, dz = tgt[1] - p.g.position.z, d = Math.hypot(dx, dz);
        if (d < (p.state === 'chase' ? .7 : .15) || p.timer <= 0) {
          if (p.state === 'chase') { p.state = 'play'; p.timer = 2.2; if (catP) { catP.state = 'play'; catP.timer = 2.2; } }
          else { p.state = 'idle'; p.timer = 1.5 + Math.random() * 3; }
        } else {
          const sp = p.speed * (p.state === 'chase' ? 1.5 : 1) * dt;
          p.g.position.x += dx / d * sp; p.g.position.z += dz / d * sp;
          const want = Math.atan2(dx, dz); let diff = want - p.heading; diff = Math.atan2(Math.sin(diff), Math.cos(diff)); p.heading += diff * Math.min(1, dt * 6);
          moving = true;
        }
      }
      if (p.state === 'play') { if (p.timer <= 0) { p.state = 'idle'; p.timer = 1 + Math.random() * 2; } p.hop = Math.abs(Math.sin(t * 9)) * .18; p.heading += dt * 2.4; }
      else p.hop *= .85;
      p.g.position.x = Math.max(-bound, Math.min(bound, p.g.position.x)); p.g.position.z = Math.max(-bound, Math.min(bound, p.g.position.z));
      p.g.rotation.y = p.heading; p.g.position.y = p.hop;
      const w = moving ? Math.sin(t * (p.type === 'dog' ? 14 : 11)) * .6 : 0;
      p.legs.forEach((l, i) => { l.rotation.x = (i === 0 || i === 3 ? w : -w); });
      p.bodyP.position.y = moving ? Math.abs(Math.sin(t * 12)) * .025 : 0;
      const sit = p.type === 'cat' && p.state === 'idle' && p.timer > 1.5; p.bodyP.rotation.x = sit ? -.18 : 0;
      p.tail.rotation.z = Math.sin(t * (p.type === 'dog' ? (moving || p.state === 'play' ? 16 : 8) : 2.5)) * (p.type === 'dog' ? .6 : .35);
      p.head.rotation.y = Math.sin(t * .8 + p.s) * .3;
      p.sh.position.set(p.g.position.x, .012, p.g.position.z);
    });
  }

  // ---- Night extras ----
  let flies = [];
  if (dark) {
    for (let i = 0; i < 14; i++) { const sp = new T3.Sprite(new T3.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: T3.AdditiveBlending, color: 0xd6ff9a })); mats['fly' + i] = sp.material; sp.scale.set(.35, .35, 1); scene.add(sp); flies.push({ sp, x: rnd(), z: rnd(), ph: Math.random() * 6 }); }
    const sg = G(new T3.BufferGeometry()); const pos = []; for (let i = 0; i < 160; i++) { const a = Math.random() * 6.28, e = Math.random() * 1.2 + .2, r = 60; pos.push(Math.cos(a) * Math.cos(e) * r, Math.sin(e) * r, Math.sin(a) * Math.cos(e) * r); } sg.setAttribute('position', new T3.Float32BufferAttribute(pos, 3));
    const pm = new T3.PointsMaterial({ color: 0xffffff, size: .35, transparent: true, opacity: .7, fog: false }); mats.stars = pm; scene.add(new T3.Points(sg, pm));
  }

  // ---- Camera orbit ----
  const hf = 2 * Math.atan(Math.tan(19 * Math.PI / 180) * (W() / H()));
  const DEF = { tx: 0, ty: .4, tz: 0, r: Math.max(16, Math.min(36, board * .5 / Math.tan(hf / 2))), az: .78, pol: .98 };
  const cv = Object.assign({}, DEF); let goal = null;
  if (o.focus && (o.items[o.focus])) { const [fx, fz] = cellXZ(o.focus); Object.assign(cv, { tx: fx, tz: fz, ty: .8, r: 7.5 }); }
  let azVel = 0, lastInput = performance.now();
  const ptrs = new Map(); let pinch0 = 0, r0 = cv.r, downAt = 0, moved = 0;
  const el = renderer.domElement;
  const onDown = (e) => { el.setPointerCapture && el.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); downAt = performance.now(); moved = 0; goal = null; if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); r0 = cv.r; } lastInput = performance.now(); };
  const onMove = (e) => {
    if (!ptrs.has(e.pointerId)) return; const p = ptrs.get(e.pointerId); const dx = e.clientX - p.x, dy = e.clientY - p.y; moved += Math.abs(dx) + Math.abs(dy);
    p.x = e.clientX; p.y = e.clientY; lastInput = performance.now();
    if (ptrs.size === 1) { const d = -dx * .008; cv.az += d; azVel = azVel * .5 + (d / (1 / 60)) * .5; cv.pol = Math.max(.42, Math.min(1.36, cv.pol - dy * .006)); }
    else if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; const dd = Math.hypot(a.x - b.x, a.y - b.y); if (pinch0) cv.r = Math.max(6, Math.min(40, r0 * pinch0 / dd)); }
  };
  const ray = new T3.Raycaster(), ndc = new T3.Vector2();
  const onUp = (e) => {
    const wasTap = ptrs.size === 1 && moved < 8 && performance.now() - downAt < 400;
    ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch0 = 0;
    if (wasTap && o.onTap) {
      const rc = el.getBoundingClientRect(); ndc.set(((e.clientX - rc.left) / rc.width) * 2 - 1, -((e.clientY - rc.top) / rc.height) * 2 + 1);
      ray.setFromCamera(ndc, cam); const hit = ray.intersectObjects(tappables, true)[0];
      if (hit) { let ob = hit.object; while (ob && !ob.userData.cell) ob = ob.parent; if (ob) o.onTap(ob.userData.cell); }
    }
  };
  const onWheel = (e) => { e.preventDefault(); cv.r = Math.max(6, Math.min(40, cv.r * (1 + e.deltaY * .001))); lastInput = performance.now(); };
  el.addEventListener('pointerdown', onDown); el.addEventListener('pointermove', onMove); el.addEventListener('pointerup', onUp); el.addEventListener('pointercancel', onUp); el.addEventListener('wheel', onWheel, { passive: false });

  // ---- Loop ----
  let bend = 0, bendV = 0, raf = 0, last = performance.now(), prevAz = cv.az; const t0 = performance.now();
  const ro = new ResizeObserver(() => { renderer.setSize(W(), H()); cam.aspect = W() / H(); cam.updateProjectionMatrix(); }); ro.observe(host);
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (document.hidden) { last = now; return; }
    const dt = Math.min(.05, (now - last) / 1000); last = now; const t = (now - t0) / 1000;
    // inertia + gentle auto-rotate when idle
    if (!ptrs.size) { const idle = now - lastInput > 5000; cv.az += azVel * dt; azVel *= Math.pow(.06, dt); if (idle) cv.az += .07 * dt; }
    if (goal) { for (const k in goal) cv[k] += (goal[k] - cv[k]) * Math.min(1, dt * 4); if (Math.abs(goal.r - cv.r) < .02) goal = null; }
    const w = (cv.az - prevAz) / Math.max(dt, .001); prevAz = cv.az;
    // spring: foliage lags behind the turn, overshoots, settles
    const target = Math.max(-.18, Math.min(.18, -w * .1));
    bendV += ((target - bend) * 46 - bendV * 6.5) * dt; bend += bendV * dt;
    const tx = Math.cos(cv.az), tz = -Math.sin(cv.az); const bx = bend * tx, bz = bend * tz;
    const wind = Math.sin(t * .7) * .04;
    flex.forEach((f) => { const s = Math.sin(t * f.speed + f.phase) * f.amp; f.obj.rotation.z = f.bz + s + (-bx + wind) * f.k; f.obj.rotation.x = f.bx + Math.cos(t * f.speed * .8 + f.phase) * f.amp * .6 + bz * f.k; });
    for (let i = 0; i < blades.length; i++) { const b = blades[i]; const s = Math.sin(t * 1.8 + b.ph + b.x * .3) * .14 + wind * 2; dummy.position.set(b.x, 0, b.z); dummy.rotation.set(bz * 1.3 + Math.cos(t * 1.3 + b.ph) * .05, b.ry, s - bx * 1.3); dummy.scale.set(1, b.s, 1); dummy.updateMatrix(); grass.setMatrixAt(i, dummy.matrix); }
    grass.instanceMatrix.needsUpdate = true;
    anims.forEach((f) => f(t, dt));
    updatePets(t, dt);
    flies.forEach((f, i) => { f.sp.position.set(f.x + Math.sin(t * .4 + f.ph) * 1.2, .6 + Math.sin(t * .9 + f.ph) * .4, f.z + Math.cos(t * .5 + f.ph) * 1.2); f.sp.material.opacity = .4 + .6 * Math.abs(Math.sin(t * 1.5 + i)); });
    const sp = Math.sin(cv.pol);
    cam.position.set(cv.tx + cv.r * sp * Math.sin(cv.az), cv.ty + cv.r * Math.cos(cv.pol), cv.tz + cv.r * sp * Math.cos(cv.az));
    cam.lookAt(cv.tx, cv.ty, cv.tz);
    renderer.render(scene, cam);
  }
  raf = requestAnimationFrame(frame);

  return {
    reset() { goal = { tx: DEF.tx, ty: DEF.ty, tz: DEF.tz, r: DEF.r, pol: DEF.pol }; azVel = 0; },
    destroy() {
      cancelAnimationFrame(raf); ro.disconnect();
      el.removeEventListener('pointerdown', onDown); el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerup', onUp); el.removeEventListener('pointercancel', onUp); el.removeEventListener('wheel', onWheel);
      geos.forEach((g) => g.dispose()); Object.values(mats).forEach((m) => m.dispose && m.dispose()); texs.forEach((x) => x.dispose()); grass.dispose && grass.dispose();
      renderer.dispose(); el.remove();
    },
  };
}
window.Garden3D = { mount };
})();
