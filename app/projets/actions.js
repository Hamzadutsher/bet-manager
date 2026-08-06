"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { genererNumero } from "@/lib/utils";

async function prochaineReference() {
  const annee = new Date().getFullYear();
  const dernier = await prisma.projet.findFirst({
    where: { reference: { startsWith: `PRJ-${annee}-` } },
    orderBy: { reference: "desc" },
  });
  return genererNumero("PRJ", dernier?.reference);
}

function parseProjet(formData) {
  return {
    nom: (formData.get("nom") || "").trim(),
    clientId: Number(formData.get("clientId")),
    description: formData.get("description")?.trim() || null,
    statut: formData.get("statut") || "en_cours",
    budget: formData.get("budget") ? Number(formData.get("budget")) : null,
    responsable: formData.get("responsable")?.trim() || null,
    dateDebut: formData.get("dateDebut") ? new Date(formData.get("dateDebut")) : null,
    dateFin: formData.get("dateFin") ? new Date(formData.get("dateFin")) : null,
  };
}

export async function creerProjet(formData) {
  const data = parseProjet(formData);
  if (!data.nom) throw new Error("Le nom est obligatoire.");
  if (!data.clientId) throw new Error("Le client est obligatoire.");
  const reference = await prochaineReference();
  const projet = await prisma.projet.create({ data: { ...data, reference } });
  revalidatePath("/projets");
  redirect(`/projets/${projet.id}`);
}

export async function modifierProjet(id, formData) {
  const data = parseProjet(formData);
  if (!data.nom) throw new Error("Le nom est obligatoire.");
  await prisma.projet.update({ where: { id: Number(id) }, data });
  revalidatePath("/projets");
  revalidatePath(`/projets/${id}`);
  redirect(`/projets/${id}`);
}

export async function changerStatutProjet(id, statut) {
  await prisma.projet.update({ where: { id: Number(id) }, data: { statut } });
  revalidatePath(`/projets/${id}`);
  revalidatePath("/projets");
}

export async function supprimerProjet(id) {
  // Les devis / factures / chantiers / documents ne sont PAS supprimés :
  // leur lien projet est simplement retiré (onDelete: SetNull).
  await prisma.projet.delete({ where: { id: Number(id) } });
  revalidatePath("/projets");
  redirect("/projets");
}
