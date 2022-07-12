import JSZip from 'jszip';
import { Button, Center, Grid, Loader, Group } from '@mantine/core';
import React, { Suspense, useState } from 'react';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { useRecoilValue } from 'recoil';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { selectedPatientState } from '../../state/atoms/selectedPatient';
import PatientCreation from './PatientCreation';
import TestResourcesDisplay from './TestResourcesDisplay';
import { Download } from 'tabler-icons-react';
import { createPatientBundle, getPatientNameString } from '../../util/fhir';
import { downloadZip } from '../../util/downloadUtil';
import { showNotification } from '@mantine/notifications';

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

  const exportAllPatients = () => {
    // Build zip file
    const zip = new JSZip();
    const dateCreated = new Date();
    const fileNameString = `${measureBundle.name.replace('.json', '')}-test-cases`;
    const measureBundleFolder = zip.folder(fileNameString);
    if (measureBundleFolder) {
      Object.keys(currentPatients).forEach(id => {
        const bundleString: string = JSON.stringify(
          createPatientBundle(currentPatients[id].patient, currentPatients[id].resources),
          null,
          2
        );
        const testCaseFileName = `${getPatientNameString(currentPatients[id].patient)}-${id}.json`;
        // create file for each bundleString
        measureBundleFolder.file(testCaseFileName, bundleString);
      });
      downloadZip(zip, `${fileNameString}-${dateCreated.toISOString()}.zip`);
    }
    else {
      showNotification({
        title: 'Measure Bundle Folder Creation Failed',
        message: 'Could not successfully create zip folder for downloading all patients'
    })
    }
  };

  return (
    <>
      <Center>
        <Group>
          <div style={{ paddingTop: '24px', paddingBottom: '24px' }}>
            <Button onClick={() => openPatientModal()}>Create Patient</Button>
          </div>
          <Button
            aria-label={'Download All Patients'}
            disabled={(Object.keys(currentPatients).length === 0)}
            onClick={exportAllPatients}
          >
            <Download />
            Download All Patients
          </Button>
        </Group>
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
