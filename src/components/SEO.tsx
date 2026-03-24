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

  return (
    <Helmet>
      {/* Standard metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {/* Security Headers (Simplified for Meta tags) */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta name="referrer" content="strict-origin-when-cross-origin" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

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
