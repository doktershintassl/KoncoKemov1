import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

export const GreetingWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const photoUrl = "https://lh3.googleusercontent.com/d/1HFlg0M59eEdR-cgsfi6CSi2CjbB9oTPa";

  useEffect(() => {
    // Munculkan secara elegan setelah halaman dimuat
    const timer = setTimeout(() => setIsOpen(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bottom-0 right-0 md:right-6 z-50 flex flex-col md:flex-row items-end gap-0 pointer-events-none"
        >
          {/* Speech Bubble */}
          <div className="relative p-0.5 rounded-3xl pointer-events-auto -mb-2 md:mb-24 mr-4 md:-mr-6 lg:-mr-8">
            {/* Rotating Border */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  duration: 8,
                  ease: "linear"
                }}
                className="greeting-bubble-line"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-white p-3 md:p-5 rounded-3xl shadow-xl max-w-44 md:max-w-72 z-10"
            >
              <motion.button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                animate={{ 
                  backgroundColor: ["rgba(243, 244, 246, 1)", "rgba(254, 226, 226, 1)", "rgba(243, 244, 246, 1)"],
                  color: ["rgba(156, 163, 175, 1)", "rgba(220, 38, 38, 1)", "rgba(156, 163, 175, 1)"]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2,
                  ease: "easeInOut"
                }}
                className="absolute top-1.5 right-1.5 p-1 rounded-full transition-colors cursor-pointer z-30"
                title="Tutup"
              >
                <X size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" />
              </motion.button>
              <p className="text-xs md:text-sm text-gray-700 leading-relaxed font-medium mt-0.5 md:mt-2">
                "Tidaklah Allah menurunkan suatu penyakit, melainkan Dia juga menurunkan obatnya.”
              </p>
            </motion.div>
          </div>

          {/* Icon */}
          <div className="w-28 h-36 md:w-48 md:h-64 pointer-events-auto">
            <img 
              src={photoUrl} 
              alt="Greeting" 
              className="w-full h-full object-contain scale-x-[-1] drop-shadow-xl" 
              referrerPolicy="no-referrer" 
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
