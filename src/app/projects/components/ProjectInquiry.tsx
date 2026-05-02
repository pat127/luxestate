'use client';

import React, { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

export default function ProjectInquiry() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', project: '', budget: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Backend integration point
    setSubmitted(true);
  };

  return (
    <section ref={sectionRef} id="contact" className="py-20 px-6 md:px-10 border-t border-border bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Visual + Info */}
          <div className="animate-on-scroll">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 block">Priority Registration</span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tighter leading-none mb-8">
              Secure Your<br />
              <span className="text-gold-shimmer">Early Advantage</span>
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed mb-10 max-w-md">
              Priority registrants gain first access to unit selection, pre-public pricing, and developer incentives worth an average of 18% below anticipated market value at completion.
            </p>

            {/* Benefits */}
            <div className="space-y-4 mb-10">
              {[
              { icon: 'ShieldCheckIcon', title: 'Pre-Market Pricing', desc: 'Lock in value before public launch drives premiums' },
              { icon: 'StarIcon', title: 'First Unit Selection', desc: 'Choose your preferred floor, aspect, and layout first' },
              { icon: 'BanknotesIcon', title: 'Developer Incentives', desc: 'Exclusive early-buyer packages including furniture, parking, and storage' }].
              map((benefit) =>
              <div key={benefit.title} className="flex items-start gap-4 p-4 border border-border hover:border-primary/30 transition-colors duration-300 group">
                  <div className="w-9 h-9 border border-border flex items-center justify-center flex-shrink-0 group-hover:border-primary group-hover:bg-primary/10 transition-all duration-300">
                    <Icon name={benefit.icon as Parameters<typeof Icon>[0]['name']} size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground font-bold text-sm mb-0.5">{benefit.title}</p>
                    <p className="text-muted-foreground text-xs leading-relaxed">{benefit.desc}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Project Image */}
            <div className="relative aspect-video overflow-hidden border border-border">
              <AppImage
                src="https://images.unsplash.com/photo-1554860489-63604187a0d3"
                alt="Luxury architectural development rendering at dusk, warm interior glow, dark sky, modernist geometry, cinematic atmosphere"
                fill
                className="object-cover"
                sizes="50vw" />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-white font-bold text-lg">One Obsidian Tower</p>
                <p className="text-white/60 text-xs uppercase tracking-widest">Hudson Yards, New York · From $8.5M</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="animate-on-scroll">
            {submitted ?
            <div className="bg-card border border-primary/30 p-12 text-center gold-glow-animate">
                <div className="w-16 h-16 border border-primary flex items-center justify-center mx-auto mb-6">
                  <Icon name="CheckIcon" size={24} className="text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Registration Confirmed</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  You are now on the priority list. Our development specialist will contact you within 24 hours with exclusive access details.
                </p>
              </div> :

            <div className="bg-card border border-border p-8 md:p-10">
                <h3 className="text-xl font-bold text-foreground mb-6 tracking-tight">Register Priority Interest</h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Full Name *</label>
                      <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-background border border-border text-foreground px-4 py-3 text-sm outline-none focus:border-primary transition-colors placeholder-muted-foreground"
                      placeholder="William Ashford" />

                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Email *</label>
                      <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-background border border-border text-foreground px-4 py-3 text-sm outline-none focus:border-primary transition-colors placeholder-muted-foreground"
                      placeholder="w.ashford@family.com" />

                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Phone</label>
                    <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-background border border-border text-foreground px-4 py-3 text-sm outline-none focus:border-primary transition-colors placeholder-muted-foreground"
                    placeholder="+1 (212) 000-0000" />

                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Project of Interest</label>
                    <select
                    value={form.project}
                    onChange={(e) => setForm({ ...form, project: e.target.value })}
                    className="w-full bg-background border border-border text-foreground px-4 py-3 text-sm outline-none focus:border-primary transition-colors cursor-pointer">

                      <option value="">Select Project</option>
                      <option value="one-obsidian">One Obsidian Tower — From $8.5M</option>
                      <option value="seraphine">Seraphine Residences — From $14M</option>
                      <option value="monarch">The Monarch — From $4.2M</option>
                      <option value="celestia">Celestia Office Park — From $95M</option>
                      <option value="noir">Noir Residences — From $6.8M</option>
                      <option value="halcyon">The Halcyon — From $18M</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Investment Budget</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['$1M–$5M', '$5M–$15M', '$15M–$50M', '$50M–$100M', '$100M+', 'Undisclosed'].map((b) =>
                    <button
                      key={b}
                      type="button"
                      onClick={() => setForm({ ...form, budget: b })}
                      className={`py-2.5 text-xs font-bold border transition-all duration-300 ${
                      form.budget === b ?
                      'bg-primary text-primary-foreground border-primary' :
                      'border-border text-muted-foreground hover:border-primary hover:text-foreground'}`
                      }>

                          {b}
                        </button>
                    )}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Additional Notes</label>
                    <textarea
                    rows={3}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-background border border-border text-foreground px-4 py-3 text-sm outline-none focus:border-primary transition-colors placeholder-muted-foreground resize-none"
                    placeholder="Preferred unit type, floor range, or any specific requirements..." />

                  </div>

                  <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-accent transition-colors duration-300 group">

                    Register Priority Interest
                    <Icon name="ArrowRightIcon" size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </button>

                  <p className="text-muted-foreground text-[10px] text-center">
                    Registration is non-binding. All information treated with complete confidentiality.
                  </p>
                </form>
              </div>
            }
          </div>
        </div>
      </div>
    </section>);

}