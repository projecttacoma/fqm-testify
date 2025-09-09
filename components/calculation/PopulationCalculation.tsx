import {
  Button,
  Center,
  CopyButton,
  Drawer,
  Grid,
  Group,
  Menu,
  Modal,
  Radio,
  Select,
  Space,
  Text,
  Tooltip,
  useMantineTheme
} from '@mantine/core';
import CodeMirror from '@uiw/react-codemirror';
import { useRecoilValue } from 'recoil';
import { Calculator, CalculatorTypes } from 'fqm-execution';
import { patientTestCaseState, TestCaseInfo } from '../../state/atoms/patientTestCase';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { useState } from 'react';
import { measurementPeriodFormattedState } from '../../state/atoms/measurementPeriod';
import { showNotification } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconChevronDown,
  IconCircleCheck,
  IconCopy,
  IconPackage,
  IconSquareCheck
} from '@tabler/icons';
import { getPatientInfoString, getPatientNameString } from '../../util/fhir/patient';
import { createDataExchangeMeasureReport, createPatientBundle } from '../../util/fhir/resourceCreation';
import PopulationResultTable, { LabeledDetailedResult } from './PopulationResultsTable';
import { DetailedResult } from '../../util/types';
import { useRouter } from 'next/router';
import { trustMetaProfileState } from '../../state/atoms/trustMetaProfile';
import { useDisclosure } from '@mantine/hooks';
import { evaluationState } from '../../state/atoms/evaluation';
import { dataRequirementsLookupByType } from '../../state/selectors/dataRequirementsLookupByType';
import { minimizeTestCaseResources } from '../../util/ValueSetHelper';
import { v4 as uuidv4 } from 'uuid';

