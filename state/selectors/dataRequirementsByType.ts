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
              dr.codeFilter.forEach(cf => {
                if (cf.valueSet) {
                  result[dr.type].valueSets = result[dr.type].valueSets.concat(cf.valueSet);
                } else if (cf.code) {
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
              if (cf.valueSet) {
                result[dr.type] = { keepAll: false, valueSets: [cf.valueSet], directCodes: [] };
              } else if (cf.code) {
                result[dr.type] = { keepAll: false, valueSets: [], directCodes: cf.code };
              }
            });
          }
        }
      });
    }

    return result;
  }
});
