import { selector } from 'recoil';
import { dataRequirementsState } from './dataRequirements';

export interface DataRequirementsLookupByTypeProps {
  keepAll: boolean;
  valueSets: string[];
  directCodes: fhir4.Coding[];
}

export const dataRequirementsLookupByType = selector<Record<string, DataRequirementsLookupByTypeProps>>({
  key: 'dataRequirementsLookupByType',
  get: async ({ get }) => {
    const dataRequirements = get(dataRequirementsState);
    const result: Record<string, DataRequirementsLookupByTypeProps> = {};

    if (dataRequirements !== null) {
      dataRequirements.forEach((dr, i) => {
        if (result[dr.type]) {
          if (result[dr.type].keepAll === false) {
            if (dr.codeFilter === undefined) {
              result[dr.type].keepAll = true;
            } else {
              // Note: even though the codeFilters on a DataRequirement are ANDed together, we are looking at them
              // separately to see if there are ANY matches. Therefore, this lookup object is simply a list of
              // all of the codeFilters and ignores any relationship they may have with each other based on their
              // parent DataRequirement
              dr.codeFilter.forEach(cf => {
                if (cf.valueSet) {
                  result[dr.type].valueSets = result[dr.type].valueSets.concat(cf.valueSet);
                }
                if (cf.code) {
                  result[dr.type].directCodes = result[dr.type].directCodes.concat(cf.code);
                }
              });
            }
          }
        } else {
          if (dr.codeFilter === undefined) {
            result[dr.type] = { keepAll: true, valueSets: [], directCodes: [] };
          } else {
            dr.codeFilter.forEach(cf => {
              if (cf.valueSet && cf.code) {
                result[dr.type] = { keepAll: false, valueSets: [cf.valueSet], directCodes: cf.code };
              } else {
                if (cf.valueSet) {
                  result[dr.type] = { keepAll: false, valueSets: [cf.valueSet], directCodes: [] };
                }
                if (cf.code) {
                  result[dr.type] = { keepAll: false, valueSets: [], directCodes: cf.code };
                }
              }
            });
          }
        }
      });
    }

    return result;
  }
});
