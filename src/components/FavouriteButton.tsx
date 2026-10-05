import React from 'react';
import { Star } from 'lucide-react';

interface FavouriteButtonProps {
  isSaved: boolean;
  onToggle: (e: React.MouseEvent) => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const FavouriteButton: React.FC<FavouriteButtonProps> = ({
  isSaved,
  onToggle,
  size = 'md',
  showLabel = false,
  className = '',
}) => {
  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isSaved ? 'Remove from My Schedule' : 'Add to My Schedule'}
      className={`inline-flex items-center gap-1.5 rounded-full transition-all duration-200 active:scale-95 ${
        isSaved
          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 font-medium'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700'
      } ${size === 'sm' ? 'px-2.5 py-1 text-xs' : size === 'lg' ? 'px-4 py-2.5 text-base' : 'px-3 py-1.5 text-sm'} ${className}`}
    >
      <Star
        size={iconSizes[size]}
        className={`transition-colors ${
          isSaved
            ? 'fill-amber-500 text-amber-600 dark:fill-amber-400 dark:text-amber-400'
            : 'text-gray-400 dark:text-gray-400 hover:text-amber-500'
        }`}
      />
      {showLabel && (
        <span>{isSaved ? 'Saved in My Day' : 'Add to My Day'}</span>
      )}
    </button>
  );
};
