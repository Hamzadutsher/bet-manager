// Remplissage AUTOMATIQUE et NON DESTRUCTIF de la base au déploiement.
// - Si la base contient déjà des données (au moins 1 client) → ne fait rien.
// - Si la base est vide → insère les données de démonstration.
// Ainsi le premier déploiement fournit une base peuplée, et les déploiements
// suivants ne touchent pas aux données réelles.
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  let count = 0;
  try {
    count = await prisma.client.count();
  } catch (e) {
    // Tables pas encore prêtes : on laisse « prisma db push » faire son travail avant.
    console.log("Comptage impossible (tables non prêtes ?) — seed ignoré :", e.message);
    return;
  }

  if (count > 0) {
    console.log(`Base déjà peuplée (${count} client(s)) — seed automatique ignoré.`);
    return;
  }

  console.log("Base vide — insertion des données de démonstration…");
  await prisma.$disconnect();
  // Exécute le seed complet (les deleteMany en tête sont sans effet sur une base vide).
  require("./seed.js");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect().catch(() => {});
  });
