import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  formatMAD,
  formatDate,
  formatNombre,
  calculerTotaux,
  toDateInput,
  STATUTS_FACTURE,
  MODES_PAIEMENT,
} from "@/lib/utils";
import { PageHeader, Badge } from "@/components/ui";
import DeleteButton from "@/components/DeleteButton";
import {
  supprimerFacture,
  ajouterPaiement,
  supprimerPaiement,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function FactureDetailPage({ params }) {
  const id = Number(params.id);
  const facture = await prisma.facture.findUnique({
    where: { id },
    include: {
      client: true,
      projet: true,
      lignes: { orderBy: { ordre: "asc" } },
      paiements: { orderBy: { date: "desc" } },
      devis: true,
    },
  });
  if (!facture) notFound();

  const t = calculerTotaux(facture.lignes, facture.tauxTva, facture.remise);
  const paye = facture.montantPaye || 0;
  const reste = t.totalTTC - paye;

  return (
    <div>
      <div className="mb-4">
        <Link href="/factures" className="text-sm text-brand-600 hover:underline">← Retour aux factures</Link>
      </div>
      <PageHeader
        titre={facture.numero}
        sousTitre={facture.objet || facture.client.nom}
        actions={
          <>
            <Link href={`/factures/${facture.id}/pdf`} className="btn-secondary" target="_blank">Imprimer / PDF</Link>
            <Link href={`/factures/${facture.id}/modifier`} className="btn-secondary">Modifier</Link>
            <DeleteButton action={supprimerFacture.bind(null, facture.id)} />
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
                {facture.lignes.map((l) => (
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
                {facture.remise > 0 && (
                  <div className="flex justify-between"><dt className="text-slate-600">Remise ({facture.remise}%)</dt><dd>-{formatMAD(t.montantRemise)}</dd></div>
                )}
                <div className="flex justify-between"><dt className="text-slate-600">Total HT</dt><dd>{formatMAD(t.totalHT)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-600">TVA ({facture.tauxTva}%)</dt><dd>{formatMAD(t.montantTva)}</dd></div>
                <div className="flex justify-between border-t border-slate-200 pt-1 text-base font-bold"><dt>Total TTC</dt><dd className="text-brand-700">{formatMAD(t.totalTTC)}</dd></div>
              </dl>
            </div>
          </div>

          {/* Paiements */}
          <div className="card">
            <div className="border-b border-slate-200 px-5 py-3">
              <h3 className="font-semibold text-slate-900">Paiements</h3>
            </div>
            {facture.paiements.length === 0 ? (
              <p className="px-5 py-4 text-sm text-slate-500">Aucun paiement enregistré.</p>
            ) : (
              <table className="min-w-full divide-y divide-slate-100">
                <tbody className="divide-y divide-slate-100">
                  {facture.paiements.map((p) => (
                    <tr key={p.id}>
                      <td className="td">{formatDate(p.date)}</td>
                      <td className="td">{MODES_PAIEMENT[p.mode] || p.mode}</td>
                      <td className="td text-slate-500">{p.reference || "—"}</td>
                      <td className="td text-right font-medium">{formatMAD(p.montant)}</td>
                      <td className="td text-right">
                        <form action={supprimerPaiement.bind(null, facture.id, p.id)}>
                          <button className="text-slate-400 hover:text-red-600" title="Supprimer">✕</button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Ajouter un paiement */}
            {facture.statut !== "annulee" && reste > 0.01 && (
              <form action={ajouterPaiement.bind(null, facture.id)} className="border-t border-slate-200 p-5">
                <p className="text-sm font-medium text-slate-700 mb-3">Enregistrer un paiement</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div>
                    <label className="label">Montant</label>
                    <input name="montant" type="number" step="0.01" defaultValue={reste.toFixed(2)} className="input" required />
                  </div>
                  <div>
                    <label className="label">Date</label>
                    <input name="date" type="date" defaultValue={toDateInput(new Date())} className="input" />
                  </div>
                  <div>
                    <label className="label">Mode</label>
                    <select name="mode" className="input">
                      {Object.entries(MODES_PAIEMENT).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Référence</label>
                    <input name="reference" className="input" placeholder="N° chèque…" />
                  </div>
                </div>
                <button type="submit" className="btn-primary mt-3">Ajouter le paiement</button>
              </form>
            )}
          </div>
        </div>

        {/* Panneau latéral */}
        <div className="space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-500">Statut</span>
              <Badge statut={facture.statut} map={STATUTS_FACTURE} />
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Client</dt><dd className="text-right"><Link href={`/clients/${facture.clientId}`} className="text-brand-600 hover:underline">{facture.client.nom}</Link></dd></div>
              {facture.projet && <div className="flex justify-between"><dt className="text-slate-500">Projet</dt><dd className="text-right"><Link href={`/projets/${facture.projetId}`} className="text-brand-600 hover:underline">{facture.projet.nom}</Link></dd></div>}
              <div className="flex justify-between"><dt className="text-slate-500">Date</dt><dd>{formatDate(facture.date)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Échéance</dt><dd>{formatDate(facture.echeance)}</dd></div>
              {facture.devis && (
                <div className="flex justify-between"><dt className="text-slate-500">Devis</dt><dd className="text-right"><Link href={`/devis/${facture.devisId}`} className="text-brand-600 hover:underline">{facture.devis.numero}</Link></dd></div>
              )}
            </dl>
          </div>

          <div className="card p-5">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Total TTC</dt><dd className="font-medium">{formatMAD(t.totalTTC)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Payé</dt><dd className="text-green-600 font-medium">{formatMAD(paye)}</dd></div>
              <div className="flex justify-between border-t border-slate-200 pt-2"><dt className="font-semibold text-slate-900">Reste dû</dt><dd className="font-bold text-red-600">{formatMAD(reste)}</dd></div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
