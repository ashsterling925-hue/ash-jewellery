import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Gem,
  Flower2,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";
import SiteLayout from "./components/layout/SiteLayout";

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

function Home() {
  return (
    <SiteLayout>
      <div className="home-page">
        {/* ================= HERO ================= */}

        {/* ================= HERO ================= */}

        {/* ================= HERO ================= */}

        <section className="hero-banner">
          <div className="hero-image-wrap">
            <img
              className="hero-background-image"
              src="/jewellery/ash-hero-wide.svg"
              alt="ASH Jewellery heritage silver collection"
            />
          </div>

          <Link to="/bangles" className="hero-collection-button">
            EXPLORE COLLECTIONS
            <ArrowRight size={17} />
          </Link>
        </section>

        {/* ================= CATEGORIES ================= */}

        <section className="signature-section" id="collections">
          <div className="container">
            <div className="signature-heading">
              <p className="eyebrow">SHOP BY CATEGORY</p>

              <h2>Our Signature Collections</h2>

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
                    <img src={category.image} alt={category.name} />
                  </div>

                  <div className="signature-info">
                    <h3>{category.name}</h3>

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

        <section className="story-section" id="story">
          <div className="story-inner container">
            <div className="story-image">
              <img
                src="/jewellery/story-bangles.svg"
                alt="Handcrafted ASH Jewellery"
              />
            </div>

            <div className="story-copy">
              <p className="eyebrow">THE ASH PHILOSOPHY</p>

              <h2>Jewellery with a story to tell.</h2>

              <p>
                At ASH, every piece celebrates the beauty of Indian
                craftsmanship. From antique textures to detailed motifs, our
                silver jewellery is designed to feel treasured today and for
                generations to come.
              </p>

              <Link to="/bangles" className="story-button">
                DISCOVER OUR COLLECTION
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}

export default Home;
