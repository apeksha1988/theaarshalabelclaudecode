import React from 'react';
import LegalPage from '../components/LegalPage';

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="June 2026"
      sections={[
        {
          body: [
            "These Terms & Conditions govern your use of The Aarsha's Label website and your purchases from us. By using this site or placing an order, you agree to these terms.",
          ],
        },
        {
          heading: 'Products & Pricing',
          body: [
            "We make every effort to display our products and their colours accurately; slight variation is natural for handcrafted jewellery and across screens. All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. We may update prices and product availability at any time.",
          ],
        },
        {
          heading: 'Orders & Payment',
          body: [
            "An order is confirmed once payment is successfully received through our payment partner, Razorpay. We reserve the right to refuse or cancel any order (for example, due to stock or pricing errors); in such cases, any amount paid will be refunded.",
          ],
        },
        {
          heading: 'Returns, Refunds & Shipping',
          body: [
            "Purchases are subject to our Refund & Return Policy and Shipping Policy, which form part of these terms.",
          ],
        },
        {
          heading: 'Intellectual Property',
          body: [
            "All content on this site — including images, designs, text, and logos — is the property of The Aarsha's Label and may not be used or reproduced without our written permission.",
          ],
        },
        {
          heading: 'Limitation of Liability & Governing Law',
          body: [
            "To the extent permitted by law, The Aarsha's Label is not liable for indirect or consequential losses arising from the use of this site or our products. These terms are governed by the laws of India, and any disputes are subject to the jurisdiction of the courts at our place of business.",
          ],
        },
        {
          heading: 'Contact',
          body: [
            "For any questions about these terms, contact us at support@theaarshalabel.com or +91 73107 68702.",
          ],
        },
      ]}
    />
  );
}
