import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center px-4">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="text-9xl font-black font-display text-gray-900 leading-none mb-4"
      >
        404
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="text-gray-500 text-xl max-w-md mx-auto mb-8"
      >
        Halaman yang Anda cari tidak ditemukan atau telah dipindahkan.
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Link to="/">
          <Button variant="primary">Kembali ke Beranda</Button>
        </Link>
      </motion.div>
    </div>
  );
}
