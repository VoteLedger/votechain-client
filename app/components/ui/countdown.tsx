import { useEffect, useState } from "react";
import { FaClock } from "react-icons/fa";

interface CountdownProps {
  end_date: Date;
  stop?: boolean;
  onEnd: () => void;
  className?: string;
}

/** Helper function to format the time difference */
function formatTimeDifference(milliseconds: number) {
  if (milliseconds <= 0) return "0s";

  const seconds = Math.floor(milliseconds / 1000) % 60;
  const minutes = Math.floor(milliseconds / (1000 * 60)) % 60;
  const hours = Math.floor(milliseconds / (1000 * 60 * 60)) % 24;
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(" ");
}

export default function Countdown({
  end_date,
  stop,
  onEnd,
  className,
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(end_date.getTime() - Date.now());

  useEffect(() => {
    if (stop) return;
    const timer = setInterval(() => {
      const diff = end_date.getTime() - Date.now();
      setTimeLeft(diff);
      if (diff <= 0) {
        clearInterval(timer);
        onEnd();
      }
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [className, end_date, onEnd, stop]);

  return (
    <div className="flex items-center space-x-2 text-gray-700">
      <FaClock className="w-4 h-4 text-gray-500" />
      <strong>Time left:</strong>
      <span>{formatTimeDifference(timeLeft)}</span>
    </div>
  );
}
