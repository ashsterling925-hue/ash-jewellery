import React from "react";
import { Link } from "react-router-dom";
import { Gem } from "lucide-react";

/**
 * Format price in Indian Rupee format (e.g. ₹12,499)
 */
export function formatPrice(amount) {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

/**
 * ProductCard Component
 * Displays product image, title, price, compare price, and stock status tag inside a bordered luxury box,
 * with a quick WhatsApp enquiry button.
 */
export default function ProductCard({ product }) {
  if (!product) return null;

  // Resolve primary image or first available image
  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    product.image ||
    null;

  const isOutOfStock =
    product.stockStatus === "OUT_OF_STOCK" || product.stockQuantity === 0;

  const handleWhatsAppClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const phone = "919876543210";
    const text = encodeURIComponent(
      `Hello ASH Jewellery, I am interested in inquiring about ${product.name} (SKU: ${product.sku || "N/A"}, Price: ${formatPrice(product.price)}). Is this piece available?`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  return (
    <div className="group relative flex flex-col justify-between bg-white border border-[#e7dfd3] hover:border-[#b99657] rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 h-full">
      {/* Clickable Product Area */}
      <Link
        to={`/product/${product.slug}`}
        className="block flex-grow text-center"
      >
        {/* Product Image Box */}
        <div className="relative aspect-[0.92/1] overflow-hidden bg-[#faf7f2] border-b border-[#f0e9df]">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center">
              <Gem size={26} strokeWidth={1.2} className="text-[#b99657] mb-2" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#8a7f72] uppercase font-serif">
                ASH 925
              </span>
            </div>
          )}

          {/* Stock / Promotion Badge */}
          {isOutOfStock ? (
            <div className="absolute top-2.5 right-2.5 bg-[#211f1b]/85 px-2 py-0.5 text-[9px] font-semibold tracking-wider text-white uppercase rounded-xs">
              Out of Stock
            </div>
          ) : product.comparePrice && Number(product.comparePrice) > Number(product.price) ? (
            <div className="absolute top-2.5 right-2.5 bg-[#b99657] px-2 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase rounded-xs">
              Sale
            </div>
          ) : null}
        </div>

        {/* Product Details */}
        <div className="p-3.5 text-center flex flex-col justify-between">
          {/* Category */}
          {product.category?.name && (
            <p className="text-[9px] font-semibold tracking-[0.2em] text-[#97753e] uppercase line-clamp-1">
              {product.category.name}
            </p>
          )}

          {/* Title */}
          <h3 className="mt-1 font-serif text-sm sm:text-[15px] font-medium tracking-wide text-[#1e1c19] uppercase line-clamp-1 group-hover:text-[#b99657] transition-colors">
            {product.name}
          </h3>

          {/* Price Row */}
          <div className="mt-1.5 flex items-center justify-center gap-2">
            <span className="text-sm font-semibold text-[#1e1c19]">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && Number(product.comparePrice) > Number(product.price) && (
               <span className="text-xs text-[#8a8277] line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* WhatsApp Enquiry Button */}
      <div className="px-3.5 pb-3.5 pt-0">
        <button
          type="button"
          onClick={handleWhatsAppClick}
          className="w-full py-2 px-3 rounded-lg bg-[#d28a25] hover:bg-[#b87317] active:scale-[0.98] text-white text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer shadow-xs"
        >
          {/* Official Crisp WhatsApp SVG Icon */}
          <svg
            className="w-4 h-4 fill-current text-white flex-shrink-0"
            viewBox="0 0 24 24"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          <span>Enquire on WhatsApp</span>
        </button>
      </div>
    </div>
  );
}
