
import React from 'react';
import { announceToScreenReader } from '@/utils/accessibility';

interface SkipLinkProps {
  targetId: string;
  label?: string;
}

export const SkipLink = ({ targetId, label = 'Skip to main content' }: SkipLinkProps) => {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-vote-blue text-white px-4 py-2 rounded z-50"
      onFocus={() => announceToScreenReader(`${label} link focused`)}
    >
      {label}
    </a>
  );
};
