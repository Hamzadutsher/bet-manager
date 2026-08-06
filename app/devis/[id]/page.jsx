import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMAD, formatDate, formatNombre, calculerTotaux, STATUTS_DEVIS } from "@/lib/utils";
import { PageHeader, Badge } from "@/components/ui";
import DeleteButton from "@/components/DeleteButton";
import { changerStatutDevis, supprimerDevis, convertirEnFacture } from "../actions";

export const dynamic = "force-dynamic";

export default async function DevisDetailPage({ params }) {
  const id = Number(params.id);
  const devis = await prisma.devis.findUnique({
    where: { id },
    include: {
      client: true,
      projet: true,
      lignes: { orderBy: { ordre: "asc" } },
      facture: true,
    },
  });
  if (!devis) notFound();

  const t = calculerTotaux(devis.lignes, devis.tauxTva, devis.remise);

  return (
    <div>
      <div className="mb-4">
        <Link href="/devis" className="text-sm text-brand-600 hover:underline">← Retour aux devis</Link>
      </div>
      <PageHeader
        titre={devis.numero}
        sousTitre={devis.objet || devis.client.nom}
        actions={
          <>
            <Link href={`/devis/${devis.id}/pdf`} className="btn-secondary" target="_blank">Imprimer / PDF</Link>
            <Link href={`/devis/${devis.id}/modifier`} className="btn-secondary">Modifier</Link>
            <DeleteButton action={supprimerDevis.bind(null, devis.id)} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Lignes */}
          <div className="card overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="th">Désignation</th>
                  <th className="th text-right">Qté</th>
                  <th className="th">Unité</th>
                  <th className="th text-right">P.U.</th>
                  <th className="th text-right">Total HT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {devis.lignes.map((l) => (
                  <tr key={l.id}>
                    <td className="td">{l.designation}</td>
                    <td className="td text-right">{formatNombre(l.quantite)}</td>
                    <td className="td">{l.unite}</td>
                    <td className="td text-right">{formatMAD(l.prixUnitaire)}</td>
                    <td className="td text-right font-medium">{formatMAD(l.quantite * l.prixUnitaire)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end border-t border-slate-200 p-5">
              <dl className="w-full max-w-xs space-y-1 text-sm">
                <div className="flex justify-between"><dt className="text-slate-600">Sous-total</dt><dd>{formatMAD(t.sousTotal)}</dd></div>
                {devis.remise > 0 && (
                  <div className="flex justify-between"><dt className="text-slate-600">Remise ({devis.remise}%)</dt><dd>-{formatMAD(t.montantRemise)}</dd></div>
                )}
                <div className="flex justify-between"><dt className="text-slate-600">Total HT</dt><dd>{formatMAD(t.totalHT)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-600">TVA ({devis.tauxTva}%)</dt><dd>{formatMAD(t.montantTva)}</dd></div>
                <div className="flex justify-between border-t border-slate-200 pt-1 text-base font-bold"><dt>Total TTC</dt><dd className="text-brand-700">{formatMAD(t.totalTTC)}</dd></div>
              </dl>
            </div>
          </div>

          {(devis.conditions || devis.notes) && (
            <div className="card p-5 space-y-3">
              {devis.conditions && (
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">Conditions</p>
                  <p className="text-sm text-slate-700 whitespace-pre-line">{devis.conditions}</p>
                </div>
              )}
              {devis.notes && (
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">Notes internes</p>
                  <p className="text-sm text-slate-700 whitespace-pre-line">{devis.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Panneau latéral */}
        <div className="space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-500">Statut</span>
              <Badge statut={devis.statut} map={STATUTS_DEVIS} />
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Client</dt><dd className="text-right"><Link href={`/clients/${devis.clientId}`} className="text-brand-600 hover:underline">{devis.client.nom}</Link></dd></div>
              {devis.projet && <div className="flex justify-between"><dt className="text-slate-500">Projet</dt><dd className="text-right"><Link href={`/projets/${devis.projetId}`} className="text-brand-600 hover:underline">{devis.projet.nom}</Link></dd></div>}
              <div className="flex justify-between"><dt className="text-slate-500">Date</dt><dd>{formatDate(devis.date)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Validité</dt><dd>{devis.validite} jours</dd></div>
            </dl>
          </div>

          {/* Changer le statut */}
          <div className="card p-5">
            <p className="text-sm font-medium text-slate-700 mb-3">Changer le statut</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(STATUTS_DEVIS).map(([v, info]) => (
                <form key={v} action={changerStatutDevis.bind(null, devis.id, v)}>
                  <button
                    type="submit"
                    disabled={devis.statut === v}
                    className={`badge border px-3 py-1 ${devis.statut === v ? "bg-slate-200 text-slate-400 border-slate-200 cursor-default" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"}`}
                  >
                    {info.label}
                  </button>
                </form>
              ))}
            </div>
          </div>

          {/* Facturation */}
          <div className="card p-5">
            <p className="text-sm font-medium text-slate-700 mb-3">Facturation</p>
            {devis.facture ? (
              <Link href={`/factures/${devis.facture.id}`} className="btn-secondary w-full">
                Voir la facture {devis.facture.numero}
              </Link>
            ) : (
              <form action={convertirEnFacture.bind(null, devis.id)}>
                <button type="submit" className="btn-primary w-full">Convertir en facture</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
