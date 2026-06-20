import { AdminLayout } from "@/components/admin-layout";
import { useListOrders, useUpdateOrderStatus, getListOrdersQueryKey, ListOrdersStatus, UpdateOrderStatusBodyStatus, useListProducts } from "@workspace/api-client-react";
import { formatPKR, getImageUrl } from "@/lib/utils";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

type Order = {
  id: number;
  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  notes?: string | null;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: Array<{ productId: number; productName: string; quantity: number; size: string; price: number }>;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "text-amber-700 bg-amber-50 border-amber-200",
  confirmed: "text-green-700 bg-green-50 border-green-200",
  delivered: "text-foreground bg-muted border-border",
  cancelled: "text-red-700 bg-red-50 border-red-200",
};

export default function AdminOrders() {
  const [filter, setFilter] = useState<ListOrdersStatus | undefined>(undefined);
  const [selected, setSelected] = useState<Order | null>(null);
  const queryClient = useQueryClient();
  const updateStatus = useUpdateOrderStatus();

  const { data: orders, isLoading } = useListOrders(
    filter ? { status: filter } : undefined,
    { query: { queryKey: getListOrdersQueryKey(filter ? { status: filter } : undefined) } }
  );

  const { data: products } = useListProducts();

  const productImageMap = Object.fromEntries(
    (products ?? []).map(p => [p.id, p.images?.[0] ?? null])
  );

  const handleStatusChange = (orderId: number, newStatus: UpdateOrderStatusBodyStatus) => {
    updateStatus.mutate(
      { id: orderId, data: { status: newStatus } },
      {
        onSuccess: (updated) => {
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
          if (selected?.id === orderId) {
            setSelected({ ...selected, status: updated.status });
          }
        }
      }
    );
  };

  const tabs: { label: string; value: ListOrdersStatus | undefined }[] = [
    { label: "All", value: undefined },
    { label: "Pending", value: "pending" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
  ];

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold uppercase tracking-tighter mb-2">Orders</h1>
          <p className="text-muted-foreground text-sm">Tap any order to see full details.</p>
        </div>
      </div>

      <div className="flex overflow-x-auto border-b border-border mb-6 gap-8 pb-[-1px]">
        {tabs.map(tab => (
          <button
            key={tab.label}
            onClick={() => setFilter(tab.value)}
            className={`pb-3 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors border-b-2 ${
              filter === tab.value
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground font-sans text-sm uppercase tracking-widest">Loading...</div>
        ) : !orders || orders.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground font-sans text-sm uppercase tracking-widest">No orders found</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="h-12 px-4 text-left align-middle font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Order ID</TableHead>
                <TableHead className="h-12 px-4 text-left align-middle font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Date</TableHead>
                <TableHead className="h-12 px-4 text-left align-middle font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Customer</TableHead>
                <TableHead className="h-12 px-4 text-left align-middle font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Total</TableHead>
                <TableHead className="h-12 px-4 text-left align-middle font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Items</TableHead>
                <TableHead className="h-12 px-4 text-right align-middle font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(orders as Order[]).map((order) => (
                <TableRow
                  key={order.id}
                  className="border-b border-border hover:bg-muted/60 transition-colors cursor-pointer"
                  onClick={() => setSelected(order)}
                >
                  <TableCell className="p-4 align-middle font-mono font-bold text-sm">
                    #{order.id.toString().padStart(5, '0')}
                  </TableCell>
                  <TableCell className="p-4 align-middle text-sm text-muted-foreground">
                    {format(new Date(order.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="p-4 align-middle">
                    <div className="font-bold text-sm">{order.customerName}</div>
                    <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                    <div className="text-xs text-muted-foreground">{order.customerCity}</div>
                  </TableCell>
                  <TableCell className="p-4 align-middle font-bold text-sm">
                    {formatPKR(order.totalAmount)}
                  </TableCell>
                  <TableCell className="p-4 align-middle text-sm text-muted-foreground">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </TableCell>
                  <TableCell className="p-4 align-middle text-right" onClick={e => e.stopPropagation()}>
                    <Select
                      value={order.status}
                      onValueChange={(val) => handleStatusChange(order.id, val as UpdateOrderStatusBodyStatus)}
                      disabled={updateStatus.isPending}
                    >
                      <SelectTrigger className="w-[140px] ml-auto h-8 rounded-none border-border text-xs font-bold uppercase tracking-wider">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-border">
                        <SelectItem value="pending" className="text-xs font-bold uppercase tracking-wider cursor-pointer rounded-none">Pending</SelectItem>
                        <SelectItem value="confirmed" className="text-xs font-bold uppercase tracking-wider cursor-pointer rounded-none">Confirmed</SelectItem>
                        <SelectItem value="delivered" className="text-xs font-bold uppercase tracking-wider cursor-pointer rounded-none">Delivered</SelectItem>
                        <SelectItem value="cancelled" className="text-xs font-bold uppercase tracking-wider cursor-pointer rounded-none">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Order Detail Modal */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-xl rounded-none border-border p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
          {selected && (
            <>
              <DialogHeader className="px-6 py-5 border-b border-border shrink-0">
                <div className="flex items-center justify-between">
                  <DialogTitle className="font-serif text-xl font-bold uppercase tracking-tighter">
                    Order #{selected.id.toString().padStart(5, '0')}
                  </DialogTitle>
                  <span className={`text-[10px] font-bold uppercase tracking-widest border px-2 py-1 ${STATUS_COLORS[selected.status] ?? ""}`}>
                    {selected.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(selected.createdAt), "MMMM d, yyyy · h:mm a")}
                </p>
              </DialogHeader>

              <div className="overflow-y-auto flex-1">
                {/* Customer */}
                <div className="px-6 py-4 border-b border-border">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-3">Customer</p>
                  <div className="font-bold text-sm mb-0.5">{selected.customerName}</div>
                  <div className="text-sm text-muted-foreground">{selected.customerPhone}</div>
                  {selected.customerEmail && (
                    <div className="text-sm text-muted-foreground">{selected.customerEmail}</div>
                  )}
                  <div className="text-sm text-muted-foreground mt-1">{selected.customerAddress}, {selected.customerCity}</div>
                  {selected.notes && (
                    <div className="mt-2 text-xs text-muted-foreground italic border-l-2 border-border pl-3">{selected.notes}</div>
                  )}
                </div>

                {/* Items */}
                <div className="px-6 py-4 border-b border-border">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-3">Items Ordered</p>
                  <div className="flex flex-col gap-4">
                    {selected.items.map((item, i) => {
                      const imgUrl = getImageUrl(productImageMap[item.productId]);
                      return (
                        <div key={i} className="flex gap-4 items-start">
                          <div className="w-20 h-20 border border-border shrink-0 overflow-hidden bg-muted">
                            {imgUrl ? (
                              <img src={imgUrl} alt={item.productName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px] uppercase tracking-widest">No img</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm">{item.productName}</div>
                            <div className="flex gap-3 mt-1.5">
                              <span className="text-[10px] uppercase tracking-widest font-bold border border-border px-2 py-0.5">Size: {item.size}</span>
                              <span className="text-[10px] uppercase tracking-widest text-muted-foreground py-0.5">Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <div className="text-sm font-bold whitespace-nowrap">{formatPKR(item.price)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Total + Status */}
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Total (Cash on Delivery)</span>
                    <span className="font-serif font-bold text-lg">{formatPKR(selected.totalAmount)}</span>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2">Update Status</p>
                    <Select
                      value={selected.status}
                      onValueChange={(val) => handleStatusChange(selected.id, val as UpdateOrderStatusBodyStatus)}
                      disabled={updateStatus.isPending}
                    >
                      <SelectTrigger className="w-full h-11 rounded-none border-border text-xs font-bold uppercase tracking-wider">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-border">
                        <SelectItem value="pending" className="text-xs font-bold uppercase tracking-wider cursor-pointer rounded-none">Pending</SelectItem>
                        <SelectItem value="confirmed" className="text-xs font-bold uppercase tracking-wider cursor-pointer rounded-none">Confirmed</SelectItem>
                        <SelectItem value="delivered" className="text-xs font-bold uppercase tracking-wider cursor-pointer rounded-none">Delivered</SelectItem>
                        <SelectItem value="cancelled" className="text-xs font-bold uppercase tracking-wider cursor-pointer rounded-none">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
