import { Layout } from "@/components/layout";
import { useListProducts, useListCategories, getListProductsQueryKey, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { formatPKR } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const { data: featuredProducts, isLoading: loadingProducts } = useListProducts(
    undefined,
    { query: { queryKey: getListProductsQueryKey() } }
  );
  
  const { data: categories, isLoading: loadingCategories } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() }
  });

  const featured = featuredProducts?.filter(p => p.isFeatured).slice(0, 4) || [];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative border-b border-border flex flex-col items-center justify-center py-32 md:py-48 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-[0.15] mix-blend-luminosity"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-6">
            Curated Formality.
          </h1>
          <p className="text-lg md:text-xl font-sans mb-10 max-w-xl mx-auto leading-relaxed">
            Pakistani thrift fashion, elevated. Sharp, minimal, and purposeful formalwear for the modern professional.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center font-sans">
            <Link href="/products">
              <Button size="lg" className="w-full sm:w-auto uppercase tracking-widest rounded-none h-14 px-8 text-xs font-bold">
                Shop Collection
              </Button>
            </Link>
            <Link href="/products?category=shirts">
              <Button variant="outline" size="lg" className="w-full sm:w-auto uppercase tracking-widest rounded-none h-14 px-8 text-xs font-bold bg-transparent">
                View Shirts
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 md:py-32 px-4 container mx-auto border-b border-border">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase">Featured</h2>
          <Link href="/products" className="font-sans text-sm font-bold uppercase tracking-widest flex items-center gap-2 hover:underline underline-offset-4">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loadingProducts ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <Skeleton className="aspect-[3/4] w-full rounded-none" />
                <Skeleton className="h-6 w-2/3 rounded-none" />
                <Skeleton className="h-4 w-1/3 rounded-none" />
              </div>
            ))
          ) : (
            featured.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="group flex flex-col block cursor-pointer">
                <div className="aspect-[3/4] overflow-hidden bg-muted mb-4 border border-border relative">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-sans text-xs uppercase tracking-widest text-muted-foreground">
                      No Image
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center font-sans font-bold uppercase tracking-widest text-sm backdrop-blur-sm">
                      Out of Stock
                    </div>
                  )}
                </div>
                <h3 className="font-serif text-lg font-bold truncate">{product.name}</h3>
                <div className="flex justify-between items-center mt-1 font-sans text-sm">
                  <span className="text-muted-foreground uppercase tracking-wider text-xs">{product.categoryName}</span>
                  <span className="font-bold">{formatPKR(product.price)}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 md:py-32 px-4 container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase mb-12 text-center">Categories</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
          {loadingCategories ? (
            Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="w-full h-full rounded-none" />
            ))
          ) : (
            categories?.map((cat) => {
              const isShoes = cat.name.toLowerCase() === "shoes" || cat.slug === "shoes";
              
              const CardContent = () => (
                <>
                  {cat.imageUrl && (
                    <img 
                      src={cat.imageUrl} 
                      alt={cat.name} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 mix-blend-luminosity"
                    />
                  )}
                  <div className="absolute inset-0 bg-foreground/40 transition-colors duration-500 group-hover:bg-foreground/20"></div>
                  <div className="relative z-10 flex flex-col items-center justify-center h-full text-background">
                    <h3 className="font-serif text-3xl font-bold uppercase tracking-widest">{cat.name}</h3>
                    {isShoes && (
                      <span className="mt-4 font-sans text-xs uppercase tracking-[0.3em] bg-background text-foreground px-4 py-2 font-bold">
                        Coming Soon
                      </span>
                    )}
                  </div>
                </>
              );

              if (isShoes) {
                return (
                  <div key={cat.id} className="relative overflow-hidden border border-border group">
                    <CardContent />
                  </div>
                );
              }

              return (
                <Link key={cat.id} href={`/products?category=${cat.id}`} className="relative overflow-hidden border border-border group block">
                  <CardContent />
                </Link>
              );
            })
          )}
        </div>
      </section>
    </Layout>
  );
}
