import { useState, Suspense } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function AdminContentLoader() {
  return (
    <div className="w-full min-h-[360px] flex flex-col items-center justify-center p-8">
      <div className="w-7 h-7 rounded-full border-2 border-[#10233f]/20 border-t-[#10233f] animate-spin mb-3" />
      <span className="font-serif text-[11px] tracking-[0.2em] text-[#716b62] uppercase">
        Loading module...
      </span>
    </div>
  );
}

export default function AdminLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="admin-main">
        <Header
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />

        <main className="admin-content">
          <Suspense fallback={<AdminContentLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}