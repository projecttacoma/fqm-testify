import { Text, Popover, List, Anchor, ActionIcon, Group } from '@mantine/core';
import React, { useState } from 'react';
import { InfoCircle } from 'tabler-icons-react';

export default function MeasureUploadHeader() {
  const [opened, setOpened] = useState(false);

  return (
    <Group>
      <div style={{ paddingRight: 5 }}>
        <Text size="xl" weight={700}>
          Step 1: Upload a Measure Bundle
        </Text>
      </div>
      <div>
        <Popover opened={opened} onClose={() => setOpened(false)}>
          <Popover.Target>
            <ActionIcon aria-label={'More Information'} onClick={() => setOpened(o => !o)}>
              <InfoCircle size={20} />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>
            The uploaded Measure Bundle must contain:
            <List>
              <List.Item>Exactly one measure resource</List.Item>
              <List.Item>All dependent library resources used</List.Item>
              <List.Item>
                All ValueSets needed for measure calculation (see{' '}
                <Anchor href="https://github.com/projecttacoma/fqm-testify#adding-valuesets-to-fhir-measure-bundle">
                  here
                </Anchor>{' '}
                for more info on how to obtain necessary ValueSets)
              </List.Item>
            </List>
          </Popover.Dropdown>
        </Popover>
      </div>
    </Group>
  );
}
