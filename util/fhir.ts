import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { generateRandomFirstName, generateRandomLastName } from './randomizer';
import { ValueSetsMap } from '../state/selectors/valueSetsMap';
import { DataRequirement, DataRequirementCodeFilter } from 'fhir/r3';
import { parsedPrimaryCodePaths } from './primaryCodePaths';

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
      acc.push(`${valueSetMap[e.valueSet]} (${e.valueSet})`);
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

export function createFHIRResourceString(dr: fhir4.DataRequirement): string {
  const id = uuidv4();
  // TODO: rebase and bring in parsed info from script
  // for now, just hardcode the primaryCodePath and type
  const primaryCodePath = parsedPrimaryCodePaths[dr.type].primaryCodePath;
  //const test: fhir4.CodeableConcept
  // TODO: figure out if we can use fhir4.Resource ??
  const resource: any = {
    resourceType: dr.type,
    id
  };
  // make a variable to be the value of the primaryCodePath
  // based on what the primaryCodeType is
  resource[primaryCodePath] = 'test';
  return JSON.stringify(resource, null, 2);
}
