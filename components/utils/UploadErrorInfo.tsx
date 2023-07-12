import React, { useState } from 'react';
import { Button, Collapse, Group, Paper, Text } from '@mantine/core';
import Link from 'next/link';
import { MeasureUploadError } from '../../util/measureUploadUtils';

export interface UploadErrorInfoProps {
  error: MeasureUploadError;
}

export default function UploadErrorInfo({ error }: UploadErrorInfoProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  return (
    <Paper withBorder shadow="md" p="md">
      <Group spacing="xs">
        <Text weight="bold">{error.attemptedBundleDisplay}</Text>
        <Text color="dimmed">{error.timestamp}</Text>
      </Group>
      {error.isValueSetMissingError ? (
        <div>
          <Group position="apart">
            <div>
              <Text>Bundle is missing required ValueSets.</Text>
              {error.isThrownFromMrs && (
                <Text>
                  A VS API Key must be specified by the Measure Repository Service server to retrieve the missing
                  ValueSets.
                </Text>
              )}
            </div>
            <Button variant="subtle" color="gray" onClick={() => setIsDetailOpen(!isDetailOpen)}>
              {isDetailOpen ? 'Hide ' : 'Show '}Missing ValueSet URLs
            </Button>
          </Group>
          <Collapse in={isDetailOpen}>
            {(Array.isArray(error.message) ? error.message : [error.message]).map(vsUrl => (
              <Text key={vsUrl}>
                <Link href={vsUrl}>{vsUrl}</Link>
              </Text>
            ))}
          </Collapse>
        </div>
      ) : (
        <Text>{error.message}</Text>
      )}
    </Paper>
  );
}
