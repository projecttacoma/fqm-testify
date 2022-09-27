import { dateFieldInfo } from '../../scripts/parsePrimaryDatePath';
import {
  EXAMPLE_DR_CHOICE_TYPE_PERIOD_TO_PERIOD,
  EXAMPLE_DR_CHOICE_TYPE_DATETIME_TO_PERIOD,
  EXAMPLE_DR_PERIOD_TO_DATETIME,
  EXAMPLE_DR_DATETIME_TO_DATETIME,
  EXAMPLE_DR_PERIOD_TO_DATE,
  EXAMPLE_DR_DATETIME_TO_DATE,
  EXAMPLE_DR_MULTIPLE_DATE_FILTERS,
  EXAMPLE_DR_NO_DATEFILTER
} from '../../fixtures/test/dateFilterFixtures';
import {
  getDateType,
  getRandomDateInPeriod,
  getRandomPeriodInPeriod,
  getResourcePrimaryDates,
  jsDateToFHIRDate
} from '../../util/fhir/dates';
import { getDataRequirementFiltersString, getFhirResourceSummary } from '../../util/fhir/codes';
import {
  createCopiedPatientResource,
  createCopiedResources,
  createFHIRResourceString,
  createPatientBundle
} from '../../util/fhir/resourceCreation';

const PERIOD_START = '2020-01-01T00:00:00.000Z';
const PERIOD_END = '2020-12-31T00:00:00.000Z';

const VS_MAP = { testvs: 'test vs name' };

// data requirement that does not have any valuesets or any direct reference codes
const DATA_REQUIREMENT_WITH_NO_VALUESETS_OR_DRC = {
  type: 'Observation',
  status: 'draft'
};

// data requirement that does not have any valuesets but has a direct reference code
const DATA_REQUIREMENT_WITH_NO_VALUESETS_WITH_DRC = {
  type: 'Communication',
  status: 'draft',
  codeFilter: [
    {
      path: 'reasonCode',
      code: [
        {
          system: 'http://snomed.info/sct/731000124108',
          version: 'http://snomed.info/sct/731000124108/version/201709',
          display: 'test display 2',
          code: '456'
        }
      ]
    }
  ]
};

const DATA_REQUIREMENT_WITH_VALUESETS = {
  type: 'Observation',
  status: 'draft',
  codeFilter: [
    {
      path: 'code',
      valueSet: 'testvs'
    }
  ]
};

const DATA_REQUIREMENT_WITH_CODE = {
  type: 'Observation',
  status: 'draft',
  codeFilter: [
    {
      path: 'code',
      code: [
        {
          system: 'http://snomed.info/sct/731000124108',
          version: 'http://snomed.info/sct/731000124108/version/201709',
          display: 'test display',
          code: '37687000'
        }
      ]
    }
  ]
};

// example data requirement for resource type with primaryCodeType FHIR.CodeableConcept and valueset
const OBSERVATION_DATA_REQUIREMENT_WITH_CODE_AND_VALUESET = {
  type: 'Observation',
  status: 'draft',
  codeFilter: [
    {
      path: 'code',
      valueSet: 'testvs'
    },
    {
      path: 'category',
      code: [
        {
          system: 'http://snomed.info/sct/731000124108',
          version: 'http://snomed.info/sct/731000124108/version/201709',
          display: 'test display',
          code: '37687000'
        }
      ]
    }
  ]
};

// example data requirement for resource type with primaryCodeType FHIR.Coding
const MESSAGEDEFINITION_DATA_REQUIREMENT = {
  type: 'MessageDefinition',
  status: 'draft',
  codeFilter: [
    {
      path: 'event',
      valueSet: 'testvs'
    }
  ]
};

// example data requirement for resource type with primaryCodeType FHIR.code
const OPERATIONDEFINITION_DATA_REQUIREMENT = {
  type: 'OperationDefinition',
  status: 'draft',
  codeFilter: [
    {
      path: 'code',
      valueSet: 'testvs'
    }
  ]
};

// example data requirement with multiple cardinality
const ACTIVITYDEFINITION_DATA_REQUIREMENT = {
  type: 'ActivityDefinition',
  status: 'draft',
  codeFilter: [
    {
      path: 'topic',
      valueSet: 'testvs'
    }
  ]
};

