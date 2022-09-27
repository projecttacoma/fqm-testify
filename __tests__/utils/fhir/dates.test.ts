import { DateFieldInfo } from '../../../scripts/parsePrimaryDatePath';
import {
  EXAMPLE_DR_CHOICE_TYPE_PERIOD_TO_PERIOD,
  EXAMPLE_DR_CHOICE_TYPE_DATETIME_TO_PERIOD,
  EXAMPLE_DR_PERIOD_TO_DATETIME,
  EXAMPLE_DR_DATETIME_TO_DATETIME,
  EXAMPLE_DR_PERIOD_TO_DATE,
  EXAMPLE_DR_DATETIME_TO_DATE,
  EXAMPLE_DR_MULTIPLE_DATE_FILTERS,
  EXAMPLE_DR_NO_DATEFILTER
} from '../../../fixtures/test/dateFilterFixtures';
import {
  getDateType,
  getRandomDateInPeriod,
  getRandomPeriodInPeriod,
  getResourcePrimaryDates,
  jsDateToFHIRDate
} from '../../../util/fhir/dates';

const PERIOD_START = '2020-01-01T00:00:00.000Z';
const PERIOD_END = '2020-12-31T00:00:00.000Z';

const EXAMPLE_FIELD_DATE: DateFieldInfo = {
  dataTypes: ['date']
};

const EXAMPLE_FIELD_CHOICE_TYPE_PERIOD: DateFieldInfo = {
  isChoiceType: true,
  dataTypes: ['Period', 'dateTime', 'date', 'nonsense']
};

const EXAMPLE_FIELD_CHOICE_TYPE_DATETIME: DateFieldInfo = {
  isChoiceType: true,
  dataTypes: ['dateTime', 'date', 'nonsense']
};

const EXAMPLE_FIELD_CHOICE_TYPE_DATE: DateFieldInfo = {
  isChoiceType: true,
  dataTypes: ['date', 'nonsense']
};

const EXAMPLE_PATH = 'testPath';

describe('getRandomPeriodInPeriod', () => {
  beforeAll(() => jest.spyOn(global.Math, 'random').mockReturnValue(0));

  it('should return a random period within the given period', () => {
    const period = getRandomPeriodInPeriod(PERIOD_START, PERIOD_END);
    assertPeriodInPeriod(PERIOD_START, period);
  });

  afterAll(jest.clearAllMocks);
});

describe('getRandomDateInPeriod', () => {
  beforeAll(() => jest.spyOn(global.Math, 'random').mockReturnValue(0));

  it('should return a random date within the given period', () => {
    const date = getRandomDateInPeriod(PERIOD_START, PERIOD_END);
    expect(date.getTime()).toEqual(new Date(PERIOD_START).getTime());
    expect(date.getTime()).toBeLessThan(new Date(PERIOD_END).getTime());
  });

  afterAll(jest.clearAllMocks);
});

describe('jsDateToFHIRDate', () => {
  // TODO figure out how to accurately compare date to dateTime
  it.skip('should return valid FHIR date string given a JS Date', () => {
    const date = jsDateToFHIRDate(new Date('PERIOD_START'));
    expect(date).toEqual('2020-01-01');
  });
});

describe('getDateType', () => {
  it('should return date for date field', () => {
    const { validField, newPath } = getDateType(EXAMPLE_FIELD_DATE, EXAMPLE_PATH);
    expect(validField).toEqual('date');
    expect(newPath).toEqual(EXAMPLE_PATH);
  });

  it('should return Period and updated path for choiceType with Period', () => {
    const { validField, newPath } = getDateType(EXAMPLE_FIELD_CHOICE_TYPE_PERIOD, EXAMPLE_PATH);
    expect(validField).toEqual('Period');
    expect(newPath).toEqual('testPathPeriod');
  });

  it('should return dateTime and updated path for choiceType with dateTime', () => {
    const { validField, newPath } = getDateType(EXAMPLE_FIELD_CHOICE_TYPE_DATETIME, EXAMPLE_PATH);
    expect(validField).toEqual('dateTime');
    expect(newPath).toEqual('testPathDateTime');
  });

  it('should return date and updated path for choiceType with date', () => {
    const { validField, newPath } = getDateType(EXAMPLE_FIELD_CHOICE_TYPE_DATE, EXAMPLE_PATH);
    expect(validField).toEqual('date');
    expect(newPath).toEqual('testPathDate');
  });
});

