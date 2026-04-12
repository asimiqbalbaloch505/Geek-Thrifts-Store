import { Layout } from "@/components/layout";
import { useListProducts, getListProductsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { formatPKR, getImageUrl } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const { data: allProducts, isLoading } = useListProducts(
    undefined,
    { query: { queryKey: getListProductsQueryKey() } }
  );

  const featured = allProducts?.filter(p => p.isFeatured && p.isActive) ?? [];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative bg-gray-50 flex flex-col items-center justify-center text-center px-4 py-24 md:py-36 overflow-hidden">
        <div className="max-w-xl mx-auto relative z-10">
          <p className="text-[11px] uppercase tracking-[0.4em] text-gray-400 font-medium mb-5">
            Pakistani Thrift Fashion
          </p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-none tracking-tight mb-5">
            Dressed<br />to Last.
          </h1>
          <p className="text-[15px] text-gray-500 max-w-sm mx-auto leading-relaxed mb-8">
            Designer ties, formal shirts — curated, authenticated, and priced for Pakistan.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/products?category=ties">
              <button className="h-11 px-8 bg-gray-900 text-white text-[12px] uppercase tracking-[0.15em] font-semibold hover:bg-gray-800 transition-colors">
                Shop Ties
              </button>
            </Link>
            <Link href="/products">
              <button className="h-11 px-8 bg-white text-gray-900 text-[12px] uppercase tracking-[0.15em] font-semibold border border-gray-200 hover:border-gray-900 transition-colors">
                All Products
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-14 md:py-20 px-4 max-w-[1400px] mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-2xl font-bold text-gray-900 tracking-tight">Featured</h2>
          <Link href="/products" className="flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.1em] text-gray-500 hover:text-black transition-colors">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
          {isLoading
            ? Array(5).fill(0).map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-[3/4] w-full rounded-none bg-gray-100" />
                  <div className="mt-3 space-y-1.5">
                    <Skeleton className="h-3.5 w-4/5 rounded-none bg-gray-100" />
                    <Skeleton className="h-3 w-1/2 rounded-none bg-gray-100" />
                  </div>
                </div>
              ))
            : featured.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`} className="product-card group block">
                  <div className="relative overflow-hidden bg-gray-50 aspect-[3/4]">
                    {product.imageUrl ? (
                      <img
                        src={getImageUrl(product.imageUrl)}
                        alt={product.name}
                        className="product-card-img w-full h-full object-cover object-center"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs uppercase tracking-widest">
                        No Image
                      </div>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <span className="text-[11px] uppercase tracking-widest font-semibold text-gray-600">Sold Out</span>
                      </div>
                    )}
                    {product.stock > 0 && product.stock <= 2 && (
                      <span className="absolute top-2 left-2 bg-gray-900 text-white text-[10px] px-2 py-0.5 uppercase tracking-wider font-semibold">
                        Last {product.stock}
                      </span>
                    )}
                  </div>
                  <div className="mt-2.5 space-y-0.5">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">{product.categoryName}</p>
                    <h3 className="text-[13px] font-semibold text-gray-900 leading-snug group-hover:text-gray-600 transition-colors">{product.name}</h3>
                    <p className="text-[13px] font-bold text-gray-900">{formatPKR(product.price)}</p>
                  </div>
                </Link>
              ))
          }
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-t border-gray-100 py-10 px-4">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-gray-900 mb-1">Authenticated</p>
            <p className="text-[13px] text-gray-500">Every item hand-checked before listing</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-gray-900 mb-1">Cash on Delivery</p>
            <p className="text-[13px] text-gray-500">Pay when your order arrives</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-gray-900 mb-1">Pakistan-wide</p>
            <p className="text-[13px] text-gray-500">Karachi, Lahore, Islamabad &amp; more</p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
