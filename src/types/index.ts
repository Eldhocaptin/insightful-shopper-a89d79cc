export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  isActive: boolean;
  variants?: ProductVariant[];
  createdAt: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  price: number;
  trafficSplit: number; // percentage 0-100
}

export interface ProductAnalytics {
  productId: string;
  impressions: number;
  clicks: number;
  ctr: number;
  avgScrollDepth: number;
  avgTimeOnPage: number; // seconds
  addToCartCount: number;
  addToCartRate: number;
  checkoutIntents: number;
  checkoutRate: number;
  dropOffPoints: DropOffPoint[];
}

export interface DropOffPoint {
  stage: 'view' | 'scroll' | 'addToCart' | 'checkout';
  count: number;
  percentage: number;
}

export interface ViabilityScore {
  productId: string;
  score: number; // 0-100
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

export interface CartItem {
  product: Product;
  quantity: number;
  variantId?: string;
}

export interface TrackingEvent {
  id: string;
  productId: string;
  eventType: 'impression' | 'click' | 'scroll' | 'timeOnPage' | 'addToCart' | 'removeFromCart' | 'checkoutIntent';
  value?: number;
  timestamp: Date;
  sessionId: string;
}
