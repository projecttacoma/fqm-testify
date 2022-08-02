import { Button, Center, Grid } from '@mantine/core';
import { useRecoilValue } from 'recoil';
import { patientTestCaseState } from '../state/atoms/patientTestCase';
import { measureBundleState } from '../state/atoms/measureBundle';
import { Calculator, CalculatorTypes } from 'fqm-execution';
import { createPatientBundle, getPatientInfoString } from '../util/fhir';
import { DetailedMeasureReport, PopulationResultsViewer } from 'ecqm-visualizers';
import { useState } from 'react';
import { fhirJson } from '@fhir-typescript/r4-core';
import { measurementPeriodState } from '../state/atoms/measurementPeriod';
import { showNotification } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons';

export default function PopulationCalculation() {
  const currentPatients = useRecoilValue(patientTestCaseState);
  const measureBundle = useRecoilValue(measureBundleState);
  const measurementPeriod = useRecoilValue(measurementPeriodState);
  const [measureReports, setMeasureReports] = useState<DetailedMeasureReport[]>([]);

  /**
   * Creates array containing patient info strings for each created patient. Used as labels when creating
   * measure report population results table.
   * @returns { Array } an array of patient labels
   */
  const createPatientLabels = (): string[] => {
    const patientLabels: string[] = [];
    Object.keys(currentPatients).forEach(id => {
      patientLabels.push(getPatientInfoString(currentPatients[id].patient));
    });
    return patientLabels;
  };

  /**
   * Uses fqm-execution library to perform calculation on all patients and return their
   * measure reports.
   * @returns { Array | void } array of measure reports (if measure bundle is provided)
   */
  const calculateMeasureReports = async (): Promise<fhir4.MeasureReport[] | void> => {
    // specify options for calculation
    // TODO: revisit options after new fqm-execution release (calculateSDEs set to true throws error)
    const options: CalculatorTypes.CalculationOptions = {
      calculateHTML: false,
      calculateSDEs: false,
      reportType: 'individual',
      measurementPeriodStart: measurementPeriod.start?.toISOString(),
      measurementPeriodEnd: measurementPeriod.end?.toISOString()
    };

    // get all patient bundles as array to feed into fqm-execution
    const patientBundles: fhir4.Bundle[] = [];
    Object.keys(currentPatients).forEach(id => {
      const bundle = createPatientBundle(currentPatients[id].patient, currentPatients[id].resources);
      patientBundles.push(bundle);
    });

    if (measureBundle.content) {
      const measureReports = await Calculator.calculateMeasureReports(measureBundle.content, patientBundles, options);
      return measureReports.results as fhir4.MeasureReport[];
    } else return;
  };

  /**
   * Wrapper function that calls calculateMeasureReports() and creates the DetailedMeasureReport that will be used to render
   * the population results. Catches errors in fqm-execution that result from calculateMeasureReports().
   */
  const runCalculation = () => {
    calculateMeasureReports()
      .then(measureReports => {
        if (measureReports) {
          const patientLabels = createPatientLabels();
          const labeledMeasureReports: DetailedMeasureReport[] = [];
          measureReports.forEach((mr, i) => {
            labeledMeasureReports.push({ label: patientLabels[i], report: mr as fhirJson.MeasureReport });
          });
          setMeasureReports(labeledMeasureReports);
        }
      })
      .catch(e => {
        if (e instanceof Error) {
          showNotification({
            icon: <IconAlertCircle />,
            title: 'Calculation Error',
            message: e.message,
            color: 'red'
          });
        }
      });
  };

  return (
    <>
      {Object.keys(currentPatients).length > 0 && measureBundle.content && (
        <Center>
          <Grid>
            <Grid.Col span={12}>
              <Button
                data-testid="calculate-all-button"
                aria-label="Calculate Population Results"
                styles={{ root: { marginTop: 20 } }}
                size="lg"
                onClick={() => runCalculation()}
              >
                &nbsp;Calculate Population Results
              </Button>
              {measureReports.length > 0 && (
                <>
                  <h2>Population Results</h2>
                  <div data-testid="results-table">
                    <PopulationResultsViewer reports={measureReports} />
                  </div>
                </>
              )}
            </Grid.Col>
          </Grid>
        </Center>
      )}
    </>
  );
}
