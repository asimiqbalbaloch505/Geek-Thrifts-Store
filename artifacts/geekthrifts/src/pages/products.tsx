import { Layout } from "@/components/layout";
import { useListProducts, getListProductsQueryKey, useListCategories, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { Link, useSearch } from "wouter";
import { formatPKR } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function Products() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const categoryParam = searchParams.get("category");
  
  const { data: categories } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() }
  });

  // Try to find the category ID if the param is a slug/name, else use it as ID
  let categoryId: number | undefined = undefined;
  if (categoryParam) {
    if (!isNaN(Number(categoryParam))) {
      categoryId = Number(categoryParam);
    } else {
      const cat = categories?.find(c => c.slug.toLowerCase() === categoryParam.toLowerCase() || c.name.toLowerCase() === categoryParam.toLowerCase());
      if (cat) categoryId = cat.id;
    }
  }

  const { data: products, isLoading } = useListProducts(
    categoryId ? { categoryId } : undefined,
    { query: { queryKey: getListProductsQueryKey(categoryId ? { categoryId } : undefined) } }
  );

  const isShoesSelected = categoryParam?.toLowerCase() === "shoes" || 
    (categoryId && categories?.find(c => c.id === categoryId)?.name.toLowerCase() === "shoes");

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col md:flex-row gap-12 items-start">
        
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0 md:sticky md:top-24 font-sans">
          <h2 className="font-serif text-2xl font-bold tracking-tighter uppercase mb-6">Filter</h2>
          
          <div className="space-y-6 border-t border-border pt-6">
            <div>
              <h3 className="text-xs uppercase tracking-widest font-bold mb-4">Categories</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/products" className={`hover:underline underline-offset-4 ${!categoryParam ? 'font-bold' : ''}`}>
                    All Products
                  </Link>
                </li>
                {categories?.map(cat => {
                  const isShoes = cat.slug === 'shoes' || cat.name.toLowerCase() === 'shoes';
                  if (isShoes) {
                    return (
                      <li key={cat.id} className="text-muted-foreground flex justify-between">
                        <span>{cat.name}</span>
                        <span className="text-[10px] uppercase tracking-wider">Soon</span>
                      </li>
                    );
                  }
                  return (
                    <li key={cat.id}>
                      <Link 
                        href={`/products?category=${cat.slug}`} 
                        className={`hover:underline underline-offset-4 ${categoryParam === cat.slug || categoryId === cat.id ? 'font-bold' : ''}`}
                      >
                        {cat.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 w-full">
          <div className="mb-8 pb-4 border-b border-border flex justify-between items-end">
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tighter uppercase">
              {categoryId ? categories?.find(c => c.id === categoryId)?.name : categoryParam ? categoryParam : "All Products"}
            </h1>
            <span className="font-sans text-sm text-muted-foreground">
              {products?.length || 0} Items
            </span>
          </div>

          {isShoesSelected ? (
            <div className="py-32 text-center border border-border flex flex-col items-center justify-center bg-muted/20">
              <h2 className="font-serif text-4xl font-bold tracking-tighter uppercase mb-4">Coming Soon</h2>
              <p className="font-sans max-w-md mx-auto text-muted-foreground">
                Our collection of formal footwear is currently being curated. Check back later for sharp, high-quality oxfords and loafers.
              </p>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <Skeleton className="aspect-[3/4] w-full rounded-none" />
                  <Skeleton className="h-6 w-2/3 rounded-none" />
                  <Skeleton className="h-4 w-1/3 rounded-none" />
                </div>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
              {products.map((product) => (
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
                    <span className="text-muted-foreground uppercase tracking-wider text-[10px]">{product.categoryName}</span>
                    <span className="font-bold">{formatPKR(product.price)}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-32 text-center border border-border flex flex-col items-center justify-center">
              <p className="font-sans text-lg mb-6">No products found in this category.</p>
              <Link href="/products">
                <Button className="rounded-none uppercase font-bold tracking-widest text-xs h-12 px-8">Clear Filters</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
