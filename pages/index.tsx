import type { NextPage } from 'next';
import Head from 'next/head';
import { AppShell, Header } from '@mantine/core';
import AbacusHeader from '../components/AbacusHeader';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>FQM Testify: an ECQM Analysis Tool</title>
      </Head>
      <AppShell padding="md" header={<Header height={60}>{<AbacusHeader></AbacusHeader>}</Header>}>
        <></>
      </AppShell>
    </>
  );
};

export default Home;
