/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'fs';
import * as path from 'path';
import * as xml2js from 'xml2js';

const modelInfoPath = path.resolve(path.join(__dirname, '../fixtures/model-info/fhir-modelinfo-4.0.1.xml'));
const outputPath = path.resolve(path.join(__dirname, '../util/propertyPaths.ts'));
const xmlStr = fs.readFileSync(modelInfoPath, 'utf8');

/**
 * Parse FHIR Model Info XML and output information about what properties exist
 * for each FHIR Resource type.
 * @param {string} xml the string content of the model info XML to parse
 * @return object whose keys are resourceTypes and values correspond to
 * the resourceTypes' properties
 */
export async function parse(xml: string) {
  const { modelInfo } = await xml2js.parseStringPromise(xml);
  const domainInfo = modelInfo.typeInfo.filter((ti: any) => ti.$.baseType === 'FHIR.DomainResource');

  const results: { [key: string]: string[] } = {};

  domainInfo.forEach((di: any) => {
    const resourceType = di.$.name;
    results[resourceType] = di.element.map((elem: any) => elem.$.name);
  });
  return results;
}

parse(xmlStr)
  .then(data => {
    fs.writeFileSync(
      outputPath,
      `
        export const parsedPropertyPaths: Record<string, string[]> =
          ${JSON.stringify(data, null, 2)};
        `,
      'utf8'
    );
    console.log(`Wrote file to ${outputPath}`);
  })
  .catch(e => {
    console.error(e);
  });
