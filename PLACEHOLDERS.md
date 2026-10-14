# Placeholders restants

Fichier généré par `npm run placeholders:check`. Ne pas éditer à la main.

- Textes entre crochets : 208 occurrences dans 26 fichiers (163 uniques par fichier)
- Images placeholders référencées : 69
- Assets de marque à fournir : 4

Remplacer un texte : modifier la valeur dans le fichier indiqué. Remplacer une image : déposer le fichier réel dans `public/`
(par exemple `public/images/`), puis changer le chemin dans le front-matter du contenu concerné.

## Assets de marque et de scène

| Fichier | Format attendu |
|---|---|
| `public/brand/logo.svg` | Logo SVG (version ivoire pour fond sombre). Optionnel : logo-light.svg (charbon). Remplace le logo typographique. |
| `public/scene/fragment-flamme.webp` | Rendu 3D (Blender) de la flamme en bas-relief, WebP avec transparence, ratio 3:4 (ex. 1200 x 1600 px), ≈ 150 Ko, même cadrage que le SVG |
| `public/textures/ember-cracks.webp` | (Optionnel) texture de fissures 512 px, moins de 150 Ko : remplace la texture procédurale de la braise |
| `public/og/{accueil, services, realisations, projet, agence, contact, mentions-legales, confidentialite, 404}.png` | 1200 x 630 px, PNG ou JPG, 300 Ko max. Placeholders générés : les remplacer par les visuels réels (même nom de fichier) |

## Variables d'environnement (.env)

| Variable | Rôle |
|---|---|
| `PUBLIC_SITE_URL` | URL publique (canonical, sitemap, Open Graph) |
| `PUBLIC_FORM_ENDPOINT` | Endpoint du formulaire de contact et de la newsletter |
| `PUBLIC_BOOKING_URL` | Lien Calendly ou équivalent (vide : bouton masqué) |
| `PUBLIC_ANALYTICS_DOMAIN` | Domaine Plausible (vide : mesure désactivée) |

## Images placeholders

