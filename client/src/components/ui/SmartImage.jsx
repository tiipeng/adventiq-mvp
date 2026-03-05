import React, { useMemo, useState } from 'react';

function toDataUri(svg) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function makeFallback(label = 'Research Visual') {
  const safe = label.replace(/[<>]/g, '');
  return toDataUri(`
    <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'>
      <defs>
        <linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stop-color='#1b2b4a'/>
          <stop offset='50%' stop-color='#102038'/>
          <stop offset='100%' stop-color='#0d192d'/>
        </linearGradient>
      </defs>
      <rect width='1200' height='800' fill='url(#bg)'/>
      <circle cx='270' cy='140' r='220' fill='rgba(95,135,255,0.24)'/>
      <circle cx='980' cy='700' r='280' fill='rgba(44,213,255,0.18)'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#d8e6ff' font-size='42' font-family='Arial, sans-serif' letter-spacing='1'>${safe}</text>
    </svg>
  `);
}

export default function SmartImage({ src, alt, fallbackLabel, ...props }) {
  const fallback = useMemo(() => makeFallback(fallbackLabel || alt || 'Research Visual'), [alt, fallbackLabel]);
  const [currentSrc, setCurrentSrc] = useState(src || fallback);

  return (
    <img
      src={currentSrc}
      alt={alt}
      onError={() => {
        if (currentSrc !== fallback) setCurrentSrc(fallback);
      }}
      {...props}
    />
  );
}
