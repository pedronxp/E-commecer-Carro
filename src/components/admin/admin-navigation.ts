export type AdminNavItem = {
  href: string
  label: string
  iconPath: string
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    iconPath:
      "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    href: "/admin/cars",
    label: "Carros",
    iconPath:
      "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  },
  {
    href: "/admin/brands",
    label: "Marcas",
    iconPath:
      "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01",
  },
  {
    href: "/admin/categories",
    label: "Categorias",
    iconPath: "M4 6h16M4 10h16M4 14h16M4 18h16",
  },
]

const ADMIN_ROUTE_TITLES: Array<{ match: (pathname: string) => boolean; title: string }> = [
  { match: (pathname) => pathname === "/admin", title: "Dashboard" },
  { match: (pathname) => pathname.startsWith("/admin/cars-new"), title: "Novo Carro" },
  { match: (pathname) => pathname.startsWith("/admin/cars"), title: "Carros" },
  { match: (pathname) => pathname.startsWith("/admin/brands"), title: "Marcas" },
  { match: (pathname) => pathname.startsWith("/admin/categories"), title: "Categorias" },
  { match: (pathname) => pathname.startsWith("/admin/users"), title: "Usuários" },
]

export function getAdminRouteTitle(pathname: string): string {
  const match = ADMIN_ROUTE_TITLES.find((entry) => entry.match(pathname))
  return match?.title ?? "Painel Administrativo"
}
