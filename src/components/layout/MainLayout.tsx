import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useEffect } from "react";

export function MainLayout() {
  const { pathname } = useLocation();

  // Auto-scroll ke atas setiap ganti rute
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans selection:bg-primary-200 selection:text-primary-900 relative">
      <Header />
      <main className="flex-1 pt-[5rem]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
