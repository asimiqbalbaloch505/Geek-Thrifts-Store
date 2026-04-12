import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useUserAuth } from "@/hooks/use-user-auth";
import { useListProducts, getListProductsQueryKey } from "@workspace/api-client-react";
import { getImageUrl } from "@/lib/utils";
import { Menu, X, ShoppingBag, User, LogOut, ChevronDown } from "lucide-react";
import { useState, useRef } from "react";
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
  { label: "Shoes", slug: "shoes", coming: false },
];

function CategoryMegaNav({ label, slug, coming }: { label: string; slug: string; coming: boolean }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: products } = useListProducts(undefined, {
    query: { queryKey: getListProductsQueryKey() }
  });
  const items = products?.filter(p => p.isActive && p.categoryName?.toLowerCase() === label.toLowerCase()).slice(0, 4) ?? [];

  if (coming) {
    return (
      <span className="text-sm text-gray-400 cursor-not-allowed tracking-wide">
        {label}
        <span className="ml-1 text-[10px] font-medium uppercase tracking-widest align-middle">Soon</span>
      </span>
    );
  }

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Link href={`/products?category=${slug}`}>
        <button className={`flex items-center gap-0.5 text-sm font-medium tracking-wide hover:text-black transition-colors py-2 group ${open ? "text-black" : "text-gray-700"}`}>
          {label}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>
      </Link>

      {open && items.length > 0 && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
          <div className="bg-white border border-gray-100 shadow-sm min-w-[240px]">
            <div className="p-3 border-b border-gray-100">
              <Link href={`/products?category=${slug}`}>
                <span className="text-[11px] uppercase tracking-[0.15em] font-semibold text-gray-500 hover:text-black transition-colors">
                  All {label} ({items.length}+)
                </span>
              </Link>
            </div>
            {items.map(p => (
              <Link key={p.id} href={`/products/${p.id}`}>
                <div className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                  {p.imageUrl && (
                    <div className="w-9 h-11 flex-shrink-0 overflow-hidden bg-gray-100">
                      <img src={getImageUrl(p.imageUrl)} alt={p.name} className="w-full h-full object-cover object-center" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-gray-900 truncate leading-tight">{p.name}</p>
                    <p className="text-[12px] text-gray-500 mt-0.5">PKR {Number(p.price).toLocaleString()}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { totalItems } = useCart();
  const { isUserLoggedIn, user, userLogout } = useUserAuth();
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">

      {/* Top announcement bar */}
      <div className="bg-gray-900 text-white text-center py-2 px-4 text-[11px] tracking-widest uppercase font-medium">
        Free Cash on Delivery — Karachi, Lahore & Islamabad
      </div>

      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 flex items-center gap-8">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 text-[22px] font-bold tracking-tight text-gray-900 font-serif">
            GeekThrifts
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 flex-1">
            <Link href="/" className={`text-sm font-medium tracking-wide transition-colors ${location === "/" ? "text-black" : "text-gray-600 hover:text-black"}`}>
              Home
            </Link>
            {CATEGORY_SLUGS.map(cat => (
              <CategoryMegaNav key={cat.slug} {...cat} />
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-1 ml-auto">
            {isUserLoggedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-700 hover:text-black transition-colors font-medium" aria-label="Account">
                    <User className="w-4 h-4" />
                    <span className="hidden md:inline">{user.name.split(" ")[0]}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-none border-gray-100 font-sans text-sm w-48 shadow-sm">
                  <div className="px-3 py-2.5">
                    <p className="font-semibold text-sm truncate">{user.name}</p>
                    <p className="text-gray-500 text-xs truncate mt-0.5">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-sm gap-2 rounded-none" onClick={userLogout}>
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-0.5 text-sm">
                <Link href="/login" className="px-3 py-2 text-gray-700 hover:text-black transition-colors font-medium">Sign In</Link>
                <span className="text-gray-300">/</span>
                <Link href="/signup" className="px-3 py-2 text-gray-700 hover:text-black transition-colors font-medium">Join</Link>
              </div>
            )}

            <Link href="/cart" className="relative px-3 py-2 text-gray-700 hover:text-black transition-colors" aria-label="Cart">
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-1.5 right-1 w-4 h-4 bg-gray-900 text-white text-[9px] flex items-center justify-center rounded-full font-bold">
                  {totalItems}
                </span>
              )}
            </Link>

            <button className="md:hidden px-2 py-2 text-gray-700" onClick={() => setIsOpen(!isOpen)} aria-label="Menu">
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white absolute left-0 w-full p-5 flex flex-col gap-4 z-50 shadow-sm">
            <Link href="/" onClick={() => setIsOpen(false)} className="text-sm font-medium text-gray-900">Home</Link>
            <Link href="/products?category=shirts" onClick={() => setIsOpen(false)} className="text-sm font-medium text-gray-900">Shirts</Link>
            <Link href="/products?category=ties" onClick={() => setIsOpen(false)} className="text-sm font-medium text-gray-900">Ties</Link>
            <span className="text-sm text-gray-400">Shoes — Coming Soon</span>
            <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
              {isUserLoggedIn && user ? (
                <button className="text-left text-sm font-medium text-gray-900" onClick={() => { userLogout(); setIsOpen(false); }}>Sign Out</button>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsOpen(false)} className="text-sm font-medium text-gray-900">Sign In</Link>
                  <Link href="/signup" onClick={() => setIsOpen(false)} className="text-sm font-medium text-gray-900">Create Account</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="border-t border-gray-100 bg-white py-12">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="font-serif font-bold text-xl tracking-tight mb-3">GeekThrifts</h3>
            <p className="text-[13px] text-gray-500 leading-relaxed max-w-xs">
              Curated thrift fashion from the world's finest labels. Verified, priced fairly, and delivered across Pakistan.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Shop</h4>
            <ul className="space-y-2.5">
              <li><Link href="/products" className="text-[13px] text-gray-500 hover:text-black transition-colors">All Products</Link></li>
              <li><Link href="/products?category=shirts" className="text-[13px] text-gray-500 hover:text-black transition-colors">Shirts</Link></li>
              <li><Link href="/products?category=ties" className="text-[13px] text-gray-500 hover:text-black transition-colors">Ties</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Account</h4>
            <ul className="space-y-2.5">
              {isUserLoggedIn ? (
                <li><button className="text-[13px] text-gray-500 hover:text-black transition-colors" onClick={userLogout}>Sign Out</button></li>
              ) : (
                <>
                  <li><Link href="/login" className="text-[13px] text-gray-500 hover:text-black transition-colors">Sign In</Link></li>
                  <li><Link href="/signup" className="text-[13px] text-gray-500 hover:text-black transition-colors">Create Account</Link></li>
                </>
              )}
              <li><span className="text-[13px] text-gray-400">Cash on Delivery</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 mt-10 pt-6 border-t border-gray-100">
          <p className="text-[12px] text-gray-400">&copy; {new Date().getFullYear()} GeekThrifts. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
