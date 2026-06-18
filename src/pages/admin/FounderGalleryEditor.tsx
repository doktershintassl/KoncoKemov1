import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Image as ImageIcon, Loader2, Info } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "../../components/ui/Button";
import { getFounderGallery, saveFounderGalleryImage, FounderGalleryImage } from "../../lib/founderGallery";
import { convertToLh3Url } from "../../lib/gdriveUtils";

export default function FounderGalleryEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id;

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<Omit<FounderGalleryImage, 'id'>>({
    image_url: "",
    description: "",
    order_index: 0
  });

  useEffect(() => {
    const fetchImage = async () => {
      if (!isNew && id) {
        setIsLoading(true);
        try {
          const images = await getFounderGallery();
          const existingImg = images.find(img => img.id === id);
          if (existingImg) {
            setFormData({
              image_url: existingImg.image_url,
              description: existingImg.description || "",
              order_index: existingImg.order_index || 0
            });
          } else {
            navigate('/admin/founder-gallery');
          }
        } catch (error) {
          console.error(error);
          navigate('/admin/founder-gallery');
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchImage();
  }, [id, isNew, navigate]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (isNew) {
        await saveFounderGalleryImage(formData);
      } else {
        await saveFounderGalleryImage(formData, id);
      }
      navigate('/admin/founder-gallery');
    } catch (error) {
      console.error("Gagal menyimpan gambar:", error);
      alert("Gagal menyimpan. Pastikan konfigurasi database Supabase sudah benar.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary-500" />
        <p>Memuat detil gambar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/founder-gallery')}
          className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-display font-bold text-2xl">{isNew ? 'Tambah Foto Galeri' : 'Edit Foto Galeri'}</h2>
          <p className="text-gray-500 text-sm mt-1">Kelola foto dokumentasi founder.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Kolom Simulasi (Preview) */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider pl-2">Live Preview</h3>
          
          <div className="relative rounded-3xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100 w-full aspect-[3/2] flex items-center justify-center p-2">
            {formData.image_url ? (
              <img src={formData.image_url} alt="Preview Foto" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                <span className="text-sm">Tidak ada gambar</span>
              </div>
            )}
          </div>
        </div>

        {/* Kolom Editor */}
        <div className="space-y-8 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-fit">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-sm font-medium text-gray-700">URL Gambar</label>
            </div>
            
            <div className="flex flex-col gap-4">
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white transition-colors focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none"
                placeholder="Paste URL gambar atau link Google Drive di sini..."
                value={formData.image_url}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.includes('drive.google.com')) {
                    setFormData(prev => ({ ...prev, image_url: convertToLh3Url(val) }));
                  } else {
                    setFormData(prev => ({ ...prev, image_url: val }));
                  }
                }}
              />

              <label className="text-sm font-medium text-gray-700 mt-2">Deskripsi Gambar (Opsional)</label>
              <textarea
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white transition-colors focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none min-h-[100px]"
                placeholder="Tambahkan deskripsi atau caption untuk gambar ini..."
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
              
              <div className="bg-primary-50/50 border border-primary-100 rounded-2xl p-5 flex gap-4 text-sm text-primary-800">
                <Info className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-bold text-primary-900">Optimal Ukuran Gambar</p>
                  <p className="text-primary-700/80 leading-relaxed">
                    Lebih baik menggunakan rasio 3:2 atau 4:3. Gambar akan ditampilkan proporsional tanpa terpotong (object-contain).
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !formData.image_url}
              className="w-full px-8 flex justify-center items-center gap-2 py-3.5"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSaving ? 'Menyimpan...' : 'Simpan Foto'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
