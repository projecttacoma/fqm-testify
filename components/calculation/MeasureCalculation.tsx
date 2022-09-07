// A helper function that takes in a patient test case, a measure bundle

import { Calculator, CalculatorTypes } from 'fqm-execution';
import { TestCaseInfo } from '../../state/atoms/patientTestCase';
import { createPatientBundle } from '../../util/fhir';

// and a measure period and returns a measureReport
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
