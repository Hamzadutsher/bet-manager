# Mettre BET Manager en ligne — Guide de déploiement

Ce guide vous accompagne pour publier l'application sur **Vercel** (hébergement gratuit
pour ce type d'usage) avec une base **PostgreSQL** dans le cloud. Comptez ~15 à 20 minutes.

À la fin, vous aurez une URL du type `https://bet-manager-xxxx.vercel.app` accessible
depuis n'importe quel navigateur, par vous et votre équipe.

> **Pourquoi PostgreSQL et pas SQLite ?** En local, une base SQLite (un simple fichier)
> suffit. Mais sur un hébergement comme Vercel, le disque est *éphémère* : le fichier
> serait effacé à chaque déploiement. Le projet est donc déjà configuré pour PostgreSQL,
> une base hébergée qui conserve vos données de façon permanente.

---

## Ce dont vous avez besoin

1. Un compte **GitHub** (gratuit) — pour héberger le code.
2. Un compte **Vercel** (gratuit) — pour l'hébergement de l'application.
3. Une base **PostgreSQL** cloud (gratuite) — deux options simples décrites plus bas.

Aucune carte bancaire n'est requise pour les offres gratuites.

---

## Étape 1 — Mettre le code sur GitHub

Vercel déploie à partir d'un dépôt GitHub. Si vous n'avez pas `git` installé, téléchargez-le
sur https://git-scm.com.

1. Créez un compte sur https://github.com puis un **nouveau dépôt** (bouton « New »),
   par exemple nommé `bet-manager`. Laissez-le **vide** (ne cochez ni README ni .gitignore).
2. Dans le dossier du projet (décompressé), ouvrez un terminal et exécutez :

   ```bash
   git init
   git add .
   git commit -m "BET Manager - version initiale"
   git branch -M main
   git remote add origin https://github.com/VOTRE-COMPTE/bet-manager.git
   git push -u origin main
   ```

   Remplacez `VOTRE-COMPTE` par votre nom d'utilisateur GitHub.

> Le fichier `.env` (qui contient vos identifiants de base de données) est volontairement
> **exclu** du dépôt par `.gitignore`. Vos secrets ne seront donc jamais publiés sur GitHub.

---

## Étape 2 — Créer la base de données PostgreSQL

Choisissez **une** des deux options ci-dessous.

### Option A (recommandée) — Prisma Postgres via Vercel

C'est le chemin le plus simple : la base se crée depuis Vercel et la variable de connexion
est ajoutée automatiquement à votre projet.

1. Créez un compte sur https://vercel.com (connectez-vous avec GitHub).
2. Vous configurerez la base à l'**étape 3**, directement dans l'onglet **Storage** du projet
   (« Create Database » → **Prisma Postgres** ou **Neon**). La variable `DATABASE_URL`
   sera alors renseignée pour vous.

### Option B — Neon (base indépendante)

1. Créez un compte sur https://neon.com (offre gratuite).
2. Créez un projet ; choisissez une région proche (ex. Europe / Frankfurt).
3. Copiez la **chaîne de connexion** (« Connection string », format *pooled*), du type :

   ```
   postgresql://user:password@ep-xxxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```

   Vous la collerez dans Vercel à l'étape 4.

---

## Étape 3 — Importer le projet dans Vercel

1. Sur https://vercel.com, cliquez **Add New… → Project**.
2. Sélectionnez le dépôt GitHub `bet-manager` (autorisez Vercel à accéder à vos dépôts si demandé).
3. Vercel détecte automatiquement **Next.js** — ne changez pas les réglages de build
   (le projet fournit déjà la bonne commande via le script `vercel-build`).
4. **Ne cliquez pas encore sur Deploy** : configurez d'abord la base (étape 4).

Si vous avez choisi l'**option A**, ouvrez l'onglet **Storage** du projet, cliquez
« Create Database », choisissez **Prisma Postgres** (ou **Neon**), validez : la variable
`DATABASE_URL` est ajoutée automatiquement. Passez alors directement à l'**étape 5**.

---

## Étape 4 — Renseigner la variable d'environnement (option B / Neon)

