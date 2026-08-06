"use client";

import { useState, useTransition } from "react";

// Bouton de suppression avec confirmation inline (sans window.confirm bloquant)
export default function DeleteButton({ action, label = "Supprimer", className = "btn-danger" }) {
  const [confirm, setConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (confirm) {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="text-sm text-slate-600">Confirmer ?</span>
        <button
          type="button"
          className="btn-danger"
          disabled={isPending}
          onClick={() => startTransition(() => action())}
        >
          {isPending ? "Suppression…" : "Oui, supprimer"}
        </button>
        <button type="button" className="btn-secondary" onClick={() => setConfirm(false)}>
          Annuler
        </button>
      </span>
    );
  }

  return (
    <button type="button" className={className} onClick={() => setConfirm(true)}>
      {label}
    </button>
  );
}
