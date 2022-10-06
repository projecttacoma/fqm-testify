import { selector } from 'recoil';
import { createCQFMTestCaseMeasureReport } from '../../util/fhir/resourceCreation';
import { measureBundleState } from '../atoms/measureBundle';
import { measurementPeriodState } from '../atoms/measurementPeriod';
import { patientTestCaseState } from '../atoms/patientTestCase';

export const cqfmTestMRLookupState = selector<Record<string, fhir4.MeasureReport>>({
  key: 'cqfmTestMRLookupState',
  get: ({ get }) => {
    const measureBundle = get(measureBundleState);
    const { start, end } = get(measurementPeriodState);
    const currentPatients = get(patientTestCaseState);
    if (measureBundle.content && start && end) {
      return Object.keys(currentPatients).reduce((lookupResult: Record<string, fhir4.MeasureReport>, patientId) => {
        lookupResult[patientId] = createCQFMTestCaseMeasureReport(
          measureBundle.content as fhir4.Bundle,
          { start: start.toISOString(), end: end.toISOString() },
          patientId,
          currentPatients[patientId].desiredPopulations
        );
        return lookupResult;
      }, {});
    }
    return {};
  }
});
