import { primaryCodePathInfo } from '../scripts/parsePrimaryCodePath';

export const parsedPrimaryCodePaths: Record<string, primaryCodePathInfo> = {
  Account: {
    primaryCodePath: 'type',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: false
  },
  ActivityDefinition: {
    primaryCodePath: 'topic',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: true
  },
  AdverseEvent: {
    primaryCodePath: 'event',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: false
  },
  AllergyIntolerance: {
    primaryCodePath: 'code',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: false
  },
  Appointment: {
    primaryCodePath: 'serviceType',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: true
  },
  Basic: {
    primaryCodePath: 'code',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: false
  },
  BodyStructure: {
    primaryCodePath: 'location',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: false
  },
  CarePlan: {
    primaryCodePath: 'category',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: true
  },
  CareTeam: {
    primaryCodePath: 'category',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: true
  },
  ChargeItem: {
    primaryCodePath: 'code',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: false
  },
  ChargeItemDefinition: {
    primaryCodePath: 'code',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: false
  },
  Claim: {
    primaryCodePath: 'type',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: false
  },
  ClinicalImpression: {
    primaryCodePath: 'code',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: false
  },
  Communication: {
    primaryCodePath: 'category',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: true
  },
  CommunicationRequest: {
    primaryCodePath: 'category',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: true
  },
  Composition: {
    primaryCodePath: 'type',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: false
  },
  Condition: {
    primaryCodePath: 'code',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: false
  },
  Consent: {
    primaryCodePath: 'category',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: true
  },
  Coverage: {
    primaryCodePath: 'type',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: false
  },
  DetectedIssue: {
    primaryCodePath: 'code',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: false
  },
  Device: {
    primaryCodePath: 'type',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: false
  },
  DeviceMetric: {
    primaryCodePath: 'type',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: false
  },
  DeviceRequest: {
    primaryCodePath: 'code',
    primaryCodeType: ['FHIR.Reference', 'FHIR.CodeableConcept'],
    multipleCardinality: false
  },
  DiagnosticReport: {
    primaryCodePath: 'code',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: false
  },
  Encounter: {
    primaryCodePath: 'type',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: true
  },
  EpisodeOfCare: {
    primaryCodePath: 'type',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: true
  },
  ExplanationOfBenefit: {
    primaryCodePath: 'type',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: false
  },
  Flag: {
    primaryCodePath: 'code',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: false
  },
  Goal: {
    primaryCodePath: 'category',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: true
  },
  Group: {
    primaryCodePath: 'code',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: false
  },
  GuidanceResponse: {
    primaryCodePath: 'module',
    primaryCodeType: ['FHIR.uri', 'FHIR.canonical', 'FHIR.CodeableConcept'],
    multipleCardinality: false
  },
  HealthcareService: {
    primaryCodePath: 'type',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: true
  },
  Immunization: {
    primaryCodePath: 'vaccineCode',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: false
  },
  Library: {
    primaryCodePath: 'topic',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: true
  },
  List: {
    primaryCodePath: 'code',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: false
  },
  Location: {
    primaryCodePath: 'type',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: true
  },
  Measure: {
    primaryCodePath: 'topic',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: true
  },
  Medication: {
    primaryCodePath: 'code',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: false
  },
  MedicationAdministration: {
    primaryCodePath: 'medication',
    primaryCodeType: ['FHIR.CodeableConcept', 'FHIR.Reference'],
    multipleCardinality: false
  },
  MedicationDispense: {
    primaryCodePath: 'medication',
    primaryCodeType: ['FHIR.CodeableConcept', 'FHIR.Reference'],
    multipleCardinality: false
  },
  MedicationKnowledge: {
    primaryCodePath: 'code',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: false
  },
  MedicationRequest: {
    primaryCodePath: 'medication',
    primaryCodeType: ['FHIR.CodeableConcept', 'FHIR.Reference'],
    multipleCardinality: false
  },
  MedicationStatement: {
    primaryCodePath: 'medication',
    primaryCodeType: ['FHIR.CodeableConcept', 'FHIR.Reference'],
    multipleCardinality: false
  },
  MessageDefinition: {
    primaryCodePath: 'event',
    primaryCodeType: ['FHIR.Coding', 'FHIR.uri'],
    multipleCardinality: false
  },
  Observation: {
    primaryCodePath: 'code',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: false
  },
  ObservationDefinition: {
    primaryCodePath: 'code',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: false
  },
  OperationDefinition: {
    primaryCodePath: 'code',
    primaryCodeType: 'FHIR.code',
    multipleCardinality: false
  },
  PractitionerRole: {
    primaryCodePath: 'code',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: true
  },
  Procedure: {
    primaryCodePath: 'code',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: false
  },
  Questionnaire: {
    primaryCodePath: 'name',
    primaryCodeType: 'FHIR.string',
    multipleCardinality: false
  },
  RelatedPerson: {
    primaryCodePath: 'relationship',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: true
  },
  RequestGroup: {
    primaryCodePath: 'code',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: false
  },
  RiskAssessment: {
    primaryCodePath: 'code',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: false
  },
  SearchParameter: {
    primaryCodePath: 'target',
    primaryCodeType: 'FHIR.ResourceType',
    multipleCardinality: true
  },
  ServiceRequest: {
    primaryCodePath: 'code',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: false
  },
  Specimen: {
    primaryCodePath: 'type',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: false
  },
  Substance: {
    primaryCodePath: 'code',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: false
  },
  SupplyDelivery: {
    primaryCodePath: 'type',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: false
  },
  SupplyRequest: {
    primaryCodePath: 'category',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: false
  },
  Task: {
    primaryCodePath: 'code',
    primaryCodeType: 'FHIR.CodeableConcept',
    multipleCardinality: false
  }
};
