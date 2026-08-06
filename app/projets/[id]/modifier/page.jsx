import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { modifierProjet } from "../../actions";
import ProjetForm from "../../ProjetForm";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ModifierProjetPage({ params }) {
  const id = Number(params.id);
  const [projet, clients] = await Promise.all([
    prisma.projet.findUnique({ where: { id } }),
    prisma.client.findMany({ orderBy: { nom: "asc" } }),
  ]);
  if (!projet) notFound();

  const action = modifierProjet.bind(null, projet.id);

  return (
    <div className="max-w-4xl">
      <PageHeader titre="Modifier le projet" sousTitre={projet.nom} />
      <div className="mb-4">
        <Link href={`/projets/${projet.id}`} className="text-sm text-brand-600 hover:underline">← Retour au projet</Link>
      </div>
      <ProjetForm
        projet={projet}
        clients={clients}
        action={action}
        submitLabel="Enregistrer les modifications"
        cancelHref={`/projets/${projet.id}`}
      />
    </div>
  );
}
