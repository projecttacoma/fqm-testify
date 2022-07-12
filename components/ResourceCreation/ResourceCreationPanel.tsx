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
import { CircleCheck, Download, Upload } from 'tabler-icons-react';
import { createPatientBundle, getPatientNameString } from '../../util/fhir';
import { downloadZip } from '../../util/downloadUtil';
import ImportModal from './ImportModal';
import { bundleToTestCase } from '../../util/import';
import { IconAlertCircle } from '@tabler/icons';
import { NotificationProps, showNotification } from '@mantine/notifications';

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

    return new Promise<{ fileName: string; fileContent: string }>((resolve, reject) => {
      // Set the native promise rejection for the FileReader to properly catch errors
      reader.onerror = reject;

      reader.onload = () => {
        resolve({ fileName: file.name, fileContent: reader.result as string });
      };

      reader.readAsText(file);
    });
  };

  const showError = (message: string) => {
    showNotification({
      icon: <IconAlertCircle />,
      title: 'Import error',
      message,
      color: 'red'
    });
  };

  const handleSubmittedImport = (files: File[]) => {
    const filePromises = files.map(readFileContent);

    Promise.all(filePromises)
      .then(allFileContent => {
        const successNotifications: NotificationProps[] = [];
        const nextPatientState = produce(currentPatients, draftState => {
          allFileContent.forEach(({ fileName, fileContent }) => {
            let resource: any;
            try {
              resource = JSON.parse(fileContent);
            } catch (e) {
              if (e instanceof Error) {
                showError(e.message);
                return;
              }
            }

            if (resource.resourceType !== 'Bundle') {
              showError(`${fileName} is not a FHIR Bundle`);
              return;
            }

            const bundle = resource as fhir4.Bundle;
            const testCase = bundleToTestCase(bundle);

            if (!testCase.patient.id) {
              showError('Could not find id on patient resource');
              return;
            }

            draftState[testCase.patient.id] = testCase;

            successNotifications.push({
              id: `${fileName}-success`,
              message: `Successfully imported ${fileName}`,
              icon: <CircleCheck />,
              color: 'green'
            });
          });
        });

        setCurrentPatients(nextPatientState);

        successNotifications.forEach(notif => {
          showNotification(notif);
        });
      })
      .catch(err => {
        // If this catch block happens, the FileReader couldn't read any files. For now, we're stopping import at this
        // Other error cases (i.e. invalid JSON, invalid Bundle) will fail safely
        showNotification({
          id: 'import-error',
          icon: <IconAlertCircle />,
          title: 'Import error',
          message: err.message,
          color: 'red'
        });
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
