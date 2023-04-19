import { Calculator, CalculatorTypes } from 'fqm-execution';
import { TestCaseInfo } from '../state/atoms/patientTestCase';
import { createPatientBundle } from './fhir/resourceCreation';
import { DetailedResult } from './types';

/**
 * Takes in a patient's test case info, a measure bundle, and a measurement
 * period start and end and returns a detailedResult
 */
export async function calculateDetailedResult(
  patientTestCase: TestCaseInfo,
  mb: fhir4.Bundle,
  mpStart: string | undefined,
  mpEnd: string | undefined
): Promise<DetailedResult> {
  const options: CalculatorTypes.CalculationOptions = {
    calculateHTML: true,
    calculateSDEs: true,
    calculateClauseCoverage: false,
    reportType: 'individual',
    measurementPeriodStart: mpStart,
    measurementPeriodEnd: mpEnd,
    useElmJsonsCaching: true
  };

  const patientBundle = createPatientBundle(patientTestCase.patient, patientTestCase.resources);

  const { results } = await Calculator.calculate(mb, [patientBundle], options);
  return results[0];
}
