"use client";

import Link from "next/link";
import { TYPES_CLIENT } from "@/lib/utils";

export default function ClientForm({ client, action, submitLabel = "Enregistrer" }) {
  return (
    <form action={action} className="card p-6 space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="label">Type de client</label>
          <select name="type" defaultValue={client?.type || "entreprise"} className="input">
            {Object.entries(TYPES_CLIENT).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Nom / Raison sociale *</label>
          <input name="nom" required defaultValue={client?.nom || ""} className="input" placeholder="Ex : Société Al Andalous SARL" />
        </div>
        <div>
          <label className="label">Personne à contacter</label>
          <input name="contact" defaultValue={client?.contact || ""} className="input" placeholder="Ex : M. Karim Bennani" />
        </div>
        <div>
          <label className="label">Email</label>
          <input name="email" type="email" defaultValue={client?.email || ""} className="input" placeholder="contact@exemple.ma" />
        </div>
        <div>
          <label className="label">Téléphone</label>
          <input name="telephone" defaultValue={client?.telephone || ""} className="input" placeholder="+212 ..." />
        </div>
        <div>
          <label className="label">Ville</label>
          <input name="ville" defaultValue={client?.ville || ""} className="input" placeholder="Casablanca" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Adresse</label>
          <input name="adresse" defaultValue={client?.adresse || ""} className="input" placeholder="Adresse complète" />
        </div>
        <div>
          <label className="label">ICE</label>
          <input name="ice" defaultValue={client?.ice || ""} className="input" placeholder="Identifiant Commun de l'Entreprise" />
        </div>
        <div>
          <label className="label">Registre de Commerce (RC)</label>
          <input name="rc" defaultValue={client?.rc || ""} className="input" placeholder="N° RC" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Notes</label>
          <textarea name="notes" defaultValue={client?.notes || ""} rows={3} className="input" placeholder="Informations complémentaires…" />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" className="btn-primary">{submitLabel}</button>
        <Link href={client ? `/clients/${client.id}` : "/clients"} className="btn-secondary">Annuler</Link>
      </div>
    </form>
  );
}
