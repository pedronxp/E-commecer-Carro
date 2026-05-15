export const dynamic = "force-dynamic";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalCars,
    carsInStock,
    carsSold,
    carsFeatured,
    totalBrands,
    totalCategories,
    totalUsers,
    newUsers,
    totalFavorites,
    totalCartItems,
    recentCars,
  ] = await Promise.all([
    prisma.car.count(),
    prisma.car.count({ where: { isSold: false } }),
    prisma.car.count({ where: { isSold: true } }),
    prisma.car.count({ where: { isFeatured: true } }),
    prisma.brand.count(),
    prisma.category.count(),
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.favorite.count(),
    prisma.cartItem.count(),
    prisma.car.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { brand: true },
    }),
  ]);

  const stats = [
    {
      label: "Total de Carros",
      value: totalCars,
      subValue: `${carsInStock} em estoque`,
      href: "/admin/cars",
      color: "blue",
      icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
    },
    {
      label: "Carros Vendidos",
      value: carsSold,
      subValue: "Total de vendas",
      href: "/admin/cars",
      color: "green",
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      label: "Destaques",
      value: carsFeatured,
      subValue: "Carros em destaque",
      href: "/admin/cars",
      color: "amber",
      icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.705c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.705a1 1 0 00.951-.69l1.519-4.674z",
    },
    {
      label: "Marcas",
      value: totalBrands,
      subValue: "Marcas cadastradas",
      href: "/admin/brands",
      color: "purple",
      icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01",
    },
    {
      label: "Categorias",
      value: totalCategories,
      subValue: "Categorias ativas",
      href: "/admin/categories",
      color: "pink",
      icon: "M4 6h16M4 10h16M4 14h16M4 18h16",
    },
    {
      label: "Usuários",
      value: totalUsers,
      subValue: `${newUsers} novos (30 dias)`,
      href: "/admin/users",
      color: "indigo",
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    },
    {
      label: "Favoritos",
      value: totalFavorites,
      totalCars: totalCars > 0 ? Math.round((totalFavorites / totalCars) * 100) : 0,
      subValue: "curtidas total",
      href: "/admin/cars",
      color: "red",
      icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    },
    {
      label: "Carrinho",
      value: totalCartItems,
      subValue: "items salvos",
      href: "/admin/cars",
      color: "orange",
      icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
    },
  ];

  const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", iconBg: "bg-blue-100" },
    green: { bg: "bg-green-50", text: "text-green-600", iconBg: "bg-green-100" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", iconBg: "bg-amber-100" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", iconBg: "bg-purple-100" },
    pink: { bg: "bg-pink-50", text: "text-pink-600", iconBg: "bg-pink-100" },
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", iconBg: "bg-indigo-100" },
    red: { bg: "bg-red-50", text: "text-red-600", iconBg: "bg-red-100" },
    orange: { bg: "bg-orange-50", text: "text-orange-600", iconBg: "bg-orange-100" },
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Visão geral da sua loja</p>
        </div>
        <Link
          href="/admin/cars-new"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Carro
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const colors = colorMap[stat.color];
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colors.iconBg}`}>
                  <svg className={`w-6 h-6 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                  </svg>
                </div>
                {stat.totalCars !== undefined && (
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {stat.totalCars}%
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              {stat.subValue && (
                <p className="text-xs text-gray-400 mt-1">{stat.subValue}</p>
              )}
            </Link>
          );
        })}
      </div>

      {/* Recent Cars */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Carros Recentes</h2>
          <Link href="/admin/cars" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            Ver todos →
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentCars.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <p>Nenhum carro cadastrado ainda.</p>
              <Link href="/admin/cars-new" className="text-indigo-600 hover:underline mt-2 inline-block">
                Adicionar primeiro carro
              </Link>
            </div>
          ) : (
            recentCars.map((car) => (
              <div key={car.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{car.title}</p>
                    <p className="text-sm text-gray-500">{car.brand.name} • {car.year}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    R$ {car.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded ${car.isSold ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                    {car.isSold ? "Vendido" : "Estoque"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Link href="/admin/cars" className="bg-white rounded-xl p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Gerenciar Carros</p>
              <p className="text-sm text-gray-500">Ver, editar ou remover veículos</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/users" className="bg-white rounded-xl p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Gerenciar Usuários</p>
              <p className="text-sm text-gray-500">Admin roles e permissões</p>
            </div>
          </div>
        </Link>

        <Link href="/" className="bg-white rounded-xl p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Ver Loja</p>
              <p className="text-sm text-gray-500">Visualizar página pública</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
