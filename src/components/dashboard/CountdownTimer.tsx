import React, { useState, useEffect } from "react";

interface CountdownTimerProps {
  deadline: Date;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date().getTime();
      const diff = deadline.getTime() - now;
      if (diff <= 0) return;
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  const totalSeconds = 30 * 24 * 60 * 60;
  const remainingSeconds =
    timeLeft.days * 86400 + timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds;
  const progress = Math.max(0, Math.min(1, remainingSeconds / totalSeconds));
  const circumference = 2 * Math.PI * 40;
  const offset = circumference * (1 - progress);

  return (
    <div className="dashboard-card text-center space-y-4">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Оставшееся время
      </p>
      <div className="relative mx-auto w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold font-display text-foreground">{timeLeft.days}</span>
          <span className="text-[10px] text-muted-foreground font-medium">ДНЕЙ</span>
        </div>
      </div>
      <div className="flex justify-center gap-4">
        {[
          { val: timeLeft.hours, label: "ЧАС" },
          { val: timeLeft.minutes, label: "МИН" },
          { val: timeLeft.seconds, label: "СЕК" },
        ].map((item) => (
          <div key={item.label} className="text-center">
            <span className="text-lg font-bold font-display text-foreground">
              {String(item.val).padStart(2, "0")}
            </span>
            <p className="text-[9px] text-muted-foreground font-medium">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountdownTimer;
