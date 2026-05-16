import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "LGPD e Cookies - Lima Automóveis",
  description: "Informações públicas sobre tratamento de dados pessoais, LGPD e preferências de cookies.",
};

export default function LgpdPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">Página pública</p>
      <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">LGPD e preferências de privacidade</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Esta página explica, de forma pública, como a Lima Automóveis trata dados pessoais recebidos pelo site,
        especialmente em formulários de contato, venda de veículo, login e atendimento comercial.
      </p>
      <p className="mt-2 text-sm text-muted">Última atualização: maio de 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-foreground">1. Dados tratados</h2>
          <p>
            Podemos tratar nome, e-mail, telefone, dados do veículo, mensagens enviadas pelo titular e registros
            técnicos necessários para segurança, sessão e funcionamento do site.
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-foreground">2. Finalidades</h2>
          <p>
            Os dados são usados para responder solicitações, avaliar veículos oferecidos à loja, organizar atendimento
            por WhatsApp, telefone, e-mail ou presencial, proteger a conta administrativa e cumprir obrigações legais.
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-foreground">3. Cookies</h2>
          <p>
            Cookies necessários são usados para segurança, sessão e preferências básicas. Cookies opcionais de métricas
            e marketing só devem ser ativados quando o visitante permitir no banner de preferências.
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-foreground">4. Retenção e anonimização</h2>
          <p>
            Dados de leads comerciais ficam restritos ao atendimento. Quando a negociação termina ou não há mais
            necessidade comercial, o administrador pode arquivar e anonimizar os dados pessoais no painel.
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-foreground">5. Direitos do titular</h2>
          <p>
            O titular pode solicitar confirmação de tratamento, acesso, correção, anonimização, exclusão, portabilidade
            ou revogação de consentimento pelo canal de privacidade informado pela loja.
          </p>
        </section>
      </div>

      <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900">
        Para política completa, consulte também a{" "}
        <Link href="/privacidade" className="font-semibold underline">
          Política de Privacidade
        </Link>
        .
      </div>
    </div>
  );
}
