import { AdminLayout } from "@/components/admin-layout";
import { useGetAdminStats, getGetAdminStatsQueryKey } from "@workspace/api-client-react";
import { formatPKR } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  ShoppingBag, 
  PackageOpen, 
  Tags, 
  Banknote,
  Clock,
  CheckCircle2,
  Truck,
  XCircle
} from "lucide-react";

export default function AdminDashboard() {
  const { token } = useAuth();
  const authToken = token || localStorage.getItem("adminToken") || localStorage.getItem("token");

  const { data: stats, isLoading } = useGetAdminStats(
    {
      headers: {
        Authorization: authToken ? `Bearer ${authToken}` : "",
      },
    },
    {
      query: { 
        queryKey: getGetAdminStatsQueryKey(),
        enabled: !!authToken, // Only run query when token exists
      },
    }
  );

  const statCards = [
    { label: "Total Revenue", value: stats ? formatPKR(stats.totalRevenue) : null, icon: Banknote, span: true },
    { label: "Total Orders", value: stats?.totalOrders, icon: ShoppingBag },
    { label: "Products", value: stats?.totalProducts, icon: PackageOpen },
    { label: "Categories", value: stats?.totalCategories, icon: Tags },
  ];

  const orderStats = [
    { label: "Pending", value: stats?.pendingOrders, icon: Clock, color: "text-foreground" },
    { label: "Confirmed", value: stats?.confirmedOrders, icon: CheckCircle2, color: "text-foreground" },
    { label: "Delivered", value: stats?.deliveredOrders, icon: Truck, color: "text-foreground" },
    { label: "Cancelled", value: stats?.cancelledOrders, icon: XCircle, color: "text-muted-foreground" },
  ];

  return (
    <AdminLayout>
      <h1 className="font-serif text-3xl font-bold uppercase tracking-tighter mb-8">Dashboard</h1>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((stat, i) => (
          <div key={i} className={`border border-border p-6 bg-card ${stat.span ? 'md:col-span-2 lg:col-span-1' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs uppercase tracking-widest font-bold text-muted-foreground">{stat.label}</h3>
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-24 rounded-none" />
            ) : (
              <div className="text-3xl font-bold font-serif tracking-tight">{stat.value}</div>
            )}
          </div>
        ))}
      </div>

      <h2 className="font-serif text-xl font-bold uppercase tracking-tighter mb-6 pb-2 border-b border-border">Order Status</h2>
      
      {/* Order Status Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {orderStats.map((stat, i) => (
          <div key={i} className="border border-border p-6 bg-card flex flex-col items-center justify-center text-center">
            <stat.icon className={`w-8 h-8 mb-4 ${stat.color}`} />
            {isLoading ? (
              <Skeleton className="h-10 w-16 mb-2 rounded-none" />
            ) : (
              <div className={`text-4xl font-bold font-serif tracking-tight mb-2 ${stat.color}`}>{stat.value}</div>
            )}
            <h3 className="text-xs uppercase tracking-widest font-bold text-muted-foreground">{stat.label}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-border p-8 bg-card">
          <h2 className="font-serif text-xl font-bold uppercase tracking-tighter mb-4">Quick Actions</h2>
          <div className="flex flex-col gap-3">
            <Link href="/admin/orders" className="p-4 border border-border hover:bg-foreground hover:text-background transition-colors font-bold uppercase text-sm tracking-widest text-center">
              Manage Orders
            </Link>
            <Link href="/admin/products" className="p-4 border border-border hover:bg-foreground hover:text-background transition-colors font-bold uppercase text-sm tracking-widest text-center">
              Manage Products
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}