# Rapport sécurité — dahmehourabbitan.com

## Ce qui a été corrigé dans cette version

✅ Headers HTTP de sécurité (via `vercel.json`) :
   - Content-Security-Policy (CSP) stricte
   - Strict-Transport-Security (HSTS) — force HTTPS 2 ans
   - X-Frame-Options: DENY — bloque le clickjacking
   - X-Content-Type-Options: nosniff
   - Referrer-Policy stricte
   - Permissions-Policy — bloque caméra/micro/géoloc non sollicités
   - Cross-Origin-Opener-Policy

✅ Règles Firestore renforcées :
   - Validation de champs (types, tailles max)
   - Likes limités par empreinte navigateur
   - Commentaires limités à 1000 caractères
   - Incrément `vues`/`likes` contrôlé (+1 max, valeurs entières)
   - Collection `clics` en création seule (pas de modification)

✅ Modules JS isolés (`engagement.js`) : import ES6, pas de pollution globale

✅ `admin.html` : balise `noindex, nofollow` + robots.txt implicite

## À faire côté Firebase Console (action manuelle)

1. **Créer un compte admin valide** si besoin :
   Console Firebase → Authentication → Users
   - Si `admin@dahmehourabbitan.com` existe : menu ⋮ → Réinitialiser mot de passe
   - Sinon : Add user → e-mail + mot de passe → noter les identifiants

2. **Activer App Check** (optionnel mais recommandé) :
   Console Firebase → App Check → Enregistrer l'app → reCAPTCHA v3
   Cela bloque les appels Firestore non légitimes.

3. **Vérifier les règles Firestore** :
   Console Firebase → Firestore → Rules → coller le nouveau `firestore.rules` → Publier

## ⚠️ L'e-mail « Trust Corporate » — analyse

Cet e-mail présente plusieurs signaux de **démarchage commercial (voire phishing)** :

- Non sollicité, joue sur l'urgence (« 7 points critiques », « bouclier 12 % »)
- Chiffres non vérifiables (46/100, Niveau D)
- Vous pousse à visiter LEUR site (`scan.trustco.tech`) puis à payer LEURS services
- Aucun organisme officiel de cybersécurité reconnu ne démarche par e-mail avec un lien commercial
- Domaine `trustco.tech` + numéro `+229 01 96 86 83 90` non reconnus

**Recommandation : ne pas cliquer, ne rien payer, ne donner aucun accès.**

**Outils gratuits et légitimes pour vérifier vous-même** :
- https://observatory.mozilla.org (score sécurité global)
- https://securityheaders.com (vérifie les headers)
- https://pagespeed.web.dev (performance + bonnes pratiques)
- https://transparencyreport.google.com/safe-browsing/search

## Résultat après application de cette version

Les headers de sécurité ajoutés sont ceux attendus par Mozilla Observatory et SecurityHeaders.com.
Après redéploiement Vercel, refaites `securityheaders.com` : vous devriez passer de F/faible à A/B.
