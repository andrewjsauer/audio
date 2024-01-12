import { parseISO } from 'date-fns';

export const convertDateToLocal = (date: Date) => {
  const createdAtDate = typeof date === 'string' ? parseISO(date) : new Date(date);

  // Get the timezone offset in minutes, then convert it to milliseconds.
  // We subtract this from the UTC time to get the local time.
  const timezoneOffset = new Date().getTimezoneOffset() * 60000;

  // Adjust createdAtDate to local time.
  const createdAtLocal = new Date(createdAtDate.getTime() - timezoneOffset);
  return createdAtLocal;
};
