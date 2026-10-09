import { Helmet } from "react-helmet-async";
import { ASSETS } from "../lib/assets";

interface SEOProps {
  title: string;
  description: string;
  name?: string;
  type?: string;
  image?: string;
  url?: string;
  keywords?: string;
  jsonLd?: Record<string, any>;
}

export function SEO({ 
  title, 
  description, 
  name = "KoncoKemo",
  type = "website",
  image = "https://www.koncokemo.com/icon.png", // Full URL needed for OG/Twitter
  url,
  keywords = "konco kemo, koncokemo, kemoterapi, pasien kanker, kesehatan, cek mandiri kemoterapi, cerita konco, edukasi kemoterapi, pendampingan kanker, pusat edukasi kanker",
  jsonLd
}: SEOProps) {
  const pageTitle = title === name ? title : `${name} | ${title}`;

  // Automatically resolve the canonical URL dynamically to https://www.koncokemo.com
  const rawUrl = url || (typeof window !== "undefined" && window.location?.pathname
    ? `https://www.koncokemo.com${window.location.pathname}`
    : "https://www.koncokemo.com/");

  const canonicalUrl = rawUrl.startsWith("https://koncokemo.com")
    ? rawUrl.replace("https://koncokemo.com", "https://www.koncokemo.com")
    : rawUrl;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Facebook / Open Graph tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={name} />

      {/* Twitter tags */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data (JSON-LD) for Search Engines & LLMs */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
