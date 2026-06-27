import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface MemberSigilProps {
  seed: string;
  memberNumber?: string;
  chapter?: string;
  size?: number;
  className?: string;
}

function hashString(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
}

export function MemberSigil({ seed, memberNumber, chapter, size = 32, className }: MemberSigilProps) {
  const { hue1, hue2, shape1, shape2, p1, p2, p3, p4, p5, rotation } = useMemo(() => {
    const hash1 = hashString(seed);
    const hash2 = hashString((memberNumber || '') + (chapter || ''));
    
    const p1 = ((hash1 >> 0) & 0xFF) / 255;
    const p2 = ((hash1 >> 8) & 0xFF) / 255;
    const p3 = ((hash1 >> 16) & 0xFF) / 255;
    const p4 = ((hash1 >> 24) & 0xFF) / 255;
    const p5 = ((hash2 >> 0) & 0xFF) / 255;
    
    // Core brand: Protocol Blue is ~221, 83%, 53%
    const hue1 = 210 + (p1 * 30); // 210 to 240
    const hue2 = p2 > 0.8 ? (hue1 + 150) % 360 : hue1 - 20 - (p2 * 20); // Mostly blues/purples, rare complementary
    
    return { 
      hue1, 
      hue2, 
      shape1: 3 + Math.floor(p3 * 4), // 3 to 6
      shape2: 3 + Math.floor(p4 * 6), // 3 to 8
      p1, p2, p3, p4, p5,
      rotation: p5 * 360
    };
  }, [seed, memberNumber, chapter]);

  const color1 = `hsl(${hue1}, 80%, 60%)`;
  const color2 = `hsl(${hue2}, 70%, 55%)`;

  const getPoints = (sides: number, radius: number) => {
    const points = [];
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
      points.push(`${50 + radius * Math.cos(angle)},${50 + radius * Math.sin(angle)}`);
    }
    return points.join(' ');
  };

  return (
    <div 
      className={cn("relative flex items-center justify-center shrink-0", className)} 
      style={{ width: size, height: size }}
      title={memberNumber ? `Identity Sigil: ${memberNumber} | ${chapter}` : "Identity Sigil"}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id={`grad-${seed}`} x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor={color1} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color2} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Outer Ring */}
        <circle cx="50" cy="50" r="48" fill={`url(#grad-${seed})`} stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
        
        {/* Orbital dots */}
        <g transform={`rotate(${rotation} 50 50)`}>
          <circle cx="50" cy="8" r="2" fill={color1} />
          <circle cx="50" cy="92" r="1.5" fill={color2} opacity="0.5" />
        </g>

        {/* Outer Polygon */}
        <g transform={`rotate(${rotation / 2} 50 50)`}>
          <polygon 
            points={getPoints(shape1, 36)} 
            fill="none" 
            stroke={color1} 
            strokeWidth="1.5" 
            strokeOpacity="0.6" 
          />
        </g>
        
        {/* Inner Polygon */}
        <g transform={`rotate(${-rotation} 50 50)`}>
          <polygon 
            points={getPoints(shape2, 22)} 
            fill="none" 
            stroke={color2} 
            strokeWidth="1.5" 
            strokeOpacity="0.8" 
          />
        </g>

        {/* Center core */}
        <circle cx="50" cy="50" r={8 + (p1 * 4)} fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" strokeDasharray={`${3 + p2*4}, ${2+p3*2}`} />
        <circle cx="50" cy="50" r={3 + (p2 * 2)} fill={color1} />
      </svg>
    </div>
  );
}
