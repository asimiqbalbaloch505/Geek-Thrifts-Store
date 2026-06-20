import { AdminLayout } from "@/components/admin-layout";
import { useListOrders, useUpdateOrderStatus, getListOrdersQueryKey, ListOrdersStatus, UpdateOrderStatusBodyStatus } from "@workspace/api-client-react";
import { formatPKR } from "@/lib/utils";
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
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

export default function AdminOrders() {
  const [filter, setFilter] = useState<ListOrdersStatus | undefined>(undefined);
  const queryClient = useQueryClient();
  const updateStatus = useUpdateOrderStatus();

  const { data: orders, isLoading } = useListOrders(
    filter ? { status: filter } : undefined,
    { query: { queryKey: getListOrdersQueryKey(filter ? { status: filter } : undefined) } }
  );

  const handleStatusChange = (orderId: number, newStatus: UpdateOrderStatusBodyStatus) => {
    updateStatus.mutate(
      { id: orderId, data: { status: newStatus } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
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
          <p className="text-muted-foreground text-sm">Manage customer orders and statuses.</p>
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
                <TableHead className="h-12 px-4 text-left align-middle font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Items Ordered</TableHead>
                <TableHead className="h-12 px-4 text-right align-middle font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <TableCell className="p-4 align-middle font-mono font-bold text-sm">
                    #{order.id.toString().padStart(5, '0')}
                  </TableCell>
                  <TableCell className="p-4 align-middle text-sm text-muted-foreground">
                    {format(new Date(order.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="p-4 align-middle">
                    <div className="font-bold text-sm">{order.customerName}</div>
                    <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">{order.customerCity}</div>
                  </TableCell>
                  <TableCell className="p-4 align-middle font-bold text-sm">
                    {formatPKR(order.totalAmount)}
                  </TableCell>
                  <TableCell className="p-4 align-top">
                    <div className="flex flex-col gap-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold leading-tight">{item.productName}</div>
                            <div className="flex gap-3 mt-0.5">
                              <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground border border-border px-1.5 py-0.5">Size: {item.size}</span>
                              <span className="text-[10px] uppercase tracking-widest text-muted-foreground pt-0.5">Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <div className="text-xs font-bold text-right whitespace-nowrap pt-0.5">{formatPKR(item.price)}</div>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="p-4 align-middle text-right">
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
    </AdminLayout>
  );
}
