import { ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import { useEffect } from 'react';
import { RecoilRoot, RecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

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
