import { Accordion, Box, Center, createStyles, Grid, Loader, ScrollArea, Space, Text } from '@mantine/core';
import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { selectedPatientState } from '../state/atoms/selectedPatient';
import PatientCreationPanel from './patient-creation/PatientCreationPanel';
import ResourcePanel from './resource-creation/ResourcePanel';
import MeasureHighlightingPanel from './calculation/MeasureHighlightingPanel';
import { patientTestCaseState } from '../state/atoms/patientTestCase';
import { calculationLoading } from '../state/atoms/calculationLoading';
import { CircleCheck } from 'tabler-icons-react';
import { getPatientNameString } from '../util/fhir/patient';
import PopulationComparisonTable from './calculation/PopulationComparisonTable';
import PopulationComparisonTableControl from './calculation/PopulationComparisonTableControl';

const useStyles = createStyles({
  panel: {
    maxHeight: '100%',
    overflow: 'scroll'
  },
  calculation: {
    maxHeight: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  highlighting: {
    flex: 1,
    overflow: 'scroll'
  }
});
function LoadingSpinner() {
  const isCalculationLoading = useRecoilValue(calculationLoading);

  return (
    <>
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
    </>
  );
}

export default function TestCaseEditor() {
  const selectedPatient = useRecoilValue(selectedPatientState);
  const currentPatients = useRecoilValue(patientTestCaseState);
  const { classes } = useStyles();
  const [accValue, setAccValue] = useState<string | null>('table');

  const renderPanelPlaceholderText = () => {
    return (
      <Text color="dimmed">
        <i>Select a patient to add resources and see more information</i>
      </Text>
    );
  };

  return (
    <>
      <Grid style={{ height: 'calc(100vh - 120px)' }}>
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
        <Grid.Col span={6} className={classes.calculation} sx={theme => ({ backgroundColor: theme.colors.gray[1] })}>
          <Box h={50}>
            {selectedPatient ? (
              <Grid justify="space-between">
                <Grid.Col span={4}>
                  Patient Calculation: {getPatientNameString(currentPatients[selectedPatient].patient)}
                </Grid.Col>
                <LoadingSpinner />
              </Grid>
            ) : (
              renderPanelPlaceholderText()
            )}
          </Box>
          <Space />
          <ScrollArea style={accValue ? { flex: 1 } : {}}>
            {selectedPatient ? (
              <Accordion chevronPosition="left" defaultValue="table" value={accValue} onChange={setAccValue}>
                <Accordion.Item value="table">
                  <Accordion.Control>
                    <PopulationComparisonTableControl />
                  </Accordion.Control>
                  <Accordion.Panel>
                    <PopulationComparisonTable patientId={selectedPatient} />
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            ) : (
              ''
            )}
          </ScrollArea>
          <ScrollArea className={classes.highlighting}>
            {selectedPatient ? <MeasureHighlightingPanel patientId={selectedPatient} /> : ''}
          </ScrollArea>
        </Grid.Col>
      </Grid>
    </>
  );
}
