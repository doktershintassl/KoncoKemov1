import { motion } from "motion/react";
import { useParams } from "react-router-dom";

export function SoonPage() {
  const { type } = useParams<{ type: string }>();

  const content = {
    "tanya-dokter": {
      title: "Tanya Dokter",
      description: "Tanyakan apapun pada dokter kami."
    },
    "kemonitas": {
      title: "Kemonitas",
      description: "Komunitas Pasien Kanker Berdaya, Saling Menguatkan dan Menumbuhkan Harapan."
    }
  };

  const pageContent = content[type as keyof typeof content] || { title: "Coming Soon", description: "Halaman ini akan segera hadir." };

  return (
    <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-20 flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100"
      >
        <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">{pageContent.title}</h1>
        <p className="text-xl text-gray-600 mb-8">{pageContent.description}</p>
        <div className="text-primary-600 font-bold text-lg bg-primary-50 px-6 py-3 rounded-full">
          Akan segera hadir
        </div>
      </motion.div>
    </main>
  );
}
