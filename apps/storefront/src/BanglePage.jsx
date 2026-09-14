import { ArrowLeft, Heart, Search, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "./router";
import { useState } from "react";

export default function BanglePage() {
  const [selectedImage, setSelectedImage] = useState(
    "/jewellery/heritage-silver-bangle.jpg"
  );

  const productImages = [
    {
      src: "/jewellery/heritage-silver-bangle.jpg",
      alt: "Heritage Silver Bangle",
    },
    {
      src: "/jewellery/bangle-1.jpg",
      alt: "Bangle detail 1",
    },
    {
      src: "/jewellery/bangle-5.jpg",
      alt: "Bangle detail 2",
    },
    {
      src: "/jewellery/bangle-3.jpg",
      alt: "Bangle detail 3",
    },
  ];

  return (
    <div className="bangle-page">

      {/* ================= HEADER ================= */}

      <header className="site-header">

        <div className="header-main container">

          <Link to="/" className="brand">
            ASH <span>JEWELLERY</span>
          </Link>

          <nav className="desktop-nav">

            <Link to="/">
              HOME
            </Link>

            <Link to="/bangles" className="active">
              BANGLES
            </Link>

            <a href="/#collections">
              COLLECTIONS
            </a>

            <a href="/#story">
              OUR STORY
            </a>

            <a href="/#contact">
              CONTACT
            </a>

          </nav>

          <div className="header-actions">

            <button aria-label="Search">
              <Search size={18} />
            </button>

            <button aria-label="Wishlist">
              <Heart size={18} />
            </button>

            <button aria-label="Bag">
              <ShoppingBag size={18} />
            </button>

          </div>

        </div>

      </header>


      {/* ================= PRODUCT ================= */}

      <main className="product-page container">

        <Link to="/" className="back-link">
          <ArrowLeft size={15} />
          Back to home
        </Link>


        <div className="product-layout">

          {/* ================= GALLERY ================= */}

          <div className="product-gallery">

            {/* MAIN IMAGE */}

            <div className="main-product-image">

              <img
                src={selectedImage}
                alt="Heritage Silver Bangle"
              />

            </div>


            {/* THUMBNAILS */}

            <div className="thumb-row">

              {productImages.map((image) => (

                <button
                  key={image.src}
                  type="button"
                  className={`product-thumbnail ${
                    selectedImage === image.src
                      ? "active-thumbnail"
                      : ""
                  }`}
                  onClick={() => setSelectedImage(image.src)}
                  aria-label={`View ${image.alt}`}
                >

                  <img
                    src={image.src}
                    alt={image.alt}
                  />

                </button>

              ))}

            </div>

          </div>


          {/* ================= PRODUCT DETAILS ================= */}

          <div className="product-details">

            <p className="eyebrow">
              ASH HERITAGE COLLECTION
            </p>

            <h1>
              Heritage Silver Bangle
            </h1>

            <p className="price">
              ₹12,499
            </p>

            <div className="detail-rule" />


            <p className="description">
              Handcrafted from 925 sterling silver,
              inspired by traditional Indian heritage
              and intricate filigree art. A timeless
              masterpiece designed to become part of
              your story.
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


            <Button className="whatsapp-button">
              ENQUIRE ON WHATSAPP
            </Button>

            <p className="small-note">
              We will confirm availability, size and
              final details with you on WhatsApp.
            </p>

          </div>

        </div>

      </main>

    </div>
  );
}