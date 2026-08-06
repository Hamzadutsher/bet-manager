import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { creerProjet } from "../actions";
import ProjetForm from "../ProjetForm";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function NouveauProjetPage({ searchParams }) {
  const clients = await prisma.client.findMany({ orderBy: { nom: "asc" } });
  const defaultClientId = searchParams?.client ? Number(searchParams.client) : undefined;

  return (
    <div className="max-w-4xl">
      <PageHeader titre="Nouveau projet" sousTitre="La référence sera générée automatiquement" />
      <div className="mb-4">
        <Link href="/projets" className="text-sm text-brand-600 hover:underline">← Retour aux projets</Link>
      </div>
      {clients.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-slate-700">Vous devez d'abord créer un client.</p>
          <Link href="/clients/nouveau" className="btn-primary mt-4 inline-flex">+ Nouveau client</Link>
        </div>
      ) : (
        <ProjetForm
          clients={clients}
          action={creerProjet}
          defaultClientId={defaultClientId}
          submitLabel="Créer le projet"
        />
      )}
    </div>
  );
}
