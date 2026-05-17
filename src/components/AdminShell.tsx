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
  role: "ADMIN" | "USER";
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
  const navItems = ADMIN_NAV_ITEMS.filter((item) => !item.adminOnly || user.role === "ADMIN");

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/login";
    }
  }

  return (
    <div className="flex min-h-screen bg-[linear-gradient(180deg,var(--background),white)] text-foreground">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-30 bg-slate-950/45 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed z-40 h-full border-r border-slate-800/80 bg-slate-950 text-slate-100 shadow-xl shadow-slate-950/20 transition-all duration-200 md:translate-x-0 ${
          sidebarCollapsed ? "w-20" : "w-72"
        } ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className={`border-b border-white/10 p-4 ${sidebarCollapsed ? "px-3" : ""}`}>
          <div className={sidebarCollapsed ? "flex flex-col items-center gap-3" : "flex items-start justify-between gap-3"}>
            {!sidebarCollapsed ? (
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary-light">Lima Automóveis</p>
                <Link href="/admin" className="mt-2 block text-xl font-black leading-tight tracking-tight text-white">
                  Painel Administrativo
                </Link>
                <p className="mt-1 text-xs text-slate-400">Operação, estoque e atendimento</p>
              </div>
            ) : (
              <Link
                href="/admin"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-primary text-sm font-black tracking-tight text-white shadow-sm"
                title="Painel Administrativo"
              >
                LA
              </Link>
            )}
            <button
              type="button"
              onClick={() => setSidebarCollapsed((value) => !value)}
              className="hidden rounded-lg border border-white/10 p-2 text-slate-400 transition hover:bg-white/10 hover:text-white md:inline-flex"
              title={sidebarCollapsed ? "Expandir menu" : "Esconder menu"}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <nav className="space-y-1.5 p-3">
          {navItems.map((item) => {
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
                    ? "bg-primary text-white shadow-sm shadow-primary/20"
                    : "text-slate-400 hover:bg-white/8 hover:text-white"
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
        <header className="sticky top-0 z-10 flex min-h-16 items-center border-b border-border bg-white/90 px-4 py-3 backdrop-blur sm:px-8">
          <div className="flex min-w-0 items-center gap-3 pr-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg border border-border p-2 text-muted transition-colors hover:bg-surface hover:text-foreground md:hidden"
              title="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-muted sm:block">Admin</p>
              <h1 className="truncate text-lg font-semibold text-foreground">{pageTitle}</h1>
            </div>
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
