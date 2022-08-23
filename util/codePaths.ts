import { ResourceCodeInfo } from './types';

export const parsedCodePaths: Record<string, ResourceCodeInfo> = {
  Account: {
    primaryCodePath: 'type',
    paths: {
      type: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      }
    }
  },
  ActivityDefinition: {
    primaryCodePath: 'topic',
    paths: {
      subject: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      jurisdiction: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      topic: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      product: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      bodySite: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      }
    }
  },
  AdverseEvent: {
    primaryCodePath: 'event',
    paths: {
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      event: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      seriousness: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      severity: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      outcome: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      }
    }
  },
  AllergyIntolerance: {
    primaryCodePath: 'code',
    paths: {
      clinicalStatus: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      verificationStatus: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      }
    }
  },
  Appointment: {
    primaryCodePath: 'serviceType',
    paths: {
      cancelationReason: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      serviceCategory: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      serviceType: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      specialty: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      appointmentType: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      }
    }
  },
  Basic: {
    primaryCodePath: 'code',
    paths: {
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      }
    }
  },
  BodyStructure: {
    primaryCodePath: 'location',
    paths: {
      morphology: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      location: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      locationQualifier: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      }
    }
  },
  CarePlan: {
    primaryCodePath: 'category',
    paths: {
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      }
    }
  },
  CareTeam: {
    primaryCodePath: 'category',
    paths: {
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      }
    }
  },
  ChargeItem: {
    primaryCodePath: 'code',
    paths: {
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      bodysite: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      reason: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      product: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      }
    }
  },
  ChargeItemDefinition: {
    primaryCodePath: 'code',
    paths: {
      jurisdiction: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      }
    }
  },
  Claim: {
    primaryCodePath: 'type',
    paths: {
      type: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      subType: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      priority: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      fundsReserve: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      }
    }
  },
  ClinicalImpression: {
    primaryCodePath: 'code',
    paths: {
      statusReason: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      prognosisCodeableConcept: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      }
    }
  },
  Communication: {
    primaryCodePath: 'category',
    paths: {
      statusReason: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      medium: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      topic: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      }
    }
  },
  CommunicationRequest: {
    primaryCodePath: 'category',
    paths: {
      statusReason: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      medium: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      }
    }
  },
  Composition: {
    primaryCodePath: 'type',
    paths: {
      type: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      }
    }
  },
  Condition: {
    primaryCodePath: 'code',
    paths: {
      clinicalStatus: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      verificationStatus: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      severity: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      bodySite: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      }
    }
  },
  Consent: {
    primaryCodePath: 'category',
    paths: {
      scope: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      policyRule: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      }
    }
  },
  Coverage: {
    primaryCodePath: 'type',
    paths: {
      type: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      relationship: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      }
    }
  },
  DetectedIssue: {
    primaryCodePath: 'code',
    paths: {
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      }
    }
  },
  Device: {
    primaryCodePath: 'type',
    paths: {
      statusReason: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      type: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      safety: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      }
    }
  },
  DeviceMetric: {
    primaryCodePath: 'type',
    paths: {
      type: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      unit: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      }
    }
  },
  DeviceRequest: {
    primaryCodePath: 'code',
    paths: {
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      performerType: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      }
    }
  },
  DeviceUseStatement: {
    primaryCodePath: 'device.code',
    paths: {
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      bodySite: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      }
    }
  },
  DiagnosticReport: {
    primaryCodePath: 'code',
    paths: {
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      conclusionCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      }
    }
  },
  Encounter: {
    primaryCodePath: 'type',
    paths: {
      class: {
        codeType: 'FHIR.Coding',
        multipleCardinality: false
      },
      type: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      serviceType: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      priority: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      }
    }
  },
  EpisodeOfCare: {
    primaryCodePath: 'type',
    paths: {
      type: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      }
    }
  },
  ExplanationOfBenefit: {
    primaryCodePath: 'type',
    paths: {
      type: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      subType: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      priority: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      fundsReserveRequested: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      fundsReserve: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      formCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      }
    }
  },
  Flag: {
    primaryCodePath: 'code',
    paths: {
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      }
    }
  },
  Goal: {
    primaryCodePath: 'category',
    paths: {
      achievementStatus: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      priority: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      description: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      start: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      outcomeCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      }
    }
  },
  Group: {
    primaryCodePath: 'code',
    paths: {
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      }
    }
  },
  GuidanceResponse: {
    primaryCodePath: 'module',
    paths: {
      module: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      }
    }
  },
  HealthcareService: {
    primaryCodePath: 'type',
    paths: {
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      type: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      specialty: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      serviceProvisionCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      program: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      characteristic: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      communication: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      referralMethod: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      }
    }
  },
  Immunization: {
    primaryCodePath: 'vaccineCode',
    paths: {
      statusReason: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      vaccineCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      reportOrigin: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      site: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      route: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      subpotentReason: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      programEligibility: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      fundingSource: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      }
    }
  },
  Library: {
    primaryCodePath: 'topic',
    paths: {
      type: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      subject: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      jurisdiction: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      topic: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      }
    }
  },
  List: {
    primaryCodePath: 'code',
    paths: {
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      orderedBy: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      emptyReason: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      }
    }
  },
  Location: {
    primaryCodePath: 'type',
    paths: {
      operationalStatus: {
        codeType: 'FHIR.Coding',
        multipleCardinality: false
      },
      type: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      physicalType: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      }
    }
  },
  Measure: {
    primaryCodePath: 'topic',
    paths: {
      subject: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      jurisdiction: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      topic: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      scoring: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      compositeScoring: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      type: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      improvementNotation: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      }
    }
  },
  MeasureReport: {
    primaryCodePath: 'measure.topic',
    paths: {
      improvementNotation: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      }
    }
  },
  Medication: {
    primaryCodePath: 'code',
    paths: {
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      form: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      }
    }
  },
  MedicationAdministration: {
    primaryCodePath: 'medication',
    paths: {
      statusReason: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      medication: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      }
    }
  },
  MedicationDispense: {
    primaryCodePath: 'medication',
    paths: {
      statusReason: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      medication: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      type: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      }
    }
  },
  MedicationKnowledge: {
    primaryCodePath: 'code',
    paths: {
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      doseForm: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      productType: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      intendedRoute: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      }
    }
  },
  MedicationRequest: {
    primaryCodePath: 'medication',
    paths: {
      statusReason: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      medication: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      performerType: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      courseOfTherapyType: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      }
    }
  },
  MedicationStatement: {
    primaryCodePath: 'medication',
    paths: {
      statusReason: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      medication: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      }
    }
  },
  MessageDefinition: {
    primaryCodePath: 'event',
    paths: {
      jurisdiction: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      event: {
        codeType: 'FHIR.Coding',
        multipleCardinality: false
      }
    }
  },
  Observation: {
    primaryCodePath: 'code',
    paths: {
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      value: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      dataAbsentReason: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      interpretation: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      bodySite: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      method: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      }
    }
  },
  ObservationDefinition: {
    primaryCodePath: 'code',
    paths: {
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      method: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      }
    }
  },
  OperationDefinition: {
    primaryCodePath: 'code',
    paths: {
      jurisdiction: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      code: {
        codeType: 'FHIR.code',
        multipleCardinality: false
      }
    }
  },
  OperationOutcome: {
    primaryCodePath: 'issue.code',
    paths: {}
  },
  PractitionerRole: {
    primaryCodePath: 'code',
    paths: {
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      specialty: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      }
    }
  },
  Procedure: {
    primaryCodePath: 'code',
    paths: {
      statusReason: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      bodySite: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      outcome: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      complication: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      followUp: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      usedCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      }
    }
  },
  Questionnaire: {
    primaryCodePath: 'name',
    paths: {
      jurisdiction: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      code: {
        codeType: 'FHIR.Coding',
        multipleCardinality: true
      }
    }
  },
  RelatedPerson: {
    primaryCodePath: 'relationship',
    paths: {
      relationship: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      }
    }
  },
  RequestGroup: {
    primaryCodePath: 'code',
    paths: {
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      }
    }
  },
  RiskAssessment: {
    primaryCodePath: 'code',
    paths: {
      method: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      }
    }
  },
  SearchParameter: {
    primaryCodePath: 'target',
    paths: {
      jurisdiction: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      code: {
        codeType: 'FHIR.code',
        multipleCardinality: false
      }
    }
  },
  ServiceRequest: {
    primaryCodePath: 'code',
    paths: {
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      orderDetail: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      quantity: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      asNeeded: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      performerType: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      locationCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      bodySite: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      }
    }
  },
  Specimen: {
    primaryCodePath: 'type',
    paths: {
      type: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      condition: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      }
    }
  },
  Substance: {
    primaryCodePath: 'code',
    paths: {
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      }
    }
  },
  SupplyDelivery: {
    primaryCodePath: 'type',
    paths: {
      type: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      }
    }
  },
  SupplyRequest: {
    primaryCodePath: 'category',
    paths: {
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      item: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      }
    }
  },
  Task: {
    primaryCodePath: 'code',
    paths: {
      statusReason: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      businessStatus: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      },
      performerType: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true
      },
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false
      }
    }
  }
};
