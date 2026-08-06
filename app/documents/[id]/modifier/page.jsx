import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { modifierDocument } from "../../actions";
import DocumentForm from "../../DocumentForm";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ModifierDocumentPage({ params }) {
  const id = Number(params.id);
  const [document, clients, chantiers, projets] = await Promise.all([
    prisma.document.findUnique({ where: { id } }),
    prisma.client.findMany({ orderBy: { nom: "asc" } }),
    prisma.chantier.findMany({ orderBy: { nom: "asc" } }),
    prisma.projet.findMany({ orderBy: { nom: "asc" } }),
  ]);
  if (!document) notFound();

  const action = modifierDocument.bind(null, document.id);

  return (
    <div className="max-w-3xl">
      <PageHeader titre="Modifier le document" sousTitre={document.titre} />
      <div className="mb-4">
        <Link href="/documents" className="text-sm text-brand-600 hover:underline">← Retour aux documents</Link>
      </div>
      <DocumentForm
        document={document}
        clients={clients}
        chantiers={chantiers}
        projets={projets}
        action={action}
        submitLabel="Enregistrer les modifications"
      />
    </div>
  );
}
