import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  formatMAD,
  formatDate,
  calculerTotaux,
  STATUTS_PROJET,
  STATUTS_DEVIS,
  STATUTS_FACTURE,
  STATUTS_CHANTIER,
  TYPES_DOCUMENT,
} from "@/lib/utils";
import { PageHeader, Badge, StatCard, ProgressBar } from "@/components/ui";
import DeleteButton from "@/components/DeleteButton";
import { supprimerProjet, changerStatutProjet } from "../actions";

export const dynamic = "force-dynamic";

function ttc(doc) {
  return calculerTotaux(doc.lignes, doc.tauxTva, doc.remise).totalTTC;
}

export default async function ProjetDetailPage({ params }) {
  const id = Number(params.id);
  const projet = await prisma.projet.findUnique({
    where: { id },
    include: {
      client: true,
      devis: { include: { lignes: true }, orderBy: { date: "desc" } },
      factures: { include: { lignes: true }, orderBy: { date: "desc" } },
      chantiers: { orderBy: { updatedAt: "desc" } },
      documents: { orderBy: { dateDoc: "desc" } },
    },
  });
  if (!projet) notFound();

  // --- Agrégats financiers ---
  const totalDevis = projet.devis.reduce((s, d) => s + ttc(d), 0);
  const totalDevisAccepte = projet.devis.filter((d) => d.statut === "accepte").reduce((s, d) => s + ttc(d), 0);
  const facturesActives = projet.factures.filter((f) => f.statut !== "annulee");
  const totalFacture = facturesActives.reduce((s, f) => s + ttc(f), 0);
  const encaisse = projet.factures.reduce((s, f) => s + (f.montantPaye || 0), 0);
  const resteDu = totalFacture - encaisse;

  // Avancement = moyenne des chantiers
  const avancement = projet.chantiers.length
    ? Math.round(projet.chantiers.reduce((s, c) => s + (c.avancement || 0), 0) / projet.chantiers.length)
    : 0;

  const clientId = projet.clientId;
  const lien = (base) => `${base}?projet=${projet.id}&client=${clientId}`;

  return (
    <div>
      <div className="mb-4">
        <Link href="/projets" className="text-sm text-brand-600 hover:underline">← Retour aux projets</Link>
      </div>
      <PageHeader
        titre={projet.nom}
        sousTitre={`${projet.reference} · ${projet.client.nom}`}
        actions={
          <>
            <Link href={`/projets/${projet.id}/modifier`} className="btn-secondary">Modifier</Link>
            <DeleteButton action={supprimerProjet.bind(null, projet.id)} />
          </>
        }
      />

      {/* Synthèse financière */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard titre="Devis (total)" valeur={formatMAD(totalDevis)} sousTexte={`dont accepté ${formatMAD(totalDevisAccepte)}`} couleur="slate" />
        <StatCard titre="Facturé" valeur={formatMAD(totalFacture)} sousTexte={`${facturesActives.length} facture(s)`} couleur="brand" />
        <StatCard titre="Encaissé" valeur={formatMAD(encaisse)} couleur="green" />
        <StatCard titre="Reste dû" valeur={formatMAD(resteDu)} couleur={resteDu > 0 ? "red" : "green"} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Devis */}
          <Section
            titre="Devis"
            count={projet.devis.length}
            addHref={lien("/devis/nouveau")}
            addLabel="+ Nouveau devis"
            vide="Aucun devis rattaché à ce projet."
          >
            {projet.devis.map((d) => (
              <Ligne key={d.id} href={`/devis/${d.id}`} principal={d.numero} secondaire={formatDate(d.date)} montant={formatMAD(ttc(d))} badge={<Badge statut={d.statut} map={STATUTS_DEVIS} />} />
            ))}
          </Section>

          {/* Factures */}
          <Section
            titre="Factures"
            count={projet.factures.length}
            addHref={lien("/factures/nouveau")}
            addLabel="+ Nouvelle facture"
            vide="Aucune facture rattachée à ce projet."
          >
            {projet.factures.map((f) => (
              <Ligne key={f.id} href={`/factures/${f.id}`} principal={f.numero} secondaire={formatDate(f.date)} montant={formatMAD(ttc(f))} badge={<Badge statut={f.statut} map={STATUTS_FACTURE} />} />
            ))}
          </Section>

          {/* Chantiers */}
          <Section
            titre="Chantiers"
            count={projet.chantiers.length}
            addHref={lien("/chantiers/nouveau")}
            addLabel="+ Nouveau chantier"
            vide="Aucun chantier rattaché à ce projet."
          >
            {projet.chantiers.map((c) => (
              <Ligne key={c.id} href={`/chantiers/${c.id}`} principal={c.nom} secondaire={`${c.reference} · ${c.avancement}%`} badge={<Badge statut={c.statut} map={STATUTS_CHANTIER} />} />
            ))}
          </Section>

          {/* Documents */}
          <Section
            titre="Documents & conventions"
            count={projet.documents.length}
            addHref={lien("/documents/nouveau")}
            addLabel="+ Ajouter"
            vide="Aucun document rattaché à ce projet."
          >
            {projet.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between px-5 py-3">
                <span>
                  <span className="font-medium text-slate-900">{doc.titre}</span>
                  <span className="text-xs text-slate-500 ml-2">{TYPES_DOCUMENT[doc.type] || doc.type} · {formatDate(doc.dateDoc)}</span>
                </span>
                {(doc.fichier || doc.lien) && (
                  <a href={doc.fichier || doc.lien} target="_blank" rel="noreferrer" className="text-sm text-brand-600 hover:underline">Ouvrir</a>
                )}
              </div>
            ))}
          </Section>
        </div>

        {/* Panneau latéral */}
        <div className="space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-500">Statut</span>
              <Badge statut={projet.statut} map={STATUTS_PROJET} />
            </div>
            <ProgressBar valeur={avancement} />
            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Client</dt><dd className="text-right"><Link href={`/clients/${projet.clientId}`} className="text-brand-600 hover:underline">{projet.client.nom}</Link></dd></div>
              {projet.responsable && <div className="flex justify-between"><dt className="text-slate-500">Responsable</dt><dd>{projet.responsable}</dd></div>}
              {projet.budget != null && <div className="flex justify-between"><dt className="text-slate-500">Budget</dt><dd className="font-medium">{formatMAD(projet.budget)}</dd></div>}
              <div className="flex justify-between"><dt className="text-slate-500">Début</dt><dd>{formatDate(projet.dateDebut)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Fin prévue</dt><dd>{formatDate(projet.dateFin)}</dd></div>
            </dl>
          </div>

          {/* Marge budgétaire */}
          {projet.budget != null && (
            <div className="card p-5">
              <p className="text-sm font-medium text-slate-700 mb-2">Suivi budgétaire</p>
              <ProgressBar valeur={projet.budget > 0 ? Math.round((totalFacture / projet.budget) * 100) : 0} />
              <p className="mt-2 text-xs text-slate-500">
                Facturé {formatMAD(totalFacture)} sur un budget de {formatMAD(projet.budget)}.
              </p>
            </div>
          )}

          {/* Changer le statut */}
          <div className="card p-5">
            <p className="text-sm font-medium text-slate-700 mb-3">Changer le statut</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(STATUTS_PROJET).map(([v, info]) => (
                <form key={v} action={changerStatutProjet.bind(null, projet.id, v)}>
                  <button
                    type="submit"
                    disabled={projet.statut === v}
                    className={`badge border px-3 py-1 ${projet.statut === v ? info.classe + " border-transparent" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"}`}
                  >
                    {info.label}
                  </button>
                </form>
              ))}
            </div>
          </div>

          {projet.description && (
            <div className="card p-5">
              <p className="text-xs font-semibold uppercase text-slate-400">Description</p>
              <p className="text-sm text-slate-700 whitespace-pre-line">{projet.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Sous-composants ---
function Section({ titre, count, addHref, addLabel, vide, children }) {
  const items = Array.isArray(children) ? children.filter(Boolean) : (children ? [children] : []);
  const estVide = items.length === 0;
  return (
    <div className="card">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
        <h3 className="font-semibold text-slate-900">{titre} ({count})</h3>
        <Link href={addHref} className="text-sm text-brand-600 hover:underline">{addLabel}</Link>
      </div>
      {estVide ? (
        <p className="px-5 py-4 text-sm text-slate-500">{vide}</p>
      ) : (
        <div className="divide-y divide-slate-100">{children}</div>
      )}
    </div>
  );
}

function Ligne({ href, principal, secondaire, montant, badge }) {
  return (
    <Link href={href} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
      <span>
        <span className="font-medium text-slate-900">{principal}</span>
        {secondaire && <span className="text-xs text-slate-500 ml-2">{secondaire}</span>}
      </span>
      <span className="flex items-center gap-3">
        {montant && <span className="text-sm font-medium">{montant}</span>}
        {badge}
      </span>
    </Link>
  );
}
