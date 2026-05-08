import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | Cove Estates',
  description: 'Terms of Service for Cove Estates — the terms governing your use of our website and real estate services.',
};

export default function TermsOfServicePage() {
  return (
    <main className="bg-background overflow-x-hidden">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-12 px-6 md:px-10 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 block">Legal</span>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tighter mb-4">Terms of Service</h1>
          <p className="text-muted-foreground text-sm">Last updated: 1 January 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-10 text-muted-foreground text-sm leading-relaxed">

            <div>
              <h2 className="text-foreground font-bold text-xl mb-4">1. Agreement to Terms</h2>
              <p>By accessing or using the website of Cove Estates Real Estate LLC (&ldquo;Cove Estates&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) and engaging with our real estate services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
              <p className="mt-3">These Terms are governed by the laws of the United Arab Emirates, including applicable Dubai Land Department (DLD) and RERA regulations.</p>
            </div>

            <div>
              <h2 className="text-foreground font-bold text-xl mb-4">2. Our Services</h2>
              <p className="mb-3">Cove Estates provides the following real estate services:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Residential property sales and leasing in Dubai and the UAE</li>
                <li>Commercial property sales, leasing, and investment advisory</li>
                <li>Off-plan project sales and developer representation</li>
                <li>International property investment advisory</li>
                <li>Property management and post-handover services</li>
                <li>Market research, valuation guidance, and investment analysis</li>
              </ul>
              <p className="mt-3">All brokerage activities are conducted under a valid RERA licence. Our agents are registered with the Dubai Real Estate Institute (DREI).</p>
            </div>

            <div>
              <h2 className="text-foreground font-bold text-xl mb-4">3. Website Use</h2>
              <p className="mb-3">You may use our website for lawful purposes only. You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the website in any way that violates UAE laws or regulations</li>
                <li>Transmit unsolicited commercial communications (spam)</li>
                <li>Attempt to gain unauthorised access to any part of the website or its systems</li>
                <li>Reproduce, duplicate, or exploit any content without our written permission</li>
                <li>Use automated tools to scrape, crawl, or harvest data from the website</li>
                <li>Post false, misleading, or defamatory content</li>
              </ul>
            </div>

            <div>
              <h2 className="text-foreground font-bold text-xl mb-4">4. Property Listings & Information</h2>
              <p>Property listings, prices, availability, and details on our website are provided for informational purposes only and are subject to change without notice. All prices are indicative and subject to negotiation. Cove Estates makes reasonable efforts to ensure accuracy but does not warrant that listing information is complete, current, or error-free.</p>
              <p className="mt-3">Property prices displayed in currencies other than AED are approximate conversions based on indicative exchange rates and should not be relied upon for financial decisions.</p>
            </div>

            <div>
              <h2 className="text-foreground font-bold text-xl mb-4">5. Brokerage & Agency</h2>
              <p>Cove Estates acts as a licensed real estate broker. Our standard brokerage commission is 2% of the transaction value for sales (as per RERA guidelines) and one month&apos;s rent for leasing transactions, unless otherwise agreed in writing. All commission arrangements are documented in a signed Form A (Listing Agreement) or Form B (Buyer&apos;s Agency Agreement) as required by RERA.</p>
            </div>

            <div>
              <h2 className="text-foreground font-bold text-xl mb-4">6. Client Obligations</h2>
              <p className="mb-3">When engaging our services, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate and complete information about your requirements and financial capacity</li>
                <li>Comply with all UAE AML/KYC requirements, including providing valid identification documents</li>
                <li>Notify us promptly if you are working with another broker for the same property</li>
                <li>Not circumvent our agency relationship by dealing directly with parties introduced by us</li>
                <li>Honour signed agreements, including reservation forms and sale and purchase agreements (SPAs)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-foreground font-bold text-xl mb-4">7. Intellectual Property</h2>
              <p>All content on this website, including text, images, graphics, logos, and software, is the property of Cove Estates or its licensors and is protected by UAE and international intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written consent.</p>
            </div>

            <div>
              <h2 className="text-foreground font-bold text-xl mb-4">8. Disclaimer of Warranties</h2>
              <p>Our website and services are provided &ldquo;as is&rdquo; without warranties of any kind, express or implied. We do not guarantee that the website will be uninterrupted, error-free, or free of viruses. Real estate investment involves risk, and past performance is not indicative of future results. Nothing on this website constitutes financial, legal, or investment advice.</p>
            </div>

            <div>
              <h2 className="text-foreground font-bold text-xl mb-4">9. Limitation of Liability</h2>
              <p>To the maximum extent permitted by UAE law, Cove Estates shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our website or services. Our total liability for any claim shall not exceed the fees paid by you to Cove Estates in the three months preceding the claim.</p>
            </div>

            <div>
              <h2 className="text-foreground font-bold text-xl mb-4">10. Third-Party Links</h2>
              <p>Our website may contain links to third-party websites, including property portals (Property Finder, Bayut), developer websites, and financial institutions. We are not responsible for the content, privacy practices, or accuracy of third-party sites. Links do not constitute endorsement.</p>
            </div>

            <div>
              <h2 className="text-foreground font-bold text-xl mb-4">11. Dispute Resolution</h2>
              <p>Any disputes arising from these Terms or our services shall first be subject to good-faith negotiation. If unresolved, disputes shall be referred to the RERA Dispute Resolution Centre or the Dubai Courts, as applicable. These Terms are governed by the laws of the Emirate of Dubai and the UAE.</p>
            </div>

            <div>
              <h2 className="text-foreground font-bold text-xl mb-4">12. Changes to Terms</h2>
              <p>We reserve the right to modify these Terms at any time. Changes will be effective upon posting to our website. Your continued use of our services after changes constitutes acceptance of the updated Terms.</p>
            </div>

            <div>
              <h2 className="text-foreground font-bold text-xl mb-4">13. Contact</h2>
              <div className="border border-border p-6 bg-card space-y-2">
                <p><strong className="text-foreground">Cove Estates Real Estate LLC</strong></p>
                <p>8th Level, Moosa Tower 1, Sheikh Zayed Road, Dubai, UAE</p>
                <p>Email: <a href="mailto:legal@coveestates.com" className="text-primary hover:underline">legal@coveestates.com</a></p>
                <p>Phone: <a href="tel:+971508862683" className="text-primary hover:underline">+971 50 886 2683</a></p>
                <p>RERA Licence No.: [Your RERA Number]</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Legal Links */}
      <section className="py-8 px-6 md:px-10 border-t border-border">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-6">
          <Link href="/privacy-policy" className="text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">Privacy Policy</Link>
          <Link href="/cookie-policy" className="text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">Cookie Policy</Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
