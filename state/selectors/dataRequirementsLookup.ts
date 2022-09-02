import { selector } from 'recoil';
import { getDataRequirementFiltersString } from '../../util/fhir';
import { dataRequirementsState } from './dataRequirements';
import { valueSetMapState, ValueSetsMap } from './valueSetsMap';

// Returns a string that can be used to uniquely identify a data dataRequirement
// Used for looking up full dataRequirements from just a selected value in a dropdown
export function getDataRequirementsLookupKey(
  dataRequirement: fhir4.DataRequirement,
  valueSetMap: ValueSetsMap,
  index: number
) {
  return `${index}|${dataRequirement.type}|${getDataRequirementFiltersString(dataRequirement, valueSetMap)}`;
}

export const dataRequirementsLookupState = selector<Record<string, fhir4.DataRequirement>>({
  key: 'dataRequirementsLookupState',
  get: async ({ get }) => {
    const valueSetMap = get(valueSetMapState);
    const dataRequirements = get(dataRequirementsState);
    const result: Record<string, fhir4.DataRequirement> = {};
    if (dataRequirements !== null && valueSetMap !== null) {
      dataRequirements.forEach((dr, i) => {
        const key = getDataRequirementsLookupKey(dr, valueSetMap, i);
        result[key] = dr;
      });
    }
    return result;
  }
});
