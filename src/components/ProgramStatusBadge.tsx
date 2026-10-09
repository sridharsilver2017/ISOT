import React from 'react';
import { ProgrammeStatus } from '../types/programme';
import { getStatusBadgeInfo } from '../utils/timeUtils';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface ProgramStatusBadgeProps {
  status: ProgrammeStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
}

export const ProgramStatusBadge: React.FC<ProgramStatusBadgeProps> = ({
  status,
  size = 'sm',
  className = '',
  showIcon = true,
}) => {
  const info = getStatusBadgeInfo(status);

  const sizeClasses = {
    sm: 'text-[10px] sm:text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-xs sm:text-sm px-3.5 py-1.5 gap-2',
  }[size];

  const iconSize = size === 'sm' ? 11 : size === 'md' ? 13 : 15;

  return (
    <span
      className={`inline-flex items-center font-black rounded-full border shadow-2xs whitespace-nowrap tracking-tight ${info.bg} ${info.text} ${info.border} ${sizeClasses} ${className}`}
    >
      {info.isLive ? (
        <span className="relative flex h-2 w-2 mr-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      ) : (
        showIcon && (
          <>
            {status === 'completed' && <CheckCircle2 size={iconSize} className="stroke-[2.5] text-gray-500 dark:text-gray-400" />}
            {status === 'upcoming' && <Clock size={iconSize} className="stroke-[2.2]" />}
            {status === 'cancelled' && <AlertCircle size={iconSize} />}
          </>
        )
      )}

      <span>{info.label}</span>
    </span>
  );
};
