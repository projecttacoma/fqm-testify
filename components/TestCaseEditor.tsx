import { Center, createStyles, Grid, Group, Loader, Space, Stack, Tabs, Text } from '@mantine/core';
import React, { useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { selectedPatientState } from '../state/atoms/selectedPatient';
import PatientCreationPanel from './patient-creation/PatientCreationPanel';
import ResourcePanel from './resource-creation/ResourcePanel';
import MeasureHighlightingPanel from './calculation/MeasureHighlightingPanel';
import { calculationLoading } from '../state/atoms/calculationLoading';
import { detailedResultLookupState } from '../state/atoms/detailedResultLookup';
import { CircleCheck } from 'tabler-icons-react';
import PopulationComparisonTable from './calculation/PopulationComparisonTable';

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
  const isCalculationLoading = useRecoilValue(calculationLoading);
  const selectedPatient = useRecoilValue(selectedPatientState);
  const detailedResultLookup = useRecoilValue(detailedResultLookupState);
  const [activeTab, setActiveTab] = useState<string | null>('first');

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
          {selectedPatient ? (
            <Tabs value={activeTab} onTabChange={setActiveTab} className={classes.calculation}>
              <Tabs.List className={classes.tabsList}>
                {detailedResults?.map(dr => (
                  <Tabs.Tab value={dr.groupId} key={dr.groupId}>
                    {dr.groupId}
                  </Tabs.Tab>
                ))}
              </Tabs.List>
              {detailedResults?.map(dr => (
                <Tabs.Panel value={dr.groupId} key={dr.groupId} className={classes.tabsPanel}>
                  <Stack h={50}>
                    <Group position="right">
                      <Center pr={20}>
                        {isCalculationLoading ? (
                          <Center>
                            <Loader size={24} />
                            <Text italic color="dimmed" pl={4}>
                              Calculating...
                            </Text>
                          </Center>
                        ) : (
                          <Center>
                            <CircleCheck color="green" size={24} />
                            <Text italic color="dimmed" pl={4}>
                              Up to date
                            </Text>
                          </Center>
                        )}
                      </Center>
                    </Group>
                  </Stack>
                  <Space />
                  <PopulationComparisonTable patientId={selectedPatient} dr={dr} />
                  <Stack className={classes.highlighting}>
                    <MeasureHighlightingPanel dr={dr} />
                  </Stack>
                </Tabs.Panel>
              ))}
            </Tabs>
          ) : (
            renderPanelPlaceholderText()
          )}
        </Grid.Col>
      </Grid>
    </>
  );
}
