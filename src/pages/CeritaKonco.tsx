import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Loader2 } from "lucide-react";
import { getCeritaKoncos, CeritaKonco } from "../lib/ceritaKonco";
import { SEO } from "../components/SEO";
import { FloatingChatButton } from "../components/FloatingChatButton";

export function CeritaKoncoList() {
  const [ceritas, setCeritas] = useState<CeritaKonco[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchCerita = async (currentPage: number, append: boolean = false) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);

    try {
      const { data } = await getCeritaKoncos({
        page: currentPage,
        limit: 12
      });
      
      if (append) {
        setCeritas(prev => [...prev, ...data]);
      } else {
        setCeritas(data || []);
      }
      
      setHasMore(data.length === 12);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchCerita(1, false);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCerita(nextPage, true);
  };

  return (
    <main className="flex-1 w-full max-w-[80rem] mx-auto px-[0.75rem] sm:px-[1.5rem] lg:px-[3rem] pt-[1rem] pb-[2.5rem] md:pt-[2rem] md:pb-[5rem] lg:pt-[2.5rem] lg:pb-[6rem]">
      <SEO 
        title="Cerita Konco" 
        description="Kumpulan kisah inspiratif, perjalanan pengobatan, dan harapan dari para penyintas kemoterapi yang akan menguatkan langkah Anda."
        url="https://koncokemo.com/cerita-konco"
      />
      <div className="max-w-[48rem] mb-[1.25rem] md:mb-[2rem]">
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[1.5rem] sm:text-[1.875rem] md:text-[2.5rem] font-display font-bold text-gray-900 tracking-tight leading-tight mb-[0.25rem] sm:mb-[0.5rem]"
        >
          Cerita Konco
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[0.9375rem] sm:text-[1rem] md:text-[1.125rem] text-gray-600 leading-relaxed"
        >
          Kumpulan cerita inspiratif, perjalanan pengobatan, dan harapan dari pejuang kanker
        </motion.p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-[5rem] text-gray-500">
          <Loader2 className="w-[2.5rem] h-[2.5rem] animate-spin text-primary-500" />
        </div>
      ) : ceritas.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-[1.5rem] sm:rounded-[2rem] p-[2rem] sm:p-[3rem] text-center text-gray-500">
          Belum ada cerita yang dipublikasikan saat ini.
        </div>
      ) : (
        <div className="space-y-[3rem]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1rem] sm:gap-[1.5rem] md:gap-[2rem]">
            {ceritas.map((cerita, index) => (
              <motion.article 
                key={cerita.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index % 12) * 0.1 }}
                className="group relative p-[1px] md:p-[2px] shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 block rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-[2rem]"
              >
                {/* Default static border background that disappears on hover */}
                <div className="absolute inset-0 pointer-events-none transition-opacity duration-300 bg-gray-100 group-hover:opacity-0 rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-[2rem]" />

                {/* Rotating Border Hover Effect */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-[2rem]">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                    className="greeting-bubble-line"
                  />
                </div>

                {/* Inner Content Block */}
                <div className="relative z-10 flex flex-col h-full bg-white rounded-[calc(1.25rem-1px)] sm:rounded-[calc(1.5rem-1px)] md:rounded-[calc(2rem-2px)] overflow-hidden">
                  <Link to={`/cerita-konco/${cerita.id}`} className="block relative aspect-[16/10] overflow-hidden bg-gray-100">
                    {cerita.thumbnail_image && (
                      <img 
                        src={cerita.thumbnail_image} 
                        alt={cerita.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>
                  <div className="flex flex-col flex-1 p-[1rem] sm:p-[1.25rem] md:p-[1.5rem]">
                    <div className="mb-[0.5rem] md:mb-[0.75rem] text-[0.65rem] sm:text-[0.7rem] font-semibold text-primary-600 uppercase tracking-widest">
                      {cerita.created_at ? new Date(cerita.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Baru'}
                    </div>
                    <Link to={`/cerita-konco/${cerita.id}`}>
                      <h2 className="text-[1rem] sm:text-[1.125rem] font-bold font-display text-gray-900 leading-tight mb-[0.375rem] sm:mb-[0.5rem] group-hover:text-primary-600 transition-colors line-clamp-2">
                        {cerita.title}
                      </h2>
                    </Link>
                    <p className="text-gray-500 leading-relaxed mb-[1rem] md:mb-[1.25rem] line-clamp-2 flex-1 text-[0.8125rem] sm:text-[0.875rem]">
                      {cerita.subtitle_hook}
                    </p>
                    <div className="mt-auto pt-[0.75rem] sm:pt-[1rem] border-t border-gray-50">
                      <Link 
                        to={`/cerita-konco/${cerita.id}`}
                        className="inline-flex items-center gap-[0.375rem] text-primary-600 font-bold text-[0.875rem] hover:text-primary-700 transition-colors group/btn"
                      >
                        Baca Selengkapnya
                        <ArrowRight className="w-[0.875rem] h-[0.875rem] transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-[2rem]">
              <button 
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-[2rem] py-[0.875rem] bg-white border border-gray-200 text-gray-700 rounded-full font-bold text-[0.875rem] hover:text-primary-600 hover:border-primary-200 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-[0.5rem]"
              >
                {loadingMore ? (
                  <><Loader2 className="w-[1rem] h-[1rem] animate-spin" /> MENGAMBIL DATA...</>
                ) : (
                  "MUAT LEBIH BANYAK"
                )}
              </button>
            </div>
          )}
        </div>
      )}

      <FloatingChatButton />
    </main>
  );
}
