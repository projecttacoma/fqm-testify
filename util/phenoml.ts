import { phenomlClient } from 'phenoml';
import { v4 as uuidv4 } from 'uuid';

export const QICORE_PATIENT_PROFILE = 'http://hl7.org/fhir/us/qicore/StructureDefinition/qicore-patient';
const QICORE_PROFILE_BASE = 'http://hl7.org/fhir/us/qicore/StructureDefinition/';

export const QICORE_PROFILE_BY_RESOURCE_TYPE: Record<string, string> = {
  AdverseEvent: `${QICORE_PROFILE_BASE}qicore-adverseevent`,
  AllergyIntolerance: `${QICORE_PROFILE_BASE}qicore-allergyintolerance`,
  BodyStructure: `${QICORE_PROFILE_BASE}qicore-bodystructure`,
  CarePlan: `${QICORE_PROFILE_BASE}qicore-careplan`,
  CareTeam: `${QICORE_PROFILE_BASE}qicore-careteam`,
  Claim: `${QICORE_PROFILE_BASE}qicore-claim`,
  ClaimResponse: `${QICORE_PROFILE_BASE}qicore-claimresponse`,
  Communication: `${QICORE_PROFILE_BASE}qicore-communication`,
  CommunicationRequest: `${QICORE_PROFILE_BASE}qicore-communicationrequest`,
  Condition: `${QICORE_PROFILE_BASE}qicore-condition-problems-health-concerns`,
  Coverage: `${QICORE_PROFILE_BASE}qicore-coverage`,
  Device: `${QICORE_PROFILE_BASE}qicore-device`,
  DeviceRequest: `${QICORE_PROFILE_BASE}qicore-devicerequest`,
  DeviceUseStatement: `${QICORE_PROFILE_BASE}qicore-deviceusestatement`,
  DiagnosticReport: `${QICORE_PROFILE_BASE}qicore-diagnosticreport-lab`,
  Encounter: `${QICORE_PROFILE_BASE}qicore-encounter`,
  FamilyMemberHistory: `${QICORE_PROFILE_BASE}qicore-familymemberhistory`,
  Flag: `${QICORE_PROFILE_BASE}qicore-flag`,
  Goal: `${QICORE_PROFILE_BASE}qicore-goal`,
  ImagingStudy: `${QICORE_PROFILE_BASE}qicore-imagingstudy`,
  Immunization: `${QICORE_PROFILE_BASE}qicore-immunization`,
  ImmunizationEvaluation: `${QICORE_PROFILE_BASE}qicore-immunizationevaluation`,
  ImmunizationRecommendation: `${QICORE_PROFILE_BASE}qicore-immunizationrecommendation`,
  Location: `${QICORE_PROFILE_BASE}qicore-location`,
  Medication: `${QICORE_PROFILE_BASE}qicore-medication`,
  MedicationAdministration: `${QICORE_PROFILE_BASE}qicore-medicationadministration`,
  MedicationDispense: `${QICORE_PROFILE_BASE}qicore-medicationdispense`,
  MedicationRequest: `${QICORE_PROFILE_BASE}qicore-medicationrequest`,
  MedicationStatement: `${QICORE_PROFILE_BASE}qicore-medicationstatement`,
  NutritionOrder: `${QICORE_PROFILE_BASE}qicore-nutritionorder`,
  Observation: `${QICORE_PROFILE_BASE}qicore-simple-observation`,
  Organization: `${QICORE_PROFILE_BASE}qicore-organization`,
  Patient: QICORE_PATIENT_PROFILE,
  Practitioner: `${QICORE_PROFILE_BASE}qicore-practitioner`,
  PractitionerRole: `${QICORE_PROFILE_BASE}qicore-practitionerrole`,
  Procedure: `${QICORE_PROFILE_BASE}qicore-procedure`,
  QuestionnaireResponse: `${QICORE_PROFILE_BASE}qicore-questionnaireresponse`,
  RelatedPerson: `${QICORE_PROFILE_BASE}qicore-relatedperson`,
  ServiceRequest: `${QICORE_PROFILE_BASE}qicore-servicerequest`,
  Substance: `${QICORE_PROFILE_BASE}qicore-substance`,
  Task: `${QICORE_PROFILE_BASE}qicore-task`
};

