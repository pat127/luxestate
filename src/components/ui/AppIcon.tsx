'use client';

import React from 'react';
import { OUTLINE_ICONS, QuestionMarkCircleIcon } from './iconRegistry';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  [key: string]: unknown;
}

function Icon({
  name,
  size = 24,
  className = '',
  onClick,
  disabled = false,
  ...props
}: IconProps) {
  const IconComponent = OUTLINE_ICONS[name as keyof typeof OUTLINE_ICONS];

  if (!IconComponent) {
    return (
      <QuestionMarkCircleIcon
        width={size}
        height={size}
        className={`text-gray-400 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        onClick={disabled ? undefined : onClick}
        {...props}
      />
    );
  }

  return (
    <IconComponent
      width={size}
      height={size}
      className={`${disabled ? 'opacity-50 cursor-not-allowed' : onClick ? 'cursor-pointer hover:opacity-80' : ''} ${className}`}
      onClick={disabled ? undefined : onClick}
      {...props}
    />
  );
}

export default Icon;
