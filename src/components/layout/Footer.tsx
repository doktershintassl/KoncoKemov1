import { siteConfig } from "../../config/site";
import { Link } from "react-router-dom";
import { Instagram, Youtube, MapPin, Mail, Phone } from "lucide-react";
import { ASSETS } from "../../lib/assets";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-300 pt-[2.5rem] md:pt-[3rem] relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-[16rem] h-[16rem] bg-primary-50 rounded-full blur-[4rem] -translate-x-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[24rem] h-[24rem] bg-primary-100 rounded-full blur-[4rem] translate-x-1/3 translate-y-1/3 opacity-50 pointer-events-none" />

      <div className="container mx-auto px-[1rem] sm:px-[1.5rem] lg:px-[3rem] relative z-10 pb-[1.5rem] md:pb-[2rem]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-[2.5rem] md:gap-[3rem] mb-[1.5rem] md:mb-[2rem]">
          <div className="md:col-span-2">
            <div className="flex items-center gap-[0.75rem] mb-[1rem] md:mb-[1.5rem]">
              <img src={ASSETS.LOGO_KONCOKEMO} alt="KoncoKemo Logo" className="w-[2rem] md:w-[2.5rem] h-[2rem] md:h-[2.5rem] object-contain" />
              <span className="font-display font-bold text-[1.125rem] md:text-[1.25rem] tracking-tight text-primary-900">
                {siteConfig.name}
              </span>
            </div>
            <p className="text-gray-500 max-w-sm text-[0.9375rem] md:text-[1rem] leading-relaxed">
              {siteConfig.footer.description}
            </p>
          </div>
          
          <div className="md:col-span-1">
            <h4 className="font-bold mb-[1rem] md:mb-[1.5rem] font-display text-gray-900 text-[1rem] md:text-[1.125rem]">Hubungi Kami</h4>
            <ul className="space-y-[0.75rem] md:space-y-[1rem] text-gray-500 text-[0.8125rem] md:text-[0.875rem]">
              <li className="flex items-center gap-[0.75rem]">
                <Mail className="w-[1rem] h-[1rem] text-primary-500" />
                <a 
                  href="mailto:koncocemo@gmail.com" 
                  onClick={(e) => {
                    const email = "koncocemo@gmail.com";
                    const start = Date.now();
                    window.location.href = `mailto:${email}`;
                    
                    // Deteksi jika mailto tidak terbuka
                    setTimeout(() => {
                      if (document.hasFocus() && Date.now() - start < 1000) {
                        window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`, '_blank');
                      }
                    }, 500);
                    e.preventDefault();
                  }}
                  className="hover:text-primary-600 transition-colors"
                  title="Kirim email ke koncocemo@gmail.com"
                >
                  koncocemo@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-[0.75rem]">
                <Phone className="w-[1rem] h-[1rem] text-primary-500" />
                <a 
                  href="https://wa.me/6285743147338" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-primary-600 transition-colors"
                >
                  +62 857 4314 7338
                </a>
              </li>
              <li className="flex items-start gap-[0.75rem]">
                <MapPin className="w-[1rem] h-[1rem] text-primary-500 mt-[0.25rem] shrink-0" />
                <a 
                  href="https://www.google.com/maps/dir/?api=1&destination=-7.972112409073089,112.63143155767145" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium hover:text-primary-600 transition-colors"
                >
                  Layanan Onkologi, Lantai 2 Gedung RSUD dr. Saiful Anwar (RSSA) Malang, Jl. Jaksa Agung Suprapto No. 2, Malang
                </a>
              </li>
              {/* Social icons hidden as requested until accounts are ready */}
              {false && (
                <li className="pt-[0.5rem] flex gap-[1rem]">
                  <a 
                    href="https://instagram.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-[2.25rem] h-[2.25rem] md:w-[2.5rem] md:h-[2.5rem] rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                  >
                    <Instagram className="w-[1.125rem] md:w-[1.25rem] h-[1.125rem] md:h-[1.25rem]" />
                    <span className="sr-only">Instagram</span>
                  </a>
                  <a 
                    href="https://youtube.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-[2.25rem] h-[2.25rem] md:w-[2.5rem] md:h-[2.5rem] rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                  >
                    <Youtube className="w-[1.125rem] md:w-[1.25rem] h-[1.125rem] md:h-[1.25rem]" />
                    <span className="sr-only">YouTube</span>
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div className="md:col-span-1">
            <div className="w-full h-[10rem] md:h-[12rem] rounded-[1rem] md:rounded-[1.5rem] overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-all duration-500">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3951.2721!2d112.6314!3d-7.9721!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd628114979e2a9%3A0xbcc0e1e9a3d46f53!2sRSUD%20Dr.%20Saiful%20Anwar!5e0!3m2!1sid!2sid!4v1717651200000!5m2!1sid!2sid" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Peta Lokasi KoncoKemo di RSSA Malang"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border-t border-gray-100 py-[1.5rem] md:py-[2rem]">
        <div className="container mx-auto px-[1rem] sm:px-[1.5rem] lg:px-[3rem] flex flex-col leading-none items-center justify-center gap-[1rem] text-center">
          <p className="text-gray-500 text-[0.875rem] md:text-[1rem] leading-none font-medium">
            &copy; 2026 KoncoKemo
          </p>
          
          <a href="https://maindi.id" target="_blank" rel="noopener noreferrer" className="flex items-center gap-[0.5rem] text-gray-500 text-[0.8125rem] md:text-[0.875rem] hover:text-primary-600 transition-colors">
            Dikembangkan oleh Maindi.id
            <img 
              src={ASSETS.LOGO_MAINDI} 
              alt="Logo Maindi" 
              className="h-[1.5rem] w-[1.5rem] md:h-[1.75rem] md:w-[1.75rem] p-[0.125rem] bg-white rounded-full border border-gray-100 object-contain shadow-sm"
              referrerPolicy="no-referrer"
            />
          </a>

          <Link to="/login" className="hidden text-gray-400 hover:text-primary-600 text-[0.75rem] md:text-[0.8125rem] transition-colors uppercase tracking-widest font-bold">
            Admin Panel
          </Link>
        </div>
      </div>
    </footer>
  );
}