const DATA_REQUIREMENT_WITH_CHOICETYPE_CODEABLE_CONCEPT = {
  type: 'DeviceRequest',
  status: 'draft',
  codeFilter: [
    {
      path: 'code',
      code: [
        {
          system: 'http://snomed.info/sct/731000124108',
          version: 'http://snomed.info/sct/731000124108/version/201709',
          display: 'test display',
          code: '37687000'
        }
      ]
    }
  ]
};

// example data requirement for resource type with `subject` not used as the patient reference
const COVERAGE_DATA_REQUIREMENT = {
  type: 'Coverage',
  status: 'active',
  codeFilter: [
    {
      path: 'type',
      valueSet: 'testvs'
    }
  ]
};

const TEST_MEASURE_BUNDLE: fhir4.Bundle = {
  resourceType: 'Bundle',
  type: 'transaction',
  entry: [
    {
      resource: {
        resourceType: 'ValueSet',
        status: 'active',
        url: 'testvs',
        compose: {
          include: [
            {
              system: 'test-system',
              version: 'test-version',
              concept: [
                {
                  code: '123',
                  display: 'test display'
                }
              ]
            }
          ]
        }
      }
    }
  ]
};

const TEST_MEASURE_BUNDLE_WITH_EXPANSION: fhir4.Bundle = {
  resourceType: 'Bundle',
  type: 'transaction',
  entry: [
    {
      resource: {
        resourceType: 'ValueSet',
        status: 'active',
        url: 'testvs',
        expansion: {
          timestamp: '2017-01-01T00:00:00.000Z',
          contains: [
            {
              system: 'test-system',
              version: 'test-version',
              code: '123',
              display: 'test display'
            }
          ]
        }
      }
    }
  ]
};

const RESOURCE_WITH_NO_SUMMARY: fhir4.Resource = {
  resourceType: 'Procedure'
};

const RESOURCE_WITH_NO_CODE: fhir4.Resource = {
  resourceType: 'Procedure',
  id: 'procedure-id'
};

const PROCEDURE_RESOURCE_WITH_FULL_SUMMARY: fhir4.Procedure = {
  resourceType: 'Procedure',
  id: 'procedure-id',
  status: 'completed',
  code: {
    coding: [
      {
        code: '123',
        display: 'This is an example of display text for a Procedure resource.'
      }
    ]
  },
  subject: {
    reference: 'Patient/procedure-reference'
  }
};

const PROCEDURE_RESOURCE_WITH_CODE: fhir4.Procedure = {
  resourceType: 'Procedure',
  id: 'procedure-id',
  status: 'completed',
  code: {
    coding: [
      {
        code: '123'
      }
    ]
  },
  subject: {
    reference: 'procedure-reference'
  }
};

const PROCEDURE_RESOURCE_WITH_DISPLAY: fhir4.Procedure = {
  resourceType: 'Procedure',
  id: 'procedure-id',
  status: 'completed',
  code: {
    coding: [
      {
        display: 'This is an example of display text for a Procedure resource.'
      }
    ]
  },
  subject: {
    reference: 'procedure-reference'
  }
};

const PROCEDURE_RESOURCE_WITH_TWO_CODES: fhir4.Procedure = {
  resourceType: 'Procedure',
  id: 'procedure-id',
  status: 'completed',
  code: {
    coding: [
      {
        code: '123',
        display: 'Display1'
      },
      {
        code: '456',
        display: 'Display2'
      }
    ]
  },
  subject: {
    reference: 'procedure-reference'
  }
};

const MEASURE_REPORT_WITH_ID: fhir4.MeasureReport = {
  resourceType: 'MeasureReport',
  id: 'measure-report-id',
  type: 'individual',
  status: 'complete',
  measure: '',
  period: {
    start: '',
    end: ''
  },
  text: {
    div: 'test123',
    status: 'additional'
  }
};
const EXAMPLE_FIELD_DATE: dateFieldInfo = {
  dataTypes: ['date']
};

const EXAMPLE_FIELD_CHOICE_TYPE_PERIOD: dateFieldInfo = {
  isChoiceType: true,
  dataTypes: ['Period', 'dateTime', 'date', 'nonsense']
};
const EXAMPLE_FIELD_CHOICE_TYPE_DATETIME: dateFieldInfo = {
  isChoiceType: true,
  dataTypes: ['dateTime', 'date', 'nonsense']
};

