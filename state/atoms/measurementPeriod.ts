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

/**
 * Selector for the start and end date normalized to 00:00:00.000Z and 23:59:59.999Z
 */
export const measurementPeriodFormattedState = selector<{ start: string; end: string } | null>({
  key: 'measurementPeriodFormattedState',
  get: ({ get }) => {
    const startDate = get(measurementPeriodStartState);
    const endDate = get(measurementPeriodEndState);
    if (startDate && endDate) {
      const fixedStart = new Date(startDate);
      fixedStart.setUTCHours(0, 0, 0, 0);
      const fixedEnd = new Date(endDate);
      fixedEnd.setUTCHours(23, 59, 59, 999);
      return {
        start: fixedStart.toISOString(),
        end: fixedEnd.toISOString()
      };
    } else {
      return null;
    }
  }
});
