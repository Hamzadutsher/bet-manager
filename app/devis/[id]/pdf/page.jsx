import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DocumentPrint from "@/components/DocumentPrint";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";

export default async function DevisPdfPage({ params }) {
  const id = Number(params.id);
  const devis = await prisma.devis.findUnique({
    where: { id },
    include: { client: true, lignes: { orderBy: { ordre: "asc" } } },
  });
  if (!devis) notFound();

  return (
    <div>
      <div className="no-print mb-4 flex items-center justify-between">
        <Link href={`/devis/${devis.id}`} className="text-sm text-brand-600 hover:underline">← Retour</Link>
        <PrintButton />
      </div>
      <DocumentPrint type="Devis" doc={devis} />
    </div>
  );
}
