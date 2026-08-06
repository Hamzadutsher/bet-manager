import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  formatMAD,
  formatDate,
  toDateInput,
  STATUTS_CHANTIER,
  STATUTS_TACHE,
  TYPES_DOCUMENT,
} from "@/lib/utils";
import { PageHeader, Badge, ProgressBar } from "@/components/ui";
import DeleteButton from "@/components/DeleteButton";
import {
  supprimerChantier,
  ajouterTache,
  changerStatutTache,
  supprimerTache,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function ChantierDetailPage({ params }) {
  const id = Number(params.id);
  const chantier = await prisma.chantier.findUnique({
    where: { id },
    include: {
      client: true,
      projet: true,
      taches: { orderBy: { createdAt: "asc" } },
      documents: { orderBy: { dateDoc: "desc" } },
    },
  });
  if (!chantier) notFound();

  const tachesTerminees = chantier.taches.filter((t) => t.statut === "termine").length;

  return (
    <div>
      <div className="mb-4">
        <Link href="/chantiers" className="text-sm text-brand-600 hover:underline">← Retour aux chantiers</Link>
      </div>
      <PageHeader
        titre={chantier.nom}
        sousTitre={`${chantier.reference} · ${chantier.client.nom}`}
        actions={
          <>
            <Link href={`/chantiers/${chantier.id}/modifier`} className="btn-secondary">Modifier</Link>
            <DeleteButton action={supprimerChantier.bind(null, chantier.id)} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Suivi / tâches */}
          <div className="card">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <h3 className="font-semibold text-slate-900">Suivi des travaux</h3>
              <span className="text-sm text-slate-500">{tachesTerminees}/{chantier.taches.length} terminée(s)</span>
            </div>

            {chantier.taches.length === 0 ? (
              <p className="px-5 py-4 text-sm text-slate-500">Aucune tâche. Ajoutez la première ci-dessous.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {chantier.taches.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className={`font-medium ${t.statut === "termine" ? "text-slate-400 line-through" : "text-slate-900"}`}>{t.titre}</p>
                      {t.dateEcheance && <p className="text-xs text-slate-400">Échéance : {formatDate(t.dateEcheance)}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(STATUTS_TACHE).map(([v, info]) => (
                          <form key={v} action={changerStatutTache.bind(null, chantier.id, t.id, v)}>
                            <button
                              type="submit"
                              disabled={t.statut === v}
                              className={`badge border px-2 py-0.5 text-xs ${t.statut === v ? info.classe + " border-transparent" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
                            >
                              {info.label}
                            </button>
                          </form>
                        ))}
                      </div>
                      <form action={supprimerTache.bind(null, chantier.id, t.id)}>
                        <button className="text-slate-300 hover:text-red-600" title="Supprimer">✕</button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Ajouter une tâche */}
            <form action={ajouterTache.bind(null, chantier.id)} className="border-t border-slate-200 p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="label">Nouvelle tâche</label>
                  <input name="titre" required className="input" placeholder="Ex : Contrôle ferraillage niveau 2" />
                </div>
                <div>
                  <label className="label">Échéance</label>
                  <input name="dateEcheance" type="date" className="input" />
                </div>
              </div>
              <button type="submit" className="btn-primary mt-3">+ Ajouter</button>
            </form>
          </div>

          {/* Documents liés */}
          <div className="card">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <h3 className="font-semibold text-slate-900">Documents liés ({chantier.documents.length})</h3>
              <Link href={`/documents/nouveau?chantier=${chantier.id}`} className="text-sm text-brand-600 hover:underline">+ Ajouter</Link>
            </div>
            {chantier.documents.length === 0 ? (
              <p className="px-5 py-4 text-sm text-slate-500">Aucun document.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {chantier.documents.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between px-5 py-3">
                    <span>
                      <span className="font-medium text-slate-900">{doc.titre}</span>
                      <span className="text-xs text-slate-500 ml-2">{TYPES_DOCUMENT[doc.type] || doc.type}</span>
                    </span>
                    {doc.lien && <a href={doc.lien} target="_blank" rel="noreferrer" className="text-sm text-brand-600 hover:underline">Ouvrir</a>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Panneau latéral */}
        <div className="space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-500">Statut</span>
              <Badge statut={chantier.statut} map={STATUTS_CHANTIER} />
            </div>
            <ProgressBar valeur={chantier.avancement} />
            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Client</dt><dd className="text-right"><Link href={`/clients/${chantier.clientId}`} className="text-brand-600 hover:underline">{chantier.client.nom}</Link></dd></div>
              {chantier.projet && <div className="flex justify-between"><dt className="text-slate-500">Projet</dt><dd className="text-right"><Link href={`/projets/${chantier.projetId}`} className="text-brand-600 hover:underline">{chantier.projet.nom}</Link></dd></div>}
              {chantier.responsable && <div className="flex justify-between"><dt className="text-slate-500">Responsable</dt><dd>{chantier.responsable}</dd></div>}
              {chantier.ville && <div className="flex justify-between"><dt className="text-slate-500">Ville</dt><dd>{chantier.ville}</dd></div>}
              {chantier.budget != null && <div className="flex justify-between"><dt className="text-slate-500">Budget</dt><dd className="font-medium">{formatMAD(chantier.budget)}</dd></div>}
              <div className="flex justify-between"><dt className="text-slate-500">Début</dt><dd>{formatDate(chantier.dateDebut)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Fin prévue</dt><dd>{formatDate(chantier.dateFin)}</dd></div>
            </dl>
          </div>

          {chantier.adresse && (
            <div className="card p-5">
              <p className="text-xs font-semibold uppercase text-slate-400">Adresse</p>
              <p className="text-sm text-slate-700">{chantier.adresse}</p>
            </div>
          )}

          {chantier.description && (
            <div className="card p-5">
              <p className="text-xs font-semibold uppercase text-slate-400">Description</p>
              <p className="text-sm text-slate-700 whitespace-pre-line">{chantier.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
