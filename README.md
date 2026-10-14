# Blue Ember

Site vitrine de l'agence Blue Ember (marketing, vidéo et tech). Astro 7 en sortie statique, GSAP, Lenis, et un effet signature en WebGL2 : « la braise qui se révèle ».

Tous les textes, images, vidéos, logos clients, portraits et coordonnées sont des **placeholders** centralisés : voir [PLACEHOLDERS.md](PLACEHOLDERS.md) pour la liste complète et le format attendu de chaque élément.

## Démarrer

Prérequis : Node 22.12 ou plus récent.

```bash
npm install
cp .env.example .env     # puis renseigner les variables (toutes facultatives en local)
npm run dev              # http://localhost:4321
```

| Script | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build statique dans `dist/`, puis avertissement s'il reste des placeholders |
| `npm run preview` | Sert le build local |
| `npm run lint` | ESLint (TypeScript, Astro) |
| `npm run check` | `astro check` (types TypeScript strict) |
| `npm run placeholders:check` | Scanne le code et régénère `PLACEHOLDERS.md` |
| `npm run placeholders:generate` | Régénère les images placeholders (SVG) et les images Open Graph |
| `npm run brand:generate` | Régénère le grain, le fragment placeholder et le favicon (SVG + PNG 32, 180, 512) |
| `npm run contrast:check` | Contrastes WCAG de la palette et de la braise, y compris à son maximum || `npm run seo:check` | Vérifie le HTML construit (titres, canonical, Open Graph, JSON-LD, sitemap) |
| `npm run fonts:copy` | Recopie les deux polices woff2 depuis Fontsource dans `public/fonts` |

