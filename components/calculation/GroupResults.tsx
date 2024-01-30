import { Center, Group, Loader, Text, Stack, createStyles, Space, ScrollArea, Accordion, Box } from '@mantine/core';
import { DetailedPopulationGroupResult } from 'fqm-execution';
import MeasureHighlightingPanel from './MeasureHighlightingPanel';
import { useRecoilValue } from 'recoil';
import { calculationLoading } from '../../state/atoms/calculationLoading';
import { CircleCheck } from 'tabler-icons-react';
import { useState } from 'react';
import PopulationComparisonTable from './PopulationComparisonTable';
import PopulationComparisonTablePopover from './PopulationComparisonTableControl';

const useStyles = createStyles({
  panel: {
    maxHeight: '100%',
    overflow: 'scroll'
  },
  highlighting: {
    overflowY: 'auto',
    flexGrow: 1
  },
  fixedContent: {},
  accordionControlBox: {
    display: 'flex',
    alignItems: 'center'
  }
});

export default function GroupResults({ patientId, dr }: { patientId: string; dr: DetailedPopulationGroupResult }) {
  const { classes } = useStyles();
  const isCalculationLoading = useRecoilValue(calculationLoading);
  const [accValue, setAccValue] = useState<string | null>('table');

  return (
    <>
      <Stack h={50} className={classes.fixedContent}>
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
      <ScrollArea style={accValue ? { flex: 1 } : {}} className={classes.fixedContent}>
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
              <PopulationComparisonTable patientId={patientId} />
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </ScrollArea>
      <Stack className={classes.highlighting}>
        <MeasureHighlightingPanel dr={dr} />
      </Stack>
    </>
  );
}
