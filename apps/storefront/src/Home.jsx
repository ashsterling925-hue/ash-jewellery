import { ArrowRight, Heart, Search, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "./router";

const categories = [
  { name: "Bangles", image: "/jewellery/heritage-silver-bangle.jpg", path: "/bangles" },
  { name: "Bangle Sets", image: "/jewellery/silver-bangle-set.jpg", path: "/bangles" },
  { name: "Rings", image: "/jewellery/rings.jpg", path: "/bangles" },
  { name: "Anklets", image: "/jewellery/anklets.jpg", path: "/bangles" },
];

const products = [
  { name: "Heritage Silver Bangle", image: "/jewellery/heritage-silver-bangle.jpg", price: "₹12,499" },
  { name: "Classic Silver Bangle Set", image: "/jewellery/silver-bangle-set.jpg", price: "₹8,999" },
  { name: "Kundan Jhumka Earrings", image: "/jewellery/kundan-jhumka-earrings.jpg", price: "Price on Request" },
  { name: "Heritage Statement Ring", image: "/jewellery/rings.jpg", price: "₹4,999" },
];

function AppHeader() {
  return (
    <header className="site-header">
      <div className="top-strip">Handcrafted silver jewellery • Made with tradition</div>
      <div className="header-main container">
        <Link to="/" className="brand">ASH <span>JEWELLERY</span></Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link to="/">HOME</Link>
          <Link to="/bangles">BANGLES</Link>
          <a href="#collections">COLLECTIONS</a>
          <a href="#story">OUR STORY</a>
          <a href="#contact">CONTACT</a>
        </nav>
        <div className="header-actions">
          <button aria-label="Search"><Search size={18} /></button>
          <button aria-label="Wishlist"><Heart size={18} /></button>
          <button aria-label="Bag"><ShoppingBag size={18} /></button>
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
        <section className="hero-section container">
          <div className="hero-copy">
            <p className="eyebrow"><Sparkles size={14} /> THE ASH HERITAGE EDIT</p>
            <h1>The art of<br /><em>heritage silver.</em></h1>
            <p className="hero-description">Discover handcrafted jewellery inspired by Indian tradition, intricate artistry and timeless everyday elegance.</p>
            <Link to="/bangles" className="primary-cta">EXPLORE BANGLES <ArrowRight size={15} /></Link>
          </div>
          <div className="hero-image-wrap">
            <div className="hero-image-frame">
              <img src="/jewellery/heritage-silver-bangle.jpg" alt="Heritage silver bangle" />
            </div>
            <div className="hero-note">925<br /><span>STERLING SILVER</span></div>
          </div>
        </section>

        <section className="category-section container" id="collections">
          <div className="section-heading">
            <div><p className="eyebrow">SHOP THE COLLECTION</p><h2>Featured Collections</h2></div>
            <Link to="/bangles" className="text-link">VIEW ALL <ArrowRight size={14} /></Link>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <Link to={category.path} className="category-card" key={category.name}>
                <div className="category-image"><img src={category.image} alt={category.name} /></div>
                <div className="category-info"><h3>{category.name}</h3><span>VIEW COLLECTION <ArrowRight size={12} /></span></div>
              </Link>
            ))}
          </div>
        </section>

        <section className="products-section container">
          <div className="section-heading">
            <div><p className="eyebrow">CURATED FOR YOU</p><h2>Bestsellers</h2></div>
            <Link to="/bangles" className="text-link">SHOP BANGLES <ArrowRight size={14} /></Link>
          </div>
          <div className="product-grid">
            {products.map((product) => (
              <Link to="/bangles" className="product-card" key={product.name}>
                <div className="product-image"><img src={product.image} alt={product.name} /><span className="enquire-pill">ENQUIRE</span></div>
                <div className="product-meta"><h3>{product.name}</h3><p>{product.price}</p></div>
              </Link>
            ))}
          </div>
        </section>

        <section className="story-section" id="story">
          <div className="story-inner container">
            <div className="story-image"><img src="/jewellery/bangle-5.jpg" alt="Handcrafted silver bangle detail" /></div>
            <div className="story-copy">
              <p className="eyebrow">THE ASH PHILOSOPHY</p>
              <h2>Jewellery with a story to tell.</h2>
              <p>At ASH, every piece celebrates the beauty of Indian craftsmanship. From antique textures to detailed motifs, our silver jewellery is designed to feel treasured today and for generations to come.</p>
              <Button className="story-button">DISCOVER OUR STORY</Button>
            </div>
          </div>
        </section>
      </main>
      <footer id="contact" className="site-footer">
        <div className="container footer-grid">
          <div><div className="brand footer-brand">ASH <span>JEWELLERY</span></div><p>Heritage-inspired silver jewellery, handcrafted with care.</p></div>
          <div><h4>EXPLORE</h4><Link to="/bangles">Bangles</Link><a href="#collections">Collections</a><a href="#story">Our Story</a></div>
          <div><h4>HELP & SUPPORT</h4><a href="#contact">Contact Us</a><a href="#contact">Shipping & Returns</a><a href="#contact">Care Guide</a></div>
          <div><h4>STAY CONNECTED</h4><p>New collections, stories and offers.</p><div className="newsletter"><input placeholder="Email address" aria-label="Email address" /><button aria-label="Subscribe"><ArrowRight size={16} /></button></div></div>
        </div>
        <div className="container copyright">© 2026 ASH JEWELLERY. ALL RIGHTS RESERVED.</div>
      </footer>
    </div>
  );
}

export default Home;
