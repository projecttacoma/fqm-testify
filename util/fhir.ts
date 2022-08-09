import { v4 as uuidv4 } from 'uuid';
import { getRandomFirstName, getRandomLastName } from './randomizer';
import { ValueSetsMap } from '../state/selectors/valueSetsMap';
import { parsedPrimaryCodePaths } from './primaryCodePaths';
import _ from 'lodash';
import { ReferencesMap } from './referencesMap';

export function createPatientResourceString(birthDate: string): string {
  const id = uuidv4();

  // NOTE: should add non-binary genders in the future
  const gender = Math.random() < 0.5 ? 'male' : 'female';

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
        family: getRandomLastName(),
        given: [getRandomFirstName(gender)]
      }
    ],
    gender,
    birthDate
  };

  return JSON.stringify(pt, null, 2);
}

export function getPatientInfoString(patient: fhir4.Patient) {
  return `${getPatientNameString(patient)} (DOB: ${patient.birthDate})`;
}

export function getPatientNameString(patient: fhir4.Patient) {
  return `${patient.name?.[0]?.given?.join(' ')} ${patient.name?.[0]?.family}`;
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

/**
 * Creates a string representing a patient bundle resource. Creates using a patient resource and
 * an array of the patient's associated resources
 * @param {Object} patient FHIR Patient object
 * @param {Array} resources array of FHIR resources associated with the patient
 * @returns {String} representation of a FHIR patient bundle resource
 */
export function createPatientBundle(patient: fhir4.Patient, resources: fhir4.FhirResource[]): fhir4.Bundle {
  const bundle: fhir4.Bundle = {
    type: 'transaction',
    resourceType: 'Bundle',
    id: uuidv4(),
    entry: [
      {
        resource: patient,
        request: {
          method: 'PUT',
          url: `Patient/${patient.id}`
        }
      }
    ]
  };
  resources.forEach(resource => {
    const entry: fhir4.BundleEntry = {
      resource: resource,
      request: {
        method: 'PUT',
        url: `${resource.resourceType}/${resource.id}`
      }
    };
    bundle.entry?.push(entry);
  });
  return bundle;
}

/**
 * Creates incomplete FHIR resource with generated ID, information populated from the provided data requirements,
 * and code information populated from a randomly selected expanded ValueSet (obtained from the given measure bundle)
 * @param dr FHIR DataRequirement object
 * @param mb FHIR measure bundle
 * @returns {String} incomplete FHIR resource that will appear as initial value in code editor
 */
export function createFHIRResourceString(
  dr: fhir4.DataRequirement,
  mb: fhir4.Bundle,
  patientId: string | null
): string {
  const resource: any = {
    resourceType: dr.type,
    id: uuidv4()
  };

  // resource properties retrieved from data requirements
  dr.codeFilter?.forEach(cf => {
    if (!cf.valueSet && cf.path && cf.code) {
      resource[cf.path] = cf.code[0].code;
    }
  });

  // resource properties retrieved from parsed primary code path script
  const vsUrl = dr.codeFilter?.filter(cf => cf.valueSet)[0].valueSet;
  const vsResource = mb?.entry?.filter(r => r.resource?.resourceType === 'ValueSet' && r.resource?.url === vsUrl)[0]
    .resource as fhir4.ValueSet;

  // assume ValueSet resource will either contain compose or expansion
  let system, version, display, code;
  if (vsResource?.expansion?.contains) {
    // randomly select ValueSetExpansionContains to add to resource
    const contains = _.sample(vsResource.expansion.contains);
    ({ system, version, code, display } = contains || {});
  } else if (vsResource?.compose) {
    // randomly select ValueSetComposeInclude to add to resource
    const include = _.sample(vsResource.compose.include);
    // randomly select concept from ValueSetComposeInclude to add to resource
    const codeAndDisplay = _.sample(include?.concept);
    ({ system, version } = include || {});
    ({ code, display } = codeAndDisplay || {});
  }

  const primaryCodePath = parsedPrimaryCodePaths[dr.type].primaryCodePath;
  const primaryCodeType = parsedPrimaryCodePaths[dr.type].primaryCodeType;

  const coding = {
    system,
    version,
    code,
    display
  };

  let codeData: fhir4.CodeableConcept | fhir4.Coding | string | null | undefined;
  if (primaryCodeType === 'FHIR.CodeableConcept') {
    codeData = {
      // Need to add coding as an array for codeable concept
      coding: [coding]
    };
  } else if (primaryCodeType === 'FHIR.Coding') {
    codeData = coding;
  } else if (primaryCodeType === 'FHIR.code') {
    codeData = code;
  } else {
    codeData = null;
  }

  resource[primaryCodePath] = parsedPrimaryCodePaths[dr.type].multipleCardinality ? [codeData] : codeData;

  // determine if we should add a reference to the patient
  if (ReferencesMap[dr.type] && patientId) {
    // add if subject is in the list otherwise add it on the first one
    if (ReferencesMap[dr.type].includes('subject')) {
      resource.subject = { reference: `Patient/${patientId}` };
    } else if (ReferencesMap[dr.type][0] && !ReferencesMap[dr.type][0].includes('.')) {
      resource[ReferencesMap[dr.type][0]] = { reference: `Patient/${patientId}` };
    }
  }

  return JSON.stringify(resource, null, 2);
}
