import React from 'react';
import { Mood } from '../types';

interface MoodIconProps {
  mood: Mood;
  className?: string;
}

export const MoodIcon: React.FC<MoodIconProps> = ({ mood, className = "w-16 h-16" }) => {
  const commonProps = {
    viewBox: "0 0 100 100",
    className: className,
    fill: "none",
    stroke: "black",
    strokeWidth: "3",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const
  };

  switch (mood) {
    // --- POSITIVE ---
    case Mood.HAPPY:
      return (
        <svg {...commonProps}>
          {/* Color Blob */}
          <path d="M15 50 Q10 10 50 15 Q90 10 85 50 Q95 90 50 85 Q10 90 15 50 Z" fill="#fde047" stroke="none" transform="translate(4, 4)" />
          {/* Outline */}
          <path d="M15 50 Q10 10 50 15 Q90 10 85 50 Q95 90 50 85 Q10 90 15 50 Z" />
          {/* Face */}
          <path d="M35 40 L35 45" strokeWidth="4" />
          <path d="M65 40 L65 45" strokeWidth="4" />
          <path d="M30 65 Q50 80 70 65" strokeWidth="3" />
        </svg>
      );
    case Mood.EXCITED:
      return (
        <svg {...commonProps}>
           {/* Color Blob */}
          <path d="M50 10 L60 35 L85 35 L65 55 L75 80 L50 65 L25 80 L35 55 L15 35 L40 35 Z" fill="#fb923c" stroke="none" transform="translate(3, 3)" />
          {/* Outline */}
          <path d="M50 10 L60 35 L85 35 L65 55 L75 80 L50 65 L25 80 L35 55 L15 35 L40 35 Z" strokeLinejoin="round" />
          {/* Face */}
          <circle cx="40" cy="45" r="2" fill="black" stroke="none" />
          <circle cx="60" cy="45" r="2" fill="black" stroke="none" />
          <path d="M40 60 Q50 68 60 60" />
        </svg>
      );
    case Mood.ROMANTIC:
      return (
        <svg {...commonProps}>
          {/* Color Blob */}
           <path d="M50 85 C50 85 10 55 10 30 A20 20 0 0 1 50 30 A20 20 0 0 1 90 30 C90 55 50 85 50 85 Z" fill="#f472b6" stroke="none" transform="translate(4, 2)" />
           {/* Outline */}
          <path d="M50 85 C50 85 10 55 10 30 A20 20 0 0 1 50 30 A20 20 0 0 1 90 30 C90 55 50 85 50 85 Z" />
          {/* Eyes */}
          <path d="M30 40 L40 40" strokeWidth="3" />
          <path d="M60 40 L70 40" strokeWidth="3" />
          {/* Smile */}
          <path d="M45 60 Q50 62 55 60" />
        </svg>
      );
    case Mood.CHILL:
      return (
        <svg {...commonProps}>
          {/* Color Blob */}
          <circle cx="50" cy="50" r="40" fill="#c084fc" stroke="none" transform="translate(3,3)" />
          {/* Outline */}
          <path d="M10 50 Q10 10 50 10 Q90 10 90 50 Q90 90 50 90 Q10 90 10 50" />
          {/* Sunglasses */}
          <path d="M20 40 Q20 55 35 55 Q50 55 50 40 L50 40 Q50 55 65 55 Q80 55 80 40 L80 35 L20 35 Z" fill="#1e1b4b" stroke="black" />
          {/* Smile */}
          <path d="M40 70 Q50 75 60 70" />
        </svg>
      );
    case Mood.GRATEFUL:
      return (
        <svg {...commonProps}>
          {/* Color Blob */}
          <circle cx="50" cy="50" r="40" fill="#2dd4bf" stroke="none" transform="translate(3,3)" />
          {/* Hands */}
          <path d="M30 80 Q30 50 45 40 Q55 40 70 80" fill="#ccfbf1" stroke="none" />
          {/* Outline */}
          <circle cx="50" cy="50" r="40" />
          <path d="M30 85 Q35 45 50 45 Q65 45 70 85" strokeWidth="2" />
          {/* Face */}
          <path d="M35 35 Q40 30 45 35" />
          <path d="M55 35 Q60 30 65 35" />
        </svg>
      );

    // --- NEUTRAL / BODY ---
    case Mood.HUNGRY:
      return (
        <svg {...commonProps}>
           {/* Color Blob */}
           <path d="M15 50 Q15 15 50 15 Q85 15 85 50 Q85 85 50 85 Q15 85 15 50 Z" fill="#fca5a5" stroke="none" transform="translate(2,2)" />
           {/* Outline */}
           <path d="M15 50 Q15 15 50 15 Q85 15 85 50 Q85 85 50 85 Q15 85 15 50 Z" />
           {/* Bite */}
           <path d="M85 30 Q70 30 70 45 Q70 60 85 60" fill="#fefce8" stroke="black" />
           {/* Face */}
           <path d="M35 45 L35 50" strokeWidth="3" />
           <path d="M55 45 L55 50" strokeWidth="3" />
           <path d="M45 65 L45 75" strokeWidth="3" stroke="#ef4444" />
        </svg>
      );
    case Mood.TIRED:
      return (
        <svg {...commonProps}>
           {/* Color Blob */}
           <path d="M10 50 Q15 10 50 15 Q85 10 90 50 Q85 90 50 90 Q15 85 10 50 Z" fill="#94a3b8" stroke="none" transform="translate(3,3)" />
           {/* Outline */}
           <path d="M10 50 Q15 10 50 15 Q85 10 90 50 Q85 90 50 90 Q15 85 10 50 Z" />
           {/* Eyes */}
           <path d="M30 45 L45 45" />
           <path d="M55 45 L70 45" />
           {/* Mouth */}
           <circle cx="50" cy="65" r="5" fill="black" stroke="none" opacity="0.5"/>
           {/* Zzz */}
           <path d="M75 30 L85 30 L75 20 L85 20" strokeWidth="2" />
        </svg>
      );
    case Mood.CONFUSED:
      return (
        <svg {...commonProps}>
           {/* Color Blob */}
           <path d="M15 50 Q10 10 50 10 Q90 15 85 50 Q90 90 50 85 Q10 90 15 50 Z" fill="#fde68a" stroke="none" transform="translate(3,3)" />
           {/* Outline */}
           <path d="M15 50 Q10 10 50 10 Q90 15 85 50 Q90 90 50 85 Q10 90 15 50 Z" />
           {/* Eyes */}
           <circle cx="35" cy="45" r="3" fill="black" stroke="none" />
           <circle cx="65" cy="45" r="2" fill="black" stroke="none" />
           {/* Mouth */}
           <path d="M35 65 Q45 60 55 65 Q65 70 75 65" />
           {/* Swirl */}
           <path d="M50 20 Q60 10 70 20 Q80 30 70 40" strokeWidth="2" strokeDasharray="4 2" />
        </svg>
      );

    // --- NEGATIVE ---
    case Mood.SAD:
      return (
        <svg {...commonProps}>
           {/* Color Blob */}
           <path d="M20 50 Q20 20 50 20 Q80 20 80 50 Q80 80 50 80 Q20 80 20 50" fill="#60a5fa" stroke="none" transform="translate(2,4)" />
           {/* Outline */}
           <path d="M20 50 Q20 20 50 20 Q80 20 80 50 Q80 80 50 80 Q20 80 20 50" />
           {/* Eyes */}
           <path d="M35 45 Q30 40 25 45" />
           <path d="M65 45 Q70 40 75 45" />
           {/* Mouth */}
           <path d="M35 65 Q50 55 65 65" />
           {/* Tear */}
           <path d="M70 55 Q75 65 70 70 Q65 65 70 55" fill="#bfdbfe" strokeWidth="1" />
        </svg>
      );
    case Mood.ANGRY:
      return (
        <svg {...commonProps}>
           {/* Color Blob */}
           <rect x="20" y="20" width="60" height="60" rx="10" fill="#f87171" stroke="none" transform="rotate(5 50 50)" />
           {/* Outline */}
           <rect x="20" y="20" width="60" height="60" rx="10" transform="rotate(5 50 50)" />
           {/* Eyes */}
           <path d="M30 40 L45 50" strokeWidth="4" />
           <path d="M70 40 L55 50" strokeWidth="4" />
           {/* Mouth */}
           <rect x="35" y="65" width="30" height="5" fill="black" stroke="none" />
        </svg>
      );
    case Mood.SICK:
      return (
        <svg {...commonProps}>
           {/* Color Blob */}
           <path d="M15 50 Q20 15 50 20 Q85 15 85 50 Q90 85 50 90 Q10 85 15 50 Z" fill="#86efac" stroke="none" transform="translate(3,3)" />
           {/* Outline */}
           <path d="M15 50 Q20 15 50 20 Q85 15 85 50 Q90 85 50 90 Q10 85 15 50 Z" />
           {/* Eyes */}
           <path d="M30 45 L40 50 L30 55" />
           <path d="M70 45 L60 50 L70 55" />
           {/* Mouth */}
           <path d="M40 70 Q50 65 60 70" />
           {/* Thermometer */}
           <path d="M65 70 L80 85" stroke="red" strokeWidth="4" />
        </svg>
      );
    case Mood.STRESSED:
      return (
        <svg {...commonProps}>
           {/* Scribble Color */}
           <path d="M20 20 Q40 10 60 20 Q80 10 80 40 Q90 60 70 80 Q50 90 30 80 Q10 60 20 40" fill="#fb7185" stroke="none" transform="translate(2,2)" />
           {/* Scribble Outline */}
           <path d="M20 30 Q10 10 40 20 Q60 5 80 20 Q95 40 80 60 Q90 80 60 85 Q40 95 20 80 Q5 60 20 30" />
           {/* Eyes */}
           <circle cx="35" cy="45" r="5" fill="white" stroke="black" />
           <circle cx="65" cy="45" r="5" fill="white" stroke="black" />
           <circle cx="35" cy="45" r="1" fill="black" stroke="none" />
           <circle cx="65" cy="45" r="1" fill="black" stroke="none" />
           {/* Mouth */}
           <path d="M40 70 L60 70" strokeDasharray="2 2" />
        </svg>
      );
      
    default:
      return null;
  }
};