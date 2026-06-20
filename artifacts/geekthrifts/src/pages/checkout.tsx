import { Layout } from "@/components/layout";
import { useCart } from "@/hooks/use-cart";
import { Link, useLocation } from "wouter";
import { formatPKR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateOrder } from "@workspace/api-client-react";
import { useState } from "react";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Valid email required").optional().or(z.literal("")),
  customerPhone: z.string().min(10, "Valid phone number required"),
  customerAddress: z.string().min(10, "Full address required"),
  customerCity: z.string().min(2, "City is required"),
  notes: z.string().optional(),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { items, totalAmount, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const [successOrderId, setSuccessOrderId] = useState<number | null>(null);
  
  const createOrder = useCreateOrder();
  
  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
      customerCity: "",
      notes: "",
    }
  });

  const onSubmit = (values: CheckoutValues) => {
    if (items.length === 0) return;
    
    createOrder.mutate({
      data: {
        customerName: values.customerName,
        customerEmail: values.customerEmail || null,
        customerPhone: values.customerPhone,
        customerAddress: values.customerAddress,
        customerCity: values.customerCity,
        notes: values.notes,
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          size: item.selectedSize || "OS"
        }))
      }
    }, {
      onSuccess: (order) => {
        clearCart();
        setSuccessOrderId(order.id);
      }
    });
  };

  if (successOrderId) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-32 max-w-2xl text-center border-x border-b border-border font-sans mt-12 mb-24">
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-6">
            Order Confirmed
          </h1>
          <p className="text-xl mb-8">Thank you for your order.</p>
          <div className="bg-muted p-6 border border-border mb-8 max-w-md mx-auto">
            <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground block mb-2">Order Reference</span>
            <span className="font-mono text-2xl font-bold">#{successOrderId.toString().padStart(6, '0')}</span>
          </div>
          <p className="text-muted-foreground mb-12 max-w-md mx-auto leading-relaxed">
            Your order has been received. Our team will contact you shortly on your provided phone number to confirm the details before dispatching.
          </p>
          <Link href="/products">
            <Button className="rounded-none uppercase font-bold tracking-widest text-xs h-14 px-12">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="font-serif text-4xl font-bold tracking-tighter uppercase mb-6">Your cart is empty</h1>
          <Link href="/products">
            <Button className="rounded-none uppercase font-bold tracking-widest text-xs h-14 px-12">
              Return to Shop
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-24">
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-12">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <h2 className="font-serif text-2xl font-bold uppercase mb-6 pb-4 border-b border-border">Shipping Details</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 font-sans">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-widest font-bold">Full Name</FormLabel>
                        <FormControl>
                          <Input className="h-12 rounded-none border-border focus-visible:ring-foreground" placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-widest font-bold">Phone Number</FormLabel>
                        <FormControl>
                          <Input className="h-12 rounded-none border-border focus-visible:ring-foreground" placeholder="0300 1234567" {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest font-bold">
                        Email Address <span className="text-muted-foreground font-normal normal-case tracking-normal">(optional — for order updates)</span>
                      </FormLabel>
                      <FormControl>
                        <Input className="h-12 rounded-none border-border focus-visible:ring-foreground" type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="customerAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest font-bold">Delivery Address</FormLabel>
                      <FormControl>
                        <Textarea 
                          className="min-h-24 rounded-none border-border focus-visible:ring-foreground resize-none" 
                          placeholder="House/Apartment, Street, Area" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="customerCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest font-bold">City</FormLabel>
                      <FormControl>
                        <Input className="h-12 rounded-none border-border focus-visible:ring-foreground" placeholder="Karachi" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest font-bold">Special Instructions (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          className="min-h-20 rounded-none border-border focus-visible:ring-foreground resize-none" 
                          placeholder="Any specific delivery instructions" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full h-16 rounded-none uppercase font-bold tracking-widest text-sm mt-8"
                  disabled={createOrder.isPending}
                >
                  {createOrder.isPending ? "Processing..." : "Place Order (Cash on Delivery)"}
                </Button>
              </form>
            </Form>
          </div>
          
          <div className="lg:col-span-5">
            <div className="border border-border p-6 bg-muted/30 sticky top-24 font-sans">
              <h2 className="font-serif text-xl font-bold uppercase mb-6 pb-4 border-b border-border">Order Summary</h2>
              
              <div className="flex flex-col gap-4 mb-6 pb-6 border-b border-border max-h-[40vh] overflow-y-auto">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.selectedSize}`} className="flex gap-4">
                    <div className="w-16 h-20 bg-muted border border-border flex-shrink-0">
                      {item.product.imageUrl && (
                        <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col py-1">
                      <span className="font-serif font-bold uppercase text-sm">{item.product.name}</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        Size: {item.selectedSize === "OS" ? "One Size" : item.selectedSize} • Qty: {item.quantity}
                      </span>
                      <span className="font-bold text-sm mt-auto">{formatPKR(item.product.price * item.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center mb-4 text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-bold">{formatPKR(totalAmount)}</span>
              </div>
              
              <div className="flex justify-between items-center mb-6 text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-bold uppercase tracking-widest text-[10px]">TBD</span>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <span className="font-bold uppercase tracking-widest text-sm">Total</span>
                <span className="font-bold text-xl">{formatPKR(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
