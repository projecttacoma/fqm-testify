import { ActionIcon, Anchor, Button, Center, Divider, Group, Popover, Text } from '@mantine/core';
import { v4 as uuidv4 } from 'uuid';
import { IconAlertCircle, IconAlertTriangle, IconCodePlus } from '@tabler/icons';
import { Suspense, useState } from 'react';
import { RecoilRoot, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { Loader } from 'tabler-icons-react';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { selectedPatientState } from '../../state/atoms/selectedPatient';
import produce from 'immer';
import CodeEditorModal from '../modals/CodeEditorModal';
import ResourceDisplay from './ResourceDisplay';
import ResourceSelection from './ResourceSelection';
import { showNotification } from '@mantine/notifications';
import { calculationLoading } from '../../state/atoms/calculationLoading';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { measurementPeriodState } from '../../state/atoms/measurementPeriod';
import { getPatientNameString } from '../../util/fhir/patient';
import { detailedResultLookupState } from '../../state/atoms/detailedResultLookup';
import { calculateDetailedResult } from '../../util/MeasureCalculation';
import { trustMetaProfileState } from '../../state/atoms/trustMetaProfile';

export default function ResourcePanel() {
  const selectedPatient = useRecoilValue(selectedPatientState);
  const [currentPatients, setCurrentPatients] = useRecoilState(patientTestCaseState);
  const [isNewResourceModalOpen, setIsNewResourceModalOpen] = useState(false);
  const setIsCalculationLoading = useSetRecoilState(calculationLoading);
  const measureBundle = useRecoilValue(measureBundleState);
  const measurementPeriod = useRecoilValue(measurementPeriodState);
  const [detailedResultLookup, setDetailedResultLookup] = useRecoilState(detailedResultLookupState);
  const trustMetaProfile = useRecoilValue(trustMetaProfileState);
  const [minimizeResourcesPopoverOpened, setMinimizeResourcesPopoverOpened] = useState(false);

  const createNewResource = (val: string) => {
    // TODO: Validate the incoming JSON as FHIR
    const newResource = JSON.parse(val.trim());
    // Create a new state object using immer without needing to shallow clone the entire previous object
    if (selectedPatient) {
      if (!newResource.id) {
        newResource.id = uuidv4();
      }
      const resourceIndex = currentPatients[selectedPatient].resources.findIndex(
        r => r.resource?.id === newResource.id
      );
      if (resourceIndex >= 0) {
        showNotification({
          id: 'failed-upload',
          icon: <IconAlertCircle />,
          title: 'Resource Creation Failed',
          message: `Resource ID ${newResource.id} is used for an existing resource for this patient.`,
          color: 'red'
        });
      } else {
        const nextResourceState = produce(currentPatients, draftState => {
          const entry: fhir4.BundleEntry = { resource: newResource, fullUrl: `urn:uuid:${newResource.id}` };
          draftState[selectedPatient].resources.push(entry);
        });
        setCurrentPatients(nextResourceState);
        setIsCalculationLoading(true);

        setTimeout(() => {
          produce(detailedResultLookup, async draftState => {
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
          }).then(nextDRLookupState => {
            setDetailedResultLookup(nextDRLookupState);
            setIsCalculationLoading(false);
          });
        }, 400);
      }
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
        <Group>
          <Text size="xl">{getPatientNameString(currentPatients[selectedPatient].patient)}</Text>
          {currentPatients[selectedPatient].minResources === true ? (
            <Popover
              opened={minimizeResourcesPopoverOpened}
              onClose={() => setMinimizeResourcesPopoverOpened(false)}
              width={500}
            >
              <Popover.Target>
                <ActionIcon
                  aria-label={'Resources Minimized'}
                  onClick={() => setMinimizeResourcesPopoverOpened(o => !o)}
                >
                  <IconAlertTriangle size={20} />
                </ActionIcon>
              </Popover.Target>
              <Popover.Dropdown>
                The minimize resources option was set to true when uploading this Test Case. Therefore, only resources
                relevant to the measure were included. Resources relevant to the measure are defined as resources
                included in the data requirements of the measure. See details{' '}
                <Anchor href="https://github.com/projecttacoma/fqm-testify#importing-a-patient-bundle" target="_blank">
                  here
                </Anchor>
                .
              </Popover.Dropdown>
            </Popover>
          ) : (
            ''
          )}
        </Group>
        <Text data-testid="resource-count-summary">
          <Text display="inline" fw="bold">
            {currentPatients[selectedPatient].resources.length} resource(s)
          </Text>{' '}
          on record
        </Text>
        <div
          style={{
            paddingTop: '12px'
          }}
        >
          <ResourceSelection />
          <Center>or</Center>
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
      <RecoilRoot>
        <ResourceDisplay />
      </RecoilRoot>
    </>
  );
}
