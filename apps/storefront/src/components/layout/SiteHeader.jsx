import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useState } from "react";

function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    {
      label: "HOME",
      to: "/",
      end: true,
    },
    {
      label: "BANGLES",
      to: "/bangles",
    },
  ];

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="header-main container">
        <Link to="/" className="brand" aria-label="ASH Jewellery home">
          <img
            src="/jewellery/ash-logo.svg"
            alt="ASH Silver Jewellery"
            className="brand-logo"
          />
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? "active" : undefined)}
            >
              {item.label}
            </NavLink>
          ))}

          <a href="/#collections">COLLECTIONS</a>

          <a href="/#story">OUR STORY</a>

          <a href="/#contact">CONTACT</a>
        </nav>

        <div className="header-actions">
          <button type="button" aria-label="Search">
            <Search size={20} strokeWidth={1.6} />
          </button>

          <button type="button" aria-label="Wishlist">
            <Heart size={20} strokeWidth={1.6} />
          </button>

          <button type="button" aria-label="Shopping bag">
            <ShoppingBag size={20} strokeWidth={1.6} />
          </button>

          <button
            type="button"
            className="mobile-menu-toggle"
            aria-label={
              isMobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
          >
            {isMobileMenuOpen ? (
              <X size={21} strokeWidth={1.6} />
            ) : (
              <Menu size={21} strokeWidth={1.6} />
            )}
          </button>
        </div>
      </div>

      <nav
        id="mobile-navigation"
        className={`mobile-nav ${isMobileMenuOpen ? "open" : ""}`}
        aria-label="Mobile navigation"
      >
        <div className="mobile-nav-inner">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={closeMobileMenu}
              className={({ isActive }) => (isActive ? "active" : undefined)}
            >
              {item.label}
            </NavLink>
          ))}

          <a href="/#collections" onClick={closeMobileMenu}>
            COLLECTIONS
          </a>

          <a href="/#story" onClick={closeMobileMenu}>
            OUR STORY
          </a>

          <a href="/#contact" onClick={closeMobileMenu}>
            CONTACT
          </a>
        </div>
      </nav>
    </header>
  );
}

export default SiteHeader;
