import React from 'react';

export default function LegalPage({ title, updated, sections }) {
  return (
    <div className="min-h-screen pt-32 pb-20" data-testid="legal-page">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-serif font-light tracking-tight text-[#1A1A1A] mb-2" data-testid="legal-title">
          {title}
        </h1>
        {updated && <p className="text-sm text-[#666666] mb-10">Last updated: {updated}</p>}
        <div className="space-y-8">
          {sections.map((s, i) => (
            <section key={i}>
              {s.heading && (
                <h2 className="text-xl font-serif font-medium text-[#1A1A1A] mb-3">{s.heading}</h2>
              )}
              {s.body.map((p, j) => (
                <p key={j} className="text-[#444444] leading-relaxed mb-3">{p}</p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
