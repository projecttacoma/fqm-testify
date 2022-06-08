const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

const modelInfoPath = path.resolve(path.join(__dirname, '../fixtures/model-info/fhir-modelinfo-4.0.1.xml'));
const outputPath = path.resolve(path.join(__dirname, '../fixtures/model-info/parsed-primaryCodePaths.json'));
const xmlStr = fs.readFileSync(modelInfoPath, 'utf8');

/**
 * Parse FHIR Model Info XML and output primaryCodePath information
 * for each FHIR Resource type.
 * @param {string} xml the string content of the model info XML to parse 
 * @return object whose keys are resourceTypes and values correspond to
 * the resourceTypes' primaryCodePath
*/
async function parse(xml) {
    const { modelInfo } = await xml2js.parseStringPromise(xml);
    const domainInfo = modelInfo.typeInfo.filter(ti => ti.$.baseType === 'FHIR.DomainResource');

    const res = {};

    domainInfo.forEach(di => {
        const resourceType = di.$.name;
        const primaryCodePath = di.$.primaryCodePath;

        if (primaryCodePath) {
          const element = di.element.find(elem => elem.$.name === primaryCodePath);
          let primaryCodeType;
          if (element?.$.elementType) {
            primaryCodeType = element.$.elementType;
          } else if (element?.elementTypeSpecifier) {
            // length of element.elementTypeSpecifier is always 1, so we can index it at 0
            if (element.elementTypeSpecifier[0].choice) {
              // if choice attribute exists, save both options to an array for now
              // TODO: explore which choice we want to use in each scenario
              let choices = [];
              element.elementTypeSpecifier[0].choice.forEach(c => {
                const choiceNamespace = c.$.namespace;
                const choiceName = c.$.name;
                choices.push(`${choiceNamespace}.${choiceName}`);
              });
              primaryCodeType = choices;
            } else {
              primaryCodeType = element.elementTypeSpecifier[0].$.elementType;
            }
          }
          res[resourceType] ={primaryCodePath: primaryCodePath, primaryCodeType: primaryCodeType};
        }
    });

    return res;

}


parse(xmlStr)
   .then(data => {
     fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');

     console.log(`Wrote file to ${outputPath}`);
   })
   .catch(e => {
     console.error(e);
   });