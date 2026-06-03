interface OrgJsonLdProps {
  data: Record<string, unknown>
}

export function OrgJsonLd({ data }: OrgJsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