| Placeholder | Utilisé dans | Format du fichier réel |
|---|---|---|
| `public/placeholders/hero-video-poster-16x9.svg` (VIDÉO HERO · POSTER · 16:9) | `src/config/site.ts` | 2400 x 1350 px, WebP ou AVIF, 250 Ko max |
| `public/placeholders/client-01-160x48.svg` (LOGO CLIENT 01) | `src/content/clients/client-01.md` | SVG monochrome 160 x 48, 5 Ko max |
| `public/placeholders/client-02-160x48.svg` (LOGO CLIENT 02) | `src/content/clients/client-02.md` | SVG monochrome 160 x 48, 5 Ko max |
| `public/placeholders/client-03-160x48.svg` (LOGO CLIENT 03) | `src/content/clients/client-03.md` | SVG monochrome 160 x 48, 5 Ko max |
| `public/placeholders/client-04-160x48.svg` (LOGO CLIENT 04) | `src/content/clients/client-04.md` | SVG monochrome 160 x 48, 5 Ko max |
| `public/placeholders/client-05-160x48.svg` (LOGO CLIENT 05) | `src/content/clients/client-05.md` | SVG monochrome 160 x 48, 5 Ko max |
| `public/placeholders/client-06-160x48.svg` (LOGO CLIENT 06) | `src/content/clients/client-06.md` | SVG monochrome 160 x 48, 5 Ko max |
| `public/placeholders/client-07-160x48.svg` (LOGO CLIENT 07) | `src/content/clients/client-07.md` | SVG monochrome 160 x 48, 5 Ko max |
| `public/placeholders/client-08-160x48.svg` (LOGO CLIENT 08) | `src/content/clients/client-08.md` | SVG monochrome 160 x 48, 5 Ko max |
| `public/placeholders/equipe-01-portrait-4x5.svg` (ÉQUIPE 01 · PORTRAIT · 4:5) | `src/content/equipe/equipe-01.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/equipe-02-portrait-4x5.svg` (ÉQUIPE 02 · PORTRAIT · 4:5) | `src/content/equipe/equipe-02.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/equipe-03-portrait-4x5.svg` (ÉQUIPE 03 · PORTRAIT · 4:5) | `src/content/equipe/equipe-03.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/equipe-04-portrait-4x5.svg` (ÉQUIPE 04 · PORTRAIT · 4:5) | `src/content/equipe/equipe-04.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/projet-01-couverture-4x5.svg` (PROJET 01 · COUVERTURE · 4:5) | `src/content/projets/projet-01.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/projet-01-hero-16x9.svg` (PROJET 01 · HERO · 16:9) | `src/content/projets/projet-01.md` | 2400 x 1350 px, WebP ou AVIF, 250 Ko max |
| `public/placeholders/projet-01-solution-1-4x5.svg` (PROJET 01 · SOLUTION 1 · 4:5) | `src/content/projets/projet-01.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/projet-01-solution-2-4x5.svg` (PROJET 01 · SOLUTION 2 · 4:5) | `src/content/projets/projet-01.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/projet-01-galerie-1-16x9.svg` (PROJET 01 · GALERIE 1 · 16:9) | `src/content/projets/projet-01.md` | 2400 x 1350 px, WebP ou AVIF, 250 Ko max |
| `public/placeholders/projet-01-galerie-2-4x5.svg` (PROJET 01 · GALERIE 2 · 4:5) | `src/content/projets/projet-01.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/projet-01-galerie-3-16x9.svg` (PROJET 01 · GALERIE 3 · 16:9) | `src/content/projets/projet-01.md` | 2400 x 1350 px, WebP ou AVIF, 250 Ko max |
| `public/placeholders/projet-01-galerie-4-4x5.svg` (PROJET 01 · GALERIE 4 · 4:5) | `src/content/projets/projet-01.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/projet-02-couverture-4x5.svg` (PROJET 02 · COUVERTURE · 4:5) | `src/content/projets/projet-02.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/projet-02-hero-16x9.svg` (PROJET 02 · HERO · 16:9) | `src/content/projets/projet-02.md` | 2400 x 1350 px, WebP ou AVIF, 250 Ko max |
| `public/placeholders/projet-02-solution-1-4x5.svg` (PROJET 02 · SOLUTION 1 · 4:5) | `src/content/projets/projet-02.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/projet-02-solution-2-4x5.svg` (PROJET 02 · SOLUTION 2 · 4:5) | `src/content/projets/projet-02.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/projet-02-galerie-1-16x9.svg` (PROJET 02 · GALERIE 1 · 16:9) | `src/content/projets/projet-02.md` | 2400 x 1350 px, WebP ou AVIF, 250 Ko max |
| `public/placeholders/projet-02-galerie-2-4x5.svg` (PROJET 02 · GALERIE 2 · 4:5) | `src/content/projets/projet-02.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/projet-02-galerie-3-16x9.svg` (PROJET 02 · GALERIE 3 · 16:9) | `src/content/projets/projet-02.md` | 2400 x 1350 px, WebP ou AVIF, 250 Ko max |
| `public/placeholders/projet-02-galerie-4-4x5.svg` (PROJET 02 · GALERIE 4 · 4:5) | `src/content/projets/projet-02.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/projet-03-couverture-4x5.svg` (PROJET 03 · COUVERTURE · 4:5) | `src/content/projets/projet-03.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/projet-03-hero-16x9.svg` (PROJET 03 · HERO · 16:9) | `src/content/projets/projet-03.md` | 2400 x 1350 px, WebP ou AVIF, 250 Ko max |
| `public/placeholders/projet-03-solution-1-4x5.svg` (PROJET 03 · SOLUTION 1 · 4:5) | `src/content/projets/projet-03.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/projet-03-solution-2-4x5.svg` (PROJET 03 · SOLUTION 2 · 4:5) | `src/content/projets/projet-03.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/projet-03-galerie-1-16x9.svg` (PROJET 03 · GALERIE 1 · 16:9) | `src/content/projets/projet-03.md` | 2400 x 1350 px, WebP ou AVIF, 250 Ko max |
| `public/placeholders/projet-03-galerie-2-4x5.svg` (PROJET 03 · GALERIE 2 · 4:5) | `src/content/projets/projet-03.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/projet-03-galerie-3-16x9.svg` (PROJET 03 · GALERIE 3 · 16:9) | `src/content/projets/projet-03.md` | 2400 x 1350 px, WebP ou AVIF, 250 Ko max |
| `public/placeholders/projet-03-galerie-4-4x5.svg` (PROJET 03 · GALERIE 4 · 4:5) | `src/content/projets/projet-03.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/projet-04-couverture-4x5.svg` (PROJET 04 · COUVERTURE · 4:5) | `src/content/projets/projet-04.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/projet-04-hero-16x9.svg` (PROJET 04 · HERO · 16:9) | `src/content/projets/projet-04.md` | 2400 x 1350 px, WebP ou AVIF, 250 Ko max |
| `public/placeholders/projet-04-solution-1-4x5.svg` (PROJET 04 · SOLUTION 1 · 4:5) | `src/content/projets/projet-04.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/projet-04-solution-2-4x5.svg` (PROJET 04 · SOLUTION 2 · 4:5) | `src/content/projets/projet-04.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/projet-04-galerie-1-16x9.svg` (PROJET 04 · GALERIE 1 · 16:9) | `src/content/projets/projet-04.md` | 2400 x 1350 px, WebP ou AVIF, 250 Ko max |
| `public/placeholders/projet-04-galerie-2-4x5.svg` (PROJET 04 · GALERIE 2 · 4:5) | `src/content/projets/projet-04.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/projet-04-galerie-3-16x9.svg` (PROJET 04 · GALERIE 3 · 16:9) | `src/content/projets/projet-04.md` | 2400 x 1350 px, WebP ou AVIF, 250 Ko max |
| `public/placeholders/projet-04-galerie-4-4x5.svg` (PROJET 04 · GALERIE 4 · 4:5) | `src/content/projets/projet-04.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/projet-05-couverture-4x5.svg` (PROJET 05 · COUVERTURE · 4:5) | `src/content/projets/projet-05.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/projet-05-hero-16x9.svg` (PROJET 05 · HERO · 16:9) | `src/content/projets/projet-05.md` | 2400 x 1350 px, WebP ou AVIF, 250 Ko max |
| `public/placeholders/projet-05-solution-1-4x5.svg` (PROJET 05 · SOLUTION 1 · 4:5) | `src/content/projets/projet-05.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/projet-05-solution-2-4x5.svg` (PROJET 05 · SOLUTION 2 · 4:5) | `src/content/projets/projet-05.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/projet-05-galerie-1-16x9.svg` (PROJET 05 · GALERIE 1 · 16:9) | `src/content/projets/projet-05.md` | 2400 x 1350 px, WebP ou AVIF, 250 Ko max |
| `public/placeholders/projet-05-galerie-2-4x5.svg` (PROJET 05 · GALERIE 2 · 4:5) | `src/content/projets/projet-05.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/projet-05-galerie-3-16x9.svg` (PROJET 05 · GALERIE 3 · 16:9) | `src/content/projets/projet-05.md` | 2400 x 1350 px, WebP ou AVIF, 250 Ko max |
| `public/placeholders/projet-05-galerie-4-4x5.svg` (PROJET 05 · GALERIE 4 · 4:5) | `src/content/projets/projet-05.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/projet-06-couverture-4x5.svg` (PROJET 06 · COUVERTURE · 4:5) | `src/content/projets/projet-06.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/projet-06-hero-16x9.svg` (PROJET 06 · HERO · 16:9) | `src/content/projets/projet-06.md` | 2400 x 1350 px, WebP ou AVIF, 250 Ko max |
| `public/placeholders/projet-06-solution-1-4x5.svg` (PROJET 06 · SOLUTION 1 · 4:5) | `src/content/projets/projet-06.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/projet-06-solution-2-4x5.svg` (PROJET 06 · SOLUTION 2 · 4:5) | `src/content/projets/projet-06.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/projet-06-galerie-1-16x9.svg` (PROJET 06 · GALERIE 1 · 16:9) | `src/content/projets/projet-06.md` | 2400 x 1350 px, WebP ou AVIF, 250 Ko max |
| `public/placeholders/projet-06-galerie-2-4x5.svg` (PROJET 06 · GALERIE 2 · 4:5) | `src/content/projets/projet-06.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/projet-06-galerie-3-16x9.svg` (PROJET 06 · GALERIE 3 · 16:9) | `src/content/projets/projet-06.md` | 2400 x 1350 px, WebP ou AVIF, 250 Ko max |
| `public/placeholders/projet-06-galerie-4-4x5.svg` (PROJET 06 · GALERIE 4 · 4:5) | `src/content/projets/projet-06.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/service-03-4x5.svg` (SERVICE 03 · VISUEL · 4:5) | `src/content/services/reseaux-sociaux.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/service-04-4x5.svg` (SERVICE 04 · VISUEL · 4:5) | `src/content/services/site-tech.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/service-01-4x5.svg` (SERVICE 01 · VISUEL · 4:5) | `src/content/services/strategie.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/service-02-4x5.svg` (SERVICE 02 · VISUEL · 4:5) | `src/content/services/video-photo.md` | 1600 x 2000 px, WebP ou AVIF, 200 Ko max |
| `public/placeholders/temoignage-01-portrait-1x1.svg` (TÉMOIGNAGE 01 · PORTRAIT · 1:1) | `src/content/temoignages/temoignage-01.md` | 192 x 192 px, WebP, 15 Ko max |
| `public/placeholders/temoignage-02-portrait-1x1.svg` (TÉMOIGNAGE 02 · PORTRAIT · 1:1) | `src/content/temoignages/temoignage-02.md` | 192 x 192 px, WebP, 15 Ko max |
| `public/placeholders/temoignage-03-portrait-1x1.svg` (TÉMOIGNAGE 03 · PORTRAIT · 1:1) | `src/content/temoignages/temoignage-03.md` | 192 x 192 px, WebP, 15 Ko max |
| `public/placeholders/agence-bureaux-16x9.svg` (AGENCE · BUREAUX · 16:9) | `src/pages/agence.astro` | 2400 x 1350 px, WebP ou AVIF, 250 Ko max |

