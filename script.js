/* =========================================================
   PORTFOLIO — Script
   - Animations d'apparition au scroll
   - Menu déroulant
   - Année automatique dans le pied de page
   ========================================================= */

(function () {
  'use strict';

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
  const menu = document.querySelector('.menu');
  const menuBtn = document.getElementById('menu-btn');

  if (menu && menuBtn) {
    function setMenu(open) {
      menu.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    }
    menuBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      setMenu(!menu.classList.contains('open'));
    });
    document.addEventListener('click', function (e) {
      if (!menu.contains(e.target)) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
  }

  // ---------- Année ----------
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
