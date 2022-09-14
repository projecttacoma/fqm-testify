import { Button, Center, Divider, Text } from '@mantine/core';
import { v4 as uuidv4 } from 'uuid';
import { IconAlertCircle, IconCodePlus } from '@tabler/icons';
import { Suspense, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { Loader } from 'tabler-icons-react';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { selectedPatientState } from '../../state/atoms/selectedPatient';
import { getPatientNameString } from '../../util/fhir';
import produce from 'immer';
import CodeEditorModal from '../modals/CodeEditorModal';
import ResourceDisplay from './ResourceDisplay';
import ResourceSelection from './ResourceSelection';
import { showNotification } from '@mantine/notifications';
import { calculateMeasureReport } from '../../util/MeasureCalculation';
import { calculationLoading } from '../../state/atoms/calculationLoading';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { measurementPeriodState } from '../../state/atoms/measurementPeriod';

export default function ResourcePanel() {
  const selectedPatient = useRecoilValue(selectedPatientState);
  const [currentPatients, setCurrentPatients] = useRecoilState(patientTestCaseState);
  const [isNewResourceModalOpen, setIsNewResourceModalOpen] = useState(false);
  const setIsCalculationLoading = useSetRecoilState(calculationLoading);
  const measureBundle = useRecoilValue(measureBundleState);
  const measurementPeriod = useRecoilValue(measurementPeriodState);

  const createNewResource = (val: string) => {
    // TODO: Validate the incoming JSON as FHIR
    const newResource = JSON.parse(val.trim());
    // Create a new state object using immer without needing to shallow clone the entire previous object
    if (selectedPatient) {
      if (!newResource.id) {
        newResource.id = uuidv4();
      }
      const resourceIndex = currentPatients[selectedPatient].resources.findIndex(r => r.id === newResource.id);
      if (resourceIndex >= 0) {
        showNotification({
          id: 'failed-upload',
          icon: <IconAlertCircle />,
          title: 'Resource Creation Failed',
          message: `Resource ID ${newResource.id} is used for an existing resource for this patient.`,
          color: 'red'
        });
      } else {
        produce(currentPatients, async draftState => {
          draftState[selectedPatient].resources.push(newResource);
          setIsCalculationLoading(true);
          if (measureBundle.content) {
            try {
              draftState[selectedPatient].measureReport = await calculateMeasureReport(
                draftState[selectedPatient],
                measureBundle.content,
                measurementPeriod.start?.toISOString(),
                measurementPeriod.end?.toISOString()
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
        }).then(nextResourceState => {
          setCurrentPatients(nextResourceState);
          setIsCalculationLoading(false);
          setIsNewResourceModalOpen(false);
        });
      }
    }
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
      <ResourceDisplay />
    </>
  );
}
