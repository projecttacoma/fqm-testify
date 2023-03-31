import { Button, Collapse, Group, Select, TextInput } from '@mantine/core';
import React, { useState } from 'react';
import { useEffect } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { measurementPeriodState } from '../../state/atoms/measurementPeriod';
import { identifyMissingValueSets, MeasureUploadProps, populateMeasurementPeriod } from '../../util/MeasureUploadUtils';
import { showNotification } from '@mantine/notifications';
import { v4 as uuidv4 } from 'uuid';
import { IconAlertCircle } from '@tabler/icons';

const MEASURE_RETRIEVAL_BODY = {
  resourceType: 'Parameters',
  parameter: [
    {
      name: 'include-terminology',
      valueBoolean: true
    }
  ]
};

const MEASURE_RETRIEVAL_OPTIONS = {
  method: 'POST',
  body: JSON.stringify(MEASURE_RETRIEVAL_BODY),
  headers: { 'Content-Type': 'application/json+fhir' }
};

export default function MeasureRepositoryUpload({ logError }: MeasureUploadProps) {
  const [mrsUrl, setMrsUrl] = useState('');
  const [measureIds, setMeasureIds] = useState([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [measureBundle, setMeasureBundle] = useRecoilState(measureBundleState);
  const setMeasurementPeriod = useSetRecoilState(measurementPeriodState);

  const [isLoading, setIsLoading] = useState(false);
  const [measureSelectIsOpen, setMeasureSelectIsOpen] = useState(false);

  useEffect(() => {
    if (mrsUrl && selectedId) {
      retrieveMeasurePackage();
    }
  }, [selectedId]);

  const rejectUpload = (
    message: string | string[],
    attemptedBundleDisplay: string | null,
    isValueSetMissingError = false
  ) => {
    logError({
      id: uuidv4(),
      message,
      timestamp: new Date().toISOString(),
      attemptedBundleDisplay,
      isValueSetMissingError
    });
    showNotification({
      icon: <IconAlertCircle />,
      title: 'Bundle upload failed',
      message: 'There was an issue uploading your bundle. Please correct the issues listed below.',
      color: 'red'
    });
    setMeasureBundle({
      name: '',
      content: null
    });
  };

  function handleMrsUrlChange(event: React.ChangeEvent<HTMLInputElement>) {
    setMrsUrl(event.currentTarget.value);
    if (measureSelectIsOpen) {
      setMeasureIds([]);
      setMeasureSelectIsOpen(false);
    }
  }

  async function retrieveMeasureIds() {
    setIsLoading(true);
    try {
      const response = await fetch(`${mrsUrl}/Measure`);
      const responseBody = await response.json();
      if (response.status === 200) {
        const ids = responseBody.entry.map((e: fhir4.BundleEntry) => e.resource?.id);
        setMeasureIds(ids);
        if (!measureSelectIsOpen) {
          setMeasureSelectIsOpen(true);
        }
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
        message: `Could not connect to server with url: ${mrsUrl}`,
        color: 'red'
      });
    }
    setIsLoading(false);
  }

  async function retrieveMeasurePackage() {
    const response = await fetch(`${mrsUrl}/Measure/${selectedId}/$package`, MEASURE_RETRIEVAL_OPTIONS);
    const responseBody = await response.json();
    if (responseBody.resourceType !== 'Bundle') {
      if (responseBody.resourceType === 'OperationOutcome') {
        rejectUpload(
          `Packaging of Measure: ${selectedId} failed with message: "${responseBody.issue[0].details.text}"`,
          selectedId
        );
      } else {
        rejectUpload("Uploaded file must be a JSON FHIR Resource of type 'Bundle'", selectedId);
      }
      return;
    }

    const measures = responseBody.entry.filter((e: fhir4.BundleEntry) => e.resource?.resourceType === 'Measure');
    if (measures.length !== 1) {
      rejectUpload(`Expected exactly 1 Measure in uploaded Bundle, received: ${measures.length}`, selectedId);
      return;
    }

    const missingValueSets = await identifyMissingValueSets(responseBody);
    if (missingValueSets.length > 0) {
      rejectUpload(missingValueSets, selectedId, true);
      return;
    }
    const effectivePeriod = ((measures as fhir4.BundleEntry[])[0].resource as fhir4.Measure).effectivePeriod;

    // Set measurement period to default period
    const measurementPeriod = populateMeasurementPeriod(effectivePeriod?.start, effectivePeriod?.end);
    setMeasureBundle({ name: selectedId as string, content: responseBody });
    setMeasurementPeriod(measurementPeriod);
  }

  return (
    <div>
      <Group position="apart" style={{ alignItems: 'flex-end' }}>
        <TextInput
          label="Measure Repository Service URL"
          placeholder="http://example.com"
          value={mrsUrl}
          onChange={handleMrsUrlChange}
          style={{ flex: 1 }}
        />
        <Button onClick={retrieveMeasureIds} loading={isLoading}>
          Get Measures
        </Button>
      </Group>
      <Collapse in={measureSelectIsOpen}>
        <Select
          label="Measure ID"
          data={measureIds}
          disabled={measureIds.length === 0}
          value={selectedId}
          onChange={setSelectedId}
          placeholder="Select ID"
          searchable
          clearable
          nothingFound={'No options matching search'}
        ></Select>
      </Collapse>
    </div>
  );
}
