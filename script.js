/* =========================================================
   PORTFOLIO — Script
   - Animations d'apparition au scroll
   - Menu déroulant (pages et options d'affichage)
   - Langue : français ou anglais
   - Thème : sombre ou clair
   - Agencement automatique des blocs d'images
   - Année automatique dans le pied de page
   ========================================================= */

(function () {
  'use strict';

  const root = document.documentElement;

  // ---------- Traductions anglaises ----------
  // Le français est le texte écrit dans les pages HTML : c'est lui qui fait foi.
  // Chaque élément marqué data-i18n="clé" reçoit ici son texte anglais.
  // Un élément sans traduction reste simplement en français.
  const EN = {
    'nav.main': 'Main navigation',
    'nav.projets': 'Projects',
    'nav.medias': 'Media',
    'nav.apropos': 'About',
    'nav.competences': 'Skills',
    'nav.contact': 'Contact',
    'misc.lang': 'Language',
    'misc.theme': 'Theme',
    'misc.dark': 'Dark',
    'misc.light': 'Light',
    'back.top': 'Back to top',
    'back.home': 'Back to home',
    'back.projects': 'Back to projects',
    'back.iceample': 'Back to Iceample',
    'label.site': 'Website',
    'label.email': 'Email',
    'label.installer': 'Installer (GitHub)',
    'iceample.sub': 'Multi-purpose software and web app',
    'iceample.overview': 'Overview',
    'tools.label': 'Tool groups',
    'tools.files': 'Files',
    'tools.image': 'Image',
    'tools.animation': 'Animation',
    'tools.video': 'Video',
    'tools.sound': 'Sound',
    'tools.utilities': 'Utilities',
    'iceample.fig.langues': 'Choosing the interface language',
    'iceample.fig.langues.alt': 'Language selection screen in Iceample, offering twelve languages',
    'iceample.fig.themes': 'Theme presets',
    'iceample.fig.themes.alt': 'Ten theme presets in Iceample: Iceample, Arctic, Midnight, Nebula, Ember, Crimson, Aurora, Gold, Neon and Mono',
    'iceample.fig.reglages': 'Every module can be customized',
    'iceample.fig.reglages.alt': 'Iceample appearance settings: font, window corner radius and about fifteen editable colors',
    'iceample.fig.partage': 'Sharing custom theme presets',
    'iceample.fig.partage.alt': 'Export and Import buttons in Iceample',
    'iceample.fig.menu': 'Main menu',
    'iceample.fig.affichage': 'Adjustable display',
    'iceample.fig.affichage.alt': 'Iceample display settings: frame rate limit, splash screen, quick dock, window bounce, tooltips, zoom, opacity, reduced motion, focus mode and window glow',
    'iceample.fig.disposition': 'Layout',
    'iceample.fig.barre': 'Customizable taskbar',
    'iceample.fig.barre.alt': 'Iceample taskbar, with nine tool buttons',
    'iceample.fig.disposition.alt': 'Saving a layout in Iceample: a field for its name and a Save button',
    'iceample.fig.menu1.alt': 'Iceample main menu: Files, Image, Animation, Video, Sound, Utilities and Settings',
    'iceample.fig.menu2.alt': 'Files submenu: Search, Import, Library, Recents, Metadata and Converter',
    'iceample.fig.menu3.alt': 'Image submenu: 3D, Effects, Palettes, Moodboard, RAW photo, Image editor and Pattern Generator',
    'iceample.fig.menu4.alt': 'Sound submenu: Mixer, Delay, Player, Mic track, Sequencer, Metronome, Audio track, Sound editor, Virtual piano and Master Equalizer',
    'iceample.short': 'A wide variety of tools, from audio design to image editing and file management. <span translate="no">Iceample</span> gives you creative freedom through its ease of use, while letting you customize your workspace to the fullest.',
    'nadirheim.short': 'A <span translate="no">Minecraft</span> mod blending exploration, lore and tech in search of a world forgotten by time. Its core mechanic is alchemy, a middle ground between the magic and tech mods that already exist.'
  };
  // Nom des pages dans le titre de l'onglet du navigateur
  const TITLES_EN = {
    'Projets': 'Projects', 'Médias': 'Media', 'À propos': 'About', 'Compétences': 'Skills',
    'Fichiers': 'Files', 'Vidéo': 'Video', 'Son': 'Sound', 'Utilitaires': 'Utilities'
  };
  // Libellés des boutons, lus par les lecteurs d'écran
  const LABELS = {
    fr: { 'menu.open': 'Ouvrir le menu', 'menu.close': 'Fermer le menu' },
    en: { 'menu.open': 'Open menu', 'menu.close': 'Close menu' }
  };

  function stored(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function store(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* le choix ne sera pas retenu */ }
  }

  let lang = stored('lang') === 'en' ? 'en' : 'fr';
  const frenchTitle = document.title;

  // ---------- Apparition au scroll ----------
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  // ---------- Menu déroulant ----------
  // Un seul menu ouvert à la fois ; un clic ailleurs ou la touche Échap les referme.
  const menus = Array.prototype.slice.call(document.querySelectorAll('.menu'));

  function setMenu(menu, open) {
    const btn = menu.querySelector('.menu-btn');
    if (!btn) return;
    menu.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', LABELS[lang][(btn.dataset.label || 'menu') + (open ? '.close' : '.open')]);
  }

  menus.forEach(function (menu) {
    const btn = menu.querySelector('.menu-btn');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const open = !menu.classList.contains('open');
      menus.forEach(function (m) { setMenu(m, m === menu && open); });
    });
  });
  document.addEventListener('click', function (e) {
    menus.forEach(function (m) { if (!m.contains(e.target)) setMenu(m, false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') menus.forEach(function (m) { setMenu(m, false); });
  });

  // ---------- Langue ----------
  function applyLang(next) {
    lang = next;
    root.setAttribute('lang', lang);

    // Textes
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      if (el.dataset.fr === undefined) el.dataset.fr = el.innerHTML;        // on retient le français d'origine
      const en = EN[el.dataset.i18n];
      el.innerHTML = lang === 'en' && en !== undefined ? en : el.dataset.fr;
    });

    // Attributs (infobulles, libellés) : data-i18n-attr="attribut:clé;attribut:clé"
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.dataset.i18nAttr.split(';').forEach(function (pair) {
        const parts = pair.split(':');
        const attr = parts[0].trim(), key = (parts[1] || '').trim();
        const memo = 'fr' + attr.replace(/[^a-z]/g, '');
        if (el.dataset[memo] === undefined) el.dataset[memo] = el.getAttribute(attr) || '';
        const en = EN[key];
        el.setAttribute(attr, lang === 'en' && en !== undefined ? en : el.dataset[memo]);
      });
    });

    // Titre de l'onglet : « Projets — Nom » devient « Projects — Nom »
    const parts = frenchTitle.split(' — ');
    if (lang === 'en' && TITLES_EN[parts[0]]) parts[0] = TITLES_EN[parts[0]];
    document.title = parts.join(' — ');

    document.querySelectorAll('[data-lang]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    });
    menus.forEach(function (m) { setMenu(m, m.classList.contains('open')); });
    // Les légendes changent de longueur : les blocs d'images doivent se replacer
    document.dispatchEvent(new CustomEvent('langchange'));
  }

  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () {
      store('lang', b.dataset.lang);
      applyLang(b.dataset.lang);
    });
  });
  applyLang(lang);

  // ---------- Thème ----------
  function applyTheme(theme) {
    if (theme === 'light') root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');
    document.querySelectorAll('[data-theme-set]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.themeSet === theme));
    });
    // Prévient la scène de l'accueil, qui doit redessiner ses symboles dans les bonnes couleurs
    document.dispatchEvent(new CustomEvent('themechange'));
  }

  document.querySelectorAll('[data-theme-set]').forEach(function (b) {
    b.addEventListener('click', function () {
      store('theme', b.dataset.themeSet);
      applyTheme(b.dataset.themeSet);
    });
  });
  applyTheme(stored('theme') === 'light' ? 'light' : 'dark');

  // ---------- Agencement des blocs d'images ----------
  // Dans une grille d'images (.media-grid), les blocs se rangent en colonnes, chacun à
  // l'endroit libre le plus haut, pour laisser le moins de vide possible. Le nombre de
  // colonnes dépend de la largeur de l'écran.
  // L'ordre des blocs n'est pas imposé : on compare tous les ordres, on garde les
  // meilleurs et on en tire un au hasard. La disposition change donc d'une visite à l'autre.
  // Un bloc marqué data-flex peut se présenter en large (deux colonnes, ses captures côte
  // à côte) ou en hauteur (une colonne, ses captures l'une sous l'autre) : on retient la
  // forme qui comble le mieux l'espace.
  // Un bloc marqué data-fit garde la largeur de son image au lieu de remplir sa colonne.
  // Sans JavaScript, la grille prévue dans style.css reste en place.
  const COL_MIN = 340;                 // largeur minimale d'une colonne, comme dans style.css
  const COL_GAP = 28;                  // écart entre les blocs (1.75rem)
  const TRIES = 3000;                  // au-delà de 8 blocs, on teste ce nombre d'ordres au hasard

  function shuffled(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function permutations(list) {
    if (list.length < 2) return [list];
    const out = [];
    list.forEach(function (item, i) {
      permutations(list.slice(0, i).concat(list.slice(i + 1))).forEach(function (rest) {
        out.push([item].concat(rest));
      });
    });
    return out;
  }

  function arrange(grid, memo) {
    const items = Array.prototype.filter.call(grid.children, function (el) { return el.classList.contains('media'); });
    const width = Math.floor(grid.clientWidth);
    if (!items.length || width < 200) return;                    // page pas encore affichée
    grid.classList.add('is-arranged');

    const cols = Math.max(1, Math.floor((width + COL_GAP) / (COL_MIN + COL_GAP)));
    const colW = Math.floor((width - (cols - 1) * COL_GAP) / cols);
    function spanWidth(span) { return span * colW + (span - 1) * COL_GAP; }
    // Largeur d'un bloc : celle de ses colonnes. Exception : un bloc « ajusté » (data-fit)
    // se resserre autour de son image, sans jamais dépasser sa colonne.
    function setWidth(el, span) {
      if (el.hasAttribute('data-fit')) {
        el.style.width = 'max-content';
        el.style.maxWidth = spanWidth(span) + 'px';
      } else {
        el.style.width = spanWidth(span) + 'px';
      }
    }

    // Hauteur de chaque bloc, dans chacune des formes qu'il peut prendre
    const forms = items.map(function (el) {
      const spans = el.hasAttribute('data-flex') && cols >= 2 ? [1, 2] : [1];
      return spans.map(function (span) {
        el.classList.toggle('is-wide', span === 2);
        setWidth(el, span);
        return { span: span, height: Math.ceil(el.getBoundingClientRect().height) };
      });
    });

    // Pose les blocs dans un ordre donné et mesure le vide laissé
    function place(order, choice) {
      const tops = [];
      for (let c = 0; c < cols; c++) tops.push(0);
      const pos = [];
      let empty = 0;
      order.forEach(function (i) {
        const f = forms[i][choice[i]];
        let bestX = 0, bestY = Infinity;
        for (let x = 0; x + f.span <= cols; x++) {
          let y = 0;
          for (let c = x; c < x + f.span; c++) y = Math.max(y, tops[c]);
          if (y < bestY) { bestY = y; bestX = x; }
        }
        for (let c = bestX; c < bestX + f.span; c++) {
          empty += bestY - tops[c];                               // trou laissé sous un bloc large
          tops[c] = bestY + f.height + COL_GAP;
        }
        pos[i] = { x: bestX, y: bestY, form: choice[i], span: f.span };
      });
      const bottom = Math.max.apply(null, tops);
      tops.forEach(function (t) { empty += bottom - t; });        // bas des colonnes plus courtes
      return { pos: pos, height: bottom - COL_GAP, empty: empty };
    }

    // On garde l'agencement déjà tiré tant que le nombre de colonnes et de blocs ne change pas
    const key = cols + '/' + items.length;
    if (memo.key !== key) {
      const indices = items.map(function (el, i) { return i; });
      const orders = items.length <= 8 ? permutations(indices)
        : Array.apply(null, { length: TRIES }).map(function () { return shuffled(indices); });
      // Toutes les combinaisons de formes (large ou en hauteur) des blocs qui en ont deux
      let choices = [[]];
      forms.forEach(function (f) {
        const next = [];
        choices.forEach(function (c) { f.forEach(function (form, k) { next.push(c.concat(k)); }); });
        choices = next;
      });
      const results = [];
      orders.forEach(function (order) {
        choices.forEach(function (choice) {
          const r = place(order, choice);
          results.push({ order: order, choice: choice, empty: r.empty });
        });
      });
      const best = Math.min.apply(null, results.map(function (r) { return r.empty; }));
      // Seuls les agencements aussi bons que le meilleur (à quelques pixels près) restent candidats.
      // Il y en a presque toujours plusieurs, par exemple en miroir : c'est ce qui varie la disposition.
      const good = results.filter(function (r) { return r.empty <= best + 40; });
      const pick = good[Math.floor(Math.random() * good.length)];
      memo.key = key;
      memo.order = pick.order;
      memo.choice = pick.choice;
    }

    const result = place(memo.order, memo.choice);
    items.forEach(function (el, i) {
      const p = result.pos[i];
      el.classList.toggle('is-wide', p.span === 2);
      setWidth(el, p.span);
      el.style.left = (p.x * (colW + COL_GAP)) + 'px';
      el.style.top = p.y + 'px';
    });
    grid.style.height = result.height + 'px';
  }

  Array.prototype.forEach.call(document.querySelectorAll('.media-grid'), function (grid) {
    const memo = {};
    function run() { arrange(grid, memo); }
    // On attend que les images aient leur taille avant le premier rangement
    const waits = Array.prototype.map.call(grid.querySelectorAll('img'), function (img) {
      return img.complete ? null : new Promise(function (done) {
        img.addEventListener('load', done);
        img.addEventListener('error', done);
      });
    });
    Promise.all(waits).then(function () {
      run();
      if ('ResizeObserver' in window) {
        let seen = grid.clientWidth;
        new ResizeObserver(function () {
          if (grid.clientWidth !== seen) { seen = grid.clientWidth; run(); }
        }).observe(grid);
      } else {
        window.addEventListener('resize', run);
      }
      document.addEventListener('langchange', run);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
    });
  });

  // ---------- Année ----------
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
