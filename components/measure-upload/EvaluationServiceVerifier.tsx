import { Alert, Button, Group, Space, TextInput } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { evaluationState } from '../../state/atoms/evaluation';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { showNotification } from '@mantine/notifications';
import { IconAlertCircle, IconCircleCheck } from '@tabler/icons';

export default function EvaluationServiceVerifier() {
  const [isLoadingId, setIsLoadingId] = useState(false);
  const { content } = useRecoilValue(measureBundleState);
  const [{ evaluationServiceUrl, evaluationMeasureId }, setEvaluation] = useRecoilState(evaluationState);

  useEffect(() => {
    // Called when the measure content value changes
    setEvaluation(e => ({
      ...e,
      evaluationMeasureId: ''
    }));
  }, [content, setEvaluation]);

  /**
   * Handles updating of the Evaluation Service url field and associated state variables
   */
  function handleUrlChange(event: React.ChangeEvent<HTMLInputElement>) {
    setEvaluation({
      evaluationServiceUrl: event.currentTarget.value,
      evaluationMeasureId: ''
    });
  }

  /**
   * Sends a `GET` request to the `/Measure` endpoint of the specified evaluation service URL.
   * Parses and stores the url and the id of the matching (same url/version) Measure if successful
   */
  async function verifyMeasure() {
    setIsLoadingId(true);
    let parsedEvaluationUrl = evaluationServiceUrl;
    if (evaluationServiceUrl.slice(-1) === '/') {
      parsedEvaluationUrl = evaluationServiceUrl.slice(0, -1);
    }
    try {
      const response = await fetch(`${parsedEvaluationUrl}/Measure`);
      const responseBody = await response.json();
      if (response.status === 200) {
        if (responseBody.entry.length === 0) {
          showNotification({
            icon: <IconAlertCircle />,
            title: 'No measures found',
            message: `Evalution service hosted at ${parsedEvaluationUrl} returned an empty 
            FHIR Bundle when queried for Measures. Ensure Measures are present on server.`,
            color: 'red'
          });
          setIsLoadingId(false);
          return;
        }
        const selectedMeasure = content?.entry?.find(e => e.resource?.resourceType === 'Measure')
          ?.resource as fhir4.Measure;
        // Currently taking the safe path and not assuming support for search -> finding the correct measure from a pull of all measures
        const currentEvalMeasure = responseBody.entry.find(
          (e: { resource: fhir4.Measure }) =>
            e.resource.url === selectedMeasure.url && e.resource.version === selectedMeasure.version
        )?.resource;
        if (!currentEvalMeasure) {
          showNotification({
            icon: <IconAlertCircle />,
            title: 'Failed to locate measure',
            message: `Could not find measure with url ${selectedMeasure.url} and version ${selectedMeasure.version} on the selected evaluation service.`,
            color: 'red'
          });
          setIsLoadingId(false);
          return;
        }

        setEvaluation({ evaluationServiceUrl: parsedEvaluationUrl, evaluationMeasureId: currentEvalMeasure.id });
      } else {
        showNotification({
          icon: <IconAlertCircle />,
          title: 'Failed reaching out to server',
          message: `Server responded with code: ${response.status}:${response.statusText}`,
          color: 'red'
        });
      }
    } catch (e) {
      showNotification({
        icon: <IconAlertCircle />,
        title: 'Failed reaching out to server',
        message: `Could not connect to server with url: ${parsedEvaluationUrl}`,
        color: 'red'
      });
    }
    setIsLoadingId(false);
  }

  return (
    <div>
      <Group position="apart" align="flex-end">
        <TextInput
          label="Evaluation Service URL"
          placeholder="http://example.com/fhir"
          value={evaluationServiceUrl}
          onChange={handleUrlChange}
          style={{ flexGrow: 1 }}
        />
        <Button
          onClick={verifyMeasure}
          loading={isLoadingId}
          disabled={evaluationServiceUrl === '' || content === null}
        >
          Verify
        </Button>
      </Group>
      <Space h="md" />
      {evaluationMeasureId !== '' && (
        <Group position="center" align="flex-end">
          <Alert variant="light" color="green" icon={<IconCircleCheck />}>
            Located Measure ID: {evaluationMeasureId}
          </Alert>
        </Group>
      )}
    </div>
  );
}
