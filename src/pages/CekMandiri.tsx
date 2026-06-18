import { useState, useEffect } from "react";
import { Input } from "../components/ui/Input";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { AnimatePresence, motion } from "motion/react";
import { Download, ExternalLink, X, FileText, Smartphone } from "lucide-react";
import { SEO } from "../components/SEO";
import { ASSETS } from "../lib/assets";

export function CekMandiriPage() {
  return (
    <div className="pt-[0.75rem] md:pt-[1.5rem] pb-[3rem] md:pb-[5rem]">
      <SEO 
        title="Cek Risiko Mandiri Kemoterapi" 
        description="Layanan evaluasi dan cek risiko mandiri pasca kemoterapi untuk menilai kondisi dan menentukan langkah medis selanjutnya."
        url="https://koncokemo.com/cek-mandiri"
      />
      <CekMandiri />
    </div>
  );
}

function CekMandiri() {
  const [nama, setNama] = useState<string>("");
  const [redFlags, setRedFlags] = useState<Record<string, boolean>>({});
  
  const [mualMuntah, setMualMuntah] = useState<number>(0);
  const [diare, setDiare] = useState<number>(0);
  
  const [nyeriSkala, setNyeriSkala] = useState<number>(0);
  const [nyeriTidur, setNyeriTidur] = useState<boolean>(false);
  const [nyeriAktivitas, setNyeriAktivitas] = useState<boolean>(false);
  
  const [mukositis, setMukositis] = useState<number>(0);
  
  const [dehidrasi, setDehidrasi] = useState<Record<string, boolean>>({});
  
  const [sesak, setSesak] = useState<number>(0);
  const [pucat, setPucat] = useState<Record<string, boolean>>({});
  
  const [leukopenia, setLeukopenia] = useState<number>(0);
  
  const [usia, setUsia] = useState<number>(0);
  const [hariKemo, setHariKemo] = useState<number>(0);
  const [ecog, setEcog] = useState<number>(0);

  const [logoBase64, setLogoBase64] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [pdfFileName, setPdfFileName] = useState<string>("");
  const [showResult, setShowResult] = useState<boolean>(false);

  useEffect(() => {
    setShowResult(false);
  }, [
    nama, redFlags, mualMuntah, diare, nyeriSkala, nyeriTidur, 
    nyeriAktivitas, mukositis, dehidrasi, sesak, pucat, leukopenia,
    usia, hariKemo, ecog
  ]);

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
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const calculateScore = () => {
    // Check direct red flags
    const hasDirectRedFlag = Object.values(redFlags).some((val) => val === true);
    
    // Check implicit red flags from selections
    const isSesakRedFlag = sesak === 999;
    const isLeukopeniaRedFlag = leukopenia === 999;
    const isEmergency = hasDirectRedFlag || isSesakRedFlag || isLeukopeniaRedFlag;

    let total = 0;
    
    // Symptom Scoring
    total += mualMuntah;
    total += diare;
    
    total += nyeriSkala;
    if (nyeriSkala > 0) {
       if (nyeriTidur) total += 2;
       if (nyeriAktivitas) total += 2;
    }

    total += mukositis;
    
    if (dehidrasi["haus"]) total += 1;
    if (dehidrasi["mulutKering"]) total += 1;
    if (dehidrasi["bakBerkurang"]) total += 3;
    if (dehidrasi["pusingBerdri"]) total += 3;

    if (sesak === 999) {
      total += 10;
    } else {
      total += sesak;
    }

    if (pucat["pucat"]) total += 1;
    if (pucat["lelah"]) total += 2;
    if (pucat["berdebar"]) total += 4;

    if (leukopenia === 999) {
      total += 10;
    } else {
      total += leukopenia;
    }

    // Modifiers
    total += usia;
    total += hariKemo;
    total += ecog;

    let riskLevel = "";
    let actionLevel = "";
    let colorClass = "";

    if (isEmergency) {
      riskLevel = "SANGAT TINGGI (DARURAT)";
      actionLevel = "Segera kunjungi Rumah Sakit / IGD terdekat.";
      colorClass = "bg-red-100 text-red-800 border-red-300";
    } else if (total <= 4) {
      riskLevel = "RISIKO RENDAH";
      actionLevel = "Observasi mandiri di rumah. Tetap jaga pola makan dan istirahat.";
      colorClass = "bg-green-100 text-green-800 border-green-300";
    } else if (total <= 9) {
      riskLevel = "RISIKO RINGAN";
      actionLevel = "Konsultasi dengan Dokter Umum atau melalui Layanan Telemedisin.";
      colorClass = "bg-yellow-100 text-yellow-800 border-yellow-300";
    } else if (total <= 14) {
      riskLevel = "RISIKO SEDANG";
      actionLevel = "Segera hubungi Dokter Spesialis Penyakit Dalam Anda.";
      colorClass = "bg-orange-100 text-orange-800 border-orange-300";
    } else if (total <= 19) {
      riskLevel = "RISIKO TINGGI";
      actionLevel = "Periksa ke dokter Spesialis Hematologi-Onkologi dalam waktu <= 24 jam.";
      colorClass = "bg-rose-100 text-rose-800 border-rose-300";
    } else {
      riskLevel = "RISIKO SANGAT TINGGI";
      actionLevel = "Segera kunjungi Rumah Sakit / IGD terdekat.";
      colorClass = "bg-red-100 text-red-800 border-red-300";
    }

    return { score: total, isEmergency, risk: riskLevel, action: actionLevel, color: colorClass };
  };

  const result = calculateScore();

  const downloadPDF = async () => {
    try {
      const doc = new jsPDF();

      doc.setProperties({
        title: `Hasil Cek Mandiri - ${nama || "Pasien"}`,
        subject: "KoncoKemo - Pusat Informasi Pasien Kemoterapi",
        author: "KoncoKemo App",
        creator: "KoncoKemo PDF Creator"
      });

      const marginX = 20;
      let currentY = 15;

      // --- REPORT HEADER ---
      if (logoBase64 && logoBase64.startsWith("data:image/png")) {
        doc.addImage(logoBase64, "PNG", marginX, currentY, 14, 14, undefined, "FAST");
      }

    doc.setTextColor(92, 53, 143);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.text("KONCOKEMO", marginX + 18, currentY + 5);

    doc.setTextColor(110, 110, 110);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("Pusat Informasi Pasien Kemoterapi", marginX + 18, currentY + 11);

    doc.setTextColor(40, 40, 40);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.text("LAPORAN HASIL CEK MANDIRI", 190, currentY + 5, { align: "right" });

    doc.setTextColor(120, 120, 120);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 190, currentY + 11, { align: "right" });

    currentY += 18;
    doc.setDrawColor(214, 202, 236);
    doc.setLineWidth(0.6);
    doc.line(marginX, currentY, 190, currentY);

    currentY += 12;
    doc.setFillColor(245, 243, 250);
    doc.rect(marginX, currentY - 5, 170, 18, "F");
    
    doc.setTextColor(92, 53, 143);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.text("NAMA PASIEN", marginX + 5, currentY);

    doc.setTextColor(40, 40, 40);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`${nama.trim() || "Pasien"}`, marginX + 5, currentY + 8);

    currentY += 21;
    doc.setTextColor(40, 40, 40);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text("KESIMPULAN & REKOMENDASI MEDIS", marginX, currentY);

    currentY += 5;
    const isEmergency = result.isEmergency;
    
    let fillRGB = [245, 243, 250];
    let borderRGB = [214, 202, 236];
    let textRGB = [92, 53, 143];

    if (isEmergency) {
      fillRGB = [254, 241, 242]; 
      borderRGB = [244, 63, 94]; 
      textRGB = [159, 18, 57]; 
    } else if (result.score <= 4) {
      fillRGB = [240, 253, 244]; 
      borderRGB = [34, 197, 94]; 
      textRGB = [21, 128, 61]; 
    } else if (result.score <= 9) {
      fillRGB = [254, 252, 232]; 
      borderRGB = [234, 179, 8]; 
      textRGB = [161, 98, 7]; 
    } else if (result.score <= 14) {
      fillRGB = [255, 247, 237]; 
      borderRGB = [249, 115, 22]; 
      textRGB = [194, 65, 12]; 
    } else {
      fillRGB = [255, 241, 242]; 
      borderRGB = [244, 63, 94]; 
      textRGB = [159, 18, 57]; 
    }

    const needsDoctorNote = isEmergency || result.score >= 5;
    const rectHeight = needsDoctorNote ? 34 : 28;

    doc.setFillColor(fillRGB[0], fillRGB[1], fillRGB[2]);
    doc.setDrawColor(borderRGB[0], borderRGB[1], borderRGB[2]);
    doc.setLineWidth(0.8);
    doc.rect(marginX, currentY, 170, rectHeight, "FD");

    doc.setTextColor(textRGB[0], textRGB[1], textRGB[2]);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.text(isEmergency ? "TINDAKAN DARURAT:" : "REKOMENDASI TINDAKAN:", marginX + 6, currentY + 8);

    doc.setFont("Helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9.5);
    const actionTextLines = doc.splitTextToSize(result.action, 120);
    doc.text(actionTextLines, marginX + 6, currentY + 14);

    if (needsDoctorNote) {
       doc.setFont("Helvetica", "italic");
       doc.setFontSize(8);
       doc.setTextColor(130, 130, 130);
       doc.text("*Silahkan tunjukan hasil pengecekan ini kepada dokter yang anda kunjungi", marginX + 6, currentY + 14 + (actionTextLines.length * 4) + 2);
    }

    doc.setTextColor(textRGB[0], textRGB[1], textRGB[2]);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(26);
    doc.text(`${result.score}`, 180, currentY + 15, { align: "right" });

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(110, 110, 110);
    doc.text("Skor Risiko", 180, currentY + 20, { align: "right" });

    currentY += rectHeight + 10;

    doc.setTextColor(40, 40, 40);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text("RINCIAN PEMANTAUAN GEJALA", marginX, currentY);

    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.line(marginX, currentY + 3, 190, currentY + 3);

    currentY += 10;
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(70, 70, 70);

    const symptomRecords: string[] = [];
    
    const activeRedFlags = Object.entries(redFlags)
      .filter(([_, val]) => val === true)
      .map(([key]) => {
        const labels: Record<string, string> = {
          demam: "Demam >= 38°C dan riwayat leukosites rendah",
          sesakIstirahat: "Sesak saat beristirahat",
          tidakJalan: "Tidak mampu berjalan +-20 meter karena sesak",
          tidakMinum: "Tidak bisa minum selama >12 jam",
          tidakBAK: "Tidak buang air kecil selama >12 jam",
          muntahTerus: "Muntah terus-menerus hingga tidak bisa makan/minum",
          muntahDarah: "Muntah berdarah",
          babHitam: "Buang air besar hitam (melena)",
          mimisan: "Mimisan yang tidak berhenti",
          penurunanKesadaran: "Sangat lemas, linglung atau penurunan kesadaran"
        };
        return labels[key] || key;
      });

    if (activeRedFlags.length > 0) {
      symptomRecords.push(`Tanda Bahaya (Red Flags): ${activeRedFlags.join(", ")}`);
    } else {
      symptomRecords.push("Tanda Bahaya (Red Flags): Tidak ada yang terdeteksi");
    }

    const mualLabel = mualMuntah === 0 ? "Tidak ada" :
                      mualMuntah === 1 ? "Mual ringan" :
                      mualMuntah === 2 ? "Mual berat" :
                      mualMuntah === 3 ? "Muntah 1-3x sehari" :
                      mualMuntah === 5 ? "Muntah 4-6x sehari" : "Muntah >6x sehari";

    const diareLabel = diare === 0 ? "Tidak ada" :
                       diare === 2 ? "1-3x lebih banyak" :
                       diare === 4 ? "4-6x lebih banyak" : "Lebih dari 6x sehari";

    const nyeriLabel = nyeriSkala === 0 ? "Tidak ada" :
                       nyeriSkala === 1 ? "Nyeri ringan (Skala 1-3)" :
                       nyeriSkala === 3 ? "Nyeri sedang (Skala 4-6)" : "Nyeri hebat (Skala 7-10)";
    let nyeriDetail = "";
    if (nyeriTidur) nyeriDetail += " [Mengganggu Tidur]";
    if (nyeriAktivitas) nyeriDetail += " [Mengganggu Aktivitas]";

    const sariawanLabel = mukositis === 0 ? "Tidak ada" :
                          mukositis === 1 ? "Kemerahan ringan" :
                          mukositis === 3 ? "Luka sariawan ringan" :
                          mukositis === 5 ? "Luka menyulitkan makan" : "Tidak bisa makan/minum";

    const activeDehidrasi = Object.entries(dehidrasi)
      .filter(([_, val]) => val === true)
      .map(([key]) => {
        const labels: Record<string, string> = {
          haus: "Haus terus-menerus",
          mulutKering: "Mulut/bibir kering",
          bakBerkurang: "BAK berkurang drastis",
          pusingBerdri: "Pusing saat berdiri"
        };
        return labels[key] || key;
      });

    const sesakLabel = sesak === 0 ? "Tidak ada" :
                       sesak === 2 ? "Sesak aktivitas berat" :
                       sesak === 5 ? "Sesak aktivitas ringan" : "Sesak saat beristirahat";

    const activePucat = Object.entries(pucat)
      .filter(([_, val]) => val === true)
      .map(([key]) => {
        const labels: Record<string, string> = {
          pucat: "Kulit pucat",
          lelah: "Lekas lelah",
          berdebar: "Jantung berdebar"
        };
        return labels[key] || key;
      });

    const leukoLabel = leukopenia === 0 ? "Normal / Tidak Tahu" :
                       leukopenia === 3 ? "Rendah tanpa gejala" :
                       leukopenia === 4 ? "Rendah disertai sariawan/diare" : "Rendah + DEMAM";

    const usiaLabel = usia === 0 ? "Dibawah 65 Tahun" : "65 Tahun ke atas";

    const kemoLabel = hariKemo === 0 ? "1 - 3 hari yang lalu" :
                      hariKemo === 1 ? "4 - 7 hari atau >14 hari yang lalu" : "8 - 14 hari yang lalu";

    const ecogLabel = ecog === 0 ? "Aktivitas normal" :
                      ecog === 2 ? "Banyak duduk/berbaring" : "Membutuhkan bantuan penuh";

    symptomRecords.push(`Mual & Muntah: ${mualLabel} (Skor: ${mualMuntah})`);
    symptomRecords.push(`Diare: ${diareLabel} (Skor: ${diare})`);
    symptomRecords.push(`Nyeri Badan: ${nyeriLabel}${nyeriDetail} (Skor: ${nyeriSkala + (nyeriTidur ? 2 : 0) + (nyeriAktivitas ? 2 : 0)})`);
    symptomRecords.push(`Sariawan / Luka Mulut: ${sariawanLabel} (Skor: ${mukositis})`);
    symptomRecords.push(`Gejala Dehidrasi: ${activeDehidrasi.length > 0 ? activeDehidrasi.join(", ") : "Tidak ada"}`);
    symptomRecords.push(`Sesak Napas: ${sesakLabel} (Skor: ${sesak === 999 ? "RED FLAG" : sesak})`);
    symptomRecords.push(`Kondisi Anemia (Pucat & Lelah): ${activePucat.length > 0 ? activePucat.join(", ") : "Tidak ada"}`);
    symptomRecords.push(`Status Sel Darah Putih (Leukopenia): ${leukoLabel} (Skor: ${leukopenia === 999 ? "RED FLAG" : leukopenia})`);
    symptomRecords.push(`Usia Pasien: ${usiaLabel} (Skor: ${usia})`);
    symptomRecords.push(`Jarak Kemo Terakhir: ${kemoLabel}`);
    symptomRecords.push(`Kemampuan Fisik Harian (ECOG): ${ecogLabel} (Skor: ${ecog})`);

    symptomRecords.forEach((record) => {
      const isPage1 = (doc.internal as any).getCurrentPageInfo().pageNumber === 1;
      const maxY = isPage1 ? 250 : 280;
      if (currentY > maxY) {
        doc.addPage();
        currentY = 20;

        doc.setFont("Helvetica", "italic");
        doc.setFontSize(7.5);
        doc.setTextColor(150, 150, 150);
        doc.text("Laporan Cek Mandiri Pasien Kemoterapi - KoncoKemo", marginX, 12);
        doc.setLineWidth(0.1);
        doc.setDrawColor(220, 220, 220);
        doc.line(marginX, 14, 190, 14);
        currentY = 22;
      }

      const colonIndex = record.indexOf(":");
      if (colonIndex !== -1) {
        const key = record.substring(0, colonIndex + 1);
        const value = record.substring(colonIndex + 1);

        doc.setFont("Helvetica", "bold");
        doc.text(key, marginX, currentY);
        
        doc.setFont("Helvetica", "normal");
        const wrappedValue = doc.splitTextToSize(value, 115);
        doc.text(wrappedValue, marginX + 55, currentY);

        currentY += 5.5 * wrappedValue.length + 1;
      } else {
        doc.setFont("Helvetica", "normal");
        const wrappedLine = doc.splitTextToSize(record, 170);
        doc.text(wrappedLine, marginX, currentY);
        currentY += 5.5 * wrappedLine.length + 1;
      }
    });

    const currentPageAfterSymptoms = (doc.internal as any).getCurrentPageInfo().pageNumber;

    // Draw Disclaimer on Page 1
    doc.setPage(1);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(109, 66, 170); // Theme color primary-600
    doc.text("Tetap Semangat, Anda Adalah Manusia Hebat. Kanker Bukanlah Akhir. Obat Paling Mujarab Adalah Keyakinan, Semangat Dan Harapan.", 105, 252, { align: "center" });

    doc.setFont("Helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(140, 140, 140);
    doc.setLineWidth(0.15);
    doc.setDrawColor(210, 210, 210);
    doc.line(marginX, 260, 190, 260);
    
    let tempY = 264.5;
    doc.text("Pernyataan Sanggahan (Disclaimer):", marginX, tempY);
    tempY += 4;
    doc.text("1. Laporan hasil cek risiko mandiri ini disusun oleh sistem berdasarkan isian data subjektif dari pasien.", marginX, tempY);
    tempY += 4;
    doc.text("2. Pengukuran ini bersifat sebagai skrining deteksi dini dan sama sekali bukan pengganti anjuran diagnosis atau perawatan medis oleh dokter.", marginX, tempY);
    tempY += 4;
    doc.text("3. Apabila pasien merasakan keluhan medis yang berkepanjangan, memburuk, atau darurat, harap segera kunjungi IGD rumah sakit terdekat.", marginX, tempY);

    // Force barcode card to be on page 2
    const totalPagesBeforeCard = doc.getNumberOfPages();
    if (totalPagesBeforeCard < 2) {
      doc.addPage();
    }
    doc.setPage(2);
    
    if (currentPageAfterSymptoms === 2) {
       currentY += 15;
       if (currentY > 200) {
           doc.addPage();
           doc.setPage(doc.getNumberOfPages());
           currentY = 25;
       }
    } else {
       currentY = 25;
    }

    doc.setFillColor(245, 243, 250); 
    doc.setDrawColor(214, 202, 236);
    doc.setLineWidth(0.6);
    doc.rect(marginX, currentY, 170, 52, "FD");

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9);
    doc.setFont("Helvetica", "normal");
    doc.text("Kalkulator Risiko Pasca Kemoterapi KoncoKemo ini disusun oleh", marginX + 5, currentY + 8);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Dr. dr. Shinta Oktya Wardhani, Sp.PD, K-HOM, FINASIM", marginX + 5, currentY + 14);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("REKOMENDASI TATALAKSANA BAGI DOKTER SILAHKAN SCAN BARCODE DISAMPING", marginX + 5, currentY + 22);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(180, 0, 0);
    doc.text("PERHATIAN:", marginX + 5, currentY + 28);

    doc.setFont("Helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    const textPerhatian = "Panduan tatalaksana ini hanya bersifat rekomendasi dan bukan tatalaksana baku. Tatalaksana yang diberikan bisa berbeda sesuai kondisi dan pertimbangan dokter penanggung jawab di faskes setempat. Oleh karena itu, rekomendasi hanya boleh diberikan oleh dokter yang berwenang. Demi kebaikan pasien, pasien dilarang membeli/mengonsumsi obat tanpa anjuran dokter";
    const splitPerhatian = doc.splitTextToSize(textPerhatian, 130);
    doc.text(splitPerhatian, marginX + 5, currentY + 32);

    const c = [];
    if (mualMuntah > 0) c.push("MM");
    if (diare === 2 || diare === 4) c.push("D1");
    if (diare === 7) c.push("D2");
    if (nyeriSkala === 1) c.push("N1");
    if (nyeriSkala === 3) c.push("N2");
    if (nyeriSkala === 6) c.push("N3");
    if (mukositis > 0) c.push("S");
    if (Object.values(dehidrasi).some(v => v)) c.push("DH");
    if (sesak > 0 && sesak !== 999) c.push("SN");
    if (Object.values(pucat).some(v => v)) c.push("AN");
    if (leukopenia > 0 && leukopenia !== 999) c.push("LK");
    
    const isEmergencyForQR = Object.values(redFlags).some((val) => val === true) || sesak === 999 || leukopenia === 999;
    if (isEmergencyForQR) c.push("TB");

    const payloadObj = {
      n: nama.trim() || "Pasien",
      c
    };
    const b64Payload = btoa(unescape(encodeURIComponent(JSON.stringify(payloadObj))));

    let qrCodeUrl = "";
    try {
      qrCodeUrl = await QRCode.toDataURL(`https://koncokemo.com/tatalaksana?p=${b64Payload}`, { margin: 1, width: 300 });
    } catch (e) {
      console.error(e);
    }
    
    if (qrCodeUrl) {
      doc.addImage(qrCodeUrl, "PNG", marginX + 138, currentY + 18, 28, 28, undefined, "FAST");
      if (logoBase64 && logoBase64.startsWith("data:image/png")) {
        doc.addImage(logoBase64, "PNG", marginX + 149, currentY + 29, 6, 6, undefined, "FAST");
      }
    }

    const totalPages = (doc.internal as any).getNumberOfPages();
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
          // Add larger watermark logo
          doc.addImage(logoBase64, "PNG", 25, 45, 160, 160, undefined, "FAST");
        }
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(65);
        doc.text("Hak Cipta KoncoKemo", 105, 150, { align: "center", angle: 45 });
        doc.restoreGraphicsState();
    }

    const slug = (nama.trim() || "Pasien").replace(/\s+/g, "_");
    const fileName = `Skrining_CekMandiri_${slug}.pdf`;

    // Use Blob for mobile compatibility (iOS Safari can open this inside the same frame/new tab)
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);

    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }

    setPdfUrl(url);
    setPdfFileName(fileName);
    setIsModalOpen(true);
    } catch (err) {
      console.error("Gagal membuat PDF:", err);
      alert("Maaf, terjadi kesalahan saat membuat PDF. Mohon coba lagi.");
    }
  };

  return (    <div className="max-w-7xl mx-auto px-[0.5rem] sm:px-[1rem] md:px-[2rem] lg:px-[3rem]">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-[1rem] sm:p-[1.5rem] md:p-[2rem]">
        
        {/* Judul & Deskripsi Utama */}
        <div className="mb-[1.5rem] md:mb-[2.5rem] pb-[1rem] border-b border-gray-100">
          <h1 className="text-[1.5rem] sm:text-[1.75rem] md:text-[2.25rem] font-display font-bold text-primary-900 mb-[0.25rem]">
          Cek Risiko Mandiri
          </h1>
          <p className="text-[0.875rem] sm:text-[1rem] text-gray-600 max-w-3xl leading-relaxed">
            Membantu mengukur tingkat risiko kondisi pasca kemoterapi Anda secara mandiri. 
          </p>
        </div>

        {/* Input Nama Langsung (Tanpa Card Section) */}
        <div className="mb-[2rem] md:mb-[2.5rem]">
           <div className="max-w-md">
              <Input
                label="Nama Lengkap Pasien"
                placeholder="Masukkan nama lengkap pasien..."
                value={nama}
                onChange={(e) => setNama(e.target.value)}
              />
           </div>
        </div>

        <form className="space-y-[2rem] sm:space-y-[2.5rem] md:space-y-[3rem]">
          
          {/* TAHAP 1 - RED FLAG */}
          <section>
             <h2 className="text-[1.125rem] sm:text-[1.25rem] font-bold text-red-600 mb-[0.75rem] flex items-center gap-[0.5rem]">
               <span className="w-[1.75rem] h-[1.75rem] sm:w-[2rem] sm:h-[2rem] rounded-full bg-red-100 flex items-center justify-center text-red-600 text-[0.875rem]">1</span>
               Tahap 1: Tanda Bahaya / Darurat (Red Flags)
             </h2>
             <p className="text-[0.75rem] text-gray-500 mb-[1rem] ml-[0.25rem] sm:ml-[1.5rem] md:ml-[2.5rem]">Pilih jika Anda mengalami satu atau lebih gejala di bawah ini.</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-[0.5rem] sm:gap-[1rem] ml-[0.25rem] sm:ml-[1.5rem] md:ml-[2.5rem]">
                {[
                  { id: "demam", label: "Demam ≥ 38°C dan riwayat leukosit rendah/neutropenia" },
                  { id: "sesakIstirahat", label: "Sesak saat beristirahat" },
                  { id: "tidakJalan", label: "Tidak mampu berjalan ±20 meter karena sesak" },
                  { id: "tidakMinum", label: "Tidak bisa minum selama >12 jam" },
                  { id: "tidakBAK", label: "Tidak buang air kecil selama >12 jam" },
                  { id: "muntahTerus", label: "Muntah terus menerus hingga tidak bisa makan/minum" },
                  { id: "muntahDarah", label: "Muntah berdarah" },
                  { id: "babHitam", label: "Buang air besar / feses berwarna hitam" },
                  { id: "mimisan", label: "Mimisan yang tidak berhenti" },
                  { id: "penurunanKesadaran", label: "Penurunan kesadaran, mengigau, atau sangat sulit dibangunkan" }
                ].map(item => (
                  <label key={item.id} className="flex items-start gap-[0.5rem] sm:gap-[0.75rem] cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="mt-1 w-[1rem] h-[1rem] sm:w-[1.25rem] sm:h-[1.25rem] rounded border-gray-300 text-red-600 focus:ring-red-500"
                      checked={!!redFlags[item.id]}
                      onChange={(e) => setRedFlags({...redFlags, [item.id]: e.target.checked})}
                    />
                    <span className="text-[0.875rem] sm:text-[1rem] text-gray-700 group-hover:text-gray-900">{item.label}</span>
                  </label>
                ))}
             </div>
          </section>

          {/* TAHAP 2 - SYMPTOM SCORING */}
          <section>
            <h2 className="text-[1.125rem] sm:text-[1.25rem] font-bold text-primary-800 mb-[1rem] sm:mb-[1.5rem] flex items-center gap-[0.5rem]">
               <span className="w-[1.75rem] h-[1.75rem] sm:w-[2rem] sm:h-[2rem] rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-[0.875rem]">2</span>
               Tahap 2: Penilaian Gejala (Symptom Scoring)
             </h2>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[2rem] sm:gap-x-[3rem] gap-y-[1.5rem] sm:gap-y-[2.5rem] pl-[0.25rem] sm:pl-[1.5rem] md:pl-[2.5rem]">
                
               {/* Mual Muntah */}
               <div className="space-y-[0.5rem] sm:space-y-[0.75rem]">
                 <label className="block text-[0.875rem] sm:text-[1rem] font-semibold text-gray-900">Mual / Muntah</label>
                 <select 
                   className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-[0.5rem] sm:py-[0.75rem] text-[0.875rem] sm:text-[1rem]"
                   value={mualMuntah} 
                   onChange={(e) => setMualMuntah(Number(e.target.value))}
                 >
                   <option value={0}>Tidak ada (Skor 0)</option>
                   <option value={3}>Muntah 1-3x sehari (Skor 3)</option>
                   <option value={5}>Muntah 4-6x sehari (Skor 5)</option>
                   <option value={7}>Muntah &gt;6x sehari (Skor 7)</option>
                 </select>
               </div>

               {/* Diare */}
               <div className="space-y-[0.5rem] sm:space-y-[0.75rem]">
                 <label className="block text-[0.875rem] sm:text-[1rem] font-semibold text-gray-900">Diare</label>
                 <select 
                   className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-[0.5rem] sm:py-[0.75rem] text-[0.875rem] sm:text-[1rem]"
                   value={diare} 
                   onChange={(e) => setDiare(Number(e.target.value))}
                 >
                   <option value={0}>Tidak ada diare (Skor 0)</option>
                   <option value={2}>1-3x lebih banyak dari biasanya (Skor 2)</option>
                   <option value={4}>4-6x lebih banyak dari biasanya (Skor 4)</option>
                   <option value={7}>Lebih dari 6x sehari (Skor 7)</option>
                 </select>
               </div>

               {/* Nyeri */}
               <div className="space-y-[0.75rem] sm:space-y-[1rem]">
                 <label className="block text-[0.875rem] sm:text-[1rem] font-semibold text-gray-900">Nyeri Badan</label>
                 <select 
                   className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-[0.5rem] sm:py-[0.75rem] text-[0.875rem] sm:text-[1rem] mb-1"
                   value={nyeriSkala} 
                   onChange={(e) => setNyeriSkala(Number(e.target.value))}
                 >
                   <option value={0}>Skala 0 / Tidak ada nyeri (Skor 0)</option>
                   <option value={1}>Skala 1-3 / Nyeri ringan (Skor 1)</option>
                   <option value={3}>Skala 4-6 / Nyeri sedang (Skor 3)</option>
                   <option value={6}>Skala 7-10 / Nyeri hebat (Skor 6)</option>
                 </select>
                 <label className={`flex items-center gap-[0.5rem] sm:gap-[0.75rem] cursor-pointer ${nyeriSkala === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <input 
                      type="checkbox" 
                      className="w-[1rem] h-[1rem] sm:w-[1.25rem] sm:h-[1.25rem] rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50"
                      checked={nyeriSkala === 0 ? false : nyeriTidur}
                      onChange={(e) => setNyeriTidur(e.target.checked)}
                      disabled={nyeriSkala === 0}
                    />
                    <span className="text-[0.75rem] sm:text-[0.875rem] text-gray-700">Nyeri mengganggu tidur Anda (+2)</span>
                 </label>
                 <label className={`flex items-center gap-[0.5rem] sm:gap-[0.75rem] cursor-pointer ${nyeriSkala === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <input 
                      type="checkbox" 
                      className="w-[1rem] h-[1rem] sm:w-[1.25rem] sm:h-[1.25rem] rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50"
                      checked={nyeriSkala === 0 ? false : nyeriAktivitas}
                      onChange={(e) => setNyeriAktivitas(e.target.checked)}
                      disabled={nyeriSkala === 0}
                    />
                    <span className="text-[0.75rem] sm:text-[0.875rem] text-gray-700">Nyeri mengganggu aktivitas harian (+2)</span>
                 </label>
               </div>

               {/* Mukositis / Sariawan */}
               <div className="space-y-[0.5rem] sm:space-y-[0.75rem]">
                 <label className="block text-[0.875rem] sm:text-[1rem] font-semibold text-gray-900">Sariawan / Luka Mulut</label>
                 <select 
                   className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-[0.5rem] sm:py-[0.75rem] text-[0.875rem] sm:text-[1rem]"
                   value={mukositis} 
                   onChange={(e) => setMukositis(Number(e.target.value))}
                 >
                   <option value={0}>Tidak ada (Skor 0)</option>
                   <option value={1}>Kemerahan ringan di mulut (Skor 1)</option>
                   <option value={3}>Luka sariawan ringan (Skor 3)</option>
                   <option value={5}>Luka menyulitkan makan (Skor 5)</option>
                   <option value={7}>Tidak bisa makan/minum karena luka (Skor 7)</option>
                 </select>
               </div>

                {/* Dehidrasi */}
                <div className="space-y-[0.5rem] sm:space-y-[0.75rem]">
                 <label className="block text-[0.875rem] sm:text-[1rem] font-semibold text-gray-900 mb-1">Tanda-tanda Dehidrasi</label>
                 <div className="space-y-[0.5rem]">
                  <label className="flex items-center gap-[0.5rem] sm:gap-[0.75rem] cursor-pointer group">
                      <input type="checkbox" className="w-[1rem] h-[1rem] sm:w-[1.25rem] sm:h-[1.25rem] rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={!!dehidrasi["haus"]} onChange={(e) => setDehidrasi({...dehidrasi, "haus": e.target.checked})} />
                      <span className="text-[0.75rem] sm:text-[0.875rem] text-gray-700 group-hover:text-gray-900">Terus menerus merasa haus (+1)</span>
                  </label>
                  <label className="flex items-center gap-[0.5rem] sm:gap-[0.75rem] cursor-pointer group">
                      <input type="checkbox" className="w-[1rem] h-[1rem] sm:w-[1.25rem] sm:h-[1.25rem] rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={!!dehidrasi["mulutKering"]} onChange={(e) => setDehidrasi({...dehidrasi, "mulutKering": e.target.checked})} />
                      <span className="text-[0.75rem] sm:text-[0.875rem] text-gray-700 group-hover:text-gray-900">Mulut dan bibir terasa sangat kering (+1)</span>
                  </label>
                  <label className="flex items-center gap-[0.5rem] sm:gap-[0.75rem] cursor-pointer group">
                      <input type="checkbox" className="w-[1rem] h-[1rem] sm:w-[1.25rem] sm:h-[1.25rem] rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={!!dehidrasi["bakBerkurang"]} onChange={(e) => setDehidrasi({...dehidrasi, "bakBerkurang": e.target.checked})} />
                      <span className="text-[0.75rem] sm:text-[0.875rem] text-gray-700 group-hover:text-gray-900">Buang air kecil berkurang drastis (+3)</span>
                  </label>
                  <label className="flex items-center gap-[0.5rem] sm:gap-[0.75rem] cursor-pointer group">
                      <input type="checkbox" className="w-[1rem] h-[1rem] sm:w-[1.25rem] sm:h-[1.25rem] rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={!!dehidrasi["pusingBerdri"]} onChange={(e) => setDehidrasi({...dehidrasi, "pusingBerdri": e.target.checked})} />
                      <span className="text-[0.75rem] sm:text-[0.875rem] text-gray-700 group-hover:text-gray-900">Pusing saat berubah posisi berdiri (+3)</span>
                  </label>
                 </div>
               </div>

                {/* Sesak Napas */}
                <div className="space-y-[0.5rem] sm:space-y-[0.75rem]">
                 <label className="block text-[0.875rem] sm:text-[1rem] font-semibold text-gray-900">Sesak Napas</label>
                 <select 
                   className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-[0.5rem] sm:py-[0.75rem] text-[0.875rem] sm:text-[1rem]"
                   value={sesak} 
                   onChange={(e) => setSesak(Number(e.target.value))}
                 >
                   <option value={0}>Tidak ada sesak (Skor 0)</option>
                   <option value={2}>Sesak saat aktivitas berat (Skor 2)</option>
                   <option value={5}>Sesak saat aktivitas ringan (Skor 5)</option>
                   <option value={999}>Sesak saat beristirahat (RED FLAG)</option>
                 </select>
               </div>

               {/* Pucat / Anemia */}
               <div className="space-y-[0.5rem] sm:space-y-[0.75rem]">
                 <label className="block text-[0.875rem] sm:text-[1rem] font-semibold text-gray-900 mb-1">Pucat / Indikasi Anemia</label>
                 <div className="space-y-[0.5rem]">
                  <label className="flex items-center gap-[0.5rem] sm:gap-[0.75rem] cursor-pointer group">
                      <input type="checkbox" className="w-[1rem] h-[1rem] sm:w-[1.25rem] sm:h-[1.25rem] rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={!!pucat["pucat"]} onChange={(e) => setPucat({...pucat, "pucat": e.target.checked})} />
                      <span className="text-[0.75rem] sm:text-[0.875rem] text-gray-700 group-hover:text-gray-900">Kulit terlihat lebih pucat (+1)</span>
                  </label>
                  <label className="flex items-center gap-[0.5rem] sm:gap-[0.75rem] cursor-pointer group">
                      <input type="checkbox" className="w-[1rem] h-[1rem] sm:w-[1.25rem] sm:h-[1.25rem] rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={!!pucat["lelah"]} onChange={(e) => setPucat({...pucat, "lelah": e.target.checked})} />
                      <span className="text-[0.75rem] sm:text-[0.875rem] text-gray-700 group-hover:text-gray-900">Badan sangat mudah lelah (+2)</span>
                  </label>
                  <label className="flex items-center gap-[0.5rem] sm:gap-[0.75rem] cursor-pointer group">
                      <input type="checkbox" className="w-[1rem] h-[1rem] sm:w-[1.25rem] sm:h-[1.25rem] rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={!!pucat["berdebar"]} onChange={(e) => setPucat({...pucat, "berdebar": e.target.checked})} />
                      <span className="text-[0.75rem] sm:text-[0.875rem] text-gray-700 group-hover:text-gray-900">Jantung berdebar saat aktivitas ringan (+4)</span>
                  </label>
                 </div>
               </div>

               {/* Leukopenia */}
               <div className="space-y-[0.5rem] sm:space-y-[0.75rem]">
                 <label className="block text-[0.875rem] sm:text-[1rem] font-semibold text-gray-900">Leukopenia (Sel Darah Putih Rendah)</label>
                 <select 
                   className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-[0.5rem] sm:py-[0.75rem] text-[0.875rem] sm:text-[1rem]"
                   value={leukopenia} 
                   onChange={(e) => setLeukopenia(Number(e.target.value))}
                 >
                   <option value={0}>Kadar normal atau Tidak Tahu (Skor 0)</option>
                   <option value={3}>Leukosit rendah namun tanpa gejala (Skor 3)</option>
                   <option value={4}>Leukosit rendah dan sedang sariawan (Skor 4)</option>
                   <option value={4}>Leukosit rendah dan sedang diare (Skor 4)</option>
                   <option value={999}>Leukosit rendah disertai DEMAM (RED FLAG)</option>
                 </select>
               </div>

             </div>
          </section>

          {/* TAHAP 3 - MODIFIER */}
          <section>
            <h2 className="text-[1.125rem] sm:text-[1.25rem] font-bold text-primary-800 mb-[1rem] sm:mb-[1.5rem] flex items-center gap-[0.5rem]">
               <span className="w-[1.75rem] h-[1.75rem] sm:w-[2rem] sm:h-[2rem] rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-[0.875rem]">3</span>
               Tahap 3: Kondisi Pasien (Modifiers)
             </h2>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[2rem] sm:gap-x-[3rem] gap-y-[1.5rem] sm:gap-y-[2.5rem] pl-[0.25rem] sm:pl-[1.5rem] md:pl-[2.5rem]">
                {/* Usia */}
                <div className="space-y-[0.5rem] sm:space-y-[0.75rem]">
                 <label className="block text-[0.875rem] sm:text-[1rem] font-semibold text-gray-900">Usia Anda saat ini</label>
                 <select 
                   className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-[0.5rem] sm:py-[0.75rem] text-[0.875rem] sm:text-[1rem]"
                   value={usia} 
                   onChange={(e) => setUsia(Number(e.target.value))}
                 >
                   <option value={0}>Dibawah 65 Tahun (Skor 0)</option>
                   <option value={2}>65 Tahun ke atas (Skor 2)</option>
                 </select>
               </div>

               {/* Hari Kemo */}
               <div className="space-y-[0.5rem] sm:space-y-[0.75rem]">
                 <label className="block text-[0.875rem] sm:text-[1rem] font-semibold text-gray-900">Jarak Hari dari Sesi Kemo Terakhir</label>
                 <select 
                   className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-[0.5rem] sm:py-[0.75rem] text-[0.875rem] sm:text-[1rem]"
                   value={hariKemo} 
                   onChange={(e) => setHariKemo(Number(e.target.value))}
                 >
                   <option value={0}>1 - 3 hari (Skor 0)</option>
                   <option value={1}>4 - 7 hari (Skor 1)</option>
                   <option value={2}>8 - 14 hari (Skor 2)</option>
                   <option value={1}>Lebih dari 14 hari (Skor 1)</option>
                 </select>
               </div>

                 {/* ECOG */}
                 <div className="space-y-[0.5rem] sm:space-y-[0.75rem] md:col-span-2">
                  <label className="block text-[0.875rem] sm:text-[1rem] font-semibold text-gray-900">Kondisi Fisik Umum (ECOG)</label>
                  <select 
                    className="w-full md:w-1/2 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-[0.5rem] sm:py-[0.75rem] text-[0.875rem] sm:text-[1rem]"
                    value={ecog} 
                    onChange={(e) => setEcog(Number(e.target.value))}
                  >
                    <option value={0}>Aktivitas normal seperti biasa (Skor 0)</option>
                    <option value={2}>Lebih banyak menghabiskan waktu duduk / berbaring (Skor 2)</option>
                    <option value={5}>Membutuhkan bantuan untuk aktivitas sehari-hari (Skor 5)</option>
                  </select>
                </div>
             </div>
          </section>

          {/* TAHAP 4 - INTERPRETASI (Automated Result) */}
          <section className="pt-[1.5rem] mt-[2rem] border-t border-gray-200">
             {!showResult ? (
                <div className="flex justify-center py-[2rem]">
                  <button
                    type="button"
                    onClick={() => setShowResult(true)}
                    className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow px-[3rem] py-[1rem] font-bold text-[1.125rem] transition-colors duration-200 cursor-pointer"
                  >
                    Hitung Skor Risiko
                  </button>
                </div>
             ) : (
                <>
                  <h2 className="text-[1.25rem] sm:text-[1.5rem] font-bold text-gray-900 mb-[1.5rem] text-center">
                     Hasil Simpulan Kondisi Anda
                  </h2>
                  
                  <div className="flex flex-col items-center">
                    <div className={`p-[1rem] sm:p-[2rem] rounded-2xl border-2 transition-colors ${result.color} text-center shadow-sm w-full max-w-3xl`}>
                       {!result.isEmergency ? (
                          <div className="mb-[1rem]">
                            <span className="text-[0.75rem] sm:text-[0.875rem] font-medium opacity-80 uppercase tracking-widest">Skor Risiko Anda</span>
                            <div className="text-[3rem] sm:text-[4rem] font-display font-bold my-[0.5rem]">{result.score}</div>
                          </div>
                       ) : (
                          <div className="mb-[1rem]">
                             <div className="mb-[0.5rem] text-red-600 font-bold tracking-widest uppercase items-center gap-[0.5rem] flex justify-center text-[0.875rem] sm:text-[1.125rem]">
                                ⚠️ Tanda Bahaya Terdeteksi
                             </div>
                             <div className="text-[1.5rem] sm:text-[2rem] font-display font-bold my-[0.25rem] text-red-900">Skor: {result.score}</div>
                          </div>
                       )}
                       <h3 className="text-[1.125rem] sm:text-[1.5rem] font-bold mb-[0.75rem] uppercase">{result.risk}</h3>
                       <p className="text-[0.875rem] sm:text-[1rem] font-medium opacity-90 leading-relaxed bg-white/40 p-[0.75rem] sm:p-[1rem] rounded-lg">
                         {result.action}
                       </p>
                    </div>

                    <button
                      type="button"
                      onClick={downloadPDF}
                      className="mt-[1.5rem] bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow px-[2rem] py-[0.8rem] font-semibold transition-colors duration-200 cursor-pointer text-base text-center"
                    >
                      Unduh Laporan Hasil (PDF)
                    </button>
                  </div>
                </>
             )}
          </section>

        </form>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#0f0a19]/60 backdrop-blur-sm"
              id="pdf-backdrop"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-primary-100 overflow-hidden z-10 mx-auto"
              id="pdf-modal-container"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-950 to-primary-800 px-6 py-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <FileText className="w-6 h-6 text-primary-200" id="pdf-icon-header" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-display font-semibold text-lg leading-snug text-white">Laporan Hasil Siap!</h3>
                    <p className="text-xs text-primary-200">Pilih opsi penyimpanan yang sesuai</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-white"
                  title="Tutup"
                  id="pdf-btn-close-header"
                >
                  <X className="w-5 h-5 flex items-center justify-center" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 flex items-start gap-3">
                  <Smartphone className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" id="pdf-device-icon" />
                  <p className="text-xs text-primary-900 leading-relaxed font-sans text-left">
                    <strong>Penting untuk pengguna HP (iPhone/Android/Tablet):</strong> Gunakan tombol <strong>Buka di Tab Baru</strong> jika unduhan langsung terhambat. Anda dapat melihat laporannya secara utuh dan membagikannya secara langsung.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Option 1: Open in New Tab (Recommended for Mobile) */}
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-left p-4 rounded-xl border-2 border-primary-600 hover:bg-primary-50 transition-colors flex items-start gap-4 cursor-pointer group"
                    id="pdf-option-tab"
                  >
                    <div className="p-2.5 bg-primary-100 text-primary-700 rounded-lg group-hover:bg-primary-200 transition-colors shrink-0">
                      <ExternalLink className="w-6 h-6" />
                    </div>
                    <div className="w-full text-left">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">Buka di Tab Baru</span>
                        <span className="bg-primary-100 text-primary-800 text-[10px] px-2 py-0.5 rounded-full font-medium border border-primary-200">
                          Rekomendasi HP & Tablet
                        </span>
                      </div>
                      <p className="text-xs text-gray-650 mt-1 leading-relaxed">
                        Membuka file PDF langsung di browser. Anda bisa langsung membagikan hasil skrining ke WhatsApp/Email, mencetak, atau menyimpannya di file perangkat dengan mudah.
                      </p>
                    </div>
                  </a>

                  {/* Option 2: Direct Download */}
                  <a
                    href={pdfUrl}
                    download={pdfFileName}
                    className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-primary-500 hover:bg-gray-50 transition-colors flex items-start gap-4 cursor-pointer group"
                    id="pdf-option-download"
                  >
                    <div className="p-2.5 bg-gray-100 text-gray-600 rounded-lg group-hover:bg-primary-50 group-hover:text-primary-700 transition-colors shrink-0">
                      <Download className="w-6 h-6" />
                    </div>
                    <div className="w-full text-left">
                      <span className="font-semibold text-gray-900 text-sm">Unduh / Simpan Langsung</span>
                      <p className="text-xs text-gray-650 mt-1 leading-relaxed">
                        Mengunduh file PDF secara otomatis ke folder unduhan perangkat Anda. Sangat ideal untuk pengguna komputer / laptop desktop.
                      </p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                  id="pdf-btn-cancel"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}