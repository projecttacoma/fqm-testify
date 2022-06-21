import { Button, Group, Paper, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import produce from 'immer';
import { useRecoilState, useRecoilValue } from 'recoil';
import CodeEditorModal from '../CodeEditorModal';
import { fhirResourceState } from '../../state/atoms/fhirResource';
import { selectedDataRequirementState } from '../../state/atoms/selectedDataRequirement';
import { createFHIRResourceString } from '../../util/fhir';

interface ResourceCreationProps {
  selectedPatient: string | null
}

function TestResourceCreation({ selectedPatient }: ResourceCreationProps) {
  const [currentResources, setCurrentResources] = useRecoilState(fhirResourceState);
  const [currentResource, setCurrentResource] = useState<string | null>(null);
  const selectedDataRequirement = useRecoilValue(selectedDataRequirementState);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);

  useEffect(() => {
    if (selectedDataRequirement.content) {
      setIsResourceModalOpen(true);
    }
  }, [selectedDataRequirement, setIsResourceModalOpen]);

  const openResourceModal = (resourceId?: string) => {
    if (resourceId && Object.keys(currentResources).includes(resourceId)) {
      setCurrentResource(resourceId);
    } else {
      setCurrentResource(null);
    }

    if (selectedDataRequirement.content) {
      setIsResourceModalOpen(true);
    }
  };
  const closeResourceModal = () => {
    setIsResourceModalOpen(false);
    setCurrentResource(null);
  };

  const updateResource = (val: string) => {
    // TODO: Validate the incoming JSON as FHIR
    const updatedResource = JSON.parse(val.trim()); //as fhir4.Resource

    if (updatedResource.id) {
      const resourceId = updatedResource.id;

      // Create a new state object using immer without needing to shallow clone the entire previous object
      const nextResourceState = produce(currentResources, draftState => {
        draftState[resourceId] = {selectedPatient, resource: updatedResource};
      });

      setCurrentResources(nextResourceState);
    }

    closeResourceModal();
  };

  const deleteResource = (id: string) => {
    const nextResourceState = produce(currentResources, draftState => {
      delete draftState[id];
    })

    setCurrentResources(nextResourceState);
  };

  const getInitialResource = () => {
    if (isResourceModalOpen) {
      if (currentResource) {
        return JSON.stringify(currentResources[currentResource], null, 2);
      } else {
        console.log(selectedDataRequirement.content?.codeFilter);
        console.log(selectedDataRequirement.content?.extension);
        console.log(selectedDataRequirement.content?.type);

        if (selectedDataRequirement.content) {
           return createFHIRResourceString(selectedDataRequirement.content);
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
    {(Object.keys(currentResources).length > 0 && selectedPatient) && (
      <>
      <h3>Test Case Resources:</h3>
        {Object.entries(currentResources).map(([id, resource]) => (
          <Paper key={id} withBorder p="md">
            <Group>
              <Text>{resource.resource.resourceType}</Text>
              <Button
                onClick={() => {
                  openResourceModal(id);
                }}
              >
                Edit FHIR Resource
              </Button>
              <Button
                onClick={() => {
                  deleteResource(id);
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

