import React from 'react';
import LegalPage from '../components/LegalPage';

export default function ShippingPolicyPage() {
  return (
    <LegalPage
      title="Shipping Policy"
      updated="June 2026"
      sections={[
        {
          heading: 'Processing Time',
          body: [
            "Orders are processed and dispatched within 2–5 business days of payment confirmation. Made-to-order or limited-edition pieces may take a little longer; we'll keep you updated.",
          ],
        },
        {
          heading: 'Delivery Time & Coverage',
          body: [
            "We currently ship across India. Estimated delivery is 5–10 business days from dispatch, depending on your location. Remote areas may take longer.",
            "You will receive tracking details by email/WhatsApp once your order ships.",
          ],
        },
        {
          heading: 'Shipping Charges',
          body: [
            "Shipping charges (if any) are shown at checkout before payment. We may offer free shipping on orders above a certain value — any such offer will be displayed at checkout.",
          ],
        },
        {
          heading: 'Delays',
          body: [
            "Once handed to the courier, delivery timelines are subject to the courier partner and conditions beyond our control (weather, festivals, regional restrictions). We'll do our best to help resolve any delays.",
          ],
        },
        {
          heading: 'Contact',
          body: [
            "Questions about your shipment? Email support@theaarshalabel.com or WhatsApp +91 73107 68702 with your order number.",
          ],
        },
      ]}
    />
  );
}
