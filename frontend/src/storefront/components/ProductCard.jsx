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
 * Displays product image, title, price, compare price, and stock status tag.
 * Adheres strictly to the ASH Jewellery design tokens and aesthetic.
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

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block text-center transition-all duration-300"
    >
      {/* Product Image Container */}
      <div className="relative aspect-[0.88/1] overflow-hidden bg-[#f4ede1]">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center">
            <Gem size={28} strokeWidth={1.2} className="text-[#b99657] mb-2" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#8a7f72] uppercase font-serif">
              ASH 925
            </span>
          </div>
        )}

        {/* Stock / Promotion Badge */}
        {isOutOfStock ? (
          <div className="absolute top-2.5 right-2.5 bg-[#211f1b]/85 px-2 py-0.5 text-[9px] font-semibold tracking-wider text-white uppercase">
            Out of Stock
          </div>
        ) : product.comparePrice && Number(product.comparePrice) > Number(product.price) ? (
          <div className="absolute top-2.5 right-2.5 bg-[#b99657] px-2 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase">
            Sale
          </div>
        ) : null}
      </div>

      {/* Product Details */}
      <div className="pt-3.5 pb-2">
        {/* Category or Eyebrow */}
        {product.category?.name && (
          <p className="text-[9px] font-semibold tracking-[0.2em] text-[#8a8277] uppercase">
            {product.category.name}
          </p>
        )}

        {/* Title */}
        <h3 className="mt-1 font-serif text-[15px] font-medium tracking-[0.08em] text-[#1e1c19] uppercase transition-colors group-hover:text-[#b99657]">
          {product.name}
        </h3>

        {/* Price Row */}
        <div className="mt-1.5 flex items-center justify-center gap-2">
          <span className="text-[13px] font-semibold text-[#1e1c19]">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && Number(product.comparePrice) > Number(product.price) && (
            <span className="text-[11px] text-[#8a8277] line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
