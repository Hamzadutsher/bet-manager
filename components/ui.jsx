// Petits composants d'interface réutilisables

export function Badge({ statut, map }) {
  const info = map?.[statut] || { label: statut, classe: "bg-gray-100 text-gray-700" };
  return <span className={`badge ${info.classe}`}>{info.label}</span>;
}

export function PageHeader({ titre, sousTitre, actions }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{titre}</h1>
        {sousTitre && <p className="text-sm text-slate-500 mt-1">{sousTitre}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ titre, valeur, sousTexte, couleur = "brand" }) {
  const couleurs = {
    brand: "text-brand-600 bg-brand-50",
    green: "text-green-600 bg-green-50",
    amber: "text-amber-600 bg-amber-50",
    red: "text-red-600 bg-red-50",
    slate: "text-slate-600 bg-slate-100",
  };
  return (
    <div className="card p-5">
      <p className="text-sm font-medium text-slate-500">{titre}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{valeur}</p>
      {sousTexte && (
        <p className={`mt-1 inline-block rounded px-2 py-0.5 text-xs font-medium ${couleurs[couleur]}`}>
          {sousTexte}
        </p>
      )}
    </div>
  );
}

export function EmptyState({ titre, message, action }) {
  return (
    <div className="card p-12 text-center">
      <p className="text-slate-900 font-medium">{titre}</p>
      {message && <p className="text-sm text-slate-500 mt-1">{message}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function ProgressBar({ valeur }) {
  const v = Math.max(0, Math.min(100, valeur || 0));
  const couleur = v >= 100 ? "bg-green-500" : v >= 50 ? "bg-brand-500" : "bg-amber-500";
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>Avancement</span>
        <span className="font-medium">{v}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-200">
        <div className={`h-2 rounded-full ${couleur}`} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}
