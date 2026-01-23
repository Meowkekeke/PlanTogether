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
    strokeWidth: "6",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const
  };

  switch (mood) {
    // --- POSITIVE ---
    case Mood.HAPPY:
      return (
        <svg {...commonProps}>
          {/* Simple Smile */}
          <circle cx="30" cy="40" r="3" fill="currentColor" stroke="none"/>
          <circle cx="70" cy="40" r="3" fill="currentColor" stroke="none"/>
          <path d="M20 60 Q50 85 80 60" />
        </svg>
      );
    case Mood.EXCITED:
      return (
        <svg {...commonProps}>
          {/* Happy Arched Eyes ^ ^ */}
          <path d="M25 45 Q35 30 45 45" strokeWidth="6" />
          <path d="M55 45 Q65 30 75 45" strokeWidth="6" />
          
          {/* Big Open Laughing Mouth */}
          <path d="M25 65 Q50 95 75 65 Z" fill="none" strokeWidth="5" />
          <path d="M25 65 L75 65" strokeWidth="5" />
          
          {/* Excitement marks */}
          <path d="M15 25 L25 35" strokeWidth="4" opacity="0.5" />
          <path d="M85 25 L75 35" strokeWidth="4" opacity="0.5" />
        </svg>
      );
    case Mood.ROMANTIC:
      return (
        <svg {...commonProps}>
          {/* Heart Eyes */}
          <path d="M20 35 Q25 25 35 35 Q45 25 50 35 L35 55 Z" fill="currentColor" stroke="none" transform="rotate(-10 35 45)" />
          <path d="M60 35 Q65 25 75 35 Q85 25 90 35 L75 55 Z" fill="currentColor" stroke="none" transform="rotate(10 75 45)" />
          <path d="M40 70 Q50 75 60 70" />
        </svg>
      );
    case Mood.CHILL:
      return (
        <svg {...commonProps}>
          {/* Sunglasses Line */}
          <path d="M15 45 L85 45" strokeWidth="8" />
          <path d="M15 45 Q30 60 45 45" fill="none" />
          <path d="M55 45 Q70 60 85 45" fill="none" />
          <path d="M40 75 L60 75" />
        </svg>
      );
    case Mood.GRATEFUL:
      return (
        <svg {...commonProps}>
           {/* Closed happy eyes */}
           <path d="M20 45 Q30 35 40 45" />
           <path d="M60 45 Q70 35 80 45" />
           {/* Smile */}
           <path d="M40 65 Q50 70 60 65" />
           {/* Hands together */}
           <path d="M40 85 L50 75 L60 85" strokeWidth="4"/>
        </svg>
      );

    // --- NEUTRAL / BODY ---
    case Mood.HUNGRY:
      return (
        <svg {...commonProps}>
           <path d="M30 45 L40 45" />
           <path d="M60 45 L70 45" />
           {/* Tongue out */}
           <path d="M30 65 Q50 65 70 65" />
           <path d="M60 65 Q70 85 50 80" /> 
        </svg>
      );
    case Mood.TIRED:
      return (
        <svg {...commonProps}>
           {/* Droopy eyes */}
           <path d="M20 45 L40 50" />
           <path d="M60 50 L80 45" />
           {/* Open mouth / yawn */}
           <circle cx="50" cy="70" r="10" />
           {/* Zzz */}
           <path d="M70 30 L80 30 L70 20 L80 20" strokeWidth="3" />
        </svg>
      );
    case Mood.CONFUSED:
      return (
        <svg {...commonProps}>
           {/* Mismatched eyes */}
           <circle cx="35" cy="45" r="4" fill="currentColor" stroke="none" />
           <circle cx="70" cy="45" r="2" fill="currentColor" stroke="none" />
           {/* Squiggly mouth */}
           <path d="M30 70 Q40 60 50 70 T70 70" />
           {/* Question Mark */}
           <path d="M85 30 Q95 20 85 10" strokeWidth="3" opacity="0.5"/>
        </svg>
      );

    // --- NEGATIVE ---
    case Mood.SAD:
      return (
        <svg {...commonProps}>
           {/* Sad eyes */}
           <path d="M25 45 Q35 50 45 45" />
           <path d="M55 45 Q65 50 75 45" />
           {/* Frown */}
           <path d="M30 75 Q50 55 70 75" />
           {/* Tear */}
           <path d="M75 55 L75 65" strokeWidth="4" stroke="blue" opacity="0.6"/>
        </svg>
      );
    case Mood.ANGRY:
      return (
        <svg {...commonProps}>
           {/* Angry brows */}
           <path d="M20 35 L45 50" strokeWidth="5" />
           <path d="M80 35 L55 50" strokeWidth="5" />
           {/* Eyes */}
           <circle cx="35" cy="60" r="2" fill="currentColor" stroke="none"/>
           <circle cx="65" cy="60" r="2" fill="currentColor" stroke="none"/>
           {/* Mouth */}
           <path d="M35 80 L65 80" strokeWidth="5" />
        </svg>
      );
    case Mood.SICK:
      return (
        <svg {...commonProps}>
           {/* X eyes */}
           <path d="M25 40 L45 50 M45 40 L25 50" />
           <path d="M55 40 L75 50 M75 40 L55 50" />
           {/* Wavy mouth */}
           <path d="M30 75 Q40 65 50 75 T70 75" />
        </svg>
      );
    case Mood.STRESSED:
      return (
        <svg {...commonProps}>
           {/* Wide eyes */}
           <circle cx="30" cy="45" r="5" />
           <circle cx="70" cy="45" r="5" />
           <circle cx="30" cy="45" r="1" fill="currentColor"/>
           <circle cx="70" cy="45" r="1" fill="currentColor"/>
           {/* Scribble mouth */}
           <path d="M30 70 L70 70" strokeDasharray="5,5" />
           {/* Sweat */}
           <path d="M90 40 L85 50" strokeWidth="3" opacity="0.6"/>
        </svg>
      );
      
    default:
      return null;
  }
};