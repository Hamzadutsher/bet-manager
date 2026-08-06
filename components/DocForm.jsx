"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { formatMAD, calculerTotaux, toDateInput } from "@/lib/utils";

const UNITES = ["u", "forfait", "jour", "heure", "m²", "ml", "m³", "ha", "%", "ens"];

// Formulaire partagé pour Devis et Factures
// type : "devis" | "facture"
export default function DocForm({
  type = "devis",
  doc,
  clients = [],
  projets = [],
  action,
  submitLabel = "Enregistrer",
  cancelHref = "/",
  defaultClientId,
  defaultProjetId,
}) {
  const estFacture = type === "facture";

  const [clientId, setClientId] = useState(String(doc?.clientId || defaultClientId || ""));
  const [projetId, setProjetId] = useState(String(doc?.projetId || defaultProjetId || ""));

  // Projets du client sélectionné
  const projetsClient = projets.filter((p) => String(p.clientId) === clientId);

  function onChangeClient(v) {
    setClientId(v);
    // Réinitialise le projet s'il n'appartient pas au nouveau client
    const encoreValide = projets.some((p) => String(p.id) === projetId && String(p.clientId) === v);
    if (!encoreValide) setProjetId("");
  }

  const [lignes, setLignes] = useState(
    doc?.lignes?.length
      ? doc.lignes.map((l) => ({
          designation: l.designation,
          quantite: l.quantite,
          unite: l.unite,
          prixUnitaire: l.prixUnitaire,
        }))
      : [{ designation: "", quantite: 1, unite: "u", prixUnitaire: 0 }]
  );
  const [tauxTva, setTauxTva] = useState(doc?.tauxTva ?? 20);
  const [remise, setRemise] = useState(doc?.remise ?? 0);

  const totaux = useMemo(
    () => calculerTotaux(lignes, tauxTva, remise),
    [lignes, tauxTva, remise]
  );

  function majLigne(i, champ, valeur) {
    setLignes((prev) => prev.map((l, idx) => (idx === i ? { ...l, [champ]: valeur } : l)));
  }
  function ajouterLigne() {
    setLignes((prev) => [...prev, { designation: "", quantite: 1, unite: "u", prixUnitaire: 0 }]);
  }
  function supprimerLigne(i) {
    setLignes((prev) => prev.filter((_, idx) => idx !== i));
  }

  const statutsOptions = estFacture
    ? [
        ["impayee", "Impayée"],
        ["partielle", "Partiellement payée"],
        ["payee", "Payée"],
        ["annulee", "Annulée"],
      ]
    : [
        ["brouillon", "Brouillon"],
        ["envoye", "Envoyé"],
        ["accepte", "Accepté"],
        ["refuse", "Refusé"],
        ["expire", "Expiré"],
      ];

  return (
    <form action={action} className="space-y-6">
      {/* Champs hidden pour transmettre les lignes et valeurs contrôlées */}
      <input type="hidden" name="lignes" value={JSON.stringify(lignes)} />
      <input type="hidden" name="tauxTva" value={tauxTva} />
      <input type="hidden" name="remise" value={remise} />

      {/* En-tête */}
      <div className="card p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="label">Client *</label>
            <select
              name="clientId"
              required
              value={clientId}
              onChange={(e) => onChangeClient(e.target.value)}
              className="input"
            >
              <option value="" disabled>— Choisir un client —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Projet</label>
            <select
              name="projetId"
              value={projetId}
              onChange={(e) => setProjetId(e.target.value)}
              className="input"
              disabled={!clientId}
            >
              <option value="">— Aucun projet —</option>
              {projetsClient.map((p) => (
                <option key={p.id} value={p.id}>{p.nom} ({p.reference})</option>
              ))}
            </select>
            {!clientId && <p className="text-xs text-slate-400 mt-1">Choisissez d'abord un client.</p>}
          </div>
          <div>
            <label className="label">Objet</label>
            <input name="objet" defaultValue={doc?.objet || ""} className="input" placeholder="Ex : Étude de structure…" />
          </div>
          <div>
            <label className="label">Date</label>
            <input name="date" type="date" defaultValue={toDateInput(doc?.date) || toDateInput(new Date())} className="input" />
          </div>
          {estFacture ? (
            <div>
              <label className="label">Échéance</label>
              <input name="echeance" type="date" defaultValue={toDateInput(doc?.echeance)} className="input" />
            </div>
          ) : (
            <div>
              <label className="label">Validité (jours)</label>
              <input name="validite" type="number" min="0" defaultValue={doc?.validite ?? 30} className="input" />
            </div>
          )}
          <div>
            <label className="label">Statut</label>
            <select name="statut" defaultValue={doc?.statut || statutsOptions[0][0]} className="input">
              {statutsOptions.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lignes */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Détail des prestations</h3>
          <button type="button" onClick={ajouterLigne} className="btn-secondary">+ Ajouter une ligne</button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="pb-2 pr-2 w-1/2">Désignation</th>
                <th className="pb-2 px-2">Qté</th>
                <th className="pb-2 px-2">Unité</th>
                <th className="pb-2 px-2">P.U. (MAD)</th>
                <th className="pb-2 pl-2 text-right">Total HT</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((l, i) => (
                <tr key={i} className="align-top">
                  <td className="py-1 pr-2">
                    <input
                      value={l.designation}
                      onChange={(e) => majLigne(i, "designation", e.target.value)}
                      className="input"
                      placeholder="Désignation de la prestation"
                    />
                  </td>
                  <td className="py-1 px-2">
                    <input
                      type="number"
                      step="0.01"
                      value={l.quantite}
                      onChange={(e) => majLigne(i, "quantite", e.target.value)}
                      className="input w-20"
                    />
                  </td>
                  <td className="py-1 px-2">
                    <select value={l.unite} onChange={(e) => majLigne(i, "unite", e.target.value)} className="input w-24">
                      {UNITES.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-1 px-2">
                    <input
                      type="number"
                      step="0.01"
                      value={l.prixUnitaire}
                      onChange={(e) => majLigne(i, "prixUnitaire", e.target.value)}
                      className="input w-28"
                    />
                  </td>
                  <td className="py-1 pl-2 text-right text-sm font-medium whitespace-nowrap">
                    {formatMAD((Number(l.quantite) || 0) * (Number(l.prixUnitaire) || 0))}
                  </td>
                  <td className="py-1 pl-2">
                    <button
                      type="button"
                      onClick={() => supprimerLigne(i)}
                      className="text-slate-400 hover:text-red-600"
                      title="Supprimer la ligne"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totaux */}
        <div className="mt-6 flex flex-col items-end gap-2">
          <div className="w-full max-w-xs space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Sous-total</span>
              <span className="font-medium">{formatMAD(totaux.sousTotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Remise (%)</span>
              <input
                type="number"
                step="0.01"
                value={remise}
                onChange={(e) => setRemise(e.target.value)}
                className="input w-24 text-right"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Total HT</span>
              <span className="font-medium">{formatMAD(totaux.totalHT)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">TVA (%)</span>
              <input
                type="number"
                step="0.01"
                value={tauxTva}
                onChange={(e) => setTauxTva(e.target.value)}
                className="input w-24 text-right"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Montant TVA</span>
              <span className="font-medium">{formatMAD(totaux.montantTva)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-base">
              <span className="font-semibold text-slate-900">Total TTC</span>
              <span className="font-bold text-brand-700">{formatMAD(totaux.totalTTC)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes & conditions */}
      <div className="card p-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="label">Conditions</label>
          <textarea name="conditions" defaultValue={doc?.conditions || ""} rows={3} className="input" placeholder="Conditions de paiement, délais…" />
        </div>
        <div>
          <label className="label">Notes internes</label>
          <textarea name="notes" defaultValue={doc?.notes || ""} rows={3} className="input" placeholder="Notes (non imprimées)…" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary">{submitLabel}</button>
        <Link href={cancelHref} className="btn-secondary">Annuler</Link>
      </div>
    </form>
  );
}
