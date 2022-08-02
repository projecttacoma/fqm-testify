import { Button, Collapse, createStyles, Group, Stack } from '@mantine/core';
import produce from 'immer';
import CodeEditorModal from '../CodeEditorModal';
import { useRecoilState, useRecoilValue } from 'recoil';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import {
  createPatientResourceString,
  getPatientInfoString,
  getPatientNameString,
  createPatientBundle
} from '../../util/fhir';
import { measurementPeriodState } from '../../state/atoms/measurementPeriod';
import { selectedPatientState } from '../../state/atoms/selectedPatient';
import { ChevronRight, ChevronDown, Download, Edit, Trash } from 'tabler-icons-react';
import React, { useState } from 'react';
import TestResourceCreation from './TestResourceCreation';
import { download } from '../../util/downloadUtil';
import ConfirmationModal from '../ConfirmationModal';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { Calculator, CalculatorTypes } from 'fqm-execution';
import parse from 'html-react-parser';
import { showNotification } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons';

const useStyles = createStyles(() => ({
  highlightedMarkup: {
    '& pre': {
      whiteSpace: 'pre-wrap'
    }
  }
}));

interface PatientCreationProps {
  openPatientModal: (patientId?: string) => void;
  closePatientModal: () => void;
  isPatientModalOpen: boolean;
  currentPatient: string | null;
}

