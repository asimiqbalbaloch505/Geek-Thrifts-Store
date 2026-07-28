import { Layout } from "@/components/layout";
import { useListProducts, getListProductsQueryKey, useListCategories, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { Link, useSearch } from "wouter";
import { formatPKR, getImageUrl } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";

export default function Products() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const categoryParam = searchParams.get("category");
  const subcategoryParam = searchParams.get("subcategory");

  // Fetch live categories from DB
  const { data: allCategories } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() }
  });

  // Separate parent categories and subcategories
  const { parentCategories, activeCategory, activeSubcategory, subcategoryOptions } = useMemo(() => {
    if (!allCategories) return { parentCategories: [], activeCategory: null, activeSubcategory: null, subcategoryOptions: [] };

    const parents = allCategories.filter(c => c.isActive && !c.parentId);

    let activeCat = null;
    let activeSub = null;

    if (categoryParam) {
      const match = allCategories.find(
        c => c.slug.toLowerCase() === categoryParam.toLowerCase() ||
             c.name.toLowerCase() === categoryParam.toLowerCase() ||
             c.id === Number(categoryParam)
      );
      if (match) {
        if (match.parentId) {
          // If the passed categoryParam is actually a subcategory
          activeSub = match;
          activeCat = allCategories.find(c => c.id === match.parentId) || null;
        } else {
          activeCat = match;
        }
      }
    }

    if (subcategoryParam) {
      const subMatch = allCategories.find(
        c => (c.slug.toLowerCase() === subcategoryParam.toLowerCase() ||
              c.name.toLowerCase() === subcategoryParam.toLowerCase()) &&
             c.parentId === activeCat?.id
      );
      if (subMatch) activeSub = subMatch;
    }

    // Subcategories belonging to current active main category
    const subs = activeCat ? allCategories.filter(c => c.isActive && c.parentId === activeCat.id) : [];

    return {
      parentCategories: parents,
      activeCategory: activeCat,
      activeSubcategory: activeSub,
      subcategoryOptions: subs
    };
  }, [allCategories, categoryParam, subcategoryParam]);

  // Determine Category ID for product fetching
  const queryCategoryId = activeSubcategory?.id ?? activeCategory?.id;

  const { data: products, isLoading } = useListProducts(
    queryCategoryId ? { categoryId: queryCategoryId } : undefined,
    { query: { queryKey: getListProductsQueryKey(queryCategoryId ? { categoryId: queryCategoryId } : undefined) } }
  );

  const pageTitle = activeSubcategory
    ? `${activeSubcategory.name}`
    : activeCategory?.name ?? "All Products";

  return (
    <Layout>
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[12px] text-gray-400 mb-6 flex-wrap font-sans">
          <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <span>/</span>
          {activeCategory && (
            <>
              <Link href={`/products?category=${activeCategory.slug}`} className="hover:text-gray-700 transition-colors capitalize">
                {activeCategory.name}
              </Link>
              {activeSubcategory && (
                <>
                  <span>/</span>
                  <span className="text-gray-700 font-medium">{activeSubcategory.name}</span>
                </>
              )}
            </>
          )}
          {!activeCategory && <span className="text-gray-700">All Products</span>}
        </div>

        {/* Page header */}
        <div className="flex items-end justify-between mb-6 pb-4 border-b border-gray-100">
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 tracking-tight capitalize">
            {pageTitle}
          </h1>
          <span className="text-[13px] text-gray-400">{products?.length ?? 0} Items</span>
        </div>

        {/* Main Category Filter Pills (Parent Categories Only) */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Link href="/products">
            <button className={`h-8 px-4 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors border ${!categoryParam ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-700 hover:text-gray-900"}`}>
              All
            </button>
          </Link>
          {parentCategories.map(cat => {
            const isActive = activeCategory?.id === cat.id;
            return (
              <Link key={cat.id} href={`/products?category=${cat.slug}`}>
                <button className={`h-8 px-4 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors border ${isActive ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-700 hover:text-gray-900"}`}>
                  {cat.name}
                </button>
              </Link>
            );
          })}
        </div>

        {/* Dynamic Subcategory Pills (From Database) */}
        {activeCategory && subcategoryOptions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Link href={`/products?category=${activeCategory.slug}`}>
              <button className={`h-7 px-3 text-[10px] font-medium uppercase tracking-[0.1em] transition-colors ${!activeSubcategory ? "text-gray-900 border-b-2 border-gray-900 font-bold" : "text-gray-400 hover:text-gray-700"}`}>
                All {activeCategory.name}
              </button>
            </Link>
            {subcategoryOptions.map(sub => (
              <Link key={sub.id} href={`/products?category=${activeCategory.slug}&subcategory=${sub.slug}`}>
                <button className={`h-7 px-3 text-[10px] font-medium uppercase tracking-[0.1em] transition-colors ${activeSubcategory?.id === sub.id ? "text-gray-900 border-b-2 border-gray-900 font-bold" : "text-gray-400 hover:text-gray-700"}`}>
                  {sub.name}
                </button>
              </Link>
            ))}
          </div>
        )}

        {!activeCategory && <div className="mb-8" />}

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
            {Array(8).fill(0).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[3/4] w-full rounded-none bg-gray-100" />
                <div className="mt-3 space-y-1.5">
                  <Skeleton className="h-3.5 w-4/5 rounded-none bg-gray-100" />
                  <Skeleton className="h-3 w-1/2 rounded-none bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="product-card group block">
                <div className="relative overflow-hidden bg-gray-50 aspect-[3/4]">
                  {product.imageUrl ? (
                    <img
                      src={getImageUrl(product.imageUrl)}
                      alt={product.name}
                      className="product-card-img w-full h-full object-cover object-center"
                      loading="lazy"
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
                  <h3 className="text-[13px] font-semibold text-gray-900 leading-snug group-hover:text-gray-500 transition-colors">{product.name}</h3>
                  <p className="text-[13px] font-bold text-gray-900">{formatPKR(product.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center border border-gray-100 bg-gray-50">
            <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-semibold mb-4">
              {activeSubcategory?.name ?? activeCategory?.name ?? "Collection"}
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">Coming Soon</h2>
            <p className="text-[14px] text-gray-500 max-w-sm text-center">We are curating new arrivals for this collection. Check back soon.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}