// Données de démonstration
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Insertion des données de démonstration...");

  // Nettoyage (ordre respectant les relations)
  await prisma.paiement.deleteMany();
  await prisma.ligneFacture.deleteMany();
  await prisma.ligneDevis.deleteMany();
  await prisma.document.deleteMany();
  await prisma.tacheChantier.deleteMany();
  await prisma.facture.deleteMany();
  await prisma.devis.deleteMany();
  await prisma.chantier.deleteMany();
  await prisma.projet.deleteMany();
  await prisma.client.deleteMany();

  // ---------------- Clients ----------------
  const c1 = await prisma.client.create({
    data: {
      type: "entreprise",
      nom: "Résidences Al Andalous SARL",
      contact: "M. Karim Bennani",
      email: "contact@alandalous.ma",
      telephone: "+212 522 45 67 89",
      adresse: "12 Bd Zerktouni",
      ville: "Casablanca",
      ice: "001234567000045",
      rc: "123456",
      notes: "Promoteur immobilier — projets résidentiels.",
    },
  });

  const c2 = await prisma.client.create({
    data: {
      type: "administration",
      nom: "Commune de Bouskoura",
      contact: "Service Technique",
      email: "technique@bouskoura.ma",
      telephone: "+212 522 33 22 11",
      adresse: "Avenue Hassan II",
      ville: "Bouskoura",
      ice: "007654321000012",
      notes: "Marchés publics — voirie et assainissement.",
    },
  });

  const c3 = await prisma.client.create({
    data: {
      type: "entreprise",
      nom: "Industries Métalliques du Maroc",
      contact: "Mme Salma Idrissi",
      email: "s.idrissi@imm.ma",
      telephone: "+212 523 11 44 55",
      adresse: "Zone Industrielle, Lot 42",
      ville: "Mohammedia",
      ice: "009988776000033",
      rc: "44521",
    },
  });

  const c4 = await prisma.client.create({
    data: {
      type: "particulier",
      nom: "M. Youssef Alaoui",
      email: "y.alaoui@email.ma",
      telephone: "+212 661 22 33 44",
      ville: "Rabat",
      notes: "Villa individuelle — étude de structure.",
    },
  });

  // ---------------- Projets (entité chapeau) ----------------
  const p1 = await prisma.projet.create({
    data: {
      reference: "PRJ-2026-0001",
      nom: "Résidence Al Andalous",
      clientId: c1.id,
      description: "Conception et suivi d'exécution — 3 immeubles R+5.",
      statut: "en_cours",
      budget: 350000,
      responsable: "Ing. Rachid Tazi",
      dateDebut: new Date("2026-01-10"),
      dateFin: new Date("2026-09-30"),
    },
  });

  const p2 = await prisma.projet.create({
    data: {
      reference: "PRJ-2026-0002",
      nom: "Assainissement lotissement communal",
      clientId: c2.id,
      description: "Étude réseau EU/EP pour la commune de Bouskoura.",
      statut: "prospect",
      budget: 140000,
      dateDebut: new Date("2026-02-01"),
    },
  });

  const p3 = await prisma.projet.create({
    data: {
      reference: "PRJ-2026-0003",
      nom: "Hangar industriel IMM",
      clientId: c3.id,
      description: "Charpente métallique 2400 m² — étude et suivi.",
      statut: "en_cours",
      budget: 130000,
      responsable: "Ing. Salma Idrissi",
      dateDebut: new Date("2026-02-10"),
    },
  });

  // ---------------- Devis ----------------
  const d1 = await prisma.devis.create({
    data: {
      numero: "DEV-2026-0001",
      clientId: c1.id,
      projetId: p1.id,
      objet: "Étude de structure — Résidence Al Andalous (Tranche 1)",
      statut: "accepte",
      tauxTva: 20,
      remise: 0,
      date: new Date("2026-01-15"),
      conditions: "Acompte de 40% à la commande. Solde à la livraison des plans.",
      lignes: {
        create: [
          { designation: "Étude de conception structure béton armé", quantite: 1, unite: "forfait", prixUnitaire: 85000, ordre: 1 },
          { designation: "Plans de coffrage et ferraillage", quantite: 12, unite: "u", prixUnitaire: 3500, ordre: 2 },
          { designation: "Note de calcul sismique", quantite: 1, unite: "forfait", prixUnitaire: 22000, ordre: 3 },
        ],
      },
    },
  });

  const d2 = await prisma.devis.create({
    data: {
      numero: "DEV-2026-0002",
      clientId: c2.id,
      projetId: p2.id,
      objet: "Étude d'assainissement — Lotissement communal",
      statut: "envoye",
      tauxTva: 20,
      date: new Date("2026-02-03"),
      lignes: {
        create: [
          { designation: "Étude réseau d'assainissement EU/EP", quantite: 1, unite: "forfait", prixUnitaire: 120000, ordre: 1 },
          { designation: "Levé topographique", quantite: 8, unite: "ha", prixUnitaire: 4500, ordre: 2 },
        ],
      },
    },
  });

  const d3 = await prisma.devis.create({
    data: {
      numero: "DEV-2026-0003",
      clientId: c4.id,
      objet: "Étude de structure — Villa individuelle",
      statut: "brouillon",
      tauxTva: 20,
      date: new Date("2026-02-20"),
      lignes: {
        create: [
          { designation: "Étude de structure R+2", quantite: 1, unite: "forfait", prixUnitaire: 18000, ordre: 1 },
          { designation: "Étude de fondations", quantite: 1, unite: "forfait", prixUnitaire: 7500, ordre: 2 },
        ],
      },
    },
  });

  // ---------------- Facture (issue du devis accepté) ----------------
  const f1 = await prisma.facture.create({
    data: {
      numero: "FAC-2026-0001",
      clientId: c1.id,
      devisId: d1.id,
      projetId: p1.id,
      objet: "Acompte 40% — Étude de structure Résidence Al Andalous",
      statut: "payee",
      tauxTva: 20,
      date: new Date("2026-01-20"),
      echeance: new Date("2026-02-20"),
      montantPaye: 0, // recalculé par les paiements ci-dessous
      conditions: "Paiement par virement bancaire.",
      lignes: {
        create: [
          { designation: "Acompte 40% sur étude de structure (DEV-2026-0001)", quantite: 1, unite: "forfait", prixUnitaire: 66000, ordre: 1 },
        ],
      },
    },
  });

  await prisma.paiement.create({
    data: { factureId: f1.id, montant: 79200, mode: "virement", reference: "VIR-2026-0111", date: new Date("2026-01-28") },
  });
  await prisma.facture.update({ where: { id: f1.id }, data: { montantPaye: 79200 } });

  const f2 = await prisma.facture.create({
    data: {
      numero: "FAC-2026-0002",
      clientId: c3.id,
      projetId: p3.id,
      objet: "Étude de charpente métallique — Hangar industriel",
      statut: "impayee",
      tauxTva: 20,
      date: new Date("2026-02-10"),
      echeance: new Date("2026-03-12"),
      lignes: {
        create: [
          { designation: "Étude et dimensionnement charpente métallique", quantite: 1, unite: "forfait", prixUnitaire: 95000, ordre: 1 },
          { designation: "Plans d'assemblage", quantite: 15, unite: "u", prixUnitaire: 1200, ordre: 2 },
        ],
      },
    },
  });

  // ---------------- Chantiers ----------------
  const ch1 = await prisma.chantier.create({
    data: {
      reference: "CH-2026-0001",
      nom: "Résidence Al Andalous — Tranche 1",
      clientId: c1.id,
      projetId: p1.id,
      adresse: "Lotissement Al Andalous, Bd Zerktouni",
      ville: "Casablanca",
      description: "Suivi d'exécution structure béton armé, 3 immeubles R+5.",
      statut: "en_cours",
      avancement: 45,
      budget: 132000,
      dateDebut: new Date("2026-02-01"),
      dateFin: new Date("2026-08-30"),
      responsable: "Ing. Rachid Tazi",
      taches: {
        create: [
          { titre: "Validation plans de fondation", statut: "termine" },
          { titre: "Suivi coulage semelles Bloc A", statut: "termine" },
          { titre: "Contrôle ferraillage poteaux niveau 1", statut: "en_cours" },
          { titre: "Réception béton niveau 2", statut: "a_faire", dateEcheance: new Date("2026-04-15") },
        ],
      },
    },
  });

  const ch2 = await prisma.chantier.create({
    data: {
      reference: "CH-2026-0002",
      nom: "Hangar industriel IMM",
      clientId: c3.id,
      projetId: p3.id,
      adresse: "Zone Industrielle, Lot 42",
      ville: "Mohammedia",
      description: "Charpente métallique — surface 2400 m².",
      statut: "planifie",
      avancement: 0,
      budget: 113000,
      dateDebut: new Date("2026-03-15"),
      responsable: "Ing. Salma Idrissi",
      taches: {
        create: [
          { titre: "Étude d'exécution", statut: "a_faire" },
          { titre: "Commande matériaux", statut: "a_faire" },
        ],
      },
    },
  });

  // ---------------- Documents / Conventions ----------------
  await prisma.document.create({
    data: {
      titre: "Convention de maîtrise d'œuvre — Al Andalous",
      type: "convention",
      description: "Convention signée pour la mission de maîtrise d'œuvre.",
      clientId: c1.id,
      chantierId: ch1.id,
      projetId: p1.id,
      dateDoc: new Date("2026-01-18"),
    },
  });

  await prisma.document.create({
    data: {
      titre: "Rapport géotechnique — Terrain Bouskoura",
      type: "rapport",
      description: "Étude de sol préalable.",
      clientId: c2.id,
      projetId: p2.id,
      lien: "https://example.com/rapport-geotech.pdf",
      dateDoc: new Date("2026-02-05"),
    },
  });

  await prisma.document.create({
    data: {
      titre: "CCTP — Assainissement lotissement",
      type: "documentation",
      description: "Cahier des clauses techniques particulières.",
      clientId: c2.id,
      projetId: p2.id,
      dateDoc: new Date("2026-02-06"),
    },
  });

  console.log("✅ Données insérées avec succès.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
