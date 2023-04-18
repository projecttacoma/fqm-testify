import { Button, Center, Text } from '@mantine/core';
import Link from 'next/link';
import React, { useEffect } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import TestCaseEditor from '../components/TestCaseEditor';
import { measureBundleState } from '../state/atoms/measureBundle';
import { measurementPeriodState } from '../state/atoms/measurementPeriod';
import type { NextPage } from 'next';
import { patientTestCaseState } from '../state/atoms/patientTestCase';
import produce from 'immer';
import { calculationLoading } from '../state/atoms/calculationLoading';
import { showNotification } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons';
import { Calculator, CalculatorTypes } from 'fqm-execution';
import { createPatientBundle } from '../util/fhir/resourceCreation';
import { detailedResultLookupState } from '../state/atoms/detailedResultLookup';

const TestCaseEditorPage: NextPage = () => {
  const { start, end } = useRecoilValue(measurementPeriodState);
  const measureBundle = useRecoilValue(measureBundleState);
  const currentPatients = useRecoilValue(patientTestCaseState);
  const setIsCalculationLoading = useSetRecoilState(calculationLoading);
  const [detailedResultLookup, setDetailedResultLookup] = useRecoilState(detailedResultLookupState);

  // re-runs the measureReport calculation whenever the user navigates to the generate-test-cases page
  useEffect(() => {
    if (measureBundle.content) {
      const mb = measureBundle.content;
      setIsCalculationLoading(true);
      produce(detailedResultLookup, async draftState => {
        const options: CalculatorTypes.CalculationOptions = {
          measurementPeriodStart: start?.toISOString(),
          measurementPeriodEnd: end?.toISOString()
        };

        for (const [patientId, testCaseInfo] of Object.entries(currentPatients)) {
          try {
            const patientBundle = createPatientBundle(testCaseInfo.patient, testCaseInfo.resources);
            const { results } = await Calculator.calculate(mb, [patientBundle], options);
            draftState[patientId] = results[0];
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
        setDetailedResultLookup(nextMRLookupState);
        setIsCalculationLoading(false);
      });
    }
    // have to disable eslint for the following line because we only want to run the effect once
    // in order to do this, we have an empty dependencies array but that gives us a warning
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <div>
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
