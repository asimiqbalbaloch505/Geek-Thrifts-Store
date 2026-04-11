import { Layout } from "@/components/layout";
import { useCart } from "@/hooks/use-cart";
import { Link } from "wouter";
import { formatPKR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, totalAmount } = useCart();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-24">
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-12">Your Cart</h1>
        
        {items.length === 0 ? (
          <div className="text-center py-20 border border-border">
            <h2 className="font-serif text-2xl font-bold uppercase mb-4">Your cart is empty</h2>
            <p className="font-sans text-muted-foreground mb-8">Discover our collection of curated formalwear.</p>
            <Link href="/products">
              <Button size="lg" className="rounded-none uppercase font-bold tracking-widest text-xs h-14 px-8">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {items.map((item) => (
                <div key={`${item.product.id}-${item.selectedSize}`} className="flex gap-6 border border-border p-4 relative pr-12">
                  <Link href={`/products/${item.product.id}`} className="w-24 h-32 flex-shrink-0 bg-muted border border-border block">
                    {item.product.imageUrl ? (
                      <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] uppercase text-muted-foreground">No img</div>
                    )}
                  </Link>
                  
                  <div className="flex-1 flex flex-col font-sans">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
                      {item.product.categoryName}
                    </div>
                    <Link href={`/products/${item.product.id}`} className="font-serif text-xl font-bold uppercase hover:underline underline-offset-4">
                      {item.product.name}
                    </Link>
                    <div className="text-sm font-bold mt-1 mb-4">
                      {formatPKR(item.product.price)}
                    </div>
                    
                    <div className="mt-auto flex flex-wrap gap-6 items-end">
                      {item.selectedSize && item.selectedSize !== "OS" && (
                        <div>
                          <span className="text-[10px] uppercase tracking-widest font-bold block mb-1 text-muted-foreground">Size</span>
                          <span className="text-sm font-bold">{item.selectedSize}</span>
                        </div>
                      )}
                      
                      <div>
                        <span className="text-[10px] uppercase tracking-widest font-bold block mb-1 text-muted-foreground">Quantity</span>
                        <div className="flex items-center border border-border w-24 h-8">
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity - 1)}
                            className="w-8 h-full flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <div className="flex-1 text-center font-bold text-xs">
                            {item.quantity}
                          </div>
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity + 1)}
                            className="w-8 h-full flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="border border-border p-6 font-sans sticky top-24">
                <h2 className="font-serif text-xl font-bold uppercase mb-6 border-b border-border pb-4">Order Summary</h2>
                
                <div className="flex justify-between items-center mb-4 text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-bold">{formatPKR(totalAmount)}</span>
                </div>
                
                <div className="flex justify-between items-center mb-6 text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-bold uppercase tracking-widest text-[10px]">Calculated at checkout</span>
                </div>
                
                <div className="flex justify-between items-center mb-8 pt-4 border-t border-border">
                  <span className="font-bold uppercase tracking-widest text-sm">Total</span>
                  <span className="font-bold text-xl">{formatPKR(totalAmount)}</span>
                </div>
                
                <Link href="/checkout">
                  <Button size="lg" className="w-full rounded-none uppercase font-bold tracking-widest text-xs h-14">
                    Proceed to Checkout
                  </Button>
                </Link>
                
                <div className="mt-6 text-[10px] text-center uppercase tracking-widest text-muted-foreground">
                  Cash on delivery available nationwide
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
