import { useState, useEffect } from "react";
import { SEO } from "../components/SEO";
import { Link } from "react-router-dom";
import { Stethoscope, UserX, AlertTriangle, Download, FileText, Home } from "lucide-react";
import { jsPDF } from "jspdf";
import { ASSETS } from "../lib/assets";

const THERAPY_MAP: Record<string, { gejala: string; tataLaksana: string }> = {
  "MM": { gejala: "Mual / Muntah", tataLaksana: "Ondansetron 8mg" },
  "D1": { gejala: "Diare 1-6x", tataLaksana: "Absorbent" },
  "D2": { gejala: "Diare >6x", tataLaksana: "Loperamide" },
  "N1": { gejala: "Nyeri 1-3", tataLaksana: "Paracetamol" },
  "N2": { gejala: "Nyeri 4-6", tataLaksana: "NSAID / Tramadol" },
  "N3": { gejala: "Nyeri 7-10", tataLaksana: "Codein" },
  "S":  { gejala: "Sariawan", tataLaksana: "Nystatin Oral Drops" },
  "DH": { gejala: "Dehidrasi", tataLaksana: "Rehidrasi sesuai tingkat Dehidrasi" },
  "SN": { gejala: "Sesak Napas", tataLaksana: "Terapi Oksigen sesuai saturasi" },
  "AN": { gejala: "Anemia", tataLaksana: "Evaluasi kadar Hb; Lakukan transfusi sesuai indikasi berdasarkan rekomendasi Dokter Sp.PD atau KHOM setempat." },
  "LK": { gejala: "Leukopenia", tataLaksana: "Evaluasi hitung leukosit; Berikan terapi G-CSF sesuai indikasi berdasarkan rekomendasi Dokter Sp.PD atau KHOM setempat." },
  "TB": { gejala: "Tanda Bahaya / Darurat", tataLaksana: "Tata laksana awal sesuai indikasi untuk stabilisasi pasien, kemudian segera lakukan konsultasi/rujukan ke Dokter Sp.PD atau KHOM setempat." },
};

