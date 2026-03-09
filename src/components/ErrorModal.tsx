
import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ErrorModalProps {
  message: string;
  code?: number | string;
  onClose: () => void;
}

export default function ErrorModal({ message, code, onClose }: ErrorModalProps) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-sm bg-white border border-[#E8EAE0] rounded-[2rem] p-8 shadow-2xl overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#A0A4A8] hover:text-[#2D3436] hover:bg-[#F8F9F4] rounded-xl transition-all"
          >
            <X size={20} />
          </button>

          <div className="text-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            
            <h3 className="text-xl font-bold text-[#2D3436] mb-2">發生錯誤</h3>
            
            {code && (
              <div className="inline-block px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold uppercase tracking-widest mb-4">
                Error Code: {code}
              </div>
            )}
            
            <p className="text-[#636E72] text-sm leading-relaxed mb-8">
              {message}
            </p>

            <button
              onClick={onClose}
              className="w-full bg-[#2D3436] text-white font-bold py-4 rounded-2xl hover:bg-[#1A1F21] transition-all shadow-lg shadow-[#2D3436]/20"
            >
              確定
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
