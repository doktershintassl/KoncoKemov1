import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Typewriter from "typewriter-effect";
import { GraduationCap, Microscope, Stethoscope, MapPin, Quote } from "lucide-react";
import { SEO } from "../components/SEO";
import { getFounderGallery, FounderGalleryImage } from "../lib/founderGallery";

const FounderPage = () => {
  const photoUrl = "https://lh3.googleusercontent.com/d/1LUh5PRm082eRYlCJhXTiPC6O4Q-vvR7X";
  const [galleryImages, setGalleryImages] = useState<FounderGalleryImage[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const data = await getFounderGallery();
        if (data && data.length > 0) {
          setGalleryImages(data);
        } else {
          // Fallback dummy images if none in DB
          setGalleryImages([
            { id: "1", image_url: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=2070&auto=format&fit=crop" },
            { id: "2", image_url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop" },
            { id: "3", image_url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop" }
          ]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchImages();

    const handleUpdate = () => {
      fetchImages();
    };
    window.addEventListener('founder-gallery-updated', handleUpdate);
    return () => window.removeEventListener('founder-gallery-updated', handleUpdate);
  }, []);

  return (
    <div className="min-h-screen bg-white selection:bg-primary-100">
      <SEO 
        title="Tentang Founder - Dr. dr. Shinta Oktya Wardhani" 
        description="Pakar Hematologi Onkologi Medik dan founder KoncoKemo, memastikan setiap pasien mendapatkan keadilan informasi dan dukungan perawatan selagi kemoterapi."
        url="https://koncokemo.com/founder"
        image={photoUrl}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Person",
          "name": "Dr. dr. Shinta Oktya Wardhani, Sp.PD, K-HOM, FINASIM",
          "jobTitle": "Pakar Hematologi dan Onkologi Medik",
          "worksFor": {
            "@type": "Organization",
            "name": "KoncoKemo"
          },
          "image": photoUrl
        }}
      />
      {/* Dynamic Header / Hero */}
      <section className="relative pt-[1.5rem] pb-0 lg:pt-[4rem] lg:pb-0 overflow-hidden">
        {/* Subtle Branding Accent */}
        <div className="absolute top-0 left-0 w-full h-[30rem] bg-gradient-to-b from-primary-50/20 to-transparent -z-10" />
        
        <div className="max-w-7xl mx-auto px-[1rem] sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[2.5rem] lg:gap-[6rem] items-start">
            
            {/* LEFT: Structural Photo Container */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5 relative space-y-[1rem]"
            >
              <div className="relative aspect-[4/5] w-full rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden bg-gray-100 border border-gray-100 shadow-2xl shadow-gray-200/50">
                <img 
                  src={photoUrl} 
                  alt="Dr. dr. Shinta Oktya Wardhani" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Stacked Expertise Cards */}
              <div className="space-y-[0.75rem] pb-[1rem] lg:pb-12">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-[1rem] md:p-6 bg-white rounded-[1.25rem] md:rounded-[2rem] flex items-center gap-[1rem] md:gap-5 border border-gray-50 shadow-lg shadow-gray-100/50 hover:border-primary-100 hover:shadow-primary-100/20 transition-all group"
                >
                  <div className="w-[3rem] md:w-14 h-[3rem] md:h-14 bg-primary-50 rounded-xl md:rounded-2xl flex items-center justify-center text-primary-600 transition-transform group-hover:rotate-12 flex-shrink-0">
                    <Stethoscope className="w-[1.25rem] md:w-7 h-[1.25rem] md:h-7" />
                  </div>
                  <h3 className="font-display font-bold text-gray-900 text-[0.9375rem] md:text-[1.125rem] leading-tight">Pakar Hematologi dan Onkologi Medik</h3>
                </motion.div>

                <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.5 }}
                   whileHover={{ scale: 1.02 }}
                   className="p-[1rem] md:p-6 bg-white rounded-[1.25rem] md:rounded-[2rem] flex items-center gap-[1rem] md:gap-5 border border-gray-50 shadow-lg shadow-gray-100/50 hover:border-primary-100 hover:shadow-primary-100/20 transition-all group"
                >
                  <div className="w-[3rem] md:w-14 h-[3rem] md:h-14 bg-primary-50 rounded-xl md:rounded-2xl flex items-center justify-center text-primary-600 transition-transform group-hover:rotate-12 flex-shrink-0">
                    <GraduationCap className="w-[1.25rem] md:w-7 h-[1.25rem] md:h-7" />
                  </div>
                  <h3 className="font-display font-bold text-gray-900 text-[0.9375rem] md:text-[1.125rem] leading-tight">Pengajar dan peneliti Universitas Brawijaya</h3>
                </motion.div>
              </div>
            </motion.div>

            {/* RIGHT: Content & Vision */}
            <div className="lg:col-span-7 pt-[0.5rem] lg:pt-6 space-y-[1.5rem] md:space-y-[2.5rem]">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="space-y-[1rem] md:space-y-8"
              >
                <div className="space-y-[0.5rem] md:space-y-4">
                  <p className="text-primary-600 font-bold tracking-[0.4em] text-[0.625rem] md:text-[0.75rem] px-1">FOUNDER <span className="font-display !tracking-[0em] !text-[0.875rem] md:!text-[1rem] font-bold text-gray-900">KoncoKemo</span></p>
                  <h1 className="font-display leading-[1.1] tracking-tight">
                    <span className="text-[1.125rem] lg:text-[1.5rem] font-bold text-gray-900 block mb-1 opacity-80">Dr. dr.</span>
                    <span className="text-[2.25rem] sm:text-[3rem] lg:text-[5rem] font-bold text-primary-600 block -ml-0.5 md:-ml-1">Shinta Oktya Wardhani,</span>
                    <span className="text-[1rem] lg:text-[1.375rem] font-bold text-gray-900 block mt-1 md:mt-2 opacity-80">Sp.PD, K-HOM, FINASIM</span>
                  </h1>
                </div>

                <div className="text-[1.0rem] lg:text-[1.625rem] text-black font-medium leading-relaxed italic border-l-2 border-primary-100 pl-[1rem] md:pl-8 py-2 md:py-3">

                  <Typewriter
                    options={{
                      strings: [
                        "\"Mendampingi dengan hati, memberdayakan dengan edukasi.\"",
                        "\"Harapan adalah kompas dalam perjalanan pemulihan.\"",
                        "\"Setiap pasien layak mendapatkan dukungan terbaik.\""
                      ],
                      autoStart: true,
                      loop: true,
                      delay: 40,
                      deleteSpeed: 20,
                    }}
                  />
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="prose prose-xl text-gray-500 leading-[1.8] font-normal"
              >
                <p>
                  Sebagai seorang pakar di bidang <strong>Hematologi Onkologi Medik</strong>, beliau mendedikasikan perjalanan profesionalnya untuk menjembatani antara ketepatan diagnosis medis dan kehangatan pendampingan psikososial.
                </p>
                <p>
                  <span className="font-display font-bold text-gray-900">KoncoKemo</span> lahir dari visi beliau untuk menciptakan ekosistem pendukung bagi para pejuang kanker di Indonesia, memastikan tidak ada seorang pun yang merasa sendirian dalam menghadapi masa kemoterapi.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Gallery Documentation */}
      <section className="pt-[1.5rem] pb-[1.5rem] md:pt-[2rem] md:pb-[2rem] overflow-hidden">
        <div className="hidden mb-8 px-6 max-w-7xl mx-auto">
           <h2 className="text-[1rem] font-bold text-gray-900 border-l-4 border-primary-500 pl-4 uppercase tracking-widest">DOKUMENTASI KEGIATAN</h2>
        </div>
        
        <div className="relative flex overflow-hidden">
          <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ 
              duration: 80, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="flex gap-[0.75rem] md:gap-4 px-2"
          >
            {[...galleryImages, ...galleryImages, ...galleryImages, ...galleryImages, ...galleryImages].map((img, i) => (
              <div 
                key={i} 
                className="relative w-[15rem] md:w-[22rem] h-[10rem] md:h-[15rem] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shrink-0 border border-gray-100 group shadow-lg shadow-gray-200/40"
              >
                <img 
                  src={img.image_url} 
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" 
                  alt="Founder Activity" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-primary-900/0 group-hover:bg-primary-900/5 transition-all duration-500" />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Vision Statement */}
      <section className="py-[2rem] lg:py-[3rem] text-center max-w-4xl mx-auto px-[1rem] sm:px-6">
        <Quote className="w-[2rem] md:w-12 h-[2rem] md:h-12 mx-auto text-primary-500 mb-[1rem] md:mb-6 opacity-20" />
        <h3 className="text-[1.25rem] sm:text-[1.75rem] md:text-[2.5rem] font-display font-medium text-gray-900 leading-[1.3] italic">
          "Dedikasi saya adalah memastikan setiap pasien mendapatkan keadilan informasi dan kualitas perawatan yang bermartabat."
        </h3>
        <div className="mt-[1rem] md:mt-6 flex flex-col items-center gap-3 md:gap-4">
           <div className="w-px h-8 md:h-10 bg-primary-100" />
           <p className="text-[0.625rem] md:text-[0.75rem] font-bold text-primary-600 uppercase tracking-[0.3em]">Commitment to care</p>
        </div>
      </section>

      {/* Professional Practice Locations */}
      <section className="py-[2.5rem] bg-gray-50 rounded-t-[2.5rem] md:rounded-t-[5rem] overflow-hidden pt-[3rem] lg:pt-20">
        <div className="max-w-7xl mx-auto px-[1rem] sm:px-6 relative z-10">
          <div className="mb-[2rem] md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-[1rem] md:gap-6">
            <div className="max-w-2xl">
              <h2 className="text-[1.75rem] sm:text-[2.25rem] lg:text-[3rem] font-display font-bold text-gray-900 mb-2 tracking-tight leading-tight">Lokasi Praktik</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1.5rem] md:gap-8">
            {[
              {
                name: "RSUD Dr. Saiful Anwar",
                addr: "Jl. Jaksa Agung Suprapto No.2, Klojen, Kec. Klojen, Kota Malang, Jawa Timur 65112",
                serv: "Onkologi Terpadu",
                lat: -7.972091158774396,
                lng: 112.63147447301432,
                color: "bg-blue-600"
              },
              {
                name: "RSIA Galeri Candra",
                addr: "Jl. Bunga Andong No.3, Jatimulyo, Kec. Lowokwaru, Kota Malang, Jawa Timur 65141",
                serv: "Hematologi Reaktif",
                lat: -7.94768997336689,
                lng: 112.61948816347042,
                color: "bg-primary-600"
              }
            ].map((loc, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                className="bg-white p-[1.25rem] sm:p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:shadow-primary-100/20 transition-all group flex flex-col justify-between"
              >
                <div className="space-y-[1.25rem] md:space-y-6">
                  <div className="space-y-[0.75rem] md:space-y-4">
                    <h4 className="text-[1.25rem] md:text-[1.5rem] font-display font-bold text-gray-900 leading-tight group-hover:text-primary-600 transition-colors">{loc.name}</h4>
                    <div className="flex items-start gap-[0.625rem] md:gap-3">
                      <div className="w-[2rem] md:w-10 h-[2rem] md:h-10 bg-gray-50 rounded-full flex items-center justify-center shrink-0">
                         <MapPin className="w-[1rem] md:w-5 h-[1rem] md:h-5 text-primary-500" />
                      </div>
                      <p className="text-gray-500 text-[0.8125rem] md:text-[0.9375rem] font-medium leading-relaxed italic">{loc.addr}</p>
                    </div>
                  </div>

                  {/* Map Viewer */}
                  <div className="mt-2 rounded-[1.5rem] md:rounded-3xl overflow-hidden h-[10rem] md:h-[12rem] bg-gray-100 border border-gray-100 shadow-inner group-hover:border-primary-100 transition-colors">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://maps.google.com/maps?q=${loc.lat},${loc.lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                      allowFullScreen
                      className="opacity-80 grayscale-[0.5] group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                    ></iframe>
                  </div>
                </div>

                <div className="mt-[1.5rem] md:mt-8 flex items-center justify-between">
                  <motion.a 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-[0.625rem] md:gap-3 px-[1.5rem] md:px-8 py-[0.875rem] md:py-4 bg-gray-900 hover:bg-primary-700 text-white rounded-full text-[0.75rem] md:text-[0.8125rem] font-bold transition-all shadow-lg hover:shadow-primary-200"
                  >
                    Petunjuk Arah
                    <div className="w-[1.25rem] md:w-6 h-[1.25rem] md:h-6 bg-white/20 rounded-full flex items-center justify-center">
                       <MapPin className="w-[0.75rem] md:w-3.5 h-[0.75rem] md:h-3.5" />
                    </div>
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default FounderPage;
