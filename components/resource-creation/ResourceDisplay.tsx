import { Stack } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons';
import { format } from 'date-fns';
import { PrimaryDatePaths } from 'fhir-spec-tools';
import fhirpath from 'fhirpath';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { useCallback, useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { calculationLoading } from '../../state/atoms/calculationLoading';
import { detailedResultLookupState } from '../../state/atoms/detailedResultLookup';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { measurementPeriodState } from '../../state/atoms/measurementPeriod';
import { patientTestCaseState, TestCase } from '../../state/atoms/patientTestCase';
import { selectedDataRequirementState } from '../../state/atoms/selectedDataRequirement';
import { selectedPatientState } from '../../state/atoms/selectedPatient';
import { trustMetaProfileState } from '../../state/atoms/trustMetaProfile';
import { getFhirResourceSummary } from '../../util/fhir/codes';
import { createFHIRResourceString } from '../../util/fhir/resourceCreation';
import { calculateDetailedResult } from '../../util/MeasureCalculation';
import { DetailedResult } from '../../util/types';
import CodeEditorModal from '../modals/CodeEditorModal';
import ConfirmationModal from '../modals/ConfirmationModal';
import ResourceInfoCard from '../utils/ResourceInfoCard';
import ResourceSearchSort from './ResourceSearchSort';

// export interface Resource {
//   key: Key | null | undefined;
//   resourceType: string;
//   label: string;
//   date: DateInfo;
// }

function ResourceDisplay() {
  const [currentTestCases, setCurrentTestCases] = useRecoilState(patientTestCaseState);
  const [currentResource, setCurrentResource] = useState<string | null>(null);
  const [selectedDataRequirement, setSelectedDataRequirement] = useRecoilState(selectedDataRequirementState);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const measureBundle = useRecoilValue(measureBundleState);
  const selectedPatient = useRecoilValue(selectedPatientState);
  const measurementPeriod = useRecoilValue(measurementPeriodState);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const setIsCalculationLoading = useSetRecoilState(calculationLoading);
  const [detailedResultLookup, setDetailedResultLookup] = useRecoilState(detailedResultLookupState);
  const trustMetaProfile = useRecoilValue(trustMetaProfileState);
  // const [resources, setResources] = useState<fhir4.BundleEntry[]>([]);
  const [sortedResources, setSortedResources] = useState<fhir4.BundleEntry[]>([]);

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

  const dateForResource = (resource: fhir4.FhirResource) => {
    const dateInfo = PrimaryDatePaths.parsedPrimaryDatePaths[resource.resourceType];
    if (!resource || !PrimaryDatePaths?.parsedPrimaryDatePaths || !dateInfo) {
      return {
        date: 'N/A',
        dateType: 'N/A'
      };
    }

    for (const nameOfResourceDate of Object.keys(dateInfo)) {
      // If only one dataType
      const resourceDateData = fhirpath.evaluate(resource, nameOfResourceDate)[0];
      if (dateInfo[nameOfResourceDate].dataTypes.length === 1 && resourceDateData) {
        // If the only dataType is a period
        if (dateInfo[nameOfResourceDate].dataTypes[0] === 'Period') {
          return formatPeriod(resource, nameOfResourceDate, nameOfResourceDate);
        }
        // If the only dataType is either dateTime or date
        else {
          return {
            date: formatDate(fhirpath.evaluate(resource, nameOfResourceDate)[0]),
            dateType: nameOfResourceDate
          };
        }
      }

      // If isChoiceType is true
      else {
        for (const dataType of dateInfo[nameOfResourceDate].dataTypes) {
          // Capitalize the first char of dataType and append for proper resource date name
          const fullResourceDateName = nameOfResourceDate + dataType.charAt(0).toUpperCase() + dataType.slice(1);
          if (fhirpath.evaluate(resource, fullResourceDateName)[0]) {
            if (dataType === 'Period') {
              return formatPeriod(resource, fullResourceDateName, fullResourceDateName);
            }
            // Else if dataType === 'dateTime' || 'Date'
            else {
              return {
                date: formatDate(fhirpath.evaluate(resource, fullResourceDateName)[0]),
                dateType: fullResourceDateName
              };
            }
          }
        }
      }
    }
    return {
      date: 'N/A',
      dateType: 'N/A'
    };
  };

  // Formatter for if the date is a period
  const formatPeriod = (resource: fhir4.FhirResource, resourcePeriod: string, dateTypeName: string) => {
    const startTime = fhirpath.evaluate(resource, resourcePeriod + '.start')[0];
    const endTime = fhirpath.evaluate(resource, resourcePeriod + '.end')[0];
    return {
      date: formatDate(startTime) + '-' + formatDate(endTime),
      dateType: dateTypeName
    };
  };

  // Using date-fns to format (other date formats available)
  const formatDate = (dateString: string) => {
    const formattedDate = format(new Date(dateString), 'MM/DD/YYYY');
    if (formattedDate === 'Invalid Date') {
      return 'N/A';
    }
    return formattedDate;
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
          measurementPeriod.start?.toISOString(),
          measurementPeriod.end?.toISOString(),
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

  // Setting intial values for the resources so helper functions are not called each time the data is filtered
  // const mapBundleEntries(entries: fhir4.BundleEntry[]): Resource[] => {
  //   const resources: Resource[] = [];

  //   for (const entry of entries) {
  //     if (!entry.resource) continue;

  //     const resource: Resource = {
  //       key: entry.resource.id ?? null,
  //       resourceType: entry.resource.resourceType,
  //       label: getFhirResourceSummary(entry.resource),
  //       date: dateForResource(entry.resource),
  //     };

  //     resources.push(resource);
  //   }

  //   return resources;
  // }

  // Handles changes from ResourceSearchSort
  const handleSrotedResources = (sorted: fhir4.BundleEntry[]) => {
    setSortedResources(sorted);
  };

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
          {/* Passing in the selected patient resources to allow for searching + sorting */}
          <ResourceSearchSort
            resources={currentTestCases[selectedPatient].resources}
            onSorted={handleSrotedResources}
            dateForResource={dateForResource}
          />

          <Stack data-testid="resource-display-stack">
            {sortedResources.map(bundleEntry => {
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