Uniquement si vous avez créé la base vous-même (Neon) :

1. Dans Vercel, ouvrez **Settings → Environment Variables**.
2. Ajoutez une variable :
   - **Name** : `DATABASE_URL`
   - **Value** : la chaîne de connexion copiée à l'étape 2 (option B)
   - **Environments** : cochez *Production*, *Preview* et *Development*.
3. Enregistrez.

---

## Étape 5 — Déployer

1. Cliquez **Deploy**.
2. Vercel exécute automatiquement, via le script `vercel-build` du projet :
   `prisma generate && prisma db push && next build`.
   L'étape `prisma db push` **crée toutes les tables** dans votre base PostgreSQL.
3. Au bout de 1 à 2 minutes, vous obtenez l'URL publique de l'application. 🎉

Ouvrez l'URL : l'application fonctionne, avec une base **vide** (aucun client, devis, etc.),
prête à recevoir vos vraies données.

---

## Étape 6 — (Optionnel) Injecter les données de démonstration

Par défaut, la production démarre **à vide** — ce qui est souhaitable pour un usage réel.

Si vous voulez tout de même charger les données d'exemple (utile pour une démonstration) :

```bash
# Dans le dossier du projet, avec DATABASE_URL pointant vers la base cloud :
npm run db:seed
```

> ⚠️ Le script de démo **efface d'abord toutes les données** avant d'insérer les exemples.
> Ne l'exécutez jamais sur une base contenant de vraies données.

---

## Mettre à jour l'application plus tard

Chaque fois que vous modifiez le code :

```bash
git add .
git commit -m "Description de la modification"
git push
```

Vercel **redéploie automatiquement** à chaque `git push`. Si vous avez modifié le schéma
de données (`schema.prisma`), l'étape `prisma db push` du build applique les changements
à la base.

---

## Points d'attention

**Téléversement de fichiers.** L'upload de documents écrit sur le disque local, ce qui ne
fonctionne pas sur Vercel (disque en lecture seule). Dans ce cas, l'application n'échoue pas :
utilisez le champ **« lien externe »** pour référencer un document (Google Drive, etc.).
Pour un vrai stockage de fichiers, intégrez **Vercel Blob** ou un bucket **S3** (évolution possible).

**Authentification.** L'application n'a pas encore de page de connexion : toute personne
disposant de l'URL peut y accéder. Avant un usage réel avec des données sensibles, ajoutez
une authentification (ex. **NextAuth.js**) — je peux m'en charger si vous le souhaitez.

**Sauvegardes.** Les offres Postgres gratuites conservent vos données mais avec des limites
(quotas, éventuelle mise en veille après inactivité). Pour un usage professionnel durable,
prévoyez une offre payante de base de données et des sauvegardes régulières.

---

## Dépannage rapide

- **Le build échoue sur « Environment variable not found: DATABASE_URL »**
  → La variable `DATABASE_URL` n'est pas définie dans Vercel (étape 4) ou la base
  Prisma Postgres n'a pas été créée (étape 3). Ajoutez-la puis relancez le déploiement
  (onglet *Deployments* → *Redeploy*).

- **Erreur de connexion à la base / trop de connexions**
  → Utilisez bien l'URL **« pooled »** (avec `-pooler` dans le nom d'hôte pour Neon).

- **La page s'affiche mais aucune donnée**
  → Normal : la base est vide. Créez un client depuis l'interface, ou lancez le seed (étape 6).

- **« Table does not exist »**
  → L'étape `prisma db push` n'a pas tourné. Vérifiez que le script `vercel-build` est bien
  présent dans `package.json`, puis redéployez.

---

## Alternative : déploiement sans GitHub (Vercel CLI)

Si vous préférez ne pas passer par GitHub :

```bash
npm i -g vercel      # installe l'outil Vercel
vercel               # suit les instructions pour lier le projet
vercel env add DATABASE_URL   # renseigne l'URL de la base
vercel --prod        # déploie en production
```

---

Besoin d'aide sur une étape précise, ou vous voulez que j'ajoute l'authentification et le
stockage de fichiers avant la mise en ligne ? Dites-le-moi.
