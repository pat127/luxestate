'use client';

import React, { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import { trackInquirySubmission } from '@/lib/analytics';
import { sendInquiryEmail } from '@/lib/sendInquiryEmail';

export default function ProjectInquiry() {
  const supabase = createClient();
  const [form, setForm] = useState({ name: '', email: '', phone: '', project: '', budget: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [projectOptions, setProjectOptions] = useState<Array<{ id: string; name: string; starting_price: string }>>([]);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    supabase
      .from('projects')
      .select('id, name, starting_price')
      .eq('published', true)
      .order('name')
      .then(({ data }) => {
        if (data) setProjectOptions(data);
      });
  }, []);

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
    const selectedProject = projectOptions.find(p => p.id === form.project);
    await supabase.from('leads').insert({
      name: form.name,
      email: form.email,
      phone: form.phone,
      source: 'Website',
      status: 'New',
      budget: form.budget,
      interest: selectedProject ? selectedProject.name : form.project,
      notes: form.message,
    });
    await sendInquiryEmail({
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      budget: form.budget || undefined,
      message: form.message || undefined,
      formType: 'project_inquiry',
      projectName: selectedProject ? selectedProject.name : form.project || undefined,
    });
    trackInquirySubmission({
      formType: 'project_inquiry',
      propertyName: selectedProject ? selectedProject.name : form.project,
      budget: form.budget,
      source: 'projects_page',
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <section ref={sectionRef} id="contact" className="py-20 px-6 md:px-10 border-t border-border bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div className="animate-on-scroll">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 block">Priority Registration</span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tighter leading-none mb-8">
              Secure Your<br /><span className="text-gold-shimmer">Early Advantage</span>
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed mb-10 max-w-md">
              Priority registrants gain first access to unit selection, pre-public pricing, and developer incentives worth an average of 18% below anticipated market value at completion.
            </p>
            <div className="space-y-4">
              {[
                { icon: 'ShieldCheckIcon', title: 'Pre-Market Pricing', desc: 'Lock in value before public launch drives premiums' },
                { icon: 'StarIcon', title: 'First Unit Selection', desc: 'Choose your preferred floor, aspect, and layout first' },
                { icon: 'BanknotesIcon', title: 'Developer Incentives', desc: 'Exclusive early-buyer packages including furniture, parking, and storage' },
              ].map((benefit) => (
                <div key={benefit.title} className="flex items-start gap-4 p-4 border border-border hover:border-primary/30 transition-colors duration-300 group">
                  <div className="w-9 h-9 border border-border flex items-center justify-center flex-shrink-0 group-hover:border-primary group-hover:bg-primary/10 transition-all duration-300">
                    <Icon name={benefit.icon as Parameters<typeof Icon>[0]['name']} size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground font-bold text-sm mb-0.5">{benefit.title}</p>
                    <p className="text-muted-foreground text-xs leading-relaxed">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-on-scroll">
            {submitted ? (
              <div className="bg-card border border-primary/30 p-12 text-center gold-glow-animate">
                <div className="w-16 h-16 border border-primary flex items-center justify-center mx-auto mb-6">
                  <Icon name="CheckIcon" size={24} className="text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Registration Confirmed</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">You are now on the priority list. Our development specialist will contact you within 24 hours with exclusive access details.</p>
              </div>
            ) : (
              <div className="bg-card border border-border p-8 md:p-10">
                <h3 className="text-xl font-bold text-foreground mb-6 tracking-tight">Register Priority Interest</h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Full Name *</label>
                      <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-background border border-border text-foreground px-4 py-3 text-sm outline-none focus:border-primary transition-colors placeholder-muted-foreground" placeholder="Your full name" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Email *</label>
                      <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-background border border-border text-foreground px-4 py-3 text-sm outline-none focus:border-primary transition-colors placeholder-muted-foreground" placeholder="your@email.com" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Phone</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-background border border-border text-foreground px-4 py-3 text-sm outline-none focus:border-primary transition-colors placeholder-muted-foreground" placeholder="+971 50 000 0000" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Project of Interest</label>
                    <select value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} className="w-full bg-background border border-border text-foreground px-4 py-3 text-sm outline-none focus:border-primary transition-colors cursor-pointer">
                      <option value="">Select Project</option>
                      {projectOptions.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}{p.starting_price ? ` — AED ${p.starting_price}+` : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Investment Budget</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['AED 1M–5M', 'AED 5M–15M', 'AED 15M–30M', 'AED 30M–50M', 'AED 50M+', 'Undisclosed'].map((b) => (
                        <button key={b} type="button" onClick={() => setForm({ ...form, budget: b })} className={`py-2.5 text-xs font-bold border transition-all duration-300 ${form.budget === b ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'}`}>{b}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Additional Notes</label>
                    <textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full bg-background border border-border text-foreground px-4 py-3 text-sm outline-none focus:border-primary transition-colors placeholder-muted-foreground resize-none" placeholder="Preferred unit type, floor range, or any specific requirements..." />
                  </div>
                  <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-accent transition-colors duration-300 group disabled:opacity-60">
                    {submitting ? 'Submitting...' : 'Register Priority Interest'}
                    <Icon name="ArrowRightIcon" size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                  <p className="text-muted-foreground text-[10px] text-center">Registration is non-binding. All information treated with complete confidentiality.</p>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}