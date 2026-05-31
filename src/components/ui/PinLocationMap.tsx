'use client';

import React, { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface PinMapProps {
  value: { lat: number; lng: number; address?: string };
  onChange: (val: { lat: number; lng: number; address?: string }) => void;
  label?: string;
}

// Simple interactive pin-drop map using OpenStreetMap tiles (no API key needed)
export default function PinLocationMap({ value, onChange, label = 'Pin Location' }: PinMapProps) {
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: value.lat || 25.2048, lng: value.lng || 55.2708 });
  const [pinPos, setPinPos] = useState({ lat: value.lat || 25.2048, lng: value.lng || 55.2708 });
  const mapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Convert lat/lng to pixel position within the map div (simplified Mercator)
  const latLngToPixel = (lat: number, lng: number, centerLat: number, centerLng: number, zoom: number, width: number, height: number) => {
    const scale = Math.pow(2, zoom) * 256;
    const toX = (lng: number) => (lng + 180) / 360 * scale;
    const toY = (lat: number) => {
      const sinLat = Math.sin(lat * Math.PI / 180);
      return (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale;
    };
    const cx = toX(centerLng);
    const cy = toY(centerLat);
    const px = toX(lng) - cx + width / 2;
    const py = toY(lat) - cy + height / 2;
    return { x: px, y: py };
  };

  const pixelToLatLng = (px: number, py: number, centerLat: number, centerLng: number, zoom: number, width: number, height: number) => {
    const scale = Math.pow(2, zoom) * 256;
    const toX = (lng: number) => (lng + 180) / 360 * scale;
    const toY = (lat: number) => {
      const sinLat = Math.sin(lat * Math.PI / 180);
      return (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale;
    };
    const fromX = (x: number) => x / scale * 360 - 180;
    const fromY = (y: number) => {
      const n = Math.PI - 2 * Math.PI * y / scale;
      return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
    };
    const cx = toX(centerLng);
    const cy = toY(centerLat);
    const worldX = px - width / 2 + cx;
    const worldY = py - height / 2 + cy;
    return { lat: fromY(worldY), lng: fromX(worldX) };
  };

  const zoom = 13;

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const { lat, lng } = pixelToLatLng(px, py, mapCenter.lat, mapCenter.lng, zoom, rect.width, rect.height);
    const roundedLat = Math.round(lat * 100000) / 100000;
    const roundedLng = Math.round(lng * 100000) / 100000;
    setPinPos({ lat: roundedLat, lng: roundedLng });
    onChange({ lat: roundedLat, lng: roundedLng, address: value.address });
  };

  const searchLocation = async () => {
    if (!search.trim()) return;
    setSearching(true);
    try {
      // Removed countrycodes=ae to support international search; accept-language=en forces English results
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}&limit=5&accept-language=en`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      setSuggestions(data);
    } catch {
      // fallback: just update coords if user typed lat,lng
    } finally {
      setSearching(false);
    }
  };

  const selectSuggestion = (s: any) => {
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);
    setMapCenter({ lat, lng });
    setPinPos({ lat, lng });
    onChange({ lat, lng, address: s.display_name });
    setSearch(s.display_name.split(',').slice(0, 2).join(','));
    setSuggestions([]);
  };

  const handleSearchInput = (val: string) => {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length > 2) {
      debounceRef.current = setTimeout(() => searchLocation(), 500);
    } else {
      setSuggestions([]);
    }
  };

  // Compute pin pixel position
  const mapWidth = 480;
  const mapHeight = 280;
  const pinPixel = latLngToPixel(pinPos.lat, pinPos.lng, mapCenter.lat, mapCenter.lng, zoom, mapWidth, mapHeight);

  // Build tile URL for the center
  const tileZoom = zoom;
  const lat2tile = (lat: number, z: number) => Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z));
  const lng2tile = (lng: number, z: number) => Math.floor((lng + 180) / 360 * Math.pow(2, z));
  const centerTileX = lng2tile(mapCenter.lng, tileZoom);
  const centerTileY = lat2tile(mapCenter.lat, tileZoom);

  return (
    <div className="space-y-2">
      {label && <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>}

      {/* Search */}
      <div className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder="Search any city or location worldwide..."
            className="flex-1 bg-secondary border border-border px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={searchLocation}
            disabled={searching}
            className="px-3 py-2 bg-primary text-primary-foreground text-xs font-bold hover:bg-accent transition-colors flex items-center gap-1"
          >
            {searching ? <Icon name="ArrowPathIcon" size={14} className="animate-spin" /> : <Icon name="MagnifyingGlassIcon" size={14} />}
            Search
          </button>
        </div>
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 bg-card border border-border shadow-lg max-h-48 overflow-y-auto">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectSuggestion(s)}
                className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-primary/10 border-b border-border last:border-0"
              >
                {s.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div
        ref={mapRef}
        className="relative border border-border overflow-hidden cursor-crosshair bg-secondary"
        style={{ height: 280 }}
        onClick={handleMapClick}
      >
        {/* English map tiles using CartoCDN Voyager (English labels globally) */}
        <div className="absolute inset-0 pointer-events-none">
          {[-1, 0, 1].map((dy) =>
            [-1, 0, 1].map((dx) => {
              const tx = centerTileX + dx;
              const ty = centerTileY + dy;
              const tileSize = 256;
              const centerTilePixelX = mapWidth / 2 - (mapWidth / 2 % tileSize);
              const centerTilePixelY = mapHeight / 2 - (mapHeight / 2 % tileSize);
              const tileLeft = centerTilePixelX + dx * tileSize - (mapWidth / 2 % tileSize);
              const tileTop = centerTilePixelY + dy * tileSize - (mapHeight / 2 % tileSize);
              return (
                <img
                  key={`${dx}-${dy}`}
                  // voyager_labels_under uses English-only labels worldwide
                  src={`https://a.basemaps.cartocdn.com/rastertiles/voyager_labels_under/${tileZoom}/${tx}/${ty}@2x.png`}
                  alt=""
                  style={{
                    position: 'absolute',
                    left: tileLeft,
                    top: tileTop,
                    width: tileSize,
                    height: tileSize,
                    imageRendering: 'auto',
                  }}
                />
              );
            })
          )}
        </div>

        {/* Pin */}
        <div
          className="absolute pointer-events-none z-10"
          style={{
            left: pinPixel.x - 12,
            top: pinPixel.y - 32,
          }}
        >
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 bg-primary border-2 border-white rounded-full shadow-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <div className="w-0.5 h-4 bg-primary" />
          </div>
        </div>

        {/* Overlay hint */}
        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 pointer-events-none">
          Click to place pin
        </div>
      </div>

      {/* Coordinates display */}
      <div className="flex gap-3">
        <div className="flex-1 bg-secondary border border-border px-3 py-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Latitude</p>
          <p className="text-sm font-mono text-foreground">{pinPos.lat.toFixed(5)}</p>
        </div>
        <div className="flex-1 bg-secondary border border-border px-3 py-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Longitude</p>
          <p className="text-sm font-mono text-foreground">{pinPos.lng.toFixed(5)}</p>
        </div>
      </div>
      {value.address && (
        <p className="text-xs text-muted-foreground truncate">{value.address}</p>
      )}
    </div>
  );
}
