'use client';

import React, { useState, useCallback, useMemo, memo, useEffect, useRef } from 'react';
import Image from 'next/image';

interface AppImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
    quality?: number;
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    fill?: boolean;
    sizes?: string;
    onClick?: () => void;
    fallbackSrc?: string;
    loading?: 'lazy' | 'eager';
    unoptimized?: boolean;
    [key: string]: any;
}

const BLUR_DATA_URL =
  'data:image/svg+xml;base64,' +
  btoa(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#1a1a2e"/><rect width="100%" height="100%" fill="url(#g)" opacity=".4"/><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#16213e"/><stop offset="100%" stop-color="#0f3460"/></linearGradient></defs></svg>'
  );

function sanitizeSrc(src: string, fallback: string): string {
    if (!src) return fallback;

    // Decode percent-encoded spaces to detect concatenated URLs
    const decoded = decodeURIComponent(src);

    // If the decoded string contains multiple URLs (space-separated), extract the first one
    const multiUrlMatch = decoded.match(/^(https?:\/\/\S+)/);
    if (multiUrlMatch && decoded.includes(' http')) {
        // Multiple URLs concatenated — use only the first
        const firstUrl = decoded.split(/\s+https?:\/\//)[0];
        if (firstUrl.startsWith('http://') || firstUrl.startsWith('https://')) {
            return firstUrl;
        }
    }

    if (src.startsWith('/') || src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
        return src;
    }
    return fallback;
}

const AppImage = memo(function AppImage({
    src,
    alt,
    width,
    height,
    className = '',
    priority = false,
    quality = 60,
    placeholder = 'blur',
    blurDataURL,
    fill = false,
    sizes,
    onClick,
    fallbackSrc = '/assets/images/no_image.png',
    loading = 'lazy',
    unoptimized = false,
    ...props
}: AppImageProps) {
    // Initialize synchronously so priority images have a src on first render.
    const [imageSrc, setImageSrc] = useState<string | null>(() => {
        const s = sanitizeSrc(src, fallbackSrc);
        return s || null;
    });
    const [hasError, setHasError] = useState(false);
    // Priority images start visible — no fade-in delay for LCP element
    const [loaded, setLoaded] = useState(priority);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const next = sanitizeSrc(src, fallbackSrc);
        setImageSrc(next ? next : null);
        setHasError(false);
        // Keep priority images visible even when src changes
        setLoaded(priority);
    }, [src, fallbackSrc, priority]);

    const handleError = useCallback(() => {
        if (hasError) return;
        if (!fallbackSrc || imageSrc === fallbackSrc) {
            setImageSrc(null);
            setHasError(true);
            return;
        }
        setImageSrc(fallbackSrc);
        setHasError(true);
    }, [hasError, imageSrc, fallbackSrc]);

    const handleLoad = useCallback(() => {
        setHasError(false);
        setLoaded(true);
    }, []);

    const imageClassName = useMemo(() => {
        const classes = [
            className,
            // Priority (LCP) images: always visible. Others: fade in on load.
            priority ? '' : 'transition-opacity duration-500 ease-out',
            priority ? 'opacity-100' : (loaded ? 'opacity-100' : 'opacity-0'),
        ];
        if (onClick) classes.push('cursor-pointer hover:opacity-90');
        return classes.filter(Boolean).join(' ');
    }, [className, onClick, loaded, priority]);

    const imageProps = useMemo(() => {
        const baseProps: any = {
            src: imageSrc || fallbackSrc,
            alt,
            className: imageClassName,
            quality,
            unoptimized,
            onError: handleError,
            onLoad: handleLoad,
            onClick,
        };

        if (priority) {
            baseProps.priority = true;
            // fetchPriority must be passed as a prop to Next.js Image for it to emit
            // fetchpriority="high" on the <img> tag — critical for mobile LCP
            baseProps.fetchPriority = 'high';
        } else {
            baseProps.loading = loading;
            baseProps.fetchPriority = 'auto';
        }

        baseProps.placeholder = placeholder;
        baseProps.blurDataURL = blurDataURL || BLUR_DATA_URL;

        return baseProps;
    }, [imageSrc, fallbackSrc, alt, imageClassName, quality, unoptimized, priority, loading, placeholder, blurDataURL, handleError, handleLoad, onClick]);

    // For priority (LCP) images: never render the placeholder div — always render
    // the <Image> element so the browser can discover and preload it immediately.
    if (!imageSrc && !priority) {
        const placeholderClass = [className, 'animate-pulse bg-muted/30'].filter(Boolean).join(' ');
        if (fill) {
            return <div className={placeholderClass} style={{ position: 'absolute', inset: 0 }} />;
        }
        return (
            <div
                className={placeholderClass}
                style={{ width: width || 400, height: height || 300, display: 'block' }}
            />
        );
    }

    if (fill) {
        return (
            <Image
                {...imageProps}
                ref={imgRef}
                fill
                sizes={sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
                style={{ objectFit: 'cover' }}
                {...props}
            />
        );
    }

    return (
        <Image
            {...imageProps}
            ref={imgRef}
            width={width || 400}
            height={height || 300}
            sizes={sizes}
            style={{ width: 'auto', height: 'auto' }}
            {...props}
        />
    );
});

AppImage.displayName = 'AppImage';

export default AppImage;
