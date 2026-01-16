// ============================================
// Shared Types - GiftGhost
// ============================================

export interface GiftRecommendation {
    item: string;
    reason: string;
    buy_link: string;
    price_range?: string;
}

export interface InsightResult {
    persona: string;
    pain_point: string;
    obsession: string;
    trace_id?: string;
    gift_recommendation: GiftRecommendation;
}
