import { IProfessionalRepository } from '../../ports/output/IProfessionalRepository';
import { IProfileViewRepository } from '../../ports/output/IProfileViewRepository';
import { IMatchRepository } from '../../ports/output/IMatchRepository';
import { ISessionRepository } from '../../ports/output/ISessionRepository';
import { IBoostRepository } from '../../ports/output/IBoostRepository';
import { PrismaStudentFavoriteRepository } from '../../../infrastructure/db/repositories/PrismaStudentFavoriteRepository';
import { ProfessionalInsightsDTO } from '../../dtos/professional/ProfessionalInsightsDTO';
import { ProfessionalNotFoundError } from '../../../domain/errors/ProfessionalErrors';

export interface GetProfessionalInsightsInput {
  professionalUserId: string;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function pct(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10; // one decimal place
}

export class GetProfessionalInsightsUseCase {
  constructor(
    private readonly professionalRepo: IProfessionalRepository,
    private readonly profileViewRepo: IProfileViewRepository,
    private readonly studentFavoriteRepo: PrismaStudentFavoriteRepository,
    private readonly matchRepo: IMatchRepository,
    private readonly sessionRepo: ISessionRepository,
    private readonly boostRepo: IBoostRepository,
  ) {}

  async execute(input: GetProfessionalInsightsInput): Promise<ProfessionalInsightsDTO> {
    const professional = await this.professionalRepo.findByUserId(input.professionalUserId);
    if (!professional) throw new ProfessionalNotFoundError(input.professionalUserId);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - THIRTY_DAYS_MS);

    const activeBoost = await this.boostRepo.findActiveByProfessionalId(professional.id);
    const isBoostActive = activeBoost != null;
    const activeTier = activeBoost?.tier ?? null;

    const totalViews = await this.profileViewRepo.countTotal(professional.id);
    const viewsLast30Days = await this.profileViewRepo.countInRange(professional.id, thirtyDaysAgo, now);

    const base = {
      isBoostActive,
      activeBoostTier: activeTier,
      totalViews,
      viewsLast30Days,
    };

    if (!activeBoost) {
      return {
        ...base,
        tierUnlocked: 'FREE',
        funnel: null,
        conversionRates: null,
        platformComparison: null,
        boostEffectiveness: null,
      };
    }

    const [favorites, matches, sessions] = await Promise.all([
      this.studentFavoriteRepo.countReceivedByProfessional(professional.id),
      this.matchRepo.countReceivedByProfessional(professional.id),
      this.sessionRepo.findByProfessionalId(professional.id),
    ]);
    const bookings = sessions.length;
    const funnel = { views: totalViews, favorites, matches, bookings };

    if (activeBoost.tier === 'BASICO') {
      return {
        ...base,
        tierUnlocked: 'BASICO',
        funnel,
        conversionRates: null,
        platformComparison: null,
        boostEffectiveness: null,
      };
    }

    const conversionRates = {
      viewToFavoritePct: pct(favorites, totalViews),
      favoriteToMatchPct: pct(matches, favorites),
      matchToBookingPct: pct(bookings, matches),
      overallViewToBookingPct: pct(bookings, totalViews),
    };

    if (activeBoost.tier === 'PLUS') {
      return {
        ...base,
        tierUnlocked: 'PLUS',
        funnel,
        conversionRates,
        platformComparison: null,
        boostEffectiveness: null,
      };
    }

    // PREMIUM — platform comparison + boost effectiveness
    const [activeProfessionalsCount, platformViewsLast30Days] = await Promise.all([
      this.professionalRepo.countActive(),
      this.profileViewRepo.countAllInRange(thirtyDaysAgo, now),
    ]);
    const platformAvg = activeProfessionalsCount > 0 ? platformViewsLast30Days / activeProfessionalsCount : 0;
    const percentileHint: 'above' | 'around' | 'below' =
      viewsLast30Days > platformAvg * 1.15 ? 'above' : viewsLast30Days < platformAvg * 0.85 ? 'below' : 'around';
    const platformComparison = {
      yourViewsLast30Days: viewsLast30Days,
      platformAvgViewsLast30Days: Math.round(platformAvg * 10) / 10,
      percentileHint,
      sampleSize: activeProfessionalsCount,
    };

    // boostStartedAt approximates checkout-creation time, not the (seconds-later)
    // webhook activation moment — an acceptable approximation at this scale.
    const boostStartedAt = activeBoost.createdAt;
    const windowLengthMs = Math.max(now.getTime() - boostStartedAt.getTime(), 0);
    const beforeWindowStart = new Date(boostStartedAt.getTime() - windowLengthMs);

    const [viewsBeforeBoost, viewsDuringBoost, matchesBeforeBoost, matchesDuringBoost] = await Promise.all([
      this.profileViewRepo.countInRange(professional.id, beforeWindowStart, boostStartedAt),
      this.profileViewRepo.countInRange(professional.id, boostStartedAt, now),
      this.matchRepo.countReceivedByProfessionalInRange(professional.id, beforeWindowStart, boostStartedAt),
      this.matchRepo.countReceivedByProfessionalInRange(professional.id, boostStartedAt, now),
    ]);

    return {
      ...base,
      tierUnlocked: 'PREMIUM',
      funnel,
      conversionRates,
      platformComparison,
      boostEffectiveness: {
        boostTier: activeBoost.tier,
        boostStartedAt,
        boostEndsAt: activeBoost.expiresAt,
        viewsBeforeBoost,
        viewsDuringBoost,
        matchesBeforeBoost,
        matchesDuringBoost,
      },
    };
  }
}
