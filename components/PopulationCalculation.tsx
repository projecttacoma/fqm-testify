import { Button, Center, Grid } from '@mantine/core';
import { useRecoilValue } from 'recoil';
import { patientTestCaseState } from '../state/atoms/patientTestCase';
import { measureBundleState } from '../state/atoms/measureBundle';
import { Calculator } from 'fqm-execution';
import { createPatientBundle, getPatientInfoString } from '../util/fhir';
import { DetailedMeasureReport, PopulationResultsViewer } from 'ecqm-visualizers';
import { useState } from 'react';
import { fhirJson } from '@fhir-typescript/r4-core';

export default function PopulationCalculation() {
  const currentPatients = useRecoilValue(patientTestCaseState);
  const measureBundle = useRecoilValue(measureBundleState);
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
    // get all patient bundles as array to feed into fqm-execution
    const patientBundles: fhir4.Bundle[] = [];
    Object.keys(currentPatients).forEach(id => {
      const bundle = createPatientBundle(currentPatients[id].patient, currentPatients[id].resources);
      patientBundles.push(bundle);
    });

    if (measureBundle.content) {
      const measureReports = await Calculator.calculateIndividualMeasureReports(measureBundle.content, patientBundles, {
        reportType: 'individual',
        calculateSDEs: false
      });
      return measureReports.results;
    } else return;
  };

  /**
   * Calls calculateMeasureReports and creates the DetailedMeasureReport that will be used to render
   * the population results.
   */
  const renderPopulationResults = () => {
    calculateMeasureReports().then(measureReports => {
      if (measureReports) {
        const patientLabels = createPatientLabels();
        const labeledMeasureReports: DetailedMeasureReport[] = [];
        measureReports.forEach((mr, i) => {
          labeledMeasureReports.push({ label: patientLabels[i], report: mr as fhirJson.MeasureReport });
        });
        setMeasureReports(labeledMeasureReports);
      }
    });
  };

  return (
    <>
      {Object.keys(currentPatients).length > 0 && measureBundle.content && (
        <Center>
          <Button
            data-testid="calculate-button"
            aria-label="Calculate"
            styles={{ root: { marginTop: 20 } }}
            size="lg"
            onClick={() => renderPopulationResults()}
          >
            &nbsp;Calculate
          </Button>
          <Grid>
            {measureReports.length > 0 && (
              <>
                <div>
                  <PopulationResultsViewer reports={measureReports} />
                </div>
              </>
            )}
          </Grid>
        </Center>
      )}
    </>
  );
}
