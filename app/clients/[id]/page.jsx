import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  formatMAD,
  formatDate,
  calculerTotaux,
  TYPES_CLIENT,
  STATUTS_DEVIS,
  STATUTS_FACTURE,
  STATUTS_CHANTIER,
  STATUTS_PROJET,
  TYPES_DOCUMENT,
} from "@/lib/utils";
import { PageHeader, Badge } from "@/components/ui";
import DeleteButton from "@/components/DeleteButton";
import { supprimerClient } from "../actions";

export const dynamic = "force-dynamic";

function ttc(doc) {
  return calculerTotaux(doc.lignes, doc.tauxTva, doc.remise).totalTTC;
}

export default async function ClientDetailPage({ params }) {
  const id = Number(params.id);
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      projets: { orderBy: { updatedAt: "desc" } },
      devis: { include: { lignes: true }, orderBy: { date: "desc" } },
      factures: { include: { lignes: true }, orderBy: { date: "desc" } },
      chantiers: { orderBy: { updatedAt: "desc" } },
      documents: { orderBy: { dateDoc: "desc" } },
    },
  });

  if (!client) notFound();

  const Info = ({ label, value }) =>
    value ? (
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
        <dd className="text-sm text-slate-800">{value}</dd>
      </div>
    ) : null;

  return (
    <div>
      <div className="mb-4">
        <Link href="/clients" className="text-sm text-brand-600 hover:underline">← Retour aux clients</Link>
      </div>
      <PageHeader
        titre={client.nom}
        sousTitre={TYPES_CLIENT[client.type] || client.type}
        actions={
          <>
            <Link href={`/clients/${client.id}/modifier`} className="btn-secondary">Modifier</Link>
            <DeleteButton action={supprimerClient.bind(null, client.id)} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Fiche */}
        <div className="card p-6 lg:col-span-1 h-fit">
          <h2 className="font-semibold text-slate-900 mb-4">Coordonnées</h2>
          <dl className="space-y-3">
            <Info label="Contact" value={client.contact} />
            <Info label="Email" value={client.email} />
            <Info label="Téléphone" value={client.telephone} />
            <Info label="Adresse" value={client.adresse} />
            <Info label="Ville" value={client.ville} />
            <Info label="ICE" value={client.ice} />
            <Info label="RC" value={client.rc} />
            <Info label="Notes" value={client.notes} />
          </dl>
        </div>

        {/* Relations */}
        <div className="space-y-6 lg:col-span-2">
          {/* Projets */}
          <div className="card">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <h3 className="font-semibold text-slate-900">Projets ({client.projets.length})</h3>
              <Link href={`/projets/nouveau?client=${client.id}`} className="text-sm text-brand-600 hover:underline">+ Nouveau projet</Link>
            </div>
            {client.projets.length === 0 ? (
              <p className="px-5 py-4 text-sm text-slate-500">Aucun projet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {client.projets.map((p) => (
                  <li key={p.id}>
                    <Link href={`/projets/${p.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                      <span>
                        <span className="font-medium text-slate-900">{p.nom}</span>
                        <span className="text-xs text-slate-500 ml-2">{p.reference}</span>
                      </span>
                      <Badge statut={p.statut} map={STATUTS_PROJET} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Devis */}
          <div className="card">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <h3 className="font-semibold text-slate-900">Devis ({client.devis.length})</h3>
              <Link href={`/devis/nouveau?client=${client.id}`} className="text-sm text-brand-600 hover:underline">+ Nouveau devis</Link>
            </div>
            {client.devis.length === 0 ? (
              <p className="px-5 py-4 text-sm text-slate-500">Aucun devis.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {client.devis.map((d) => (
                  <li key={d.id}>
                    <Link href={`/devis/${d.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                      <span>
                        <span className="font-medium text-slate-900">{d.numero}</span>
                        <span className="text-xs text-slate-500 ml-2">{formatDate(d.date)}</span>
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="text-sm font-medium">{formatMAD(ttc(d))}</span>
                        <Badge statut={d.statut} map={STATUTS_DEVIS} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Factures */}
          <div className="card">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <h3 className="font-semibold text-slate-900">Factures ({client.factures.length})</h3>
            </div>
            {client.factures.length === 0 ? (
              <p className="px-5 py-4 text-sm text-slate-500">Aucune facture.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {client.factures.map((f) => (
                  <li key={f.id}>
                    <Link href={`/factures/${f.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                      <span>
                        <span className="font-medium text-slate-900">{f.numero}</span>
                        <span className="text-xs text-slate-500 ml-2">{formatDate(f.date)}</span>
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="text-sm font-medium">{formatMAD(ttc(f))}</span>
                        <Badge statut={f.statut} map={STATUTS_FACTURE} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Chantiers */}
          <div className="card">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <h3 className="font-semibold text-slate-900">Chantiers ({client.chantiers.length})</h3>
              <Link href={`/chantiers/nouveau?client=${client.id}`} className="text-sm text-brand-600 hover:underline">+ Nouveau chantier</Link>
            </div>
            {client.chantiers.length === 0 ? (
              <p className="px-5 py-4 text-sm text-slate-500">Aucun chantier.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {client.chantiers.map((c) => (
                  <li key={c.id}>
                    <Link href={`/chantiers/${c.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                      <span>
                        <span className="font-medium text-slate-900">{c.nom}</span>
                        <span className="text-xs text-slate-500 ml-2">{c.reference}</span>
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="text-sm text-slate-500">{c.avancement}%</span>
                        <Badge statut={c.statut} map={STATUTS_CHANTIER} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Documents */}
          <div className="card">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <h3 className="font-semibold text-slate-900">Documents & conventions ({client.documents.length})</h3>
              <Link href={`/documents/nouveau?client=${client.id}`} className="text-sm text-brand-600 hover:underline">+ Ajouter</Link>
            </div>
            {client.documents.length === 0 ? (
              <p className="px-5 py-4 text-sm text-slate-500">Aucun document.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {client.documents.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between px-5 py-3">
                    <span>
                      <span className="font-medium text-slate-900">{doc.titre}</span>
                      <span className="text-xs text-slate-500 ml-2">{TYPES_DOCUMENT[doc.type] || doc.type} · {formatDate(doc.dateDoc)}</span>
                    </span>
                    {doc.lien && (
                      <a href={doc.lien} target="_blank" rel="noreferrer" className="text-sm text-brand-600 hover:underline">Ouvrir</a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
