'use client';

import dynamic from 'next/dynamic';

// Carrega o confete de forma lazy no cliente, fora do bundle inicial.
const ConfettiEffect = dynamic(() => import('./confetti-effect'), { ssr: false });

export default function ConfettiLoader() {
  return <ConfettiEffect />;
}
