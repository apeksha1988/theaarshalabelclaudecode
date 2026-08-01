import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Truck, ShieldCheck, Sparkles } from 'lucide-react';
import { applySeo } from '../lib/seo';

export default function AboutPage() {
  useEffect(() => {
    applySeo({
      title: 'About Us',
      description:
        'The Aarsha Label is a handcrafted Indian jewellery brand based in Bangalore, offering Kundan, Polki and Moissanite statement and bridal jewellery with real photos, premium packaging and free delivery across India.',
      path: '/about',
    });
  }, []);

  return (
    <div className="min-h-screen pt-32 pb-20" data-testid="about-page">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7A1F3D] mb-4">Our Story</p>
          <h1 className="text-4xl sm:text-5xl font-serif font-light tracking-tight text-[#1A1A1A] mb-4" data-testid="about-title">
            About The Aarsha Label
          </h1>
          <p className="text-[#666666] flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4 text-[#7A1F3D]" /> Handcrafted in India · Based in Bangalore, Karnataka
          </p>
        </div>

        <div className="space-y-6 text-[#444444] leading-relaxed">
          <p>
            The Aarsha Label is a homegrown Indian jewellery brand, created for women who love
            timeless, statement pieces without the heirloom price tag. Every design is handcrafted
            with care — from bridal Kundan and Polki sets to sparkling Moissanite necklaces,
            chandbali earrings, oxidised pieces and traditional hathphools.
          </p>
          <p>
            We started with a simple belief: buying jewellery online should feel as trustworthy as
            buying it in person. That's why every product you see is shot with <strong>real,
            in-hand photos</strong> — what you see is exactly what arrives at your door, beautifully
            packaged and ready to gift or wear.
          </p>
          <p>
            Based in <strong>Bangalore, Karnataka</strong>, we ship across India with free delivery
            and Cash on Delivery, so you can shop with confidence wherever you are.
          </p>
        </div>

        {/* What we stand for */}
        <div className="grid sm:grid-cols-2 gap-4 mt-12">
          {[
            { icon: Sparkles, title: 'Handcrafted Quality', text: 'Kundan, Polki, Moissanite & oxidised pieces, made in limited quantities.' },
            { icon: ShieldCheck, title: 'Real Photos, Real Trust', text: 'In-hand photography — what you see is what you receive.' },
            { icon: Truck, title: 'Free Delivery + COD', text: 'Shipped free across India, with Cash on Delivery available.' },
            { icon: MapPin, title: 'Made in India', text: 'Designed and handcrafted in India, based in Bangalore.' },
          ].map((f) => (
            <div key={f.title} className="bg-[#F5F0E6] p-6">
              <f.icon className="w-6 h-6 text-[#7A1F3D] mb-3" strokeWidth={1.6} />
              <h3 className="font-serif text-lg text-[#1A1A1A] mb-1">{f.title}</h3>
              <p className="text-sm text-[#666666] leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <Link
            to="/shop"
            className="inline-block bg-[#7A1F3D] text-white px-10 py-4 text-sm tracking-[0.1em] uppercase hover:bg-[#5C172E] transition-all duration-300"
          >
            Explore the Collection
          </Link>
          <p className="mt-4 text-sm text-[#666666]">
            Questions? <Link to="/contact" className="text-[#7A1F3D] hover:underline">Contact us</Link> or
            WhatsApp <a href="https://wa.me/917310768702" target="_blank" rel="noopener noreferrer" className="text-[#7A1F3D] hover:underline">+91 73107 68702</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
