'use client';

import React, { useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

const team = [
{
  name: 'Jonathan Hargreaves',
  role: 'Principal Broker',
  specialty: 'Ultra-Luxury Residential',
  transactions: '$1.8B',
  years: '22',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_17eb2ca68-1763295028413.png",
  alt: 'Distinguished male executive in dark tailored suit, confident professional portrait, neutral dark background'
},
{
  name: 'Serena Blackwood',
  role: 'Senior Advisor',
  specialty: 'Penthouses & High-Rise',
  transactions: '$920M',
  years: '15',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1b32bbd93-1763299584368.png",
  alt: 'Professional woman in elegant dark blazer, polished business portrait, sophisticated studio lighting'
},
{
  name: 'Marcus DeLeon',
  role: 'Estate Specialist',
  specialty: 'Coastal Estates & Villas',
  transactions: '$750M',
  years: '12',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1bfef8bd5-1763295388609.png",
  alt: 'Professional man in dark business attire, confident expression, professional portrait photography'
},
{
  name: 'Aisha Okonkwo',
  role: 'International Liaison',
  specialty: 'Cross-Border Acquisitions',
  transactions: '$540M',
  years: '9',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_12672b149-1763294392419.png",
  alt: 'Professional woman with elegant styling, warm confident smile, business portrait, dark professional background'
}];


export default function TeamSection() {
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

  return (
    <section ref={sectionRef} className="py-20 px-6 md:px-10 border-t border-border bg-card">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-14 gap-6 animate-on-scroll">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-3 block">Our Specialists</span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tighter">
              The Advisors<br />Behind Your Acquisition
            </h2>
          </div>
          <Link
            href="#contact"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary border-b border-primary pb-1 hover:gap-4 transition-all duration-300 flex-shrink-0">

            Schedule a Call
            <Icon name="ArrowRightIcon" size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          {team.map((member, i) =>
          <div
            key={member.name}
            className="animate-on-scroll group border border-border bg-background hover:border-primary/30 transition-all duration-500 cursor-pointer"
            style={{ transitionDelay: `${i * 80}ms` }}>

              <div className="relative h-72 overflow-hidden">
                <AppImage
                src={member.image}
                alt={member.alt}
                fill
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 25vw" />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                    {member.specialty}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-foreground font-bold text-lg mb-1">{member.name}</h3>
                <p className="text-muted-foreground text-xs uppercase tracking-widest mb-4">{member.role}</p>
                <div className="flex gap-6 border-t border-border pt-4">
                  <div>
                    <p className="text-primary font-bold text-lg">{member.transactions}</p>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-widest">Transacted</p>
                  </div>
                  <div>
                    <p className="text-primary font-bold text-lg">{member.years}yr</p>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-widest">Experience</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}