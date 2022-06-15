/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'fs';
import * as path from 'path';
import * as xml2js from 'xml2js';

const modelInfoPath = path.resolve(path.join(__dirname, '../fixtures/model-info/fhir-modelinfo-4.0.1.xml'));
const outputPath = path.resolve(path.join(__dirname, '../util/primaryCodePaths.ts'));
const xmlStr = fs.readFileSync(modelInfoPath, 'utf8');

export interface primaryCodePathInfo {
  primaryCodePath: string;
  primaryCodeType?: string;
  multipleCardinality: boolean;
}

interface elementChoice {
  $: {
    namespace: string;
    name: string;
    'xsi:type': string;
  };
}

/**
 * Parse FHIR Model Info XML and output primaryCodePath information
 * for each FHIR Resource type.
 * @param {string} xml the string content of the model info XML to parse
 * @return object whose keys are resourceTypes and values correspond to
 * the resourceTypes' primaryCodePath
 */
export async function parse(xml: string) {
  const { modelInfo } = await xml2js.parseStringPromise(xml);
  const domainInfo = modelInfo.typeInfo.filter((ti: any) => ti.$.baseType === 'FHIR.DomainResource');

  const results: { [key: string]: primaryCodePathInfo } = {};

  domainInfo.forEach((di: any) => {
    const resourceType = di.$.name;
    const primaryCodePath = di.$.primaryCodePath;

    if (primaryCodePath) {
      const primaryCodePathElement = di.element.find((elem: any) => elem.$.name === primaryCodePath);

      if (primaryCodePathElement) {
        let primaryCodeType;
        let multipleCardinality;
        if (primaryCodePathElement.elementTypeSpecifier) {
          // length of element.elementTypeSpecifier is always 1, so we can index it at 0
          if (primaryCodePathElement.elementTypeSpecifier[0].choice) {
            // xsi:type is ChoiceTypeSpecifier, so there are multiple possible types
            // save both options to an array
            const choices: string[] = [];
            primaryCodePathElement.elementTypeSpecifier[0].choice.forEach((c: elementChoice) => {
              const choiceNamespace = c.$.namespace;
              const choiceName = c.$.name;
              choices.push(`${choiceNamespace}.${choiceName}`);
            });

            // apply heuristic for selecting primaryCodeType
            if (choices.includes('FHIR.CodeableConcept')) {
              primaryCodeType = 'FHIR.CodeableConcept';
            } else if (choices.includes('FHIR.Coding')) {
              primaryCodeType = 'FHIR.Coding';
            } else if (choices.includes('FHIR.code')) {
              primaryCodeType = 'FHIR.code';
            } else {
              primaryCodeType = choices[0];
            }

            // all choice types are 0..1 or 1..1 cardinality
            multipleCardinality = false;
          } else {
            // xsi:type is ListTypeSpecifier
            primaryCodeType = primaryCodePathElement.elementTypeSpecifier[0].$.elementType;
            // single type of 0..* or 1..* cardinality
            multipleCardinality = true;
          }
        } else {
          // single type of 0..1 or 1..1 cardinality
          primaryCodeType = primaryCodePathElement.$.elementType;
          multipleCardinality = false;
        }
        results[resourceType] = {
          primaryCodePath: primaryCodePath,
          primaryCodeType: primaryCodeType,
          multipleCardinality: multipleCardinality
        };
      }
    }
  });
  return results;
}

parse(xmlStr)
  .then(data => {
    fs.writeFileSync(
      outputPath,
      `
      import { primaryCodePathInfo } from '../scripts/parsePrimaryCodePath';

      export const parsedPrimaryCodePaths: Record<string, primaryCodePathInfo> = 
        ${JSON.stringify(data, null, 2)};
      `,
      'utf8'
    );
    console.log(`Wrote file to ${outputPath}`);
  })
  .catch(e => {
    console.error(e);
  });
