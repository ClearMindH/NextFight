import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/utils/cn'

const LOGO_SRC = '/brand/nextfight-logo.png'

type NextFightBrandProps = {
  /** Lien vers l’accueil (défaut). Passer `null` pour un bloc statique. */
  href?: string | null
  className?: string
  /** Taille du pictogramme NF */
  iconSize?: 'sm' | 'md' | 'lg'
  /** Afficher le mot « NextFight » à droite du logo */
  showWordmark?: boolean
  wordmarkClassName?: string
}

const ICON_PX = { sm: 28, md: 32, lg: 40 } as const

export function NextFightBrand({
  href = '/',
  className,
  iconSize = 'md',
  showWordmark = true,
  wordmarkClassName,
}: NextFightBrandProps) {
  const px = ICON_PX[iconSize]
  const content = (
    <>
      <Image
        src={LOGO_SRC}
        alt=""
        width={px}
        height={px}
        className="shrink-0 rounded-md object-cover"
        priority
      />
      {showWordmark ? (
        <span
          className={cn(
            'font-display text-lg font-semibold tracking-tight text-foreground',
            wordmarkClassName,
          )}
        >
          NextFight
        </span>
      ) : null}
    </>
  )

  const layout = cn('inline-flex items-center gap-2.5', className)

  if (href) {
    return (
      <Link href={href} className={cn('group', layout)} aria-label="NextFight — accueil">
        {content}
      </Link>
    )
  }

  return <div className={layout}>{content}</div>
}
