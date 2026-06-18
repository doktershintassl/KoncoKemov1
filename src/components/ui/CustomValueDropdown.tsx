import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Check } from "lucide-react";
import { createPortal } from "react-dom";

export function CustomValueDropdown({
  value,
  onChange,
  options,
  placeholder = "Pilih atau ketik...",
  required = false,
  onSelectOption,
  onKeyDown,
  className = "w-full px-4 py-2 pr-10 bg-white border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
}: {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
  onSelectOption?: (val: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(value.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current && !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    
    function updatePosition() {
      if (containerRef.current && isOpen) {
        const rect = containerRef.current.getBoundingClientRect();
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

  const dropdownMenu = (
    <AnimatePresence>
      {isOpen && filteredOptions.length > 0 && (
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
          <div className="max-h-[12.5rem] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
             {filteredOptions.map((opt) => (
               <button
                 key={opt}
                 type="button"
                 onMouseDown={(e) => {
                   e.preventDefault(); // Prevent input onBlur from firing before click
                   onChange(opt);
                   if (onSelectOption) onSelectOption(opt);
                   setIsOpen(false);
                 }}
                 className={`w-full flex items-center justify-between text-left px-[0.75rem] py-[0.625rem] rounded-[0.5rem] text-[0.875rem] transition-colors ${value === opt ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
               >
                 <span className="truncate pr-2">{opt}</span>
                 {value === opt && <Check className="w-4 h-4 text-primary-600 flex-shrink-0" />}
               </button>
             ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={onKeyDown}
          className={className}
          placeholder={placeholder}
          required={required}
        />
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
               inputRef.current?.focus();
            }
          }}
          className="absolute right-2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </div>
      {typeof window !== 'undefined' ? createPortal(dropdownMenu, document.body) : dropdownMenu}
    </div>
  );
}
