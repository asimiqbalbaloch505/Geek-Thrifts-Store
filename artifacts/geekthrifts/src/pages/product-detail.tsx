import { Layout } from "@/components/layout";
import { useGetProduct, getGetProductQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { formatPKR, getImageUrl } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
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

  const handleAddToCart = () => {
    if (!product) return;
    if (product.sizes?.length > 0 && !selectedSize) {
      toast({ title: "Select a size", description: "Please choose a size before adding to cart.", variant: "destructive" });
      return;
    }
    const sizeToUse = selectedSize || "One Size";
    addToCart(product, sizeToUse, quantity);
    toast({ title: "Added to cart", description: `${quantity}x ${product.name} added to your cart.` });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-10 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20">
            <Skeleton className="aspect-[3/4] w-full rounded-none bg-gray-100" />
            <div className="flex flex-col pt-4 space-y-4">
              <Skeleton className="h-5 w-20 rounded-none bg-gray-100" />
              <Skeleton className="h-10 w-3/4 rounded-none bg-gray-100" />
              <Skeleton className="h-6 w-1/4 rounded-none bg-gray-100" />
              <Skeleton className="h-24 w-full rounded-none bg-gray-100" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="max-w-[1400px] mx-auto px-4 py-28 text-center">
          <h1 className="font-serif text-3xl font-bold tracking-tight mb-3 text-gray-900">Product Not Found</h1>
          <p className="text-[14px] text-gray-500 mb-6">This product doesn't exist or has been removed.</p>
          <Link href="/products">
            <button className="h-10 px-8 bg-gray-900 text-white text-[12px] uppercase tracking-[0.12em] font-semibold hover:bg-gray-800 transition-colors">
              Back to Products
            </button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-10 md:py-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[12px] text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <span>/</span>
          <Link href={`/products?category=${product.categoryName?.toLowerCase()}`} className="hover:text-gray-700 transition-colors capitalize">
            {product.categoryName}
          </Link>
          <span>/</span>
          <span className="text-gray-700 truncate">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20">
          {/* Image */}
          <div className="aspect-[3/4] bg-gray-50 relative overflow-hidden">
            {product.imageUrl ? (
              <img
                src={getImageUrl(product.imageUrl)}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs uppercase tracking-widest">
                No Image
              </div>
            )}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <span className="text-[13px] uppercase tracking-widest font-semibold text-gray-700">Sold Out</span>
              </div>
            )}
            {product.stock > 0 && product.stock <= 2 && (
              <span className="absolute top-3 left-3 bg-gray-900 text-white text-[10px] px-2.5 py-1 uppercase tracking-wider font-semibold">
                Last {product.stock}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-semibold mb-2">{product.categoryName}</p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-gray-900 leading-tight mb-3">
              {product.name}
            </h1>
            <p className="text-xl font-bold text-gray-900 mb-6 pb-6 border-b border-gray-100">
              {formatPKR(product.price)}
            </p>

            <p className="text-[14px] text-gray-500 leading-relaxed mb-8">
              {product.description ?? "A carefully selected piece from GeekThrifts. Authenticated, cleaned, and pressed for the modern Pakistani professional."}
            </p>

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && product.sizes[0] !== "One Size" && (
              <div className="mb-6">
                <p className="text-[11px] uppercase tracking-[0.15em] font-semibold text-gray-700 mb-3">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-10 min-w-[44px] px-3 border text-[12px] font-semibold uppercase transition-colors ${
                        selectedSize === size
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-900"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <p className="text-[11px] uppercase tracking-[0.15em] font-semibold text-gray-700 mb-3">Quantity</p>
              <div className="flex items-center border border-gray-200 w-fit">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-[14px] font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="h-12 w-full bg-gray-900 text-white text-[12px] uppercase tracking-[0.15em] font-semibold hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mb-4"
            >
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100 mt-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.1em] font-semibold text-gray-900 mb-0.5">Delivery</p>
                <p className="text-[12px] text-gray-500">Cash on Delivery, Nationwide</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.1em] font-semibold text-gray-900 mb-0.5">Returns</p>
                <p className="text-[12px] text-gray-500">3-Day Return Policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
