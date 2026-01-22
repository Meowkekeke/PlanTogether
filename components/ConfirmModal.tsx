import React from 'react';
import { DoodleButton } from './DoodleButton';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  singleButton?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, title, message, onConfirm, onCancel, 
  confirmText = "Yes, do it!", cancelText = "Cancel", isDanger = false, singleButton = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[2rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden animate-in zoom-in-95 duration-200">
         <div className="p-8 text-center space-y-4">
            <h3 className="text-3xl font-bold leading-none">{title}</h3>
            <div className="text-gray-600 font-bold text-lg leading-snug">{message}</div>
            
            <div className="flex gap-3 pt-4">
                {!singleButton && (
                    <button 
                        onClick={onCancel}
                        className="flex-1 py-3 border-4 border-transparent hover:bg-gray-100 rounded-xl font-bold text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        {cancelText}
                    </button>
                )}
                <DoodleButton 
                    onClick={onConfirm}
                    variant={isDanger ? 'danger' : 'secondary'}
                    className="flex-1 !py-3 !text-lg shadow-none active:translate-y-0 border-2"
                >
                    {confirmText}
                </DoodleButton>
            </div>
         </div>
      </div>
    </div>
  );
};