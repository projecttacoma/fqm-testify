import JSZip from 'jszip';
import { Button, Center, Grid, Group, Loader, Text } from '@mantine/core';
import React, { ReactNode, Suspense, useState } from 'react';
import produce from 'immer';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { useRecoilState, useRecoilValue } from 'recoil';
import { patientTestCaseState, TestCaseInfo } from '../../state/atoms/patientTestCase';
import { selectedPatientState } from '../../state/atoms/selectedPatient';
import PatientCreation from './PatientCreation';
import TestResourcesDisplay from './TestResourcesDisplay';
import { createPatientBundle, getPatientNameString } from '../../util/fhir';
import { downloadZip } from '../../util/downloadUtil';
import ImportModal from './ImportModal';
import { bundleToTestCase } from '../../util/import';
import { IconAlertCircle, IconFileDownload, IconFileUpload, IconInfoCircle, IconUserPlus } from '@tabler/icons';
import { showNotification } from '@mantine/notifications';

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

  const readFileContent = (file: File): Promise<{ fileName: string; fileContent: string }> => {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      // Set the native promise rejection for the FileReader to properly catch errors
      reader.onerror = reject;

      reader.onload = () => {
        resolve({ fileName: file.name, fileContent: reader.result as string });
      };

      reader.readAsText(file);
    });
  };

  const showImportError = (message: string | ReactNode) => {
    showNotification({
      icon: <IconAlertCircle />,
      title: 'Import error',
      message,
      color: 'red'
    });
  };

  const handleSubmittedImport = (files: File[]) => {
    const filePromises = files.map(readFileContent);

    let successCount = 0,
      failureCount = 0;
    Promise.all(filePromises)
      .then(allFileContent => {
        const nextPatientState = produce(currentPatients, draftState => {
          allFileContent.forEach(({ fileName, fileContent }) => {
            // Cast to FhirResource to safely access resourceType if no error is thrown during parse
            let resource = {} as fhir4.FhirResource;
            try {
              resource = JSON.parse(fileContent);
            } catch (e) {
              if (e instanceof Error) {
                failureCount += 1;
                showImportError(
                  <>
                    <strong>{fileName}</strong>: {e.message}
                  </>
                );
                return;
              }
            }

            if (resource.resourceType !== 'Bundle') {
              failureCount += 1;
              showImportError(
                <>
                  <strong>{fileName}</strong> is not a FHIR Bundle
                </>
              );
              return;
            }

            const bundle = resource as fhir4.Bundle;
            let testCase = {} as TestCaseInfo;

            try {
              testCase = bundleToTestCase(bundle);
            } catch (e) {
              if (e instanceof Error) {
                failureCount += 1;
                showImportError(
                  <>
                    <strong>{fileName}</strong>: {e.message}
                  </>
                );
                return;
              }
            }

            if (!testCase.patient.id) {
              failureCount += 1;
              showImportError(
                <>
                  <strong>{fileName}</strong>: Could not find id on patient resource
                </>
              );
              return;
            }

            draftState[testCase.patient.id] = testCase;
            successCount += 1;
          });
        });

        setCurrentPatients(nextPatientState);
      })
      .catch(err => {
        failureCount += 1;
        // If this catch block happens, the FileReader couldn't read any files. For now, we're stopping import at this
        // Other error cases (i.e. invalid JSON, invalid Bundle) will fail safely
        showNotification({
          id: 'import-error',
          icon: <IconAlertCircle />,
          title: 'Import error',
          message: err.message,
          color: 'red'
        });
      })
      .finally(() => {
        showNotification({
          id: 'import-info',
          icon: <IconInfoCircle />,
          title: 'Import Results',
          message: `Success: ${successCount}\nFailed: ${failureCount}`,
          color: 'blue'
        });
      });
  };

  const renderDataElements = () => {
    if (measureBundle.content == null || Object.keys(currentPatients).length === 0) {
      return '';
    } else if (selectedPatient == null) {
      return (
        <Center>
          <Text>Select a patient to add data</Text>
        </Center>
      );
    }
    return (
      <Suspense
        fallback={
          <Center>
            <Loader />
          </Center>
        }
      >
        <Center style={{ paddingBottom: '8px' }}>
          <Text>Add data to {getPatientNameString(currentPatients[selectedPatient].patient)}</Text>
        </Center>
        <TestResourcesDisplay />
      </Suspense>
    );
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
          <Button aria-label="Create Test Patient" onClick={() => openPatientModal()}>
            <IconUserPlus />
            &nbsp;Create Test Patient
          </Button>
          <Button aria-label="Import Test Patient(s)" onClick={() => setIsImportModalOpen(true)} variant="default">
            <IconFileUpload />
            &nbsp;Import Test Patient(s)
          </Button>
          <Button
            aria-label="Download All Patients"
            disabled={Object.keys(currentPatients).length === 0}
            onClick={exportAllPatients}
            variant="default"
          >
            <IconFileDownload />
            &nbsp;Download All Patients
          </Button>
        </Group>
      </Center>
      <Grid>
        <Grid.Col span={4}>{renderDataElements()}</Grid.Col>
        <Grid.Col span={8}>
          <PatientCreation {...{ openPatientModal, closePatientModal, isPatientModalOpen, currentPatient }} />
        </Grid.Col>
      </Grid>
    </>
  );
}
