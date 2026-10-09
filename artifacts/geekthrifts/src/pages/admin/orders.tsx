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
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Archive, Trash2, AlertTriangle, RotateCcw } from "lucide-react";

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
  isArchived?: boolean;
  items: Array<{ productId: number; productName: string; quantity: number; size: string; price: number }>;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "text-amber-700 bg-amber-50 border-amber-200",
  confirmed: "text-green-700 bg-green-50 border-green-200",
  delivered: "text-foreground bg-muted border-border",
  cancelled: "text-red-700 bg-red-50 border-red-200",
};

export default function AdminOrders() {
  const [filter, setFilter] = useState<ListOrdersStatus | "archived" | undefined>(undefined);
  const [selected, setSelected] = useState<Order | null>(null);

  // Status Change Confirmation State
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    orderId: number;
    newStatus: UpdateOrderStatusBodyStatus;
    orderNumber: string;
  } | null>(null);

  // Archive Confirmation State
  const [pendingArchive, setPendingArchive] = useState<Order | null>(null);

  const queryClient = useQueryClient();
  const updateStatus = useUpdateOrderStatus();

  const { data: orders, isLoading } = useListOrders(
    filter && filter !== "archived" ? { status: filter } : undefined,
    { query: { queryKey: getListOrdersQueryKey(filter && filter !== "archived" ? { status: filter } : undefined) } }
  );

  const { data: products } = useListProducts();

  const productImageMap = Object.fromEntries(
    (products ?? []).map((p) => [p.id, p.imageUrl ?? null])
  );

  // Initiate status change request (opens popup)
  const requestStatusChange = (order: Order, newStatus: UpdateOrderStatusBodyStatus) => {
    if (order.status === newStatus) return;
    setPendingStatusChange({
      orderId: order.id,
      newStatus,
      orderNumber: order.id.toString().padStart(5, "0"),
    });
  };

  // Confirm status update execution
  const confirmStatusChange = () => {
    if (!pendingStatusChange) return;

    updateStatus.mutate(
      { id: pendingStatusChange.orderId, data: { status: pendingStatusChange.newStatus } },
      {
        onSuccess: (updated) => {
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
          if (selected?.id === pendingStatusChange.orderId) {
            setSelected({ ...selected, status: updated.status });
          }
          setPendingStatusChange(null);
        },
        onError: () => {
          setPendingStatusChange(null);
        },
      }
    );
  };

  // Archive / Soft Delete Handler
  // Confirm Archive Order using React Query client hook
const confirmArchiveOrder = () => {
  if (!pendingArchive) return;

  updateStatus.mutate(
    { id: pendingArchive.id, data: { isArchived: true } as any },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
        if (selected?.id === pendingArchive.id) {
          setSelected(null);
        }
        setPendingArchive(null);
      },
      onError: (err) => {
        console.error("Failed to archive order", err);
        setPendingArchive(null);
      },
    }
  );
};

