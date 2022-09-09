import { Calculator, CalculatorTypes } from 'fqm-execution';
import { TestCaseInfo } from '../state/atoms/patientTestCase';
import { createPatientBundle } from './fhir';

/**
 * Takes in a patient's test case info, a measure bundle, and a measurement
 * period start and end and returns a measureReport
 * passed in filename and fileContents
 * @param patientTestCase {TestCaseInfo}
 * @param mb {fhir4.Bundle}
 * @param mpStart {string}
 * @param mpEnd {string}
 * @returns MeasureReport
 */
export async function calculateMeasureReport(
  patientTestCase: TestCaseInfo,
  mb: fhir4.Bundle,
  mpStart: string | undefined,
  mpEnd: string | undefined
): Promise<fhir4.MeasureReport> {
  const options: CalculatorTypes.CalculationOptions = {
    calculateHTML: true,
    calculateSDEs: true,
    reportType: 'individual',
    measurementPeriodStart: mpStart,
    measurementPeriodEnd: mpEnd
  };

  const patientBundle = createPatientBundle(patientTestCase.patient, patientTestCase.resources);

  const mrResults = await Calculator.calculateMeasureReports(mb, [patientBundle], options);
  const [measureReport] = mrResults.results as fhir4.MeasureReport[];
  return measureReport;
}
