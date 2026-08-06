import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMAD, formatDate, calculerTotaux, STATUTS_DEVIS } from "@/lib/utils";
import { PageHeader, EmptyState, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

function ttc(d) {
  return calculerTotaux(d.lignes, d.tauxTva, d.remise).totalTTC;
}

export default async function DevisPage({ searchParams }) {
  const statut = searchParams?.statut || "";

  const devis = await prisma.devis.findMany({
    where: statut ? { statut } : undefined,
    include: { lignes: true, client: true },
    orderBy: { date: "desc" },
  });

  const total = devis.reduce((s, d) => s + ttc(d), 0);

  const filtres = [["", "Tous"], ...Object.entries(STATUTS_DEVIS).map(([v, i]) => [v, i.label])];

  return (
    <div>
      <PageHeader
        titre="Devis"
        sousTitre={`${devis.length} devis · ${formatMAD(total)}`}
        actions={<Link href="/devis/nouveau" className="btn-primary">+ Nouveau devis</Link>}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {filtres.map(([v, l]) => (
          <Link
            key={v}
            href={v ? `/devis?statut=${v}` : "/devis"}
            className={`badge border ${statut === v ? "bg-brand-600 text-white border-brand-600" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"}`}
          >
            {l}
          </Link>
        ))}
      </div>

      {devis.length === 0 ? (
        <EmptyState
          titre="Aucun devis"
          message="Créez votre premier devis."
          action={<Link href="/devis/nouveau" className="btn-primary">+ Nouveau devis</Link>}
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="th">Numéro</th>
                <th className="th">Client</th>
                <th className="th">Objet</th>
                <th className="th">Date</th>
                <th className="th text-right">Total TTC</th>
                <th className="th">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {devis.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="td">
                    <Link href={`/devis/${d.id}`} className="font-medium text-brand-700 hover:underline">{d.numero}</Link>
                  </td>
                  <td className="td">{d.client.nom}</td>
                  <td className="td max-w-xs truncate">{d.objet || "—"}</td>
                  <td className="td text-slate-500">{formatDate(d.date)}</td>
                  <td className="td text-right font-medium">{formatMAD(ttc(d))}</td>
                  <td className="td"><Badge statut={d.statut} map={STATUTS_DEVIS} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
