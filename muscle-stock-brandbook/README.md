# Muscle Stock — Charte graphique 2.0

Refonte du guide d'identité visuelle 2024 de **Muscle Stock Tunisie** (nutrition sportive).
Même ADN (mascotte, Crimson Red, noir), système plus rigoureux, maquettes réalistes.

## Contenu

```
assets/logo/     Logos extraits en PNG transparent haute définition
assets/photo/    Photo héros d'origine
mockups/src/     Scènes de maquettes en HTML/CSS (modifiables)
mockups/out/     Rendus JPG/PNG prêts à l'emploi
mockups/render.mjs  Régénère tous les rendus
```

### Logos (`assets/logo/`)

| Fichier | Usage |
| --- | --- |
| `emblem-red.png` | Emblème principal couleur |
| `emblem-mono-dark.png` / `emblem-black.png` | Monochrome blanc (fond foncé) / noir (fond clair) |
| `emblem-blue.png` | Réservé à la gamme Recovery |
| `icon-color.png` | Symbole rond couleur (avatar, étiquettes) |
| `icon-*-knockout.png` | Symbole en réserve, impression 1 couleur |
| `head-*.png` | Monogramme visage (icône d'app, favicon, broderie) |
| `wordmark-*.png` | Mot-symbole « MUSCLE STOCK » seul |
| `../../mockups/out/lockup-*.png` | **Nouveaux** logotypes horizontal et empilé |
| `../../mockups/out/app-icon.png` | Icône d'application |

## Ce qui change par rapport à la v1

- **Logo** : système en 4 formats (emblème, horizontal, symbole, monogramme). Le logotype horizontal
  remplace le bandeau à double contour pour les petites tailles. Tailles minimales relevées
  (emblème ≥ 80 px — l'ancienne règle de 25 px rendait le texte illisible).
- **Couleurs** : ajout du **Bone #F2EEE7** à la place du blanc pur ; le **Dark Blue** reçoit un rôle
  précis (gamme Recovery) au lieu d'être une alternative libre. Proportions 55/25/15/5.
- **Gammes produits** : Performance (rouge), Recovery (bleu), Essentials (bone) — pot noir commun,
  couvercle et bandeau à la couleur de la gamme.
- **Typographie** : Sakana réservée au mot-symbole ; **Barlow Condensed** ExtraBold italique pour
  les titres ; Roboto conservée pour le texte. Suppression de Montserrat/Bahnschrift apparus par erreur.
- **Éléments graphiques** : une seule inclinaison (14°) pour bandeaux, aplats et motif ; traitement
  photo duotone rouge.
- **Textes** : manifeste réécrit, coquilles corrigées (« côtôt », « comprimés », « décrire » → « déformer »),
  ton de voix et signature proposée : **« La force, en stock. »**
- **Maquettes** cohérentes (fini les fonds vert/violet/orange) : packaging, shaker, textile,
  papeterie, enseigne, Instagram, site web.

## Régénérer les maquettes

```bash
cd mockups
node render.mjs            # toutes les scènes
node render.mjs 03-shaker  # une seule
```

Nécessite Node et Playwright (Chromium). Les polices Barlow Condensed et Roboto sont chargées
depuis Google Fonts.

## À compléter

Coordonnées (téléphone, e-mail, adresse), nom du compte Instagram, horaires, offre fidélité,
noms et poids des produits : ce sont des exemples dans les maquettes.
