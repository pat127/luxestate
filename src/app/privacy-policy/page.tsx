import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Cove Estatez Real Estate LLC',
  description: 'Privacy Policy for Cove Estatez Real Estate LLC — how we collect, use, and protect your personal data.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-background overflow-x-hidden">
      <Header />
      <section className="pt-32 pb-20 px-4 md:px-10 max-w-4xl mx-auto">
        <div className="mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 block">Legal</span>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tighter mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm">Last updated: 1 January 2025</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">

          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">1. Introduction</h2>
            <p>
              Cove Estatez Real Estate LLC (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or engage with our real estate services.
            </p>
            <p className="mt-3">
              Cove Estatez Real Estate LLC is a licensed real estate brokerage registered in the United Arab Emirates, operating in compliance with the Real Estate Regulatory Agency (RERA) and the Dubai Land Department (DLD) regulations.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">2. Information We Collect</h2>
            <p>We may collect the following categories of personal information:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong className="text-foreground">Identity Data:</strong> Full name, date of birth, nationality, passport or Emirates ID number.</li>
              <li><strong className="text-foreground">Contact Data:</strong> Email address, telephone number, postal address.</li>
              <li><strong className="text-foreground">Financial Data:</strong> Budget range, financing preferences, proof of funds (where required for transactions).</li>
              <li><strong className="text-foreground">Transaction Data:</strong> Details of properties you have enquired about, viewed, or purchased through us.</li>
              <li><strong className="text-foreground">Technical Data:</strong> IP address, browser type and version, time zone, browser plug-in types, operating system, and other technology on the devices you use to access our website.</li>
              <li><strong className="text-foreground">Usage Data:</strong> Information about how you use our website, products, and services.</li>
              <li><strong className="text-foreground">Marketing Data:</strong> Your preferences in receiving marketing from us and your communication preferences.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">3. How We Use Your Information</h2>
            <p>Cove Estatez Real Estate LLC uses your personal information for the following purposes:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>To provide and manage our real estate brokerage services.</li>
              <li>To respond to your enquiries and provide property recommendations.</li>
              <li>To facilitate property viewings, negotiations, and transactions.</li>
              <li>To comply with our legal and regulatory obligations under UAE law, including Anti-Money Laundering (AML) requirements.</li>
              <li>To send you marketing communications about properties and services that may interest you (where you have consented or we have a legitimate interest).</li>
              <li>To improve our website and services through analytics.</li>
              <li>To manage our relationship with you, including notifying you of changes to our terms or privacy policy.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">4. Legal Basis for Processing</h2>
            <p>We process your personal data on the following legal bases:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong className="text-foreground">Performance of a contract:</strong> Where processing is necessary to provide you with our real estate services.</li>
              <li><strong className="text-foreground">Legal obligation:</strong> Where we must process your data to comply with UAE laws and regulations.</li>
              <li><strong className="text-foreground">Legitimate interests:</strong> Where processing is in our legitimate business interests and does not override your rights.</li>
              <li><strong className="text-foreground">Consent:</strong> Where you have given us explicit consent to process your data for a specific purpose.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">5. Data Sharing and Disclosure</h2>
            <p>We may share your personal information with:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong className="text-foreground">Property developers and sellers:</strong> To facilitate property transactions on your behalf.</li>
              <li><strong className="text-foreground">Regulatory authorities:</strong> Including RERA, DLD, and UAE financial intelligence authorities as required by law.</li>
              <li><strong className="text-foreground">Professional advisors:</strong> Including lawyers, bankers, auditors, and insurers who provide consultancy, banking, legal, insurance, and accounting services.</li>
              <li><strong className="text-foreground">Service providers:</strong> Third-party vendors who assist us in operating our website and delivering our services, subject to confidentiality obligations.</li>
            </ul>
            <p className="mt-3">We do not sell your personal data to third parties.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">6. Data Retention</h2>
            <p>
              We retain your personal data for as long as necessary to fulfil the purposes for which it was collected, including satisfying any legal, accounting, or reporting requirements. For real estate transaction records, we are required to retain data for a minimum of 5 years in accordance with UAE regulatory requirements.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">7. Your Rights</h2>
            <p>Subject to applicable UAE law, you have the right to:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Request access to your personal data.</li>
              <li>Request correction of inaccurate or incomplete data.</li>
              <li>Request erasure of your personal data (subject to legal retention obligations).</li>
              <li>Object to processing of your personal data for marketing purposes.</li>
              <li>Request restriction of processing in certain circumstances.</li>
              <li>Withdraw consent at any time where processing is based on consent.</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, please contact us at <a href="mailto:admin@coveestates.com" className="text-primary hover:underline">admin@coveestates.com</a>.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">8. Cookies</h2>
            <p>
              Our website uses cookies and similar tracking technologies to enhance your browsing experience. Please refer to our <Link href="/cookie-policy" className="text-primary hover:underline">Cookie Policy</Link> for detailed information on how we use cookies and how you can manage your preferences.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">9. Security</h2>
            <p>
              We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">10. International Transfers</h2>
            <p>
              As an international real estate advisory, we may transfer your personal data to countries outside the UAE. Where we do so, we ensure appropriate safeguards are in place to protect your data in accordance with applicable law.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on our website with an updated effective date. We encourage you to review this policy periodically.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">12. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy or our data practices, please contact:</p>
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
