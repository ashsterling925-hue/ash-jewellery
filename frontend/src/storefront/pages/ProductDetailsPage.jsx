import { ArrowLeft, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import SiteLayout from "@/storefront/components/SiteLayout";
import { storefrontApi } from "@/lib/api/storefrontApi";
import { formatPrice } from "@/storefront/components/ProductCard";

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const targetSlug = slug || "heritage-silver-bangle";

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadProduct() {
      setLoading(true);
      setError(null);
      try {
        let res;
        try {
          res = await storefrontApi.getProductBySlug(targetSlug);
        } catch (fetchErr) {
          // Fallback if accessed via generic route
          if (!slug) {
            const listRes = await storefrontApi.getProducts({
              limit: 1,
            });
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

          // Find primary image or first available
          const primary =
            prod.images?.find((img) => img.isPrimary)?.url ||
            prod.images?.[0]?.url ||
            prod.image ||
            null;
          setSelectedImage(primary);
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
      `Hello ASH Jewellery, I am interested in inquiring about ${product.name} (Product ID: ${product.sku || "N/A"}, Price: ${formatPrice(product.price)}). Is this piece available?`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  if (loading) {
    return (
      <SiteLayout>
        <div className="bangle-page">
          <section className="product-page container">
            <div className="mb-6 h-4 w-28 bg-[#eee7dd] animate-pulse rounded" />
            <div className="product-layout animate-pulse">
              <div className="product-gallery">
                <div className="main-product-image bg-[#eee7dd]" />
                <div className="thumb-row">
                  <div className="h-24 bg-[#eee7dd]" />
                  <div className="h-24 bg-[#eee7dd]" />
                  <div className="h-24 bg-[#eee7dd]" />
                </div>
              </div>
              <div className="product-details space-y-4">
                <div className="h-4 w-32 bg-[#eee7dd]" />
                <div className="h-10 w-3/4 bg-[#eee7dd]" />
                <div className="h-6 w-24 bg-[#eee7dd]" />
                <div className="h-20 w-full bg-[#eee7dd]" />
                <div className="h-32 w-full bg-[#eee7dd]" />
                <div className="h-12 w-full bg-[#eee7dd]" />
              </div>
            </div>
          </section>
        </div>
      </SiteLayout>
    );
  }

  if (error || !product) {
    return (
      <SiteLayout>
        <div className="bangle-page">
          <section className="product-page container py-24 text-center">
            <h1 className="font-serif text-3xl font-medium text-[#1e1c19]">
              Product Not Found
            </h1>
            <p className="mt-3 text-sm text-[#8a8277]">
              The jewellery piece you are looking for is unavailable or has been archived.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-[#211f1b] px-6 py-3 text-xs font-semibold tracking-wider text-white uppercase hover:bg-black"
              >
                <ArrowLeft size={14} /> Back to Home
              </Link>
            </div>
          </section>
        </div>
      </SiteLayout>
    );
  }

  // Collect images
  const images = product.images && product.images.length > 0
    ? product.images
    : product.image
    ? [{ url: product.image, altText: product.name }]
    : [];

  /* =====================================================================
     SPECIFICATIONS RESOLUTION:
     - Only non-empty fields will be visible
     - GENDER MUST NEVER BE VISIBLE (whether empty or not)
     ===================================================================== */
  const dynamicSpecs = [];

  // Category (if not empty)
  if (product.category?.name && product.category.name.trim()) {
    dynamicSpecs.push({ name: "Category", value: product.category.name.trim() });
  }

  // Subcategory (if not empty)
  if (product.subcategory?.name && product.subcategory.name.trim()) {
    dynamicSpecs.push({ name: "Subcategory", value: product.subcategory.name.trim() });
  }

  // Metal / Material (if not empty)
  if (product.material && product.material.trim()) {
    dynamicSpecs.push({ name: "Metal", value: product.material.trim() });
  }

  // Product ID / SKU (if not empty)
  if (product.sku && product.sku.trim()) {
    dynamicSpecs.push({ name: "Product ID", value: product.sku.trim() });
  }

  // Colour (if not empty)
  if (product.colour && product.colour.trim()) {
    dynamicSpecs.push({ name: "Colour", value: product.colour.trim() });
  }

  // Finish (if not empty)
  if (product.finish && product.finish.trim()) {
    dynamicSpecs.push({ name: "Finish", value: product.finish.trim() });
  }

  // Dynamic attribute specifications from DB (strictly excluding gender)
  if (product.attributes && Array.isArray(product.attributes)) {
    for (const attr of product.attributes) {
      if (!attr || !attr.name) continue;
      // STRICT FILTER: GENDER IS NEVER VISIBLE ON CUSTOMER SIDE
      if (attr.name.toLowerCase() === "gender") continue;

      if (!dynamicSpecs.some((s) => s.name.toLowerCase() === attr.name.toLowerCase())) {
        const valStr = (attr.values || [])
          .map((v) => v.value)
          .filter(Boolean)
          .join(", ");
        if (valStr && valStr.trim()) {
          dynamicSpecs.push({
            name: attr.name,
            value: valStr.trim(),
          });
        }
      }
    }
  }

  const eyebrowText =
    product.collection?.name
      ? `ASH ${product.collection.name.toUpperCase()}`
      : product.category?.name
      ? `ASH ${product.category.name.toUpperCase()}`
      : "ASH STERLING SILVER";

  return (
    <SiteLayout>
      <div className="bangle-page">
        <section className="product-page container">
          <Link
            to={product.category?.slug ? `/category/${product.category.slug}` : "/"}
            className="back-link"
          >
            <ArrowLeft size={15} />
            {product.category?.name ? `Back to ${product.category.name}` : "Back to catalogue"}
          </Link>

          <div className="product-layout">
            {/* ================= GALLERY ================= */}
            <div className="product-gallery">
              <div className="main-product-image bg-[#f6f0e6]">
                {(selectedImage || images[0]?.url) ? (
                  <img
                    src={selectedImage || images[0].url}
                    alt={product.name}
                  />
                ) : (
                  <div className="w-full aspect-square flex flex-col items-center justify-center p-8 text-center">
                    <Gem size={44} strokeWidth={1.2} className="text-[#b99657] mb-3" />
                    <span className="text-xs font-bold tracking-[0.25em] text-[#8a7e70] uppercase font-serif">
                      ASH STERLING 925
                    </span>
                    <span className="text-[11px] text-[#a89e90] mt-1">Authentic handcrafted jewellery</span>
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="thumb-row">
                  {images.map((image, idx) => {
                    const imgUrl = image.url;
                    const isActive = (selectedImage || images[0].url) === imgUrl;
                    return (
                      <button
                        key={image.id || idx}
                        type="button"
                        className={`product-thumbnail ${
                          isActive ? "active-thumbnail ring-2 ring-[#b99657]" : ""
                        }`}
                        onClick={() => setSelectedImage(imgUrl)}
                        aria-label={`View ${image.altText || product.name}`}
                      >
                        <img
                          src={imgUrl}
                          alt={image.altText || product.name}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ================= PRODUCT DETAILS ================= */}
            <div className="product-details">
              <p className="eyebrow">{eyebrowText}</p>

              <h1>{product.name}</h1>

              <div className="flex items-center gap-3">
                <p className="price">{formatPrice(product.price)}</p>
                {product.comparePrice && Number(product.comparePrice) > Number(product.price) && (
                  <p className="text-base text-[#8a8277] line-through">
                    {formatPrice(product.comparePrice)}
                  </p>
                )}
                {product.stockStatus === "OUT_OF_STOCK" && (
                  <span className="rounded bg-[#a64b42]/10 px-2 py-0.5 text-xs font-semibold text-[#a64b42] uppercase">
                    Out of Stock
                  </span>
                )}
              </div>

              <div className="detail-rule" />

              {/* Description: ONLY rendered if non-empty */}
              {product.description && product.description.trim() ? (
                <p className="description">{product.description.trim()}</p>
              ) : null}

              {/* Dynamic Specifications: ONLY non-empty fields, NEVER gender */}
              {dynamicSpecs.length > 0 && (
                <ul className="spec-list">
                  {dynamicSpecs.map((spec) => (
                    <li key={spec.name}>
                      <span>{spec.name}</span>
                      {spec.value}
                    </li>
                  ))}
                </ul>
              )}

              {/* WhatsApp Enquiry Button */}
              <Button
                className="whatsapp-button cursor-pointer transition-transform hover:scale-[1.01]"
                onClick={handleWhatsAppEnquiry}
              >
                ENQUIRE ON WHATSAPP
              </Button>

              <p className="small-note">
                We will confirm availability, size and handcrafted details with you on WhatsApp.
              </p>
            </div>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
