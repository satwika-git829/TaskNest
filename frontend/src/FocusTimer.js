// src/FocusTimer.js
import React, { useState, useRef, useEffect } from 'react';

export default function FocusTimer() {
  const [seconds, setSeconds] = useState(1500); // 25 minutes
  const [active, setActive] = useState(false);
  const [streak, setStreak] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (active) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev > 0) return prev - 1;
          clearInterval(intervalRef.current);
          setActive(false);
          setStreak(s => s + 1);
          alert('Pomodoro complete! Take a break 🧘');
          return 1500;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [active]);

  const handleStart = () => setActive(true);
  const handleReset = () => {
    clearInterval(intervalRef.current);
    setActive(false);
    setSeconds(1500);
  };

  const min = String(Math.floor(seconds / 60)).padStart(2, '0');
  const sec = String(seconds % 60).padStart(2, '0');

  return (
    <div className="bg-gradient-to-br from-orange-100 to-yellow-200 shadow-lg rounded-xl w-80 p-6">
      <h2 className="font-bold text-yellow-800 text-2xl mb-2">Pomodoro</h2>
      <div className="text-4xl font-mono text-yellow-600 my-4">{min}:{sec}</div>
      <div className="flex gap-3">
        <button onClick={handleStart} className="bg-yellow-400 hover:bg-yellow-500 text-white py-2 px-4 rounded">Start</button>
        <button onClick={handleReset} className="bg-yellow-300 hover:bg-yellow-400 text-white py-2 px-4 rounded">Reset</button>
      </div>
      <div className="mt-3 text-sm text-yellow-700">Streak: <span className="font-bold">{streak}</span></div>
    </div>
  );
}
