export interface ProfessionalInsightsDTO {
  tierUnlocked: 'FREE' | 'BASICO' | 'PLUS' | 'PREMIUM';
  isBoostActive: boolean;
  activeBoostTier: 'BASICO' | 'PLUS' | 'PREMIUM' | null;

  totalViews: number;
  viewsLast30Days: number;

  funnel: {
    views: number;
    favorites: number;
    matches: number;
    bookings: number;
  } | null;

  conversionRates: {
    viewToFavoritePct: number;
    favoriteToMatchPct: number;
    matchToBookingPct: number;
    overallViewToBookingPct: number;
  } | null;

  platformComparison: {
    yourViewsLast30Days: number;
    platformAvgViewsLast30Days: number;
    percentileHint: 'above' | 'around' | 'below';
    sampleSize: number;
  } | null;

  boostEffectiveness: {
    boostTier: 'BASICO' | 'PLUS' | 'PREMIUM';
    boostStartedAt: Date;
    boostEndsAt: Date | null;
    viewsBeforeBoost: number;
    viewsDuringBoost: number;
    matchesBeforeBoost: number;
    matchesDuringBoost: number;
  } | null;
}
