import React, { useState, useEffect } from 'react';
import { Clock, Flame, Zap } from 'lucide-react';

const DURATION_24H_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const STORAGE_KEY = 'hasnain_checkout_offer_timer_end';

function getOrInitEndTime(): number {
  if (typeof window === 'undefined') {
    return Date.now() + DURATION_24H_MS;
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed > now) {
        return parsed;
      }
    }
    // If not stored or already expired, restart fresh 24 hours
    const newEnd = now + DURATION_24H_MS;
    localStorage.setItem(STORAGE_KEY, newEnd.toString());
    return newEnd;
  } catch {
    return Date.now() + DURATION_24H_MS;
  }
}

export const CheckoutCountdownTimer: React.FC = () => {
  const [time, setTime] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
    formatted: string;
  }>({
    hours: '23',
    minutes: '59',
    seconds: '59',
    formatted: 'Special Offer Ends In: 23:59:59',
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = Date.now();
      let end = getOrInitEndTime();
      let diff = end - now;

      // When countdown reaches zero, automatically restart from 24:00:00
      if (diff <= 0) {
        end = now + DURATION_24H_MS;
        try {
          localStorage.setItem(STORAGE_KEY, end.toString());
        } catch {
          // ignore localStorage error
        }
        diff = DURATION_24H_MS;
      }

      const totalSeconds = Math.max(0, Math.floor(diff / 1000));
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const hh = String(hours).padStart(2, '0');
      const mm = String(minutes).padStart(2, '0');
      const ss = String(seconds).padStart(2, '0');

      setTime({
        hours: hh,
        minutes: mm,
        seconds: ss,
        formatted: `Special Offer Ends In: ${hh}:${mm}:${ss}`,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-gradient-to-r from-neutral-950 via-black to-neutral-950 border-b-2 border-yellow-400 text-yellow-400 px-3 py-2.5 sm:px-5 sm:py-3 shadow-md relative overflow-hidden select-none">
      {/* Background glow & subtle pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(250,204,21,0.12),transparent_70%)] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        {/* Left Side: Flame / Offer Text */}
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-yellow-400 text-black shrink-0 animate-pulse">
            <Flame className="w-4 h-4 fill-black" />
          </span>
          <div className="leading-tight">
            <div className="text-[11px] sm:text-xs font-black tracking-wider uppercase text-yellow-400 flex items-center justify-center sm:justify-start gap-1">
              <Zap className="w-3 h-3 text-yellow-300 fill-yellow-300" />
              <span>Limited Time Special Discount</span>
            </div>
            <p className="text-[10px] text-gray-300 hidden sm:block">
              Lock in your exclusive wholesale price & free delivery inspection before the timer expires!
            </p>
          </div>
        </div>

        {/* Right Side: Exact required format "Special Offer Ends In: 23:59:59" */}
        <div className="flex items-center gap-2 bg-neutral-900/90 border border-yellow-400/80 px-3.5 py-1.5 rounded-xl shadow-inner">
          <Clock className="w-4 h-4 text-yellow-400 animate-spin-slow shrink-0" />
          
          <div className="text-center font-mono">
            <span className="text-xs sm:text-sm font-black tracking-wide text-white">
              Special Offer Ends In:{' '}
            </span>
            <span className="text-sm sm:text-base font-black text-yellow-400 tracking-wider">
              {time.hours}:{time.minutes}:{time.seconds}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
