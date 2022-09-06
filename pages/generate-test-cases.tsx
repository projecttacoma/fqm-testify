import { Button, Center, Text } from '@mantine/core';
import Link from 'next/link';
import React from 'react';
import { useRecoilValue } from 'recoil';
import TestCaseEditor from '../components/TestCaseEditor';
import { measureBundleState } from '../state/atoms/measureBundle';
import { measurementPeriodState } from '../state/atoms/measurementPeriod';
import type { NextPage } from 'next';

const TestCaseEditorPage: NextPage = () => {
  const { start, end } = useRecoilValue(measurementPeriodState);
  const measureBundle = useRecoilValue(measureBundleState);

  return (
    <>
      <div style={{ paddingTop: '24px', paddingLeft: '24px' }}>
        {start && end && measureBundle.content ? (
          <TestCaseEditor />
        ) : (
          <Center sx={() => ({ flexDirection: 'column' })}>
            <Text>Whoops! Looks like you forgot to upload a MeasureBundle or pick a measurement period!</Text>
            <Link href="/">
              <Button>Return to Measure Bundle Upload</Button>
            </Link>
          </Center>
        )}
      </div>
    </>
  );
};
export default TestCaseEditorPage;