function PatientCreation({
  openPatientModal,
  closePatientModal,
  isPatientModalOpen,
  currentPatient
}: PatientCreationProps) {
  const [currentPatients, setCurrentPatients] = useRecoilState(patientTestCaseState);
  const measurementPeriod = useRecoilValue(measurementPeriodState);
  const [selectedPatient, setSelectedPatient] = useRecoilState(selectedPatientState);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const measureBundle = useRecoilValue(measureBundleState);
  const [showCalculation, setShowCalculation] = useState(false);
  const { classes } = useStyles();

  // Function to wrap the calculate function and catch errors in fqm-execution
  const clickCalculateButton = async (id: string | null) => {
    try {
      await calculate(id);
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
  };

  // Function to calculate the selected patient's measure report
  const calculate = async (id: string | null) => {
    const options: CalculatorTypes.CalculationOptions = {
      calculateHTML: true,
      // TODO: Flip this to true once a new fqm-execution version is released/dependency is updated
      calculateSDEs: false,
      reportType: 'individual',
      measurementPeriodStart: measurementPeriod.start?.toISOString(),
      measurementPeriodEnd: measurementPeriod.end?.toISOString()
    };

    if (id && measureBundle.content) {
      const patientBundle = createPatientBundle(currentPatients[id].patient, currentPatients[id].resources);

      const mrResults = await Calculator.calculateMeasureReports(measureBundle.content, [patientBundle], options);
      const [measureReport] = mrResults.results as fhir4.MeasureReport[];

      const nextPatientState = produce(currentPatients, draftState => {
        draftState[id].measureReport = measureReport;
      });

      setCurrentPatients(nextPatientState);
      setShowCalculation(true);
    }
  };

  const updatePatientTestCase = (val: string) => {
    // TODO: Validate the incoming JSON as FHIR
    const pt = JSON.parse(val.trim()) as fhir4.Patient;

    if (pt.id) {
      const patientId = pt.id;

      // Create a new state object using immer without needing to shallow clone the entire previous object
      const nextPatientState = produce(currentPatients, draftState => {
        draftState[patientId] = { patient: pt, resources: currentPatients[patientId]?.resources ?? [] };
      });

      setCurrentPatients(nextPatientState);
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
      setCurrentPatients(nextPatientState);
      // Set the selected patient to null because the selected patient will not longer exist after it is deleted
      setSelectedPatient(null);
      closeConfirmationModal();
    }
  };

  const exportPatientTestCase = (id: string) => {
    const bundleString: string = JSON.stringify(
      createPatientBundle(currentPatients[id].patient, currentPatients[id].resources),
      null,
      2
    );
    const filename = `${getPatientNameString(currentPatients[id].patient)}-${id}.json`;
    // create and use hidden temporary download link in document
    download(filename, bundleString);
  };

  const getInitialPatientResource = () => {
    if (isPatientModalOpen) {
      if (currentPatient) {
        return JSON.stringify(currentPatients[currentPatient].patient, null, 2);
      } else {
        // Default to age 21 at time of measurement period, if specified
        const birthDate = measurementPeriod.start ? new Date(measurementPeriod.start) : new Date();
        birthDate.setFullYear(birthDate.getFullYear() - 21);
        return createPatientResourceString(birthDate.toISOString().split('T')[0]);
      }
    }
    return undefined;
  };

  const updateSelectedPatient = (patientId: string) => {
    if (selectedPatient === patientId) {
      setSelectedPatient(null);
    } else {
      setSelectedPatient(patientId);
      // Reset the show calculation state variable to false so that it does show for other patients
      setShowCalculation(false);
    }
  };

  const getConfirmationModalText = (patientId: string | null) => {
    let patientName;
    if (patientId !== null) {
      const patient = currentPatients[patientId].patient;
      patientName = getPatientNameString(patient);
    }
    return `Are you sure you want to delete ${patientName || 'this patient'}?`;
  };

  return (
    <>
      <CodeEditorModal
        open={isPatientModalOpen}
        onClose={closePatientModal}
        title="Edit Patient Resource"
        onSave={updatePatientTestCase}
        initialValue={getInitialPatientResource()}
      />
      <ConfirmationModal
        open={isConfirmationModalOpen}
        onClose={closeConfirmationModal}
        title={getConfirmationModalText(selectedPatient)}
        onConfirm={() => deletePatientTestCase(selectedPatient)}
      />
      {Object.keys(currentPatients).length > 0 && (
        <div
          data-testid="patient-panel"
          style={{
            maxHeight: '40vh',
            overflow: 'scroll'
          }}
        >
          <Stack data-testid="patient-stack">
            {Object.entries(currentPatients).map(([id, testCase]) => (
              <div key={id}>
                <Button
                  variant="default"
                  leftIcon={selectedPatient === id ? <ChevronDown /> : <ChevronRight />}
                  fullWidth
                  onClick={() => updateSelectedPatient(id)}
                  styles={{
                    inner: {
                      justifyContent: 'flex-start'
                    }
                  }}
                >
                  {getPatientInfoString(testCase.patient)}
                </Button>
                <Collapse in={selectedPatient === id} style={{ padding: '4px' }}>
                  <Group>
                    <Button
                      data-testid="export-patient-button"
                      aria-label={'Export Patient'}
                      onClick={() => {
                        exportPatientTestCase(id);
                      }}
                    >
                      <Download />
                    </Button>
                    <Button
                      data-testid="edit-patient-button"
                      aria-label={'Edit Patient'}
                      onClick={() => {
                        openPatientModal(id);
                      }}
                      color="gray"
                    >
                      <Edit />
                    </Button>
                    <Button
                      data-testid="delete-patient-button"
                      aria-label={'Delete Patient'}
                      onClick={openConfirmationModal}
                      color="red"
                    >
                      <Trash />
                    </Button>
                    <Button data-testid="calculate-button" onClick={() => clickCalculateButton(id)} color="gray">
                      Calculate
                    </Button>
                    {currentPatients[id].measureReport !== undefined && (
                      <Button
                        data-testid="toggle-show-calculation-button"
                        onClick={() => setShowCalculation(o => !o)}
                        color="gray"
                      >
                        {showCalculation === true ? `Hide Logic Highlighting` : `Show Logic Highlighting`}
                      </Button>
                    )}
                  </Group>
                  {selectedPatient === id && (
                    <div
                      className={classes.highlightedMarkup}
                      style={{
                        maxHeight: '55vh',
                        overflow: 'scroll'
                      }}
                    >
                      <Collapse in={showCalculation}>
                        {parse(currentPatients[id].measureReport?.text?.div || '')}
                      </Collapse>
                    </div>
                  )}
                  {selectedPatient === id && <TestResourceCreation />}
                </Collapse>
              </div>
            ))}
          </Stack>
        </div>
      )}
    </>
  );
}

export default PatientCreation;
