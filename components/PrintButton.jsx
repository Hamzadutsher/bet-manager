"use client";

export default function PrintButton({ label = "Imprimer / Enregistrer en PDF" }) {
  return (
    <button type="button" onClick={() => window.print()} className="btn-primary no-print">
      {label}
    </button>
  );
}
