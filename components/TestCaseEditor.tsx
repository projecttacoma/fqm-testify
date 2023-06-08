import {
  Accordion,
  Box,
  Center,
  createStyles,
  Grid,
  Group,
  Loader,
  ScrollArea,
  Space,
  Stack,
  Text
} from '@mantine/core';
import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { selectedPatientState } from '../state/atoms/selectedPatient';
import PatientCreationPanel from './patient-creation/PatientCreationPanel';
import ResourcePanel from './resource-creation/ResourcePanel';
import MeasureHighlightingPanel from './calculation/MeasureHighlightingPanel';
import { calculationLoading } from '../state/atoms/calculationLoading';
import { CircleCheck } from 'tabler-icons-react';
import PopulationComparisonTable from './calculation/PopulationComparisonTable';
import PopulationComparisonTablePopover from './calculation/PopulationComparisonTableControl';

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
  highlighting: {
    maxHeight: 'calc(100% - 50px)',
    overflowY: 'scroll',
    flex: 1
  },
  accordionControlBox: {
    display: 'flex',
    alignItems: 'center'
  }
}));

export default function TestCaseEditor() {
  const isCalculationLoading = useRecoilValue(calculationLoading);
  const selectedPatient = useRecoilValue(selectedPatientState);
  const [accValue, setAccValue] = useState<string | null>('table');

  const { classes, cx } = useStyles();

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
          <Stack h={50}>
            {selectedPatient ? (
              <Group position="right">
                <Center pr={20}>
                  {isCalculationLoading ? (
                    <Center>
                      <Loader size={40} />
                      <Text italic color="dimmed">
                        Calculating...
                      </Text>
                    </Center>
                  ) : (
                    <Center>
                      <CircleCheck color="green" size={40} />
                      <Text italic color="dimmed">
                        Up to date
                      </Text>
                    </Center>
                  )}
                </Center>
              </Group>
            ) : (
              renderPanelPlaceholderText()
            )}
          </Stack>
          <Space />
          <ScrollArea style={accValue ? { flex: 1 } : {}}>
            {selectedPatient ? (
              <Accordion chevronPosition="left" defaultValue="table" value={accValue} onChange={setAccValue}>
                <Accordion.Item value="table">
                  <Box className={classes.accordionControlBox}>
                    <Accordion.Control>
                      <Text size="xl" weight={700}>
                        Population Comparison Table
                      </Text>
                    </Accordion.Control>
                    <PopulationComparisonTablePopover />
                  </Box>
                  <Accordion.Panel>
                    <PopulationComparisonTable patientId={selectedPatient} />
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            ) : (
              ''
            )}
          </ScrollArea>
          {selectedPatient && (
            <Stack className={classes.highlighting}>
              <MeasureHighlightingPanel patientId={selectedPatient} />
            </Stack>
          )}
        </Grid.Col>
      </Grid>
    </>
  );
}
