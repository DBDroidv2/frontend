"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { ParticleBackground } from './particle-background'; // Import the original background

export function GlobalParticleWrapper() {
  const pathname = usePathname();

  // Only render the global background if not on the landing page
  if (pathname === '/') {
    return null;
  }

  return <ParticleBackground />;
}
