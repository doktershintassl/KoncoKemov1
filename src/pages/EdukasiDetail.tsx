import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Calendar, Loader2, PlayCircle, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { getEdukasiById, getEdukasis, Edukasi } from "../lib/edukasi";
import { getYoutubeEmbedUrl, isYoutubeUrl } from "../lib/videoUtils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { SEO } from "../components/SEO";
import { ASSETS } from "../lib/assets";

const normalizeText = (text: string) => text.replace(/\u00A0/g, ' ');

export function EdukasiDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [edukasi, setEdukasi] = useState<Edukasi | null>(null);
  const [loading, setLoading] = useState(true);
  const [navData, setNavData] = useState<{ prev: string | null; next: string | null }>({ prev: null, next: null });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getEdukasiById(id);
        setEdukasi(data);

        // Fetch list to find neighbors (following public sorting: pinned, then publish_datetime)
        const { data: allData } = await getEdukasis({ clientSide: true, limit: 1000 });
        const currentIndex = allData.findIndex(item => item.id === id);
        if (currentIndex !== -1) {
          setNavData({
            prev: currentIndex > 0 ? allData[currentIndex - 1].id : null,
            next: currentIndex < allData.length - 1 ? allData[currentIndex + 1].id : null
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-[10rem]">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!edukasi) {
    return (
      <div className="flex flex-col justify-center items-center p-6 text-center py-[10rem]">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Materi Tidak Ditemukan</h2>
        <p className="text-gray-600 mb-8">Maaf, materi edukasi yang Anda cari tidak tersedia atau telah dihapus.</p>
        <Link to="/edukasi">
          <button className="px-6 py-3 bg-primary-600 text-white rounded-full font-bold hover:bg-primary-700 transition-colors">
            Kembali ke Edukasi
          </button>
        </Link>
      </div>
    );
  }

  const isVideo = edukasi.media_type === 'video' || isYoutubeUrl(edukasi.media_url);
  const embedUrl = isVideo ? getYoutubeEmbedUrl(edukasi.media_url) : null;

  return (
    <div className="w-full bg-white">
      <SEO 
        title={`${edukasi.title} - Edukasi KoncoKemo`}
        description={edukasi.subtitle || "Materi edukasi kemoterapi dari KoncoKemo."}
        image={!isVideo ? edukasi.media_url : ASSETS.LOGO_KONCOKEMO}
        type="article"
        url={`https://koncokemo.com/edukasi/${id}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": edukasi.title,
          "description": edukasi.subtitle,
          "image": !isVideo ? edukasi.media_url : ASSETS.LOGO_KONCOKEMO,
          "author": {
            "@type": "Organization",
            "name": "KoncoKemo"
          },
          "publisher": {
            "@type": "Organization",
            "name": "KoncoKemo",
            "logo": {
              "@type": "ImageObject",
              "url": ASSETS.LOGO_KONCOKEMO
            }
          },
          "datePublished": edukasi.created_at,
          "dateModified": edukasi.created_at
        }}
      />
      <div className="max-w-[85rem] mx-auto px-[0.75rem] sm:px-[1.5rem] lg:px-[4rem] pt-[1rem] pb-[3rem] md:pt-[3rem] md:pb-[5rem] lg:pt-[4rem] lg:pb-[7rem]">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-[1.5rem] sm:mb-[2rem] md:mb-[3.5rem] overflow-hidden"
        >
          <div className="flex flex-wrap items-center justify-between gap-[0.75rem] mb-[1.25rem] sm:mb-[2rem] md:mb-[3rem]">
            <Link to="/edukasi" className="inline-flex items-center gap-[0.5rem] text-primary-600 hover:text-primary-800 font-medium text-[0.8125rem] sm:text-[0.875rem] transition-colors group">
              <ArrowLeft className="w-[0.875rem] sm:w-[1rem] h-[0.875rem] sm:h-[1rem] transition-transform group-hover:-translate-x-1" /> Kembali ke Edukasi
            </Link>
          
          </div>
          
          <div className="flex items-center gap-[0.5rem] text-[0.65rem] sm:text-[0.75rem] font-semibold text-primary-600/70 uppercase tracking-[0.1em] mb-[0.75rem] sm:mb-[1rem]">
            <Calendar className="w-[0.75rem] sm:w-[0.875rem] h-[0.75rem] sm:h-[0.875rem]" />
            {edukasi.created_at ? new Date(edukasi.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Baru'}
            <span className="mx-[0.375rem] sm:mx-2 text-gray-200">•</span>
            <span className="flex items-center gap-[0.25rem]">
               {isVideo ? <PlayCircle className="w-[0.75rem] sm:w-3.5 h-[0.75rem] sm:h-3.5" /> : null}
               {isVideo ? 'Video' : 'Materi Bacaan'}
            </span>
          </div>

          <h1 className="text-[1.75rem] sm:text-[2.25rem] md:text-[3rem] font-display font-bold text-gray-900 leading-tight mb-[1.5rem]">
            {normalizeText(edukasi.title)}
          </h1>
          
          <div className="relative pl-[1.25rem] border-l-4 border-primary-200 py-[0.25rem] mb-[2rem]">
            <p className="text-[1rem] sm:text-[1.125rem] md:text-[1.25rem] text-gray-500 leading-relaxed font-medium italic whitespace-pre-wrap">
              {normalizeText(edukasi.subtitle)}
            </p>
          </div>

          {edukasi.kontributor && (() => {
            try {
              const authors = JSON.parse(edukasi.kontributor);
              if (Array.isArray(authors) && authors.length > 0) {
                return (
                  <div className="mt-[1.5rem] flex flex-wrap items-center gap-[0.75rem]">
                    <span className="text-[0.6875rem] font-black uppercase tracking-widest text-gray-400">Kontributor:</span>
                    <div className="flex flex-wrap gap-[0.5rem]">
                      {authors.map((author: string, idx: number) => (
                        <span key={idx} className="bg-primary-50 text-primary-700 px-[0.75rem] py-[0.25rem] rounded-full text-[0.75rem] font-bold border border-primary-100">
                          {author}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              }
            } catch (e) { return null; }
          })()}
        </motion.div>

        {/* Media Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full aspect-[16/9] bg-gray-100 rounded-[1.25rem] sm:rounded-[2rem] overflow-hidden mb-[2rem] md:mb-[4rem] shadow-2xl shadow-primary-900/5 border border-gray-100 group relative"
        >

          {isVideo && embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={edukasi.title}
            />
          ) : (
            <img 
              src={edukasi.media_url} 
              alt={edukasi.title}
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>

        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full overflow-hidden"
        >
          {edukasi.topic && (
            <div className="mb-[1rem] sm:mb-[2rem] inline-block bg-primary-100 text-primary-700 px-[1rem] py-[0.5rem] rounded-full text-[0.75rem] sm:text-[0.875rem] font-bold tracking-wider uppercase">
              TOPIC: {edukasi.topic}
            </div>
          )}

          <div className="prose prose-sm sm:prose-base md:prose-lg lg:prose-xl prose-gray max-w-none prose-p:text-left prose-p:leading-relaxed prose-p:mb-[1.5rem] prose-headings:text-left prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary-600 prose-blockquote:border-primary-200 prose-blockquote:bg-primary-50/30 prose-blockquote:py-[0.5rem] prose-blockquote:px-[1.5rem] prose-blockquote:rounded-r-[1rem] prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-img:rounded-[1.5rem] flow-root">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {normalizeText(edukasi.content)}
            </ReactMarkdown>
          </div>
        </motion.article>

        {/* Navigation Section */}
        <div className="mt-[4rem] md:mt-[6rem] pt-[3rem] border-t border-gray-100">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1rem] sm:gap-[2rem]">
             <div className="flex flex-col">
               {navData.prev ? (
                 <Link 
                   to={`/edukasi/${navData.prev}`}
                   className="group p-[1.5rem] bg-gray-50 rounded-[1.5rem] border border-transparent flex items-center gap-[1rem] transition-colors"
                 >
                   <div className="w-[3rem] h-[3rem] rounded-full bg-white flex items-center justify-center text-gray-400 group-hover:text-primary-600 group-hover:scale-110 transition-all shadow-sm">
                     <ChevronLeft className="w-[1.5rem] h-[1.5rem]" />
                   </div>
                   <div>
                     <span className="block text-[0.625rem] font-black text-gray-400 uppercase tracking-widest mb-[0.25rem]">MATERI SEBELUMNYA</span>
                     <span className="block text-[0.875rem] font-bold text-gray-700 group-hover:text-primary-700 line-clamp-1">KEMBALI</span>
                   </div>
                 </Link>
               ) : <div />}
             </div>
             <div className="flex flex-col items-end">
               {navData.next ? (
                  <Link 
                    to={`/edukasi/${navData.next}`}
                    className="group p-[1.5rem] bg-gray-50 rounded-[1.5rem] border border-transparent flex items-center justify-end text-right gap-[1rem] w-full transition-colors"
                  >
                    <div>
                      <span className="block text-[0.625rem] font-black text-gray-400 uppercase tracking-widest mb-[0.25rem]">MATERI BERIKUTNYA</span>
                      <span className="block text-[0.875rem] font-bold text-gray-700 group-hover:text-primary-700 line-clamp-1">LANJUTKAN</span>
                    </div>
                    <div className="w-[3rem] h-[3rem] rounded-full bg-white flex items-center justify-center text-gray-400 group-hover:text-primary-600 group-hover:scale-110 transition-all shadow-sm">
                      <ChevronRight className="w-[1.5rem] h-[1.5rem]" />
                    </div>
                  </Link>
               ) : <div />}
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
