import JSZip from 'jszip';
import { Button, Center, Grid, Group, Loader } from '@mantine/core';
import React, { Suspense, useState } from 'react';
import produce from 'immer';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { useRecoilState, useRecoilValue } from 'recoil';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { selectedPatientState } from '../../state/atoms/selectedPatient';
import PatientCreation from './PatientCreation';
import TestResourcesDisplay from './TestResourcesDisplay';
import { Download, Upload } from 'tabler-icons-react';
import { createPatientBundle, getPatientNameString } from '../../util/fhir';
import { downloadZip } from '../../util/downloadUtil';
import { showNotification } from '@mantine/notifications';
import ImportModal from './ImportModal';
import { bundleToTestCase } from '../../util/import';

export default function ResourceCreationPanel() {
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<string | null>(null);

  const selectedPatient = useRecoilValue(selectedPatientState);
  const [currentPatients, setCurrentPatients] = useRecoilState(patientTestCaseState);
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
    } else {
      showNotification({
        title: 'Measure Bundle Folder Creation Failed',
        message: 'Could not successfully create zip folder for downloading all patients'
      });
    }
  };

  const readFileContent = (file: File) => {
    const reader = new FileReader();

    return new Promise<string>((resolve, reject) => {
      // Set the native promise rejection for the FileReader to properly catch errors
      reader.onerror = reject;

      reader.onload = () => {
        resolve(reader.result as string);
      };

      reader.readAsText(file);
    });
  };

  const handleSubmittedImport = (files: File[]) => {
    const filePromises = files.map(readFileContent);

    // TODO (MATT/ELSA): need to change this to fail safely when a promise rejects. It shouldn't halt the import
    Promise.all(filePromises)
      .then(allFileContent => {
        const nextPatientState = produce(currentPatients, draftState => {
          allFileContent.forEach(bundleStr => {
            // TODO (MATT/ELSA): Add more error checking for if resource is actually a bundle
            const bundle = JSON.parse(bundleStr) as fhir4.Bundle;

            const testCase = bundleToTestCase(bundle);

            if (!testCase.patient.id) {
              throw new Error('Could not find id on patient resource');
            }

            draftState[testCase.patient.id] = testCase;
          });
        });

        // TODO (MATT/ELSA): Show notification with success information
        setCurrentPatients(nextPatientState);
      })
      .catch(err => {
        // TODO (MATT/ELSA): Show notification with proper error message
      });
  };

  return (
    <>
      <ImportModal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSubmit={handleSubmittedImport}
      />
      <Center>
        <Group style={{ paddingTop: '24px', paddingBottom: '24px' }}>
          <Button onClick={() => openPatientModal()}>Create Test Patient</Button>
          <Button onClick={() => setIsImportModalOpen(true)} color="gray">
            <Upload />
            &nbsp;Import Test Case(s)
          </Button>
          <Button
            aria-label={'Download All Patients'}
            disabled={Object.keys(currentPatients).length === 0}
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
