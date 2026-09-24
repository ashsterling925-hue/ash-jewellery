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
import { useState, useEffect } from "react";
import SiteHeader from "@/storefront/components/SiteHeader";
import SiteFooter from "@/storefront/components/SiteFooter";
import { storefrontApi } from "@/lib/api/storefrontApi";


function Home() {
  const [categories, setCategories] = useState([]);
  const [hero, setHero] = useState(null);
  const [banners, setBanners] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadHomePageData() {
      try {
        const [catRes, heroRes, bannersRes, offersRes] = await Promise.allSettled([
          storefrontApi.getCategories({
            limit: 6,
            sortBy: "sortOrder",
            sortOrder: "asc",
          }),
          storefrontApi.getHero(),
          storefrontApi.getBanners({ position: "HOME_PROMOTION" }),
          storefrontApi.getSpecialOffers(),
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
          if (offersRes.status === "fulfilled" && offersRes.value?.data) {
            setOffers(offersRes.value.data);
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

  const [heroImageError, setHeroImageError] = useState(false);

  useEffect(() => {
    setHeroImageError(false);
  }, [hero?.mediaAsset?.url]);

  const firstCategorySlug = categories[0]?.slug || "bangles";
  const rawHeroImage = hero?.mediaAsset?.url || null;
  const hasValidHeroImage = Boolean(rawHeroImage && !heroImageError);
  const heroAlt = hero?.mediaAsset?.altText || hero?.heading || "ASH Jewellery heritage collection";

  return (
    <div className="home-page">
      <SiteHeader />

      <main>
        {/* ================= HERO ================= */}
        <section
          className={`hero-banner ${hasValidHeroImage ? "has-image" : "no-image"}`}
          style={hasValidHeroImage ? { backgroundImage: `url("${rawHeroImage}")` } : undefined}
        >
          {hasValidHeroImage && (
            <img
              className="hero-background-image"
              src={rawHeroImage}
              alt={heroAlt}
              onError={() => setHeroImageError(true)}
            />
          )}

          <div className="hero-overlay"></div>

          <div className="hero-content container">
            <div className="hero-copy">
              <p className="hero-eyebrow">TRADITION IN EVERY DETAIL</p>

              <h1>
                {hero?.heading ? (
                  <span style={{ whiteSpace: "pre-line" }}>{hero.heading}</span>
                ) : (
                  <>
                    THE ART OF
                    <br />
                    HERITAGE SILVER
                  </>
                )}
              </h1>

              <p className="hero-description">
                {hero?.subheading ||
                  "Discover handcrafted jewellery inspired by Indian tradition, made for your modern story."}
              </p>

              <Link
                to={hero?.buttonUrl || `/category/${firstCategorySlug}`}
                className="primary-cta"
              >
                {hero?.buttonText || "EXPLORE COLLECTIONS"}
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="hero-side-copy">
              <p>Timeless</p>
              <p>Tradition</p>
              <p>Modern You</p>
              <div className="hero-side-line"></div>
            </div>
          </div>

          <button
            className="hero-arrow hero-arrow-left"
            aria-label="Previous slide"
          >
            <ChevronLeft size={25} />
          </button>

          <button
            className="hero-arrow hero-arrow-right"
            aria-label="Next slide"
          >
            <ChevronRight size={25} />
          </button>
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

        {/* ================= SPECIAL OFFERS (if active) ================= */}
        {offers.length > 0 && (
          <section className="special-offers-section py-12 bg-[#fbf8f2] border-y border-[#ede6da]">
            <div className="container">
              <div className="text-center mb-8">
                <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#b99657] mb-2 font-serif">
                  SPECIAL PRIVILEGES
                </p>
                <h2 className="text-2xl md:text-3xl font-serif text-[#1e1c19] tracking-wide">
                  Curated Limited-Time Offers
                </h2>
                <div className="w-12 h-[2px] bg-[#b99657] mx-auto mt-3" />
              </div>

              <div
                className={`grid gap-6 ${
                  offers.length === 1
                    ? "max-w-xl mx-auto"
                    : offers.length === 2
                    ? "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto"
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {offers.map((offer) => {
                  const offerImg = offer.mediaAsset?.url || null;
                  const targetUrl = offer.resolvedUrl || offer.buttonUrl || "/catalogue";

                  return (
                    <div
                      key={offer.id}
                      className="bg-white border border-[#e5ddd2] p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                    >
                      {offer.discountText && (
                        <div className="absolute top-3 right-3 bg-[#6b1d2f] text-white text-[10px] font-bold tracking-widest px-2.5 py-1 uppercase">
                          {offer.discountText}
                        </div>
                      )}

                      <div>
                        {offerImg && (
                          <div className="w-full h-48 mb-4 overflow-hidden bg-[#f4efe6]">
                            <img
                              src={offerImg}
                              alt={offer.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        )}
                        <h3 className="font-serif text-lg text-[#1e1c19] mb-1.5 tracking-wide font-medium">
                          {offer.title}
                        </h3>
                        {offer.subtitle && (
                          <p className="text-xs text-[#b99657] font-semibold tracking-wider uppercase mb-2">
                            {offer.subtitle}
                          </p>
                        )}
                        {offer.description && (
                          <p className="text-xs text-[#5c5549] leading-relaxed mb-4">
                            {offer.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-2">
                        <Link
                          to={targetUrl}
                          className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.15em] text-[#1e1c19] group-hover:text-[#6b1d2f] transition-colors uppercase"
                        >
                          {offer.buttonText || "SHOP NOW"}
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
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

        {/* ================= PROMOTIONAL BANNERS (if active) ================= */}
        {banners.length > 0 && (
          <section className="promotional-banners-section py-12 bg-white">
            <div className="container">
              <div className={`grid gap-6 ${banners.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
                {banners.map((banner) => {
                  const bannerImg = banner.mediaAsset?.url || banner.image;
                  const bannerLink = banner.targetUrl || "/catalogue";

                  return (
                    <div
                      key={banner.id}
                      className="relative overflow-hidden group min-h-[260px] md:min-h-[300px] flex items-center bg-[#1e1c19] border border-[#e5ddd2]"
                    >
                      {bannerImg && (
                        <img
                          src={bannerImg}
                          alt={banner.title}
                          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-75 group-hover:scale-105 transition-all duration-700"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />

                      <div className="relative z-10 p-8 md:p-10 max-w-md text-white">
                        {banner.subtitle && (
                          <p className="text-[10px] font-bold tracking-[0.25em] text-[#c5a265] uppercase mb-2">
                            {banner.subtitle}
                          </p>
                        )}
                        <h3 className="text-xl md:text-2xl font-serif font-medium tracking-wide mb-3 leading-snug">
                          {banner.title}
                        </h3>
                        <Link
                          to={bannerLink}
                          className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.15em] text-white border-b border-[#c5a265] pb-1 hover:text-[#c5a265] transition-colors uppercase mt-2"
                        >
                          DISCOVER MORE
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
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