## Textes

### `src/components/ContactForm.astro`

| Ligne | Placeholder | Contenu attendu |
|---|---|---|
| 7 | `[< 5 k€]` | Fourchette de budget (libellé de la liste) |
| 8 | `[5 à 15 k€]` | Fourchette de budget (libellé de la liste) |
| 9 | `[15 à 40 k€]` | Fourchette de budget (libellé de la liste) |
| 10 | `[> 40 k€]` | Fourchette de budget (libellé de la liste) |
| 47 | `[À FOURNIR : texte du consentement RGPD]` | Texte à fournir (voir la description entre crochets) |

### `src/components/Newsletter.astro`

| Ligne | Placeholder | Contenu attendu |
|---|---|---|
| 26 | `[À FOURNIR : texte de consentement à la newsletter]` | Texte à fournir (voir la description entre crochets) |

### `src/config/faq.ts`

| Ligne | Placeholder | Contenu attendu |
|---|---|---|
| 4 | `[À FOURNIR : réponse sur les délais, 2 à 3 phrases]` | Texte à fournir (voir la description entre crochets) |
| 5 | `[À FOURNIR : réponse sur le budget, 2 à 3 phrases]` | Texte à fournir (voir la description entre crochets) |
| 7 | `[À FOURNIR : réponse sur la zone géographique, 2 à 3 phrases]` | Texte à fournir (voir la description entre crochets) |
| 8 | `[À FOURNIR : réponse sur la propriété des contenus, 2 à 3 phrases]` | Texte à fournir (voir la description entre crochets) |
| 9 | `[À FOURNIR : réponse sur le suivi après livraison, 2 à 3 phrases]` | Texte à fournir (voir la description entre crochets) |

