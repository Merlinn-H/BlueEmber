# Contenu du site Blue Ember

Tous les textes du site, page par page, dans l'ordre où le visiteur les lit. Document de travail à compléter plus tard.

## Mode d'emploi

1. Un texte entre crochets, par exemple `[À FOURNIR : ...]` ou `[VILLE]`, est un placeholder : il faut écrire le vrai contenu.
2. Un texte sans crochets est déjà rédigé (il vient du brief) : relisez-le, gardez-le ou réécrivez-le.
3. Écrivez dans la colonne **Nouveau texte** (ou après les deux-points dans les fiches). Une cellule vide veut dire : on garde le texte actuel.
4. Dans les titres, le signe `/` marque un retour à la ligne : `Votre marque / mérite / de briller.` s'affiche sur trois lignes.
5. Les images, vidéos et logos ne sont pas dans ce document : voir `PLACEHOLDERS.md`.
6. Chaque section indique le fichier du site concerné. Une fois ce document rempli, les textes sont reportés dans le site sans toucher à la mise en page.
7. Le site affiche aujourd'hui du lorem ipsum et de faux chiffres à la place des placeholders (mode démo, variable `PUBLIC_DEMO_CONTENT`). La colonne « Texte actuel » montre ce qu'il y a dans les fichiers, pas ce qui s'affiche. La ville, les coordonnées et les informations légales restent entre crochets.

Ton éditorial (rappel du brief) : on vouvoie, phrases courtes et affirmatives, pas de jargon (« plus de clients », pas « optimisation du funnel »), pas d'emoji, pas de point d'exclamation. Titres courts, en lignes de deux ou trois mots.

À ne jamais inventer : citations de clients, chiffres, noms de clients, noms de personnes. Tout ce qui est affiché comme un fait doit être réel et validé.

Longueurs conseillées pour le référencement : titre SEO d'environ 60 caractères, description SEO d'environ 155 caractères.

Les textes juridiques (sections 8 et 9) sont à faire valider par un juriste avant la mise en ligne.

## Sommaire

- 0. Réglages généraux et coordonnées
- 1. Éléments communs à toutes les pages
- 2. Accueil
- 3. Services
- 4. Réalisations (liste, modèle de page projet, fiches des 6 projets)
- 5. Agence
- 6. Contact
- 7. Page 404
- 8. Mentions légales
- 9. Confidentialité
- 10. Témoignages
- 11. Logos clients
- Annexe : textes invisibles lus par les lecteurs d'écran

---

## 0. Réglages généraux et coordonnées

Fichier : `src/config/site.ts`. Ces valeurs reviennent à plusieurs endroits du site (pied de page, page Contact, mentions légales, formulaire, référencement).

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Nom de l'agence | Blue Ember | |
| Baseline (description dans les données structurées pour Google) | Marketing, vidéo et tech pour les entreprises ambitieuses. | |
| Ville | [VILLE] | |
| E-mail de contact | [EMAIL] | |
| Téléphone (format international, par exemple +33 1 23 45 67 89) | [TÉLÉPHONE] | |
| Adresse postale complète | [ADRESSE] | |
| Délai de réponse (par exemple 24 heures ouvrées) | [DÉLAI] | |
| Instagram (URL complète du profil) | [INSTAGRAM] | |
| LinkedIn (URL complète du profil) | [LINKEDIN] | |
| Libellé du bouton principal (navigation, accueil, blocs de contact) | Prendre rendez-vous | |
| Lien de prise de rendez-vous en ligne (Calendly ou équivalent, variable `PUBLIC_BOOKING_URL`) | (vide : le bouton « Réserver un créneau » est masqué) | |

---

## 1. Éléments communs à toutes les pages

### 1.1 Navigation

Fichiers : `src/components/Nav.astro`, `src/config/site.ts`, `src/layouts/BaseLayout.astro`.

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Lien d'évitement (visible seulement au clavier) | Aller au contenu | |
| Lien 1 | Agence | |
| Lien 2 | Services | |
| Lien 3 | Réalisations | |
| Lien 4 | Contact | |
| Bouton principal | Prendre rendez-vous | |
| Bouton du menu mobile, menu fermé | Menu | |
| Bouton du menu mobile, menu ouvert | Fermer | |

