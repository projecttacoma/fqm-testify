import { TestCaseInfo } from '../state/atoms/patientTestCase';
import fhirpath from 'fhirpath';
import { parsedCodePaths } from '../util/codePaths';
import { DataRequirementsLookupByTypeProps } from '../state/selectors/dataRequirementsByType';

export interface GetValueSetCodesProps {
  code?: string;
  system?: string;
}

/**
 * Helper function that takes a ValueSet url and a measure bundle and returns an
 * array of objects that contain each code and system in the ValueSet
 */
function getValueSetCodes(valueSetUrl: string[], mb: fhir4.Bundle | null): GetValueSetCodesProps[] {
  const codesAndSystems: GetValueSetCodesProps[] = [];
  valueSetUrl.forEach(vs => {
    const vsResource = mb?.entry?.filter(r => r.resource?.resourceType === 'ValueSet' && r.resource?.url === vs)[0]
      .resource as fhir4.ValueSet;
    vsResource.expansion?.contains?.forEach(c => {
      codesAndSystems.push({ code: c.code, system: c.system });
    });
  });
  return codesAndSystems;
}

/**
 * Helper function that takes in a TestCase, a measure bundle, and the
 * current measure bundle's dataRequirements lookup by type object and returns
 * an array of BundleEntries that are TestCase resources that are relevant to the
 * measure bundle's data requirements
 */
export function minimizeTestCaseResources(
  testCase: TestCaseInfo,
  measureBundle: fhir4.Bundle | null,
  drLookupByType: Record<string, DataRequirementsLookupByTypeProps>
): fhir4.BundleEntry[] {
  const newResources: fhir4.BundleEntry[] = [];
  testCase.resources.forEach(r => {
    // throw out any resources that are not in any of the dataRequirements
    // iterate over every resource in each bundle
    // keep Patient and MeasureReport
    if (
      r.resource &&
      r.resource?.resourceType &&
      r.resource?.resourceType !== 'MeasureReport' &&
      r.resource?.resourceType !== 'Patient'
    ) {
      // see if it matches any data requirements in the lookup object
      const matchingDRType = drLookupByType[r.resource.resourceType];
      if (matchingDRType) {
        const codeInfo = parsedCodePaths[r.resource.resourceType];
        // if the matching resource type's lookup object has keepAll set to true, meaning
        // the codeFilter on the data requirement was undefined, keep any resources of that type
        if (matchingDRType.keepAll === true) {
          newResources.push(r);
        } else if (codeInfo) {
          const primaryCodeInfo = codeInfo.paths[codeInfo.primaryCodePath];

          if (primaryCodeInfo.codeType === 'FHIR.CodeableConcept') {
            if (primaryCodeInfo.choiceType === true) {
              if (primaryCodeInfo.multipleCardinality === true) {
                // not sure if this happens based on codePaths.ts
              } else {
                // example: MedicationRequest, DeviceRequest
                const primaryCodeValue = fhirpath.evaluate(
                  r.resource,
                  `${codeInfo.primaryCodePath}CodeableConcept`
                )[0] as fhir4.CodeableConcept;
                if (primaryCodeValue) {
                  if (matchingDRType.valueSets.length > 0) {
                    const vsCodesAndSystems = getValueSetCodes(matchingDRType.valueSets, measureBundle);
                    if (
                      vsCodesAndSystems.find(vscas =>
                        primaryCodeValue.coding?.find(c => c.code === vscas.code && c.system === vscas.system)
                      )
                    ) {
                      newResources.push(r);
                    }
                  }
                  if (matchingDRType.directCodes.length > 0) {
                    if (matchingDRType.directCodes.find(dc => primaryCodeValue.coding?.find(c => c.code === dc.code))) {
                      newResources.push(r);
                    }
                  }
                }
              }
            } else {
              if (primaryCodeInfo.multipleCardinality === true) {
                // example: Activity Definition, Appointment, Encounter
                const primaryCodeValue = fhirpath.evaluate(
                  r.resource,
                  codeInfo.primaryCodePath
                ) as fhir4.CodeableConcept[];
                if (primaryCodeValue) {
                  if (matchingDRType.valueSets.length > 0) {
                    const vsCodesAndSystems = getValueSetCodes(matchingDRType.valueSets, measureBundle);
                    primaryCodeValue.forEach(pcv => {
                      if (
                        vsCodesAndSystems.find(vscas =>
                          pcv.coding?.find(c => c.code === vscas.code && c.system === vscas.system)
                        )
                      ) {
                        newResources.push(r);
                      }
                    });
                  }
                  if (matchingDRType.directCodes.length > 0) {
                    primaryCodeValue.forEach(pcv => {
                      if (matchingDRType.directCodes.find(dc => pcv.coding?.find(c => c.code === dc.code))) {
                        newResources.push(r);
                      }
                    });
                  }
                }
              } else {
                const primaryCodeValue = fhirpath.evaluate(
                  r.resource,
                  codeInfo.primaryCodePath
                )[0] as fhir4.CodeableConcept;
                if (primaryCodeValue) {
                  if (matchingDRType.valueSets.length > 0) {
                    const vsCodesAndSystems = getValueSetCodes(matchingDRType.valueSets, measureBundle);
                    if (
                      vsCodesAndSystems.find(vscas =>
                        primaryCodeValue.coding?.find(c => c.code === vscas.code && c.system === vscas.system)
                      )
                    ) {
                      newResources.push(r);
                    }
                  }
                  if (matchingDRType.directCodes.length > 0) {
                    if (matchingDRType.directCodes.find(dc => primaryCodeValue.coding?.find(c => c.code === dc.code))) {
                      newResources.push(r);
                    }
                  }
                }
              }
            }
          } else if (primaryCodeInfo.codeType === 'FHIR.Coding') {
            if (primaryCodeInfo.choiceType === true) {
              if (primaryCodeInfo.multipleCardinality === true) {
                // not sure if this happens based on codePaths.ts
              } else {
                // example: MessageDefinition
                const primaryCodeValue = fhirpath.evaluate(
                  r.resource,
                  `${codeInfo.primaryCodePath}Coding`
                ) as fhir4.Coding;
                if (primaryCodeValue) {
                  if (matchingDRType.valueSets.length > 0) {
                    const vsCodesAndSystems = getValueSetCodes(matchingDRType.valueSets, measureBundle);
                    if (
                      vsCodesAndSystems.find(
                        vscas => primaryCodeValue.code === vscas.code && primaryCodeValue.system === vscas.system
                      )
                    ) {
                      newResources.push(r);
                    }
                  }
                  if (matchingDRType.directCodes.length > 0) {
                    if (
                      matchingDRType.directCodes.find(
                        dc => dc.code === primaryCodeValue.code && dc.system === primaryCodeValue.system
                      )
                    ) {
                      newResources.push(r);
                    }
                  }
                }
              }
            } else {
              // not sure if this happens based on codePaths.ts
            }
          } else if (primaryCodeInfo.codeType === 'FHIR.code') {
            if (primaryCodeInfo.choiceType === true) {
              if (primaryCodeInfo.multipleCardinality === true) {
                // not sure if this happens based on codePaths.ts
              } else {
                // not sure if this happens based on codePaths.ts
              }
            } else {
              if (primaryCodeInfo.multipleCardinality === true) {
                // example: SearchParameter
              } else {
                // example: OperationDefinition
              }
            }
          }
        }
      }
    }
  });
  return newResources;
}
