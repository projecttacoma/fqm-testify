import { Center, createStyles, Grid, Loader, Text } from '@mantine/core';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { selectedPatientState } from '../state/atoms/selectedPatient';
import PatientCreationPanel from './patient-creation/PatientCreationPanel';
import ResourcePanel from './resource-creation/ResourcePanel';
import MeasureHighlightingPanel from './calculation/MeasureHighlightingPanel';
import { getPatientNameString } from '../util/fhir';
import { patientTestCaseState } from '../state/atoms/patientTestCase';
import { calculationLoading } from '../state/atoms/calculationLoading';
import { CircleCheck } from 'tabler-icons-react';

const useStyles = createStyles({
  panel: {
    maxHeight: '100%',
    overflow: 'scroll'
  },
  header: {
    maxHeight: '100%',
    overflow: 'hidden'
  }
});

export default function TestCaseEditor() {
  const selectedPatient = useRecoilValue(selectedPatientState);
  const currentPatients = useRecoilValue(patientTestCaseState);
  const isCalculationLoading = useRecoilValue(calculationLoading);
  const { classes } = useStyles();

  const renderPanelPlaceholderText = () => {
    return (
      <Text color="dimmed">
        <i>Select a patient to add resources and see more information</i>
      </Text>
    );
  };

  return (
    <>
      <Grid style={{ height: '85vh' }}>
        <Grid.Col span={3} className={classes.panel}>
          <PatientCreationPanel />
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
          <ResourcePanel />
        </Grid.Col>
        <Grid.Col span={6} className={classes.header} sx={theme => ({ backgroundColor: theme.colors.gray[1] })}>
          {selectedPatient ? (
            <Grid justify="space-between">
              <Grid.Col span={4}>
                Patient Calculation: {getPatientNameString(currentPatients[selectedPatient].patient)}
              </Grid.Col>
              <Center style={{ paddingRight: 20 }}>
                {isCalculationLoading ? (
                  <Center>
                    <Loader size={40} />
                    <Text color="dimmed">
                      <i>Calculating...</i>
                    </Text>
                  </Center>
                ) : (
                  <Center>
                    <CircleCheck color="green" size={40} />
                    <Text color="dimmed">
                      <i>Up to date</i>
                    </Text>
                  </Center>
                )}
              </Center>
            </Grid>
          ) : (
            renderPanelPlaceholderText()
          )}
          <Grid.Col className={classes.panel}>
            {selectedPatient ? <MeasureHighlightingPanel patientId={selectedPatient} /> : ''}
          </Grid.Col>
        </Grid.Col>
      </Grid>
    </>
  );
}