const EXAMPLE_FIELD_CHOICE_TYPE_DATE: dateFieldInfo = {
  isChoiceType: true,
  dataTypes: ['date', 'nonsense']
};

const EXAMPLE_PATH = 'testPath';

const PATIENT_RESOURCE: fhir4.Patient = {
  resourceType: 'Patient',
  id: 'Patient1'
};

const PATIENT_RESOURCE_W_DETAILS: fhir4.Patient = {
  resourceType: 'Patient',
  id: 'Patient2',
  identifier: [
    {
      system: 'http://example.com/test-id',
      value: `test-patient-Patient2`
    }
  ],
  gender: 'male',
  name: [
    {
      family: 'Smith',
      given: ['John']
    }
  ]
};

const ENCOUNTER_RESOURCE: fhir4.Encounter = {
  resourceType: 'Encounter',
  id: 'Encounter1',
  status: 'finished',
  class: { code: 'AMB' },
  type: [
    {
      coding: [
        {
          system: 'https://www.cms.gov/Medicare/Coding/MedHCPCSGenInfo/index.html',
          version: '2018',
          code: 'G0438',
          display: 'Annual wellness visit; includes a personalized prevention plan of service (pps), initial visit'
        }
      ]
    }
  ]
};

const OBSERVATION_RESOURCE: fhir4.Observation = {
  resourceType: 'Observation',
  id: 'Observation1',
  code: {
    coding: [
      {
        code: 'Test Obs'
      }
    ]
  },
  status: 'final'
};
describe('getDataRequirementFiltersString', () => {
  test('returns an empty string for resource with no valuesets and no direct reference code', () => {
    expect(getDataRequirementFiltersString(DATA_REQUIREMENT_WITH_NO_VALUESETS_OR_DRC, VS_MAP)).toEqual('');
  });
  test('returns name of code and display when there is a direct reference code but no valuesets', () => {
    expect(getDataRequirementFiltersString(DATA_REQUIREMENT_WITH_NO_VALUESETS_WITH_DRC, VS_MAP)).toEqual(
      '456: test display 2'
    );
  });
  test('returns name of valueset when codefilter includes valueset', () => {
    expect(getDataRequirementFiltersString(DATA_REQUIREMENT_WITH_VALUESETS, VS_MAP)).toEqual('test vs name (testvs)');
  });
  test('returns display when code filter is of path code', () => {
    expect(getDataRequirementFiltersString(DATA_REQUIREMENT_WITH_CODE, VS_MAP)).toEqual('37687000: test display');
  });
  test('returns display and name when both code and valueset exist', () => {
    expect(getDataRequirementFiltersString(OBSERVATION_DATA_REQUIREMENT_WITH_CODE_AND_VALUESET, VS_MAP)).toEqual(
      'test vs name (testvs)\n37687000: test display'
    );
  });
});

describe('getFhirResourceSummary', () => {
  test('returns an empty string for resource with no code, display, or id', () => {
    expect(getFhirResourceSummary(RESOURCE_WITH_NO_SUMMARY)).toEqual('');
  });
  test('returns the resource id for resource with no code', () => {
    expect(getFhirResourceSummary(RESOURCE_WITH_NO_CODE)).toEqual('(procedure-id)');
  });
  test('returns the resource id for resource with no primary code path', () => {
    expect(getFhirResourceSummary(MEASURE_REPORT_WITH_ID)).toEqual('(measure-report-id)');
  });
  test('returns the code and display for resource with both', () => {
    expect(getFhirResourceSummary(PROCEDURE_RESOURCE_WITH_FULL_SUMMARY)).toEqual(
      '(123: This is an example of display text for a Procedure resource.)'
    );
  });
  test('returns only the code when the display does not exist but the code does', () => {
    expect(getFhirResourceSummary(PROCEDURE_RESOURCE_WITH_CODE)).toEqual('(123)');
  });
  test('returns only the display when the code does not exist but the display does', () => {
    expect(getFhirResourceSummary(PROCEDURE_RESOURCE_WITH_DISPLAY)).toEqual(
      '(This is an example of display text for a Procedure resource.)'
    );
  });
  test('returns only the first code and display when there are multiple codes', () => {
    expect(getFhirResourceSummary(PROCEDURE_RESOURCE_WITH_TWO_CODES)).toEqual('(123: Display1)');
  });
});

