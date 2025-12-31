import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Flame, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useProducts } from '@/hooks/useProductsDB';
import { useInterestScores, useInterestOverview, useCalculateInterestScores } from '@/hooks/useInterestScores';
import InterestOverviewCards from '@/components/admin/InterestOverviewCards';
import ProductInterestTable from '@/components/admin/ProductInterestTable';
import InterestInsightsPanel from '@/components/admin/InterestInsightsPanel';
import ProductInterestDetail from '@/components/admin/ProductInterestDetail';

const AdminCustomerInterest = () => {
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: scores = [], isLoading: scoresLoading } = useInterestScores();
  const { data: overview = { hot: 0, warm: 0, cool: 0, cold: 0 } } = useInterestOverview();
  const calculateScores = useCalculateInterestScores();

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const isLoading = productsLoading || scoresLoading;

  const selectedScore = scores.find((s) => s.product_id === selectedProductId) || null;
  const selectedProduct = products.find((p) => p.id === selectedProductId) || null;

  const handleRefresh = () => {
    calculateScores.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Customer Interest | Admin</title>
      </Helmet>

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Flame className="h-8 w-8 text-orange-500" />
              Customer Interest
            </h1>
            <p className="text-muted-foreground mt-1">
              See which products are generating the most interest from your customers
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-[300px]">
                <p className="font-medium mb-1">How it works</p>
                <p className="text-sm">
                  We track customer behavior like hover time, return visits, add-to-cart actions, 
                  and more to calculate an interest score for each product. Higher scores mean 
                  more likely to convert!
                </p>
              </TooltipContent>
            </Tooltip>
            <Button 
              onClick={handleRefresh} 
              disabled={calculateScores.isPending}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${calculateScores.isPending ? 'animate-spin' : ''}`} />
              Recalculate Scores
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <InterestOverviewCards counts={overview} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Product Interest Ranking</CardTitle>
                <CardDescription>
                  Click on a product to see detailed breakdown
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ProductInterestTable
                  scores={scores}
                  products={products}
                  onProductClick={setSelectedProductId}
                />
              </CardContent>
            </Card>
          </div>

          {/* Insights Panel */}
          <div>
            <InterestInsightsPanel scores={scores} products={products} />
          </div>
        </div>

        {/* Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Understanding Interest Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="font-medium text-red-600">Hot (70-100)</p>
                  <p className="text-sm text-muted-foreground">
                    Ready to buy. Multiple strong signals indicate high purchase intent.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🌡️</span>
                <div>
                  <p className="font-medium text-orange-600">Warm (45-69)</p>
                  <p className="text-sm text-muted-foreground">
                    High interest. A small nudge (discount, urgency) could convert them.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">❄️</span>
                <div>
                  <p className="font-medium text-blue-600">Cool (20-44)</p>
                  <p className="text-sm text-muted-foreground">
                    Some interest but hesitant. May need better pricing or description.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🧊</span>
                <div>
                  <p className="font-medium text-slate-600">Cold (0-19)</p>
                  <p className="text-sm text-muted-foreground">
                    Low interest. Consider updating images, description, or pricing.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Detail Modal */}
      <ProductInterestDetail
        open={!!selectedProductId}
        onOpenChange={(open) => !open && setSelectedProductId(null)}
        score={selectedScore}
        product={selectedProduct}
      />
    </>
  );
};

export default AdminCustomerInterest;
