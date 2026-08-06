"use client";

import { useState } from "react";
import Link from "next/link";
import { toDateInput, STATUTS_CHANTIER } from "@/lib/utils";

export default function ChantierForm({
  chantier,
  clients = [],
  projets = [],
  action,
  submitLabel = "Enregistrer",
  cancelHref = "/chantiers",
  defaultClientId,
  defaultProjetId,
}) {
  const [clientId, setClientId] = useState(String(chantier?.clientId || defaultClientId || ""));
  const [projetId, setProjetId] = useState(String(chantier?.projetId || defaultProjetId || ""));
  const projetsClient = projets.filter((p) => String(p.clientId) === clientId);

  function onChangeClient(v) {
    setClientId(v);
    const encoreValide = projets.some((p) => String(p.id) === projetId && String(p.clientId) === v);
    if (!encoreValide) setProjetId("");
  }

  return (
    <form action={action} className="card p-6 space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Nom du chantier *</label>
          <input name="nom" required defaultValue={chantier?.nom || ""} className="input" placeholder="Ex : Résidence Al Andalous — Tranche 1" />
        </div>
        <div>
          <label className="label">Client *</label>
          <select name="clientId" required value={clientId} onChange={(e) => onChangeClient(e.target.value)} className="input">
            <option value="" disabled>— Choisir un client —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Projet</label>
          <select name="projetId" value={projetId} onChange={(e) => setProjetId(e.target.value)} className="input" disabled={!clientId}>
            <option value="">— Aucun projet —</option>
            {projetsClient.map((p) => (
              <option key={p.id} value={p.id}>{p.nom} ({p.reference})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Responsable</label>
          <input name="responsable" defaultValue={chantier?.responsable || ""} className="input" placeholder="Ing. …" />
        </div>
        <div>
          <label className="label">Adresse</label>
          <input name="adresse" defaultValue={chantier?.adresse || ""} className="input" />
        </div>
        <div>
          <label className="label">Ville</label>
          <input name="ville" defaultValue={chantier?.ville || ""} className="input" />
        </div>
        <div>
          <label className="label">Statut</label>
          <select name="statut" defaultValue={chantier?.statut || "planifie"} className="input">
            {Object.entries(STATUTS_CHANTIER).map(([v, i]) => (
              <option key={v} value={v}>{i.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Avancement (%)</label>
          <input name="avancement" type="number" min="0" max="100" defaultValue={chantier?.avancement ?? 0} className="input" />
        </div>
        <div>
          <label className="label">Budget (MAD)</label>
          <input name="budget" type="number" step="0.01" defaultValue={chantier?.budget ?? ""} className="input" />
        </div>
        <div>
          <label className="label">Date de début</label>
          <input name="dateDebut" type="date" defaultValue={toDateInput(chantier?.dateDebut)} className="input" />
        </div>
        <div>
          <label className="label">Date de fin prévue</label>
          <input name="dateFin" type="date" defaultValue={toDateInput(chantier?.dateFin)} className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Description</label>
          <textarea name="description" defaultValue={chantier?.description || ""} rows={3} className="input" placeholder="Nature des travaux, périmètre de la mission…" />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" className="btn-primary">{submitLabel}</button>
        <Link href={cancelHref} className="btn-secondary">Annuler</Link>
      </div>
    </form>
  );
}