export default function PopulationCalculation() {
  const router = useRouter();

  const currentPatients = useRecoilValue(patientTestCaseState);
  const measureBundle = useRecoilValue(measureBundleState);
  const measurementPeriodFormatted = useRecoilValue(measurementPeriodFormattedState);
  const { evaluationServiceUrl, evaluationMeasureId } = useRecoilValue(evaluationState);
  const drLookupByType = useRecoilValue(dataRequirementsLookupByType);
  const [detailedResults, setDetailedResults] = useState<LabeledDetailedResult[]>([]);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [enableTableButton, setEnableTableButton] = useState(false);
  const [enableClauseCoverageButton, setEnableClauseCoverageButton] = useState(false);
  const [enableEvaluateButton, setEnableEvaluateButton] = useState(false);
  const [clauseCoverageHTML, setClauseCoverageHTML] = useState<string | null>(null);
  const [clauseUncoverageHTML, setClauseUncoverageHTML] = useState<string | null>(null);
  const trustMetaProfile = useRecoilValue(trustMetaProfileState);
  const [reportTypeValue, setReportTypeValue] = useState('population');
  const [subjectValue, setSubjectValue] = useState<string | null>('');
  const [subjectData, setSubjectData] = useState<{ value: string; label: string }[]>([]);
  const [evaluateText, setEvaluateText] = useState<string>('');
  const theme = useMantineTheme();

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
   * POSTS patient data in conformance with https://build.fhir.org/ig/HL7/davinci-deqm/OperationDefinition-submit-data.html
   * without using Measure/$deqm-submit-data endpoint
   * Each transaction bundle should contain DEQM Data Exchange MeasureReports with data-of-interest
   * and should be for a single subject (will do a separate POST for each patient)
   * @param proto: true if we should do a proto submit data that simply POSTs transaction bundles
   * @returns { {postedId: string, testCaseInfo: testCaseInfo}|undefined[] } objects with the evaluation service ids for POSTed patients (may be different than sent IDs or undefined if send was unsuccessful) and the corresponding test case information
   */
  const submitDataToEvaluationService = async (
    proto: boolean
  ): Promise<({ postedId: string; testCaseInfo: TestCaseInfo } | undefined)[]> => {
    const measure = measureBundle.content?.entry?.find(e => e.resource?.resourceType === 'Measure')
      ?.resource as fhir4.Measure;

    const patientIds = Object.keys(currentPatients);
    const bundles = patientIds.map(id => {
      return createPatientBundle(
        currentPatients[id].patient,
        minimizeTestCaseResources(currentPatients[id], measureBundle.content, drLookupByType),
        currentPatients[id].fullUrl,
        createDataExchangeMeasureReport(measure, measurementPeriodFormatted as fhir4.Period, id)
      );
    });

    let responseBundles: (fhir4.Bundle | undefined)[] = [];
    if (proto) {
      // Simple POST
      const bundlePromises = bundles.map(async (bundle, idx) => {
        const response = await fetch(`${evaluationServiceUrl}/`, {
          method: 'POST',
          body: JSON.stringify(bundle),
          headers: { 'Content-Type': 'application/json+fhir' }
        });
        const responseBody: fhir4.Bundle | fhir4.OperationOutcome = await response.json();
        if (responseBody.resourceType === 'OperationOutcome') {
          showNotification({
            icon: <IconAlertCircle />,
            title: 'Patient data submission failed',
            message: `Submitting data for Patient: ${getPatientNameString(
              currentPatients[patientIds[idx]].patient
            )} failed with details: "${responseBody.issue[0].details?.text ?? response.status}"`,
            color: 'red'
          });
          return undefined;
        }
        return responseBody;
      });
      responseBundles = await Promise.all(bundlePromises);
    } else {
      // full $submit-data
      const parameters = {
        resourceType: 'Parameters',
        parameter: bundles.map(bundle => {
          return {
            name: 'bundle',
            resource: bundle
          };
        })
      };
      const response = await fetch(`${evaluationServiceUrl}/Measure/$submit-data`, {
        method: 'POST',
        body: JSON.stringify(parameters),
        headers: { 'Content-Type': 'application/json+fhir' }
      });
      const responseBody: fhir4.Parameters | fhir4.OperationOutcome = await response.json();
      if (responseBody.resourceType === 'OperationOutcome') {
        showNotification({
          icon: <IconAlertCircle />,
          title: '$submit-data failure',
          message: `$submit-data operation failed with details: "${
            responseBody.issue[0].details?.text ?? response.status
          }"`,
          color: 'red'
        });
      } else if (!responseBody.parameter) {
        showNotification({
          icon: <IconAlertCircle />,
          title: '$submit-data no parameters',
          message: `$submit-data operation received a response with no parameters`,
          color: 'red'
        });
      } else {
        responseBundles = responseBody.parameter.map(p => p.resource as fhir4.Bundle);
      }
    }

    const postedIds = responseBundles.map((bundle, idx) => {
      // should be transaction response bundles from which we can pull the posted patient id
      const locationId = bundle?.entry
        ?.find(e => e.response?.location?.includes('Patient/'))
        ?.response?.location?.split('Patient/')[1];
      return locationId ? { postedId: locationId, testCaseInfo: currentPatients[patientIds[idx]] } : undefined;
    });
    return postedIds;
  };

  /**
   * Wrapper function that calls submitDataToEvaluationService() and resolves patient data for future evaluation
   */
  const submitData = (proto = false) => {
    submitDataToEvaluationService(proto)
      .then(postedIds => {
        const resolvedIds = postedIds?.filter(idObj => idObj !== undefined);
        if (resolvedIds.length > 0) {
          showNotification({
            icon: <IconCircleCheck />,
            title: 'Successfully sent data',
            message: `Successfully sent data for ${resolvedIds.length} patients for measure ${evaluationMeasureId}`, //TODO: update to canonical, currently using evaluationMeasureId here whereas it will be used for $submit-data in the future
            color: 'green'
          });
          const subjectData = resolvedIds.map(idObj => {
            return idObj
              ? { value: idObj.postedId, label: getPatientNameString(idObj.testCaseInfo.patient) }
              : { value: '', label: '' };
          });
          subjectData.unshift({ value: 'All', label: 'All' });
          setSubjectData(subjectData);
          setEnableEvaluateButton(true);
        } else {
          showNotification({
            icon: <IconAlertCircle />,
            title: 'No patient information',
            message: 'No patient information was successfully POSTed to the Evaluation Service',
            color: 'red'
          });
        }
      })
      .catch(e => {
        if (e instanceof Error) {
          showNotification({
            icon: <IconAlertCircle />,
            title: 'Data Submission Error',
            message: e.message,
            color: 'red'
          });
        }
      });
  };

  // TODO: should be constrained to Parameters in the future
  const sendEvaluate = async (): Promise<fhir4.Bundle | fhir4.Parameters | undefined> => {
    const parameters: fhir4.Parameters = {
      resourceType: 'Parameters',
      parameter: [
        {
          name: 'measureId',
          valueString: evaluationMeasureId
        },
        {
          name: 'periodStart',
          valueDate: measurementPeriodFormatted?.start.split('T')[0]
        },
        {
          name: 'periodEnd',
          valueDate: measurementPeriodFormatted?.end.split('T')[0]
        },
        {
          name: 'reportType',
          valueString: reportTypeValue
        }
      ]
    };
    if (reportTypeValue === 'subject' && subjectValue) {
      if (subjectValue === 'All') {
        const groupId = uuidv4();
        parameters.parameter?.push({
          name: 'subjectGroup',
          resource: {
            resourceType: 'Group',
            id: groupId,
            type: 'person',
            actual: true,
            member: subjectData.slice(1).map(subjectInfo => {
              return {
                entity: {
                  reference: `Patient/${subjectInfo.value}`
                }
              };
            })
          }
        });
        parameters.parameter?.push({
          name: 'subject',
          valueString: `Group/${groupId}`
        });
      } else {
        parameters.parameter?.push({
          name: 'subject',
          valueString: `Patient/${subjectValue}`
        });
      }
    }
    const response = await fetch(`${evaluationServiceUrl}/Measure/$evaluate`, {
      method: 'POST',
      body: JSON.stringify(parameters),
      headers: { 'Content-Type': 'application/json+fhir' }
    });
    const responseBody: fhir4.Bundle | fhir4.Parameters | fhir4.OperationOutcome = await response.json();
    if (responseBody.resourceType === 'OperationOutcome') {
      showNotification({
        icon: <IconAlertCircle />,
        title: 'Evaluation operation failed',
        message: `Evaluation call failed with details: "${responseBody.issue[0].details?.text ?? response.status}"`,
        color: 'red'
      });
      return;
    }

    return responseBody;
  };

  /**
   * Wrapper function that calls sendEvaluate() and populates the results view
   */
  const onEvaluate = (): void => {
    setEvaluateText(''); // clear text until evaluation is done
    sendEvaluate()
      .then(response => {
        if (response) {
          setEvaluateText(JSON.stringify(response, null, 2));
        }
      })
      .catch(e => {
        if (e instanceof Error) {
          showNotification({
            icon: <IconAlertCircle />,
            title: 'Evaluation Error',
            message: e.message,
            color: 'red'
          });
        }
      });
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
      measurementPeriodStart: measurementPeriodFormatted?.start,
      measurementPeriodEnd: measurementPeriodFormatted?.end,
      trustMetaProfile: trustMetaProfile
    };

    // get all patient bundles as array to feed into fqm-execution
    const patientBundles: fhir4.Bundle[] = [];
    Object.keys(currentPatients).forEach(id => {
      const bundle = createPatientBundle(currentPatients[id].patient, currentPatients[id].resources);
      patientBundles.push(bundle);
    });

    if (measureBundle.content) {
      const { results, groupClauseCoverageHTML, groupClauseUncoverageHTML } = await Calculator.calculate(
        measureBundle.content,
        patientBundles,
        options
      );
      if (groupClauseCoverageHTML) {
        setClauseCoverageHTML(JSON.stringify(groupClauseCoverageHTML));
      }
      if (groupClauseUncoverageHTML) {
        setClauseUncoverageHTML(JSON.stringify(groupClauseUncoverageHTML));
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
          setDrawerOpened(true);
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
                onClick={() => setDrawerOpened(true)}
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
            <Menu>
              <Menu.Target>
                <Button
                  styles={{ root: { marginTop: 20 } }}
                  variant="outline"
                  rightIcon={<IconChevronDown size={18} />}
                >
                  Submit Data
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  onClick={() => submitData()}
                  icon={<IconPackage color={theme.colors.green[6]} stroke={1.5} />}
                >
                  $submit-data
                </Menu.Item>
                <Menu.Item
                  onClick={() => submitData(true)}
                  icon={<IconSquareCheck color={theme.colors.yellow[6]} stroke={1.5} />}
                >
                  POST data
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
            <Tooltip
              label="Disabled until data submission has succeeeded"
              openDelay={1000}
              disabled={enableEvaluateButton}
            >
              <Button
                data-testid="evaluate-button"
                aria-label="Evaluate"
                styles={{ root: { marginTop: 20 } }}
                disabled={!enableEvaluateButton}
                onClick={open}
                variant="outline"
              >
                &nbsp;Evaluate
              </Button>
            </Tooltip>
          </Group>
          {detailedResults.length > 0 && (
            <>
              <Drawer
                opened={drawerOpened}
                onClose={() => setDrawerOpened(false)}
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
          <Modal centered size="xl" withCloseButton={true} opened={opened} onClose={close}>
            <Grid align="center" justify="center">
              <Grid.Col>
                <Center>
                  <Text weight={700} align="center" lineClamp={2}>
                    Evaluate
                  </Text>
                </Center>
              </Grid.Col>
              <Grid.Col>
                <Center>
                  <Radio.Group
                    value={reportTypeValue}
                    onChange={setReportTypeValue}
                    name="reportType"
                    label="Select the report type:"
                  >
                    <Group mt="xs">
                      <Radio value="population" label="population" />
                      <Radio value="subject" label="subject" />
                    </Group>
                  </Radio.Group>
                  <Space w="xl" />
                  <Select
                    label="Select subject:"
                    data={subjectData}
                    value={subjectValue}
                    onChange={setSubjectValue}
                    disabled={reportTypeValue === 'population'}
                    searchable={true}
                  />
                </Center>
              </Grid.Col>

              <Grid.Col>
                <Center>
                  <Group pt={8}>
                    <Button onClick={() => onEvaluate()}>Evaluate</Button>
                    <Button variant="default" onClick={close}>
                      Cancel
                    </Button>
                  </Group>
                </Center>
              </Grid.Col>
              <Grid.Col>
                <CopyButton value={evaluateText}>
                  {({ copied, copy }) => (
                    <Button color={copied ? 'teal' : 'blue'} onClick={copy}>
                      <IconCopy />
                    </Button>
                  )}
                </CopyButton>
                <Text lineClamp={4}>
                  <CodeMirror
                    data-autofocus
                    data-testid="codemirror"
                    height="300px"
                    value={evaluateText}
                    theme="light"
                    editable={false}
                    placeholder="Waiting for $evaluate response..."
                  />
                </Text>
              </Grid.Col>
            </Grid>
          </Modal>
        </Center>
      )}
    </>
  );
}
