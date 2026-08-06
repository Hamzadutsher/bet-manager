import { formatMAD, formatDate, formatNombre, calculerTotaux, ENTREPRISE } from "@/lib/utils";

// Vue imprimable d'un devis ou d'une facture
// type : "Devis" | "Facture"
export default function DocumentPrint({ type, doc }) {
  const t = calculerTotaux(doc.lignes, doc.tauxTva, doc.remise);
  const estFacture = type === "Facture";
  const reste = estFacture ? t.totalTTC - (doc.montantPaye || 0) : null;

  return (
    <div className="mx-auto max-w-3xl bg-white p-10 print-page shadow-sm">
      {/* En-tête */}
      <div className="flex items-start justify-between border-b-2 border-brand-600 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-white text-lg">BE</div>
            <div>
              <p className="text-xl font-bold text-slate-900">{ENTREPRISE.nom}</p>
              <p className="text-sm text-slate-500">{ENTREPRISE.slogan}</p>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500 leading-relaxed">
            <p>{ENTREPRISE.adresse}, {ENTREPRISE.ville}</p>
            <p>Tél : {ENTREPRISE.telephone} · {ENTREPRISE.email}</p>
            <p>ICE : {ENTREPRISE.ice} · RC : {ENTREPRISE.rc} · IF : {ENTREPRISE.if}</p>
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-bold uppercase text-brand-700">{type}</h1>
          <p className="mt-1 text-lg font-semibold text-slate-900">{doc.numero}</p>
          <p className="mt-2 text-sm text-slate-600">Date : {formatDate(doc.date)}</p>
          {estFacture
            ? doc.echeance && <p className="text-sm text-slate-600">Échéance : {formatDate(doc.echeance)}</p>
            : <p className="text-sm text-slate-600">Validité : {doc.validite} jours</p>}
        </div>
      </div>

      {/* Client */}
      <div className="mt-6 flex justify-end">
        <div className="w-64 rounded-lg bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-400">Client</p>
          <p className="font-semibold text-slate-900">{doc.client.nom}</p>
          {doc.client.contact && <p className="text-sm text-slate-600">{doc.client.contact}</p>}
          {doc.client.adresse && <p className="text-sm text-slate-600">{doc.client.adresse}</p>}
          {doc.client.ville && <p className="text-sm text-slate-600">{doc.client.ville}</p>}
          {doc.client.ice && <p className="text-xs text-slate-500 mt-1">ICE : {doc.client.ice}</p>}
        </div>
      </div>

      {doc.objet && (
        <div className="mt-6">
          <p className="text-sm"><span className="font-semibold">Objet :</span> {doc.objet}</p>
        </div>
      )}

      {/* Tableau */}
      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="bg-brand-600 text-white">
            <th className="px-3 py-2 text-left font-semibold">Désignation</th>
            <th className="px-3 py-2 text-right font-semibold">Qté</th>
            <th className="px-3 py-2 text-left font-semibold">Unité</th>
            <th className="px-3 py-2 text-right font-semibold">P.U. HT</th>
            <th className="px-3 py-2 text-right font-semibold">Total HT</th>
          </tr>
        </thead>
        <tbody>
          {doc.lignes.map((l, i) => (
            <tr key={l.id} className={i % 2 ? "bg-slate-50" : ""}>
              <td className="px-3 py-2">{l.designation}</td>
              <td className="px-3 py-2 text-right">{formatNombre(l.quantite)}</td>
              <td className="px-3 py-2">{l.unite}</td>
              <td className="px-3 py-2 text-right">{formatMAD(l.prixUnitaire)}</td>
              <td className="px-3 py-2 text-right">{formatMAD(l.quantite * l.prixUnitaire)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totaux */}
      <div className="mt-4 flex justify-end">
        <table className="w-72 text-sm">
          <tbody>
            <tr>
              <td className="py-1 text-slate-600">Sous-total</td>
              <td className="py-1 text-right">{formatMAD(t.sousTotal)}</td>
            </tr>
            {doc.remise > 0 && (
              <tr>
                <td className="py-1 text-slate-600">Remise ({doc.remise}%)</td>
                <td className="py-1 text-right">-{formatMAD(t.montantRemise)}</td>
              </tr>
            )}
            <tr>
              <td className="py-1 text-slate-600">Total HT</td>
              <td className="py-1 text-right">{formatMAD(t.totalHT)}</td>
            </tr>
            <tr>
              <td className="py-1 text-slate-600">TVA ({doc.tauxTva}%)</td>
              <td className="py-1 text-right">{formatMAD(t.montantTva)}</td>
            </tr>
            <tr className="border-t-2 border-brand-600">
              <td className="py-2 font-bold text-slate-900">Total TTC</td>
              <td className="py-2 text-right font-bold text-brand-700">{formatMAD(t.totalTTC)}</td>
            </tr>
            {estFacture && (doc.montantPaye || 0) > 0 && (
              <>
                <tr>
                  <td className="py-1 text-slate-600">Déjà payé</td>
                  <td className="py-1 text-right">{formatMAD(doc.montantPaye)}</td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold text-slate-900">Reste à payer</td>
                  <td className="py-1 text-right font-semibold">{formatMAD(reste)}</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {doc.conditions && (
        <div className="mt-8 border-t border-slate-200 pt-4">
          <p className="text-xs font-semibold uppercase text-slate-400">Conditions</p>
          <p className="text-sm text-slate-700 whitespace-pre-line">{doc.conditions}</p>
        </div>
      )}

      {estFacture && (
        <div className="mt-4 text-xs text-slate-500">
          <p>Règlement par virement — RIB : {ENTREPRISE.rib}</p>
        </div>
      )}

      <div className="mt-12 flex justify-between text-sm">
        <div>
          <p className="text-slate-500">Le client (bon pour accord)</p>
          <div className="mt-10 w-40 border-t border-slate-300" />
        </div>
        <div className="text-right">
          <p className="text-slate-500">{ENTREPRISE.nom}</p>
          <div className="mt-10 w-40 border-t border-slate-300 ml-auto" />
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-slate-400">
        {ENTREPRISE.nom} · ICE {ENTREPRISE.ice} · RC {ENTREPRISE.rc} · {ENTREPRISE.email}
      </p>
    </div>
  );
}
