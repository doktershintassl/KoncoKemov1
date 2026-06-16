import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Plus, Edit2, Trash2, Loader2, FileVideo, BookOpen, Search, Pin } from "lucide-react";
import { Button } from "../../components/ui/Button";
import Swal from "sweetalert2";
import {
  getEdukasis,
  deleteEdukasi,
  togglePinEdukasi,
  Edukasi,
} from "../../lib/edukasi";
import { isYoutubeUrl, getYoutubeThumbnail } from "../../lib/videoUtils";

export function EdukasiManager() {
  const [edukasis, setEdukasis] = useState<Edukasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalData, setTotalData] = useState(0);
  
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 1000);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchEdukasiData = async (currentPage: number, append: boolean = false) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);

    try {
      const { data, total } = await getEdukasis({
        page: currentPage,
        limit: 25,
        searchQuery: debouncedSearch,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        clientSide: false
      });
      
      setTotalData(total);
      
      if (append) {
        setEdukasis(prev => [...prev, ...data]);
      } else {
        setEdukasis(data || []);
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
    fetchEdukasiData(1, false);
  }, [debouncedSearch, startDate, endDate]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchEdukasiData(nextPage, true);
  };

  const handleTogglePin = async (item: Edukasi) => {
    try {
      await togglePinEdukasi(item.id, item.is_pinned || false);
      // Refresh list to maintain correct pinned visual and limits
      setPage(1);
      fetchEdukasiData(1, false);
    } catch (error: any) {
      Swal.fire({
        title: "Perhatian",
        text: error.message || "Gagal mengatur status pin.",
        icon: "warning",
      });
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Materi ini akan dihapus secara permanen!",
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
        await deleteEdukasi(id);
        const updated = edukasis.filter((e) => e.id !== id);
        setEdukasis(updated);
        setTotalData(prev => Math.max(0, prev - 1));
        Swal.fire({
          title: "Terhapus!",
          text: "Materi telah berhasil dihapus.",
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
          <h2 className="font-display font-bold text-[1.5rem]">Manajemen Edukasi</h2>
          <p className="text-gray-500 text-[0.875rem] mt-1">
            Kelola materi literasi, panduan medis, dan video edukasi.
          </p>
        </div>
        <Button
          onClick={() => navigate("/admin/edukasi/new")}
          className="flex items-center gap-2 text-sm px-6 py-2.5 rounded-full font-bold shadow-lg shadow-primary-200"
        >
          <Plus className="w-4 h-4" /> TAMBAH MATERI
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="relative w-full md:w-96 shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Cari materi edukasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all text-sm font-medium"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all text-sm font-medium flex-1 md:flex-none"
              />
              <span className="text-gray-400">-</span>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all text-sm font-medium flex-1 md:flex-none"
              />
            </div>
          </div>
          <div className="text-[11px] shrink-0 font-black text-gray-400 uppercase tracking-widest bg-white px-4 py-1.5 rounded-full border border-gray-100 self-start md:self-auto">
            {totalData} MATERI
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="hidden md:grid grid-cols-[40px_120px_1fr_120px_160px] gap-4 bg-gray-50 border-b border-gray-100 text-[0.7rem] font-black uppercase tracking-widest text-gray-400 p-6 items-center">
            <div className="text-center">#</div>
            <div>MEDIA</div>
            <div>DETAIL MATERI</div>
            <div>STATUS</div>
            <div className="text-right">AKSI</div>
          </div>
          
          <div className="text-sm">
            {loading ? (
              <div className="p-12 text-center text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
                <p className="font-bold">Memuat data...</p>
              </div>
            ) : edukasis.length === 0 ? (
              <div className="p-12 text-center text-gray-500 uppercase tracking-widest text-xs font-bold">
                {debouncedSearch || startDate || endDate ? "Tidak ada hasil pencarian." : "Belum ada materi edukasi."}
              </div>
            ) : (
              <div className="flex flex-col w-full">
                {edukasis.map((item, idx) => {
                   const isVideo = item.media_type === 'video' || isYoutubeUrl(item.media_url);
                   const thumbnail = isVideo ? getYoutubeThumbnail(item.media_url) : item.media_url;
                   const targetDate = item.publish_datetime ? new Date(item.publish_datetime) : new Date(item.created_at!);
                   const isPublished = targetDate.getTime() <= new Date().getTime();

                   return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid grid-cols-1 md:grid-cols-[40px_120px_1fr_120px_160px] gap-4 p-6 border-b border-gray-50 last:border-0 hover:bg-gray-50 items-center bg-white transition-colors"
                    >
                      <div className="hidden md:flex justify-center text-gray-300 font-mono text-xs font-bold">
                        {(idx + 1 + (page - 1) * 25).toString().padStart(2, '0')}
                      </div>
                      
                      <div className="relative group/media">
                        {thumbnail ? (
                          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100 shadow-md">
                            <img
                              src={thumbnail}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                            {isVideo && (
                               <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                  <FileVideo className="w-6 h-6 text-white" />
                               </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                            <BookOpen className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      <div className="font-bold text-gray-900 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                           <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider shrink-0 ${isVideo ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                             {isVideo ? 'Video' : 'Artikel'}
                           </span>
                           {item.topic && (
                             <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 bg-primary-50 text-primary-600 border border-primary-100">
                               {item.topic}
                             </span>
                           )}
                        </div>
                        <p className="text-[1.1rem] line-clamp-1 text-primary-900 mt-1" title={item.title}>{item.title}</p>
                        <p className="text-sm text-gray-400 font-medium line-clamp-1 italic mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className={`inline-flex w-fit text-[0.625rem] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {isPublished ? 'Published' : 'Waiting'}
                        </span>
                        <span className="text-[0.7rem] text-gray-400 mt-1 font-mono">
                          {targetDate.toLocaleString('id-ID')}
                        </span>
                      </div>

                      <div className="flex justify-end gap-2 md:justify-end shrink-0">
                        <button
                          onClick={() => handleTogglePin(item)}
                          className={`p-3 rounded-xl transition-all shadow-sm ${item.is_pinned ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' : 'bg-gray-50 text-gray-400 hover:bg-yellow-50 hover:text-yellow-600'}`}
                          title={item.is_pinned ? "Lepas Pin" : "Pin ke Atas"}
                        >
                          <Pin className={`w-4 h-4 ${item.is_pinned ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/edukasi/${item.id}`)}
                          className="p-3 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                   );
                })}
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
