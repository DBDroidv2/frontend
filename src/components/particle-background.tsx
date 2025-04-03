"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import type { Container, Engine, ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim"; // Use slim engine
import { useTheme } from "next-themes";

export function ParticleBackground() {
  const { resolvedTheme } = useTheme();
  const [init, setInit] = useState(false);

  // Initialize tsparticles engine only once
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = useCallback(
    async (container: Container | undefined) => {
      // console.log("Particles loaded:", container);
    },
    []
  );

  // Memoize options based on theme
  const options: ISourceOptions = useMemo(
    () => {
        const particleColor = resolvedTheme === 'dark' ? "#ffffff" : "#333333";
        const linkColor = resolvedTheme === 'dark' ? "#ffffff" : "#555555";

        // Original basic configuration
        return {
            fpsLimit: 60,
            interactivity: {
              events: {
                onHover: { enable: true, mode: "repulse" },
                onClick: { enable: true, mode: "push" },
              },
              modes: {
                repulse: { distance: 80, duration: 0.4 },
                push: { quantity: 2 },
              },
            },
            particles: {
              color: { value: particleColor },
              links: {
                color: linkColor,
                distance: 120,
                enable: true,
                opacity: 0.3,
                width: 1,
              },
              move: {
                direction: "none",
                enable: true,
                outModes: { default: "bounce" },
                random: true,
                speed: 1,
                straight: false,
              },
              number: {
                density: { enable: true },
                value: 50,
              },
              opacity: { value: 0.4 },
              shape: { type: "circle" },
              size: { value: { min: 1, max: 3 } },
            },
            detectRetina: true,
        };
    },
    [resolvedTheme] // Recompute options only when theme changes
  );

  if (!init) {
    return null; // Don't render until engine is initialized
  }

  return (
    <Particles
      key={init ? 'particles-initialized' : 'particles-initializing'} // Keep key for potential timing issues
      id="tsparticles" // Use original ID
      particlesLoaded={particlesLoaded}
      options={options}
      className="absolute inset-0 -z-10 h-full w-full" // Keep explicit size
    />
  );
}
