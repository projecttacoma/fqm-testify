import type { NextPage } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import { Button, Divider, Grid, Group, SimpleGrid } from '@mantine/core';
import MeasureUpload from '../components/measure-upload/MeasureUpload';
import DateSelectors from '../components/measure-upload/DateSelectors';
import { measureBundleState } from '../state/atoms/measureBundle';
import { measurementPeriodState } from '../state/atoms/measurementPeriod';
import { useRecoilValue } from 'recoil';
import MeasureUploadHeader from '../components/utils/MeasureUploadHeader';
import DateSelectorHeader from '../components/utils/DateSelectorsHeader';
import { Divide } from 'tabler-icons-react';

const Home: NextPage = () => {
  const measureBundle = useRecoilValue(measureBundleState);
  const measurementPeriod = useRecoilValue(measurementPeriodState);
  return (
    <>
      <Head>
        <title>FQM Testify: an eCQM Analysis Tool</title>
      </Head>
      {/* <Grid justify="center" align="stretch">
        <SimpleGrid cols={1}>
          <MeasureUploadHeader />
          <MeasureUpload />
          <Divider />
          <DateSelectorHeader />
          <DateSelectors />
        </SimpleGrid>
      </Grid> */}
      <Grid justify="center">
        <Grid.Col span={7}>
          <MeasureUploadHeader />
        </Grid.Col>
        <Grid.Col span={7}>
          <MeasureUpload />
        </Grid.Col>
        <Grid.Col span={7}>
          <DateSelectorHeader />
        </Grid.Col>
        <Grid.Col span={7}>
          <DateSelectors />
        </Grid.Col>
        <Grid.Col span={7}>
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
        </Grid.Col>
      </Grid>
    </>
  );
};

export default Home;