### `src/config/site.ts`

| Ligne | Placeholder | Contenu attendu |
|---|---|---|
| 11 | `[VILLE]` | Nom de la ville de l'agence |
| 12 | `[EMAIL]` | Adresse e-mail de contact |
| 13 | `[TÉLÉPHONE]` | Numéro, format international (ex. +33 1 23 45 67 89) |
| 14 | `[ADRESSE]` | Adresse postale complète |
| 15 | `[DÉLAI]` | Durée de réponse (ex. 24 heures ouvrées) |
| 17 | `[INSTAGRAM]` | URL complète du profil (https://...) |
| 18 | `[LINKEDIN]` | URL complète du profil (https://...) |
| 44 | `[VIDEO-HERO]` | Vidéo MP4 H.264 de 6 à 12 s en boucle, 8 Mo max, + version mobile 3 Mo max |
| 53 | `[RAISON SOCIALE]` | Information légale exacte (Kbis) |
| 54 | `[FORME]` | Information légale exacte (Kbis) |
| 55 | `[CAPITAL]` | Information légale exacte (Kbis) |
| 56 | `[SIREN]` | Information légale exacte (Kbis) |
| 57 | `[ADRESSE]` | Adresse postale complète |
| 58 | `[DIRECTEUR DE PUBLICATION]` | Information légale exacte (Kbis) |
| 59 | `[HÉBERGEUR]` | Information légale exacte (Kbis) |
| 60 | `[EMAIL-DPO]` | Adresse e-mail du délégué à la protection des données |

### `src/content/equipe/equipe-01.md`

| Ligne | Placeholder | Contenu attendu |
|---|---|---|
| 2 | `[PRÉNOM NOM 01]` | Prénom et nom de la personne |
| 3 | `[FONCTION]` | Fonction |
| 6 | `[À FOURNIR : présentation du fondateur, 100 mots]` | Texte d'environ 100 mots |

### `src/content/equipe/equipe-02.md`

| Ligne | Placeholder | Contenu attendu |
|---|---|---|
| 2 | `[PRÉNOM NOM 02]` | Prénom et nom de la personne |
| 3 | `[FONCTION]` | Fonction |

### `src/content/equipe/equipe-03.md`

| Ligne | Placeholder | Contenu attendu |
|---|---|---|
| 2 | `[PRÉNOM NOM 03]` | Prénom et nom de la personne |
| 3 | `[FONCTION]` | Fonction |

### `src/content/equipe/equipe-04.md`

| Ligne | Placeholder | Contenu attendu |
|---|---|---|
| 2 | `[PRÉNOM NOM 04]` | Prénom et nom de la personne |
| 3 | `[FONCTION]` | Fonction |

### `src/content/projets/projet-01.md`

| Ligne | Placeholder | Contenu attendu |
|---|---|---|
| 2 | `[PROJET 01]` | Nom du projet (court) |
| 3 | `[CLIENT 01]` | Nom du client |
| 4 | `[ANNÉE]` | Année de livraison |
| 5 | `[SECTEUR]` | Secteur d'activité du client |
| 9 | `[RÉSULTAT PRINCIPAL EN UNE PHRASE]` | Une phrase : le résultat chiffré principal (sert de meta description) |
| 12 | `[À FOURNIR : contexte du projet, 80 à 120 mots]` | Texte de 80 à 120 mots |
| 13 | `[À FOURNIR : le défi, 60 à 100 mots]` | Texte de 60 à 100 mots |
| 14 | `[À FOURNIR : la solution, 100 à 150 mots]` | Texte de 100 à 150 mots |
| 19 | `[+XX %]` | Valeur chiffrée du résultat (ex. +45 %) |
| 20 | `[INDICATEUR]` | Nom de l'indicateur (ex. chiffre d'affaires) |
| 21 | `[DURÉE]` | Durée (ex. 6 mois) |
| 22 | `[+XX %]` | Valeur chiffrée du résultat (ex. +45 %) |
| 23 | `[INDICATEUR]` | Nom de l'indicateur (ex. chiffre d'affaires) |
| 24 | `[DURÉE]` | Durée (ex. 6 mois) |
| 25 | `[XX]` | Valeur chiffrée du résultat (ex. +45 %) |
| 26 | `[INDICATEUR]` | Nom de l'indicateur (ex. chiffre d'affaires) |
| 27 | `[DURÉE]` | Durée (ex. 6 mois) |
| 39 | `[RÔLE]` | Rôle sur le projet |
| 40 | `[PRÉNOM NOM]` | Prénom et nom de la personne |
| 41 | `[RÔLE]` | Rôle sur le projet |
| 42 | `[PRÉNOM NOM]` | Prénom et nom de la personne |

