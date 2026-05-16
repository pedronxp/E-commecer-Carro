"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ADMIN_NAV_ITEMS, getAdminRouteTitle } from "@/components/admin/admin-navigation";
import { AdminOperatorStatus } from "@/components/admin/AdminOperatorStatus";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";

type AdminShellUser = {
  name: string;
  email: string;
  role: "ADMIN";
};

export default function AdminShell({
  children,
  user,
  ipAddress,
  city,
}: {
  children: React.ReactNode;
  user: AdminShellUser;
  ipAddress: string;
  city: string;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pageTitle = getAdminRouteTitle(pathname);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/login";
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed z-40 h-full border-r border-slate-200 bg-white/95 text-slate-900 shadow-sm backdrop-blur transition-all duration-200 md:translate-x-0 ${
          sidebarCollapsed ? "w-20" : "w-72"
        } ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className={`border-b border-slate-200 p-4 ${sidebarCollapsed ? "px-3" : ""}`}>
          <div className={sidebarCollapsed ? "flex flex-col items-center gap-3" : "flex items-start justify-between gap-3"}>
            {!sidebarCollapsed ? (
              <div className="min-w-0 flex-1 text-center">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-700">Lima Automóveis</p>
                <Link href="/admin" className="mt-2 block text-xl font-black leading-tight tracking-tight text-slate-950">
                  Painel Administrativo
                </Link>
              </div>
            ) : (
              <Link
                href="/admin"
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-black tracking-tight text-white shadow-sm"
                title="Painel Administrativo"
              >
                LA
              </Link>
            )}
            <button
              type="button"
              onClick={() => setSidebarCollapsed((value) => !value)}
              className="hidden rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-950 md:inline-flex"
              title={sidebarCollapsed ? "Expandir menu" : "Esconder menu"}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <nav className="space-y-1.5 p-4">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || isSectionActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-700/20"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed ? <span>{item.label}</span> : null}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className={`min-w-0 flex-1 transition-all duration-200 ${sidebarCollapsed ? "md:ml-20" : "md:ml-72"}`}>
        <header className="sticky top-0 z-10 flex min-h-16 items-center border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-8">
          <div className="flex min-w-0 items-center gap-3 pr-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 md:hidden"
              title="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="truncate text-lg font-semibold text-slate-950">{pageTitle}</h1>
          </div>
          <AdminOperatorStatus user={user} ipAddress={ipAddress} city={city} onLogout={handleLogout} />
        </header>

        <main className="p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}

function isSectionActive(pathname: string, href: string): boolean {
  if (href === "/" || href === "/admin" || href === "/admin/cars") {
    return false;
  }

  return pathname.startsWith(href);
}
