import { Button, Center, Drawer, Group, Tooltip } from '@mantine/core';
import { useRecoilValue } from 'recoil';
import { Calculator, CalculatorTypes } from 'fqm-execution';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { useState } from 'react';
import { measurementPeriodState } from '../../state/atoms/measurementPeriod';
import { showNotification } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons';
import { getPatientInfoString } from '../../util/fhir/patient';
import { createPatientBundle } from '../../util/fhir/resourceCreation';
import PopulationResultTable, { LabeledDetailedResult } from './PopulationResultsTable';
import { DetailedResult } from '../../util/types';
import { useRouter } from 'next/router';
import { trustMetaProfileState } from '../../state/atoms/trustMetaProfile';

export default function PopulationCalculation() {
  const router = useRouter();

  const currentPatients = useRecoilValue(patientTestCaseState);
  const measureBundle = useRecoilValue(measureBundleState);
  const measurementPeriod = useRecoilValue(measurementPeriodState);
  const [detailedResults, setDetailedResults] = useState<LabeledDetailedResult[]>([]);
  const [opened, setOpened] = useState(false);
  const [enableTableButton, setEnableTableButton] = useState(false);
  const [enableClauseCoverageButton, setEnableClauseCoverageButton] = useState(false);
  const [clauseCoverageHTML, setClauseCoverageHTML] = useState<string | null>(null);
  const [clauseUncoverageHTML, setClauseUncoverageHTML] = useState<string | null>(null);
  const trustMetaProfile = useRecoilValue(trustMetaProfileState);

  /**
   * Creates object that maps patient ids to their name/DOB info strings.
   * @returns { Object } mapping of patient ids to patient info labels
   */
  const createPatientLabels = () => {
    const patientLabels: Record<string, string> = {};
    Object.keys(currentPatients).forEach(id => {
      patientLabels[id] = getPatientInfoString(currentPatients[id].patient);
    });
    return patientLabels;
  };

  /**
   * Uses fqm-execution library to perform calculation on all patients and return their
   * detailed results.
   * @returns { Array | void } array of detailed results (if measure bundle is provided)
   */
  const calculateDetailedResults = async (): Promise<DetailedResult[] | void> => {
    // specify options for calculation
    const options: CalculatorTypes.CalculationOptions = {
      calculateHTML: false,
      calculateSDEs: true,
      calculateClauseCoverage: true,
      calculateClauseUncoverage: true,
      reportType: 'individual',
      measurementPeriodStart: measurementPeriod.start?.toISOString(),
      measurementPeriodEnd: measurementPeriod.end?.toISOString(),
      trustMetaProfile: trustMetaProfile
    };

    // get all patient bundles as array to feed into fqm-execution
    const patientBundles: fhir4.Bundle[] = [];
    Object.keys(currentPatients).forEach(id => {
      const bundle = createPatientBundle(currentPatients[id].patient, currentPatients[id].resources);
      patientBundles.push(bundle);
    });

    if (measureBundle.content) {
      const { results, coverageHTML, groupClauseUncoverageHTML } = await Calculator.calculate(measureBundle.content, patientBundles, options);
      if (coverageHTML) {
        setClauseCoverageHTML(coverageHTML);
      }
      if (groupClauseUncoverageHTML){
        // TODO: use groupClauseUncoverageHTML key (the group id) to separate this HTML into multiple tabs (or similar)
        setClauseUncoverageHTML(Object.values(groupClauseUncoverageHTML).join('<br>')); 
      }
      return results;
    } else return;
  };

  /**
   * Wrapper function that calls calculateDetailedResults() and creates the LabeledDetailedResult that will be used to render
   * the population results. Catches errors in fqm-execution that result from calculateDetailedResults().
   */
  const runCalculation = () => {
    calculateDetailedResults()
      .then(detailedResults => {
        if (detailedResults) {
          const patientLabels = createPatientLabels();
          const labeledDetailedResults: LabeledDetailedResult[] = [];
          detailedResults.forEach(dr => {
            const patientId = dr.patientId;
            labeledDetailedResults.push({
              label: patientId ? patientLabels[patientId] : '',
              detailedResult: dr as DetailedResult
            });
          });
          setDetailedResults(labeledDetailedResults);
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
          <Group position="center">
            <Button
              data-testid="calculate-all-button"
              aria-label="Calculate Population Results"
              styles={{ root: { marginTop: 20 } }}
              onClick={() => runCalculation()}
              variant="outline"
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
                variant="outline"
              >
                &nbsp;Show Table
              </Button>
            </Tooltip>
            <Tooltip
              label="Disabled until calculation results are available"
              openDelay={1000}
              disabled={enableClauseCoverageButton}
            >
              <Button
                data-testid="show-coverage-button"
                aria-label="Show Clause Coverage"
                styles={{ root: { marginTop: 20 } }}
                disabled={!enableClauseCoverageButton}
                variant="outline"
                onClick={() => {
                  if (measureBundle.content) {
                    router.push(
                      {
                        pathname: `/${measureBundle.content.id}/coverage`,
                        query: {
                          clauseCoverageHTML,
                          clauseUncoverageHTML
                        }
                      },
                      `/${measureBundle.content.id}/coverage`
                    );
                  }
                }}
              >
                &nbsp;Show Clause Coverage
              </Button>
            </Tooltip>
          </Group>
          {detailedResults.length > 0 && (
            <>
              <Drawer
                opened={opened}
                onClose={() => setOpened(false)}
                position="bottom"
                padding="md"
                overlayProps={{
                  opacity: 0.3
                }}
                lockScroll={false}
                size="lg"
                styles={{
                  body: {
                    height: '100%'
                  }
                }}
              >
                <h2>Population Results</h2>
                <div
                  data-testid="results-table"
                  style={{
                    height: '100%',
                    overflow: 'scroll'
                  }}
                >
                  <PopulationResultTable results={detailedResults} />
                </div>
              </Drawer>
            </>
          )}
        </Center>
      )}
    </>
  );
}
