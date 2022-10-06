import { Button, Center, Text } from '@mantine/core';
import Link from 'next/link';
import React, { useEffect } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import TestCaseEditor from '../components/TestCaseEditor';
import { measureBundleState } from '../state/atoms/measureBundle';
import { measurementPeriodState } from '../state/atoms/measurementPeriod';
import type { NextPage } from 'next';
import { patientTestCaseState } from '../state/atoms/patientTestCase';
import { calculateMeasureReport } from '../util/MeasureCalculation';
import produce from 'immer';
import { calculationLoading } from '../state/atoms/calculationLoading';
import { showNotification } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons';
import { measureReportLookupState } from '../state/atoms/measureReportLookup';
import { cqfmTestMRLookupState } from '../state/atoms/cqfmTestMRLookup';
import { createCQFMTestCaseMeasureReport } from '../util/fhir/resourceCreation';

const TestCaseEditorPage: NextPage = () => {
  const { start, end } = useRecoilValue(measurementPeriodState);
  const measureBundle = useRecoilValue(measureBundleState);
  const currentPatients = useRecoilValue(patientTestCaseState);
  const setIsCalculationLoading = useSetRecoilState(calculationLoading);
  const [measureReportLookup, setMeasureReportLookup] = useRecoilState(measureReportLookupState);
  const [currentTestMRLookup, setTestMRLookup] = useRecoilState(cqfmTestMRLookupState);

  // re-runs the measureReport calculation whenever the user navigates to the generate-test-cases page
  useEffect(() => {
    if (measureBundle.content) {
      const mb = measureBundle.content;
      setIsCalculationLoading(true);
      produce(measureReportLookup, async draftState => {
        for (const [patientId, testCaseInfo] of Object.entries(currentPatients)) {
          try {
            draftState[patientId] = await calculateMeasureReport(
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
      }).then(nextMRLookupState => {
        setMeasureReportLookup(nextMRLookupState);
        const newTestMRLookup = produce(currentTestMRLookup, draftState => {
          for (const patientId of Object.keys(currentPatients)) {
            draftState[patientId] = createCQFMTestCaseMeasureReport(
              measureBundle.content as fhir4.Bundle,
              { start: start?.toISOString(), end: end?.toISOString() },
              patientId,
              currentPatients[patientId].desiredPopulations ?? []
            );
          }
        });
        setTestMRLookup(newTestMRLookup);
        setIsCalculationLoading(false);
      });
    }
    // have to disable eslint for the following line because we only want to run the effect once
    // in order to do this, we have an empty dependencies array but that gives us a warning
    // eslint-disable-next-line
  }, []);

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
