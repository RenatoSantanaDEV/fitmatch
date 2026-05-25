import { writeFileSync, mkdirSync } from 'fs'
import { execSync } from 'child_process'
import { join } from 'path'
import { HeuristicMatchingAdapter } from '../src/infrastructure/ai/HeuristicMatchingAdapter'
import { ExperienceLevel } from '../src/domain/enums/ExperienceLevel'
import { SessionModality } from '../src/domain/enums/SessionModality'
import { SpecializationType } from '../src/domain/enums/SpecializationType'
import type { MatchingStudent, MatchingCandidate } from '../src/application/ports/output/IMatchingPort'

interface LabeledCandidate {
  candidate: MatchingCandidate
  relevance: 0 | 1 | 2
}

interface Scenario {
  name: string
  student: MatchingStudent
  pool: LabeledCandidate[]
}

type RankRow = { pos: number; id: string; score: number; relevance: number; reasoning: string }

interface ScenarioResult {
  name: string
  student: MatchingStudent
  p1: number
  pk: number
  ndcg: number
  ranking: RankRow[]
}

const scenarios: Scenario[] = [
  {
    name: 'Iniciante — emagrecimento ONLINE (R$60-130)',
    student: {
      id: 's1',
      fitnessGoals: ['emagrecimento'],
      experienceLevel: ExperienceLevel.BEGINNER,
      preferredModality: SessionModality.ONLINE,
      preferredSpecializations: [SpecializationType.PERSONAL_TRAINING, SpecializationType.FUNCTIONAL_TRAINING],
      budgetRange: { min: 60, max: 130, currency: 'BRL' },
    },
    pool: [
      {
        relevance: 2,
        candidate: {
          professionalId: 'c1-pt-online',
          bio: 'Personal trainer especialista em emagrecimento',
          areaSlugs: [SpecializationType.PERSONAL_TRAINING],
          modalities: [SessionModality.ONLINE],
          yearsExperience: 3,
          averageRating: 4.5,
          totalReviews: 20,
          priceRange: { min: 80, max: 120, currency: 'BRL' },
          city: 'São Paulo', state: 'SP', country: 'BR',
          isVerified: true,
        },
      },
      {
        relevance: 2,
        candidate: {
          professionalId: 'c2-ft-online',
          bio: 'Treinamento funcional para resultados rápidos',
          areaSlugs: [SpecializationType.FUNCTIONAL_TRAINING],
          modalities: [SessionModality.ONLINE],
          yearsExperience: 2,
          averageRating: 4.0,
          totalReviews: 10,
          priceRange: { min: 70, max: 110, currency: 'BRL' },
          city: 'Belo Horizonte', state: 'MG', country: 'BR',
          isVerified: false,
        },
      },
      {
        relevance: 1,
        candidate: {
          professionalId: 'c3-yoga-online',
          bio: 'Yoga para saúde e bem-estar',
          areaSlugs: [SpecializationType.YOGA],
          modalities: [SessionModality.ONLINE],
          yearsExperience: 5,
          averageRating: 4.8,
          totalReviews: 40,
          priceRange: { min: 60, max: 100, currency: 'BRL' },
          city: 'Curitiba', state: 'PR', country: 'BR',
          isVerified: false,
        },
      },
      {
        relevance: 1,
        candidate: {
          professionalId: 'c4-pt-presencial',
          bio: 'Personal trainer presencial em São Paulo',
          areaSlugs: [SpecializationType.PERSONAL_TRAINING],
          modalities: [SessionModality.IN_PERSON],
          yearsExperience: 4,
          averageRating: 4.7,
          totalReviews: 25,
          priceRange: { min: 100, max: 150, currency: 'BRL' },
          city: 'São Paulo', state: 'SP', country: 'BR',
          isVerified: false,
        },
      },
      {
        relevance: 0,
        candidate: {
          professionalId: 'c5-crossfit-baixa-exp',
          bio: 'CrossFit e alta intensidade',
          areaSlugs: [SpecializationType.CROSSFIT],
          modalities: [SessionModality.ONLINE],
          yearsExperience: 1,
          averageRating: null,
          totalReviews: 0,
          priceRange: { min: 90, max: 120, currency: 'BRL' },
          city: 'Porto Alegre', state: 'RS', country: 'BR',
          isVerified: false,
        },
      },
      {
        relevance: 0,
        candidate: {
          professionalId: 'c6-nutri-caro',
          bio: 'Nutrição esportiva de alto nível',
          areaSlugs: [SpecializationType.NUTRITION_COACHING],
          modalities: [SessionModality.ONLINE],
          yearsExperience: 6,
          averageRating: 4.9,
          totalReviews: 50,
          priceRange: { min: 150, max: 250, currency: 'BRL' },
          city: 'São Paulo', state: 'SP', country: 'BR',
          isVerified: true,
        },
      },
    ],
  },

  {
    name: 'Avançado — musculação/força PRESENCIAL SP (R$120-250)',
    student: {
      id: 's2',
      fitnessGoals: ['ganho de massa', 'força'],
      experienceLevel: ExperienceLevel.ADVANCED,
      preferredModality: SessionModality.IN_PERSON,
      preferredSpecializations: [SpecializationType.PERSONAL_TRAINING, SpecializationType.CROSSFIT],
      budgetRange: { min: 120, max: 250, currency: 'BRL' },
      location: { city: 'São Paulo', state: 'SP', country: 'BR' },
    },
    pool: [
      {
        relevance: 2,
        candidate: {
          professionalId: 'd1-pt-sp-senior',
          bio: 'Personal trainer para atletas avançados',
          areaSlugs: [SpecializationType.PERSONAL_TRAINING],
          modalities: [SessionModality.IN_PERSON],
          yearsExperience: 8,
          averageRating: 4.8,
          totalReviews: 35,
          priceRange: { min: 150, max: 200, currency: 'BRL' },
          city: 'São Paulo', state: 'SP', country: 'BR',
          isVerified: true,
        },
      },
      {
        relevance: 2,
        candidate: {
          professionalId: 'd2-crossfit-sp',
          bio: 'Coach CrossFit nível 2',
          areaSlugs: [SpecializationType.CROSSFIT],
          modalities: [SessionModality.IN_PERSON],
          yearsExperience: 5,
          averageRating: 4.5,
          totalReviews: 20,
          priceRange: { min: 130, max: 180, currency: 'BRL' },
          city: 'São Paulo', state: 'SP', country: 'BR',
          isVerified: true,
        },
      },
      {
        relevance: 1,
        candidate: {
          professionalId: 'd3-ft-sp',
          bio: 'Treinamento funcional para condicionamento avançado',
          areaSlugs: [SpecializationType.FUNCTIONAL_TRAINING],
          modalities: [SessionModality.IN_PERSON],
          yearsExperience: 4,
          averageRating: 4.2,
          totalReviews: 15,
          priceRange: { min: 100, max: 160, currency: 'BRL' },
          city: 'São Paulo', state: 'SP', country: 'BR',
          isVerified: false,
        },
      },
      {
        relevance: 0,
        candidate: {
          professionalId: 'd4-swimming-sp',
          bio: 'Natação e condicionamento aquático',
          areaSlugs: [SpecializationType.SWIMMING],
          modalities: [SessionModality.HYBRID],
          yearsExperience: 3,
          averageRating: 3.8,
          totalReviews: 8,
          priceRange: { min: 90, max: 140, currency: 'BRL' },
          city: 'São Paulo', state: 'SP', country: 'BR',
          isVerified: false,
        },
      },
    ],
  },

  {
    name: 'Intermediário — estresse/ansiedade, YOGA+MEDITAÇÃO ONLINE',
    student: {
      id: 's3',
      fitnessGoals: ['reduzir estresse', 'bem-estar mental'],
      experienceLevel: ExperienceLevel.INTERMEDIATE,
      preferredModality: SessionModality.ONLINE,
      preferredSpecializations: [SpecializationType.YOGA, SpecializationType.MEDITATION],
    },
    pool: [
      {
        relevance: 2,
        candidate: {
          professionalId: 'e1-yoga-online',
          bio: 'Yoga Hatha e Yin para redução de estresse',
          areaSlugs: [SpecializationType.YOGA],
          modalities: [SessionModality.ONLINE],
          yearsExperience: 5,
          averageRating: 4.8,
          totalReviews: 40,
          priceRange: { min: 60, max: 100, currency: 'BRL' },
          city: 'Florianópolis', state: 'SC', country: 'BR',
          isVerified: true,
        },
      },
      {
        relevance: 2,
        candidate: {
          professionalId: 'e2-meditation-online',
          bio: 'Meditação mindfulness e técnicas de relaxamento',
          areaSlugs: [SpecializationType.MEDITATION],
          modalities: [SessionModality.ONLINE],
          yearsExperience: 4,
          averageRating: 4.5,
          totalReviews: 25,
          priceRange: { min: 50, max: 90, currency: 'BRL' },
          city: 'Rio de Janeiro', state: 'RJ', country: 'BR',
          isVerified: false,
        },
      },
      {
        relevance: 1,
        candidate: {
          professionalId: 'e3-pilates-online',
          bio: 'Pilates para corpo e mente',
          areaSlugs: [SpecializationType.PILATES],
          modalities: [SessionModality.ONLINE],
          yearsExperience: 3,
          averageRating: 4.0,
          totalReviews: 15,
          priceRange: { min: 70, max: 120, currency: 'BRL' },
          city: 'Campinas', state: 'SP', country: 'BR',
          isVerified: false,
        },
      },
      {
        relevance: 0,
        candidate: {
          professionalId: 'e4-pt-generico',
          bio: 'Personal trainer generalista online',
          areaSlugs: [SpecializationType.PERSONAL_TRAINING],
          modalities: [SessionModality.ONLINE],
          yearsExperience: 7,
          averageRating: 4.6,
          totalReviews: 30,
          priceRange: { min: 100, max: 180, currency: 'BRL' },
          city: 'Brasília', state: 'DF', country: 'BR',
          isVerified: false,
        },
      },
      {
        relevance: 0,
        candidate: {
          professionalId: 'e5-cycling-online',
          bio: 'Ciclismo indoor e HIIT',
          areaSlugs: [SpecializationType.CYCLING],
          modalities: [SessionModality.ONLINE],
          yearsExperience: 2,
          averageRating: 3.5,
          totalReviews: 5,
          priceRange: { min: 50, max: 80, currency: 'BRL' },
          city: 'Salvador', state: 'BA', country: 'BR',
          isVerified: false,
        },
      },
    ],
  },

  {
    name: 'Intermediário — condicionamento HÍBRIDO (R$80-160)',
    student: {
      id: 's4',
      fitnessGoals: ['condicionamento físico', 'emagrecimento'],
      experienceLevel: ExperienceLevel.INTERMEDIATE,
      preferredModality: SessionModality.HYBRID,
      preferredSpecializations: [
        SpecializationType.PERSONAL_TRAINING,
        SpecializationType.FUNCTIONAL_TRAINING,
      ],
      budgetRange: { min: 80, max: 160, currency: 'BRL' },
    },
    pool: [
      {
        relevance: 2,
        candidate: {
          professionalId: 'f1-pt-hybrid',
          bio: 'Personal trainer com atendimento híbrido',
          areaSlugs: [SpecializationType.PERSONAL_TRAINING, SpecializationType.FUNCTIONAL_TRAINING],
          modalities: [SessionModality.HYBRID],
          yearsExperience: 5,
          averageRating: 4.7,
          totalReviews: 28,
          priceRange: { min: 100, max: 140, currency: 'BRL' },
          city: 'São Paulo', state: 'SP', country: 'BR',
          isVerified: true,
        },
      },
      {
        relevance: 2,
        candidate: {
          professionalId: 'f2-pt-online-bom',
          bio: 'Personal trainer especialista em condicionamento',
          areaSlugs: [SpecializationType.PERSONAL_TRAINING],
          modalities: [SessionModality.ONLINE],
          yearsExperience: 4,
          averageRating: 4.4,
          totalReviews: 18,
          priceRange: { min: 90, max: 130, currency: 'BRL' },
          city: 'São Paulo', state: 'SP', country: 'BR',
          isVerified: false,
        },
      },
      {
        relevance: 1,
        candidate: {
          professionalId: 'f3-crossfit-online',
          bio: 'CrossFit e condicionamento de alta performance',
          areaSlugs: [SpecializationType.CROSSFIT],
          modalities: [SessionModality.ONLINE],
          yearsExperience: 3,
          averageRating: 4.2,
          totalReviews: 12,
          priceRange: { min: 85, max: 125, currency: 'BRL' },
          city: 'Curitiba', state: 'PR', country: 'BR',
          isVerified: false,
        },
      },
      {
        relevance: 0,
        candidate: {
          professionalId: 'f4-yoga-online',
          bio: 'Yoga e meditação',
          areaSlugs: [SpecializationType.YOGA],
          modalities: [SessionModality.ONLINE],
          yearsExperience: 6,
          averageRating: 4.9,
          totalReviews: 45,
          priceRange: { min: 70, max: 110, currency: 'BRL' },
          city: 'Recife', state: 'PE', country: 'BR',
          isVerified: true,
        },
      },
      {
        relevance: 0,
        candidate: {
          professionalId: 'f5-natacao-caro',
          bio: 'Natação competitiva e fitness aquático',
          areaSlugs: [SpecializationType.SWIMMING],
          modalities: [SessionModality.IN_PERSON],
          yearsExperience: 8,
          averageRating: 4.6,
          totalReviews: 22,
          priceRange: { min: 200, max: 300, currency: 'BRL' },
          city: 'São Paulo', state: 'SP', country: 'BR',
          isVerified: true,
        },
      },
    ],
  },
]

