import type { NextPage } from 'next';
import Head from 'next/head';
import { AppShell, Grid, Header } from '@mantine/core';
import AbacusHeader from '../components/AbacusHeader';
import MeasureUpload from '../components/MeasureUpload';
import DateSelectors from '../components/DateSelectors';
import ResourceCreationPanel from '../components/ResourceCreation/ResourceCreationPanel';
import PopulationCalculation from '../components/PopulationCalculation';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>FQM Testify: an eCQM Analysis Tool</title>
      </Head>
      <AppShell padding="md" header={<Header height={60}>{<AbacusHeader></AbacusHeader>}</Header>}>
        <Grid>
          <Grid.Col span={12}>
            <MeasureUpload />
          </Grid.Col>
          <Grid.Col span={12}>
            <DateSelectors />
          </Grid.Col>
        </Grid>
        <ResourceCreationPanel />
        <PopulationCalculation />
      </AppShell>
    </>
  );
};

export default Home;
