
import React from 'react';

interface EmptyStateProps {
  type: 'tracker' | 'together' | 'goal' | 'home';
  message: string;
  subMessage?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type, message, subMessage }) => {
  
  const renderDoodle = () => {
    switch (type) {
      case 'home':
        return (
          <svg viewBox="0 0 200 160" className="w-48 h-48 mx-auto animate-in zoom-in duration-500">
             {/* House */}
             <path d="M60 140 L60 80 L100 40 L140 80 L140 140 Z" fill="#fff" stroke="black" strokeWidth="3" />
             {/* Roof */}
             <path d="M50 80 L100 30 L150 80" fill="none" stroke="black" strokeWidth="3" />
             {/* Chimney */}
             <rect x="120" y="50" width="10" height="20" fill="black" />
             <path d="M125 40 Q130 30 135 35" stroke="#ccc" strokeWidth="2" fill="none" />
             
             {/* Door */}
             <rect x="90" y="100" width="20" height="40" fill="#fde047" stroke="black" strokeWidth="2" />
             <circle cx="105" cy="120" r="1.5" fill="black" />
             
             {/* Heart in Window */}
             <circle cx="100" cy="70" r="10" fill="#fca5a5" stroke="black" strokeWidth="2" />
             <path d="M100 75 L100 65 M95 70 L105 70" stroke="white" strokeWidth="2" />

             {/* Ground */}
             <path d="M40 140 L160 140" stroke="black" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );
      case 'tracker':
        return (
          <svg viewBox="0 0 200 160" className="w-48 h-48 mx-auto animate-in zoom-in duration-500">
            {/* Wallet / Ledger */}
            <rect x="50" y="40" width="100" height="80" rx="5" fill="#fff" stroke="black" strokeWidth="3" />
            <path d="M50 60 L150 60" stroke="black" strokeWidth="2" />
            <path d="M110 50 L110 110" stroke="black" strokeWidth="2" opacity="0.1" />
            
            {/* Coins */}
            <circle cx="140" cy="110" r="12" fill="#fde047" stroke="black" strokeWidth="2" />
            <text x="140" y="114" fontSize="12" textAnchor="middle" fill="black" fontWeight="bold">$</text>
            
            <circle cx="125" cy="125" r="12" fill="#86efac" stroke="black" strokeWidth="2" />
            <text x="125" y="129" fontSize="12" textAnchor="middle" fill="black" fontWeight="bold">$</text>

            <circle cx="155" cy="125" r="10" fill="#fca5a5" stroke="black" strokeWidth="2" />

             {/* Pencil */}
             <path d="M40 100 L20 140 L10 142 L12 132 L32 92 Z" fill="#fde047" stroke="black" strokeWidth="3" transform="rotate(45 30 120)" />
          </svg>
        );
      case 'together':
        return (
          <svg viewBox="0 0 200 160" className="w-48 h-48 mx-auto animate-in zoom-in duration-500">
             {/* Two Blobs High Fiving */}
             {/* Blob 1 (Blue) */}
             <path d="M60 120 C40 120 40 80 60 70 C80 60 90 90 80 120 Z" fill="#93c5fd" stroke="black" strokeWidth="3" />
             <circle cx="60" cy="90" r="2" fill="black" />
             <circle cx="70" cy="90" r="2" fill="black" />
             <path d="M62 100 Q65 105 68 100" fill="none" stroke="black" strokeWidth="2" />
             
             {/* Blob 2 (Pink) */}
             <path d="M140 120 C160 120 160 80 140 70 C120 60 110 90 120 120 Z" fill="#fca5a5" stroke="black" strokeWidth="3" />
             <circle cx="130" cy="90" r="2" fill="black" />
             <circle cx="140" cy="90" r="2" fill="black" />
             <path d="M132 100 Q135 105 138 100" fill="none" stroke="black" strokeWidth="2" />

             {/* Connection */}
             <path d="M85 95 Q100 80 115 95" fill="none" stroke="black" strokeWidth="3" strokeDasharray="4 4" />
             <path d="M100 60 L100 50 M95 55 L105 55" stroke="#fde047" strokeWidth="4" />
             <path d="M100 50 L105 45 M100 50 L95 45" stroke="#fde047" strokeWidth="4" />
          </svg>
        );
      case 'goal':
        return (
          <svg viewBox="0 0 200 160" className="w-48 h-48 mx-auto animate-in zoom-in duration-500">
             {/* Trophy */}
             <path d="M70 50 L130 50 L115 110 C115 110 100 120 85 110 L70 50 Z" fill="#fde047" stroke="black" strokeWidth="3" />
             <path d="M70 50 L60 60 C50 70 60 80 75 70" fill="none" stroke="black" strokeWidth="3" />
             <path d="M130 50 L140 60 C150 70 140 80 125 70" fill="none" stroke="black" strokeWidth="3" />
             
             <rect x="80" y="120" width="40" height="10" fill="black" />
             <rect x="70" y="130" width="60" height="10" fill="black" />

             {/* Star */}
             <path d="M100 70 L105 85 L120 85 L108 95 L112 110 L100 100 L88 110 L92 95 L80 85 L95 85 Z" fill="#fff" transform="scale(0.4) translate(180 120)" />

             {/* Shine */}
             <path d="M60 30 L65 40 M140 30 L135 40 M100 20 L100 30" stroke="#fde047" strokeWidth="3" />
          </svg>
        );
    }
  };

  return (
    <div className="w-full py-10 flex flex-col items-center justify-center text-center opacity-90">
      {renderDoodle()}
      <h3 className="font-bold text-2xl text-gray-800 mt-2 font-[Patrick_Hand]">{message}</h3>
      {subMessage && <p className="text-gray-500 font-bold font-[Patrick_Hand] text-lg max-w-[200px] leading-tight mt-1">{subMessage}</p>}
    </div>
  );
};
