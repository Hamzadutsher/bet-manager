"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Tableau de bord", icon: "M3 12l9-9 9 9M4 10v10h5v-6h6v6h5V10" },
  { href: "/clients", label: "Clients", icon: "M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-3a4 4 0 10-4-4 4 4 0 004 4z" },
  { href: "/projets", label: "Projets", icon: "M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" },
  { href: "/devis", label: "Devis", icon: "M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h5l5 5v9a2 2 0 01-2 2z" },
  { href: "/factures", label: "Factures", icon: "M9 7h6m-6 4h6m-6 4h4M5 3h14a1 1 0 011 1v17l-3-2-3 2-3-2-3 2V4a1 1 0 011-1z" },
  { href: "/chantiers", label: "Chantiers", icon: "M13 2L3 14h7l-1 8 10-12h-7l1-8z" },
  { href: "/documents", label: "Documents & Conventions", icon: "M7 21h10a2 2 0 002-2V9.5L14.5 4H7a2 2 0 00-2 2v13a2 2 0 002 2z" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside className="fixed inset-y-0 left-0 z-20 w-64 bg-slate-900 text-slate-300 flex flex-col no-print">
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-white">
            BE
          </div>
          <div>
            <p className="text-white font-semibold leading-tight">BET Manager</p>
            <p className="text-xs text-slate-400">Bureau d'études</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive(item.href)
                ? "bg-brand-600 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
            </svg>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-slate-800 text-xs text-slate-500">
        © {new Date().getFullYear()} BET Manager
      </div>
    </aside>
  );
}
