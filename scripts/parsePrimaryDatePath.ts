import * as fs from 'fs';
import * as path from 'path';
import * as xml2js from 'xml2js';

const modelInfoPath = path.resolve(path.join(__dirname, '../fixtures/model-info/fhir-modelinfo-4.0.1.xml'));
const outputPath = path.resolve(path.join(__dirname, '../util/primaryDatePaths.ts'));
const xmlStr = fs.readFileSync(modelInfoPath, 'utf8');
const DATE_TYPES = ['dateTime', 'date', 'Period'];

export interface dateFieldInfo {
  isChoiceType?: boolean;
  dataTypes: string[];
}
export interface dateInfo {
  [dateField: string]: dateFieldInfo;
}

export interface primaryDatePathInfo {
  [resourceType: string]: dateInfo;
}

async function parseModelInfo(xml: string): Promise<primaryDatePathInfo> {
  const { modelInfo } = await xml2js.parseStringPromise(xml);
  const domainInfo = modelInfo.typeInfo.filter((ti: any) => ti.$.baseType === 'FHIR.DomainResource');
  const dateInfo: any = {};

  domainInfo.forEach((di: any) => {
    const resourceType = di.$.name;
    const dts = getDateTypes(di.element);
    dateInfo[resourceType] = dts;
  });
  return dateInfo;
}

function getDateTypes(resourceInfo: any): dateInfo {
  return resourceInfo.reduce((acc: any, e: any) => {
    const propName = e.$.name;
    if (e.$.elementType) {
      const splitElementType = e.$.elementType.split('.');
      if (splitElementType[0] === 'FHIR' && DATE_TYPES.includes(splitElementType[1])) {
        acc[propName] = { dataTypes: [splitElementType[1]] };
      }
    } else if (e.elementTypeSpecifier) {
      const dateChoices: string[] = [];
      if (e.elementTypeSpecifier[0].$['xsi:type'] === 'ChoiceTypeSpecifier') {
        e.elementTypeSpecifier[0].choice.forEach((choice: any) => {
          if (choice.$.namespace === 'FHIR' && DATE_TYPES.includes(choice.$.name)) {
            dateChoices.push(choice.$.name);
          }
        });
      }

      if (dateChoices.length > 0) {
        acc[propName] = { isChoiceType: true, dataTypes: dateChoices };
      }
    }
    return acc;
  }, {});
}

parseModelInfo(xmlStr).then(data => {
  fs.writeFileSync(
    outputPath,
    `  
import {primaryDatePathInfo} from '../scripts/parsePrimaryDatePath'

export const parsedPrimaryDatePaths: primaryDatePathInfo = 
  ${JSON.stringify(data, null, 2)};
          `,
    'utf8'
  );
});
