import { Center, createStyles, ScrollArea, Stack, Text } from '@mantine/core';
import React from 'react';
import { MeasureUploadError } from '../../util/measureUploadUtils';
import UploadErrorInfo from '../utils/UploadErrorInfo';

export interface UploadErrorLogProps {
  uploadSuccess: boolean;
  errorLog: MeasureUploadError[];
}

const useStyles = createStyles(theme => ({
  errorContainer: {
    border: `1px solid ${theme.colors.gray[5]}`,
    padding: '12px 8px 8px 12px'
  },
  errorBox: {
    height: '300px'
  }
}));

export default function UploadErrorLog({ uploadSuccess, errorLog }: UploadErrorLogProps) {
  const { classes } = useStyles();

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
      <Center h={300}>
        <Text color="dimmed">No Errors!</Text>
      </Center>
    );
  };

  return (
    <>
      <Text size="xl" weight={700} color={uploadSuccess || errorLog.length === 0 ? undefined : 'red'}>
        Errors
      </Text>

      <ScrollArea type="scroll" className={classes.errorContainer}>
        <div className={classes.errorBox}>{renderErrorLog()}</div>
      </ScrollArea>
    </>
  );
}
