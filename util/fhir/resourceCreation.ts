import { v4 as uuidv4 } from 'uuid';
import { getRandomFirstName, getRandomLastName } from '../randomizer';
import _ from 'lodash';
import { getResourcePrimaryDates } from './dates';
import { getResourcePatientReference } from './patient';
import { getResourceCode } from './codes';

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

/**
 * Creates copies of all passed in resources (without references maintained) and gives them
 * new resource ids. Replaces all patient references to the patient oldId with newId
 * @param copyResources {fhir4.FhirResource[]} array of fhir resources to be copied
 * @param oldId {String} a patient id that the copyResources may reference
 * @param newId {String} a patient id that should replace oldId in references
 * @returns {fhir4.FhirResource[]} array of new resource copies
 */
export function createCopiedResources(
  copyResources: fhir4.FhirResource[],
  oldId: string,
  newId: string
): fhir4.FhirResource[] {
  const resources: fhir4.FhirResource[] = copyResources.map(cr => {
    let resourceString = JSON.stringify(cr);
    const idRegexp = new RegExp(`Patient/${oldId}`, 'g');
    resourceString = resourceString.replace(idRegexp, `Patient/${newId}`);
    const resource: fhir4.FhirResource = JSON.parse(resourceString);
    resource.id = uuidv4();
    // Note: this does not update potential cross-resource references, which we may want to support in the future
    return resource;
  });
  return resources;
}

/**
 * Creates a copy of the passed in patient object (without references maintained) and updates the
 * id and identifier as well as creating a new name to differentiate the new patient copy
 * @param copyPatient {fhir4.Patient} a fhir Patient object to copy
 * @returns {fhir4.Patient} the new fhir patient copy
 */
export function createCopiedPatientResource(copyPatient: fhir4.Patient): fhir4.Patient {
  const patient: fhir4.Patient = _.cloneDeep(copyPatient);
  const identifier = patient.identifier?.find(id => id.system === 'http://example.com/test-id');
  patient.id = uuidv4();
  if (identifier) {
    identifier.value = `test-patient-${patient.id}`;
  } else {
    const newIdentifier: fhir4.Identifier = {
      use: 'usual',
      system: 'http://example.com/test-id',
      value: `test-patient-${patient.id}`
    };
    if (patient.identifier) {
      patient.identifier.push(newIdentifier);
    } else {
      patient.identifier = [newIdentifier];
    }
  }
  if (patient.name && patient.name.length > 0) {
    patient.name[0] = {
      family: getRandomLastName(),
      given: [getRandomFirstName(patient.gender === 'male' ? 'male' : 'female')] // future should handle non-binary
    };
  }
  return patient;
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
  patientId: string | null,
  mpStart: string,
  mpEnd: string
): string {
  const resource: any = {
    resourceType: dr.type,
    id: uuidv4()
  };
  getResourceCode(resource, dr, mb);
  getResourcePatientReference(resource, dr, patientId);
  getResourcePrimaryDates(resource, dr, mpStart, mpEnd);
  return JSON.stringify(resource, null, 2);
}
