import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Loader2, BookOpen, Pin } from "lucide-react";
import { getEdukasis, getTopics, Edukasi } from "../lib/edukasi";
import { getYoutubeThumbnail, isYoutubeUrl } from "../lib/videoUtils";
import { SEO } from "../components/SEO";

export function EdukasiList() {
  const [edukasis, setEdukasis] = useState<Edukasi[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  
  const [selectedType, setSelectedType] = useState("Semua");
  const [selectedTopic, setSelectedTopic] = useState("Semua");
  
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const fetchTopics = async () => {
      const data = await getTopics();
      setTopics(["Semua", ...data]);
    };
    fetchTopics();
  }, []);

  const fetchEdukasiData = async (currentPage: number, append: boolean = false) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);

    try {
      const { data } = await getEdukasis({
        page: currentPage,
        limit: 12,
        type: selectedType,
        topic: selectedTopic,
        clientSide: true
      });
      
      if (append) {
        setEdukasis(prev => [...prev, ...data]);
      } else {
        setEdukasis(data || []);
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
    setPage(1);
    fetchEdukasiData(1, false);
  }, [selectedType, selectedTopic]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchEdukasiData(nextPage, true);
  };

  return (
    <main className="flex-1 w-full max-w-[80rem] mx-auto px-[0.75rem] sm:px-[1.5rem] lg:px-[3rem] pt-[1rem] pb-[2.5rem] md:pt-[2rem] md:pb-[5rem] lg:pt-[2.5rem] lg:pb-[6rem]">
      <SEO 
        title="Edukasi Pasien" 
        description="Dapatkan informasi akurat terpercaya seputar kemoterapi, efek samping, dan tips perawatan dari tenaga medis profesional."
        url="https://koncokemo.com/edukasi"
      />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-[1.5rem] mb-[2rem] md:mb-[3rem]">
        <div className="max-w-[48rem]">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[1.5rem] sm:text-[1.875rem] md:text-[2.5rem] font-display font-bold text-gray-900 tracking-tight leading-tight mb-[0.25rem] sm:mb-[0.5rem]"
          >
            Informasi dan Edukasi
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-[0.875rem] sm:text-[1rem]"
          >
            Temukan materi edukasi, artikel, dan video yang diperbarui untuk mendukung perjalanan Anda.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-[1rem] min-w-[280px]"
        >
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full sm:w-auto px-[1.25rem] py-[0.75rem] bg-white border border-gray-200 rounded-[1rem] text-[0.875rem] font-bold text-gray-700 outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all cursor-pointer shadow-sm appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSI+PC9wb2x5bGluZT48L3N2Zz4=')] bg-no-repeat bg-[position:right_1rem_center] bg-[length:1.25rem] pr-[3rem]"
          >
            <option value="Semua">Semua Format</option>
            <option value="Artikel">Artikel</option>
            <option value="Video">Video</option>
          </select>

          <select 
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full sm:w-auto px-[1.25rem] py-[0.75rem] bg-white border border-gray-200 rounded-[1rem] text-[0.875rem] font-bold text-gray-700 outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all cursor-pointer shadow-sm appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSI+PC9wb2x5bGluZT48L3N2Zz4=')] bg-no-repeat bg-[position:right_1rem_center] bg-[length:1.25rem] pr-[3rem]"
          >
            {topics.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </motion.div>
      </div>

      {loading && page === 1 ? (
        <div className="flex justify-center items-center py-[3rem] md:py-[5rem] text-gray-500">
          <Loader2 className="w-[2rem] md:w-[2.5rem] h-[2rem] md:h-[2.5rem] animate-spin text-primary-500" />
        </div>
      ) : edukasis.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-[1.25rem] sm:rounded-[2rem] p-[1.5rem] sm:p-[3rem] text-center text-gray-500 text-[0.875rem] sm:text-[1rem]">
          Belum ada materi edukasi yang sesuai dengan filter saat ini.
        </div>
      ) : (
        <div className="space-y-[3rem]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1rem] sm:gap-[1.5rem] md:gap-[2rem]">
            <AnimatePresence mode="popLayout">
              {edukasis.map((item, index) => {
                const isVideo = item.media_type === 'video' || isYoutubeUrl(item.media_url);
                const thumbnailUrl = isVideo ? getYoutubeThumbnail(item.media_url) : item.media_url;
                const displayDate = item.publish_datetime || item.created_at;

                return (
                  <motion.article 
                    layout
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: (index % 12) * 0.05 }}
                    className="group flex flex-col bg-white rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative"
                  >
                    {item.is_pinned && (
                      <div className="absolute top-[1rem] right-[1rem] z-10 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white w-[2.25rem] h-[2.25rem] rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/30 ring-4 ring-white">
                        <Pin className="w-[1.125rem] h-[1.125rem] fill-current" />
                      </div>
                    )}
                    <Link to={`/edukasi/${item.id}`} className="block relative aspect-[16/9] overflow-hidden bg-gray-100">
                      {thumbnailUrl ? (
                        <img 
                          src={thumbnailUrl} 
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                           <BookOpen className="w-[2.5rem] h-[2.5rem] text-gray-200" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 p-[0.75rem] sm:p-[1rem] bg-gradient-to-t from-black/60 to-transparent flex gap-[0.5rem]">
                         <span className="text-white text-[0.625rem] sm:text-[0.7rem] font-bold uppercase tracking-wider bg-primary-600/80 backdrop-blur-md px-[0.625rem] sm:px-[0.75rem] py-[0.1875rem] sm:py-[0.25rem] rounded-full">
                           {isVideo ? 'Video' : 'Artikel'}
                         </span>
                         {item.topic && (
                           <span className="text-primary-100 text-[0.625rem] sm:text-[0.7rem] font-bold uppercase tracking-wider bg-black/40 backdrop-blur-md px-[0.625rem] sm:px-[0.75rem] py-[0.1875rem] sm:py-[0.25rem] rounded-full">
                             {item.topic}
                           </span>
                         )}
                      </div>
                    </Link>

                    <div className="flex flex-col flex-1 p-[1rem] sm:p-[1.25rem] md:p-[1.5rem]">
                      <div className="mb-[0.5rem] md:mb-[0.75rem] text-[0.65rem] sm:text-[0.7rem] font-semibold text-gray-400 uppercase tracking-widest">
                        {displayDate ? new Date(displayDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Baru'}
                      </div>
                      <Link to={`/edukasi/${item.id}`}>
                        <h2 className="text-[1rem] sm:text-[1.125rem] font-bold font-display text-gray-900 leading-tight mb-[0.375rem] sm:mb-[0.5rem] group-hover:text-primary-600 transition-colors line-clamp-2">
                          {item.title}
                        </h2>
                      </Link>
                      <p className="text-gray-500 leading-relaxed mb-[1rem] md:mb-[1.25rem] line-clamp-2 flex-1 text-[0.8125rem] sm:text-[0.875rem]">
                        {item.subtitle}
                      </p>
                      <div className="mt-auto pt-[0.75rem] sm:pt-[1rem] border-t border-gray-50 flex items-center justify-between">
                        <Link 
                          to={`/edukasi/${item.id}`}
                          className="inline-flex items-center gap-[0.375rem] text-primary-600 font-bold text-[0.8125rem] sm:text-[0.875rem] hover:text-primary-700 transition-colors group/btn"
                        >
                          Pelajari Selengkapnya
                          <ArrowRight className="w-[0.8125rem] sm:w-[0.875rem] h-[0.8125rem] sm:h-[0.875rem] transition-transform group-hover/btn:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
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
    </main>
  );
}