describe('getResourcePrimaryDates', () => {
  beforeAll(() => jest.spyOn(global.Math, 'random').mockReturnValue(0));

  it('should detect overlapping period for DataRequirement with singular Period dateFilter on field that accepts Period', () => {
    const resource: fhir4.Condition = { resourceType: 'Condition', subject: { reference: 'testSubject' } };
    getResourcePrimaryDates(resource, EXAMPLE_DR_CHOICE_TYPE_PERIOD_TO_PERIOD, PERIOD_START, PERIOD_END);
    expect(resource.resourceType).toEqual('Condition');
    assertPeriodInPeriod(EXAMPLE_DR_CHOICE_TYPE_PERIOD_TO_PERIOD.dateFilter[0].valuePeriod.start, resource.onsetPeriod);
  });

  it('should map dateTime to Period for DataRequirement with singular dateTime dateFilter on field that accepts Period', () => {
    const resource: fhir4.Condition = { resourceType: 'Condition', subject: { reference: 'testSubject' } };
    getResourcePrimaryDates(resource, EXAMPLE_DR_CHOICE_TYPE_DATETIME_TO_PERIOD, PERIOD_START, PERIOD_END);
    expect(resource.resourceType).toEqual('Condition');
    const start = resource.onsetPeriod?.start;
    const end = resource.onsetPeriod?.end;
    if (!start || !end) {
      throw new Error('resource did not have defined start and end for onsetPeriod');
    }
    expect(start).toEqual(EXAMPLE_DR_CHOICE_TYPE_DATETIME_TO_PERIOD.dateFilter[0].valueDateTime);
    expect(end).toEqual(start);
  });

  it('should map Period to dateTime for DataRequirement with singular Period dateFilter on field that accepts dateTime', () => {
    const resource: fhir4.Condition = { resourceType: 'Condition', subject: { reference: 'testSubject' } };
    getResourcePrimaryDates(resource, EXAMPLE_DR_PERIOD_TO_DATETIME, PERIOD_START, PERIOD_END);
    expect(resource.resourceType).toEqual('Condition');
    const dt = resource.recordedDate;
    if (!dt) {
      throw new Error('resource did not have defined dateTime for recordedDate');
    }
    expect(dt).toEqual(EXAMPLE_DR_PERIOD_TO_DATETIME.dateFilter[0].valuePeriod.start);
  });

  it('should pass through dateTime for DataRequirement with singular dateTime dateFilter on field that accepts dateTime', () => {
    const resource: fhir4.Condition = { resourceType: 'Condition', subject: { reference: 'testSubject' } };
    getResourcePrimaryDates(resource, EXAMPLE_DR_DATETIME_TO_DATETIME, PERIOD_START, PERIOD_END);
    expect(resource.resourceType).toEqual('Condition');
    const dt = resource.recordedDate;
    expect(dt).toEqual(EXAMPLE_DR_DATETIME_TO_DATETIME.dateFilter[0].valueDateTime);
  });

  // TODO figure out how to accurately compare date to dateTime
  it.skip('should map Period to date for DataRequirement with singular Period dateFilter on field that accepts date', () => {
    const resource: fhir4.Patient = { resourceType: 'Patient' };
    getResourcePrimaryDates(resource, EXAMPLE_DR_PERIOD_TO_DATE, PERIOD_START, PERIOD_END);
    expect(resource.resourceType).toEqual('Patient');
    const dt = resource.birthDate;
    if (!dt) {
      throw new Error('resource did not have defined date for birthDate');
    }
    const dtTime = new Date(dt).getTime();
    expect(dtTime).toEqual(new Date(EXAMPLE_DR_PERIOD_TO_DATE.dateFilter[0].valuePeriod.start).getTime());
  });

  // TODO figure out how to accurately compare date to dateTime
  it.skip('should map dateTime to date for DataRequirement with singular dateTime dateFilter on field that accepts date', () => {
    const resource: fhir4.Patient = { resourceType: 'Patient' };
    getResourcePrimaryDates(resource, EXAMPLE_DR_DATETIME_TO_DATE, PERIOD_START, PERIOD_END);
    expect(resource.resourceType).toEqual('Patient');
    const dt = resource.birthDate;
    expect(dt).toEqual('2019-01-01');
  });

  it('should detect overlapping period for DataRequirement with multiple dateFilters', () => {
    const resource: fhir4.Condition = { resourceType: 'Condition', subject: { reference: 'testSubject' } };
    getResourcePrimaryDates(resource, EXAMPLE_DR_MULTIPLE_DATE_FILTERS, PERIOD_START, PERIOD_END);
    expect(resource.resourceType).toEqual('Condition');
    assertPeriodInPeriod(
      EXAMPLE_DR_MULTIPLE_DATE_FILTERS.dateFilter[0].valuePeriod?.start as string,
      resource.onsetPeriod
    );
    const dt = resource.recordedDate;
    expect(dt).toEqual(EXAMPLE_DR_MULTIPLE_DATE_FILTERS.dateFilter[1].valueDateTime);
  });

  it('should detect overlapping period for DataRequirement with no dateFilters', () => {
    const resource: fhir4.Condition = { resourceType: 'Condition', subject: { reference: 'testSubject' } };
    getResourcePrimaryDates(resource, EXAMPLE_DR_NO_DATEFILTER, PERIOD_START, PERIOD_END);
    expect(resource.resourceType).toEqual('Condition');
    assertPeriodInPeriod(PERIOD_START, resource.onsetPeriod);
    assertPeriodInPeriod(PERIOD_START, resource.abatementPeriod);
    const dt = resource.recordedDate;
    expect(dt).toEqual(PERIOD_START);
  });

  afterAll(jest.clearAllMocks);
});

function assertPeriodInPeriod(start: string, period?: fhir4.Period) {
  if (!period?.start || !period?.end) {
    throw new Error('resource did not have defined start and end for period');
  }
  const startTime = new Date(period.start).getTime();
  const endTime = new Date(period.end).getTime();
  expect(period.start).toEqual(start);
  expect(Math.round((endTime - startTime) / (1000 * 60 * 60 * 24))).toEqual(1);
}
