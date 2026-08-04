import { Layout } from "@/components/layout";
import { useListProducts, getListProductsQueryKey, Product } from "@workspace/api-client-react";
import { Link } from "wouter";
import { formatPKR, getImageUrl } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

const HERO_SLIDES = [
  {
    image: "/products/ties-hero.jpg",
    tag: "Luxury Silk Ties",
    headline: "Dressed\nto Last.",
    sub: "Designer ties from Europe's finest labels, curated for Pakistan.",
    cta: { label: "Shop Ties", href: "/products?category=ties" },
  },
  {
    image: "/products/watches-hero.jpg",
    tag: "Timepieces",
    headline: "Timeless\nElegance.",
    sub: "Classic and contemporary watches to complement every wrist.",
    cta: { label: "Shop Watches", href: "/products?category=watches" },
  },
  {
    image: "/products/shirts-hero.jpg",
    tag: "Formal & Casual",
    headline: "Tailored\nPerfection.",
    sub: "Premium dress shirts and casual button-downs crafted for fit and comfort.",
    cta: { label: "Shop Shirts", href: "/products?category=shirts" },
  },
  {
    image: "/products/shoes-hero.jpg",
    tag: "Footwear",
    headline: "Step into\nStyle.",
    sub: "Hand-crafted leather shoes and Oxfords for the modern wardrobe.",
    cta: { label: "Shop Shoes", href: "/products?category=shoes" },
  },
  {
    image: "/products/belts-hero.jpg",
    tag: "Accessories",
    headline: "Finishing\nTouches.",
    sub: "Genuine leather belts designed to tie your look together effortlessly.",
    cta: { label: "Shop Belts", href: "/products?category=belts" },
  },
];

const INTERVAL = 4500;

export default function Home() {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const { data: allProducts, isLoading } = useListProducts(
    undefined,
    { query: { queryKey: getListProductsQueryKey() } }
  );

  const featured = [...(allProducts ?? [])].sort((a, b) => b.id - a.id).filter(p => p.isFeatured && p.isActive);

  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const goTo = useCallback((idx: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(idx);
      setTransitioning(false);
    }, 600);
  }, [transitioning]);

  const next = useCallback(() => goTo((current + 1) % HERO_SLIDES.length), [current, goTo]);

  useEffect(() => {
    const t = setInterval(next, INTERVAL);
    return () => clearInterval(t);
  }, [next]);

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

  const slide = HERO_SLIDES[current];

  return (
    <Layout>

      {/* ── Full-Screen Background Hero ── */}
      <section className="relative overflow-hidden" style={{ minHeight: "92vh" }}>

        {/* Background images — stacked, crossfade */}
        {HERO_SLIDES.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === current ? 1 : 0 }}
          >
            <img
              src={getImageUrl(s.image)}
              alt={s.tag}
              className="w-full h-full object-cover object-center"
              loading={i === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}

        {/* Gradient overlay — left-heavy so text stays readable */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(105deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.70) 45%, rgba(0,0,0,0.25) 100%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 py-20" style={{ minHeight: "92vh" }}>
          <div className="max-w-xl">

            {/* Brand tag */}
            <div
              className="mb-5 transition-all duration-500"
              style={{ opacity: transitioning ? 0 : 1, transform: transitioning ? "translateY(6px)" : "translateY(0)" }}
            >
              <span className="inline-block text-[10px] font-semibold uppercase tracking-[0.4em] text-white/60 border border-white/25 px-3 py-1">
                {slide.tag}
              </span>
            </div>

            {/* Headline */}
            <h1
              className="font-serif font-bold text-white leading-none tracking-tight mb-5 transition-all duration-500"
              style={{
                fontSize: "clamp(3.5rem, 8vw, 6rem)",
                whiteSpace: "pre-line",
                opacity: transitioning ? 0 : 1,
                transform: transitioning ? "translateY(14px)" : "translateY(0)",
              }}
            >
              {slide.headline}
            </h1>

            {/* Subline */}
            <p
              className="text-[15px] text-white/65 leading-relaxed max-w-sm mb-8 transition-all duration-500"
              style={{ opacity: transitioning ? 0 : 1, transform: transitioning ? "translateY(8px)" : "translateY(0)" }}
            >
              {slide.sub}
            </p>

            {/* CTA */}
            <div className="flex items-center gap-3 mb-10">
              <Link href={slide.cta.href}>
                <button className="h-11 px-8 bg-white text-gray-900 text-[11px] uppercase tracking-[0.18em] font-bold hover:bg-gray-100 transition-colors">
                  {slide.cta.label}
                </button>
              </Link>
              <Link href="/products">
                <button className="h-11 px-7 bg-transparent text-white text-[11px] uppercase tracking-[0.18em] font-semibold border border-white/40 hover:border-white transition-colors">
                  All Products
                </button>
              </Link>
            </div>

            {/* Dots only — no arrows */}
            <div className="flex items-center gap-2">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`transition-all duration-300 rounded-full ${i === current ? "w-6 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Slide counter */}
        <div className="absolute bottom-6 right-6 z-10 text-[11px] font-semibold text-white/50 tracking-widest">
          {String(current + 1).padStart(2, "0")} / {String(HERO_SLIDES.length).padStart(2, "0")}
        </div>
      </section>

      {/* ── Featured Products ── */}
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
                <Link key={product.id} href={`/product/${product.id}`} className="product-card group block">
                  <div className="relative overflow-hidden bg-gray-50 aspect-[3/4]">
                    {product.imageUrl ? (
                      <img
                        src={getImageUrl(product.imageUrl)}
                        alt={product.name}
                        className="product-card-img w-full h-full object-cover object-center"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs uppercase tracking-widest">No Image</div>
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
                    <h3 className="text-[13px] font-semibold text-gray-900 leading-snug group-hover:text-gray-600 transition-colors">{product.name}</h3>
                    <p className="text-[13px] font-bold text-gray-900">{formatPKR(product.price)}</p>
                  </div>
                </Link>
              ))
          }
        </div>
      </section>

      {/* ── Trust strip ── */}
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