### `src/content/projets/projet-02.md`

| Ligne | Placeholder | Contenu attendu |
|---|---|---|
| 2 | `[PROJET 02]` | Nom du projet (court) |
| 3 | `[CLIENT 02]` | Nom du client |
| 4 | `[ANNÉE]` | Année de livraison |
| 5 | `[SECTEUR]` | Secteur d'activité du client |
| 10 | `[RÉSULTAT PRINCIPAL EN UNE PHRASE]` | Une phrase : le résultat chiffré principal (sert de meta description) |
| 13 | `[À FOURNIR : contexte du projet, 80 à 120 mots]` | Texte de 80 à 120 mots |
| 14 | `[À FOURNIR : le défi, 60 à 100 mots]` | Texte de 60 à 100 mots |
| 15 | `[À FOURNIR : la solution, 100 à 150 mots]` | Texte de 100 à 150 mots |
| 20 | `[+XX %]` | Valeur chiffrée du résultat (ex. +45 %) |
| 21 | `[INDICATEUR]` | Nom de l'indicateur (ex. chiffre d'affaires) |
| 22 | `[DURÉE]` | Durée (ex. 6 mois) |
| 23 | `[+XX %]` | Valeur chiffrée du résultat (ex. +45 %) |
| 24 | `[INDICATEUR]` | Nom de l'indicateur (ex. chiffre d'affaires) |
| 25 | `[DURÉE]` | Durée (ex. 6 mois) |
| 26 | `[XX]` | Valeur chiffrée du résultat (ex. +45 %) |
| 27 | `[INDICATEUR]` | Nom de l'indicateur (ex. chiffre d'affaires) |
| 28 | `[DURÉE]` | Durée (ex. 6 mois) |
| 40 | `[RÔLE]` | Rôle sur le projet |
| 41 | `[PRÉNOM NOM]` | Prénom et nom de la personne |
| 42 | `[RÔLE]` | Rôle sur le projet |
| 43 | `[PRÉNOM NOM]` | Prénom et nom de la personne |

### `src/content/projets/projet-03.md`

