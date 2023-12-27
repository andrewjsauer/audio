import { useState, useEffect } from 'react';
import { endOfDay, differenceInSeconds } from 'date-fns';

const useTimeRemainingToMidnight = () => {
  const [timeRemaining, setTimeRemaining] = useState('');

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(
      seconds,
    ).padStart(2, '0')}s`;
  };

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const midnight = endOfDay(now);
      const diffInSeconds = differenceInSeconds(midnight, now);

      return formatTime(diffInSeconds);
    };

    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return timeRemaining;
};

export default useTimeRemainingToMidnight;
