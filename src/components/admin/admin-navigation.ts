import type { LucideIcon } from "lucide-react";
import {
  BadgePercent,
  Car,
  Factory,
  Gauge,
  Layers3,
  MessageSquareText,
  PlusCircle,
  ShieldCheck,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: Gauge },
  { href: "/admin/cars", label: "Estoque", icon: Car },
  { href: "/admin/cars-new", label: "Novo veículo", icon: PlusCircle },
  { href: "/admin/promotions", label: "Comparativo FIPE", icon: BadgePercent },
  { href: "/admin/sell-leads", label: "Vendas recebidas", icon: MessageSquareText },
  { href: "/admin/brands", label: "Marcas / Fabricantes", icon: Factory },
  { href: "/admin/categories", label: "Categorias / Segmentos", icon: Layers3 },
  { href: "/admin/users", label: "Acessos", icon: ShieldCheck },
];

const ADMIN_ROUTE_TITLES: Array<{ match: (pathname: string) => boolean; title: string }> = [
  { match: (pathname) => pathname === "/admin", title: "Dashboard" },
  { match: (pathname) => pathname.startsWith("/admin/cars-new"), title: "Novo veículo" },
  { match: (pathname) => pathname.startsWith("/admin/cars"), title: "Estoque" },
  { match: (pathname) => pathname.startsWith("/admin/promotions"), title: "Comparativo FIPE" },
  { match: (pathname) => pathname.startsWith("/admin/sell-leads"), title: "Vendas recebidas" },
  { match: (pathname) => pathname.startsWith("/admin/brands"), title: "Marcas / Fabricantes" },
  { match: (pathname) => pathname.startsWith("/admin/categories"), title: "Categorias / Segmentos" },
  { match: (pathname) => pathname.startsWith("/admin/users"), title: "Acessos" },
];

export function getAdminRouteTitle(pathname: string): string {
  const match = ADMIN_ROUTE_TITLES.find((entry) => entry.match(pathname));
  return match?.title ?? "Painel Administrativo";
}
