import { ResourceCodeInfo } from './types';

export const parsedCodePaths: Record<string, ResourceCodeInfo> = {
  Account: {
    primaryCodePath: 'type',
    paths: {
      type: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      }
    }
  },
  ActivityDefinition: {
    primaryCodePath: 'topic',
    paths: {
      subject: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: true
      },
      jurisdiction: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      topic: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      product: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: true
      },
      bodySite: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      }
    }
  },
  AdverseEvent: {
    primaryCodePath: 'event',
    paths: {
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      event: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      seriousness: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      severity: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      outcome: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      }
    }
  },
  AllergyIntolerance: {
    primaryCodePath: 'code',
    paths: {
      clinicalStatus: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      verificationStatus: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      }
    }
  },
  Appointment: {
    primaryCodePath: 'serviceType',
    paths: {
      cancelationReason: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      serviceCategory: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      serviceType: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      specialty: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      appointmentType: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      }
    }
  },
  Basic: {
    primaryCodePath: 'code',
    paths: {
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      }
    }
  },
  BodyStructure: {
    primaryCodePath: 'location',
    paths: {
      morphology: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      location: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      locationQualifier: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      }
    }
  },
  CarePlan: {
    primaryCodePath: 'category',
    paths: {
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      }
    }
  },
  CareTeam: {
    primaryCodePath: 'category',
    paths: {
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      }
    }
  },
  ChargeItem: {
    primaryCodePath: 'code',
    paths: {
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      bodysite: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      reason: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      product: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: true
      }
    }
  },
  ChargeItemDefinition: {
    primaryCodePath: 'code',
    paths: {
      jurisdiction: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      }
    }
  },
  Claim: {
    primaryCodePath: 'type',
    paths: {
      type: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      subType: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      priority: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      fundsReserve: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      }
    }
  },
  ClinicalImpression: {
    primaryCodePath: 'code',
    paths: {
      statusReason: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      prognosisCodeableConcept: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      }
    }
  },
  Communication: {
    primaryCodePath: 'category',
    paths: {
      statusReason: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      medium: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      topic: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      }
    }
  },
  CommunicationRequest: {
    primaryCodePath: 'category',
    paths: {
      statusReason: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      medium: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      }
    }
  },
  Composition: {
    primaryCodePath: 'type',
    paths: {
      type: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      }
    }
  },
  Condition: {
    primaryCodePath: 'code',
    paths: {
      clinicalStatus: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      verificationStatus: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      severity: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      bodySite: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      }
    }
  },
  Consent: {
    primaryCodePath: 'category',
    paths: {
      scope: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      policyRule: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      }
    }
  },
  Coverage: {
    primaryCodePath: 'type',
    paths: {
      type: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      relationship: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      }
    }
  },
  DetectedIssue: {
    primaryCodePath: 'code',
    paths: {
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      }
    }
  },
  Device: {
    primaryCodePath: 'type',
    paths: {
      statusReason: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      type: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      safety: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      }
    }
  },
  DeviceMetric: {
    primaryCodePath: 'type',
    paths: {
      type: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      unit: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      }
    }
  },
  DeviceRequest: {
    primaryCodePath: 'code',
    paths: {
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: true
      },
      performerType: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      }
    }
  },
  DeviceUseStatement: {
    primaryCodePath: 'device.code',
    paths: {
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      bodySite: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      }
    }
  },
  DiagnosticReport: {
    primaryCodePath: 'code',
    paths: {
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      conclusionCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      }
    }
  },
  Encounter: {
    primaryCodePath: 'type',
    paths: {
      class: {
        codeType: 'FHIR.Coding',
        multipleCardinality: false,
        choiceType: false
      },
      type: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      serviceType: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      priority: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      }
    }
  },
  EpisodeOfCare: {
    primaryCodePath: 'type',
    paths: {
      type: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      }
    }
  },
  ExplanationOfBenefit: {
    primaryCodePath: 'type',
    paths: {
      type: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      subType: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      priority: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      fundsReserveRequested: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      fundsReserve: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      formCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      }
    }
  },
  Flag: {
    primaryCodePath: 'code',
    paths: {
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      }
    }
  },
  Goal: {
    primaryCodePath: 'category',
    paths: {
      achievementStatus: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      priority: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      description: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      start: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: true
      },
      outcomeCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      }
    }
  },
  Group: {
    primaryCodePath: 'code',
    paths: {
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      }
    }
  },
  GuidanceResponse: {
    primaryCodePath: 'module',
    paths: {
      module: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: true
      },
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      }
    }
  },
  HealthcareService: {
    primaryCodePath: 'type',
    paths: {
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      type: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      specialty: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      serviceProvisionCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      program: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      characteristic: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      communication: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      referralMethod: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      }
    }
  },
  Immunization: {
    primaryCodePath: 'vaccineCode',
    paths: {
      statusReason: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      vaccineCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      reportOrigin: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      site: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      route: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      subpotentReason: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      programEligibility: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      fundingSource: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      }
    }
  },
  Library: {
    primaryCodePath: 'topic',
    paths: {
      type: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      subject: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: true
      },
      jurisdiction: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      topic: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      }
    }
  },
  List: {
    primaryCodePath: 'code',
    paths: {
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      orderedBy: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      emptyReason: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      }
    }
  },
  Location: {
    primaryCodePath: 'type',
    paths: {
      operationalStatus: {
        codeType: 'FHIR.Coding',
        multipleCardinality: false,
        choiceType: false
      },
      type: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      physicalType: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      }
    }
  },
  Measure: {
    primaryCodePath: 'topic',
    paths: {
      subject: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: true
      },
      jurisdiction: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      topic: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      scoring: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      compositeScoring: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      type: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      improvementNotation: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      }
    }
  },
  MeasureReport: {
    primaryCodePath: 'measure.topic',
    paths: {
      improvementNotation: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      }
    }
  },
  Medication: {
    primaryCodePath: 'code',
    paths: {
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      form: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      }
    }
  },
  MedicationAdministration: {
    primaryCodePath: 'medication',
    paths: {
      statusReason: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      medication: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: true
      },
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      }
    }
  },
  MedicationDispense: {
    primaryCodePath: 'medication',
    paths: {
      statusReason: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: true
      },
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      medication: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: true
      },
      type: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      }
    }
  },
  MedicationKnowledge: {
    primaryCodePath: 'code',
    paths: {
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      doseForm: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      productType: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      intendedRoute: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      }
    }
  },
  MedicationRequest: {
    primaryCodePath: 'medication',
    paths: {
      statusReason: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      medication: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: true
      },
      performerType: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      courseOfTherapyType: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      }
    }
  },
  MedicationStatement: {
    primaryCodePath: 'medication',
    paths: {
      statusReason: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      medication: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: true
      },
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      }
    }
  },
  MessageDefinition: {
    primaryCodePath: 'event',
    paths: {
      jurisdiction: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      event: {
        codeType: 'FHIR.Coding',
        multipleCardinality: false,
        choiceType: true
      }
    }
  },
  Observation: {
    primaryCodePath: 'code',
    paths: {
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      value: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: true
      },
      dataAbsentReason: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      interpretation: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      bodySite: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      method: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      }
    }
  },
  ObservationDefinition: {
    primaryCodePath: 'code',
    paths: {
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      method: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      }
    }
  },
  OperationDefinition: {
    primaryCodePath: 'code',
    paths: {
      jurisdiction: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      code: {
        codeType: 'FHIR.code',
        multipleCardinality: false,
        choiceType: false
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
        multipleCardinality: true,
        choiceType: false
      },
      specialty: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      }
    }
  },
  Procedure: {
    primaryCodePath: 'code',
    paths: {
      statusReason: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      bodySite: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      outcome: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      complication: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      followUp: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      usedCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      }
    }
  },
  Questionnaire: {
    primaryCodePath: 'name',
    paths: {
      jurisdiction: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      code: {
        codeType: 'FHIR.Coding',
        multipleCardinality: true,
        choiceType: false
      }
    }
  },
  RelatedPerson: {
    primaryCodePath: 'relationship',
    paths: {
      relationship: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      }
    }
  },
  RequestGroup: {
    primaryCodePath: 'code',
    paths: {
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      }
    }
  },
  RiskAssessment: {
    primaryCodePath: 'code',
    paths: {
      method: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      }
    }
  },
  SearchParameter: {
    primaryCodePath: 'target',
    paths: {
      jurisdiction: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      code: {
        codeType: 'FHIR.code',
        multipleCardinality: false,
        choiceType: false
      }
    }
  },
  ServiceRequest: {
    primaryCodePath: 'code',
    paths: {
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      orderDetail: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      quantity: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: true
      },
      asNeeded: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: true
      },
      performerType: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      locationCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      bodySite: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      }
    }
  },
  Specimen: {
    primaryCodePath: 'type',
    paths: {
      type: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      condition: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      }
    }
  },
  Substance: {
    primaryCodePath: 'code',
    paths: {
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      }
    }
  },
  SupplyDelivery: {
    primaryCodePath: 'type',
    paths: {
      type: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      }
    }
  },
  SupplyRequest: {
    primaryCodePath: 'category',
    paths: {
      category: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      item: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: true
      },
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      }
    }
  },
  Task: {
    primaryCodePath: 'code',
    paths: {
      statusReason: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      businessStatus: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      code: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      },
      performerType: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: true,
        choiceType: false
      },
      reasonCode: {
        codeType: 'FHIR.CodeableConcept',
        multipleCardinality: false,
        choiceType: false
      }
    }
  }
};
