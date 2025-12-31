import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <span className="text-lg font-semibold tracking-tight">CURATE</span>
            <p className="text-sm text-muted-foreground">
              Thoughtfully selected products for modern living.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Shop</h4>
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                All Products
              </Link>
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                New Arrivals
              </Link>
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Best Sellers
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Company</h4>
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About Us
              </Link>
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Legal</h4>
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} CURATE. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
              🔬 This site is part of a product research experiment
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
