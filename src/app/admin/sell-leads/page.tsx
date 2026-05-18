export const dynamic = "force-dynamic";

import { ConfirmSubmitButton } from "@/components/admin/AdminFormControls";
import { requireInternalAccess } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { sellLeadIntentLabels } from "@/lib/schemas";
import { Prisma, SellLeadChannel, SellLeadStatus } from "@prisma/client";
import {
  Archive,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Filter,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  PhoneCall,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { revalidatePath } from "next/cache";

type SearchParams = {
  status?: string;
  channel?: string;
  period?: string;
  source?: string;
};

const statusLabels: Record<SellLeadStatus, string> = {
  NEW: "Entrada",
  CONTACTED: "Contato iniciado",
  EVALUATING: "Em avaliacao",
  CLOSED: "Finalizado",
  ARCHIVED: "Arquivado",
};

const channelLabels: Record<SellLeadChannel, string> = {
  UNDEFINED: "Nao definido",
  WHATSAPP: "WhatsApp",
  PHONE: "Telefone",
  IN_PERSON: "Presencial",
  EMAIL: "E-mail",
};

const periodOptions = [
  ["7d", "7 dias"],
  ["30d", "30 dias"],
  ["mtd", "Mes atual"],
  ["all", "Tudo"],
] as const;

const sourceOptions = [
  ["all", "Todas"],
  ["/vender", "Venda/consignacao"],
  ["/carros", "Catalogo"],
  ["/financiamento", "Financiamento"],
  ["/contato", "Contato"],
] as const;

const activeStatuses: SellLeadStatus[] = ["NEW", "CONTACTED", "EVALUATING"];

export default async function AdminSellLeadsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const period = getPeriod(params.period);
  const fromDate = getPeriodStart(period);
  const status = parseEnumValue(SellLeadStatus, params.status);
  const channel = parseEnumValue(SellLeadChannel, params.channel);
  const source = params.source && params.source !== "all" ? params.source : undefined;
  const now = new Date();

  const where: Prisma.SellLeadWhereInput = {
    ...(fromDate ? { createdAt: { gte: fromDate } } : {}),
    ...(status ? { status } : {}),
    ...(channel ? { contactChannel: channel } : {}),
    ...(source ? { sourcePath: { startsWith: source } } : {}),
  };

  const leads = await prisma.sellLead.findMany({
    where,
    orderBy: [{ status: "asc" }, { nextActionAt: "asc" }, { createdAt: "desc" }],
  });

  const intakeLeads = leads.filter((lead) => lead.status === "NEW").length;
  const contactedLeads = leads.filter((lead) => lead.status === "CONTACTED").length;
  const evaluatingLeads = leads.filter((lead) => lead.status === "EVALUATING").length;
  const closedLeads = leads.filter((lead) => lead.status === "CLOSED").length;
  const archivedLeads = leads.filter((lead) => lead.status === "ARCHIVED").length;
  const activeLeads = leads.filter((lead) => activeStatuses.includes(lead.status));
  const followUpDue = activeLeads.filter((lead) => lead.nextActionAt && lead.nextActionAt <= now).length;
  const scheduledLeads = activeLeads.filter((lead) => lead.nextActionAt && lead.nextActionAt > now).length;
  const activeWithoutNextAction = activeLeads.filter((lead) => !lead.nextActionAt).length;
  const undefinedChannelLeads = leads.filter((lead) => lead.contactChannel === "UNDEFINED").length;
  const missingPhoneLeads = leads.filter((lead) => !lead.phone).length;
  const whatsappLeads = leads.filter((lead) => lead.contactChannel === "WHATSAPP").length;
  const phoneLeads = leads.filter((lead) => lead.contactChannel === "PHONE").length;
  const inPersonLeads = leads.filter((lead) => lead.contactChannel === "IN_PERSON").length;

  async function updateLeadFlow(formData: FormData) {
    "use server";

    const auth = await requireInternalAccess();
    if ("error" in auth) return;

    const id = String(formData.get("id") || "");
    const status = parseEnumValue(SellLeadStatus, String(formData.get("status") || ""));
    const contactChannel = parseEnumValue(SellLeadChannel, String(formData.get("contactChannel") || "UNDEFINED"));
    const nextActionAtRaw = String(formData.get("nextActionAt") || "");
    const adminNote = String(formData.get("adminNote") || "").trim();

    if (!id || !status || !contactChannel) return;

    const current = await prisma.sellLead.findUnique({
      where: { id },
      select: { adminNotes: true },
    });
    if (!current) return;

    const nextActionAt = nextActionAtRaw ? new Date(nextActionAtRaw) : null;
    const adminNotes = adminNote ? appendAdminNote(current.adminNotes, adminNote) : current.adminNotes;
    const closedAt = status === "CLOSED" || status === "ARCHIVED" ? new Date() : null;

    await prisma.sellLead.update({
      where: { id },
      data: {
        status,
        contactChannel,
        nextActionAt: nextActionAt && !Number.isNaN(nextActionAt.getTime()) ? nextActionAt : null,
        adminNotes,
        closedAt,
      },
    });

    revalidatePath("/admin/sell-leads");
    revalidatePath("/admin");
  }

  async function anonymizeLead(formData: FormData) {
    "use server";

    const auth = await requireInternalAccess();
    if ("error" in auth) return;

    const id = String(formData.get("id") || "");
    if (!id) return;

    await prisma.sellLead.update({
      where: { id },
      data: {
        name: "Dados removidos",
        email: `anon-${id}@lgpd.local`,
        phone: null,
        notes: "Dados pessoais removidos por rotina administrativa.",
        adminNotes: appendAdminNote(null, "Lead arquivado e dados pessoais removidos por rotina administrativa."),
        status: "ARCHIVED",
        closedAt: new Date(),
      },
    });

    revalidatePath("/admin/sell-leads");
    revalidatePath("/admin");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary-dark">Funil comercial</p>
            <h1 className="mt-2 text-2xl font-black text-slate-950">Vendas recebidas</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Organize cada oportunidade recebida pelo site, registre o atendimento, defina o próximo retorno e preserve histórico interno antes do fechamento.
            </p>
          </div>
          <div className="grid min-w-full gap-2 rounded-lg border border-border bg-surface p-3 text-sm text-slate-700 sm:min-w-80 sm:grid-cols-3">
            <ChannelMini label="WhatsApp" value={whatsappLeads} />
            <ChannelMini label="Telefone" value={phoneLeads} />
            <ChannelMini label="Presencial" value={inPersonLeads} />
          </div>
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-4">
        <InfoCard
          title="Como os dados são tratados"
          text="A página filtra leads por período, origem, canal e status. O funil separa entrada, contato iniciado, avaliação, finalizado e arquivado."
          value={`${leads.length} no filtro`}
        />
        <InfoCard
          title="Entrada automática"
          text="O painel recebe dados salvos pelos formulários e APIs públicas do site. Ele não importa contatos externos sozinho."
          value="Site/API"
        />
        <InfoCard
          title="Tratamento manual"
          text="Operador ajusta status, canal, data de próxima ação e nota interna. Essas alterações alimentam o dashboard."
          value={`${scheduledLeads} agendado(s)`}
        />
        <InfoCard
          title="Pontos para resolver"
          text={`${activeWithoutNextAction} ativo(s) sem próxima ação, ${undefinedChannelLeads} sem canal definido e ${missingPhoneLeads} sem telefone.`}
          value={followUpDue > 0 ? `${followUpDue} vencido(s)` : "Sem vencidos"}
        />
      </section>

      <form className="rounded-lg border border-border bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
          <Filter className="h-4 w-4 text-primary" />
          Filtros de operacao
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          <SelectFilter label="Periodo" name="period" defaultValue={period} options={periodOptions} />
          <SelectFilter
            label="Status"
            name="status"
            defaultValue={status ?? "all"}
            options={[["all", "Todos"], ...Object.values(SellLeadStatus).map((value) => [value, statusLabels[value]] as const)]}
          />
          <SelectFilter
            label="Canal"
            name="channel"
            defaultValue={channel ?? "all"}
            options={[["all", "Todos"], ...Object.values(SellLeadChannel).map((value) => [value, channelLabels[value]] as const)]}
          />
          <SelectFilter label="Origem" name="source" defaultValue={source ?? "all"} options={sourceOptions} />
          <div className="flex items-end">
            <button className="w-full rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Aplicar
            </button>
          </div>
        </div>
      </form>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <MetricCard icon={UserRound} label="Entrada" value={intakeLeads} tone="primary" />
        <MetricCard icon={PhoneCall} label="Contato" value={contactedLeads} tone="sky" />
        <MetricCard icon={Clock3} label="Avaliacao" value={evaluatingLeads} tone="amber" />
        <MetricCard icon={CalendarClock} label="Retorno vencido" value={followUpDue} tone={followUpDue > 0 ? "red" : "slate"} />
        <MetricCard icon={CheckCircle2} label="Finalizados" value={closedLeads} tone="emerald" />
        <MetricCard icon={Archive} label="Arquivados" value={archivedLeads} tone="slate" />
      </section>

      <section className="rounded-lg border border-border bg-white p-4 shadow-sm">
        <div className="grid gap-3 text-sm leading-6 text-slate-600 lg:grid-cols-4">
          <p><strong>Entrada:</strong> lead novo ainda sem atendimento registrado.</p>
          <p><strong>Contato:</strong> cliente ja recebeu retorno por WhatsApp, telefone, e-mail ou presencial.</p>
          <p><strong>Avaliacao:</strong> proposta, troca, compra ou consignacao em analise.</p>
          <p><strong>Follow-up:</strong> {scheduledLeads} retorno(s) agendado(s) e {followUpDue} vencido(s) no filtro atual.</p>
        </div>
      </section>

      {leads.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-lg font-semibold text-slate-950">Nenhum lead encontrado no filtro atual.</p>
          <p className="mt-2 text-sm text-slate-500">Ajuste periodo, origem, canal ou status para revisar outras entradas comerciais.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {leads.map((lead) => {
            const overdue = Boolean(lead.nextActionAt && activeStatuses.includes(lead.status) && lead.nextActionAt <= now);
            return (
              <article key={lead.id} className={`rounded-lg border bg-white p-5 shadow-sm ${overdue ? "border-red-200" : "border-border"}`}>
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-950">{lead.vehicleModel}</h2>
                      <StatusBadge status={lead.status} />
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        {channelLabels[lead.contactChannel]}
                      </span>
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                        {sellLeadIntentLabels[lead.intent]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {lead.year ?? "Ano nao informado"} -{" "}
                      {lead.mileage ? `${lead.mileage.toLocaleString("pt-BR")} km` : "KM nao informado"} - recebido em{" "}
                      {lead.createdAt.toLocaleDateString("pt-BR")} - {lead.sourcePath ?? "origem nao informada"}
                    </p>
                    {lead.nextActionAt ? (
                      <p className={`mt-2 inline-flex items-center gap-2 text-sm font-semibold ${overdue ? "text-red-700" : "text-amber-700"}`}>
                        <CalendarClock className="h-4 w-4" />
                        Proxima acao: {formatDateTime(lead.nextActionAt)}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {lead.phone ? (
                      <>
                        <a
                          href={`https://wa.me/${digitsOnly(lead.phone)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
                        >
                          <MessageCircle className="h-4 w-4" />
                          WhatsApp
                        </a>
                        <a
                          href={`tel:${digitsOnly(lead.phone)}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          <PhoneCall className="h-4 w-4" />
                          Ligar
                        </a>
                      </>
                    ) : null}
                  </div>
                </div>

                <form action={updateLeadFlow} className="mt-5 grid gap-3 rounded-lg border border-border bg-surface p-4 lg:grid-cols-4">
                  <input type="hidden" name="id" value={lead.id} />
                  <FieldSelect label="Status" name="status" defaultValue={lead.status} options={statusLabels} />
                  <FieldSelect label="Canal" name="contactChannel" defaultValue={lead.contactChannel} options={channelLabels} />
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Proxima acao</label>
                    <input
                      name="nextActionAt"
                      type="datetime-local"
                      defaultValue={lead.nextActionAt ? toDateTimeLocalValue(lead.nextActionAt) : ""}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="flex items-end">
                    <button className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark">
                      Salvar tratamento
                    </button>
                  </div>
                  <div className="lg:col-span-4">
                    <label className="mb-1 block text-sm font-medium text-slate-700">Nota interna do atendimento</label>
                    <textarea
                      name="adminNote"
                      rows={2}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Ex: Cliente prefere WhatsApp. Retornar amanha as 10h com proposta de avaliacao."
                    />
                  </div>
                </form>

                <details className="mt-4 rounded-lg border border-border bg-white p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-900">Ver dados do contato</summary>
                  <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
                    <p className="inline-flex items-center gap-2"><UserRound className="h-4 w-4 text-primary" /><strong>Nome:</strong> {lead.name}</p>
                    <p className="inline-flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /><strong>E-mail:</strong> {lead.email}</p>
                    <p className="inline-flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /><strong>Telefone:</strong> {lead.phone || "Nao informado"}</p>
                    <p className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /><strong>Canal:</strong> {channelLabels[lead.contactChannel]}</p>
                    <p><strong>Encerramento:</strong> {lead.closedAt ? formatDateTime(lead.closedAt) : "Em aberto"}</p>
                    <p className="md:col-span-2"><strong>Observacoes do cliente:</strong> {lead.notes || "Sem observacoes"}</p>
                    <p className="whitespace-pre-line md:col-span-2"><strong>Historico interno:</strong> {lead.adminNotes || "Sem notas internas"}</p>
                  </div>
                </details>

                <form action={anonymizeLead} className="mt-4">
                  <input type="hidden" name="id" value={lead.id} />
                  <ConfirmSubmitButton
                    type="submit"
                    message="Arquivar e remover dados pessoais deste lead?"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-red-700 transition hover:text-red-800"
                  >
                    <Archive className="h-4 w-4" />
                    Arquivar e remover dados pessoais
                  </ConfirmSubmitButton>
                </form>
              </article>
            );
          })}
        </div>
      )}
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
    <label className="text-sm font-medium text-slate-700">
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

function ChannelMini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-white px-3 py-2">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}

function InfoCard({ title, text, value }: { title: string; text: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-dark">{title}</p>
      <p className="mt-2 text-xl font-black text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  tone: "primary" | "sky" | "amber" | "red" | "emerald" | "slate";
}) {
  const toneClass = {
    primary: "text-primary",
    sky: "text-sky-700",
    amber: "text-amber-700",
    red: "text-red-700",
    emerald: "text-emerald-700",
    slate: "text-slate-600",
  }[tone];

  return (
    <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <Icon className={`h-5 w-5 ${toneClass}`} />
      <p className="mt-3 text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function FieldSelect<T extends string>({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: T;
  options: Record<T, string>;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        {Object.entries(options).map(([value, labelText]) => (
          <option key={value} value={value}>
            {String(labelText)}
          </option>
        ))}
      </select>
    </div>
  );
}

function StatusBadge({ status }: { status: SellLeadStatus }) {
  const className =
    status === "NEW"
      ? "bg-primary-light text-primary-dark"
      : status === "CONTACTED"
        ? "bg-sky-50 text-sky-700"
        : status === "EVALUATING"
          ? "bg-amber-50 text-amber-700"
          : status === "CLOSED"
            ? "bg-emerald-50 text-emerald-700"
            : "bg-slate-100 text-slate-600";

  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>{statusLabels[status]}</span>;
}

function appendAdminNote(current: string | null, note: string): string {
  const timestamp = new Date().toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
  const line = `[${timestamp}] ${note}`;
  return current ? `${current}\n${line}` : line;
}

function formatDateTime(value: Date): string {
  return value.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function toDateTimeLocalValue(value: Date): string {
  const offset = value.getTimezoneOffset();
  const local = new Date(value.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function parseEnumValue<T extends Record<string, string>>(source: T, value?: string): T[keyof T] | undefined {
  const values = Object.values(source) as Array<T[keyof T]>;
  return values.includes(value as T[keyof T]) ? value as T[keyof T] : undefined;
}

function getPeriod(value?: string): string {
  return periodOptions.some(([option]) => option === value) ? value as string : "30d";
}

function getPeriodStart(period: string): Date | null {
  const now = new Date();
  if (period === "all") return null;
  if (period === "mtd") return new Date(now.getFullYear(), now.getMonth(), 1);

  const days = period === "7d" ? 7 : 30;
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  return start;
}
