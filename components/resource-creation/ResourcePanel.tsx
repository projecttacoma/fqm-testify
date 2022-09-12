import { Button, Center, Divider, Text } from '@mantine/core';
import { v4 as uuidv4 } from 'uuid';
import { IconCodePlus } from '@tabler/icons';
import { Suspense, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Loader } from 'tabler-icons-react';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { selectedPatientState } from '../../state/atoms/selectedPatient';
import { getPatientNameString } from '../../util/fhir';
import produce from 'immer';
import CodeEditorModal from '../modals/CodeEditorModal';
import ResourceDisplay from './ResourceDisplay';
import ResourceSelection from './ResourceSelection';

export default function ResourcePanel() {
  const selectedPatient = useRecoilValue(selectedPatientState);
  const [currentPatients, setCurrentPatients] = useRecoilState(patientTestCaseState);
  const [isNewResourceModalOpen, setIsNewResourceModalOpen] = useState(false);

  const createNewResource = (val: string) => {
    // TODO: Validate the incoming JSON as FHIR
    const newResource = JSON.parse(val.trim());
    // Create a new state object using immer without needing to shallow clone the entire previous object
    if (selectedPatient) {
      if (!newResource.id) {
        newResource.id = uuidv4();
      }
      const nextResourceState = produce(currentPatients, draftState => {
        draftState[selectedPatient].resources.push(newResource);
      });
      setCurrentPatients(nextResourceState);
    }
    setIsNewResourceModalOpen(false);
  };

  const renderPanelPlaceholderText = () => {
    return (
      <Text color="dimmed">
        <i>Select a patient to add resources and see more information</i>
      </Text>
    );
  };

  const renderResourceSelection = () => {
    if (Object.keys(currentPatients).length === 0 || selectedPatient == null) {
      return renderPanelPlaceholderText();
    }

    return (
      <Suspense
        fallback={
          <Center>
            <Loader />
          </Center>
        }
      >
        <CodeEditorModal
          open={isNewResourceModalOpen}
          onClose={() => setIsNewResourceModalOpen(false)}
          title="Add JSON for new FHIR Resource"
          onSave={createNewResource}
        />
        <Text>
          {getPatientNameString(currentPatients[selectedPatient].patient)} Resources (
          {currentPatients[selectedPatient].resources.length})
        </Text>
        <div
          style={{
            paddingTop: '12px'
          }}
        >
          <ResourceSelection />
          <Center>Or</Center>
          <Center>
            <Button
              aria-label="Add New Custom Resource"
              onClick={() => setIsNewResourceModalOpen(true)}
              variant="outline"
            >
              <IconCodePlus />
              &nbsp;Add New Custom Resource
            </Button>
          </Center>
          <Divider my="lg" />
        </div>
      </Suspense>
    );
  };

  return (
    <>
      {renderResourceSelection()}
      <ResourceDisplay />
    </>
  );
}