| Ligne | Placeholder | Contenu attendu |
|---|---|---|
| 2 | `[PROJET 03]` | Nom du projet (court) |
| 3 | `[CLIENT 03]` | Nom du client |
| 4 | `[ANNÉE]` | Année de livraison |
| 5 | `[SECTEUR]` | Secteur d'activité du client |
| 9 | `[RÉSULTAT PRINCIPAL EN UNE PHRASE]` | Une phrase : le résultat chiffré principal (sert de meta description) |
| 12 | `[À FOURNIR : contexte du projet, 80 à 120 mots]` | Texte de 80 à 120 mots |
| 13 | `[À FOURNIR : le défi, 60 à 100 mots]` | Texte de 60 à 100 mots |
| 14 | `[À FOURNIR : la solution, 100 à 150 mots]` | Texte de 100 à 150 mots |
| 19 | `[+XX %]` | Valeur chiffrée du résultat (ex. +45 %) |
| 20 | `[INDICATEUR]` | Nom de l'indicateur (ex. chiffre d'affaires) |
| 21 | `[DURÉE]` | Durée (ex. 6 mois) |
| 22 | `[+XX %]` | Valeur chiffrée du résultat (ex. +45 %) |
| 23 | `[INDICATEUR]` | Nom de l'indicateur (ex. chiffre d'affaires) |
| 24 | `[DURÉE]` | Durée (ex. 6 mois) |
| 25 | `[XX]` | Valeur chiffrée du résultat (ex. +45 %) |
| 26 | `[INDICATEUR]` | Nom de l'indicateur (ex. chiffre d'affaires) |
| 27 | `[DURÉE]` | Durée (ex. 6 mois) |
| 39 | `[RÔLE]` | Rôle sur le projet |
| 40 | `[PRÉNOM NOM]` | Prénom et nom de la personne |
| 41 | `[RÔLE]` | Rôle sur le projet |
| 42 | `[PRÉNOM NOM]` | Prénom et nom de la personne |

### `src/content/projets/projet-04.md`

| Ligne | Placeholder | Contenu attendu |
|---|---|---|
| 2 | `[PROJET 04]` | Nom du projet (court) |
| 3 | `[CLIENT 04]` | Nom du client |
| 4 | `[ANNÉE]` | Année de livraison |
| 5 | `[SECTEUR]` | Secteur d'activité du client |
| 10 | `[RÉSULTAT PRINCIPAL EN UNE PHRASE]` | Une phrase : le résultat chiffré principal (sert de meta description) |
| 13 | `[À FOURNIR : contexte du projet, 80 à 120 mots]` | Texte de 80 à 120 mots |
| 14 | `[À FOURNIR : le défi, 60 à 100 mots]` | Texte de 60 à 100 mots |
| 15 | `[À FOURNIR : la solution, 100 à 150 mots]` | Texte de 100 à 150 mots |
| 20 | `[+XX %]` | Valeur chiffrée du résultat (ex. +45 %) |
| 21 | `[INDICATEUR]` | Nom de l'indicateur (ex. chiffre d'affaires) |
| 22 | `[DURÉE]` | Durée (ex. 6 mois) |
| 23 | `[+XX %]` | Valeur chiffrée du résultat (ex. +45 %) |
| 24 | `[INDICATEUR]` | Nom de l'indicateur (ex. chiffre d'affaires) |
| 25 | `[DURÉE]` | Durée (ex. 6 mois) |
| 26 | `[XX]` | Valeur chiffrée du résultat (ex. +45 %) |
| 27 | `[INDICATEUR]` | Nom de l'indicateur (ex. chiffre d'affaires) |
| 28 | `[DURÉE]` | Durée (ex. 6 mois) |
| 40 | `[RÔLE]` | Rôle sur le projet |
| 41 | `[PRÉNOM NOM]` | Prénom et nom de la personne |
| 42 | `[RÔLE]` | Rôle sur le projet |
| 43 | `[PRÉNOM NOM]` | Prénom et nom de la personne |

### `src/content/projets/projet-05.md`

| Ligne | Placeholder | Contenu attendu |
|---|---|---|
| 2 | `[PROJET 05]` | Nom du projet (court) |
| 3 | `[CLIENT 05]` | Nom du client |
| 4 | `[ANNÉE]` | Année de livraison |
| 5 | `[SECTEUR]` | Secteur d'activité du client |
| 9 | `[RÉSULTAT PRINCIPAL EN UNE PHRASE]` | Une phrase : le résultat chiffré principal (sert de meta description) |
| 12 | `[À FOURNIR : contexte du projet, 80 à 120 mots]` | Texte de 80 à 120 mots |
| 13 | `[À FOURNIR : le défi, 60 à 100 mots]` | Texte de 60 à 100 mots |
| 14 | `[À FOURNIR : la solution, 100 à 150 mots]` | Texte de 100 à 150 mots |
| 19 | `[+XX %]` | Valeur chiffrée du résultat (ex. +45 %) |
| 20 | `[INDICATEUR]` | Nom de l'indicateur (ex. chiffre d'affaires) |
| 21 | `[DURÉE]` | Durée (ex. 6 mois) |
| 22 | `[+XX %]` | Valeur chiffrée du résultat (ex. +45 %) |
| 23 | `[INDICATEUR]` | Nom de l'indicateur (ex. chiffre d'affaires) |
| 24 | `[DURÉE]` | Durée (ex. 6 mois) |
| 25 | `[XX]` | Valeur chiffrée du résultat (ex. +45 %) |
| 26 | `[INDICATEUR]` | Nom de l'indicateur (ex. chiffre d'affaires) |
| 27 | `[DURÉE]` | Durée (ex. 6 mois) |
| 39 | `[RÔLE]` | Rôle sur le projet |
| 40 | `[PRÉNOM NOM]` | Prénom et nom de la personne |
| 41 | `[RÔLE]` | Rôle sur le projet |
| 42 | `[PRÉNOM NOM]` | Prénom et nom de la personne |

