import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "BET Manager — Gestion bureau d'études techniques",
  description:
    "Gestion interne et externe d'un bureau d'études techniques : clients, devis, factures, chantiers, documentation.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <Sidebar />
        <div className="pl-0 md:pl-64">
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
