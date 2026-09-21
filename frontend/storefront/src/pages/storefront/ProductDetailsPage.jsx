import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import heritageBangle from "../../assets/jewellery/heritage-silver-bangle.jpg";
import bangle1 from "../../assets/jewellery/bangle-1.jpg";
import bangle5 from "../../assets/jewellery/bangle-5.jpg";
import bangle3 from "../../assets/jewellery/bangle-3.jpg";
import SiteLayout from "../../components/layout/SiteLayout";

export default function ProductDetailsPage() {
  const [selectedImage, setSelectedImage] = useState(
    heritageBangle,
  );

  const productImages = [
    {
      src: heritageBangle,
      alt: "Heritage Silver Bangle",
    },
    {
      src: bangle1,
      alt: "Bangle detail 1",
    },
    {
      src: bangle5,
      alt: "Bangle detail 2",
    },
    {
      src: bangle3,
      alt: "Bangle detail 3",
    },
  ];

  return (
    <SiteLayout>
      <div className="bangle-page">
        <section className="product-page container">
          <Link to="/" className="back-link">
            <ArrowLeft size={15} />
            Back to home
          </Link>

          <div className="product-layout">
            {/* ================= GALLERY ================= */}

            <div className="product-gallery">
              <div className="main-product-image">
                <img src={selectedImage} alt="Heritage Silver Bangle" />
              </div>

              <div className="thumb-row">
                {productImages.map((image) => (
                  <button
                    key={image.src}
                    type="button"
                    className={`product-thumbnail ${
                      selectedImage === image.src ? "active-thumbnail" : ""
                    }`}
                    onClick={() => setSelectedImage(image.src)}
                    aria-label={`View ${image.alt}`}
                  >
                    <img src={image.src} alt={image.alt} />
                  </button>
                ))}
              </div>
            </div>

            {/* ================= PRODUCT DETAILS ================= */}

            <div className="product-details">
              <p className="eyebrow">ASH HERITAGE COLLECTION</p>

              <h1>Heritage Silver Bangle</h1>

              <p className="price">₹12,499</p>

              <div className="detail-rule" />

              <p className="description">
                Handcrafted from 925 sterling silver, inspired by traditional
                Indian heritage and intricate filigree art. A timeless
                masterpiece designed to become part of your story.
              </p>

              <ul className="spec-list">
                <li>
                  <span>Metal</span>
                  925 Sterling Silver
                </li>

                <li>
                  <span>Weight</span>
                  45g
                </li>

                <li>
                  <span>Finish</span>
                  Antique Silver
                </li>

                <li>
                  <span>Authenticity</span>
                  Certificate Included
                </li>
              </ul>

              <Button className="whatsapp-button">ENQUIRE ON WHATSAPP</Button>

              <p className="small-note">
                We will confirm availability, size and final details with you on
                WhatsApp.
              </p>
            </div>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
