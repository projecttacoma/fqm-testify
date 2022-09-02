import type { NextPage } from 'next';
import Head from 'next/head';
import { AppShell, Grid, Header } from '@mantine/core';
import AppHeader from '../components/utils/AppHeader';
import MeasureUpload from '../components/measure-upload/MeasureUpload';
import DateSelectors from '../components/measure-upload/DateSelectors';
import TestCaseEditor from '../components/TestCaseEditor';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>FQM Testify: an eCQM Analysis Tool</title>
      </Head>
      <AppShell padding="md" header={<Header height={60}>{<AppHeader></AppHeader>}</Header>}>
        <Grid>
          <Grid.Col span={12}>
            <MeasureUpload />
          </Grid.Col>
          <Grid.Col span={12}>
            <DateSelectors />
          </Grid.Col>
        </Grid>
        <div style={{ paddingTop: '24px' }}>
          <TestCaseEditor />
        </div>
      </AppShell>
    </>
  );
};

export default Home;
