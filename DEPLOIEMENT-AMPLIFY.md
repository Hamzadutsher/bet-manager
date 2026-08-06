# Mettre BET Manager en ligne — AWS Amplify

Guide pas à pas pour héberger l'application sur **AWS Amplify Hosting**, avec une base
**PostgreSQL** dans le cloud. Comptez ~20 à 30 minutes.

À la fin, vous aurez une URL du type `https://main.xxxxxxxx.amplifyapp.com`.

> Le projet est **déjà préparé pour Amplify** : il contient `amplify.yml` (build, avec **Node 20**
> forcé) et la cible binaire Prisma nécessaire au runtime Lambda. Vous n'avez rien à modifier dans le code.

> ⚠️ **Cause d'échec n°1 :** oublier de créer la base de données et de renseigner `DATABASE_URL`.
> Sans elle, le build échoue — et l'URL renvoie alors une **erreur 404** (car rien n'est publié).
> Faites impérativement les étapes 1 et 4 **avant** de déployer.

---

## Ce dont vous avez besoin

1. Votre compte **AWS / Amplify**.
2. Un compte **GitHub** — Amplify déploie depuis un dépôt Git.
3. Une base **PostgreSQL** cloud. Amplify n'en fournit pas ; le plus simple est **Neon** (gratuit).
   Alternative AWS native : **Amazon RDS for PostgreSQL** (payant, en fin de guide).

---

## Étape 1 — Créer la base PostgreSQL (Neon, gratuit)

1. Créez un compte sur https://neon.com.
2. Créez un projet ; région proche (ex. Europe / Frankfurt `eu-central-1`).
3. Copiez la **chaîne de connexion** au format **pooled** (activez *Pooled connection*) :

   ```
   postgresql://user:password@ep-xxxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```

   Gardez-la pour l'étape 4.

> **Pourquoi « pooled » ?** Amplify exécute le rendu serveur dans des fonctions Lambda
> nombreuses. L'URL *pooled* (avec `-pooler`) évite de saturer la base en connexions.

---

## Étape 2 — Mettre le code sur GitHub

Le plus simple : **GitHub Desktop** (https://desktop.github.com).
Connectez votre compte, puis **File → Add local repository** → dossier `bet-manager` →
lien « create a repository » → **Commit to main** → **Publish repository**.

Le fichier `.env` (identifiants de base) est exclu par `.gitignore` : vos secrets ne partent pas sur GitHub.

---

## Étape 3 — Créer l'application dans Amplify

1. Console AWS Amplify : https://console.aws.amazon.com/amplify.
2. **Create new app → Deploy an app → GitHub**, autorisez l'accès, choisissez le dépôt et la branche `main`.
3. Amplify détecte **Next.js (SSR)** et lit automatiquement `amplify.yml` — ne modifiez pas les commandes.
4. **Ne déployez pas encore** : ajoutez d'abord la variable (étape 4).

---

## Étape 4 — Définir `DATABASE_URL` (indispensable)

1. **App settings → Environment variables → Manage variables → Add**.
   - **Variable** : `DATABASE_URL`
   - **Value** : la chaîne de connexion Neon (étape 1).
   - Portée : toutes les branches.
2. Enregistrez.

> `amplify.yml` recopie cette variable dans un fichier `.env` au build pour qu'elle soit aussi
> disponible **à l'exécution** (Lambda). C'est volontaire et nécessaire sur Amplify.

---

## Étape 5 — Déployer

1. Lancez **Save and deploy**.
2. Amplify exécute : Node 20 → `npm install` → `prisma generate` → `prisma db push`
   (**crée les tables**) → `next build`.
3. Après quelques minutes, l'application est en ligne. 🎉 La base démarre **vide**, prête pour vos données.

---

## Étape 6 — (Optionnel) Données de démonstration

```bash
# En local, .env pointant vers la même base Neon :
npm install
npm run db:seed   # ⚠️ efface tout puis insère les exemples — base de démo uniquement
```

---

## Mises à jour ultérieures

Dans GitHub Desktop : **Commit** puis **Push**. Amplify **redéploie automatiquement**.
Si vous avez modifié `schema.prisma`, l'étape `prisma db push` met la base à jour.

---

## Points d'attention

**Téléversement de fichiers.** Disque en lecture seule sur Amplify : l'upload de documents
n'y fonctionne pas (l'app ne plante pas — utilisez le champ **« lien externe »**). Pour un vrai
stockage, branchez **Amazon S3**.

**Authentification.** Pas encore de page de connexion : l'URL est publique. Avant un usage réel,
ajoutez une authentification (**NextAuth.js** ou **Amplify Auth / Cognito**).

**Coûts.** Amplify et Neon ont des offres gratuites (avec quotas). Surveillez la facturation AWS.

---

## Dépannage rapide

- **L'URL affiche une erreur 404 / le déploiement a échoué**
  → Le build a échoué : rien n'est publié. Ouvrez le build en rouge dans Amplify, dépliez la
  phase **Build**, et lisez l'erreur (souvent avant `!!! Build failed`). Causes fréquentes ci-dessous.

- **« Environment variable not found: DATABASE_URL » / le garde-fou affiche « DATABASE_URL n'est pas définie »**
  → Créez la base (étape 1) et ajoutez la variable dans Amplify (étape 4), puis **Redeploy**.

- **« Query engine … not found » / `PrismaClientInitializationError` au chargement des pages**
  → Vérifiez que `schema.prisma` contient bien
  `binaryTargets = ["native", "rhel-openssl-1.0.x", "rhel-openssl-3.0.x"]` (déjà inclus), puis redéployez.

- **Erreur de version Node**
  → Déjà gérée : `amplify.yml` force Node 20. Sinon, **App settings → Build settings → Build image settings → Node = 20**.

- **« too many connections »**
  → Utilisez l'URL **pooled** de Neon (hôte avec `-pooler`).

- **« Table does not exist »**
  → `prisma db push` n'a pas tourné. Vérifiez que `amplify.yml` est bien à la racine du dépôt, puis redéployez.

---

## Alternative : base sur Amazon RDS

1. Créez une instance **RDS for PostgreSQL** (petite classe pour démarrer).
2. Notez hôte, port (5432), utilisateur, mot de passe, nom de base ; ouvrez l'accès réseau.
3. `DATABASE_URL` = `postgresql://UTILISATEUR:MOTDEPASSE@HOTE-RDS:5432/NOMBASE?sslmode=require`
4. Utilisez-la à l'étape 4 à la place de Neon.

> RDS est payant et demande de la configuration réseau (security groups). Pour démarrer vite et
> sans frais, Neon reste le plus simple ; le code ne change pas (seule `DATABASE_URL` change).
