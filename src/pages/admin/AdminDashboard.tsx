import { useProducts } from '@/contexts/ProductContext';
import { Eye, MousePointer, ShoppingCart, CreditCard, TrendingUp, Package } from 'lucide-react';
import StatCard from '@/components/admin/StatCard';
import ViabilityScoreRing from '@/components/admin/ViabilityScoreRing';
import ViabilityBadge from '@/components/admin/ViabilityBadge';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const AdminDashboard = () => {
  const { products, analytics, viabilityScores } = useProducts();

  // Calculate aggregate stats
  const totalImpressions = Array.from(analytics.values()).reduce((sum, a) => sum + a.impressions, 0);
  const totalClicks = Array.from(analytics.values()).reduce((sum, a) => sum + a.clicks, 0);
  const totalAddToCart = Array.from(analytics.values()).reduce((sum, a) => sum + a.addToCartCount, 0);
  const totalCheckouts = Array.from(analytics.values()).reduce((sum, a) => sum + a.checkoutIntents, 0);
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  // Get top performing products
  const sortedProducts = [...products].sort((a, b) => {
    const scoreA = viabilityScores.get(a.id)?.score || 0;
    const scoreB = viabilityScores.get(b.id)?.score || 0;
    return scoreB - scoreA;
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Monitor product performance and make data-driven decisions.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Impressions"
          value={totalImpressions.toLocaleString()}
          change="+12% from last week"
          changeType="positive"
          icon={Eye}
        />
        <StatCard
          title="Click-Through Rate"
          value={`${avgCtr.toFixed(1)}%`}
          change="+2.3% from last week"
          changeType="positive"
          icon={MousePointer}
        />
        <StatCard
          title="Add to Cart"
          value={totalAddToCart.toLocaleString()}
          change="+8% from last week"
          changeType="positive"
          icon={ShoppingCart}
        />
        <StatCard
          title="Checkout Intents"
          value={totalCheckouts.toLocaleString()}
          change="-3% from last week"
          changeType="negative"
          icon={CreditCard}
        />
      </div>

      {/* Products Table */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">Product Viability</h2>
            <p className="text-sm text-muted-foreground">Ranked by viability score</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/products">
              <Package className="h-4 w-4 mr-2" />
              Manage Products
            </Link>
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="text-center">Score</TableHead>
              <TableHead className="text-center">CTR</TableHead>
              <TableHead className="text-center">Add to Cart</TableHead>
              <TableHead className="text-center">Checkout Rate</TableHead>
              <TableHead className="text-center">Recommendation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProducts.map(product => {
              const productAnalytics = analytics.get(product.id);
              const score = viabilityScores.get(product.id);

              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">${product.price}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <ViabilityScoreRing score={score?.score || 0} size="sm" />
                  </TableCell>
                  <TableCell className="text-center">
                    {productAnalytics?.ctr.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-center">
                    {productAnalytics?.addToCartRate.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-center">
                    {productAnalytics?.checkoutRate.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-center">
                    {score && <ViabilityBadge recommendation={score.recommendation} />}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-score-scale" />
            <h3 className="font-semibold">Ready to Scale</h3>
          </div>
          <div className="space-y-3">
            {sortedProducts
              .filter(p => viabilityScores.get(p.id)?.recommendation === 'scale')
              .slice(0, 3)
              .map(product => {
                const score = viabilityScores.get(product.id);
                return (
                  <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-score-scale font-bold">{score?.score}</span>
                  </div>
                );
              })}
            {sortedProducts.filter(p => viabilityScores.get(p.id)?.recommendation === 'scale').length === 0 && (
              <p className="text-sm text-muted-foreground">No products ready to scale yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-score-kill" />
            <h3 className="font-semibold">Consider Removing</h3>
          </div>
          <div className="space-y-3">
            {sortedProducts
              .filter(p => viabilityScores.get(p.id)?.recommendation === 'kill')
              .slice(0, 3)
              .map(product => {
                const score = viabilityScores.get(product.id);
                return (
                  <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-score-kill font-bold">{score?.score}</span>
                  </div>
                );
              })}
            {sortedProducts.filter(p => viabilityScores.get(p.id)?.recommendation === 'kill').length === 0 && (
              <p className="text-sm text-muted-foreground">All products showing positive signals.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
