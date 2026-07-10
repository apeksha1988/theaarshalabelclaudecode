// Builds "Order on WhatsApp" links with a pre-filled order message, so
// customers who don't want to pay online can order directly via chat.
// Override the number with REACT_APP_WHATSAPP_NUMBER; falls back to the store.
const DEFAULT_NUMBER = '917310768702';
const NUMBER = (process.env.REACT_APP_WHATSAPP_NUMBER || DEFAULT_NUMBER).replace(/[^0-9]/g, '');

const rupees = (paise) => `₹${(paise / 100).toLocaleString('en-IN')}`;

function waLink(text) {
  return `https://wa.me/${NUMBER}?text=${encodeURIComponent(text)}`;
}

// Order link for a single product from the product page.
export function productOrderLink(product, quantity = 1) {
  const lines = [
    "Hi! I'd like to place an order:",
    '',
    `*${product.name}*`,
    product.price != null ? `Price: ${rupees(product.price)}` : 'Price: On request',
    `Quantity: ${quantity}`,
    '',
    'Please help me complete my order. 🙏',
  ];
  return waLink(lines.join('\n'));
}

// Order link for the whole cart.
export function cartOrderLink(cartItems, cartTotal) {
  const items = cartItems.map(
    (it) => `• ${it.name} × ${it.quantity} — ${rupees(it.price * it.quantity)}`
  );
  const lines = [
    "Hi! I'd like to place an order:",
    '',
    ...items,
    '',
    `Total: ${rupees(cartTotal)}`,
    '',
    'Please help me complete my order. 🙏',
  ];
  return waLink(lines.join('\n'));
}
