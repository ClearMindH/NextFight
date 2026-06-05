import { ContactForm } from '@/components/contact/ContactForm'

export const metadata = {
  title: 'Contact',
  description: 'Contactez l’équipe NextFight.',
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#050505] pt-24 section-padding pb-20">
      <div className="container-content max-w-lg">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Contact</h1>
        <p className="mt-3 text-sm text-muted leading-relaxed">
          Une question sur l&apos;abonnement, un bug ou une suggestion ? Écrivez-nous.
        </p>
        <ContactForm className="mt-10" />
      </div>
    </main>
  )
}
