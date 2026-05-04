/**
 * InstallButton Component
 *
 * Shows a PWA install button when the app is installable.
 * Automatically hides when already installed or not installable.
 */

import React from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface InstallButtonProps {
  variant?: 'default' | 'compact';
  className?: string;
}

const InstallButton: React.FC<InstallButtonProps> = ({ variant = 'default', className = '' }) => {
  const pwaInstall = usePWAInstall();

  if (pwaInstall.isInstalled || !pwaInstall.isInstallable) return null;

  const handleClick = () => {
    void pwaInstall.install();
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center gap-1.5 text-primary hover:text-primary/80 text-sm font-medium transition-colors ${className}`}
        aria-label="Install AstroVerse app"
      >
        <span className="material-symbols-outlined text-[18px]">download</span>
        Install App
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors ${className}`}
      aria-label="Install AstroVerse app"
    >
      <span className="material-symbols-outlined text-[18px]">download</span>
      Install App
    </button>
  );
};

export default InstallButton;
