import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { storefrontApi } from "@/lib/api/storefrontApi";

function SiteFooter() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadFooterCategories() {
      try {
        const response = await storefrontApi.getCategories({
          limit: 4,
          sortBy: "sortOrder",
          sortOrder: "asc",
        });

        if (isMounted && response?.data) {
          setCategories(response.data);
        }
      } catch (err) {
        console.error("Failed to load footer categories:", err);
      }
    }

    loadFooterCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <footer id="contact" className="site-footer">
      <div className="container footer-grid">
        {/* Brand */}
        <div className="footer-column footer-about">
          <Link to="/" className="brand footer-brand">
            ASH
            <span>JEWELLERY</span>
          </Link>

          <p>Heritage-inspired silver jewellery, handcrafted with care.</p>
        </div>

        {/* Explore */}
        <div className="footer-column">
          <h4>EXPLORE</h4>

          {categories.map((cat) => (
            <Link key={cat.id || cat.slug} to={`/category/${cat.slug}`}>
              {cat.name}
            </Link>
          ))}

          <Link to="/about">About Us</Link>
        </div>

        {/* Help & Legal */}
        <div className="footer-column">
          <h4>HELP &amp; LEGAL</h4>

          <a href="mailto:ashsterling925@gmail.com">Contact Us</a>

          <Link to="/terms-and-conditions">Terms &amp; Conditions</Link>
        </div>

        {/* Contact */}
        <div className="footer-column footer-contact">
          <h4>GET IN TOUCH</h4>

          <p>Have a question about our jewellery or your enquiry?</p>

          <p>
            <strong>Email</strong>
            <br />
            <a href="mailto:ashsterling925@gmail.com">
              ashsterling925@gmail.com
            </a>
          </p>

          <p>
            <strong>Phone</strong>
            <br />
            <a href="tel:+918218851894">+91 8218851894</a>
          </p>
        </div>
      </div>

      <div className="container copyright">
        © 2026 ASH JEWELLERY. ALL RIGHTS RESERVED.
      </div>
    </footer>
  );
}

export default SiteFooter;
