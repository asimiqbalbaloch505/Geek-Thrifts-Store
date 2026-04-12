import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useUserAuth } from "@/hooks/use-user-auth";
import { useListProducts, getListProductsQueryKey } from "@workspace/api-client-react";
import { getImageUrl } from "@/lib/utils";
import { Menu, X, ShoppingBag, User, LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CATEGORY_SLUGS = [
  { label: "Shirts", slug: "shirts", coming: false },
  { label: "Ties", slug: "ties", coming: false },
  { label: "Shoes", slug: "shoes", coming: true },
];

function CategoryDropdown({ label, slug, coming }: { label: string; slug: string; coming: boolean }) {
  const { data: products } = useListProducts(undefined, {
    query: { queryKey: getListProductsQueryKey() }
  });
  const categoryProducts = products?.filter(p => p.isActive && p.categoryName?.toLowerCase() === label.toLowerCase()).slice(0, 4) ?? [];

  if (coming) {
    return (
      <span className="text-muted-foreground cursor-not-allowed text-xs uppercase tracking-widest font-bold">
        {label}
      </span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 text-xs uppercase tracking-widest font-bold hover:text-muted-foreground transition-colors focus:outline-none group" data-testid={`nav-${slug}`}>
        {label}
        <ChevronDown className="w-3 h-3 transition-transform group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={16}
        className="rounded-none border border-border bg-popover p-0 w-64 shadow-none"
      >
        {categoryProducts.length > 0 ? (
          <>
            <div className="p-3 border-b border-border">
              <Link href={`/products?category=${slug}`}>
                <span className="font-sans text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground transition-colors">
                  View All {label}
                </span>
              </Link>
            </div>
            {categoryProducts.map(p => (
              <Link key={p.id} href={`/products/${p.id}`}>
                <DropdownMenuItem className="rounded-none cursor-pointer p-0 focus:bg-accent">
                  <div className="flex items-center gap-3 w-full p-3">
                    {p.imageUrl && (
                      <div className="w-10 h-12 flex-shrink-0 overflow-hidden bg-muted">
                        <img src={getImageUrl(p.imageUrl)} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-sans text-xs font-bold truncate">{p.name}</p>
                      <p className="font-sans text-[10px] text-muted-foreground">PKR {Number(p.price).toLocaleString()}</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              </Link>
            ))}
          </>
        ) : (
          <div className="p-4 text-xs text-muted-foreground font-sans uppercase tracking-widest">No items yet</div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { totalItems } = useCart();
  const { isUserLoggedIn, user, userLogout } = useUserAuth();
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-6">

          <Link href="/" className="font-serif text-lg font-bold tracking-tighter uppercase flex-shrink-0">
            GeekThrifts.
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className={`text-xs uppercase tracking-widest font-bold hover:text-muted-foreground transition-colors ${location === "/" ? "" : "text-muted-foreground"}`}>
              Home
            </Link>
            {CATEGORY_SLUGS.map(cat => (
              <CategoryDropdown key={cat.slug} {...cat} />
            ))}
          </nav>

          <div className="flex items-center gap-2 ml-auto">
            <Link href="/cart" className="relative p-2.5 hover:opacity-70 transition-opacity" data-testid="link-cart" aria-label="Cart">
              <ShoppingBag className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-foreground text-background text-[9px] flex items-center justify-center rounded-full font-bold">
                  {totalItems}
                </span>
              )}
            </Link>

            {isUserLoggedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 px-2.5 py-2 text-xs uppercase tracking-widest font-bold hover:opacity-70 transition-opacity" data-testid="button-user-menu" aria-label="Account">
                    <User className="w-4 h-4" />
                    <span className="hidden md:inline">{user.name.split(" ")[0]}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-none border-border font-sans text-xs w-44">
                  <div className="px-3 py-2.5">
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
              <div className="hidden md:flex items-center gap-1 text-xs uppercase tracking-widest">
                <Link href="/login" className="font-bold px-2.5 py-2 hover:opacity-70 transition-opacity" data-testid="link-login">Sign In</Link>
                <span className="text-muted-foreground text-[10px]">/</span>
                <Link href="/signup" className="font-bold px-2.5 py-2 hover:opacity-70 transition-opacity" data-testid="link-signup">Join</Link>
              </div>
            )}

            <button
              className="md:hidden p-2.5 hover:opacity-70 transition-opacity"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Menu"
            >
              {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden border-t border-border bg-background absolute top-14 left-0 w-full p-5 flex flex-col gap-5 font-sans uppercase tracking-widest text-xs font-bold z-50">
            <Link href="/" onClick={() => setIsOpen(false)}>Home</Link>
            <Link href="/products?category=shirts" onClick={() => setIsOpen(false)}>Shirts</Link>
            <Link href="/products?category=ties" onClick={() => setIsOpen(false)}>Ties</Link>
            <span className="text-muted-foreground">Shoes — Coming Soon</span>
            <div className="border-t border-border pt-4 flex flex-col gap-4">
              {isUserLoggedIn && user ? (
                <>
                  <span className="normal-case text-xs font-bold">{user.name}</span>
                  <button className="text-left" onClick={() => { userLogout(); setIsOpen(false); }}>Sign Out</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsOpen(false)}>Sign In</Link>
                  <Link href="/signup" onClick={() => setIsOpen(false)}>Join</Link>
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
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="font-serif font-bold text-base tracking-tighter uppercase mb-3">GeekThrifts.</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Curated Pakistani thrift fashion. Formal shirts, designer ties, and classic shoes — all verified and priced fairly.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest mb-4">Shop</h4>
            <ul className="flex flex-col gap-2.5 text-xs text-muted-foreground">
              <li><Link href="/products" className="hover:text-foreground transition-colors">All Products</Link></li>
              <li><Link href="/products?category=shirts" className="hover:text-foreground transition-colors">Shirts</Link></li>
              <li><Link href="/products?category=ties" className="hover:text-foreground transition-colors">Ties</Link></li>
              <li><span className="cursor-default">Shoes — Coming Soon</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest mb-4">Account</h4>
            <ul className="flex flex-col gap-2.5 text-xs text-muted-foreground">
              {isUserLoggedIn ? (
                <li><button className="hover:text-foreground transition-colors" onClick={userLogout}>Sign Out</button></li>
              ) : (
                <>
                  <li><Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link></li>
                  <li><Link href="/signup" className="hover:text-foreground transition-colors">Create Account</Link></li>
                </>
              )}
              <li><span className="cursor-default">Cash on Delivery</span></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-10 pt-8 border-t border-border text-[10px] font-sans text-center text-muted-foreground">
          &copy; {new Date().getFullYear()} GeekThrifts. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
