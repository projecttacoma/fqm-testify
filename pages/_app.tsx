import { AppProps } from 'next/app';
import { RecoilRoot } from 'recoil';
import Head from 'next/head';
import { AppShell, Header, MantineProvider } from '@mantine/core';
import React from 'react';
import { Notifications } from '@mantine/notifications';
import AppHeader from '../components/utils/AppHeader';

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    <RecoilRoot>
      <Head>
        <title>FQM Testify: a FHIR-based eCQM Analysis Tool</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MantineProvider withGlobalStyles withNormalizeCSS theme={{ colorScheme: 'light' }}>
        <Notifications position="top-center" />
        <AppShell
          styles={{
            main: {
              paddingBottom: '0px',
              marginTop: '-8px'
            }
          }}
          header={<Header height={120}>{<AppHeader></AppHeader>}</Header>}
        >
          <div
            style={{
              // screen height - header size - 8px margin to make main shell flush against header
              height: 'calc(100vh - 120px - 8px)'
            }}
          >
            <Component {...pageProps} />
          </div>
        </AppShell>
      </MantineProvider>
    </RecoilRoot>
  );
}
