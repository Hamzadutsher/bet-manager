import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { creerFacture } from "../actions";
import DocForm from "@/components/DocForm";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function NouvelleFacturePage({ searchParams }) {
  const [clients, projets] = await Promise.all([
    prisma.client.findMany({ orderBy: { nom: "asc" } }),
    prisma.projet.findMany({ orderBy: { nom: "asc" } }),
  ]);
  const defaultClientId = searchParams?.client ? Number(searchParams.client) : undefined;
  const defaultProjetId = searchParams?.projet ? Number(searchParams.projet) : undefined;

  return (
    <div className="max-w-5xl">
      <PageHeader titre="Nouvelle facture" sousTitre="Le numéro sera généré automatiquement" />
      <div className="mb-4">
        <Link href="/factures" className="text-sm text-brand-600 hover:underline">← Retour aux factures</Link>
      </div>
      {clients.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-slate-700">Vous devez d'abord créer un client.</p>
          <Link href="/clients/nouveau" className="btn-primary mt-4 inline-flex">+ Nouveau client</Link>
        </div>
      ) : (
        <DocForm
          type="facture"
          clients={clients}
          projets={projets}
          action={creerFacture}
          defaultClientId={defaultClientId}
          defaultProjetId={defaultProjetId}
          submitLabel="Créer la facture"
          cancelHref="/factures"
        />
      )}
    </div>
  );
}
