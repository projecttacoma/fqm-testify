import { Button, Center, Grid, Drawer, Group, Tooltip } from '@mantine/core';
import { useRecoilValue } from 'recoil';
import { patientTestCaseState } from '../state/atoms/patientTestCase';
import { measureBundleState } from '../state/atoms/measureBundle';
import { Calculator, CalculatorTypes, MeasureReportBuilder } from 'fqm-execution';
import { createPatientBundle, getPatientInfoString } from '../util/fhir';
import { DetailedMeasureReport, PopulationResultsViewer } from 'ecqm-visualizers';
import { useState } from 'react';
import { fhirJson } from '@fhir-typescript/r4-core';
import { measurementPeriodState } from '../state/atoms/measurementPeriod';
import { showNotification } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons';
import Link from 'next/link';

interface PatientLabel {
  [patientId: string]: string;
}

export default function PopulationCalculation() {
  const currentPatients = useRecoilValue(patientTestCaseState);
  const measureBundle = useRecoilValue(measureBundleState);
  const measurementPeriod = useRecoilValue(measurementPeriodState);
  const [measureReports, setMeasureReports] = useState<DetailedMeasureReport[]>([]);
  const [opened, setOpened] = useState(false);
  const [enableTableButton, setEnableTableButton] = useState(false);
  const [enableClauseCoverageButton, setEnableClauseCoverageButton] = useState(false);
  const [clauseCoverageHTML, setClauseCoverageHTML] = useState<string | null>(null);

  /**
   * Creates object that maps patient ids to their name/DOB info strings.
   * @returns { Object } mapping of patient ids to patient info labels
   */
  const createPatientLabels = () => {
    const patientLabels: PatientLabel = {};
    Object.keys(currentPatients).forEach(id => {
      patientLabels[id] = getPatientInfoString(currentPatients[id].patient);
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
      calculateClauseCoverage: true,
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
      const { results, coverageHTML } = await Calculator.calculate(measureBundle.content, patientBundles, options);
      if (coverageHTML) {
        setClauseCoverageHTML(coverageHTML);
      }
      const measureReports = MeasureReportBuilder.buildMeasureReports(measureBundle.content, results, options);
      return measureReports as fhir4.MeasureReport[];
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
          measureReports.forEach(mr => {
            const patientId = mr.subject?.reference?.split('/')[1];
            labeledMeasureReports.push({
              label: patientId ? patientLabels[patientId] : '',
              report: mr as fhirJson.MeasureReport
            });
          });
          setMeasureReports(labeledMeasureReports);
          setOpened(true);
          setEnableTableButton(true);
          setEnableClauseCoverageButton(true);
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
              <Group>
                <Button
                  data-testid="calculate-all-button"
                  aria-label="Calculate Population Results"
                  styles={{ root: { marginTop: 20 } }}
                  onClick={() => runCalculation()}
                >
                  &nbsp;Calculate Population Results
                </Button>
                <Tooltip
                  label="Disabled until calculation results are available"
                  openDelay={1000}
                  disabled={enableTableButton ? true : false}
                >
                  <Button
                    data-testid="show-table-button"
                    aria-label="Show Table"
                    styles={{ root: { marginTop: 20 } }}
                    disabled={!enableTableButton}
                    onClick={() => setOpened(true)}
                    variant="default"
                  >
                    &nbsp;Show Table
                  </Button>
                </Tooltip>
                <Link
                  href={{ pathname: `/${measureBundle.content.id}/coverage`, query: { clauseCoverageHTML } }}
                  key={'coverage'}
                  passHref
                >
                  <Tooltip
                    label="Disabled until calculation results are available"
                    openDelay={1000}
                    disabled={enableClauseCoverageButton ? true : false}
                  >
                    <Button
                      data-testid="show-coverage-button"
                      aria-label="Show Clause Coverage"
                      styles={{ root: { marginTop: 20 } }}
                      disabled={!enableClauseCoverageButton}
                      variant="default"
                    >
                      &nbsp;Show Clause Coverage
                    </Button>
                  </Tooltip>
                </Link>
              </Group>
              {measureReports.length > 0 && (
                <>
                  <Drawer
                    opened={opened}
                    onClose={() => setOpened(false)}
                    position="bottom"
                    padding="md"
                    overlayOpacity={0.3}
                    lockScroll={false}
                    size="lg"
                  >
                    <h2>Population Results</h2>
                    <div
                      data-testid="results-table"
                      style={{
                        height: '15vh',
                        overflow: 'scroll'
                      }}
                    >
                      <PopulationResultsViewer reports={measureReports} />
                    </div>
                  </Drawer>
                </>
              )}
            </Grid.Col>
          </Grid>
        </Center>
      )}
    </>
  );
}
