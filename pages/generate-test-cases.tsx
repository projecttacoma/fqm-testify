import { Button, Card, Grid, Text } from '@mantine/core';
import Link from 'next/link';
import React from 'react';
import { useRecoilValue } from 'recoil';
import TestCaseEditor from '../components/TestCaseEditor';
import { measureBundleState } from '../state/atoms/measureBundle';
import { measurementPeriodStringState } from '../state/selectors/measurementPeriodString';
import { Edit } from 'tabler-icons-react';

export default function TestCaseEditorPage() {
  const measurementPeriodString = useRecoilValue(measurementPeriodStringState);
  const measureBundle = useRecoilValue(measureBundleState);
  return (
    <>
      <Grid>
        <Grid.Col span={12} sx={() => ({ backgroundColor: 'black', height: 'auto', padding: 20 })}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Card sx={() => ({ width: 'fit-content' })}>
              <div style={{ display: 'flex', justifyContent: 'space-around', gap: 10, alignItems: 'center' }}>
                <div>
                  <Text size="md" color="dimmed">
                    {measureBundle.name}
                  </Text>
                  <Text size="sm" color="dimmed">
                    {measurementPeriodString}
                  </Text>
                </div>
                <Button variant="subtle" color="gray">
                  <Link href={'/'}>
                    <Edit />
                  </Link>
                </Button>
              </div>
            </Card>
            <Text color="dimmed" size="xl">
              FQM Testify: an eCQM Analysis Tool
            </Text>
          </div>
        </Grid.Col>
      </Grid>
      <div style={{ paddingTop: '24px' }}>
        <TestCaseEditor />
      </div>
    </>
  );
}
