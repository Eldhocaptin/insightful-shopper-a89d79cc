import { useActiveProducts } from '@/hooks/useProductsDB';
import ProductCard from '@/components/storefront/ProductCard';
import { Helmet } from 'react-helmet-async';
import { Loader2, ArrowRight, Truck, RotateCcw, Shield, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { data: products, isLoading, error } = useActiveProducts();

  const benefits = [
    { icon: Truck, text: 'Free Shipping Over $50' },
    { icon: RotateCcw, text: '30-Day Easy Returns' },
    { icon: Shield, text: 'Secure Checkout' },
    { icon: Clock, text: '24/7 Support' },
  ];

  return (
    <>
      <Helmet>
        <title>Dropzy | Premium Lifestyle Products</title>
        <meta name="description" content="Shop premium lifestyle products. Quality essentials for your workspace and everyday life." />
      </Helmet>

      {/* Announcement Bar */}
      <div className="bg-foreground text-background py-2.5 text-center text-sm font-medium">
        <span className="animate-pulse">✨</span> NEW ARRIVALS — Free shipping on orders over $50 <span className="animate-pulse">✨</span>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center bg-gradient-to-br from-muted/50 via-background to-primary/5 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-block">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wide">
                  BESTSELLER COLLECTION
                </span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
                Workspace
                <span className="block text-primary">Essentials</span>
                <span className="block text-muted-foreground text-4xl sm:text-5xl lg:text-6xl font-medium mt-2">Redefined.</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground max-w-md mx-auto lg:mx-0">
                Premium quality products designed to elevate your productivity and style. Built to last.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="h-14 px-8 text-base rounded-full shadow-lg hover:shadow-xl transition-all" asChild>
                  <a href="#products">
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-full" asChild>
                  <Link to="/cart">View Cart</Link>
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-6 justify-center lg:justify-start pt-4">
                <div className="flex -space-x-2">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 border-2 border-background flex items-center justify-center text-xs font-bold text-primary">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-muted-foreground">2,500+ Happy Customers</span>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative hidden lg:block">
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 via-transparent to-accent/20 rounded-3xl blur-3xl" />
              <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-muted to-muted/50 border border-border/50 p-8 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-32 h-32 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                    <span className="text-6xl">📦</span>
                  </div>
                  <p className="text-2xl font-bold">Premium Quality</p>
                  <p className="text-muted-foreground">Curated with care</p>
                </div>
              </div>
              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 bg-background rounded-2xl shadow-xl p-4 border animate-bounce" style={{ animationDuration: '3s' }}>
                <p className="text-2xl font-bold text-primary">20% OFF</p>
                <p className="text-xs text-muted-foreground">First Order</p>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-background rounded-2xl shadow-xl p-4 border">
                <p className="text-sm font-semibold">🔥 Trending Now</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Strip */}
      <section className="border-y border-border bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">
            {benefits.map((benefit) => (
              <div key={benefit.text} className="flex items-center justify-center gap-3 py-5 px-4">
                <benefit.icon className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm font-medium">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="products" className="py-20 md:py-28">
        <div className="container">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-primary font-semibold text-sm tracking-wider uppercase">Shop</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-1">Our Products</h2>
              <p className="text-muted-foreground mt-2">
                {isLoading ? 'Loading products...' : `Showing ${products?.length || 0} products`}
              </p>
            </div>
            <Button variant="ghost" className="text-primary hover:text-primary/80 group">
              View All 
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-24 space-y-4">
              <p className="text-destructive text-lg">Failed to load products</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          )}

          {!isLoading && products && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fade-in opacity-0"
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'forwards'
                  }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          {!isLoading && products?.length === 0 && (
            <div className="text-center py-24 space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center">
                <span className="text-4xl">🛒</span>
              </div>
              <p className="text-xl font-medium">No products yet</p>
              <p className="text-muted-foreground">Check back soon for new arrivals!</p>
            </div>
          )}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-16 bg-foreground text-background">
        <div className="container">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
            <div className="space-y-3">
              <p className="text-sm font-semibold tracking-wider uppercase opacity-70">Limited Time Offer</p>
              <h3 className="text-3xl md:text-4xl font-bold">Get 20% Off Your First Order</h3>
              <p className="opacity-80 max-w-md">Sign up for exclusive deals, new arrivals, and more.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="px-5 py-3 rounded-full bg-background/10 border border-background/20 text-background placeholder:text-background/50 focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-72"
              />
              <Button className="rounded-full px-8 bg-primary hover:bg-primary/90">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <span className="text-primary font-semibold text-sm tracking-wider uppercase">Why Dropzy</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">The Dropzy Difference</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { emoji: '🎯', title: 'Curated Selection', desc: 'Every product is hand-picked for quality, functionality, and design excellence.' },
              { emoji: '✨', title: 'Premium Quality', desc: 'We source only the finest materials and partner with trusted manufacturers.' },
              { emoji: '💚', title: 'Satisfaction Guaranteed', desc: "Not happy? We'll make it right with our 30-day hassle-free return policy." },
            ].map((item) => (
              <div key={item.title} className="bg-background rounded-2xl p-8 border border-border hover:shadow-xl transition-shadow duration-300 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center text-3xl mb-6">
                  {item.emoji}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;