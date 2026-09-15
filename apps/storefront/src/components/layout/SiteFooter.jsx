import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function SiteFooter() {
  return (
    <footer id="contact" className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link to="/" className="brand footer-brand">
            ASH
            <span>JEWELLERY</span>
          </Link>

          <p>
            Heritage-inspired silver jewellery, handcrafted with care.
          </p>
        </div>

        <div>
          <h4>EXPLORE</h4>

          <Link to="/bangles">
            Bangles
          </Link>

          <a href="/#collections">
            Collections
          </a>

          <a href="/#story">
            Our Story
          </a>
        </div>

        <div>
          <h4>HELP & SUPPORT</h4>

          <a href="/#contact">
            Contact Us
          </a>

          <a href="/#contact">
            Shipping & Returns
          </a>

          <a href="/#contact">
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
              type="email"
              placeholder="Email address"
              aria-label="Email address"
            />

            <button
              type="button"
              aria-label="Subscribe"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="container copyright">
        © 2026 ASH JEWELLERY. ALL RIGHTS RESERVED.
      </div>
    </footer>
  );
}

export default SiteFooter;