import { Suspense, lazy, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { PublicLayout } from "./pages/PublicLayout";
import { CekMandiriPage } from "./pages/CekMandiri";
import TataLaksana from "./pages/TataLaksana";
import { Loader2 } from "lucide-react";
import { GreetingWidget } from "./components/GreetingWidget";
import { SplashScreen } from "./components/ui/SplashScreen";
import { AnimatePresence } from "motion/react";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  useEffect(() => {
    // Memastikan pada awal loading akan scroll ke paling atas
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return null;
}

// Lazy loading modul Admin dan halaman lain yang tidak langsung diakses di awal
import { AdminLogin } from "./pages/admin/Login";
import { NotFound } from "./pages/NotFound";

const AdminLayout = lazy(() => import("./pages/AdminLayout").then(m => ({ default: m.AdminLayout })));
const HeroSlidesManager = lazy(() => import("./pages/admin/HeroSlidesManager").then(m => ({ default: m.HeroSlidesManager })));
const HeroSlideEditor = lazy(() => import("./pages/admin/HeroSlideEditor").then(m => ({ default: m.HeroSlideEditor })));
const CeritaKoncoManager = lazy(() => import("./pages/admin/CeritaKoncoManager").then(m => ({ default: m.CeritaKoncoManager })));
const CeritaKoncoEditor = lazy(() => import("./pages/admin/CeritaKoncoEditor").then(m => ({ default: m.CeritaKoncoEditor })));
const CeritaKoncoList = lazy(() => import("./pages/CeritaKonco").then(m => ({ default: m.CeritaKoncoList })));
const CeritaKoncoDetail = lazy(() => import("./pages/CeritaKoncoDetail").then(m => ({ default: m.CeritaKoncoDetail })));
const EdukasiList = lazy(() => import("./pages/Edukasi").then(m => ({ default: m.EdukasiList })));
const EdukasiDetail = lazy(() => import("./pages/EdukasiDetail").then(m => ({ default: m.EdukasiDetail })));

const EdukasiManager = lazy(() => import("./pages/admin/EdukasiManager").then(m => ({ default: m.EdukasiManager })));
const EdukasiEditor = lazy(() => import("./pages/admin/EdukasiEditor").then(m => ({ default: m.EdukasiEditor })));
const DokterKemo = lazy(() => import("./pages/DokterKemo").then(m => ({ default: m.DokterKemo })));
const DokterManager = lazy(() => import("./pages/admin/DokterManager").then(m => ({ default: m.default })));
const DokterEditor = lazy(() => import("./pages/admin/DokterEditor").then(m => ({ default: m.default })));
const Founder = lazy(() => import("./pages/Founder").then(m => ({ default: m.default })));
const FounderGalleryManager = lazy(() => import("./pages/admin/FounderGalleryManager").then(m => ({ default: m.default })));
const FounderGalleryEditor = lazy(() => import("./pages/admin/FounderGalleryEditor").then(m => ({ default: m.default })));

// Loading UI untuk fallback lazy-loaded component
const SuspenseFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-4 text-primary-600">
      <Loader2 className="w-10 h-10 animate-spin" />
      <span className="text-gray-500 font-medium">Memuat antarmuka...</span>
    </div>
  </div>
);

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 6000); // Tampil selama 6 detik (di antara rentang 5-7 detik)
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <AnimatePresence>
        {showSplash && <SplashScreen />}
      </AnimatePresence>
      <GreetingWidget />
      <Suspense fallback={<SuspenseFallback />}>
        <Routes>
          {/* Jalur Publik dengan Layout Utama */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<PublicLayout />} />
            <Route path="/cek-mandiri" element={<CekMandiriPage />} />
            <Route path="/cerita-konco" element={<CeritaKoncoList />} />
            <Route path="/cerita-konco/:id" element={<CeritaKoncoDetail />} />
            <Route path="/edukasi" element={<EdukasiList />} />
            <Route path="/edukasi/:id" element={<EdukasiDetail />} />
            <Route path="/dokter-kemo" element={<DokterKemo />} />
            <Route path="/founder" element={<Founder />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Jalur Autentikasi Admin */}
          <Route path="/login" element={<AdminLogin />} />

          {/* TataLaksana Route */}
          <Route path="/tatalaksana" element={<TataLaksana />} />

          {/* Jalur Khusus Admin Panel (Lazy Loaded) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="hero-slides" replace />} />
            <Route path="hero-slides" element={<HeroSlidesManager />} />
            <Route path="hero-slides/new" element={<HeroSlideEditor />} />
            <Route path="hero-slides/:id" element={<HeroSlideEditor />} />
            <Route path="cerita-konco" element={<CeritaKoncoManager />} />
            <Route path="cerita-konco/new" element={<CeritaKoncoEditor />} />
            <Route path="cerita-konco/:id" element={<CeritaKoncoEditor />} />
            <Route path="edukasi" element={<EdukasiManager />} />
            <Route path="edukasi/new" element={<EdukasiEditor />} />
            <Route path="edukasi/:id" element={<EdukasiEditor />} />
            <Route path="dokter" element={<DokterManager />} />
            <Route path="dokter/new" element={<DokterEditor />} />
            <Route path="dokter/:id" element={<DokterEditor />} />
            <Route path="founder-gallery" element={<FounderGalleryManager />} />
            <Route path="founder-gallery/new" element={<FounderGalleryEditor />} />
            <Route path="founder-gallery/:id" element={<FounderGalleryEditor />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}
