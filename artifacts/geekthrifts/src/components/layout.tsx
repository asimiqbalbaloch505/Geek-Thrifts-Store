import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useUserAuth } from "@/hooks/use-user-auth";
import { Menu, X, ShoppingBag, User, LogOut, ArrowRight } from "lucide-react";
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
   Mega-menu panel
───────────────────────────────────────────────────────── */
function MegaMenu({ item }: { item: NavItem }) {
  const isShoes = item.slug === "shoes";

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="absolute top-full left-1/2 -translate-x-1/2 w-[820px] max-w-[96vw] bg-white shadow-[0_8px_40px_rgba(0,0,0,0.10)] border border-gray-100 z-50"
    >
      <div className="grid grid-cols-[1fr_280px]">
        {/* Left — subcategories */}
        <div className="py-8 px-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-6">
            Shop by Origin
          </p>

          <div className="grid grid-cols-2 gap-x-8 gap-y-1">
            {item.subs.map((sub) => (
              <Link
                key={sub.label}
                href={
                  isShoes
                    ? "/products?category=shoes"
                    : `/products?category=${item.slug}&subcategory=${encodeURIComponent(sub.label)}`
                }
              >
                <div
                  className={`group flex items-start justify-between py-3.5 border-b border-gray-80 transition-colors ${
                    sub.comingSoon ? "cursor-default opacity-60" : "hover:border-gray-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[14px] font-semibold tracking-tight transition-colors ${
                          sub.comingSoon ? "text-gray-500" : "text-gray-900 group-hover:text-black"
                        }`}
                      >
                        {sub.label}
                      </span>
                      {sub.comingSoon && (
                        <span className="text-[9px] uppercase tracking-[0.15em] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5">
                          Soon
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">{sub.description}</p>
                  </div>
                  {!sub.comingSoon && (
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all mt-1 flex-shrink-0" />
                  )}
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6">
            <Link href={`/products?category=${item.slug}`}>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 hover:text-gray-900 transition-colors border-b border-transparent hover:border-gray-400 pb-0.5">
                View All {item.label}
                <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
        </div>

        {/* Right — featured image */}
        <div className="relative overflow-hidden bg-gray-50">
          <img
            src={item.featured.img}
            alt={item.label}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="text-white text-[14px] font-bold leading-tight mb-1">
              {item.featured.headline}
            </p>
            <p className="text-white/70 text-[11px] leading-relaxed">
              {item.featured.sub}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   Nav item with mega-menu trigger
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
    timeoutRef.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <div className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <Link href={`/products?category=${item.slug}`}>
        <button
          className={`relative h-14 flex items-center gap-0 text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors px-1 ${
            isActive ? "text-black" : "text-gray-500 hover:text-black"
          }`}
        >
          {item.label}
          {/* animated underline */}
          <span
            className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gray-900 transition-transform duration-200 origin-left ${
              open || isActive ? "scale-x-100" : "scale-x-0"
            }`}
          />
        </button>
      </Link>

      <AnimatePresence>
        {open && <MegaMenu item={item} />}
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
        <div className="max-w-[1400px] mx-auto px-4 md:px-10 h-14 flex items-center gap-10">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 text-[22px] font-bold tracking-tight text-gray-900 font-serif mr-2">
            GeekThrifts
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 flex-1 h-14">
            <Link href="/">
              <button
                className={`relative h-14 flex items-center text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors px-1 ${
                  location === "/" ? "text-black" : "text-gray-500 hover:text-black"
                }`}
              >
                Home
                <span className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gray-900 transition-transform duration-200 origin-left ${location === "/" ? "scale-x-100" : "scale-x-0"}`} />
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
                    <span className="hidden md:inline text-[12px] font-medium uppercase tracking-[0.06em]">{user.name.split(" ")[0]}</span>
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
              <div className="hidden md:flex items-center gap-0 text-sm">
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

            <button
              className="md:hidden px-2 py-2 text-gray-700 ml-1"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-gray-100 bg-white overflow-hidden absolute left-0 w-full z-50 shadow-lg"
            >
              <div className="px-5 pt-3 pb-5 flex flex-col">
                <Link href="/" onClick={() => setMobileOpen(false)} className="py-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-gray-900 border-b border-gray-100">Home</Link>
                {NAV_ITEMS.map((item) => (
                  <div key={item.slug}>
                    <button
                      onClick={() => setExpandedMobile(expandedMobile === item.slug ? null : item.slug)}
                      className="w-full flex items-center justify-between py-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-gray-900 border-b border-gray-100"
                    >
                      {item.label}
                      <motion.span
                        animate={{ rotate: expandedMobile === item.slug ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-gray-400"
                      >
                        ▾
                      </motion.span>
                    </button>

                    <AnimatePresence>
                      {expandedMobile === item.slug && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.18 }}
                          className="overflow-hidden"
                        >
                          <div className="py-2 pl-3 pr-1 border-b border-gray-100 flex flex-col gap-0.5">
                            <Link
                              href={`/products?category=${item.slug}`}
                              onClick={() => setMobileOpen(false)}
                              className="py-2 text-[12px] font-semibold text-gray-700 hover:text-black transition-colors"
                            >
                              All {item.label}
                            </Link>
                            {item.subs.map((sub) => (
                              <Link
                                key={sub.label}
                                href={sub.comingSoon ? "/products?category=shoes" : `/products?category=${item.slug}&subcategory=${encodeURIComponent(sub.label)}`}
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center justify-between py-2 text-[12px] text-gray-500 hover:text-black transition-colors"
                              >
                                <span>{sub.label}</span>
                                {sub.comingSoon && (
                                  <span className="text-[9px] uppercase tracking-wide font-bold bg-gray-100 text-gray-400 px-1.5 py-0.5">Soon</span>
                                )}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                <div className="pt-4 pb-1 flex flex-col gap-3">
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
              {["Order Status", "Shipping & Delivery", "Return Policy", "FAQs", "Privacy Policy"].map(item => (
                <li key={item}>
                  <span className="text-[12px] text-gray-500 uppercase tracking-[0.06em] cursor-default">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-900 mb-3">Customer Care</p>
            <ul className="space-y-2.5">
              <li><span className="text-[12px] text-gray-500">COD Only — No Online Payment</span></li>
              <li><a href="https://instagram.com" className="text-[12px] text-gray-500 uppercase tracking-[0.06em] hover:text-black transition-colors">Instagram</a></li>
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
