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

const AppImage = memo(function AppImage({
    src,
    alt,
    width,
    height,
    className = '',
    priority = false,
    quality = 75,
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
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        setImageSrc(src || fallbackSrc);
        setHasError(false);
        setLoaded(false);
    }, [src, fallbackSrc]);

    const handleError = useCallback(() => {
        if (!hasError && imageSrc !== fallbackSrc) {
            setImageSrc(fallbackSrc);
            setHasError(true);
        }
    }, [hasError, imageSrc, fallbackSrc]);

    const handleLoad = useCallback(() => {
        setHasError(false);
        setLoaded(true);
    }, []);

    const imageClassName = useMemo(() => {
        const classes = [
            className,
            'transition-opacity duration-500 ease-out',
            loaded ? 'opacity-100' : 'opacity-0',
        ];
        if (onClick) classes.push('cursor-pointer hover:opacity-90');
        return classes.filter(Boolean).join(' ');
    }, [className, onClick, loaded]);

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
            baseProps.fetchPriority = 'high';
        } else {
            baseProps.loading = loading;
        }

        baseProps.placeholder = placeholder;
        baseProps.blurDataURL = blurDataURL || BLUR_DATA_URL;

        return baseProps;
    }, [imageSrc, fallbackSrc, alt, imageClassName, quality, unoptimized, priority, loading, placeholder, blurDataURL, handleError, handleLoad, onClick]);

    if (!imageSrc) {
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
            {...props}
        />
    );
});

AppImage.displayName = 'AppImage';

export default AppImage;
