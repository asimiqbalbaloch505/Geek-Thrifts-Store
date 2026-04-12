import { Layout } from "@/components/layout";
import { useListProducts, getListProductsQueryKey, useListCategories, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { Link, useSearch } from "wouter";
import { formatPKR, getImageUrl } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function Products() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const categoryParam = searchParams.get("category");

  const { data: categories } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() }
  });

  let categoryId: number | undefined;
  if (categoryParam) {
    if (!isNaN(Number(categoryParam))) {
      categoryId = Number(categoryParam);
    } else {
      const cat = categories?.find(c =>
        c.slug.toLowerCase() === categoryParam.toLowerCase() ||
        c.name.toLowerCase() === categoryParam.toLowerCase()
      );
      if (cat) categoryId = cat.id;
    }
  }

  const { data: products, isLoading } = useListProducts(
    categoryId ? { categoryId } : undefined,
    { query: { queryKey: getListProductsQueryKey(categoryId ? { categoryId } : undefined) } }
  );

  const isShoesSelected =
    categoryParam?.toLowerCase() === "shoes" ||
    (categoryId && categories?.find(c => c.id === categoryId)?.name.toLowerCase() === "shoes");

  const activeCategory = categoryId
    ? categories?.find(c => c.id === categoryId)
    : null;

  const pageTitle = activeCategory?.name ?? (categoryParam ? categoryParam : "All");

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 md:py-16">

        {/* Header */}
        <div className="flex items-baseline justify-between border-b border-border pb-5 mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground font-bold mb-1">
              {categoryParam ? "Category" : "Collection"}
            </p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight capitalize">
              {pageTitle}
            </h1>
          </div>
          <span className="font-sans text-xs text-muted-foreground">
            {!isShoesSelected ? `${products?.length ?? 0} items` : ""}
          </span>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-8 font-sans text-xs">
          <Link href="/products">
            <button className={`h-8 px-4 border uppercase tracking-widest font-bold transition-colors ${!categoryParam ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"}`}>
              All
            </button>
          </Link>
          {categories?.map(cat => {
            const isShoes = cat.slug === "shoes" || cat.name.toLowerCase() === "shoes";
            const isActive = categoryParam === cat.slug || categoryId === cat.id;
            if (isShoes) {
              return (
                <button key={cat.id} disabled className="h-8 px-4 border border-border uppercase tracking-widest font-bold text-muted-foreground cursor-not-allowed opacity-40">
                  {cat.name}
                </button>
              );
            }
            return (
              <Link key={cat.id} href={`/products?category=${cat.slug}`}>
                <button className={`h-8 px-4 border uppercase tracking-widest font-bold transition-colors ${isActive ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"}`}>
                  {cat.name}
                </button>
              </Link>
            );
          })}
        </div>

        {isShoesSelected ? (
          <div className="py-32 text-center border border-border flex flex-col items-center justify-center">
            <h2 className="font-serif text-4xl font-bold tracking-tight mb-3">Coming Soon</h2>
            <p className="font-sans text-sm text-muted-foreground max-w-sm mx-auto">
              Our formal footwear collection is being curated. Check back soon for oxfords, loafers, and more.
            </p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="aspect-[2/3] w-full rounded-none bg-card" />
                <Skeleton className="h-3.5 w-3/4 rounded-none bg-card" />
                <Skeleton className="h-3 w-1/2 rounded-none bg-card" />
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="group flex flex-col">
                <div className="aspect-[2/3] overflow-hidden bg-card border border-border relative mb-3">
                  {product.imageUrl ? (
                    <img
                      src={getImageUrl(product.imageUrl)}
                      alt={product.name}
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs uppercase tracking-widest">
                      No Image
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <span className="font-bold text-xs uppercase tracking-widest">Sold Out</span>
                    </div>
                  )}
                  {product.stock > 0 && product.stock <= 2 && (
                    <div className="absolute top-2 left-2 bg-background/90 px-2 py-0.5">
                      <span className="font-sans text-[10px] uppercase tracking-widest font-bold">Last {product.stock}</span>
                    </div>
                  )}
                </div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">{product.categoryName}</p>
                <h3 className="font-serif text-sm font-bold leading-tight mb-1 group-hover:opacity-70 transition-opacity">{product.name}</h3>
                <p className="font-sans text-sm font-bold">{formatPKR(product.price)}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center border border-border flex flex-col items-center gap-4">
            <p className="font-sans text-sm text-muted-foreground">No products found.</p>
            <Link href="/products">
              <Button className="rounded-none uppercase font-bold tracking-widest text-xs h-10 px-6">
                View All
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
