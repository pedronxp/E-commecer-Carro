import type { Metadata } from "next";
import { CookiePreferencesButton } from "@/components/layout/CookiePreferencesButton";

export const metadata: Metadata = {
  title: "Política de Privacidade - Lima Automóveis",
  description: "Política de privacidade, LGPD e cookies da Lima Automóveis.",
};

export default function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Política de Privacidade</h1>
      <p className="mt-2 text-sm text-muted">Última atualização: Maio de 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">1. Coleta de dados</h2>
          <p>
            Coletamos dados como nome, e-mail, telefone e informações do veículo quando você preenche formulários de contato, financiamento ou venda de veículo.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">2. Uso das informações</h2>
          <p>
            Usamos os dados para responder solicitações, avaliar veículos, simular atendimento comercial, manter segurança da sessão e melhorar a experiência no site.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">3. Compartilhamento</h2>
          <p>
            Não compartilhamos dados pessoais sem base legal ou consentimento, exceto quando necessário para atendimento, obrigação legal ou segurança operacional.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">4. Seus direitos LGPD</h2>
          <p>
            Você pode solicitar acesso, correção, exclusão, anonimização ou revogação de consentimento. Para exercer seus direitos, entre em contato pelo e-mail privacidade@limaautomoveis.com.br.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">5. Cookies</h2>
          <p>
            Cookies necessários mantêm sessão, segurança e funcionamento básico. Cookies opcionais podem ser usados para métricas e melhoria de navegação, quando aceitos no aviso exibido no site.
          </p>
          <p className="mt-3">
            <CookiePreferencesButton />
          </p>
        </section>
      </div>
    </div>
  );
}
