"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { genererNumero } from "@/lib/utils";

async function prochaineReference() {
  const annee = new Date().getFullYear();
  const dernier = await prisma.chantier.findFirst({
    where: { reference: { startsWith: `CH-${annee}-` } },
    orderBy: { reference: "desc" },
  });
  return genererNumero("CH", dernier?.reference);
}

function idOrNull(v) {
  const n = Number(v);
  return v && !Number.isNaN(n) ? n : null;
}

function parseChantier(formData) {
  return {
    nom: (formData.get("nom") || "").trim(),
    clientId: Number(formData.get("clientId")),
    projetId: idOrNull(formData.get("projetId")),
    adresse: formData.get("adresse")?.trim() || null,
    ville: formData.get("ville")?.trim() || null,
    description: formData.get("description")?.trim() || null,
    statut: formData.get("statut") || "planifie",
    avancement: Math.max(0, Math.min(100, Number(formData.get("avancement")) || 0)),
    budget: formData.get("budget") ? Number(formData.get("budget")) : null,
    responsable: formData.get("responsable")?.trim() || null,
    dateDebut: formData.get("dateDebut") ? new Date(formData.get("dateDebut")) : null,
    dateFin: formData.get("dateFin") ? new Date(formData.get("dateFin")) : null,
  };
}

export async function creerChantier(formData) {
  const data = parseChantier(formData);
  if (!data.nom) throw new Error("Le nom est obligatoire.");
  if (!data.clientId) throw new Error("Le client est obligatoire.");
  const reference = await prochaineReference();
  const chantier = await prisma.chantier.create({ data: { ...data, reference } });
  revalidatePath("/chantiers");
  redirect(`/chantiers/${chantier.id}`);
}

export async function modifierChantier(id, formData) {
  const data = parseChantier(formData);
  if (!data.nom) throw new Error("Le nom est obligatoire.");
  await prisma.chantier.update({ where: { id: Number(id) }, data });
  revalidatePath("/chantiers");
  revalidatePath(`/chantiers/${id}`);
  redirect(`/chantiers/${id}`);
}

export async function supprimerChantier(id) {
  await prisma.chantier.delete({ where: { id: Number(id) } });
  revalidatePath("/chantiers");
  redirect("/chantiers");
}

// --- Tâches / suivi ---
export async function ajouterTache(chantierId, formData) {
  const titre = (formData.get("titre") || "").trim();
  if (!titre) return;
  await prisma.tacheChantier.create({
    data: {
      chantierId: Number(chantierId),
      titre,
      description: formData.get("description")?.trim() || null,
      dateEcheance: formData.get("dateEcheance") ? new Date(formData.get("dateEcheance")) : null,
    },
  });
  revalidatePath(`/chantiers/${chantierId}`);
}

export async function changerStatutTache(chantierId, tacheId, statut) {
  await prisma.tacheChantier.update({ where: { id: Number(tacheId) }, data: { statut } });
  revalidatePath(`/chantiers/${chantierId}`);
}

export async function supprimerTache(chantierId, tacheId) {
  await prisma.tacheChantier.delete({ where: { id: Number(tacheId) } });
  revalidatePath(`/chantiers/${chantierId}`);
}
