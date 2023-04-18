import { DateTime } from 'luxon';

export const OneWeekAgo = () => {
  return `${DateTime.now().minus({ weeks: 1 }).toISO().split('.')[0]}Z`;
};

export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

export const getAuth = () => {
  return Buffer.from(`${process.env.apiKey}:${process.env.apiSecret}`).toString('base64');
};
export const formatNumber = (number) => {
  if (!number.startsWith('+')) {
    return `1${number}`;
  } else {
    return number;
  }
};
