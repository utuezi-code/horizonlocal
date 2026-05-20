'use client';

import { useState, useEffect } from 'react';

interface CountdownProps {
  endsAt: string;
}

interface TimeLeft {
  jours: number;
  heures: number;
  minutes: number;
  secondes: number;
}

function calculateTimeLeft(endsAt: string): TimeLeft {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return { jours: 0, heures: 0, minutes: 0, secondes: 0 };

  return {
    jours: Math.floor(diff / (1000 * 60 * 60 * 24)),
    heures: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    secondes: Math.floor((diff / 1000) % 60),
  };
}

export function Countdown({ endsAt }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(endsAt));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endsAt));
    }, 1000);
    return () => clearInterval(timer);
  }, [endsAt]);

  const units = [
    { label: 'Jours', value: timeLeft.jours },
    { label: 'Heures', value: timeLeft.heures },
    { label: 'Min', value: timeLeft.minutes },
    { label: 'Sec', value: timeLeft.secondes },
  ];

  return (
    <div className="flex items-center gap-2">
      {units.map(({ label, value }, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 flex items-center justify-center rounded-lg bg-[#1c61e7] text-white text-xl font-bold">
              {String(value).padStart(2, '0')}
            </div>
            <span className="text-xs text-gray-500 mt-1">{label}</span>
          </div>
          {i < units.length - 1 && (
            <span className="text-2xl font-bold text-gray-400 mb-4">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