describe('createFHIRResourceString', () => {
  test('returns populated FHIR resource for primaryCodeType FHIR.CodeableConcept', () => {
    const createdResource = createFHIRResourceString(
      OBSERVATION_DATA_REQUIREMENT_WITH_CODE_AND_VALUESET,
      TEST_MEASURE_BUNDLE,
      'Patient1',
      PERIOD_START,
      PERIOD_END
    );
    expect(JSON.parse(createdResource).code).toEqual({
      coding: [
        {
          system: 'test-system',
          version: 'test-version',
          code: '123',
          display: 'test display'
        }
      ]
    });
    expect(JSON.parse(createdResource).subject).toEqual({
      reference: 'Patient/Patient1'
    });
  });

  test('returns populated FHIR resource for primaryCodeType FHIR.Coding', () => {
    const createdResource = createFHIRResourceString(
      MESSAGEDEFINITION_DATA_REQUIREMENT,
      TEST_MEASURE_BUNDLE,
      'Patient1',
      PERIOD_START,
      PERIOD_END
    );
    expect(JSON.parse(createdResource).eventCoding).toEqual({
      system: 'test-system',
      version: 'test-version',
      code: '123',
      display: 'test display'
    });
    expect(JSON.parse(createdResource).subject).toBeUndefined();
  });

  test('returns populated FHIR resource for codeType FHIR.code', () => {
    const createdResource = createFHIRResourceString(
      OPERATIONDEFINITION_DATA_REQUIREMENT,
      TEST_MEASURE_BUNDLE,
      'Patient1',
      PERIOD_START,
      PERIOD_END
    );
    expect(JSON.parse(createdResource).code).toEqual('123');
    expect(JSON.parse(createdResource).subject).toBeUndefined();
  });

  test('returns populated FHIR resource for choiceType codeable concept', () => {
    const createdResource = createFHIRResourceString(
      DATA_REQUIREMENT_WITH_CHOICETYPE_CODEABLE_CONCEPT,
      TEST_MEASURE_BUNDLE,
      'Patient1',
      PERIOD_START,
      PERIOD_END
    );
    expect(JSON.parse(createdResource).codeCodeableConcept).toEqual({
      coding: [
        {
          system: 'http://snomed.info/sct/731000124108',
          version: 'http://snomed.info/sct/731000124108/version/201709',
          code: '37687000',
          display: 'test display'
        }
      ]
    });
  });

  test('returns populated FHIR resource where primaryCodePath is 0..* or 1..* (multiple cardinality)', () => {
    const createdResource = createFHIRResourceString(
      ACTIVITYDEFINITION_DATA_REQUIREMENT,
      TEST_MEASURE_BUNDLE,
      'Patient1',
      PERIOD_START,
      PERIOD_END
    );
    expect(Array.isArray(JSON.parse(createdResource).topic)).toBe(true);
    expect(JSON.parse(createdResource).subject).toBeUndefined();
  });

  test('returns populated FHIR resource where primaryCodePath is 0..1 or 1..1', () => {
    const createdResource = createFHIRResourceString(
      OBSERVATION_DATA_REQUIREMENT_WITH_CODE_AND_VALUESET,
      TEST_MEASURE_BUNDLE,
      'Patient1',
      PERIOD_START,
      PERIOD_END
    );
    expect(typeof JSON.parse(createdResource).code).toBe('object');
    expect(JSON.parse(createdResource).subject).toEqual({
      reference: 'Patient/Patient1'
    });
  });

  test('returns populated FHIR resource where subject is not the patient reference', () => {
    const createdResource = createFHIRResourceString(
      COVERAGE_DATA_REQUIREMENT,
      TEST_MEASURE_BUNDLE,
      'Patient1',
      PERIOD_START,
      PERIOD_END
    );
    expect(typeof JSON.parse(createdResource).type).toBe('object');
    expect(JSON.parse(createdResource).beneficiary).toEqual({
      reference: 'Patient/Patient1'
    });
  });

  test('properly retrieves system/version/code/display when valueset has expansion', () => {
    const createdResource = createFHIRResourceString(
      OBSERVATION_DATA_REQUIREMENT_WITH_CODE_AND_VALUESET,
      TEST_MEASURE_BUNDLE_WITH_EXPANSION,
      'Patient1',
      PERIOD_START,
      PERIOD_END
    );
    expect(JSON.parse(createdResource).code).toEqual({
      coding: [
        {
          system: 'test-system',
          version: 'test-version',
          code: '123',
          display: 'test display'
        }
      ]
    });
    expect(JSON.parse(createdResource).subject).toEqual({
      reference: 'Patient/Patient1'
    });
  });
});

