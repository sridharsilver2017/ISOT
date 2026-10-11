import React, { useState } from 'react';
import { getSpeakerPhoto } from '../utils/speakerImages';
import { useProgrammeStore } from '../store/programmeStore';

interface SpeakerAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  customPhotoUrl?: string;
}

export const SpeakerAvatar: React.FC<SpeakerAvatarProps> = ({
  name,
  size = 'md',
  className = '',
  customPhotoUrl,
}) => {
  const [hasError, setHasError] = useState(false);
  const speakerPhotos = useProgrammeStore((state) => state.speakerPhotos || {});
  const photoUrl = customPhotoUrl || getSpeakerPhoto(name, speakerPhotos);

  // Size configurations
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs rounded-lg',
    md: 'w-10 h-10 sm:w-12 sm:h-12 text-sm sm:text-base rounded-2xl',
    lg: 'w-14 h-14 sm:w-16 sm:h-16 text-lg sm:text-xl rounded-2xl',
    xl: 'w-20 h-20 sm:w-24 sm:h-24 text-2xl sm:text-3xl rounded-3xl',
    '2xl': 'w-28 h-28 sm:w-36 sm:h-36 text-3xl sm:text-4xl rounded-3xl',
  };

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
      className={`relative overflow-hidden shrink-0 border border-isot-burgundy/20 shadow-sm bg-gray-100 dark:bg-zinc-800 ${sizeClasses[size]} ${className}`}
    >
      <img
        src="/default-avatar.svg"
        alt={name}
        className="w-full h-full object-cover object-top transition-transform hover:scale-105 duration-200"
        loading="lazy"
      />
    </div>
  );
};
