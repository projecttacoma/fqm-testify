/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  getPatientDOBString,
  getPatientInfoString,
  getPatientNameString,
  getResourcePatientReference
} from '../../../util/fhir/patient';

const TEST_PATIENT_ID = 'test-id';

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
  ],
  birthDate: '1996-07-19'
};

const DR_WITH_SUBJECT: fhir4.DataRequirement = {
  type: 'Condition'
};

const DR_NO_SUBJECT: fhir4.DataRequirement = {
  type: 'Schedule' // uses 'actor' instead of subject
};

describe('getPatientInfoString', () => {
  it('should return patient name and date of birth in a concatenated string', () => {
    expect(getPatientInfoString(PATIENT_RESOURCE_W_DETAILS)).toEqual('John Smith (DOB: 1996-07-19)');
  });
});

describe('getPatientDOBString', () => {
  it('should return date of birth as string', () => {
    expect(getPatientDOBString(PATIENT_RESOURCE_W_DETAILS)).toEqual('DOB: 1996-07-19');
  });
});

describe('getPatientNameString', () => {
  it('should return the patient name', () => {
    expect(getPatientNameString(PATIENT_RESOURCE_W_DETAILS)).toEqual('John Smith');
  });
});

describe('getResourcePatientReference', () => {
  it('should use subject as reference when available', () => {
    const resource: any = {};
    getResourcePatientReference(resource, DR_WITH_SUBJECT, TEST_PATIENT_ID);

    expect(resource.subject).toBeDefined();
    expect(resource.subject).toEqual({
      reference: `Patient/${TEST_PATIENT_ID}`
    });
  });

  it('should use non-subject param without dot as a default', () => {
    const resource: any = {};
    getResourcePatientReference(resource, DR_NO_SUBJECT, TEST_PATIENT_ID);

    expect(resource.actor).toBeDefined();
    expect(resource.actor).toEqual({
      reference: `Patient/${TEST_PATIENT_ID}`
    });
  });
});
