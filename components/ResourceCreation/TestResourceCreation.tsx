import { Button, Grid, Group, Paper, Text } from '@mantine/core';
import { useCallback, useEffect, useState } from 'react';
import produce from 'immer';
import { useRecoilState, useRecoilValue } from 'recoil';
import CodeEditorModal from '../CodeEditorModal';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { selectedDataRequirementState } from '../../state/atoms/selectedDataRequirement';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { createFHIRResourceString } from '../../util/fhir';
import { selectedPatientState } from '../../state/atoms/selectedPatient';
import { Edit, Trash } from 'tabler-icons-react';
import dynamic from 'next/dynamic'

function TestResourceCreation() {
  const ResourceViz = dynamic(() => import('fhir-visualizers').then((mod) => mod.ResourceVisualizer), { ssr: false, })
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

  const showDetails = (entry) => {
    openResourceModal(entry.id);
  };

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
    closeResourceModal();
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
          return createFHIRResourceString(selectedDataRequirement.content, measureBundle.content, selectedPatient);
        }
      }
    }
    return undefined;
  };

  const alternatingColor = ['#e3e3e3', '#ffffff'];
  const types = ['Encounter','Condition','Observation','Medication','AllergyIntolerance','CarePlan','Procedure','Immunization','ServiceRequest',
                 'DeviceRequest','Communication','Coverage','AdverseEvent','NutritionOrder','MedicationRequest','MedicationAdministration',
                 'MedicationDispense','DiagnosticReport']

  return (
    <>
      <CodeEditorModal
        open={isResourceModalOpen}
        onClose={closeResourceModal}
        title="Edit FHIR Resource"
        onSave={updateResource}
        onDelete={deleteResource}
        currentResource={currentResource}
        initialValue={getInitialResource()}
      />
      {selectedPatient && currentTestCases[selectedPatient].resources.length > 0 && (
        <>
          <h3>Test Case Resources:</h3>
          {types.map((r) => {
            const entries = currentTestCases[selectedPatient].resources.filter((e) => e.resourceType == r).map((e) => e)
            if (entries.length > 0) {
              return (<ResourceViz key={r} resourceType={r} onRowClick={showDetails} rows={entries} />)
            }
          })}
        </>
      )}
    </>
  );
}

export default TestResourceCreation;
