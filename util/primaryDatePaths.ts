import { PrimaryDatePathInfo } from '../scripts/parsePrimaryDatePath';

export const parsedPrimaryDatePaths: PrimaryDatePathInfo = {
  Account: {
    servicePeriod: {
      dataTypes: ['Period']
    }
  },
  ActivityDefinition: {
    date: {
      dataTypes: ['dateTime']
    },
    approvalDate: {
      dataTypes: ['date']
    },
    lastReviewDate: {
      dataTypes: ['date']
    },
    effectivePeriod: {
      dataTypes: ['Period']
    },
    timing: {
      isChoiceType: true,
      dataTypes: ['dateTime', 'Period']
    }
  },
  AdverseEvent: {
    date: {
      dataTypes: ['dateTime']
    },
    detected: {
      dataTypes: ['dateTime']
    },
    recordedDate: {
      dataTypes: ['dateTime']
    }
  },
  AllergyIntolerance: {
    onset: {
      isChoiceType: true,
      dataTypes: ['dateTime', 'Period']
    },
    recordedDate: {
      dataTypes: ['dateTime']
    },
    lastOccurrence: {
      dataTypes: ['dateTime']
    }
  },
  Appointment: {
    created: {
      dataTypes: ['dateTime']
    }
  },
  AppointmentResponse: {},
  AuditEvent: {
    period: {
      dataTypes: ['Period']
    }
  },
  Basic: {
    created: {
      dataTypes: ['date']
    }
  },
  BiologicallyDerivedProduct: {},
  BodyStructure: {},
  CapabilityStatement: {
    date: {
      dataTypes: ['dateTime']
    }
  },
  CarePlan: {
    period: {
      dataTypes: ['Period']
    },
    created: {
      dataTypes: ['dateTime']
    }
  },
  CareTeam: {
    period: {
      dataTypes: ['Period']
    }
  },
  CatalogEntry: {
    validityPeriod: {
      dataTypes: ['Period']
    },
    validTo: {
      dataTypes: ['dateTime']
    },
    lastUpdated: {
      dataTypes: ['dateTime']
    }
  },
  ChargeItem: {
    occurrence: {
      isChoiceType: true,
      dataTypes: ['dateTime', 'Period']
    },
    enteredDate: {
      dataTypes: ['dateTime']
    }
  },
  ChargeItemDefinition: {
    date: {
      dataTypes: ['dateTime']
    },
    approvalDate: {
      dataTypes: ['date']
    },
    lastReviewDate: {
      dataTypes: ['date']
    },
    effectivePeriod: {
      dataTypes: ['Period']
    }
  },
  Claim: {
    billablePeriod: {
      dataTypes: ['Period']
    },
    created: {
      dataTypes: ['dateTime']
    }
  },
  ClaimResponse: {
    created: {
      dataTypes: ['dateTime']
    },
    preAuthPeriod: {
      dataTypes: ['Period']
    }
  },
  ClinicalImpression: {
    effective: {
      isChoiceType: true,
      dataTypes: ['dateTime', 'Period']
    },
    date: {
      dataTypes: ['dateTime']
    }
  },
  CodeSystem: {
    date: {
      dataTypes: ['dateTime']
    }
  },
  Communication: {
    sent: {
      dataTypes: ['dateTime']
    },
    received: {
      dataTypes: ['dateTime']
    }
  },
  CommunicationRequest: {
    occurrence: {
      isChoiceType: true,
      dataTypes: ['dateTime', 'Period']
    },
    authoredOn: {
      dataTypes: ['dateTime']
    }
  },
  CompartmentDefinition: {
    date: {
      dataTypes: ['dateTime']
    }
  },
  Composition: {
    date: {
      dataTypes: ['dateTime']
    }
  },
  ConceptMap: {
    date: {
      dataTypes: ['dateTime']
    }
  },
  Condition: {
    onset: {
      isChoiceType: true,
      dataTypes: ['dateTime', 'Period']
    },
    abatement: {
      isChoiceType: true,
      dataTypes: ['dateTime', 'Period']
    },
    recordedDate: {
      dataTypes: ['dateTime']
    }
  },
  Consent: {
    dateTime: {
      dataTypes: ['dateTime']
    }
  },
  Contract: {
    issued: {
      dataTypes: ['dateTime']
    },
    applies: {
      dataTypes: ['Period']
    }
  },
  Coverage: {
    period: {
      dataTypes: ['Period']
    }
  },
  CoverageEligibilityRequest: {
    serviced: {
      isChoiceType: true,
      dataTypes: ['date', 'Period']
    },
    created: {
      dataTypes: ['dateTime']
    }
  },
  CoverageEligibilityResponse: {
    serviced: {
      isChoiceType: true,
      dataTypes: ['date', 'Period']
    },
    created: {
      dataTypes: ['dateTime']
    }
  },
  DetectedIssue: {
    identified: {
      isChoiceType: true,
      dataTypes: ['dateTime', 'Period']
    }
  },
  Device: {
    manufactureDate: {
      dataTypes: ['dateTime']
    },
    expirationDate: {
      dataTypes: ['dateTime']
    }
  },
  DeviceDefinition: {},
  DeviceMetric: {},
  DeviceRequest: {
    occurrence: {
      isChoiceType: true,
      dataTypes: ['dateTime', 'Period']
    },
    authoredOn: {
      dataTypes: ['dateTime']
    }
  },
  DeviceUseStatement: {
    timing: {
      isChoiceType: true,
      dataTypes: ['Period', 'dateTime']
    },
    recordedOn: {
      dataTypes: ['dateTime']
    }
  },
  DiagnosticReport: {
    effective: {
      isChoiceType: true,
      dataTypes: ['dateTime', 'Period']
    }
  },
  DocumentManifest: {
    created: {
      dataTypes: ['dateTime']
    }
  },
  DocumentReference: {},
  EffectEvidenceSynthesis: {
    date: {
      dataTypes: ['dateTime']
    },
    approvalDate: {
      dataTypes: ['date']
    },
    lastReviewDate: {
      dataTypes: ['date']
    },
    effectivePeriod: {
      dataTypes: ['Period']
    }
  },
  Encounter: {
    period: {
      dataTypes: ['Period']
    }
  },
  Endpoint: {
    period: {
      dataTypes: ['Period']
    }
  },
  EnrollmentRequest: {
    created: {
      dataTypes: ['dateTime']
    }
  },
  EnrollmentResponse: {
    created: {
      dataTypes: ['dateTime']
    }
  },
  EpisodeOfCare: {
    period: {
      dataTypes: ['Period']
    }
  },
  EventDefinition: {
    date: {
      dataTypes: ['dateTime']
    },
    approvalDate: {
      dataTypes: ['date']
    },
    lastReviewDate: {
      dataTypes: ['date']
    },
    effectivePeriod: {
      dataTypes: ['Period']
    }
  },
  Evidence: {
    date: {
      dataTypes: ['dateTime']
    },
    approvalDate: {
      dataTypes: ['date']
    },
    lastReviewDate: {
      dataTypes: ['date']
    },
    effectivePeriod: {
      dataTypes: ['Period']
    }
  },
  EvidenceVariable: {
    date: {
      dataTypes: ['dateTime']
    },
    approvalDate: {
      dataTypes: ['date']
    },
    lastReviewDate: {
      dataTypes: ['date']
    },
    effectivePeriod: {
      dataTypes: ['Period']
    }
  },
  ExampleScenario: {
    date: {
      dataTypes: ['dateTime']
    }
  },
  ExplanationOfBenefit: {
    billablePeriod: {
      dataTypes: ['Period']
    },
    created: {
      dataTypes: ['dateTime']
    },
    benefitPeriod: {
      dataTypes: ['Period']
    }
  },
  FamilyMemberHistory: {
    date: {
      dataTypes: ['dateTime']
    },
    born: {
      isChoiceType: true,
      dataTypes: ['Period', 'date']
    },
    deceased: {
      isChoiceType: true,
      dataTypes: ['date']
    }
  },
  Flag: {
    period: {
      dataTypes: ['Period']
    }
  },
  Goal: {
    start: {
      isChoiceType: true,
      dataTypes: ['date']
    },
    statusDate: {
      dataTypes: ['date']
    }
  },
  GraphDefinition: {
    date: {
      dataTypes: ['dateTime']
    }
  },
  Group: {},
  GuidanceResponse: {
    occurrenceDateTime: {
      dataTypes: ['dateTime']
    }
  },
  HealthcareService: {},
  ImagingStudy: {
    started: {
      dataTypes: ['dateTime']
    }
  },
  Immunization: {
    occurrence: {
      isChoiceType: true,
      dataTypes: ['dateTime']
    },
    recorded: {
      dataTypes: ['dateTime']
    },
    expirationDate: {
      dataTypes: ['date']
    }
  },
  ImmunizationEvaluation: {
    date: {
      dataTypes: ['dateTime']
    }
  },
  ImmunizationRecommendation: {
    date: {
      dataTypes: ['dateTime']
    }
  },
  ImplementationGuide: {
    date: {
      dataTypes: ['dateTime']
    }
  },
  InsurancePlan: {
    period: {
      dataTypes: ['Period']
    }
  },
  Invoice: {
    date: {
      dataTypes: ['dateTime']
    }
  },
  Library: {
    date: {
      dataTypes: ['dateTime']
    },
    approvalDate: {
      dataTypes: ['date']
    },
    lastReviewDate: {
      dataTypes: ['date']
    },
    effectivePeriod: {
      dataTypes: ['Period']
    }
  },
  Linkage: {},
  List: {
    date: {
      dataTypes: ['dateTime']
    }
  },
  Location: {},
  Measure: {
    date: {
      dataTypes: ['dateTime']
    },
    approvalDate: {
      dataTypes: ['date']
    },
    lastReviewDate: {
      dataTypes: ['date']
    },
    effectivePeriod: {
      dataTypes: ['Period']
    }
  },
  MeasureReport: {
    date: {
      dataTypes: ['dateTime']
    },
    period: {
      dataTypes: ['Period']
    }
  },
  Media: {
    created: {
      isChoiceType: true,
      dataTypes: ['dateTime', 'Period']
    }
  },
  Medication: {},
  MedicationAdministration: {
    effective: {
      isChoiceType: true,
      dataTypes: ['dateTime', 'Period']
    }
  },
  MedicationDispense: {
    whenPrepared: {
      dataTypes: ['dateTime']
    },
    whenHandedOver: {
      dataTypes: ['dateTime']
    }
  },
  MedicationKnowledge: {},
  MedicationRequest: {
    authoredOn: {
      dataTypes: ['dateTime']
    }
  },
  MedicationStatement: {
    effective: {
      isChoiceType: true,
      dataTypes: ['dateTime', 'Period']
    },
    dateAsserted: {
      dataTypes: ['dateTime']
    }
  },
  MedicinalProduct: {},
  MedicinalProductAuthorization: {
    statusDate: {
      dataTypes: ['dateTime']
    },
    restoreDate: {
      dataTypes: ['dateTime']
    },
    validityPeriod: {
      dataTypes: ['Period']
    },
    dataExclusivityPeriod: {
      dataTypes: ['Period']
    },
    dateOfFirstAuthorization: {
      dataTypes: ['dateTime']
    },
    internationalBirthDate: {
      dataTypes: ['dateTime']
    }
  },
  MedicinalProductContraindication: {},
  MedicinalProductIndication: {},
  MedicinalProductIngredient: {},
  MedicinalProductInteraction: {},
  MedicinalProductManufactured: {},
  MedicinalProductPackaged: {},
  MedicinalProductPharmaceutical: {},
  MedicinalProductUndesirableEffect: {},
  MessageDefinition: {
    date: {
      dataTypes: ['dateTime']
    }
  },
  MessageHeader: {},
  MolecularSequence: {},
  NamingSystem: {
    date: {
      dataTypes: ['dateTime']
    }
  },
  NutritionOrder: {
    dateTime: {
      dataTypes: ['dateTime']
    }
  },
  Observation: {
    effective: {
      isChoiceType: true,
      dataTypes: ['dateTime', 'Period']
    },
    value: {
      isChoiceType: true,
      dataTypes: ['dateTime', 'Period']
    }
  },
  ObservationDefinition: {},
  OperationDefinition: {
    date: {
      dataTypes: ['dateTime']
    }
  },
  OperationOutcome: {},
  Organization: {},
  OrganizationAffiliation: {
    period: {
      dataTypes: ['Period']
    }
  },
  Patient: {
    birthDate: {
      dataTypes: ['date']
    },
    deceased: {
      isChoiceType: true,
      dataTypes: ['dateTime']
    }
  },
  PaymentNotice: {
    created: {
      dataTypes: ['dateTime']
    },
    paymentDate: {
      dataTypes: ['date']
    }
  },
  PaymentReconciliation: {
    period: {
      dataTypes: ['Period']
    },
    created: {
      dataTypes: ['dateTime']
    },
    paymentDate: {
      dataTypes: ['date']
    }
  },
  Person: {
    birthDate: {
      dataTypes: ['date']
    }
  },
  PlanDefinition: {
    date: {
      dataTypes: ['dateTime']
    },
    approvalDate: {
      dataTypes: ['date']
    },
    lastReviewDate: {
      dataTypes: ['date']
    },
    effectivePeriod: {
      dataTypes: ['Period']
    }
  },
  Practitioner: {
    birthDate: {
      dataTypes: ['date']
    }
  },
  PractitionerRole: {
    period: {
      dataTypes: ['Period']
    }
  },
  Procedure: {
    performed: {
      isChoiceType: true,
      dataTypes: ['dateTime', 'Period']
    }
  },
  Provenance: {
    occurred: {
      isChoiceType: true,
      dataTypes: ['Period', 'dateTime']
    }
  },
  Questionnaire: {
    date: {
      dataTypes: ['dateTime']
    },
    approvalDate: {
      dataTypes: ['date']
    },
    lastReviewDate: {
      dataTypes: ['date']
    },
    effectivePeriod: {
      dataTypes: ['Period']
    }
  },
  QuestionnaireResponse: {
    authored: {
      dataTypes: ['dateTime']
    }
  },
  RelatedPerson: {
    birthDate: {
      dataTypes: ['date']
    },
    period: {
      dataTypes: ['Period']
    }
  },
  RequestGroup: {
    authoredOn: {
      dataTypes: ['dateTime']
    }
  },
  ResearchDefinition: {
    date: {
      dataTypes: ['dateTime']
    },
    approvalDate: {
      dataTypes: ['date']
    },
    lastReviewDate: {
      dataTypes: ['date']
    },
    effectivePeriod: {
      dataTypes: ['Period']
    }
  },
  ResearchElementDefinition: {
    date: {
      dataTypes: ['dateTime']
    },
    approvalDate: {
      dataTypes: ['date']
    },
    lastReviewDate: {
      dataTypes: ['date']
    },
    effectivePeriod: {
      dataTypes: ['Period']
    }
  },
  ResearchStudy: {
    period: {
      dataTypes: ['Period']
    }
  },
  ResearchSubject: {
    period: {
      dataTypes: ['Period']
    }
  },
  RiskAssessment: {
    occurrence: {
      isChoiceType: true,
      dataTypes: ['dateTime', 'Period']
    }
  },
  RiskEvidenceSynthesis: {
    date: {
      dataTypes: ['dateTime']
    },
    approvalDate: {
      dataTypes: ['date']
    },
    lastReviewDate: {
      dataTypes: ['date']
    },
    effectivePeriod: {
      dataTypes: ['Period']
    }
  },
  Schedule: {
    planningHorizon: {
      dataTypes: ['Period']
    }
  },
  SearchParameter: {
    date: {
      dataTypes: ['dateTime']
    }
  },
  ServiceRequest: {
    occurrence: {
      isChoiceType: true,
      dataTypes: ['dateTime', 'Period']
    },
    authoredOn: {
      dataTypes: ['dateTime']
    }
  },
  Slot: {},
  Specimen: {
    receivedTime: {
      dataTypes: ['dateTime']
    }
  },
  SpecimenDefinition: {},
  StructureDefinition: {
    date: {
      dataTypes: ['dateTime']
    }
  },
  StructureMap: {
    date: {
      dataTypes: ['dateTime']
    }
  },
  Subscription: {},
  Substance: {},
  SubstanceNucleicAcid: {},
  SubstancePolymer: {},
  SubstanceProtein: {},
  SubstanceReferenceInformation: {},
  SubstanceSourceMaterial: {},
  SubstanceSpecification: {},
  SupplyDelivery: {
    occurrence: {
      isChoiceType: true,
      dataTypes: ['dateTime', 'Period']
    }
  },
  SupplyRequest: {
    occurrence: {
      isChoiceType: true,
      dataTypes: ['dateTime', 'Period']
    },
    authoredOn: {
      dataTypes: ['dateTime']
    }
  },
  Task: {
    executionPeriod: {
      dataTypes: ['Period']
    },
    authoredOn: {
      dataTypes: ['dateTime']
    },
    lastModified: {
      dataTypes: ['dateTime']
    }
  },
  TerminologyCapabilities: {
    date: {
      dataTypes: ['dateTime']
    }
  },
  TestReport: {
    issued: {
      dataTypes: ['dateTime']
    }
  },
  TestScript: {
    date: {
      dataTypes: ['dateTime']
    }
  },
  ValueSet: {
    date: {
      dataTypes: ['dateTime']
    }
  },
  VerificationResult: {
    statusDate: {
      dataTypes: ['dateTime']
    },
    lastPerformed: {
      dataTypes: ['dateTime']
    },
    nextScheduled: {
      dataTypes: ['date']
    }
  },
  VisionPrescription: {
    created: {
      dataTypes: ['dateTime']
    },
    dateWritten: {
      dataTypes: ['dateTime']
    }
  }
};
