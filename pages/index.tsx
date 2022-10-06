import type { NextPage } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import { useCallback, useEffect, useState } from 'react';
import { Button, Grid, Group, Space, Stack } from '@mantine/core';
import { useRecoilValue } from 'recoil';
import MeasureUpload, { MeasureUploadError } from '../components/measure-upload/MeasureUpload';
import DateSelectors from '../components/measure-upload/DateSelectors';
import { measureBundleState } from '../state/atoms/measureBundle';
import { measurementPeriodState } from '../state/atoms/measurementPeriod';
import MeasureUploadHeader from '../components/utils/MeasureUploadHeader';
import DateSelectorsHeader from '../components/utils/DateSelectorsHeader';
import UploadErrorLog from '../components/measure-upload/UploadErrorLog';

const Home: NextPage = () => {
  const measureBundle = useRecoilValue(measureBundleState);
  const measurementPeriod = useRecoilValue(measurementPeriodState);

  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorLog, setErrorLog] = useState<MeasureUploadError[]>([]);

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
      <Head>
        <title>FQM Testify: an eCQM Analysis Tool</title>
      </Head>
      <Grid justify="center">
        <Grid.Col span={5}>
          <Stack justify="space-evenly" spacing="xl">
            <MeasureUploadHeader />
            <MeasureUpload logError={logError} />
            <Space />
            <DateSelectorsHeader />
            <DateSelectors />
            <UploadErrorLog uploadSuccess={uploadSuccess} errorLog={errorLog} />
            <Group position="right">
              <Link href="/generate-test-cases">
                <Button
                  sx={() => ({
                    marginTop: 10
                  })}
                  disabled={!(measureBundle.name && measurementPeriod.start && measurementPeriod.end)}
                >
                  Next
                </Button>
              </Link>
            </Group>
          </Stack>
        </Grid.Col>
      </Grid>
    </>
  );
};

export default Home;
