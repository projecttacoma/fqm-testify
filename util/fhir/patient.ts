import { ReferencesMap } from '../referencesMap';

export function getPatientInfoString(patient: fhir4.Patient) {
  return `${getPatientNameString(patient)} (${getPatientDOBString(patient)})`;
}

export function getPatientDOBString(patient: fhir4.Patient) {
  return `DOB: ${patient.birthDate}`;
}

export function getPatientNameString(patient: fhir4.Patient) {
  return `${patient.name?.[0]?.given?.join(' ')} ${patient.name?.[0]?.family}`;
}

export function getResourcePatientReference(resource: any, dr: fhir4.DataRequirement, patientId: string | null) {
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
