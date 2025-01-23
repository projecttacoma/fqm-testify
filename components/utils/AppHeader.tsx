import { Card, Button, Text, Group, createStyles } from '@mantine/core';
import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import Link from 'next/link';
import { Edit } from 'tabler-icons-react';
import { useRouter } from 'next/router';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { measurementPeriodState } from '../../state/atoms/measurementPeriod';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { IconAlertTriangle } from '@tabler/icons';
import WarningModal from '../modals/WarningModal';

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
  const currentPatients = useRecoilValue(patientTestCaseState);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const openWarningModal = () => {
    setIsWarningModalOpen(true);
  };

  const closeWarningModal = () => {
    setIsWarningModalOpen(false);
  };

  const confirmMeasureEdit = () => {
    router.push('/');
    closeWarningModal();
  };
  return (
    <Group className={classes.headerContainer}>
      <WarningModal open={isWarningModalOpen} onClose={closeWarningModal} onConfirm={() => confirmMeasureEdit()} />
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
              {Object.values(currentPatients).some(cp => cp.minResources === true) ? (
                <Button variant="subtle" color="gray" onClick={() => openWarningModal()}>
                  <IconAlertTriangle />
                </Button>
              ) : (
                <Link href={'/'}>
                  <Button variant="subtle" color="gray">
                    <Edit />
                  </Button>
                </Link>
              )}
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
