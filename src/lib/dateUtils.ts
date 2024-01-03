import { parseISO, startOfDay } from 'date-fns';

export const convertDateToLocalStart = (date: Date) => {
  const createdAtDate = typeof date === 'string' ? parseISO(date) : new Date(date);

  const timezoneOffset = new Date().getTimezoneOffset();
  const createdAtLocal = new Date(createdAtDate.getTime() - timezoneOffset * 60000);
  const createdAtStartOfDay = startOfDay(createdAtLocal);

  return createdAtStartOfDay;
};
