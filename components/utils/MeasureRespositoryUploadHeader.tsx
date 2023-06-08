import { Text, Popover, Anchor, ActionIcon, Group, Stack } from '@mantine/core';
import React, { useState } from 'react';
import { InfoCircle } from 'tabler-icons-react';

export default function MeasureRepositoryUploadHeader() {
  const [opened, setOpened] = useState(false);

  return (
    <Stack>
      <Text size="xl" weight={700} align="center">
        OR
      </Text>
      <Group pr={4}>
        <Text size="lg" weight={400}>
          Retrieve Measure from Measure Repository Service
        </Text>
        <Popover opened={opened} onClose={() => setOpened(false)}>
          <Popover.Target>
            <ActionIcon aria-label={'More Information'} onClick={() => setOpened(o => !o)}>
              <InfoCircle size={20} />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown w={300}>
            <Text>
              Enter the base URL for a{' '}
              <Anchor href="https://build.fhir.org/ig/HL7/cqf-measures/measure-repository-service.html">
                Measure Repository Service
              </Anchor>{' '}
              server.
            </Text>
            <Text>
              The server must support the{' '}
              <Anchor href="https://build.fhir.org/ig/HL7/cqf-measures/measure-repository-service.html#package">
                $package
              </Anchor>{' '}
              operation for Measure resources with the &quot;include-terminology&quot; parameter.
            </Text>
          </Popover.Dropdown>
        </Popover>
      </Group>
    </Stack>
  );
}
