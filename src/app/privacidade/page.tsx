import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Privacidade - Lima Automóveis",
  description: "Política de privacidade e tratamento de dados da Lima Automóveis.",
}

export default function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Política de Privacidade</h1>
      <p className="mt-2 text-sm text-muted">Última atualização: Maio de 2026</p>

      <div className="mt-8 space-y-6 text-sm text-muted leading-relaxed">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">1. Coleta de Dados</h2>
          <p>
            Coletamos informações pessoais como nome, e-mail, telefone e CPF quando você preenche formulários
            em nosso site, realiza simulações de financiamento ou entra em contato conosco.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">2. Uso das Informações</h2>
          <p>
            Utilizamos seus dados para processar solicitações, oferecer cotações personalizadas,
            enviar comunicações sobre veículos e serviços, e melhorar sua experiência em nosso site.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">3. Compartilhamento</h2>
          <p>
            Não compartilhamos seus dados pessoais com terceiros sem seu consentimento, exceto quando
            necessário para processar transações (instituições financeiras) ou por obrigação legal.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">4. Seus Direitos (LGPD)</h2>
          <p>
            Você tem direito a acessar, corrigir, excluir seus dados pessoais ou revogar o consentimento
            a qualquer momento. Para exercer seus direitos, entre em contato pelo e-mail privacidade@autoprime.com.br.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">5. Cookies</h2>
          <p>
            Utilizamos cookies para melhorar a navegação e analisar o uso do site. Você pode configurar
            seu navegador para recusar cookies, mas isso pode afetar algumas funcionalidades.
          </p>
        </section>
      </div>
    </div>
  )
}
