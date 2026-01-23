import React from 'react';
import { Mood } from '../types';

interface MoodIconProps {
  mood: Mood;
  className?: string;
}

export const MoodIcon: React.FC<MoodIconProps> = ({ mood, className = "w-12 h-12" }) => {
  const commonProps = {
    viewBox: "0 0 100 100",
    className: className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "5",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const
  };

  switch (mood) {
    // --- POSITIVE ---
    case Mood.HAPPY: // Sun
      return (
        <svg {...commonProps}>
          <circle cx="50" cy="50" r="20" fill="#fde047" stroke="black" />
          <path d="M50 15 L50 25 M50 75 L50 85" stroke="black" />
          <path d="M15 50 L25 50 M75 50 L85 50" stroke="black" />
          <path d="M25 25 L32 32 M68 68 L75 75" stroke="black" />
          <path d="M25 75 L32 68 M68 32 L75 25" stroke="black" />
        </svg>
      );
    case Mood.EXCITED: // Rocket
      return (
        <svg {...commonProps}>
          <path d="M40 85 Q50 100 60 85 L50 75 Z" fill="#fca5a5" stroke="black" />
          <path d="M50 15 Q70 40 70 75 L30 75 Q30 40 50 15" fill="white" stroke="black" />
          <circle cx="50" cy="50" r="8" fill="#93c5fd" stroke="black" />
          <path d="M30 75 L20 90 L35 85" fill="#fde047" stroke="black" />
          <path d="M70 75 L80 90 L65 85" fill="#fde047" stroke="black" />
        </svg>
      );
    case Mood.ROMANTIC: // Love Letter
      return (
        <svg {...commonProps}>
          <rect x="20" y="35" width="60" height="40" rx="2" fill="white" stroke="black" />
          <path d="M20 35 L50 60 L80 35" stroke="black" />
          <path d="M50 45 C40 35 30 50 50 65 C70 50 60 35 50 45 Z" fill="#fca5a5" stroke="black" />
        </svg>
      );
    case Mood.CHILL: // Ice Cream
      return (
        <svg {...commonProps}>
           <path d="M35 30 L35 70 Q35 85 65 85 Q65 70 65 70 L65 30 Q65 15 50 15 Q35 15 35 30 Z" fill="#c4b5fd" stroke="black" />
           <path d="M50 85 L50 100" strokeWidth="8" stroke="#fcd34d" strokeLinecap="butt"/> 
           <path d="M55 25 L55 45" stroke="white" opacity="0.6" />
        </svg>
      );
    case Mood.GRATEFUL: // Flower
      return (
        <svg {...commonProps}>
           <path d="M50 90 L50 50" stroke="#86efac" strokeWidth="6" />
           <path d="M50 70 Q65 60 70 75" fill="none" stroke="#86efac" />
           <path d="M50 70 Q35 60 30 75" fill="none" stroke="#86efac" />
           <circle cx="50" cy="50" r="10" fill="#fde047" stroke="black" />
           <circle cx="50" cy="30" r="8" fill="white" stroke="black" />
           <circle cx="50" cy="70" r="8" fill="white" stroke="black" />
           <circle cx="30" cy="50" r="8" fill="white" stroke="black" />
           <circle cx="70" cy="50" r="8" fill="white" stroke="black" />
        </svg>
      );
    case Mood.PROUD: // Crown
      return (
        <svg {...commonProps}>
           <path d="M20 70 L20 40 L40 60 L50 30 L60 60 L80 40 L80 70 Z" fill="#facc15" stroke="black" />
           <circle cx="20" cy="35" r="3" fill="#fca5a5" stroke="none" />
           <circle cx="50" cy="25" r="3" fill="#fca5a5" stroke="none" />
           <circle cx="80" cy="35" r="3" fill="#fca5a5" stroke="none" />
        </svg>
      );
    case Mood.ENERGETIC: // Lightning
      return (
        <svg {...commonProps}>
           <path d="M55 10 L30 50 L50 50 L40 90 L75 40 L55 40 L65 10 Z" fill="#fde047" stroke="black" />
        </svg>
      );
    case Mood.SILLY: // Party Popper
      return (
        <svg {...commonProps}>
           <path d="M30 80 L60 80 L45 30 Z" fill="#f0abfc" stroke="black" />
           <path d="M45 30 Q30 10 20 20" fill="none" stroke="#facc15" />
           <path d="M45 30 Q60 10 70 20" fill="none" stroke="#86efac" />
           <circle cx="20" cy="20" r="2" fill="black" stroke="none" />
           <circle cx="70" cy="20" r="2" fill="black" stroke="none" />
        </svg>
      );
    case Mood.HOPEFUL: // Kite
      return (
        <svg {...commonProps}>
           <path d="M50 20 L75 45 L50 80 L25 45 Z" fill="#7dd3fc" stroke="black" />
           <path d="M25 45 L75 45" stroke="black" strokeWidth="2" />
           <path d="M50 20 L50 80" stroke="black" strokeWidth="2" />
           <path d="M50 80 Q60 90 50 100" fill="none" stroke="black" />
        </svg>
      );


    // --- NEUTRAL ---
    case Mood.HUNGRY: // Pizza
      return (
        <svg {...commonProps}>
           <path d="M50 15 L85 85 Q50 95 15 85 Z" fill="#fde047" stroke="black" />
           <path d="M15 85 Q50 95 85 85 Q85 75 80 75 L20 75 Q15 75 15 85" fill="#e5e7eb" stroke="black" />
           <circle cx="50" cy="40" r="4" fill="#fca5a5" stroke="black" />
           <circle cx="40" cy="60" r="4" fill="#fca5a5" stroke="black" />
        </svg>
      );
    case Mood.TIRED: // Low Battery
      return (
        <svg {...commonProps}>
           <rect x="25" y="35" width="50" height="30" rx="2" fill="white" stroke="black" />
           <path d="M75 45 L80 45 L80 55 L75 55" fill="black" stroke="black" />
           <rect x="28" y="38" width="10" height="24" fill="#fca5a5" stroke="none" />
        </svg>
      );
    case Mood.CONFUSED: // Question Mark
      return (
        <svg {...commonProps}>
           <path d="M35 35 Q35 15 50 15 Q65 15 65 35 Q65 55 50 55 L50 65" fill="white" stroke="black" />
           <circle cx="50" cy="75" r="3" fill="black" stroke="black" />
           <rect x="42" y="80" width="16" height="8" fill="#e5e7eb" stroke="black" />
           <path d="M20 30 Q10 40 20 50" fill="none" stroke="black" opacity="0.5" />
           <path d="M80 30 Q90 40 80 50" fill="none" stroke="black" opacity="0.5" />
        </svg>
      );
    case Mood.BORED: // Snail
      return (
        <svg {...commonProps}>
            <path d="M25 80 Q30 50 50 50 Q70 50 70 70 Q70 90 50 80" fill="#e5e7eb" stroke="black" />
            <path d="M50 50 Q45 45 50 40" fill="none" stroke="black" />
            <path d="M20 80 Q10 80 15 70" fill="none" stroke="black" />
            <path d="M85 85 L20 85" stroke="black" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case Mood.BUSY: // Checklist
      return (
        <svg {...commonProps}>
            <rect x="25" y="20" width="50" height="60" fill="white" stroke="black" />
            <path d="M35 30 L65 30" stroke="black" strokeWidth="3" />
            <path d="M35 45 L65 45" stroke="black" strokeWidth="3" />
            <path d="M35 60 L65 60" stroke="black" strokeWidth="3" />
            <path d="M30 30 L32 32" stroke="black" strokeWidth="2" />
        </svg>
      );
    case Mood.CURIOUS: // Magnifying Glass
      return (
        <svg {...commonProps}>
            <circle cx="45" cy="45" r="20" fill="#ccfbf1" stroke="black" />
            <path d="M60 60 L80 80" stroke="black" strokeWidth="8" />
            <path d="M40 35 L50 35" stroke="white" opacity="0.5" />
        </svg>
      );
    case Mood.MEH: // Rock / Blob
      return (
        <svg {...commonProps}>
            <path d="M20 70 Q30 40 50 40 Q70 40 80 70 L20 70 Z" fill="#d6d3d1" stroke="black" />
            <path d="M40 60 L60 60" stroke="black" strokeWidth="3" />
        </svg>
      );
    case Mood.DISTRACTED: // Balloon
      return (
        <svg {...commonProps}>
            <path d="M50 20 Q75 20 75 45 Q75 65 50 75 Q25 65 25 45 Q25 20 50 20" fill="#ddd6fe" stroke="black" />
            <path d="M50 75 L50 95" stroke="black" />
            <circle cx="60" cy="35" r="5" fill="white" opacity="0.4" />
        </svg>
      );
    case Mood.WAITING: // Clock
      return (
        <svg {...commonProps}>
            <circle cx="50" cy="50" r="30" fill="white" stroke="black" />
            <path d="M50 50 L50 30" stroke="black" />
            <path d="M50 50 L65 50" stroke="black" />
            <circle cx="50" cy="50" r="2" fill="black" />
        </svg>
      );


    // --- NEGATIVE ---
    case Mood.SAD: // Blue Umbrella
      return (
        <svg {...commonProps}>
           <path d="M20 50 Q50 10 80 50" fill="#93c5fd" stroke="black" />
           <path d="M20 50 Q35 45 50 50 Q65 45 80 50" fill="none" stroke="black" />
           <path d="M50 50 L50 80 Q50 90 60 90" fill="none" stroke="black" />
           <path d="M30 70 L30 80" stroke="#3b82f6" strokeWidth="3" />
           <path d="M70 70 L70 80" stroke="#3b82f6" strokeWidth="3" />
        </svg>
      );
    case Mood.ANGRY: // Volcano
      return (
        <svg {...commonProps}>
           <path d="M25 85 L45 40 L55 40 L75 85 Z" fill="#9ca3af" stroke="black" />
           <path d="M45 40 L45 25 M55 40 L55 20 M50 40 L50 15" stroke="#ef4444" strokeWidth="4" />
        </svg>
      );
    case Mood.SICK: // Thermometer
      return (
        <svg {...commonProps}>
           <rect x="45" y="20" width="10" height="50" rx="5" fill="white" stroke="black" />
           <circle cx="50" cy="75" r="10" fill="#ef4444" stroke="black" />
           <path d="M50 70 L50 50" stroke="#ef4444" strokeWidth="4" />
        </svg>
      );
    case Mood.STRESSED: // Bomb
      return (
        <svg {...commonProps}>
           <circle cx="50" cy="55" r="25" fill="#374151" stroke="black" />
           <path d="M50 30 L50 20 Q60 10 70 15" fill="none" stroke="black" />
           <path d="M70 15 L75 10 M70 15 L78 18 M70 15 L65 8" stroke="#fde047" strokeWidth="2" />
        </svg>
      );
    case Mood.ANXIOUS: // Knot
      return (
        <svg {...commonProps}>
            <path d="M30 50 Q50 20 70 50 Q80 70 50 70 Q20 70 30 50" fill="none" stroke="black" strokeWidth="4" />
            <path d="M40 60 Q50 80 60 60" fill="none" stroke="black" strokeWidth="4" />
        </svg>
      );
    case Mood.LONELY: // Cactus
      return (
        <svg {...commonProps}>
            <path d="M45 80 L45 30 Q45 20 55 20 Q65 20 65 30 L65 80" fill="#86efac" stroke="black" />
            <path d="M45 50 L35 50 Q25 50 25 40 Q25 30 35 30" fill="none" stroke="black" strokeWidth="4" />
            <path d="M65 60 L75 60 Q85 60 85 50 Q85 40 75 40" fill="none" stroke="black" strokeWidth="4" />
        </svg>
      );
    case Mood.HURT: // Bandage
      return (
        <svg {...commonProps}>
             <rect x="30" y="35" width="40" height="30" rx="5" fill="#fca5a5" stroke="black" transform="rotate(-10 50 50)" />
             <path d="M45 45 L55 55 M55 45 L45 55" stroke="white" strokeWidth="3" transform="rotate(-10 50 50)" />
             <path d="M20 40 L30 40" stroke="black" strokeWidth="2" strokeDasharray="2 2" />
             <path d="M70 60 L80 60" stroke="black" strokeWidth="2" strokeDasharray="2 2" />
        </svg>
      );
    case Mood.OVERWHELMED: // Weight
      return (
        <svg {...commonProps}>
            <path d="M25 60 L75 60 L85 85 L15 85 Z" fill="#334155" stroke="black" />
            <rect x="45" y="40" width="10" height="20" fill="black" />
            <path d="M30 40 Q50 30 70 40" fill="none" stroke="black" strokeWidth="3" />
            <text x="50" y="78" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">100t</text>
        </svg>
      );
    case Mood.GRUMPY: // Storm Cloud
      return (
        <svg {...commonProps}>
             <path d="M25 50 Q15 50 15 40 Q15 25 35 25 Q45 15 60 20 Q75 10 85 30 Q95 35 85 50 L25 50 Z" fill="#64748b" stroke="black" />
             <path d="M40 50 L35 70 L45 70 L40 85" fill="#fde047" stroke="black" strokeWidth="1" />
             <path d="M65 50 L60 65 L70 65 L65 80" fill="#fde047" stroke="black" strokeWidth="1" />
        </svg>
      );

    default:
      return null;
  }
};
