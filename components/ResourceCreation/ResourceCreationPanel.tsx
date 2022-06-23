import { Button, Center, Grid, Loader } from '@mantine/core';
import React, { Suspense, useState } from 'react';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { useRecoilState, useRecoilValue } from 'recoil';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { selectedDataRequirementState } from '../../state/atoms/selectedDataRequirement';
import { selectedPatientState } from '../../state/atoms/selectedPatient';
import PatientCreation from './PatientCreation';
import TestResourceCreation from './TestResourceCreation';
import TestResourcesDisplay from './TestResourcesDisplay';

export default function ResourceCreationPanel() {
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<string | null>(null);
  const selectedPatient = useRecoilValue(selectedPatientState);
  const currentPatients = useRecoilValue(patientTestCaseState);
  const measureBundle = useRecoilValue(measureBundleState);

  const openPatientModal = (patientId?: string) => {
    if (patientId && Object.keys(currentPatients).includes(patientId)) {
      setCurrentPatient(patientId);
    } else {
      setCurrentPatient(null);
    }

    setIsPatientModalOpen(true);
  };
  const closePatientModal = () => {
    setIsPatientModalOpen(false);
    setCurrentPatient(null);
  };

  return (
    <>
      <Center>
        <div style={{ paddingTop: '24px', paddingBottom: '24px' }}>
          <Button onClick={() => openPatientModal()}>Create Test Patient</Button>
        </div>
      </Center>
      <Grid>
        {selectedPatient !== null && measureBundle.content && (
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
        <Grid.Col span={selectedPatient !== null && measureBundle.content ? 8 : 12}>
          <PatientCreation {...{ openPatientModal, closePatientModal, isPatientModalOpen, currentPatient }} />
        </Grid.Col>
      </Grid>
    </>
  );
}
