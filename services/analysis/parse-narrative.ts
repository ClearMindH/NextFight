import type { FightNarrativeAnalysis } from '@/types/analysis'

function asStringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid narrative: ${field} must be an array`)
  }
  const items = value.filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
  if (items.length === 0) {
    throw new Error(`Invalid narrative: ${field} is empty`)
  }
  return items
}

function asProfile(value: unknown, corner: string) {
  if (!value || typeof value !== 'object') {
    throw new Error(`Invalid narrative: ${corner} profile missing`)
  }
  const obj = value as Record<string, unknown>
  return {
    strengths: asStringArray(obj.strengths, `${corner}.strengths`),
    weaknesses: asStringArray(obj.weaknesses, `${corner}.weaknesses`),
  }
}

export function parseNarrativeJson(
  raw: string,
  providerModel: string,
): FightNarrativeAnalysis {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('OpenAI returned invalid JSON')
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('OpenAI response is not an object')
  }

  const obj = parsed as Record<string, unknown>

  if (typeof obj.analysis !== 'string' || obj.analysis.trim().length < 40) {
    throw new Error('Invalid narrative: analysis text too short')
  }

  return {
    analysis: obj.analysis.trim(),
    redCorner: asProfile(obj.redCorner, 'redCorner'),
    blueCorner: asProfile(obj.blueCorner, 'blueCorner'),
    fightKeys: asStringArray(obj.fightKeys, 'fightKeys'),
    generatedAt: new Date().toISOString(),
    providerModel,
  }
}
