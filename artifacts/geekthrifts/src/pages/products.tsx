import { useListProducts, useListCategories, Product, Category } from "@workspace/api-client-react";
import { formatPKR, getImageUrl } from "@/lib/utils";
import { Link, useSearch } from "wouter";
import { Layout } from "@/components/layout";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

export default function CustomerProductsPage() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const selectedCategorySlug = searchParams.get("category")?.toLowerCase();

  const { addToCart } = useCart();
  const { toast } = useToast();

  const { data: products, isLoading: loadingProducts } = useListProducts();
  const { data: categories } = useListCategories();

  // Find currently selected category (Main or Subcategory)
  const activeCategory = categories?.find(
    (c: Category) => c.slug?.toLowerCase() === selectedCategorySlug
  );

  // Identify main parent category (if active category is a subcategory, resolve to parent for product filtering)
  const mainCategory = activeCategory?.parentId
    ? categories?.find((c: Category) => c.id === activeCategory.parentId) || activeCategory
    : activeCategory;

  // Gather all matching category IDs (Main Category + All Subcategories under it)
  const matchingCategoryIds = new Set<number>();
  if (mainCategory) {
    matchingCategoryIds.add(mainCategory.id);
    categories
      ?.filter((c: Category) => c.parentId === mainCategory.id)
      .forEach((child: Category) => matchingCategoryIds.add(child.id));
  }

  const filteredProducts = [...(products ?? [])]
    .sort((a, b) => b.id - a.id)
    .filter((product: Product) => {
      if (!product.isActive) return false;
      if (!selectedCategorySlug) return true;

      // Fallback: match by Category ID OR string matching on categoryName for resilience
      const matchesId = matchingCategoryIds.has(product.categoryId);
      const matchesName =
        mainCategory &&
        product.categoryName?.toLowerCase().includes(mainCategory.name.toLowerCase());

      return matchesId || matchesName;
    });

  // Determine Title & Description dynamically based on active selection
  const title = activeCategory ? activeCategory.name : "Browse Our Collection";
  const description = activeCategory
    ? `Browse ${activeCategory.name}`
    : "Browse our complete thrift and geek collection.";

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : "Free Size";
    addToCart(product, defaultSize, 1);

    toast({
      title: "Added to cart",
      description: `${product.name} (${defaultSize})`,
    });
  };

  return (
    <Layout>
      <div className="py-14 md:py-20 px-4 max-w-[1400px] mx-auto w-full">
        <div className="mb-8 border-b border-gray-100 pb-6">
          <h1 className="font-serif text-3xl font-bold uppercase tracking-tighter mb-2">
            {title}
          </h1>
          <p className="text-muted-foreground text-sm">
            {description}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
            {filteredProducts.map((product: Product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="product-card group block"
              >
                <div className="relative overflow-hidden bg-gray-50 aspect-[3/4]">
                  {product.imageUrl ? (
                    <img
                      src={getImageUrl(product.imageUrl)}
                      alt={product.name}
                      className="product-card-img w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs uppercase tracking-widest">
                      No Image
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <span className="text-[11px] uppercase tracking-widest font-semibold text-gray-600">
                        Sold Out
                      </span>
                    </div>
                  )}
                  {product.stock > 0 && product.stock <= 2 && (
                    <span className="absolute top-2 left-2 bg-gray-900 text-white text-[10px] px-2 py-0.5 uppercase tracking-wider font-semibold">
                      Last {product.stock}
                    </span>
                  )}

                  {/* Quick Add to Cart Button */}
                  {product.stock > 0 && (
                    <button
                      onClick={(e) => handleQuickAdd(e, product)}
                      title="Add to Cart"
                      className="absolute bottom-2 right-2 z-10 p-2 bg-white/90 hover:bg-black hover:text-white text-gray-900 rounded-full shadow transition-all duration-200 transform translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="mt-2.5 space-y-0.5">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold block">
                    {product.categoryName || "Geek Thrifts"}
                  </span>
                  <h3 className="text-[13px] font-semibold text-gray-900 leading-snug group-hover:text-gray-600 transition-colors truncate">
                    {product.name}
                  </h3>
                  <p className="text-[13px] font-bold text-gray-900">
                    {formatPKR(product.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}