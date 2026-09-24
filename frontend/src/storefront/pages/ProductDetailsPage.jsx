import { ArrowLeft, Gem, ShieldCheck, Globe } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import SiteLayout from "@/storefront/components/SiteLayout";
import { storefrontApi } from "@/lib/api/storefrontApi";
import { formatPrice } from "@/storefront/components/ProductCard";

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const targetSlug = slug || "heritage-silver-bangle";

  const cachedProduct = storefrontApi.getCachedSync(`/storefront/products/${targetSlug}`);
  const [product, setProduct] = useState(cachedProduct);
  const [selectedImage, setSelectedImage] = useState(() => {
    if (!cachedProduct) return "";
    return (
      cachedProduct.images?.find((img) => img.isPrimary)?.url ||
      cachedProduct.images?.[0]?.url ||
      cachedProduct.image ||
      ""
    );
  });
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(!cachedProduct);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadProduct() {
      if (!product) {
        setLoading(true);
      }
      setError(null);
      try {
        let res;
        try {
          res = await storefrontApi.getProductBySlug(targetSlug);
        } catch (fetchErr) {
          if (!slug) {
            const listRes = await storefrontApi.getProducts({ limit: 1 });
            if (listRes?.data?.length > 0) {
              res = { data: listRes.data[0] };
            } else {
              throw fetchErr;
            }
          } else {
            throw fetchErr;
          }
        }

        if (isMounted && res?.data) {
          const prod = res.data;
          setProduct(prod);

          const primary =
            prod.images?.find((img) => img.isPrimary)?.url ||
            prod.images?.[0]?.url ||
            prod.image ||
            null;
          setSelectedImage(primary);
          setLoading(false); // Unblock immediately upon product data

          // Fetch related products for "YOU MAY ALSO LIKE" asynchronously (non-blocking)
          if (prod.category?.slug) {
            storefrontApi
              .getProducts({
                categorySlug: prod.category.slug,
                limit: 6,
              })
              .then((relRes) => {
                if (isMounted && relRes?.data) {
                  const filtered = relRes.data
                    .filter((p) => p.id !== prod.id)
                    .slice(0, 4);
                  setRelatedProducts(filtered);
                }
              })
              .catch(() => {});
          }
        }
      } catch (err) {
        console.error("Failed to load product:", err);
        if (isMounted) {
          setError(err.message || "Product not found");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [targetSlug, slug]);

  const handleWhatsAppEnquiry = () => {
    if (!product) return;
    const phone = "919876543210";
    const text = encodeURIComponent(
      `Hello ASH Jewellery, I am interested in inquiring about ${product.name} (SKU: ${product.sku || "N/A"}, Quantity: ${quantity}, Price: ${formatPrice(product.price)}). Is this piece available?`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  if (loading) {
    return (
      <SiteLayout>
        {/* Top Gold Shimmer Progress Line */}
        <div className="w-full h-[2.5px] luxury-gold-bar fixed top-0 left-0 z-50 shadow-xs" />

        <div className="bg-[#fffdfa] py-12 min-h-screen">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="aspect-square luxury-shimmer border border-[#e7dfd3]" />
              <div className="space-y-5">
                <div className="h-4 w-28 luxury-shimmer-subtle rounded-xs" />
                <div className="h-8 w-3/4 luxury-shimmer-subtle rounded-xs" />
                <div className="h-6 w-32 luxury-shimmer-subtle rounded-xs" />
                <div className="h-24 w-full luxury-shimmer-subtle rounded-xs" />
                <div className="h-12 w-full luxury-shimmer rounded-xs" />
              </div>
            </div>
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (error || !product) {
    return (
      <SiteLayout>
        <div className="bg-[#fffdfa] py-20 min-h-screen text-center">
          <div className="container max-w-md mx-auto px-4">
            <h1 className="font-serif text-3xl font-medium text-[#1e1c19]">
              Product Not Found
            </h1>
            <p className="mt-3 text-xs text-[#8a8277]">
              The jewellery piece you are looking for is unavailable or has been archived.
            </p>
            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-[#211f1b] px-6 py-2.5 text-xs font-semibold tracking-wider text-white uppercase hover:bg-black transition-colors"
              >
                <ArrowLeft size={14} /> Back to Home
              </Link>
            </div>
          </div>
        </div>
      </SiteLayout>
    );
  }

  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.image
        ? [{ url: product.image, altText: product.name }]
        : [];

  const mainImageUrl = selectedImage || images[0]?.url || null;

  return (
    <SiteLayout>
      <div className="bg-[#fffdfa] py-8 sm:py-12 min-h-screen">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6">
          {/* Back Navigation Link */}
          <div className="mb-6">
            <Link
              to={product.category?.slug ? `/category/${product.category.slug}` : "/"}
              className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.12em] text-[#716b62] hover:text-[#1e1c19] uppercase transition-colors"
            >
              <ArrowLeft size={13} />
              {product.category?.name ? `Back to ${product.category.name}` : "Back to catalogue"}
            </Link>
          </div>

          {/* Product Hero: Exact Layout from Context Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-start">
            {/* LEFT COLUMN: Main Image + Thumbnail Row */}
            <div className="flex flex-col gap-4">
              {/* Main Product Image Container */}
              <div className="relative aspect-square w-full overflow-hidden bg-white border border-[#eee7dd] rounded-xs flex items-center justify-center p-4">
                {mainImageUrl ? (
                  <img
                    src={mainImageUrl}
                    alt={product.name}
                    className="w-full h-full object-contain transition-all duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <Gem size={44} strokeWidth={1.2} className="text-[#b99657] mb-3" />
                    <span className="text-xs font-bold tracking-[0.25em] text-[#8a7e70] uppercase font-serif">
                      ASH 925 SILVER
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnails Row */}
              {images.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                  {images.map((img, idx) => {
                    const imgUrl = img.url;
                    const isActive = mainImageUrl === imgUrl;
                    return (
                      <button
                        key={img.id || idx}
                        type="button"
                        onClick={() => setSelectedImage(imgUrl)}
                        className={`relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 overflow-hidden rounded-xs border transition-all cursor-pointer bg-white p-1 ${isActive
                            ? "border-2 border-[#1e1c19] shadow-xs"
                            : "border-[#e0d6c8] hover:border-[#b99657]"
                          }`}
                        aria-label={`View thumbnail ${idx + 1}`}
                      >
                        <img
                          src={imgUrl}
                          alt={img.altText || product.name}
                          className="w-full h-full object-contain"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Product Info & Actions */}
            <div className="flex flex-col justify-start">
              {/* Product Title */}
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-[32px] font-medium text-[#1e1c19] tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Price */}
              <div className="mt-2.5 mb-3 flex items-baseline gap-3">
                <span className="text-xl sm:text-2xl font-bold text-[#1e1c19]">
                  {formatPrice(product.price)}
                </span>
                {product.comparePrice && Number(product.comparePrice) > Number(product.price) && (
                  <span className="text-sm text-[#8a8277] line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
                {product.stockStatus === "OUT_OF_STOCK" && (
                  <span className="rounded bg-[#a64b42]/10 px-2 py-0.5 text-[11px] font-semibold text-[#a64b42] uppercase">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Description (only shown if provided by admin) */}
              {product.description?.trim() && (
                <p className="text-xs sm:text-[13px] text-[#4a4339] leading-relaxed mb-4 whitespace-pre-line">
                  {product.description.trim()}
                </p>
              )}

              {/* Specifications List with Clean Bullets */}
              <ul className="space-y-1.5 text-xs text-[#2a2621] mb-5">
                {product.material && (
                  <li className="flex items-center gap-2">
                    <span className="text-[#1e1c19] font-bold">•</span>
                    <span>
                      <strong className="font-semibold text-[#1e1c19]">Metal:</strong>{" "}
                      {product.material}
                    </span>
                  </li>
                )}
                {product.weight && (
                  <li className="flex items-center gap-2">
                    <span className="text-[#1e1c19] font-bold">•</span>
                    <span>
                      <strong className="font-semibold text-[#1e1c19]">Weight:</strong>{" "}
                      {product.weight}
                    </span>
                  </li>
                )}
                {product.finish && (
                  <li className="flex items-center gap-2">
                    <span className="text-[#1e1c19] font-bold">•</span>
                    <span>
                      <strong className="font-semibold text-[#1e1c19]">Finish:</strong>{" "}
                      {product.finish}
                    </span>
                  </li>
                )}
                {/* Dynamic Attributes from Admin */}
                {product.attributes?.map((attr) => {
                  const valStr = (attr.values || []).map((v) => v.value).join(", ");
                  if (!valStr) return null;
                  return (
                    <li key={attr.attributeId} className="flex items-center gap-2">
                      <span className="text-[#1e1c19] font-bold">•</span>
                      <span>
                        <strong className="font-semibold text-[#1e1c19]">{attr.name}:</strong>{" "}
                        {valStr}
                      </span>
                    </li>
                  );
                })}
                <li className="flex items-center gap-2">
                  <span className="text-[#1e1c19] font-bold">•</span>
                  <span>Authenticity Certificate Included</span>
                </li>
              </ul>

              {/* Quantity Selector: Quantity: [ - ] 1 [ + ] */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-semibold text-[#1e1c19]">Quantity:</span>
                <div className="flex items-center border border-[#d6cdbf] rounded-xs bg-white overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1 text-sm font-semibold text-[#5c5448] hover:bg-[#f6eee2] transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-bold text-[#1e1c19] min-w-[28px] text-center select-none">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1 text-sm font-semibold text-[#5c5448] hover:bg-[#f6eee2] transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Big Saffron Button: Enquire on WhatsApp */}
              <button
                type="button"
                onClick={handleWhatsAppEnquiry}
                className="w-full py-3.5 px-6 rounded-md bg-[#d28a25] hover:bg-[#b87317] text-white font-semibold text-sm tracking-wide flex items-center justify-center gap-2 shadow-sm transition-all duration-200 cursor-pointer active:scale-[0.99]"
              >
                {/* Official Crisp WhatsApp SVG Icon */}
                <svg
                  className="w-5 h-5 fill-current text-white flex-shrink-0"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span>Enquire on WhatsApp</span>
              </button>

              {/* Trust Badges Row (from context image) */}
              <div className="flex items-center gap-6 mt-4 text-[11px] text-[#716b62]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#1e1c19]" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe size={14} className="text-[#1e1c19]" />
                  <span>Global Shipping</span>
                </div>
              </div>
            </div>
          </div>

          {/* YOU MAY ALSO LIKE Section (from context image) */}
          {relatedProducts.length > 0 && (
            <div className="mt-16 pt-10 border-t border-[#ede6da]">
              <h2 className="text-center font-serif text-sm font-semibold tracking-[0.2em] text-[#1e1c19] uppercase mb-8">
                YOU MAY ALSO LIKE
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map((rel) => {
                  const relImg =
                    rel.images?.find((i) => i.isPrimary)?.url ||
                    rel.images?.[0]?.url ||
                    rel.image;
                  return (
                    <Link
                      key={rel.id}
                      to={`/product/${rel.slug}`}
                      className="group block bg-white border border-[#ede5d8] p-3 text-center shadow-2xs hover:shadow-md transition-all duration-300"
                    >
                      <div className="aspect-square overflow-hidden bg-[#f7f2ea] mb-3 flex items-center justify-center">
                        {relImg ? (
                          <img
                            src={relImg}
                            alt={rel.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <Gem size={26} strokeWidth={1.2} className="text-[#b99657]" />
                        )}
                      </div>
                      <h3 className="font-serif text-xs font-medium text-[#1e1c19] truncate group-hover:text-[#b99657] transition-colors mb-2">
                        {rel.name}
                      </h3>
                      <span className="text-[10px] font-bold tracking-[0.2em] text-[#b99657] uppercase inline-block">
                        VIEW
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Minimal Copyright Footnote */}
          <div className="mt-12 text-center text-[10px] text-[#8a8277]">
            © ash jewellery. @ 2024. Rights Reserved.
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
