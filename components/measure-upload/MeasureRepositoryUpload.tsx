import { Button, Collapse, Grid, Group, Loader, Select, TextInput } from '@mantine/core';
import React, { useState } from 'react';
import { useEffect } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { measurementPeriodState } from '../../state/atoms/measurementPeriod';
import {
  identifyMissingValueSets,
  MeasureUploadProps,
  populateMeasurementPeriod,
  rejectUpload
} from '../../util/measureUploadUtils';
import { showNotification, cleanNotifications } from '@mantine/notifications';
import { IconAlertCircle, IconCircleCheck } from '@tabler/icons';
import { CircleCheck } from 'tabler-icons-react';
import { displayMapToSelectDataState } from '../../state/selectors/displayMapToSelectData';

enum PACKAGE_STATES {
  LOADING,
  SUCCESS,
  FAIL,
  NONE
}

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
  const [isLoadingIds, setIsLoadingIds] = useState(false);
  const [isLoadingPackage, setIsLoadingPackage] = useState<PACKAGE_STATES>(PACKAGE_STATES.NONE);
  const [measureSelectIsOpen, setMeasureSelectIsOpen] = useState(false);

  const [{ measureRepositoryUrl, isFile, selectedMeasureId, displayMap }, setMeasureBundle] =
    useRecoilState(measureBundleState);
  const setMeasurementPeriod = useSetRecoilState(measurementPeriodState);

  const idSelectData = useRecoilValue(displayMapToSelectDataState);

  useEffect(() => {
    if (isFile) {
      setMeasureSelectIsOpen(false);
      setIsLoadingPackage(PACKAGE_STATES.NONE);
    }
  }, [isFile]);

  /**
   * Handles updating of the Measure Repository Service url field and associated state variables
  */
  function handleMrsUrlChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (measureSelectIsOpen) {
      setMeasureSelectIsOpen(false);
    }
    setMeasureBundle(mb => ({
      ...mb,
      measureRepositoryUrl: event.currentTarget.value,
      selectedMeasureId: null,
      displayMap: {},
      ...(!mb.isFile ? { content: null } : undefined)
    }));
    setIsLoadingPackage(PACKAGE_STATES.NONE);
  }

  /**
   * Takes the entries from a Measure retrieval response and creates a map from Measure id
   * to Measure display label for Measure select component
  */
  function createMeasureDisplayMap(
    displayMap: Record<string, string>,
    { resource: measure }: { resource: fhir4.Measure }
  ) {
    let label: string;
    const officialIdentifier = measure.identifier?.find(
      identifier =>
        identifier.use === 'official' && identifier.system === 'http://hl7.org/fhir/cqi/ecqm/Measure/Identifier/cms'
    );
    if (officialIdentifier?.value) {
      label = measure.version ? `${officialIdentifier.value}|${measure.version}` : officialIdentifier.value;
    } else if (measure.name) {
      label = measure.version ? `${measure.name}|${measure.version}` : measure.name;
    } else {
      label = measure.id as string;
    }
    displayMap[measure.id as string] = label;
    return displayMap;
  }

  /**
   * Sends a `GET` request to the `/Measure` endpoint of the specified Measure Repository Service.
   * Parses and stores the measureIds if successful
  */
  async function retrieveMeasures() {
    setIsLoadingIds(true);
    let parsedMeasureRepositoryUrl = measureRepositoryUrl;
    if (measureRepositoryUrl.slice(-1) === '/') {
      parsedMeasureRepositoryUrl = measureRepositoryUrl.slice(0, -1);
      setMeasureBundle(mb => ({ ...mb, measureRepositoryUrl: parsedMeasureRepositoryUrl }));
    }
    try {
      const response = await fetch(`${parsedMeasureRepositoryUrl}/Measure`);
      const responseBody = await response.json();
      if (response.status === 200) {
        if (responseBody.entry.length === 0) {
          showNotification({
            icon: <IconAlertCircle />,
            title: 'No measures found',
            message: `Measure repository service hosted at ${parsedMeasureRepositoryUrl} returned an empty 
            FHIR Bundle when queried for Measures. Ensure Measures are present on server.`,
            color: 'red'
          });
          setIsLoadingIds(false);
          return;
        }
        const displayMap = responseBody.entry.reduce(createMeasureDisplayMap, {});
        setMeasureBundle(mb => ({ ...mb, displayMap }));
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
        message: `Could not connect to server with url: ${parsedMeasureRepositoryUrl}`,
        color: 'red'
      });
    }
    setIsLoadingIds(false);
  }

  /**
   * Sends a `POST` request to the `Measure/:id/$package` endpoint of the specified Measure
   * Repository Service. Checks the resulting bundle is valid and saves it if so.
  */
  async function retrieveMeasurePackage(id: string) {
    setMeasureBundle(mb => ({ ...mb, selectedMeasureId: id }));
    if (id) {
      const display = displayMap[id];
      showNotification({
        loading: true,
        title: `Packaging ${display}...`,
        message: `Waiting for measure repository service to finish packaging Measure: ${display}`,
        color: 'blue'
      });
      setIsLoadingPackage(PACKAGE_STATES.LOADING);
      const response = await fetch(`${measureRepositoryUrl}/Measure/${id}/$package`, MEASURE_RETRIEVAL_OPTIONS);
      const responseBody: fhir4.Bundle | fhir4.OperationOutcome = await response.json();
      if (responseBody.resourceType !== 'Bundle') {
        if (responseBody.resourceType === 'OperationOutcome') {
          rejectUpload(
            `Packaging of Measure: ${display} failed with message: "${responseBody.issue[0].details?.text}"`,
            display,
            logError,
            true
          );
        } else {
          rejectUpload("Uploaded file must be a JSON FHIR Resource of type 'Bundle'", display, logError, true);
        }
        setIsLoadingPackage(PACKAGE_STATES.FAIL);
        return;
      }

      const measures = responseBody.entry?.filter(e => e.resource?.resourceType === 'Measure');
      if (measures?.length !== 1) {
        rejectUpload(
          `Expected exactly 1 Measure in uploaded Bundle, received: ${measures?.length}`,
          display,
          logError,
          true
        );
        setIsLoadingPackage(PACKAGE_STATES.FAIL);
        return;
      }

      const missingValueSets = await identifyMissingValueSets(responseBody);
      if (missingValueSets.length > 0) {
        rejectUpload(missingValueSets, display, logError, true, true);
        setIsLoadingPackage(PACKAGE_STATES.FAIL);
        return;
      }
      const effectivePeriod = (measures[0].resource as fhir4.Measure).effectivePeriod;

      // Set measurement period to default period
      const measurementPeriod = populateMeasurementPeriod(effectivePeriod?.start, effectivePeriod?.end);
      setMeasureBundle(mb => ({ ...mb, content: responseBody, isFile: false }));
      setMeasurementPeriod(measurementPeriod);
      setIsLoadingPackage(PACKAGE_STATES.SUCCESS);
      cleanNotifications();
      showNotification({
        icon: <IconCircleCheck />,
        title: 'Upload Success',
        message: `Successfully uploaded ${display}`,
        color: 'green'
      });
    } else {
      setIsLoadingPackage(PACKAGE_STATES.NONE);
    }
  }

  return (
    <div>
      <Group position="apart" style={{ alignItems: 'flex-end' }}>
        <TextInput
          label="Measure Repository Service URL"
          placeholder="http://example.com"
          value={measureRepositoryUrl}
          onChange={handleMrsUrlChange}
          style={{ flex: 1 }}
        />
        <Button onClick={retrieveMeasures} loading={isLoadingIds} disabled={measureRepositoryUrl === ''}>
          Get Measures
        </Button>
      </Group>
      <Collapse in={measureSelectIsOpen || (selectedMeasureId !== null && measureRepositoryUrl !== '')}>
        <Grid>
          <Grid.Col span={11}>
            <Select
              label="Measure ID"
              data={idSelectData}
              disabled={idSelectData.length === 0}
              value={selectedMeasureId}
              onChange={retrieveMeasurePackage}
              placeholder="Select ID"
              searchable
              clearable
              nothingFound={'No options matching search'}
            />
          </Grid.Col>
          <Grid.Col span={1} style={{ display: 'flex', alignItems: 'end', justifyContent: 'center' }}>
            {isLoadingPackage === PACKAGE_STATES.LOADING && <Loader />}
            {isLoadingPackage === PACKAGE_STATES.SUCCESS && <CircleCheck color="green" size={40} />}
            {isLoadingPackage === PACKAGE_STATES.FAIL && <IconAlertCircle color="red" size={40} />}
          </Grid.Col>
        </Grid>
      </Collapse>
    </div>
  );
}
