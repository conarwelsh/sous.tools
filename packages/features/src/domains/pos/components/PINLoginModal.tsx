import React, { useState } from "react";
import { View, Text, Button } from "@sous/ui";
import { X, Loader2 } from "lucide-react";
import { useAuth } from "../../iam/auth/hooks/useAuth";

interface PINLoginModalProps {
  onSuccess: (user: any) => void;
  onClose: () => void;
}

export const PINLoginModal = ({ onSuccess, onClose }: PINLoginModalProps) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loginByPin } = useAuth();

  const handleKeyPress = async (num: string) => {
    if (pin.length < 4 && !loading) {
      const newPin = pin + num;
      setPin(newPin);
      
      if (newPin.length === 4) {
        setLoading(true);
        try {
          await loginByPin(newPin);
          // fetchMe is called inside loginByPin and updates the global auth state.
          // We can just call onSuccess now.
          onSuccess({}); // The user will be taken from useAuth anyway
        } catch (e) {
          setError(true);
          setTimeout(() => {
            setPin("");
            setError(false);
            setLoading(false);
          }, 1000);
        }
      }
    }
  };

  const handleClear = () => setPin("");

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-md p-12 flex flex-col items-center">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-colors"
        >
          <X size={32} />
        </button>

        <h2 className="text-xl font-black uppercase tracking-[0.3em] text-zinc-500 mb-12">
          Employee Login
        </h2>

        {/* PIN Indicators */}
        <div className="flex gap-6 mb-16">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i}
              className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
                error 
                  ? "bg-red-500 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]" 
                  : pin.length > i 
                    ? "bg-primary border-primary shadow-[0_0_20px_rgba(var(--primary),0.5)] scale-110" 
                    : "bg-transparent border-zinc-800"
              }`}
            />
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-6 w-full max-w-xs">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "DEL"].map((key) => (
            <button
              key={key}
              onClick={() => {
                if (key === "C") handleClear();
                else if (key === "DEL") setPin(p => p.slice(0, -1));
                else handleKeyPress(key);
              }}
              className="h-20 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-2xl font-black text-white hover:bg-zinc-800 hover:border-zinc-700 active:scale-95 transition-all shadow-lg active:bg-primary active:text-black"
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
