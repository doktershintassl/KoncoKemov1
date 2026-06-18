import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Search, Check } from "lucide-react";
import { createPortal } from "react-dom";

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Pilih...",
  searchPlaceholder = "Cari..."
}: {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  searchPlaceholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  const filteredOptions = options.filter(opt => {
    const searchTarget = opt === 'Semua' ? placeholder : opt;
    return searchTarget.toLowerCase().includes(search.toLowerCase());
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    
    function updatePosition() {
      if (buttonRef.current && isOpen) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY + 8, // 8px gap
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
    }

    if (isOpen) {
      updatePosition();
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true); // capture scroll
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  // Reset search when opening
  useEffect(() => {
    if (isOpen) setSearch("");
  }, [isOpen]);

  const displayValue = value === 'Semua' ? placeholder : value;

  const dropdownMenu = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
           ref={dropdownRef}
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.2 }}
           className="absolute z-[99999] bg-white border border-gray-100 rounded-[1rem] shadow-xl overflow-hidden"
           style={{
             top: `${position.top}px`,
             left: `${position.left}px`,
             width: `${position.width}px`,
           }}
        >
          <div className="p-2 border-b border-gray-100 sticky top-0 bg-white z-10">
             <div className="relative">
               <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <input
                 type="text"
                 className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-[0.5rem] text-[0.875rem] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                 placeholder={searchPlaceholder}
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 autoFocus
               />
             </div>
          </div>
          <div className="max-h-[12.5rem] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {filteredOptions.length > 0 ? (
               filteredOptions.map((opt) => (
                 <button
                   key={opt}
                   onClick={() => {
                     onChange(opt);
                     setIsOpen(false);
                   }}
                   className={`w-full flex items-center justify-between text-left px-[0.75rem] py-[0.625rem] rounded-[0.5rem] text-[0.875rem] transition-colors ${value === opt ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                 >
                   <span className="truncate pr-2">{opt === 'Semua' ? placeholder : opt}</span>
                   {value === opt && <Check className="w-4 h-4 text-primary-600 flex-shrink-0" />}
                 </button>
               ))
            ) : (
               <div className="px-3 py-4 text-center text-sm text-gray-500">Tidak ada hasil</div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-[1rem] py-[0.75rem] md:py-[0.875rem] bg-white border border-gray-200 rounded-[0.75rem] md:rounded-[1rem] shadow-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-[0.875rem] md:text-[1rem] text-gray-700"
      >
        <span className="truncate pr-4">{displayValue}</span>
        <ChevronDown className={`w-[1.25rem] h-[1.25rem] text-gray-500 transition-transform duration-300 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {typeof window !== 'undefined' ? createPortal(dropdownMenu, document.body) : dropdownMenu}
    </>
  );
}