### `src/content/projets/projet-06.md`

| Ligne | Placeholder | Contenu attendu |
|---|---|---|
| 2 | `[PROJET 06]` | Nom du projet (court) |
| 3 | `[CLIENT 06]` | Nom du client |
| 4 | `[ANNÉE]` | Année de livraison |
| 5 | `[SECTEUR]` | Secteur d'activité du client |
| 10 | `[RÉSULTAT PRINCIPAL EN UNE PHRASE]` | Une phrase : le résultat chiffré principal (sert de meta description) |
| 13 | `[À FOURNIR : contexte du projet, 80 à 120 mots]` | Texte de 80 à 120 mots |
| 14 | `[À FOURNIR : le défi, 60 à 100 mots]` | Texte de 60 à 100 mots |
| 15 | `[À FOURNIR : la solution, 100 à 150 mots]` | Texte de 100 à 150 mots |
| 20 | `[+XX %]` | Valeur chiffrée du résultat (ex. +45 %) |
| 21 | `[INDICATEUR]` | Nom de l'indicateur (ex. chiffre d'affaires) |
| 22 | `[DURÉE]` | Durée (ex. 6 mois) |
| 23 | `[+XX %]` | Valeur chiffrée du résultat (ex. +45 %) |
| 24 | `[INDICATEUR]` | Nom de l'indicateur (ex. chiffre d'affaires) |
| 25 | `[DURÉE]` | Durée (ex. 6 mois) |
| 26 | `[XX]` | Valeur chiffrée du résultat (ex. +45 %) |
| 27 | `[INDICATEUR]` | Nom de l'indicateur (ex. chiffre d'affaires) |
| 28 | `[DURÉE]` | Durée (ex. 6 mois) |
| 40 | `[RÔLE]` | Rôle sur le projet |
| 41 | `[PRÉNOM NOM]` | Prénom et nom de la personne |
| 42 | `[RÔLE]` | Rôle sur le projet |
| 43 | `[PRÉNOM NOM]` | Prénom et nom de la personne |

### `src/content/services/reseaux-sociaux.md`

| Ligne | Placeholder | Contenu attendu |
|---|---|---|
| 4 | `[DESCRIPTION 2 LIGNES]` | Description de la carte service, 2 lignes (≈ 90 caractères) |
| 5 | `[À FOURNIR : pour qui ce service, 1 à 2 phrases]` | Texte à fournir (voir la description entre crochets) |
| 7 | `[À FOURNIR : livrable 1]` | Texte à fournir (voir la description entre crochets) |
| 8 | `[À FOURNIR : livrable 2]` | Texte à fournir (voir la description entre crochets) |
| 9 | `[À FOURNIR : livrable 3]` | Texte à fournir (voir la description entre crochets) |
| 10 | `[À FOURNIR : livrable 4]` | Texte à fournir (voir la description entre crochets) |

### `src/content/services/site-tech.md`

| Ligne | Placeholder | Contenu attendu |
|---|---|---|
| 5 | `[À FOURNIR : pour qui ce service, 1 à 2 phrases]` | Texte à fournir (voir la description entre crochets) |
| 7 | `[À FOURNIR : livrable 1]` | Texte à fournir (voir la description entre crochets) |
| 8 | `[À FOURNIR : livrable 2]` | Texte à fournir (voir la description entre crochets) |
| 9 | `[À FOURNIR : livrable 3]` | Texte à fournir (voir la description entre crochets) |
| 10 | `[À FOURNIR : livrable 4]` | Texte à fournir (voir la description entre crochets) |

### `src/content/services/strategie.md`

