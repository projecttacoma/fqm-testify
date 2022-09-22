import { ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import { useEffect } from 'react';
import { RecoilRoot, RecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { NextRouter } from 'next/router';

export function mantineRecoilWrap(children: JSX.Element) {
  return (
    <ColorSchemeProvider
      colorScheme="light"
      toggleColorScheme={() => {
        void 0;
      }}
    >
      <RecoilRoot>
        <MantineProvider withGlobalStyles withNormalizeCSS theme={{ colorScheme: 'light' }}>
          <NotificationsProvider position="top-center">{children}</NotificationsProvider>
        </MantineProvider>
      </RecoilRoot>
    </ColorSchemeProvider>
  );
}

/*
 * Generate a functional component that can hardcode the value of a recoil atom
 */
export function getMockRecoilState<T>(atom: RecoilState<T>, value: T) {
  return () => {
    const setMockState = useSetRecoilState(atom);
    useEffect(() => {
      setMockState(value);
    }, [setMockState]);
    return null;
  };
}

/*
 * Generate a functional component that can observe changes to a recoil atom
 */
export function getRecoilObserver<T>(atom: RecoilState<T>, onChange: (value: T) => void) {
  return () => {
    const value = useRecoilValue(atom);
    useEffect(() => {
      onChange(value);
    }, [value]);
    return null;
  };
}

export function createMockRouter(router: Partial<NextRouter>): NextRouter {
  return {
    basePath: '',
    pathname: '/',
    route: '/',
    query: {},
    asPath: '/',
    back: jest.fn(),
    beforePopState: jest.fn(),
    prefetch: jest.fn().mockImplementation(() => Promise.resolve()),
    push: jest.fn().mockImplementation(() => Promise.resolve(true)),
    reload: jest.fn(),
    replace: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn()
    },
    isLocaleDomain: false,
    isFallback: false,
    isReady: true,
    defaultLocale: 'en',
    isPreview: false,
    ...router
  };
}

export const mockResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));
