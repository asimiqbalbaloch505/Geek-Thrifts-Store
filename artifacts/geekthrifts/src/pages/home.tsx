import { Layout } from "@/components/layout";
import { useListProducts, getListProductsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { formatPKR } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const { data: allProducts, isLoading } = useListProducts(
    undefined,
    { query: { queryKey: getListProductsQueryKey() } }
  );

  const featured = allProducts?.filter(p => p.isFeatured && p.isActive) ?? [];
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <Layout>
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-[85vh] px-6 text-center overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1594938298603-c8148c4b8bb1?q=80&w=2560&auto=format&fit=crop')] bg-cover bg-center opacity-[0.08]" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="font-sans text-xs uppercase tracking-[0.4em] text-muted-foreground mb-6">
            Pakistani Thrift Fashion
          </p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-none mb-8">
            Dressed to<br />Last.
          </h1>
          <p className="font-sans text-sm md:text-base text-muted-foreground max-w-md mx-auto leading-relaxed mb-10">
            Curated formalwear from the world's finest labels — sourced, verified, and priced for Pakistan.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/products">
              <Button className="h-12 px-8 rounded-none text-xs uppercase tracking-[0.2em] font-bold">
                Shop Collection
              </Button>
            </Link>
            <Link href="/products?category=ties">
              <Button variant="outline" className="h-12 px-8 rounded-none text-xs uppercase tracking-[0.2em] font-bold bg-transparent border-border text-foreground hover:bg-accent">
                View Ties
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 md:py-28 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-baseline mb-10 border-b border-border pb-4">
            <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight">Featured</h2>
            <Link href="/products" className="font-sans text-xs uppercase tracking-widest font-bold flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
              All Products <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {isLoading
              ? Array(4).fill(0).map((_, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    <Skeleton className="aspect-[2/3] w-full rounded-none bg-muted" />
                    <Skeleton className="h-4 w-3/4 rounded-none bg-muted" />
                    <Skeleton className="h-3 w-1/2 rounded-none bg-muted" />
                  </div>
                ))
              : featured.map((product) => (
                  <Link key={product.id} href={`/products/${product.id}`} className="group flex flex-col">
                    <div className="aspect-[2/3] overflow-hidden bg-card border border-border relative mb-3">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl.startsWith("http") ? product.imageUrl : `${base}${product.imageUrl}`}
                          alt={product.name}
                          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs uppercase tracking-widest font-sans">
                          No Image
                        </div>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-background/75 flex items-center justify-center">
                          <span className="font-sans font-bold text-xs uppercase tracking-widest">Sold Out</span>
                        </div>
                      )}
                    </div>
                    <p className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{product.categoryName}</p>
                    <h3 className="font-serif text-base font-bold leading-tight mb-1 group-hover:opacity-75 transition-opacity">{product.name}</h3>
                    <p className="font-sans text-sm font-bold">{formatPKR(product.price)}</p>
                  </Link>
                ))
            }
          </div>
        </div>
      </section>

      {/* Brand Line */}
      <section className="border-t border-border py-16 px-4">
        <div className="container mx-auto text-center">
          <p className="font-sans text-xs uppercase tracking-[0.35em] text-muted-foreground">
            Cash on Delivery &nbsp;&middot;&nbsp; Pakistan-wide &nbsp;&middot;&nbsp; Curated Thrift Labels
          </p>
        </div>
      </section>
    </Layout>
  );
}
