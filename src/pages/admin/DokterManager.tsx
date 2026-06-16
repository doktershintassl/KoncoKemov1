import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Plus, Edit2, Trash2, User, Loader2, Hospital, MapPin, Search, Star } from "lucide-react";
import { Button } from "../../components/ui/Button";
import Swal from "sweetalert2";
import { getDokters, deleteDokter, setDokterFavourite, Dokter } from "../../lib/dokter";

export default function DokterManager() {
  const [dokters, setDokters] = useState<Dokter[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalData, setTotalData] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 1500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchDoktersData = async (currentPage: number, append: boolean = false) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);

    try {
      const { data, total } = await getDokters({
        page: currentPage,
        limit: 25,
        searchQuery: debouncedSearch
      });
      
      setTotalData(total);
      
      if (append) {
        setDokters(prev => [...prev, ...data]);
      } else {
        setDokters(data || []);
      }
      
      setHasMore(data.length === 25);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchDoktersData(1, false);
  }, [debouncedSearch]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchDoktersData(nextPage, true);
  };

  const handleFavourite = async (id: string, name: string) => {
    try {
      await setDokterFavourite(id);
      const newDokters = dokters.map(d => ({
        ...d,
        is_favourite: d.id === id
      })).sort((a, b) => {
        if (a.is_favourite) return -1;
        if (b.is_favourite) return 1;
        return 0;
      });
      setDokters(newDokters);
      Swal.fire({
        title: "Berhasil!",
        text: `Dokter ${name} telah dijadikan rekomendasi utama.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        heightAuto: false
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error!",
        text: "Gagal mengatur rekomendasi dokter.",
        icon: "error",
        heightAuto: false
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: `Data dokter ${name} akan dihapus secara permanen!`,
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
        await deleteDokter(id);
        const newDokters = dokters.filter((d) => d.id !== id);
        setDokters(newDokters);
        setTotalData(prev => Math.max(0, prev - 1));
        Swal.fire({
          title: "Terhapus!",
          text: "Data dokter telah berhasil dihapus.",
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl">Manajemen Dokter Kemo</h2>
          <p className="text-gray-500 text-sm mt-1">
            Kelola daftar tenaga medis dan dokter spesialis pendamping.
          </p>
        </div>
        <Button
          onClick={() => navigate("/admin/dokter/new")}
          className="flex items-center gap-2 text-sm px-6 py-2.5 rounded-full font-bold shadow-lg shadow-primary-200"
        >
          <Plus className="w-4 h-4" /> TAMBAH DOKTER
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari dokter atau spesialisasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all text-sm font-medium"
            />
          </div>
          <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest bg-white px-4 py-1.5 rounded-full border border-gray-100">
            {totalData} DOKTER TERDAFTAR
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="hidden md:grid grid-cols-[40px_1fr_180px_220px_120px] gap-4 bg-gray-50 border-b border-gray-100 text-[0.7rem] font-black text-gray-400 uppercase tracking-widest p-6 items-center">
            <div className="text-center">#</div>
            <div>BIODATA DOKTER</div>
            <div>AREA</div>
            <div>LOKASI PRAKTIK UTAMA</div>
            <div className="text-right">AKSI</div>
          </div>
          
          <div className="text-sm">
            {loading ? (
              <div className="p-12 text-center text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
                <p className="font-bold">Memuat data tenaga medis...</p>
              </div>
            ) : dokters.length === 0 ? (
              <div className="p-12 text-center text-gray-500 uppercase tracking-widest text-xs font-bold">
                {debouncedSearch ? "Tidak ada hasil pencarian." : "Belum ada data dokter."}
              </div>
            ) : (
              <div className="flex flex-col w-full">
                {dokters.map((dokter, idx) => (
                  <motion.div
                    key={dokter.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-[40px_1fr_180px_220px_120px] gap-4 p-6 border-b border-gray-50 last:border-0 hover:bg-gray-50 items-center bg-white transition-colors"
                  >
                    <div className="hidden md:flex justify-center text-gray-300 font-mono text-xs font-bold">
                      {(idx + 1 + (page - 1) * 25).toString().padStart(2, '0')}
                    </div>
                    
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-primary-50 border border-primary-100 shrink-0 flex items-center justify-center text-primary-600 shadow-sm">
                        {dokter.image_url ? (
                          <img
                            src={dokter.image_url}
                            alt={dokter.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 opacity-40" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate uppercase text-sm tracking-tight mb-1">{dokter.name}</p>
                        <p className="text-[11px] font-black text-primary-600/70 uppercase tracking-wider truncate">
                          {dokter.specialization}
                        </p>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <p className="font-bold text-gray-700 truncate text-xs">{dokter.kota || "Kota tidak diatur"}</p>
                      <p className="text-[11px] text-gray-500 truncate mt-1">{dokter.provinsi || "Provinsi tidak diatur"}</p>
                    </div>

                    <div className="text-gray-500 text-xs min-w-0 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-gray-700">
                         <Hospital className="w-3.5 h-3.5 text-gray-400" />
                         <span className="truncate">{dokter.practices && dokter.practices[0] ? dokter.practices[0].workplace : "Kosong"}</span>
                      </div>
                      <div className="flex items-start gap-1.5 opacity-80 font-medium">
                         <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                         <span className="line-clamp-1 italic">{dokter.practices && dokter.practices[0] ? dokter.practices[0].address : "Alamat belum diatur"}</span>
                      </div>
                      {dokter.practices && dokter.practices.length > 1 && (
                        <div className="text-[10px] font-black text-primary-500 bg-primary-50 inline-block px-2.5 py-1 rounded-full">
                           +{dokter.practices.length - 1} LOKASI LAIN
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-3 md:justify-end">
                      <button
                        onClick={() => handleFavourite(dokter.id, dokter.name)}
                        className={`p-3 rounded-xl transition-all shadow-sm ${dokter.is_favourite ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-50 text-gray-400 hover:bg-yellow-50 hover:text-yellow-600'}`}
                        title="Jadikan Rekomendasi"
                      >
                        <Star className={`w-4 h-4 ${dokter.is_favourite ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/dokter/${dokter.id}`)}
                        className="p-3 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(dokter.id, dokter.name)}
                        className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            
            {hasMore && !loading && (
              <div className="p-6 border-t border-gray-50 text-center bg-gray-50/30">
                <Button 
                  variant="outline" 
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-8 py-2.5 text-sm font-bold rounded-full bg-white border-gray-200 text-gray-600 hover:text-primary-600 hover:border-primary-200"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                       <Loader2 className="w-4 h-4 animate-spin" /> MENGAMBIL DATA...
                    </span>
                  ) : (
                    "MUAT LEBIH BANYAK"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


