/* =========================================================
   PORTFOLIO — Préférences du visiteur
   Ce petit fichier est chargé tout en haut de chaque page.
   Il applique le thème (sombre ou clair) et la langue choisis
   lors d'une visite précédente, avant que la page s'affiche,
   pour éviter un éclair de mauvais thème.
   Les choix eux-mêmes se font en bas du menu (script.js).
   ========================================================= */

(function () {
  try {
    var root = document.documentElement;
    if (localStorage.getItem('theme') === 'light') root.setAttribute('data-theme', 'light');
    if (localStorage.getItem('lang') === 'en') root.setAttribute('lang', 'en');
  } catch (e) { /* stockage indisponible : on garde le sombre et le français */ }
})();
