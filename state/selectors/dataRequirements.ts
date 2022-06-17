import { selector } from 'recoil';
import { measureBundleState } from '../atoms/measureBundle';
import { Calculator } from 'fqm-execution';
import { getDataRequirementFiltersString } from '../../util/fhir';
import { valueSetMapState } from './valueSetsMap';

export const dataRequirementsState = selector<fhir4.DataRequirement[] | null>({
  key: 'dataRequirementsState',
  get: async ({ get }) => {
    const measureBundle = get(measureBundleState);
    const valueSetMap = get(valueSetMapState);
    if (measureBundle.content && valueSetMap !== null) {
      const requirements = await Calculator.calculateDataRequirements(measureBundle.content);
      const drs = requirements.results.dataRequirement;
      if (drs) {
        drs.sort((a, b) => {
          return a.type + getDataRequirementFiltersString(a, valueSetMap) >
            b.type + getDataRequirementFiltersString(b, valueSetMap)
            ? 1
            : -1;
        });
        return drs;
      }
    }
    return null;
  }
});
