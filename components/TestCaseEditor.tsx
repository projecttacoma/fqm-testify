import { createStyles, Grid, Text } from '@mantine/core';
import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { patientTestCaseState } from '../state/atoms/patientTestCase';
import { selectedPatientState } from '../state/atoms/selectedPatient';
import PatientCreationPanel from './patient-creation/PatientCreationPanel';
import ResourcePanel from './resource-creation/ResourcePanel';
import MeasureHighlightingPanel from './calculation/MeasureHighlightingPanel';

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

export default function TestCaseEditor() {
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<string | null>(null);

  const selectedPatient = useRecoilValue(selectedPatientState);
  const currentPatients = useRecoilValue(patientTestCaseState);

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

  return (
    <>
      <Grid style={{ height: '70vh' }}>
        <Grid.Col span={3} className={classes.panel}>
          <PatientCreationPanel {...{ openPatientModal, closePatientModal, isPatientModalOpen, currentPatient }} />
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
