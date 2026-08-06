import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { modifierDevis } from "../../actions";
import DocForm from "@/components/DocForm";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ModifierDevisPage({ params }) {
  const id = Number(params.id);
  const [devis, clients, projets] = await Promise.all([
    prisma.devis.findUnique({ where: { id }, include: { lignes: { orderBy: { ordre: "asc" } } } }),
    prisma.client.findMany({ orderBy: { nom: "asc" } }),
    prisma.projet.findMany({ orderBy: { nom: "asc" } }),
  ]);
  if (!devis) notFound();

  const action = modifierDevis.bind(null, devis.id);

  return (
    <div className="max-w-5xl">
      <PageHeader titre={`Modifier ${devis.numero}`} />
      <div className="mb-4">
        <Link href={`/devis/${devis.id}`} className="text-sm text-brand-600 hover:underline">← Retour au devis</Link>
      </div>
      <DocForm
        type="devis"
        doc={devis}
        clients={clients}
        projets={projets}
        action={action}
        submitLabel="Enregistrer les modifications"
        cancelHref={`/devis/${devis.id}`}
      />
    </div>
  );
}
