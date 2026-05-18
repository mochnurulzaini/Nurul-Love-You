import React, { useState } from 'react';
import { Shield, Delete, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface PinLockProps {
  correctPin: string;
  onUnlock: () => void;
}

const PinLock: React.FC<PinLockProps> = ({ correctPin, onUnlock }) => {
  const [input, setInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleDigit = (d: string) => {
    if (input.length >= 6) return;
    const newInput = input + d;
    setInput(newInput);

    if (newInput.length === correctPin.length) {
      setTimeout(() => {
        if (newInput === correctPin) {
          onUnlock();
          toast.success('Selamat datang kembali! 👋');
        } else {
          setShake(true);
          setAttempts((a) => a + 1);
          setTimeout(() => { setInput(''); setShake(false); }, 600);
          toast.error(`PIN salah (${attempts + 1}x)`);
        }
      }, 100);
    }
  };

  const handleDelete = () => {
    setInput(input.slice(0, -1));
  };

  const dots = Array.from({ length: correctPin.length });

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)' }}
    >
      {/* Background decoration */}
      <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #10b981, transparent)' }} />
      <div className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-xl animate-pulse-glow"
            style={{ background: 'var(--accent)' }}
          >
            💚
          </div>
          <h1 className="text-2xl font-bold text-white">MoneyFlow</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Masukkan PIN untuk melanjutkan
          </p>
        </div>

        {/* PIN dots */}
        <div
          className={`flex items-center justify-center gap-4 mb-8 ${shake ? 'animate-bounce' : ''}`}
        >
          {dots.map((_, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-full transition-all duration-200"
              style={{
                background: i < input.length
                  ? 'var(--accent)'
                  : 'rgba(255,255,255,0.2)',
                transform: i < input.length ? 'scale(1.2)' : 'scale(1)',
                boxShadow: i < input.length ? '0 0 8px rgba(16,185,129,0.6)' : 'none',
              }}
            />
          ))}
        </div>

        {/* Show pin text display */}
        {showPin && (
          <div className="text-center mb-4">
            <span className="text-2xl font-bold tracking-widest text-white">
              {input || '——'}
            </span>
          </div>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3">
          {['1','2','3','4','5','6','7','8','9'].map((d) => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white transition-all active:scale-95"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            >
              {d}
            </button>
          ))}

          {/* Show/hide */}
          <button
            onClick={() => setShowPin(!showPin)}
            className="h-16 rounded-2xl flex items-center justify-center transition-all"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>

          {/* 0 */}
          <button
            onClick={() => handleDigit('0')}
            className="h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white transition-all active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
          >
            0
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            className="h-16 rounded-2xl flex items-center justify-center transition-all"
            style={{ color: 'rgba(255,255,255,0.6)' }}
            onMouseOver={(e) => (e.currentTarget.style.color = 'white')}
            onMouseOut={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
          >
            <Delete size={22} />
          </button>
        </div>

        {/* Attempts warning */}
        {attempts >= 3 && (
          <div
            className="mt-4 p-3 rounded-2xl text-center"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            <p className="text-sm text-red-400">
              ⚠️ {attempts} percobaan gagal
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PinLock;
