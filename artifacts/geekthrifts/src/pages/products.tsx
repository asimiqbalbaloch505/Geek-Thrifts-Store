import { useListProducts, useListCategories, Product, Category } from "@workspace/api-client-react";
import { formatPKR, getImageUrl } from "@/lib/utils";
import { Link, useSearch } from "wouter";
import { Layout } from "@/components/layout";

export default function CustomerProductsPage() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const selectedCategorySlug = searchParams.get("category");

  const { data: products, isLoading: loadingProducts } = useListProducts();
  const { data: categories } = useListCategories();

  const activeCategory = categories?.find(
    (c: Category) => c.slug?.toLowerCase() === selectedCategorySlug?.toLowerCase()
  );

  const matchingCategoryIds = new Set<number>();
  if (activeCategory) {
    matchingCategoryIds.add(activeCategory.id);
    categories
      ?.filter((c: Category) => c.parentId === activeCategory.id)
      .forEach((child: Category) => matchingCategoryIds.add(child.id));
  }

  const filteredProducts = (products ?? []).filter((product: Product) => {
    if (!product.isActive) return false;
    if (!selectedCategorySlug) return true;
    return matchingCategoryIds.has(product.categoryId);
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 border-b border-border pb-6">
          <h1 className="font-serif text-3xl font-bold uppercase tracking-tighter mb-2">
            {activeCategory ? activeCategory.name : "All Products"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {activeCategory
              ? `Browse products under ${activeCategory.name}`
              : "Browse our complete thrift and geek collection."}
          </p>
        </div>

        {loadingProducts ? (
          <div className="p-12 text-center text-muted-foreground font-sans text-sm uppercase tracking-widest border border-border">
            Loading Catalog...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground font-sans text-sm uppercase tracking-widest border border-border">
            No products available in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product: Product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group border border-border bg-card flex flex-col transition-all hover:border-foreground/20"
              >
                <div className="aspect-[4/3] bg-muted border-b border-border relative overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={getImageUrl(product.imageUrl)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] uppercase text-muted-foreground font-bold tracking-widest">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold block mb-1">
                      {product.categoryName || "Geek Thrifts"}
                    </span>
                    <h3 className="font-serif font-bold text-lg leading-tight mb-2 group-hover:underline truncate">
                      {product.name}
                    </h3>
                  </div>
                  <div className="font-bold text-sm mt-4">
                    {formatPKR(product.price)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}