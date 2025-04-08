import { Modal, Button, Center, Group, Text, Grid, Card, Paper, Select, Space, Stack } from '@mantine/core';
import CodeMirror from '@uiw/react-codemirror';
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { linter } from '@codemirror/lint';
import { useState } from 'react';
import { parsedCodePaths } from 'fhir-spec-tools/build/data/codePaths';
import { IconCodePlus } from '@tabler/icons';
import { valueSetMapState } from '../../state/selectors/valueSetsMap';
import { useRecoilValue } from 'recoil';
import { getValueSetCodes } from '../../util/ValueSetHelper';
import { measureBundleState } from '../../state/atoms/measureBundle';
import fhirpath from 'fhirpath';

const jsonLinter = jsonParseLinter();

export interface CodeEditorModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
  title?: string;
  initialValue?: string;
}

export default function CodeEditorModal({
  open = true,
  onClose,
  title,
  onSave,
  initialValue = ''
}: CodeEditorModalProps) {

  const valueSetMap = useRecoilValue(valueSetMapState);
  const [currentValue, setCurrentValue] = useState(initialValue);
  const [linterError, setLinterError] = useState<string | null>(null);
  const [attributeValue, setAttributeValue] = useState<string | null>('');
  const [vsValue, setVsValue] = useState<string | null>('');
  const [codeValue, setCodeValue] = useState<string | null>('');
  const measureBundle = useRecoilValue(measureBundleState);


  // TODO: disable code selection section if there are no codeAttributes
  // no current choice types allow for an alternative code-like choice (instead, choices like "reference"),
  // which would be beyond scope to implement, so we want to just insert the code type listed (no choice)
  // options are 'FHIR.CodeableConcept', 'FHIR.Coding', 'FHIR.code'
  
  let codeAttributes: string[] = [];
  if(!linterError && currentValue){
    try {
      const resource: fhir4.Resource = JSON.parse(currentValue);
      codeAttributes = Object.keys(parsedCodePaths[resource.resourceType].paths);
    } catch (error) {
      // current json invalid or no valid resourceType 
    }
  }

  // getValueSetCodes <- pass all valueset urls
  // Use valueSetsMap, which is created with url keys...question: any actions if there's no vs url?
  // ... what about direct codes? Are those options loaded as part of the bundle at all?

  const insertCode = () => {
    
    if(!attributeValue || !vsValue || !codeValue){
      //should be disabled
      console.error('Unexpected code insertion accessed.')
      return;
    }
    const resource: fhir4.Resource = JSON.parse(currentValue);
    const path = parsedCodePaths[resource.resourceType].paths[attributeValue];
    let codedObject: fhir4.CodeableConcept|fhir4.Coding|string;
    if(path.codeType === 'FHIR.CodeableConcept'){
      codedObject = {
        coding: [{code: codeValue}] //TODO: add system/display information
      } as fhir4.CodeableConcept;
    } else if(path.codeType === 'FHIR.Coding'){
      codedObject = {code: codeValue //TODO: add system/display information
      } as fhir4.Coding;
    }else{
      codedObject = codeValue; //TODO: add system/display information
    }

    if(path.multipleCardinality){
      // add to or create array
      const attributeData = fhirpath.evaluate(resource, attributeValue)[0];
      if(attributeData){
        // add
        (resource as any)[attributeValue].push(codedObject); //TODO: double check these any's for another typescripty way
      }else{
        //create
        (resource as any)[attributeValue] = [codedObject];
      }
    }else{
      // replace existing single attribute
      (resource as any)[attributeValue] = codedObject;
    }
    setCurrentValue(JSON.stringify(resource, null, 2));// TODO: this setter seems to not be working ***
    console.log(` status: ${JSON.stringify((resource as fhir4.Patient).maritalStatus)}`);
      
  };



  return (
    <Modal
      centered
      size={1000}
      withCloseButton={false}
      opened={open}
      onClose={onClose}
      styles={{
        body: {
          height: '800px'
        }
      }}
      title={title}
    >
      <Group>
        <Select
          label="Attribute"
          placeholder="Select coded attribute"
          data={codeAttributes}
          value={attributeValue} 
          onChange={setAttributeValue}
          disabled={codeAttributes.length === 0}
        />
        <Select
          label="ValueSet"
          placeholder="Select ValueSet"
          data={Object.keys(valueSetMap)} //.map(k => `${valueSetMap[k]} (${k})`)} // TODO: prettier with name?
          value={vsValue} 
          onChange={setVsValue}
          searchable
        />
        <Select
          label="Code"
          placeholder="Select Code"
          data={vsValue ? getValueSetCodes([vsValue], measureBundle.content).map(vsProp => vsProp.code || 'Unknown code') : []}
          value={codeValue} 
          onChange={setCodeValue}
          disabled={!vsValue}
        />
        <Button 
          variant="filled" 
          rightIcon={<IconCodePlus/>} 
          disabled={codeAttributes.length === 0 || !attributeValue || !vsValue || !codeValue}
          onClick={() => insertCode()}
        >Insert Code</Button>
        </Group>
        
      
      <Space h="md" />
      <div style={{ overflow: 'scroll' }}>
        {open && (
          <CodeMirror
            data-testid="codemirror"
            height="700px"
            value={initialValue}
            extensions={[json(), linter(jsonLinter)]}
            theme="light"
            onUpdate={v => {
              const diagnosticMessages = jsonLinter(v.view).map(d => d.message);

              if (diagnosticMessages.length === 0) {
                setLinterError(null);
              } else {
                setLinterError(diagnosticMessages.join('\n'));
              }

              // Grabbing updates from the readonly editor state to avoid codemirror weirdness
              setCurrentValue(v.state.toJSON().doc);
            }}
          />
        )}
      </div>
      <Grid>
        <Grid.Col span={12}>
          <Text color="red">{linterError}&nbsp;</Text>
        </Grid.Col>
        <Grid.Col span={12}>
          <Center>
            <Group>
              <Button
                data-testid="codemirror-save-button"
                onClick={() => {
                  onSave(currentValue);
                }}
                disabled={linterError != null}
              >
                Save
              </Button>
              <Button data-testid="codemirror-cancel-button" variant="default" onClick={onClose}>
                Cancel
              </Button>
            </Group>
          </Center>
        </Grid.Col>
      </Grid>
    </Modal>
  );
}
