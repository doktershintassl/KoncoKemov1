import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, MapPin, Phone, User, X, Info, Loader2, Hospital, Plus, Star } from "lucide-react";
import { getDokters, Dokter } from "../lib/dokter";
import { Button } from "../components/ui/Button";
import { SearchableSelect } from "../components/ui/SearchableSelect";
import { SEO } from "../components/SEO";

export function KoncoDokter() {
  const [dokters, setDokters] = useState<Dokter[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [specialization, setSpecialization] = useState("Semua");
  const [kota, setKota] = useState("Semua");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedDokter, setSelectedDokter] = useState<Dokter | null>(null);
  const [specializations, setSpecializations] = useState<string[]>(["Semua"]);
  const [cities, setCities] = useState<string[]>(["Semua"]);

  useEffect(() => {
    async function loadFilters() {
      const { getSpecializations, getCities } = await import("../lib/dokter");
      const [specs, loadedCities] = await Promise.all([getSpecializations(), getCities()]);
      setSpecializations(["Semua", ...specs]);
      setCities(["Semua", ...loadedCities]);
    }
    loadFilters();
  }, []);

  useEffect(() => {
    if (searchQuery !== debouncedSearch) {
      setIsSearching(true);
    }
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setIsSearching(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, specialization, kota]);

  useEffect(() => {
    async function fetchData() {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const { data } = await getDokters({
          page,
          limit: 12,
          searchQuery: debouncedSearch,
          specialization,
          kota
        });

        if (page === 1) {
          setDokters(data);
        } else {
          setDokters(prev => {
            // Prevent duplicates when fetching next pages
            const newIds = new Set(prev.map(d => d.id));
            const uniqueNewData = data.filter(d => !newIds.has(d.id));
            return [...prev, ...uniqueNewData];
          });
        }
        
        setHasMore(data.length === 12);
      } catch (error) {
        console.error("Error loading doctors:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    }
    fetchData();
  }, [page, debouncedSearch, specialization, kota]);

  return (
    <main className="flex-1 w-full max-w-[80rem] mx-auto px-[0.75rem] sm:px-[1.5rem] lg:px-[3rem] pt-[1rem] pb-[2.5rem] md:pt-[2rem] md:pb-[5rem] lg:pt-[2.5rem] lg:pb-[6rem]">
      <SEO 
        title="Daftar Konco Dokter Kemo dan Onkologi" 
        description="Temukan profil, lokasi parktik, dan informasi kontak dari dokter spesialis onkologi dan hematologi terpercaya."
        url="https://koncokemo.com/dokter-kemo"
      />
      {/* Header Section */}
      <div className="max-w-[48rem] mb-[1.5rem] md:mb-[3.5rem]">
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[1.5rem] sm:text-[2rem] md:text-[2.75rem] font-display font-bold text-gray-900 tracking-tight leading-tight mb-[0.5rem] md:mb-[0.75rem]"
        >
          Konco Dokter
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-[0.875rem] sm:text-[1rem] md:text-[1.125rem] text-gray-600 leading-relaxed"
        >
          Direktori dokter yang siap menemani dan mendampingi perjalanan pengobatan Anda
        </motion.p>
      </div>

      {/* Search Bar & Filter */}
      <div className="mb-[2rem] md:mb-[4rem]">
        <div className="flex flex-col md:flex-row gap-[1rem] max-w-[64rem]">
          <div className="relative flex-1">
            {isSearching ? (
              <Loader2 className="absolute left-[0.75rem] md:left-[1rem] top-1/2 -translate-y-1/2 w-[1rem] md:w-[1.125rem] h-[1rem] md:h-[1.125rem] text-primary-500 animate-spin" />
            ) : (
              <Search className="absolute left-[0.75rem] md:left-[1rem] top-1/2 -translate-y-1/2 w-[1rem] md:w-[1.125rem] h-[1rem] md:h-[1.125rem] text-gray-400" />
            )}
            <input 
              type="text"
              placeholder="Cari nama, spesialisasi, rs, area..."
              className="w-full pl-[2.25rem] md:pl-[2.75rem] pr-[1rem] py-[0.75rem] md:py-[0.875rem] bg-white border border-gray-200 rounded-[0.75rem] md:rounded-[1rem] shadow-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-[0.875rem] md:text-[1rem]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="md:w-[16rem]">
            <SearchableSelect
              value={kota}
              onChange={setKota}
              options={cities}
              placeholder="Semua Kota"
              searchPlaceholder="Cari kota..."
            />
          </div>
          <div className="md:w-[16rem]">
            <SearchableSelect
              value={specialization}
              onChange={setSpecialization}
              options={specializations}
              placeholder="Semua Spesialisasi"
              searchPlaceholder="Cari spesialisasi..."
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-[3rem] md:py-[5rem] text-gray-500">
          <Loader2 className="w-[2rem] md:w-[2.5rem] h-[2rem] md:h-[2.5rem] animate-spin text-primary-500" />
        </div>
      ) : dokters.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-[1.25rem] md:rounded-[2rem] p-[2rem] md:p-[3rem] text-center text-gray-500 shadow-sm text-[0.875rem] md:text-[1rem]">
          Tidak dapat menemukan dokter yang sesuai dengan pencarian Anda.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1rem] md:gap-[2rem]">
            {dokters.map((dokter, index) => {
              const isFavourite = index === 0 && dokter.is_favourite;

              return (
              <motion.div
                key={dokter.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (index % 12) * 0.05 }}
                onClick={() => setSelectedDokter(dokter)}
                className={`group cursor-pointer relative p-[1px] md:p-[2px] shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 block ${isFavourite ? 'md:col-span-2 lg:col-span-3 rounded-[1.5rem] md:rounded-[2rem]' : 'rounded-[1rem] md:rounded-[1.5rem]'}`}
              >
                {/* Default static border background that disappears on hover */}
                <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 bg-gray-100 group-hover:opacity-0 ${isFavourite ? 'rounded-[1.5rem] md:rounded-[2rem]' : 'rounded-[1rem] md:rounded-[1.5rem]'}`} />

                {/* Rotating Border Hover Effect */}
                <div className={`absolute inset-0 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isFavourite ? 'rounded-[1.5rem] md:rounded-[2rem]' : 'rounded-[1rem] md:rounded-[1.5rem]'}`}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                    className="greeting-bubble-line"
                  />
                </div>

                <div className={`relative z-10 h-full flex flex-col p-[1.125rem] md:p-[2rem] bg-white ${isFavourite ? 'rounded-[calc(1.5rem-2px)] md:rounded-[calc(2rem-2px)] md:flex-row md:items-center gap-[1.5rem] md:gap-[3rem]' : 'rounded-[calc(1rem-2px)] md:rounded-[calc(1.5rem-2px)]'}`}>
                  {isFavourite && (
                     <div className="absolute z-10 top-[1rem] right-[1rem] md:top-[1.5rem] md:right-[1.5rem] bg-yellow-100 text-yellow-600 border border-yellow-200 px-[0.75rem] py-[0.25rem] rounded-full text-[0.625rem] md:text-[0.75rem] font-black uppercase tracking-widest flex items-center gap-[0.25rem]">
                        <Star className="w-[0.75rem] h-[0.75rem] fill-yellow-500 text-yellow-500" /> Rekomendasi
                     </div>
                  )}
                  <div className={`flex items-center gap-[0.875rem] md:gap-[1rem] mb-[1.25rem] md:mb-[1.5rem] ${isFavourite ? 'md:mb-0 md:w-1/3' : ''}`}>
                    <div className={`${isFavourite ? 'w-[4rem] h-[4rem] md:w-[6rem] md:h-[6rem]' : 'w-[3rem] h-[3rem] md:w-[3.5rem] md:h-[3.5rem]'} rounded-full bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300`}>
                      {dokter.image_url ? (
                        <img src={dokter.image_url} alt={dokter.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User className={`${isFavourite ? 'w-[2rem] h-[2rem] md:w-[3rem] md:h-[3rem]' : 'w-[1.25rem] h-[1.25rem] md:w-[1.5rem] md:h-[1.5rem]'}`} />
                      )}
                    </div>
                    <div>
                      <h3 className={`font-display font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 ${isFavourite ? 'text-[1.125rem] md:text-[1.5rem]' : 'text-[0.9375rem] md:text-[1rem]'}`}>{dokter.name}</h3>
                      <p className={`font-bold text-primary-600/70 uppercase tracking-widest mt-1 ${isFavourite ? 'text-[0.75rem] md:text-[0.8125rem]' : 'text-[0.65rem] md:text-[0.75rem]'}`}>{dokter.specialization}</p>
                      {(dokter.kota || dokter.provinsi) && (
                        <p className="text-[0.6875rem] md:text-[0.75rem] text-gray-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> {[dokter.kota, dokter.provinsi].filter(Boolean).join(', ')}</p>
                      )}
                    </div>
                  </div>

                  <div className={`space-y-[0.625rem] md:space-y-[0.75rem] ${isFavourite ? 'md:flex-1 md:border-l md:border-primary-100 md:pl-[3rem]' : 'flex-1'}`}>
                    <div className="flex items-start gap-[0.625rem] md:gap-[0.75rem] text-[0.8125rem] md:text-[0.875rem] text-gray-500">
                      <Hospital className="w-[0.875rem] md:w-[1rem] h-[0.875rem] md:h-[1rem] mt-0.5 flex-shrink-0 text-gray-400" />
                      <span className="line-clamp-1">{dokter.practices[0]?.workplace || "Lokasi tidak tersedia"}</span>
                    </div>
                    <div className="flex items-start gap-[0.625rem] md:gap-[0.75rem] text-[0.8125rem] md:text-[0.875rem] text-gray-500">
                      <MapPin className="w-[0.875rem] md:w-[1rem] h-[0.875rem] md:h-[1rem] mt-0.5 flex-shrink-0 text-gray-400" />
                      <span className="line-clamp-2">{dokter.practices[0]?.address || "Alamat tidak tersedia"}</span>
                    </div>
                    {dokter.practices.length > 1 && (
                      <div className="pt-1 md:pt-2 text-[0.6875rem] md:text-[0.75rem] font-bold text-primary-500 flex items-center gap-1">
                        <Plus className="w-[0.625rem] md:w-3 h-[0.625rem] md:h-3" /> {dokter.practices.length - 1} Lokasi Lainnya
                      </div>
                    )}
                  </div>

                  <div className={`mt-[1.25rem] md:mt-[1.5rem] pt-[1.25rem] md:pt-[1.5rem] border-t flex justify-end ${isFavourite ? 'border-primary-100/50 md:mt-0 md:pt-0 md:border-t-0 md:items-center' : 'border-gray-50'}`}>
                     <span className={`font-bold text-primary-600 group-hover:translate-x-1 transition-transform flex items-center gap-1 ${isFavourite ? 'text-[0.875rem] md:text-[1rem] uppercase tracking-widest' : 'text-[0.75rem] md:text-[0.8125rem]'}`}>
                        Detail <Info className="w-[0.75rem] md:w-[0.875rem] h-[0.75rem] md:h-[0.875rem]" />
                     </span>
                  </div>
                </div>
              </motion.div>
              );
            })}
          </div>

          {hasMore && (
            <div className="mt-[3rem] md:mt-[4rem] text-center">
              <Button 
                variant="outline" 
                onClick={() => setPage(p => p + 1)}
                disabled={loadingMore}
                className="rounded-full px-[2rem] py-[0.75rem] text-[0.875rem] font-bold"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Memuat...</span>
                ) : (
                  "Muat Lebih Banyak"
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modal Detail Dokter */}
      <AnimatePresence>
        {selectedDokter && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-[0.75rem] py-[1rem]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDokter(null)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-[42rem] bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <button 
                onClick={() => setSelectedDokter(null)}
                className="absolute top-[0.75rem] right-[0.75rem] md:top-[1.5rem] md:right-[1.5rem] p-[0.375rem] md:p-[0.5rem] rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors z-10"
              >
                <X className="w-[1.125rem] md:w-[1.25rem] h-[1.125rem] md:h-[1.25rem]" />
              </button>

              <div className="overflow-y-auto p-[1.25rem] md:p-[3rem]">
                <div className="flex flex-col items-center text-center mb-[1.5rem] md:mb-[2.5rem]">
                  <div className="w-[4rem] sm:w-[5rem] md:w-[6rem] h-[4rem] sm:h-[5rem] md:h-[6rem] rounded-full bg-primary-50 flex items-center justify-center text-primary-600 mb-[0.75rem] md:mb-[1.5rem] overflow-hidden shadow-inner">
                    {selectedDokter.image_url ? (
                      <img src={selectedDokter.image_url} alt={selectedDokter.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-[2rem] md:w-[3rem] h-[2rem] md:h-[3rem]" />
                    )}
                  </div>
                  <h2 className="text-[1.25rem] md:text-[1.75rem] font-display font-bold text-gray-900 mb-[0.25rem] leading-tight">{selectedDokter.name}</h2>
                  <p className="text-primary-600 font-bold uppercase tracking-[0.2em] text-[0.7rem] md:text-[0.8125rem]">{selectedDokter.specialization}</p>
                  {(selectedDokter.kota || selectedDokter.provinsi) && (
                    <p className="text-[0.75rem] md:text-[0.875rem] text-gray-500 mt-2 flex items-center justify-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400"/> {[selectedDokter.kota, selectedDokter.provinsi].filter(Boolean).join(', ')}</p>
                  )}
                </div>

                <div className="space-y-[1.5rem] md:space-y-[2.5rem]">
                  {selectedDokter.practices.map((practice, pIdx) => (
                    <div key={pIdx} className="bg-gray-50/50 rounded-[0.875rem] md:rounded-[1.5rem] border border-gray-100 overflow-hidden">
                      <div className="px-[0.875rem] py-[0.75rem] md:px-[1.5rem] md:py-[1.25rem] bg-primary-50/50 border-b border-primary-100/50 flex items-center gap-[0.625rem] md:gap-[0.75rem]">
                         <div className="w-[1.75rem] h-[1.75rem] md:w-[2rem] md:h-[2rem] bg-white rounded-lg flex items-center justify-center text-primary-600 shadow-sm">
                            <Hospital className="w-[0.875rem] md:w-[1rem] h-[0.875rem] md:h-[1rem]" />
                         </div>
                         <h4 className="text-[0.875rem] md:text-[0.9375rem] font-bold text-gray-900 leading-tight">{practice.workplace}</h4>
                      </div>
                      <div className="p-[0.875rem] md:p-[1.5rem] space-y-[1rem] md:space-y-[1.5rem]">
                        <div className="flex items-start gap-[0.625rem] md:gap-[0.75rem]">
                          <MapPin className="w-[1rem] md:w-[1.125rem] h-[1rem] md:h-[1.125rem] mt-0.5 text-gray-400" />
                          <span className="text-[0.875rem] md:text-[0.9375rem] text-gray-600 leading-relaxed font-medium">{practice.address}</span>
                        </div>

                        {practice.contacts && practice.contacts.length > 0 && (
                          <div>
                            <div className="flex items-center gap-[0.5rem] mb-[0.75rem] md:mb-[1rem]">
                               <div className="h-px flex-1 bg-gray-200"></div>
                               <span className="text-[0.6rem] md:text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Hubungi Kami</span>
                               <div className="h-px flex-1 bg-gray-200"></div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[0.625rem] md:gap-[0.75rem]">
                              {practice.contacts.map((contact, cIdx) => (
                                <a 
                                  key={cIdx}
                                  href={contact.value.startsWith('http') ? contact.value : `tel:${contact.value}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex flex-col p-[0.75rem] md:p-[1rem] bg-white border border-gray-100 rounded-[1rem] md:rounded-[1.25rem] hover:border-primary-200 hover:bg-primary-50 group transition-all"
                                >
                                  <span className="text-[0.625rem] md:text-[0.6875rem] font-bold text-gray-400 uppercase tracking-widest mb-[0.125rem] md:mb-[0.25rem]">{contact.label}</span>
                                  <div className="flex items-center justify-between gap-[0.5rem]">
                                     <span className="text-[0.8125rem] md:text-[0.875rem] font-bold text-primary-600 group-hover:text-primary-700 break-words line-clamp-1">{contact.value}</span>
                                     <Phone className="w-[0.75rem] md:w-[0.875rem] h-[0.75rem] md:h-[0.875rem] text-primary-300 group-hover:text-primary-500" />
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-[2rem] md:mt-[3rem]">
                  <Button 
                    className="w-full bg-gray-900 hover:bg-black text-white rounded-[0.75rem] md:rounded-xl py-[0.875rem] md:py-[1.125rem] font-bold shadow-xl shadow-gray-900/10 text-[0.9375rem] md:text-[1rem]"
                    onClick={() => setSelectedDokter(null)}
                  >
                    Tutup Detail
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}
