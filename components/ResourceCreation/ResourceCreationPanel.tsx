import { Button, Center, createStyles, Divider, Grid, Loader, Text } from '@mantine/core';
import React, { Suspense, useState } from 'react';
import produce from 'immer';
import parse from 'html-react-parser';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { useRecoilState, useRecoilValue } from 'recoil';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { selectedPatientState } from '../../state/atoms/selectedPatient';
import PatientCreation from './PatientCreation';
import TestResourcesDisplay from './TestResourcesDisplay';
import { createPatientBundle, getPatientNameString } from '../../util/fhir';
import { IconAlertCircle } from '@tabler/icons';
import { showNotification } from '@mantine/notifications';
import TestResourceCreation from './TestResourceCreation';
import { Calculator, CalculatorTypes } from 'fqm-execution';
import { measurementPeriodState } from '../../state/atoms/measurementPeriod';

const useStyles = createStyles({
  highlightedMarkup: {
    '& pre': {
      whiteSpace: 'pre-wrap'
    }
  },
  panel: {
    maxHeight: '100%',
    overflow: 'scroll'
  }
});

export default function ResourceCreationPanel() {
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<string | null>(null);

  const selectedPatient = useRecoilValue(selectedPatientState);
  const [currentPatients, setCurrentPatients] = useRecoilState(patientTestCaseState);
  const measureBundle = useRecoilValue(measureBundleState);
  const measurementPeriod = useRecoilValue(measurementPeriodState);

  const { classes } = useStyles();

  const openPatientModal = (patientId?: string) => {
    if (patientId && Object.keys(currentPatients).includes(patientId)) {
      setCurrentPatient(patientId);
    } else {
      setCurrentPatient(null);
    }

    setIsPatientModalOpen(true);
  };

  const closePatientModal = () => {
    setIsPatientModalOpen(false);
    setCurrentPatient(null);
  };

  const renderPanelPlaceholderText = () => {
    return (
      <Text color="dimmed">
        <i>Select a patient to add resources and see more information</i>
      </Text>
    );
  };

  const renderDataElements = () => {
    if (Object.keys(currentPatients).length === 0 || selectedPatient == null) {
      return renderPanelPlaceholderText();
    }
    return (
      <Suspense
        fallback={
          <Center>
            <Loader />
          </Center>
        }
      >
        <Text>
          {getPatientNameString(currentPatients[selectedPatient].patient)} Resources (
          {currentPatients[selectedPatient].resources.length})
        </Text>
        <div
          style={{
            paddingTop: '12px'
          }}
        >
          <TestResourcesDisplay />
          <Divider my="lg" />
        </div>
      </Suspense>
    );
  };

  const clickCalculateButton = async (id: string | null) => {
    try {
      await calculate(id);
    } catch (error) {
      if (error instanceof Error) {
        showNotification({
          icon: <IconAlertCircle />,
          title: 'Calculation Error',
          message: error.message,
          color: 'red'
        });
      }
    }
  };

  // Function to calculate the selected patient's measure report
  const calculate = async (id: string | null) => {
    const options: CalculatorTypes.CalculationOptions = {
      calculateHTML: true,
      // TODO: Flip this to true once a new fqm-execution version is released/dependency is updated
      calculateSDEs: false,
      reportType: 'individual',
      measurementPeriodStart: measurementPeriod.start?.toISOString(),
      measurementPeriodEnd: measurementPeriod.end?.toISOString()
    };

    if (id && measureBundle.content) {
      const patientBundle = createPatientBundle(currentPatients[id].patient, currentPatients[id].resources);

      const mrResults = await Calculator.calculateMeasureReports(measureBundle.content, [patientBundle], options);
      const [measureReport] = mrResults.results as fhir4.MeasureReport[];

      const nextPatientState = produce(currentPatients, draftState => {
        draftState[id].measureReport = measureReport;
      });

      setCurrentPatients(nextPatientState);
    }
  };

  return (
    <>
      <Grid style={{ height: '70vh' }}>
        <Grid.Col span={3} className={classes.panel}>
          <PatientCreation {...{ openPatientModal, closePatientModal, isPatientModalOpen, currentPatient }} />
        </Grid.Col>
        <Grid.Col
          span={3}
          className={classes.panel}
          sx={theme => ({
            backgroundColor: theme.colors.gray[1],
            borderLeft: `2px solid ${theme.colors.gray[4]}`,
            borderRight: `2px solid ${theme.colors.gray[4]}`
          })}
        >
          {renderDataElements()}
          <TestResourceCreation />
        </Grid.Col>
        <Grid.Col span={6} className={classes.panel} sx={theme => ({ backgroundColor: theme.colors.gray[1] })}>
          {selectedPatient ? (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}
              >
                <Button
                  onClick={() => {
                    clickCalculateButton(selectedPatient);
                  }}
                  variant="outline"
                >
                  Calculate
                </Button>
              </div>
              <div className={classes.highlightedMarkup}>
                {parse(currentPatients[selectedPatient].measureReport?.text?.div || '')}
              </div>
            </>
          ) : (
            renderPanelPlaceholderText()
          )}
        </Grid.Col>
      </Grid>
    </>
  );
}
