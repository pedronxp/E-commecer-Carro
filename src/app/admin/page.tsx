export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BadgePercent,
  CalendarClock,
  Car,
  Eye,
  MessageCircle,
  MessageSquareText,
  Plus,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { CommercialEventType, SellLeadChannel, SellLeadStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { commercialEventTypeLabels, sellLeadIntentLabels } from "@/lib/schemas";

type SearchParams = {
  period?: string;
  source?: string;
  channel?: string;
  eventType?: string;
  leadStatus?: string;
};

const periodOptions = [
  ["7d", "7 dias"],
  ["30d", "30 dias"],
  ["mtd", "Mes atual"],
  ["today", "Hoje"],
  ["all", "Tudo"],
] as const;

const sourceOptions = [
  ["all", "Todas"],
  ["/carros", "Catalogo"],
  ["/financiamento", "Financiamento"],
  ["/vender", "Venda/consignacao"],
  ["/contato", "Contato"],
] as const;

const activeStatuses: SellLeadStatus[] = ["NEW", "CONTACTED", "EVALUATING"];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const period = getPeriod(params.period);
  const fromDate = getPeriodStart(period);
  const channel = parseEnumValue(SellLeadChannel, params.channel);
  const eventType = parseEnumValue(CommercialEventType, params.eventType);
  const leadStatus = parseEnumValue(SellLeadStatus, params.leadStatus);
  const source = params.source && params.source !== "all" ? params.source : undefined;

  const dateWhere = fromDate ? { gte: fromDate } : undefined;
  const eventWhere = {
    ...(dateWhere ? { createdAt: dateWhere } : {}),
    ...(source ? { sourcePath: { startsWith: source } } : {}),
    ...(channel ? { channel } : {}),
    ...(eventType ? { type: eventType } : {}),
  };
  const baseLeadWhere = {
    ...(dateWhere ? { createdAt: dateWhere } : {}),
    ...(source ? { sourcePath: { startsWith: source } } : {}),
    ...(channel ? { contactChannel: channel } : {}),
  };
  const leadWhere = {
    ...baseLeadWhere,
    ...(leadStatus ? { status: leadStatus } : {}),
  };
  const pendingLeadWhere = {
    ...leadWhere,
    ...(leadStatus ? {} : { status: { in: activeStatuses } }),
    nextActionAt: { not: null },
  };

  const [
    totalCars,
    carsInStock,
    carsFeatured,
    carsWithFipe,
    carsWithPurchasePrice,
    totalBrands,
    totalOperators,
    filteredSellLeads,
    openSellLeads,
    newSellLeads,
    closedSellLeads,
    recentCars,
    recentSellLeads,
    pendingLeads,
    eventCounts,
    vehicleEventGroups,
  ] = await Promise.all([
    prisma.car.count(),
    prisma.car.count({ where: { isSold: false } }),
    prisma.car.count({ where: { isFeatured: true } }),
    prisma.car.count({ where: { fipePrice: { not: null } } }),
    prisma.car.count({ where: { purchasePrice: { not: null } } }),
    prisma.brand.count(),
    prisma.user.count(),
    prisma.sellLead.count({ where: leadWhere }),
    prisma.sellLead.count({ where: { ...baseLeadWhere, status: { in: activeStatuses } } }),
    prisma.sellLead.count({ where: { ...baseLeadWhere, status: "NEW" } }),
    prisma.sellLead.count({ where: { ...baseLeadWhere, status: "CLOSED" } }),
    prisma.car.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
      include: { brand: true, images: { where: { isPrimary: true }, take: 1 } },
    }),
    prisma.sellLead.findMany({
      take: 5,
      where: leadWhere,
      orderBy: { createdAt: "desc" },
    }),
    prisma.sellLead.findMany({
      take: 5,
      where: pendingLeadWhere,
      orderBy: { nextActionAt: "asc" },
    }),
    prisma.commercialEvent.groupBy({
      by: ["type"],
      where: eventWhere,
      _count: { _all: true },
    }),
    prisma.commercialEvent.groupBy({
      by: ["vehicleSlug", "vehicleTitle", "type"],
      where: eventWhere,
      _count: { _all: true },
    }),
  ]);

  const vehicleViews = getEventCount(eventCounts, "VEHICLE_VIEW");
  const whatsappClicks = getEventCount(eventCounts, "WHATSAPP_CLICK");
  const financingInterest = getEventCount(eventCounts, "FINANCING_INTEREST");
  const sellLeadSubmitted = getEventCount(eventCounts, "SELL_LEAD_SUBMITTED");
  const purchaseIntent = getEventCount(eventCounts, "PURCHASE_INTENT");
  const viewToWhatsapp = vehicleViews > 0 ? Math.round((whatsappClicks / vehicleViews) * 100) : 0;
  const fipeCoverage = totalCars > 0 ? Math.round((carsWithFipe / totalCars) * 100) : 0;
  const marginCoverage = totalCars > 0 ? Math.round((carsWithPurchasePrice / totalCars) * 100) : 0;
  const vehicleSignals = buildVehicleSignals(vehicleEventGroups);
  const leadMetricLabel = leadStatus ? `Leads ${leadStatusLabel(leadStatus).toLowerCase()}` : "Leads abertos";
  const leadMetricValue = leadStatus ? filteredSellLeads : openSellLeads;
  const leadMetricDetail = leadStatus ? "Status selecionado no filtro" : `${newSellLeads} novo(s) no periodo`;

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Operacao comercial</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">Dashboard</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              Acompanhe leads, WhatsApp, visualizacoes, FIPE e oportunidades de estoque com filtros operacionais.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/cars-new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              <Plus className="h-4 w-4" />
              Novo veiculo
            </Link>
            <Link
              href="/admin/sell-leads"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface"
            >
              <MessageSquareText className="h-4 w-4" />
              Triar leads
            </Link>
          </div>
        </div>
      </section>

      <form className="rounded-xl border border-border bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-6">
          <SelectFilter label="Periodo" name="period" defaultValue={period} options={periodOptions} />
          <SelectFilter label="Origem" name="source" defaultValue={source ?? "all"} options={sourceOptions} />
          <SelectFilter
            label="Canal"
            name="channel"
            defaultValue={channel ?? "all"}
            options={[["all", "Todos"], ...Object.values(SellLeadChannel).map((value) => [value, channelLabel(value)] as const)]}
          />
          <SelectFilter
            label="Evento"
            name="eventType"
            defaultValue={eventType ?? "all"}
            options={[["all", "Todos"], ...Object.values(CommercialEventType).map((value) => [value, commercialEventTypeLabels[value]] as const)]}
          />
          <SelectFilter
            label="Status do lead"
            name="leadStatus"
            defaultValue={leadStatus ?? "all"}
            options={[["all", "Todos"], ...Object.values(SellLeadStatus).map((value) => [value, leadStatusLabel(value)] as const)]}
          />
          <div className="flex items-end">
            <button className="w-full rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Aplicar filtros
            </button>
          </div>
        </div>
      </form>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={MessageSquareText} label={leadMetricLabel} value={leadMetricValue} detail={leadMetricDetail} />
        <MetricCard icon={MessageCircle} label="Cliques WhatsApp" value={whatsappClicks} detail={`${viewToWhatsapp}% de views viraram WhatsApp`} />
        <MetricCard icon={Eye} label="Visualizacoes" value={vehicleViews} detail={`${purchaseIntent} intencao(oes) de compra`} />
        <MetricCard icon={BadgePercent} label="Cobertura FIPE" value={`${fipeCoverage}%`} detail={`${marginCoverage}% com custo informado`} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Funil do periodo" actionHref="/admin/sell-leads" actionLabel="Ver leads">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <MiniMetric label="Visualizacoes" value={vehicleViews} />
            <MiniMetric label="WhatsApp" value={whatsappClicks} />
            <MiniMetric label="Financiamento" value={financingInterest} />
            <MiniMetric label="Venda/consignacao" value={sellLeadSubmitted} />
            <MiniMetric label={leadStatus ? "Leads no status" : "Leads abertos"} value={leadMetricValue} />
            <MiniMetric label="Leads finalizados" value={closedSellLeads} />
            <MiniMetric label="Estoque ativo" value={carsInStock} />
          </div>
        </Panel>

        <Panel title="Veiculos para revisar" actionHref="/admin/promotions" actionLabel="Comparar FIPE">
          {vehicleSignals.length === 0 ? (
            <p className="text-sm text-muted">Ainda nao ha eventos suficientes para apontar oportunidades.</p>
          ) : (
            <div className="space-y-3">
              {vehicleSignals.slice(0, 5).map((item) => (
                <div key={item.key} className="rounded-lg border border-border bg-surface px-3 py-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      {item.views} view(s)
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">{item.whatsappClicks} clique(s) no WhatsApp. Revise preco, fotos ou copy se a procura continuar baixa.</p>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Panel title="Leads recentes" actionHref="/admin/sell-leads" actionLabel="Triar">
          {recentSellLeads.length === 0 ? (
            <p className="text-sm text-muted">Nenhum lead no filtro atual.</p>
          ) : (
            <div className="divide-y divide-border">
              {recentSellLeads.map((lead) => (
                <div key={lead.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">{lead.vehicleModel}</p>
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                      {sellLeadIntentLabels[lead.intent]}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                      {lead.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted">{lead.name} - {lead.createdAt.toLocaleDateString("pt-BR")} - {lead.sourcePath ?? "origem nao informada"}</p>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Proximas acoes" actionHref="/admin/sell-leads" actionLabel="Abrir fila">
          {pendingLeads.length === 0 ? (
            <p className="text-sm text-muted">Nenhum follow-up agendado no filtro atual.</p>
          ) : (
            <div className="space-y-3">
              {pendingLeads.map((lead) => {
                const overdue = lead.nextActionAt ? lead.nextActionAt < new Date() : false;
                return (
                  <div key={lead.id} className="flex items-start gap-3 rounded-lg border border-border bg-white p-3">
                    <CalendarClock className={`mt-0.5 h-4 w-4 ${overdue ? "text-red-700" : "text-primary"}`} />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{lead.vehicleModel}</p>
                      <p className="text-xs text-muted">{lead.nextActionAt ? lead.nextActionAt.toLocaleString("pt-BR") : "Sem data"} - {lead.name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Link href="/admin/users" className="rounded-xl border border-border bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <p className="mt-3 font-semibold text-foreground">Operadores internos</p>
          <p className="mt-1 text-sm text-muted">{totalOperators} acesso(s) ao painel administrativo.</p>
        </Link>
        <Link href="/admin/brands" className="rounded-xl border border-border bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md">
          <Car className="h-5 w-5 text-sky-700" />
          <p className="mt-3 font-semibold text-foreground">Base de marcas</p>
          <p className="mt-1 text-sm text-muted">{totalBrands} marca(s) organizando o catalogo.</p>
        </Link>
        <Link href="/admin/cars?status=featured" className="rounded-xl border border-border bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md">
          <Sparkles className="h-5 w-5 text-amber-700" />
          <p className="mt-3 font-semibold text-foreground">Destaques ativos</p>
          <p className="mt-1 text-sm text-muted">{carsFeatured} oferta(s) priorizada(s) na vitrine.</p>
        </Link>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="font-semibold text-foreground">Ultimos veiculos cadastrados</h2>
            <p className="mt-0.5 text-xs text-muted">Entrada recente no estoque administrativo</p>
          </div>
          <Link href="/admin/cars" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-dark">
            Ver estoque
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
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
                  <p className="text-sm text-muted">{car.brand.name} - {car.year}</p>
                </div>
              </div>
              {car.fipePrice && car.purchasePrice ? (
                <TrendingUp className="h-4 w-4 text-primary" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-700" />
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SelectFilter({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: ReadonlyArray<readonly [string, string]>;
}) {
  return (
    <label className="text-sm font-medium text-foreground">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-3 text-sm text-muted">{label}</p>
      <p className="mt-1 text-3xl font-black text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted">{detail}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-xl font-black text-foreground">{value}</p>
    </div>
  );
}

function Panel({
  title,
  actionHref,
  actionLabel,
  children,
}: {
  title: string;
  actionHref: string;
  actionLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-semibold text-foreground">{title}</h2>
        <Link href={actionHref} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-dark">
          {actionLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {children}
    </section>
  );
}

function getPeriod(value?: string): string {
  return periodOptions.some(([option]) => option === value) ? value as string : "30d";
}

function getPeriodStart(period: string): Date | null {
  const now = new Date();
  if (period === "all") return null;
  if (period === "today") return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === "mtd") return new Date(now.getFullYear(), now.getMonth(), 1);

  const days = period === "7d" ? 7 : 30;
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  return start;
}

function parseEnumValue<T extends Record<string, string>>(source: T, value?: string): T[keyof T] | undefined {
  const values = Object.values(source) as Array<T[keyof T]>;
  return values.includes(value as T[keyof T]) ? value as T[keyof T] : undefined;
}

function channelLabel(value: SellLeadChannel): string {
  const labels: Record<SellLeadChannel, string> = {
    UNDEFINED: "Nao definido",
    WHATSAPP: "WhatsApp",
    PHONE: "Telefone",
    IN_PERSON: "Presencial",
    EMAIL: "E-mail",
  };
  return labels[value];
}

function leadStatusLabel(value: SellLeadStatus): string {
  const labels: Record<SellLeadStatus, string> = {
    NEW: "Novo",
    CONTACTED: "Contatado",
    EVALUATING: "Em avaliacao",
    CLOSED: "Finalizado",
    ARCHIVED: "Arquivado",
  };
  return labels[value];
}

function getEventCount(
  rows: Array<{ type: CommercialEventType; _count: { _all: number } }>,
  type: CommercialEventType,
): number {
  return rows.find((row) => row.type === type)?._count._all ?? 0;
}

function buildVehicleSignals(
  eventGroups: Array<{
    type: CommercialEventType;
    vehicleSlug: string | null;
    vehicleTitle: string | null;
    _count: { _all: number };
  }>,
) {
  const map = new Map<string, { key: string; title: string; views: number; whatsappClicks: number }>();

  for (const event of eventGroups) {
    if (!event.vehicleSlug && !event.vehicleTitle) continue;
    const key = event.vehicleSlug ?? event.vehicleTitle ?? "veiculo";
    const current = map.get(key) ?? {
      key,
      title: event.vehicleTitle ?? event.vehicleSlug ?? "Veiculo sem titulo",
      views: 0,
      whatsappClicks: 0,
    };

    if (event.type === "VEHICLE_VIEW") current.views += event._count._all;
    if (event.type === "WHATSAPP_CLICK") current.whatsappClicks += event._count._all;
    map.set(key, current);
  }

  return Array.from(map.values())
    .filter((item) => item.views > 0 && item.whatsappClicks < item.views)
    .sort((a, b) => b.views - a.views);
}
