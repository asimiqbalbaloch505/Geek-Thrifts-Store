import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useUserAuth } from "@/hooks/use-user-auth";
import { Menu, X, ShoppingBag, User, LogOut, ChevronDown, ArrowRight } from "lucide-react";
import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ─────────────────────────────────────────────────────────
   Nav data
───────────────────────────────────────────────────────── */
interface SubItem {
  label: string;
  description: string;
  comingSoon?: boolean;
}
interface NavItem {
  label: string;
  slug: string;
  featured: { img: string; headline: string; sub: string };
  subs: SubItem[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Ties",
    slug: "ties",
    featured: {
      img: "/products/burberry-stripe-1.jpg",
      headline: "British Heritage",
      sub: "Authenticated silk ties from the world's finest houses",
    },
    subs: [
      { label: "Italian", description: "Como silk, luxury weave" },
      { label: "French", description: "Dior & Hermès heritage" },
      { label: "UK", description: "Burberry & BSL tradition" },
      { label: "USA", description: "Ralph Lauren classics" },
    ],
  },
  {
    label: "Shirts",
    slug: "shirts",
    featured: {
      img: "https://images.unsplash.com/photo-1604695573706-53170668f6a6?w=600&fit=crop&auto=format",
      headline: "Dress Sharp",
      sub: "Pre-owned formal shirts from iconic American and European labels",
    },
    subs: [
      { label: "Italian", description: "Fine poplin, Venetian cut" },
      { label: "French", description: "Parisian style, heritage fabric" },
      { label: "UK", description: "British twill & Oxford weave" },
      { label: "USA", description: "Ralph Lauren & Gant classics" },
    ],
  },
  {
    label: "Shoes",
    slug: "shoes",
    featured: {
      img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&fit=crop&auto=format",
      headline: "Coming Soon",
      sub: "Curated footwear from premium international brands — launching shortly",
    },
    subs: [
      { label: "Formals", description: "Oxford, Derby & Loafer", comingSoon: true },
      { label: "Sneakers", description: "Nike, Adidas & New Balance", comingSoon: true },
      { label: "Joggers", description: "Puma & New Balance", comingSoon: true },
    ],
  },
];

/* ─────────────────────────────────────────────────────────
   Simple dropdown panel
───────────────────────────────────────────────────────── */
function SimpleDropdown({ item }: { item: NavItem }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.14, ease: "easeOut" }}
      className="absolute top-full left-0 z-50 min-w-[140px] bg-white border border-gray-100 shadow-[0_8px_24px_rgba(0,0,0,0.09)]"
    >
      <Link href={`/products?category=${item.slug}`}>
        <div className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500 hover:text-black hover:bg-gray-50 transition-colors border-b border-gray-100">
          All {item.label}
        </div>
      </Link>
      {item.subs.map((sub) => (
        <Link
          key={sub.label}
          href={
            sub.comingSoon
              ? `/products?category=${item.slug}`
              : `/products?category=${item.slug}&subcategory=${encodeURIComponent(sub.label)}`
          }
        >
          <div className="group flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors">
            <span className={`text-[13px] font-medium transition-colors ${sub.comingSoon ? "text-gray-300" : "text-gray-800 group-hover:text-black"}`}>
              {sub.label}
            </span>
            {sub.comingSoon && (
              <span className="text-[8px] uppercase tracking-wide font-bold text-gray-300 ml-2">Soon</span>
            )}
          </div>
        </Link>
      ))}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   Nav item trigger