Documents de travail : `CONTENU.md` rassemble tous les textes du site, page par page, à compléter (à la main, il n'est pas régénéré) ; `PLACEHOLDERS.md` liste les placeholders et les images à fournir (généré).

## Arborescence

```
src/
  config/        site.ts (nom, coordonnées, mentions légales), ember.ts (réglages de la braise), faq.ts
  content/       projets, services, equipe, temoignages, clients (Markdown), journal (vide)
  content.config.ts   schémas Zod des collections
  components/    Logo, Button, Nav, Footer, Stage (fond fixe), Cursor, Curtain, Marquee, ProjectCard...
  layouts/       BaseLayout (SEO, ClientRouter, scène fixe), LegalLayout
  pages/         index, services, realisations/, agence, contact, mentions-legales, confidentialite, 404
  styles/        tokens.css (design tokens), fonts.css, base.css
  scripts/       main.ts, motion/ (Lenis, apparitions, curseur, bandes, formulaire...), ember/ (WebGL)
scripts/         générateurs et vérifications (placeholders, marque, contraste, SEO)
public/          fonts, brand, scene, textures, placeholders, og
```

## Remplacer les placeholders

**Textes.** Modifier la valeur dans le fichier indiqué par `PLACEHOLDERS.md` : coordonnées et mentions légales dans `src/config/site.ts`, contenus dans `src/content/**/*.md`, textes de page dans `src/pages/*.astro`.

**Images.** Déposer le fichier réel dans `public/` (par exemple `public/images/projets/`), puis changer le chemin dans le front-matter du contenu. Les formats attendus sont dans `PLACEHOLDERS.md` (4:5, 16:9, 1:1, poids maximum).

| Élément | Où |
|---|---|
| Logo | Déposer `public/brand/logo.svg` (version ivoire) et, si besoin, `logo-light.svg` : le composant `<Logo />` les utilise à la place du texte |
| Favicon | `public/brand/` (SVG + PNG). Régénérable avec `npm run brand:generate` |
| Fragment (flamme en bas-relief), désactivé pour l'instant (`fragmentEnabled` dans `src/config/ember.ts`) | Déposer `public/scene/fragment-flamme.webp` (rendu Blender, transparence, ratio 3:4, environ 150 Ko, même cadrage que le SVG) : il remplace le SVG automatiquement, y compris pour le liseré lumineux |
| Texture de fissures (optionnelle) | `public/textures/ember-cracks.webp` (512 px, moins de 150 Ko) : remplace les fissures procédurales ; les morceaux de bois et de charbon sont alors remplacés par une croûte unie |
| Images Open Graph | Remplacer `public/og/<page>.png` (même nom, 1200 x 630) |
| Vidéo du hero | `src/config/site.ts` : `heroVideo.enabled`, `src` et `mobileSrc` |
| Vidéo d'un projet | Champ `video` du fichier du projet (`src`, `poster`, `mobileSrc`) |
| Polices | `npm run fonts:copy` (Bodoni Moda et Instrument Sans, sous-ensemble latin) |

Après avoir remplacé les images Open Graph, `npm run placeholders:check` les retire de la liste.

## Configuration

Variables d'environnement (`.env`, modèle dans `.env.example`) :

- `PUBLIC_SITE_URL` : URL publique (canonical, sitemap, Open Graph).
- `PUBLIC_FORM_ENDPOINT` : reçoit le formulaire de contact et la newsletter en JSON (Formspree, Getform, Netlify, API maison). Vide : succès simulé en développement, échec propre en production.
- `PUBLIC_BOOKING_URL` : lien Calendly ou équivalent. Vide : le bouton « Réserver un créneau » est masqué.
- `PUBLIC_ANALYTICS_DOMAIN` : mesure d'audience Plausible, sans cookie. Vide : désactivée. Aucun bandeau cookies n'est nécessaire en V1.

## La braise

Principe : au repos la scène est calme (fond Ambiance charbon et fragment). Quand la souris bouge, la suie s'essuie et laisse voir un tas de charbon et de bois brûlé : éclats de charbon mats, bûches aux fibres et à l'écorce craquelée, éclairés par le haut à gauche, avec de fines fissures rouge sombre entre les morceaux (orange seulement si on monte « intensité braise » dans `?debug`) et un grain de suie sur les bords de la zone essuyée. Le geste dégage de la chaleur qui éclaire la matière : plus on bouge vite, plus elle apparaît, et les fissures ne rougeoient qu'au plus près du curseur. La traînée refroidit (rouge, rouge sombre, éteint) et la suie revient en 1 à 2 secondes. Un clic « souffle » sur la braise : une onde ravive les fissures et lâche quelques étincelles.

**Niveaux** (choisis au démarrage, dans cet ordre) :

1. `prefers-reduced-motion` ou économiseur de données : scène statique (fond seulement, plus le fragment s'il est activé).
2. WebGL2 : buffer de traînée en ping-pong à 1/4 de résolution (R16F, repli RGBA8), shader procédural (Voronoi pour les morceaux, leurs éclats et les fissures ; bruit pour les fibres du bois et le grain de suie), étincelles en un seul appel de dessin.
3. Pas de WebGL : canvas 2D avec une texture pré-générée du même tas de morceaux (sans refroidissement progressif des fissures).
4. Si le débit moyen reste sous 45 fps pendant 2 s : résolution de rendu abaissée à 0,35x, puis passage au canvas 2D.

La boucle de rendu s'arrête quand la traînée est éteinte, sans étincelle et sans mouvement depuis 2,5 s : au repos, le GPU ne travaille pas.

**Tactile.** Le doigt remplace la souris pendant `touchmove` (écouteurs passifs). Sans contact, dans le hero uniquement, un point dérive lentement (courbe de Lissajous, intensité 0,3). Pour garder une page d'accueil rapide sur mobile, l'effet démarre au premier toucher ou défilement sur les appareils tactiles, et au repos du navigateur sur ordinateur.

**Régler l'effet en direct.** Ajouter `?debug` à l'URL : un panneau (lil-gui, chargé uniquement dans ce cas) règle le pinceau, la matière, les étincelles, le souffle, la lisibilité, le liseré et le rendu. « Copier les valeurs (JSON) » donne les réglages à reporter dans `emberDefaults` de `src/config/ember.ts`. Le panneau permet aussi de forcer un niveau et d'afficher les zones de lisibilité. En console, `window.__ember` expose l'API.

**Réglages par page.** `src/config/ember.ts` : une entrée par type de page (intensité, rayon du pinceau, position et taille du fragment sur ordinateur et mobile). Intensité par section : attribut `data-ember-intensity="0.6"` sur la section.

**Lisibilité.**

- `data-ember="calm"` : texte long, formulaire, étude de cas. L'effet y est réduit de 70 % (ou de 100 % avec `data-ember-calm="1"`, comme pour le formulaire de contact) avec un fondu de 40 px, et la chaleur est plafonnée pour que les fissures restent rouge sombre derrière le texte.
- `data-ember="soft"` : titres d'affichage. Pas de réduction, mais les fissures ne dépassent jamais le rouge (jamais d'ambre ni de blanc chaud derrière du texte ivoire).
- Les plafonds se règlent dans `emberDefaults.zones` ; `npm run contrast:check` vérifie que le texte reste lisible à 4,5:1 ou plus, y compris sur l'état révélé maximal.

Budget : le code de l'effet pèse environ 11 Ko gzip (limite 30 Ko), chargé à la demande ; le panneau de debug est un fichier séparé de 9 Ko, chargé seulement avec `?debug`.

## Design system

Les valeurs exactes de la marque sont dans `src/styles/tokens.css` (couleurs, espacements, arrondis, ombres, courbes, durées, tailles de texte en `clamp()`). Le thème clair est défini (`[data-theme='light']`) mais non utilisé en V1. Les polices sont auto-hébergées, sans appel à Google Fonts.

## Qualité mesurée

Lighthouse sur le build local (`npm run build && npm run preview`), émulation mobile par défaut, Chrome sans GPU (rendu logiciel) :

| Page | Perf. | Access. | Bonnes prat. | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| Accueil | 99 | 100 | 100 | 100 | 2,06 s | 12 ms | 0,008 |
| Services | 99 | 100 | 100 | 100 | 2,06 s | 11 ms | 0,003 |
| Réalisations | 99 | 100 | 100 | 100 | 2,05 s | 1 ms | 0 |
| Page projet | 99 | 100 | 100 | 100 | 2,06 s | 39 ms | 0 |
| Agence | 99 | 100 | 100 | 100 | 2,09 s | 39 ms | 0,003 |
| Contact | 99 | 100 | 100 | 100 | 1,97 s | 9 ms | 0,004 |
| Mentions légales, Confidentialité | 99 | 100 | 100 | 100 | 1,97 s | 6 à 7 ms | 0 |

Avec le préréglage bureau, l'accueil et les réalisations obtiennent 100 partout (LCP 0,5 s). Poids de l'accueil : environ 210 Ko, hors médias de projet. Navigation clavier complète (lien d'évitement, anneau de focus de 2 px décalé de 3 px), bandes défilantes avec bouton Pause (WCAG 2.2.2) et arrêt au focus clavier, `prefers-reduced-motion` respecté partout.

## Déploiement

Sortie statique, aucun serveur nécessaire.

- **Vercel** : importer le dépôt, c'est tout. `vercel.json` fournit les URL propres et les en-têtes de cache et de sécurité.
- **Netlify** : `netlify.toml` fournit la commande de build (`npm run build`), le dossier publié (`dist`) et les mêmes en-têtes.

Renseigner les variables d'environnement dans l'interface de l'hébergeur. `dist/404.html` est servi automatiquement pour les adresses inconnues.

## Brancher un CMS headless plus tard

Les contenus sont des fichiers Markdown décrits par des schémas Zod dans `src/content.config.ts`. Pour passer à un CMS (Sanity, Storyblok, Contentful, Decap...), remplacer le `loader: glob(...)` d'une collection par un loader personnalisé qui lit l'API du CMS et renvoie des entrées conformes au même schéma : les pages et les composants n'ont pas à changer. La collection `journal` existe déjà (vide) pour un futur blog ; il suffira de remplacer son loader vide par `glob({ pattern: '**/*.md', base: './src/content/journal' })` et de créer les pages.

## Décisions de conception et écarts au brief

- **Grain.** Placé au-dessus de la braise et du fragment (`.stage::after` dans `src/components/Stage.astro`), comme au 7.5, et non dans `.ambiance` comme au 6.1 : sinon la zone révélée perdait le grain du fond et on voyait une rupture autour du curseur, surtout sur la lueur bleue.
- **Flèches.** SVG en ligne : le caractère « → » n'est pas dans le sous-ensemble latin des polices.
- **Logo de la navigation.** Sans « agency » : le logo mesure 26 px et la règle du 5 retire « agency » sous 40 px de hauteur de bloc.
- **Lenis.** `smoothTouch` n'existe plus dans la version actuelle : `syncTouch: false` (valeur par défaut) donne le même comportement, défilement tactile natif.
- **Transition de page.** Rideau de 650 ms à l'entrée et 450 ms à la sortie, pour rester sous 1,2 s une fois la page échangée (le brief indique 700 ms pour l'entrée).
- **Braise rouge au lieu de bleue (7.1, 7.2, 7.3).** Décision du porteur du projet : le fond charbon se révèle comme une suie essuyée sur un charbon ardent rouge et chaud, très discret. La braise n'est plus bleu titane, et la matière révélée est un tas de morceaux de charbon et de bois brûlé (demande du porteur du projet), pas une croûte unie. Le bleu reste dans la lueur Ambiance en haut à gauche, les focus et les liens ; le liseré du fragment et les étincelles passent au chaud ; le liseré incandescent du rideau de transition (6.9) reste bleu.
- **Lueur bleue réduite (6.1).** Décision du porteur du projet : la lueur titane en haut à gauche de l'Ambiance est à 25 % de la valeur du design system et un peu moins large, parce qu'elle concurrençait la braise. Un seul réglage : `--glow-cool` dans `src/styles/tokens.css` (1 = valeur d'origine, 0 = pas de lueur bleue), repris par le menu mobile, par `npm run contrast:check` et par la braise : elle laisse les deux lueurs visibles à travers les morceaux (`ambientGlow` dans `src/scripts/ember/shaders.ts`, à garder en phase avec `Stage.astro`), pour qu'il n'y ait pas de trou sombre ni de rupture dans les coins. Les sections alternées et le pied de page (titane-nuit) et le liseré du rideau de transition restent bleus.
- **Texte sous la braise.** Les plafonds de chaleur (voir « Lisibilité ») gardent 4,5:1 ou plus pour les textes courants (ivoire, titane-pale, or) dans les zones calmes, et 3:1 ou plus pour les grands titres en ivoire. `npm run contrast:check` le vérifie.
- **Lueur du curseur.** Très faible (14 % de rouge) et limitée au pic du pinceau : l'effet doit rester une suie qu'on essuie, pas un projecteur.
- **Hero des études de cas.** L'image est légèrement translucide (variable `--hero-media-opacity`, 0,88) pour que la braise reste perceptible à l'intensité 0,4 demandée.
- **Fragment désactivé (7.3).** Décision du porteur du projet : la flamme sculptée en bas à gauche est retirée (`fragmentEnabled = false` dans `src/config/ember.ts`). Plus d'élément, plus de liseré lumineux, et les colonnes de texte reprennent la marge normale de la page. Pour la remettre : `true` (placeholder SVG, puis rendu Blender dans `public/scene/fragment-flamme.webp`).
- **Marges des fragments.** Seulement si le fragment est activé : les colonnes de texte des pages qui ont un fragment à gauche (accueil, contact, services) commencent à sa droite, comme demandé au 7.8.
- **Mesure d'audience.** Plausible, chargé seulement si `PUBLIC_ANALYTICS_DOMAIN` est renseigné.

## Hors périmètre V1

Blog (structure vide prévue), version anglaise, CMS, thème clair.
