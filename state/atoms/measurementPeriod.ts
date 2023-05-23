import { atom, selector } from 'recoil';

export const measurementPeriodStartState = atom<Date | null>({
  key: 'measurementPeriodStartState',
  default: null
});

export const measurementPeriodEndState = atom<Date | null>({
  key: 'measurementPeriodEndState',
  default: null
});

export const measurementPeriodState = selector<{ start: Date | null; end: Date | null }>({
  key: 'measurementPeriodState',
  get: ({ get }) => ({
    start: get(measurementPeriodStartState),
    end: get(measurementPeriodEndState)
  })
});
