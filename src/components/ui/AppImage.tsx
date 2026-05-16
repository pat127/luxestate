'use client';

import React, { useState, useCallback, useMemo, memo, useEffect } from 'react';
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

// Tiny 1x1 transparent placeholder for blur effect
const BLUR_DATA_URL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const AppImage = memo(function AppImage({
    src,
    alt,
    width,
    height,
    className = '',
    priority = false,
    quality = 80,
    placeholder = 'empty',
    blurDataURL,
    fill = false,
    sizes,
    onClick,
    fallbackSrc = '/assets/images/no_image.png',
    loading = 'lazy',
    unoptimized = false,
    ...props
}: AppImageProps) {
    // Use null as initial state to avoid SSR/client mismatch when src comes from localStorage/CMS
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);

    // Set the image src only on the client to prevent hydration mismatch
    useEffect(() => {
        setImageSrc(src || fallbackSrc);
        setHasError(false);
    }, [src, fallbackSrc]);

    // Auto-detect external URLs — skip Next.js optimization for external CDNs
    const isExternal = typeof src === 'string' && (src.startsWith('http://') || src.startsWith('https://'));
    const shouldUnoptimize = unoptimized || isExternal;

    const handleError = useCallback(() => {
        if (!hasError && imageSrc !== fallbackSrc) {
            setImageSrc(fallbackSrc);
            setHasError(true);
        }
    }, [hasError, imageSrc, fallbackSrc]);

    const handleLoad = useCallback(() => {
        setHasError(false);
    }, []);

    const imageClassName = useMemo(() => {
        const classes = [className];
        if (onClick) classes.push('cursor-pointer hover:opacity-90 transition-opacity duration-200');
        return classes.filter(Boolean).join(' ');
    }, [className, onClick]);

    const imageProps = useMemo(() => {
        const baseProps: any = {
            src: imageSrc || fallbackSrc,
            alt,
            className: imageClassName,
            quality,
            unoptimized: shouldUnoptimize,
            onError: handleError,
            onLoad: handleLoad,
            onClick,
        };

        if (priority) {
            baseProps.priority = true;
            baseProps.fetchPriority = 'high';
        } else {
            baseProps.loading = loading;
        }

        // Always provide blur placeholder for smoother loading
        if (placeholder === 'blur') {
            baseProps.placeholder = 'blur';
            baseProps.blurDataURL = blurDataURL || BLUR_DATA_URL;
        } else {
            baseProps.placeholder = 'empty';
        }

        return baseProps;
    }, [imageSrc, fallbackSrc, alt, imageClassName, quality, shouldUnoptimize, priority, loading, placeholder, blurDataURL, handleError, handleLoad, onClick]);

    // Render nothing until client-side hydration is complete to avoid mismatch
    if (!imageSrc) {
        const placeholderClass = [className, 'bg-gray-900/20'].filter(Boolean).join(' ');
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
            width={width || 400}
            height={height || 300}
            sizes={sizes}
            {...props}
        />
    );
});

AppImage.displayName = 'AppImage';

export default AppImage;