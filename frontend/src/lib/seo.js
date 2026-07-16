// Lightweight per-page SEO: sets the document title, meta description,
// Open Graph tags and optional JSON-LD structured data. No dependencies.
const SITE = 'The Aarsha Label';
const BASE_URL = 'https://www.theaarshalabel.com';
const DEFAULT_TITLE = `${SITE} | Kundan, Polki & Moissanite Jewellery`;
const DEFAULT_DESCRIPTION =
  'Exquisite handcrafted Kundan, Polki, Moissanite and semi-precious stone jewellery, made with centuries of tradition. Free delivery across India.';

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

// Apply SEO tags for the current page. Call from a useEffect.
export function applySeo({ title, description, image, path, jsonLd } = {}) {
  const fullTitle = title ? `${title} | ${SITE}` : DEFAULT_TITLE;
  const desc = description || DEFAULT_DESCRIPTION;

  document.title = fullTitle;
  setMeta('name', 'description', desc);
  setMeta('property', 'og:title', fullTitle);
  setMeta('property', 'og:description', desc);
  setMeta('property', 'og:type', 'website');
  setMeta('property', 'og:site_name', SITE);
  setMeta('property', 'og:image', image ? (image.startsWith('http') ? image : BASE_URL + image) : `${BASE_URL}/images/logo.webp`);
  if (path !== undefined) setMeta('property', 'og:url', BASE_URL + path);
  setMeta('name', 'twitter:card', 'summary_large_image');

  const id = 'seo-jsonld';
  let script = document.getElementById(id);
  if (jsonLd) {
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = id;
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonLd);
  } else if (script) {
    script.remove();
  }
}

// schema.org Product structured data -> price/availability rich results.
export function productJsonLd(product) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: (product.images || []).map((i) => BASE_URL + i),
    description: product.description,
    brand: { '@type': 'Brand', name: SITE },
  };
  if (product.price !== null && product.price !== undefined) {
    data.offers = {
      '@type': 'Offer',
      url: `${BASE_URL}/product/${product.product_id}`,
      priceCurrency: product.currency || 'INR',
      price: (product.price / 100).toFixed(0),
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    };
  }
  return data;
}
