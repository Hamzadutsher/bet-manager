"use client";

import Link from "next/link";
import { toDateInput, TYPES_DOCUMENT } from "@/lib/utils";

export default function DocumentForm({
  document: doc,
  clients = [],
  chantiers = [],
  projets = [],
  action,
  submitLabel = "Enregistrer",
  defaultClientId,
  defaultChantierId,
  defaultProjetId,
}) {
  return (
    <form action={action} className="card p-6 space-y-5" encType="multipart/form-data">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Titre *</label>
          <input name="titre" required defaultValue={doc?.titre || ""} className="input" placeholder="Ex : Convention de maîtrise d'œuvre" />
        </div>
        <div>
          <label className="label">Type</label>
          <select name="type" defaultValue={doc?.type || "convention"} className="input">
            {Object.entries(TYPES_DOCUMENT).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Date du document</label>
          <input name="dateDoc" type="date" defaultValue={toDateInput(doc?.dateDoc) || toDateInput(new Date())} className="input" />
        </div>
        <div>
          <label className="label">Client associé</label>
          <select name="clientId" defaultValue={doc?.clientId || defaultClientId || ""} className="input">
            <option value="">— Aucun —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Chantier associé</label>
          <select name="chantierId" defaultValue={doc?.chantierId || defaultChantierId || ""} className="input">
            <option value="">— Aucun —</option>
            {chantiers.map((c) => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Projet associé</label>
          <select name="projetId" defaultValue={doc?.projetId || defaultProjetId || ""} className="input">
            <option value="">— Aucun —</option>
            {projets.map((p) => (
              <option key={p.id} value={p.id}>{p.nom} ({p.reference})</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label">Description</label>
          <textarea name="description" defaultValue={doc?.description || ""} rows={2} className="input" />
        </div>
        <div>
          <label className="label">Fichier (PDF, image, plan…)</label>
          <input name="fichier" type="file" className="input" />
          {doc?.fichier && (
            <p className="text-xs text-slate-500 mt-1">
              Fichier actuel : <a href={doc.fichier} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">ouvrir</a> (laisser vide pour conserver)
            </p>
          )}
        </div>
        <div>
          <label className="label">Ou lien externe</label>
          <input name="lien" defaultValue={doc?.lien || ""} className="input" placeholder="https://…" />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" className="btn-primary">{submitLabel}</button>
        <Link href="/documents" className="btn-secondary">Annuler</Link>
      </div>
    </form>
  );
}
