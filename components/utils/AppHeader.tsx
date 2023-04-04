import { Card, Button, Text } from '@mantine/core';
import React from 'react';
import { useRecoilValue } from 'recoil';
import Link from 'next/link';
import { Edit } from 'tabler-icons-react';
import { useRouter } from 'next/router';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { measurementPeriodState } from '../../state/atoms/measurementPeriod';

export default function AppHeader() {
  const { start, end } = useRecoilValue(measurementPeriodState);
  const measureBundle = useRecoilValue(measureBundleState);
  const router = useRouter();
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'black',
        height: '100%',
        width: '100%',
        padding: 20
      }}
    >
      {router.pathname !== '/' && start && end && measureBundle.content && (
        <div style={{ flexGrow: 2 }}>
          <Card sx={() => ({ width: 'fit-content', justifySelf: 'start' })}>
            <div style={{ display: 'flex', justifyContent: 'space-around', gap: 10, alignItems: 'center' }}>
              <div>
                <Text size="md" color="dimmed">
                  {measureBundle.isFile
                    ? measureBundle.fileName
                    : measureBundle.displayMap[measureBundle.selectedMeasureId as string]}
                </Text>
                <Text size="sm" color="dimmed">
                  {retrieveMeasurementPeriodString(start, end)}
                </Text>
              </div>
              <Link href={'/'}>
                <Button variant="subtle" color="gray">
                  <Edit />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      )}
      <Text color="dimmed" size="xl" sx={() => ({ justifySelf: 'flex-end' })}>
        FQM Testify: an eCQM Analysis Tool
      </Text>
    </div>
  );
}
const retrieveDateString = (date: Date) => {
  return date.toLocaleString('default', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};
const retrieveMeasurementPeriodString = (start: Date, end: Date) => {
  return `${retrieveDateString(start)} - ${retrieveDateString(end)}`;
};
