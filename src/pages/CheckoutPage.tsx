import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { useTrackEvent } from '@/hooks/useTracking';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';

const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const trackEvent = useTrackEvent();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Track checkout intent for all items
  useEffect(() => {
    items.forEach(item => {
      trackEvent.mutate({ productId: item.product.id, eventType: 'checkoutIntent', value: item.quantity });
    });
  }, []);

  if (items.length === 0 && !submitted) {
    navigate('/cart');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    setSubmitted(true);
    setIsSubmitting(false);
    clearCart();

    toast({
      title: 'Interest registered!',
      description: 'Thank you for your interest. We\'ll be in touch soon.',
    });
  };

  if (submitted) {
    return (
      <>
        <Helmet>
          <title>Thank You | Dropzy</title>
        </Helmet>
        <div className="container py-20">
          <div className="max-w-md mx-auto text-center space-y-6 animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Check className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-semibold">Thank you!</h1>
            <p className="text-muted-foreground">
              Your interest has been registered. We're evaluating demand for these products
              and will notify you when they become available.
            </p>
            <Button asChild>
              <Link to="/">Continue Browsing</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  const shippingCost = totalPrice >= 500 ? 0 : 49;
  const finalTotal = totalPrice + shippingCost;

  return (
    <>
      <Helmet>
        <title>Checkout | Dropzy</title>
      </Helmet>

      <div className="container py-8 md:py-12">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to cart
        </Link>

        <h1 className="text-3xl font-semibold mb-8">Checkout</h1>


        <div className="grid lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Contact Information</h2>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Shipping Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input id="zip" required />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full gradient-primary shadow-glow"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Reserve My Order'}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By clicking "Reserve My Order", you're expressing interest in these products.
              No payment will be charged.
            </p>
          </form>

          {/* Order Summary */}
          <div>
            <div className="sticky top-24 p-6 rounded-xl border border-border bg-card">
              <h2 className="text-lg font-semibold mb-6">Order Summary</h2>

              <div className="space-y-4 pb-6 border-b border-border">
                {items.map(item => (
                  <div key={item.product.id} className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.images?.[0] || '/placeholder.svg'}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium">
                      ₹{(Number(item.product.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 py-6 border-b border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Tax</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="flex justify-between pt-6 text-lg font-semibold">
                <span>Total</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
