import { v4 as uuidv4 } from 'uuid';
import { getRandomFirstName, getRandomLastName } from './randomizer';
import { ValueSetsMap } from '../state/selectors/valueSetsMap';
import { parsedPrimaryDatePaths } from './primaryDatePaths';
import { parsedCodePaths } from './codePaths';
import _ from 'lodash';
import { ReferencesMap } from './referencesMap';
import fhirpath from 'fhirpath';
import { dateFieldInfo } from '../scripts/parsePrimaryDatePath';

const DEFAULT_PERIOD_LENGTH = 1;

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
 * Identifies the primary code path of a resource and constructs a string which displays
 * resource summary information depending on what is a available. If a resource
 * does not include a path for it's primaryCodePath, then it finds a path on that resource
 * that has coding (if available) and display resource summary information depending on
 * what is available.
 * @param resource {fhir4.Resource} a fhir Resource object
 * @returns {String} displaying the code and display text, code, or id of the resource or nothing
 */
export function getFhirResourceSummary(resource: fhir4.Resource) {
  let primaryCodePath = parsedCodePaths[resource.resourceType]?.primaryCodePath;

  if (fhirpath.evaluate(resource, `${primaryCodePath}.coding`)[0] === undefined) {
    const paths = parsedCodePaths[resource.resourceType]?.paths;
    for (const p in paths) {
      if (fhirpath.evaluate(resource, `${p}.coding`)[0]) {
        primaryCodePath = p;
      }
    }
  }

  if (primaryCodePath) {
    const primaryCoding = fhirpath.evaluate(resource, `${primaryCodePath}.coding`)[0];
    const resourceCode = primaryCoding?.code;
    const resourceDisplay = primaryCoding?.display;

    if (resourceCode && resourceDisplay) {
      return `(${resourceCode}: ${resourceDisplay})`;
    } else if (resourceCode) {
      return `(${resourceCode})`;
    } else if (resourceDisplay) {
      return `(${resourceDisplay})`;
    }
  }

  if (resource.id) {
    return `(${resource.id})`;
  } else {
    return '';
  }
}

export function getPatientInfoString(patient: fhir4.Patient) {
  return `${getPatientNameString(patient)} (${getPatientDOBString(patient)})`;
}

export function getPatientDOBString(patient: fhir4.Patient) {
  return `DOB: ${patient.birthDate}`;
}

export function getPatientNameString(patient: fhir4.Patient) {
  return `${patient.name?.[0]?.given?.join(' ')} ${patient.name?.[0]?.family}`;
}

/**
 * Identifies the valuesets referenced in a DataRequirement and constructs a string which displays
 * those valuesets. If a DataRequirement does not reference a valueset, then a string of the direct reference
 * code and display is constructed.
 * @param dr {Object} a fhir DataRequirement object
 * @param valueSetsMap {Object} a mapping of valueset urls to valueset names and titles
 * @returns {String} displaying the valuesets referenced by a DataRequirement or the direct reference code and display
 */
