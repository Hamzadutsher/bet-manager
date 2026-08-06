import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, TYPES_DOCUMENT } from "@/lib/utils";
import { PageHeader, EmptyState } from "@/components/ui";
import DeleteButton from "@/components/DeleteButton";
import { supprimerDocument } from "./actions";

export const dynamic = "force-dynamic";

export default async function DocumentsPage({ searchParams }) {
  const type = searchParams?.type || "";
  const documents = await prisma.document.findMany({
    where: type ? { type } : undefined,
    include: { client: true, chantier: true },
    orderBy: { dateDoc: "desc" },
  });

  const filtres = [["", "Tous"], ...Object.entries(TYPES_DOCUMENT).map(([v, l]) => [v, l])];

  return (
    <div>
      <PageHeader
        titre="Documents & Conventions"
        sousTitre={`${documents.length} document(s)`}
        actions={<Link href="/documents/nouveau" className="btn-primary">+ Ajouter un document</Link>}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {filtres.map(([v, l]) => (
          <Link
            key={v}
            href={v ? `/documents?type=${v}` : "/documents"}
            className={`badge border ${type === v ? "bg-brand-600 text-white border-brand-600" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"}`}
          >
            {l}
          </Link>
        ))}
      </div>

      {documents.length === 0 ? (
        <EmptyState
          titre="Aucun document"
          message="Ajoutez conventions, contrats, plans et autres documents."
          action={<Link href="/documents/nouveau" className="btn-primary">+ Ajouter un document</Link>}
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="th">Titre</th>
                <th className="th">Type</th>
                <th className="th">Client</th>
                <th className="th">Chantier</th>
                <th className="th">Date</th>
                <th className="th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {documents.map((doc) => {
                const url = doc.fichier || doc.lien;
                return (
                  <tr key={doc.id} className="hover:bg-slate-50">
                    <td className="td">
                      <p className="font-medium text-slate-900">{doc.titre}</p>
                      {doc.description && <p className="text-xs text-slate-400 max-w-md truncate">{doc.description}</p>}
                    </td>
                    <td className="td">{TYPES_DOCUMENT[doc.type] || doc.type}</td>
                    <td className="td">{doc.client ? <Link href={`/clients/${doc.clientId}`} className="text-brand-600 hover:underline">{doc.client.nom}</Link> : "—"}</td>
                    <td className="td">{doc.chantier ? <Link href={`/chantiers/${doc.chantierId}`} className="text-brand-600 hover:underline">{doc.chantier.nom}</Link> : "—"}</td>
                    <td className="td text-slate-500">{formatDate(doc.dateDoc)}</td>
                    <td className="td">
                      <div className="flex items-center justify-end gap-2">
                        {url && <a href={url} target="_blank" rel="noreferrer" className="btn-ghost">Ouvrir</a>}
                        <Link href={`/documents/${doc.id}/modifier`} className="btn-ghost">Modifier</Link>
                        <DeleteButton action={supprimerDocument.bind(null, doc.id)} label="Suppr." />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
