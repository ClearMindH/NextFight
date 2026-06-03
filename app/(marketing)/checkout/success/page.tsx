import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { CheckoutSuccessContent } from './CheckoutSuccessContent'

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container-content section-padding text-center">
          <Loader2 className="h-10 w-10 animate-spin text-gold mx-auto" />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  )
}
