import { Helmet } from "react-helmet-async";

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
  image = "https://lh3.googleusercontent.com/d/13A59jDQDvXFFvrpe9uvTdlusw3OKGM44", // Fallback Logo
  url = "https://koncokemo.com",
  keywords = "konco kemo, koncokemo, kemoterapi, pasien kanker, kesehatan, cek mandiri kemoterapi, cerita konco, edukasi kemoterapi, pendampingan kanker, pusat edukasi kanker",
  jsonLd
}: SEOProps) {
  const pageTitle = title === name ? `${title} (Konco Kemo)` : `${title} | ${name} (Konco Kemo)`;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Facebook / Open Graph tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
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
