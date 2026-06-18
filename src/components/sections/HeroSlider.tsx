import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getHeroSlides, HeroSlide } from "../../lib/heroSlides";
import { useQuery, useQueryClient } from '@tanstack/react-query';

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const isFirstLoad = useRef(true);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Menggunakan React Query untuk Caching Supabase Data.
  // Ini menghindari pemanggilan API berulang untuk setiap navigasi atau re-render,
  // bertindak seperti Stale-While-Revalidate agar koneksi aman.
  const { data: slidesFallback } = useQuery<HeroSlide[]>({
    queryKey: ['public-hero-slides'],
    queryFn: async () => {
      const loadedSlides = await getHeroSlides();
      if (loadedSlides.length === 0) {
        return [
          {
            id: 'slide-1',
            title: "Sahabat Setia di Setiap Langkah Kemo Anda",
            subtitle: "KoncoKemo hadir memberikan dukungan edukatif dan moral untuk memastikan Anda tidak pernah merasa sendirian dalam perjalanan penyembuhan.",
            image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=2000",
            cta: "Cek Diri Sekarang",
            ctaLink: "#cek-diri"
          }
        ];
      }
      return loadedSlides;
    },
    staleTime: 1000 * 60 * 60, // Data akan fresh selama 1 jam (tidak hit database lagi jika cache belum usang)
    refetchOnWindowFocus: false, // Tidak auto-refetch saat berganti tab
  });

  const slides = slidesFallback || [];

  useEffect(() => {
    // Listener untuk fallback jika update manual dari admin yang berada di satu perangkat/tab yang sama
    const handleStorageChange = () => {
      queryClient.invalidateQueries({ queryKey: ['public-hero-slides'] });
      setCurrentSlide(0);
    };
    window.addEventListener('hero-slides-updated', handleStorageChange);
    
    return () => {
      window.removeEventListener('hero-slides-updated', handleStorageChange);
    };
  }, [queryClient]);

  useEffect(() => {
    if (slides.length <= 1) return;
    
    const delay = isFirstLoad.current ? 10000 : 5000;
    isFirstLoad.current = false;

    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, delay);
    return () => clearTimeout(timer);
  }, [slides.length, currentSlide]);

  const nextSlide = () => {
    isFirstLoad.current = false;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }
  const prevSlide = () => {
    isFirstLoad.current = false;
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }

  if (slides.length === 0) {
    return (
      <section className="relative w-full min-h-[500px] md:min-h-0 md:aspect-[24/10] overflow-hidden bg-gray-50 flex items-center justify-center animate-pulse">
      </section>
    );
  }

  return (
    <section className="relative w-full min-h-[500px] md:min-h-0 md:aspect-[24/10] overflow-hidden bg-gray-50 flex items-center justify-center">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={currentSlide}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ 
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1]
          }}
          className="absolute inset-0 w-full h-full z-10"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/60 to-transparent z-10" />
          <img
            src={slides[currentSlide].image}
            alt="Hero background"
            loading={currentSlide === 0 ? "eager" : "lazy"}
            fetchPriority={currentSlide === 0 ? "high" : "auto"}
            className="w-full h-full object-cover object-[80%_center] md:object-center"
          />

          <div className="absolute inset-0 z-20 w-full h-full flex items-center px-8 py-10 md:px-16 md:py-20">
            <div className="max-w-7xl mx-auto w-full">
              <div className="max-w-2xl">
                <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight mb-4 md:mb-6 break-words">
                  {slides[currentSlide].title}
                </h1>
                <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8 leading-relaxed max-w-xl break-words">
                  {slides[currentSlide].subtitle}
                </p>
                
                <div className="flex flex-wrap items-center gap-4">
                  <Button 
                    onClick={() => {
                      const link = slides[currentSlide].ctaLink;
                      if (link) {
                        if (link.startsWith('http') || link.startsWith('#')) {
                          window.location.href = link;
                        } else {
                          navigate(link);
                        }
                      }
                    }}
                    className="bg-primary-600 hover:bg-primary-700 text-white rounded-full px-6 py-2.5 shadow-lg shadow-primary-500/30 transition-all hover:shadow-primary-500/50 text-sm md:text-base md:px-8 md:py-3.5"
                  >
                    {slides[currentSlide].cta}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-10 right-10 z-30 flex items-center gap-4">
        <div className="flex gap-2 mr-6 items-center">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className="relative outline-none"
              aria-label={`Go to slide ${idx + 1}`}
            >
              <span className="absolute -inset-4 z-10" />
              <div
                className={`h-2 rounded-full transition-all duration-300 relative z-0 ${
                  idx === currentSlide ? "w-8 bg-primary-600" : "w-2 bg-gray-300 group-hover:bg-gray-400"
                }`}
              />
            </button>
          ))}
        </div>
        <button
          onClick={prevSlide}
          className="w-12 h-12 rounded-full glass border border-white/20 flex items-center justify-center text-gray-700 hover:text-primary-600 transition-colors shadow-lg backdrop-blur-md"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="w-12 h-12 rounded-full glass border border-white/20 flex items-center justify-center text-gray-700 hover:text-primary-600 transition-colors shadow-lg backdrop-blur-md"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
}
