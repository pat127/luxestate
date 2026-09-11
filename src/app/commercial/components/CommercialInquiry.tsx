'use client';

import React, { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import { trackInquirySubmission } from '@/lib/analytics';
import { sendInquiryEmail } from '@/lib/sendInquiryEmail';

const INQUIRY_TYPES = ['Acquisition', 'Leasing', 'Investment', 'Portfolio Advisory', 'General Enquiry'];
const COMMERCIAL_TYPES = ['Office', 'Retail', 'Warehouse', 'Mixed-Use', 'Land', 'Any'];

export default function CommercialInquiry() {
  const supabase = createClient();
  const sectionRef = useRef<HTMLElement>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    property: '',
    inquiryType: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.animate-on-scroll').forEach((el) => {
              (el as HTMLElement).classList.add('visible');
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await supabase.from('leads').insert({
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        source: 'Commercial Inquiry',
        status: 'New',
        interest: form.property || null,
        notes: [form.inquiryType ? `Inquiry Type: ${form.inquiryType}` : '', form.message].filter(Boolean).join('\n') || null,
        form_type: 'commercial_inquiry',
      });
    } catch {
      // silent fail
    }
    await sendInquiryEmail({
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      propertyType: form.property || undefined,
      message: [form.inquiryType ? `Inquiry Type: ${form.inquiryType}` : '', form.message].filter(Boolean).join('\n') || undefined,
      formType: 'contact',
    });
    trackInquirySubmission({
      formType: 'contact',
      propertyName: form.property,
      source: 'commercial_page',
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <section id="contact" ref={sectionRef} className="py-20 px-6 md:px-10 border-t border-border bg-card">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: Info */}
          <div className="animate-on-scroll">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 block">Investment Team</span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tighter leading-none mb-8">
              Talk to Our<br /><span className="text-gold-shimmer">Commercial Experts</span>
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed mb-10 max-w-md">
              Our commercial investment team specialises in off-market transactions, portfolio acquisitions, and strategic leasing across Dubai's key commercial corridors.
            </p>
            <div className="space-y-4">
              {[
                { icon: 'BuildingOfficeIcon', title: 'Off-Market Deals', desc: 'Access commercial opportunities before they reach public portals' },
                { icon: 'ChartBarIcon', title: 'Investment Analysis', desc: 'Detailed yield, cap rate, and ROI analysis for every opportunity' },
                { icon: 'BriefcaseIcon', title: 'End-to-End Advisory', desc: 'From due diligence to closing, we manage the entire transaction' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4 p-4 border border-border hover:border-primary/30 transition-colors duration-300 group">
                  <div className="w-9 h-9 border border-border flex items-center justify-center flex-shrink-0 group-hover:border-primary group-hover:bg-primary/10 transition-all duration-300">
                    <Icon name={item.icon as Parameters<typeof Icon>[0]['name']} size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground font-bold text-sm mb-0.5">{item.title}</p>
                    <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div className="animate-on-scroll">
            {submitted ? (
              <div className="bg-background border border-primary/30 p-12 text-center gold-glow-animate">
                <div className="w-16 h-16 border border-primary flex items-center justify-center mx-auto mb-6">
                  <Icon name="CheckIcon" size={24} className="text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Enquiry Received</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Thank you for your enquiry. A commercial investment specialist will be in touch within 24 hours.
                </p>
              </div>
            ) : (
              <div className="bg-background border border-border p-8 md:p-10">
                <h3 className="text-xl font-bold text-foreground mb-6 tracking-tight">Commercial Enquiry</h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full bg-card border border-border text-foreground px-4 py-3 text-sm outline-none focus:border-primary transition-colors placeholder-muted-foreground"
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Email *</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full bg-card border border-border text-foreground px-4 py-3 text-sm outline-none focus:border-primary transition-colors placeholder-muted-foreground"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Phone</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-card border border-border text-foreground px-4 py-3 text-sm outline-none focus:border-primary transition-colors placeholder-muted-foreground"
                      placeholder="+971 50 000 0000"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Property Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {COMMERCIAL_TYPES.map((ct) => (
                        <button
                          key={ct}
                          type="button"
                          onClick={() => setForm({ ...form, property: ct })}
                          className={`py-2.5 text-xs font-bold border transition-all duration-300 ${form.property === ct ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'}`}
                        >
                          {ct}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Inquiry Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {INQUIRY_TYPES.map((it) => (
                        <button
                          key={it}
                          type="button"
                          onClick={() => setForm({ ...form, inquiryType: it })}
                          className={`py-2.5 text-xs font-bold border transition-all duration-300 ${form.inquiryType === it ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'}`}
                        >
                          {it}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Message</label>
                    <textarea
                      rows={3}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full bg-card border border-border text-foreground px-4 py-3 text-sm outline-none focus:border-primary transition-colors placeholder-muted-foreground resize-none"
                      placeholder="Size requirements, budget range, preferred location, or any specific requirements..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-accent transition-colors duration-300 group disabled:opacity-60"
                  >
                    {submitting ? 'Submitting...' : 'Submit Enquiry'}
                    <Icon name="ArrowRightIcon" size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                  <p className="text-muted-foreground text-[10px] text-center">All information treated with complete confidentiality.</p>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
