import { Button, Center, Text } from '@mantine/core';
import Link from 'next/link';
import React, { useCallback, useEffect } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import TestCaseEditor from '../components/TestCaseEditor';
import { measureBundleState } from '../state/atoms/measureBundle';
import { measurementPeriodState } from '../state/atoms/measurementPeriod';
import type { NextPage } from 'next';
import { patientTestCaseState } from '../state/atoms/patientTestCase';
import { calculateMeasureReport } from '../components/calculation/MeasureCalculation';
import produce from 'immer';
import { calculationLoading } from '../state/atoms/calculationLoading';
import { showNotification } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons';

const TestCaseEditorPage: NextPage = () => {
  const { start, end } = useRecoilValue(measurementPeriodState);
  const measureBundle = useRecoilValue(measureBundleState);
  const [currentPatients, setCurrentPatients] = useRecoilState(patientTestCaseState);
  const setIsCalculationLoading = useSetRecoilState(calculationLoading);

  // re-runs the measureReport calculation whenever the user navigates to the generate-test-cases page

  const refreshMeasureReports = useCallback(() => {
    if (measureBundle.content) {
      const mb = measureBundle.content;
      setIsCalculationLoading(true);
      produce(currentPatients, async draftState => {
        for (const [patientId, testCaseInfo] of Object.entries(currentPatients)) {
          try {
            draftState[patientId].measureReport = await calculateMeasureReport(
              testCaseInfo,
              mb,
              start?.toISOString(),
              end?.toISOString()
            );
          } catch (error) {
            if (error instanceof Error) {
              showNotification({
                icon: <IconAlertCircle />,
                title: 'Calculation Error',
                message: error.message,
                color: 'red'
              });
            }
          }
        }
      }).then(nextPatientState => {
        setCurrentPatients(nextPatientState);
        setIsCalculationLoading(false);
      });
    }
  }, [currentPatients, end, measureBundle.content, setCurrentPatients, setIsCalculationLoading, start]);

  // have to disable eslint for the following line because we only want to run the effect once
  // in order to do this, we have an empty dependencies array but that gives us a warning
  // eslint-disable-next-line
  useEffect(refreshMeasureReports, []);

  return (
    <>
      <div style={{ paddingTop: '24px' }}>
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
