import { useActiveProducts } from '@/hooks/useProductsDB';
import ProductCard from '@/components/storefront/ProductCard';
import { Helmet } from 'react-helmet-async';
import { Loader2, Sparkles, Shield, Truck, Award } from 'lucide-react';

const Index = () => {
  const { data: products, isLoading, error } = useActiveProducts();

  const features = [
    { icon: Sparkles, title: 'Curated Selection', description: 'Hand-picked for quality' },
    { icon: Shield, title: 'Quality Guaranteed', description: '30-day satisfaction promise' },
    { icon: Truck, title: 'Fast Delivery', description: 'Swift & secure shipping' },
    { icon: Award, title: 'Premium Quality', description: 'Only the finest materials' },
  ];

  return (
    <>
      <Helmet>
        <title>Dropzy | Thoughtfully Selected Products</title>
        <meta name="description" content="Discover thoughtfully selected products for modern living. Quality essentials for your workspace and lifestyle." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 py-28 md:py-40">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl" />
        
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-slide-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Curated for Modern Living
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance leading-[1.1]">
              Elevate Your
              <span className="block bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                Everyday Essentials
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Discover a curated collection of premium products designed to transform 
              your space and enhance your daily rituals.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <a 
                href="#products" 
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105"
              >
                Explore Collection
              </a>
              <a 
                href="#about" 
                className="inline-flex items-center justify-center px-8 py-4 rounded-full border-2 border-border bg-background/50 backdrop-blur-sm font-semibold hover:bg-muted transition-all duration-300"
              >
                Our Story
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="border-y border-border bg-muted/30 backdrop-blur-sm">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.title} 
                className="flex flex-col items-center text-center gap-3 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section id="about" className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
            <span className="text-sm font-semibold tracking-widest text-primary uppercase">Why Dropzy</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Quality isn't just a promise—<br className="hidden md:block" />
              <span className="text-muted-foreground">it's our obsession.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Every product in our collection has been rigorously tested and thoughtfully 
              selected. We believe in fewer, better things that last longer and bring 
              more joy to your everyday life.
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="products" className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div className="space-y-2">
              <span className="text-sm font-semibold tracking-widest text-primary uppercase">Collection</span>
              <h2 className="text-3xl md:text-4xl font-bold">Featured Products</h2>
              <p className="text-muted-foreground">
                {isLoading ? 'Loading...' : `${products?.length || 0} carefully curated items`}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fade-in"
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

      {/* Trust Banner */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left space-y-2">
              <h3 className="text-2xl md:text-3xl font-bold">Join 10,000+ Happy Customers</h3>
              <p className="text-primary-foreground/80">Experience the Dropzy difference today.</p>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
              <span className="ml-2 font-semibold">4.9/5 Rating</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
