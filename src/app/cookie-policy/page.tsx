import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'Cookie Policy | Cove Estatez Real Estate LLC',
  description: 'Cookie Policy for Cove Estatez Real Estate LLC — how we use cookies and similar technologies on our website.',
};

export default function CookiePolicyPage() {
  return (
    <main className="bg-background overflow-x-hidden">
      <Header />
      <section className="pt-32 pb-20 px-4 md:px-10 max-w-4xl mx-auto">
        <div className="mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 block">Legal</span>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tighter mb-4">Cookie Policy</h1>
          <p className="text-muted-foreground text-sm">Last updated: 1 January 2025</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">

          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">1. Introduction</h2>
            <p>
              This Cookie Policy explains how Cove Estatez Real Estate LLC (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) uses cookies and similar tracking technologies when you visit our website. By continuing to use our website, you consent to our use of cookies as described in this policy.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">2. What Are Cookies?</h2>
            <p>
              Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit a website. They are widely used to make websites work more efficiently, provide a better user experience, and give website owners information about how their site is being used.
            </p>
            <p className="mt-3">
              Cookies can be &quot;session cookies&quot; (which expire when you close your browser) or &quot;persistent cookies&quot; (which remain on your device for a set period or until you delete them). They can also be &quot;first-party cookies&quot; (set by us) or &quot;third-party cookies&quot; (set by other organisations).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">3. Types of Cookies We Use</h2>

            <div className="mt-4 space-y-6">
              <div className="p-5 border border-border bg-card">
                <h3 className="text-foreground font-bold mb-2">3.1 Strictly Necessary Cookies</h3>
                <p>These cookies are essential for the website to function properly. They enable core functionality such as security, network management, and accessibility. You cannot opt out of these cookies.</p>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4 text-foreground font-semibold">Cookie Name</th>
                        <th className="text-left py-2 pr-4 text-foreground font-semibold">Purpose</th>
                        <th className="text-left py-2 text-foreground font-semibold">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-1">
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4 font-mono">session_id</td>
                        <td className="py-2 pr-4">Maintains your session state</td>
                        <td className="py-2">Session</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4 font-mono">csrf_token</td>
                        <td className="py-2 pr-4">Security — prevents cross-site request forgery</td>
                        <td className="py-2">Session</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-5 border border-border bg-card">
                <h3 className="text-foreground font-bold mb-2">3.2 Performance and Analytics Cookies</h3>
                <p>These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve the website&apos;s performance and user experience.</p>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4 text-foreground font-semibold">Cookie Name</th>
                        <th className="text-left py-2 pr-4 text-foreground font-semibold">Provider</th>
                        <th className="text-left py-2 text-foreground font-semibold">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4 font-mono">_ga</td>
                        <td className="py-2 pr-4">Google Analytics — distinguishes users</td>
                        <td className="py-2">2 years</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4 font-mono">_ga_*</td>
                        <td className="py-2 pr-4">Google Analytics — maintains session state</td>
                        <td className="py-2">2 years</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4 font-mono">_gid</td>
                        <td className="py-2 pr-4">Google Analytics — distinguishes users</td>
                        <td className="py-2">24 hours</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-5 border border-border bg-card">
                <h3 className="text-foreground font-bold mb-2">3.3 Functional Cookies</h3>
                <p>These cookies enable enhanced functionality and personalisation, such as remembering your currency preference and other settings.</p>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4 text-foreground font-semibold">Cookie Name</th>
                        <th className="text-left py-2 pr-4 text-foreground font-semibold">Purpose</th>
                        <th className="text-left py-2 text-foreground font-semibold">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4 font-mono">currency_pref</td>
                        <td className="py-2 pr-4">Remembers your selected currency</td>
                        <td className="py-2">1 year</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4 font-mono">language_pref</td>
                        <td className="py-2 pr-4">Remembers your language preference</td>
                        <td className="py-2">1 year</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-5 border border-border bg-card">
                <h3 className="text-foreground font-bold mb-2">3.4 Marketing and Targeting Cookies</h3>
                <p>These cookies are used to deliver advertisements more relevant to you and your interests. They are also used to limit the number of times you see an advertisement and help measure the effectiveness of advertising campaigns.</p>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4 text-foreground font-semibold">Cookie Name</th>
                        <th className="text-left py-2 pr-4 text-foreground font-semibold">Provider</th>
                        <th className="text-left py-2 text-foreground font-semibold">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4 font-mono">_fbp</td>
                        <td className="py-2 pr-4">Facebook Pixel — tracks conversions</td>
                        <td className="py-2">3 months</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4 font-mono">_gcl_au</td>
                        <td className="py-2 pr-4">Google Ads — conversion tracking</td>
                        <td className="py-2">3 months</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">4. How to Manage Cookies</h2>
            <p>You can control and manage cookies in several ways:</p>

            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-foreground font-semibold mb-2">Browser Settings</h3>
                <p>Most browsers allow you to refuse or delete cookies through their settings. Please note that if you choose to block cookies, some parts of our website may not function correctly. Here are links to cookie management instructions for common browsers:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Google Chrome: Settings → Privacy and Security → Cookies and other site data</li>
                  <li>Mozilla Firefox: Options → Privacy &amp; Security → Cookies and Site Data</li>
                  <li>Safari: Preferences → Privacy → Manage Website Data</li>
                  <li>Microsoft Edge: Settings → Cookies and site permissions</li>
                </ul>
              </div>

              <div>
                <h3 className="text-foreground font-semibold mb-2">Opt-Out Tools</h3>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Google Analytics: <span className="text-primary">tools.google.com/dlpage/gaoptout</span></li>
                  <li>Google Ads: <span className="text-primary">adssettings.google.com</span></li>
                  <li>Facebook: Your Facebook account settings → Ads preferences</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">5. Local Storage</h2>
            <p>
              In addition to cookies, our website uses browser local storage to save your preferences (such as currency selection) and to maintain certain application states. Local storage data is not transmitted to our servers and remains on your device until you clear your browser data.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">6. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our data practices. We will post any changes on this page with an updated effective date. We encourage you to check this page periodically.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">7. More Information</h2>
            <p>
              For more information about how we handle your personal data, please read our <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>. If you have any questions about our use of cookies, please contact:
            </p>
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
