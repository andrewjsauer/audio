import { useState, useEffect } from 'react';
import moment from 'moment-timezone';

const useTimeRemainingToMidnight = (timeZone: string) => {
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
      const now = moment.tz(timeZone);
      const midnight = now.clone().endOf('day');
      const diffInSeconds = midnight.diff(now, 'seconds');

      return formatTime(diffInSeconds);
    };

    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [timeZone]);

  const timeZoneAbbreviation = moment.tz(timeZone).zoneAbbr();
  return { time: timeRemaining, countryCode: timeZoneAbbreviation };
};

export default useTimeRemainingToMidnight;
