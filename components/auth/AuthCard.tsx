import Link from 'next/link'
import { cn } from '@/utils/cn'

interface AuthCardProps {
  title: string
  subtitle: string
  children: React.ReactNode
  footer: React.ReactNode
  className?: string
}

export function AuthCard({ title, subtitle, children, footer, className }: AuthCardProps) {
  return (
    <div className={cn('rounded-2xl border border-border bg-card p-6 sm:p-8', className)}>
      <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted">{subtitle}</p>
      <div className="mt-8">{children}</div>
      <div className="mt-6 text-center text-sm text-muted">{footer}</div>
    </div>
  )
}

interface AuthFieldProps {
  label: string
  name?: string
  type?: string
  placeholder: string
  autoComplete?: string
}

export function AuthField({
  label,
  name,
  type = 'text',
  placeholder,
  autoComplete,
}: AuthFieldProps) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted uppercase tracking-wider">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-gold/50 focus:outline-none transition-colors"
      />
    </label>
  )
}

export function AuthSubmit({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="mt-6 w-full rounded-full bg-foreground py-3 text-sm font-medium text-background transition-transform hover:scale-[1.02]"
    >
      {children}
    </button>
  )
}

export function AuthLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-gold hover:underline underline-offset-4">
      {children}
    </Link>
  )
}
