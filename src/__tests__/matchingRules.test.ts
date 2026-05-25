import { describe, it, expect } from 'vitest'
import {
  isProfessionalEligible,
  isModalityCompatible,
  hasSpecializationOverlap,
  isBudgetCompatible,
  prefilterCandidates,
} from '@/domain/rules/matchingRules'
import type { Student } from '@/domain/entities/Student'
import type { Professional } from '@/domain/entities/Professional'
import { ExperienceLevel } from '@/domain/enums/ExperienceLevel'
import { SessionModality } from '@/domain/enums/SessionModality'
import { SpecializationType } from '@/domain/enums/SpecializationType'

function makeStudent(overrides: Partial<Student> = {}): Student {
  return {
    id: 's1',
    userId: 'u1',
    fitnessGoals: ['saúde'],
    experienceLevel: ExperienceLevel.BEGINNER,
    preferredModality: SessionModality.ONLINE,
    preferredSpecializations: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

function makeProfessional(overrides: Partial<Professional> = {}): Professional {
  return {
    id: 'p1',
    userId: 'u2',
    bio: 'Bio',
    areas: [{ id: '1', nome: 'Personal Training', slug: SpecializationType.PERSONAL_TRAINING }],
    location: { street: 'Rua A', city: 'São Paulo', state: 'SP', country: 'BR', postalCode: '01000-000' },
    modalities: [SessionModality.ONLINE],
    sessionPrice: { min: 80, max: 150, currency: 'BRL' },
    yearsExperience: 3,
    isVerified: true,
    isAcceptingClients: true,
    averageRating: null,
    totalReviews: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

describe('isProfessionalEligible', () => {
  it('aceita profissional válido', () => {
    expect(isProfessionalEligible(makeProfessional())).toBe(true)
  })

  it('rejeita quem não aceita clientes', () => {
    expect(isProfessionalEligible(makeProfessional({ isAcceptingClients: false }))).toBe(false)
  })

  it('rejeita sem áreas de atuação', () => {
    expect(isProfessionalEligible(makeProfessional({ areas: [] }))).toBe(false)
  })

  it('rejeita não-verificado quando requireVerified=true', () => {
    expect(
      isProfessionalEligible(makeProfessional({ isVerified: false }), { requireVerified: true }),
    ).toBe(false)
  })

  it('aceita não-verificado quando requireVerified não especificado', () => {
    expect(isProfessionalEligible(makeProfessional({ isVerified: false }))).toBe(true)
  })
})

describe('isModalityCompatible', () => {
  describe('estudante ONLINE', () => {
    const student = makeStudent({ preferredModality: SessionModality.ONLINE })

    it('profissional ONLINE → compatível', () => {
      expect(isModalityCompatible(student, makeProfessional({ modalities: [SessionModality.ONLINE] }))).toBe(true)
    })

    it('profissional HYBRID → compatível', () => {
      expect(isModalityCompatible(student, makeProfessional({ modalities: [SessionModality.HYBRID] }))).toBe(true)
    })

    it('profissional somente IN_PERSON → incompatível', () => {
      expect(isModalityCompatible(student, makeProfessional({ modalities: [SessionModality.IN_PERSON] }))).toBe(false)
    })
  })

  describe('estudante IN_PERSON', () => {
    const spLocation = { street: 'Rua B', city: 'São Paulo', state: 'SP', country: 'BR', postalCode: '01001-000' }
    const rjLocation = { street: 'Rua C', city: 'Rio de Janeiro', state: 'RJ', country: 'BR', postalCode: '20000-000' }
    const student = makeStudent({
      preferredModality: SessionModality.IN_PERSON,
      preferredLocation: { street: '', city: 'São Paulo', state: 'SP', country: 'BR', postalCode: '' },
    })

    it('profissional IN_PERSON mesma cidade → compatível', () => {
      expect(
        isModalityCompatible(student, makeProfessional({ modalities: [SessionModality.IN_PERSON], location: spLocation })),
      ).toBe(true)
    })

    it('profissional IN_PERSON cidade diferente → incompatível', () => {
      expect(
        isModalityCompatible(student, makeProfessional({ modalities: [SessionModality.IN_PERSON], location: rjLocation })),
      ).toBe(false)
    })

    it('profissional HYBRID mesma cidade → compatível', () => {
      expect(
        isModalityCompatible(student, makeProfessional({ modalities: [SessionModality.HYBRID], location: spLocation })),
      ).toBe(true)
    })

    it('profissional somente ONLINE → incompatível', () => {
      expect(isModalityCompatible(student, makeProfessional({ modalities: [SessionModality.ONLINE] }))).toBe(false)
    })
  })

  describe('estudante HYBRID', () => {
    const spLocation = { street: 'Rua D', city: 'São Paulo', state: 'SP', country: 'BR', postalCode: '01002-000' }
    const rjLocation = { street: 'Rua E', city: 'Rio de Janeiro', state: 'RJ', country: 'BR', postalCode: '20001-000' }
    const student = makeStudent({
      preferredModality: SessionModality.HYBRID,
      preferredLocation: { street: '', city: 'São Paulo', state: 'SP', country: 'BR', postalCode: '' },
    })

    it('profissional ONLINE → compatível (sem restrição de cidade)', () => {
      expect(isModalityCompatible(student, makeProfessional({ modalities: [SessionModality.ONLINE], location: rjLocation }))).toBe(true)
    })

    it('profissional HYBRID → compatível', () => {
      expect(isModalityCompatible(student, makeProfessional({ modalities: [SessionModality.HYBRID], location: spLocation }))).toBe(true)
    })

    it('profissional IN_PERSON mesma cidade → compatível', () => {
      expect(
        isModalityCompatible(student, makeProfessional({ modalities: [SessionModality.IN_PERSON], location: spLocation })),
      ).toBe(true)
    })

    it('profissional somente IN_PERSON cidade diferente → incompatível', () => {
      expect(
        isModalityCompatible(student, makeProfessional({ modalities: [SessionModality.IN_PERSON], location: rjLocation })),
      ).toBe(false)
    })
  })
})

describe('hasSpecializationOverlap', () => {
  it('estudante sem preferências → sempre passa', () => {
    const student = makeStudent({ preferredSpecializations: [] })
    expect(hasSpecializationOverlap(student, makeProfessional({ areas: [] }))).toBe(true)
  })

  it('especialização do estudante presente nas áreas do profissional → passa', () => {
    const student = makeStudent({ preferredSpecializations: [SpecializationType.YOGA] })
    const pro = makeProfessional({ areas: [{ id: '2', nome: 'Yoga', slug: SpecializationType.YOGA }] })
    expect(hasSpecializationOverlap(student, pro)).toBe(true)
  })

  it('nenhuma especialização em comum → filtrado', () => {
    const student = makeStudent({ preferredSpecializations: [SpecializationType.YOGA] })
    const pro = makeProfessional({
      areas: [{ id: '3', nome: 'Crossfit', slug: SpecializationType.CROSSFIT }],
    })
    expect(hasSpecializationOverlap(student, pro)).toBe(false)
  })
})

describe('isBudgetCompatible', () => {
  it('estudante sem budget → sempre compatível', () => {
    const student = makeStudent({ budgetRange: undefined })
    expect(isBudgetCompatible(student, makeProfessional())).toBe(true)
  })

  it('moeda diferente → incompatível', () => {
    const student = makeStudent({ budgetRange: { min: 50, max: 200, currency: 'USD' } })
    expect(isBudgetCompatible(student, makeProfessional({ sessionPrice: { min: 80, max: 150, currency: 'BRL' } }))).toBe(false)
  })

  it('faixa do profissional dentro do orçamento → compatível', () => {
    const student = makeStudent({ budgetRange: { min: 50, max: 200, currency: 'BRL' } })
    expect(isBudgetCompatible(student, makeProfessional({ sessionPrice: { min: 80, max: 150, currency: 'BRL' } }))).toBe(true)
  })

  it('faixas sem intersecção → incompatível', () => {
    const student = makeStudent({ budgetRange: { min: 50, max: 100, currency: 'BRL' } })
    expect(isBudgetCompatible(student, makeProfessional({ sessionPrice: { min: 200, max: 300, currency: 'BRL' } }))).toBe(false)
  })

  it('intersecção parcial → compatível', () => {
    const student = makeStudent({ budgetRange: { min: 80, max: 150, currency: 'BRL' } })
    expect(isBudgetCompatible(student, makeProfessional({ sessionPrice: { min: 120, max: 200, currency: 'BRL' } }))).toBe(true)
  })
})

describe('prefilterCandidates', () => {
  it('remove profissional que não aceita clientes', () => {
    const student = makeStudent()
    const pros = [makeProfessional({ id: 'ok' }), makeProfessional({ id: 'closed', isAcceptingClients: false })]
    const result = prefilterCandidates(student, pros)
    expect(result.map((p) => p.id)).toEqual(['ok'])
  })

  it('remove profissional com modalidade incompatível', () => {
    const student = makeStudent({ preferredModality: SessionModality.ONLINE })
    const pros = [
      makeProfessional({ id: 'online', modalities: [SessionModality.ONLINE] }),
      makeProfessional({ id: 'presencial', modalities: [SessionModality.IN_PERSON] }),
    ]
    const result = prefilterCandidates(student, pros)
    expect(result.map((p) => p.id)).toEqual(['online'])
  })

  it('mantém apenas profissionais que passam em todos os critérios', () => {
    const student = makeStudent({
      preferredModality: SessionModality.ONLINE,
      preferredSpecializations: [SpecializationType.YOGA],
      budgetRange: { min: 60, max: 120, currency: 'BRL' },
    })
    const proIdeal = makeProfessional({
      id: 'ideal',
      areas: [{ id: '1', nome: 'Yoga', slug: SpecializationType.YOGA }],
      modalities: [SessionModality.ONLINE],
      sessionPrice: { min: 70, max: 100, currency: 'BRL' },
    })
    const proEspecialErrada = makeProfessional({
      id: 'errada',
      areas: [{ id: '2', nome: 'Crossfit', slug: SpecializationType.CROSSFIT }],
      modalities: [SessionModality.ONLINE],
      sessionPrice: { min: 70, max: 100, currency: 'BRL' },
    })
    const proForaDoBudget = makeProfessional({
      id: 'caro',
      areas: [{ id: '1', nome: 'Yoga', slug: SpecializationType.YOGA }],
      modalities: [SessionModality.ONLINE],
      sessionPrice: { min: 200, max: 300, currency: 'BRL' },
    })
    const result = prefilterCandidates(student, [proIdeal, proEspecialErrada, proForaDoBudget])
    expect(result.map((p) => p.id)).toEqual(['ideal'])
  })
})
