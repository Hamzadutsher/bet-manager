import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMAD, formatDate, calculerTotaux, STATUTS_FACTURE } from "@/lib/utils";
import { PageHeader, EmptyState, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

function ttc(f) {
  return calculerTotaux(f.lignes, f.tauxTva, f.remise).totalTTC;
}

export default async function FacturesPage({ searchParams }) {
  const statut = searchParams?.statut || "";
  const factures = await prisma.facture.findMany({
    where: statut ? { statut } : undefined,
    include: { lignes: true, client: true },
    orderBy: { date: "desc" },
  });

  const totalTTC = factures.filter((f) => f.statut !== "annulee").reduce((s, f) => s + ttc(f), 0);
  const encaisse = factures.reduce((s, f) => s + (f.montantPaye || 0), 0);

  const filtres = [["", "Toutes"], ...Object.entries(STATUTS_FACTURE).map(([v, i]) => [v, i.label])];

  return (
    <div>
      <PageHeader
        titre="Factures"
        sousTitre={`${factures.length} facture(s) · ${formatMAD(totalTTC)} · encaissé ${formatMAD(encaisse)}`}
        actions={<Link href="/factures/nouveau" className="btn-primary">+ Nouvelle facture</Link>}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {filtres.map(([v, l]) => (
          <Link
            key={v}
            href={v ? `/factures?statut=${v}` : "/factures"}
            className={`badge border ${statut === v ? "bg-brand-600 text-white border-brand-600" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"}`}
          >
            {l}
          </Link>
        ))}
      </div>

      {factures.length === 0 ? (
        <EmptyState
          titre="Aucune facture"
          message="Créez une facture ou convertissez un devis accepté."
          action={<Link href="/factures/nouveau" className="btn-primary">+ Nouvelle facture</Link>}
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="th">Numéro</th>
                <th className="th">Client</th>
                <th className="th">Date</th>
                <th className="th">Échéance</th>
                <th className="th text-right">Total TTC</th>
                <th className="th text-right">Reste dû</th>
                <th className="th">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {factures.map((f) => {
                const total = ttc(f);
                const reste = total - (f.montantPaye || 0);
                return (
                  <tr key={f.id} className="hover:bg-slate-50">
                    <td className="td">
                      <Link href={`/factures/${f.id}`} className="font-medium text-brand-700 hover:underline">{f.numero}</Link>
                    </td>
                    <td className="td">{f.client.nom}</td>
                    <td className="td text-slate-500">{formatDate(f.date)}</td>
                    <td className="td text-slate-500">{formatDate(f.echeance)}</td>
                    <td className="td text-right font-medium">{formatMAD(total)}</td>
                    <td className="td text-right">{f.statut === "payee" ? "—" : formatMAD(reste)}</td>
                    <td className="td"><Badge statut={f.statut} map={STATUTS_FACTURE} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
