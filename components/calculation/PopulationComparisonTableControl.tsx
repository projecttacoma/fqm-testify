import { ActionIcon, Group, Popover, ScrollArea, Text } from '@mantine/core';
import { MouseEvent, useState } from 'react';
import { InfoCircle } from 'tabler-icons-react';
import React from 'react';

export default function PopulationComparisonTableControl() {
  const [opened, setOpened] = useState(false);

  const popoverClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setOpened(o => !o);
  };

  return (
    <Group>
      <Text size="xl" weight={700}>
        Population Comparison Table
      </Text>
      <div>
        <Popover opened={opened} onClose={() => setOpened(false)} width={500}>
          <Popover.Target>
            <ActionIcon aria-label={'More Information'} onClick={popoverClick}>
              <InfoCircle size={20} />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>
            <ScrollArea h={180}>
              The Population Comparison Table shows patient and episode population results for the patient selected. For
              patient-based measures, patient results show 0 or 1 to indicate belonging to a population. Actual and
              desired populations are compared to highlight cells green if they match and red if they don&apos;t match.
              <br />
              <br />
              For episode-based measures, the table shows patient level totals that indicate how many episodes are in
              each population. Episode population results show a 0 or 1, and episode observation results show the
              observed value for that episode.
              <br />
              <br />
              For more information, see the{' '}
              <a href="https://github.com/projecttacoma/fqm-testify#reading-the-population-comparison-table">
                fqm-testify README
              </a>
              .
            </ScrollArea>
          </Popover.Dropdown>
        </Popover>
      </div>
    </Group>
  );
}
