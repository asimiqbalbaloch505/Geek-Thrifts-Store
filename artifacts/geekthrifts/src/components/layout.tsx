import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useUserAuth } from "@/hooks/use-user-auth";
import { Menu, X, ShoppingBag, User, LogOut, ChevronDown } from "lucide-react";
import { useState, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ────────────────────────────────────────────────
   Nav subcategory data
──────────────────────────────────────────────── */
const NAV_ITEMS = [
  {
    label: "Shirts",
    slug: "shirts",
    subcategories: ["Italian", "French", "UK", "USA"],
  },
  {
    label: "Ties",
    slug: "ties",
    subcategories: ["Italian", "French", "UK", "USA"],
  },
  {
    label: "Shoes",
    slug: "shoes",
    subcategories: ["Formals", "Sneakers", "Joggers"],
  },
];

/* ────────────────────────────────────────────────
   Reusable nav dropdown (simple vertical list)
──────────────────────────────────────────────── */
function NavDropdown({ label, slug, subcategories }: { label: string; slug: string; subcategories: string[] }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [location] = useLocation();

  const isActive = location.startsWith(`/products`) && location.includes(`category=${slug}`);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Link href={`/products?category=${slug}`}>
        <button className={`flex items-center gap-0.5 text-[13px] font-medium uppercase tracking-[0.08em] hover:text-black transition-colors py-2 ${isActive ? "text-black" : "text-gray-600"}`}>
          {label}
          <ChevronDown className={`w-3 h-3 ml-0.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>
      </Link>

      {open && (
        <div className="absolute top-full left-0 pt-1 z-50 min-w-[160px]">
          <div className="bg-white border border-gray-100 shadow-sm py-1.5">
            <Link href={`/products?category=${slug}`}>
              <div className="px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer">
                All {label}
              </div>
            </Link>
            <div className="my-1 border-t border-gray-100" />
            {subcategories.map(sub => (
              <Link key={sub} href={`/products?category=${slug}&subcategory=${encodeURIComponent(sub)}`}>
                <div className="px-4 py-1.5 text-[12px] text-gray-600 hover:text-black hover:bg-gray-50 transition-colors cursor-pointer">
                  {sub}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────
   Main layout
──────────────────────────────────────────────── */
export function Layout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { totalItems } = useCart();
  const { isUserLoggedIn, user, userLogout } = useUserAuth();
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">

      {/* Announcement bar */}
      <div className="bg-gray-900 text-white text-center py-2 px-4 text-[11px] tracking-widest uppercase font-medium">
        Free Cash on Delivery — Karachi, Lahore &amp; Islamabad
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-14 flex items-center gap-8">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 text-[20px] font-bold tracking-tight text-gray-900 font-serif">
            GeekThrifts
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7 flex-1">
            <Link href="/" className={`text-[13px] font-medium uppercase tracking-[0.08em] transition-colors ${location === "/" ? "text-black" : "text-gray-600 hover:text-black"}`}>
              Home
            </Link>
            {NAV_ITEMS.map(item => (
              <NavDropdown key={item.slug} label={item.label} slug={item.slug} subcategories={item.subcategories} />
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-1 ml-auto">
            {isUserLoggedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-700 hover:text-black transition-colors font-medium" aria-label="Account">
                    <User className="w-4 h-4" />
                    <span className="hidden md:inline text-[13px]">{user.name.split(" ")[0]}</span>
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
                <Link href="/login" className="px-3 py-2 text-[13px] text-gray-700 hover:text-black transition-colors font-medium">Sign In</Link>
                <span className="text-gray-300">/</span>
                <Link href="/signup" className="px-3 py-2 text-[13px] text-gray-700 hover:text-black transition-colors font-medium">Join</Link>
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
          <div className="md:hidden border-t border-gray-100 bg-white absolute left-0 w-full z-50 shadow-sm">
            <div className="px-5 pt-4 pb-2 flex flex-col gap-0.5">
              <Link href="/" onClick={() => setIsOpen(false)} className="py-2.5 text-sm font-medium text-gray-900 border-b border-gray-50">Home</Link>
              {NAV_ITEMS.map(item => (
                <div key={item.slug}>
                  <Link href={`/products?category=${item.slug}`} onClick={() => setIsOpen(false)} className="py-2.5 text-sm font-medium text-gray-900 flex items-center justify-between border-b border-gray-50">
                    {item.label}
                  </Link>
                  <div className="flex flex-wrap gap-2 py-2 pl-3 border-b border-gray-50">
                    {item.subcategories.map(sub => (
                      <Link key={sub} href={`/products?category=${item.slug}&subcategory=${encodeURIComponent(sub)}`} onClick={() => setIsOpen(false)}>
                        <span className="text-[11px] text-gray-500 hover:text-black px-2 py-0.5 border border-gray-200 transition-colors">{sub}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              <div className="pt-3 pb-4 flex flex-col gap-3">
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
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-100 mt-8">

        {/* Newsletter strip */}
        <div className="border-b border-gray-100 py-10 px-4 text-center">
          <h4 className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-900 mb-4">Join Our Newsletter</h4>
          <form className="flex justify-center" onSubmit={e => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full max-w-sm border-b border-gray-300 focus:border-gray-900 outline-none py-2 px-1 text-[12px] tracking-wider text-gray-600 placeholder-gray-400 bg-transparent transition-colors"
            />
          </form>
        </div>

        {/* Columns */}
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">

          {/* Ties */}
          <div>
            <Link href="/products?category=ties">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-900 mb-3 hover:text-gray-500 transition-colors cursor-pointer">Ties</p>
            </Link>
            <ul className="space-y-2">
              {["Italian", "French", "UK", "USA"].map(sub => (
                <li key={sub}>
                  <Link href={`/products?category=ties&subcategory=${encodeURIComponent(sub)}`}>
                    <span className="text-[12px] text-gray-500 hover:text-black uppercase tracking-[0.06em] transition-colors cursor-pointer">{sub}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shirts */}
          <div>
            <Link href="/products?category=shirts">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-900 mb-3 hover:text-gray-500 transition-colors cursor-pointer">Shirts</p>
            </Link>
            <ul className="space-y-2">
              {["Italian", "French", "UK", "USA"].map(sub => (
                <li key={sub}>
                  <Link href={`/products?category=shirts&subcategory=${encodeURIComponent(sub)}`}>
                    <span className="text-[12px] text-gray-500 hover:text-black uppercase tracking-[0.06em] transition-colors cursor-pointer">{sub}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shoes */}
          <div>
            <Link href="/products?category=shoes">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-900 mb-3 hover:text-gray-500 transition-colors cursor-pointer">Shoes</p>
            </Link>
            <ul className="space-y-2">
              {["Formals", "Sneakers", "Joggers"].map(sub => (
                <li key={sub}>
                  <Link href={`/products?category=shoes&subcategory=${encodeURIComponent(sub)}`}>
                    <span className="text-[12px] text-gray-500 hover:text-black uppercase tracking-[0.06em] transition-colors cursor-pointer">{sub}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-900 mb-3">Help</p>
            <ul className="space-y-2">
              {["Order Status", "Shipping & Delivery", "Return Policy", "FAQs", "Privacy Policy"].map(item => (
                <li key={item}>
                  <span className="text-[12px] text-gray-500 uppercase tracking-[0.06em] cursor-default">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-900 mb-3">Customer Care</p>
            <ul className="space-y-2.5">
              <li><span className="text-[12px] text-gray-500">COD Only — No Online Payment</span></li>
              <li>
                <a href="https://instagram.com" className="text-[12px] text-gray-500 uppercase tracking-[0.06em] hover:text-black transition-colors">Instagram</a>
              </li>
              <li>
                <a href="https://facebook.com" className="text-[12px] text-gray-500 uppercase tracking-[0.06em] hover:text-black transition-colors">Facebook</a>
              </li>
              {!isUserLoggedIn && (
                <li><Link href="/signup" className="text-[12px] text-gray-500 uppercase tracking-[0.06em] hover:text-black transition-colors">Create Account</Link></li>
              )}
              {isUserLoggedIn && (
                <li><button className="text-[12px] text-gray-500 uppercase tracking-[0.06em] hover:text-black transition-colors" onClick={userLogout}>Sign Out</button></li>
              )}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-100 py-4 px-4">
          <p className="text-center text-[11px] text-gray-400 uppercase tracking-widest">
            GeekThrifts &copy; {new Date().getFullYear()}. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
