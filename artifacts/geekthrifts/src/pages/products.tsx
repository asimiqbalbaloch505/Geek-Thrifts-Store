import { Layout } from "@/components/layout";
import { useListProducts, getListProductsQueryKey, useListCategories, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { Link, useSearch } from "wouter";
import { formatPKR, getImageUrl } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const SUBCATEGORY_MAP: Record<string, string[]> = {
  shirts: ["Italian", "French", "UK", "USA"],
  ties: ["Italian", "French", "UK", "USA"],
  shoes: ["Formals", "Sneakers", "Joggers"],
};

export default function Products() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const categoryParam = searchParams.get("category");
  const subcategoryParam = searchParams.get("subcategory");

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

  const { data: allProducts, isLoading } = useListProducts(
    categoryId ? { categoryId } : undefined,
    { query: { queryKey: getListProductsQueryKey(categoryId ? { categoryId } : undefined) } }
  );

  const products = subcategoryParam && allProducts
    ? allProducts.filter(p => p.subcategory?.toLowerCase() === subcategoryParam.toLowerCase())
    : allProducts;

  const activeCategory = categoryId ? categories?.find(c => c.id === categoryId) : null;
  const slug = categoryParam?.toLowerCase() ?? "";
  const subcategoryOptions = SUBCATEGORY_MAP[slug] ?? [];

  const pageTitle = subcategoryParam
    ? `${subcategoryParam} ${activeCategory?.name ?? categoryParam ?? "Products"}`
    : activeCategory?.name ?? (categoryParam ? categoryParam : "All Products");

  return (
    <Layout>
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[12px] text-gray-400 mb-6 flex-wrap">
          <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <span>/</span>
          {categoryParam && (
            <>
              <Link href={`/products?category=${categoryParam}`} className="hover:text-gray-700 transition-colors capitalize">{activeCategory?.name ?? categoryParam}</Link>
              {subcategoryParam && <><span>/</span><span className="text-gray-700">{subcategoryParam}</span></>}
            </>
          )}
          {!categoryParam && <span className="text-gray-700">All Products</span>}
        </div>

        {/* Page header */}
        <div className="flex items-end justify-between mb-6 pb-4 border-b border-gray-100">
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 tracking-tight capitalize">
            {pageTitle}
          </h1>
          <span className="text-[13px] text-gray-400">{products?.length ?? 0} Items</span>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Link href="/products">
            <button className={`h-8 px-4 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors border ${!categoryParam ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-700 hover:text-gray-900"}`}>
              All
            </button>
          </Link>
          {categories?.map(cat => {
            const isActive = categoryParam === cat.slug || categoryId === cat.id;
            return (
              <Link key={cat.id} href={`/products?category=${cat.slug}`}>
                <button className={`h-8 px-4 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors border ${isActive && !subcategoryParam ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-700 hover:text-gray-900"}`}>
                  {cat.name}
                </button>
              </Link>
            );
          })}
        </div>

        {/* Subcategory pills (shown when a category is selected) */}
        {categoryParam && subcategoryOptions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Link href={`/products?category=${categoryParam}`}>
              <button className={`h-7 px-3 text-[10px] font-medium uppercase tracking-[0.1em] transition-colors ${!subcategoryParam ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-400 hover:text-gray-700"}`}>
                All
              </button>
            </Link>
            {subcategoryOptions.map(sub => (
              <Link key={sub} href={`/products?category=${categoryParam}&subcategory=${encodeURIComponent(sub)}`}>
                <button className={`h-7 px-3 text-[10px] font-medium uppercase tracking-[0.1em] transition-colors ${subcategoryParam === sub ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-400 hover:text-gray-700"}`}>
                  {sub}
                </button>
              </Link>
            ))}
          </div>
        )}

        {!categoryParam && <div className="mb-8" />}

        {/* Shoes — Coming Soon */}
        {slug === "shoes" ? (
          <div className="py-32 flex flex-col items-center justify-center border border-gray-100 bg-gray-50">
            <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-semibold mb-4">Shoes</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">Coming Soon</h2>
            <p className="text-[14px] text-gray-500 max-w-sm text-center">We are curating the finest footwear for Pakistan. Check back soon.</p>
          </div>
        ) : isLoading ? (
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
                  {product.subcategory && (
                    <span className="absolute top-2 right-2 bg-white/90 text-gray-600 text-[9px] px-1.5 py-0.5 uppercase tracking-wider font-medium">
                      {product.subcategory}
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
          <div className="py-24 text-center bg-gray-50 border border-gray-100">
            <p className="text-[14px] text-gray-500 mb-4">No products found in this category.</p>
            <Link href="/products">
              <button className="h-10 px-6 bg-gray-900 text-white text-[12px] uppercase tracking-[0.12em] font-semibold hover:bg-gray-800 transition-colors">
                Clear Filter
              </button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
