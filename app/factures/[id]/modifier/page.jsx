import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { modifierFacture } from "../../actions";
import DocForm from "@/components/DocForm";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ModifierFacturePage({ params }) {
  const id = Number(params.id);
  const [facture, clients, projets] = await Promise.all([
    prisma.facture.findUnique({ where: { id }, include: { lignes: { orderBy: { ordre: "asc" } } } }),
    prisma.client.findMany({ orderBy: { nom: "asc" } }),
    prisma.projet.findMany({ orderBy: { nom: "asc" } }),
  ]);
  if (!facture) notFound();

  const action = modifierFacture.bind(null, facture.id);

  return (
    <div className="max-w-5xl">
      <PageHeader titre={`Modifier ${facture.numero}`} />
      <div className="mb-4">
        <Link href={`/factures/${facture.id}`} className="text-sm text-brand-600 hover:underline">← Retour à la facture</Link>
      </div>
      <DocForm
        type="facture"
        doc={facture}
        clients={clients}
        projets={projets}
        action={action}
        submitLabel="Enregistrer les modifications"
        cancelHref={`/factures/${facture.id}`}
      />
    </div>
  );
}
