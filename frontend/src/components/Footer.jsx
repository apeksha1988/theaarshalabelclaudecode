import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[#1A1A1A] text-[#EAE5D9]" data-testid="footer">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <h3 className="text-xl font-serif text-white mb-3">The Aarsha Label</h3>
            <p className="text-sm text-[#A89F92] leading-relaxed">
              Handcrafted Kundan, Polki &amp; contemporary jewellery — heritage craftsmanship for the modern woman.
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#A89F92] mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop" className="hover:text-white transition-colors">All Jewellery</Link></li>
              <li><Link to="/shop?category=premium_heritage" className="hover:text-white transition-colors">Premium Heritage</Link></li>
              <li><Link to="/shop?category=oxidised" className="hover:text-white transition-colors">Oxidised</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#A89F92] mb-4">Policies</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/refund-policy" className="hover:text-white transition-colors">Refund &amp; Return Policy</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-white transition-colors">Shipping Policy</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#A89F92] mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><a href="mailto:support@theaarshalabel.com" className="hover:text-white transition-colors">support@theaarshalabel.com</a></li>
              <li><a href="https://wa.me/917310768702" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp: +91 73107 68702</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#3a3530] mt-10 pt-6 text-xs text-[#A89F92] flex flex-col sm:flex-row justify-between gap-2">
          <span>© {year} The Aarsha Label. All rights reserved.</span>
          <span>Secure payments powered by Razorpay</span>
        </div>
      </div>
    </footer>
  );
}
