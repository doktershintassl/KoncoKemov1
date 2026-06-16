import { motion, AnimatePresence } from "motion/react";
import { siteConfig } from "../../config/site";
import { X } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useEffect } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div key="mobile-sidebar" className="fixed inset-0 z-50 md:hidden" id="mobile-sidebar-container">
          {/* Backdrop Overlay with fade animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-md cursor-pointer"
            id="mobile-sidebar-backdrop"
          />

          {/* Sidebar Drawer Panel with slide-in animation */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 w-4/5 max-w-xs bg-white shadow-2xl flex flex-col p-6 overflow-y-auto"
            id="mobile-sidebar-panel"
          >
            {/* Header section with brand logo and close button */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <img
                  src="https://lh3.googleusercontent.com/d/13A59jDQDvXFFvrpe9uvTdlusw3OKGM44"
                  alt="KoncoKemo Logo"
                  className="w-8 h-8 object-contain"
                />
                <span className="font-display font-bold text-xl tracking-tight text-primary-900">
                  {siteConfig.name}
                </span>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-primary-600 focus:outline-none transition-colors cursor-pointer rounded-lg hover:bg-gray-50 active:bg-gray-100 inline-flex items-center justify-center"
                id="mobile-sidebar-close"
                aria-label="Tutup Menu"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Navigation links matching the purple brand palette */}
            <nav className="flex flex-col gap-3">
              {siteConfig.navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.href}
                  onClick={(e) => {
                    if (link.href === "/") {
                      if (location.pathname === "/") {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }
                    onClose();
                  }}
                  className={({ isActive }) =>
                    `text-base font-bold font-sans transition-colors p-3 rounded-xl hover:bg-primary-50 hover:text-primary-600 block ${
                      isActive
                        ? "text-primary-700 bg-primary-100"
                        : "text-gray-700 hover:bg-gray-50"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </nav>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
