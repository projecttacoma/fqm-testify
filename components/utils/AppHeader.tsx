import { Card, Button, Text, Group, createStyles } from '@mantine/core';
import React from 'react';
import { useRecoilValue } from 'recoil';
import Link from 'next/link';
import { Edit } from 'tabler-icons-react';
import { useRouter } from 'next/router';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { measurementPeriodState } from '../../state/atoms/measurementPeriod';

const useStyles = createStyles(theme => ({
  headerContainer: {
    backgroundColor: theme.colors.gray[9],
    height: '100%',
    padding: '0px 20px 0px 20px'
  },
  mbCardContainer: {
    flexGrow: 2
  },
  mbCard: {
    width: 'fit-content'
  }
}));

export default function AppHeader() {
  const { start, end } = useRecoilValue(measurementPeriodState);
  const measureBundle = useRecoilValue(measureBundleState);
  const router = useRouter();
  const { classes } = useStyles();

  return (
    <Group className={classes.headerContainer}>
      {router.pathname !== '/' && start && end && measureBundle.content && (
        <div className={classes.mbCardContainer}>
          <Card className={classes.mbCard}>
            <Group spacing="xs">
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
            </Group>
          </Card>
        </div>
      )}
      <Text color="dimmed" size="xl">
        FQM Testify: an eCQM Analysis Tool
      </Text>
    </Group>
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
