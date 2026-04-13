import { Layout } from "@/components/layout";
import { useListProducts, getListProductsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { formatPKR, getImageUrl } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

const HERO_SLIDES = [
  {
    image: "/products/bsl-celtic-1.jpg",
    tag: "BSL Celtic",
    headline: "Dressed\nto Last.",
    sub: "Designer ties from Europe's finest labels, curated for Pakistan.",
    cta: { label: "Shop Ties", href: "/products?category=ties" },
  },
  {
    image: "/products/burberry-stripe-1.jpg",
    tag: "Burberry London",
    headline: "British\nHeritage.",
    sub: "Authentic Burberry silks — authenticated, pressed, and priced fairly.",
    cta: { label: "Shop Burberry", href: "/products?category=ties" },
  },
  {
    image: "/products/polo-stripe-1.jpg",
    tag: "Polo Ralph Lauren",
    headline: "Classic\nAmerica.",
    sub: "Iconic Ralph Lauren stripes — timeless style for the modern professional.",
    cta: { label: "View Collection", href: "/products?category=ties" },
  },
  {
    image: "/products/burberry-rose-full.jpg",
    tag: "Burberry London",
    headline: "Bold\nColour.",
    sub: "Rare colourways from the world's most recognisable luxury houses.",
    cta: { label: "Shop Now", href: "/products?category=ties" },
  },
  {
    image: "/products/maroon-gold-full.jpg",
    tag: "Regimental Stripe",
    headline: "Power\nDressing.",
    sub: "Rich maroon and gold — every thread a statement of intent.",
    cta: { label: "Explore Ties", href: "/products?category=ties" },
  },
  {
    image: "/products/copper-dot-full.jpg",
    tag: "Polka Dot Silk",
    headline: "Subtle\nLuxury.",
    sub: "Copper silk with navy dots — old-school elegance, always in season.",
    cta: { label: "Shop Collection", href: "/products?category=ties" },
  },
];

const INTERVAL = 4500;

export default function Home() {
  const { data: allProducts, isLoading } = useListProducts(
    undefined,
    { query: { queryKey: getListProductsQueryKey() } }
  );

  const featured = allProducts?.filter(p => p.isFeatured && p.isActive) ?? [];

  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  const goTo = useCallback((idx: number) => {
    setFading(true);
    setTimeout(() => {
      setCurrent(idx);
      setFading(false);
    }, 400);
  }, []);

  const next = useCallback(() => {
    goTo((current + 1) % HERO_SLIDES.length);
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, [current, goTo]);

  useEffect(() => {
    const t = setInterval(next, INTERVAL);
    return () => clearInterval(t);
  }, [next]);

  const slide = HERO_SLIDES[current];

  return (
    <Layout>
      {/* ── Hero Carousel ── */}
      <section className="relative flex flex-col md:flex-row overflow-hidden" style={{ minHeight: "88vh" }}>

        {/* Left: text panel */}
        <div
          className="flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 md:py-0 bg-white z-10 relative"
          style={{ flex: "0 0 52%" }}
        >
          {/* Brand tag */}
          <div
            className="mb-5 transition-all duration-500"
            style={{ opacity: fading ? 0 : 1, transform: fading ? "translateY(8px)" : "translateY(0)" }}
          >
            <span className="inline-block text-[10px] font-semibold uppercase tracking-[0.35em] text-gray-400 border border-gray-200 px-3 py-1">
              {slide.tag}
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-serif font-bold text-gray-900 leading-none tracking-tight mb-5 transition-all duration-500"
            style={{
              fontSize: "clamp(3rem, 7vw, 5.5rem)",
              whiteSpace: "pre-line",
              opacity: fading ? 0 : 1,
              transform: fading ? "translateY(12px)" : "translateY(0)",
            }}
          >
            {slide.headline}
          </h1>

          {/* Subline */}
          <p
            className="text-[15px] text-gray-500 leading-relaxed max-w-xs mb-8 transition-all duration-500"
            style={{ opacity: fading ? 0 : 1, transform: fading ? "translateY(8px)" : "translateY(0)" }}
          >
            {slide.sub}
          </p>

          {/* CTA buttons */}
          <div className="flex items-center gap-3 mb-10">
            <Link href={slide.cta.href}>
              <button className="h-11 px-8 bg-gray-900 text-white text-[11px] uppercase tracking-[0.18em] font-semibold hover:bg-gray-700 transition-colors">
                {slide.cta.label}
              </button>
            </Link>
            <Link href="/products">
              <button className="h-11 px-7 bg-white text-gray-900 text-[11px] uppercase tracking-[0.18em] font-semibold border border-gray-300 hover:border-gray-900 transition-colors">
                All Products
              </button>
            </Link>
          </div>

          {/* Dot indicators + arrows */}
          <div className="flex items-center gap-4">
            <button onClick={prev} className="w-8 h-8 border border-gray-200 flex items-center justify-center hover:border-gray-900 transition-colors" aria-label="Previous">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-1.5">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`transition-all duration-300 rounded-full ${i === current ? "w-6 h-1.5 bg-gray-900" : "w-1.5 h-1.5 bg-gray-300"}`}
                />
              ))}
            </div>
            <button onClick={next} className="w-8 h-8 border border-gray-200 flex items-center justify-center hover:border-gray-900 transition-colors" aria-label="Next">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: rotating image */}
        <div className="relative flex-1 bg-gray-100 min-h-[50vw] md:min-h-0 overflow-hidden">
          {HERO_SLIDES.map((s, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-opacity duration-700"
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

          {/* Subtle dark gradient at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

          {/* Slide counter */}
          <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold text-gray-700 tracking-wide">
            {String(current + 1).padStart(2, "0")} / {String(HERO_SLIDES.length).padStart(2, "0")}
          </div>
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
