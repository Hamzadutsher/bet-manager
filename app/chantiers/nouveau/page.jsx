import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { creerChantier } from "../actions";
import ChantierForm from "../ChantierForm";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function NouveauChantierPage({ searchParams }) {
  const [clients, projets] = await Promise.all([
    prisma.client.findMany({ orderBy: { nom: "asc" } }),
    prisma.projet.findMany({ orderBy: { nom: "asc" } }),
  ]);
  const defaultClientId = searchParams?.client ? Number(searchParams.client) : undefined;
  const defaultProjetId = searchParams?.projet ? Number(searchParams.projet) : undefined;

  return (
    <div className="max-w-4xl">
      <PageHeader titre="Nouveau chantier" sousTitre="La référence sera générée automatiquement" />
      <div className="mb-4">
        <Link href="/chantiers" className="text-sm text-brand-600 hover:underline">← Retour aux chantiers</Link>
      </div>
      {clients.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-slate-700">Vous devez d'abord créer un client.</p>
          <Link href="/clients/nouveau" className="btn-primary mt-4 inline-flex">+ Nouveau client</Link>
        </div>
      ) : (
        <ChantierForm
          clients={clients}
          projets={projets}
          action={creerChantier}
          defaultClientId={defaultClientId}
          defaultProjetId={defaultProjetId}
          submitLabel="Créer le chantier"
        />
      )}
    </div>
  );
}
