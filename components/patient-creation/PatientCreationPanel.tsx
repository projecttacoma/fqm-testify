import JSZip from 'jszip';
import { downloadZip } from '../../util/downloadUtil';
import { Button, Group, Stack } from '@mantine/core';
import produce from 'immer';
import CodeEditorModal from '../modals/CodeEditorModal';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { patientTestCaseState, TestCaseInfo } from '../../state/atoms/patientTestCase';
import { measurementPeriodState } from '../../state/atoms/measurementPeriod';
import { selectedPatientState } from '../../state/atoms/selectedPatient';
import React, { ReactNode, useMemo, useState } from 'react';
import { download } from '../../util/downloadUtil';
import ConfirmationModal from '../modals/ConfirmationModal';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { showNotification } from '@mantine/notifications';
import { IconAlertCircle, IconFileDownload, IconFileUpload, IconInfoCircle, IconUserPlus } from '@tabler/icons';
import ImportModal from '../modals/ImportModal';
import { bundleToTestCase } from '../../util/import';
import PatientInfoCard from '../utils/PatientInfoCard';
import PopulationCalculation from '../calculation/PopulationCalculation';
import { calculationLoading } from '../../state/atoms/calculationLoading';
import { useMediaQuery } from '@mantine/hooks';
import { getPatientNameString } from '../../util/fhir/patient';
import {
  createCopiedPatientResource,
  createCopiedResources,
  createPatientBundle,
  createPatientResourceString
} from '../../util/fhir/resourceCreation';
import { cqfmTestMRLookupState } from '../../state/selectors/cqfmTestMRLookup';
import { getMeasurePopulations } from '../../util/MeasurePopulations';
import { detailedResultLookupState } from '../../state/atoms/detailedResultLookup';
import { calculateDetailedResult } from '../../util/MeasureCalculation';
import { trustMetaProfileState } from '../../state/atoms/trustMetaProfile';
import { dataRequirementsState } from '../../state/selectors/dataRequirements';
import { minimizeTestCaseResources } from '../../util/ValueSetHelper';
import { resourceSwitchOn } from '../../state/atoms/resourceSwitch';
import { dataRequirementsLookupByType } from '../../state/selectors/dataRequirementsLookupByType';

