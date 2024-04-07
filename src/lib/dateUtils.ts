import moment from 'moment-timezone';

export const differenceInYears = (date1: string, date2: string) => {
  return moment(date1).diff(moment(date2), 'years');
};

export const differenceInMonths = (date1: string, date2: string) => {
  return moment(date1).diff(moment(date2), 'months');
};

export const differenceInDays = (date1: string, date2: string) => {
  return moment(date1).diff(moment(date2), 'days');
};

export const startOfDayInTimeZone = (date: Date, timeZone: string) => {
  return moment(date).tz(timeZone).startOf('day');
};

export const endOfDayInTimeZone = (date: Date, timeZone: string) => {
  return moment(date).tz(timeZone).endOf('day');
};

export const formatCreatedAt = (createdAt: string, timeZone: string) => {
  return moment(createdAt._seconds * 1000)
    .tz(timeZone)
    .toDate();
};
