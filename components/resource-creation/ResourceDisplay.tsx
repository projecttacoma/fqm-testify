import { Stack } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { useCallback, useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { calculationLoading } from '../../state/atoms/calculationLoading';
import { detailedResultLookupState } from '../../state/atoms/detailedResultLookup';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { measurementPeriodFormattedState, measurementPeriodState } from '../../state/atoms/measurementPeriod';
import { cardFiltersAtom } from '../../state/atoms/cardFilters';
import { patientTestCaseState, TestCase } from '../../state/atoms/patientTestCase';
import { selectedDataRequirementState } from '../../state/atoms/selectedDataRequirement';
import { selectedPatientState } from '../../state/atoms/selectedPatient';
import { trustMetaProfileState } from '../../state/atoms/trustMetaProfile';
import { getFhirResourceSummary } from '../../util/fhir/codes';
import { dateForResource } from '../../util/fhir/dates';
import { createFHIRResourceString } from '../../util/fhir/resourceCreation';
import { calculateDetailedResult } from '../../util/MeasureCalculation';
import { DetailedResult } from '../../util/types';
import CodeEditorModal from '../modals/CodeEditorModal';
import ConfirmationModal from '../modals/ConfirmationModal';
import ResourceInfoCard from '../utils/ResourceInfoCard';
import ResourceSearchSort from './ResourceSearchSort';
import React from 'react';

function ResourceDisplay() {
  const [currentTestCases, setCurrentTestCases] = useRecoilState(patientTestCaseState);
  const [currentResource, setCurrentResource] = useState<string | null>(null);
  const [selectedDataRequirement, setSelectedDataRequirement] = useRecoilState(selectedDataRequirementState);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const measureBundle = useRecoilValue(measureBundleState);
  const selectedPatient = useRecoilValue(selectedPatientState);
  const measurementPeriod = useRecoilValue(measurementPeriodState);
  const measurementPeriodFormatted = useRecoilValue(measurementPeriodFormattedState);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const setIsCalculationLoading = useSetRecoilState(calculationLoading);
  const [detailedResultLookup, setDetailedResultLookup] = useRecoilState(detailedResultLookupState);
  const trustMetaProfile = useRecoilValue(trustMetaProfileState);
  const [filteredResources, setFilteredPatientResources] = useState<fhir4.BundleEntry[]>([]);
  const cardFilters = useRecoilValue(cardFiltersAtom);

  const openConfirmationModal = useCallback(
    (resourceId?: string) => {
      if (
        resourceId &&
        selectedPatient &&
        currentTestCases[selectedPatient].resources.findIndex(r => r.resource?.id === resourceId) >= 0
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
        currentTestCases[selectedPatient].resources.findIndex(r => r.resource?.id === resourceId) >= 0
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

  const detailedResultCalculation = async (
    draftState: WritableDraft<Record<string, DetailedResult>>,
    selectedPatient: string,
    nextResourceState: TestCase
  ) => {
    if (measureBundle.content) {
      try {
        draftState[selectedPatient] = await calculateDetailedResult(
          nextResourceState[selectedPatient],
          measureBundle.content,
          measurementPeriodFormatted?.start,
          measurementPeriodFormatted?.end,
          trustMetaProfile
        );
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
    }
  };

  const updateResource = (val: string, previousId: string | null) => {
    const updatedResource = JSON.parse(val.trim());
    if (updatedResource.id) {
      const resourceId = updatedResource.id;

      // Create a new state object using immer without needing to shallow clone the entire previous object
      if (selectedPatient) {
        const resourceIndexToUpdate = currentTestCases[selectedPatient].resources.findIndex(
          r => r.resource?.id === previousId
        );
        const nextResourceState = produce(currentTestCases, draftState => {
          if (resourceIndexToUpdate < 0) {
            // add new resource
            const entry: fhir4.BundleEntry = { resource: updatedResource, fullUrl: `urn:uuid:${resourceId}` };
            draftState[selectedPatient].resources.push(entry);
          } else {
            // update existing resource
            // if the resource's id was updated, make sure to update the fullUrl as well
            if (previousId && previousId !== resourceId) {
              const previousFullUrl = draftState[selectedPatient].resources[resourceIndexToUpdate].fullUrl;
              if (previousFullUrl) {
                const newFullUrl = previousFullUrl.replace(previousId, resourceId);
                draftState[selectedPatient].resources[resourceIndexToUpdate].fullUrl = newFullUrl;
              }
            }
            draftState[selectedPatient].resources[resourceIndexToUpdate].resource = updatedResource;
          }
        });
        setCurrentTestCases(nextResourceState);
        setIsCalculationLoading(true);

        setTimeout(() => {
          produce(detailedResultLookup, async draftState => {
            await detailedResultCalculation(draftState, selectedPatient, nextResourceState);
          }).then(nextDRLookupState => {
            setDetailedResultLookup(nextDRLookupState);
            setIsCalculationLoading(false);
          });
        }, 400);
      }
    }
    closeResourceModal();
  };

  const deleteResource = (id: string | null) => {
    if (id && selectedPatient) {
      const resourceIndexToDelete = currentTestCases[selectedPatient].resources.findIndex(r => r.resource?.id === id);
      const nextResourceState = produce(currentTestCases, draftState => {
        if (resourceIndexToDelete >= 0) {
          draftState[selectedPatient].resources.splice(resourceIndexToDelete, 1);
        }
      });
      setCurrentTestCases(nextResourceState);
      setIsCalculationLoading(true);

      setTimeout(() => {
        produce(detailedResultLookup, async draftState => {
          await detailedResultCalculation(draftState, selectedPatient, nextResourceState);
        }).then(nextDRLookupState => {
          setDetailedResultLookup(nextDRLookupState);
          setIsCalculationLoading(false);
        });
      }, 400);
    }
    closeConfirmationModal();
  };

  const getInitialResource = () => {
    if (isResourceModalOpen) {
      if (currentResource && selectedPatient) {
        return JSON.stringify(
          currentTestCases[selectedPatient].resources.filter(r => r.resource?.id === currentResource)[0].resource,
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
      const resourceIndex = currentTestCases[selectedPatient].resources.findIndex(r => r.resource?.id === resourceId);
      const resource = currentTestCases[selectedPatient].resources[resourceIndex].resource;
      if (resource) {
        return `Are you sure you want to delete ${resource.resourceType} ${getFhirResourceSummary(resource)}?`;
      }
    }
  };

  // Card Filtering
  useEffect(() => {
    if (selectedPatient && currentTestCases[selectedPatient].resources.length > 0) {
      // Search
      const filtered = currentTestCases[selectedPatient].resources.filter(entry => {
        if (!entry.resource) return false;
        const resourceType = entry.resource.resourceType?.toLowerCase() || '';
        const label = getFhirResourceSummary(entry.resource).toLowerCase();
        const { date, dateType } = dateForResource(entry.resource);
        return (
          resourceType.includes(cardFilters.searchString) ||
          label.includes(cardFilters.searchString) ||
          date.toLowerCase().includes(cardFilters.searchString) ||
          dateType.toLowerCase().includes(cardFilters.searchString)
        );
      });

      // Sort
      if (cardFilters.sortType) {
        filtered.sort((a, b) => {
          // set no resource as "higher" values
          if (!a.resource) return b.resource ? 1 : 0;
          if (!b.resource) return -1;
          if (cardFilters.sortType === 'date') {
            const dateA = dateForResource(a.resource).sortDate?.getTime();
            const dateB = dateForResource(b.resource).sortDate?.getTime();
            // set no sortDate resource as "higher" values
            if (!dateA) return dateB ? 1 : 0;
            if (!dateB) return -1;
            return cardFilters.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
          }
          if (cardFilters.sortType === 'resourceType') {
            const typeA = a.resource.resourceType.toLowerCase();
            const typeB = b.resource.resourceType.toLowerCase();
            return cardFilters.sortOrder === 'asc' ? typeA.localeCompare(typeB) : typeB.localeCompare(typeA);
          }
          return 0;
        });
      }

      setFilteredPatientResources(filtered);
    }
  }, [cardFilters, selectedPatient, currentTestCases]);

  return (
    <>
      <CodeEditorModal
        open={isResourceModalOpen}
        onClose={closeResourceModal}
        title="Edit FHIR Resource"
        onSave={value => updateResource(value, currentResource)}
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
          <ResourceSearchSort />

          <Stack data-testid="resource-display-stack">
            {filteredResources.map(bundleEntry => {
              const resource = bundleEntry.resource;
              if (resource) {
                return (
                  <ResourceInfoCard
                    key={resource.id}
                    resourceType={resource.resourceType}
                    label={getFhirResourceSummary(resource)}
                    date={dateForResource(resource)}
                    onEditClick={() => openResourceModal(resource.id)}
                    onDeleteClick={() => openConfirmationModal(resource.id)}
                  />
                );
              }
            })}
          </Stack>
        </>
      )}
    </>
  );
}

export default ResourceDisplay;
