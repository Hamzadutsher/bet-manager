import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMAD, STATUTS_PROJET } from "@/lib/utils";
import { PageHeader, EmptyState, Badge, ProgressBar } from "@/components/ui";

export const dynamic = "force-dynamic";

// Avancement global = moyenne de l'avancement des chantiers du projet
function avancementProjet(chantiers) {
  if (!chantiers.length) return 0;
  return Math.round(chantiers.reduce((s, c) => s + (c.avancement || 0), 0) / chantiers.length);
}

export default async function ProjetsPage({ searchParams }) {
  const statut = searchParams?.statut || "";
  const projets = await prisma.projet.findMany({
    where: statut ? { statut } : undefined,
    include: {
      client: true,
      chantiers: { select: { avancement: true } },
      _count: { select: { devis: true, factures: true, chantiers: true, documents: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const filtres = [["", "Tous"], ...Object.entries(STATUTS_PROJET).map(([v, i]) => [v, i.label])];

  return (
    <div>
      <PageHeader
        titre="Projets"
        sousTitre={`${projets.length} projet(s)`}
        actions={<Link href="/projets/nouveau" className="btn-primary">+ Nouveau projet</Link>}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {filtres.map(([v, l]) => (
          <Link
            key={v}
            href={v ? `/projets?statut=${v}` : "/projets"}
            className={`badge border ${statut === v ? "bg-brand-600 text-white border-brand-600" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"}`}
          >
            {l}
          </Link>
        ))}
      </div>

      {projets.length === 0 ? (
        <EmptyState
          titre="Aucun projet"
          message="Créez un projet pour regrouper devis, factures, chantiers et documents d'un même client."
          action={<Link href="/projets/nouveau" className="btn-primary">+ Nouveau projet</Link>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projets.map((p) => (
            <Link key={p.id} href={`/projets/${p.id}`} className="card p-5 hover:border-brand-300 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="font-semibold text-slate-900">{p.nom}</p>
                <Badge statut={p.statut} map={STATUTS_PROJET} />
              </div>
              <p className="text-xs text-slate-500">{p.reference} · {p.client.nom}</p>

              <div className="mt-4"><ProgressBar valeur={avancementProjet(p.chantiers)} /></div>

              <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                <div><p className="text-lg font-semibold text-slate-900">{p._count.devis}</p><p className="text-[11px] text-slate-400">Devis</p></div>
                <div><p className="text-lg font-semibold text-slate-900">{p._count.factures}</p><p className="text-[11px] text-slate-400">Factures</p></div>
                <div><p className="text-lg font-semibold text-slate-900">{p._count.chantiers}</p><p className="text-[11px] text-slate-400">Chantiers</p></div>
                <div><p className="text-lg font-semibold text-slate-900">{p._count.documents}</p><p className="text-[11px] text-slate-400">Docs</p></div>
              </div>

              {p.budget != null && (
                <p className="mt-4 text-sm text-slate-500">Budget : <span className="font-medium text-slate-800">{formatMAD(p.budget)}</span></p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