// Confirm Un-archive Order using React Query client hook
const handleUnarchiveOrder = (orderId: number) => {
  updateStatus.mutate(
    { id: orderId, data: { isArchived: false } as any },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
        if (selected?.id === orderId) {
          setSelected(null);
        }
      },
      onError: (err) => {
        console.error("Failed to restore order", err);
      },
    }
  );
};

  const tabs: { label: string; value: ListOrdersStatus | "archived" | undefined }[] = [
    { label: "All", value: undefined },
    { label: "Pending", value: "pending" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
    { label: "Archived", value: "archived" },
  ];

  // Filter orders for active list vs archived list
  const filteredOrders = (orders as Order[])?.filter((o) => {
    if (filter === "archived") return o.isArchived === true;
    return !o.isArchived;
  }) ?? [];

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold uppercase tracking-tighter mb-2">Orders</h1>
          <p className="text-muted-foreground text-sm">Manage incoming store orders and track fulfillment.</p>
        </div>
      </div>

      <div className="flex overflow-x-auto border-b border-border mb-6 gap-8 pb-[-1px]">
        {tabs.map((tab) => (
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
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground font-sans text-sm uppercase tracking-widest">
            {filter === "archived" ? "No archived orders found" : "No active orders found"}
          </div>
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
                <TableHead className="h-12 px-4 text-right align-middle font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow
                  key={order.id}
                  className="border-b border-border hover:bg-muted/60 transition-colors cursor-pointer"
                  onClick={() => setSelected(order)}
                >
                  <TableCell className="p-4 align-middle font-mono font-bold text-sm">
                    #{order.id.toString().padStart(5, "0")}
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
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </TableCell>
                  <TableCell className="p-4 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={order.status}
                      onValueChange={(val) => requestStatusChange(order, val as UpdateOrderStatusBodyStatus)}
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
                  <TableCell className="p-4 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                    {order.isArchived ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnarchiveOrder(order.id)}
                        title="Restore Order"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    ) : (
                      (order.status === "delivered" || order.status === "cancelled") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPendingArchive(order)}
                          title="Archive Order"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Archive className="w-4 h-4" />
                        </Button>
                      )
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* STATUS CHANGE CONFIRMATION POPUP */}
      <Dialog open={!!pendingStatusChange} onOpenChange={(open) => !open && setPendingStatusChange(null)}>
        <DialogContent className="max-w-md rounded-none border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold font-serif uppercase tracking-tight">
              <AlertTriangle className="w-5 h-5 text-amber-600" /> Confirm Status Change
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-2">
              Are you sure you want to change Order <strong>#{pendingStatusChange?.orderNumber}</strong> status to{" "}
              <span className="uppercase font-bold text-foreground">{pendingStatusChange?.newStatus}</span>?
              {pendingStatusChange?.newStatus === "cancelled" && (
                <span className="block mt-2 text-destructive font-semibold">
                  ⚠️ Marking this order as CANCELLED will automatically restore item quantities back to product inventory.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-3">
            <Button variant="outline" className="rounded-none uppercase font-bold text-xs" onClick={() => setPendingStatusChange(null)}>
              Cancel
            </Button>
            <Button className="rounded-none uppercase font-bold text-xs" disabled={updateStatus.isPending} onClick={confirmStatusChange}>
              {updateStatus.isPending ? "Updating..." : "Confirm Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ARCHIVE CONFIRMATION POPUP */}
      <Dialog open={!!pendingArchive} onOpenChange={(open) => !open && setPendingArchive(null)}>
        <DialogContent className="max-w-md rounded-none border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold font-serif uppercase tracking-tight">
              <Trash2 className="w-5 h-5 text-destructive" /> Archive Order #{pendingArchive?.id.toString().padStart(5, "0")}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-2">
              Archiving hides this completed/cancelled order from your main view. Financial revenue metrics will remain preserved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-3">
            <Button variant="outline" className="rounded-none uppercase font-bold text-xs" onClick={() => setPendingArchive(null)}>
              Cancel
            </Button>
            <Button variant="destructive" className="rounded-none uppercase font-bold text-xs" onClick={confirmArchiveOrder}>
              Archive Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ORDER DETAIL MODAL */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-xl rounded-none border-border p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
          {selected && (
            <>
              <DialogHeader className="px-6 py-5 border-b border-border shrink-0">
                <div className="flex items-center justify-between">
                  <DialogTitle className="font-serif text-xl font-bold uppercase tracking-tighter">
                    Order #{selected.id.toString().padStart(5, "0")}
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
                  {selected.customerEmail && <div className="text-sm text-muted-foreground">{selected.customerEmail}</div>}
                  <div className="text-sm text-muted-foreground mt-1">{selected.customerAddress}, {selected.customerCity}</div>
                  {selected.notes && <div className="mt-2 text-xs text-muted-foreground italic border-l-2 border-border pl-3">{selected.notes}</div>}
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

                {/* Total + Actions */}
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Total (Cash on Delivery)</span>
                    <span className="font-serif font-bold text-lg">{formatPKR(selected.totalAmount)}</span>
                  </div>
                  {selected.isArchived ? (
                    <Button
                      variant="outline"
                      className="w-full rounded-none uppercase font-bold text-xs mt-2"
                      onClick={() => handleUnarchiveOrder(selected.id)}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" /> Restore Order
                    </Button>
                  ) : (
                    (selected.status === "delivered" || selected.status === "cancelled") && (
                      <Button
                        variant="outline"
                        className="w-full rounded-none uppercase font-bold text-xs mt-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => setPendingArchive(selected)}
                      >
                        <Archive className="w-4 h-4 mr-2" /> Archive Order
                      </Button>
                    )
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}