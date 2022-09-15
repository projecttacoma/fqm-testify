import { Text, Popover, List, Anchor, ActionIcon } from '@mantine/core';
import React, { useState } from 'react';
import { InfoCircle } from 'tabler-icons-react';

export default function MeasureUploadHeader() {
  const [opened, setOpened] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        padding: 20
      }}
    >
      <div style={{ paddingRight: 5 }}>
        <Text size="xl">Step 1: Upload a Measure Bundle</Text>
      </div>
      <div>
        <Popover
          opened={opened}
          onClose={() => setOpened(false)}
          target={
            <ActionIcon aria-label={'More Information'} onClick={() => setOpened(o => !o)}>
              <InfoCircle size={20} />
            </ActionIcon>
          }
        >
          The uploaded Measure Bundle must contain:
          <List>
            <List.Item>one measure resource</List.Item>
            <List.Item>all dependent library resources used</List.Item>
            <List.Item>
              all ValueSets needed for measure calculation see{' '}
              <Anchor href="https://github.com/projecttacoma/fqm-testify#adding-test-cases">here</Anchor> for more info
              on how to obtain necessary ValueSets
            </List.Item>
          </List>
        </Popover>
      </div>
    </div>
  );
}
