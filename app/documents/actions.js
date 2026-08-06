"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Sauvegarde un fichier téléversé dans public/uploads, renvoie le chemin public (/uploads/...)
async function sauvegarderFichier(file) {
  if (!file || typeof file === "string" || file.size === 0) return null;
  try {
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const nom = `${Date.now()}-${safeName}`;
    await writeFile(path.join(dir, nom), buffer);
    return `/uploads/${nom}`;
  } catch (e) {
    // En hébergement serverless (ex. Amplify/Vercel), le système de fichiers est en lecture seule.
    // On n'échoue pas la création du document : privilégiez le champ « lien externe »,
    // ou branchez un stockage type S3 / Vercel Blob (voir le guide de déploiement).
    console.warn("Téléversement de fichier impossible (FS en lecture seule ?) :", e.message);
    return null;
  }
}

function idOrNull(v) {
  const n = Number(v);
  return v && !Number.isNaN(n) ? n : null;
}

export async function creerDocument(formData) {
  const titre = (formData.get("titre") || "").trim();
  if (!titre) throw new Error("Le titre est obligatoire.");

  const fichier = await sauvegarderFichier(formData.get("fichier"));

  await prisma.document.create({
    data: {
      titre,
      type: formData.get("type") || "document",
      description: formData.get("description")?.trim() || null,
      lien: formData.get("lien")?.trim() || null,
      fichier,
      clientId: idOrNull(formData.get("clientId")),
      chantierId: idOrNull(formData.get("chantierId")),
      projetId: idOrNull(formData.get("projetId")),
      dateDoc: formData.get("dateDoc") ? new Date(formData.get("dateDoc")) : new Date(),
    },
  });

  revalidatePath("/documents");
  redirect("/documents");
}

export async function modifierDocument(id, formData) {
  const titre = (formData.get("titre") || "").trim();
  if (!titre) throw new Error("Le titre est obligatoire.");

  const nouveauFichier = await sauvegarderFichier(formData.get("fichier"));

  const data = {
    titre,
    type: formData.get("type") || "document",
    description: formData.get("description")?.trim() || null,
    lien: formData.get("lien")?.trim() || null,
    clientId: idOrNull(formData.get("clientId")),
    chantierId: idOrNull(formData.get("chantierId")),
    dateDoc: formData.get("dateDoc") ? new Date(formData.get("dateDoc")) : new Date(),
  };
  if (nouveauFichier) data.fichier = nouveauFichier;

  await prisma.document.update({ where: { id: Number(id) }, data });
  revalidatePath("/documents");
  redirect("/documents");
}

export async function supprimerDocument(id) {
  await prisma.document.delete({ where: { id: Number(id) } });
  revalidatePath("/documents");
  redirect("/documents");
}
