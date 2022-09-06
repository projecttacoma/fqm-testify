import type { NextPage } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import { Button, Grid } from '@mantine/core';

import MeasureUpload from '../components/measure-upload/MeasureUpload';
import DateSelectors from '../components/measure-upload/DateSelectors';
import { measureBundleState } from '../state/atoms/measureBundle';
import { measurementPeriodState } from '../state/atoms/measurementPeriod';
import { useRecoilValue } from 'recoil';

const Home: NextPage = () => {
  const measureBundle = useRecoilValue(measureBundleState);
  const measurementPeriod = useRecoilValue(measurementPeriodState);
  return (
    <>
      <Head>
        <title>FQM Testify: an eCQM Analysis Tool</title>
      </Head>
      <Grid>
        <Grid.Col span={12}>
          <MeasureUpload />
        </Grid.Col>
        <Grid.Col span={12}>
          <DateSelectors />
        </Grid.Col>
      </Grid>
      <Link href={'/generate-test-cases'}>
        <Button
          sx={() => ({
            marginTop: 10
          })}
          disabled={!(measureBundle.name && measurementPeriod.start && measurementPeriod.end)}
        >
          Next
        </Button>
      </Link>
    </>
  );
};

export default Home;
