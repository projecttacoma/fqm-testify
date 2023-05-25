import type { NextPage } from 'next';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Grid, Group, Space, Stack } from '@mantine/core';
import { useRecoilValue } from 'recoil';
import MeasureFileUpload from '../components/measure-upload/MeasureFileUpload';
import DateSelectors from '../components/measure-upload/DateSelectors';
import { measureBundleState } from '../state/atoms/measureBundle';
import MeasureFileUploadHeader from '../components/utils/MeasureFileUploadHeader';
import MeasureRepositoryUploadHeader from '../components/utils/MeasureRespositoryUploadHeader';
import DateSelectorsHeader from '../components/utils/DateSelectorsHeader';
import UploadErrorLog from '../components/measure-upload/UploadErrorLog';
import MeasureRepositoryUpload from '../components/measure-upload/MeasureRepositoryUpload';
import { MeasureUploadError } from '../util/measureUploadUtils';

const Home: NextPage = () => {
  const measureBundle = useRecoilValue(measureBundleState);

  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorLog, setErrorLog] = useState<MeasureUploadError[]>([]);
  const [datesValid, setDatesValid] = useState(false);

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
      <Grid justify="center">
        <Grid.Col xs={12} sm={7} md={6} lg={5}>
          <Stack justify="space-evenly" spacing="xl">
            <MeasureFileUploadHeader />
            <MeasureFileUpload logError={logError} />
            <MeasureRepositoryUploadHeader />
            <MeasureRepositoryUpload logError={logError} />
            <Space />
            <DateSelectorsHeader />
            <DateSelectors setDatesValid={setDatesValid} />
            <UploadErrorLog uploadSuccess={uploadSuccess} errorLog={errorLog} />
            <Group position="right">
              <Link href="/generate-test-cases">
                <Button disabled={!(measureBundle.content && !datesValid)}>Next</Button>
              </Link>
            </Group>
          </Stack>
        </Grid.Col>
      </Grid>
    </>
  );
};

export default Home;
