import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { generateRandomFirstName, generateRandomLastName } from './randomizer';
import { ValueSetsMap } from '../state/selectors/valueSetsMap';
import { DataRequirement, DataRequirementCodeFilter } from 'fhir/r3';

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

/**
 * Identifies the valuesets referenced in a DataRequirement and constructs a string which displays
 * those valuesets
 * @param dr {Object} a fhir DataRequirement object
 * @param valueSetsMap {Object} a mapping of valueset urls to valueset names and titles
 * @returns {String} displaying the valuesets referenced by a DataRequirement
 */
export function getDataRequirementFiltersString(dr: fhir4.DataRequirement, valueSetMap: ValueSetsMap): string {
  const valueSets = dr.codeFilter?.reduce((acc: string[], e) => {
    if (e.valueSet) {
      acc.push(valueSetMap[e.valueSet]);
    }
    if (e.path === 'code' && e.code) {
      acc.push(...e.code.map(c => c.display ?? 'Un-named Code'));
    }
    return acc;
  }, []);
  if (valueSets) {
    return `${valueSets?.join('\n')}`;
  }
  return '';
}
