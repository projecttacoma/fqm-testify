import { selector } from 'recoil';
import { getDataRequirementFiltersString } from '../../util/fhir';
import { dataRequirementsState } from './dataRequirements';
import { valueSetMapState } from './valueSetsMap';

export const dataRequirementsLookupState = selector<Record<string, fhir4.DataRequirement>>({
  key: 'dataRequirementsLookupState',
  get: async ({ get }) => {
    const valueSetMap = get(valueSetMapState);
    const dataRequirements = get(dataRequirementsState);
    const result: Record<string, fhir4.DataRequirement> = {};
    if (dataRequirements !== null && valueSetMap !== null) {
      dataRequirements.forEach(dr => {
        const key = `${dr.type}|${getDataRequirementFiltersString(dr, valueSetMap)}`;
        result[key] = dr;
      });
    }
    return result;
  }
});
