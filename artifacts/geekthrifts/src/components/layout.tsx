import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useUserAuth } from "@/hooks/use-user-auth";
import { Menu, X, ShoppingBag, User, LogOut } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Layout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { totalItems } = useCart();
  const { isUserLoggedIn, user, userLogout } = useUserAuth();
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

          <div className="flex items-center gap-3">
            <Link href="/cart" className="relative p-2" data-testid="link-cart">
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-foreground text-background text-[10px] flex items-center justify-center rounded-full font-sans">
                  {totalItems}
                </span>
              )}
            </Link>

            {isUserLoggedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 p-2 font-sans text-xs uppercase tracking-widest font-bold hover:opacity-70 transition-opacity" data-testid="button-user-menu">
                    <User className="w-4 h-4" />
                    <span className="hidden md:inline">{user.name.split(" ")[0]}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-none border-border font-sans text-xs w-44">
                  <div className="px-3 py-2">
                    <p className="font-bold text-xs uppercase tracking-widest truncate">{user.name}</p>
                    <p className="text-muted-foreground text-[10px] truncate mt-0.5">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-xs uppercase tracking-widest font-bold gap-2 rounded-none"
                    onClick={userLogout}
                    data-testid="button-logout"
                  >
                    <LogOut className="w-3 h-3" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2 font-sans text-xs uppercase tracking-widest">
                <Link href="/login" className="font-bold hover:opacity-70 transition-opacity" data-testid="link-login">Sign In</Link>
                <span className="text-border">|</span>
                <Link href="/signup" className="font-bold hover:opacity-70 transition-opacity" data-testid="link-signup">Join</Link>
              </div>
            )}

            <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)} data-testid="button-mobile-menu">
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden border-t border-border bg-background absolute top-16 left-0 w-full p-4 flex flex-col gap-4 font-sans uppercase tracking-widest text-sm z-50">
            <Link href="/" onClick={() => setIsOpen(false)}>Home</Link>
            <Link href="/products?category=shirts" onClick={() => setIsOpen(false)}>Shirts</Link>
            <Link href="/products?category=ties" onClick={() => setIsOpen(false)}>Ties</Link>
            <span className="text-muted-foreground">Shoes (Coming Soon)</span>
            <div className="border-t border-border pt-4 flex flex-col gap-3">
              {isUserLoggedIn && user ? (
                <>
                  <span className="text-xs font-bold">{user.name}</span>
                  <button className="text-left" onClick={() => { userLogout(); setIsOpen(false); }}>Sign Out</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsOpen(false)}>Sign In</Link>
                  <Link href="/signup" onClick={() => setIsOpen(false)}>Create Account</Link>
                </>
              )}
            </div>
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
            <h4 className="font-sans font-bold text-sm uppercase tracking-widest mb-4">Account</h4>
            <ul className="flex flex-col gap-2 text-sm font-sans">
              {isUserLoggedIn ? (
                <li><button className="text-left hover:opacity-70" onClick={userLogout}>Sign Out</button></li>
              ) : (
                <>
                  <li><Link href="/login">Sign In</Link></li>
                  <li><Link href="/signup">Create Account</Link></li>
                </>
              )}
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
