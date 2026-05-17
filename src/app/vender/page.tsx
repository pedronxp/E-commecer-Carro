import type { Metadata } from "next"
import Link from "next/link"
import { ClipboardCheck, DollarSign, FileText, Truck } from "lucide-react"
import ImagePageHero from "@/components/marketing/ImagePageHero"
import { Button } from "@/components/ui/Button"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { parseSellLeadInput, type SellLeadIntentType } from "@/lib/schemas"

export const metadata: Metadata = {
  title: "Vender Meu Carro - Lima Automóveis",
  description: "Venda seu carro para a Lima Automóveis. Avaliação justa e pagamento rápido.",
}

const steps = [
  { icon: FileText, title: "Cadastre seu veículo", text: "Preencha os dados do seu carro no formulário abaixo." },
  { icon: ClipboardCheck, title: "Avaliação gratuita", text: "Nossa equipe avalia e retorna com a melhor proposta." },
  { icon: DollarSign, title: "Proposta justa", text: "Pagamento à vista ou valor como entrada em outro veículo." },
  { icon: Truck, title: "Documentação resolvida", text: "Cuidamos de toda a parte burocrática para você." },
]

const intentOptions: { value: SellLeadIntentType; label: string }[] = [
  { value: "DIRECT_SALE", label: "Venda direta — quero vender meu carro à vista" },
  { value: "CONSIGNMENT", label: "Consignação — quero anunciar na loja e vender por um preço justo" },
  { value: "EVALUATE_BOTH", label: "Quero avaliar as duas opções com a equipe" },
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
        eyebrow="Compra segura"
        title="Venda seu carro com avaliação objetiva"
        description="Mostre os dados do veículo, receba uma proposta e acompanhe a documentação com clareza. A imagem de apoio usa um carro fictício sem marcas ou placa."
        imageSrc="/images/banners/sell-car-safe.png"
        imageAlt="Vistoria fictícia de veículo usado sem marcas, placas ou modelo real reconhecível"
      >
        <a href="#avaliacao">
          <Button size="lg">Solicitar avaliação</Button>
        </a>
        <Link href="/contato">
          <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
            Tirar dúvidas
          </Button>
        </Link>
      </ImagePageHero>

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.title} className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm">
              <div className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <step.icon className="h-6 w-6" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">{step.title}</h3>
              <p className="mt-1 text-sm text-muted">{step.text}</p>
            </div>
          ))}
        </div>

        <div id="avaliacao" className="mt-12 rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">Como prefere negociar?</h2>

          {params.enviado === "1" ? (
            <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Solicitação enviada. A equipe da Lima Automóveis entrará em contato pelos dados informados.
            </p>
          ) : null}
          {params.erro === "1" ? (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Preencha todos os campos obrigatórios e autorize o tratamento de dados conforme a LGPD.
            </p>
          ) : null}

          <form action={createSellLead} className="mt-6 grid gap-4 sm:grid-cols-2">
            {/* Intenção — radio group */}
            <fieldset className="sm:col-span-2">
              <legend className="mb-2 text-sm font-medium text-foreground">
                Tipo de negociação <span className="text-red-500">*</span>
              </legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {intentOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-surface p-4 text-sm text-muted transition hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary/5"
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
            <Field label="Telefone" name="phone" type="tel" placeholder="(00) 00000-0000" />
            <div className="sm:col-span-2">
              <Field label="Modelo do veículo" name="vehicleModel" required placeholder="Ex: sedan 2.0 automático" />
            </div>
            <Field label="Ano" name="year" type="number" placeholder="2020" />
            <Field label="Quilometragem" name="mileage" type="number" placeholder="50000" />
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">Observações</label>
              <textarea
                name="notes"
                rows={3}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
                placeholder="Estado geral, opcionais, histórico de revisões, etc."
              />
            </div>
            <div className="sm:col-span-2">
              <Field label="Seu melhor e-mail" name="email" type="email" required placeholder="seu@email.com" />
            </div>
            <label className="sm:col-span-2 flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-surface p-4 text-sm text-muted">
              <input name="consent" type="checkbox" required className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              <span>
                Autorizo a Lima Automóveis a tratar meus dados pessoais (nome, e-mail, telefone e dados do veículo)
                exclusivamente para avaliação, contato comercial e negociação do veículo informado, conforme a{" "}
                <Link href="/lgpd" className="font-semibold text-emerald-700 hover:text-emerald-800">
                  LGPD
                </Link>
                . Sei que posso revogar o consentimento a qualquer momento.
              </span>
            </label>
            <div className="sm:col-span-2">
              <Button className="w-full sm:w-auto">Solicitar avaliação</Button>
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
        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
        placeholder={placeholder}
      />
    </div>
  )
}