### 1.2 Pied de page et newsletter

Fichiers : `src/components/Footer.astro`, `src/components/Newsletter.astro`.

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| E-mail affiché | [EMAIL] (voir section 0) | |
| Réseaux sociaux | Instagram, LinkedIn | |
| Liens légaux | Mentions légales, Confidentialité | |
| Titre du bloc newsletter | Newsletter | |
| Champ e-mail (texte d'aide) | Votre e-mail | |
| Bouton d'inscription | S'inscrire | |
| Case de consentement à la newsletter | [À FOURNIR : texte de consentement à la newsletter] | |
| Message après inscription | Merci, votre inscription est bien enregistrée. | |
| Mention de copyright (l'année se met à jour toute seule) | © 2026 Blue Ember | |

### 1.3 Bloc de contact final

Présent en bas de l'accueil, de Services, de Réalisations, des pages projet et de Agence. Fichier : `src/components/ContactCta.astro`.

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Titre (2 lignes) | Parlons de / votre projet. | |
| Bouton principal | Prendre rendez-vous | |
| Lien e-mail | [EMAIL] (voir section 0) | |

### 1.4 Libellés qui reviennent

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Lien des cartes de service (`src/components/ServiceCard.astro`) | En savoir plus | |
| Pastille du curseur sur un projet, sur ordinateur (`src/components/Cursor.astro`) | Voir | |
| Bouton pause des bandes qui défilent (`src/components/PauseButton.astro`) | Pause | |

---

## 2. Accueil

Fichier : `src/pages/index.astro`.

### Référencement

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Titre SEO | Blue Ember · Agence marketing, vidéo et tech à [VILLE] | |
| Description SEO | Stratégie, production vidéo, réseaux sociaux et sites web pour les PME et les grandes entreprises. Prenez rendez-vous avec Blue Ember. | |

### 2.1 Hero

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Surtitre | Marketing · Vidéo · Tech | |
| Titre principal (3 lignes) | Votre marque / mérite / de briller. | |
| Chapeau | Marketing, vidéo et tech pour les entreprises ambitieuses. | |
| Bouton principal | Prendre rendez-vous | |
| Indication de défilement | Défiler | |

### 2.2 Manifeste

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Phrase (4 lignes) | Nous allumons / les marques / qui veulent / compter. | |

### 2.3 Réalisations (bande qui défile)

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Surtitre | Réalisations | |
| Cartes de la bande | Les 6 projets de la section 4 (nom, client, année) | |
| Bouton | Voir toutes les réalisations | |

### 2.4 Résultats

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Surtitre | Résultats | |
| Chiffre 1 (nombre seul, par exemple 120, compté à l'apparition) | [CHIFFRE-1] | |
| Libellé du chiffre 1 | projets livrés | |
| Chiffre 2 (nombre seul) | [CHIFFRE-2] | |
| Libellé du chiffre 2 | ans d'expérience cumulée | |
| Chiffre 3 (nombre seul) | [CHIFFRE-3] | |
| Libellé du chiffre 3 ([INDICATEUR] : par exemple chiffre d'affaires) | de croissance moyenne de [INDICATEUR] | |

### 2.5 Services

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Surtitre | Services | |
| 4 cartes (numéro, titre, description courte) | Voir la section 3.3 | |

### 2.6 Approche (même bloc sur la page Services)

Fichier : `src/components/Approach.astro`.

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Surtitre | Approche | |
| Étape 01 : titre | Comprendre | |
| Étape 01 : texte (2 lignes, environ 90 caractères) | [À FOURNIR : texte de l'étape, 2 lignes] | |
| Étape 02 : titre | Créer | |
| Étape 02 : texte (2 lignes) | [À FOURNIR : texte de l'étape, 2 lignes] | |
| Étape 03 : titre | Faire grandir | |
| Étape 03 : texte (2 lignes) | [À FOURNIR : texte de l'étape, 2 lignes] | |

### 2.7 Clients

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Surtitre | Ils nous font confiance | |
| Logos | Voir la section 11 | |

### 2.8 Témoignage

Affiche le premier témoignage de la section 10 (citation, nom, fonction, entreprise).

### 2.9 Contact

Voir la section 1.3.

---

## 3. Services

Fichiers : `src/pages/services.astro`, `src/config/faq.ts`, `src/content/services/*.md`.

### Référencement

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Titre SEO | Services · Stratégie, vidéo, réseaux sociaux et web · Blue Ember | |
| Description SEO | Une agence pour tout votre marketing : stratégie, films de marque, contenus réseaux et sites rapides. Découvrez notre méthode. | |

### 3.1 Hero

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Surtitre | Services | |
| Titre (2 lignes) | Ce que nous / faisons pour vous. | |
| Chapeau (2 lignes, environ 90 caractères) | [À FOURNIR : chapeau de la page, 2 lignes] | |

### 3.2 Les quatre blocs détaillés

Libellés communs aux quatre blocs. Le contenu de chaque bloc vient des fiches de la section 3.3.

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Intertitre 1 | Pour qui | |
| Intertitre 2 | Ce que vous obtenez | |
| Intertitre 3 | Projet lié | |
| Bouton de chaque bloc | Prendre rendez-vous | |

### 3.3 Fiches des 4 services

Ces fiches servent aussi aux cartes de la page d'accueil (numéro, titre, description courte).

#### Service 01 : Stratégie (`src/content/services/strategie.md`)

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Titre | Stratégie | |
| Description de la carte (2 lignes, environ 90 caractères) | Positionnement, message et plan pour trouver vos clients. | |
| Pour qui (1 à 2 phrases) | [À FOURNIR : pour qui ce service, 1 à 2 phrases] | |
| Livrable 1 | [À FOURNIR : livrable 1] | |
| Livrable 2 | [À FOURNIR : livrable 2] | |
| Livrable 3 | [À FOURNIR : livrable 3] | |
| Livrable 4 | [À FOURNIR : livrable 4] | |
| Projet lié (étude de cas mise en avant) | [PROJET 02] | |

#### Service 02 : Vidéo et photo (`src/content/services/video-photo.md`)

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Titre | Vidéo et photo | |
| Description de la carte (2 lignes, environ 90 caractères) | Films de marque, contenus réseaux, tournages premium. | |
| Pour qui (1 à 2 phrases) | [À FOURNIR : pour qui ce service, 1 à 2 phrases] | |
| Livrable 1 | [À FOURNIR : livrable 1] | |
| Livrable 2 | [À FOURNIR : livrable 2] | |
| Livrable 3 | [À FOURNIR : livrable 3] | |
| Livrable 4 | [À FOURNIR : livrable 4] | |
| Projet lié (étude de cas mise en avant) | [PROJET 01] | |

#### Service 03 : Réseaux sociaux (`src/content/services/reseaux-sociaux.md`)

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Titre | Réseaux sociaux | |
| Description de la carte (2 lignes, environ 90 caractères) | [DESCRIPTION 2 LIGNES] | |
| Pour qui (1 à 2 phrases) | [À FOURNIR : pour qui ce service, 1 à 2 phrases] | |
| Livrable 1 | [À FOURNIR : livrable 1] | |
| Livrable 2 | [À FOURNIR : livrable 2] | |
| Livrable 3 | [À FOURNIR : livrable 3] | |
| Livrable 4 | [À FOURNIR : livrable 4] | |
| Projet lié (étude de cas mise en avant) | [PROJET 05] | |

#### Service 04 : Site et tech (`src/content/services/site-tech.md`)

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Titre | Site et tech | |
| Description de la carte (2 lignes, environ 90 caractères) | Sites rapides et immersifs, outils sur mesure. | |
| Pour qui (1 à 2 phrases) | [À FOURNIR : pour qui ce service, 1 à 2 phrases] | |
| Livrable 1 | [À FOURNIR : livrable 1] | |
| Livrable 2 | [À FOURNIR : livrable 2] | |
| Livrable 3 | [À FOURNIR : livrable 3] | |
| Livrable 4 | [À FOURNIR : livrable 4] | |
| Projet lié (étude de cas mise en avant) | [PROJET 03] | |

### 3.4 Approche

Même bloc que sur l'accueil : voir la section 2.6.

### 3.5 Questions fréquentes

Fichier : `src/config/faq.ts`. Les mêmes questions et réponses alimentent aussi les données structurées « FAQ » pour Google. Réponses de 2 à 3 phrases.

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Surtitre | FAQ | |
| Titre | Questions fréquentes | |
| Question 1 | Quels sont vos délais ? | |
| Réponse 1 | [À FOURNIR : réponse sur les délais, 2 à 3 phrases] | |
| Question 2 | Quel budget faut-il prévoir ? | |
| Réponse 2 | [À FOURNIR : réponse sur le budget, 2 à 3 phrases] | |
| Question 3 | Comment se déroule un projet ? | |
| Réponse 3 | [À FOURNIR : réponse sur le déroulé d'un projet, 2 à 3 phrases] | |
| Question 4 | Où intervenez-vous ? | |
| Réponse 4 | [À FOURNIR : réponse sur la zone géographique, 2 à 3 phrases] | |
| Question 5 | À qui appartiennent les contenus ? | |
| Réponse 5 | [À FOURNIR : réponse sur la propriété des contenus, 2 à 3 phrases] | |
| Question 6 | Quel suivi après la livraison ? | |
| Réponse 6 | [À FOURNIR : réponse sur le suivi après livraison, 2 à 3 phrases] | |

### 3.6 Contact

Voir la section 1.3.

---

## 4. Réalisations

Fichiers : `src/pages/realisations/index.astro`, `src/pages/realisations/[slug].astro`, `src/content/projets/*.md`.

### Référencement de la page Réalisations

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Titre SEO | Réalisations · Projets marketing, vidéo et web · Blue Ember | |
| Description SEO | Découvrez nos projets et leurs résultats chiffrés pour des PME et des grandes entreprises. | |

### 4.1 Page Réalisations (liste)

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Surtitre | Réalisations | |
| Titre | Réalisations | |
| Filtre 1 | Tous | |
| Filtre 2 | Vidéo | |
| Filtre 3 | Marketing | |
| Filtre 4 | Tech | |
| Cartes de la grille | Les 6 projets de la section 4.3 (nom, puis « Client · Année ») | |

Le bloc de contact final est décrit en section 1.3.

### 4.2 Modèle commun de page projet

Ces libellés sont identiques sur les 6 pages projet. Le contenu vient des fiches de la section 4.3.

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Titre SEO (le nom du projet et du client s'insèrent automatiquement) | [Projet] pour [Client] · Étude de cas · Blue Ember | |
| Description SEO (début : le résultat principal du projet) | [Résultat principal en une phrase] Contexte, solution et résultats du projet. | |
| Fil d'Ariane, premier niveau | Réalisations | |
| Surtitre | Étude de cas | |
| Fiche : libellé 1 | Client | |
| Fiche : libellé 2 | Année | |
| Fiche : libellé 3 | Secteur | |
| Fiche : libellé 4 | Services | |
| Intertitre 1 | Contexte | |
| Intertitre 2 | Le défi | |
| Intertitre 3 | La solution | |
| Intertitre 4 | Résultats | |
| Intertitre du crédit | Crédits | |
| Surtitre du projet suivant | Projet suivant | |

### 4.3 Fiches des 6 projets

Pour chaque projet, tous les champs sont encore des placeholders : `[PROJET 0N]`, `[CLIENT 0N]`, `[ANNÉE]`, `[SECTEUR]`, `[RÉSULTAT PRINCIPAL EN UNE PHRASE]`, `[À FOURNIR : ...]`, `[+XX %]`, `[INDICATEUR]`, `[DURÉE]`, `[RÔLE]`, `[PRÉNOM NOM]`. À remplir après les deux-points.

Pour les résultats, écrivez les trois morceaux, par exemple : valeur `+45 %`, libellé `de chiffre d'affaires`, période `en 6 mois`. Le premier résultat est le plus fort.

Le témoignage affiché sur chaque page projet vient de la section 10.

#### Projet 01 (catégorie actuelle : Vidéo, service lié : Vidéo et photo)

- Nom du projet (court) :
- Client :
- Année de livraison :
- Secteur d'activité du client :
- Résultat principal en une phrase (sert de description SEO) :
- Contexte (80 à 120 mots) :
- Le défi (60 à 100 mots) :
- La solution (100 à 150 mots) :
- Résultat 1 (valeur / libellé / période) :
- Résultat 2 (valeur / libellé / période) :
- Résultat 3 (valeur / libellé / période) :
- Crédit 1 (rôle : prénom nom) :
- Crédit 2 (rôle : prénom nom) :

#### Projet 02 (catégorie actuelle : Marketing, services liés : Stratégie et Réseaux sociaux)

- Nom du projet (court) :
- Client :
- Année de livraison :
- Secteur d'activité du client :
- Résultat principal en une phrase (sert de description SEO) :
- Contexte (80 à 120 mots) :
- Le défi (60 à 100 mots) :
- La solution (100 à 150 mots) :
- Résultat 1 (valeur / libellé / période) :
- Résultat 2 (valeur / libellé / période) :
- Résultat 3 (valeur / libellé / période) :
- Crédit 1 (rôle : prénom nom) :
- Crédit 2 (rôle : prénom nom) :

#### Projet 03 (catégorie actuelle : Tech, service lié : Site et tech)

- Nom du projet (court) :
- Client :
- Année de livraison :
- Secteur d'activité du client :
- Résultat principal en une phrase (sert de description SEO) :
- Contexte (80 à 120 mots) :
- Le défi (60 à 100 mots) :
- La solution (100 à 150 mots) :
- Résultat 1 (valeur / libellé / période) :
- Résultat 2 (valeur / libellé / période) :
- Résultat 3 (valeur / libellé / période) :
- Crédit 1 (rôle : prénom nom) :
- Crédit 2 (rôle : prénom nom) :

#### Projet 04 (catégorie actuelle : Vidéo, services liés : Vidéo et photo et Réseaux sociaux)

- Nom du projet (court) :
- Client :
- Année de livraison :
- Secteur d'activité du client :
- Résultat principal en une phrase (sert de description SEO) :
- Contexte (80 à 120 mots) :
- Le défi (60 à 100 mots) :
- La solution (100 à 150 mots) :
- Résultat 1 (valeur / libellé / période) :
- Résultat 2 (valeur / libellé / période) :
- Résultat 3 (valeur / libellé / période) :
- Crédit 1 (rôle : prénom nom) :
- Crédit 2 (rôle : prénom nom) :

#### Projet 05 (catégorie actuelle : Marketing, service lié : Stratégie)

- Nom du projet (court) :
- Client :
- Année de livraison :
- Secteur d'activité du client :
- Résultat principal en une phrase (sert de description SEO) :
- Contexte (80 à 120 mots) :
- Le défi (60 à 100 mots) :
- La solution (100 à 150 mots) :
- Résultat 1 (valeur / libellé / période) :
- Résultat 2 (valeur / libellé / période) :
- Résultat 3 (valeur / libellé / période) :
- Crédit 1 (rôle : prénom nom) :
- Crédit 2 (rôle : prénom nom) :

#### Projet 06 (catégorie actuelle : Tech, services liés : Site et tech et Stratégie)

- Nom du projet (court) :
- Client :
- Année de livraison :
- Secteur d'activité du client :
- Résultat principal en une phrase (sert de description SEO) :
- Contexte (80 à 120 mots) :
- Le défi (60 à 100 mots) :
- La solution (100 à 150 mots) :
- Résultat 1 (valeur / libellé / période) :
- Résultat 2 (valeur / libellé / période) :
- Résultat 3 (valeur / libellé / période) :
- Crédit 1 (rôle : prénom nom) :
- Crédit 2 (rôle : prénom nom) :

---

## 5. Agence

Fichiers : `src/pages/agence.astro`, `src/content/equipe/*.md`.

### Référencement

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Titre SEO | L'agence · Équipe et méthode · Blue Ember [VILLE] | |
| Description SEO | Rencontrez l'équipe Blue Ember et notre façon de travailler : luxe, chaleur, précision. | |

### 5.1 Hero

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Surtitre | L'agence | |
| Titre (2 lignes) | Une équipe / à votre service. | |
| Chapeau (2 lignes, environ 90 caractères) | [À FOURNIR : chapeau de la page, 2 lignes] | |

### 5.2 Le fondateur

Affiche la fiche du membre 01 (section 5.3).

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Surtitre | Le fondateur | |

### 5.3 L'équipe

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Surtitre | L'équipe | |

Fiches des 4 membres (à remplir après les deux-points) :

#### Membre 01 (le fondateur, affiché aussi dans « Le fondateur »)

- Prénom et nom (actuel : [PRÉNOM NOM 01]) :
- Fonction (actuel : [FONCTION]) :
- Présentation du fondateur, environ 100 mots (actuel : [À FOURNIR : présentation du fondateur, 100 mots]) :

#### Membre 02

- Prénom et nom (actuel : [PRÉNOM NOM 02]) :
- Fonction (actuel : [FONCTION]) :

#### Membre 03

- Prénom et nom (actuel : [PRÉNOM NOM 03]) :
- Fonction (actuel : [FONCTION]) :

#### Membre 04

- Prénom et nom (actuel : [PRÉNOM NOM 04]) :
- Fonction (actuel : [FONCTION]) :

### 5.4 Valeurs

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Surtitre | Valeurs | |
| Valeur 1 : titre | Luxe | |
| Valeur 1 : texte (2 lignes, environ 90 caractères) | [À FOURNIR : texte sur cette valeur, 2 lignes] | |
| Valeur 2 : titre | Chaleur | |
| Valeur 2 : texte (2 lignes) | [À FOURNIR : texte sur cette valeur, 2 lignes] | |
| Valeur 3 : titre | Précision | |
| Valeur 3 : texte (2 lignes) | [À FOURNIR : texte sur cette valeur, 2 lignes] | |

### 5.5 Les bureaux

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Surtitre | Les bureaux | |
| Ville | [VILLE] (voir section 0) | |
| Adresse | [ADRESSE] (voir section 0) | |

### 5.6 Contact

Voir la section 1.3.

---

## 6. Contact

Fichiers : `src/pages/contact.astro`, `src/components/ContactForm.astro`, `src/components/Field.astro`, `src/scripts/motion/form.ts`.

### Référencement

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Titre SEO | Contact · Parlons de votre projet · Blue Ember | |
| Description SEO ([DÉLAI] vient de la section 0) | Décrivez votre projet, nous vous répondons sous [DÉLAI]. Prenez rendez-vous avec l'agence Blue Ember. | |

### 6.1 Hero

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Titre (2 lignes) | Parlons de / votre projet. | |
| Chapeau ([DÉLAI] vient de la section 0) | Réponse sous [DÉLAI]. | |

### 6.2 Formulaire

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Champ 1 : libellé | Nom | |
| Champ 1 : message si vide | Indiquez votre nom. | |
| Champ 2 : libellé | Entreprise | |
| Champ 2 : message si vide | Indiquez le nom de votre entreprise. | |
| Champ 3 : libellé | E-mail | |
| Champ 3 : message si vide | Indiquez votre adresse e-mail. | |
| Champ 3 : message si l'adresse est incorrecte | Cette adresse e-mail semble incorrecte. | |
| Champ 4 : libellé | Téléphone | |
| Champ 4 : message si le numéro est incorrect | Ce numéro de téléphone semble incorrect. | |
| Mention ajoutée aux champs facultatifs | (facultatif) | |
| Champ 5 : libellé | Budget | |
| Champ 5 : choix par défaut | Choisir | |
| Champ 5 : option 1 | [< 5 k€] | |
| Champ 5 : option 2 | [5 à 15 k€] | |
| Champ 5 : option 3 | [15 à 40 k€] | |
| Champ 5 : option 4 | [> 40 k€] | |
| Champ 5 : option 5 | Je ne sais pas encore | |
| Champ 5 : message si rien n'est choisi | Choisissez une fourchette de budget. | |
| Champ 6 : libellé | Message | |
| Champ 6 : message si vide | Décrivez votre projet en quelques lignes. | |
| Case de consentement (RGPD) | [À FOURNIR : texte du consentement RGPD] | |
| Message si la case n'est pas cochée | Pour envoyer le formulaire, acceptez le traitement de vos données. | |
| Bouton d'envoi | Envoyer | |
| Bouton pendant l'envoi | Envoi en cours | |

### 6.3 Messages après l'envoi (formulaire de contact et newsletter)

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Message d'erreur par défaut d'un champ obligatoire (aussi utilisé par la newsletter) | Ce champ est obligatoire. | |
| Message sous le bouton si des champs sont à corriger | Vérifiez les champs signalés. | |
| Confirmation du formulaire : titre | Merci. | |
| Confirmation du formulaire : texte ([DÉLAI] vient de la section 0) | Votre message est bien parti. Nous vous répondons sous [DÉLAI]. | |
| Message si l'envoi échoue ([EMAIL] vient de la section 0) | L'envoi a échoué. Réessayez dans un instant, ou écrivez-nous directement : [EMAIL] | |

### 6.4 Coordonnées

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Bouton de réservation (affiché seulement si le lien de la section 0 est renseigné) | Réserver un créneau | |
| Libellé 1 | E-mail | |
| Valeur 1 | [EMAIL] (voir section 0) | |
| Libellé 2 | Téléphone | |
| Valeur 2 | [TÉLÉPHONE] (voir section 0) | |
| Libellé 3 | Adresse | |
| Valeur 3 | [ADRESSE] (voir section 0) | |
| Libellé 4 | Réseaux | |
| Valeur 4 | Instagram, LinkedIn (voir section 0) | |

---

## 7. Page 404

Fichier : `src/pages/404.astro`.

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Titre SEO | Page introuvable · Blue Ember | |
| Description SEO | Cette page n'existe pas ou n'existe plus. Revenez à l'accueil de Blue Ember. | |
| Surtitre | Erreur 404 | |
| Titre (2 lignes) | Cette page / s'est éteinte. | |
| Bouton | Retour à l'accueil | |

---

## 8. Mentions légales

Fichiers : `src/pages/mentions-legales.astro`, `src/config/site.ts`. À faire valider par un juriste.

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Titre SEO | Mentions légales · Blue Ember | |
| Description SEO | Informations légales sur l'éditeur et l'hébergeur du site Blue Ember. | |
| Titre de la page | Mentions légales | |
| Intertitre | Éditeur du site | |
| Raison sociale (exacte, selon le Kbis) | [RAISON SOCIALE] | |
| Forme juridique | [FORME] | |
| Capital | [CAPITAL] | |
| SIREN | [SIREN] | |
| Adresse | [ADRESSE] | |
| Directeur de la publication | [DIRECTEUR DE PUBLICATION] | |
| Contact | [EMAIL] (voir section 0) | |
| Intertitre | Hébergeur | |
| Société qui héberge le site | [HÉBERGEUR] | |
| Intertitre | Propriété intellectuelle | |
| Clause de propriété intellectuelle (80 à 120 mots : textes, images, vidéos, marques) | [À FOURNIR : clause de propriété intellectuelle (textes, images, vidéos, marques), 80 à 120 mots] | |
| Intertitre | Données personnelles | |
| Finalités des traitements (60 à 100 mots) | [À FOURNIR : finalités des traitements, 60 à 100 mots] | |
| Durée de conservation des données (40 à 80 mots) | [À FOURNIR : durée de conservation des données, 40 à 80 mots] | |
| Paragraphe sur les droits ([EMAIL-DPO] : adresse du délégué à la protection des données) | Vous disposez d'un droit d'accès, de rectification, d'effacement, d'opposition et de portabilité. Pour l'exercer : [EMAIL-DPO]. Plus de détails dans la politique de confidentialité. | |

---

## 9. Confidentialité

Fichier : `src/pages/confidentialite.astro`. À faire valider par un juriste.

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Titre SEO | Confidentialité · Blue Ember | |
| Description SEO | Comment Blue Ember traite vos données personnelles : finalités, durée de conservation et vos droits. | |
| Titre de la page | Confidentialité | |
| Intertitre 1 | Responsable du traitement | |
| Texte 1 | [RAISON SOCIALE], [ADRESSE]. Contact : [EMAIL-DPO]. | |
| Intertitre 2 | Données collectées | |
| Texte 2 | Le formulaire de contact recueille votre nom, votre entreprise, votre adresse e-mail, votre numéro de téléphone (facultatif), votre budget et votre message. L'inscription à la newsletter recueille votre adresse e-mail. | |
| Intertitre 3 | Finalités et base légale | |
| Texte 3 (80 à 120 mots) | [À FOURNIR : finalités et base légale de chaque traitement, 80 à 120 mots] | |
| Intertitre 4 | Durée de conservation | |
| Texte 4 (40 à 80 mots) | [À FOURNIR : durées de conservation par type de donnée, 40 à 80 mots] | |
| Intertitre 5 | Vos droits | |
| Texte 5 | Vous pouvez accéder à vos données, les rectifier, les effacer, limiter leur traitement, vous y opposer et demander leur portabilité. Écrivez à [EMAIL-DPO]. Vous pouvez aussi saisir la CNIL. | |
| Intertitre 6 | Cookies et mesure d'audience | |
| Texte 6 | Ce site ne dépose aucun cookie non essentiel. La mesure d'audience, lorsqu'elle est activée, fonctionne sans cookie et sans donnée personnelle. Les polices sont hébergées sur le site : aucun appel à un service tiers de polices. | |

---

## 10. Témoignages

Fichiers : `src/content/temoignages/*.md`. Le témoignage 01 apparaît sur l'accueil et sur les projets 01 et 04, le 02 sur les projets 02 et 05, le 03 sur les projets 03 et 06.

Citation réelle, validée par le client, 1 à 3 phrases. À remplir après les deux-points.

#### Témoignage 01

- Citation (actuel : [TÉMOIGNAGE À FOURNIR]) :
- Prénom et nom (actuel : [PRÉNOM NOM]) :
- Fonction (actuel : [FONCTION]) :
- Entreprise (actuel : [ENTREPRISE]) :

#### Témoignage 02

- Citation (actuel : [TÉMOIGNAGE À FOURNIR]) :
- Prénom et nom (actuel : [PRÉNOM NOM]) :
- Fonction (actuel : [FONCTION]) :
- Entreprise (actuel : [ENTREPRISE]) :

#### Témoignage 03

- Citation (actuel : [TÉMOIGNAGE À FOURNIR]) :
- Prénom et nom (actuel : [PRÉNOM NOM]) :
- Fonction (actuel : [FONCTION]) :
- Entreprise (actuel : [ENTREPRISE]) :

---

## 11. Logos clients

Fichiers : `src/content/clients/*.md`. Les logos eux-mêmes sont à fournir (voir `PLACEHOLDERS.md`). Le nom du client sert de texte alternatif au logo, lu par les lecteurs d'écran.

| Emplacement | Texte actuel | Nouveau texte |
|---|---|---|
| Client 1 | LOGO CLIENT 01 | |
| Client 2 | LOGO CLIENT 02 | |
| Client 3 | LOGO CLIENT 03 | |
| Client 4 | LOGO CLIENT 04 | |
| Client 5 | LOGO CLIENT 05 | |
| Client 6 | LOGO CLIENT 06 | |
| Client 7 | LOGO CLIENT 07 | |
| Client 8 | LOGO CLIENT 08 | |

---

## Annexe : textes invisibles lus par les lecteurs d'écran

Ces textes ne s'affichent pas à l'écran mais sont lus par les lecteurs d'écran (accessibilité). Il n'y a en général rien à changer : à garder tels quels, sauf si le nom de l'agence ou le vocabulaire du site change.

| Où | Texte actuel |
|---|---|
| Logo de la navigation et du pied de page (lien vers l'accueil) | Blue Ember agency, accueil |
| Texte caché du logo | Blue Ember agency |
| Navigation du haut de page | Navigation principale |
| Menu mobile | Menu |
| Liste des réseaux sociaux du pied de page | Réseaux sociaux |
| Liens légaux du pied de page | Informations légales |
| Champ e-mail de la newsletter | Votre adresse e-mail |
| Fil d'Ariane des pages projet | Fil d'Ariane |
| Liste des projets de la page Réalisations | Liste des réalisations |
| Groupe de filtres de la page Réalisations | Filtrer les réalisations |
| Bande de projets de l'accueil | Réalisations |
| Bande de logos de l'accueil | Clients |
| Bouton pause de la bande de projets | Pause du défilement des réalisations |
| Bouton pause de la bande de logos | Pause du défilement des logos clients |
| Section de l'accueil (manifeste) | Manifeste |
| Section du témoignage | Témoignage client |
| Galerie d'une page projet | Galerie |
| Zone formulaire et coordonnées de la page Contact | Formulaire et coordonnées |
| Formulaire de contact | Formulaire de contact |
| Colonne des coordonnées | Coordonnées |
| Images décoratives (portraits, visuels) | (vide : ignorées par les lecteurs d'écran) |
