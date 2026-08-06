import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { creerDocument } from "../actions";
import DocumentForm from "../DocumentForm";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function NouveauDocumentPage({ searchParams }) {
  const [clients, chantiers, projets] = await Promise.all([
    prisma.client.findMany({ orderBy: { nom: "asc" } }),
    prisma.chantier.findMany({ orderBy: { nom: "asc" } }),
    prisma.projet.findMany({ orderBy: { nom: "asc" } }),
  ]);

  return (
    <div className="max-w-3xl">
      <PageHeader titre="Ajouter un document" sousTitre="Convention, contrat, plan, rapport…" />
      <div className="mb-4">
        <Link href="/documents" className="text-sm text-brand-600 hover:underline">← Retour aux documents</Link>
      </div>
      <DocumentForm
        clients={clients}
        chantiers={chantiers}
        projets={projets}
        action={creerDocument}
        submitLabel="Enregistrer le document"
        defaultClientId={searchParams?.client ? Number(searchParams.client) : undefined}
        defaultChantierId={searchParams?.chantier ? Number(searchParams.chantier) : undefined}
        defaultProjetId={searchParams?.projet ? Number(searchParams.projet) : undefined}
      />
    </div>
  );
}
