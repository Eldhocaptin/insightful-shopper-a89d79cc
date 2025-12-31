import { useActiveProducts } from '@/hooks/useProductsDB';
import ProductCard from '@/components/storefront/ProductCard';
import { Helmet } from 'react-helmet-async';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { data: products, isLoading, error } = useActiveProducts();

  return (
    <>
      <Helmet>
        <title>Dropzy | Thoughtfully Selected Products</title>
        <meta name="description" content="Discover thoughtfully selected products for modern living. Quality essentials for your workspace and lifestyle." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative gradient-hero py-24 md:py-32">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center space-y-6 animate-slide-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-balance">
              Thoughtfully selected for modern living
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              Quality essentials that elevate your everyday. Each product is carefully curated for function, form, and lasting value.
            </p>
          </div>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,hsl(var(--primary)/0.05),transparent_50%)]" />
      </section>

      {/* Products Grid */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-semibold mb-1">All Products</h2>
              <p className="text-muted-foreground">
                {isLoading ? 'Loading...' : `${products?.length || 0} items`}
              </p>
            </div>
          </div>

          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <p className="text-destructive">Failed to load products</p>
            </div>
          )}

          {!isLoading && products && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          {!isLoading && products?.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No products available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 border-t border-border/50 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <h3 className="font-semibold">Free Shipping</h3>
              <p className="text-sm text-muted-foreground">On orders over $50</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Easy Returns</h3>
              <p className="text-sm text-muted-foreground">30-day return policy</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Secure Checkout</h3>
              <p className="text-sm text-muted-foreground">Encrypted transactions</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
