import { MOCK_MEASURE_BUNDLE } from '../../../fixtures/test/measureBundle';
import {
  createCopiedPatientResource,
  createCopiedResources,
  createCQFMTestCaseMeasureReport,
  createFHIRResourceString,
  createPatientBundle,
  generateTestCaseMRGroup
} from '../../../util/fhir/resourceCreation';

const PERIOD_START = '2020-01-01T00:00:00.000Z';
const PERIOD_END = '2020-12-31T00:00:00.000Z';

const MOCK_MEASURE = MOCK_MEASURE_BUNDLE.content.entry?.find(e => e?.resource?.resourceType === 'Measure')
  ?.resource as fhir4.Measure;
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

const EXPECTED_CQFM_NO_POPS_OUTPUT = {
  resourceType: 'MeasureReport',
  id: expect.any(String),
  measure: 'test-measure-id',
  period: {
    start: PERIOD_START,
    end: PERIOD_END
  },
  status: 'complete',
  type: 'individual',
  meta: {
    profile: ['http://hl7.org/fhir/us/cqfmeasures/StructureDefinition/test-case-cqfm']
  },
  modifierExtension: [
    {
      url: 'http://hl7.org/fhir/us/cqfmeasures/StructureDefinition/cqfm-isTestCase',
      valueBoolean: true
    }
  ],
  contained: [
    {
      resourceType: 'Parameters',
      id: expect.any(String),
      parameter: [
        {
          name: 'subject',
          valueString: 'test-subject-id'
        }
      ]
    }
  ],
  group: [
    {
      population: [
        {
          count: 0,
          code: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/measure-population',
                code: 'initial-population',
                display: 'Initial Population'
              }
            ]
          }
        },
        {
          count: 0,
          code: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/measure-population',
                code: 'denominator',
                display: 'Denominator'
              }
            ]
          }
        },
        {
          count: 0,
          code: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/measure-population',
                code: 'numerator',
                display: 'Numerator'
              }
            ]
          }
        }
      ],
      measureScore: {
        value: 0
      }
    }
  ]
};

describe('createFHIRResourceString', () => {
  it('should return populated FHIR resource for primaryCodeType FHIR.CodeableConcept', () => {
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

  it('should return populated FHIR resource for primaryCodeType FHIR.Coding', () => {
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

  it('should return populated FHIR resource for codeType FHIR.code', () => {
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

  it('should return populated FHIR resource for choiceType codeable concept', () => {
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

  it('should return populated FHIR resource where primaryCodePath is 0..* or 1..* (multiple cardinality)', () => {
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

  it('should return populated FHIR resource where primaryCodePath is 0..1 or 1..1', () => {
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

  it('should return populated FHIR resource where subject is not the patient reference', () => {
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

  it('properly retrieves system/version/code/display when valueset has expansion', () => {
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
  it('should create a bundle with just a patient and no resources', () => {
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

  it('should create bundle with patient and resources', () => {
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
  it('should update references to a patient when cloned', () => {
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
  it('should change all identifying info on a patient when cloned', () => {
    const patient = createCopiedPatientResource(PATIENT_RESOURCE_W_DETAILS);
    expect(patient.id).not.toEqual(PATIENT_RESOURCE_W_DETAILS.id);
    expect(patient.name).not.toEqual(PATIENT_RESOURCE_W_DETAILS.name);
    expect(patient.identifier).not.toEqual(PATIENT_RESOURCE_W_DETAILS.identifier);
    expect(PATIENT_RESOURCE_W_DETAILS.id).toEqual('Patient2');
  });

  it('should change the id of a patient when cloned', () => {
    const patient = createCopiedPatientResource(PATIENT_RESOURCE);
    expect(patient.id).not.toEqual(PATIENT_RESOURCE.id);
  });
});

describe('generateTestCaseMRGroup', () => {
  it('returns a group array with all populations from MeasureReport', () => {
    const expectedGroups = generateTestCaseMRGroup(MOCK_MEASURE, []);
    expect(expectedGroups?.[0]?.population?.length).toEqual(3);
    const codes = expectedGroups?.[0]?.population?.map(g => g?.code?.coding?.[0]?.code);
    expect(codes).toEqual(['initial-population', 'denominator', 'numerator']);
    expectedGroups?.[0]?.population?.forEach(g => expect(g.count).toEqual(0));
    expect(expectedGroups?.[0]?.measureScore.value).toEqual(0);
  });
  it('returns a group array with all populations from MeasureReport and counts based on desired populations', () => {
    const expectedGroups = generateTestCaseMRGroup(MOCK_MEASURE, ['denominator', 'initial-population']);
    expect(expectedGroups?.[0]?.population?.length).toEqual(3);
    const codes = expectedGroups?.[0]?.population?.map(g => g?.code?.coding?.[0]?.code);
    expect(codes).toEqual(['initial-population', 'denominator', 'numerator']);
    expect(expectedGroups?.[0]?.population?.[0]?.count).toEqual(1);
    expect(expectedGroups?.[0]?.population?.[1]?.count).toEqual(1);
    expect(expectedGroups?.[0]?.population?.[2]?.count).toEqual(0);
    expect(expectedGroups?.[0]?.measureScore.value).toEqual(0);
  });
  it('returns a group array with all populations from MeasureReport and 1 for measure score when numerator desired', () => {
    const expectedGroups = generateTestCaseMRGroup(MOCK_MEASURE, ['denominator', 'initial-population', 'numerator']);
    expect(expectedGroups?.[0]?.population?.length).toEqual(3);
    const codes = expectedGroups?.[0]?.population?.map(g => g?.code?.coding?.[0]?.code);
    expect(codes).toEqual(['initial-population', 'denominator', 'numerator']);
    expect(expectedGroups?.[0]?.population?.[0]?.count).toEqual(1);
    expect(expectedGroups?.[0]?.population?.[1]?.count).toEqual(1);
    expect(expectedGroups?.[0]?.population?.[2]?.count).toEqual(1);
    expect(expectedGroups?.[0]?.measureScore.value).toEqual(1);
  });
});
describe('generateTestCaseMRGroup', () => {
  it('createCQFMTestCaseMeasureReport produces properly formatted test measure report', () => {
    const cqfmTestMeasureReport = createCQFMTestCaseMeasureReport(
      MOCK_MEASURE_BUNDLE.content,
      { start: PERIOD_START, end: PERIOD_END },
      'test-subject-id',
      []
    );
    expect(cqfmTestMeasureReport).toEqual(EXPECTED_CQFM_NO_POPS_OUTPUT);
  });
});
