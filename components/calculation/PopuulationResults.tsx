import { Center, Group, Loader, Space, Stack, Tabs, Text, createStyles } from '@mantine/core';
import { DetailedPopulationGroupResult } from 'fqm-execution';
import { useRecoilValue } from 'recoil';
import { calculationLoading } from '../../state/atoms/calculationLoading';
import { useState } from 'react';
import { CircleCheck } from 'tabler-icons-react';
import MeasureHighlightingPanel from './MeasureHighlightingPanel';
import PopulationComparisonTable from './PopulationComparisonTable';

export interface PopulationResultsProps {
  detailedResults: DetailedPopulationGroupResult[];
  patientId: string;
}

const useStyles = createStyles({
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
});

export default function PopulationResults({ detailedResults, patientId }: PopulationResultsProps) {
  const isCalculationLoading = useRecoilValue(calculationLoading);
  const [activeTab, setActiveTab] = useState<string | null>('0');
  const isMultiGroup = detailedResults.length > 1;

  const { classes } = useStyles();

  return (
    <>
      {isMultiGroup ? (
        <Tabs value={activeTab} onTabChange={setActiveTab} className={classes.calculation}>
          <Tabs.List className={classes.tabsList}>
            {detailedResults.map((dr, index) => (
              <Tabs.Tab value={index.toString()} key={dr.groupId}>
                {dr.groupId}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          {detailedResults.map((dr, index) => (
            <Tabs.Panel value={index.toString()} key={dr.groupId} className={classes.tabsPanel}>
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
              <PopulationComparisonTable patientId={patientId} dr={dr} />
              <Stack className={classes.highlighting}>
                <MeasureHighlightingPanel dr={dr} />
              </Stack>
            </Tabs.Panel>
          ))}
        </Tabs>
      ) : (
        <>
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
          <PopulationComparisonTable patientId={patientId} dr={detailedResults[0]} />
          <Stack className={classes.highlighting}>
            <MeasureHighlightingPanel dr={detailedResults[0]} />
          </Stack>
        </>
      )}
    </>
  );
}
