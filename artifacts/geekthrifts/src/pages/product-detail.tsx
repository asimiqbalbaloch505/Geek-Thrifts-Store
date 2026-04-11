import { Layout } from "@/components/layout";
import { useGetProduct, getGetProductQueryKey } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { formatPKR } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus } from "lucide-react";

export default function ProductDetail() {
  const params = useParams();
  const productId = Number(params.id);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const { data: product, isLoading } = useGetProduct(productId, {
    query: { enabled: !!productId, queryKey: getGetProductQueryKey(productId) }
  });

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  const isShoes = product?.categoryName?.toLowerCase() === "shoes";

  const handleAddToCart = () => {
    if (!product) return;
    if (product.sizes?.length > 0 && !selectedSize) {
      toast({
        title: "Select a size",
        description: "Please select a size before adding to cart.",
        variant: "destructive"
      });
      return;
    }
    
    // Default size for items without sizes (like some ties)
    const sizeToUse = selectedSize || "OS";
    
    addToCart(product, sizeToUse, quantity);
    toast({
      title: "Added to cart",
      description: `${quantity}x ${product.name} (${sizeToUse}) added to your cart.`
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
            <Skeleton className="aspect-[3/4] w-full rounded-none" />
            <div className="flex flex-col pt-8">
              <Skeleton className="h-12 w-3/4 mb-4 rounded-none" />
              <Skeleton className="h-6 w-1/4 mb-12 rounded-none" />
              <Skeleton className="h-32 w-full mb-12 rounded-none" />
              <Skeleton className="h-12 w-full rounded-none" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product || isShoes) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="font-serif text-4xl font-bold tracking-tighter uppercase mb-4">
            {isShoes ? "Coming Soon" : "Product Not Found"}
          </h1>
          <p className="font-sans mb-8 text-muted-foreground">
            {isShoes ? "Shoe collection is not available yet." : "The requested product does not exist."}
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          {/* Image */}
          <div className="aspect-[3/4] border border-border bg-muted relative">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-sans text-sm uppercase tracking-widest text-muted-foreground">
                No Image Available
              </div>
            )}
            {product.stock === 0 && (
              <div className="absolute top-4 right-4 bg-foreground text-background px-4 py-2 font-sans font-bold text-xs uppercase tracking-widest">
                Sold Out
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col font-sans">
            <div className="mb-2 text-xs uppercase tracking-widest text-muted-foreground font-bold">
              {product.categoryName}
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-4 leading-none">
              {product.name}
            </h1>
            <div className="text-2xl font-bold mb-10 pb-10 border-b border-border">
              {formatPKR(product.price)}
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none mb-12 font-sans text-muted-foreground leading-relaxed">
              {product.description ? (
                <p>{product.description}</p>
              ) : (
                <p>A classic piece from GeekThrifts. Carefully selected, cleaned, and pressed for the modern professional.</p>
              )}
            </div>

            {/* Form */}
            <div className="space-y-8 mt-auto">
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-xs uppercase tracking-widest font-bold">Size</label>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`h-12 border rounded-none font-bold text-sm uppercase transition-colors ${
                          selectedSize === size 
                            ? "bg-foreground text-background border-foreground" 
                            : "border-border hover:border-foreground"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs uppercase tracking-widest font-bold mb-4 block">Quantity</label>
                <div className="flex items-center border border-border w-32 h-12">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-full flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="flex-1 text-center font-bold text-sm">
                    {quantity}
                  </div>
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-10 h-full flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full h-14 rounded-none uppercase font-bold tracking-widest text-sm"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
              
              <div className="pt-8 border-t border-border mt-12 grid grid-cols-2 gap-4 text-xs text-muted-foreground uppercase tracking-wider">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-foreground">Shipping</span>
                  <span>Nationwide Delivery</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-foreground">Returns</span>
                  <span>3-Day Policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