export interface Lang2FhirCreateMultiResult {
  patient: fhir4.Patient;
  patientFullUrl: string;
  resources: fhir4.BundleEntry[];
  output: fhir4.Bundle;
}

const getPhenomlClient = () => {
  const token = process.env.NEXT_PUBLIC_PHENOML_TOKEN;
  const baseUrl = process.env.NEXT_PUBLIC_PHENOML_BASE_URL;

  if (!token) {
    throw new Error('PhenoML is not configured. Set NEXT_PUBLIC_PHENOML_TOKEN to create patients from AI narrative.');
  }

  return new phenomlClient({
    token,
    ...(baseUrl ? { baseUrl } : {})
  });
};

const isFhirResource = (
  resource: Record<string, unknown> | undefined
): resource is fhir4.Resource & Record<string, unknown> => {
  return typeof resource?.resourceType === 'string';
};

const withResourceId = <T extends fhir4.Resource>(resource: T): T => {
  return {
    ...resource,
    id: typeof resource.id === 'string' ? resource.id : uuidv4()
  };
};

const getFullUrl = (entry: { fullUrl?: string }, resource: fhir4.Resource) => {
  return typeof entry.fullUrl === 'string' ? entry.fullUrl : `urn:uuid:${resource.id}`;
};

const getPhenomlImplementationGuide = () => {
  return process.env.NEXT_PUBLIC_PHENOML_IMPLEMENTATION_GUIDE ?? 'qicore_stu6';
};

const hasQicoreProfile = (profiles: string[]) => {
  return profiles.some(profile => profile.startsWith(QICORE_PROFILE_BASE));
};

const ensureProfile = <T extends fhir4.Resource>(resource: T, profile: string): T => {
  const currentProfiles = resource.meta?.profile ?? [];

  if (currentProfiles.includes(profile)) {
    return resource;
  }

  return {
    ...resource,
    meta: {
      ...resource.meta,
      profile: [...currentProfiles, profile]
    }
  };
};

export const ensureQicoreProfile = <T extends fhir4.Resource>(resource: T): T => {
  const currentProfiles = resource.meta?.profile ?? [];

  if (hasQicoreProfile(currentProfiles)) {
    return resource;
  }

  const qicoreProfile = QICORE_PROFILE_BY_RESOURCE_TYPE[resource.resourceType];

  return qicoreProfile ? ensureProfile(resource, qicoreProfile) : resource;
};

export const ensureQicorePatientProfile = (patient: fhir4.Patient): fhir4.Patient => {
  return ensureProfile(patient, QICORE_PATIENT_PROFILE);
};

export async function postLang2fhirCreateMulti(text: string): Promise<Lang2FhirCreateMultiResult> {
  const response = await getPhenomlClient().lang2Fhir.createMulti({
    version: 'R4',
    implementation_guide: getPhenomlImplementationGuide(),
    text
  });

  const entries =
    response.bundle?.entry
      ?.map(entry => {
        if (!isFhirResource(entry.resource)) {
          return null;
        }

        const resource = ensureQicoreProfile(withResourceId(entry.resource));

        return {
          ...entry,
          fullUrl: getFullUrl(entry, resource),
          resource
        } as fhir4.BundleEntry;
      })
      .filter((entry): entry is fhir4.BundleEntry => entry !== null) ?? [];
  const patientEntry = entries.find(entry => entry.resource?.resourceType === 'Patient');

  if (!patientEntry?.resource) {
    throw new Error('PhenoML did not return a Patient resource.');
  }

  const patient = ensureQicorePatientProfile(patientEntry.resource as fhir4.Patient);
  patientEntry.resource = patient;

  return {
    patient,
    patientFullUrl: getFullUrl(patientEntry, patient),
    resources: entries.filter(entry => entry.resource?.resourceType !== 'Patient'),
    output: {
      ...response.bundle,
      resourceType: 'Bundle',
      type: (response.bundle?.type ?? 'transaction') as fhir4.Bundle['type'],
      entry: entries
    }
  };
}