export function getDataRequirementFiltersString(dr: fhir4.DataRequirement, valueSetMap: ValueSetsMap): string {
  const valueSets = dr.codeFilter?.reduce((acc: string[], e) => {
    if (e.valueSet) {
      acc.push(`${valueSetMap[e.valueSet]} (${e.valueSet})`);
    }
    if (e.code) {
      const directCodes = e.code.filter(c => c.display);
      acc.push(...directCodes.map(c => `${c.code}: ${c.display}`));
    }
    return acc;
  }, []);
  if (valueSets && valueSets.length > 0) {
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

function getResourcePatientReference(resource: any, dr: fhir4.DataRequirement, patientId: string | null) {
  // determine if we should add a reference to the patient
  if (ReferencesMap[dr.type] && patientId) {
    // add if subject is in the list otherwise add it on the first one
    if (ReferencesMap[dr.type].includes('subject')) {
      resource.subject = { reference: `Patient/${patientId}` };
    } else if (ReferencesMap[dr.type][0] && !ReferencesMap[dr.type][0].includes('.')) {
      resource[ReferencesMap[dr.type][0]] = { reference: `Patient/${patientId}` };
    }
  }
}

function getResourceCode(resource: any, dr: fhir4.DataRequirement, mb: fhir4.Bundle) {
  // go through each of the elements in the codeFilter array on the data requirement, if it exists

  dr.codeFilter?.forEach(cf => {
    let system, version, display, code;
    let path = cf.path;
    // check to see if the code filter has a value set
    if (cf.valueSet) {
      const vsResource = mb?.entry?.filter(
        r => r.resource?.resourceType === 'ValueSet' && r.resource?.url === cf.valueSet
      )[0].resource as fhir4.ValueSet;

      // assume ValueSet resource will either contain compose or expansion
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
    } else {
      // it doesn't have a valueSet, see if there is a direct reference code
      const directCode = cf.code as fhir4.Coding[];
      ({ system, version, code, display } = directCode[0] || {});
    }

    if (path) {
      if (parsedCodePaths[dr.type].paths[path] !== undefined) {
        const codeType = parsedCodePaths[dr.type].paths[path].codeType;
        const coding = {
          system,
          version,
          code,
          display
        };
        let codeData: fhir4.CodeableConcept | fhir4.Coding | string | null | undefined;
        const multipleCardinality: boolean = parsedCodePaths[dr.type].paths[path].multipleCardinality;
        if (codeType === 'FHIR.CodeableConcept') {
          if (parsedCodePaths[dr.type].paths[path].choiceType === true) {
            path += 'CodeableConcept';
          }
          // Need to add coding as an array for codeable concept
          codeData = {
            coding: [coding]
          };
        } else if (codeType === 'FHIR.Coding') {
          if (parsedCodePaths[dr.type].paths[path].choiceType === true) {
            path += 'Coding';
          }
          codeData = coding;
        } else if (codeType === 'FHIR.code') {
          if (parsedCodePaths[dr.type].paths[path].choiceType === true) {
            path += 'Code';
          }
          codeData = code;
        } else {
          codeData = null;
        }
        resource[path] = multipleCardinality ? [codeData] : codeData;
      }
    }
  });
}

/**
 * Parses the primary date path info and populates date info to satisfy date filter specified in the passed-in data requirement
 * @param {Object} resource FHIR resource being created
 * @param {Object} dr a FHIR dataRequirement object
 * @param {String} mpStart the start of the specified measurement period
 * @param {String} mpEnd the end of the specified measurement period
 */
export function getResourcePrimaryDates(resource: any, dr: fhir4.DataRequirement, mpStart: string, mpEnd: string) {
  const rt = dr.type;
  const primaryDateInfo = parsedPrimaryDatePaths[rt];
  if (primaryDateInfo) {
    if (dr.dateFilter && dr.dateFilter.length > 0) {
      dr.dateFilter?.forEach(df => {
        // pull path off date filter
        const path = df.path?.split('.')[0] ?? '';
        // check if path exists on primary date info
        if (Object.keys(primaryDateInfo).includes(path)) {
          const fieldTypeInfo = primaryDateInfo[path];
          // check for allowed types for value with priority (Period => dateTime => date)
          const { validField, newPath } = getDateType(fieldTypeInfo, path);
          if (validField === 'Period') {
            if (df.valuePeriod) {
              // pick random 1-day period in period
              resource[newPath] = getRandomPeriodInPeriod(
                df.valuePeriod?.start ?? mpStart,
                df.valuePeriod?.end ?? mpEnd
              );
            } else if (df.valueDateTime) {
              // use dateTime as periodStart and periodEnd of resource
              resource[newPath] = { start: df.valueDateTime, end: df.valueDateTime };
            } else {
              // pick random period within the measurement period and make a 1-day period
              resource[newPath] = getRandomPeriodInPeriod(mpStart, mpEnd);
            }
          } else if (validField === 'dateTime') {
            if (df.valuePeriod) {
              // pick random dateTime within the period
              resource[newPath] = getRandomDateInPeriod(
                df.valuePeriod?.start ?? mpStart,
                df.valuePeriod?.end ?? mpEnd
              ).toISOString();
            } else if (df.valueDateTime) {
              // use valueDateTime
              resource[newPath] = df.valueDateTime;
            } else {
              // pick random dateTime within the measurement period
              resource[newPath] = getRandomDateInPeriod(mpStart, mpEnd).toISOString();
            }
          } else if (validField === 'date') {
            if (df.valuePeriod) {
              // pick random date in period
              const date = getRandomDateInPeriod(df.valuePeriod?.start ?? mpStart, df.valuePeriod?.end ?? mpEnd);
              resource[newPath] = jsDateToFHIRDate(date);
            } else if (df.valueDateTime) {
              // use valueDateTime and strip timezone
              resource[newPath] = jsDateToFHIRDate(new Date(df.valueDateTime));
            } else {
              //pick random date within the measurement period
              const date = getRandomDateInPeriod(mpStart, mpEnd);
              resource[newPath] = jsDateToFHIRDate(date);
            }
          }
        }
      });
      // If no date filters, fill all fields that can accept Period, dateTime, or date with valid entries in mp
    } else {
      Object.keys(primaryDateInfo).forEach(path => {
        const fieldTypeInfo = primaryDateInfo[path];
        const { validField, newPath } = getDateType(fieldTypeInfo, path);
        if (validField === 'Period') {
          resource[newPath] = getRandomPeriodInPeriod(mpStart, mpEnd);
        } else if (validField === 'dateTime') {
          resource[newPath] = getRandomDateInPeriod(mpStart, mpEnd).toISOString();
        } else {
          resource[newPath] = getRandomDateInPeriod(mpStart, mpEnd).toISOString();
        }
      });
    }
  }
}

/**
 * Determines the ideal date info type and path to populate a given attribute with date info
 * @param {Object} fieldTypeInfo object containing information on date types the specified field can accept
 * @param {String} path the attribute name that needs to be populated with date info
 * @returns {Object} an object containing the newPath to enter date info and the ideal date info type
 */
export function getDateType(fieldTypeInfo: dateFieldInfo, path: string) {
  let validField;
  let newPath = path;
  if (fieldTypeInfo.isChoiceType) {
    // prioritize date type Period > dateTime > date
    validField = fieldTypeInfo.dataTypes.reduce((acc: string, e: string) => {
      if (acc === 'Period' || e === 'Period') {
        return 'Period';
      } else if (e === 'dateTime') {
        return 'dateTime';
      }
      return acc;
    }, 'date');
    // for choiceTypes append the capitalized dateType to the field (ex. effectivePeriod)
    newPath = `${path}${validField.charAt(0).toUpperCase() + validField.slice(1)}`;
  } else {
    validField = fieldTypeInfo.dataTypes[0];
  }
  return { validField, newPath };
}

/**
 * Creates a JS date at a random time within the specified period
 * @param {String} start start date string for the period
 * @param {String} end end date string for the period
 * @returns {Date} a js date object within the specified period
 */
export function getRandomDateInPeriod(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  endDate.setDate(endDate.getDate() - 1);

  const date = new Date(+startDate + Math.random() * (endDate.getTime() - startDate.getTime()));
  return date;
}

/**
 * Converts a JS date to a FHIR date string
 * @param {Date} date JS date to be converted
 * @returns {String} a string representing a FHIR date
 */
export function jsDateToFHIRDate(date: Date) {
  const year = date.getFullYear();
  // month is 0 indexed
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
}

/**
 * Takes in the start and end points of a period and returns a FHIR Period that takes place within the specified dates
 * @param {string} start start date string for the period
 * @param {string} end end date string for the period
 * @returns {Object} a FHIR Period with length equal to the default period length that takes place within the passed-in period
 */
export function getRandomPeriodInPeriod(start: string, end: string): fhir4.Period {
  const periodStart = getRandomDateInPeriod(start, end);
  const periodEnd = new Date(periodStart);
  periodEnd.setDate(periodEnd.getDate() + DEFAULT_PERIOD_LENGTH);
  return {
    start: periodStart.toISOString(),
    end: periodEnd.toISOString()
  };
}
