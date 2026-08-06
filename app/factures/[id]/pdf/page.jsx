import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DocumentPrint from "@/components/DocumentPrint";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";

export default async function FacturePdfPage({ params }) {
  const id = Number(params.id);
  const facture = await prisma.facture.findUnique({
    where: { id },
    include: { client: true, lignes: { orderBy: { ordre: "asc" } } },
  });
  if (!facture) notFound();

  return (
    <div>
      <div className="no-print mb-4 flex items-center justify-between">
        <Link href={`/factures/${facture.id}`} className="text-sm text-brand-600 hover:underline">← Retour</Link>
        <PrintButton />
      </div>
      <DocumentPrint type="Facture" doc={facture} />
    </div>
  );
}