───────────────────────────────────────────────────────── */
function NavItemWithMenu({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [location] = useLocation();

  const isActive =
    location.startsWith("/products") &&
    new URLSearchParams(location.split("?")[1] || "").get("category") === item.slug;

  const show = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };
  const hide = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div className="relative h-full flex items-center" onMouseEnter={show} onMouseLeave={hide}>
      <Link href={`/products?category=${item.slug}`}>
        <button
          className={`relative h-14 flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors px-1 group ${
            isActive ? "text-black" : "text-gray-500 hover:text-black"
          }`}
        >
          {item.label}
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180 text-black" : "text-gray-400"}`} />
          {/* Active underline */}
          <span
            className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gray-900 transition-all duration-200 origin-left ${
              isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
            }`}
          />
        </button>
      </Link>

      <AnimatePresence>
        {open && <SimpleDropdown item={item} />}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main layout
───────────────────────────────────────────────────────── */
export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);
  const { totalItems } = useCart();
  const { isUserLoggedIn, user, userLogout } = useUserAuth();
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">

      {/* Announcement */}
      <div className="bg-[#0a0a0a] text-white text-center py-2 px-4 text-[10px] tracking-[0.2em] uppercase font-medium">
        Free Cash on Delivery — Karachi, Lahore &amp; Islamabad
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-10 h-14 flex items-center gap-8">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 text-[22px] font-bold tracking-tight text-gray-900 font-serif">
            GeekThrifts
          </Link>

          {/* Desktop Nav — visible at 900px+ */}
          <nav className="hidden sm:flex items-center gap-6 flex-1 h-14">
            <Link href="/">
              <button
                className={`relative h-14 flex items-center text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors px-1 group ${
                  location === "/" ? "text-black" : "text-gray-500 hover:text-black"
                }`}
              >
                Home
                <span className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gray-900 transition-all duration-200 origin-left ${location === "/" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
              </button>
            </Link>
            {NAV_ITEMS.map((item) => (
              <NavItemWithMenu key={item.slug} item={item} />
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-0.5 ml-auto">
            {isUserLoggedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:text-black transition-colors" aria-label="Account">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline text-[12px] font-medium uppercase tracking-[0.06em]">{user.name.split(" ")[0]}</span>
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
              <div className="hidden sm:flex items-center gap-0 text-sm">
                <Link href="/login" className="px-3 py-2 text-[12px] font-medium uppercase tracking-[0.06em] text-gray-500 hover:text-black transition-colors">Sign In</Link>
                <span className="text-gray-200">/</span>
                <Link href="/signup" className="px-3 py-2 text-[12px] font-medium uppercase tracking-[0.06em] text-gray-500 hover:text-black transition-colors">Join</Link>
              </div>
            )}

            <Link href="/cart" className="relative px-3 py-2 text-gray-600 hover:text-black transition-colors" aria-label="Cart">
              <ShoppingBag className="w-[18px] h-[18px]" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-0.5 w-4 h-4 bg-[#0a0a0a] text-white text-[9px] flex items-center justify-center rounded-full font-bold">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile hamburger — hidden at 900px+ */}
            <button
              className="sm:hidden px-2 py-2 text-gray-700 ml-1"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile accordion menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="sm:hidden border-t border-gray-100 bg-white overflow-hidden absolute left-0 w-full z-50 shadow-lg"
            >
              <div className="px-5 pt-3 pb-5 flex flex-col">
                <Link href="/" onClick={() => setMobileOpen(false)} className="py-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-gray-900 border-b border-gray-100">
                  Home
                </Link>

                {NAV_ITEMS.map((item) => (
                  <div key={item.slug}>
                    <button
                      onClick={() => setExpandedMobile(expandedMobile === item.slug ? null : item.slug)}
                      className="w-full flex items-center justify-between py-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-gray-900 border-b border-gray-100"
                    >
                      {item.label}
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expandedMobile === item.slug ? "rotate-180" : ""}`}
                      />
                    </button>

                    <AnimatePresence>
                      {expandedMobile === item.slug && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.18 }}
                          className="overflow-hidden bg-gray-50"
                        >
                          <div className="py-2 px-4 flex flex-col">
                            <Link
                              href={`/products?category=${item.slug}`}
                              onClick={() => setMobileOpen(false)}
                              className="py-2.5 text-[12px] font-bold uppercase tracking-[0.12em] text-gray-600 hover:text-black border-b border-gray-100 transition-colors"
                            >
                              All {item.label}
                            </Link>
                            {item.subs.map((sub) => (
                              <Link
                                key={sub.label}
                                href={sub.comingSoon ? `/products?category=${item.slug}` : `/products?category=${item.slug}&subcategory=${encodeURIComponent(sub.label)}`}
                                onClick={() => setMobileOpen(false)}
                              >
                                <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-b-0">
                                  <span className={`text-[13px] font-medium ${sub.comingSoon ? "text-gray-300" : "text-gray-800"}`}>
                                    {sub.label}
                                  </span>
                                  {sub.comingSoon && (
                                    <span className="text-[8px] uppercase tracking-wide font-bold text-gray-300">Soon</span>
                                  )}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                <div className="pt-4 pb-1 flex flex-col gap-3 border-t border-gray-100 mt-2">
                  {isUserLoggedIn && user ? (
                    <button className="text-left text-[13px] font-semibold uppercase tracking-[0.1em] text-gray-700" onClick={() => { userLogout(); setMobileOpen(false); }}>
                      Sign Out
                    </button>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setMobileOpen(false)} className="text-[13px] font-semibold uppercase tracking-[0.1em] text-gray-700">Sign In</Link>
                      <Link href="/signup" onClick={() => setMobileOpen(false)} className="text-[13px] font-semibold uppercase tracking-[0.1em] text-gray-700">Create Account</Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-100 mt-8">

        {/* Newsletter */}
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

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-900 mb-3">Help</p>
            <ul className="space-y-2">
              <li><Link href="/order-status" className="text-[12px] text-gray-500 uppercase tracking-[0.06em] hover:text-black transition-colors">Order Status</Link></li>
              <li><Link href="/shipping" className="text-[12px] text-gray-500 uppercase tracking-[0.06em] hover:text-black transition-colors">Shipping &amp; Delivery</Link></li>
              <li><Link href="/return-policy" className="text-[12px] text-gray-500 uppercase tracking-[0.06em] hover:text-black transition-colors">Return Policy</Link></li>
              <li><Link href="/faqs" className="text-[12px] text-gray-500 uppercase tracking-[0.06em] hover:text-black transition-colors">FAQs</Link></li>
              <li><Link href="/privacy-policy" className="text-[12px] text-gray-500 uppercase tracking-[0.06em] hover:text-black transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-900 mb-3">Customer Care</p>
            <ul className="space-y-2.5">
              <li><span className="text-[12px] text-gray-500">COD Only — No Online Payment</span></li>
              <li><a href="https://www.instagram.com/geek.thrifts?igsh=MWJwaXVpNGZjajFwdA==" target="_blank" rel="noopener noreferrer" className="text-[12px] text-gray-500 uppercase tracking-[0.06em] hover:text-black transition-colors">Instagram</a></li>
              <li><a href="https://facebook.com" className="text-[12px] text-gray-500 uppercase tracking-[0.06em] hover:text-black transition-colors">Facebook</a></li>
              {!isUserLoggedIn && (
                <li><Link href="/signup" className="text-[12px] text-gray-500 uppercase tracking-[0.06em] hover:text-black transition-colors">Create Account</Link></li>
              )}
              {isUserLoggedIn && (
                <li><button className="text-[12px] text-gray-500 uppercase tracking-[0.06em] hover:text-black transition-colors" onClick={userLogout}>Sign Out</button></li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 py-4 px-4">
          <p className="text-center text-[11px] text-gray-400 uppercase tracking-widest">
            GeekThrifts &copy; {new Date().getFullYear()}. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
