import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, Reorder } from "motion/react";
import { Plus, Edit2, Trash2, Image as ImageIcon, Loader2, GripVertical } from "lucide-react";
import { Button } from "../../components/ui/Button";
import Swal from "sweetalert2";
import {
  getHeroSlides,
  deleteHeroSlide,
  updateHeroSlidesOrder,
  HeroSlide,
} from "../../lib/heroSlides";

export function HeroSlidesManager() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const data = await getHeroSlides();
      setSlides(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Slide ini akan dihapus secara permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      scrollbarPadding: false,
      heightAuto: false
    });

    if (result.isConfirmed) {
      try {
        await deleteHeroSlide(id);
        const updatedSlides = slides.filter((slide) => slide.id !== id);
        setSlides(updatedSlides);
        Swal.fire({
          title: "Terhapus!",
          text: "Slide telah berhasil dihapus.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          heightAuto: false
        });
      } catch (error) {
        console.error("Gagal menghapus slide", error);
        Swal.fire({
          title: "Error!",
          text: "Gagal menghapus data.",
          icon: "error",
          heightAuto: false
        });
      }
    }
  };

  const handleReorder = (newSlides: HeroSlide[]) => {
    setSlides(newSlides);
  };

  const handleDragEnd = async () => {
    try {
      await updateHeroSlidesOrder(slides.map(s => s.id));
    } catch (error) {
      console.error("Gagal menyimpan urutan baru", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl">Penata Hero Slide</h2>
          <p className="text-gray-500 text-sm mt-1">
            Kelola gambar, judul, dan sub-judul slider beranda.
          </p>
        </div>
        <Button
          onClick={() => navigate("/admin/hero-slides/new")}
          className="flex items-center gap-2 text-sm px-6 py-2.5 rounded-full font-bold shadow-lg shadow-primary-200"
        >
          <Plus className="w-4 h-4" /> TAMBAH SLIDE
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="overflow-hidden">
          <div className="hidden md:grid grid-cols-[40px_120px_1fr_1fr_120px] gap-4 bg-gray-50 border-b border-gray-100 text-[0.7rem] font-black uppercase tracking-widest text-gray-400 p-6 items-center">
            <div>URUT</div>
            <div>GAMBAR</div>
            <div>JUDUL SLIDE</div>
            <div>CTA</div>
            <div className="text-right">AKSI</div>
          </div>
          
          <div className="text-sm">
            {loading ? (
              <div className="p-12 text-center text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
                <p className="font-bold">Memuat data...</p>
              </div>
            ) : slides.length === 0 ? (
              <div className="p-12 text-center text-gray-500 uppercase tracking-widest text-xs font-bold">
                Belum ada slide. Silakan tambah slide baru.
              </div>
            ) : (
              <Reorder.Group 
                values={slides} 
                onReorder={handleReorder}
                className="flex flex-col w-full"
              >
                {slides.map((slide) => (
                  <Reorder.Item
                    key={slide.id}
                    value={slide}
                    onDragEnd={handleDragEnd}
                    className="grid grid-cols-1 md:grid-cols-[40px_120px_1fr_1fr_120px] gap-4 p-6 border-b border-gray-50 last:border-0 hover:bg-gray-50 items-center bg-white cursor-grab active:cursor-grabbing relative z-10 transition-colors"
                  >
                    <div className="hidden md:flex justify-center text-gray-300 group-hover:text-primary-400 transition-colors">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    
                    <div>
                      {slide.image ? (
                        <div className="w-24 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 shadow-md">
                          <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="font-bold text-gray-900 min-w-0">
                      <p className="text-[1rem] truncate mb-1">{slide.title}</p>
                      <p className="text-xs text-gray-400 font-medium truncate italic">
                        {slide.subtitle}
                      </p>
                    </div>

                    <div className="text-gray-500 min-w-0">
                      <p className="truncate font-bold text-sm text-gray-700">{slide.cta}</p>
                      <p className="text-[10px] text-primary-500 truncate font-black mt-1 uppercase tracking-tighter">
                        {slide.ctaLink || "-"}
                      </p>
                    </div>

                    <div className="flex justify-end gap-3 md:justify-end">
                      <button
                        onClick={() => navigate(`/admin/hero-slides/${slide.id}`)}
                        className="p-3 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(slide.id)}
                        className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
