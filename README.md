# site-hashdumb

Hub / portfolio statique servi sur **hashdumb.fr** via **Cloudflare** (Worker static assets, aucun serveur).

- Page unique : `index.html` (aucune dépendance, aucun build) — un terminal troll avec un **coffre-fort**.
- Les ressources et projets ne sont **pas en clair** : ils sont chiffrés (AES-GCM, clé PBKDF2) dans `const COFFRE`
  et ne se déchiffrent qu'avec le mot de passe trouvé via le mini-challenge.

## Modifier le contenu du coffre
1. Éditer `tools/coffre.json` (**local uniquement**, gitignoré — c'est le contenu en clair).
2. `node tools/scelle.mjs <motdepasse>` → réécrit `const COFFRE` dans `index.html`.
3. Commit + push.

Changer le mot de passe : mettre son base64 dans `SHADOW_PW` (`index.html`), puis relancer `scelle.mjs` avec le nouveau.

## Déploiement
`git push` sur `main` ⇒ redéploiement automatique du Worker `site-hashdumb`.
Custom domain : `hashdumb.fr` (+ `www`).
