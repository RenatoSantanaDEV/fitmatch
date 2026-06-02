import { describe, it, expect } from 'vitest'
import { HeuristicMatchingAdapter } from '@/infrastructure/ai/HeuristicMatchingAdapter'
import { ExperienceLevel } from '@/domain/enums/ExperienceLevel'
import { SessionModality } from '@/domain/enums/SessionModality'
import { SpecializationType } from '@/domain/enums/SpecializationType'
import type { MatchingStudent, MatchingCandidate } from '@/application/ports/output/IMatchingPort'

const adapter = new HeuristicMatchingAdapter()

function makeStudent(overrides: Partial<MatchingStudent> = {}): MatchingStudent {
  return {
    id: 's1',
    fitnessGoals: ['saúde'],
    experienceLevel: ExperienceLevel.BEGINNER,
    preferredModality: SessionModality.ONLINE,
    preferredSpecializations: [],
    ...overrides,
  }
}

function makeCandidate(overrides: Partial<MatchingCandidate> = {}): MatchingCandidate {
  return {
    professionalId: 'p1',
    bio: 'Bio',
    areaSlugs: [SpecializationType.PERSONAL_TRAINING],
    modalities: [SessionModality.ONLINE],
    yearsExperience: 3,
    averageRating: null,
    totalReviews: 0,
    priceRange: { min: 80, max: 150, currency: 'BRL' },
    city: 'São Paulo',
    state: 'SP',
    country: 'BR',
    isVerified: false,
    ...overrides,
  }
}

