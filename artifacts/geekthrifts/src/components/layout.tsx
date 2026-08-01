import { Link, useLocation } from "wouter";
import logoImg from "@assets/WhatsApp_Image_2026-06-19_at_21.50.52_1781941051375.jpeg";
import { useCart } from "@/hooks/use-cart";
import { useUserAuth } from "@/hooks/use-user-auth";
import { useListCategories, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { Menu, X, ShoppingBag, User, LogOut, ChevronDown, UserPlus, LogIn } from "lucide-react";
import { useState, useRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Local Category type patch to support parentId and sizes seamlessly during tsc build
type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  parentId?: number | null;
  sizes?: string[];
  isActive: boolean;
  createdAt?: string | Date;
  productCount?: number;
};

interface NestedCategory extends Category {
  subs: Category[];
}

/* ─────────────────────────────────────────────────────────
   Simple dropdown panel
───────────────────────────────────────────────────────── */
function SimpleDropdown({ item }: { item: NestedCategory }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.14, ease: "easeOut" }}
      className="absolute top-full left-0 z-50 min-w-[180px] bg-white border border-gray-100 shadow-[0_8px_24px_rgba(0,0,0,0.09)]"
    >
      <Link href={`/products?category=${item.slug}`}>
        <div className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500 hover:text-black hover:bg-gray-50 transition-colors border-b border-gray-100 cursor-pointer">
          All {item.name}
        </div>
      </Link>
      {item.subs.map((sub) => (
        <Link
          key={sub.id}
          href={`/products?category=${sub.slug}`}
        >
          <div className="group flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer">
            <span className="text-[13px] font-medium text-gray-800 group-hover:text-black transition-colors">
              {sub.name}
            </span>
          </div>
        </Link>
      ))}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   Nav item trigger
───────────────────────────────────────────────────────── */
function NavItemWithMenu({ item }: { item: NestedCategory }) {
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
          {item.name}
          {item.subs.length > 0 && (
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180 text-black" : "text-gray-400"}`} />
          )}
          <span
            className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gray-900 transition-all duration-200 origin-left ${
              isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
            }`}
          />
        </button>
      </Link>

      <AnimatePresence>
        {open && item.subs.length > 0 && <SimpleDropdown item={item} />}
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

  // Fetch Live Categories from Database
  const { data: allCategories } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() }
  });

  // Group Categories & Subcategories dynamically
  const navItems = useMemo<NestedCategory[]>(() => {
    if (!allCategories) return [];
    const activeCats = (allCategories as Category[]).filter((c) => c.isActive);
    const parents = activeCats.filter((c) => !c.parentId);

    return parents.map((parent) => ({
      ...parent,
      subs: activeCats.filter((sub) => sub.parentId === parent.id),
    }));
  }, [allCategories]);

  // Static Help & Information Links
  const helpLinks = [
    { label: "FAQs", href: "/faqs" },
    { label: "Order Status", href: "/order-status" },
    { label: "Shipping", href: "/shipping" },
    { label: "Return Policy", href: "/return-policy" },
    { label: "Privacy Policy", href: "/privacy-policy" },
  ];

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
          <Link href="/" className="flex-shrink-0">
            <img src={logoImg} alt="GeekThrifts" className="h-10 w-auto object-contain cursor-pointer" />
          </Link>

          {/* Desktop Nav */}
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
            {navItems.map((item) => (
              <NavItemWithMenu key={item.id} item={item} />
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-0.5 ml-auto">
            {isUserLoggedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:text-black transition-colors">
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

            <Link href="/cart" className="relative px-3 py-2 text-gray-600 hover:text-black transition-colors">
              <ShoppingBag className="w-[18px] h-[18px]" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-0.5 w-4 h-4 bg-[#0a0a0a] text-white text-[9px] flex items-center justify-center rounded-full font-bold">
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              className="sm:hidden px-2 py-2 text-gray-700 ml-1"
              onClick={() => setMobileOpen(!mobileOpen)}
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
              className="sm:hidden border-t border-gray-100 bg-white overflow-hidden absolute left-0 w-full z-50 shadow-lg"
            >
              <div className="px-5 pt-3 pb-5 flex flex-col">
                <Link href="/" onClick={() => setMobileOpen(false)} className="py-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-gray-900 border-b border-gray-100">
                  Home
                </Link>

                {navItems.map((item) => (
                  <div key={item.id}>
                    <button
                      onClick={() => setExpandedMobile(expandedMobile === item.slug ? null : item.slug)}
                      className="w-full flex items-center justify-between py-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-gray-900 border-b border-gray-100"
                    >
                      {item.name}
                      {item.subs.length > 0 && (
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expandedMobile === item.slug ? "rotate-180" : ""}`} />
                      )}
                    </button>

                    <AnimatePresence>
                      {expandedMobile === item.slug && item.subs.length > 0 && (
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
                              className="py-2.5 text-[12px] font-bold uppercase tracking-[0.12em] text-gray-600 hover:text-black border-b border-gray-100 transition-colors cursor-pointer"
                            >
                              All {item.name}
                            </Link>
                            {item.subs.map((sub) => (
                              <Link
                                key={sub.id}
                                href={`/products?category=${sub.slug}`}
                                onClick={() => setMobileOpen(false)}
                              >
                                <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-b-0 cursor-pointer">
                                  <span className="text-[13px] font-medium text-gray-800">
                                    {sub.name}
                                  </span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                {/* Mobile Customer Service Quick Links */}
                <div className="mt-2 pt-2 border-b border-gray-100 pb-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 my-2">Customer Care</p>
                  <div className="grid grid-cols-2 gap-2">
                    {helpLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="text-[12px] text-gray-600 hover:text-black py-1"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Mobile Auth / Account Section */}
                <div className="mt-4 pt-2">
                  {isUserLoggedIn && user ? (
                    <div className="bg-gray-50 p-3.5 rounded-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-600" />
                        <div>
                          <p className="text-[13px] font-semibold text-gray-900 leading-tight">{user.name}</p>
                          <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          userLogout();
                          setMobileOpen(false);
                        }}
                        className="w-full mt-2 flex items-center justify-center gap-2 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors rounded-none"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/login"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-center gap-1.5 py-2.5 border border-gray-900 text-gray-900 text-[11px] font-semibold uppercase tracking-[0.12em] hover:bg-gray-900 hover:text-white transition-colors"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        Sign In
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-center gap-1.5 py-2.5 bg-gray-900 text-white text-[11px] font-semibold uppercase tracking-[0.12em] hover:bg-gray-800 transition-colors"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Join
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 flex flex-col">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-8">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
          {/* Dynamic Database Categories */}
          {navItems.map((cat) => (
            <div key={cat.id}>
              <Link href={`/products?category=${cat.slug}`}>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-900 mb-3 hover:text-gray-500 transition-colors cursor-pointer">{cat.name}</p>
              </Link>
              <ul className="space-y-2">
                {cat.subs.map((sub) => (
                  <li key={sub.id}>
                    <Link href={`/products?category=${sub.slug}`}>
                      <span className="text-[12px] text-gray-500 hover:text-black uppercase tracking-[0.06em] transition-colors cursor-pointer">{sub.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Static Help & Information Section */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-900 mb-3">Customer Care</p>
            <ul className="space-y-2">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-[12px] text-gray-500 hover:text-black uppercase tracking-[0.06em] transition-colors cursor-pointer">{link.label}</span>
                  </Link>
                </li>
              ))}
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