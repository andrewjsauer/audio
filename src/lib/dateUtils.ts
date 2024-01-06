import { parseISO, startOfDay } from 'date-fns';
import { trackEvent } from '@lib/analytics';

export const convertDateToLocalStart = (date: Date) => {
  trackEvent('convert_date_to_local_start', { date });
  const createdAtDate = typeof date === 'string' ? parseISO(date) : new Date(date);

  const timezoneOffset = new Date().getTimezoneOffset();
  const createdAtLocal = new Date(createdAtDate.getTime() - timezoneOffset * 60000);
  const createdAtStartOfDay = startOfDay(createdAtLocal);

  return createdAtStartOfDay;
};
