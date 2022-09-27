import { selector } from 'recoil';
import { measureBundleState } from '../atoms/measureBundle';
import { Calculator } from 'fqm-execution';
import { valueSetMapState } from './valueSetsMap';

import { measurementPeriodState } from '../atoms/measurementPeriod';
import { getDataRequirementFiltersString } from '../../util/fhir/codes';

export const dataRequirementsState = selector<fhir4.DataRequirement[] | null>({
  key: 'dataRequirementsState',
  get: async ({ get }) => {
    const measureBundle = get(measureBundleState);
    const valueSetMap = get(valueSetMapState);
    const measurementPeriod = get(measurementPeriodState);
    if (measureBundle.content && valueSetMap !== null) {
      const requirements = await Calculator.calculateDataRequirements(measureBundle.content, {
        measurementPeriodStart: measurementPeriod.start?.toISOString(),
        measurementPeriodEnd: measurementPeriod.end?.toISOString()
      });
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
