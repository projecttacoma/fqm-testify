import { atom } from 'recoil';

/**
 * Atom tracking and controlling the value the measurement period
 */
export const measurementPeriodState = atom<{ start: Date | null; end: Date | null }>({
  key: 'measurementPeriodState',
  default: {
    start: null,
    end: null
  }
});
