import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMAD, formatDate, STATUTS_CHANTIER } from "@/lib/utils";
import { PageHeader, EmptyState, Badge, ProgressBar } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ChantiersPage({ searchParams }) {
  const statut = searchParams?.statut || "";
  const chantiers = await prisma.chantier.findMany({
    where: statut ? { statut } : undefined,
    include: { client: true, _count: { select: { taches: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const filtres = [["", "Tous"], ...Object.entries(STATUTS_CHANTIER).map(([v, i]) => [v, i.label])];

  return (
    <div>
      <PageHeader
        titre="Chantiers"
        sousTitre={`${chantiers.length} chantier(s)`}
        actions={<Link href="/chantiers/nouveau" className="btn-primary">+ Nouveau chantier</Link>}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {filtres.map(([v, l]) => (
          <Link
            key={v}
            href={v ? `/chantiers?statut=${v}` : "/chantiers"}
            className={`badge border ${statut === v ? "bg-brand-600 text-white border-brand-600" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"}`}
          >
            {l}
          </Link>
        ))}
      </div>

      {chantiers.length === 0 ? (
        <EmptyState
          titre="Aucun chantier"
          message="Créez votre premier chantier."
          action={<Link href="/chantiers/nouveau" className="btn-primary">+ Nouveau chantier</Link>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {chantiers.map((c) => (
            <Link key={c.id} href={`/chantiers/${c.id}`} className="card p-5 hover:border-brand-300 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="font-semibold text-slate-900">{c.nom}</p>
                <Badge statut={c.statut} map={STATUTS_CHANTIER} />
              </div>
              <p className="text-xs text-slate-500">{c.reference} · {c.client.nom}</p>
              {c.ville && <p className="text-xs text-slate-400 mb-3">{c.ville}</p>}
              <div className="mt-3"><ProgressBar valeur={c.avancement} /></div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>{c._count.taches} tâche(s)</span>
                {c.budget ? <span>{formatMAD(c.budget)}</span> : <span />}
              </div>
              {(c.dateDebut || c.dateFin) && (
                <p className="mt-2 text-xs text-slate-400">
                  {formatDate(c.dateDebut)} → {formatDate(c.dateFin)}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
