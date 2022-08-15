import { v4 as uuidv4 } from 'uuid';
import { getRandomFirstName, getRandomLastName } from './randomizer';
import { ValueSetsMap } from '../state/selectors/valueSetsMap';
import { parsedPrimaryCodePaths } from './primaryCodePaths';
import { parsedPrimaryDatePaths } from './primaryDatePaths';
import _ from 'lodash';
import { ReferencesMap } from './referencesMap';
import fhirpath from 'fhirpath';

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
 * Identifies the primary code path of a resource and constructs a string which displays
 * resource summary information depending on what is a available
 * @param resource {fhir4.Resource} a fhir Resource object
 * @returns {String} displaying the code and display text, code, or id of the resource or nothing
 */
export function getFhirResourceSummary(resource: fhir4.Resource) {
  const primaryCodePath = parsedPrimaryCodePaths[resource.resourceType]?.primaryCodePath;

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
  patientId: string | null,
  mpStart: string,
  mpEnd: string
): string {
  const resource: any = {
    resourceType: dr.type,
    id: uuidv4()
  };
  getResourcePrimaryCode(resource, dr, mb);
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

function getResourcePrimaryCode(resource: any, dr: fhir4.DataRequirement, mb: fhir4.Bundle) {
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
}

function getResourcePrimaryDates(resource: any, dr: fhir4.DataRequirement, mpStart: string, mpEnd: string) {
  const rt = dr.type;
  const primaryDateInfo = parsedPrimaryDatePaths[rt];
  if (primaryDateInfo) {
    if (dr.dateFilter && dr.dateFilter.length > 0) {
      dr.dateFilter?.forEach(df => {
        // pull path off date filter
        let path = df.path?.split('.')[0] ?? '';
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
              resource[newPath] = getRandomPeriodInPeriod(mpStart, mpEnd);
              // pick random date within the measurement period and make a 1-day period
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

function getDateType(fieldTypeInfo: any, path: string) {
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

function getRandomDateInPeriod(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  endDate.setDate(endDate.getDate() - 1);

  var date = new Date(+startDate + Math.random() * (endDate.getTime() - startDate.getTime()));
  return date;
}

function jsDateToFHIRDate(date: Date) {
  const year = date.getFullYear();
  // month is 0 indexed
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${date.getFullYear()}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
}

function getRandomPeriodInPeriod(start: string, end: string): fhir4.Period {
  const periodStart = getRandomDateInPeriod(start, end);
  const periodEnd = new Date(periodStart);
  periodEnd.setDate(periodEnd.getDate() + DEFAULT_PERIOD_LENGTH);
  return {
    start: periodStart.toISOString(),
    end: periodEnd.toISOString()
  };
}

const EXAMPLE_DR = {
  type: 'Condition',
  codeFilter: [
    {
      path: 'type',
      valueSet: 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.101.12.1016'
    },
    {
      path: 'status',
      code: [
        {
          code: 'finished',
          system: 'http://hl7.org/fhir/encounter-status'
        }
      ]
    }
  ],
  dateFilter: [
    {
      path: 'onset',
      valuePeriod: {
        start: '2019-01-01T00:00:00.000Z',
        end: '2019-12-31T00:00:00.000Z'
      }
    },
    {
      path: 'onset2',
      valueDateTime: '2019-01-01T00:00:00.000Z'
    },
    {
      path: 'onset3',
      valueDuration: {}
    },
    {
      path: 'recordedDate',
      valuePeriod: {
        start: '2019-01-01T00:00:00.000Z',
        end: '2019-12-31T00:00:00.000Z'
      }
    },
    {
      path: 'recordedDate2',
      valueDateTime: '2019-12-31T00:00:00.000Z'
    },
    {
      path: 'recordedDate3',
      valueDuration: {}
    },
    {
      path: 'test',
      valuePeriod: {
        start: '2019-01-01T00:00:00.000Z',
        end: '2019-12-31T00:00:00.000Z'
      }
    },
    {
      path: 'test2',
      valueDateTime: '2019-01-01T00:00:00.000Z'
    },
    {
      path: 'test3',
      valueDuration: {}
    }
  ],
  extension: [
    {
      url: 'http://hl7.org/fhir/us/cqfmeasures/StructureDefinition/cqfm-fhirQueryPattern',
      valueString:
        '/Encounter?type:in=http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.101.12.1016&status=finished&date=ge2019-01-01T00:00:00.000Z&date=le2019-12-31T00:00:00.000Z&subject=Patient/{{context.patientId}}'
    }
  ]
};
