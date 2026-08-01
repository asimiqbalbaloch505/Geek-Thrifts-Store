import { Layout } from "@/components/layout";
import { useGetProduct, getGetProductQueryKey, useListProducts, Product } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { formatPKR, getImageUrl } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useMemo } from "react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, ChevronDown, ChevronUp } from "lucide-react";

type SizeInventoryItem = { size: string; qty: number };

const NO_SIZE_SLUGS = new Set(["watches", "belts"]);

const TIE_LENGTH_GUIDE = [
  { label: "Regular", inches: '57–58"', cm: "145–147 cm", for: '5\'8"–6\'0" (173–183 cm)' },
  { label: "Short", inches: '55–56"', cm: "140–142 cm", for: 'Under 5\'7" (170 cm)' },
  { label: "Long / XL", inches: '59–63"', cm: "150–160 cm", for: '6\'1"+ (185+ cm)' },
  { label: "Extra Long", inches: '64–67"', cm: "162–170 cm", for: '6\'4"+ (193+ cm)' },
];

const TIE_WIDTH_GUIDE = [
  { label: "Classic", inches: '3.25–3.5"', cm: "8.3–8.9 cm", for: "Traditional, full-spread collar suits" },
  { label: "Slim", inches: '2–2.5"', cm: "5–6.3 cm", for: "Modern slim-fit suits, smaller builds" },
  { label: "Skinny", inches: 'Under 2"', cm: "Under 5 cm", for: "Fashion-forward, very slim lapels" },
];

function TieSizeGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.1em] font-semibold text-gray-500 hover:text-black transition-colors mb-3"
      >
        Tie Size Guide
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {open && (
        <div className="border border-gray-100 text-[11px] mb-4">
          <div className="px-3 py-2 bg-gray-50 text-[10px] uppercase tracking-[0.12em] font-bold text-gray-500">
            Length
          </div>
          <div className="grid grid-cols-4 px-3 py-1.5 bg-gray-50/60 font-semibold uppercase tracking-[0.06em] text-gray-400 border-b border-gray-100 text-[10px]">
            <span>Name</span>
            <span>Inches</span>
            <span>cm</span>
            <span>Best For</span>
          </div>
          {TIE_LENGTH_GUIDE.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-4 px-3 py-2 border-b border-gray-50 text-gray-600"
            >
              <span className="font-semibold text-gray-900">{row.label}</span>
              <span>{row.inches}</span>
              <span className="text-gray-400">{row.cm}</span>
              <span>{row.for}</span>
            </div>
          ))}
          <div className="px-3 py-2 bg-gray-50 text-[10px] uppercase tracking-[0.12em] font-bold text-gray-500 border-t border-gray-100">
            Width
          </div>
          <div className="grid grid-cols-4 px-3 py-1.5 bg-gray-50/60 font-semibold uppercase tracking-[0.06em] text-gray-400 border-b border-gray-100 text-[10px]">
            <span>Name</span>
            <span>Inches</span>
            <span>cm</span>
            <span>Best For</span>
          </div>
          {TIE_WIDTH_GUIDE.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-4 px-3 py-2 border-b border-gray-50 text-gray-600 last:border-b-0"
            >
              <span className="font-semibold text-gray-900">{row.label}</span>
              <span>{row.inches}</span>
              <span className="text-gray-400">{row.cm}</span>
              <span>{row.for}</span>
            </div>
          ))}
          <div className="px-3 py-2 bg-gray-50 text-gray-400 text-[10px] tracking-wide border-t border-gray-100">
            Tip: The tie tip should land at the middle of your belt buckle when tied.
          </div>
        </div>
      )}
    </div>
  );
}

function resolveSizeInventory(product: any): SizeInventoryItem[] {
  if (!product) return [];

  let directInv = product.sizeInventory ?? product.size_inventory;
  if (typeof directInv === "string") {
    try {
      directInv = JSON.parse(directInv);
    } catch {
      directInv = [];
    }
  }
  if (Array.isArray(directInv) && directInv.length > 0) {
    return directInv;
  }

  let rawSizes = product.sizes ?? product.category?.sizes ?? product.categorySizes;
  if (typeof rawSizes === "string") {
    try {
      rawSizes = JSON.parse(rawSizes);
    } catch {
      rawSizes = [];
    }
  }

  if (Array.isArray(rawSizes) && rawSizes.length > 0) {
    const totalStock = product.stock ?? 1;
    return rawSizes.map((sz: string) => ({
      size: String(sz),
      qty: totalStock > 0 ? totalStock : 0,
    }));
  }

  return [];
}

