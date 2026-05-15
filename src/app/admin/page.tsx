export const dynamic = "force-dynamic";
import Image from "next/image";
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
      include: { brand: true, images: { where: { isPrimary: true }, take: 1 } },
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
      subValue: "Total de vendas concluídas",
      href: "/admin/cars?status=sold",
      color: "green",
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      label: "Destaques",
      value: carsFeatured,
      subValue: "Veículos em vitrine",
      href: "/admin/cars?status=featured",
      color: "amber",
      icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.705c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.705a1 1 0 00.951-.69l1.519-4.674z",
    },
    {
      label: "Marcas",
      value: totalBrands,
      subValue: "Fabricantes cadastrados",
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
      label: "Favoritos",
      value: totalFavorites,
      badge: totalCars > 0 ? `${Math.round((totalFavorites / totalCars) * 100)}%` : "0%",
      subValue: "Interações da vitrine",
      href: "/admin/cars",
      color: "red",
      icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    },
    {
      label: "Carrinho",
      value: totalCartItems,
      subValue: "Itens em negociação",
      href: "/admin/cars",
      color: "orange",
      icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
    },
  ];

  const colorMap: Record<string, { text: string; iconBg: string }> = {
    blue: { text: "text-blue-600", iconBg: "bg-blue-100" },
    green: { text: "text-green-600", iconBg: "bg-green-100" },
    amber: { text: "text-amber-600", iconBg: "bg-amber-100" },
    purple: { text: "text-purple-600", iconBg: "bg-purple-100" },
    pink: { text: "text-pink-600", iconBg: "bg-pink-100" },
    red: { text: "text-red-600", iconBg: "bg-red-100" },
    orange: { text: "text-orange-600", iconBg: "bg-orange-100" },
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Visão comercial e operacional da loja</p>
        </div>
        <Link
          href="/admin/cars-new"
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Carro
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
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
                {stat.badge && (
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {stat.badge}
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.subValue}</p>
            </Link>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Carros Recentes</h2>
          <Link href="/admin/cars" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            Ver todos
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentCars.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-lg font-medium text-gray-600">Nenhum carro cadastrado ainda.</p>
              <p className="text-sm mt-1">Comece adicionando seu primeiro veículo.</p>
              <Link href="/admin/cars-new" className="inline-flex items-center gap-2 mt-4 text-indigo-600 hover:text-indigo-700 font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Adicionar primeiro carro
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {recentCars.map((car) => (
                <div key={car.id} className="px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="relative w-12 h-10 sm:w-16 sm:h-12 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {car.images?.[0]?.url ? (
                        <Image
                          src={car.images[0].url}
                          alt=""
                          fill
                          sizes="(min-width: 640px) 64px, 48px"
                          className="object-cover"
                        />
                      ) : (
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{car.title}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{car.brand.name} • {car.year}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">
                      R$ {car.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded ${car.isSold ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                      {car.isSold ? "Vendido" : "Estoque"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8">
        <Link href="/admin/cars" className="bg-white rounded-xl p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Gerenciar Carros</p>
              <p className="text-sm text-gray-500">Cadastro, edição e status de venda</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/brands" className="bg-white rounded-xl p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Gerenciar Marcas</p>
              <p className="text-sm text-gray-500">Organizar catálogo por fabricante</p>
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
              <p className="font-medium text-gray-900">Ver Vitrine</p>
              <p className="text-sm text-gray-500">Abrir site público da loja</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5">
        <p className="text-sm font-semibold text-gray-900">Gestão interna</p>
        <p className="mt-1 text-sm text-gray-500">
          {totalUsers} usuários cadastrados, sendo {newUsers} novos nos últimos 30 dias.
        </p>
        <Link href="/admin/users" className="mt-3 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700">
          Acessar usuários e permissões
        </Link>
      </div>
    </div>
  );
}
