import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Info, X, ImageIcon, Link as LinkIcon, Youtube, FileText, PlayCircle, Plus } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { getEdukasiById, saveEdukasi, Edukasi } from "../../lib/edukasi";
import { convertToLh3Url } from "../../lib/gdriveUtils";
import { isYoutubeUrl, getYoutubeThumbnail } from "../../lib/videoUtils";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { marked } from "marked";
import TurndownService from "turndown";

const TITLE_MAX_LENGTH = 120;
const SUBTITLE_MAX_LENGTH = 250;

// Utility for datetime-local format
const toDatetimeLocal = (dateString: string) => {
  const date = new Date(dateString);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export function EdukasiEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id;
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Omit<Edukasi, 'id' | 'created_at'>>({
    title: "",
    subtitle: "",
    media_url: "",
    media_type: "image",
    content: "",
    order_index: 0,
    topic: "",
    kontributor: "[]",
    publish_datetime: new Date().toISOString()
  });

  const [contributors, setContributors] = useState<string[]>([]);
  const [newContributor, setNewContributor] = useState("");

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
    const fetchEdukasi = async () => {
      if (!isNew && id) {
        setIsLoading(true);
        try {
          const item = await getEdukasiById(id);
          if (item) {
            setFormData({
              title: item.title,
              subtitle: item.subtitle,
              media_url: item.media_url,
              media_type: item.media_type,
              content: item.content,
              order_index: item.order_index || 0,
              topic: item.topic || "",
              kontributor: item.kontributor || "[]",
              publish_datetime: item.publish_datetime || new Date().toISOString()
            });

            try {
              if (item.kontributor) {
                const parsed = JSON.parse(item.kontributor);
                if (Array.isArray(parsed)) {
                  setContributors(parsed);
                }
              }
            } catch (e) {}

            // Convert existing markdown to HTML for the rich text editor
            const html = await marked.parse(item.content || '');
            setEditorHtml(html);
          } else {
            navigate('/admin/edukasi');
          }
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchEdukasi();
  }, [id, isNew, navigate]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Convert HTML back to Markdown before saving
      const markdownContent = turndownService.turndown(editorHtml);
      
      const dataToSave = {
        ...formData,
        content: markdownContent,
        kontributor: JSON.stringify(contributors)
      };

      if (isNew) {
        await saveEdukasi(dataToSave);
      } else {
        await saveEdukasi(dataToSave, id);
      }
      navigate('/admin/edukasi');
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan data edukasi.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleMediaUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawUrl = e.target.value;
    const isYT = isYoutubeUrl(rawUrl);
    
    let processedUrl = rawUrl;
    if (!isYT) {
      processedUrl = convertToLh3Url(rawUrl, 1200, 800, false);
    }

    setFormData(prev => ({ 
      ...prev, 
      media_url: processedUrl,
      media_type: isYT ? 'video' : 'image'
    }));
  };

  const addContributor = () => {
    if (newContributor.trim() !== "" && !contributors.includes(newContributor.trim())) {
      setContributors([...contributors, newContributor.trim()]);
      setNewContributor("");
    }
  };

  const removeContributor = (index: number) => {
    setContributors(contributors.filter((_, i) => i !== index));
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
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p>Memuat data edukasi...</p>
      </div>
    );
  }

  const isYT = formData.media_type === 'video' || isYoutubeUrl(formData.media_url);
  const previewThumb = isYT ? getYoutubeThumbnail(formData.media_url) : formData.media_url;

  return (
    <div className="max-w-[80rem] mx-auto pb-[5rem]">
      <div className="mb-[2rem] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-[1rem]">
          <button 
            onClick={() => navigate('/admin/edukasi')}
            className="p-[0.5rem] hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="w-[1.5rem] h-[1.5rem]" />
          </button>
          <h2 className="font-display font-bold text-[1.5rem]">
            {isNew ? "Buat Materi Edukasi" : "Edit Materi Edukasi"}
          </h2>
        </div>
      </div>

      <div className="space-y-[2rem] bg-white p-[1.5rem] md:p-[2rem] rounded-[2rem] border border-gray-100 shadow-sm flex flex-col relative z-20">
          
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.5rem]">
          <div className="space-y-[0.5rem] col-span-1 md:col-span-2">
            <div className="flex justify-between items-end">
              <label className="text-[0.875rem] font-medium text-gray-700">Judul Materi</label>
              <span className={`text-[0.75rem] ${formData.title.length > TITLE_MAX_LENGTH ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                {formData.title.length}/{TITLE_MAX_LENGTH}
              </span>
            </div>
            <input
              type="text"
              className="w-full px-[1rem] py-[0.75rem] rounded-[0.75rem] border border-gray-200 bg-gray-50/50 focus:bg-white transition-colors focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none font-display font-bold text-[1.125rem]"
              placeholder="Contoh: Mengatur Pola Makan Sehat untuk Pasien"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-[0.5rem] col-span-1 md:col-span-2">
            <div className="flex justify-between items-end">
              <label className="text-[0.875rem] font-medium text-gray-700">Penjelasan Singkat (Hook)</label>
              <span className={`text-[0.75rem] ${formData.subtitle.length > SUBTITLE_MAX_LENGTH ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                {formData.subtitle.length}/{SUBTITLE_MAX_LENGTH}
              </span>
            </div>
            <textarea
              className="w-full px-[1rem] py-[0.75rem] rounded-[0.75rem] border border-gray-200 bg-gray-50/50 focus:bg-white transition-colors focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none resize-none h-[5rem] text-[0.875rem]"
              placeholder="Kalimat penarik yang akan muncul di daftar edukasi..."
              value={formData.subtitle}
              onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
            />
          </div>

          <div className="space-y-[0.5rem] col-span-1 border-t border-gray-50 pt-[1.5rem] md:pt-[0] md:border-none">
            <label className="text-[0.875rem] font-medium text-gray-700">Topic / Tema</label>
            <input
              type="text"
              className="w-full px-[1rem] py-[0.75rem] rounded-[0.75rem] border border-gray-200 bg-gray-50/50 focus:bg-white transition-colors focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none"
              placeholder="Contoh: Nutrisi, Motivasi, Info Medis"
              value={formData.topic || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
            />
          </div>

          <div className="space-y-[0.5rem] col-span-1 border-t border-gray-50 pt-[1.5rem] md:pt-[0] md:border-none">
            <label className="text-[0.875rem] font-medium text-gray-700">Waktu Publish (Tampil)</label>
            <input
              type="datetime-local"
              className="w-full px-[1rem] py-[0.75rem] rounded-[0.75rem] border border-gray-200 bg-gray-50/50 focus:bg-white transition-colors focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none"
              value={toDatetimeLocal(formData.publish_datetime || new Date().toISOString())}
              onChange={(e) => setFormData(prev => ({ ...prev, publish_datetime: new Date(e.target.value).toISOString() }))}
            />
            <p className="text-[0.75rem] text-gray-500 mt-1">Materi hanya muncul di halaman publik setelah waktu ini terlewati.</p>
          </div>

          <div className="space-y-[0.5rem] col-span-1 md:col-span-2 pb-[1rem]">
            <label className="text-[0.875rem] font-medium text-gray-700">Kontributor / Penulis</label>
             <div className="flex gap-[0.5rem]">
               <input
                 type="text"
                 className="flex-1 px-[1rem] py-[0.75rem] rounded-[0.75rem] border border-gray-200 bg-gray-50/50 focus:bg-white transition-colors focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none text-[0.875rem]"
                 placeholder="Nama penulis..."
                 value={newContributor}
                 onChange={e => setNewContributor(e.target.value)}
                 onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addContributor(); } }}
               />
               <button type="button" onClick={addContributor} className="px-[1.5rem] bg-gray-100 font-bold hover:bg-gray-200 rounded-[0.75rem] text-gray-700 flex items-center justify-center transition-colors">
                 <Plus className="w-[1.25rem] h-[1.25rem]" />
               </button>
             </div>
             {contributors.length > 0 && (
               <div className="flex flex-wrap gap-[0.5rem] mt-[1rem]">
                 {contributors.map((contributor, idx) => (
                   <span key={idx} className="inline-flex items-center gap-[0.25rem] bg-primary-50 text-primary-700 px-[0.75rem] py-[0.375rem] rounded-full text-[0.875rem] font-bold border border-primary-100">
                     {contributor}
                     <button type="button" onClick={() => removeContributor(idx)} className="text-primary-400 hover:text-red-500 transition-colors ml-[0.25rem]">
                       <X className="w-[1rem] h-[1rem]" />
                     </button>
                   </span>
                 ))}
               </div>
             )}
          </div>

          <div className="space-y-[1rem] col-span-1 md:col-span-2 bg-gray-50/50 p-[1.5rem] rounded-[1.5rem] border border-gray-100">
            <div className="bg-primary-50/50 border border-primary-100 rounded-[0.75rem] p-[1rem] flex gap-[0.75rem] text-[0.875rem] text-primary-800">
              <Info className="w-[1.25rem] h-[1.25rem] text-primary-600 shrink-0" />
              <div className="space-y-[0.25rem]">
                <p className="font-bold">Thumbnail & Media</p>
                <p className="text-primary-700/80 leading-relaxed font-medium">
                  Sistem otomatis mendeteksi link. Tempelkan link gambar (Drive/Unsplash) atau link Video YouTube. 
                  Jika YouTube, kami akan gunakan thumbnail videonya secara otomatis.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-[1rem]">
              <div className="flex-1 space-y-[1.5rem]">
                <div className="space-y-[0.5rem]">
                   <label className="text-[0.75rem] font-bold text-gray-500 uppercase tracking-wider">Link Media (Image/Youtube)</label>
                   <div className="relative">
                      <input
                        type="text"
                        className="w-full pl-[2.75rem] pr-[1rem] py-[0.75rem] rounded-[0.75rem] border border-gray-200 bg-gray-50/50 focus:bg-white transition-colors focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none"
                        placeholder="https://youtube.com/... atau https://drive.google.com/..."
                        value={formData.media_url}
                        onChange={handleMediaUrlChange}
                      />
                      <div className="absolute left-[1rem] top-1/2 -translate-y-1/2 text-gray-400">
                         {isYT ? <Youtube className="w-[1.25rem] h-[1.25rem]" /> : <ImageIcon className="w-[1.25rem] h-[1.25rem]" />}
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-[1rem]">
                   <div className={`flex items-center gap-[0.5rem] px-[1rem] py-[0.5rem] rounded-full text-[0.75rem] font-bold tracking-wider uppercase border ${isYT ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                      {isYT ? <PlayCircle className="w-[1rem] h-[1rem]" /> : <FileText className="w-[1rem] h-[1rem]" />}
                      Terdeteksi sebagai: {isYT ? 'Video YouTube' : 'Gambar/Foto'}
                   </div>
                </div>
              </div>
              
              <div className="w-full sm:w-[15rem] h-[10rem] bg-gray-100 rounded-[1.25rem] overflow-hidden shrink-0 border border-gray-200 shadow-inner relative group">
                {previewThumb ? (
                  <img src={previewThumb} alt="Media preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-[0.5rem]">
                    <ImageIcon className="w-[2rem] h-[2rem] stroke-[1.5]" />
                    <span className="text-[0.75rem] font-medium">Beri Link</span>
                  </div>
                )}
                {isYT && previewThumb && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                     <PlayCircle className="w-[3rem] h-[3rem] text-white/90 drop-shadow-lg" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-[0.5rem] col-span-1 md:col-span-2 pb-[3rem]">
            <label className="text-[0.875rem] font-medium text-gray-700">Isi Konten Materi</label>
            <div className="border border-gray-200 rounded-[1.25rem] bg-white text-left">
              <ReactQuill 
                ref={quillRef}
                theme="snow" 
                value={editorHtml} 
                onChange={setEditorHtml}
                modules={modules}
                className="min-h-[500px] border-none"
                placeholder="Tulis materi edukasi selengkap mungkin di sini..."
              />
            </div>
          </div>
        </div>
        
        <div className="pt-[1.5rem] border-t border-gray-100 flex justify-end mt-[3rem] bg-white sticky bottom-0 z-30 p-[1.5rem] -m-[1.5rem] md:-m-[2rem] md:p-[2rem] rounded-b-[2rem] shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
          <Button 
            onClick={handleSave} 
            disabled={isSaving || formData.title.length > TITLE_MAX_LENGTH || formData.subtitle.length > SUBTITLE_MAX_LENGTH || !formData.title || (!editorHtml || editorHtml === '<p><br></p>')}
            className="w-full sm:w-auto px-[2rem] flex justify-center items-center gap-[0.5rem] py-[0.875rem] rounded-full"
          >
            {isSaving ? <Loader2 className="w-[1.25rem] h-[1.25rem] animate-spin" /> : <Save className="w-[1.25rem] h-[1.25rem]" />}
            <span>Simpan Konten</span>
          </Button>
        </div>
      </div>

      {/* Modal Sisipkan Gambar */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-[1rem] bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-xl w-full max-w-[32rem] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-[1.5rem] border-b border-gray-100">
              <h3 className="font-display font-bold text-[1.25rem] flex items-center gap-[0.5rem]">
                <ImageIcon className="w-[1.25rem] h-[1.25rem] text-primary-500" />
                Sisipkan Gambar
              </h3>
              <button onClick={() => setIsImageModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-[0.5rem] rounded-full transition-colors">
                <X className="w-[1.25rem] h-[1.25rem]" />
              </button>
            </div>
            <div className="p-[1.5rem] space-y-[1.5rem]">
              <p className="text-[0.875rem] text-gray-500">
                Tempel link gambar atau link Google Drive. Gambar akan otomatis ditampilkan penuh (full width).
              </p>
              
              <div className="space-y-[1.5rem]">
                <div className="space-y-[0.5rem]">
                  <label className="text-[0.75rem] font-bold text-gray-400 uppercase tracking-wider">Link Gambar</label>
                  <input
                    type="text"
                    autoFocus
                    className="w-full px-[1rem] py-[0.75rem] rounded-[1rem] border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                    placeholder="https://..."
                    value={modalImageUrl}
                    onChange={(e) => setModalImageUrl(convertToLh3Url(e.target.value, 1200, 800, false))} 
                  />
                </div>

                {modalImageUrl && (
                  <div className="w-full h-[12rem] bg-gray-50 rounded-[1.5rem] overflow-hidden border border-gray-200 flex items-center justify-center p-[1rem]">
                    <img 
                      src={modalImageUrl} 
                      alt="Preview" 
                      className="max-h-full object-contain shadow-sm rounded-lg" 
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="p-[1.5rem] border-t border-gray-100 bg-gray-50 flex justify-end gap-[0.75rem]">
              <Button variant="outline" onClick={() => setIsImageModalOpen(false)} className="rounded-full">Batal</Button>
              <Button onClick={insertImage} disabled={!modalImageUrl} className="rounded-full px-[1.5rem]">Sisipkan</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sisipkan Link */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-[1rem] bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-xl w-full max-w-[32rem] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-[1.5rem] border-b border-gray-100">
              <h3 className="font-display font-bold text-[1.25rem] flex items-center gap-[0.5rem]">
                <LinkIcon className="w-[1.25rem] h-[1.25rem] text-primary-500" />
                Sisipkan Tautan
              </h3>
              <button onClick={() => setIsLinkModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-[0.5rem] rounded-full transition-colors">
                <X className="w-[1.25rem] h-[1.25rem]" />
              </button>
            </div>
            <div className="p-[1.5rem] space-y-[1rem]">
              <input
                type="text"
                autoFocus
                className="w-full px-[1rem] py-[0.75rem] rounded-[1rem] border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                placeholder="https://..."
                value={modalLinkUrl}
                onChange={(e) => setModalLinkUrl(e.target.value)}
              />
            </div>
            <div className="p-[1.5rem] border-t border-gray-100 bg-gray-50 flex justify-end gap-[0.75rem]">
              <Button variant="outline" onClick={() => setIsLinkModalOpen(false)} className="rounded-full">Batal</Button>
              <Button onClick={insertLink} disabled={!modalLinkUrl} className="rounded-full px-[1.5rem]">Sisipkan</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
