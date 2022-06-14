import { useEffect } from 'react';
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

  useEffect(() => {
    openModal();
  }, [selectedDataRequirement]);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const updateResource = (val: string) => {};

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const deleteResource = (id: string) => {};

  const getInitialResource = () => {
    // check that a button has been selected
    if (isResourceModalOpen) {
      if (currentResource) {
        return JSON.stringify(currentResources[currentResource], null, 2);
      } else {
        createFHIRResourceString(selectedDataRequirement.content);
        // need to create test resource from selected data requirements button
        // make a function in fhir.ts to accomplish this
      }
    }
    return undefined;
  };

  const openModal = () => {
    if (selectedDataRequirement.content) {
      setIsResourceModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsResourceModalOpen(false);
  };

  return (
    <CodeEditorModal
      open={isResourceModalOpen}
      onClose={closeModal}
      title="Edit FHIR Resource"
      onSave={closeModal}
      // initialValue={}
    />
  );
}

export default ResourceCreation;
