// src/WellnessSection.js
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const WellnessContext = createContext();

export function WellnessProvider({ children }) {
  const breathingSteps = ['Inhale', 'Hold', 'Exhale', 'Hold'];
  const defaultTips = [
    'Neck rolls: 5 each direction',
    'Shoulder shrugs: 10 reps',
    'Wrist circles: 10 each hand',
    'Stand and reach for the sky',
    'Touch your toes slowly'
  ];

  const [breathStep, setBreathStep] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);
  const [stepDuration, setStepDuration] = useState(4);
  const breathProgressRef = useRef(0);
  const breathIntervalRef = useRef(null);

  const [tips] = useState(defaultTips);
  const [tipIndex, setTipIndex] = useState(() => Number(localStorage.getItem('wellness_tipIndex')) || 0);
  const [autoRotateTips, setAutoRotateTips] = useState(true);
  const autoTipRef = useRef(null);

  const [reminderISO, setReminderISO] = useState(() => localStorage.getItem('wellness_reminder') || '');
  const reminderTimeoutRef = useRef(null);

  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(() => Number(localStorage.getItem('wellness_elapsedMs')) || 0);
  const stopWatchRef = useRef(null);
  const startTimeRef = useRef(null);

  async function requestNotificationPermission() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission !== 'denied') {
      const p = await Notification.requestPermission();
      return p === 'granted';
    }
    return false;
  }

  useEffect(() => {
    if (isBreathing) {
      breathIntervalRef.current = window.setInterval(() => {
        breathProgressRef.current += 0.25;
        if (breathProgressRef.current >= stepDuration) {
          breathProgressRef.current = 0;
          setBreathStep((s) => (s + 1) % breathingSteps.length);
        } else {
          setBreathStep((s) => s);
        }
      }, 250);
    }
    return () => {
      if (breathIntervalRef.current) window.clearInterval(breathIntervalRef.current);
      breathIntervalRef.current = null;
    };
  }, [isBreathing, stepDuration]);

  useEffect(() => {
    localStorage.setItem('wellness_tipIndex', String(tipIndex));
  }, [tipIndex]);

  useEffect(() => {
    if (autoRotateTips) {
      autoTipRef.current = window.setInterval(() => {
        setTipIndex((i) => (i + 1) % tips.length);
      }, 12000);
    }
    return () => {
      if (autoTipRef.current) window.clearInterval(autoTipRef.current);
      autoTipRef.current = null;
    };
  }, [autoRotateTips, tips.length]);

  useEffect(() => {
    localStorage.setItem('wellness_reminder', reminderISO);
    if (reminderTimeoutRef.current) {
      window.clearTimeout(reminderTimeoutRef.current);
      reminderTimeoutRef.current = null;
    }
    if (!reminderISO) return;
    const target = new Date(reminderISO);
    const now = new Date();
    const delay = target.getTime() - now.getTime();
    if (delay <= 0) return;
    requestNotificationPermission().then((allowed) => {
      if (!allowed) return;
      reminderTimeoutRef.current = window.setTimeout(() => {
        new Notification('Tasknest Wellness', { body: 'Time for a wellness break — breathe or stretch!' });
      }, delay);
    });
  }, [reminderISO]);

  useEffect(() => {
    localStorage.setItem('wellness_elapsedMs', String(elapsedMs));
  }, [elapsedMs]);

  useEffect(() => {
    if (running) {
      startTimeRef.current = Date.now();
      stopWatchRef.current = window.setInterval(() => {
        if (!startTimeRef.current) return;
        setElapsedMs((prev) => prev + (Date.now() - startTimeRef.current));
        startTimeRef.current = Date.now();
      }, 1000);
    } else {
      if (stopWatchRef.current) window.clearInterval(stopWatchRef.current);
      stopWatchRef.current = null;
      startTimeRef.current = null;
    }
    return () => {
      if (stopWatchRef.current) window.clearInterval(stopWatchRef.current);
      stopWatchRef.current = null;
    };
  }, [running]);

  const value = {
    breathingSteps,
    breathStep,
    setBreathStep,
    isBreathing,
    setIsBreathing,
    stepDuration,
    setStepDuration,
    breathProgressRef,

    tips,
    tipIndex,
    setTipIndex,
    autoRotateTips,
    setAutoRotateTips,
    requestNotificationPermission,
    shuffleTips: () => setTipIndex(Math.floor(Math.random() * tips.length)),

    reminderISO,
    setReminderISO,

    running,
    setRunning,
    elapsedMs,
    setElapsedMs,
    resetElapsed: () => { setRunning(false); setElapsedMs(0); localStorage.removeItem('wellness_elapsedMs'); }
  };

  return <WellnessContext.Provider value={value}>{children}</WellnessContext.Provider>;
}

function useWellness() {
  return useContext(WellnessContext);
}

