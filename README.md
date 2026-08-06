# BET Manager — Logiciel de gestion pour bureau d'études techniques

Application web de gestion interne et externe pour un bureau d'études techniques.
Développée avec **Next.js 14** (App Router), **Prisma** et **SQLite**.

## Modules

- **Tableau de bord** — indicateurs clés : CA encaissé, impayés, devis en attente, projets et chantiers en cours.
- **Projets** — entité **chapeau** qui regroupe et relie tous les autres modules. Chaque projet consolide ses devis, factures, chantiers et documents avec une **vue 360°** : synthèse financière (total devis, facturé, encaissé, reste dû), suivi budgétaire et avancement global.
- **Clients** — répertoire complet (entreprise / particulier / administration), coordonnées, ICE, RC, recherche.
- **Devis** — création avec lignes détaillées, calcul HT / TVA / TTC, remise, statuts (brouillon, envoyé, accepté…), export PDF, conversion en facture.
- **Factures** — facturation, suivi des paiements (virement, chèque, espèces…), calcul automatique du reste dû et du statut, export PDF.
- **Chantiers & suivi des travaux** — avancement, planning, tâches de suivi, budget, responsable, documents liés.
- **Documentation & Conventions** — gestion documentaire (conventions, contrats, plans, rapports) avec téléversement de fichiers ou lien externe, rattachement client / chantier.

> Contexte marocain : montants en **Dirham (MAD)**, **TVA 20 %**, champs **ICE / RC**.

## Prérequis

- [Node.js](https://nodejs.org) 18 ou supérieur (Node 20+ recommandé)
- npm (fourni avec Node.js)
- Une base de données **PostgreSQL** (locale, ou gratuite dans le cloud : Neon / Prisma Postgres)

## Installation & démarrage

Dans le dossier du projet :

```bash
# 1. Créer le fichier d'environnement à partir du modèle
cp .env.example .env
#    puis renseignez votre URL PostgreSQL dans DATABASE_URL

# 2. Installer les dépendances
npm install

# 3. Préparer la base (client Prisma, création des tables, données de démo)
npm run setup

# 4. Lancer l'application en développement
npm run dev
```

Ouvrez ensuite http://localhost:3000 dans votre navigateur.

> 🚀 Pour mettre l'application **en ligne** : **`DEPLOIEMENT-AMPLIFY.md`** (AWS Amplify)
> ou **`DEPLOIEMENT.md`** (Vercel).

## Scripts utiles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarre le serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Démarre le serveur de production (après `build`) |
| `npm run setup` | Génère Prisma + crée la base + insère les données de démo |
| `npm run db:seed` | Réinsère uniquement les données de démonstration |
| `npm run db:reset` | Réinitialise complètement la base (⚠️ efface tout) |

## Base de données

La base est une base **PostgreSQL** dont l'URL est lue depuis `DATABASE_URL` (fichier `.env`).
Le schéma est défini dans `prisma/schema.prisma`. Après toute modification du schéma :

```bash
npm run db:push
```

Pour explorer les données visuellement :

```bash
npx prisma studio
```

## Personnalisation

Les informations de votre entreprise (nom, adresse, ICE, RIB…) qui apparaissent
sur les devis et factures PDF sont regroupées dans l'objet `ENTREPRISE`
du fichier `lib/utils.js`. Modifiez-les pour refléter votre bureau d'études.

Le logo (initiales « BE ») et les couleurs se personnalisent dans
`components/Sidebar.jsx`, `components/DocumentPrint.jsx` et `tailwind.config.js`.

## Structure du projet

```
bet-manager/
├── app/
│   ├── page.jsx              # Tableau de bord
│   ├── projets/              # Module Projets (vue 360° consolidée)
│   ├── clients/              # Module Clients
│   ├── devis/                # Module Devis (+ vue PDF)
│   ├── factures/             # Module Factures (+ paiements, vue PDF)
│   ├── chantiers/            # Module Chantiers & suivi
│   └── documents/            # Module Documentation & Conventions
├── components/               # Composants réutilisables (UI, formulaires, PDF)
├── lib/
│   ├── prisma.js             # Client Prisma
│   └── utils.js              # Formatage, calculs, libellés, infos entreprise
├── prisma/
│   ├── schema.prisma         # Modèle de données
│   └── seed.js               # Données de démonstration
└── public/uploads/           # Fichiers téléversés (documents)
```

## Export PDF des devis / factures

Chaque devis et facture dispose d'un bouton **« Imprimer / PDF »** qui ouvre une
vue mise en page. Utilisez la fonction d'impression du navigateur
(`Ctrl/Cmd + P`) puis « Enregistrer au format PDF ».

## Notes

- Le projet n'inclut pas encore d'authentification (connexion utilisateur).
  C'est la première amélioration recommandée avant une mise en production.
- La base est en **PostgreSQL**, prête pour un déploiement multi-utilisateurs (voir les guides de déploiement).
- Le téléversement de fichiers écrit dans `public/uploads` en local ; en hébergement serverless
  (Amplify/Vercel), utilisez le champ « lien externe » ou branchez un stockage S3 / Vercel Blob.
