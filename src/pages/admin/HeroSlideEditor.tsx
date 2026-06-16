import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Image as ImageIcon, Loader2, Info, Replace } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "../../components/ui/Button";
import { getHeroSlides, saveHeroSlide, HeroSlide } from "../../lib/heroSlides";
import { convertToLh3Url } from "../../lib/gdriveUtils";

const TITLE_MAX_LENGTH = 60;
const SUBTITLE_MAX_LENGTH = 150;

export function HeroSlideEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id;

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<Omit<HeroSlide, 'id'>>({
    title: "",
    subtitle: "",
    image: "",
    cta: "Selengkapnya",
    ctaLink: "",
    order_index: 0
  });

  useEffect(() => {
    const fetchSlide = async () => {
      if (!isNew && id) {
        setIsLoading(true);
        try {
          const slides = await getHeroSlides();
          const existingSlide = slides.find(s => s.id === id);
          if (existingSlide) {
            setFormData({
              title: existingSlide.title,
              subtitle: existingSlide.subtitle,
              image: existingSlide.image,
              cta: existingSlide.cta,
              ctaLink: existingSlide.ctaLink || "",
              order_index: existingSlide.order_index || 0
            });
          } else {
            navigate('/admin/hero-slides');
          }
        } catch (error) {
          console.error(error);
          navigate('/admin/hero-slides');
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchSlide();
  }, [id, isNew, navigate]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (isNew) {
        await saveHeroSlide(formData);
      } else {
        await saveHeroSlide(formData, id);
      }
      navigate('/admin/hero-slides');
    } catch (error) {
      console.error("Gagal menyimpan slide:", error);
      alert("Gagal menyimpan. Pastikan konfigurasi database Supabase sudah benar.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary-500" />
        <p>Memuat detil slide...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/hero-slides')}
          className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-display font-bold text-2xl">{isNew ? 'Tambah Slide' : 'Edit Slide'}</h2>
          <p className="text-gray-500 text-sm mt-1">Kelola tampilan slide dengan live preview.</p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* Kolom Simulasi (Preview) */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider pl-2">Live Preview</h3>
          
          <div className="relative rounded-3xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100 w-full min-h-[500px] md:min-h-0 md:aspect-[24/10] flex items-center justify-center isolate">
            {formData.image ? (
              <img src={formData.image} alt="Preview Background" className="absolute inset-0 w-full h-full object-cover object-[80%_center] md:object-center z-0" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-100 z-0">
                <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                <span className="text-sm">Tidak ada gambar</span>
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent z-10" />
            
            <div className="relative z-20 w-full px-8 py-10 md:px-16 md:py-20 max-w-7xl mx-auto">
              <motion.div
                key={`${formData.title}-${formData.subtitle}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl"
              >
                <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight mb-4 md:mb-6 break-words">
                  {formData.title || "Judul Slide Akan Tampil Di Sini"}
                </h1>
                <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8 leading-relaxed break-words">
                  {formData.subtitle || "Sub-judul slide yang mendeskripsikan secara singkat tampilan untuk pengunjung website nantinya."}
                </p>
                
                <div className="flex">
                  <Button className="bg-primary-600 pointer-events-none text-white rounded-full px-6 py-2.5 shadow-lg shadow-primary-500/30 text-sm md:text-base md:px-8 md:py-3.5">
                    {formData.cta || "Klik Disini"}
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Kolom Editor */}
        <div className="space-y-8 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-1 md:col-span-2">
              <div className="flex justify-between items-end">
                <label className="text-sm font-medium text-gray-700">Judul Slide</label>
                <span className={`text-xs ${formData.title.length > TITLE_MAX_LENGTH ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                  {formData.title.length} / {TITLE_MAX_LENGTH}
                </span>
              </div>
              <input
                type="text"
                className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 focus:bg-white transition-colors focus:ring-2 focus:outline-none ${formData.title.length > TITLE_MAX_LENGTH ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 focus:ring-primary-500/20 focus:border-primary-500'}`}
                placeholder="Masukkan judul (maks. 60 karakter)"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2 col-span-1 md:col-span-2">
              <div className="flex justify-between items-end">
                <label className="text-sm font-medium text-gray-700">Sub-judul Slide</label>
                <span className={`text-xs ${formData.subtitle.length > SUBTITLE_MAX_LENGTH ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                  {formData.subtitle.length} / {SUBTITLE_MAX_LENGTH}
                </span>
              </div>
              <textarea
                className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 focus:bg-white transition-colors focus:ring-2 focus:outline-none resize-none h-28 ${formData.subtitle.length > SUBTITLE_MAX_LENGTH ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 focus:ring-primary-500/20 focus:border-primary-500'}`}
                placeholder="Masukkan deskripsi singkat slide (maks. 150 karakter)"
                value={formData.subtitle}
                onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Teks Tombol (CTA)</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white transition-colors focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none"
                placeholder="Cth: Cek Diri Sekarang"
                value={formData.cta}
                onChange={(e) => setFormData(prev => ({ ...prev, cta: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Link Tujuan CTA (URL)</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white transition-colors focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none"
                placeholder="Cth: /cerita-konco/id, https://link.com, atau #cek-mandiri"
                value={formData.ctaLink || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, ctaLink: e.target.value }))}
              />
            </div>

            <div className="space-y-4 col-span-1 md:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-sm font-medium text-gray-700">URL Gambar</label>
              </div>
              
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white transition-colors focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none"
                  placeholder="Paste URL gambar atau link Google Drive di sini..."
                  value={formData.image}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Auto-convert Google Drive links
                    if (val.includes('drive.google.com')) {
                      setFormData(prev => ({ ...prev, image: convertToLh3Url(val) }));
                    } else {
                      setFormData(prev => ({ ...prev, image: val }));
                    }
                  }}
                />
                
                <div className="bg-primary-50/50 border border-primary-100 rounded-2xl p-5 flex gap-4 text-sm text-primary-800">
                  <Info className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="font-bold text-primary-900">Optimal Banner 1920x800 px (21:9)</p>
                    <p className="text-primary-700/80 leading-relaxed">
                      Sistem akan memfokuskan pemotongan ke <strong>area kanan gambar</strong> untuk tampilan seluler. Pastikan objek visual utama berada di kanan, karena area kiri akan memuat teks judul slide.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            <Button 
              onClick={handleSave} 
              disabled={isSaving || formData.title.length > TITLE_MAX_LENGTH || formData.subtitle.length > SUBTITLE_MAX_LENGTH || !formData.title}
              className="w-full sm:w-auto px-8 flex justify-center items-center gap-2 py-3.5 ml-auto"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSaving ? 'Menyimpan...' : 'Simpan Slide'}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
