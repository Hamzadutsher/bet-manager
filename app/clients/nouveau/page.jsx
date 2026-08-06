import Link from "next/link";
import { creerClient } from "../actions";
import ClientForm from "../ClientForm";
import { PageHeader } from "@/components/ui";

export default function NouveauClientPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader titre="Nouveau client" sousTitre="Ajouter un client au répertoire" />
      <div className="mb-4">
        <Link href="/clients" className="text-sm text-brand-600 hover:underline">← Retour aux clients</Link>
      </div>
      <ClientForm action={creerClient} submitLabel="Créer le client" />
    </div>
  );
}
