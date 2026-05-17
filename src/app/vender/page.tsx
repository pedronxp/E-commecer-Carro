import type { Metadata } from "next"
import Link from "next/link"
import ImagePageHero from "@/components/marketing/ImagePageHero"
import { Button } from "@/components/ui/Button"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { parseSellLeadInput, type SellLeadIntentType } from "@/lib/schemas"

export const metadata: Metadata = {
  title: "Vender Meu Carro - Lima Automóveis",
  description: "Envie os dados do seu carro para conversar sobre venda, troca ou consignação.",
}

const steps = [
  { title: "Conte qual é o carro", text: "Modelo, ano, quilometragem e um resumo do estado geral já ajudam bastante." },
  { title: "Diga o que você pretende", text: "Venda direta, troca por outro veículo ou consignação pela loja." },
  { title: "A loja retorna pelo atendimento", text: "A equipe analisa as informações e continua a conversa pelo melhor canal." },
  { title: "Combinados ficam mais claros", text: "Depois entram detalhes de avaliação, documentos, prazos e próximo passo." },
]

const intentOptions: { value: SellLeadIntentType; label: string }[] = [
  { value: "DIRECT_SALE", label: "Quero vender meu carro" },
  { value: "CONSIGNMENT", label: "Quero deixar para vender pela loja" },
  { value: "EVALUATE_BOTH", label: "Quero comparar as opções com a equipe" },
]

export default async function VenderPage({
  searchParams,
}: {
  searchParams: Promise<{ enviado?: string; erro?: string }>
}) {
  const params = await searchParams

  async function createSellLead(formData: FormData) {
    "use server"

    const parsed = parseSellLeadInput({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      vehicleModel: formData.get("vehicleModel"),
      year: formData.get("year"),
      mileage: formData.get("mileage"),
      intent: formData.get("intent"),
      notes: formData.get("notes"),
      consent: formData.get("consent") === "on" ? true : formData.get("consent"),
    })

    if (!parsed.success) {
      redirect("/vender?erro=1#avaliacao")
    }

    const { name, email, phone, vehicleModel, year, mileage, intent, notes } = parsed.data

    await prisma.sellLead.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        phone: phone || null,
        vehicleModel,
        year: year ?? null,
        mileage: mileage ?? null,
        intent,
        notes: notes || null,
        consent: true,
        consentAt: new Date(),
      },
    })

    redirect("/vender?enviado=1#avaliacao")
  }

  return (
    <>
      <ImagePageHero
        eyebrow="Venda, troca ou consignação"
        title="Quer vender ou trocar seu carro?"
        description="Envie os dados principais do veículo. A Lima Automóveis avalia o cenário e continua a conversa pelo atendimento."
        imageSrc="/images/banners/sell-car-safe.png"
        imageAlt="Vistoria fictícia de veículo usado sem marcas, placas ou modelo real reconhecível"
      >
        <a href="#avaliacao">
          <Button size="lg">Enviar dados do veículo</Button>
        </a>
        <Link href="/contato">
          <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
            Falar no WhatsApp
          </Button>
        </Link>
      </ImagePageHero>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.title} className="rounded-lg border border-border bg-white p-5 shadow-sm">
              <span className="font-mono text-xs font-semibold text-primary">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-4 text-sm font-semibold text-foreground">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.text}</p>
            </div>
          ))}
        </div>

        <div id="avaliacao" className="mt-12 rounded-lg border border-border bg-white p-6 shadow-sm sm:p-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Avaliação inicial</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Passe as informações do seu carro</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Não precisa escrever anúncio completo. Informe o básico para a loja saber como iniciar o atendimento.
            </p>
          </div>

          {params.enviado === "1" ? (
            <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Solicitação enviada. A equipe da Lima Automóveis entrará em contato pelos dados informados.
            </p>
          ) : null}
          {params.erro === "1" ? (
            <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Preencha os campos obrigatórios e autorize o tratamento de dados conforme a LGPD.
            </p>
          ) : null}

          <form action={createSellLead} className="mt-6 grid gap-4 sm:grid-cols-2">
            <fieldset className="sm:col-span-2">
              <legend className="mb-2 text-sm font-medium text-foreground">
                Tipo de negociação <span className="text-red-500">*</span>
              </legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {intentOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface p-4 text-sm text-muted transition hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                  >
                    <input
                      type="radio"
                      name="intent"
                      value={opt.value}
                      required
                      className="mt-0.5 h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <Field label="Nome" name="name" required placeholder="Seu nome" />
            <Field label="WhatsApp ou telefone" name="phone" type="tel" placeholder="(00) 00000-0000" />
            <div className="sm:col-span-2">
              <Field label="Modelo do veículo" name="vehicleModel" required placeholder="Ex: Civic 2.0 automático" />
            </div>
            <Field label="Ano" name="year" type="number" placeholder="2020" />
            <Field label="Quilometragem" name="mileage" type="number" placeholder="50000" />
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">Observações</label>
              <textarea
                name="notes"
                rows={3}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
                placeholder="Estado geral, opcionais, revisões ou alguma informação importante."
              />
            </div>
            <div className="sm:col-span-2">
              <Field label="Seu melhor e-mail" name="email" type="email" required placeholder="seu@email.com" />
            </div>
            <label className="sm:col-span-2 flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface p-4 text-sm text-muted">
              <input name="consent" type="checkbox" required className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              <span>
                Autorizo a Lima Automóveis a tratar meus dados pessoais e dados do veículo para avaliação, contato
                comercial e negociação, conforme a{" "}
                <Link href="/lgpd" className="font-semibold text-emerald-700 hover:text-emerald-800">
                  LGPD
                </Link>
                .
              </span>
            </label>
            <div className="sm:col-span-2">
              <Button className="w-full sm:w-auto">Enviar para avaliação</Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
        placeholder={placeholder}
      />
    </div>
  )
}
