export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  Car,
  Clock3,
  MessageSquareText,
  Plus,
  ShieldCheck,
  Sparkles,
  Tags,
  TrendingUp,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { sellLeadIntentLabels } from "@/lib/schemas";

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
      tone: "bg-primary/10 text-primary",
      bar: stockRatio(carsInStock, totalCars),
    },
    {
      label: "Vendas recebidas",
      value: openSellLeads,
      detail: `${totalSellLeads} entrada(s) · ${leadCloseRate}% finalizadas`,
      href: "/admin/sell-leads",
      icon: MessageSquareText,
      tone: "bg-sky-50 text-sky-700",
      bar: leadCloseRate,
    },
    {
      label: "Cobertura FIPE",
      value: `${fipeCoverage}%`,
      detail: `${carsWithFipe} veículo(s) com referência`,
      href: "/admin/promotions",
      icon: BadgePercent,
      tone: "bg-indigo-50 text-indigo-700",
      bar: fipeCoverage,
    },
    {
      label: "Margem informada",
      value: `${marginCoverage}%`,
      detail: `${carsWithPurchasePrice} com custo de compra`,
      href: "/admin/promotions",
      icon: TrendingUp,
      tone: "bg-amber-50 text-amber-700",
      bar: marginCoverage,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-xl border border-border bg-slate-950 p-6 text-white shadow-sm">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:36px_36px] opacity-55" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-light">Operação da loja</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Painel de controle</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
              Acompanhe estoque, vitrine, FIPE e contatos de clientes que querem vender veículos em uma visão única.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/cars-new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              <Plus className="h-4 w-4" />
              Novo veículo
            </Link>
            <Link
              href="/admin/sell-leads"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/8 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
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
              className="group rounded-xl border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{indicator.label}</p>
                  <p className="mt-3 text-3xl font-black text-foreground sm:text-4xl">{indicator.value}</p>
                  <p className="mt-1 text-sm text-muted">{indicator.detail}</p>
                </div>
                <div className={`rounded-lg border border-border p-3 ${indicator.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-surface">
                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(indicator.bar, 100)}%` }} />
              </div>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="font-semibold text-foreground">Últimos veículos cadastrados</h2>
              <p className="mt-0.5 text-xs text-muted">Entrada recente no estoque administrativo</p>
            </div>
            <Link href="/admin/cars" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-dark">
              Ver estoque
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {recentCars.length === 0 ? (
            <div className="p-8 text-center text-muted">
              <Car className="mx-auto h-12 w-12 text-muted-light" />
              <p className="mt-3 font-medium text-foreground">Nenhum veículo cadastrado.</p>
              <Link href="/admin/cars-new" className="mt-3 inline-flex text-sm font-semibold text-primary">
                Adicionar primeiro veículo
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentCars.map((car) => (
                <div key={car.id} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-surface">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-12 w-16 overflow-hidden rounded-lg border border-border bg-surface">
                      {car.images[0]?.url ? (
                        <Image src={car.images[0].url} alt="" fill sizes="64px" className="object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{car.title}</p>
                      <p className="text-sm text-muted">{car.brand.name} · {car.year}</p>
                    </div>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${car.isSold ? "border-border bg-surface text-muted" : "border-primary/20 bg-primary/10 text-primary"}`}>
                    {car.isSold ? "Vendido" : "Estoque"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="font-semibold text-foreground">Venda de veículos</h2>
              <p className="mt-0.5 text-xs text-muted">Solicitações vindas da página Vender</p>
            </div>
            <Link href="/admin/sell-leads" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-dark">
              Triar
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentSellLeads.length === 0 ? (
              <div className="p-6 text-sm text-muted">
                Nenhuma solicitação recebida pela página Vender.
              </div>
            ) : (
              recentSellLeads.map((lead) => (
                <div key={lead.id} className="px-5 py-4 transition hover:bg-surface">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">{lead.vehicleModel}</p>
                    <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                      {sellLeadIntentLabels[lead.intent]}
                    </span>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                    <Clock3 className="h-3.5 w-3.5" />
                    {lead.name} · {lead.createdAt.toLocaleDateString("pt-BR")}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
        <Link href="/admin/users" className="rounded-xl border border-border bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <p className="mt-3 font-semibold text-foreground">Gestão interna e permissões</p>
          <p className="mt-1 text-sm text-muted">
            {totalUsers} usuário(s) administrativo(s), {newUsers} novo(s) nos últimos 30 dias.
          </p>
        </Link>
        <Link href="/admin/brands" className="rounded-xl border border-border bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md">
          <Tags className="h-5 w-5 text-sky-700" />
          <p className="mt-3 font-semibold text-foreground">Marcas cadastradas</p>
          <p className="mt-1 text-sm text-muted">{totalBrands} fabricantes organizando o catálogo.</p>
        </Link>
        <Link href="/admin/cars?status=featured" className="rounded-xl border border-border bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md">
          <Sparkles className="h-5 w-5 text-amber-700" />
          <p className="mt-3 font-semibold text-foreground">Destaques ativos</p>
          <p className="mt-1 text-sm text-muted">{carsFeatured} oferta(s) priorizada(s) na operação comercial.</p>
        </Link>
      </section>
    </div>
  );
}

function stockRatio(carsInStock: number, totalCars: number): number {
  return totalCars > 0 ? Math.round((carsInStock / totalCars) * 100) : 0;
}
