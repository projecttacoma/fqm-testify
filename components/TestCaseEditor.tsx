import { createStyles, Grid, Text } from '@mantine/core';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { selectedPatientState } from '../state/atoms/selectedPatient';
import PatientCreationPanel from './patient-creation/PatientCreationPanel';
import ResourcePanel from './resource-creation/ResourcePanel';
import MeasureHighlightingPanel from './calculation/MeasureHighlightingPanel';

const useStyles = createStyles({
  panel: {
    maxHeight: '100%',
    overflow: 'scroll'
  }
});

export default function TestCaseEditor() {
  const selectedPatient = useRecoilValue(selectedPatientState);

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
