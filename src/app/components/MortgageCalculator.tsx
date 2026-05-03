'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';
import { MortgageContent, DEFAULT_MORTGAGE } from '@/contexts/CMSContext';
import Link from 'next/link';

interface Props {
  content?: MortgageContent;
}

export default function MortgageCalculator({ content }: Props) {
  const c = content ?? DEFAULT_MORTGAGE;

  const [homePrice, setHomePrice] = useState(5000000);
  const [downPayment, setDownPayment] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);
  const [monthly, setMonthly] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const calculate = useCallback(() => {
    const principal = homePrice * (1 - downPayment / 100);
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTerm * 12;
    if (monthlyRate === 0) {
      setMonthly(principal / numPayments);
      setTotalInterest(0);
      return;
    }
    const m = (principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    setMonthly(m);
    setTotalInterest(m * numPayments - principal);
  }, [homePrice, downPayment, interestRate, loanTerm]);

  useEffect(() => { calculate(); }, [calculate]);

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

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  const loanAmount = homePrice * (1 - downPayment / 100);

  const headlineLines = c.headline.split('\n');

  return (
    <section ref={sectionRef} className="py-24 px-6 md:px-10 border-t border-border bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 animate-on-scroll">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 block">
              {c.eyebrow}
            </span>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground tracking-tighter leading-none">
              {headlineLines.map((line, i) => (
                <React.Fragment key={i}>{line}{i < headlineLines.length - 1 && <br />}</React.Fragment>
              ))}
            </h2>
          </div>
          <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
            {c.description}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 animate-on-scroll">
          <div className="bg-card border border-border p-8 md:p-10 space-y-10">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Home Price</label>
                <span className="text-primary font-bold text-lg">{fmt(homePrice)}</span>
              </div>
              <input type="range" min={500000} max={100000000} step={500000} value={homePrice} onChange={(e) => setHomePrice(Number(e.target.value))} className="w-full cursor-pointer" />
              <div className="flex justify-between text-xs text-muted-foreground"><span>$500K</span><span>$100M</span></div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Down Payment</label>
                <span className="text-primary font-bold text-lg">{downPayment}% · {fmt(homePrice * downPayment / 100)}</span>
              </div>
              <input type="range" min={5} max={80} step={1} value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} className="w-full cursor-pointer" />
              <div className="flex justify-between text-xs text-muted-foreground"><span>5%</span><span>80%</span></div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Interest Rate</label>
                <span className="text-primary font-bold text-lg">{interestRate.toFixed(1)}%</span>
              </div>
              <input type="range" min={2} max={12} step={0.1} value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} className="w-full cursor-pointer" />
              <div className="flex justify-between text-xs text-muted-foreground"><span>2%</span><span>12%</span></div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground block mb-3">Loan Term</label>
              <div className="grid grid-cols-3 gap-2">
                {[10, 15, 20, 25, 30].map((term) => (
                  <button key={term} onClick={() => setLoanTerm(term)} className={`py-3 text-sm font-bold border transition-all duration-300 ${loanTerm === term ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'}`}>
                    {term}yr
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary p-8 md:p-10 flex flex-col justify-between flex-1">
              <div>
                <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-[0.2em] mb-3">Estimated Monthly Payment</p>
                <p className="text-4xl md:text-5xl font-black text-primary-foreground tracking-tighter leading-none">{fmt(monthly)}</p>
                <p className="text-primary-foreground/60 text-xs mt-2">per month</p>
              </div>
              <div className="gold-line w-full mt-6 opacity-30" />
              <div className="grid grid-cols-2 gap-6 mt-6">
                <div>
                  <p className="text-primary-foreground/60 text-[10px] uppercase tracking-widest mb-1">Loan Amount</p>
                  <p className="text-primary-foreground font-bold text-lg">{fmt(loanAmount)}</p>
                </div>
                <div>
                  <p className="text-primary-foreground/60 text-[10px] uppercase tracking-widest mb-1">Total Interest</p>
                  <p className="text-primary-foreground font-bold text-lg">{fmt(totalInterest)}</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border p-8 space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-5">Payment Breakdown</p>
              {[
                { label: 'Principal & Interest', value: monthly, pct: 100, color: 'bg-primary' },
                { label: 'Est. Property Tax', value: homePrice * 0.012 / 12, pct: (homePrice * 0.012 / 12) / (monthly + homePrice * 0.012 / 12 + homePrice * 0.005 / 12) * 100, color: 'bg-foreground/40' },
                { label: 'Est. Insurance', value: homePrice * 0.005 / 12, pct: (homePrice * 0.005 / 12) / (monthly + homePrice * 0.012 / 12 + homePrice * 0.005 / 12) * 100, color: 'bg-foreground/20' },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground text-xs">{item.label}</span>
                    <span className="text-foreground font-bold text-xs">{fmt(item.value)}</span>
                  </div>
                  <div className="h-1 bg-border overflow-hidden">
                    <div className={`h-full ${item.color} transition-all duration-500`} style={{ width: `${Math.min(item.pct, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <Link
              href={c.cta_link}
              className="flex items-center justify-center gap-3 bg-background border border-primary text-primary py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary hover:text-primary-foreground transition-all duration-300 group">
              {c.cta_text}
              <Icon name="ArrowRightIcon" size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}