"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function parseClient(formData) {
  return {
    type: formData.get("type") || "entreprise",
    nom: (formData.get("nom") || "").trim(),
    contact: formData.get("contact")?.trim() || null,
    email: formData.get("email")?.trim() || null,
    telephone: formData.get("telephone")?.trim() || null,
    adresse: formData.get("adresse")?.trim() || null,
    ville: formData.get("ville")?.trim() || null,
    ice: formData.get("ice")?.trim() || null,
    rc: formData.get("rc")?.trim() || null,
    notes: formData.get("notes")?.trim() || null,
  };
}

export async function creerClient(formData) {
  const data = parseClient(formData);
  if (!data.nom) throw new Error("Le nom est obligatoire.");
  const client = await prisma.client.create({ data });
  revalidatePath("/clients");
  redirect(`/clients/${client.id}`);
}

export async function modifierClient(id, formData) {
  const data = parseClient(formData);
  if (!data.nom) throw new Error("Le nom est obligatoire.");
  await prisma.client.update({ where: { id: Number(id) }, data });
  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  redirect(`/clients/${id}`);
}

export async function supprimerClient(id) {
  await prisma.client.delete({ where: { id: Number(id) } });
  revalidatePath("/clients");
  redirect("/clients");
}
