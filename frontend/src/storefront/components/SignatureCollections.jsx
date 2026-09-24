import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

/**
 * Luxury Signature Category Card
 * Displays high-res full image with gradient scrim and serif typography
 */
function SignatureCard({ category, variant = "grid", className = "" }) {
  if (!category) return null;
  const imageUrl = category.mediaAsset?.url || category.image;

  return (
    <Link
      to={`/category/${category.slug}`}
      className={`group relative block overflow-hidden rounded-xs border border-[#e8ded2] bg-[#f9f6f0] shadow-2xs hover:shadow-xl transition-all duration-500 cursor-pointer ${className}`}
    >
      {/* Background Image / Placeholder */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#f4ece0]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={category.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#f8f3eb] via-[#f3ebe0] to-[#eae0d2] flex flex-col items-center justify-center p-6 text-center">
            <Sparkles size={variant === "large" ? 36 : 24} className="text-[#b99657] mb-2" />
            <span className="font-serif text-[11px] md:text-xs font-semibold text-[#423a31] tracking-[0.22em] uppercase">
              ASH JEWELLERY
            </span>
          </div>
        )}

        {/* Luxury Vignette / Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10 group-hover:from-black/85 group-hover:via-black/40 transition-colors duration-500" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 w-full h-full flex flex-col justify-end p-5 sm:p-6 md:p-8 text-white">
        <span className="text-[10px] md:text-[11px] font-bold tracking-[0.25em] text-[#d28a25] uppercase mb-1 font-serif">
          COLLECTION
        </span>

        <h3
          className={`font-serif font-medium text-white tracking-wide uppercase mb-3 drop-shadow-sm ${
            variant === "large"
              ? "text-2xl sm:text-3xl md:text-4xl"
              : variant === "wide"
              ? "text-xl sm:text-2xl md:text-3xl"
              : variant === "small"
              ? "text-base sm:text-lg md:text-xl"
              : "text-base sm:text-lg md:text-xl"
          }`}
        >
          {category.name}
        </h3>

        <div className="inline-flex items-center gap-2 text-xs md:text-sm font-bold tracking-[0.18em] text-[#f4efe8] group-hover:text-[#d28a25] transition-colors duration-300">
          <span>EXPLORE</span>
          <ArrowRight
            size={14}
            className="transform group-hover:translate-x-1.5 transition-transform duration-300 text-[#d28a25]"
          />
        </div>
      </div>
    </Link>
  );
}

/**
 * Dynamic Signature Collections Section
 * Automatically adapts layout based on active category count:
 * - 1 Category: Single large centered card
 * - 2 Categories: Two equal wide cards
 * - 3 Categories: 1 Featured Large + 2 Stacked cards
 * - 4 Categories: 1 Featured Large + 1 Wide + 2 Small cards
 * - 5+ Categories: Featured 4-card showcase + 4-column card grid below
 */
export default function SignatureCollections({ categories = [], configuration = {}, loading = false }) {
  const activeCount = categories.length;

  const layoutData = useMemo(() => {
    if (activeCount === 0) return { type: "EMPTY" };
    if (activeCount === 1) return { type: "SINGLE", card: categories[0] };
    if (activeCount === 2) return { type: "TWO_EQUAL", cards: categories.slice(0, 2) };

    const configuredFeaturedId = configuration?.featuredCategoryId;
    const configuredWideId = configuration?.wideCategoryId;

    // Resolve Featured Category
    const featured =
      categories.find((c) => c.id === configuredFeaturedId) || categories[0];

    if (activeCount === 3) {
      const small = categories.filter((c) => c.id !== featured.id).slice(0, 2);
      return { type: "THREE", featured, small };
    }

    // 4 or more categories
    const wide =
      categories.find((c) => c.id === configuredWideId && c.id !== featured.id) ||
      categories.find((c) => c.id !== featured.id) ||
      categories[1];

    const remaining = categories.filter(
      (c) => c.id !== featured.id && c.id !== wide?.id
    );
    const small = remaining.slice(0, 2);
    const extra = remaining.slice(2);

    return {
      type: activeCount === 4 ? "FOUR" : "FIVE_PLUS",
      featured,
      wide,
      small,
      extra,
    };
  }, [categories, configuration, activeCount]);

  if (loading && activeCount === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[4/5] bg-gradient-to-br from-[#f8f5ef] to-[#ede3d4] border border-[#e8ded2] rounded-xs animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (layoutData.type === "EMPTY") {
    return (
      <div className="py-12 text-center text-xs text-[#8a8277]">
        No active collections available yet.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* CASE 1 — 1 CATEGORY: Single Large Centered Card */}
      {layoutData.type === "SINGLE" && (
        <div className="max-w-4xl mx-auto">
          <SignatureCard
            category={layoutData.card}
            variant="large"
            className="h-[380px] sm:h-[440px] md:h-[500px]"
          />
        </div>
      )}

      {/* CASE 2 — 2 CATEGORIES: Two Equal Wide Cards */}
      {layoutData.type === "TWO_EQUAL" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
          {layoutData.cards.map((cat) => (
            <SignatureCard
              key={cat.id || cat.slug}
              category={cat}
              variant="wide"
              className="h-[340px] sm:h-[400px] md:h-[460px]"
            />
          ))}
        </div>
      )}

      {/* CASE 3 — 3 CATEGORIES: 1 Featured Large + 2 Stacked Cards */}
      {layoutData.type === "THREE" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-7">
          {/* Left: Featured Large Card */}
          <div className="md:col-span-7">
            <SignatureCard
              category={layoutData.featured}
              variant="large"
              className="h-[380px] sm:h-[450px] md:h-[520px]"
            />
          </div>

          {/* Right: 2 Stacked Cards */}
          <div className="md:col-span-5 flex flex-col gap-5 md:gap-7">
            {layoutData.small.map((cat) => (
              <SignatureCard
                key={cat.id || cat.slug}
                category={cat}
                variant="small"
                className="h-[220px] md:h-[246px] flex-1"
              />
            ))}
          </div>
        </div>
      )}

      {/* CASE 4 & 5 — 4+ CATEGORIES: Asymmetric Luxury 4-Card Showcase */}
      {(layoutData.type === "FOUR" || layoutData.type === "FIVE_PLUS") && (
        <div className="space-y-8 md:space-y-12">
          {/* Top 4 Categories Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-7">
            {/* Left Column: Featured Large (tall) */}
            <div className="md:col-span-5">
              <SignatureCard
                category={layoutData.featured}
                variant="large"
                className="h-[400px] sm:h-[460px] md:h-[550px]"
              />
            </div>

            {/* Right Column: Wide on top, 2 Small on bottom */}
            <div className="md:col-span-7 flex flex-col gap-5 md:gap-7">
              {/* Wide Card */}
              <SignatureCard
                category={layoutData.wide}
                variant="wide"
                className="h-[230px] md:h-[260px]"
              />

              {/* 2 Small Cards Bottom Row */}
              <div className="grid grid-cols-2 gap-5 md:gap-7 flex-1">
                {layoutData.small.map((cat) => (
                  <SignatureCard
                    key={cat.id || cat.slug}
                    category={cat}
                    variant="small"
                    className="h-[200px] md:h-[262px]"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* CASE 5 — REMAINING CATEGORIES: Clean 4-Column Grid Below */}
          {layoutData.type === "FIVE_PLUS" && layoutData.extra?.length > 0 && (
            <div className="pt-4 border-t border-[#ede4d7]">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 md:gap-7">
                {layoutData.extra.map((cat) => (
                  <SignatureCard
                    key={cat.id || cat.slug}
                    category={cat}
                    variant="grid"
                    className="h-[240px] md:h-[290px]"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