describe('createPatientBundle', () => {
  test('can create bundle just patient', () => {
    const expectedBundle: fhir4.Bundle = {
      resourceType: 'Bundle',
      type: 'transaction',
      id: expect.any(String),
      entry: [
        {
          resource: PATIENT_RESOURCE,
          request: {
            method: 'PUT',
            url: 'Patient/Patient1'
          }
        }
      ]
    };

    expect(createPatientBundle(PATIENT_RESOURCE, [])).toEqual(expectedBundle);
  });

  test('can create bundle with patient and resources', () => {
    const expectedBundle: fhir4.Bundle = {
      resourceType: 'Bundle',
      type: 'transaction',
      id: expect.any(String),
      entry: [
        {
          resource: PATIENT_RESOURCE,
          request: {
            method: 'PUT',
            url: 'Patient/Patient1'
          }
        },
        {
          resource: ENCOUNTER_RESOURCE,
          request: {
            method: 'PUT',
            url: 'Encounter/Encounter1'
          }
        },
        {
          resource: OBSERVATION_RESOURCE,
          request: {
            method: 'PUT',
            url: 'Observation/Observation1'
          }
        }
      ]
    };

    expect(createPatientBundle(PATIENT_RESOURCE, [ENCOUNTER_RESOURCE, OBSERVATION_RESOURCE])).toEqual(expectedBundle);
  });
});

describe('createCopiedResources', () => {
  test('copy resources change ids and patient references', () => {
    const resources = createCopiedResources(
      [PROCEDURE_RESOURCE_WITH_FULL_SUMMARY],
      'procedure-reference',
      'new-reference'
    );
    const procedure: fhir4.Procedure = resources[0] as fhir4.Procedure;
    expect(procedure.id).not.toEqual(PROCEDURE_RESOURCE_WITH_FULL_SUMMARY.id);
    expect(procedure.subject.reference).toEqual('Patient/new-reference');
    expect(PROCEDURE_RESOURCE_WITH_FULL_SUMMARY.subject.reference).toEqual('Patient/procedure-reference');
  });
});

describe('createCopiedPatientResource', () => {
  test('copy patient has new identifying fields', () => {
    const patient = createCopiedPatientResource(PATIENT_RESOURCE_W_DETAILS);
    expect(patient.id).not.toEqual(PATIENT_RESOURCE_W_DETAILS.id);
    expect(patient.name).not.toEqual(PATIENT_RESOURCE_W_DETAILS.name);
    expect(patient.identifier).not.toEqual(PATIENT_RESOURCE_W_DETAILS.identifier);
    expect(PATIENT_RESOURCE_W_DETAILS.id).toEqual('Patient2');
  });
  test('copy patient has new id for minimal patient', () => {
    const patient = createCopiedPatientResource(PATIENT_RESOURCE);
    expect(patient.id).not.toEqual(PATIENT_RESOURCE.id);
  });
});

describe('getRandomPeriodInPeriod', () => {
  beforeAll(() => jest.spyOn(global.Math, 'random').mockReturnValue(0));
  test('returns a random period within the given period', () => {
    const period = getRandomPeriodInPeriod(PERIOD_START, PERIOD_END);
    assertPeriodInPeriod(PERIOD_START, period);
  });
  afterAll(jest.clearAllMocks);
});

describe('getRandomDateInPeriod', () => {
  beforeAll(() => jest.spyOn(global.Math, 'random').mockReturnValue(0));
  test('returns a random date within the given period', () => {
    const date = getRandomDateInPeriod(PERIOD_START, PERIOD_END);
    expect(date.getTime()).toEqual(new Date(PERIOD_START).getTime());
    expect(date.getTime()).toBeLessThan(new Date(PERIOD_END).getTime());
  });
  afterAll(jest.clearAllMocks);
});

