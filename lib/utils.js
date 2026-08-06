// Utilitaires partagés : formatage, calculs, numérotation

// -------------------- Formatage --------------------
export function formatMAD(montant) {
  const n = Number(montant || 0);
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 2,
  }).format(n);
}

export function formatNombre(n, decimales = 2) {
  return new Intl.NumberFormat("fr-MA", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(Number(n || 0));
}

export function formatDate(date) {
  if (!date) return "—";
  const d = new Date(date);
  return new Intl.DateTimeFormat("fr-MA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function formatDateLong(date) {
  if (!date) return "—";
  const d = new Date(date);
  return new Intl.DateTimeFormat("fr-MA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

// Pour les champs <input type="date"> (format YYYY-MM-DD)
export function toDateInput(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

// -------------------- Calculs --------------------
// Calcule les totaux à partir d'une liste de lignes {quantite, prixUnitaire}
export function calculerTotaux(lignes = [], tauxTva = 20, remise = 0) {
  const sousTotal = lignes.reduce(
    (acc, l) => acc + Number(l.quantite || 0) * Number(l.prixUnitaire || 0),
    0
  );
  const montantRemise = sousTotal * (Number(remise || 0) / 100);
  const totalHT = sousTotal - montantRemise;
  const montantTva = totalHT * (Number(tauxTva || 0) / 100);
  const totalTTC = totalHT + montantTva;
  return {
    sousTotal,
    montantRemise,
    totalHT,
    montantTva,
    totalTTC,
  };
}

// -------------------- Numérotation --------------------
// Génère un numéro type DEV-2026-0001 / FAC-2026-0001 / CH-2026-0001
export function genererNumero(prefixe, dernierNumero) {
  const annee = new Date().getFullYear();
  let sequence = 1;
  if (dernierNumero) {
    const match = dernierNumero.match(/(\d+)$/);
    if (match) sequence = parseInt(match[1], 10) + 1;
  }
  return `${prefixe}-${annee}-${String(sequence).padStart(4, "0")}`;
}

// -------------------- Libellés & statuts --------------------
export const STATUTS_DEVIS = {
  brouillon: { label: "Brouillon", classe: "bg-gray-100 text-gray-700" },
  envoye: { label: "Envoyé", classe: "bg-blue-100 text-blue-700" },
  accepte: { label: "Accepté", classe: "bg-green-100 text-green-700" },
  refuse: { label: "Refusé", classe: "bg-red-100 text-red-700" },
  expire: { label: "Expiré", classe: "bg-amber-100 text-amber-700" },
};

export const STATUTS_FACTURE = {
  impayee: { label: "Impayée", classe: "bg-red-100 text-red-700" },
  partielle: { label: "Partiellement payée", classe: "bg-amber-100 text-amber-700" },
  payee: { label: "Payée", classe: "bg-green-100 text-green-700" },
  annulee: { label: "Annulée", classe: "bg-gray-100 text-gray-500" },
};

export const STATUTS_CHANTIER = {
  planifie: { label: "Planifié", classe: "bg-blue-100 text-blue-700" },
  en_cours: { label: "En cours", classe: "bg-amber-100 text-amber-700" },
  suspendu: { label: "Suspendu", classe: "bg-orange-100 text-orange-700" },
  termine: { label: "Terminé", classe: "bg-green-100 text-green-700" },
  annule: { label: "Annulé", classe: "bg-gray-100 text-gray-500" },
};

export const STATUTS_TACHE = {
  a_faire: { label: "À faire", classe: "bg-gray-100 text-gray-700" },
  en_cours: { label: "En cours", classe: "bg-blue-100 text-blue-700" },
  termine: { label: "Terminé", classe: "bg-green-100 text-green-700" },
  bloque: { label: "Bloqué", classe: "bg-red-100 text-red-700" },
};

export const STATUTS_PROJET = {
  prospect: { label: "Prospect", classe: "bg-purple-100 text-purple-700" },
  en_cours: { label: "En cours", classe: "bg-amber-100 text-amber-700" },
  suspendu: { label: "Suspendu", classe: "bg-orange-100 text-orange-700" },
  termine: { label: "Terminé", classe: "bg-green-100 text-green-700" },
  annule: { label: "Annulé", classe: "bg-gray-100 text-gray-500" },
};

export const TYPES_CLIENT = {
  entreprise: "Entreprise",
  particulier: "Particulier",
  administration: "Administration / Public",
};

export const TYPES_DOCUMENT = {
  convention: "Convention",
  documentation: "Documentation",
  contrat: "Contrat",
  plan: "Plan",
  rapport: "Rapport",
  autre: "Autre",
};

export const MODES_PAIEMENT = {
  virement: "Virement",
  cheque: "Chèque",
  espece: "Espèces",
  carte: "Carte bancaire",
};

// Informations de l'entreprise (à personnaliser)
export const ENTREPRISE = {
  nom: "Bureau d'Études Techniques",
  slogan: "Ingénierie & Conseil",
  adresse: "Adresse de l'entreprise",
  ville: "Casablanca, Maroc",
  telephone: "+212 5 00 00 00 00",
  email: "contact@bet.ma",
  ice: "000000000000000",
  rc: "000000",
  if: "00000000",
  patente: "00000000",
  rib: "000 000 0000000000000000 00",
};