export default function TataLaksana() {
  const [isDoctorConfirm, setIsDoctorConfirm] = useState<boolean | null>(null);
  const [patientName, setPatientName] = useState("Pasien");
  const [patientCodes, setPatientCodes] = useState<string[]>([]);
  const [isPayloadValid, setIsPayloadValid] = useState(true);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch(ASSETS.LOGO_KONCOKEMO);
        if (response.ok) {
          const blob = await response.blob();
          const encoded = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          setLogoBase64(encoded);
        }
      } catch (err) {
        console.warn("Failed to convert logo to base64", err);
      }
    };
    fetchLogo();
  }, []);

  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const p = searchParams.get("p");
      if (p) {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(p))));
        if (decoded && typeof decoded.n === "string" && Array.isArray(decoded.c)) {
          setPatientName(decoded.n);
          setPatientCodes(decoded.c);
        } else {
          setIsPayloadValid(false);
        }
      } else {
        setIsPayloadValid(false);
      }
    } catch (e) {
      setIsPayloadValid(false);
    }
  }, []);

  if (!isPayloadValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <SEO 
          title="Tata Laksana Tidak Valid - KoncoKemo" 
          description="Hasil tatalaksana tidak valid atau tautan telah kedaluwarsa."
        />
        <div className="bg-white p-6 max-w-md w-full rounded-2xl shadow-xl text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Tautan Tidak Valid</h2>
          <p className="text-gray-600">Mohon maaf, tautan hasil tatalaksana ini tidak memiliki data yang valid. Silahkan periksa kembali hasil dari kalkulator cek mandiri pasien.</p>
        </div>
      </div>
    );
  }

  if (isDoctorConfirm === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col pt-16">
        <SEO 
          title="Verifikasi Tenaga Kesehatan - KoncoKemo" 
          description="Halaman verifikasi akses tenaga kesehatan untuk melihat panduan tatalaksana."
        />
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-xl overflow-hidden border border-primary-100">
            <div className="p-8 text-center bg-primary-50">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Stethoscope className="w-10 h-10 text-primary-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Konfirmasi Akses</h2>
              <p className="text-gray-600 mt-2">Halaman ini memuat informasi rekomendasi tatalaksana medis. Apakah Anda seorang Dokter atau Tenaga Kesehatan yang berwenang?</p>
            </div>
            <div className="p-6 space-y-4">
              <button 
                onClick={() => setIsDoctorConfirm(true)}
                className="w-full bg-primary-600 text-white font-semibold py-4 rounded-xl hover:bg-primary-700 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Stethoscope className="w-5 h-5" />
                Ya, saya Dokter / Nakes
              </button>
              <button 
                onClick={() => setIsDoctorConfirm(false)}
                className="w-full bg-gray-100 text-gray-600 font-medium py-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <UserX className="w-5 h-5" />
                Tidak, saya bukan Nakes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isDoctorConfirm === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <SEO 
          title="Akses Ditolak - KoncoKemo" 
          description="Akses ditolak karena halaman ini khusus untuk tenaga kesehatan."
        />
        <div className="bg-white p-8 max-w-lg w-full rounded-2xl shadow-xl border border-red-100 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Akses Terbatas</h2>
          <p className="text-gray-600 leading-relaxed text-left inline-block">
            Maaf, halaman ini berisi panduan tatalaksana klinis yang ditujukan <strong>khusus bagi dokter dan tenaga kesehatan</strong>. <br /><br />
            Untuk penanganan medis lebih lanjut, harap serahkan atau tunjukkan hasil skrining kepada dokter pemeriksa atau IGD rumah sakit agar bapak/ibu/saudara bisa mendapatkan pengobatan yang tepat demi keselamatan pasien.
          </p>
        </div>
      </div>
    );
  }

  const symptomsList = patientCodes.map(code => THERAPY_MAP[code]).filter(Boolean);

  const downloadPDF = () => {
    const doc = new jsPDF();
    const marginX = 20;
    let currentY = 20;

    // Header Logo & Title
    if (logoBase64 && logoBase64.startsWith("data:image/png")) {
      doc.addImage(logoBase64, "PNG", marginX, currentY - 5, 20, 20, undefined, "FAST");
    }
    
    doc.setTextColor(92, 53, 143); 
    doc.setFontSize(22);
    doc.setFont("Helvetica", "bold");
    doc.text("KoncoKemo", marginX + 25, currentY + 5);
    
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(10);
    doc.setFont("Helvetica", "normal");
    doc.text("Rekomendasi Tatalaksana Pasca Kemoterapi", marginX + 25, currentY + 11);

    currentY += 24;
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.line(marginX, currentY, 190, currentY);
    currentY += 12;

    doc.setFillColor(245, 243, 250);
    doc.rect(marginX, currentY - 5, 170, 18, "F");
    
    doc.setTextColor(92, 53, 143);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.text("IDENTITAS PASIEN", marginX + 5, currentY);

    doc.setTextColor(40, 40, 40);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`${patientName}`, marginX + 5, currentY + 8);

    currentY += 25;
    
    doc.setTextColor(92, 53, 143);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text("HASIL INDIKASI & REKOMENDASI TATALAKSANA", marginX, currentY);
    currentY += 6;

    if (symptomsList.length === 0) {
      doc.setTextColor(100, 100, 100);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Pasien tidak memiliki indikasi gejala yang memerlukan terapi lanjutan berbasis data terkini.", marginX, currentY + 4);
      currentY += 10;
    }

    symptomsList.forEach((item, index) => {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.setTextColor(40, 40, 40);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      const title = `${index + 1}. Gejala: ${item.gejala}`;
      doc.text(title, marginX, currentY + 5);

      doc.setTextColor(60, 60, 60);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      
      const tlLines = doc.splitTextToSize(`Tatalaksana: ${item.tataLaksana}`, 160);
      doc.text(tlLines, marginX + 4, currentY + 11);
      
      currentY += 12 + (tlLines.length * 4);
    });

    currentY += 10;
    if (currentY > 235) { // Adjusted to give plenty of room on the page
      doc.addPage();
      currentY = 20;
    }

    doc.setTextColor(180, 0, 0);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.text("PERHATIAN BAGI DOKTER:", marginX, currentY);
    
    doc.setTextColor(60, 60, 60);
    doc.setFont("Helvetica", "normal");
    const warningText = "Panduan tatalaksana ini bersifat Murni Rekomendasi berdasarkan riwayat dan algoritma asesmen dan bukan tatalaksana baku. Tatalaksana yang diberikan sepenuhnya merupakan intervensi dan pertimbangan dokter pemeriksa di faskes setempat.";
    const warningLines = doc.splitTextToSize(warningText, 170);
    doc.text(warningLines, marginX, currentY + 5);

    // Update currentY for doctor encouraging note
    currentY += 5 + (warningLines.length * 4.5) + 8;
    
    if (currentY > 265) {
      doc.addPage();
      currentY = 20;
    }

    // Fellow Doctor encouraging box
    doc.setFillColor(245, 243, 250); // Light primary-50 color
    doc.setDrawColor(214, 202, 236); // primary-200 border
    doc.setLineWidth(0.4);
    doc.rect(marginX, currentY, 170, 16, "FD");

    doc.setTextColor(109, 66, 170); // Theme color primary-600 (Purple)
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(9);
    const doctorNote = "Terima kasih sejawat telah membantu menolong pasien Kanker Indonesia, mohon tularkan semangat dan harapan pada pasien hebat ini.";
    const doctorNoteLines = doc.splitTextToSize(doctorNote, 160);
    doc.text(doctorNoteLines, marginX + 5, currentY + (doctorNoteLines.length > 1 ? 6.5 : 10));

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("koncokemo.com", 190, 8, { align: "right" });
        doc.text("koncokemo.com", 190, 290, { align: "right" });
        
        doc.saveGraphicsState();
        try {
          (doc as any).setGState(new (doc as any).GState({ opacity: 0.18 }));
        } catch (e) {
          doc.setTextColor(240, 240, 240); 
        }
        
        if (logoBase64 && logoBase64.startsWith("data:image/png")) {
          doc.addImage(logoBase64, "PNG", 25, 45, 160, 160, undefined, "FAST");
        }
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(65);
        doc.text("Hak Cipta KoncoKemo", 105, 150, { align: "center", angle: 45 });
        doc.restoreGraphicsState();
    }

    const slug = (patientName || "Pasien").replace(/\s+/g, "_");
    doc.save(`Tatalaksana_${slug}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SEO 
        title="Rekomendasi Tatalaksana Pasien - KoncoKemo" 
        description="Detail tatalaksana medis berdasarkan hasil cek mandiri pasien kemoterapi."
      />
      
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 md:px-8 py-4 flex items-center justify-between">
         <Link to="/" className="flex items-center gap-3 group transition-opacity hover:opacity-80">
           <img src={ASSETS.LOGO_KONCOKEMO} alt="KoncoKemo" className="w-10 h-10 object-contain" />
           <div>
             <h1 className="text-xl font-bold text-primary-800">Tatalaksana Pasien</h1>
             <p className="text-xs text-gray-500 font-medium">Berdasarkan Skrining Cek Mandiri</p>
           </div>
         </Link>
         <div className="flex items-center gap-2">
           <Link 
             to="/"
             className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-primary-600 px-4 py-2 text-sm font-semibold transition-colors"
           >
             <Home className="w-4 h-4" />
             Beranda
           </Link>
           <button 
             onClick={downloadPDF}
             className="hidden sm:flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 hover:bg-primary-100 rounded-lg text-sm font-semibold transition-colors border border-primary-200"
           >
             <Download className="w-4 h-4" />
             Download Laporan PDF
           </button>
         </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
           <div className="bg-primary-50 p-6 border-b border-primary-100">
             <p className="text-sm text-primary-600 font-semibold mb-1 uppercase tracking-wider">Identitas Pasien</p>
             <h2 className="text-2xl font-bold text-gray-900">{patientName}</h2>
           </div>
           
           <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-500" />
                Rekomendasi Tatalaksana Gejala
              </h3>
              
              {symptomsList.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 font-medium">Tidak ada gejala yang tercatat memerlukan tatalaksana khusus.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {symptomsList.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-2 sm:gap-6 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all">
                      <div className="sm:w-1/3">
                        <span className="text-sm text-gray-500 font-medium block">Gejala</span>
                        <span className="text-gray-900 font-semibold">{item.gejala}</span>
                      </div>
                      <div className="sm:w-2/3">
                        <span className="text-sm text-gray-500 font-medium block">Rekomendasi Terapi (Tx)</span>
                        <span className="text-primary-700 font-medium">{item.tataLaksana}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
           </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3 text-sm text-yellow-800 shadow-sm leading-relaxed mb-6">
           <AlertTriangle className="w-5 h-5 flex-shrink-0 text-yellow-600 mt-0.5" />
           <p>
             <strong>PERHATIAN:</strong> Panduan tatalaksana bersifat rekomendasi dan bukan tatalaksana baku. Tatalaksana yang diberikan boleh berbeda sesuai kondisi dan pertimbangan dokter pemeriksa di faskes setempat.
           </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <button 
            onClick={downloadPDF}
            className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-3 hover:bg-primary-700 rounded-xl font-semibold transition-colors"
          >
            <Download className="w-5 h-5" />
            Download Laporan PDF
          </button>
          <Link 
            to="/"
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-3 hover:bg-gray-50 rounded-xl font-semibold transition-colors"
          >
            <Home className="w-5 h-5" />
            Beranda
          </Link>
        </div>
      </main>
    </div>
  );
}
