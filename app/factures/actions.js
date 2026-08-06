"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { genererNumero, calculerTotaux } from "@/lib/utils";

async function prochainNumeroFacture() {
  const annee = new Date().getFullYear();
  const dernier = await prisma.facture.findFirst({
    where: { numero: { startsWith: `FAC-${annee}-` } },
    orderBy: { numero: "desc" },
  });
  return genererNumero("FAC", dernier?.numero);
}

function parseLignes(formData) {
  let lignes = [];
  try {
    lignes = JSON.parse(formData.get("lignes") || "[]");
  } catch {
    lignes = [];
  }
  return lignes
    .filter((l) => (l.designation || "").trim() !== "")
    .map((l, i) => ({
      designation: String(l.designation).trim(),
      quantite: Number(l.quantite) || 0,
      unite: l.unite || "u",
      prixUnitaire: Number(l.prixUnitaire) || 0,
      ordre: i + 1,
    }));
}

function idOrNull(v) {
  const n = Number(v);
  return v && !Number.isNaN(n) ? n : null;
}

function parseFacture(formData) {
  return {
    clientId: Number(formData.get("clientId")),
    projetId: idOrNull(formData.get("projetId")),
    objet: formData.get("objet")?.trim() || null,
    date: formData.get("date") ? new Date(formData.get("date")) : new Date(),
    echeance: formData.get("echeance") ? new Date(formData.get("echeance")) : null,
    tauxTva: Number(formData.get("tauxTva")) || 0,
    remise: Number(formData.get("remise")) || 0,
    statut: formData.get("statut") || "impayee",
    conditions: formData.get("conditions")?.trim() || null,
    notes: formData.get("notes")?.trim() || null,
  };
}

// Recalcule le statut d'une facture selon les paiements
async function recalculerStatut(factureId) {
  const facture = await prisma.facture.findUnique({
    where: { id: factureId },
    include: { lignes: true, paiements: true },
  });
  if (!facture) return;
  if (facture.statut === "annulee") return;

  const total = calculerTotaux(facture.lignes, facture.tauxTva, facture.remise).totalTTC;
  const paye = facture.paiements.reduce((s, p) => s + p.montant, 0);

  let statut = "impayee";
  if (paye >= total - 0.01 && total > 0) statut = "payee";
  else if (paye > 0) statut = "partielle";

  await prisma.facture.update({
    where: { id: factureId },
    data: { montantPaye: paye, statut },
  });
}

export async function creerFacture(formData) {
  const data = parseFacture(formData);
  const lignes = parseLignes(formData);
  if (!data.clientId) throw new Error("Le client est obligatoire.");
  const numero = await prochainNumeroFacture();
  const facture = await prisma.facture.create({
    data: { ...data, numero, lignes: { create: lignes } },
  });
  revalidatePath("/factures");
  redirect(`/factures/${facture.id}`);
}

export async function modifierFacture(id, formData) {
  const data = parseFacture(formData);
  const lignes = parseLignes(formData);
  await prisma.$transaction([
    prisma.ligneFacture.deleteMany({ where: { factureId: Number(id) } }),
    prisma.facture.update({
      where: { id: Number(id) },
      data: { ...data, lignes: { create: lignes } },
    }),
  ]);
  await recalculerStatut(Number(id));
  revalidatePath("/factures");
  revalidatePath(`/factures/${id}`);
  redirect(`/factures/${id}`);
}

export async function supprimerFacture(id) {
  await prisma.facture.delete({ where: { id: Number(id) } });
  revalidatePath("/factures");
  redirect("/factures");
}

export async function ajouterPaiement(factureId, formData) {
  const montant = Number(formData.get("montant"));
  if (!montant || montant <= 0) throw new Error("Montant invalide.");
  await prisma.paiement.create({
    data: {
      factureId: Number(factureId),
      montant,
      mode: formData.get("mode") || "virement",
      reference: formData.get("reference")?.trim() || null,
      date: formData.get("date") ? new Date(formData.get("date")) : new Date(),
    },
  });
  await recalculerStatut(Number(factureId));
  revalidatePath(`/factures/${factureId}`);
  revalidatePath("/factures");
}

export async function supprimerPaiement(factureId, paiementId) {
  await prisma.paiement.delete({ where: { id: Number(paiementId) } });
  await recalculerStatut(Number(factureId));
  revalidatePath(`/factures/${factureId}`);
  revalidatePath("/factures");
}
