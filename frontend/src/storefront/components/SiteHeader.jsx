import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  X,
  User,
  LogOut,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { storefrontApi } from "@/lib/api/storefrontApi";
import { useAuth } from "@/context/AuthContext";

function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);
  const [isMobileCollectionsOpen, setIsMobileCollectionsOpen] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    let isMounted = true;
    async function loadActiveCategories() {
      try {
        const response = await storefrontApi.getCategories({
          limit: 100,
          sortBy: "sortOrder",
          sortOrder: "asc",
        });
        if (isMounted && response?.data) {
          setCategories(response.data);
        }
      } catch (err) {
        console.error("Failed to load header categories:", err);
      }
    }
    loadActiveCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    await logout();
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
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

        {/* Desktop Navigation */}
        <nav className="desktop-nav" aria-label="Main navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? "active" : undefined)}
          >
            HOME
          </NavLink>

          {/* COLLECTIONS HOVER DROPDOWN */}
          <div
            className="relative"
            onMouseEnter={() => setIsCollectionsOpen(true)}
            onMouseLeave={() => setIsCollectionsOpen(false)}
          >
            <Link
              to="/#collections"
              className={`inline-flex items-center gap-1.5 transition-colors uppercase ${
                isCollectionsOpen ? "text-[#b99657] font-semibold" : ""
              }`}
            >
              COLLECTIONS
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${
                  isCollectionsOpen ? "rotate-180 text-[#b99657]" : "text-[#8a7f72]"
                }`}
              />
            </Link>

            {/* Hover Menu */}
            {isCollectionsOpen && (
              <div className="absolute left-0 top-full pt-3 z-50 min-w-[320px] max-w-[650px] w-max">
                <div className="bg-[#fffdfa] border border-[#e7ded3] shadow-2xl p-6 text-left">
                  <div className="flex items-center justify-between border-b border-[#eee5d8] pb-3 mb-4">
                    <span className="text-[10px] font-bold tracking-[0.25em] text-[#b99657] uppercase font-serif">
                      OUR SIGNATURE COLLECTIONS
                    </span>
                    <a
                      href="/#collections"
                      onClick={() => setIsCollectionsOpen(false)}
                      className="text-[10px] font-semibold text-[#665e52] hover:text-[#1e1c19] tracking-wider uppercase transition-colors"
                    >
                      View All &rarr;
                    </a>
                  </div>

                  {categories.length > 0 ? (
                    <div
                      className={`grid gap-x-8 gap-y-6 ${
                        categories.length === 1
                          ? "grid-cols-1"
                          : categories.length === 2
                          ? "grid-cols-2"
                          : "grid-cols-3"
                      }`}
                    >
                      {categories.map((category) => {
                        const subcats = category.subcategories || [];
                        return (
                          <div key={category.id || category.slug} className="space-y-2">
                            {/* Category Header Link */}
                            <Link
                              to={`/category/${category.slug}`}
                              onClick={() => setIsCollectionsOpen(false)}
                              className="block font-serif text-sm font-medium tracking-wide text-[#1e1c19] hover:text-[#b99657] transition-colors border-b border-[#f1eadf] pb-1.5"
                            >
                              {category.name}
                            </Link>

                            {/* Subcategories underneath category */}
                            {subcats.length > 0 ? (
                              <ul className="space-y-1 pl-1">
                                {subcats.map((subcat) => (
                                  <li key={subcat.id || subcat.slug}>
                                    <Link
                                      to={`/category/${category.slug}?subcategory=${subcat.slug}`}
                                      onClick={() => setIsCollectionsOpen(false)}
                                      className="text-xs text-[#6e675b] hover:text-[#b99657] transition-colors block py-0.5"
                                    >
                                      {subcat.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <Link
                                to={`/category/${category.slug}`}
                                onClick={() => setIsCollectionsOpen(false)}
                                className="text-[11px] text-[#9b9285] hover:text-[#b99657] italic block transition-colors"
                              >
                                Explore {category.name}
                              </Link>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-xs text-[#8a8277]">
                      <p>No active categories yet.</p>
                      <a
                        href="/#collections"
                        onClick={() => setIsCollectionsOpen(false)}
                        className="mt-2 inline-block text-xs font-semibold text-[#b99657] underline"
                      >
                        Explore Collections
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <a href="/#story">OUR STORY</a>
          <a href="/#contact">CONTACT</a>

          {/* Authentication Navigation Link */}
          {isAuthenticated ? (
            (user?.role === "SUPER_ADMIN" ||
              user?.role === "ADMIN" ||
              user?.role === "STAFF") && (
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `transition-colors ${
                    isActive
                      ? "active text-[#b99657]"
                      : "text-[#b99657] hover:text-[#97753e]"
                  }`
                }
              >
                ADMIN
              </NavLink>
            )
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) => (isActive ? "active" : undefined)}
            >
              LOGIN
            </NavLink>
          )}
        </nav>

        {/* Header Actions */}
        <div className="header-actions">
          {/* Search Trigger */}
          <button
            type="button"
            aria-label="Search"
            onClick={() => setIsSearchOpen((prev) => !prev)}
            className={isSearchOpen ? "text-[#b99657]" : ""}
          >
            <Search size={20} strokeWidth={1.6} />
          </button>

          {/* Account / Login Action */}
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                aria-label="Account menu"
                title={user?.name || "Account"}
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className={`cursor-pointer ${isUserMenuOpen ? "text-[#b99657]" : ""}`}
              >
                <User size={20} strokeWidth={1.6} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 border border-[#e7dfd3] bg-[#fffdf9] p-3 shadow-lg z-50">
                  <div className="pb-2 mb-2 border-b border-[#e7dfd3]">
                    <p className="text-xs font-semibold text-[#1e1c19] truncate">
                      {user?.name}
                    </p>
                    <p className="text-[11px] text-[#716b62] truncate">
                      {user?.email}
                    </p>
                    <span className="inline-block mt-1.5 text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 bg-[#f4efe6] text-[#b99657]">
                      {user?.role ? user.role.replace("_", " ") : "Member"}
                    </span>
                  </div>

                  {(user?.role === "SUPER_ADMIN" ||
                    user?.role === "ADMIN" ||
                    user?.role === "STAFF") && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-2 py-2 text-xs font-medium text-[#1e1c19] hover:bg-[#f4efe6] transition-colors"
                    >
                      <ShieldCheck size={14} className="text-[#b99657]" />
                      Admin Dashboard
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-2 py-2 text-xs font-medium text-[#a64b42] hover:bg-[#fcf2f1] transition-colors cursor-pointer mt-1"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="header-action-btn"
              aria-label="Sign In"
              title="Sign In / Login"
            >
              <User size={20} strokeWidth={1.6} />
            </Link>
          )}

          {/* Wishlist */}
          <button type="button" aria-label="Wishlist">
            <Heart size={20} strokeWidth={1.6} />
          </button>

          {/* Shopping Bag */}
          <button type="button" aria-label="Shopping bag">
            <ShoppingBag size={20} strokeWidth={1.6} />
          </button>

          {/* Mobile Menu Toggle */}
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

      {/* Expandable Search Bar */}
      {isSearchOpen && (
        <div className="border-t border-[#e7dfd3] bg-[#fffdf9] py-3.5 shadow-xs transition-all">
          <div className="container">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
              <Search size={18} className="text-[#8a8277]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jewellery, bangles, necklaces..."
                className="w-full border-none bg-transparent font-sans text-sm text-[#1e1c19] outline-none placeholder:text-[#8a8277]"
                autoFocus
              />
              <button
                type="submit"
                className="bg-[#211f1b] px-4 py-1.5 text-xs font-semibold tracking-wider text-white uppercase transition-colors hover:bg-black"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-1 text-[#8a8277] hover:text-[#1e1c19]"
                aria-label="Close search"
              >
                <X size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      <nav
        id="mobile-navigation"
        className={`mobile-nav ${isMobileMenuOpen ? "open" : ""}`}
        aria-label="Mobile navigation"
      >
        <div className="mobile-nav-inner">
          <form
            onSubmit={handleSearchSubmit}
            className="mb-4 flex items-center gap-2 border-b border-[#e7dfd3] pb-2"
          >
            <Search size={16} className="text-[#8a8277]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalogue..."
              className="w-full bg-transparent text-xs text-[#1e1c19] outline-none"
            />
          </form>

          <NavLink
            to="/"
            end
            onClick={closeMobileMenu}
            className={({ isActive }) => (isActive ? "active" : undefined)}
          >
            HOME
          </NavLink>

          {/* Mobile Collections Accordion */}
          <div>
            <div className="flex items-center justify-between py-2 border-b border-[#f1eadf]">
              <a
                href="/#collections"
                onClick={closeMobileMenu}
                className="font-medium text-xs tracking-wider text-[#1e1c19] uppercase"
              >
                COLLECTIONS
              </a>
              <button
                type="button"
                onClick={() => setIsMobileCollectionsOpen((prev) => !prev)}
                className="p-1 text-[#8a7f72]"
                aria-label="Toggle collections menu"
              >
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    isMobileCollectionsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {isMobileCollectionsOpen && (
              <div className="pl-3 py-2 space-y-3 bg-[#fdfbf7] border-l-2 border-[#b99657]/40 my-1">
                {categories.map((cat) => (
                  <div key={cat.id || cat.slug} className="space-y-1">
                    <Link
                      to={`/category/${cat.slug}`}
                      onClick={closeMobileMenu}
                      className="block text-xs font-serif font-medium text-[#1e1c19] hover:text-[#b99657]"
                    >
                      {cat.name}
                    </Link>
                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <div className="pl-2 space-y-1">
                        {cat.subcategories.map((sub) => (
                          <Link
                            key={sub.id || sub.slug}
                            to={`/category/${cat.slug}?subcategory=${sub.slug}`}
                            onClick={closeMobileMenu}
                            className="block text-[11px] text-[#716b62] hover:text-[#b99657]"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <a href="/#story" onClick={closeMobileMenu}>
            OUR STORY
          </a>

          <a href="/#contact" onClick={closeMobileMenu}>
            CONTACT
          </a>

          {/* Mobile Auth Section */}
          <div className="mt-4 pt-4 border-t border-[#e7dfd3] flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <div className="px-1 text-xs text-[#716b62]">
                  Signed in as{" "}
                  <strong className="text-[#1e1c19]">{user?.name}</strong>
                  <span className="ml-2 inline-block text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 bg-[#f4efe6] text-[#b99657]">
                    {user?.role ? user.role.replace("_", " ") : "Member"}
                  </span>
                </div>
                {(user?.role === "SUPER_ADMIN" ||
                  user?.role === "ADMIN" ||
                  user?.role === "STAFF") && (
                  <Link
                    to="/admin/dashboard"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2 text-xs font-semibold text-[#b99657] py-1.5"
                  >
                    <ShieldCheck size={15} />
                    ADMIN DASHBOARD
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-left text-xs font-semibold text-[#a64b42] py-1.5 cursor-pointer"
                >
                  <LogOut size={15} />
                  SIGN OUT
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex items-center gap-2 text-xs font-semibold tracking-wider uppercase py-1.5 ${
                    isActive ? "text-[#b99657]" : "text-[#1e1c19]"
                  }`
                }
              >
                <User size={15} />
                SIGN IN / LOGIN
              </NavLink>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default SiteHeader;
