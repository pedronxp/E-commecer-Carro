export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { BadgePercent, Car, MessageSquareText, Plus, ShieldCheck, Sparkles, Tags, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalCars,
    carsInStock,
    carsSold,
    carsFeatured,
    carsWithFipe,
    carsWithPurchasePrice,
    totalBrands,
    totalUsers,
    newUsers,
    totalSellLeads,
    openSellLeads,
    closedSellLeads,
    recentCars,
    recentSellLeads,
  ] = await Promise.all([
    prisma.car.count(),
    prisma.car.count({ where: { isSold: false } }),
    prisma.car.count({ where: { isSold: true } }),
    prisma.car.count({ where: { isFeatured: true } }),
    prisma.car.count({ where: { fipePrice: { not: null } } }),
    prisma.car.count({ where: { purchasePrice: { not: null } } }),
    prisma.brand.count(),
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.sellLead.count(),
    prisma.sellLead.count({ where: { status: { in: ["NEW", "CONTACTED", "EVALUATING"] } } }),
    prisma.sellLead.count({ where: { status: "CLOSED" } }),
    prisma.car.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
      include: { brand: true, images: { where: { isPrimary: true }, take: 1 } },
    }),
    prisma.sellLead.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const fipeCoverage = totalCars > 0 ? Math.round((carsWithFipe / totalCars) * 100) : 0;
  const marginCoverage = totalCars > 0 ? Math.round((carsWithPurchasePrice / totalCars) * 100) : 0;
  const leadCloseRate = totalSellLeads > 0 ? Math.round((closedSellLeads / totalSellLeads) * 100) : 0;

  const indicators = [
    {
      label: "Estoque ativo",
      value: carsInStock,
      detail: `${totalCars} no total · ${carsSold} vendidos`,
      href: "/admin/cars?status=stock",
      icon: Car,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Vendas recebidas",
      value: openSellLeads,
      detail: `${totalSellLeads} entrada(s) · ${leadCloseRate}% finalizadas`,
      href: "/admin/sell-leads",
      icon: MessageSquareText,
      tone: "bg-sky-50 text-sky-700",
    },
    {
      label: "Cobertura FIPE",
      value: `${fipeCoverage}%`,
      detail: `${carsWithFipe} veículo(s) com referência`,
      href: "/admin/promotions",
      icon: BadgePercent,
      tone: "bg-indigo-50 text-indigo-700",
    },
    {
      label: "Margem informada",
      value: `${marginCoverage}%`,
      detail: `${carsWithPurchasePrice} com custo de compra`,
      href: "/admin/promotions",
      icon: TrendingUp,
      tone: "bg-amber-50 text-amber-700",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-emerald-700">Operação da loja</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">Painel de controle</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Acompanhe estoque, vitrine e contatos de clientes que querem vender veículos.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/cars-new"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              <Plus className="h-4 w-4" />
              Novo veículo
            </Link>
            <Link
              href="/admin/sell-leads"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
            >
              <MessageSquareText className="h-4 w-4" />
              Ver leads
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {indicators.map((indicator) => {
          const Icon = indicator.icon;
          return (
            <Link
              key={indicator.label}
              href={indicator.href}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">{indicator.label}</p>
                  <p className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">{indicator.value}</p>
                  <p className="mt-1 text-sm text-slate-500">{indicator.detail}</p>
                </div>
                <div className={`rounded-lg p-3 ${indicator.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-950">Últimos veículos cadastrados</h2>
            <Link href="/admin/cars" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
              Ver estoque
            </Link>
          </div>
          {recentCars.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Car className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-3 font-medium text-slate-700">Nenhum veículo cadastrado.</p>
              <Link href="/admin/cars-new" className="mt-3 inline-flex text-sm font-semibold text-emerald-700">
                Adicionar primeiro veículo
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentCars.map((car) => (
                <div key={car.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-12 w-16 overflow-hidden rounded-lg bg-slate-100">
                      {car.images[0]?.url ? (
                        <Image src={car.images[0].url} alt="" fill sizes="64px" className="object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-950">{car.title}</p>
                      <p className="text-sm text-slate-500">{car.brand.name} · {car.year}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${car.isSold ? "bg-slate-100 text-slate-700" : "bg-emerald-50 text-emerald-700"}`}>
                    {car.isSold ? "Vendido" : "Estoque"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-950">Venda de veículos</h2>
            <Link href="/admin/sell-leads" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
              Triar
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentSellLeads.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">
                Nenhuma solicitação recebida pela página Vender.
              </div>
            ) : (
              recentSellLeads.map((lead) => (
                <div key={lead.id} className="px-5 py-4">
                  <p className="font-semibold text-slate-950">{lead.vehicleModel}</p>
                  <p className="mt-1 text-sm text-slate-500">{lead.name} · {lead.createdAt.toLocaleDateString("pt-BR")}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-950">Gestão interna e permissões</p>
              <p className="mt-1 text-sm text-slate-500">
                {totalUsers} usuário(s) administrativo(s), {newUsers} novo(s) nos últimos 30 dias.
              </p>
            </div>
          </div>
          <Link href="/admin/users" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
            Administrar acessos
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/brands" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <Tags className="h-5 w-5 text-emerald-700" />
          <p className="mt-3 font-semibold text-slate-950">Marcas cadastradas</p>
          <p className="mt-1 text-sm text-slate-500">{totalBrands} fabricantes organizando o catálogo.</p>
        </Link>
        <Link href="/admin/cars?status=featured" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <Sparkles className="h-5 w-5 text-amber-700" />
          <p className="mt-3 font-semibold text-slate-950">Destaques ativos</p>
          <p className="mt-1 text-sm text-slate-500">{carsFeatured} oferta(s) priorizada(s) na operação comercial.</p>
        </Link>
      </section>
    </div>
  );
}
