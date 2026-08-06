import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  formatMAD,
  formatDate,
  calculerTotaux,
  STATUTS_DEVIS,
  STATUTS_FACTURE,
  STATUTS_CHANTIER,
  STATUTS_PROJET,
} from "@/lib/utils";
import { StatCard, PageHeader, Badge, ProgressBar } from "@/components/ui";

export const dynamic = "force-dynamic";

// Calcule le TTC d'un document à partir de ses lignes
function ttc(doc) {
  return calculerTotaux(doc.lignes, doc.tauxTva, doc.remise).totalTTC;
}

export default async function DashboardPage() {
  const [clients, devis, factures, chantiers, projets] = await Promise.all([
    prisma.client.count(),
    prisma.devis.findMany({ include: { lignes: true, client: true }, orderBy: { date: "desc" } }),
    prisma.facture.findMany({ include: { lignes: true, client: true }, orderBy: { date: "desc" } }),
    prisma.chantier.findMany({ include: { client: true }, orderBy: { updatedAt: "desc" } }),
    prisma.projet.findMany({
      include: { client: true, chantiers: { select: { avancement: true } }, _count: { select: { devis: true, factures: true, chantiers: true } } },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const projetsActifs = projets.filter((p) => p.statut === "en_cours" || p.statut === "prospect");
  const avancementProjet = (chs) =>
    chs.length ? Math.round(chs.reduce((s, c) => s + (c.avancement || 0), 0) / chs.length) : 0;

  // Indicateurs
  const caEncaisse = factures.reduce((s, f) => s + (f.montantPaye || 0), 0);
  const totalFacture = factures
    .filter((f) => f.statut !== "annulee")
    .reduce((s, f) => s + ttc(f), 0);
  const impaye = totalFacture - caEncaisse;

  const devisEnAttente = devis.filter((d) => d.statut === "envoye");
  const devisEnAttenteMontant = devisEnAttente.reduce((s, d) => s + ttc(d), 0);

  const chantiersEnCours = chantiers.filter((c) => c.statut === "en_cours");

  const derniersDevis = devis.slice(0, 5);
  const facturesImpayees = factures
    .filter((f) => f.statut === "impayee" || f.statut === "partielle")
    .slice(0, 5);

  return (
    <div>
      <PageHeader
        titre="Tableau de bord"
        sousTitre="Vue d'ensemble de l'activité du bureau d'études"
      />

      {/* Indicateurs principaux */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard titre="Chiffre d'affaires encaissé" valeur={formatMAD(caEncaisse)} sousTexte="Paiements reçus" couleur="green" />
        <StatCard titre="Impayés" valeur={formatMAD(impaye)} sousTexte={`${factures.filter((f) => f.statut === "impayee" || f.statut === "partielle").length} facture(s)`} couleur="red" />
        <StatCard titre="Devis en attente" valeur={formatMAD(devisEnAttenteMontant)} sousTexte={`${devisEnAttente.length} devis envoyé(s)`} couleur="amber" />
        <StatCard titre="Chantiers en cours" valeur={chantiersEnCours.length} sousTexte={`${chantiers.length} au total`} couleur="brand" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard titre="Projets actifs" valeur={projetsActifs.length} sousTexte={`${projets.length} au total`} couleur="brand" />
        <StatCard titre="Clients" valeur={clients} couleur="slate" />
        <StatCard titre="Devis" valeur={devis.length} couleur="slate" />
        <StatCard titre="Factures" valeur={factures.length} couleur="slate" />
      </div>

      {/* Projets actifs */}
      <div className="mt-6 card">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Projets actifs</h2>
          <Link href="/projets" className="text-sm text-brand-600 hover:underline">Tout voir</Link>
        </div>
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {projetsActifs.length === 0 && (
            <p className="text-sm text-slate-500">Aucun projet actif.</p>
          )}
          {projetsActifs.slice(0, 6).map((p) => (
            <Link key={p.id} href={`/projets/${p.id}`} className="rounded-lg border border-slate-200 p-4 hover:border-brand-300 hover:shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-slate-900">{p.nom}</p>
                <Badge statut={p.statut} map={STATUTS_PROJET} />
              </div>
              <p className="text-xs text-slate-500 mt-1 mb-3">{p.client.nom} · {p._count.devis} devis · {p._count.factures} fact.</p>
              <ProgressBar valeur={avancementProjet(p.chantiers)} />
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Derniers devis */}
        <div className="card">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Derniers devis</h2>
            <Link href="/devis" className="text-sm text-brand-600 hover:underline">Tout voir</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {derniersDevis.length === 0 && (
              <p className="px-5 py-6 text-sm text-slate-500">Aucun devis pour le moment.</p>
            )}
            {derniersDevis.map((d) => (
              <Link key={d.id} href={`/devis/${d.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                <div>
                  <p className="font-medium text-slate-900">{d.numero}</p>
                  <p className="text-xs text-slate-500">{d.client.nom} · {formatDate(d.date)}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-900">{formatMAD(ttc(d))}</p>
                  <Badge statut={d.statut} map={STATUTS_DEVIS} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Factures impayées */}
        <div className="card">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Factures à encaisser</h2>
            <Link href="/factures" className="text-sm text-brand-600 hover:underline">Tout voir</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {facturesImpayees.length === 0 && (
              <p className="px-5 py-6 text-sm text-slate-500">Aucune facture impayée. 🎉</p>
            )}
            {facturesImpayees.map((f) => (
              <Link key={f.id} href={`/factures/${f.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                <div>
                  <p className="font-medium text-slate-900">{f.numero}</p>
                  <p className="text-xs text-slate-500">{f.client.nom} · échéance {formatDate(f.echeance)}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-900">{formatMAD(ttc(f) - (f.montantPaye || 0))}</p>
                  <Badge statut={f.statut} map={STATUTS_FACTURE} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Chantiers en cours */}
      <div className="mt-6 card">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Chantiers en cours</h2>
          <Link href="/chantiers" className="text-sm text-brand-600 hover:underline">Tout voir</Link>
        </div>
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {chantiersEnCours.length === 0 && (
            <p className="text-sm text-slate-500">Aucun chantier en cours.</p>
          )}
          {chantiersEnCours.map((c) => (
            <Link key={c.id} href={`/chantiers/${c.id}`} className="rounded-lg border border-slate-200 p-4 hover:border-brand-300 hover:shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-slate-900">{c.nom}</p>
                <Badge statut={c.statut} map={STATUTS_CHANTIER} />
              </div>
              <p className="text-xs text-slate-500 mt-1 mb-3">{c.client.nom}</p>
              <ProgressBar valeur={c.avancement} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
