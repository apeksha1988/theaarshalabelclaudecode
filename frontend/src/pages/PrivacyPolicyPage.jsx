import React from 'react';
import LegalPage from '../components/LegalPage';

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="June 2026"
      sections={[
        {
          body: [
            "The Aarsha's Label (\"we\", \"us\") respects your privacy. This policy explains what information we collect, how we use it, and your choices.",
          ],
        },
        {
          heading: 'Information We Collect',
          body: [
            "When you place an order or contact us, we collect your name, email address, phone number, and shipping address. When you create an account, we store your email and a securely hashed password.",
            "Payments are processed by our payment partner, Razorpay. We do not collect or store your card, UPI, or bank details on our servers.",
          ],
        },
        {
          heading: 'How We Use Your Information',
          body: [
            "We use your information to process and deliver your orders, send order confirmations and updates, respond to enquiries, and improve our service. We may contact you by email or WhatsApp about your order.",
          ],
        },
        {
          heading: 'Sharing',
          body: [
            "We share information only as needed to fulfil your order — for example, with our payment gateway (Razorpay), courier/logistics partners, and email/messaging providers. We do not sell your personal data.",
          ],
        },
        {
          heading: 'Data Security & Retention',
          body: [
            "We take reasonable measures to protect your information. Passwords are stored hashed, and payments are handled over secure, PCI-compliant infrastructure by Razorpay. We retain order information as required for our records and legal obligations.",
          ],
        },
        {
          heading: 'Your Rights & Contact',
          body: [
            "You may request access to, correction of, or deletion of your personal data by emailing support@theaarshalabel.com. We'll respond within a reasonable time.",
          ],
        },
      ]}
    />
  );
}
