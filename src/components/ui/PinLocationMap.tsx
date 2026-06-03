'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/AppIcon';

interface PinMapProps {
  value: { lat: number; lng: number; address?: string };
  onChange: (val: { lat: number; lng: number; address?: string }) => void;
  label?: string;
}

const DEFAULT_LAT = 25.2048;
const DEFAULT_LNG = 55.2708;
const MIN_ZOOM = 3;
const MAX_ZOOM = 18;
const TILE_SIZE = 512; // Mapbox 512px tiles

function latToTileY(lat: number, zoom: number) {
  const sinLat = Math.sin((lat * Math.PI) / 180);
  return (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * Math.pow(2, zoom);
}

function lngToTileX(lng: number, zoom: number) {
  return ((lng + 180) / 360) * Math.pow(2, zoom);
}

function tileXToLng(x: number, zoom: number) {
  return (x / Math.pow(2, zoom)) * 360 - 180;
}

function tileYToLat(y: number, zoom: number) {
  const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, zoom);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

// Convert lat/lng to pixel offset from map center
function latLngToPixel(
  lat: number, lng: number,
  centerLat: number, centerLng: number,
  zoom: number, width: number, height: number
) {
  const cx = lngToTileX(centerLng, zoom) * TILE_SIZE;
  const cy = latToTileY(centerLat, zoom) * TILE_SIZE;
  const px = lngToTileX(lng, zoom) * TILE_SIZE - cx + width / 2;
  const py = latToTileY(lat, zoom) * TILE_SIZE - cy + height / 2;
  return { x: px, y: py };
}

// Convert pixel offset from map top-left to lat/lng
function pixelToLatLng(
  px: number, py: number,
  centerLat: number, centerLng: number,
  zoom: number, width: number, height: number
) {
  const cx = lngToTileX(centerLng, zoom) * TILE_SIZE;
  const cy = latToTileY(centerLat, zoom) * TILE_SIZE;
  const worldX = (px - width / 2 + cx) / TILE_SIZE;
  const worldY = (py - height / 2 + cy) / TILE_SIZE;
  return {
    lat: Math.round(tileYToLat(worldY, zoom) * 1e5) / 1e5,
    lng: Math.round(tileXToLng(worldX, zoom) * 1e5) / 1e5,
  };
}

export default function PinLocationMap({ value, onChange, label = 'Pin Location' }: PinMapProps) {
  const initLat = value.lat || DEFAULT_LAT;
  const initLng = value.lng || DEFAULT_LNG;

  const [zoom, setZoom] = useState(13);
  const [center, setCenter] = useState({ lat: initLat, lng: initLng });
  const [pin, setPin] = useState({ lat: initLat, lng: initLng });
  // Start with a non-zero default so tiles render immediately before ResizeObserver fires
  const [dims, setDims] = useState({ w: 600, h: 320 });
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
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

  useEffect(() => {
    const measure = () => {
      if (!mapRef.current) return;
      const r = mapRef.current.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        setDims({ w: r.width, h: r.height });
      }
    };

    // Immediate measurement
    measure();

    // Also try after a short delay in case the modal is still animating in
    const t = setTimeout(measure, 100);

    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const { width, height } = e.contentRect;
        if (width > 0 && height > 0) setDims({ w: width, h: height });
      }
    });
    ro.observe(mapRef.current);

    return () => {
      clearTimeout(t);
      ro.disconnect();
    };
  }, []);

  // Sync external value changes
  useEffect(() => {
    if (value.lat && value.lng) {
      setPin({ lat: value.lat, lng: value.lng });
      setCenter({ lat: value.lat, lng: value.lng });
    }
  }, [value.lat, value.lng]);

  // --- Tile calculation ---
  const tileZoom = Math.round(zoom);
  const centerTileX = lngToTileX(center.lng, tileZoom);
  const centerTileY = latToTileY(center.lat, tileZoom);
  const tileCenterX = Math.floor(centerTileX);
  const tileCenterY = Math.floor(centerTileY);

  // Pixel offset of the center tile's top-left corner relative to map center
  const offsetX = (tileCenterX - centerTileX) * TILE_SIZE + dims.w / 2;
  const offsetY = (tileCenterY - centerTileY) * TILE_SIZE + dims.h / 2;

  const tilesX = Math.ceil(dims.w / TILE_SIZE / 2) + 2;
  const tilesY = Math.ceil(dims.h / TILE_SIZE / 2) + 2;

  const tiles: { tx: number; ty: number; left: number; top: number }[] = [];
  for (let dy = -tilesY; dy <= tilesY; dy++) {
    for (let dx = -tilesX; dx <= tilesX; dx++) {
      const tx = tileCenterX + dx;
      const ty = tileCenterY + dy;
      const maxTile = Math.pow(2, tileZoom);
      if (ty < 0 || ty >= maxTile) continue;
      const wrappedTx = ((tx % maxTile) + maxTile) % maxTile;
      tiles.push({
        tx: wrappedTx,
        ty,
        left: offsetX + dx * TILE_SIZE,
        top: offsetY + dy * TILE_SIZE,
      });
    }
  }

  // Pin pixel position
  const pinPx = latLngToPixel(pin.lat, pin.lng, center.lat, center.lng, tileZoom, dims.w, dims.h);

  // --- Interactions ---
  const handleMapClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const { lat, lng } = pixelToLatLng(px, py, center.lat, center.lng, tileZoom, dims.w, dims.h);
    setPin({ lat, lng });
    onChange({ lat, lng, address: value.address });
  }, [isDragging, center, tileZoom, dims, onChange, value.address]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(false);
    setDragStart({ x: e.clientX, y: e.clientY, lat: center.lat, lng: center.lng });
  }, [center]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragStart) return;
    let dx = e.clientX - dragStart.x;
    let dy = e.clientY - dragStart.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      setIsDragging(true);
      const scale = Math.pow(2, tileZoom) * TILE_SIZE;
      const newLng = dragStart.lng - (dx / scale) * 360;
      const newLat = tileYToLat(latToTileY(dragStart.lat, tileZoom) - dy / TILE_SIZE, tileZoom);
      setCenter({ lat: newLat, lng: Math.max(-180, Math.min(180, newLng)) });
    }
  }, [dragStart, tileZoom]);

  const handleMouseUp = useCallback(() => {
    setDragStart(null);
    setTimeout(() => setIsDragging(false), 10);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    setZoom((z) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z + delta)));
  }, []);

  const zoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, z + 1));
  const zoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, z - 1));

  // --- Search ---
  // Accept the query as a parameter to avoid stale closure issues with debounce
  const doSearch = useCallback(async (query?: string) => {
    const q = (query ?? search).trim();
    if (!q) return;
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
      // ignore
    } finally {
      setSearching(false);
    }
  }, [search]);

  const handleSearchInput = (val: string) => {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length > 2) {
      // Pass the current val directly to avoid stale closure
      debounceRef.current = setTimeout(() => doSearch(val), 500);
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (s: any) => {
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);
    setCenter({ lat, lng });
    setPin({ lat, lng });
    setZoom(14);
    onChange({ lat, lng, address: s.display_name });
    setSearch(s.display_name.split(',').slice(0, 2).join(','));
    setSuggestions([]);
  };

  // Use actual measured dimensions for tile/pin calculations (aliases for render)
  const mapWidth = dims.w;
  const mapHeight = dims.h;
  const tileSize = TILE_SIZE;

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </label>
      )}

      {/* Search bar */}
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
            onClick={() => doSearch()}
            disabled={searching}
            className="px-3 py-2 bg-primary text-primary-foreground text-xs font-bold hover:bg-accent transition-colors flex items-center gap-1"
          >
            {searching
              ? <Icon name="ArrowPathIcon" size={14} className="animate-spin" />
              : <Icon name="MagnifyingGlassIcon" size={14} />}
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

      {/* Map container */}
      <div
        ref={mapRef}
        className="relative w-full border border-border overflow-hidden cursor-crosshair bg-secondary"
        style={{ height: 280 }}
        onClick={handleMapClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* English map tiles using CartoCDN Voyager (English labels globally) */}
        <div className="absolute inset-0 pointer-events-none">
          {tiles.map(({ tx, ty, left, top }) => (
            <img
              key={`${tx}-${ty}-${left}-${top}`}
              src={`https://a.basemaps.cartocdn.com/rastertiles/voyager_labels_under/${tileZoom}/${tx}/${ty}@2x.png`}
              alt=""
              style={{
                position: 'absolute',
                left,
                top,
                width: tileSize,
                height: tileSize,
                imageRendering: 'auto',
              }}
            />
          ))}
        </div>

        {/* Pin */}
        <div
          className="absolute pointer-events-none z-10"
          style={{ left: pinPx.x - 14, top: pinPx.y - 38 }}
        >
          <div className="flex flex-col items-center drop-shadow-lg">
            <div className="w-7 h-7 bg-primary border-2 border-white rounded-full flex items-center justify-center shadow-md">
              <div className="w-2.5 h-2.5 bg-white rounded-full" />
            </div>
            <div className="w-0.5 h-5 bg-primary" />
            <div className="w-2 h-1 bg-primary/40 rounded-full" />
          </div>
        </div>

        {/* Zoom controls */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-0.5 pointer-events-auto">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); zoomIn(); }}
            className="w-8 h-8 bg-card border border-border text-foreground hover:bg-primary/10 flex items-center justify-center text-lg font-bold shadow transition-colors"
            title="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); zoomOut(); }}
            className="w-8 h-8 bg-card border border-border text-foreground hover:bg-primary/10 flex items-center justify-center text-lg font-bold shadow transition-colors"
            title="Zoom out"
          >
            −
          </button>
        </div>

        {/* Hint overlay */}
        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 pointer-events-none z-10">
          Click to place pin · Scroll to zoom · Drag to pan
        </div>

        {/* Attribution */}
        <div className="absolute bottom-2 right-2 bg-white/80 text-[9px] text-gray-600 px-1.5 py-0.5 pointer-events-none z-10">
          © Mapbox · © OpenStreetMap
        </div>
      </div>

      {/* Address display */}
      {value.address && (
        <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
          <Icon name="MapPinIcon" size={11} className="text-primary flex-shrink-0" />
          {value.address}
        </p>
      )}
    </div>
  );
}
