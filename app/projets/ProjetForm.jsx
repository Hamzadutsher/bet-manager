"use client";

import Link from "next/link";
import { toDateInput, STATUTS_PROJET } from "@/lib/utils";

export default function ProjetForm({
  projet,
  clients = [],
  action,
  submitLabel = "Enregistrer",
  cancelHref = "/projets",
  defaultClientId,
}) {
  return (
    <form action={action} className="card p-6 space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Nom du projet *</label>
          <input name="nom" required defaultValue={projet?.nom || ""} className="input" placeholder="Ex : Résidence Al Andalous" />
        </div>
        <div>
          <label className="label">Client *</label>
          <select name="clientId" required defaultValue={projet?.clientId || defaultClientId || ""} className="input">
            <option value="" disabled>— Choisir un client —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Responsable</label>
          <input name="responsable" defaultValue={projet?.responsable || ""} className="input" placeholder="Ing. …" />
        </div>
        <div>
          <label className="label">Statut</label>
          <select name="statut" defaultValue={projet?.statut || "en_cours"} className="input">
            {Object.entries(STATUTS_PROJET).map(([v, i]) => (
              <option key={v} value={v}>{i.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Budget global (MAD)</label>
          <input name="budget" type="number" step="0.01" defaultValue={projet?.budget ?? ""} className="input" />
        </div>
        <div>
          <label className="label">Date de début</label>
          <input name="dateDebut" type="date" defaultValue={toDateInput(projet?.dateDebut)} className="input" />
        </div>
        <div>
          <label className="label">Date de fin prévue</label>
          <input name="dateFin" type="date" defaultValue={toDateInput(projet?.dateFin)} className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Description</label>
          <textarea name="description" defaultValue={projet?.description || ""} rows={3} className="input" placeholder="Périmètre, objectifs, nature de la mission…" />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" className="btn-primary">{submitLabel}</button>
        <Link href={cancelHref} className="btn-secondary">Annuler</Link>
      </div>
    </form>
  );
}
