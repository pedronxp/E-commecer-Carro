import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Termos de Uso - Lima Automóveis",
  description: "Termos e condições de uso do site Lima Automóveis.",
}

export default function TermosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Termos de Uso</h1>
      <p className="mt-2 text-sm text-muted">Última atualização: Maio de 2026</p>

      <div className="mt-8 space-y-6 text-sm text-muted leading-relaxed">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">1. Aceitação dos Termos</h2>
          <p>
            Ao acessar e utilizar o site da Lima Automóveis, você concorda com os termos e condições aqui descritos.
            Se você não concorda com algum destes termos, não utilize nossos serviços.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">2. Informações dos Veículos</h2>
          <p>
            As informações sobre veículos anunciados em nosso site são de nossa responsabilidade e podem
            sofrer alterações sem aviso prévio. Imagens são meramente ilustrativas.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">3. Privacidade</h2>
          <p>
            Seus dados pessoais são tratados conforme nossa Política de Privacidade. Ao utilizar nosso site,
            você autoriza o tratamento dos seus dados para finalidades comerciais e de contato.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">4. Propriedade Intelectual</h2>
          <p>
            Todo o conteúdo publicado em nosso site, incluindo textos, imagens e logotipos, é de nossa
            propriedade ou utilizado sob licença, sendo proibida a reprodução sem autorização.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">5. Disposições Gerais</h2>
          <p>
            Estes termos são regidos pela legislação brasileira. Qualquer disputa será resolvida no
            foro da cidade de São Paulo - SP.
          </p>
        </section>
      </div>
    </div>
  )
}
