import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Info, X, ImageIcon, Link as LinkIcon } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { getCeritaKoncoById, saveCeritaKonco, CeritaKonco } from "../../lib/ceritaKonco";
import { convertToLh3Url } from "../../lib/gdriveUtils";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { marked } from "marked";
import TurndownService from "turndown";

const TITLE_MAX_LENGTH = 100;
const SUBTITLE_MAX_LENGTH = 200;

export function CeritaKoncoEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id;

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Omit<CeritaKonco, 'id' | 'created_at'>>({
    title: "",
    patient_name: "",
    subtitle_hook: "",
    thumbnail_image: "",
    content: "",
    order_index: 0
  });

  // Quill Editor state
  const quillRef = useRef<ReactQuill>(null);
  const [editorHtml, setEditorHtml] = useState("");
  
  // Custom Image & Link Modal state
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState("");
  
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [modalLinkUrl, setModalLinkUrl] = useState("");

  const turndownService = useMemo(() => {
    const service = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced'
    });
    // Preserve alignment and size if possible via HTML
    service.keep(['img', 'div', 'p']);
    return service;
  }, []);

  useEffect(() => {
    const fetchCerita = async () => {
      if (!isNew && id) {
        setIsLoading(true);
        try {
          const cerita = await getCeritaKoncoById(id);
          if (cerita) {
            setFormData({
              title: cerita.title,
              patient_name: cerita.patient_name || "",
              subtitle_hook: cerita.subtitle_hook,
              thumbnail_image: cerita.thumbnail_image,
              content: cerita.content,
              order_index: cerita.order_index || 0
            });
            // Convert existing markdown to HTML for the rich text editor
            const html = await marked.parse(cerita.content || '');
            setEditorHtml(html);
          } else {
            navigate('/admin/cerita-konco');
          }
        } catch (error) {
          console.error(error);
          navigate('/admin/cerita-konco');
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchCerita();
  }, [id, isNew, navigate]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Convert HTML back to Markdown before saving
      const markdownContent = turndownService.turndown(editorHtml);
      
      const dataToSave = {
        ...formData,
        content: markdownContent
      };

      if (isNew) {
        await saveCeritaKonco(dataToSave);
      } else {
        await saveCeritaKonco(dataToSave, id);
      }
      navigate('/admin/cerita-konco');
    } catch (error) {
      console.error("Gagal menyimpan cerita:", error);
      alert("Gagal menyimpan. Pastikan konfigurasi database sudah benar.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawUrl = e.target.value;
    const autoConverted = convertToLh3Url(rawUrl, 800, 600);
    setFormData(prev => ({ ...prev, thumbnail_image: autoConverted }));
  };

  // Custom Quill Toolbar handlers
  const imageHandler = () => {
    setModalImageUrl("");
    setIsImageModalOpen(true);
  };

  const linkHandler = () => {
    setModalLinkUrl("");
    setIsLinkModalOpen(true);
  };

  const insertImage = () => {
    const editor = quillRef.current?.getEditor();
    if (editor && modalImageUrl) {
      const range = editor.getSelection(true);
      const html = `<img src="${modalImageUrl}" /><p><br></p>`;
      editor.clipboard.dangerouslyPasteHTML(range.index, html);
    }
    setIsImageModalOpen(false);
  };
  
  const insertLink = () => {
    const editor = quillRef.current?.getEditor();
    if (editor && modalLinkUrl) {
      const range = editor.getSelection(true);
      if (range.length > 0) {
        editor.format('link', modalLinkUrl);
      } else {
        editor.insertText(range.index, modalLinkUrl, 'link', modalLinkUrl);
      }
    }
    setIsLinkModalOpen(false);
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler,
        link: linkHandler
      }
    }
  }), []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary-500" />
        <p>Memuat detail cerita...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/cerita-konco')}
          className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-display font-bold text-2xl">{isNew ? 'Tambah Cerita' : 'Edit Cerita'}</h2>
          <p className="text-gray-500 text-sm mt-1">Tulis dan publikasikan cerita baru untuk para Konco Kemo.</p>
        </div>
      </div>

      <div className="space-y-8 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col relative z-20">
          
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 col-span-1 md:col-span-2">
            <div className="flex justify-between items-end">
              <label className="text-sm font-medium text-gray-700">Judul Cerita</label>
              <span className={`text-xs ${formData.title.length > TITLE_MAX_LENGTH ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                {formData.title.length} / {TITLE_MAX_LENGTH}
              </span>
            </div>
            <input
              type="text"
              className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 focus:bg-white transition-colors focus:ring-2 focus:outline-none ${formData.title.length > TITLE_MAX_LENGTH ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 focus:ring-primary-500/20 focus:border-primary-500'}`}
              placeholder="Masukkan judul (maks. 100 karakter)"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Nama Pasien</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white transition-colors focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none"
              placeholder="Masukkan nama pasien"
              value={formData.patient_name}
              onChange={(e) => setFormData(prev => ({ ...prev, patient_name: e.target.value }))}
            />
          </div>

          <div className="space-y-2 col-span-1 md:col-span-2">
            <div className="flex justify-between items-end">
              <label className="text-sm font-medium text-gray-700">Sub-judul / Hook Singkat</label>
              <span className={`text-xs ${formData.subtitle_hook.length > SUBTITLE_MAX_LENGTH ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                {formData.subtitle_hook.length} / {SUBTITLE_MAX_LENGTH}
              </span>
            </div>
            <textarea
              className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 focus:bg-white transition-colors focus:ring-2 focus:outline-none resize-none h-24 ${formData.subtitle_hook.length > SUBTITLE_MAX_LENGTH ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 focus:ring-primary-500/20 focus:border-primary-500'}`}
              placeholder="Masukkan hook untuk memancing pembaca"
              value={formData.subtitle_hook}
              onChange={(e) => setFormData(prev => ({ ...prev, subtitle_hook: e.target.value }))}
            />
          </div>

          <div className="space-y-3 col-span-1 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">URL Gambar Thumbnail</label>
            <div className="bg-primary-50/50 border border-primary-100 rounded-xl p-4 flex gap-3 text-sm text-primary-800">
              <Info className="w-5 h-5 text-primary-600 shrink-0" />
              <div className="space-y-1">
                <p className="font-medium">Otomatis Terkonversi</p>
                <p className="text-primary-700/80 leading-relaxed">
                  Tempelkan (paste) link Google Drive di bawah. Sistem akan secara otomatis mengonversinya menjadi format gambar beresolusi 800x600 px.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white transition-colors focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none"
                  placeholder="https://drive.google.com/file/d/...."
                  value={formData.thumbnail_image}
                  onChange={handleThumbnailChange}
                />
              </div>
              {formData.thumbnail_image && (
                <div className="w-32 h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                  <img src={formData.thumbnail_image} alt="Thumbnail preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 col-span-1 md:col-span-2 pb-12">
            <label className="text-sm font-medium text-gray-700">Isi Cerita</label>
            <div className="border border-gray-200 rounded-xl bg-white">
              <ReactQuill 
                ref={quillRef}
                theme="snow" 
                value={editorHtml} 
                onChange={setEditorHtml}
                modules={modules}
                className="min-h-[400px] border-none"
                placeholder="Tulis ceritamu di sini..."
              />
            </div>
          </div>
        </div>
        
        <div className="pt-2 border-t border-gray-100 flex justify-end mt-12 bg-white sticky bottom-0 z-30 p-4 -m-8 md:-m-8 md:p-8 rounded-b-3xl">
          <Button 
            onClick={handleSave} 
            disabled={isSaving || formData.title.length > TITLE_MAX_LENGTH || formData.subtitle_hook.length > SUBTITLE_MAX_LENGTH || !formData.title || (!editorHtml || editorHtml === '<p><br></p>')}
            className="w-full sm:w-auto px-8 flex justify-center items-center gap-2 py-3.5"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isSaving ? 'Menyimpan...' : 'Simpan Cerita'}
          </Button>
        </div>
      </div>

      {/* Modal Sisipkan Gambar */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-display font-bold text-xl flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary-500" />
                Sisipkan Gambar
              </h3>
              <button onClick={() => setIsImageModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <p className="text-sm text-gray-500">
                Tempel link gambar atau link Google Drive. Gambar akan otomatis ditampilkan penuh (full width).
              </p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Link Gambar</label>
                  <input
                    type="text"
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                    placeholder="https://..."
                    value={modalImageUrl}
                    onChange={(e) => setModalImageUrl(convertToLh3Url(e.target.value, 1200, 800, false))}
                  />
                </div>

                {modalImageUrl && (
                  <div className="w-full h-48 bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 flex items-center justify-center p-4">
                    <img 
                      src={modalImageUrl} 
                      alt="Preview" 
                      className="max-h-full object-contain shadow-sm rounded-lg" 
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsImageModalOpen(false)}>Batal</Button>
              <Button onClick={insertImage} disabled={!modalImageUrl}>Sisipkan</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sisipkan Link */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-display font-bold text-xl flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-primary-500" />
                Sisipkan Tautan
              </h3>
              <button onClick={() => setIsLinkModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <input
                type="text"
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                placeholder="https://..."
                value={modalLinkUrl}
                onChange={(e) => setModalLinkUrl(e.target.value)}
              />
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsLinkModalOpen(false)}>Batal</Button>
              <Button onClick={insertLink} disabled={!modalLinkUrl}>Sisipkan</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
