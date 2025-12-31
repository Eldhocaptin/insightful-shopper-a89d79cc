import { DBProductAnalytics } from './useProductsDB';

export interface ViabilityScore {
  productId: string;
  score: number;
  recommendation: 'kill' | 'test' | 'scale';
  breakdown: {
    ctrScore: number;
    addToCartScore: number;
    checkoutScore: number;
    engagementScore: number;
    priceToleranceScore: number;
  };
  explanation: string;
}

export interface ComputedAnalytics {
  productId: string;
  impressions: number;
  clicks: number;
  ctr: number;
  avgScrollDepth: number;
  avgTimeOnPage: number;
  addToCartCount: number;
  addToCartRate: number;
  checkoutIntents: number;
  checkoutRate: number;
}

export const computeAnalytics = (analytics: DBProductAnalytics): ComputedAnalytics => {
  const impressions = analytics.impressions || 0;
  const clicks = analytics.clicks || 0;
  const addToCartCount = analytics.add_to_cart_count || 0;
  const checkoutIntents = analytics.checkout_intents || 0;
  const viewCount = analytics.view_count || 1;

  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const addToCartRate = clicks > 0 ? (addToCartCount / clicks) * 100 : 0;
  const checkoutRate = addToCartCount > 0 ? (checkoutIntents / addToCartCount) * 100 : 0;
  const avgTimeOnPage = analytics.total_time_on_page / viewCount;
  const avgScrollDepth = analytics.total_scroll_depth / viewCount;

  return {
    productId: analytics.product_id,
    impressions,
    clicks,
    ctr,
    avgScrollDepth,
    avgTimeOnPage,
    addToCartCount,
    addToCartRate,
    checkoutIntents,
    checkoutRate,
  };
};

export const calculateViabilityScore = (analytics: ComputedAnalytics): ViabilityScore => {
  const ctrScore = Math.min(analytics.ctr * 10, 100);
  const addToCartScore = Math.min(analytics.addToCartRate * 5, 100);
  const checkoutScore = Math.min(analytics.checkoutRate * 2, 100);
  const engagementScore = Math.min((analytics.avgScrollDepth + analytics.avgTimeOnPage / 2), 100);
  const priceToleranceScore = Math.min(analytics.checkoutRate * 3, 100);

  const totalScore = (
    ctrScore * 0.2 +
    addToCartScore * 0.25 +
    checkoutScore * 0.3 +
    engagementScore * 0.15 +
    priceToleranceScore * 0.1
  );

  let recommendation: 'kill' | 'test' | 'scale';
  let explanation: string;

  if (totalScore >= 65) {
    recommendation = 'scale';
    explanation = `Strong performance across all metrics. ${analytics.ctr.toFixed(1)}% CTR and ${analytics.checkoutRate.toFixed(1)}% checkout rate indicate high purchase intent. Ready for real fulfillment.`;
  } else if (totalScore >= 35) {
    recommendation = 'test';
    explanation = `Mixed signals require optimization. Consider A/B testing price points or improving product images. Current ${analytics.addToCartRate.toFixed(1)}% add-to-cart rate shows interest.`;
  } else {
    recommendation = 'kill';
    explanation = `Low engagement metrics suggest weak product-market fit. ${analytics.ctr.toFixed(1)}% CTR and ${analytics.avgTimeOnPage.toFixed(0)}s avg time indicate lack of interest.`;
  }

  return {
    productId: analytics.productId,
    score: Math.round(totalScore),
    recommendation,
    breakdown: {
      ctrScore: Math.round(ctrScore),
      addToCartScore: Math.round(addToCartScore),
      checkoutScore: Math.round(checkoutScore),
      engagementScore: Math.round(engagementScore),
      priceToleranceScore: Math.round(priceToleranceScore),
    },
    explanation,
  };
};
