import { Button, Center, Collapse, Group, Stack, Text } from '@mantine/core';
import produce from 'immer';
import CodeEditorModal from '../CodeEditorModal';
import { useRecoilState, useRecoilValue } from 'recoil';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { createPatientResourceString, getPatientInfoString } from '../../util/fhir';
import { measurementPeriodState } from '../../state/atoms/measurementPeriod';
import { selectedPatientState } from '../../state/atoms/selectedPatient';
import { ChevronRight, ChevronDown } from 'tabler-icons-react';
import React from 'react';

interface PatientCreationProps {
  openModal: (patientId?: string) => void;
  closeModal: () => void;
  isPatientModalOpen: boolean;
  currentPatient: string | null;
}

function PatientCreation({ openModal, closeModal, isPatientModalOpen, currentPatient }: PatientCreationProps) {
  const [currentPatients, setCurrentPatients] = useRecoilState(patientTestCaseState);
  const measurementPeriod = useRecoilValue(measurementPeriodState);
  const [selectedPatient, setSelectedPatient] = useRecoilState(selectedPatientState);

  const updatePatientTestCase = (val: string) => {
    // TODO: Validate the incoming JSON as FHIR
    const pt = JSON.parse(val.trim()) as fhir4.Patient;

    if (pt.id) {
      const patientId = pt.id;

      // Create a new state object using immer without needing to shallow clone the entire previous object
      const nextPatientState = produce(currentPatients, draftState => {
        draftState[patientId] = pt;
      });

      setCurrentPatients(nextPatientState);
    }

    closeModal();
  };

  const deletePatientTestCase = (id: string) => {
    const nextPatientState = produce(currentPatients, draftState => {
      delete draftState[id];
    });

    setCurrentPatients(nextPatientState);
  };

  const getInitialPatientResource = () => {
    if (isPatientModalOpen) {
      if (currentPatient) {
        return JSON.stringify(currentPatients[currentPatient], null, 2);
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
    }
  };
  return (
    <>
      <CodeEditorModal
        open={isPatientModalOpen}
        onClose={closeModal}
        title="Edit Patient Resource"
        onSave={updatePatientTestCase}
        initialValue={getInitialPatientResource()}
      />

      {Object.keys(currentPatients).length > 0 && (
        <>
          <Stack data-testid="patient-stack">
            {Object.entries(currentPatients).map(([id, patient]) => (
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
                  {getPatientInfoString(patient)}
                </Button>

                <Collapse in={selectedPatient === id} style={{ padding: '4px' }}>
                  <Center>
                    <Group>
                      <Button
                        onClick={() => {
                          openModal(id);
                        }}
                      >
                        Edit Patient
                      </Button>
                      <Button
                        onClick={() => {
                          deletePatientTestCase(id);
                        }}
                        color="red"
                      >
                        Delete Patient
                      </Button>
                    </Group>
                  </Center>
                  <Text>TODO: Add view of data elements associated with test case</Text>
                </Collapse>
              </div>
            ))}
          </Stack>
        </>
      )}
    </>
  );
}

export default PatientCreation;
