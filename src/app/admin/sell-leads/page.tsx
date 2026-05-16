export const dynamic = "force-dynamic";

import { SellLeadChannel, SellLeadStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
  Archive,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  PhoneCall,
  UserRound,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ConfirmSubmitButton } from "@/components/admin/AdminFormControls";

const statusLabels: Record<SellLeadStatus, string> = {
  NEW: "Novo lead",
  CONTACTED: "Contato iniciado",
  EVALUATING: "Em avaliação",
  CLOSED: "Finalizado",
  ARCHIVED: "Arquivado",
};

const channelLabels: Record<SellLeadChannel, string> = {
  UNDEFINED: "Não definido",
  WHATSAPP: "WhatsApp",
  PHONE: "Telefone",
  IN_PERSON: "Presencial",
  EMAIL: "E-mail",
};

const activeStatuses: SellLeadStatus[] = ["NEW", "CONTACTED", "EVALUATING"];

export default async function AdminSellLeadsPage() {
  const leads = await prisma.sellLead.findMany({
    orderBy: [{ status: "asc" }, { nextActionAt: "asc" }, { createdAt: "desc" }],
  });
  const openLeads = leads.filter((lead) => activeStatuses.includes(lead.status)).length;
  const closedLeads = leads.filter((lead) => lead.status === "CLOSED").length;
  const whatsappLeads = leads.filter((lead) => lead.contactChannel === "WHATSAPP").length;
  const phoneLeads = leads.filter((lead) => lead.contactChannel === "PHONE").length;
  const inPersonLeads = leads.filter((lead) => lead.contactChannel === "IN_PERSON").length;
  const scheduledLeads = leads.filter((lead) => lead.nextActionAt && activeStatuses.includes(lead.status)).length;

  async function updateLeadFlow(formData: FormData) {
    "use server";

    const id = String(formData.get("id") || "");
    const status = String(formData.get("status") || "") as SellLeadStatus;
    const contactChannel = String(formData.get("contactChannel") || "UNDEFINED") as SellLeadChannel;
    const nextActionAtRaw = String(formData.get("nextActionAt") || "");
    const adminNote = String(formData.get("adminNote") || "").trim();

    if (!id || !Object.values(SellLeadStatus).includes(status)) return;
    if (!Object.values(SellLeadChannel).includes(contactChannel)) return;

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
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">Fluxo comercial</p>
            <h1 className="mt-2 text-2xl font-black text-slate-950">Vendas recebidas</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Controle a entrada de veículos oferecidos por clientes e registre o canal real de atendimento:
              WhatsApp, telefone ou presencial.
            </p>
          </div>
          <div className="grid min-w-full gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 sm:min-w-80 sm:grid-cols-3">
            <ChannelMini label="WhatsApp" value={whatsappLeads} />
            <ChannelMini label="Telefone" value={phoneLeads} />
            <ChannelMini label="Presencial" value={inPersonLeads} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard icon={UserRound} label="Entrada" value={leads.length} />
        <MetricCard icon={Clock3} label="Em atendimento" value={openLeads} />
        <MetricCard icon={CalendarClock} label="Próximas ações" value={scheduledLeads} />
        <MetricCard icon={CheckCircle2} label="Finalizados" value={closedLeads} />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-950">Como medir entrada e saída</h2>
        <div className="mt-3 grid gap-3 text-sm leading-6 text-slate-600 lg:grid-cols-4">
          <p><strong>Entrada:</strong> registre todo contato recebido, mesmo quando veio por WhatsApp ou ligação.</p>
          <p><strong>Canal:</strong> escolha o canal que realmente conduziu o atendimento.</p>
          <p><strong>Acompanhamento:</strong> agende a próxima ação e registre a nota da negociação.</p>
          <p><strong>Saída:</strong> marque como finalizado quando virou compra/troca ou arquive quando não houver negócio.</p>
        </div>
      </section>

      {leads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-lg font-semibold text-slate-950">Nenhuma solicitação recebida.</p>
          <p className="mt-2 text-sm text-slate-500">
            Quando houver contato por formulário, WhatsApp, telefone ou atendimento presencial, registre o lead para alimentar as métricas.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {leads.map((lead) => (
            <article key={lead.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-950">{lead.vehicleModel}</h2>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {statusLabels[lead.status]}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {channelLabels[lead.contactChannel]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {lead.year ?? "Ano não informado"} ·{" "}
                    {lead.mileage ? `${lead.mileage.toLocaleString("pt-BR")} km` : "KM não informado"} · recebido em{" "}
                    {lead.createdAt.toLocaleDateString("pt-BR")}
                  </p>
                  {lead.nextActionAt ? (
                    <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-amber-700">
                      <CalendarClock className="h-4 w-4" />
                      Próxima ação: {formatDateTime(lead.nextActionAt)}
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
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <PhoneCall className="h-4 w-4" />
                        Ligar
                      </a>
                    </>
                  ) : null}
                </div>
              </div>

              <form action={updateLeadFlow} className="mt-5 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-4">
                <input type="hidden" name="id" value={lead.id} />
                <FieldSelect label="Status" name="status" defaultValue={lead.status} options={statusLabels} />
                <FieldSelect label="Canal" name="contactChannel" defaultValue={lead.contactChannel} options={channelLabels} />
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Próxima ação</label>
                  <input
                    name="nextActionAt"
                    type="datetime-local"
                    defaultValue={lead.nextActionAt ? toDateTimeLocalValue(lead.nextActionAt) : ""}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div className="flex items-end">
                  <button className="w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800">
                    Salvar fluxo
                  </button>
                </div>
                <div className="lg:col-span-4">
                  <label className="mb-1 block text-sm font-medium text-slate-700">Nota interna do atendimento</label>
                  <textarea
                    name="adminNote"
                    rows={2}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Ex: Cliente prefere WhatsApp. Agendar avaliação presencial amanhã às 10h."
                  />
                </div>
              </form>

              <details className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                <summary className="cursor-pointer text-sm font-semibold text-slate-900">
                  Ver dados do contato
                </summary>
                <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
                  <p className="inline-flex items-center gap-2"><UserRound className="h-4 w-4 text-emerald-700" /><strong>Nome:</strong> {lead.name}</p>
                  <p className="inline-flex items-center gap-2"><Mail className="h-4 w-4 text-emerald-700" /><strong>E-mail:</strong> {lead.email}</p>
                  <p className="inline-flex items-center gap-2"><Phone className="h-4 w-4 text-emerald-700" /><strong>Telefone:</strong> {lead.phone || "Não informado"}</p>
                  <p className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-emerald-700" /><strong>Canal:</strong> {channelLabels[lead.contactChannel]}</p>
                  <p><strong>Encerramento:</strong> {lead.closedAt ? formatDateTime(lead.closedAt) : "Em aberto"}</p>
                  <p className="md:col-span-2"><strong>Observações do cliente:</strong> {lead.notes || "Sem observações"}</p>
                  <p className="md:col-span-2 whitespace-pre-line"><strong>Histórico interno:</strong> {lead.adminNotes || "Sem notas internas"}</p>
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
          ))}
        </div>
      )}

    </div>
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

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <Icon className="h-5 w-5 text-emerald-700" />
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
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
