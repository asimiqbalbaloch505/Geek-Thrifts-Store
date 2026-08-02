import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LayoutDashboard, ShoppingBag, Tags, LogOut, PackageOpen } from "lucide-react";
import { useEffect } from "react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated && location !== "/admin/login") {
      setLocation("/admin/login");
    }
  }, [isAuthenticated, location, setLocation]);

  if (!isAuthenticated) return null;

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/products", label: "Products", icon: PackageOpen },
    { href: "/admin/categories", label: "Categories", icon: Tags },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground font-sans">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-border flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="p-6 border-b border-border font-serif">
          <Link href="/" className="text-xl font-bold tracking-tighter uppercase block mb-1">
            GEEKTHRIFTS.
          </Link>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Admin Portal</div>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/admin" && location.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-none text-sm uppercase tracking-wider font-bold transition-colors ${
                  isActive 
                    ? "bg-foreground text-background" 
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <button
            onClick={() => {
              logout();
              setLocation("/admin/login");
            }}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm uppercase tracking-wider font-bold hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header & Navigation */}
        <header className="md:hidden border-b border-border bg-background sticky top-0 z-40">
          <div className="p-4 flex items-center justify-between border-b border-border">
            <Link href="/admin" className="font-serif text-lg font-bold tracking-tighter uppercase">
              GEEKTHRIFTS ADMIN
            </Link>
            <button 
              onClick={() => { logout(); setLocation("/admin/login"); }}
              className="p-1 hover:text-destructive transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Admin Navigation Bar */}
          <nav className="flex items-center overflow-x-auto p-2 gap-1 scrollbar-none bg-muted/30">
            {navItems.map((item) => {
              const isActive = location === item.href || (item.href !== "/admin" && location.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wider font-bold whitespace-nowrap transition-colors rounded-none ${
                    isActive 
                      ? "bg-foreground text-background" 
                      : "bg-background border border-border text-foreground hover:bg-accent"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-10 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}