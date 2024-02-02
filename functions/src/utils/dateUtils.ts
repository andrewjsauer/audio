import moment from 'moment-timezone';

export const differenceInYears = (date1: any, date2: any) => {
  return moment(date1).diff(moment(date2), 'years');
};

export const differenceInMonths = (date1: any, date2: any) => {
  return moment(date1).diff(moment(date2), 'months');
};

export const differenceInDays = (date1: any, date2: any) => {
  return moment(date1).diff(moment(date2), 'days');
};

export const startOfDayInTimeZone = (date: any, timeZone: any) => {
  return moment(date).tz(timeZone).startOf('day');
};

export const formatCreatedAt = (createdAt: any, timeZone: any) => {
  return moment(createdAt._seconds * 1000)
    .tz(timeZone)
    .toDate();
};
