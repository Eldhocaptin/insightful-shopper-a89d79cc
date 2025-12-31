import React, { createContext, useContext, useState, useCallback } from 'react';
import { Product, ProductAnalytics, ViabilityScore } from '@/types';

// Import product images
import deskLampImg from '@/assets/products/desk-lamp.jpg';
import wristRestImg from '@/assets/products/wrist-rest.jpg';
import phoneStandImg from '@/assets/products/phone-stand.jpg';
import wirelessChargerImg from '@/assets/products/wireless-charger.jpg';
import monitorRiserImg from '@/assets/products/monitor-riser.jpg';
import cableKitImg from '@/assets/products/cable-kit.jpg';

// Demo products for initial state
const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Minimalist Desk Lamp',
    description: 'Sleek, adjustable LED desk lamp with touch controls and USB charging port. Perfect for modern workspaces.',
    price: 49.99,
    originalPrice: 79.99,
    images: [deskLampImg],
    category: 'Home Office',
    isActive: true,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Ergonomic Wrist Rest',
    description: 'Memory foam wrist rest with cooling gel layer. Reduces strain during long typing sessions.',
    price: 24.99,
    images: [wristRestImg],
    category: 'Home Office',
    isActive: true,
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    name: 'Portable Phone Stand',
    description: 'Adjustable aluminum phone stand. Folds flat for travel. Compatible with all smartphones and tablets.',
    price: 19.99,
    originalPrice: 29.99,
    images: [phoneStandImg],
    category: 'Tech Accessories',
    isActive: true,
    createdAt: new Date('2024-02-01'),
  },
  {
    id: '4',
    name: 'Wireless Charging Pad',
    description: 'Fast 15W wireless charger with LED indicator. Slim profile fits any desk setup.',
    price: 34.99,
    images: [wirelessChargerImg],
    category: 'Tech Accessories',
    isActive: true,
    createdAt: new Date('2024-02-10'),
  },
  {
    id: '5',
    name: 'Bamboo Monitor Riser',
    description: 'Sustainable bamboo monitor stand with storage drawer. Elevates screen to eye level.',
    price: 44.99,
    originalPrice: 59.99,
    images: [monitorRiserImg],
    category: 'Home Office',
    isActive: true,
    createdAt: new Date('2024-02-15'),
  },
  {
    id: '6',
    name: 'Cable Management Kit',
    description: 'Complete cable organization set with clips, sleeves, and velcro ties. Keep your desk clutter-free.',
    price: 14.99,
    images: [cableKitImg],
    category: 'Home Office',
    isActive: true,
    createdAt: new Date('2024-02-20'),
  },
];

// Demo analytics data
const generateAnalytics = (productId: string): ProductAnalytics => {
  const impressions = Math.floor(Math.random() * 5000) + 500;
  const clicks = Math.floor(impressions * (Math.random() * 0.15 + 0.02));
  const addToCartCount = Math.floor(clicks * (Math.random() * 0.3 + 0.05));
  const checkoutIntents = Math.floor(addToCartCount * (Math.random() * 0.5 + 0.1));

  return {
    productId,
    impressions,
    clicks,
    ctr: (clicks / impressions) * 100,
    avgScrollDepth: Math.floor(Math.random() * 40) + 40,
    avgTimeOnPage: Math.floor(Math.random() * 120) + 30,
    addToCartCount,
    addToCartRate: (addToCartCount / clicks) * 100,
    checkoutIntents,
    checkoutRate: (checkoutIntents / addToCartCount) * 100,
    dropOffPoints: [
      { stage: 'view', count: impressions, percentage: 100 },
      { stage: 'scroll', count: Math.floor(impressions * 0.6), percentage: 60 },
      { stage: 'addToCart', count: addToCartCount, percentage: (addToCartCount / impressions) * 100 },
      { stage: 'checkout', count: checkoutIntents, percentage: (checkoutIntents / impressions) * 100 },
    ],
  };
};

const calculateViabilityScore = (analytics: ProductAnalytics): ViabilityScore => {
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
    explanation = `Low engagement metrics suggest weak product-market fit. ${analytics.ctr.toFixed(1)}% CTR and ${analytics.avgTimeOnPage}s avg time indicate lack of interest.`;
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

interface ProductContextType {
  products: Product[];
  analytics: Map<string, ProductAnalytics>;
  viabilityScores: Map<string, ViabilityScore>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleProductActive: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
  getAnalytics: (id: string) => ProductAnalytics | undefined;
  getViabilityScore: (id: string) => ViabilityScore | undefined;
  trackEvent: (productId: string, eventType: string, value?: number) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [analytics] = useState<Map<string, ProductAnalytics>>(() => {
    const map = new Map();
    initialProducts.forEach(p => map.set(p.id, generateAnalytics(p.id)));
    return map;
  });
  const [viabilityScores] = useState<Map<string, ViabilityScore>>(() => {
    const map = new Map();
    initialProducts.forEach(p => {
      const productAnalytics = generateAnalytics(p.id);
      map.set(p.id, calculateViabilityScore(productAnalytics));
    });
    return map;
  });

  const addProduct = useCallback((product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setProducts(prev => [...prev, newProduct]);
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const toggleProductActive = useCallback((id: string) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  }, []);

  const getProduct = useCallback((id: string) => products.find(p => p.id === id), [products]);
  const getAnalytics = useCallback((id: string) => analytics.get(id), [analytics]);
  const getViabilityScore = useCallback((id: string) => viabilityScores.get(id), [viabilityScores]);

  const trackEvent = useCallback((productId: string, eventType: string, value?: number) => {
    // In production, this would send to analytics backend
    console.log('Track event:', { productId, eventType, value, timestamp: new Date() });
  }, []);

  return (
    <ProductContext.Provider
      value={{
        products,
        analytics,
        viabilityScores,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductActive,
        getProduct,
        getAnalytics,
        getViabilityScore,
        trackEvent,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
