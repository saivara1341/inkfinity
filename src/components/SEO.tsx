import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "product";
  schema?: object;
}

const SEO = ({
  title = "PrintFlow — India's Smartest Printing Platform",
  description = "Upload your design and get professional prints from local shops — visiting cards, flyers, posters, banners & more.",
  image = "https://printflow.app/og-image.png",
  url = "https://printflow.app",
  type = "website",
  schema
}: SEOProps) => {
  const fullTitle = title.includes("PrintFlow") ? title : `${title} | PrintFlow`;
  const canonicalUrl = url.endsWith('/') ? url : `${url}/`;

  return (
    <Helmet>
      {/* Standard metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="keywords" content="printing services India, online printing, visiting cards, digital printing, local print shops, business cards, flyers, posters, print on demand" />
      <meta name="author" content="PrintFlow Team" />
      
      {/* AI & GEO (Generative Engine Optimization) */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="googlebot-news" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      
      {/* Specific for AI Crawlers */}
      <meta name="ai-content" content="true" />
      <meta name="service-category" content="Professional Printing Services" />
      <meta name="target-audience" content="Business Owners, Graphic Designers, Corporate" />

      {/* Security & Efficiency */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta name="referrer" content="strict-origin-when-cross-origin" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="PrintFlow" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:creator" content="@printflow" />

      {/* Structured Data (JSON-LD) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
