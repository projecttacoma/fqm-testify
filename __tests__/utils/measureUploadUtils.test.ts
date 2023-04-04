import { populateMeasurementPeriod, DEFAULT_MEASUREMENT_PERIOD } from '../../util/MeasureUploadUtils';
import { DateTime } from 'luxon';

const EXAMPLE_START_DATE = '2020-01-01';
const EXAMPLE_END_DATE = '2022-01-01';
const EXPECTED_BOTH_DEFINED_MEASUREMENT_PERIOD = {
  start: DateTime.fromISO(EXAMPLE_START_DATE).toJSDate(),
  end: DateTime.fromISO(EXAMPLE_END_DATE).toJSDate()
};
const EXPECTED_START_DEFINED_MEASUREMENT_PERIOD = {
  start: DateTime.fromISO(EXAMPLE_START_DATE).toJSDate(),
  end: DateTime.fromISO('2021-01-01').toJSDate()
};
const EXPECTED_END_DEFINED_MEASUREMENT_PERIOD = {
  start: DateTime.fromISO('2021-01-01').toJSDate(),
  end: DateTime.fromISO(EXAMPLE_END_DATE).toJSDate()
};

describe('populateMeasurementPeriod', () => {
  it('populates a period if start and end are defined', () => {
    expect(populateMeasurementPeriod(EXAMPLE_START_DATE, EXAMPLE_END_DATE)).toEqual(
      EXPECTED_BOTH_DEFINED_MEASUREMENT_PERIOD
    );
  });
  it('populates a period of length 1 year if start is defined and end is not', () => {
    expect(populateMeasurementPeriod(EXAMPLE_START_DATE, undefined)).toEqual(EXPECTED_START_DEFINED_MEASUREMENT_PERIOD);
  });
  it('populates a period of length 1 year if end is defined and start is not', () => {
    expect(populateMeasurementPeriod(undefined, EXAMPLE_END_DATE)).toEqual(EXPECTED_END_DEFINED_MEASUREMENT_PERIOD);
  });
  it('populates a period with default start and end if neither is defined', () => {
    expect(populateMeasurementPeriod(undefined, undefined)).toEqual(DEFAULT_MEASUREMENT_PERIOD);
  });
});
