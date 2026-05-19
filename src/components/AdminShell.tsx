"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ADMIN_NAV_ITEMS, getAdminRouteTitle } from "@/components/admin/admin-navigation";
import { AdminOperatorStatus } from "@/components/admin/AdminOperatorStatus";
import { Menu } from "lucide-react";

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

  useEffect(() => {
    function collapseSidebar() {
      setSidebarOpen(false);
      setSidebarCollapsed(true);
    }

    window.addEventListener("lima:admin-collapse-sidebar", collapseSidebar);
    return () => window.removeEventListener("lima:admin-collapse-sidebar", collapseSidebar);
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/login";
    }
  }

  function handleMenuToggle() {
    if (window.matchMedia("(min-width: 768px)").matches) {
      setSidebarCollapsed((value) => !value);
      setSidebarOpen(false);
      return;
    }

    setSidebarOpen((value) => !value);
  }

  function handleContentPointerDown() {
    setSidebarOpen(false);

    if (window.matchMedia("(min-width: 768px)").matches) {
      setSidebarCollapsed(true);
    }
  }

  return (
    <div className="admin-workspace flex min-h-screen text-foreground">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-30 bg-slate-950/45 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={`admin-sidebar fixed inset-y-0 left-0 z-40 border-r text-slate-100 transition-all duration-200 md:translate-x-0 ${
          sidebarCollapsed ? "w-20" : "w-[min(17rem,calc(100vw-1rem))]"
        } ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className={`admin-sidebar-header border-b ${sidebarCollapsed ? "px-3 py-4" : "p-4"}`}>
          <div className={sidebarCollapsed ? "flex flex-col items-center gap-3" : "flex items-center gap-3"}>
            <Link
              href="/admin"
              className={sidebarCollapsed ? "flex items-center justify-center" : "flex min-w-0 items-center gap-3"}
              title="Lima Automoveis"
            >
              <span className="brand-logo-monogram bg-white/5 text-white">
                <span className="brand-logo-l">L</span>
                <span className="brand-logo-line" />
              </span>
              {!sidebarCollapsed ? (
                <span className="min-w-0">
                  <span className="admin-sidebar-title block truncate text-sm font-black">Lima Automóveis</span>
                  <span className="admin-sidebar-subtitle mt-0.5 block truncate text-[11px] font-semibold uppercase tracking-[0.16em]">
                    Gestão da loja
                  </span>
                </span>
              ) : null}
            </Link>
          </div>
        </div>

        <nav className="space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || isSectionActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                title={sidebarCollapsed ? item.label : undefined}
                aria-current={isActive ? "page" : undefined}
                className={`admin-sidebar-link flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${
                  isActive
                    ? "admin-sidebar-link-active"
                    : ""
                } ${sidebarCollapsed ? "justify-center" : ""}`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed ? <span className="truncate">{item.label}</span> : null}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div
        className={`min-w-0 flex-1 transition-all duration-200 ${sidebarCollapsed ? "md:ml-20" : "md:ml-[17rem]"}`}
        onPointerDown={handleContentPointerDown}
      >
        <header className="admin-topbar sticky top-0 z-10 flex min-h-16 items-center px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3 pr-4">
            <button
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={handleMenuToggle}
              className="admin-topbar-button inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-colors"
              title={sidebarCollapsed ? "Abrir menu" : "Recolher menu"}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="admin-topbar-kicker hidden sm:block">Painel admin</p>
              <h1 className="admin-topbar-title truncate text-lg">{pageTitle}</h1>
            </div>
          </div>
          <AdminOperatorStatus user={user} ipAddress={ipAddress} city={city} onLogout={handleLogout} />
        </header>

        <main className="admin-main-surface p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function isSectionActive(pathname: string, href: string): boolean {
  if (href === "/" || href === "/admin" || href === "/admin/cars") {
    return false;
  }

  if (href === "/admin/taxonomies/brands") {
    return pathname.startsWith("/admin/taxonomies/brands") || pathname.startsWith("/admin/brands");
  }

  if (href === "/admin/taxonomies/categories") {
    return pathname.startsWith("/admin/taxonomies/categories") || pathname.startsWith("/admin/categories");
  }

  return pathname.startsWith(href);
}
