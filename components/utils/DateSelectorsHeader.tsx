import { Text, Group } from '@mantine/core';
import React from 'react';

export default function DateSelectorsHeader() {
  return (
    <Group>
      <div style={{ paddingRight: 5 }}>
        <Text size="xl" weight={700}>
          Step 2:
        </Text>
        <Text size="lg" weight={400}>
          Set your Measurement Period Date Range
        </Text>
      </div>
    </Group>
  );
}
