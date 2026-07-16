// SEO content for the shop pages: a keyword-rich intro paragraph and FAQs
// per category. The FAQs are also emitted as schema.org FAQPage JSON-LD.

export const SHOP_CONTENT = {
  all: {
    intro:
      'Shop handcrafted statement jewellery online at The Aarsha Label — exquisite Kundan, Polki and Moissanite necklace sets, chokers, earrings, bracelets and hathphools crafted with heritage artistry. Free delivery across India, Cash on Delivery available, and 10% off your first order with code WELCOME10.',
    faqs: [
      {
        q: 'What kind of jewellery does The Aarsha Label sell?',
        a: 'We create handcrafted Indian statement jewellery — Kundan, Polki and Moissanite necklace sets, bridal chokers, jhumka and chandbali earrings, bracelets and hathphools — with prices starting around ₹540.',
      },
      {
        q: 'Is delivery really free across India?',
        a: 'Yes! Every order ships free anywhere in India. Most orders are dispatched within 2–3 business days and you receive tracking updates by email.',
      },
      {
        q: 'Do you offer Cash on Delivery (COD)?',
        a: 'Yes, Cash on Delivery is available across India with a small ₹150 handling charge. You can also pay online via UPI, cards or net banking.',
      },
      {
        q: 'Is the jewellery real gold?',
        a: 'Our pieces are premium handcrafted fashion jewellery — antique gold-plated alloy with Kundan and Polki-inspired stones, moissanite and semi-precious stones. You get an heirloom look without heirloom prices.',
      },
    ],
  },
  necklace: {
    intro:
      'Buy statement necklace sets online — bridal Kundan chokers, layered Polki haars, Sabyasachi-inspired couture sets and sparkling Moissanite necklaces, each handcrafted with antique gold detailing. Most sets include matching earrings. Free delivery across India.',
    faqs: [
      {
        q: 'Do necklace sets include matching earrings?',
        a: 'Yes — almost all our necklace sets come with matching earrings, so you get a complete, ready-to-wear look.',
      },
      {
        q: 'Which necklace is best for a bride?',
        a: 'For weddings, our Kundan and Polki chokers and layered haar sets are most loved — statement pieces designed for bridal and festive wear. The Sabyasachi-inspired sets are our signature bridal picks.',
      },
      {
        q: 'What is the price range of your necklace sets?',
        a: 'Necklace sets range from about ₹1,280 for elegant chokers to ₹15,000 for premium layered Moissanite and Kundan couture sets.',
      },
    ],
  },
  earrings: {
    intro:
      'Shop handcrafted Indian earrings online — statement jhumkas, heritage chandbalis, oxidised silver-tone danglers and pearl drops. Lightweight, skin-friendly and made for weddings, festivals and everyday ethnic wear. Free delivery across India.',
    faqs: [
      {
        q: 'Are the earrings heavy to wear?',
        a: 'Our earrings are designed for comfort — even the statement jhumkas and chandbalis are crafted to be light on the ears for all-day festive wear.',
      },
      {
        q: 'What styles of earrings do you have?',
        a: 'Jhumkas, chandbalis, long cascade danglers, ear cuffs, pearl drops and oxidised statement earrings — in Kundan, ruby, emerald and pearl finishes.',
      },
      {
        q: 'What is the price range of your earrings?',
        a: 'Earrings start at just ₹540 and go up to around ₹2,600 for premium heritage designs.',
      },
    ],
  },
  bracelet: {
    intro:
      'Discover handcrafted Moissanite bracelets online — emerald and ruby statement bracelets in antique gold-plated craftsmanship, with adjustable closures for the perfect fit. Free delivery across India.',
    faqs: [
      {
        q: 'Are the bracelets adjustable?',
        a: 'Yes — our bracelets have adjustable closures so one size comfortably fits most wrists.',
      },
      {
        q: 'What are the bracelets made of?',
        a: 'High-grade moissanite and emerald/ruby-toned stones set in antique gold-plated alloy with micro CZ accents.',
      },
    ],
  },
  hathphool: {
    intro:
      'Shop traditional hathphool (hand harness) jewellery online — bridal Polki hathphools with emerald and pearl detailing that connect an adjustable bracelet to a statement ring. A regal essential for brides and festive occasions. Free delivery across India.',
    faqs: [
      {
        q: 'What is a hathphool?',
        a: 'A hathphool ("flower of the hand") is traditional Indian hand jewellery — a bracelet connected by elegant chains to a ring, adorning the back of the hand. It is a classic bridal accessory.',
      },
      {
        q: 'Will the hathphool fit my hand?',
        a: 'Yes — both the bracelet and the ring are adjustable, so the hathphool fits most hand sizes comfortably.',
      },
    ],
  },
  premium_heritage: {
    intro:
      'Explore our Premium Heritage collection — Kundan, Polki and Moissanite jewellery inspired by royal Indian craftsmanship. Bridal chokers, layered haars, couture necklace sets and hathphools with antique gold detailing. Free delivery across India.',
    faqs: [
      {
        q: 'What is the Premium Heritage collection?',
        a: 'It is our signature line of Kundan, Polki and Moissanite jewellery — heirloom-inspired statement pieces for weddings, receptions and grand celebrations.',
      },
      {
        q: 'What is the difference between Kundan and Polki?',
        a: 'Both are traditional Indian settings: Kundan uses refined, glass-set stones with gold foil, while Polki features uncut, raw-look stones for a more regal, old-world sparkle.',
      },
    ],
  },
  oxidised: {
    intro:
      'Shop oxidised jewellery online — silver-tone statement necklaces, chandbali earrings, ghungroo danglers and boho-ethnic pieces with intricate antique detailing. Perfect for sarees, kurtas and festive ethnic wear. Free delivery across India.',
    faqs: [
      {
        q: 'Will oxidised jewellery tarnish?',
        a: 'Oxidised jewellery is deliberately darkened for its antique look. Keep it away from water and perfume and store it in a dry pouch, and it will keep its finish beautifully.',
      },
      {
        q: 'What goes well with oxidised jewellery?',
        a: 'Oxidised pieces pair beautifully with sarees, cotton kurtas, lehengas and even indo-western outfits — a favourite for festive and everyday ethnic styling.',
      },
    ],
  },
};

// schema.org FAQPage JSON-LD for rich results.
export function faqJsonLd(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}
