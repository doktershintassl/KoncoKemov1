import { motion } from "motion/react";
import { siteConfig } from "../../config/site";
import { Menu } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { Sidebar } from "./Sidebar";

export function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const handleHomeClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100"
      >
        <div className="container mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <Link to="/" onClick={handleHomeClick} className="flex items-center gap-3">
            <img src="https://lh3.googleusercontent.com/d/13A59jDQDvXFFvrpe9uvTdlusw3OKGM44" alt="KoncoKemo Logo" className="w-10 h-10 object-contain" />
            <span className="font-display font-bold text-2xl tracking-tight text-primary-900">
              {siteConfig.name}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {siteConfig.navLinks.map((link) => (
              <NavLink 
                key={link.name} 
                to={link.href}
                onClick={(e) => {
                  if (link.href === "/") {
                    handleHomeClick();
                  }
                }}
                className={({ isActive }) => 
                  `text-sm font-bold transition-colors ${
                    isActive ? "text-primary-600" : "text-gray-600 hover:text-primary-600"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSidebarOpen(true)} 
            className="md:hidden p-2 text-gray-600 hover:text-primary-600 focus:outline-none transition-colors cursor-pointer rounded-lg hover:bg-gray-50 active:bg-gray-100 inline-flex items-center justify-center animate-none"
            id="mobile-menu-trigger"
            aria-label="Buka Menu"
          >
            <Menu className="w-6 h-6" />
          </motion.button>
        </div>
      </motion.header>

      {/* Mobile Drawer using dedicated Sidebar component portaled to document.body */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}

