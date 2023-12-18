import { format, isToday } from 'date-fns';

export const formatDateAndTime = (firebaseTimestamp) => {
  // Convert Firebase timestamp to JavaScript Date object
  const date = firebaseTimestamp.toDate();

  // Format the date
  const formattedDate = isToday(date) ? 'Today' : format(date, 'PPP'); // 'PPP' for formatted date
  // Format the time in 12-hour format
  const formattedTime = format(date, 'p'); // 'p' for local time in 12-hour format

  return { formattedDate, formattedTime };
};
