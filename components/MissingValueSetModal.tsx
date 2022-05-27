import { Calculator } from 'fqm-execution';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { measureBundleState } from '../state/atoms/measureBundle';
import { Modal, Alert, Text, List } from '@mantine/core';
import { AlertCircle } from 'tabler-icons-react';
import { useState } from 'react';

export default function MissingValueSetModal() {
  const [measureBundle, setMeasureBundle] = useRecoilState(measureBundleState);
  const [missingValueSets, setMissingValueSets] = useState<string[]>([]);

  useEffect(() => {
    if (measureBundle.content) {
      identifyMissingValueSets(measureBundle.content).then(missingValueSets => {
        setMissingValueSets(missingValueSets);
      });
    } else {
      setMissingValueSets([]);
    }
  }, [measureBundle]);

  return (
    <Modal
      centered
      size="xl"
      withCloseButton={false}
      opened={missingValueSets.length > 0}
      onClose={() => setMeasureBundle({ name: '', content: null })}
      styles={{
        modal: { padding: '0px !important', margin: 0 }
      }}
    >
      <Alert icon={<AlertCircle size={16} />} title="Hold on there, Cowboy. You're missing ValueSets!" color="red">
        <Text>The following required ValueSets are missing from the uploaded measure bundle:</Text>
        <List>
          {missingValueSets.map((vs, i) => (
            <List.Item key={`item${i}`}>
              <Text variant="link" component="a" href={vs} target="_blank">{`\t${vs}`}</Text>
            </List.Item>
          ))}
        </List>
      </Alert>
    </Modal>
  );
}

/**
 * Runs data requirements on a FHIR MeasureBundle, the compares the required
 * valuesets to the valusets included in the bundle. Returns an array of canonical urls of
 * missing required valuesets
 * @param mb { Object } a FHIR MeasureBundle uploaded by the user
 * @returns { Array } an array of canonical urls of missing valuesets
 */
async function identifyMissingValueSets(mb: fhir4.Bundle): Promise<string[]> {
  const allRequiredValuesets = new Set<string>();
  const includedValuesets = new Set<string>();

  mb?.entry?.forEach(e => {
    if (e?.resource?.resourceType === 'ValueSet') {
      includedValuesets.add(e.resource.url as string);
    }
  });
  const dataRequirements = await Calculator.calculateDataRequirements(mb);
  dataRequirements?.results?.dataRequirement?.forEach(dr => {
    dr?.codeFilter?.forEach(filter => {
      filter.path === 'type' && allRequiredValuesets.add(filter.valueSet as string);
    });
  });
  const missingValuesets = Array.from(allRequiredValuesets).filter(vs => !includedValuesets.has(vs));
  return missingValuesets;
}
