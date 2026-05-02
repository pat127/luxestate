'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

const SITE_URL = 'https://luxestate6357.builtwithrocket.new';

const XML_FEED_URL = `${SITE_URL}/api/feed/properties.xml`;
const PROJECTS_FEED_URL = `${SITE_URL}/api/feed/projects.xml`;

const samplePropertyXml = `<?xml version="1.0" encoding="UTF-8"?>
<listings>
  <listing>
    <id>LX-RES-001</id>
    <title>Obsidian Penthouse</title>
    <type>Residential</type>
    <status>Available</status>
    <price currency="AED">28500000</price>
    <location>
      <area>Downtown Dubai</area>
      <community>Burj Khalifa District</community>
      <address>Obsidian Tower, Downtown Dubai</address>
      <lat>25.1972</lat>
      <lng>55.2744</lng>
    </location>
    <specs>
      <bedrooms>5</bedrooms>
      <bathrooms>6</bathrooms>
      <area_sqft>8200</area_sqft>
    </specs>
    <agent>Sarah Mitchell</agent>
    <updated>2026-05-02</updated>
    <url>${SITE_URL}/admin/properties/1</url>
  </listing>
  <listing>
    <id>LX-RES-002</id>
    <title>Meridian Villa</title>
    <type>Residential</type>
    <status>Under Offer</status>
    <price currency="AED">42000000</price>
    <location>
      <area>Palm Jumeirah</area>
      <community>Frond N</community>
      <address>Meridian Villa, Palm Jumeirah</address>
      <lat>25.1124</lat>
      <lng>55.1390</lng>
    </location>
    <specs>
      <bedrooms>7</bedrooms>
      <bathrooms>9</bathrooms>
      <area_sqft>14500</area_sqft>
    </specs>
    <agent>James Carter</agent>
    <updated>2026-05-02</updated>
    <url>${SITE_URL}/admin/properties/2</url>
  </listing>
</listings>`;

const sampleProjectXml = `<?xml version="1.0" encoding="UTF-8"?>
<projects>
  <project>
    <id>LX-PRJ-001</id>
    <name>Skyline Residences</name>
    <developer>Emaar</developer>
    <type>Off-Plan</type>
    <status>Active</status>
    <starting_price currency="AED">1200000</starting_price>
    <location>
      <area>Downtown Dubai</area>
    </location>
    <units>
      <total>240</total>
      <sold>180</sold>
      <available>60</available>
    </units>
    <completion>Q4 2026</completion>
    <updated>2026-05-02</updated>
    <url>${SITE_URL}/admin/projects/1</url>
  </project>
  <project>
    <id>LX-PRJ-002</id>
    <name>Marina Bay Towers</name>
    <developer>DAMAC</developer>
    <type>Off-Plan</type>
    <status>Active</status>
    <starting_price currency="AED">900000</starting_price>
    <location>
      <area>Dubai Marina</area>
    </location>
    <units>
      <total>320</total>
      <sold>210</sold>
      <available>110</available>
    </units>
    <completion>Q2 2027</completion>
    <updated>2026-05-02</updated>
    <url>${SITE_URL}/admin/projects/2</url>
  </project>
</projects>`;

type FeedTab = 'properties' | 'projects';

