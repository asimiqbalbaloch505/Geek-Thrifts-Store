import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { totalItems } = useCart();
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-serif">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tighter uppercase">
            GEEKTHRIFTS.
          </Link>
          
          <nav className="hidden md:flex gap-8 items-center text-sm font-sans uppercase tracking-widest">
            <Link href="/" className={location === "/" ? "font-bold" : ""}>Home</Link>
            <Link href="/products?category=shirts" className={location.includes("shirts") ? "font-bold" : ""}>Shirts</Link>
            <Link href="/products?category=ties" className={location.includes("ties") ? "font-bold" : ""}>Ties</Link>
            <span className="text-muted-foreground cursor-not-allowed" title="Coming Soon">Shoes</span>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative p-2">
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-foreground text-background text-[10px] flex items-center justify-center rounded-full font-sans">
                  {totalItems}
                </span>
              )}
            </Link>
            <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden border-t border-border bg-background absolute top-16 left-0 w-full p-4 flex flex-col gap-4 font-sans uppercase tracking-widest text-sm">
            <Link href="/" onClick={() => setIsOpen(false)}>Home</Link>
            <Link href="/products?category=shirts" onClick={() => setIsOpen(false)}>Shirts</Link>
            <Link href="/products?category=ties" onClick={() => setIsOpen(false)}>Ties</Link>
            <span className="text-muted-foreground">Shoes (Coming Soon)</span>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="border-t border-border bg-background py-12 mt-auto">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4 uppercase tracking-tighter">GeekThrifts.</h3>
            <p className="text-sm font-sans max-w-xs leading-relaxed">
              Curated Pakistani thrift fashion. Sharp, minimal, and purposeful. Like a well-pressed Oxford shirt.
            </p>
          </div>
          <div>
            <h4 className="font-sans font-bold text-sm uppercase tracking-widest mb-4">Shop</h4>
            <ul className="flex flex-col gap-2 text-sm font-sans">
              <li><Link href="/products">All Products</Link></li>
              <li><Link href="/products?category=shirts">Shirts</Link></li>
              <li><Link href="/products?category=ties">Ties</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-sans font-bold text-sm uppercase tracking-widest mb-4">Legal</h4>
            <ul className="flex flex-col gap-2 text-sm font-sans">
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
              <li>Return Policy</li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-border text-xs font-sans text-center">
          &copy; {new Date().getFullYear()} GeekThrifts. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
