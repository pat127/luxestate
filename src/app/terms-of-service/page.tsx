import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | Cove Estatez Real Estate LLC',
  description: 'Terms of Service for Cove Estatez Real Estate LLC — the terms governing your use of our website and real estate services.',
};

export default function TermsOfServicePage() {
  return (
    <main className="bg-background overflow-x-hidden">
      <Header />
      <section className="pt-32 pb-20 px-4 md:px-10 max-w-4xl mx-auto">
        <div className="mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 block">Legal</span>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tighter mb-4">Terms of Service</h1>
          <p className="text-muted-foreground text-sm">Last updated: 1 January 2025</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">

          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">1. Agreement to Terms</h2>
            <p>
              These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you and Cove Estatez Real Estate LLC (&quot;Company&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), a licensed real estate brokerage registered in the United Arab Emirates. By accessing or using our website and services, you agree to be bound by these Terms.
            </p>
            <p className="mt-3">
              If you do not agree to these Terms, please do not use our website or services. We reserve the right to update these Terms at any time, and your continued use of our services constitutes acceptance of any changes.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">2. Our Services</h2>
            <p>Cove Estatez Real Estate LLC provides the following services:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Residential and commercial property sales and leasing brokerage in the UAE.</li>
              <li>Off-plan property sales and investment advisory.</li>
              <li>International real estate advisory and referral services.</li>
              <li>Property investment consultancy and portfolio advisory.</li>
              <li>Mortgage referral services (in partnership with licensed financial institutions).</li>
              <li>Property management referral services.</li>
            </ul>
            <p className="mt-3">
              All real estate brokerage activities are conducted in accordance with the regulations of the Real Estate Regulatory Agency (RERA) and the Dubai Land Department (DLD).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">3. Website Use</h2>
            <p>By using our website, you agree that you will not:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Use the website for any unlawful purpose or in violation of any applicable laws or regulations.</li>
              <li>Attempt to gain unauthorised access to any part of the website or its related systems.</li>
              <li>Transmit any unsolicited or unauthorised advertising or promotional material.</li>
              <li>Reproduce, duplicate, copy, sell, or exploit any portion of the website without our express written permission.</li>
              <li>Use any automated tools to scrape, crawl, or extract data from the website.</li>
              <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">4. Property Listings and Information</h2>
            <p>
              Property listings, prices, availability, and related information displayed on our website are provided for informational purposes only. While we endeavour to ensure accuracy:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Property prices are subject to change without notice and are subject to negotiation.</li>
              <li>Availability of properties may change at any time.</li>
              <li>Images, floor plans, and renderings may be indicative and not represent the final product, particularly for off-plan developments.</li>
              <li>All measurements and areas are approximate and should be independently verified.</li>
              <li>Cove Estatez Real Estate LLC makes no warranty as to the accuracy, completeness, or fitness for purpose of any property information provided.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">5. Brokerage Relationship</h2>
            <p>
              Cove Estatez Real Estate LLC acts as a licensed real estate broker. Our brokerage fees and commission structures are disclosed prior to entering into any formal agency agreement. By engaging our services:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>You acknowledge that we may represent both buyers and sellers in a transaction (dual agency) only with the informed consent of all parties.</li>
              <li>You agree to provide accurate and complete information relevant to your property search or sale.</li>
              <li>You acknowledge that any formal agency relationship will be governed by a separate written agreement.</li>
              <li>You understand that our services do not constitute legal, financial, or investment advice.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">6. Intellectual Property</h2>
            <p>
              All content on this website, including but not limited to text, graphics, logos, images, and software, is the property of Cove Estatez Real Estate LLC or its content suppliers and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works from any content on this website without our prior written consent.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">7. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, Cove Estatez Real Estate LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our website or services, including but not limited to:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Loss of profits, revenue, or data.</li>
              <li>Financial losses arising from reliance on property information provided on our website.</li>
              <li>Any interruption or cessation of our website or services.</li>
              <li>Any errors or omissions in any content on our website.</li>
            </ul>
            <p className="mt-3">
              Our total liability to you for any claim arising from these Terms or your use of our services shall not exceed the fees paid by you to Cove Estatez Real Estate LLC in the twelve months preceding the claim.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">8. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless Cove Estatez Real Estate LLC and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising from your use of our website or services, your violation of these Terms, or your violation of any applicable law or regulation.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">9. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites. These links are provided for your convenience only. Cove Estatez Real Estate LLC has no control over the content of those sites and accepts no responsibility for them or for any loss or damage that may arise from your use of them.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">10. Privacy</h2>
            <p>
              Your use of our website and services is also governed by our <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>, which is incorporated into these Terms by reference.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">11. Anti-Money Laundering Compliance</h2>
            <p>
              In accordance with UAE Federal Decree-Law No. 20 of 2018 on Anti-Money Laundering and Combating the Financing of Terrorism, Cove Estatez Real Estate LLC is required to conduct due diligence on all clients. By engaging our services, you agree to provide all documentation required for Know Your Customer (KYC) and Anti-Money Laundering (AML) compliance purposes.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">12. Governing Law and Jurisdiction</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the United Arab Emirates and the Emirate of Dubai. Any disputes arising from these Terms or your use of our services shall be subject to the exclusive jurisdiction of the courts of Dubai, UAE.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">13. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">14. Contact Us</h2>
            <p>If you have any questions about these Terms of Service, please contact:</p>
            <div className="mt-3 p-5 border border-border bg-card">
              <p className="text-foreground font-semibold">Cove Estatez Real Estate LLC</p>
              <p className="mt-1">8th Level, Moosa Tower 1, Dubai, UAE</p>
              <p className="mt-1">Email: <a href="mailto:admin@coveestates.com" className="text-primary hover:underline">admin@coveestates.com</a></p>
              <p className="mt-1">Phone: <a href="tel:+971508862683" className="text-primary hover:underline">+971 50 886 2683</a></p>
            </div>
          </div>

        </div>
      </section>
      <Footer />
    </main>
  );
}
