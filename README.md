# Mon portfolio

Site vitrine personnel en HTML / CSS / JavaScript, sans dépendances ni outil de build.
Il suffit d'ouvrir `index.html` dans un navigateur.

## Structure

```
index.html        → page d'accueil
apropos.html      → page À propos
competences.html  → page Compétences
projets.html      → page Projets (deux sous-catégories)
iceample.html     → page détaillée du projet Iceample
nadirheim.html    → page détaillée du projet Nadirheim
medias.html       → page Médias
contact.html      → page Contact
style.css         → apparence (couleurs, polices, cadres)
script.js         → menu déroulant, animations
ascii.js          → scène animée de la page d'accueil (étoile en symboles)
assets/           → images (favicon, captures de projets)
```

## Direction artistique

Sobre, sur fond noir grisé uni :

- titres, logo et libellés dans une police en pixels façon Minecraft, texte courant en IBM Plex Sans ;
- cadres fins à angles droits ;
- croix de retour dessinée en pixels.

## Personnaliser

1. **Textes** : le nom « Kyliann Chapel, ghgghhhghggh » et les initiales « KC » du logo sont écrits dans chaque
   page HTML ; changez-les aux mêmes endroits si besoin, puis remplissez les
   emplacements vides signalés par des commentaires `<!-- ... -->`.
2. **Projets** : dans `projets.html`, écrivez le petit paragraphe de chaque sous-catégorie à l'endroit
   signalé ; la description longue et les images vont dans `iceample.html` et `nadirheim.html`.
3. **Médias / Compétences** : dans `medias.html` et `competences.html`, un bloc modèle
   est fourni en commentaire ; copiez-le autant de fois que nécessaire.
4. **Couleurs** : modifiez les variables en haut de `style.css` (`--bg` pour le fond,
   `--accent` pour l'orange du survol et des liens, etc.).
5. **Polices** : la police en pixels est une recréation libre de celle de Minecraft
   (projet de fan d'Idrees Hassan, licence SIL OFL 1.1, sans fichier du jeu). Elle est
   déclarée tout en haut de `style.css` et reste nette aux deux tailles prévues,
   `--px-small` et `--px-large`. Le texte courant vient de Google Fonts.
6. **Contact** : dans `contact.html`, la liste contient le lien GitHub ; un modèle en
   commentaire montre comment ajouter un autre lien (e-mail, réseau…).
7. **Favicon** : remplacez `assets/favicon.svg` (initiales « KC » dessinées en pixels, en orange).

Après une modification de `style.css` ou `script.js`, augmentez le numéro `?v=` dans les
liens des pages HTML pour que le navigateur recharge bien le fichier.

## Mettre en ligne (gratuit)

### Option A — Netlify (le plus simple)
1. Allez sur https://app.netlify.com/drop
2. Glissez-déposez le dossier complet du site.
3. Votre site est en ligne avec une adresse `xxx.netlify.app` (modifiable).

### Option B — GitHub Pages
1. Créez un dépôt sur GitHub et envoyez-y les fichiers.
2. Dans *Settings → Pages*, choisissez la branche `main` et le dossier `/ (root)`.
3. Le site sera disponible sur `https://votre-pseudo.github.io/nom-du-depot/`.

### Nom de domaine
Vous pouvez ensuite relier un domaine personnalisé (ex. `prenom-nom.fr`) depuis
les réglages de Netlify ou de GitHub Pages.
