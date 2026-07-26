import React from 'react';
import LegalPage from '../components/LegalPage';

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund & Return Policy"
      updated="July 2026"
      sections={[
        {
          body: [
            "At The Aarsha Label, every piece is handcrafted with care and made in limited quantities. Because of the delicate, handcrafted nature and hygiene considerations of jewellery, please read our returns, exchange and refund policy carefully before placing an order.",
          ],
        },
        {
          heading: 'Returns & Exchanges',
          body: [
            "Returns and exchanges will only be accepted if:",
          ],
          bullets: [
            "The order was damaged in transit — we will need an unboxing video as proof.",
            "The order was incorrect — i.e. you received the wrong product from our end.",
          ],
        },
        {
          heading: 'Eligibility',
          body: [
            "If one of the above applies, you may return the order exactly as you received it, with the original packaging. The item should be unworn and the barcode attached with the product should be intact.",
            "Once we receive the product back, we will perform a quality check. If it passes the said check, we will replace the same product with a new one.",
          ],
        },
        {
          heading: 'Refunds — Store Credit',
          body: [
            "Refunds will only be issued as a CREDIT NOTE and not in the original payment mode.",
            "In case the product goes out of stock, we will refund the amount via Store Credit.",
            "Store Credit is valid for 3 months from the date of issuance.",
          ],
        },
        {
          heading: 'How to Request a Return',
          body: [
            "Email us at support@theaarshalabel.com or message us on WhatsApp at +91 73107 68702 with your order number, the unboxing video and clear photos. Once approved, we will share the return instructions.",
          ],
        },
        {
          heading: 'Order Cancellation',
          body: [
            "Orders can be cancelled any time before dispatch. Once an order has been dispatched, it cannot be cancelled.",
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