export default function SyndicationPage() {
  const [activeTab, setActiveTab] = useState<FeedTab>('properties');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [showXml, setShowXml] = useState(false);
  const [xmlType, setXmlType] = useState<FeedTab>('properties');

  const handleCopy = (text: string, key: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedUrl(key);
        setTimeout(() => setCopiedUrl(null), 2000);
      });
    }
  };

  const handleViewXml = (type: FeedTab) => {
    setXmlType(type);
    setShowXml(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Syndication</h1>
          <p className="text-sm text-muted-foreground mt-0.5">XML feed distribution for property and project listings</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-6 flex items-start gap-3 bg-primary/5 border border-primary/20 px-4 py-4">
        <Icon name="InformationCircleIcon" size={18} className="text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">XML Feed Syndication</p>
          <p className="text-xs text-muted-foreground mt-1">
            LuxEstate distributes listings via live XML feeds. Share the feed URLs below with portals (Property Finder, Bayut, Dubizzle, etc.) or any aggregator that supports XML/RSS property feeds. Feeds are automatically updated whenever listings change.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Properties in Feed', value: '5', icon: 'HomeIcon' },
          { label: 'Projects in Feed', value: '4', icon: 'BuildingOffice2Icon' },
          { label: 'Feed Format', value: 'XML', icon: 'CodeBracketIcon' },
          { label: 'Last Updated', value: 'Live', icon: 'ArrowPathIcon' },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon name={s.icon as any} size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-lg font-bold text-foreground">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Feed URLs */}
      <div className="space-y-4 mb-8">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Live Feed URLs</h2>

        {/* Properties Feed */}
        <div className="bg-card border border-border p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Icon name="HomeIcon" size={18} className="text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Properties XML Feed</h3>
                <p className="text-xs text-muted-foreground mt-0.5">All residential & commercial property listings</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-semibold">Live</span>
            </div>
          </div>
          <div className="flex gap-2 mb-3">
            <div className="flex-1 flex items-center gap-2 bg-secondary border border-border px-3 py-2">
              <Icon name="LinkIcon" size={13} className="text-muted-foreground flex-shrink-0" />
              <span className="text-xs text-foreground font-mono truncate">{XML_FEED_URL}</span>
            </div>
            <button onClick={() => handleCopy(XML_FEED_URL, 'prop')} className={`px-4 py-2 text-xs font-bold transition-colors flex-shrink-0 ${copiedUrl === 'prop' ? 'bg-emerald-500 text-white' : 'bg-primary text-primary-foreground hover:bg-accent'}`}>
              {copiedUrl === 'prop' ? 'Copied!' : 'Copy URL'}
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleViewXml('properties')} className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
              <Icon name="CodeBracketIcon" size={13} />View Sample XML
            </button>
            <button onClick={() => handleCopy(samplePropertyXml, 'prop-xml')} className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
              <Icon name="ClipboardDocumentIcon" size={13} />{copiedUrl === 'prop-xml' ? 'Copied!' : 'Copy XML'}
            </button>
          </div>
        </div>

        {/* Projects Feed */}
        <div className="bg-card border border-border p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-400/10 border border-blue-400/20 flex items-center justify-center">
                <Icon name="BuildingOffice2Icon" size={18} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Projects XML Feed</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Off-plan and development project listings</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-semibold">Live</span>
            </div>
          </div>
          <div className="flex gap-2 mb-3">
            <div className="flex-1 flex items-center gap-2 bg-secondary border border-border px-3 py-2">
              <Icon name="LinkIcon" size={13} className="text-muted-foreground flex-shrink-0" />
              <span className="text-xs text-foreground font-mono truncate">{PROJECTS_FEED_URL}</span>
            </div>
            <button onClick={() => handleCopy(PROJECTS_FEED_URL, 'proj')} className={`px-4 py-2 text-xs font-bold transition-colors flex-shrink-0 ${copiedUrl === 'proj' ? 'bg-emerald-500 text-white' : 'bg-primary text-primary-foreground hover:bg-accent'}`}>
              {copiedUrl === 'proj' ? 'Copied!' : 'Copy URL'}
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleViewXml('projects')} className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
              <Icon name="CodeBracketIcon" size={13} />View Sample XML
            </button>
            <button onClick={() => handleCopy(sampleProjectXml, 'proj-xml')} className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
              <Icon name="ClipboardDocumentIcon" size={13} />{copiedUrl === 'proj-xml' ? 'Copied!' : 'Copy XML'}
            </button>
          </div>
        </div>
      </div>

      {/* How to Use */}
      <div className="bg-card border border-border p-5">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">How to Submit to Portals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Copy Feed URL', desc: 'Copy the XML feed URL for properties or projects above.', icon: 'LinkIcon' },
            { step: '2', title: 'Submit to Portal', desc: 'Log in to your portal account (Property Finder, Bayut, etc.) and navigate to Feed / XML Import settings. Paste the URL.', icon: 'ArrowUpTrayIcon' },
            { step: '3', title: 'Auto-Sync', desc: 'The portal will periodically fetch the feed. Listings are always up-to-date — no manual re-upload needed.', icon: 'ArrowPathIcon' },
          ].map(({ step, title, desc, icon }) => (
            <div key={step} className="flex gap-3">
              <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-primary text-sm font-bold">{step}</div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Compatible Portals</p>
          <div className="flex flex-wrap gap-2">
            {['Property Finder', 'Bayut', 'Dubizzle', 'Rightmove', 'Zoopla', 'Zillow', 'JustProperty', 'Houza'].map((portal) => (
              <span key={portal} className="px-3 py-1 bg-secondary border border-border text-xs text-muted-foreground">{portal}</span>
            ))}
          </div>
        </div>
      </div>

      {/* XML Preview Modal */}
      {showXml && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
              <div>
                <h2 className="text-base font-bold text-foreground">Sample XML Feed</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{xmlType === 'properties' ? 'Properties' : 'Projects'} feed structure</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleCopy(xmlType === 'properties' ? samplePropertyXml : sampleProjectXml, 'modal-xml')} className={`flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs transition-colors ${copiedUrl === 'modal-xml' ? 'text-emerald-400 border-emerald-400/30' : 'text-muted-foreground hover:text-foreground'}`}>
                  <Icon name="ClipboardDocumentIcon" size={13} />{copiedUrl === 'modal-xml' ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={() => setShowXml(false)} className="text-muted-foreground hover:text-foreground"><Icon name="XMarkIcon" size={18} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap bg-[#0d1117] p-4 leading-relaxed">
                {xmlType === 'properties' ? samplePropertyXml : sampleProjectXml}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
