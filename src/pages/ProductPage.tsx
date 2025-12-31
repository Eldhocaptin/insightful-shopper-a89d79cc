import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useProducts } from '@/contexts/ProductContext';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getProduct, trackEvent } = useProducts();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [scrollDepth, setScrollDepth] = useState(0);

  const product = getProduct(id || '');

  useEffect(() => {
    if (product) {
      trackEvent(product.id, 'impression');
      const startTime = Date.now();

      const handleScroll = () => {
        const scrolled = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const depth = Math.round((scrolled / docHeight) * 100);
        if (depth > scrollDepth) {
          setScrollDepth(depth);
        }
      };

      window.addEventListener('scroll', handleScroll);

      return () => {
        window.removeEventListener('scroll', handleScroll);
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        trackEvent(product.id, 'timeOnPage', timeSpent);
        trackEvent(product.id, 'scroll', scrollDepth);
      };
    }
  }, [product, trackEvent, scrollDepth]);

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-semibold mb-4">Product not found</h1>
        <Link to="/" className="text-primary hover:underline">
          ← Back to shop
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    trackEvent(product.id, 'addToCart', quantity);
    toast({
      title: 'Added to cart',
      description: `${quantity}x ${product.name} has been added to your cart.`,
    });
  };

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <>
      <Helmet>
        <title>{product.name} | CURATE</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="container py-8 md:py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to shop
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Product Image */}
          <div className="animate-fade-in">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted/50">
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              {discount && (
                <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-sm font-medium px-3 py-1.5 rounded-full">
                  -{discount}%
                </span>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="animate-slide-up space-y-6">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                {product.category}
              </p>
              <h1 className="text-3xl md:text-4xl font-semibold mb-4">
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-semibold">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            <div className="border-t border-b border-border py-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Quantity</span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full h-14 text-base gradient-primary shadow-glow"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Add to Cart — ${(product.price * quantity).toFixed(2)}
            </Button>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-4 rounded-xl bg-muted/50">
                <p className="text-sm text-muted-foreground">Free Shipping</p>
                <p className="text-sm font-medium">Orders over $50</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-muted/50">
                <p className="text-sm text-muted-foreground">Easy Returns</p>
                <p className="text-sm font-medium">30-day policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductPage;
