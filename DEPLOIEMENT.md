# Mettre BET Manager en ligne — Vercel

Alternative à AWS Amplify. Hébergement **Vercel** + **PostgreSQL** cloud. ~15 min.

> **Vous utilisez AWS Amplify ?** Suivez plutôt `DEPLOIEMENT-AMPLIFY.md`.

> **Pourquoi PostgreSQL et pas SQLite ?** Sur un hébergement serverless, le disque est éphémère :
> un fichier SQLite serait effacé à chaque déploiement. Le projet est configuré pour PostgreSQL.

## Étapes

1. **GitHub** — Déposez le projet sur un dépôt GitHub (le plus simple : GitHub Desktop → Publish).
   Le `.env` est exclu par `.gitignore`.

2. **Base PostgreSQL** — Créez-en une gratuite : soit via Vercel (**Storage → Create Database →
   Prisma Postgres / Neon**, la variable `DATABASE_URL` est ajoutée automatiquement), soit sur
   https://neon.com (copiez la chaîne *pooled*).

3. **Importer dans Vercel** — https://vercel.com → **Add New → Project** → choisissez le dépôt.
   Vercel détecte Next.js ; le projet fournit déjà le script `vercel-build`
   (`prisma generate && prisma db push && next build`).

4. **Variable d'environnement** — Si vous n'utilisez pas l'intégration Vercel, ajoutez
   `DATABASE_URL` dans **Settings → Environment Variables** (Production + Preview + Development).

5. **Deploy** — Vercel exécute le build, crée les tables (`prisma db push`) et publie l'URL.

6. **Données de démo (optionnel)** — En local avec la même `DATABASE_URL` : `npm run db:seed`
   (⚠️ efface tout avant d'insérer les exemples).

## Mises à jour

Chaque `git push` déclenche un redéploiement automatique.

## Points d'attention

- **Uploads de fichiers** : disque en lecture seule → utilisez le champ « lien externe » ou
  branchez **Vercel Blob / S3**.
- **Authentification** : à ajouter (NextAuth.js) avant un usage réel — l'URL est publique.

## Dépannage

- **« Environment variable not found: DATABASE_URL »** → variable manquante (étape 4) ou base
  non créée (étape 2). Ajoutez-la puis *Redeploy*.
- **« too many connections »** → utilisez l'URL **pooled**.
- **« Table does not exist »** → l'étape `prisma db push` n'a pas tourné ; vérifiez le script
  `vercel-build` dans `package.json` puis redéployez.
