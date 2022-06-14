import { Accordion, Button, Center, Group, Text } from '@mantine/core';
import produce from 'immer';
import { useState } from 'react';
import CodeEditorModal from '../components/CodeEditorModal';
import { useRecoilState, useRecoilValue } from 'recoil';
import { patientTestCaseState } from '../state/atoms/patientTestCase';
import { createPatientResourceString, getPatientInfoString } from '../util/fhir';
import { measurementPeriodState } from '../state/atoms/measurementPeriod';
import PRIMARY_CODE_PATH_MAP from '../util/primaryCodePath';

function PatientCreation() {
  const [currentPatients, setCurrentPatients] = useRecoilState(patientTestCaseState);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<string | null>(null);
  const measurementPeriod = useRecoilValue(measurementPeriodState);

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
    console.log(PRIMARY_CODE_PATH_MAP);
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
        <div style={{ paddingTop: '24px' }}>
          <Button onClick={() => openModal()}>Create Test Patient</Button>
        </div>
      </Center>

      <CodeEditorModal
        open={isPatientModalOpen}
        onClose={closeModal}
        title="Edit Patient Resource"
        onSave={updatePatientTestCase}
        initialValue={getInitialPatientResource()}
      />

      {Object.keys(currentPatients).length > 0 && (
        <>
          <h1>Test Cases:</h1>
          <Accordion>
            {Object.entries(currentPatients).map(([id, patient]) => (
              <Accordion.Item key={id} label={getPatientInfoString(patient)}>
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
                <Text>TODO: Add view of data elements associated with test case</Text>
              </Accordion.Item>
            ))}
          </Accordion>
        </>
      )}
    </>
  );
}

export default PatientCreation;
