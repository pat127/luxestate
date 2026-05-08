import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'Cookie Policy | Cove Estates',
  description: 'Cookie Policy for Cove Estates — how we use cookies and tracking technologies on our website.',
};

export default function CookiePolicyPage() {
  return (
    <main className="bg-background overflow-x-hidden">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-12 px-6 md:px-10 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 block">Legal</span>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tighter mb-4">Cookie Policy</h1>
          <p className="text-muted-foreground text-sm">Last updated: 1 January 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-10 text-muted-foreground text-sm leading-relaxed">

            <div>
              <h2 className="text-foreground font-bold text-xl mb-4">1. What Are Cookies?</h2>
              <p>Cookies are small text files placed on your device when you visit a website. They are widely used to make websites work efficiently, improve user experience, and provide information to website owners. Cookies cannot harm your device and do not contain personally identifiable information on their own.</p>
            </div>

            <div>
              <h2 className="text-foreground font-bold text-xl mb-4">2. How We Use Cookies</h2>
              <p>Cove Estates uses cookies and similar technologies (such as local storage and session storage) on our website to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Remember your preferences (such as currency selection and language settings)</li>
                <li>Keep you logged in to our client portal</li>
                <li>Understand how visitors use our website through analytics</li>
                <li>Improve website performance and functionality</li>
                <li>Deliver relevant property recommendations and marketing content</li>
                <li>Prevent fraud and ensure website security</li>
              </ul>
            </div>

            <div>
              <h2 className="text-foreground font-bold text-xl mb-4">3. Types of Cookies We Use</h2>

              <div className="space-y-6">
                <div className="border border-border p-5 bg-card">
                  <h3 className="text-foreground font-bold mb-2">Essential Cookies</h3>
                  <p className="text-xs mb-3">These cookies are necessary for the website to function and cannot be switched off. They are usually set in response to actions you take, such as logging in or filling in forms.</p>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-foreground font-semibold">Cookie Name</th>
                        <th className="text-left py-2 text-foreground font-semibold">Purpose</th>
                        <th className="text-left py-2 text-foreground font-semibold">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr><td className="py-2 font-mono">session_id</td><td className="py-2">User session management</td><td className="py-2">Session</td></tr>
                      <tr><td className="py-2 font-mono">auth_token</td><td className="py-2">Authentication state</td><td className="py-2">7 days</td></tr>
                      <tr><td className="py-2 font-mono">csrf_token</td><td className="py-2">Security — prevents cross-site request forgery</td><td className="py-2">Session</td></tr>
                    </tbody>
                  </table>
                </div>

                <div className="border border-border p-5 bg-card">
                  <h3 className="text-foreground font-bold mb-2">Functional Cookies</h3>
                  <p className="text-xs mb-3">These cookies enable enhanced functionality and personalisation, such as remembering your currency preference and search filters.</p>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-foreground font-semibold">Cookie Name</th>
                        <th className="text-left py-2 text-foreground font-semibold">Purpose</th>
                        <th className="text-left py-2 text-foreground font-semibold">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr><td className="py-2 font-mono">preferred_currency</td><td className="py-2">Remembers your currency selection (AED/USD/GBP/EUR)</td><td className="py-2">1 year</td></tr>
                      <tr><td className="py-2 font-mono">search_filters</td><td className="py-2">Saves your last property search criteria</td><td className="py-2">30 days</td></tr>
                      <tr><td className="py-2 font-mono">cookie_consent</td><td className="py-2">Records your cookie preferences</td><td className="py-2">1 year</td></tr>
                    </tbody>
                  </table>
                </div>

                <div className="border border-border p-5 bg-card">
                  <h3 className="text-foreground font-bold mb-2">Analytics Cookies</h3>
                  <p className="text-xs mb-3">These cookies help us understand how visitors interact with our website, allowing us to improve our content and user experience. All data is aggregated and anonymised.</p>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-foreground font-semibold">Provider</th>
                        <th className="text-left py-2 text-foreground font-semibold">Purpose</th>
                        <th className="text-left py-2 text-foreground font-semibold">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr><td className="py-2">Google Analytics</td><td className="py-2">Website traffic analysis and user behaviour</td><td className="py-2">2 years</td></tr>
                      <tr><td className="py-2">Google Tag Manager</td><td className="py-2">Tag management and event tracking</td><td className="py-2">Session</td></tr>
                    </tbody>
                  </table>
                </div>

                <div className="border border-border p-5 bg-card">
                  <h3 className="text-foreground font-bold mb-2">Marketing Cookies</h3>
                  <p className="text-xs mb-3">These cookies are used to deliver relevant property listings and advertisements. They track your browsing activity across websites to build a profile of your interests.</p>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-foreground font-semibold">Provider</th>
                        <th className="text-left py-2 text-foreground font-semibold">Purpose</th>
                        <th className="text-left py-2 text-foreground font-semibold">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr><td className="py-2">Google Ads</td><td className="py-2">Remarketing and conversion tracking</td><td className="py-2">90 days</td></tr>
                      <tr><td className="py-2">Meta Pixel</td><td className="py-2">Facebook/Instagram advertising</td><td className="py-2">90 days</td></tr>
                      <tr><td className="py-2">LinkedIn Insight</td><td className="py-2">Professional audience targeting</td><td className="py-2">90 days</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-foreground font-bold text-xl mb-4">4. Managing Your Cookie Preferences</h2>
              <p className="mb-3">You can control and manage cookies in several ways:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-foreground">Browser Settings:</strong> Most browsers allow you to refuse or delete cookies through their settings. Note that disabling cookies may affect website functionality.</li>
                <li><strong className="text-foreground">Google Analytics Opt-Out:</strong> Install the <a href="https://tools.google.com/dlpage/gaoptout" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a></li>
                <li><strong className="text-foreground">Google Ads:</strong> Manage preferences at <a href="https://adssettings.google.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google Ad Settings</a></li>
                <li><strong className="text-foreground">Meta:</strong> Manage preferences in your Facebook/Instagram account settings</li>
              </ul>
            </div>

            <div>
              <h2 className="text-foreground font-bold text-xl mb-4">5. Local Storage</h2>
              <p>In addition to cookies, we use browser local storage to save your preferences (such as currency selection and CRM data for admin users). Local storage data is stored on your device and is not transmitted to our servers unless you explicitly submit a form or save changes.</p>
            </div>

            <div>
              <h2 className="text-foreground font-bold text-xl mb-4">6. Third-Party Cookies</h2>
              <p>Some cookies on our website are set by third-party services we use, including Google, Meta, LinkedIn, and property portal integrations. These third parties have their own privacy policies governing their use of cookies. We recommend reviewing their policies for full details.</p>
            </div>

            <div>
              <h2 className="text-foreground font-bold text-xl mb-4">7. Updates to This Policy</h2>
              <p>We may update this Cookie Policy periodically to reflect changes in our practices or applicable regulations. The &ldquo;Last updated&rdquo; date at the top of this page indicates when the policy was last revised.</p>
            </div>

            <div>
              <h2 className="text-foreground font-bold text-xl mb-4">8. Contact Us</h2>
              <p className="mb-3">If you have questions about our use of cookies, please contact us:</p>
              <div className="border border-border p-6 bg-card space-y-2">
                <p><strong className="text-foreground">Cove Estates Real Estate LLC</strong></p>
                <p>8th Level, Moosa Tower 1, Sheikh Zayed Road, Dubai, UAE</p>
                <p>Email: <a href="mailto:privacy@coveestates.com" className="text-primary hover:underline">privacy@coveestates.com</a></p>
                <p>Phone: <a href="tel:+971508862683" className="text-primary hover:underline">+971 50 886 2683</a></p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Legal Links */}
      <section className="py-8 px-6 md:px-10 border-t border-border">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-6">
          <Link href="/privacy-policy" className="text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">Privacy Policy</Link>
          <Link href="/terms-of-service" className="text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">Terms of Service</Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
