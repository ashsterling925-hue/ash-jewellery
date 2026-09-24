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
  ArrowRight,
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
  const [activeCategoryDropdown, setActiveCategoryDropdown] = useState(null);
  const [expandedMobileCat, setExpandedMobileCat] = useState(null);

  const userMenuRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
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

  const handleCategoryMouseEnter = (slug) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setActiveCategoryDropdown(slug);
  };

  const handleCategoryMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveCategoryDropdown(null);
    }, 220);
  };

  const closeDropdown = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setActiveCategoryDropdown(null);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setExpandedMobileCat(null);
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
    <header className="site-header relative">
      <div className="header-main container">
        {/* Brand / Logo */}
        <Link to="/" className="brand" aria-label="ASH Jewellery home" onClick={closeDropdown}>
          <img
            src="/jewellery/ash-logo.svg"
            alt="ASH Silver Jewellery"
            className="brand-logo"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" aria-label="Main navigation">
          {/* 1. HOME */}
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? "active" : undefined)}
            onClick={closeDropdown}
          >
            HOME
          </NavLink>

          {/* 2. ALL JEWELLERY */}
          <NavLink
            to="/category"
            end
            className={({ isActive }) => (isActive ? "active" : undefined)}
            onClick={closeDropdown}
          >
            ALL JEWELLERY
          </NavLink>

          {/* 3. DYNAMIC CATEGORY TABS WITH HOVER DIALOG */}
          {categories.map((cat) => {
            const isDropdownOpen = activeCategoryDropdown === cat.slug;
            const subcategories = cat.subcategories || [];
            const hasSubcategories = subcategories.length > 0;

            return (
              <div
                key={cat.id || cat.slug}
                className="category-nav-wrapper relative h-full flex items-center"
                onMouseEnter={() => handleCategoryMouseEnter(cat.slug)}
                onMouseLeave={handleCategoryMouseLeave}
              >
                <NavLink
                  to={`/category/${cat.slug}`}
                  className={({ isActive }) =>
                    `category-nav-link inline-flex items-center gap-1.5 transition-colors uppercase ${
                      isActive ? "active" : ""
                    } ${isDropdownOpen ? "text-[#b99657] font-semibold" : ""}`
                  }
                  onClick={closeDropdown}
                >
                  <span>{cat.name}</span>
                  {hasSubcategories && (
                    <ChevronDown
                      size={12}
                      className={`transition-transform duration-200 ${
                        isDropdownOpen ? "rotate-180 text-[#b99657]" : "text-[#8a7f72]"
                      }`}
                    />
                  )}
                </NavLink>

                {/* Dropdown Dialog on Hover */}
                {isDropdownOpen && (
                  <div
                    className="category-dropdown-dialog absolute top-full left-1/2 -translate-x-1/2 z-50 pt-1.5 animate-in fade-in-50 slide-in-from-top-1 duration-150"
                    onMouseEnter={() => handleCategoryMouseEnter(cat.slug)}
                    onMouseLeave={handleCategoryMouseLeave}
                  >
                    {/* Tiny Triangle Caret */}
                    <div className="dropdown-caret mx-auto w-2.5 h-2.5 bg-[#fffdfa] border-l border-t border-[#e8ded2] rotate-45 -mb-1 relative z-10" />

                    {/* Dropdown Card */}
                    <div className="bg-[#fffdfa] border border-[#e8ded2] rounded-xl shadow-2xl p-4 min-w-[280px] max-w-[340px] text-left">
                      {/* Header */}
                      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#f1eadf]">
                        <div>
                          <span className="text-[9px] font-bold tracking-[0.2em] text-[#b99657] uppercase block font-sans">
                            Category
                          </span>
                          <h4 className="font-serif text-sm font-medium text-[#1e1c19] tracking-wide">
                            {cat.name}
                          </h4>
                        </div>
                        <Link
                          to={`/category/${cat.slug}`}
                          onClick={closeDropdown}
                          className="text-[11px] font-medium text-[#8B263E] hover:underline inline-flex items-center gap-1 transition-colors"
                        >
                          View All
                          <ArrowRight size={11} />
                        </Link>
                      </div>

                      {/* Subcategories List */}
                      {hasSubcategories ? (
                        <div className="space-y-1">
                          <p className="text-[10px] font-semibold tracking-wider text-[#8a7f72] uppercase mb-1.5 px-2 font-serif">
                            Subcategories
                          </p>
                          <div className="max-h-64 overflow-y-auto pr-1">
                            {subcategories.map((sub) => (
                              <Link
                                key={sub.id || sub.slug}
                                to={`/category/${cat.slug}?subcategory=${sub.slug}`}
                                onClick={closeDropdown}
                                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#3b362e] hover:bg-[#fbf7f0] hover:text-[#8B263E] transition-all group"
                              >
                                <span className="tracking-wide group-hover:translate-x-0.5 transition-transform">
                                  {sub.name}
                                </span>
                                <ArrowRight
                                  size={12}
                                  className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#8B263E]"
                                />
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="py-3 px-1 text-center">
                          <p className="text-xs text-[#716b62] mb-3">
                            Discover handcrafted {cat.name.toLowerCase()} in pure 925 sterling silver.
                          </p>
                          <Link
                            to={`/category/${cat.slug}`}
                            onClick={closeDropdown}
                            className="inline-block w-full py-1.5 px-3 text-center text-xs font-semibold text-[#8B263E] bg-[#fbf7f0] hover:bg-[#f6eee2] rounded-md transition-colors"
                          >
                            Explore {cat.name}
                          </Link>
                        </div>
                      )}

                      {/* Footer Hallmark Badge */}
                      <div className="mt-3 pt-2.5 border-t border-[#f4eee4] flex items-center justify-between text-[10px] text-[#8a7f72]">
                        <span className="inline-flex items-center gap-1">
                          <ShieldCheck size={11} className="text-[#b99657]" />
                          Pure 925 Sterling Silver
                        </span>
                        <span className="text-[#a49a8d] tracking-wider uppercase text-[9px]">
                          Hallmarked
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* 4. COLLECTIONS (Stand-alone tab name, functionality to be added later) */}
          <NavLink
            to="/collections"
            className={({ isActive }) => (isActive ? "active" : undefined)}
            onClick={closeDropdown}
          >
            COLLECTIONS
          </NavLink>
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

          {/* Account / Login Action: Shows Profile Icon when logged in, LOGIN / SIGN UP button when logged out */}
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold tracking-wider text-[#1e1c19] hover:text-[#b99657] border border-[#dcd4c7] hover:border-[#b99657] rounded-full transition-all uppercase whitespace-nowrap bg-white/70 hover:bg-white shadow-2xs"
              aria-label="Login or Sign Up"
              title="Login / Sign Up"
            >
              <User size={13} className="text-[#b99657]" />
              <span>LOGIN / SIGN UP</span>
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

          {/* Mobile Links */}
          <NavLink
            to="/"
            end
            onClick={closeMobileMenu}
            className={({ isActive }) => (isActive ? "active" : undefined)}
          >
            HOME
          </NavLink>

          <NavLink
            to="/category"
            end
            onClick={closeMobileMenu}
            className={({ isActive }) => (isActive ? "active" : undefined)}
          >
            ALL JEWELLERY
          </NavLink>

          {/* Dynamic Categories in Mobile Drawer */}
          {categories.map((cat) => {
            const subcategories = cat.subcategories || [];
            const isExpanded = expandedMobileCat === cat.slug;

            return (
              <div key={cat.id || cat.slug} className="border-b border-[#f1eadf] py-1">
                <div className="flex items-center justify-between py-1.5">
                  <Link
                    to={`/category/${cat.slug}`}
                    onClick={closeMobileMenu}
                    className="font-medium text-xs tracking-wider text-[#1e1c19] uppercase"
                  >
                    {cat.name}
                  </Link>
                  {subcategories.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedMobileCat(isExpanded ? null : cat.slug)
                      }
                      className="p-1 text-[#8a7f72] cursor-pointer"
                      aria-label={`Toggle ${cat.name} subcategories`}
                    >
                      <ChevronDown
                        size={15}
                        className={`transition-transform duration-200 ${
                          isExpanded ? "rotate-180 text-[#b99657]" : ""
                        }`}
                      />
                    </button>
                  )}
                </div>

                {/* Subcategories Accordion */}
                {isExpanded && subcategories.length > 0 && (
                  <div className="pl-3 py-1.5 space-y-2 bg-[#fdfbf7] border-l-2 border-[#b99657]/40 my-1">
                    <Link
                      to={`/category/${cat.slug}`}
                      onClick={closeMobileMenu}
                      className="block text-xs font-semibold text-[#8B263E] hover:underline"
                    >
                      View All {cat.name} &rarr;
                    </Link>
                    {subcategories.map((sub) => (
                      <Link
                        key={sub.id || sub.slug}
                        to={`/category/${cat.slug}?subcategory=${sub.slug}`}
                        onClick={closeMobileMenu}
                        className="block text-[11px] text-[#716b62] hover:text-[#8B263E] py-0.5"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* COLLECTIONS (plain tab name for now) */}
          <NavLink
            to="/collections"
            onClick={closeMobileMenu}
            className={({ isActive }) => (isActive ? "active" : undefined)}
          >
            COLLECTIONS
          </NavLink>

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
                <User size={15} className="text-[#b99657]" />
                LOGIN / SIGN UP
              </NavLink>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default SiteHeader;
