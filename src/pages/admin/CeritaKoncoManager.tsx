import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, Reorder } from "motion/react";
import { Plus, Edit2, Trash2, Image as ImageIcon, Loader2, GripVertical } from "lucide-react";
import { Button } from "../../components/ui/Button";
import Swal from "sweetalert2";
import {
  getCeritaKoncos,
  deleteCeritaKonco,
  updateCeritaKoncoOrder,
  CeritaKonco,
} from "../../lib/ceritaKonco";

export function CeritaKoncoManager() {
  const [ceritas, setCeritas] = useState<CeritaKonco[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCerita = async () => {
    setLoading(true);
    try {
      const { data } = await getCeritaKoncos();
      setCeritas(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCerita();
  }, []);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Cerita ini akan dihapus secara permanen!",
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
        await deleteCeritaKonco(id);
        setCeritas(ceritas.filter((c) => c.id !== id));
        Swal.fire({
          title: "Terhapus!",
          text: "Cerita telah berhasil dihapus.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          heightAuto: false
        });
      } catch (error) {
        console.error("Gagal menghapus", error);
        Swal.fire({
          title: "Error!",
          text: "Gagal menghapus data.",
          icon: "error",
          heightAuto: false
        });
      }
    }
  };

  const handleReorder = (newCeritas: CeritaKonco[]) => {
    setCeritas(newCeritas);
  };

  const handleDragEnd = async () => {
    try {
      await updateCeritaKoncoOrder(ceritas.map(c => c.id));
    } catch (error) {
      console.error("Gagal menyimpan urutan baru", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl">Penata Cerita Konco</h2>
          <p className="text-gray-500 text-sm mt-1">
            Kelola daftar cerita inspiratif di halaman Cerita Konco.
          </p>
        </div>
        <Button
          onClick={() => navigate("/admin/cerita-konco/new")}
          className="flex items-center gap-2 text-sm px-6 py-2.5 rounded-full font-bold shadow-lg shadow-primary-200"
        >
          <Plus className="w-4 h-4" /> TAMBAH CERITA
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="overflow-hidden">
          <div className="hidden md:grid grid-cols-[40px_120px_200px_1fr_120px] gap-4 bg-gray-50 border-b border-gray-100 text-[0.7rem] font-black uppercase tracking-widest text-gray-400 p-6 items-center">
            <div>URUT</div>
            <div>GAMBAR</div>
            <div>NAMA PASIEN</div>
            <div>DETAIL CERITA</div>
            <div className="text-right">AKSI</div>
          </div>
          
          <div className="text-sm">
            {loading ? (
              <div className="p-12 text-center text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
                <p className="font-bold">Memuat data...</p>
              </div>
            ) : ceritas.length === 0 ? (
              <div className="p-12 text-center text-gray-500 uppercase tracking-widest text-xs font-bold">
                Belum ada cerita. Silakan tambah cerita baru.
              </div>
            ) : (
              <Reorder.Group 
                values={ceritas} 
                onReorder={handleReorder}
                className="flex flex-col w-full"
              >
                {ceritas.map((cerita) => (
                  <Reorder.Item
                    key={cerita.id}
                    value={cerita}
                    onDragEnd={handleDragEnd}
                    className="grid grid-cols-1 md:grid-cols-[40px_120px_200px_1fr_120px] gap-4 p-6 border-b border-gray-50 last:border-0 hover:bg-gray-50 items-center bg-white cursor-grab active:cursor-grabbing relative z-10 transition-colors"
                  >
                    <div className="hidden md:flex justify-center text-gray-300 group-hover:text-primary-400 transition-colors shrink-0">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    
                    <div className="shrink-0">
                      {cerita.thumbnail_image ? (
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 shrink-0 shadow-md border border-gray-100">
                          <img
                            src={cerita.thumbnail_image}
                            alt={cerita.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 shrink-0 border border-gray-100">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                       <p className="font-bold text-gray-900 truncate">{cerita.patient_name || '-'}</p>
                    </div>

                    <div className="min-w-0">
                      <p className="font-bold text-primary-900 text-[1rem] line-clamp-1 mb-0.5" title={cerita.title}>{cerita.title}</p>
                      <p className="text-xs text-gray-400 font-medium line-clamp-1 italic">
                        {cerita.subtitle_hook}
                      </p>
                    </div>

                    <div className="flex justify-end gap-3 md:justify-end shrink-0">
                      <button
                        onClick={() => navigate(`/admin/cerita-konco/${cerita.id}`)}
                        className="p-3 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cerita.id)}
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