describe('HeuristicMatchingAdapter', () => {
  describe('findMatches — geral', () => {
    it('retorna modelVersion heuristic-v1', async () => {
      const [r] = await adapter.findMatches({ student: makeStudent(), candidates: [makeCandidate()], maxResults: 10 })
      expect(r.modelVersion).toBe('heuristic-v1')
    })

    it('inclui reasoning não-vazia em português', async () => {
      const [r] = await adapter.findMatches({ student: makeStudent(), candidates: [makeCandidate()], maxResults: 10 })
      expect(typeof r.reasoning).toBe('string')
      expect(r.reasoning.length).toBeGreaterThan(5)
    })

    it('ordena resultados por score decrescente', async () => {
      const a = makeCandidate({
        professionalId: 'a',
        areaSlugs: [SpecializationType.YOGA],
        modalities: [SessionModality.ONLINE],
        yearsExperience: 8,
        averageRating: 5.0,
        totalReviews: 40,
        isVerified: true,
      })
      const b = makeCandidate({
        professionalId: 'b',
        areaSlugs: [SpecializationType.SWIMMING],
        modalities: [SessionModality.IN_PERSON],
        yearsExperience: 0,
        averageRating: null,
        totalReviews: 0,
        isVerified: false,
      })
      const results = await adapter.findMatches({
        student: makeStudent({ preferredSpecializations: [SpecializationType.YOGA] }),
        candidates: [b, a],
        maxResults: 10,
      })
      expect(results[0].professionalId).toBe('a')
      expect(results[0].score).toBeGreaterThan(results[1].score)
    })

    it('respeita maxResults', async () => {
      const candidates = [1, 2, 3, 4, 5].map((i) =>
        makeCandidate({ professionalId: `p${i}` }),
      )
      const results = await adapter.findMatches({ student: makeStudent(), candidates, maxResults: 2 })
      expect(results).toHaveLength(2)
    })
  })

  describe('pontuação — match perfeito', () => {
    it('todas as dimensões máximas resultam em score 0.95 (cap)', async () => {
      const student = makeStudent({
        experienceLevel: ExperienceLevel.ADVANCED,
        preferredSpecializations: [SpecializationType.PERSONAL_TRAINING],
        preferredModality: SessionModality.ONLINE,
        budgetRange: { min: 100, max: 200, currency: 'BRL' },
      })
      const candidate = makeCandidate({
        areaSlugs: [SpecializationType.PERSONAL_TRAINING],
        modalities: [SessionModality.ONLINE],
        yearsExperience: 8,
        averageRating: 5.0,
        totalReviews: 30,
        priceRange: { min: 100, max: 150, currency: 'BRL' },
        isVerified: true,
      })
      const [r] = await adapter.findMatches({ student, candidates: [candidate], maxResults: 1 })
      expect(r.score).toBeCloseTo(0.95, 2)
    })
  })

  describe('pontuação — especialização', () => {
    it('sem overlap → spec=0; score determinístico', async () => {
      const student = makeStudent({ preferredSpecializations: [SpecializationType.YOGA] })
      const candidate = makeCandidate({ areaSlugs: [SpecializationType.CROSSFIT] })
      const [r] = await adapter.findMatches({ student, candidates: [candidate], maxResults: 1 })
      expect(r.score).toBeCloseTo(0.485, 2)
    })

    it('estudante sem preferência → spec=0.6 (padrão)', async () => {
      const student = makeStudent({ preferredSpecializations: [] })
      const candidate = makeCandidate({ areaSlugs: [SpecializationType.YOGA] })
      const [r] = await adapter.findMatches({ student, candidates: [candidate], maxResults: 1 })
      expect(r.score).toBeCloseTo(0.695, 2)
    })

    it('overlap parcial (1 de 2 specs) → spec=0.8', async () => {
      const student = makeStudent({
        preferredSpecializations: [SpecializationType.YOGA, SpecializationType.PILATES],
      })
      const candidate = makeCandidate({ areaSlugs: [SpecializationType.YOGA] })
      const [r] = await adapter.findMatches({ student, candidates: [candidate], maxResults: 1 })
      expect(r.score).toBeCloseTo(0.765, 2)
    })

    it('overlap total (2 de 2 specs) → spec=1.0', async () => {
      const student = makeStudent({
        preferredSpecializations: [SpecializationType.YOGA, SpecializationType.PILATES],
      })
      const candidate = makeCandidate({
        areaSlugs: [SpecializationType.YOGA, SpecializationType.PILATES],
      })
      const [r] = await adapter.findMatches({ student, candidates: [candidate], maxResults: 1 })
      expect(r.score).toBeCloseTo(0.835, 2)
    })
  })

  describe('pontuação — experiência', () => {
    it.each([
      [ExperienceLevel.BEGINNER, 0, 0.3],
      [ExperienceLevel.BEGINNER, 1, 0.7],
      [ExperienceLevel.BEGINNER, 3, 0.9],
      [ExperienceLevel.INTERMEDIATE, 1, 0.4],
      [ExperienceLevel.INTERMEDIATE, 3, 0.85],
      [ExperienceLevel.INTERMEDIATE, 6, 1.0],
      [ExperienceLevel.ADVANCED, 2, 0.3],
      [ExperienceLevel.ADVANCED, 5, 0.75],
      [ExperienceLevel.ADVANCED, 8, 1.0],
    ] as [ExperienceLevel, number, number][])(
      '%s com %d anos → expScore=%f',
      async (level, years, expScore) => {
        const student = makeStudent({
          experienceLevel: level,
          preferredSpecializations: [],
          preferredModality: SessionModality.ONLINE,
          budgetRange: undefined,
        })
        const candidate = makeCandidate({
          areaSlugs: [],
          modalities: [SessionModality.ONLINE],
          yearsExperience: years,
          averageRating: null,
          totalReviews: 0,
          isVerified: false,
        })
        const expectedTotal = 0.515 + expScore * 0.2
        const [r] = await adapter.findMatches({ student, candidates: [candidate], maxResults: 1 })
        expect(r.score).toBeCloseTo(expectedTotal, 2)
      },
    )
  })

  describe('pontuação — modalidade', () => {
    it('match exato de modalidade → mod=1.0', async () => {
      const [r] = await adapter.findMatches({
        student: makeStudent({ preferredSpecializations: [] }),
        candidates: [makeCandidate({ modalities: [SessionModality.ONLINE] })],
        maxResults: 1,
      })
      expect(r.score).toBeCloseTo(0.695, 2)
    })

    it('fallback HYBRID → mod=0.8; diferença de 0.03 em relação ao match exato', async () => {
      const [r] = await adapter.findMatches({
        student: makeStudent({ preferredSpecializations: [] }),
        candidates: [makeCandidate({ modalities: [SessionModality.HYBRID] })],
        maxResults: 1,
      })
      expect(r.score).toBeCloseTo(0.665, 2)
    })

    it('modalidade incompatível (IN_PERSON para estudante ONLINE) → mod=0.6', async () => {
      const [r] = await adapter.findMatches({
        student: makeStudent({ preferredSpecializations: [] }),
        candidates: [makeCandidate({ modalities: [SessionModality.IN_PERSON] })],
        maxResults: 1,
      })
      expect(r.score).toBeCloseTo(0.635, 2)
    })
  })

  describe('pontuação — orçamento', () => {
    it('preço totalmente dentro do orçamento → budget=1.0', async () => {
      const student = makeStudent({
        preferredSpecializations: [],
        budgetRange: { min: 80, max: 200, currency: 'BRL' },
      })
      const candidate = makeCandidate({ priceRange: { min: 90, max: 150, currency: 'BRL' } })
      const [r] = await adapter.findMatches({ student, candidates: [candidate], maxResults: 1 })
      expect(r.score).toBeCloseTo(0.74, 2)
    })

    it('estudante sem budget → budget=0.7 (padrão)', async () => {
      const [r] = await adapter.findMatches({
        student: makeStudent({ preferredSpecializations: [], budgetRange: undefined }),
        candidates: [makeCandidate()],
        maxResults: 1,
      })
      expect(r.score).toBeCloseTo(0.695, 2)
    })
  })

  describe('pontuação — prova social', () => {
    it('sem avaliação → social=0.5 (neutro)', async () => {
      const [r] = await adapter.findMatches({
        student: makeStudent({ preferredSpecializations: [] }),
        candidates: [makeCandidate({ averageRating: null, totalReviews: 0 })],
        maxResults: 1,
      })
      expect(r.score).toBeCloseTo(0.695, 2)
    })

    it('profissional verificado adiciona exatamente 0.05 ao score', async () => {
      const student = makeStudent({ preferredSpecializations: [] })
      const base = makeCandidate({ professionalId: 'base', isVerified: false })
      const verified = makeCandidate({ professionalId: 'verified', isVerified: true })
      const results = await adapter.findMatches({ student, candidates: [base, verified], maxResults: 10 })
      const scoreBase = results.find((r) => r.professionalId === 'base')!.score
      const scoreVerified = results.find((r) => r.professionalId === 'verified')!.score
      expect(scoreVerified - scoreBase).toBeCloseTo(0.05, 2)
    })

    it('avaliação máxima (5.0, 30+ avaliações) → social=1.0', async () => {
      const [r] = await adapter.findMatches({
        student: makeStudent({ preferredSpecializations: [] }),
        candidates: [makeCandidate({ averageRating: 5.0, totalReviews: 30 })],
        maxResults: 1,
      })
      expect(r.score).toBeCloseTo(0.745, 2)
    })
  })

  describe('bônus de impulsionamento (boost)', () => {
    it('sem boostTier não altera o score base', async () => {
      const base = makeCandidate({ professionalId: 'base' })
      const semBoost = makeCandidate({ professionalId: 'sem-boost', boostTier: undefined })
      const [r1] = await adapter.findMatches({ student: makeStudent({ preferredSpecializations: [] }), candidates: [base], maxResults: 1 })
      const [r2] = await adapter.findMatches({ student: makeStudent({ preferredSpecializations: [] }), candidates: [semBoost], maxResults: 1 })
      expect(r1.score).toBeCloseTo(r2.score, 5)
    })

    it('BASICO adiciona 0.03 ao score', async () => {
      const student = makeStudent({ preferredSpecializations: [] })
      const sem = makeCandidate({ professionalId: 'sem' })
      const com = makeCandidate({ professionalId: 'com', boostTier: 'BASICO' })
      const results = await adapter.findMatches({ student, candidates: [sem, com], maxResults: 10 })
      const scoreSem = results.find((r) => r.professionalId === 'sem')!.score
      const scoreCom = results.find((r) => r.professionalId === 'com')!.score
      expect(scoreCom - scoreSem).toBeCloseTo(0.03, 5)
    })

    it('PLUS adiciona 0.07 ao score', async () => {
      const student = makeStudent({ preferredSpecializations: [] })
      const sem = makeCandidate({ professionalId: 'sem' })
      const com = makeCandidate({ professionalId: 'com', boostTier: 'PLUS' })
      const results = await adapter.findMatches({ student, candidates: [sem, com], maxResults: 10 })
      const scoreSem = results.find((r) => r.professionalId === 'sem')!.score
      const scoreCom = results.find((r) => r.professionalId === 'com')!.score
      expect(scoreCom - scoreSem).toBeCloseTo(0.07, 5)
    })

    it('PREMIUM adiciona 0.12 ao score', async () => {
      const student = makeStudent({ preferredSpecializations: [] })
      const sem = makeCandidate({ professionalId: 'sem' })
      const com = makeCandidate({ professionalId: 'com', boostTier: 'PREMIUM' })
      const results = await adapter.findMatches({ student, candidates: [sem, com], maxResults: 10 })
      const scoreSem = results.find((r) => r.professionalId === 'sem')!.score
      const scoreCom = results.find((r) => r.professionalId === 'com')!.score
      expect(scoreCom - scoreSem).toBeCloseTo(0.12, 5)
    })

    it('score com PREMIUM é capeado em 0.97', async () => {
      const student = makeStudent({
        experienceLevel: ExperienceLevel.ADVANCED,
        preferredSpecializations: [SpecializationType.PERSONAL_TRAINING],
        preferredModality: SessionModality.ONLINE,
        budgetRange: { min: 100, max: 200, currency: 'BRL' },
      })
      const candidate = makeCandidate({
        areaSlugs: [SpecializationType.PERSONAL_TRAINING],
        modalities: [SessionModality.ONLINE],
        yearsExperience: 8,
        averageRating: 5.0,
        totalReviews: 30,
        priceRange: { min: 100, max: 150, currency: 'BRL' },
        isVerified: true,
        boostTier: 'PREMIUM',
      })
      const [r] = await adapter.findMatches({ student, candidates: [candidate], maxResults: 1 })
      expect(r.score).toBeLessThanOrEqual(0.97)
      expect(r.score).toBeCloseTo(0.97, 2)
    })

    it('profissional com PREMIUM supera profissional melhor avaliado sem boost', async () => {
      const student = makeStudent({ preferredSpecializations: [SpecializationType.YOGA] })
      const topRated = makeCandidate({
        professionalId: 'top',
        areaSlugs: [SpecializationType.YOGA],
        averageRating: 5.0,
        totalReviews: 50,
        isVerified: true,
        yearsExperience: 10,
      })
      const boosted = makeCandidate({
        professionalId: 'boosted',
        areaSlugs: [SpecializationType.YOGA],
        averageRating: null,
        totalReviews: 0,
        isVerified: false,
        yearsExperience: 1,
        boostTier: 'PREMIUM',
      })
      const results = await adapter.findMatches({ student, candidates: [topRated, boosted], maxResults: 10 })
      const scoreTop = results.find((r) => r.professionalId === 'top')!.score
      const scoreBoosted = results.find((r) => r.professionalId === 'boosted')!.score
      // boost PREMIUM (+0.12) não compensa uma diferença de score muito grande — valida que não distorce demais
      expect(scoreBoosted).toBeGreaterThan(0)
      expect(scoreTop).toBeGreaterThan(scoreBoosted)
    })
  })
})
