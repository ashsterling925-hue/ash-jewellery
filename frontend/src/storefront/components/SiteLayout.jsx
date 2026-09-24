import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

function SiteLayout({ children }) {
  return (
    <div className="site-layout">
      <SiteHeader />

      <main>{children}</main>

      <SiteFooter />
    </div>
  );
}

export default SiteLayout;
