import type { NextPage } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import { Button, Grid, Group, Space, Stack } from '@mantine/core';
import MeasureUpload from '../components/measure-upload/MeasureUpload';
import DateSelectors from '../components/measure-upload/DateSelectors';
import { measureBundleState } from '../state/atoms/measureBundle';
import { measurementPeriodState } from '../state/atoms/measurementPeriod';
import { useRecoilValue } from 'recoil';
import MeasureUploadHeader from '../components/utils/MeasureUploadHeader';
import DateSelectorHeader from '../components/utils/DateSelectorsHeader';

const Home: NextPage = () => {
  const measureBundle = useRecoilValue(measureBundleState);
  const measurementPeriod = useRecoilValue(measurementPeriodState);
  return (
    <>
      <Head>
        <title>FQM Testify: an eCQM Analysis Tool</title>
      </Head>
      <Grid justify="center">
        <Grid.Col span={5}>
          <Stack justify="space-between" spacing="xl">
            <MeasureUploadHeader />
            <MeasureUpload />
            <Space />
            <DateSelectorHeader />
            <DateSelectors />
            <Link href={'/generate-test-cases'}>
              <Group position="right">
                <Button
                  sx={() => ({
                    marginTop: 10
                  })}
                  disabled={!(measureBundle.name && measurementPeriod.start && measurementPeriod.end)}
                >
                  Next
                </Button>
              </Group>
            </Link>
          </Stack>
        </Grid.Col>
      </Grid>
    </>
  );
};

export default Home;
