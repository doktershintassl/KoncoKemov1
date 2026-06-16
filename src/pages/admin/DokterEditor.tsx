import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Info, Plus, Trash2, Phone, Hospital, User, MapPin, ImageIcon } from "lucide-react";
import CreatableSelect from 'react-select/creatable';
import { Button } from "../../components/ui/Button";
import { getDokterById, saveDokter, getDokterFormMetadata, Dokter, DokterContact, DokterPractice, PracticeMetadata } from "../../lib/dokter";
import { convertToLh3Url } from "../../lib/gdriveUtils";

const customSelectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    minHeight: '48px', // Equivalent to py-3
    borderRadius: '0.75rem', // rounded-xl
    border: state.isFocused ? '1px solid #a855f7' : '1px solid #e5e7eb',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(168, 85, 247, 0.1)' : 'none',
    backgroundColor: 'rgba(249, 250, 251, 0.5)',
    transition: 'all 0.2s',
  })
};

const DokterEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [metadata, setMetadata] = useState<{
    specializations: string[];
    cities: string[];
    provinces: string[];
    practices: Record<string, PracticeMetadata>;
  }>({ specializations: [], cities: [], provinces: [], practices: {} });
  
  const [formData, setFormData] = useState<Omit<Dokter, 'id' | 'created_at'>>({
    name: "",
    specialization: "",
    provinsi: "",
    kota: "",
    practices: [
      {
        workplace: "",
        address: "",
        contacts: [{ label: "Whatsapp", value: "" }]
      }
    ],
    image_url: ""
  });

  useEffect(() => {
    async function init() {
      const meta = await getDokterFormMetadata();
      setMetadata(meta);

      if (id) {
        try {
          const data = await getDokterById(id as string);
          if (data) {
            setFormData({
              name: data.name,
              specialization: data.specialization,
              provinsi: data.provinsi || "",
              kota: data.kota || "",
              practices: data.practices || [{ workplace: "", address: "", contacts: [{ label: "Whatsapp", value: "" }] }],
              image_url: data.image_url || ""
            });
          }
        } catch (error) {
          console.error("Error loading doctor:", error);
          alert("Gagal memuat data dokter");
        }
      }
      setLoading(false);
    }
    init();
  }, [id]);

  const handleAddPractice = () => {
    setFormData({
      ...formData,
      practices: [...formData.practices, { workplace: "", address: "", contacts: [{ label: "Whatsapp", value: "" }] }]
    });
  };

  const handleRemovePractice = (index: number) => {
    const newPractices = [...formData.practices];
    newPractices.splice(index, 1);
    setFormData({ ...formData, practices: newPractices });
  };

  const handlePracticeChange = (index: number, field: keyof DokterPractice, value: any) => {
    const newPractices = [...formData.practices];
    newPractices[index] = { ...newPractices[index], [field]: value };
    setFormData({ ...formData, practices: newPractices });
  };

  const handleAddContact = (pIdx: number) => {
    const newPractices = [...formData.practices];
    newPractices[pIdx].contacts = [...newPractices[pIdx].contacts, { label: "Whatsapp", value: "" }];
    setFormData({ ...formData, practices: newPractices });
  };

  const handleRemoveContact = (pIdx: number, cIdx: number) => {
    const newPractices = [...formData.practices];
    newPractices[pIdx].contacts.splice(cIdx, 1);
    setFormData({ ...formData, practices: newPractices });
  };

  const handleContactChange = (pIdx: number, cIdx: number, field: keyof DokterContact, value: string) => {
    const newPractices = [...formData.practices];
    newPractices[pIdx].contacts[cIdx][field] = value;
    setFormData({ ...formData, practices: newPractices });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.specialization || formData.practices.length === 0) {
      alert("Harap lengkapi Nama, Spesialisasi, dan minimal satu Lokasi Praktik.");
      return;
    }

    setIsSaving(true);
    try {
      const processedImageUrl = formData.image_url ? convertToLh3Url(formData.image_url) : "";
      
      await saveDokter({
        ...formData,
        image_url: processedImageUrl
      }, id);
      
      navigate("/admin/dokter");
    } catch (error) {
      console.error("Error saving doctor:", error);
      alert("Gagal menyimpan data dokter");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
        <p className="text-gray-500 font-medium">Memuat editor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/dokter')}
          className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-display font-bold text-2xl">
            {id ? "Edit Data Dokter" : "Tambah Dokter Baru"}
          </h2>
          <p className="text-gray-500 text-sm mt-1">Silakan lengkapi informasi profesional tenaga medis dan lokasi praktik.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Identitas Dokter */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3 border-b border-gray-50 pb-4 -mx-2">
              <span className="w-8 h-8 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center">
                 <User className="w-4 h-4" />
              </span>
              Identitas Dokter
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nama Lengkap & Gelar</label>
                <input 
                  type="text"
                  placeholder="Contoh: dr. Budi Santoso, Sp.B(K)Onk"
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Spesialisasi</label>
                  <CreatableSelect
                    isClearable
                    options={metadata.specializations.map(s => ({ value: s, label: s }))}
                    value={formData.specialization ? { value: formData.specialization, label: formData.specialization } : null}
                    onChange={(val) => setFormData({...formData, specialization: val?.value || ""})}
                    placeholder="Pilih atau ketik baru..."
                    styles={customSelectStyles}
                    className="text-sm font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Kota</label>
                  <CreatableSelect
                    isClearable
                    options={metadata.cities.map(c => ({ value: c, label: c }))}
                    value={formData.kota ? { value: formData.kota, label: formData.kota } : null}
                    onChange={(val) => setFormData({...formData, kota: val?.value || ""})}
                    placeholder="Pilih atau ketik baru..."
                    styles={customSelectStyles}
                    className="text-sm font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Provinsi</label>
                  <CreatableSelect
                    isClearable
                    options={metadata.provinces.map(p => ({ value: p, label: p }))}
                    value={formData.provinsi ? { value: formData.provinsi, label: formData.provinsi } : null}
                    onChange={(val) => setFormData({...formData, provinsi: val?.value || ""})}
                    placeholder="Pilih atau ketik baru..."
                    styles={customSelectStyles}
                    className="text-sm font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Daftar Lokasi Praktik */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
               <h3 className="font-display font-bold text-xl text-gray-900">Daftar Lokasi Praktik</h3>
               <button 
                onClick={handleAddPractice}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full text-xs font-bold transition-all shadow-lg shadow-primary-900/10"
               >
                <Plus className="w-4 h-4" /> Tambah Lokasi
               </button>
            </div>

            {formData.practices.map((practice, pIdx) => (
              <div key={pIdx} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden border-l-[6px] border-l-primary-500">
                <div className="p-6 md:p-8 space-y-6">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center font-bold">
                           {pIdx + 1}
                        </div>
                        <h4 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Lokasi Praktik {pIdx + 1}</h4>
                     </div>
                     {formData.practices.length > 1 && (
                       <button 
                        onClick={() => handleRemovePractice(pIdx)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                       >
                        <Trash2 className="w-5 h-5" />
                       </button>
                     )}
                  </div>

                  <div className="grid grid-cols-1 gap-5">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1">Nama Rumah Sakit / Klinik</label>
                      <CreatableSelect
                        isClearable
                        options={Object.keys(metadata.practices).map(w => ({ value: w, label: w }))}
                        value={practice.workplace ? { value: practice.workplace, label: practice.workplace } : null}
                        onChange={(val) => {
                          const newWorkplace = val?.value || "";
                          if (metadata.practices[newWorkplace]) {
                            const pData = metadata.practices[newWorkplace];
                            const newPractices = [...formData.practices];
                            newPractices[pIdx] = {
                              ...newPractices[pIdx],
                              workplace: newWorkplace,
                              address: pData.address,
                              contacts: pData.contacts && pData.contacts.length > 0 ? pData.contacts : [{ label: "Whatsapp", value: "" }]
                            };
                            setFormData({ ...formData, practices: newPractices });
                          } else {
                            handlePracticeChange(pIdx, 'workplace', newWorkplace);
                          }
                        }}
                        placeholder="Pilih dari database atau ketik nama baru..."
                        styles={{
                            ...customSelectStyles,
                            control: (base: any, state: any) => ({
                                ...customSelectStyles.control(base, state),
                                minHeight: '44px',
                            })
                        }}
                        className="text-sm font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1">Alamat Lengkap</label>
                      <textarea 
                        rows={2}
                        placeholder="Tuliskan alamat lengkap..."
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:border-primary-500 transition-all font-medium resize-none text-sm"
                        value={practice.address}
                        onChange={(e) => handlePracticeChange(pIdx, 'address', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1">Kontak Lokasi</label>
                       <button 
                        onClick={() => handleAddContact(pIdx)}
                        className="text-xs font-bold text-primary-600 hover:underline"
                       >+ Tambah Nomor</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {practice.contacts.map((contact, cIdx) => (
                        <div key={cIdx} className="flex gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-100 group">
                           <div className="flex-1 space-y-1">
                              <input 
                                type="text"
                                placeholder="WhatsApp"
                                className="w-full bg-transparent border-none outline-none text-[10px] font-bold text-gray-400 uppercase tracking-widest p-0 focus:ring-0"
                                value={contact.label}
                                onChange={(e) => handleContactChange(pIdx, cIdx, 'label', e.target.value)}
                              />
                              <input 
                                type="text"
                                placeholder="Nomor HP"
                                className="w-full bg-transparent border-none outline-none text-sm font-bold text-gray-900 p-0 focus:ring-0"
                                value={contact.value}
                                onChange={(e) => handleContactChange(pIdx, cIdx, 'value', e.target.value)}
                              />
                           </div>
                           <button 
                            onClick={() => handleRemoveContact(pIdx, cIdx)}
                            disabled={practice.contacts.length <= 1}
                            className="p-1 text-gray-300 hover:text-red-500 disabled:opacity-0"
                           >
                            <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-3 border-b border-gray-50 pb-4 -mx-2">
              <span className="w-8 h-8 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center">
                 <ImageIcon className="w-4 h-4" />
              </span>
              Foto Profil
            </h3>
            
            <div className="space-y-4">
              <div className="w-full aspect-square bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 overflow-hidden group relative">
                {formData.image_url ? (
                  <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <User className="w-10 h-10 mb-2 opacity-30" />
                    <span className="text-[10px] font-bold text-center px-4 uppercase tracking-widest opacity-50">Upload Link Foto</span>
                  </>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Link Foto (URL)</label>
                <input 
                  type="text"
                  placeholder="Paste link gambar..."
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:border-primary-500 transition-all text-xs"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-4">
            <Button 
                onClick={handleSave} 
                disabled={isSaving || !formData.name || formData.practices.length === 0}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-2xl py-4 shadow-xl shadow-primary-900/10 flex items-center justify-center gap-2 transition-all font-bold"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Simpan Data
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/admin/dokter')}
                className="w-full text-gray-500 hover:text-gray-900 font-bold py-3 text-sm h-12"
              >
                Batal
              </Button>
          </div>

          <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-3 items-start">
            <Info className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-900 leading-relaxed font-medium">
              Setiap lokasi memiliki kontak masing-masing yang akan muncul di pop-up visitor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DokterEditor;
