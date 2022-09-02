import { Center, Divider, Text } from '@mantine/core';
import { Suspense } from 'react';
import { useRecoilValue } from 'recoil';
import { Loader } from 'tabler-icons-react';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { selectedPatientState } from '../../state/atoms/selectedPatient';
import { getPatientNameString } from '../../util/fhir';
import ResourceDisplay from './ResourceDisplay';
import ResourceSelection from './ResourceSelection';

export default function ResourcePanel() {
  const selectedPatient = useRecoilValue(selectedPatientState);
  const currentPatients = useRecoilValue(patientTestCaseState);

  const renderPanelPlaceholderText = () => {
    return (
      <Text color="dimmed">
        <i>Select a patient to add resources and see more information</i>
      </Text>
    );
  };

  const renderResourceSelectBox = () => {
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
          <Divider my="lg" />
        </div>
      </Suspense>
    );
  };

  return (
    <>
      {renderResourceSelectBox()}
      <ResourceDisplay />
    </>
  );
}
