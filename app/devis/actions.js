"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { genererNumero } from "@/lib/utils";

// Génère le prochain numéro de devis pour l'année courante
async function prochainNumeroDevis() {
  const annee = new Date().getFullYear();
  const dernier = await prisma.devis.findFirst({
    where: { numero: { startsWith: `DEV-${annee}-` } },
    orderBy: { numero: "desc" },
  });
  return genererNumero("DEV", dernier?.numero);
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

function parseDevis(formData) {
  return {
    clientId: Number(formData.get("clientId")),
    projetId: idOrNull(formData.get("projetId")),
    objet: formData.get("objet")?.trim() || null,
    date: formData.get("date") ? new Date(formData.get("date")) : new Date(),
    validite: Number(formData.get("validite")) || 30,
    tauxTva: Number(formData.get("tauxTva")) || 0,
    remise: Number(formData.get("remise")) || 0,
    statut: formData.get("statut") || "brouillon",
    conditions: formData.get("conditions")?.trim() || null,
    notes: formData.get("notes")?.trim() || null,
  };
}

export async function creerDevis(formData) {
  const data = parseDevis(formData);
  const lignes = parseLignes(formData);
  if (!data.clientId) throw new Error("Le client est obligatoire.");
  const numero = await prochainNumeroDevis();

  const devis = await prisma.devis.create({
    data: { ...data, numero, lignes: { create: lignes } },
  });
  revalidatePath("/devis");
  redirect(`/devis/${devis.id}`);
}

export async function modifierDevis(id, formData) {
  const data = parseDevis(formData);
  const lignes = parseLignes(formData);

  await prisma.$transaction([
    prisma.ligneDevis.deleteMany({ where: { devisId: Number(id) } }),
    prisma.devis.update({
      where: { id: Number(id) },
      data: { ...data, lignes: { create: lignes } },
    }),
  ]);
  revalidatePath("/devis");
  revalidatePath(`/devis/${id}`);
  redirect(`/devis/${id}`);
}

export async function changerStatutDevis(id, statut) {
  await prisma.devis.update({ where: { id: Number(id) }, data: { statut } });
  revalidatePath(`/devis/${id}`);
  revalidatePath("/devis");
}

export async function supprimerDevis(id) {
  await prisma.devis.delete({ where: { id: Number(id) } });
  revalidatePath("/devis");
  redirect("/devis");
}

// Convertit un devis accepté en facture
export async function convertirEnFacture(id) {
  const devis = await prisma.devis.findUnique({
    where: { id: Number(id) },
    include: { lignes: { orderBy: { ordre: "asc" } }, facture: true },
  });
  if (!devis) throw new Error("Devis introuvable.");
  if (devis.facture) {
    redirect(`/factures/${devis.facture.id}`);
  }

  const annee = new Date().getFullYear();
  const dernier = await prisma.facture.findFirst({
    where: { numero: { startsWith: `FAC-${annee}-` } },
    orderBy: { numero: "desc" },
  });
  const numero = genererNumero("FAC", dernier?.numero);

  const echeance = new Date();
  echeance.setDate(echeance.getDate() + 30);

  const facture = await prisma.facture.create({
    data: {
      numero,
      clientId: devis.clientId,
      devisId: devis.id,
      projetId: devis.projetId,
      objet: devis.objet,
      tauxTva: devis.tauxTva,
      remise: devis.remise,
      conditions: devis.conditions,
      echeance,
      lignes: {
        create: devis.lignes.map((l) => ({
          designation: l.designation,
          quantite: l.quantite,
          unite: l.unite,
          prixUnitaire: l.prixUnitaire,
          ordre: l.ordre,
        })),
      },
    },
  });

  // Marque le devis comme accepté s'il ne l'est pas déjà
  if (devis.statut !== "accepte") {
    await prisma.devis.update({ where: { id: devis.id }, data: { statut: "accepte" } });
  }

  revalidatePath("/factures");
  revalidatePath("/devis");
  redirect(`/factures/${facture.id}`);
}
