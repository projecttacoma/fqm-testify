import { Center, ScrollArea, Stack, Text } from '@mantine/core';
import React from 'react';
import { MeasureUploadError } from '../../util/MeasureUploadUtils';
import UploadErrorInfo from '../utils/UploadErrorInfo';

export interface UploadErrorLogProps {
  uploadSuccess: boolean;
  errorLog: MeasureUploadError[];
}

export default function UploadErrorLog({ uploadSuccess, errorLog }: UploadErrorLogProps) {
  const renderErrorLog = () => {
    return errorLog.length > 0 ? (
      <Stack>
        {errorLog.map(e => (
          <div key={e.id}>
            <UploadErrorInfo error={e} />
          </div>
        ))}
      </Stack>
    ) : (
      <Center style={{ height: 400 }}>
        <Text color="dimmed">No Errors!</Text>
      </Center>
    );
  };

  return (
    <>
      <Text size="xl" weight={700} color={uploadSuccess || errorLog.length === 0 ? undefined : 'red'}>
        Errors
      </Text>

      <ScrollArea
        type="scroll"
        sx={theme => ({ border: `1px solid ${theme.colors.gray[5]}`, padding: '12px 8px 8px 12px' })}
      >
        <div style={{ height: '400px' }}>{renderErrorLog()}</div>
      </ScrollArea>
    </>
  );
}