describe('jsDateToFHIRDate', () => {
  // TODO figure out how to accurately compare date to dateTime
  test.skip('converts a JS Date to a FHIR date string', () => {
    const date = jsDateToFHIRDate(new Date('PERIOD_START'));
    expect(date).toEqual('2020-01-01');
  });
});

describe('getDateType', () => {
  test('Returns date for date field', () => {
    const { validField, newPath } = getDateType(EXAMPLE_FIELD_DATE, EXAMPLE_PATH);
    expect(validField).toEqual('date');
    expect(newPath).toEqual(EXAMPLE_PATH);
  });
  test('Returns Period and updated path for choiceType with Period', () => {
    const { validField, newPath } = getDateType(EXAMPLE_FIELD_CHOICE_TYPE_PERIOD, EXAMPLE_PATH);
    expect(validField).toEqual('Period');
    expect(newPath).toEqual('testPathPeriod');
  });
  test('Returns dateTime and updated path for choiceType with dateTime', () => {
    const { validField, newPath } = getDateType(EXAMPLE_FIELD_CHOICE_TYPE_DATETIME, EXAMPLE_PATH);
    expect(validField).toEqual('dateTime');
    expect(newPath).toEqual('testPathDateTime');
  });
  test('Returns date and updated path for choiceType with date', () => {
    const { validField, newPath } = getDateType(EXAMPLE_FIELD_CHOICE_TYPE_DATE, EXAMPLE_PATH);
    expect(validField).toEqual('date');
    expect(newPath).toEqual('testPathDate');
  });
});

describe('getResourcePrimaryDates', () => {
  beforeAll(() => jest.spyOn(global.Math, 'random').mockReturnValue(0));
  test('DataRequirement with singular Period dateFilter on field that accepts Period', () => {
    const resource: fhir4.Condition = { resourceType: 'Condition', subject: { reference: 'testSubject' } };
    getResourcePrimaryDates(resource, EXAMPLE_DR_CHOICE_TYPE_PERIOD_TO_PERIOD, PERIOD_START, PERIOD_END);
    expect(resource.resourceType).toEqual('Condition');
    assertPeriodInPeriod(EXAMPLE_DR_CHOICE_TYPE_PERIOD_TO_PERIOD.dateFilter[0].valuePeriod.start, resource.onsetPeriod);
  });
  test('DataRequirement with singular dateTime dateFilter on field that accepts Period', () => {
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
  test('DataRequirement with singular Period dateFilter on field that accepts dateTime', () => {
    const resource: fhir4.Condition = { resourceType: 'Condition', subject: { reference: 'testSubject' } };
    getResourcePrimaryDates(resource, EXAMPLE_DR_PERIOD_TO_DATETIME, PERIOD_START, PERIOD_END);
    expect(resource.resourceType).toEqual('Condition');
    const dt = resource.recordedDate;
    if (!dt) {
      throw new Error('resource did not have defined dateTime for recordedDate');
    }
    expect(dt).toEqual(EXAMPLE_DR_PERIOD_TO_DATETIME.dateFilter[0].valuePeriod.start);
  });
  test('DataRequirement with singular dateTime dateFilter on field that accepts dateTime', () => {
    const resource: fhir4.Condition = { resourceType: 'Condition', subject: { reference: 'testSubject' } };
    getResourcePrimaryDates(resource, EXAMPLE_DR_DATETIME_TO_DATETIME, PERIOD_START, PERIOD_END);
    expect(resource.resourceType).toEqual('Condition');
    const dt = resource.recordedDate;
    expect(dt).toEqual(EXAMPLE_DR_DATETIME_TO_DATETIME.dateFilter[0].valueDateTime);
  });
  // TODO figure out how to accurately compare date to dateTime
  test.skip('DataRequirement with singular Period dateFilter on field that accepts date', () => {
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
  test.skip('DataRequirement with singular dateTime dateFilter on field that accepts date', () => {
    const resource: fhir4.Patient = { resourceType: 'Patient' };
    getResourcePrimaryDates(resource, EXAMPLE_DR_DATETIME_TO_DATE, PERIOD_START, PERIOD_END);
    expect(resource.resourceType).toEqual('Patient');
    const dt = resource.birthDate;
    expect(dt).toEqual('2019-01-01');
  });
  test('DataRequirement with multiple dateFilters', () => {
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
  test('DataRequirement with no dateFilters', () => {
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
