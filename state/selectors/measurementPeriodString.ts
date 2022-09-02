import { selector } from 'recoil';
import { measurementPeriodState } from '../atoms/measurementPeriod';

export const measurementPeriodStringState = selector<string>({
  key: 'measurementPeriodStringState',
  get: async ({ get }) => {
    const { start, end } = get(measurementPeriodState);
    if (!start || !end) {
      return '';
    }
    return `${retrieveDateString(start)} - ${retrieveDateString(end)}`;
  }
});

const retrieveDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  return `${month} ${day}, ${year}`;
};

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];
