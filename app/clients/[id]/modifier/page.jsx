import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { modifierClient } from "../../actions";
import ClientForm from "../../ClientForm";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ModifierClientPage({ params }) {
  const id = Number(params.id);
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) notFound();

  const action = modifierClient.bind(null, client.id);

  return (
    <div className="max-w-3xl">
      <PageHeader titre="Modifier le client" sousTitre={client.nom} />
      <div className="mb-4">
        <Link href={`/clients/${client.id}`} className="text-sm text-brand-600 hover:underline">← Retour à la fiche</Link>
      </div>
      <ClientForm client={client} action={action} submitLabel="Enregistrer les modifications" />
    </div>
  );
}