function PatientCreationPanel() {
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<string | null>(null);
  const [copiedPatient, setCopiedPatient] = useState<string | null>(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [currentPatients, setCurrentPatients] = useRecoilState(patientTestCaseState);
  const currentTestMRLookup = useRecoilValue(cqfmTestMRLookupState);
  const [selectedPatient, setSelectedPatient] = useRecoilState(selectedPatientState);
  const measureBundle = useRecoilValue(measureBundleState);
  const measurementPeriod = useRecoilValue(measurementPeriodState);
  const setIsCalculationLoading = useSetRecoilState(calculationLoading);
  const [detailedResultLookup, setDetailedResultLookup] = useRecoilState(detailedResultLookupState);
  const isSmallScreen = useMediaQuery('(max-width: 1600px)');
  const measure = useMemo(() => {
    return measureBundle.content?.entry?.find(e => e.resource?.resourceType === 'Measure')?.resource as fhir4.Measure;
  }, [measureBundle]);
  const trustMetaProfile = useRecoilValue(trustMetaProfileState);
  const dataRequirements = useRecoilValue(dataRequirementsState);
  const drLookupByType = useRecoilValue(dataRequirementsLookupByType);
  const minResources = useRecoilValue(resourceSwitchOn);

  const openPatientModal = (patientId?: string, copy = false) => {
    if (patientId && Object.keys(currentPatients).includes(patientId)) {
      if (copy) {
        setCurrentPatient(null);
        setCopiedPatient(patientId);
      } else {
        setCurrentPatient(patientId);
      }
    } else {
      setCurrentPatient(null);
    }

    setIsPatientModalOpen(true);
  };

  const closePatientModal = () => {
    setIsPatientModalOpen(false);
    setCurrentPatient(null);
    setCopiedPatient(null);
  };

  const detailedResultCalculation = async (id: string) => {
    setSelectedPatient(id);
    if (!detailedResultLookup[id]) {
      setIsCalculationLoading(true);
      // Create a new state object using immer without needing to shallow clone the entire previous object
      produce(detailedResultLookup, async draftState => {
        if (measureBundle.content) {
          try {
            draftState[id] = await calculateDetailedResult(
              currentPatients[id],
              measureBundle.content,
              measurementPeriod.start?.toISOString(),
              measurementPeriod.end?.toISOString(),
              trustMetaProfile
            );
          } catch (error) {
            if (error instanceof Error) {
              showNotification({
                icon: <IconAlertCircle />,
                title: 'Calculation Error',
                message: error.message,
                color: 'red'
              });
            }
          }
        }
      }).then(nextDRLookupState => {
        setDetailedResultLookup(nextDRLookupState);
        setIsCalculationLoading(false);
      });
    }
  };

  const updatePatientTestCase = (val: string) => {
    // TODO: Validate the incoming JSON as FHIR
    const pt = JSON.parse(val.trim()) as fhir4.Patient;
    if (pt.id) {
      const patientId = pt.id;

      let resources: fhir4.BundleEntry[];
      // save new resources for a copied patient
      if (copiedPatient) {
        const pat = currentPatients[copiedPatient];
        resources = createCopiedResources(pat.resources, pat.patient.id ?? '', patientId);
      } else {
        resources = currentPatients[patientId]?.resources ?? [];
      }
      // Create a new state object using immer without needing to shallow clone the entire previous object
      const nextPatientState = produce(currentPatients, draftState => {
        draftState[patientId] = {
          patient: pt,
          fullUrl: draftState[patientId]?.fullUrl ?? `urn:uuid:${patientId}`,
          resources: resources,
          minResources: draftState[patientId]?.minResources,
          desiredPopulations: currentPatients[patientId]?.desiredPopulations
        };
      });
      setCurrentPatients(nextPatientState);
      setIsCalculationLoading(true);

      setTimeout(() => {
        produce(detailedResultLookup, async draftState => {
          if (measureBundle.content) {
            try {
              draftState[patientId] = await calculateDetailedResult(
                nextPatientState[patientId],
                measureBundle.content,
                measurementPeriod.start?.toISOString(),
                measurementPeriod.end?.toISOString(),
                trustMetaProfile
              );
            } catch (error) {
              if (error instanceof Error) {
                showNotification({
                  icon: <IconAlertCircle />,
                  title: 'Calculation Error',
                  message: error.message,
                  color: 'red'
                });
              }
            }
          }
        }).then(nextDRLookupState => {
          setDetailedResultLookup(nextDRLookupState);
          setIsCalculationLoading(false);
        });
      }, 400);
    }

    closePatientModal();
  };

  const openConfirmationModal = () => {
    setIsConfirmationModalOpen(true);
  };

  const closeConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
  };

  const deletePatientTestCase = (id: string | null) => {
    if (id !== null) {
      const nextPatientState = produce(currentPatients, draftState => {
        delete draftState[id];
      });
      const nextResourceState = produce(detailedResultLookup, draftState => {
        delete draftState[id];
      });
      setCurrentPatients(nextPatientState);
      setDetailedResultLookup(nextResourceState);
      // Set the selected patient to null because the selected patient will not longer exist after it is deleted
      setSelectedPatient(null);
      closeConfirmationModal();
    }
  };

  const exportPatientTestCase = (id: string) => {
    const bundleString: string = JSON.stringify(
      createPatientBundle(
        currentPatients[id].patient,
        currentPatients[id].resources,
        currentPatients[id].fullUrl,
        currentTestMRLookup[id]
      ),
      null,
      2
    );
    const filename = `${getPatientNameString(currentPatients[id].patient)}-${id}.json`;
    // create and use hidden temporary download link in document
    download(filename, bundleString);
  };

  const getInitialPatientResource = (dataReqs: fhir4.DataRequirement[] | null) => {
    if (isPatientModalOpen) {
      if (currentPatient) {
        return JSON.stringify(currentPatients[currentPatient].patient, null, 2);
      } else if (copiedPatient) {
        // Create copy of copiedPatient
        const patient = createCopiedPatientResource(currentPatients[copiedPatient].patient);
        return JSON.stringify(patient, null, 2);
      } else {
        // Default to age 21 at time of measurement period, if specified
        const birthDate = measurementPeriod.start ? new Date(measurementPeriod.start) : new Date();
        birthDate.setFullYear(birthDate.getFullYear() - 21);
        // make an array of all the profiles on each data requirement if they exist
        const profiles = dataReqs?.flatMap(dr => dr.profile);
        // set qicorePatient to true if the profile on any of the data requirements is qicore
        const qicorePatient = profiles?.find(p => p?.includes('http://hl7.org/fhir/us/qicore/StructureDefinition'))
          ? true
          : false;
        return createPatientResourceString(qicorePatient, birthDate.toISOString().split('T')[0]);
      }
    }
    return undefined;
  };

  const getConfirmationModalText = (patientId: string | null) => {
    let patientName;
    if (patientId !== null) {
      const patient = currentPatients[patientId].patient;
      patientName = getPatientNameString(patient);
    }
    return `Are you sure you want to delete ${patientName || 'this patient'}?`;
  };

  const exportAllPatients = () => {
    // Build zip file
    const zip = new JSZip();
    const dateCreated = new Date();
    const fileNameString = `${
      measureBundle.isFile
        ? measureBundle.fileName.replace('.json', '')
        : measureBundle.displayMap[measureBundle.selectedMeasureId as string]
    }-test-cases`;
    const measureBundleFolder = zip.folder(fileNameString);
    if (measureBundleFolder) {
      Object.keys(currentPatients).forEach(id => {
        const bundleString: string = JSON.stringify(
          createPatientBundle(
            currentPatients[id].patient,
            currentPatients[id].resources,
            currentPatients[id].fullUrl,
            currentTestMRLookup[id]
          ),
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
              if (measure) {
                testCase = bundleToTestCase(bundle, getMeasurePopulations(measure));
              }
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
            if (minResources) {
              testCase.resources = minimizeTestCaseResources(testCase, measureBundle.content, drLookupByType);
              testCase.minResources = true;
            } else {
              testCase.minResources = false;
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

  return (
    <>
      <CodeEditorModal
        open={isPatientModalOpen}
        onClose={closePatientModal}
        title="Edit Patient Resource"
        onSave={updatePatientTestCase}
        initialValue={getInitialPatientResource(dataRequirements)}
      />
      <ConfirmationModal
        open={isConfirmationModalOpen}
        onClose={closeConfirmationModal}
        title={getConfirmationModalText(selectedPatient)}
        onConfirm={() => deletePatientTestCase(selectedPatient)}
      />
      <ImportModal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSubmit={handleSubmittedImport}
      />
      <Group py={24} position="center">
        <Button aria-label="Create Test Patient" onClick={() => openPatientModal()}>
          <IconUserPlus />
          &nbsp;Create
        </Button>
        <Button aria-label="Import Test Patient(s)" onClick={() => setIsImportModalOpen(true)} variant="outline">
          <IconFileUpload />
          &nbsp;Import
        </Button>
        <Button
          aria-label="Download All Patients"
          disabled={Object.keys(currentPatients).length === 0}
          onClick={exportAllPatients}
          variant="outline"
        >
          <IconFileDownload />
          &nbsp;Download All
        </Button>
      </Group>
      {Object.keys(currentPatients).length > 0 && (
        <div data-testid="patient-panel">
          <Stack>
            {Object.entries(currentPatients).map(([id, testCase]) => (
              <div
                key={id}
                onClick={() => {
                  setSelectedPatient(id);
                  detailedResultCalculation(id);
                }}
              >
                <PatientInfoCard
                  patient={testCase.patient}
                  onCopyClick={() => openPatientModal(id, true)}
                  onExportClick={() => exportPatientTestCase(id)}
                  onEditClick={() => openPatientModal(id)}
                  onDeleteClick={() => openConfirmationModal()}
                  selected={selectedPatient === id}
                  smallScreen={isSmallScreen}
                />
              </div>
            ))}
          </Stack>
        </div>
      )}
      <PopulationCalculation />
    </>
  );
}

export default PatientCreationPanel;
