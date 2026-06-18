import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEdukasis, Edukasi } from "../../lib/edukasi";
import { getYoutubeThumbnail, isYoutubeUrl } from "../../lib/videoUtils";

export function BeritaTerbaru() {
  const [articles, setArticles] = useState<Edukasi[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data } = await getEdukasis({ 
          clientSide: true, 
          limit: 3, 
          page: 1,
          ignorePinned: true 
        });
        setArticles(data);
      } catch (error) {
        console.error("Failed to fetch articles", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  if (loading && articles.length === 0) {
    return <section className="py-[3.5rem] md:py-24 bg-gray-50 min-h-[500px] animate-pulse" />;
  }

  return (
    <section id="edukasi" className="py-[3.5rem] md:py-24 bg-gray-50">
      <div className="container mx-auto px-[1rem] sm:px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-[2rem] md:mb-16">
          <div className="max-w-2xl">
            <h2 className="font-display text-[1.75rem] sm:text-[2.25rem] lg:text-5xl font-bold text-gray-900 mb-[0.5rem] md:mb-4 leading-[1.2] md:leading-tight">
              Informasi & Edukasi Terbaru
            </h2>
          </div>
          <button 
            onClick={() => navigate('/edukasi')}
            className="mt-[0.5rem] md:mt-0 group flex items-center gap-[0.375rem] text-primary-600 font-bold hover:text-primary-800 transition-colors text-[0.875rem] md:text-base"
          >
            Lihat Semua Artikel
            <ArrowRight className="w-[1.125rem] md:w-5 h-[1.125rem] md:h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1.25rem] md:gap-8">
          {articles.map((item, index) => {
            const isVideo = item.media_type === 'video' || isYoutubeUrl(item.media_url);
            const thumbnailUrl = isVideo ? getYoutubeThumbnail(item.media_url) : item.media_url;

            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
                className="group bg-white rounded-[1.25rem] md:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col cursor-pointer"
                onClick={() => navigate(`/edukasi/${item.id}`)}
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img 
                    src={thumbnailUrl} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-[1rem] left-[1rem] bg-white/90 backdrop-blur-sm px-[0.625rem] py-[0.1875rem] rounded-full text-[0.625rem] font-bold text-primary-700 uppercase tracking-wide">
                    {isVideo ? 'Video' : 'Artikel'}
                  </div>
                </div>
                <div className="p-[1.25rem] md:p-8 flex flex-col flex-1">
                  <h3 className="font-display text-[1.125rem] md:text-xl font-bold text-gray-900 mb-[0.625rem] md:mb-3 group-hover:text-primary-600 transition-colors line-clamp-2 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 mb-[1.25rem] md:mb-6 line-clamp-3 italic text-[0.875rem] md:text-base">
                    {item.subtitle}
                  </p>
                  <div className="mt-auto">
                    <span className="text-primary-600 font-bold inline-flex items-center gap-[0.25rem] group-hover:gap-[0.5rem] transition-all text-[0.8125rem] md:text-base">
                      Baca Artikel <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </motion.article>

            );
          })}
        </div>
      </div>
    </section>
  );
}
