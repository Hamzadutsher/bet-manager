import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, TYPES_CLIENT } from "@/lib/utils";
import { PageHeader, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ClientsPage({ searchParams }) {
  const q = (searchParams?.q || "").trim();

  const clients = await prisma.client.findMany({
    where: q
      ? {
          OR: [
            { nom: { contains: q, mode: "insensitive" } },
            { contact: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { ville: { contains: q, mode: "insensitive" } },
            { ice: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: { _count: { select: { devis: true, factures: true, chantiers: true } } },
    orderBy: { nom: "asc" },
  });

  return (
    <div>
      <PageHeader
        titre="Clients"
        sousTitre={`${clients.length} client(s)`}
        actions={<Link href="/clients/nouveau" className="btn-primary">+ Nouveau client</Link>}
      />

      <form className="mb-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Rechercher par nom, contact, email, ville, ICE…"
          className="input max-w-md"
        />
      </form>

      {clients.length === 0 ? (
        <EmptyState
          titre="Aucun client"
          message={q ? "Aucun résultat pour cette recherche." : "Commencez par ajouter votre premier client."}
          action={<Link href="/clients/nouveau" className="btn-primary">+ Nouveau client</Link>}
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="th">Client</th>
                <th className="th">Type</th>
                <th className="th">Contact</th>
                <th className="th">Ville</th>
                <th className="th text-center">Devis</th>
                <th className="th text-center">Chantiers</th>
                <th className="th">Ajouté le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="td">
                    <Link href={`/clients/${c.id}`} className="font-medium text-brand-700 hover:underline">
                      {c.nom}
                    </Link>
                    {c.ice && <p className="text-xs text-slate-400">ICE : {c.ice}</p>}
                  </td>
                  <td className="td">{TYPES_CLIENT[c.type] || c.type}</td>
                  <td className="td">
                    {c.contact || "—"}
                    {c.telephone && <p className="text-xs text-slate-400">{c.telephone}</p>}
                  </td>
                  <td className="td">{c.ville || "—"}</td>
                  <td className="td text-center">{c._count.devis}</td>
                  <td className="td text-center">{c._count.chantiers}</td>
                  <td className="td text-slate-500">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
