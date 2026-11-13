/* =========================================================
   PORTFOLIO — Script
   - Animations d'apparition au scroll
   - Menu déroulant (pages et options d'affichage)
   - Langue : français ou anglais
   - Thème : sombre ou clair
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
    'label.site': 'Website',
    'label.email': 'Email',
    'label.installer': 'Installer (GitHub)',
    'iceample.sub': 'Multi-purpose software and web app',
    'iceample.short': 'A wide variety of tools, from audio design to image editing and file management. <span translate="no">Iceample</span> gives you creative freedom through its ease of use, while letting you customize your workspace to the fullest.',
    'nadirheim.short': 'A <span translate="no">Minecraft</span> mod blending exploration, lore and tech in search of a world forgotten by time. Its core mechanic is alchemy, a middle ground between the magic and tech mods that already exist.'
  };
  // Nom des pages dans le titre de l'onglet du navigateur
  const TITLES_EN = { 'Projets': 'Projects', 'Médias': 'Media', 'À propos': 'About', 'Compétences': 'Skills' };
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

  // ---------- Année ----------
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
