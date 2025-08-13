# Guide de configuration des thèmes (zPedMenu)

Ce document explique comment créer, modifier et utiliser les thèmes de l'interface NUI du ped menu.

---
## 1. Emplacement des thèmes
Chaque thème est un fichier `.json` dans le dossier :
```
resources/zPedMenu/themes/
```
Exemples existants : `default.json`, `blue.json`, `emerald.json`, `white.json`, `black.json`, `gothic.json`, etc.

Le fichier est chargé côté client via le callback NUI `get_theme` / `set_theme` et ses valeurs sont transformées en variables CSS.

---
## 2. Structure d'un fichier de thème
Clés supportées :
| Clé | Description | Exemple |
|-----|-------------|---------|
| name | Nom lisible affiché dans l'UI | "Bleu Néon" |
| accent | Couleur principale (boutons actifs, bordures animées) | "#3b82f6" |
| accentSoft | Variante transparente pour surbrillance douce | "rgba(59,130,246,0.2)" |
| panelBackground | Fond du panneau principal (peut être un gradient) | "rgba(24,24,27,0.85)" |
| panelBorder | Bordure du panneau | "rgba(59,130,246,0.35)" |
| backgroundOverlay | (Optionnel) Fond global derrière le panneau (overlay translucide) | "rgba(0,0,0,0.2)" / gradient |
| backgroundBlur | Valeur du blur appliqué à l'overlay | "6px" |
| itemBg | Fond d'un item normal | "#27272a" |
| itemBgHover | Fond d'un item hover | "#3f3f46" |
| itemBgActive | Fond item sélectionné | "#3f3f46" |
| favoriteBg | Fond icône favori actif | "#ffffff" |
| favoriteInactiveBg | Fond icône favori inactif | "rgba(255,255,255,0.2)" |
| textPrimary | Texte principal | "#ffffff" |
| textSecondary | Texte secondaire | "#a1a1aa" |
| textMuted | Texte atténué | "#71717a" |
| scrollbarThumb | Couleur du pouce de scrollbar | "#FF3837" |
| scrollbarTrack | Arrière-plan de scrollbar | "#27272a" |
| svgAccent | Couleur dynamique des SVG (étoiles, etc.) | "#FF3837" |
| radius | Rayon de bordure UI | "8px" |
| fontFamily | Pile de polices utilisée | "'Inter', sans-serif" |

