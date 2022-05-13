import { AppProps } from 'next/app';
import { RecoilRoot } from 'recoil';
import Head from 'next/head';
import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { useState } from 'react';
import { NotificationsProvider } from '@mantine/notifications';

export default function App(props: AppProps) {
  const { Component, pageProps } = props;
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  return (
    <RecoilRoot>
      <Head>
        <title>FQM Testify: an ECQM Analysis Tool</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <MantineProvider withGlobalStyles withNormalizeCSS theme={{ colorScheme }}>
          <NotificationsProvider position="top-center">
            <Component {...pageProps} />
          </NotificationsProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </RecoilRoot>
  );
}