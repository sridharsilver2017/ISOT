import React, { useState } from 'react';
import { getSpeakerPhoto } from '../utils/speakerImages';

interface SpeakerAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const SpeakerAvatar: React.FC<SpeakerAvatarProps> = ({
  name,
  size = 'md',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);
  const photoUrl = getSpeakerPhoto(name);

  // Size configurations
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs rounded-lg',
    md: 'w-10 h-10 sm:w-12 sm:h-12 text-sm sm:text-base rounded-2xl',
    lg: 'w-14 h-14 sm:w-16 sm:h-16 text-lg sm:text-xl rounded-2xl',
    xl: 'w-20 h-20 sm:w-24 sm:h-24 text-2xl sm:text-3xl rounded-3xl',
  };

  const initial = name
    .replace(/^dr\.?\s*/i, '')
    .trim()
    .charAt(0)
    .toUpperCase();

  if (photoUrl && !hasError) {
    return (
      <div
        className={`relative overflow-hidden shrink-0 border border-isot-burgundy/20 shadow-sm bg-gray-100 dark:bg-zinc-800 ${sizeClasses[size]} ${className}`}
      >
        <img
          src={photoUrl}
          alt={name}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover object-top transition-transform hover:scale-105 duration-200"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={`shrink-0 bg-gradient-to-br from-isot-burgundy/10 to-isot-gold/20 dark:from-rose-950/60 dark:to-zinc-800 border border-isot-burgundy/20 flex items-center justify-center text-isot-burgundy dark:text-rose-400 font-black shadow-sm ${sizeClasses[size]} ${className}`}
    >
      {initial}
    </div>
  );
};
