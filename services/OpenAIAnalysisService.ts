import OpenAI from 'openai'
import type { Fighter } from '@/types'
import type { FightNarrativeAnalysis } from '@/types/analysis'
import type { PredictionEngineResult } from '@/types/prediction'
import {
  ANALYSIS_SYSTEM_PROMPT,
  buildAnalysisContext,
  buildAnalysisUserPrompt,
} from './analysis/build-analysis-context'
import { parseNarrativeJson } from './analysis/parse-narrative'

export interface GenerateFightAnalysisInput {
  fighterA: Fighter
  fighterB: Fighter
  /** Red corner = fighterA */
  prediction: PredictionEngineResult
  weightClass?: string
  eventName?: string
  scheduledRounds?: number
}

export class OpenAIAnalysisService {
  static isConfigured(): boolean {
    return Boolean(process.env.OPENAI_API_KEY?.trim())
  }

  /**
   * Generates written analysis only. Probabilities must come from `prediction`.
   */
  static async generateNarrative(
    input: GenerateFightAnalysisInput,
  ): Promise<FightNarrativeAnalysis> {
    const apiKey = process.env.OPENAI_API_KEY?.trim()
    if (!apiKey) {
      throw new OpenAIAnalysisError(
        'OPENAI_API_KEY is not configured',
        'MISSING_API_KEY',
      )
    }

    const model = process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini'
    const client = new OpenAI({ apiKey })

    const context = buildAnalysisContext(
      input.fighterA,
      input.fighterB,
      input.prediction,
      {
        weightClass: input.weightClass,
        eventName: input.eventName,
        scheduledRounds: input.scheduledRounds,
      },
    )

    const userPrompt = buildAnalysisUserPrompt(
      context,
      input.fighterA.name,
      input.fighterB.name,
    )

    let completion
    try {
      completion = await client.chat.completions.create({
        model,
        temperature: 0.65,
        max_tokens: 1400,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      })
    } catch {
      throw new OpenAIAnalysisError('OpenAI API request failed', 'API_ERROR')
    }

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new OpenAIAnalysisError('Empty response from OpenAI', 'EMPTY_RESPONSE')
    }

    try {
      return parseNarrativeJson(content, model)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Parse failed'
      throw new OpenAIAnalysisError(message, 'PARSE_ERROR')
    }
  }
}

export class OpenAIAnalysisError extends Error {
  constructor(
    message: string,
    readonly code: 'MISSING_API_KEY' | 'EMPTY_RESPONSE' | 'PARSE_ERROR' | 'API_ERROR',
  ) {
    super(message)
    this.name = 'OpenAIAnalysisError'
  }
}

export default OpenAIAnalysisService
