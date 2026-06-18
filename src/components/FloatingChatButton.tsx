import { motion } from "motion/react";
import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

export function FloatingChatButton() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: [0, -25, 0] 
      }}
      transition={{
        opacity: { duration: 0.5 },
        scale: { duration: 0.5 },
        y: {
          duration: 0.6,
          repeat: Infinity,
          repeatDelay: 10,
          ease: "easeOut"
        }
      }}
      className="fixed bottom-6 right-6 z-[60] md:bottom-10 md:right-10"
    >
      <Link 
        to="/soon/sharing"
        className="group relative flex items-center bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden"
      >
        <div className="flex items-center h-[52px] sm:h-[60px]">
          {/* Icon Section (Always visible) */}
          <div className="flex items-center justify-center w-[52px] sm:w-[60px] flex-shrink-0">
            <div className="bg-white/20 p-2 rounded-full">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          {/* Text Section (Always visible) */}
          <div className="whitespace-nowrap overflow-hidden pr-6">
            <span className="font-bold text-sm sm:text-base">Ceritakan Kisahmu</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
