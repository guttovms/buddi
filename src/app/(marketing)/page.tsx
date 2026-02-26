import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check, FileText, Share2, Smartphone, Zap } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold text-blue-600">OrçaRápido</span>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Criar Conta Grátis</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
          Orçamentos profissionais<br />
          <span className="text-blue-600">em minutos, não em horas</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-500">
          Crie orçamentos bonitos e profissionais direto do celular.
          Envie para seus clientes por WhatsApp e feche mais negócios.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/signup">
            <Button size="lg">Começar Grátis</Button>
          </Link>
          <Link href="#precos">
            <Button variant="outline" size="lg">Ver Preços</Button>
          </Link>
        </div>
        <p className="mt-3 text-sm text-gray-400">
          Grátis para sempre. Sem cartão de crédito.
        </p>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Tudo que você precisa para vender mais
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-gray-500">
            Pare de mandar orçamentos feios pelo WhatsApp. Impressione seus clientes.
          </p>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Zap,
                title: 'Rápido de criar',
                desc: 'Cadastre seus serviços uma vez e crie orçamentos em 2 minutos.',
              },
              {
                icon: FileText,
                title: 'PDF profissional',
                desc: 'Gere PDFs lindos com sua logo, dados e itens detalhados.',
              },
              {
                icon: Share2,
                title: 'Link compartilhável',
                desc: 'Envie um link por WhatsApp. O cliente aprova com um clique.',
              },
              {
                icon: Smartphone,
                title: 'Funciona no celular',
                desc: 'Crie e envie orçamentos de onde estiver, sem computador.',
              },
            ].map((feature) => (
              <Card key={feature.title} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precos" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Preços simples e transparentes
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-gray-500">
            Comece grátis. Faça upgrade quando precisar.
          </p>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:max-w-3xl lg:mx-auto">
            {/* Free Plan */}
            <Card className="relative">
              <h3 className="text-lg font-semibold text-gray-900">Grátis</h3>
              <p className="mt-1 text-sm text-gray-500">Para quem está começando</p>
              <p className="mt-4">
                <span className="text-4xl font-bold text-gray-900">R$0</span>
                <span className="text-gray-500">/mês</span>
              </p>
              <ul className="mt-6 space-y-3">
                {['3 orçamentos por mês', 'Serviços e clientes ilimitados', 'Link compartilhável', 'PDF para impressão'].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-500" />
                      {item}
                    </li>
                  )
                )}
              </ul>
              <Link href="/signup" className="mt-6 block">
                <Button variant="outline" className="w-full">Começar Grátis</Button>
              </Link>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-blue-200 bg-blue-50/30">
              <div className="absolute -top-3 left-4 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
                Popular
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Pro</h3>
              <p className="mt-1 text-sm text-gray-500">Para profissionais</p>
              <p className="mt-4">
                <span className="text-4xl font-bold text-gray-900">R$19</span>
                <span className="text-gray-500">,90/mês</span>
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Orçamentos ilimitados',
                  'Serviços e clientes ilimitados',
                  'Link compartilhável',
                  'PDF com sua logo',
                  'Aprovação pelo cliente',
                  'Suporte prioritário',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="mt-6 block">
                <Button className="w-full">Assinar Pro</Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white">
            Pronto para criar orçamentos profissionais?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-blue-100">
            Junte-se a centenas de profissionais que já usam o OrçaRápido.
          </p>
          <Link href="/signup">
            <Button size="lg" className="mt-8 bg-white text-blue-600 hover:bg-blue-50">
              Criar Conta Grátis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} OrçaRápido. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}
