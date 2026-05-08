import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Cove Estates',
  description: 'Privacy Policy for Cove Estates — how we collect, use, and protect your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-background overflow-x-hidden">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-12 px-6 md:px-10 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 block">Legal</span>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tighter mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm">Last updated: 1 January 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-6 md:px-10">
        <div className="max-w-4xl mx-auto prose prose-invert prose-sm max-w-none">
          <div className="space-y-10 text-muted-foreground text-sm leading-relaxed">

            <div>
              <h2 className="text-foreground font-bold text-xl mb-4">1. Introduction</h2>
              <p>Cove Estates Real Estate LLC (&ldquo;Cove Estates&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <strong className="text-foreground">luxestate6357.builtwithrocket.new</strong> or engage with our real estate services.</p>
              <p className="mt-3">We operate in accordance with the UAE Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data (PDPL) and applicable RERA (Real Estate Regulatory Agency) regulations.</p>
            </div>

            <div>
              <h2 className="text-foreground font-bold text-xl mb-4">2. Information We Collect</h2>
              <p className="mb-3">We collect information you provide directly to us, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-foreground">Identity Data:</strong> Full name, nationality, passport or Emirates ID number (where required for property transactions)</li>
                <li><strong className="text-foreground">Contact Data:</strong> Email address, phone number, WhatsApp number, postal address</li>
                <li><strong className="text-foreground">Financial Data:</strong> Budget range, financing preferences, proof of funds (for qualifying purposes only)</li>
                <li><strong className="text-foreground">Property Preferences:</strong> Property type, location preferences, investment objectives</li>
                <li><strong className="text-foreground">Technical Data:</strong> IP address, browser type, device information, cookies and usage data</li>
                <li><strong className="text-foreground">Communication Data:</strong> Records of correspondence, enquiry forms, and meeting notes</li>
              </ul>
            </div>

            <div>
              <h2 className="text-foreground font-bold text-xl mb-4">3. How We Use Your Information</h2>
              <p className="mb-3">We use your personal data for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>To provide real estate advisory, brokerage, and property management services</li>
                <li>To match you with suitable properties and investment opportunities</li>
                <li>To communicate with you about listings, market updates, and appointments</li>
                <li>To comply with RERA, DLD (Dubai Land Department), and UAE anti-money laundering (AML) regulations</li>
                <li>To process property transactions and prepare legal documentation</li>
                <li>To send marketing communications (with your consent)</li>
                <li>To improve our website and services through analytics</li>
                <li>To prevent fraud and ensure the security of our platform</li>
              </ul>
            </div>

            <div>
              <h2 className="text-foreground font-bold text-xl mb-4">4. Legal Basis for Processing</h2>
              <p className="mb-3">We process your personal data on the following legal bases:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-foreground">Contractual necessity:</strong> To perform our obligations under a service agreement with you</li>
                <li><strong className="text-foreground">Legal obligation:</strong> To comply with UAE laws, RERA regulations, and AML/KYC requirements</li>
                <li><strong className="text-foreground">Legitimate interests:</strong> To operate and improve our business, prevent fraud, and maintain security</li>
                <li><strong className="text-foreground">Consent:</strong> For marketing communications and non-essential cookies</li>
              </ul>
            </div>

            <div>
              <h2 className="text-foreground font-bold text-xl mb-4">5. Sharing Your Information</h2>
              <p className="mb-3">We may share your personal information with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-foreground">Property Developers:</strong> Emaar, DAMAC, Nakheel, Meraas, and other developers for off-plan registrations</li>
                <li><strong className="text-foreground">Government Authorities:</strong> Dubai Land Department (DLD), RERA, and other regulatory bodies as required by law</li>
                <li><strong className="text-foreground">Legal & Financial Advisors:</strong> Lawyers, notaries, and mortgage brokers involved in your transaction</li>
                <li><strong className="text-foreground">Service Providers:</strong> IT, CRM, and marketing platforms operating under strict data processing agreements</li>
                <li><strong className="text-foreground">Business Partners:</strong> International real estate agencies for cross-border referrals (with your consent)</li>
              </ul>
              <p className="mt-3">We do not sell your personal data to third parties.</p>
            </div>

            <div>
              <h2 className="text-foreground font-bold text-xl mb-4">6. International Data Transfers</h2>
              <p>As a global real estate advisory serving clients in 40+ countries, we may transfer your data internationally. All transfers are conducted with appropriate safeguards, including standard contractual clauses and adequacy decisions where applicable.</p>
            </div>

            <div>
              <h2 className="text-foreground font-bold text-xl mb-4">7. Data Retention</h2>
              <p>We retain your personal data for as long as necessary to fulfil the purposes outlined in this policy, and in accordance with UAE legal requirements. Transaction records are retained for a minimum of 5 years as required by DLD regulations. Marketing data is retained until you withdraw consent.</p>
            </div>

            <div>
              <h2 className="text-foreground font-bold text-xl mb-4">8. Your Rights</h2>
              <p className="mb-3">Under UAE PDPL and applicable regulations, you have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access the personal data we hold about you</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Request deletion of your data (subject to legal retention requirements)</li>
                <li>Object to or restrict certain processing activities</li>
                <li>Withdraw consent for marketing communications at any time</li>
                <li>Lodge a complaint with the UAE Data Office</li>
              </ul>
              <p className="mt-3">To exercise your rights, contact us at <a href="mailto:privacy@coveestates.com" className="text-primary hover:underline">privacy@coveestates.com</a>.</p>
            </div>

            <div>
              <h2 className="text-foreground font-bold text-xl mb-4">9. Cookies</h2>
              <p>We use cookies and similar tracking technologies to enhance your browsing experience. Please see our <Link href="/cookie-policy" className="text-primary hover:underline">Cookie Policy</Link> for full details. You can manage your cookie preferences at any time.</p>
            </div>

            <div>
              <h2 className="text-foreground font-bold text-xl mb-4">10. Security</h2>
              <p>We implement industry-standard technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction. These include SSL encryption, access controls, and regular security assessments.</p>
            </div>

            <div>
              <h2 className="text-foreground font-bold text-xl mb-4">11. Children&apos;s Privacy</h2>
              <p>Our services are not directed to individuals under the age of 18. We do not knowingly collect personal data from minors. If you believe we have inadvertently collected such data, please contact us immediately.</p>
            </div>

            <div>
              <h2 className="text-foreground font-bold text-xl mb-4">12. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on our website or contacting you directly. Your continued use of our services after changes constitutes acceptance of the updated policy.</p>
            </div>

            <div>
              <h2 className="text-foreground font-bold text-xl mb-4">13. Contact Us</h2>
              <p className="mb-3">For privacy-related enquiries, please contact our Data Protection Officer:</p>
              <div className="border border-border p-6 bg-card space-y-2">
                <p><strong className="text-foreground">Cove Estates Real Estate LLC</strong></p>
                <p>8th Level, Moosa Tower 1, Sheikh Zayed Road, Dubai, UAE</p>
                <p>Email: <a href="mailto:privacy@coveestates.com" className="text-primary hover:underline">privacy@coveestates.com</a></p>
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
          <Link href="/terms-of-service" className="text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">Terms of Service</Link>
          <Link href="/cookie-policy" className="text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">Cookie Policy</Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
