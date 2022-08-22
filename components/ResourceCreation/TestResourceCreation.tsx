import { Button, Grid, Group, Paper, Text, Tooltip } from '@mantine/core';
import { useCallback, useEffect, useState } from 'react';
import produce from 'immer';
import { useRecoilState, useRecoilValue } from 'recoil';
import CodeEditorModal from '../CodeEditorModal';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { selectedDataRequirementState } from '../../state/atoms/selectedDataRequirement';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { createFHIRResourceString, getFhirResourceSummary } from '../../util/fhir';
import { selectedPatientState } from '../../state/atoms/selectedPatient';
import { Edit, Trash } from 'tabler-icons-react';
import { measurementPeriodState } from '../../state/atoms/measurementPeriod';
import ConfirmationModal from '../ConfirmationModal';

function TestResourceCreation() {
  const [currentTestCases, setCurrentTestCases] = useRecoilState(patientTestCaseState);
  const [currentResource, setCurrentResource] = useState<string | null>(null);
  const [selectedDataRequirement, setSelectedDataRequirement] = useRecoilState(selectedDataRequirementState);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const measureBundle = useRecoilValue(measureBundleState);
  const selectedPatient = useRecoilValue(selectedPatientState);
  const measurementPeriod = useRecoilValue(measurementPeriodState);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const openConfirmationModal = useCallback(
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
      setIsConfirmationModalOpen(true);
    },
    [currentTestCases, selectedPatient]
  );

  const closeConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
    setCurrentResource(null);
    setSelectedDataRequirement({ name: '', content: null });
  };

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

  const deleteResource = (id: string | null) => {
    if (id && selectedPatient) {
      const resourceIndexToDelete = currentTestCases[selectedPatient].resources.findIndex(r => r.id === id);
      if (resourceIndexToDelete >= 0) {
        const nextResourceState = produce(currentTestCases, draftState => {
          draftState[selectedPatient].resources.splice(resourceIndexToDelete, 1);
        });
        setCurrentTestCases(nextResourceState);
      }
    }
    closeConfirmationModal();
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
        if (
          selectedDataRequirement.content &&
          measureBundle.content &&
          measurementPeriod.start &&
          measurementPeriod.end
        ) {
          return createFHIRResourceString(
            selectedDataRequirement.content,
            measureBundle.content,
            selectedPatient,
            measurementPeriod.start.toISOString(),
            measurementPeriod.end.toISOString()
          );
        }
      }
    }
    return undefined;
  };

  const getConfirmationModalText = (resourceId: string | null) => {
    if (selectedPatient && resourceId) {
      const resourceIndex = currentTestCases[selectedPatient].resources.findIndex(r => r.id === resourceId);
      const resource = currentTestCases[selectedPatient].resources[resourceIndex];
      return `Are you sure you want to delete ${resource.resourceType} ${getFhirResourceSummary(resource)}?`;
    }
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
      <ConfirmationModal
        open={isConfirmationModalOpen}
        onClose={closeConfirmationModal}
        title={getConfirmationModalText(currentResource)}
        onConfirm={() => deleteResource(currentResource)}
      />
      {selectedPatient && selectedDataRequirement && currentTestCases[selectedPatient].resources.length > 0 && (
        <>
          <h3>Test Case Resources:</h3>
          {currentTestCases[selectedPatient].resources.map((resource, idx) => (
            <Paper
              key={resource.id}
              withBorder
              p="md"
              sx={theme => ({ backgroundColor: idx % 2 === 0 ? theme.colors.gray[1] : 'white' })}
            >
              <Grid justify="space-between">
                <Grid.Col span={10}>
                  <Tooltip
                    wrapLines
                    width={500}
                    withArrow
                    transition="fade"
                    transitionDuration={200}
                    label={<Text align="center">{getFhirResourceSummary(resource)} </Text>}
                    disabled={getFhirResourceSummary(resource) === ''}
                  >
                    <Text lineClamp={1}>{`${idx + 1}. ${resource.resourceType} ${getFhirResourceSummary(
                      resource
                    )}`}</Text>
                  </Tooltip>
                </Grid.Col>
                <Group>
                  <Tooltip label="Edit FHIR Resource" openDelay={1000}>
                    <Button
                      onClick={() => {
                        openResourceModal(resource.id);
                      }}
                      variant="default"
                      data-testid="edit-resource-button"
                    >
                      <Edit />
                    </Button>
                  </Tooltip>
                  <Tooltip label="Delete FHIR Resource" openDelay={1000}>
                    <Button
                      onClick={() => {
                        openConfirmationModal(resource.id);
                      }}
                      color="red"
                      variant="outline"
                      data-testid="delete-resource-button"
                    >
                      <Trash />
                    </Button>
                  </Tooltip>
                </Group>
              </Grid>
            </Paper>
          ))}
        </>
      )}
    </>
  );
}

export default TestResourceCreation;
