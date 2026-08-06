# Mettre BET Manager en ligne — AWS Amplify

Guide pas à pas pour héberger l'application sur **AWS Amplify Hosting** (que vous possédez déjà),
avec une base **PostgreSQL** dans le cloud. Comptez ~20 à 30 minutes.

À la fin, vous aurez une URL du type `https://main.xxxxxxxx.amplifyapp.com`, accessible
depuis n'importe quel navigateur.

> Le projet est **déjà préparé pour Amplify** : il contient un fichier `amplify.yml`
> (instructions de build) et la cible binaire Prisma nécessaire au runtime Lambda d'Amplify.
> Vous n'avez rien à modifier dans le code.

---

## Ce dont vous avez besoin

1. Votre compte **AWS / Amplify**.
2. Un compte **GitHub** (gratuit) — Amplify déploie depuis un dépôt Git.
3. Une base **PostgreSQL** cloud. Amplify n'en fournit pas directement ; le plus simple est
   **Neon** (gratuit). Alternative AWS native : **Amazon RDS for PostgreSQL** (payant, décrit en fin de guide).

---

## Étape 1 — Créer la base PostgreSQL (Neon, gratuit)

1. Créez un compte sur https://neon.com.
2. Créez un projet ; choisissez une région proche de celle de votre app Amplify
   (ex. Europe / Frankfurt `eu-central-1`).
3. Copiez la **chaîne de connexion** au format **pooled** (bouton « Connection string » →
   activez *Pooled connection*), du type :

   ```
   postgresql://user:password@ep-xxxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```

   Gardez-la de côté pour l'étape 4.

> **Pourquoi la version « pooled » ?** Amplify exécute le rendu serveur dans des fonctions
> Lambda qui peuvent démarrer en grand nombre. L'URL *pooled* (avec `-pooler` dans le nom d'hôte)
> évite de saturer la base en connexions.

---

## Étape 2 — Mettre le code sur GitHub

Si `git` n'est pas installé : https://git-scm.com.

1. Sur https://github.com, créez un dépôt **vide** nommé `bet-manager`.
2. Dans le dossier du projet (décompressé), exécutez :

   ```bash
   git init
   git add .
   git commit -m "BET Manager - version initiale"
   git branch -M main
   git remote add origin https://github.com/VOTRE-COMPTE/bet-manager.git
   git push -u origin main
   ```

> Le fichier `.env` (identifiants de base) est exclu par `.gitignore` : vos secrets ne partent pas sur GitHub.

---

## Étape 3 — Créer l'application dans Amplify

1. Ouvrez la **console AWS Amplify** : https://console.aws.amazon.com/amplify.
2. **Create new app** → **Deploy an app** → choisissez **GitHub**, autorisez l'accès,
   puis sélectionnez le dépôt `bet-manager` et la branche `main`.
3. Amplify détecte **Next.js (SSR)** et lit automatiquement le fichier **`amplify.yml`**
   fourni dans le projet — ne modifiez pas les commandes de build.
4. **Ne lancez pas encore le déploiement** : ajoutez d'abord la variable d'environnement (étape 4).

---

## Étape 4 — Définir la variable d'environnement `DATABASE_URL`

1. Dans l'écran de configuration (ou plus tard : **App settings → Environment variables**),
   ajoutez :
   - **Variable** : `DATABASE_URL`
   - **Value** : la chaîne de connexion Neon copiée à l'étape 1.
2. Enregistrez.

> Le `amplify.yml` recopie cette variable dans un fichier `.env` au moment du build, afin
> qu'elle soit disponible **à l'exécution** (côté Lambda) en plus du build. C'est volontaire
> et nécessaire sur Amplify.

---

## Étape 5 — Déployer

1. Lancez **Save and deploy**.
2. Amplify exécute les phases du `amplify.yml` :
   `npm install` → `prisma generate` → `prisma db push` (**crée toutes les tables**) → `next build`.
3. Après quelques minutes, l'application est en ligne sur son URL `*.amplifyapp.com`. 🎉

L'application démarre avec une base **vide**, prête pour vos vraies données.

---

## Étape 6 — (Optionnel) Charger les données de démonstration

Pour une démo, vous pouvez injecter les exemples depuis votre machine, en pointant vers la base cloud :

```bash
# .env local contenant la même DATABASE_URL (Neon) :
npm install
npm run db:seed
```

> ⚠️ Le seed **efface toutes les données** avant d'insérer les exemples. À n'utiliser que sur
> une base de démonstration.

---

## Mises à jour ultérieures

```bash
git add .
git commit -m "Description de la modification"
git push
```

Amplify **redéploie automatiquement** à chaque `git push` sur `main`. Si vous avez modifié
`schema.prisma`, l'étape `prisma db push` du build met la base à jour.

---

## Points d'attention

**Téléversement de fichiers.** Le disque des fonctions Amplify est en lecture seule : l'upload
de documents n'y fonctionne pas. L'application ne plante pas pour autant — utilisez le champ
**« lien externe »**. Pour un vrai stockage, branchez **Amazon S3** (évolution possible).

**Authentification.** Pas encore de page de connexion : toute personne ayant l'URL peut accéder
à l'app. Avant un usage réel, ajoutez une authentification (**NextAuth.js**, ou **Amplify Auth /
Cognito**). Je peux m'en charger.

**Coûts.** Amplify Hosting a une offre gratuite (limites de build/traffic mensuelles) puis
facture à l'usage. Neon est gratuit dans ses quotas. Surveillez la facturation AWS.

---

## Dépannage rapide

- **Build échoue : « Environment variable not found: DATABASE_URL »**
  → La variable n'est pas définie dans Amplify (étape 4). Ajoutez-la, puis **Redeploy**.

- **Erreur au chargement des pages : « Query engine library for current platform … not found » / `PrismaClientInitializationError`**
  → C'est le cas que la cible binaire règle. Vérifiez que `schema.prisma` contient bien
  `binaryTargets = ["native", "rhel-openssl-1.0.x", "rhel-openssl-3.0.x"]` (déjà inclus),
  puis redéployez pour régénérer le client.

- **« too many connections » / erreurs intermittentes de base**
  → Utilisez l'URL **pooled** de Neon (nom d'hôte avec `-pooler`).

- **Le build échoue sur la version de Node**
  → Dans **App settings → Build settings → Build image settings**, fixez la version de Node à **20**.

- **« Table does not exist »**
  → L'étape `prisma db push` n'a pas tourné. Vérifiez la présence de `amplify.yml` à la racine
  du dépôt et relancez un déploiement.

---

## Alternative : base sur Amazon RDS (au lieu de Neon)

Si vous préférez rester 100 % AWS :

1. Créez une instance **RDS for PostgreSQL** (la plus petite classe suffit pour démarrer).
2. Activez l'accès réseau requis et notez l'hôte, le port (5432), l'utilisateur, le mot de passe et le nom de base.
3. Construisez `DATABASE_URL` :
   `postgresql://UTILISATEUR:MOTDEPASSE@HOTE-RDS:5432/NOMBASE?sslmode=require`
4. Utilisez-la à l'étape 4 à la place de l'URL Neon.

> RDS est payant et demande un peu de configuration réseau (groupes de sécurité). Pour démarrer
> vite et sans frais, Neon reste le plus simple ; vous pourrez migrer vers RDS plus tard sans
> changer le code (seule `DATABASE_URL` change).

---

Besoin d'aide sur une étape, ou vous voulez que j'ajoute l'**authentification** (Cognito/NextAuth)
et le **stockage S3** avant la mise en ligne ? Dites-le-moi.
