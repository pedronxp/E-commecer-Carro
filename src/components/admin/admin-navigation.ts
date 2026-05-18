import type { LucideIcon } from "lucide-react";
import { BadgePercent, Car, Factory, Gauge, Layers3, MessageSquareText, PlusCircle, ShieldCheck } from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: Gauge },
  { href: "/admin/cars", label: "Estoque", icon: Car },
  { href: "/admin/cars-new", label: "Novo veiculo", icon: PlusCircle },
  { href: "/admin/promotions", label: "Comparativo FIPE", icon: BadgePercent },
  { href: "/admin/sell-leads", label: "Vendas recebidas", icon: MessageSquareText },
  { href: "/admin/taxonomies/brands", label: "Marcas / Fabricantes", icon: Factory },
  { href: "/admin/taxonomies/categories", label: "Categorias / Segmentos", icon: Layers3 },
  { href: "/admin/users", label: "Operadores", icon: ShieldCheck, adminOnly: true },
];

const ADMIN_ROUTE_TITLES: Array<{ match: (pathname: string) => boolean; title: string }> = [
  { match: (pathname) => pathname === "/admin", title: "Dashboard" },
  { match: (pathname) => pathname.startsWith("/admin/cars-new"), title: "Novo veiculo" },
  { match: (pathname) => pathname.startsWith("/admin/cars"), title: "Estoque" },
  { match: (pathname) => pathname.startsWith("/admin/promotions"), title: "Comparativo FIPE" },
  { match: (pathname) => pathname.startsWith("/admin/sell-leads"), title: "Vendas recebidas" },
  { match: (pathname) => pathname.startsWith("/admin/taxonomies/brands"), title: "Marcas / Fabricantes" },
  { match: (pathname) => pathname.startsWith("/admin/taxonomies/categories"), title: "Categorias / Segmentos" },
  { match: (pathname) => pathname.startsWith("/admin/brands"), title: "Marcas / Fabricantes" },
  { match: (pathname) => pathname.startsWith("/admin/categories"), title: "Categorias / Segmentos" },
  { match: (pathname) => pathname.startsWith("/admin/users"), title: "Operadores" },
];

export function getAdminRouteTitle(pathname: string): string {
  const match = ADMIN_ROUTE_TITLES.find((entry) => entry.match(pathname));
  return match?.title ?? "Painel Administrativo";
}