export default function ProductDetail() {
  const params = useParams();
  const productId = Number(params.id);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const { data: product, isLoading } = useGetProduct(productId, {
    query: { enabled: !!productId, queryKey: getGetProductQueryKey(productId) },
  });

  const { data: allProducts } = useListProducts();

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  const categorySlug = product?.categoryName ? product.categoryName.toLowerCase() : "";
  const isNoSize = NO_SIZE_SLUGS.has(categorySlug);
  const isTie = categorySlug.includes("tie");
  const isShoe = categorySlug.includes("shoe");

  const sizeInventory = useMemo(() => resolveSizeInventory(product), [product]);
  const hasSizeInventory = sizeInventory.length > 0 && !isNoSize;

  useEffect(() => {
    if (hasSizeInventory) {
      const availableSizes = sizeInventory.filter((s) => s.qty > 0);
      if (availableSizes.length === 1) {
        setSelectedSize(availableSizes[0].size);
      }
    }
  }, [hasSizeInventory, sizeInventory]);

  // Compute related products for "You May Also Like"
  const relatedProducts = useMemo(() => {
    if (!product || !allProducts) return [];
    return allProducts
      .filter(
        (p: Product) =>
          p.id !== product.id &&
          p.isActive !== false &&
          (p.categoryId === product.categoryId ||
            p.categoryName?.toLowerCase() === product.categoryName?.toLowerCase())
      )
      .slice(0, 4);
  }, [product, allProducts]);

  const totalStock = product?.stock ?? 0;

  const selectedSizeItem = hasSizeInventory
    ? sizeInventory.find((s) => s.size === selectedSize)
    : null;
  const selectedSizeStock = selectedSizeItem?.qty ?? 0;

  const maxQty = hasSizeInventory
    ? selectedSize
      ? selectedSizeStock
      : 0
    : totalStock;

  const handleAddToCart = () => {
    if (!product) return;

    if (hasSizeInventory && !selectedSize) {
      toast({
        title: "Select a size",
        description: "Please choose a size before adding to cart.",
        variant: "destructive",
      });
      return;
    }
    if (hasSizeInventory && selectedSizeStock === 0) {
      toast({
        title: "Size unavailable",
        description: "This size is currently out of stock.",
        variant: "destructive",
      });
      return;
    }
    if (!hasSizeInventory && totalStock === 0) {
      toast({
        title: "Out of stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      });
      return;
    }

    const sizeLabel = selectedSize || "One Size";
    addToCart(product, sizeLabel, quantity);
    toast({
      title: "Added to cart",
      description: `${quantity}x ${product.name} added to your cart.`,
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-10 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20">
            <Skeleton className="h-[450px] w-full rounded-none bg-gray-100" />
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
          <h1 className="font-serif text-3xl font-bold tracking-tight mb-3 text-gray-900">
            Product Not Found
          </h1>
          <p className="text-[14px] text-gray-500 mb-6">
            This product doesn't exist or has been removed.
          </p>
          <Link href="/products">
            <button className="h-10 px-8 bg-gray-900 text-white text-[12px] uppercase tracking-[0.12em] font-semibold hover:bg-gray-800 transition-colors">
              Back to Products
            </button>
          </Link>
        </div>
      </Layout>
    );
  }

  const isCompletelyOutOfStock = totalStock === 0;

  return (
    <Layout>
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[12px] text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-700 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link
            href={`/products?category=${categorySlug}`}
            className="hover:text-gray-700 transition-colors capitalize"
          >
            {product.categoryName || "Category"}
          </Link>
          <span>/</span>
          <span className="text-gray-700 truncate">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Image Container with Controlled Height */}
          <div className="w-full max-h-[500px] lg:max-h-[550px] aspect-[4/5] bg-gray-50 relative overflow-hidden rounded-sm border border-gray-100 flex items-center justify-center">
            {product.imageUrl ? (
              <img
                src={getImageUrl(product.imageUrl)}
                alt={product.name}
                className="w-full h-full object-contain object-center p-2"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs uppercase tracking-widest">
                No Image
              </div>
            )}
            {isCompletelyOutOfStock && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <span className="text-[13px] uppercase tracking-widest font-semibold text-gray-700">
                  Out of Stock
                </span>
              </div>
            )}
            {!isCompletelyOutOfStock && totalStock <= 2 && (
              <span className="absolute top-3 left-3 bg-gray-900 text-white text-[10px] px-2.5 py-1 uppercase tracking-wider font-semibold">
                Last {totalStock}
              </span>
            )}
          </div>

          {/* Product Info - Sticky sidebar for desktop */}
          <div className="flex flex-col md:sticky md:top-24">
            <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-semibold mb-2">
              {product.categoryName || "GeekThrifts"}
            </p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-gray-900 leading-tight mb-3">
              {product.name}
            </h1>
            <p className="text-xl font-bold text-gray-900 mb-6 pb-6 border-b border-gray-100">
              {formatPKR(product.price)}
            </p>

            <p className="text-[14px] text-gray-500 leading-relaxed mb-8">
              {product.description ??
                "A carefully selected piece from GeekThrifts. Authenticated, cleaned, and pressed for the modern Pakistani professional."}
            </p>

            {/* Size Selector */}
            {hasSizeInventory && (
              <div className="mb-6">
                <p className="text-[11px] uppercase tracking-[0.15em] font-semibold text-gray-700 mb-3">
                  {isShoe ? "Shoe Size (UK)" : "Size"}
                  {selectedSize && (
                    <span className="ml-2 text-gray-400 normal-case tracking-normal font-normal">
                      — {isShoe ? `UK ${selectedSize}` : selectedSize}
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizeInventory.map(({ size, qty }) => {
                    const isOutOfStock = qty === 0;
                    const isSelected = selectedSize === size;
                    const label = isShoe ? `UK ${size}` : size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          if (isOutOfStock) {
                            toast({
                              title: "Size unavailable",
                              description: `${label} is currently out of stock.`,
                              variant: "destructive",
                            });
                            return;
                          }
                          setSelectedSize(size);
                          setQuantity(1);
                        }}
                        title={isOutOfStock ? "Out of stock" : label}
                        className={`h-10 px-3 border text-[11px] font-semibold uppercase tracking-wide transition-colors whitespace-nowrap relative ${
                          isOutOfStock
                            ? "border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50"
                            : isSelected
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-900"
                        }`}
                      >
                        {label}
                        {isOutOfStock && (
                          <span className="absolute -top-1.5 -right-1.5 text-[8px] bg-gray-400 text-white px-1 rounded-none font-bold uppercase leading-tight">
                            Out
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedSize && selectedSizeStock > 0 && selectedSizeStock <= 3 && (
                  <p className="text-[11px] text-amber-600 font-semibold mt-2 uppercase tracking-wide">
                    Only {selectedSizeStock} left in this size
                  </p>
                )}
              </div>
            )}

            {/* Size guide for ties */}
            {isTie && <TieSizeGuide />}

            {/* Quantity Selector */}
            <div className="mb-6">
              <p className="text-[11px] uppercase tracking-[0.15em] font-semibold text-gray-700 mb-3">
                Quantity
              </p>
              <div className="flex items-center border border-gray-200 w-fit">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-30"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-[14px] font-semibold">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  disabled={maxQty === 0 || quantity >= maxQty}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-30"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={
                isCompletelyOutOfStock ||
                (hasSizeInventory && selectedSize !== "" && selectedSizeStock === 0)
              }
              className="h-12 w-full bg-gray-900 text-white text-[12px] uppercase tracking-[0.15em] font-semibold hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mb-4"
            >
              {isCompletelyOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100 mt-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.1em] font-semibold text-gray-900 mb-0.5">
                  Delivery
                </p>
                <p className="text-[12px] text-gray-500">
                  Cash on Delivery, Nationwide
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.1em] font-semibold text-gray-900 mb-0.5">
                  Returns
                </p>
                <p className="text-[12px] text-gray-500">3-Day Return Policy</p>
              </div>
            </div>
          </div>
        </div>

        {/* You May Also Like Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-gray-100">
            <h2 className="font-serif text-2xl font-bold tracking-tight text-gray-900 mb-6 uppercase">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct: Product) => (
                <Link
                  key={relProduct.id}
                  href={`/product/${relProduct.id}`}
                  className="group border border-gray-100 bg-white flex flex-col transition-all hover:border-gray-300"
                >
                  <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
                    {relProduct.imageUrl ? (
                      <img
                        src={getImageUrl(relProduct.imageUrl)}
                        alt={relProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] uppercase text-gray-300 font-bold tracking-widest">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-1">
                        {relProduct.categoryName || "Geek Thrifts"}
                      </span>
                      <h3 className="font-serif font-bold text-base leading-tight mb-2 group-hover:underline truncate text-gray-900">
                        {relProduct.name}
                      </h3>
                    </div>
                    <div className="font-bold text-sm mt-2 text-gray-900">
                      {formatPKR(relProduct.price)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}