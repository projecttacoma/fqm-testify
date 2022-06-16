import { Button, Center, Grid, Loader } from '@mantine/core';
import React, { Suspense, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { selectedPatientState } from '../../state/atoms/selectedPatient';
import PatientCreation from './PatientCreation';
import TestResourcesDisplay from './TestResourcesDisplay';

export default function ResourceCreationPanel() {
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<string | null>(null);
  const selectedPatient = useRecoilValue(selectedPatientState);
  const currentPatients = useRecoilValue(patientTestCaseState);

  const openModal = (patientId?: string) => {
    if (patientId && Object.keys(currentPatients).includes(patientId)) {
      setCurrentPatient(patientId);
    } else {
      setCurrentPatient(null);
    }

    setIsPatientModalOpen(true);
  };
  const closeModal = () => {
    setIsPatientModalOpen(false);
    setCurrentPatient(null);
  };
  return (
    <>
      <Center>
        <div style={{ paddingTop: '24px', paddingBottom: '24px' }}>
          <Button onClick={() => openModal()}>Create Test Patient</Button>
        </div>
      </Center>
      <Grid>
        {selectedPatient !== null && (
          <Grid.Col span={4}>
            <Suspense
              fallback={
                <Center>
                  <Loader />
                </Center>
              }
            >
              <TestResourcesDisplay />
            </Suspense>
          </Grid.Col>
        )}
        <Grid.Col span={selectedPatient !== null ? 8 : 12}>
          <PatientCreation {...{ openModal, closeModal, isPatientModalOpen, currentPatient }} />
        </Grid.Col>
      </Grid>
    </>
  );
}