function BreathingCard() {
  const {
    breathingSteps,
    breathStep,
    isBreathing,
    setIsBreathing,
    stepDuration,
    setStepDuration,
    breathProgressRef,
    setBreathStep
  } = useWellness();

  const progress = Math.min(100, Math.round((breathProgressRef.current / stepDuration) * 100));

  return (
    <section className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center">
      <div className="w-full flex justify-between items-center">
        <div>
          <h4 className="text-lg font-semibold text-green-700">Guided Breathing</h4>
          <p className="text-sm text-gray-600">Step: <span className="font-medium">{breathingSteps[breathStep]}</span></p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">{stepDuration}s / step</p>
          <input type="range" min={2} max={8} value={stepDuration} onChange={(e) => setStepDuration(Number(e.target.value))} />
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center w-full">
        <svg viewBox="0 0 36 36" className="w-28 h-28">
          <path className="text-green-200" strokeWidth="2" stroke="currentColor" fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          <path strokeWidth="2" strokeLinecap="round" stroke="currentColor" fill="none"
            style={{ strokeDasharray: `${progress}, 100` }}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            className="text-green-600" />
          <text x="18" y="20" fontSize="4" textAnchor="middle" className="fill-current text-green-700">{breathingSteps[breathStep]}</text>
        </svg>

        <div className="mt-3 flex gap-2">
          <button className="px-3 py-1 rounded-md bg-green-600 text-white text-sm" onClick={() => setIsBreathing(!isBreathing)}>
            {isBreathing ? 'Pause' : 'Start'}
          </button>
          <button className="px-3 py-1 rounded-md bg-white border border-green-200 text-green-700 text-sm"
            onClick={() => { setIsBreathing(false); setBreathStep(0); breathProgressRef.current = 0; }}>
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}

function TipsCard() {
  const { tips, tipIndex, setTipIndex, autoRotateTips, setAutoRotateTips, requestNotificationPermission, shuffleTips } = useWellness();

  function speakTip(text) {
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  return (
    <section className="bg-white p-4 rounded-xl shadow-sm flex flex-col">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-lg font-semibold text-green-700">Stretching Tip</h4>
          <p className="text-sm text-gray-600 mt-1">{tips[tipIndex]}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-1">
            <button onClick={() => setTipIndex((i) => (i - 1 + tips.length) % tips.length)} className="text-sm px-2 py-1 rounded border">◀</button>
            <button onClick={() => setTipIndex((i) => (i + 1) % tips.length)} className="text-sm px-2 py-1 rounded border">▶</button>
          </div>
          <div className="flex gap-1">
            <button onClick={() => speakTip(tips[tipIndex])} className="text-sm px-2 py-1 rounded border">🔊</button>
            <button onClick={shuffleTips} className="text-sm px-2 py-1 rounded border">🔀</button>
          </div>
        </div>
      </div>

      <div className="mt-3 flex gap-2 items-center">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={autoRotateTips} onChange={(e) => setAutoRotateTips(e.target.checked)} /> Auto-rotate
        </label>
        <button onClick={() => speakTip(tips[tipIndex])} className="ml-auto text-sm underline text-green-700">Read tip</button>
      </div>

      <hr className="my-3" />
    </section>
  );
}

function ReminderCard() {
  const { reminderISO, setReminderISO, requestNotificationPermission } = useWellness();

  return (
    <section className="bg-white p-4 rounded-xl shadow-sm flex flex-col">
      <h4 className="text-lg font-semibold text-green-700">Set Reminder</h4>
      <p className="text-xs text-gray-600">Pick a date & time — browser notification will fire.</p>
      <input type="datetime-local" value={reminderISO} onChange={(e) => setReminderISO(e.target.value)}
        className="mt-2 w-full p-2 rounded border border-green-200" />
      <div className="flex gap-2 mt-2">
        <button className="px-3 py-1 rounded bg-green-600 text-white text-sm" onClick={async () => {
          const ok = await requestNotificationPermission();
          if (!ok) alert('Enable notifications in your browser to receive reminders.');
          else alert('Notifications enabled.');
        }}>Enable Notifications</button>
        <button className="px-3 py-1 rounded bg-white border text-sm" onClick={() => { setReminderISO(''); localStorage.removeItem('wellness_reminder'); }}>Clear</button>
      </div>
    </section>
  );
}

function StopwatchCard() {
  const { running, setRunning, elapsedMs, resetElapsed } = useWellness();

  function formatMs(ms) {
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h) return `${h}h ${m}m ${s}s`;
    if (m) return `${m}m ${s}s`;
    return `${s}s`;
  }

  return (
    <section className="bg-white p-4 rounded-xl shadow-sm md:col-span-2 flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-green-700">Task Time Tracker</h4>
          <p className="text-sm text-gray-600">Track focused work time.</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-xl">{formatMs(elapsedMs)}</p>
          <p className="text-xs text-gray-500">Total tracked time</p>
        </div>
      </div>

      <div className="mt-3 flex gap-3">
        <button onClick={() => setRunning(!running)} className={`px-4 py-2 rounded-md text-white ${running ? 'bg-red-500' : 'bg-green-600'}`}>{running ? 'Stop' : 'Start'}</button>
        <button onClick={resetElapsed} className="px-4 py-2 rounded-md bg-white border">Reset</button>
        <button onClick={() => { navigator.clipboard?.writeText(formatMs(elapsedMs)); alert('Copied tracked time'); }} className="px-4 py-2 rounded-md bg-white border">Copy</button>
      </div>
    </section>
  );
}

export default function WellnessSection() {
  return (
    <WellnessProvider>
      <div className="max-w-3xl mx-auto p-4 bg-gradient-to-br from-green-50 to-green-200 rounded-2xl shadow-lg">
        <h3 className="text-2xl font-bold text-green-800 mb-4">Wellness</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BreathingCard />
          <div className="space-y-4">
            <TipsCard />
            <ReminderCard />
          </div>
          <StopwatchCard />
        </div>
        <p className="text-xs text-gray-500 mt-3"></p>
      </div>
    </WellnessProvider>
  );
}
