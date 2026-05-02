'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

type SettingsTab = 'Company' | 'Branding' | 'Appearance' | 'Hero' | 'Sections' | 'About Page' | 'CTA' | 'Social' | 'SEO' | 'Workflow';

const tabs: SettingsTab[] = ['Company', 'Branding', 'Appearance', 'Hero', 'Sections', 'About Page', 'CTA', 'Social', 'SEO', 'Workflow'];

function InputField({ label, placeholder, value, type = 'text' }: { label: string; placeholder?: string; value?: string; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
      />
    </div>
  );
}

function TextareaField({ label, placeholder, value, rows = 3 }: { label: string; placeholder?: string; value?: string; rows?: number }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">{label}</label>
      <textarea
        rows={rows}
        defaultValue={value}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
      />
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-base font-bold text-foreground flex items-center gap-2">
        <div className="w-1 h-5 bg-primary" />
        {title}
      </h2>
      <p className="text-xs text-muted-foreground mt-1 ml-3">{description}</p>
    </div>
  );
}

function ColorField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" defaultValue={value} className="w-10 h-10 bg-input border border-border cursor-pointer p-0.5" />
        <input type="text" defaultValue={value} className="flex-1 px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
      </div>
    </div>
  );
}

function ToggleField({ label, description, defaultChecked = false }: { label: string; description?: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between py-3 border-b border-border">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => setChecked(!checked)}
        className={`w-10 h-5 relative transition-colors ${checked ? 'bg-primary' : 'bg-muted'}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('Company');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage all site content and configuration</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors"
        >
          <Icon name={saved ? 'CheckIcon' : 'CloudArrowUpIcon'} size={14} />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-border mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="max-w-3xl">
        {activeTab === 'Company' && (
          <div className="space-y-6">
            <SectionHeader title="Company Information" description="Basic company details and contact information" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Company Name" value="LuxEstate" />
              <InputField label="Tagline" value="Luxury Real Estate in Dubai" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InputField label="Phone" value="+971 50 886 2683" />
              <InputField label="Email" value="admin@luxestate.com" />
              <InputField label="WhatsApp (with country code)" value="+971508862683" />
            </div>
            <TextareaField label="Address" value="8th Level, Moosa Tower 1, Dubai, UAE" rows={2} />
          </div>
        )}

        {activeTab === 'Branding' && (
          <div className="space-y-6">
            <SectionHeader title="Brand Identity" description="Logo, colors, and typography settings" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ColorField label="Primary Color (Gold)" value="#C9A84C" />
              <ColorField label="Accent Color" value="#B8963E" />
              <ColorField label="Background Color" value="#0A0A0A" />
              <ColorField label="Foreground Color" value="#F5F0E8" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Font Family</label>
                <select className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50">
                  <option>Plus Jakarta Sans</option>
                  <option>DM Sans</option>
                  <option>Manrope</option>
                  <option>Cabinet Grotesk</option>
                  <option>Satoshi</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Base Font Size</label>
                <select defaultValue="16px" className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50">
                  <option>14px</option>
                  <option>15px</option>
                  <option>16px</option>
                  <option>17px</option>
                  <option>18px</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Heading Font Weight</label>
                <select defaultValue="800 — Extra Bold" className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50">
                  <option>600 — Semi Bold</option>
                  <option>700 — Bold</option>
                  <option>800 — Extra Bold</option>
                  <option>900 — Black</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Border Radius</label>
                <select defaultValue="0px — Sharp" className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50">
                  <option>0px — Sharp</option>
                  <option>4px — Slight</option>
                  <option>8px — Rounded</option>
                  <option>12px — More Rounded</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Logo Upload</label>
              <div className="border border-dashed border-border p-6 text-center hover:border-primary/40 transition-colors cursor-pointer">
                <Icon name="PhotoIcon" size={24} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Click to upload logo (SVG, PNG, JPG)</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Appearance' && (
          <div className="space-y-6">
            <SectionHeader title="Site Appearance" description="Layout, theme, and visual settings" />
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Color Theme</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: 'Dark Gold', bg: '#0A0A0A', accent: '#C9A84C' },
                  { name: 'Dark Silver', bg: '#0A0A0A', accent: '#A8A8A8' },
                  { name: 'Midnight Blue', bg: '#050A18', accent: '#4A90D9' },
                ].map((theme) => (
                  <button key={theme.name} className="p-3 border border-border hover:border-primary/30 transition-colors text-left">
                    <div className="flex gap-2 mb-2">
                      <div className="w-6 h-6 border border-border" style={{ backgroundColor: theme.bg }} />
                      <div className="w-6 h-6" style={{ backgroundColor: theme.accent }} />
                    </div>
                    <p className="text-xs font-semibold text-foreground">{theme.name}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-0">
              <ToggleField label="Dark Mode" description="Enable dark mode by default" defaultChecked={true} />
              <ToggleField label="Sticky Header" description="Keep navigation fixed on scroll" defaultChecked={true} />
              <ToggleField label="Scroll Animations" description="Enable scroll-triggered animations" defaultChecked={true} />
              <ToggleField label="Gold Shimmer Effects" description="Enable gold shimmer text animations" defaultChecked={true} />
              <ToggleField label="Show WhatsApp Button" description="Display WhatsApp chat button in header" defaultChecked={true} />
            </div>
          </div>
        )}

        {activeTab === 'Hero' && (
          <div className="space-y-6">
            <SectionHeader title="Hero Section" description="Configure the homepage hero section" />
            <InputField label="Hero Headline" value="Where Luxury Meets Legacy" />
            <InputField label="Hero Subheadline" value="Ultra-premium properties for discerning buyers" />
            <TextareaField label="Hero Description" value="LuxEstate curates the world's finest residential and commercial properties for high-net-worth buyers seeking exclusivity, prestige, and exceptional returns." />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Primary CTA Text" value="Explore Properties" />
              <InputField label="Primary CTA Link" value="/residential" />
              <InputField label="Secondary CTA Text" value="Book Consultation" />
              <InputField label="Secondary CTA Link" value="/#contact" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Hero Background Image</label>
              <div className="border border-dashed border-border p-6 text-center hover:border-primary/40 transition-colors cursor-pointer">
                <Icon name="PhotoIcon" size={24} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Click to upload hero image (recommended: 1920×1080)</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Sections' && (
          <div className="space-y-4">
            <SectionHeader title="Page Sections" description="Control which sections appear on each page" />
            <div className="space-y-0">
              <ToggleField label="Featured Properties" description="Show featured properties grid on homepage" defaultChecked={true} />
              <ToggleField label="Featured Projects" description="Show featured projects section on homepage" defaultChecked={true} />
              <ToggleField label="Why LuxEstate" description="Show value proposition section" defaultChecked={true} />
              <ToggleField label="Testimonials" description="Show client testimonials section" defaultChecked={true} />
              <ToggleField label="Mortgage Calculator" description="Show mortgage calculator tool" defaultChecked={true} />
              <ToggleField label="Market Insights" description="Show market insights on commercial page" defaultChecked={true} />
              <ToggleField label="Team Section" description="Show team section on residential page" defaultChecked={true} />
              <ToggleField label="Project Timeline" description="Show project timeline on projects page" defaultChecked={true} />
              <ToggleField label="Contact Section" description="Show contact form on homepage" defaultChecked={true} />
            </div>
          </div>
        )}

        {activeTab === 'About Page' && (
          <div className="space-y-6">
            <SectionHeader title="About Page" description="Configure the about page content" />
            <InputField label="About Headline" value="Redefining Luxury Real Estate" />
            <TextareaField label="About Description" value="LuxEstate was founded with a singular vision: to provide ultra-high-net-worth individuals with unparalleled access to the world's most exclusive properties." rows={4} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Years of Experience" value="15+" />
              <InputField label="Properties Sold" value="500+" />
              <InputField label="Total Value Transacted" value="AED 2.5B+" />
              <InputField label="Team Members" value="25" />
            </div>
          </div>
        )}

        {activeTab === 'CTA' && (
          <div className="space-y-6">
            <SectionHeader title="Call to Action" description="Configure CTA sections across the site" />
            <InputField label="Main CTA Headline" value="Ready to Find Your Dream Property?" />
            <TextareaField label="Main CTA Description" value="Our team of luxury real estate specialists is ready to guide you through every step of your property journey." />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="CTA Button Text" value="Book a Consultation" />
              <InputField label="CTA Button Link" value="/#contact" />
            </div>
            <ToggleField label="Show CTA Banner" description="Display CTA banner on all pages" defaultChecked={true} />
          </div>
        )}

        {activeTab === 'Social' && (
          <div className="space-y-6">
            <SectionHeader title="Social Media Links" description="Configure social media profiles and links" />
            <div className="space-y-4">
              {[
                { label: 'Instagram', placeholder: 'https://instagram.com/luxestate', icon: 'PhotoIcon' },
                { label: 'LinkedIn', placeholder: 'https://linkedin.com/company/luxestate', icon: 'BriefcaseIcon' },
                { label: 'Facebook', placeholder: 'https://facebook.com/luxestate', icon: 'UserGroupIcon' },
                { label: 'Twitter / X', placeholder: 'https://twitter.com/luxestate', icon: 'ChatBubbleLeftIcon' },
                { label: 'YouTube', placeholder: 'https://youtube.com/@luxestate', icon: 'PlayIcon' },
                { label: 'TikTok', placeholder: 'https://tiktok.com/@luxestate', icon: 'MusicalNoteIcon' },
              ].map((social) => (
                <div key={social.label} className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon name={social.icon as any} size={15} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <InputField label={social.label} placeholder={social.placeholder} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'SEO' && (
          <div className="space-y-6">
            <SectionHeader title="SEO Configuration" description="Search engine optimization settings" />
            <InputField label="Site Title" value="LuxEstate — Ultra-Premium Properties for Discerning Buyers" />
            <TextareaField label="Meta Description" value="LuxEstate curates the world's finest residential and commercial properties for high-net-worth buyers seeking exclusivity, prestige, and exceptional returns." rows={3} />
            <InputField label="Keywords" placeholder="luxury real estate, dubai properties, premium villas, off-plan projects" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="OG Title" value="LuxEstate — Luxury Real Estate Dubai" />
              <InputField label="OG Image URL" placeholder="https://luxestate.com/og-image.jpg" />
            </div>
            <InputField label="Canonical URL" value="https://luxestate6357.builtwithrocket.new" />
            <InputField label="Google Analytics ID" placeholder="G-XXXXXXXXXX" />
            <InputField label="Google Search Console Verification" placeholder="google-site-verification=..." />
            <div className="space-y-0">
              <ToggleField label="Enable Sitemap" description="Auto-generate XML sitemap" defaultChecked={true} />
              <ToggleField label="Enable Robots.txt" description="Allow search engine crawling" defaultChecked={true} />
              <ToggleField label="Structured Data (JSON-LD)" description="Enable schema.org markup" defaultChecked={true} />
              <ToggleField label="Open Graph Tags" description="Enable social sharing meta tags" defaultChecked={true} />
            </div>
          </div>
        )}

        {activeTab === 'Workflow' && (
          <div className="space-y-6">
            <SectionHeader title="Workflow Settings" description="Configure CRM workflow and automation" />
            <div className="space-y-0">
              <ToggleField label="Auto-assign Leads" description="Automatically assign new leads to agents" defaultChecked={true} />
              <ToggleField label="Lead Notifications" description="Send email notifications for new leads" defaultChecked={true} />
              <ToggleField label="Deal Stage Alerts" description="Notify agents when deal stage changes" defaultChecked={true} />
              <ToggleField label="Task Reminders" description="Send task due date reminders" defaultChecked={true} />
              <ToggleField label="WhatsApp Notifications" description="Send WhatsApp messages for key events" defaultChecked={false} />
              <ToggleField label="Weekly Reports" description="Auto-generate and email weekly reports" defaultChecked={true} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Lead Assignment Method</label>
                <select className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50">
                  <option>Round Robin</option>
                  <option>By Availability</option>
                  <option>Manual</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Follow-up Reminder (days)</label>
                <input type="number" defaultValue={3} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