function precisionAtK(rankedIds: string[], labelMap: Map<string, number>, k: number): number {
  const topK = rankedIds.slice(0, k)
  return topK.filter((id) => (labelMap.get(id) ?? 0) >= 1).length / k
}

function dcgAtK(rankedIds: string[], labelMap: Map<string, number>, k: number): number {
  return rankedIds.slice(0, k).reduce((sum, id, i) => {
    return sum + (labelMap.get(id) ?? 0) / Math.log2(i + 2)
  }, 0)
}

function ndcgAtK(rankedIds: string[], labelMap: Map<string, number>, k: number): number {
  const idealIds = [...labelMap.keys()].sort((a, b) => (labelMap.get(b) ?? 0) - (labelMap.get(a) ?? 0))
  const idealDcg = dcgAtK(idealIds, labelMap, k)
  if (idealDcg === 0) return 1
  return dcgAtK(rankedIds, labelMap, k) / idealDcg
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function levelLabel(l: ExperienceLevel) {
  return { BEGINNER: 'Iniciante', INTERMEDIATE: 'Intermediário', ADVANCED: 'Avançado' }[l] ?? l
}

function modalityLabel(m: SessionModality) {
  return { ONLINE: 'Online', IN_PERSON: 'Presencial', HYBRID: 'Híbrido' }[m] ?? m
}

function relevanceBadge(r: number): string {
  if (r === 2) return '<span class="badge badge-ideal">Ideal</span>'
  if (r === 1) return '<span class="badge badge-ok">Aceitável</span>'
  return '<span class="badge badge-bad">Irrelevante</span>'
}

function metricColor(value: number): string {
  if (value >= 0.9) return '#16a34a'
  if (value >= 0.7) return '#ca8a04'
  return '#dc2626'
}

function generateHtml(results: ScenarioResult[], K: number, generatedAt: string): string {
  const avgP1   = results.reduce((s, r) => s + r.p1,   0) / results.length
  const avgPk   = results.reduce((s, r) => s + r.pk,   0) / results.length
  const avgNdcg = results.reduce((s, r) => s + r.ndcg, 0) / results.length

  const p1Data   = results.map((r) => +(r.p1   * 100).toFixed(1))
  const pkData   = results.map((r) => +(r.pk   * 100).toFixed(1))
  const ndcgData = results.map((r) => +(r.ndcg * 100).toFixed(1))

  const scoreCharts = results.map((r) => ({
    labels: r.ranking.map((row) => row.id),
    scores: r.ranking.map((row) => +(row.score * 100).toFixed(1)),
    colors: r.ranking.map((row) =>
      row.relevance === 2 ? 'rgba(22,163,74,0.85)'
      : row.relevance === 1 ? 'rgba(202,138,4,0.85)'
      : 'rgba(220,38,38,0.75)',
    ),
    borders: r.ranking.map((row) =>
      row.relevance === 2 ? '#15803d'
      : row.relevance === 1 ? '#b45309'
      : '#b91c1c',
    ),
  }))

  const scenarioCards = results.map((r, i) => {
    const s = r.student
    const p1Color   = metricColor(r.p1)
    const pkColor   = metricColor(r.pk)
    const ndcgColor = metricColor(r.ndcg)

    const tableRows = r.ranking.map((row) => `
      <tr class="rel-${row.relevance}">
        <td class="td-rank">#${row.pos}</td>
        <td class="td-score">
          <div class="score-pill">
            <div class="score-fill" style="width:${(row.score * 100).toFixed(0)}%"></div>
            <span class="score-text">${(row.score * 100).toFixed(1)}%</span>
          </div>
        </td>
        <td>${relevanceBadge(row.relevance)}</td>
        <td class="td-id">${esc(row.id)}</td>
        <td class="td-reasoning">${esc(row.reasoning)}</td>
      </tr>`).join('')

    const specsText = s.preferredSpecializations.length
      ? s.preferredSpecializations.join(', ')
      : '(sem preferência)'
    const budgetText = s.budgetRange
      ? `R$${s.budgetRange.min}–${s.budgetRange.max}`
      : '(sem restrição)'

    return `
    <div class="scenario-card" id="scenario-${i + 1}">
      <div class="scenario-header">
        <div class="scenario-title-row">
          <span class="scenario-number">C${i + 1}</span>
          <h3 class="scenario-title">${esc(r.name)}</h3>
        </div>
        <div class="scenario-metrics-row">
          <div class="metric-pill" style="border-color:${p1Color}">
            <span class="metric-pill-label">P@1</span>
            <span class="metric-pill-value" style="color:${p1Color}">${(r.p1 * 100).toFixed(0)}%</span>
          </div>
          <div class="metric-pill" style="border-color:${pkColor}">
            <span class="metric-pill-label">P@${K}</span>
            <span class="metric-pill-value" style="color:${pkColor}">${(r.pk * 100).toFixed(0)}%</span>
          </div>
          <div class="metric-pill" style="border-color:${ndcgColor}">
            <span class="metric-pill-label">NDCG@${K}</span>
            <span class="metric-pill-value" style="color:${ndcgColor}">${r.ndcg.toFixed(3)}</span>
          </div>
        </div>
      </div>

      <div class="scenario-body">
        <div class="student-profile">
          <h4 class="subsection-title">Perfil do Aluno</h4>
          <dl class="profile-dl">
            <dt>Objetivos</dt><dd>${esc(s.fitnessGoals.join(', '))}</dd>
            <dt>Nível</dt><dd>${levelLabel(s.experienceLevel)}</dd>
            <dt>Modalidade</dt><dd>${modalityLabel(s.preferredModality)}</dd>
            <dt>Especializações</dt><dd>${esc(specsText)}</dd>
            <dt>Orçamento</dt><dd>${budgetText}</dd>
          </dl>
        </div>

        <div class="chart-wrapper">
          <h4 class="subsection-title">Score por Candidato</h4>
          <div class="canvas-container">
            <canvas id="chart-scores-${i}"></canvas>
          </div>
        </div>

        <div class="ranking-section">
          <h4 class="subsection-title">Ranking Completo</h4>
          <div class="table-scroll">
            <table class="ranking-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Score</th>
                  <th>Relevância</th>
                  <th>ID do Candidato</th>
                  <th>Raciocínio da IA</th>
                </tr>
              </thead>
              <tbody>${tableRows}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>`
  }).join('\n')

  const scoreChartsJson = JSON.stringify(scoreCharts)

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Benchmark de Acurácia — FitConnect AI Matching</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"><\/script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background: #f8fafc;
      color: #1e293b;
      font-size: 14px;
      line-height: 1.6;
    }

    /* ── Layout ── */
    .page { max-width: 1100px; margin: 0 auto; padding: 32px 24px 64px; }

    /* ── Header ── */
    .report-header {
      background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
      color: white;
      border-radius: 16px;
      padding: 36px 40px;
      margin-bottom: 32px;
    }
    .report-header h1 { font-size: 24px; font-weight: 700; margin-bottom: 6px; }
    .report-header .subtitle { opacity: 0.8; font-size: 13px; }
    .report-meta {
      display: flex; gap: 24px; margin-top: 20px; flex-wrap: wrap;
    }
    .report-meta-item {
      background: rgba(255,255,255,0.15);
      border-radius: 8px; padding: 8px 14px;
      font-size: 12px; font-weight: 500;
    }
    .report-meta-item strong { display: block; font-size: 11px; opacity: 0.75; margin-bottom: 2px; }

    /* ── Section titles ── */
    .section-title {
      font-size: 18px; font-weight: 700;
      color: #0f172a; margin-bottom: 16px;
      padding-bottom: 8px; border-bottom: 2px solid #e2e8f0;
    }
    .subsection-title {
      font-size: 13px; font-weight: 600;
      color: #475569; text-transform: uppercase;
      letter-spacing: 0.05em; margin-bottom: 10px;
    }

    /* ── Summary metric cards ── */
    .summary-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
      margin-bottom: 32px;
    }
    @media (max-width: 640px) { .summary-grid { grid-template-columns: 1fr; } }

    .summary-card {
      background: white; border-radius: 12px;
      padding: 24px; text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05);
      border-top: 4px solid;
    }
    .summary-card.blue  { border-color: #3b82f6; }
    .summary-card.indigo { border-color: #6366f1; }
    .summary-card.violet { border-color: #8b5cf6; }

    .summary-value {
      font-size: 42px; font-weight: 800; line-height: 1;
      margin-bottom: 6px;
    }
    .summary-card.blue   .summary-value { color: #2563eb; }
    .summary-card.indigo .summary-value { color: #4f46e5; }
    .summary-card.violet .summary-value { color: #7c3aed; }

    .summary-label { font-size: 14px; font-weight: 600; color: #374151; }
    .summary-desc  { font-size: 12px; color: #9ca3af; margin-top: 4px; }

    /* ── Global comparison chart ── */
    .chart-card {
      background: white; border-radius: 12px; padding: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08); margin-bottom: 32px;
    }
    .chart-card .canvas-container { position: relative; height: 280px; }

    /* ── Scenario cards ── */
    .scenario-card {
      background: white; border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      margin-bottom: 28px; overflow: hidden;
    }
    .scenario-header {
      padding: 20px 24px 16px;
      border-bottom: 1px solid #f1f5f9;
      background: #fafafa;
    }
    .scenario-title-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .scenario-number {
      background: #2563eb; color: white;
      font-size: 12px; font-weight: 700;
      border-radius: 6px; padding: 3px 9px;
      flex-shrink: 0;
    }
    .scenario-title { font-size: 16px; font-weight: 600; color: #0f172a; }
    .scenario-metrics-row { display: flex; gap: 10px; flex-wrap: wrap; }

    .metric-pill {
      display: flex; align-items: center; gap: 6px;
      border: 1.5px solid; border-radius: 20px;
      padding: 4px 12px; background: white;
    }
    .metric-pill-label { font-size: 11px; color: #94a3b8; font-weight: 500; }
    .metric-pill-value { font-size: 13px; font-weight: 700; }

    .scenario-body { padding: 20px 24px; }

    /* ── Student profile ── */
    .profile-dl {
      display: grid; grid-template-columns: 120px 1fr; gap: 6px 12px;
      background: #f8fafc; border-radius: 8px; padding: 14px 16px;
      margin-bottom: 20px;
    }
    .profile-dl dt { font-weight: 600; color: #64748b; font-size: 12px; }
    .profile-dl dd { color: #1e293b; font-size: 13px; }

    /* ── Score chart ── */
    .chart-wrapper { margin-bottom: 20px; }
    .chart-wrapper .canvas-container { position: relative; height: 220px; }

    /* ── Ranking table ── */
    .table-scroll { overflow-x: auto; }
    .ranking-table {
      width: 100%; border-collapse: collapse;
      font-size: 13px;
    }
    .ranking-table th {
      background: #f1f5f9; text-align: left;
      padding: 10px 12px; font-weight: 600;
      color: #475569; font-size: 11px;
      text-transform: uppercase; letter-spacing: 0.04em;
      border-bottom: 2px solid #e2e8f0;
    }
    .ranking-table td {
      padding: 10px 12px; border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }
    .ranking-table tr:last-child td { border-bottom: none; }
    .ranking-table tr.rel-2 { background: #f0fdf4; }
    .ranking-table tr.rel-1 { background: #fffbeb; }
    .ranking-table tr.rel-0 { background: #fff7f7; }

    .td-rank { font-weight: 700; color: #94a3b8; width: 36px; }
    .td-id   { font-family: 'Courier New', monospace; font-size: 12px; color: #475569; }
    .td-reasoning { color: #374151; max-width: 340px; font-size: 12px; }

    .score-pill {
      position: relative; width: 100px; height: 22px;
      background: #e2e8f0; border-radius: 4px; overflow: hidden;
    }
    .score-fill {
      position: absolute; top: 0; left: 0; height: 100%;
      background: #3b82f6; opacity: 0.6;
    }
    .score-text {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: #1e293b;
    }

    .badge {
      display: inline-block; border-radius: 12px;
      padding: 2px 10px; font-size: 11px; font-weight: 600;
    }
    .badge-ideal { background: #dcfce7; color: #166534; }
    .badge-ok    { background: #fef9c3; color: #854d0e; }
    .badge-bad   { background: #fee2e2; color: #991b1b; }

    .legend-card {
      background: white; border-radius: 12px; padding: 20px 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08); margin-bottom: 32px;
    }
    .legend-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
    .legend-item { display: flex; align-items: flex-start; gap: 10px; }
    .legend-icon { flex-shrink: 0; width: 20px; height: 20px; border-radius: 4px; margin-top: 2px; }
    .legend-text { font-size: 12px; color: #374151; }
    .legend-text strong { display: block; color: #0f172a; }

    .report-footer {
      text-align: center; color: #94a3b8; font-size: 12px;
      margin-top: 48px; padding-top: 24px;
      border-top: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
<div class="page">

  <header class="report-header">
    <h1>Benchmark de Acurácia — AI Matching</h1>
    <p class="subtitle">Avaliação da qualidade de recomendação de professores para alunos (FitConnect)</p>
    <div class="report-meta">
      <div class="report-meta-item"><strong>Adapter</strong>HeuristicMatchingAdapter v1</div>
      <div class="report-meta-item"><strong>Cenários</strong>${results.length} perfis de aluno</div>
      <div class="report-meta-item"><strong>Métrica K</strong>K = ${K}</div>
      <div class="report-meta-item"><strong>Gerado em</strong>${esc(generatedAt)}</div>
    </div>
  </header>

  <h2 class="section-title">Resultado Geral</h2>
  <div class="summary-grid">
    <div class="summary-card blue">
      <div class="summary-value">${(avgP1 * 100).toFixed(0)}%</div>
      <div class="summary-label">P@1 — Precisão no 1º</div>
      <div class="summary-desc">O melhor resultado é relevante?</div>
    </div>
    <div class="summary-card indigo">
      <div class="summary-value">${(avgPk * 100).toFixed(0)}%</div>
      <div class="summary-label">P@${K} — Precisão no Top-${K}</div>
      <div class="summary-desc">Quantos dos ${K} primeiros são úteis?</div>
    </div>
    <div class="summary-card violet">
      <div class="summary-value">${avgNdcg.toFixed(3)}</div>
      <div class="summary-label">NDCG@${K} — Qualidade do Ranking</div>
      <div class="summary-desc">Proximidade com ranking ideal (0–1)</div>
    </div>
  </div>

  <div class="legend-card">
    <h2 class="section-title" style="margin-bottom:14px">Legenda de Relevância</h2>
    <div class="legend-grid">
      <div class="legend-item">
        <div class="legend-icon" style="background:#dcfce7; border: 2px solid #16a34a"></div>
        <div class="legend-text"><strong>Ideal (relevância 2)</strong>Match perfeito para o perfil do aluno — especialização, modalidade, orçamento e experiência alinhados.</div>
      </div>
      <div class="legend-item">
        <div class="legend-icon" style="background:#fef9c3; border: 2px solid #ca8a04"></div>
        <div class="legend-text"><strong>Aceitável (relevância 1)</strong>Útil, mas com pelo menos uma dimensão fora do ideal (ex.: modalidade diferente ou especialização adjacente).</div>
      </div>
      <div class="legend-item">
        <div class="legend-icon" style="background:#fee2e2; border: 2px solid #dc2626"></div>
        <div class="legend-text"><strong>Irrelevante (relevância 0)</strong>Não atende ao perfil do aluno — especialização incompatível, orçamento fora da faixa ou experiência insuficiente.</div>
      </div>
      <div class="legend-item">
        <div class="legend-icon" style="background: linear-gradient(90deg,#3b82f6,#8b5cf6); border: none"></div>
        <div class="legend-text"><strong>NDCG (Normalized DCG)</strong>Penaliza resultados irrelevantes em posições altas do ranking. Valor ideal = 1.000.</div>
      </div>
    </div>
  </div>

  <h2 class="section-title">Comparação entre Cenários</h2>
  <div class="chart-card">
    <div class="canvas-container">
      <canvas id="chart-comparison"></canvas>
    </div>
  </div>

  <h2 class="section-title">Detalhamento por Cenário</h2>
  ${scenarioCards}

  <footer class="report-footer">
    Gerado por <strong>scripts/benchmark-matching.ts</strong> · FitConnect TCC &nbsp;·&nbsp; ${esc(generatedAt)}
  </footer>
</div>

<script>
const scoreChartsData = ${scoreChartsJson};

new Chart(document.getElementById('chart-comparison'), {
  type: 'bar',
  data: {
    labels: ${JSON.stringify(results.map((r, i) => `C${i + 1}: ${r.name.split('—')[0].trim()}`))},
    datasets: [
      {
        label: 'P@1 (%)',
        data: ${JSON.stringify(p1Data)},
        backgroundColor: 'rgba(59,130,246,0.75)',
        borderColor: '#2563eb',
        borderWidth: 1.5,
        borderRadius: 4,
      },
      {
        label: 'P@${K} (%)',
        data: ${JSON.stringify(pkData)},
        backgroundColor: 'rgba(99,102,241,0.75)',
        borderColor: '#4f46e5',
        borderWidth: 1.5,
        borderRadius: 4,
      },
      {
        label: 'NDCG@${K} (%)',
        data: ${JSON.stringify(ndcgData)},
        backgroundColor: 'rgba(139,92,246,0.75)',
        borderColor: '#7c3aed',
        borderWidth: 1.5,
        borderRadius: 4,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => ' ' + ctx.dataset.label + ': ' + ctx.parsed.y + '%',
        },
      },
    },
    scales: {
      y: {
        min: 0, max: 110,
        ticks: { callback: (v) => v + '%' },
        grid: { color: '#f1f5f9' },
      },
      x: { grid: { display: false } },
    },
  },
});

scoreChartsData.forEach((data, i) => {
  const canvas = document.getElementById('chart-scores-' + i);
  if (!canvas) return;
  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Score (%)',
        data: data.scores,
        backgroundColor: data.colors,
        borderColor: data.borders,
        borderWidth: 1.5,
        borderRadius: 4,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ' Score: ' + ctx.parsed.x + '%',
          },
        },
      },
      scales: {
        x: {
          min: 0, max: 100,
          ticks: { callback: (v) => v + '%' },
          grid: { color: '#f1f5f9' },
        },
        y: { grid: { display: false } },
      },
    },
  });
});
<\/script>
</body>
</html>`
}

async function run() {
  const adapter = new HeuristicMatchingAdapter()
  const K = 3
  const results: ScenarioResult[] = []

  for (const scenario of scenarios) {
    const candidates = scenario.pool.map((p) => p.candidate)
    const labelMap = new Map(scenario.pool.map((p) => [p.candidate.professionalId, p.relevance]))

    const matches = await adapter.findMatches({
      student: scenario.student,
      candidates,
      maxResults: candidates.length,
    })

    const rankedIds = matches.map((m) => m.professionalId)
    results.push({
      name: scenario.name,
      student: scenario.student,
      p1:   precisionAtK(rankedIds, labelMap, 1),
      pk:   precisionAtK(rankedIds, labelMap, K),
      ndcg: ndcgAtK(rankedIds, labelMap, K),
      ranking: matches.map((m, i) => ({
        pos:       i + 1,
        id:        m.professionalId,
        score:     m.score,
        relevance: labelMap.get(m.professionalId) ?? 0,
        reasoning: m.reasoning,
      })),
    })
  }

  const now = new Date()
  const ts = now.toISOString().slice(0, 16).replace('T', '_').replace(':', '-')
  const generatedAt = now.toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })

  const reportsDir = join(process.cwd(), 'reports')
  mkdirSync(reportsDir, { recursive: true })

  const outPath = join(reportsDir, `benchmark-${ts}.html`)
  writeFileSync(outPath, generateHtml(results, K, generatedAt), 'utf-8')

  const avgP1   = results.reduce((s, r) => s + r.p1,   0) / results.length
  const avgPk   = results.reduce((s, r) => s + r.pk,   0) / results.length
  const avgNdcg = results.reduce((s, r) => s + r.ndcg, 0) / results.length

  console.log('\nResultados:')
  for (const r of results) {
    console.log(`  ${r.name}`)
    console.log(`    P@1=${(r.p1*100).toFixed(0)}%  P@${K}=${(r.pk*100).toFixed(0)}%  NDCG@${K}=${r.ndcg.toFixed(3)}`)
  }
  console.log(`\nMédia: P@1=${(avgP1*100).toFixed(0)}%  P@${K}=${(avgPk*100).toFixed(0)}%  NDCG@${K}=${avgNdcg.toFixed(3)}`)
  console.log(`\nRelatório salvo em: ${outPath}`)

  try {
    execSync(`open "${outPath}"`)
  } catch {
    // not macOS or no GUI — silently skip
  }
}

run().catch(console.error)
