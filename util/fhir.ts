import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { generateRandomFirstName, generateRandomLastName } from './randomizer';
import { ValueSetsMap } from '../state/selectors/valueSetsMap';
import { DataRequirement, DataRequirementCodeFilter } from 'fhir/r3';
import { parsedPrimaryCodePaths } from './primaryCodePaths';
import _ from 'lodash';

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

export function createFHIRResourceString(dr: fhir4.DataRequirement, mb: fhir4.Bundle | null): string {
  console.log(dr);
  const id = uuidv4();
  const resource: any = {
    resourceType: dr.type,
    id
  };

  // resource data retrieved from the data requirements
  // TODO: this is wrong
  dr.codeFilter?.forEach(cf => {
    if (!cf.valueSet && cf.path) {
      resource[cf.path] = cf.code
    }
  })

  // resource data retrieved from parsed primary code path script
  const vsUrl = dr.codeFilter?.filter(cf => cf.valueSet)[0].valueSet;
  const vsResource = mb?.entry?.filter(r => r.resource?.resourceType === "ValueSet" && r.resource?.url === vsUrl)[0].resource as fhir4.ValueSet;
  const include = _.sample(vsResource?.compose?.include);
  // from the random include, get the random code and display from concept, and then optionally
  // pair it with the include.system and include.version if needed
  const codeDisplay = _.sample(include?.concept)
  const primaryCodePath = parsedPrimaryCodePaths[dr.type].primaryCodePath;
  const primaryCodeType = parsedPrimaryCodePaths[dr.type].primaryCodeType;

  let value;
  if (primaryCodeType === 'FHIR.CodeableConcept') {
    value = {
      coding: {
        system: include?.system,
        version: include?.version,
        code: codeDisplay?.code,
        display: codeDisplay?.display
      },
      text: ''
    };
  } else if (primaryCodeType === 'FHIR.Coding') {
    value = {
      system: include?.system,
      version: include?.version,
      code: codeDisplay?.code,
      display: codeDisplay?.display
    };
  } else if (primaryCodeType === 'FHIR.code') {
    value = codeDisplay?.code;
  } else {
    value = null;
  }

  // TODO simplify this
  if (parsedPrimaryCodePaths[dr.type].multipleCardinality) {
    resource[primaryCodePath] = [value];
  } else {
    resource[primaryCodePath] = value;
  }
  return JSON.stringify(resource, null, 2);
}
