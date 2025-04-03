"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import type { Container, Engine, ISourceOptions } from "@tsparticles/engine";
import { loadFull } from "tsparticles"; // Keep full engine
import { useTheme } from "next-themes";

export function LandingParticles() {
  const { resolvedTheme } = useTheme();
  const [init, setInit] = useState(false);

  // Initialize tsparticles engine only once
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
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
        // Define RGB colors
        const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"];

        return {
            fpsLimit: 60,
            particles: {
                number: {
                    value: 80, // Keep density reasonable
                    density: {
                        enable: true,
                    },
                },
                color: {
                    value: colors, // Use array of colors
                },
                shape: {
                    type: "circle",
                },
                opacity: {
                    value: { min: 0.3, max: 0.8 }, // Increase max opacity for more shine
                    animation: {
                        enable: true,
                        speed: 2, // Slightly faster twinkle
                        sync: false,
                        minimumValue: 0.2, // Brighter minimum
                        startValue: "random",
                        destroy: "none",
                    },
                },
                size: {
                    value: { min: 2, max: 5 }, // Increase particle size range
                    animation: {
                        enable: true,
                        speed: 3, // Faster size pulse
                        sync: false,
                        minimumValue: 1, // Larger minimum size during pulse
                        startValue: "random",
                        destroy: "none",
                    },
                },
                 life: {
                     duration: {
                         sync: false,
                         value: 4, // Slightly shorter lifespan
                     },
                     count: 0,
                 },
                links: {
                    enable: false, // Keep links disabled
                },
                move: {
                    enable: true,
                    speed: 1, // Slightly faster movement
                    direction: "none",
                    random: true,
                    straight: false,
                    outModes: {
                        default: "out",
                    },
                    attract: { // Keep subtle attraction
                        enable: true,
                        rotate: { x: 600, y: 1200 },
                        distance: 120,
                    },
                },
            },
            interactivity: {
                events: {
                    onHover: {
                        enable: true,
                        mode: "bubble",
                    },
                     onClick: {
                         enable: true,
                         mode: "repulse",
                     },
                },
                modes: {
                    bubble: {
                        distance: 150,
                        size: 7, // Larger bubble size
                        duration: 2,
                        opacity: 1, // Full opacity on bubble
                    },
                    repulse: {
                        distance: 100,
                    },
                },
            },
            detectRetina: true,
        };
    },
    [resolvedTheme] // Still depend on theme in case you want to adjust colors later
  );

  if (!init) {
    return null;
  }

  return (
    <Particles
      key={init ? 'particles-initialized' : 'particles-initializing'}
      id="landingParticles"
      particlesLoaded={particlesLoaded}
      options={options}
      className="absolute inset-0 -z-10 h-full w-full"
    />
  );
}
