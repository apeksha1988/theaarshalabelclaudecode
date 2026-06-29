import React from 'react';
import LegalPage from '../components/LegalPage';

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund & Return Policy"
      updated="June 2026"
      sections={[
        {
          body: [
            "At The Aarsha Label, every piece is handcrafted with care. Because our jewellery is delicate and made in limited quantities, we follow the policy below for returns, exchanges, and refunds. Please read it carefully before placing an order.",
          ],
        },
        {
          heading: 'Returns & Exchanges',
          body: [
            "Due to the handcrafted nature and hygiene considerations of jewellery, we accept returns or exchanges only for items that arrive damaged, defective, or where an incorrect item was delivered.",
            "To be eligible, you must notify us within 3 days of delivery with clear unboxing photos/video and the order number. The item must be unused and returned in its original condition and packaging.",
            "We do not accept returns for change of mind, or on customized/made-to-order pieces and sale items.",
          ],
        },
        {
          heading: 'How to Request a Return',
          body: [
            "Email us at support@theaarshalabel.com or message us on WhatsApp with your order number and photos. Once approved, we will share return instructions. Return shipping for damaged/incorrect items is on us; we will arrange a replacement or refund.",
          ],
        },
        {
          heading: 'Refunds',
          body: [
            "Once your returned item is received and inspected (or a refund is approved), the refund is processed to your original payment method within 5–7 business days. Depending on your bank, it may take a few additional days to reflect.",
          ],
        },
        {
          heading: 'Order Cancellation',
          body: [
            "Orders can be cancelled for a full refund any time before dispatch. Once an order has been dispatched, it cannot be cancelled.",
          ],
        },
        {
          heading: 'Contact',
          body: [
            "For any questions about returns or refunds, reach us at support@theaarshalabel.com or via WhatsApp at +91 73107 68702.",
          ],
        },
      ]}
    />
  );
}
