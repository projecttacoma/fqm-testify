import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { generateRandomFirstName, generateRandomLastName } from './randomizer';

export function createPatientResourceString(birthDate: string): string {
  const id = uuidv4();

  // NOTE: should add non-binary genders in the future
  // when the binary argument is `true`, faker returns "Male" or "Female"
  // lowercase the result and cast it so FHIR types are happy
  const gender = faker.name.gender(true).toLowerCase() as 'male' | 'female';

  const pt: fhir4.Patient = {
    resourceType: 'Patient',
    id,
    identifier: [
      {
        use: 'usual',
        system: 'http://example.com/test-id',
        value: `test-patient-${id}`
      }
    ],
    name: [
      {
        family: generateRandomLastName(),
        given: [generateRandomFirstName(gender)]
      }
    ],
    gender,
    birthDate
  };

  return JSON.stringify(pt, null, 2);
}

export function getPatientInfoString(patient: fhir4.Patient) {
  return `${patient.name?.[0]?.given?.join(' ')} ${patient.name?.[0]?.family} (DOB: ${patient.birthDate})`;
}
