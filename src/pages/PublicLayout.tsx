import { HeroSlider } from "../components/sections/HeroSlider";
import { CeritaKoncoHighlight } from "../components/sections/CeritaKoncoHighlight";
import { BeritaTerbaru } from "../components/sections/BeritaTerbaru";
import { SEO } from "../components/SEO";
import { siteConfig } from "../config/site";

export function PublicLayout() {
  return (
    <>
      <SEO 
        title="Beranda" 
        description={siteConfig.description}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "MedicalWebPage",
          "name": siteConfig.name,
          "description": siteConfig.description,
          "url": "https://koncokemo.com/",
          "publisher": {
            "@type": "Organization",
            "name": "KoncoKemo",
            "logo": {
              "@type": "ImageObject",
              "url": "https://lh3.googleusercontent.com/d/13A59jDQDvXFFvrpe9uvTdlusw3OKGM44"
            }
          }
        }}
      />
      <HeroSlider />
      <CeritaKoncoHighlight />
      <BeritaTerbaru />
    </>
  );
}
