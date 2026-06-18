import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { ASSETS } from "../../lib/assets";

export function SplashScreen() {
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    // Trigger the horizontal reveal exactly as the logo finishes its initial scale-in
    const timer = setTimeout(() => setReveal(true), 2100);
    return () => clearTimeout(timer);
  }, []);

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
          <span className="text-gray-500 font-sans text-xs sm:text-sm tracking-[0.25em] uppercase">
            Selamat Datang
          </span>
        </motion.div>

        {/* Logo and Text Wrapper - Fixed width prevents CLS */}
        <div className="relative flex items-center justify-center w-[13rem] sm:w-[17.5rem] h-[3.5rem] sm:h-[4.5rem]">
          
          {/* Inner translating wrapper keeps logo and text strictly attached to avoid leaks */}
          <div 
            className={`flex items-center absolute left-0 top-0 h-full w-full transition-transform duration-[1200ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${
              reveal ? "translate-x-0" : "translate-x-[4.75rem] sm:translate-x-[6.5rem]"
            }`}
          >
            {/* Static Logo Container */}
            <div className="z-20 bg-white relative shrink-0">
              <motion.img 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                src={ASSETS.LOGO_KONCOKEMO} 
                alt="KoncoKemo Logo" 
                className="w-[3.5rem] h-[3.5rem] sm:w-[4.5rem] sm:h-[4.5rem] object-contain block relative z-20"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Text Reveal Mask - Unclips text seamlessly */}
            <div 
              className={`shrink-0 flex items-center overflow-hidden transition-[max-width,opacity] duration-[1200ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${
                reveal ? "max-w-[9.5rem] sm:max-w-[13rem] opacity-100" : "max-w-0 opacity-0"
              }`}
            >
              <div className="w-[9.5rem] sm:w-[13rem] pl-3 pr-2 shrink-0">
                <span className="font-display font-bold text-2xl sm:text-[2.25rem] tracking-tight text-primary-900 whitespace-nowrap block">
                  KoncoKemo
                </span>
              </div>
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
