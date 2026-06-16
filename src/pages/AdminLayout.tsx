import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, Eye } from "lucide-react";
import React, { useEffect, useState } from "react";

export function AdminLayout() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch("/api/verify-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token })
        });
        const data = await res.json();
        
        if (data.valid) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("adminToken");
          navigate("/login");
        }
      } catch (err) {
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  if (isAuthenticated === null) return null; // loading state

  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    `transition-all px-6 py-2.5 rounded-full font-bold text-sm tracking-wide ${
      isActive 
        ? "bg-primary-600 text-white shadow-lg shadow-primary-200" 
        : "text-gray-500 hover:text-primary-600 hover:bg-primary-50"
    }`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-primary-200 selection:text-primary-900">
      <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-12 shrink-0 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 font-bold text-sm flex items-center gap-2 transition-colors">
            <LogOut className="w-5 h-5" />
            Keluar
          </button>
          <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>
          <Link to="/" className="text-gray-500 hover:text-primary-600 font-bold text-sm flex items-center gap-2 transition-colors">
            <Eye className="w-5 h-5" />
            Lihat Tampilan
          </Link>
        </div>

        <nav className="flex items-center gap-2 flex-wrap">
          <NavLink to="/admin/hero-slides" className={navLinkClass}>
            Hero Slide
          </NavLink>
          <NavLink to="/admin/cerita-konco" className={navLinkClass}>
            Cerita Konco
          </NavLink>
          <NavLink to="/admin/edukasi" className={navLinkClass}>
            Edukasi
          </NavLink>
          <NavLink to="/admin/dokter" className={navLinkClass}>
            Dokter
          </NavLink>
          <NavLink to="/admin/founder-gallery" className={navLinkClass}>
            Galeri Founder
          </NavLink>
        </nav>
      </header>

      <main className="flex-1 p-6 lg:p-12 overflow-auto relative">
        {/* Soft background shape */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-50 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3 opacity-70" />
        <Outlet />
      </main>
    </div>
  );
}