Toutes les clés ne sont pas obligatoires mais **accent**, **panelBackground**, **textPrimary** sont fortement recommandées. Les clés manquantes ne seront pas appliquées (pas d'erreur bloquante).

---
## 3. Exemple minimal
```json
{
  "name": "Mon Thème Perso",
  "accent": "#ff8800",
  "accentSoft": "rgba(255,136,0,0.25)",
  "panelBackground": "rgba(20,20,22,0.9)",
  "panelBorder": "rgba(255,136,0,0.4)",
  "itemBg": "#1f1f23",
  "itemBgHover": "#2a2a30",
  "itemBgActive": "#35353d",
  "textPrimary": "#ffffff",
  "textSecondary": "#c2c2c7",
  "textMuted": "#7d7d85",
  "scrollbarThumb": "#ff8800",
  "scrollbarTrack": "#202024",
  "svgAccent": "#ffb347",
  "radius": "10px",
  "fontFamily": "'Inter', sans-serif"
}
```
Enregistrez ce fichier sous `themes/orange.json`.

---
## 4. Activation d'un thème par défaut
Dans `config.lua` :
```lua
config.theme = "orange" -- correspond au nom du fichier orange.json
```
Redémarrez la ressource ou le serveur.

---
## 5. Changer de thème dynamiquement (NUI)
Le client React appelle :
```ts
fetchNui('set_theme', { name: 'gothic' });
// Puis recharger les variables :
fetchNui('get_theme');
```
ou directement :
```ts
const resp = await fetchNui('set_theme', { name: 'white' });
// resp.current contient le nom
```
`get_theme` renvoie :
```json
{
  "current": "white",
  "themes": { "white": { ...definition... } }
}
```

---
## 6. Variables CSS générées
Chaque clé est injectée sous forme de variable CSS sur `:root` :
```
--accent, --accent-soft, --panel-bg, --panel-border,
--bg-image (si existait), --bg-overlay, --bg-blur,
--item-bg, --item-bg-hover, --item-bg-active,
--favorite-bg, --favorite-inactive-bg,
--text-primary, --text-secondary, --text-muted,
--scrollbar-thumb, --scrollbar-track,
--svg-accent, --radius, --font-family
```
Vous pouvez les utiliser dans votre CSS/JSX :
```jsx
style={{ color: 'var(--text-secondary)', background: 'var(--item-bg)' }}
```

---
## 7. Ajouter une police personnalisée
1. Ajouter l'@import dans `web/src/index.css` (ou équivalent) :
```css
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap');
```
2. Dans le thème :
```json
"fontFamily": "'Cinzel', 'serif'"
```

---
## 8. Dégradés & overlays avancés
Vous pouvez utiliser :
```json
"panelBackground": "linear-gradient(135deg, rgba(10,10,14,0.9), rgba(30,10,20,0.85))",
"backgroundOverlay": "radial-gradient(circle at 40% 30%, rgba(255,0,80,0.15), rgba(0,0,0,0.6))"
```
Blur contrôlé via `backgroundBlur`.

---
## 9. Couleurs SVG
`svgAccent` alimente `var(--svg-accent)` utilisé pour remplir certaines icônes (étoiles de favoris etc.).

---
## 10. Debug / Problèmes courants
| Problème | Cause probable | Solution |
|----------|----------------|----------|
| Le thème ne change pas | Nom mal orthographié | Vérifier le fichier + `config.theme` |
| Rien ne s'applique | JSON invalide | Valider sur jsonlint.com |
| Couleur manquante | Clé absente | Ajouter la clé ou laisser fallback |
| Police non prise | @import manquant | Ajouter l'import dans le CSS global |
| set_theme renvoie not_found | Fichier absent ou mal nommé | Vérifier `themes/nom.json` |

Astuce : ouvrir la console NUI (F8 / devtools) et vérifier les variables CSS sur `document.documentElement`.

---
## 11. Bonnes pratiques
- Garder un contraste suffisant (ratio > 4.5 pour texte important).
- Utiliser `accentSoft` toujours semi‑transparent (alpha 0.15–0.35).
- Éviter trop de saturation simultanée (accent chaud + items neutres).
- Grouper les variantes (ex: light/dark) avec un préfixe (`light_blue.json`, `dark_blue.json`).

---
## 12. Aller plus loin
Idées :
- Ajouter un sélecteur direct dans l'UI (dropdown thèmes).
- Stocker le dernier thème choisi dans `localStorage` côté NUI.
- Ajouter un endpoint serveur pour pousser un thème événementiel (Halloween, Noël...).

Exemple de stockage côté client :
```ts
const last = localStorage.getItem('zpm_theme');
if (last) fetchNui('set_theme', { name: last });
// Quand l'utilisateur change :
localStorage.setItem('zpm_theme', newName);
```

---
## 13. Checklist création d'un nouveau thème
1. Copier un fichier existant.
2. Renommer et ajuster `name` + couleurs.
3. (Optionnel) Ajouter `svgAccent` si différent.
4. Ajouter/ajuster `fontFamily` + importer la police.
5. Tester en jeu avec `set_theme`.
6. Vérifier le contraste et lisibilité.

---
## 14. Support
Si un thème casse :
- Supprimer progressivement des clés jusqu'à trouver la fautive.
- Valider la JSON syntaxe.
- Vérifier la console NUI (erreurs fetchNui).

---
Bon theming !