| Ligne | Placeholder | Contenu attendu |
|---|---|---|
| 5 | `[À FOURNIR : pour qui ce service, 1 à 2 phrases]` | Texte à fournir (voir la description entre crochets) |
| 7 | `[À FOURNIR : livrable 1]` | Texte à fournir (voir la description entre crochets) |
| 8 | `[À FOURNIR : livrable 2]` | Texte à fournir (voir la description entre crochets) |
| 9 | `[À FOURNIR : livrable 3]` | Texte à fournir (voir la description entre crochets) |
| 10 | `[À FOURNIR : livrable 4]` | Texte à fournir (voir la description entre crochets) |

### `src/content/services/video-photo.md`

| Ligne | Placeholder | Contenu attendu |
|---|---|---|
| 5 | `[À FOURNIR : pour qui ce service, 1 à 2 phrases]` | Texte à fournir (voir la description entre crochets) |
| 7 | `[À FOURNIR : livrable 1]` | Texte à fournir (voir la description entre crochets) |
| 8 | `[À FOURNIR : livrable 2]` | Texte à fournir (voir la description entre crochets) |
| 9 | `[À FOURNIR : livrable 3]` | Texte à fournir (voir la description entre crochets) |
| 10 | `[À FOURNIR : livrable 4]` | Texte à fournir (voir la description entre crochets) |

### `src/content/temoignages/temoignage-01.md`

| Ligne | Placeholder | Contenu attendu |
|---|---|---|
| 2 | `[TÉMOIGNAGE À FOURNIR]` | Citation réelle et validée par le client (1 à 3 phrases) |
| 3 | `[PRÉNOM NOM]` | Prénom et nom de la personne |
| 4 | `[FONCTION]` | Fonction |
| 5 | `[ENTREPRISE]` | Nom de l'entreprise |

### `src/content/temoignages/temoignage-02.md`

| Ligne | Placeholder | Contenu attendu |
|---|---|---|
| 2 | `[TÉMOIGNAGE À FOURNIR]` | Citation réelle et validée par le client (1 à 3 phrases) |
| 3 | `[PRÉNOM NOM]` | Prénom et nom de la personne |
| 4 | `[FONCTION]` | Fonction |
| 5 | `[ENTREPRISE]` | Nom de l'entreprise |

### `src/content/temoignages/temoignage-03.md`

| Ligne | Placeholder | Contenu attendu |
|---|---|---|
| 2 | `[TÉMOIGNAGE À FOURNIR]` | Citation réelle et validée par le client (1 à 3 phrases) |
| 3 | `[PRÉNOM NOM]` | Prénom et nom de la personne |
| 4 | `[FONCTION]` | Fonction |
| 5 | `[ENTREPRISE]` | Nom de l'entreprise |

### `src/pages/agence.astro`

| Ligne | Placeholder | Contenu attendu |
|---|---|---|
| 12 | `[À FOURNIR : texte sur cette valeur, 2 lignes]` | Texte de 2 lignes (≈ 90 caractères) |
| 13 | `[À FOURNIR : texte sur cette valeur, 2 lignes]` | Texte de 2 lignes (≈ 90 caractères) |
| 14 | `[À FOURNIR : texte sur cette valeur, 2 lignes]` | Texte de 2 lignes (≈ 90 caractères) |
| 29 | `[À FOURNIR : chapeau de la page, 2 lignes]` | Texte de 2 lignes (≈ 90 caractères) |

### `src/pages/confidentialite.astro`

| Ligne | Placeholder | Contenu attendu |
|---|---|---|
| 30 | `[À FOURNIR : finalités et base légale de chaque traitement, 80 à 120 mots]` | Texte de 80 à 120 mots |
| 35 | `[À FOURNIR : durées de conservation par type de donnée, 40 à 80 mots]` | Texte de 40 à 80 mots |

### `src/pages/index.astro`

| Ligne | Placeholder | Contenu attendu |
|---|---|---|
| 24 | `[CHIFFRE-1]` | Nombre seul (ex. 120) : il est compté à l'apparition |
| 25 | `[CHIFFRE-2]` | Nombre seul (ex. 120) : il est compté à l'apparition |
| 26 | `[CHIFFRE-3]` | Nombre seul (ex. 120) : il est compté à l'apparition |
| 26 | `[INDICATEUR]` | Nom de l'indicateur (ex. chiffre d'affaires) |

### `src/pages/mentions-legales.astro`

| Ligne | Placeholder | Contenu attendu |
|---|---|---|
| 50 | `[À FOURNIR : finalités des traitements, 60 à 100 mots]` | Texte de 60 à 100 mots |
| 51 | `[À FOURNIR : durée de conservation des données, 40 à 80 mots]` | Texte de 40 à 80 mots |

### `src/pages/services.astro`

| Ligne | Placeholder | Contenu attendu |
|---|---|---|
| 29 | `[À FOURNIR : chapeau de la page, 2 lignes]` | Texte de 2 lignes (≈ 90 caractères) |

