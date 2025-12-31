import { useProducts } from '@/contexts/ProductContext';
import { useState } from 'react';
import ViabilityScoreRing from '@/components/admin/ViabilityScoreRing';
import ViabilityBadge from '@/components/admin/ViabilityBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Eye, MousePointer, ShoppingCart, CreditCard, Clock, ArrowDown } from 'lucide-react';

const AdminAnalytics = () => {
  const { products, analytics, viabilityScores } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<string>(products[0]?.id || '');

  const product = products.find(p => p.id === selectedProduct);
  const productAnalytics = analytics.get(selectedProduct);
  const score = viabilityScores.get(selectedProduct);

  if (!product || !productAnalytics || !score) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Analytics</h1>
        <p className="text-muted-foreground">No products to analyze. Add some products first.</p>
      </div>
    );
  }

  const metrics = [
    {
      label: 'Impressions',
      value: productAnalytics.impressions.toLocaleString(),
      icon: Eye,
      color: 'text-info',
    },
    {
      label: 'Clicks',
      value: productAnalytics.clicks.toLocaleString(),
      icon: MousePointer,
      color: 'text-primary',
    },
    {
      label: 'Add to Cart',
      value: productAnalytics.addToCartCount.toLocaleString(),
      icon: ShoppingCart,
      color: 'text-score-test',
    },
    {
      label: 'Checkout Intent',
      value: productAnalytics.checkoutIntents.toLocaleString(),
      icon: CreditCard,
      color: 'text-score-scale',
    },
  ];

  const funnelStages = [
    { stage: 'View', value: productAnalytics.impressions, percentage: 100 },
    { stage: 'Click', value: productAnalytics.clicks, percentage: productAnalytics.ctr },
    { stage: 'Add to Cart', value: productAnalytics.addToCartCount, percentage: (productAnalytics.addToCartCount / productAnalytics.impressions) * 100 },
    { stage: 'Checkout', value: productAnalytics.checkoutIntents, percentage: (productAnalytics.checkoutIntents / productAnalytics.impressions) * 100 },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Analytics</h1>
          <p className="text-muted-foreground">Deep dive into product performance.</p>
        </div>
        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select product" />
          </SelectTrigger>
          <SelectContent>
            {products.map(p => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Viability Score Card */}
      <Card className="p-8 mb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
          <ViabilityScoreRing score={score.score} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-2xl font-bold">{product.name}</h2>
              <ViabilityBadge recommendation={score.recommendation} />
            </div>
            <p className="text-muted-foreground leading-relaxed max-w-2xl">
              {score.explanation}
            </p>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-8 pt-8 border-t border-border">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">CTR Score</p>
            <div className="flex items-center gap-2">
              <Progress value={score.breakdown.ctrScore} className="h-2 flex-1" />
              <span className="text-sm font-medium">{score.breakdown.ctrScore}</span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Add to Cart</p>
            <div className="flex items-center gap-2">
              <Progress value={score.breakdown.addToCartScore} className="h-2 flex-1" />
              <span className="text-sm font-medium">{score.breakdown.addToCartScore}</span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Checkout</p>
            <div className="flex items-center gap-2">
              <Progress value={score.breakdown.checkoutScore} className="h-2 flex-1" />
              <span className="text-sm font-medium">{score.breakdown.checkoutScore}</span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Engagement</p>
            <div className="flex items-center gap-2">
              <Progress value={score.breakdown.engagementScore} className="h-2 flex-1" />
              <span className="text-sm font-medium">{score.breakdown.engagementScore}</span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Price Tolerance</p>
            <div className="flex items-center gap-2">
              <Progress value={score.breakdown.priceToleranceScore} className="h-2 flex-1" />
              <span className="text-sm font-medium">{score.breakdown.priceToleranceScore}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map(metric => (
          <Card key={metric.label} className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </div>
            <p className="text-2xl font-bold">{metric.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Conversion Funnel */}
        <Card className="p-6">
          <h3 className="font-semibold mb-6">Conversion Funnel</h3>
          <div className="space-y-4">
            {funnelStages.map((stage, index) => (
              <div key={stage.stage}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium">{stage.stage}</span>
                  <span className="text-muted-foreground">
                    {stage.value.toLocaleString()} ({stage.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="relative">
                  <div
                    className="h-10 rounded-lg bg-primary/80 transition-all duration-500"
                    style={{ width: `${Math.max(stage.percentage, 5)}%` }}
                  />
                </div>
                {index < funnelStages.length - 1 && (
                  <div className="flex items-center justify-center py-2 text-muted-foreground">
                    <ArrowDown className="h-4 w-4" />
                    <span className="text-xs ml-1">
                      -{((1 - funnelStages[index + 1].percentage / stage.percentage) * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Engagement Metrics */}
        <Card className="p-6">
          <h3 className="font-semibold mb-6">Engagement Metrics</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Avg. Time on Page</span>
                </div>
                <span className="font-semibold">{productAnalytics.avgTimeOnPage}s</span>
              </div>
              <Progress value={(productAnalytics.avgTimeOnPage / 180) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">Target: 180s for high engagement</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowDown className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Avg. Scroll Depth</span>
                </div>
                <span className="font-semibold">{productAnalytics.avgScrollDepth}%</span>
              </div>
              <Progress value={productAnalytics.avgScrollDepth} className="h-2" />
              <p className="text-xs text-muted-foreground">Target: 75%+ for good engagement</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Click-through Rate</span>
                <span className="font-semibold">{productAnalytics.ctr.toFixed(2)}%</span>
              </div>
              <Progress value={productAnalytics.ctr * 10} className="h-2" />
              <p className="text-xs text-muted-foreground">Industry avg: 2-3%</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Add to Cart Rate</span>
                <span className="font-semibold">{productAnalytics.addToCartRate.toFixed(2)}%</span>
              </div>
              <Progress value={productAnalytics.addToCartRate * 5} className="h-2" />
              <p className="text-xs text-muted-foreground">Good: 8-12%</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
