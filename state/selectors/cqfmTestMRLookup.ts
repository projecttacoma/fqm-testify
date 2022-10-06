import { selector } from 'recoil';
import { createCQFMTestCaseMeasureReport } from '../../util/fhir/resourceCreation';
import { measureBundleState } from '../atoms/measureBundle';
import { measurementPeriodState } from '../atoms/measurementPeriod';
import { patientTestCaseState } from '../atoms/patientTestCase';

interface CqfmTestMRLookupType {
  [id: string]: fhir4.MeasureReport;
}
export const cqfmTestMRLookupState = selector<CqfmTestMRLookupType>({
  key: 'cqfmTestMRLookupState',
  get: ({ get }) => {
    const measureBundle = get(measureBundleState);
    const { start, end } = get(measurementPeriodState);
    const currentPatients = get(patientTestCaseState);
    if (measureBundle.content && start && end) {
      return Object.keys(currentPatients).reduce((acc: CqfmTestMRLookupType, e) => {
        acc[e] = createCQFMTestCaseMeasureReport(
          measureBundle.content as fhir4.Bundle,
          { start: start.toISOString(), end: end.toISOString() },
          e,
          currentPatients[e].desiredPopulations
        );
        return acc;
      }, {});
    }
    return {};
  }
});
