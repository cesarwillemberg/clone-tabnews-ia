'use client';

import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

export default function ConfettiEffect() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    function updateDimensions() {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    }

    updateDimensions();
    window.addEventListener('resize', updateDimensions, { passive: true });

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  if (!dimensions.width || !dimensions.height) return null;

  return (
    <Confetti
      aria-hidden="true"
      width={dimensions.width}
      height={dimensions.height}
      numberOfPieces={240}
      recycle={false}
      tweenDuration={1800}
      gravity={0.18}
      colors={['#2563eb', '#60a5fa', '#f59e0b', '#10b981', '#f43f5e']}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 2 }}
    />
  );
}
