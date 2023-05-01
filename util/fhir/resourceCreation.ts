import { v4 as uuidv4 } from 'uuid';
import { getRandomFirstName, getRandomLastName } from '../randomizer';
import _ from 'lodash';
import { getResourcePrimaryDates } from './dates';
import { getResourcePatientReference } from './patient';
import { getResourceCode } from './codes';
import { Enums } from 'fqm-execution';

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
  copyResources: fhir4.BundleEntry[],
  oldPatientId: string,
  newPatientId: string
): fhir4.BundleEntry[] {
  const resources: fhir4.BundleEntry[] = copyResources.map(cr => {
    let entryString = JSON.stringify(cr);
    const idRegexp = new RegExp(`Patient/${oldPatientId}`, 'g');
    entryString = entryString.replace(idRegexp, `Patient/${newPatientId}`);
    const entry: fhir4.BundleEntry = JSON.parse(entryString);
    if (entry.resource) {
      const newResourceId = uuidv4();
      entry.resource.id = newResourceId;
      entry.fullUrl = `urn:uuid:${newResourceId}`;
    }

    // Note: this does not update potential cross-resource references, which we may want to support in the future
    return entry;
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
 * @param {Array} entries array of FHIR BundleEntries associated with the patient
 * @returns {String} representation of a FHIR patient bundle resource
 */
export function createPatientBundle(
  patient: fhir4.Patient,
  entries: fhir4.BundleEntry[],
  fullUrl?: string,
  testMeasureReport?: fhir4.MeasureReport
): fhir4.Bundle {
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
        },
        fullUrl: fullUrl ?? `urn:uuid:${patient.id}`
      }
    ]
  };
  entries.forEach(entry => {
    bundle.entry?.push({
      ...entry,
      request: {
        method: 'PUT',
        url: `${entry.resource?.resourceType}/${entry.resource?.id}`
      }
    });
  });
  if (testMeasureReport) {
    bundle.entry?.push({
      resource: testMeasureReport,
      request: {
        method: 'PUT',
        url: `MeasureReport/${testMeasureReport.id}`
      },
      fullUrl: `urn:uuid:${testMeasureReport.id}`
    });
  }
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

/**
 * Creates a FHIR cqfm test case MeasureReport from measure and subject data to be exported with associated patient
 * @param mb FHIR MeasureBundle
 * @param measurementPeriod FHIR Period representing the measurement period
 * @param subjectId the patient id the MeasureReport is associated with
 * @param desiredPopulations a list of desired population codes for the patient to fall into
 * @returns {fhir4.MeasureReport} a cqfm test case measure report associated with the patient and measure
 */
export function createCQFMTestCaseMeasureReport(
  mb: fhir4.Bundle,
  measurementPeriod: fhir4.Period,
  subjectId: string,
  desiredPopulations?: string[]
): fhir4.MeasureReport {
  const measure = mb?.entry?.find(e => e?.resource?.resourceType === 'Measure')?.resource as fhir4.Measure;
  const testGroup = generateTestCaseMRGroup(measure, desiredPopulations);
  const parametersId = uuidv4();
  return {
    resourceType: 'MeasureReport',
    id: uuidv4(),
    measure: measure.url as string,
    period: measurementPeriod,
    status: 'complete',
    type: 'individual',
    meta: {
      profile: ['http://hl7.org/fhir/us/cqfmeasures/StructureDefinition/test-case-cqfm']
    },
    extension: [
      {
        url: 'http://hl7.org/fhir/us/cqfmeasures/StructureDefinition/cqfm-inputParameters',
        valueReference: {
          reference: `#${parametersId}`
        }
      }
    ],
    modifierExtension: [
      {
        url: 'http://hl7.org/fhir/us/cqfmeasures/StructureDefinition/cqfm-isTestCase',
        valueBoolean: true
      }
    ],
    contained: [
      {
        resourceType: 'Parameters',
        id: parametersId,
        parameter: [
          {
            name: 'subject',
            // For now this is just the Patient id. May evolve as we learn more about cqfm-testCases
            valueString: subjectId
          }
        ]
      }
    ],
    group: testGroup
  };
}

/**
 * Takes in a Measure and desired populations array and produces the group property for a cqfm test case MeasureReport
 * @param measure a FHIR Measure resource
 * @param desiredPopulations a list of desired population codes for the patient to fall into
 * @returns an Array containing an object with a measure score and population object to be used as the group property in a cqfm test case MeasureReport
 */
export function generateTestCaseMRGroup(
  measure: fhir4.Measure,
  desiredPopulations?: string[]
): fhir4.MeasureReportGroup[] {
  let measureScore = 0;
  const testPops = measure?.group?.[0].population?.map(pop => {
    const newPop: fhir4.MeasureReportGroupPopulation = { code: pop.code };
    const popCode = pop.code?.coding?.[0].code;
    if (popCode && desiredPopulations && desiredPopulations.includes(popCode)) {
      newPop.count = 1;
      if (popCode === Enums.PopulationType.NUMER) {
        measureScore = 1;
      }
    } else {
      newPop.count = 0;
    }
    return newPop;
  });
  return [
    {
      population: testPops,
      measureScore: { value: measureScore }
    }
  ];
}
