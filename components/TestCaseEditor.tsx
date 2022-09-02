import { Card, createStyles, Grid, Text } from '@mantine/core';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { selectedPatientState } from '../state/atoms/selectedPatient';
import PatientCreationPanel from './patient-creation/PatientCreationPanel';
import ResourcePanel from './resource-creation/ResourcePanel';
import MeasureHighlightingPanel from './calculation/MeasureHighlightingPanel';
import { measureBundleState } from '../state/atoms/measureBundle';
import { measurementPeriodStringState } from '../state/selectors/measurementPeriodString';

const useStyles = createStyles({
  panel: {
    maxHeight: '100%',
    overflow: 'scroll',
    flexGrow: 3
  }
});

export default function TestCaseEditor() {
  const selectedPatient = useRecoilValue(selectedPatientState);
  const measurementPeriodString = useRecoilValue(measurementPeriodStringState);
  const measureBundle = useRecoilValue(measureBundleState);

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
      <Grid style={{ height: '70vh' }}>
        <Grid.Col span={12} sx={theme => ({ backgroundColor: 'black', height: 'fit-content' })}>
          <div
            style={{
              display: 'flex',
              marginLeft: 15,
              marginRight: 15,
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Card sx={theme => ({ width: 'fit-content' })}>
              <Text size="md" color="dimmed">
                {measureBundle.name}
              </Text>
              <Text size="sm" color="dimmed">
                {measurementPeriodString}
              </Text>
            </Card>
            <Text color="dimmed" size="xl">
              FQM Testify: an eCQM Analysis Tool
            </Text>
          </div>
        </Grid.Col>
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
        <Grid.Col span={6} className={classes.panel} sx={theme => ({ backgroundColor: theme.colors.gray[1] })}>
          {selectedPatient ? <MeasureHighlightingPanel patientId={selectedPatient} /> : renderPanelPlaceholderText()}
        </Grid.Col>
      </Grid>
    </>
  );
}
