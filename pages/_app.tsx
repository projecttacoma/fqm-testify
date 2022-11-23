import { AppProps } from 'next/app';
import { RecoilRoot } from 'recoil';
import Head from 'next/head';
import { AppShell, ColorScheme, ColorSchemeProvider, Header, MantineProvider } from '@mantine/core';
import React, { useState } from 'react';
import { NotificationsProvider } from '@mantine/notifications';
import AppHeader from '../components/utils/AppHeader';

export default function App(props: AppProps) {
  const { Component, pageProps } = props;
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  return (
    <RecoilRoot>
      <Head>
        <title>FQM Testify: a FHIR-based eCQM Analysis Tool</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <MantineProvider withGlobalStyles withNormalizeCSS theme={{ colorScheme }}>
          <NotificationsProvider position="top-center">
            <AppShell
              style={{ marginTop: '-8px', marginBottom: '-8px', marginLeft: '-8px', marginRight: '-8px' }}
              header={<Header height={120}>{<AppHeader></AppHeader>}</Header>}
            >
              <Component {...pageProps} />
            </AppShell>
          </NotificationsProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </RecoilRoot>
  );
}
