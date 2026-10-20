import React from 'react';
import LegalPage from '../components/LegalPage';

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund & Return Policy"
      updated="October 2026"
      sections={[
        {
          body: [
            "At The Aarsha Label, every piece is handcrafted with care. We want you to love what you receive — so if something is wrong with your order, we'll make it right. Please read our simple 7-day policy below.",
          ],
        },
        {
          heading: '7-Day Exchange or Refund',
          body: [
            "You can request an exchange or refund within 7 days of delivery if your piece arrives with any of the following:",
          ],
          bullets: [
            "Damaged in transit.",
            "Wrong item — you received a different product from the one you ordered.",
            "A manufacturing defect.",
          ],
        },
        {
          heading: 'How It Works',
          body: [
            "Just email support@theaarshalabel.com or WhatsApp us at +91 73107 68702 within 7 days with your order number and a clear photo of the issue. For small items a photo is enough — no unboxing video required. (For higher-value sets, a short unboxing clip simply helps us resolve it faster, but it isn't mandatory.)",
            "Once approved, we'll offer you a free replacement of the same piece, or — if you prefer, or the piece is out of stock — a refund as Store Credit that you can use on anything in our store.",
          ],
        },
        {
          heading: 'Refunds — Store Credit',
          body: [
            "Approved refunds are issued as Store Credit (a credit note), valid for 6 months from the date of issuance and usable on any product.",
            "Please return the item unworn and in its original packaging. We carry out a quick quality check on arrival before issuing the replacement or credit.",
          ],
        },
        {
          heading: 'Order Cancellation',
          body: [
            "Orders can be cancelled any time before dispatch for a full refund to your original payment method. Once an order has been dispatched, it cannot be cancelled, but the 7-day policy above still protects you.",
          ],
        },
        {
          heading: 'Contact',
          body: [
            "For any questions about returns or refunds, reach us at support@theaarshalabel.com or via WhatsApp at +91 73107 68702. We're happy to help.",
          ],
        },
      ]}
    />
  );
}
