import React, { useState } from 'react';
import { Button, Collapse, Group, Paper, Text } from '@mantine/core';
import { MeasureUploadError } from '../measure-upload/MeasureUpload';
import Link from 'next/link';

export interface UploadErrorInfoProps {
  error: MeasureUploadError;
}

export default function UploadErrorInfo({ error }: UploadErrorInfoProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  return (
    <Paper withBorder shadow="md" p="md">
      <Group spacing="xs">
        <Text weight={600}>{error.attemptedFileName}</Text>
        <Text color="dimmed">{error.timestamp}</Text>
      </Group>
      {error.isValueSetMissingError ? (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <Text>Bundle is missing required ValueSets</Text>
            <Button variant="subtle" color="gray" onClick={() => setIsDetailOpen(!isDetailOpen)} style={{}}>
              {isDetailOpen ? 'Hide ' : 'Show '}Missing ValueSet URLs
            </Button>
          </div>
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
