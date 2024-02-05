import { createStyles, Grid, Text } from '@mantine/core';
import React, { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { selectedPatientState } from '../state/atoms/selectedPatient';
import PatientCreationPanel from './patient-creation/PatientCreationPanel';
import ResourcePanel from './resource-creation/ResourcePanel';
import { detailedResultLookupState } from '../state/atoms/detailedResultLookup';
import PopulationResults from './calculation/PopuulationResults';

const useStyles = createStyles(theme => ({
  resourcePanelRoot: {
    backgroundColor: theme.colors.gray[1],
    borderLeft: `2px solid ${theme.colors.gray[4]}`,
    borderRight: `2px solid ${theme.colors.gray[4]}`
  },
  highlightPanelRoot: {
    backgroundColor: theme.colors.gray[1]
  },
  gridContainer: {
    height: 'calc(100vh - 120px)'
  },
  panel: {
    maxHeight: '100%',
    overflowY: 'scroll'
  },
  calculation: {
    maxHeight: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  tabsPanel: {
    maxHeight: 'calc(100% - 75px)',
    display: 'flex',
    flexDirection: 'column'
  },
  highlighting: {
    maxHeight: 'calc(100% - 50px)',
    overflowY: 'scroll',
    flex: 1
  },
  tabsList: {
    height: '75px'
  }
}));

export default function TestCaseEditor() {
  const selectedPatient = useRecoilValue(selectedPatientState);
  const detailedResultLookup = useRecoilValue(detailedResultLookupState);

  const { classes, cx } = useStyles();

  const detailedResults = useMemo(() => {
    if (selectedPatient) {
      return detailedResultLookup[selectedPatient]?.detailedResults;
    }
  }, [detailedResultLookup, selectedPatient]);

  const renderPanelPlaceholderText = () => {
    return (
      <Text color="dimmed">
        <i>Select a patient to add resources and see more information</i>
      </Text>
    );
  };

  return (
    <>
      <Grid className={classes.gridContainer}>
        <Grid.Col span={3} className={classes.panel}>
          <PatientCreationPanel />
        </Grid.Col>
        <Grid.Col span={3} className={cx(classes.panel, classes.resourcePanelRoot)}>
          <ResourcePanel />
        </Grid.Col>
        <Grid.Col span={6} className={cx(classes.calculation, classes.highlightPanelRoot)}>
          {selectedPatient && detailedResults ? (
            <PopulationResults detailedResults={detailedResults} patientId={selectedPatient} />
          ) : (
            renderPanelPlaceholderText()
          )}
        </Grid.Col>
      </Grid>
    </>
  );
}
