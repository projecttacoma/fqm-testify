import { Button, Group, Paper, Text } from '@mantine/core';
import { useCallback, useEffect, useState } from 'react';
import produce from 'immer';
import { useRecoilState, useRecoilValue } from 'recoil';
import CodeEditorModal from '../CodeEditorModal';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { selectedDataRequirementState } from '../../state/atoms/selectedDataRequirement';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { createFHIRResourceString } from '../../util/fhir';
import { selectedPatientState } from '../../state/atoms/selectedPatient';

function TestResourceCreation() {
  const [currentTestCases, setCurrentTestCases] = useRecoilState(patientTestCaseState);
  const [currentResource, setCurrentResource] = useState<string | null>(null);
  const [selectedDataRequirement, setSelectedDataRequirement] = useRecoilState(selectedDataRequirementState);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const measureBundle = useRecoilValue(measureBundleState);
  const selectedPatient = useRecoilValue(selectedPatientState);

  const openResourceModal = useCallback(
    (resourceId?: string) => {
      if (
        resourceId &&
        selectedPatient &&
        currentTestCases[selectedPatient].resources.findIndex(r => r.id === resourceId) >= 0
      ) {
        setCurrentResource(resourceId);
      } else {
        setCurrentResource(null);
      }
      setIsResourceModalOpen(true);
    },
    [currentTestCases, selectedPatient]
  );

  useEffect(() => {
    if (selectedDataRequirement.content && !currentResource) {
      openResourceModal();
    }
  }, [openResourceModal, selectedDataRequirement, currentResource]);

  const closeResourceModal = () => {
    setIsResourceModalOpen(false);
    setCurrentResource(null);
    setSelectedDataRequirement({ name: '', content: null });
  };

  const updateResource = (val: string) => {
    const updatedResource = JSON.parse(val.trim());

    if (updatedResource.id) {
      const resourceId = updatedResource.id;

      // Create a new state object using immer without needing to shallow clone the entire previous object
      if (selectedPatient) {
        const resourceIndexToUpdate = currentTestCases[selectedPatient].resources.findIndex(r => r.id === resourceId);
        let nextResourceState;
        if (resourceIndexToUpdate < 0) {
          // add new resource
          nextResourceState = produce(currentTestCases, draftState => {
            draftState[selectedPatient].resources.push(updatedResource);
          });
        } else {
          // update existing resource
          nextResourceState = produce(currentTestCases, draftState => {
            draftState[selectedPatient].resources[resourceIndexToUpdate] = updatedResource;
          });
        }
        setCurrentTestCases(nextResourceState);
      }
    }
    closeResourceModal();
  };

  const deleteResource = (id?: string) => {
    if (id && selectedPatient) {
      const resourceIndexToDelete = currentTestCases[selectedPatient].resources.findIndex(r => r.id === id);
      if (resourceIndexToDelete >= 0) {
        const nextResourceState = produce(currentTestCases, draftState => {
          draftState[selectedPatient].resources.splice(resourceIndexToDelete, 1);
        });
        setCurrentTestCases(nextResourceState);
      }
    }
  };

  const getInitialResource = () => {
    if (isResourceModalOpen) {
      if (currentResource && selectedPatient) {
        return JSON.stringify(
          currentTestCases[selectedPatient].resources.filter(r => r.id === currentResource)[0],
          null,
          2
        );
      } else {
        if (selectedDataRequirement.content && measureBundle.content) {
          return createFHIRResourceString(selectedDataRequirement.content, measureBundle.content);
        }
      }
    }
    return undefined;
  };

  return (
    <>
      <CodeEditorModal
        open={isResourceModalOpen}
        onClose={closeResourceModal}
        title="Edit FHIR Resource"
        onSave={updateResource}
        initialValue={getInitialResource()}
      />
      {selectedPatient && currentTestCases[selectedPatient].resources.length > 0 && (
        <>
          <h3>Test Case Resources:</h3>
          {currentTestCases[selectedPatient].resources.map((resource, idx) => (
            <Paper key={resource.id} withBorder p="md">
              <Group>
                <Text>{`${idx + 1}. ${resource.resourceType}`}</Text>
                <Button
                  onClick={() => {
                    openResourceModal(resource.id);
                  }}
                >
                  Edit FHIR Resource
                </Button>
                <Button
                  onClick={() => {
                    deleteResource(resource.id);
                  }}
                  color="red"
                >
                  Delete Resource
                </Button>
              </Group>
            </Paper>
          ))}
        </>
      )}
    </>
  );
}

export default TestResourceCreation;
