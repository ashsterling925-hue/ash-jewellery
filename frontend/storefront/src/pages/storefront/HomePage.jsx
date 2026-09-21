import {
  ArrowRight,
  Heart,
  Search,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Gem,
  Flower2,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";
import storyBangle from "../../assets/jewellery/bangle-5.jpg";

const categories = [
  {
    name: "Earrings",
    image: "/jewellery/kundan-jhumka-earrings.svg",
    path: "/bangles",
  },
  {
    name: "Bangles",
    image: "/jewellery/silver-bangle-set.svg",
    path: "/bangles",
  },
  {
    name: "Necklaces",
    image: "/jewellery/ash-hero-lady.svg",
    path: "/bangles",
  },
  {
    name: "Anklets",
    image: "/jewellery/anklets.svg",
    path: "/bangles",
  },
  {
    name: "Rings",
    image: "/jewellery/rings.svg",
    path: "/bangles",
  },
  {
    name: "Collections",
    image: "/jewellery/heritage-silver-bangle.svg",
    path: "/bangles",
  },
];

function AppHeader() {
  return (
    <header className="site-header">
      <div className="header-main container">

        <Link to="/" className="brand">
          ASH
          <span>JEWELLERY</span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">

          <Link to="/" className="active">
            HOME
          </Link>

          <Link to="/bangles">
            BANGLES
          </Link>

          <a href="#collections">
            COLLECTIONS
          </a>

          <a href="#story">
            OUR STORY
          </a>

          <a href="#contact">
            CONTACT
          </a>

        </nav>

        <div className="header-actions">

          <button aria-label="Search">
            <Search size={20} />
          </button>

          <button aria-label="Wishlist">
            <Heart size={20} />
          </button>

          <button aria-label="Shopping bag">
            <ShoppingBag size={20} />
          </button>

        </div>

      </div>
    </header>
  );
}

function Home() {
  return (
    <div className="home-page">

      <AppHeader />

      <main>

        {/* ================= HERO ================= */}

        <section className="hero-banner">

          {/* Actual image */}
          <img
            className="hero-background-image"
            src="/jewellery/ash-hero-lady.svg"
            // alt="ASH Jewellery heritage collection"
          />

          <div className="hero-overlay"></div>

          <div className="hero-content container">

            <div className="hero-copy">

              <p className="hero-eyebrow">
                TRADITION IN EVERY DETAIL
              </p>

              <h1>
                THE ART OF
                <br />
                HERITAGE SILVER
              </h1>

              <p className="hero-description">
                Discover handcrafted jewellery inspired by Indian
                tradition, made for your modern story.
              </p>

              <Link
                to="/bangles"
                className="primary-cta"
              >
                EXPLORE COLLECTIONS
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

          <div className="hero-slide-number">
            {/* <span></span>
            <div></div>
            <span></span> */}
          </div>

        </section>


        {/* ================= TRUST STRIP ================= */}

        <section className="trust-strip">

          <div className="container trust-grid">

            <div className="trust-item">

              <Leaf
                size={36}
                strokeWidth={1.3}
              />

              <div>
                <h3>PURE 925 SILVER</h3>
                <p>Authentic & Hallmarked</p>
              </div>

            </div>


            <div className="trust-item">

              <Gem
                size={36}
                strokeWidth={1.3}
              />

              <div>
                <h3>HANDCRAFTED</h3>
                <p>By Skilled Artisans</p>
              </div>

            </div>


            <div className="trust-item">

              <Flower2
                size={36}
                strokeWidth={1.3}
              />

              <div>
                <h3>INSPIRED BY TRADITION</h3>
                <p>Designed for Today</p>
              </div>

            </div>


            <div className="trust-item">

              <Truck
                size={36}
                strokeWidth={1.3}
              />

              <div>
                <h3>PAN INDIA SHIPPING</h3>
                <p>Safe & Secure Delivery</p>
              </div>

            </div>

          </div>

        </section>


        {/* ================= CATEGORIES ================= */}

        <section
          className="signature-section"
          id="collections"
        >

          <div className="container">

            <div className="signature-heading">

              <p className="eyebrow">
                SHOP BY CATEGORY
              </p>

              <h2>
                Our Signature Collections
              </h2>

              <div className="heading-line"></div>

            </div>


            <div className="signature-grid">

              {categories.map((category) => (

                <Link
                  to={category.path}
                  className="signature-card"
                  key={category.name}
                >

                  <div className="signature-image">

                    <img
                      src={category.image}
                      alt={category.name}
                    />

                  </div>

                  <div className="signature-info">

                    <h3>
                      {category.name}
                    </h3>

                    <span>
                      EXPLORE
                      <ArrowRight size={14} />
                    </span>

                  </div>

                </Link>

              ))}

            </div>

          </div>

        </section>


        {/* ================= STORY ================= */}

        <section
          className="story-section"
          id="story"
        >

          <div className="story-inner container">

            <div className="story-image">

              <img
                src={storyBangle}
                alt="Handcrafted ASH Jewellery"
              />

            </div>


            <div className="story-copy">

              <p className="eyebrow">
                THE ASH PHILOSOPHY
              </p>

              <h2>
                Jewellery with a story to tell.
              </h2>

              <p>
                At ASH, every piece celebrates the beauty of
                Indian craftsmanship. From antique textures to
                detailed motifs, our silver jewellery is designed
                to feel treasured today and for generations to come.
              </p>

              <Link
                to="/bangles"
                className="story-button"
              >
                DISCOVER OUR COLLECTION
                <ArrowRight size={16} />
              </Link>

            </div>

          </div>

        </section>

      </main>


      {/* ================= FOOTER ================= */}

      <footer
        id="contact"
        className="site-footer"
      >

        <div className="container footer-grid">

          <div>

            <div className="brand footer-brand">
              ASH
              <span>JEWELLERY</span>
            </div>

            <p>
              Heritage-inspired silver jewellery,
              handcrafted with care.
            </p>

          </div>


          <div>

            <h4>EXPLORE</h4>

            <Link to="/bangles">
              Bangles
            </Link>

            <a href="#collections">
              Collections
            </a>

            <a href="#story">
              Our Story
            </a>

          </div>


          <div>

            <h4>HELP & SUPPORT</h4>

            <a href="#contact">
              Contact Us
            </a>

            <a href="#contact">
              Shipping & Returns
            </a>

            <a href="#contact">
              Care Guide
            </a>

          </div>


          <div>

            <h4>STAY CONNECTED</h4>

            <p>
              New collections, stories and offers.
            </p>

            <div className="newsletter">

              <input
                placeholder="Email address"
                aria-label="Email address"
              />

              <button aria-label="Subscribe">
                <ArrowRight size={16} />
              </button>

            </div>

          </div>

        </div>


        <div className="container copyright">
          © 2026 ASH JEWELLERY. ALL RIGHTS RESERVED.
        </div>

      </footer>

    </div>
  );
}

export default Home;