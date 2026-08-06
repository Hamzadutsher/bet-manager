import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { modifierChantier } from "../../actions";
import ChantierForm from "../../ChantierForm";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ModifierChantierPage({ params }) {
  const id = Number(params.id);
  const [chantier, clients, projets] = await Promise.all([
    prisma.chantier.findUnique({ where: { id } }),
    prisma.client.findMany({ orderBy: { nom: "asc" } }),
    prisma.projet.findMany({ orderBy: { nom: "asc" } }),
  ]);
  if (!chantier) notFound();

  const action = modifierChantier.bind(null, chantier.id);

  return (
    <div className="max-w-4xl">
      <PageHeader titre="Modifier le chantier" sousTitre={chantier.nom} />
      <div className="mb-4">
        <Link href={`/chantiers/${chantier.id}`} className="text-sm text-brand-600 hover:underline">← Retour au chantier</Link>
      </div>
      <ChantierForm
        chantier={chantier}
        clients={clients}
        projets={projets}
        action={action}
        submitLabel="Enregistrer les modifications"
        cancelHref={`/chantiers/${chantier.id}`}
      />
    </div>
  );
}
