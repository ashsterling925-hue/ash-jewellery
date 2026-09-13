import { ArrowLeft, Heart, Search, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "./router";

export default function BanglePage() {
  return (
    <div className="bangle-page">
      <header className="site-header">
        <div className="top-strip">Handcrafted silver jewellery • Made with tradition</div>
        <div className="header-main container">
          <Link to="/" className="brand">ASH <span>JEWELLERY</span></Link>
          <nav className="desktop-nav"><Link to="/">HOME</Link><Link to="/bangles" className="active">BANGLES</Link><a href="/#collections">COLLECTIONS</a><a href="/#story">OUR STORY</a><a href="/#contact">CONTACT</a></nav>
          <div className="header-actions"><button aria-label="Search"><Search size={18} /></button><button aria-label="Wishlist"><Heart size={18} /></button><button aria-label="Bag"><ShoppingBag size={18} /></button></div>
        </div>
      </header>
      <main className="product-page container">
        <Link to="/" className="back-link"><ArrowLeft size={15} /> Back to home</Link>
        <div className="product-layout">
          <div className="product-gallery">
            <div className="main-product-image"><img src="/jewellery/heritage-silver-bangle.jpg" alt="Heritage Silver Bangle" /></div>
            <div className="thumb-row"><img src="/jewellery/bangle-1.jpg" alt="Bangle detail 1" /><img src="/jewellery/bangle-5.jpg" alt="Bangle detail 2" /><img src="/jewellery/bangle-3.jpg" alt="Bangle detail 3" /></div>
          </div>
          <div className="product-details">
            <p className="eyebrow">ASH HERITAGE COLLECTION</p>
            <h1>Heritage Silver Bangle</h1>
            <p className="price">₹12,499</p>
            <div className="detail-rule" />
            <p className="description">Handcrafted from 925 sterling silver, inspired by traditional Indian heritage and intricate filigree art. A timeless masterpiece designed to become part of your story.</p>
            <ul className="spec-list"><li><span>Metal</span>925 Sterling Silver</li><li><span>Weight</span>45g</li><li><span>Finish</span>Antique Silver</li><li><span>Authenticity</span>Certificate Included</li></ul>
            <Button className="whatsapp-button">ENQUIRE ON WHATSAPP</Button>
            <p className="small-note">We will confirm availability, size and final details with you on WhatsApp.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
