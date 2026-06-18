import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { getCeritaKoncos, CeritaKonco } from "../../lib/ceritaKonco";

export function CeritaKoncoHighlight() {
  const [highlight, setHighlight] = useState<CeritaKonco | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHighlight = async () => {
      try {
        const { data } = await getCeritaKoncos();
        if (data && data.length > 0) {
          setHighlight(data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch highlight", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHighlight();
  }, []);

  if (loading) {
    return <section className="py-[3.5rem] md:py-24 bg-white min-h-[500px] animate-pulse" />;
  }

  if (!highlight) return null;

  return (
    <section id="cerita-konco" className="py-[3.5rem] md:py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-50 -skew-x-12 -translate-x-20 z-0 hidden lg:block" />
      
      <div className="container mx-auto px-[1rem] sm:px-6 lg:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-[2.5rem] md:gap-16">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full lg:w-1/2 relative"
          >
            <div className="relative rounded-[1.25rem] md:rounded-2xl overflow-hidden aspect-[4/5] shadow-2xl cursor-pointer max-w-[22rem] mx-auto md:max-w-none" onClick={() => navigate(`/cerita-konco/${highlight.id}`)}>
              <img 
                src={highlight.thumbnail_image} 
                alt={highlight.title} 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-[1rem] left-[1rem] right-[1rem] md:bottom-8 md:left-8 md:right-8 pointer-events-none">
                <p className="text-white text-[1rem] md:text-lg font-bold">{highlight.patient_name}</p>
                <p className="text-white/80 text-[0.75rem] md:text-sm">Penyintas Kanker</p>
              </div>
            </div>
            {/* Decorative block */}
            <div className="absolute -bottom-4 md:-bottom-6 -left-4 md:-left-6 w-24 md:w-32 h-24 md:h-32 bg-primary-100 rounded-full -z-10 blur-xl md:blur-2xl" />
            <div className="absolute -top-4 md:-top-6 -right-4 md:-right-6 w-32 md:w-40 h-32 md:h-40 bg-primary-200 rounded-full -z-10 blur-2xl md:blur-3xl opacity-50" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="w-full lg:w-1/2 text-center lg:text-left"
          >
            <div className="inline-block px-[0.75rem] py-[0.375rem] rounded-full bg-primary-50 text-primary-700 font-bold text-[0.625rem] md:text-sm mb-[1rem] md:mb-6">
              CERITA KONCO KEMO
            </div>
            <h2 className="font-display text-[1.75rem] sm:text-[2.25rem] lg:text-5xl font-bold text-gray-900 mb-[1rem] md:mb-6 leading-[1.2] md:leading-tight">
              {highlight.title}
            </h2>
            <p className="text-[1rem] md:text-xl text-gray-600 mb-[2rem] md:mb-10 leading-relaxed italic">
              "{highlight.subtitle_hook}"
            </p>
            
            <Button 
              onClick={() => navigate('/cerita-konco')}
              className="bg-primary-600 hover:bg-primary-700 text-white rounded-full px-[1.5rem] md:px-8 py-[0.75rem] md:py-3 outline-none text-[0.875rem] md:text-base transition-transform hover:-translate-y-1 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 font-bold"
            >
              Lihat Semua Cerita Konco
            </Button>
          </motion.div>


        </div>
      </div>
    </section>
  );
}
