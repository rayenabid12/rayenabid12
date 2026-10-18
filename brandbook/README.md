# Para Elixea — Charte graphique 2.0

Refonte complète de la charte graphique Para Elixea (édition du 10/10/2025), en 39 pages 16:9.

## Contenu

| Dossier | Contenu |
| --- | --- |
| `export/Para-Elixea-Charte-Graphique-v2.pdf` | La charte, prête à envoyer au client (39 pages, 1920 × 1080) |
| `export/apercus/` | Aperçus JPG de chaque page |
| `logo/` | Logos SVG vectoriels : horizontal, vertical, monogramme, logotype × Vert Marine, Encre, Blanc |
| `index.html` | Version web de la charte (générée, ne pas éditer à la main) |
| `src/` | Sources : `styles.css`, `shell.html` et les trois fichiers de pages |
| `assets/` | Recadrages de la photo du point de vente |
| `tools/` | `build.py` (assemble `index.html`) et `export.js` (PDF + PNG via Playwright) |

## Régénérer

```bash
python3 brandbook/tools/build.py
node brandbook/tools/export.js --pdf --png --out brandbook/export
```

## Ce qui a changé par rapport à la v1

- Avatar cartoon retiré de toutes les pages ; pied de page et pagination cohérents.
- Logo vectoriel extrait du PDF d'origine (tracé inchangé), décliné en 4 formats et 3 couleurs.
- Règle corrigée : le blanc sur Vert Sauge (contraste 2,4:1) est interdit, le logo y passe en Encre.
- Palette : ajout de l'Encre Marine (#0E3442) et de la Porcelaine (#F5F3EF), valeurs CMJN/Pantone indicatives, échelles de nuances, proportions, contrastes WCAG.
- Typographie : Montserrat (substitut libre de Gotham) + Cormorant Garamond ; Calibri abandonnée. Incohérence « ALL CAPS » corrigée (le logotype est en casse mixte).
- Nouveaux chapitres : plateforme de marque, valeurs, ton de voix, zone de protection, usages interdits, l'arche (issue du mobilier de la boutique), motifs, pictogrammes, direction photo.
- Maquettes refaites : papeterie, sacs, sachet, gamme en propre, cartes fidélité/cadeau, façade, tenue, Instagram, publications, site web. Les contenus hors sujet de la v1 (« For Happy Healthy Smile », « 24/7 OPEN », logos concurrents) ont disparu.
- Fautes corrigées (« COLEURS », « Tapez en cours d'utilisation »), tout le document en français.

## À compléter avant diffusion

Les éléments suivants sont des **exemples** à remplacer par les vraies informations :
téléphone `+216 72 000 000`, `contact@paraelixea.tn`, `paraelixea.tn`, `@paraelixea`,
les noms (Amira Ben Salah, Leïla Trabelsi), les horaires, les chiffres Instagram et les montants des cartes cadeau.

La seule photo disponible du point de vente date de l'installation : prévoir une séance photo de la boutique terminée.
