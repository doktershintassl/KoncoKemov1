import { motion } from "motion/react";
import { useEffect, useState } from "react";

export function SplashScreen() {
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    // Trigger the horizontal reveal exactly as the logo finishes its initial scale-in
    const timer = setTimeout(() => setReveal(true), 2100);
    return () => clearTimeout(timer);
  }, []);

  // Logo URL
  const logoUrl = "https://lh3.googleusercontent.com/d/13A59jDQDvXFFvrpe9uvTdlusw3OKGM44"; 

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
    >
      <div className="relative flex flex-col items-center">
        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="absolute -top-[2.8rem] whitespace-nowrap"
        >
          <span className="text-gray-400 font-sans text-xs sm:text-sm tracking-[0.25em] uppercase">
            Selamat Datang
          </span>
        </motion.div>

        {/* Logo and Text Wrapper */}
        <div className="flex items-center justify-center relative">
          
          {/* Static Logo Container avoids shifting math bugs */}
          <div className="z-20 bg-white relative shrink-0">
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              src={logoUrl} 
              alt="KoncoKemo Logo" 
              className="w-[3.5rem] h-[3.5rem] sm:w-[4.5rem] sm:h-[4.5rem] object-contain block"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Text Reveal Container  */}
          <div 
            className={`overflow-hidden flex items-center z-10 shrink-0 transition-all duration-[1200ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${
              reveal ? "w-[9.5rem] sm:w-[13rem] opacity-100" : "w-0 opacity-0"
            }`}
          >
            <div 
              className={`pl-3 pr-2 transition-transform duration-[1200ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${
                reveal ? "translate-x-0" : "-translate-x-[100%]"
              }`}
            >
              <span className="font-display font-bold text-2xl sm:text-[2.25rem] tracking-tight text-primary-900 whitespace-nowrap">
                KoncoKemo
              </span>
            </div>
          </div>

        </div>

        {/* Loading Indicator (Subtle) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.5, duration: 0.5 }}
          className="absolute -bottom-[3rem] flex gap-1"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
              className="w-1.5 h-1.5 rounded-full bg-primary-200"
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
