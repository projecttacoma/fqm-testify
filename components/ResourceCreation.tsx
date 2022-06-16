import { Accordion, Button, Group } from '@mantine/core';
import { useEffect } from 'react';
import produce from 'immer';
import { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import CodeEditorModal from '../components/CodeEditorModal';
import { fhirResourceState } from '../state/atoms/fhirResource';
import { selectedDataRequirementState } from '../state/atoms/selectedDataRequirement';
import { createFHIRResourceString } from '../util/fhir';

function ResourceCreation() {
  const selectedDataRequirement = useRecoilValue(selectedDataRequirementState);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [currentResource, setCurrentResource] = useState<string | null>(null);
  const [currentResources, setCurrentResources] = useRecoilState(fhirResourceState);

  const openModal = (resourceId?: string) => {
    if (resourceId && Object.keys(currentResources).includes(resourceId)) {
      setCurrentResource(resourceId);
    } else {
      setCurrentResource(null);
    }

    if (selectedDataRequirement.content) {
      setIsResourceModalOpen(true);
    }
  };
  
  useEffect(() => {
    if (selectedDataRequirement.content) {
      setIsResourceModalOpen(true);
    }
  }, [selectedDataRequirement]);

  const updateResource = (val: string) => {
    // TODO: Validate the incoming JSON as FHIR
    const updatedResource = JSON.parse(val.trim()); //as fhir4.Resource

    if (updatedResource.id) {
      const resourceId = updatedResource.id;

      // Create a new state object using immer without needing to shallow clone the entire previous object
      const nextResourceState = produce(currentResources, draftState => {
        draftState[resourceId] = updatedResource;
      });

      setCurrentResources(nextResourceState);
    }

    closeModal();
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

  

  const closeModal = () => {
    setIsResourceModalOpen(false);
    setCurrentResource(null);
  };

  return (
    <>
    <CodeEditorModal
      open={isResourceModalOpen}
      onClose={closeModal}
      title="Edit FHIR Resource"
      onSave={updateResource}
      initialValue={getInitialResource()}
    />
    {Object.keys(currentResources).length > 0 && (
      <>
      <h1>Test Case Resources:</h1>
      <Accordion>
        {Object.entries(currentResources).map(([id, resource]) => (
          <Accordion.Item key={id} label={resource.resourceType}>
            <Group>
              <Button
                onClick={() => {
                  openModal(id);
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
          </Accordion.Item>
        ))}
      </Accordion>
      </>
    )}
    </>
  );
}

export default ResourceCreation;

