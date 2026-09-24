import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Gem,
  Flower2,
  Truck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import SiteHeader from "@/storefront/components/SiteHeader";
import SiteFooter from "@/storefront/components/SiteFooter";
import ProductCard from "@/storefront/components/ProductCard";
import HomeSkeleton from "@/storefront/components/HomeSkeleton";
import { storefrontApi } from "@/lib/api/storefrontApi";

function Home() {
  const [categories, setCategories] = useState([]);
  const [hero, setHero] = useState(null);
  const [banners, setBanners] = useState([]);
  const [merchandising, setMerchandising] = useState({
    bestSellers: [],
    newArrivals: [],
    featured: [],
    trending: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadHomePageData() {
      try {
        const [catRes, heroRes, bannersRes, merchRes] = await Promise.allSettled([
          storefrontApi.getCategories({
            limit: 6,
            sortBy: "sortOrder",
            sortOrder: "asc",
          }),
          storefrontApi.getHero(),
          storefrontApi.getBanners({ position: "ALL" }),
          storefrontApi.getMerchandising({ limit: 8 }),
        ]);

        if (isMounted) {
          if (catRes.status === "fulfilled" && catRes.value?.data) {
            setCategories(catRes.value.data);
          }
          if (heroRes.status === "fulfilled" && heroRes.value?.data) {
            setHero(heroRes.value.data);
          }
          if (bannersRes.status === "fulfilled" && bannersRes.value?.data) {
            setBanners(bannersRes.value.data);
          }
          if (merchRes.status === "fulfilled" && merchRes.value?.data) {
            setMerchandising(merchRes.value.data);
          }
        }
      } catch (err) {
        console.error("Failed to load storefront homepage data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadHomePageData();
    return () => {
      isMounted = false;
    };
  }, []);

  const firstCategorySlug = categories[0]?.slug || "bangles";

  // Build Hero Slides combining Non-Clickable Photos (Homepage CMS) and Clickable Banners (Banner CMS)
  const heroSlides = useMemo(() => {
    const slides = [];

    // 1. Hero Photos from Homepage CMS (navigate to /category on click)
    if (hero?.slides && Array.isArray(hero.slides) && hero.slides.length > 0) {
      hero.slides.forEach((s, idx) => {
        if (s.url) {
          slides.push({
            id: s.id || `hero-slide-${idx}`,
            image: s.url,
            alt: s.altText || "ASH Jewellery",
            sortOrder: typeof s.sortOrder === "number" ? s.sortOrder : idx + 1,
            isClickable: true,
            targetUrl: "/category",
          });
        }
      });
    } else if (hero?.mediaAsset?.url) {
      slides.push({
        id: hero.id || "base-hero",
        image: hero.mediaAsset.url,
        alt: hero.mediaAsset.altText || "ASH Jewellery",
        sortOrder: 1,
        isClickable: true,
        targetUrl: "/category",
      });
    }

    // 2. Clickable Hero Banners from Banners CMS
    if (banners && banners.length > 0) {
      banners.forEach((b, idx) => {
        const bImg = b.mediaAsset?.url || b.image;
        if (bImg) {
          slides.push({
            id: b.id || `banner-slide-${idx}`,
            image: bImg,
            alt: b.title || "Hero Banner",
            sortOrder: typeof b.sortOrder === "number" ? b.sortOrder : idx + 1,
            isClickable: true,
            targetUrl: b.targetUrl || "/category",
          });
        }
      });
    }

    // 3. Fallback if no hero photos or banners configured yet
    if (slides.length === 0) {
      slides.push({
        id: "fallback-hero",
        isFallback: true,
        image: null,
        alt: "ASH Jewellery",
        sortOrder: 1,
        isClickable: false,
        targetUrl: null,
      });
    }

    // Sort by display order
    return slides.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [hero, banners]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  // Auto-slide advance every 5.5 seconds (paused when user hovers)
  useEffect(() => {
    if (heroSlides.length <= 1 || isHeroHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [heroSlides.length, isHeroHovered]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  if (loading) {
    return (
      <div className="home-page">
        <SiteHeader />
        <HomeSkeleton />
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="home-page">
      <SiteHeader />

      <main>
        {/* ================= DYNAMIC HERO BANNER CAROUSEL ================= */}
        <section
          className="hero-banner relative overflow-hidden"
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
        >
          {heroSlides.map((slide, idx) => {
            const isActive = idx === currentSlide;
            const hasImage = Boolean(slide.image);

            const slideContent = hasImage ? (
              <img
                className="hero-background-image w-full h-full object-cover"
                src={slide.image}
                alt={slide.alt}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 bg-[#f8f5ef]">
                <p className="font-serif text-2xl md:text-3xl text-[#1e1c19] tracking-wider">
                  ASH JEWELLERY
                </p>
                <p className="text-[11px] text-[#8a7f72] tracking-[0.25em] uppercase mt-2 font-serif">
                  Handcrafted 925 Sterling Silver Heirlooms
                </p>
              </div>
            );

            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                {slide.isClickable && slide.targetUrl ? (
                  <Link
                    to={slide.targetUrl}
                    className="block w-full h-full cursor-pointer focus:outline-none"
                    aria-label={slide.alt}
                  >
                    {slideContent}
                  </Link>
                ) : (
                  <div className="w-full h-full select-none">
                    {slideContent}
                  </div>
                )}
              </div>
            );
          })}

          {/* Interactive Navigation Controls (when multiple slides) */}
          {heroSlides.length > 1 && (
            <>
              <button
                type="button"
                className="hero-arrow hero-arrow-left z-30 cursor-pointer"
                aria-label="Previous slide"
                onClick={handlePrevSlide}
              >
                <ChevronLeft size={24} />
              </button>

              <button
                type="button"
                className="hero-arrow hero-arrow-right z-30 cursor-pointer"
                aria-label="Next slide"
                onClick={handleNextSlide}
              >
                <ChevronRight size={24} />
              </button>

              {/* Slide Indicator Dots */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
                {heroSlides.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 transition-all rounded-full cursor-pointer ${
                      idx === currentSlide
                        ? "w-8 bg-[#c5a265]"
                        : "w-2 bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        {/* ================= TRUST STRIP ================= */}
        <section className="trust-strip">
          <div className="container trust-grid">
            <div className="trust-item">
              <Leaf size={36} strokeWidth={1.3} />
              <div>
                <h3>PURE 925 SILVER</h3>
                <p>Authentic & Hallmarked</p>
              </div>
            </div>

            <div className="trust-item">
              <Gem size={36} strokeWidth={1.3} />
              <div>
                <h3>HANDCRAFTED</h3>
                <p>By Skilled Artisans</p>
              </div>
            </div>

            <div className="trust-item">
              <Flower2 size={36} strokeWidth={1.3} />
              <div>
                <h3>INSPIRED BY TRADITION</h3>
                <p>Designed for Today</p>
              </div>
            </div>

            <div className="trust-item">
              <Truck size={36} strokeWidth={1.3} />
              <div>
                <h3>PAN INDIA SHIPPING</h3>
                <p>Safe & Secure Delivery</p>
              </div>
            </div>
          </div>
        </section>


        {/* ================= BEST SELLERS (Dynamic Merchandising) ================= */}
        {merchandising?.bestSellers?.length > 0 && (
          <section className="product-showcase-section py-16 bg-[#fcfaf7] border-b border-[#eee7dd]" id="bestsellers">
            <div className="container">
              <div className="signature-heading mb-10">
                <p className="eyebrow">MOST CHERISHED</p>
                <h2>Best Sellers</h2>
                <div className="heading-line" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {merchandising.bestSellers.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ================= CATEGORIES ================= */}
        <section className="signature-section" id="collections">
          <div className="container">
            <div className="signature-heading">
              <p className="eyebrow">SHOP BY CATEGORY</p>
              <h2>Our Signature Collections</h2>
              <div className="heading-line"></div>
            </div>

            <div className="signature-grid">
              {loading ? (
                // Skeleton placeholders
                Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="signature-card animate-pulse">
                    <div className="signature-image bg-[#e5ddd2]" />
                    <div className="signature-info">
                      <div className="mx-auto h-4 w-20 bg-[#e5ddd2] rounded" />
                    </div>
                  </div>
                ))
              ) : categories.length > 0 ? (
                categories.map((category) => {
                  const imageUrl =
                    category.mediaAsset?.url ||
                    category.image ||
                    null;

                  return (
                    <Link
                      to={`/category/${category.slug}`}
                      className="signature-card"
                      key={category.id || category.slug}
                    >
                      <div className="signature-image">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={category.name}
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-full w-full bg-[#f4ece0] border border-[#e2d5c3] flex flex-col items-center justify-center p-3 text-center">
                            <Sparkles size={22} className="text-[#b99657] mb-1.5" />
                            <span className="font-serif text-[11px] font-medium text-[#2d2924] tracking-wider uppercase line-clamp-1">
                              {category.name}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="signature-info">
                        <h3>{category.name}</h3>
                        <span>
                          EXPLORE
                          <ArrowRight size={14} />
                        </span>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="col-span-full py-8 text-center text-sm text-[#8a8277]">
                  No active categories available yet.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ================= NEW ARRIVALS (Dynamic Merchandising) ================= */}
        {merchandising?.newArrivals?.length > 0 && (
          <section className="product-showcase-section py-16 bg-white border-b border-[#eee7dd]" id="new-arrivals">
            <div className="container">
              <div className="signature-heading mb-10">
                <p className="eyebrow">FRESH CREATIONS</p>
                <h2>New Arrivals</h2>
                <div className="heading-line" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {merchandising.newArrivals.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}


        {/* ================= FEATURED PRODUCTS (Dynamic Merchandising) ================= */}
        {merchandising?.featured?.length > 0 && (
          <section className="product-showcase-section py-16 bg-[#fcfaf7] border-b border-[#eee7dd]" id="featured-collection">
            <div className="container">
              <div className="signature-heading mb-10">
                <p className="eyebrow">CURATED SPOTLIGHT</p>
                <h2>Featured Products</h2>
                <div className="heading-line" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {merchandising.featured.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ================= TRENDING NOW (Dynamic Merchandising) ================= */}
        {merchandising?.trending?.length > 0 && (
          <section className="product-showcase-section py-16 bg-white border-b border-[#eee7dd]" id="trending-products">
            <div className="container">
              <div className="signature-heading mb-10">
                <p className="eyebrow">THE MODERN EDIT</p>
                <h2>Trending Products</h2>
                <div className="heading-line" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {merchandising.trending.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ================= STORY ================= */}
        <section className="story-section" id="story">
          <div className="story-inner container">
            <div className="story-image flex items-center justify-center bg-gradient-to-br from-[#1e1b18] via-[#2a241f] to-[#141210] p-8 md:p-12 text-white border border-[#42392f] shadow-lg relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-60 h-60 rounded-full bg-[#b99657]/15 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full bg-[#6b1d2f]/20 blur-2xl pointer-events-none" />
              
              <div className="relative z-10 text-center max-w-sm border border-[#c5a265]/40 p-8 bg-[#1e1b18]/60 backdrop-blur-xs">
                <div className="w-12 h-12 rounded-full border border-[#c5a265] flex items-center justify-center mx-auto mb-4 text-[#c5a265]">
                  <Gem size={22} strokeWidth={1.4} />
                </div>
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#c5a265] mb-2 font-serif">
                  PURITY & PROVENANCE
                </p>
                <h3 className="font-serif text-2xl font-medium tracking-wide text-white mb-3">
                  925 Hallmarked
                </h3>
                <p className="text-xs text-[#d6cdbf] font-light leading-relaxed mb-4">
                  Each ASH creation is stamped with certified 925 sterling purity and shaped by hereditary Indian silversmiths.
                </p>
                <div className="inline-block border-t border-[#c5a265]/40 pt-3">
                  <span className="text-[9px] font-semibold tracking-[0.25em] text-[#c5a265] uppercase">
                    AUTHENTIC ARTISANAL CRAFT
                  </span>
                </div>
              </div>
            </div>

            <div className="story-copy">
              <p className="eyebrow">THE ASH PHILOSOPHY</p>
              <h2>Jewellery with a story to tell.</h2>
              <p>
                At ASH, every piece celebrates the beauty of
                Indian craftsmanship. From antique textures to
                detailed motifs, our silver jewellery is designed
                to feel treasured today and for generations to come.
              </p>

              <Link
                to={`/category/${firstCategorySlug}`}
                className="story-button"
              >
                DISCOVER OUR COLLECTION
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export default Home;