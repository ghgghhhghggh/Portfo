/* =========================================================
   PORTFOLIO — Scène de la page d'accueil
   Une étoile à facettes, trois anneaux, deux ailes et des
   rayons bougent en 3D, mais tout est dessiné à plat avec de
   petits symboles en pixels (croix, dagues, points…).
   Aucun fichier image, aucune bibliothèque : les formes sont
   calculées ici.

   Couleurs : la scène est blanche, avec quelques symboles en
   jaune, orange, vert, bleu et magenta. Ils sont toujours
   séparés par du blanc, et ils se déplacent : le long des
   anneaux, d'une plume à l'autre, d'un rayon à l'autre.
   ========================================================= */

(function () {
  'use strict';

  const canvas = document.getElementById('ascii-scene');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');

  // ---------- Réglages ----------
  const FPS = 20;                      // images par seconde (rendu saccadé façon GIF)
  const CAM = 9;                       // distance de la caméra : plus petit = perspective plus forte
  const LIGHT = normalize([-0.4, 0.55, 0.73]);
  const BACKGROUND = [12, 13, 15];     // couleur du fond du site (#0c0d0f)
  // Teinte 0 : blanc. Teintes 1 à 5 : jaune, orange, vert, bleu, magenta.
  const HUES = ['#ece8df', '#f4d44d', '#f28a3c', '#6fd96b', '#4f9dff', '#e24fc4'];
  const LEVELS = [0.2, 0.36, 0.56, 0.8, 1];   // 5 intensités, de la plus sombre à la plus vive
  const N_COLORS = HUES.length - 1;

  // Symboles des faces de l'étoile, de la face la plus sombre à la plus éclairée
  const STAR_RAMP = ['dot', 'colon', 'minus', 'equal', 'plus', 'times', 'dagger', 'sparkle', 'ddagger', 'hash'];
  // Pour bien distinguer les ailes des anneaux, chacun a sa famille de symboles :
  // traits droits pour les plumes, formes rondes pour les anneaux.
  // Plumes : une plume sur deux utilise la seconde série
  const FEATHER_A = ['dot', 'colon', 'minus', 'equal', 'plus', 'dagger', 'ddagger', 'hash'];
  const FEATHER_B = ['dot', 'colon', 'pipe', 'equal', 'plus', 'dagger', 'ddagger', 'hash'];
  // Anneaux : rayon, perles blanches, symbole des perles colorées, vitesse de défilement
  const RINGS = [
    { radius: 1.35, beads: ['ring', 'dot', 'ring', 'dot'], gem: 'sparkle', speed: 4 },
    { radius: 1.95, beads: ['ring', 'dot', 'diamond', 'dot'], gem: 'sparkle', speed: 3 },
    { radius: 2.55, beads: ['ring', 'ring', 'dot', 'diamond'], gem: 'sparkle', speed: 2.5 }
  ];
  const GEM_EVERY = 6;                 // une perle colorée (longue de 2 cases) toutes les 6 perles
  const RAYS = 20;                     // nombre de rayons (multiple de 4) ; 1 sur 4 est coloré
  const FEATHERS = 15;                 // plumes par aile ; 1 sur 3 est colorée

  // ---------- Symboles, dessinés sur une grille de 5 x 7 pixels ----------
  const GLYPHS = {
    dot:      ['.....', '.....', '.....', '..#..', '.....', '.....', '.....'],
    colon:    ['.....', '..#..', '.....', '.....', '.....', '..#..', '.....'],
    minus:    ['.....', '.....', '.....', '.###.', '.....', '.....', '.....'],
    equal:    ['.....', '.....', '.###.', '.....', '.###.', '.....', '.....'],
    pipe:     ['..#..', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
    slash:    ['....#', '...#.', '...#.', '..#..', '.#...', '.#...', '#....'],
    bslash:   ['#....', '.#...', '.#...', '..#..', '...#.', '...#.', '....#'],
    plus:     ['.....', '..#..', '..#..', '#####', '..#..', '..#..', '.....'],
    times:    ['.....', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '.....'],
    dagger:   ['..#..', '..#..', '#####', '..#..', '..#..', '..#..', '..#..'],
    ddagger:  ['..#..', '#####', '..#..', '..#..', '#####', '..#..', '..#..'],
    sparkle:  ['..#..', '..#..', '.###.', '#####', '.###.', '..#..', '..#..'],
    diamond:  ['.....', '..#..', '.#.#.', '#...#', '.#.#.', '..#..', '.....'],
    ring:     ['.....', '.###.', '#...#', '#...#', '#...#', '.###.', '.....'],
    hash:     ['.#.#.', '#####', '.#.#.', '.#.#.', '#####', '.#.#.', '.....']
  };

  // ---------- Étoile ----------
  // Une étoile plate à quatre branches (deux pyramides basses dos à dos), puis la même
  // tournée d'un quart de tour : les deux se croisent, l'étoile reste donc visible de profil.
  const STAR_OUTLINE = [
    [0, 2.15, 0], [-0.34, 0.42, 0], [-1.12, 0, 0], [-0.34, -0.42, 0],
    [0, -2.15, 0], [0.34, -0.42, 0], [1.12, 0, 0], [0.34, 0.42, 0]
  ];
  const BLADE = STAR_OUTLINE.concat([[0, 0, 0.3], [0, 0, -0.3]]);
  const STAR_VERTS = BLADE.concat(BLADE.map(function (p) { return [p[2], p[1], -p[0]]; }));
  const STAR_FACES = [];
  [0, 10].forEach(function (o) {
    for (let i = 0; i < 8; i++) {
      const j = (i + 1) % 8;
      STAR_FACES.push([o + 8, o + i, o + j]);   // face avant
      STAR_FACES.push([o + 9, o + j, o + i]);   // face arrière
    }
  });

  // ---------- Petits outils de calcul ----------
  function normalize(v) {
    const n = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / n, v[1] / n, v[2] / n];
  }
  function mod(a, n) { return ((a % n) + n) % n; }
  function rotX(v, a) { const c = Math.cos(a), s = Math.sin(a); return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c]; }
  function rotY(v, a) { const c = Math.cos(a), s = Math.sin(a); return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c]; }
  function faceNormal(a, b, c) {
    return normalize([
      (b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]),
      (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]),
      (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
    ]);
  }
  // Vrai si la face regarde la caméra
  function facesCamera(n, a, b, c) {
    return n[0] * -(a[0] + b[0] + c[0]) / 3 + n[1] * -(a[1] + b[1] + c[1]) / 3 + n[2] * (CAM - (a[2] + b[2] + c[2]) / 3) > 0;
  }
  function lightOn(n) { return Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]); }

  // ---------- Grille de symboles ----------
  let px, cellW, cellH, cols, rows, offX, offY, unit, wide;
  let wingX = 1, wingY = 1, featherCount = FEATHERS;     // taille des ailes, réglée selon la largeur de l'écran
  let glyphBuf, levelBuf, hueBuf, kindBuf, zBuf, atlas;
  // Ce que contient une case (sert à écarter les plumes autour des anneaux)
  const STAR = 1, WING = 2, RING = 3, GAP = 4;

  // Une petite image par symbole, par teinte et par intensité, prête à être collée
  function buildAtlas() {
    const shades = HUES.map(function (hex) {
      const rgb = [1, 3, 5].map(function (k) { return parseInt(hex.slice(k, k + 2), 16); });
      return LEVELS.map(function (f) {
        return 'rgb(' + rgb.map(function (v, k) { return Math.round(BACKGROUND[k] + (v - BACKGROUND[k]) * f); }).join(',') + ')';
      });
    });
    atlas = {};
    Object.keys(GLYPHS).forEach(function (name) {
      atlas[name] = shades.map(function (levels) {
        return levels.map(function (color) {
          const c = document.createElement('canvas');
          c.width = 5 * px;
          c.height = 7 * px;
          const g = c.getContext('2d');
          g.fillStyle = color;
          GLYPHS[name].forEach(function (row, y) {
            for (let x = 0; x < 5; x++) {
              if (row[x] === '#') g.fillRect(x * px, y * px, px, px);
            }
          });
          return c;
        });
      });
    });
  }

  function layout() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // Taille d'un pixel de symbole : symboles plus fins sur petit écran
    px = Math.max(1, Math.round((w < 520 ? 1 : 2) * dpr));
    cellW = 6 * px;
    cellH = 8 * px;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    cols = Math.floor(canvas.width / cellW);
    rows = Math.floor(canvas.height / cellH);
    offX = Math.floor((canvas.width - cols * cellW) / 2);
    offY = Math.floor((canvas.height - rows * cellH) / 2);
    // Écran large : la scène s'étale et les ailes apparaissent. Écran étroit : pas d'ailes.
    wide = canvas.width / canvas.height > 1.35;
    unit = Math.min(canvas.width / (wide ? 10.4 : 5.7), canvas.height / 5.7); // pixels d'écran pour 1 unité 3D
    // Sur un grand écran, il reste de la place à gauche et à droite : les ailes s'étirent
    // jusqu'aux bords (au plus 2,4 fois leur envergure de base) et gagnent un peu en hauteur.
    const halfWidth = canvas.width / (2 * unit);                              // demi-largeur de l'écran, en unités 3D
    wingX = Math.max(1, Math.min(2.4, (halfWidth - 1.2) / 4.3));
    wingY = Math.min(wingX, 1.25);
    featherCount = Math.round(FEATHERS * wingX);                              // plus de plumes, pas des plumes plus larges
    glyphBuf = new Array(cols * rows);
    levelBuf = new Uint8Array(cols * rows);
    hueBuf = new Uint8Array(cols * rows);
    kindBuf = new Uint8Array(cols * rows);
    zBuf = new Float32Array(cols * rows);
    buildAtlas();
    return true;
  }

  // Passe d'un point 3D à une position dans la grille (colonne, ligne)
  function project(v) {
    const k = CAM / (CAM - v[2]);
    return [
      (canvas.width / 2 + v[0] * k * unit - offX) / cellW,
      (canvas.height / 2 - v[1] * k * unit - offY) / cellH
    ];
  }

  function put(i, j, z, glyph, level, hue, kind) {
    if (i < 0 || j < 0 || i >= cols || j >= rows) return;
    const n = j * cols + i;
    if (z < zBuf[n]) return;             // quelque chose de plus proche occupe déjà la case
    zBuf[n] = z;
    glyphBuf[n] = glyph;
    levelBuf[n] = level;
    hueBuf[n] = hue;
    kindBuf[n] = kind;
  }

  // Remplit un triangle : chaque case dont le centre est dedans reçoit le symbole
  function triangle(a, b, c, za, zb, zc, glyph, level, hue, kind) {
    const area = (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]);
    if (Math.abs(area) < 1e-6) return;
    const minX = Math.max(0, Math.floor(Math.min(a[0], b[0], c[0])));
    const maxX = Math.min(cols - 1, Math.ceil(Math.max(a[0], b[0], c[0])));
    const minY = Math.max(0, Math.floor(Math.min(a[1], b[1], c[1])));
    const maxY = Math.min(rows - 1, Math.ceil(Math.max(a[1], b[1], c[1])));
    for (let j = minY; j <= maxY; j++) {
      for (let i = minX; i <= maxX; i++) {
        const x = i + 0.5, y = j + 0.5;
        const w0 = ((b[0] - x) * (c[1] - y) - (c[0] - x) * (b[1] - y)) / area;
        const w1 = ((c[0] - x) * (a[1] - y) - (a[0] - x) * (c[1] - y)) / area;
        const w2 = 1 - w0 - w1;
        if (w0 < -0.02 || w1 < -0.02 || w2 < -0.02) continue;
        put(i, j, w0 * za + w1 * zb + w2 * zc, glyph, level, hue, kind);
      }
    }
  }

  // ---------- Les éléments de la scène ----------

  // L'étoile reste blanche : c'est la source de lumière.
  function drawStar(t) {
    const spin = t * 0.45;
    const tilt = Math.sin(t * 0.3) * 0.16;
    const v = STAR_VERTS.map(function (p) { return rotX(rotY(p, spin), tilt); });
    const p2 = v.map(project);
    STAR_FACES.forEach(function (f) {
      const a = v[f[0]], b = v[f[1]], c = v[f[2]];
      const n = faceNormal(a, b, c);
      if (!facesCamera(n, a, b, c)) return;
      // Plus la face regarde la lumière, plus le symbole est dense et clair
      const b01 = Math.min(0.999, 0.22 + 0.78 * lightOn(n));
      triangle(p2[f[0]], p2[f[1]], p2[f[2]], a[2], b[2], c[2],
        STAR_RAMP[Math.floor(b01 * STAR_RAMP.length)], Math.min(4, 1 + Math.floor(b01 * 4)), 0, STAR);
    });
  }

  // Un point de l'aile. u : de l'épaule (0) à la pointe (1). v : de l'os (0) au bout des plumes (1).
  function wingPoint(u, v, side, t, sway) {
    // Les plumes pendent près du corps, puis s'ouvrent vers l'extérieur à la pointe
    const ang = (-88 + 84 * Math.pow(u, 1.15)) * Math.PI / 180;
    const len = (1.15 + 1.25 * Math.sin(Math.PI * Math.pow(u, 0.8))) * v;
    const dx = (3.15 * u + Math.cos(ang) * len) * wingX;  // position par rapport à l'épaule
    const dy = (1.95 * Math.pow(Math.sin(u * Math.PI / 2), 0.8) + Math.sin(ang) * len) * wingY;
    // Battement lent : l'aile pivote autour de l'épaule, la pointe suit avec un léger retard
    const flap = 0.06 * Math.sin(t * 0.9) + 0.12 * u * Math.sin(t * 0.9 - 0.9);
    const c = Math.cos(flap), s = Math.sin(flap);
    const x = 0.95 + dx * c - dy * s;
    const y = 0.1 + dx * s + dy * c;
    const z = -0.9 - 0.8 * u * u + 0.25 * v * (1 - u);   // l'aile est en retrait, derrière l'étoile
    return rotY([x * side, y, z], sway);
  }

  // Chaque plume est une lame séparée de ses voisines : l'aile reste légère et laisse voir le fond.
  function drawWing(side, t) {
    // Léger balancement d'un côté à l'autre, réduit quand les ailes sont longues
    // pour qu'elles gardent à peu près la même envergure à gauche et à droite
    const sway = Math.sin(t * 0.3) * 0.08 / wingX;
    const ROWS = 4;
    const walk = Math.floor(t / 1.1);                    // les couleurs avancent d'une plume vers la pointe
    for (let s = 0; s < featherCount; s++) {
      const colored = mod(s - walk, 5) === 0;            // 1 plume colorée, puis 4 blanches
      const hue = colored ? 1 + mod(Math.floor((s - walk) / 5) + (side < 0 ? 2 : 0), N_COLORS) : 0;
      const ramp = s % 2 ? FEATHER_B : FEATHER_A;
      const u0 = s / featherCount, u1 = (s + 0.6) / featherCount;
      const edge = [];
      for (let r = 0; r <= ROWS; r++) {
        const a = wingPoint(u0, r / ROWS, side, t, sway), b = wingPoint(u1, r / ROWS, side, t, sway);
        edge.push([a, project(a), b, project(b)]);
      }
      for (let r = 0; r < ROWS; r++) {
        const a = edge[r][0], b = edge[r][2], c = edge[r + 1][2], d = edge[r + 1][0];
        // Une aile se voit des deux côtés : on éclaire la face tournée vers la caméra
        let n = faceNormal(a, b, c);
        if (!facesCamera(n, a, b, c)) n = [-n[0], -n[1], -n[2]];
        const lit = lightOn(n);
        // Symboles denses près de l'os, de plus en plus légers vers le bout des plumes
        const ink = Math.min(0.999, (0.35 + 0.65 * lit) * (1 - 0.6 * (r + 0.5) / ROWS));
        const glyph = ramp[Math.floor(ink * ramp.length)];
        // Jamais aussi clair que l'étoile, sauf les plumes colorées
        const level = Math.min(colored ? 4 : 3, 1 + Math.floor((0.2 + 0.8 * lit) * 3) + (colored ? 1 : 0)) - (r === ROWS - 1 ? 1 : 0);
        triangle(edge[r][1], edge[r][3], edge[r + 1][3], a[2], b[2], c[2], glyph, level, hue, WING);
        triangle(edge[r][1], edge[r + 1][3], edge[r + 1][1], a[2], c[2], d[2], glyph, level, hue, WING);
      }
    }
  }

  // Un anneau est une suite de perles qui défilent. Les perles colorées défilent avec les autres.
  function drawRing(ring, orient, t) {
    const around = 2 * Math.PI * ring.radius * unit / cellW;     // longueur de l'anneau, en cases
    const cycle = GEM_EVERY * N_COLORS;
    const beads = Math.max(cycle, Math.round(around / cycle) * cycle);
    const samples = Math.ceil(around * 3);
    const shift = Math.floor(t * ring.speed);
    for (let k = 0; k < samples; k++) {
      const a = k / samples * Math.PI * 2;
      const p = orient([ring.radius * Math.cos(a), 0, ring.radius * Math.sin(a)]);
      const q = project(p);
      const slot = mod(Math.floor(k / samples * beads) + shift, beads);
      const gem = slot % GEM_EVERY < 2;
      // Devant : très clair, plus que les plumes. Derrière : sombre.
      const depth = Math.round(2.5 + 1.5 * p[2] / ring.radius);
      put(Math.floor(q[0]), Math.floor(q[1]), p[2],
        gem ? ring.gem : ring.beads[slot % ring.beads.length],
        Math.max(1, Math.min(4, depth + (gem ? 1 : 0))),
        gem ? 1 + Math.floor(slot / GEM_EVERY) % N_COLORS : 0, RING);
    }
  }

  // Là où un anneau passe devant une aile, on vide les cases de plume qui le touchent :
  // l'anneau se détache alors nettement, comme entouré d'un liseré sombre.
  function clearAroundRings() {
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        if (kindBuf[j * cols + i] !== RING) continue;
        for (let dj = -1; dj <= 1; dj++) {
          for (let di = -1; di <= 1; di++) {
            const x = i + di, y = j + dj;
            if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
            const n = y * cols + x;
            if (kindBuf[n] === WING) {
              glyphBuf[n] = null;
              kindBuf[n] = GAP;
            }
          }
        }
      }
    }
  }

  // Rayons qui partent du centre, seulement dans les cases restées vides.
  // Une ondulation claire les parcourt, et les rayons colorés changent de place.
  function drawRays(t) {
    const cx = canvas.width / 2 - offX, cy = canvas.height / 2 - offY;
    const wave = (t * 6) % 9;
    const turn = Math.floor(t / 1.6);
    for (let r = 0; r < RAYS; r++) {
      const a = (r + 0.5) / RAYS * Math.PI * 2;
      const reach = (r % 2 ? 2.7 : 3.6) * unit * (1 + 0.06 * Math.sin(t * 0.9 + r * 2.4));
      const dx = Math.cos(a), dy = Math.sin(a);
      const colored = mod(r - turn, 4) === 0;
      const hue = colored ? 1 + mod(Math.floor((r - turn) / 4), N_COLORS) : 0;
      // Symbole selon la pente du rayon à l'écran
      const s = mod(a, Math.PI);
      const glyph = s < Math.PI / 8 || s >= Math.PI * 7 / 8 ? 'minus'
        : s < Math.PI * 3 / 8 ? 'bslash'
          : s < Math.PI * 5 / 8 ? 'pipe' : 'slash';
      let step = 0;
      for (let d = 0.6 * unit; d < reach; d += cellW * 0.9, step++) {
        const i = Math.floor((cx + dx * d) / cellW), j = Math.floor((cy + dy * d) / cellH);
        if (i < 0 || j < 0 || i >= cols || j >= rows || glyphBuf[j * cols + i] || kindBuf[j * cols + i] === GAP) continue;
        const crest = Math.abs((step % 9) - wave) < 1;
        const far = d > reach * 0.6;
        glyphBuf[j * cols + i] = d > reach * 0.82 ? 'dot' : glyph;
        levelBuf[j * cols + i] = (crest ? 2 : (far ? 0 : 1)) + (colored ? 1 : 0);
        hueBuf[j * cols + i] = hue;
      }
    }
  }

  // ---------- Une image de l'animation ----------
  function render(t) {
    if (!glyphBuf) return;
    glyphBuf.fill(null);
    kindBuf.fill(0);
    zBuf.fill(-Infinity);

    drawStar(t);
    if (wide) {
      drawWing(1, t);
      drawWing(-1, t);
    }
    drawRing(RINGS[0], function (p) { return rotY(rotX(p, 1.15 + Math.sin(t * 0.3) * 0.12), t * 0.35); }, t);
    drawRing(RINGS[1], function (p) { return rotY(rotX(p, 1.3), Math.sin(t * 0.25) * 0.55); }, t);
    drawRing(RINGS[2], function (p) { return rotY(rotX(p, 1.43 + Math.sin(t * 0.2) * 0.08), Math.sin(t * 0.17 + 1) * 0.3); }, t);
    if (wide) clearAroundRings();
    if (RAYS) drawRays(t);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const n = j * cols + i;
        const g = glyphBuf[n];
        if (g) ctx.drawImage(atlas[g][hueBuf[n]][levelBuf[n]], offX + i * cellW, offY + j * cellH);
      }
    }
  }

  // ---------- Animation ----------
  const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let last = 0;

  function frame(now) {
    if (now - last >= 1000 / FPS) {
      last = now;
      render(now / 1000);
    }
    requestAnimationFrame(frame);
  }

  function resize() {
    if (layout() && still) render(2.4);   // image fixe si l'animation est désactivée par le visiteur
  }

  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
  else window.addEventListener('resize', resize);
  resize();
  if (!still) requestAnimationFrame(frame);
})();
