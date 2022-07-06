import { createFHIRResourceString, getDataRequirementFiltersString, createPatientBundle } from '../../util/fhir';

const VS_MAP = { testvs: 'test vs name' };
const DATA_REQUIREMENT_WITH_NO_VALUE_SETS = {
  type: 'Observation',
  status: 'draft'
};
const DATA_REQUIREMENT_WITH_VALUE_SETS = {
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

// example data requirement for resource type with primaryCodeType FHIR.CodeableConcept
const OBSERVATION_DATA_REQUIREMENT_WITH_CODE_AND_VALUESET = {
  type: 'Observation',
  status: 'draft',
  codeFilter: [
    {
      path: 'code',
      valueSet: 'testvs'
    },
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

// example data requirement for resource type with primaryCodeType FHIR.Coding
const MESSAGEDEFINITION_DATA_REQUIREMENT = {
  type: 'MessageDefinition',
  status: 'draft',
  codeFilter: [
    {
      path: 'code',
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
      path: 'code',
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

describe('getDataRequirementFiltersString', () => {
  test('returns an empty string for resource with no valuesets', () => {
    expect(getDataRequirementFiltersString(DATA_REQUIREMENT_WITH_NO_VALUE_SETS, VS_MAP)).toEqual('');
  });
  test('returns name of valueset when codefilter includes valueset', () => {
    expect(getDataRequirementFiltersString(DATA_REQUIREMENT_WITH_VALUE_SETS, VS_MAP)).toEqual('test vs name (testvs)');
  });
  test('returns display when code filter is of path code', () => {
    expect(getDataRequirementFiltersString(DATA_REQUIREMENT_WITH_CODE, VS_MAP)).toEqual('test display');
  });
  test('returns display and name when both code and valueset exist', () => {
    expect(getDataRequirementFiltersString(OBSERVATION_DATA_REQUIREMENT_WITH_CODE_AND_VALUESET, VS_MAP)).toEqual(
      'test vs name (testvs)\ntest display'
    );
  });
});

describe('createFHIRResourceString', () => {
  test('returns populated FHIR resource for primaryCodeType FHIR.CodeableConcept', () => {
    const createdResource = createFHIRResourceString(
      OBSERVATION_DATA_REQUIREMENT_WITH_CODE_AND_VALUESET,
      TEST_MEASURE_BUNDLE
    );
    expect(JSON.parse(createdResource).code).toEqual({
      coding: {
        system: 'test-system',
        version: 'test-version',
        code: '123',
        display: 'test display'
      }
    });
  });
  test('returns populated FHIR resource for primaryCodeType FHIR.Coding', () => {
    const createdResource = createFHIRResourceString(MESSAGEDEFINITION_DATA_REQUIREMENT, TEST_MEASURE_BUNDLE);
    expect(JSON.parse(createdResource).event).toEqual({
      system: 'test-system',
      version: 'test-version',
      code: '123',
      display: 'test display'
    });
  });
  test('returns populated FHIR resource for primaryCodeType FHIR.code', () => {
    const createdResource = createFHIRResourceString(OPERATIONDEFINITION_DATA_REQUIREMENT, TEST_MEASURE_BUNDLE);
    expect(JSON.parse(createdResource).code).toEqual('123');
  });

  test('returns populated FHIR resource where primaryCodePath us 0..* or 1..* (multiple cardinality)', () => {
    const createdResource = createFHIRResourceString(ACTIVITYDEFINITION_DATA_REQUIREMENT, TEST_MEASURE_BUNDLE);
    expect(Array.isArray(JSON.parse(createdResource).topic));
  });

  test('returns populated FHIR resource where primaryCodePath is 0..1 or 1..1', () => {
    const createdResource = createFHIRResourceString(
      OBSERVATION_DATA_REQUIREMENT_WITH_CODE_AND_VALUESET,
      TEST_MEASURE_BUNDLE
    );
    expect(typeof JSON.parse(createdResource).code).toBe('object');
  });

  test('properly retrieves system/version/code/display when valueset has expansion', () => {
    const createdResource = createFHIRResourceString(
      OBSERVATION_DATA_REQUIREMENT_WITH_CODE_AND_VALUESET,
      TEST_MEASURE_BUNDLE_WITH_EXPANSION
    );
    expect(JSON.parse(createdResource).code).toEqual({
      coding: {
        system: 'test-system',
        version: 'test-version',
        code: '123',
        display: 'test display'
      }
    });
  });
});

const PATIENT_RESOURCE: fhir4.Patient = {
  resourceType: 'Patient',
  id: 'Patient1'
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
