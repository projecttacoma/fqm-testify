import {
  ensureQicorePatientProfile,
  ensureQicoreProfile,
  QICORE_PATIENT_PROFILE,
  QICORE_PROFILE_BY_RESOURCE_TYPE
} from '../../util/phenoml';

describe('phenoml utilities', () => {
  it('should add the QI-Core Patient profile when patient meta is missing', () => {
    const patient: fhir4.Patient = {
      resourceType: 'Patient',
      id: 'test-patient'
    };

    expect(ensureQicorePatientProfile(patient).meta?.profile).toEqual([QICORE_PATIENT_PROFILE]);
  });

  it('should add the QI-Core Patient profile without removing existing profiles', () => {
    const existingProfile = 'http://example.com/fhir/StructureDefinition/example-patient';
    const patient: fhir4.Patient = {
      resourceType: 'Patient',
      id: 'test-patient',
      meta: {
        profile: [existingProfile]
      }
    };

    expect(ensureQicorePatientProfile(patient).meta?.profile).toEqual([existingProfile, QICORE_PATIENT_PROFILE]);
  });

  it('should not duplicate the QI-Core Patient profile when it already exists', () => {
    const patient: fhir4.Patient = {
      resourceType: 'Patient',
      id: 'test-patient',
      meta: {
        profile: [QICORE_PATIENT_PROFILE]
      }
    };

    expect(ensureQicorePatientProfile(patient).meta?.profile).toEqual([QICORE_PATIENT_PROFILE]);
  });

  it('should add the matching QI-Core profile for non-Patient resources', () => {
    const condition: fhir4.Condition = {
      resourceType: 'Condition',
      id: 'test-condition',
      subject: {
        reference: 'Patient/test-patient'
      }
    };

    expect(ensureQicoreProfile(condition).meta?.profile).toEqual([QICORE_PROFILE_BY_RESOURCE_TYPE.Condition]);
  });

  it('should preserve an existing specific QI-Core profile for resource types with multiple profiles', () => {
    const existingProfile = 'http://hl7.org/fhir/us/qicore/StructureDefinition/qicore-condition-encounter-diagnosis';
    const condition: fhir4.Condition = {
      resourceType: 'Condition',
      id: 'test-condition',
      meta: {
        profile: [existingProfile]
      },
      subject: {
        reference: 'Patient/test-patient'
      }
    };

    expect(ensureQicoreProfile(condition).meta?.profile).toEqual([existingProfile]);
  });

  it('should not add a QI-Core profile when the resource type is not mapped', () => {
    const basic: fhir4.Basic = {
      resourceType: 'Basic',
      id: 'test-basic',
      code: {
        text: 'Test basic resource'
      }
    };

    expect(ensureQicoreProfile(basic).meta?.profile).toBeUndefined();
  });
});
