// Google Analytics 4 (GA4) + Meta (Facebook) Pixel.
// IDs are read from build-time env vars; both no-op gracefully if unset.
const GA_ID = process.env.REACT_APP_GA_ID;
const PIXEL_ID = process.env.REACT_APP_META_PIXEL_ID;

let started = false;

export function initAnalytics() {
  if (started || typeof window === 'undefined') return;
  started = true;

  // --- Google Analytics 4 ---
  if (GA_ID) {
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    // We send page_view manually on route change (SPA).
    window.gtag('config', GA_ID, { send_page_view: false });
  }

  // --- Meta Pixel ---
  if (PIXEL_ID) {
    /* eslint-disable */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
      n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', PIXEL_ID);
  }
}

export function trackPageView(path) {
  if (GA_ID && window.gtag) window.gtag('event', 'page_view', { page_path: path });
  if (PIXEL_ID && window.fbq) window.fbq('track', 'PageView');
}

export function trackAddToCart(product, quantity = 1) {
  const value = (product.price || 0) / 100;
  if (window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'INR', value,
      items: [{ item_id: product.product_id, item_name: product.name, price: value, quantity }],
    });
  }
  if (window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_ids: [product.product_id], content_name: product.name,
      content_type: 'product', value, currency: 'INR',
    });
  }
}

export function trackBeginCheckout(items, value) {
  if (window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: 'INR', value,
      items: items.map((i) => ({ item_id: i.product_id, item_name: i.name, price: (i.price || 0) / 100, quantity: i.quantity })),
    });
  }
  if (window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      content_ids: items.map((i) => i.product_id), content_type: 'product',
      num_items: items.reduce((n, i) => n + i.quantity, 0), value, currency: 'INR',
    });
  }
}

export function trackPurchase(orderId, items, value) {
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: orderId, currency: 'INR', value,
      items: items.map((i) => ({ item_id: i.product_id, item_name: i.name, price: (i.price || 0) / 100, quantity: i.quantity })),
    });
  }
  if (window.fbq) {
    window.fbq('track', 'Purchase', {
      content_ids: items.map((i) => i.product_id), content_type: 'product',
      value, currency: 'INR',
    });
  }
}
