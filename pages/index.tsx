import type { NextPage } from 'next';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import { Button, createStyles, Divider, Grid, Group, Stack, Text } from '@mantine/core';
import { useRecoilValue } from 'recoil';
import MeasureFileUpload from '../components/measure-upload/MeasureFileUpload';
import DateSelectors from '../components/measure-upload/DateSelectors';
import { measureBundleState } from '../state/atoms/measureBundle';
import MeasureFileUploadHeader from '../components/utils/MeasureFileUploadHeader';
import MeasureRepositoryUploadHeader from '../components/utils/MeasureRespositoryUploadHeader';
import UploadErrorLog from '../components/measure-upload/UploadErrorLog';
import MeasureRepositoryUpload from '../components/measure-upload/MeasureRepositoryUpload';
import { MeasureUploadError } from '../util/measureUploadUtils';

const useStyles = createStyles(theme => ({
  headerContainer: {
    height: '100%'
  },
  inputContainer: {
    [theme.fn.largerThan('md')]: {
      width: '900px'
    }
  },
  divider: {
    margin: '48px 0px 48px 0px'
  }
}));

const Home: NextPage = () => {
  const measureBundle = useRecoilValue(measureBundleState);

  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorLog, setErrorLog] = useState<MeasureUploadError[]>([]);
  const [datesValid, setDatesValid] = useState(false);

  const { classes } = useStyles();

  const isNextDisabled = !(measureBundle.content && datesValid);

  const logError = useCallback(
    (error: MeasureUploadError) => {
      setErrorLog([error, ...errorLog]);
    },
    [errorLog]
  );

  useEffect(() => {
    if (measureBundle.content != null) {
      setUploadSuccess(true);
      setErrorLog([]);
    } else {
      setUploadSuccess(false);
    }
  }, [measureBundle]);

  return (
    <>
      <Stack pt={24} align="center">
        <Stack className={classes.inputContainer}>
          <Grid columns={3}>
            <Grid.Col sm={3} md={1}>
              <Group align="center" className={classes.headerContainer}>
                <MeasureFileUploadHeader />
              </Group>
            </Grid.Col>
            <Grid.Col sm={3} md={2}>
              <Stack>
                <MeasureFileUpload logError={logError} />
                <MeasureRepositoryUploadHeader />
                <MeasureRepositoryUpload logError={logError} />
              </Stack>
            </Grid.Col>
          </Grid>
          <Divider className={classes.divider} />
          <Grid columns={3}>
            <Grid.Col sm={3} md={1}>
              <Group align="center" className={classes.headerContainer}>
                <div>
                  <Text size="xl" weight="bold">
                    Step 2:
                  </Text>
                  <Text weight="lighter">Set your Measurement Period</Text>
                </div>
              </Group>
            </Grid.Col>
            <Grid.Col sm={3} md={2}>
              <DateSelectors setDatesValid={setDatesValid} />
            </Grid.Col>
          </Grid>
          <Divider className={classes.divider} />
          <Group position="right">
            <Link
              href="/generate-test-cases"
              style={{
                pointerEvents: isNextDisabled ? 'none' : 'all'
              }}
            >
              <Button disabled={isNextDisabled}>Next</Button>
            </Link>
          </Group>
          <UploadErrorLog uploadSuccess={uploadSuccess} errorLog={errorLog} />
        </Stack>
      </Stack>
    </>
  );
};

export default Home;
