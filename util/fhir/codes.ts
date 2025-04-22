import _ from 'lodash';
import fhirpath from 'fhirpath';
import type { ValueSetsMap } from '../../state/selectors/valueSetsMap';
import { parsedCodePaths } from 'fhir-spec-tools/build/data/codePaths';

/**
 * Identifies the valuesets referenced in a DataRequirement and constructs a string which displays
 * those valuesets. If a DataRequirement does not reference a valueset, then a string of the direct reference
 * code and display is constructed.
 * @param dr {Object} a fhir DataRequirement object
 * @param valueSetsMap {Object} a mapping of valueset urls to valueset names and titles
 * @returns {String} displaying the valuesets referenced by a DataRequirement or the direct reference code and display
 */
export function getDataRequirementFiltersString(dr: fhir4.DataRequirement, valueSetMap: ValueSetsMap): string {
  const valueSets = dr.codeFilter?.reduce((acc: string[], e) => {
    if (e.valueSet) {
      acc.push(`${valueSetMap[e.valueSet]} (${e.valueSet})`);
    }
    if (e.code) {
      const directCodes = e.code.filter(c => c.display);
      acc.push(...directCodes.map(c => `${c.code}: ${c.display}`));
    }
    return acc;
  }, []);
  if (valueSets && valueSets.length > 0) {
    return `${valueSets?.join('\n')}`;
  }
  return '';
}

export function getResourceCode(resource: any, dr: fhir4.DataRequirement, mb: fhir4.Bundle) {
  // go through each of the elements in the codeFilter array on the data requirement, if it exists

  dr.codeFilter?.forEach(cf => {
    let system, version, display, code;
    let path = cf.path;
    // check to see if the code filter has a value set
    if (cf.valueSet) {
      const vsResource = mb?.entry?.filter(
        r => r.resource?.resourceType === 'ValueSet' && r.resource?.url === cf.valueSet
      )[0].resource as fhir4.ValueSet;

      // assume ValueSet resource will either contain compose or expansion
      if (vsResource?.expansion?.contains) {
        // randomly select ValueSetExpansionContains to add to resource
        const contains = _.sample(vsResource.expansion.contains);
        ({ system, version, code, display } = contains || {});
      } else if (vsResource?.compose) {
        // randomly select ValueSetComposeInclude to add to resource
        const include = _.sample(vsResource.compose.include);
        // randomly select concept from ValueSetComposeInclude to add to resource
        const codeAndDisplay = _.sample(include?.concept);
        ({ system, version } = include || {});
        ({ code, display } = codeAndDisplay || {});
      }
    } else {
      // it doesn't have a valueSet, see if there is a direct reference code
      const directCode = cf.code as fhir4.Coding[];
      ({ system, version, code, display } = directCode[0] || {});
    }

    if (path) {
      if (parsedCodePaths[dr.type].paths[path] !== undefined) {
        const codeType = parsedCodePaths[dr.type].paths[path].codeType;
        const coding = {
          system,
          version,
          code,
          display
        };
        let codeData: fhir4.CodeableConcept | fhir4.Coding | string | null | undefined;
        const multipleCardinality: boolean = parsedCodePaths[dr.type].paths[path].multipleCardinality;
        if (codeType === 'FHIR.CodeableConcept') {
          if (parsedCodePaths[dr.type].paths[path].choiceType === true) {
            path += 'CodeableConcept';
          }
          // Need to add coding as an array for codeable concept
          codeData = {
            coding: [coding]
          };
        } else if (codeType === 'FHIR.Coding') {
          if (parsedCodePaths[dr.type].paths[path].choiceType === true) {
            path += 'Coding';
          }
          codeData = coding;
        } else if (codeType === 'FHIR.code') {
          if (parsedCodePaths[dr.type].paths[path].choiceType === true) {
            path += 'Code';
          }
          codeData = code;
        } else {
          codeData = null;
        }
        resource[path] = multipleCardinality ? [codeData] : codeData;
      }
    }
  });
}

/**
 * Identifies the primary code path of a resource and constructs a string which displays
 * resource summary information depending on what is a available. If a resource
 * does not include a path for it's primaryCodePath, then it finds a path on that resource
 * that has coding (if available) and display resource summary information depending on
 * what is available.
 * @param resource {fhir4.Resource} a fhir Resource object
 * @returns {String} displaying the code and display text, code, or id of the resource or nothing
 */
export function getFhirResourceSummary(resource: fhir4.Resource) {
  let primaryCodePath = parsedCodePaths[resource.resourceType]?.primaryCodePath;
  let pathEval;
  // handle choice type
  if (primaryCodePath) {
    const pathInfo = parsedCodePaths[resource.resourceType].paths[primaryCodePath];
    if (pathInfo?.choiceType) {
      primaryCodePath = `${primaryCodePath}${pathInfo.codeType.replace('FHIR.', '')}`;
    }

    if (pathInfo?.codeType === 'FHIR.CodeableConcept') {
      pathEval = fhirpath.evaluate(resource, `${primaryCodePath}.coding`)[0] as fhir4.Coding;
    } else if (pathInfo?.codeType === 'FHIR.Coding') {
      pathEval = fhirpath.evaluate(resource, primaryCodePath)[0] as fhir4.Coding;
    } else if (pathInfo?.codeType === 'FHIR.code') {
      pathEval = fhirpath.evaluate(resource, primaryCodePath)[0] as string;
    }
  }

  // backup case finds first available coding
  if (pathEval === undefined) {
    const paths = parsedCodePaths[resource.resourceType]?.paths;
    for (const p in paths) {
      if (fhirpath.evaluate(resource, `${p}.coding`)[0]) {
        primaryCodePath = p;
      }
    }
    pathEval = fhirpath.evaluate(resource, `${primaryCodePath}.coding`)[0] as string;
  }

  if (pathEval) {
    const resourceCode = typeof pathEval === 'string' ? pathEval : pathEval.code;
    const resourceDisplay = typeof pathEval === 'string' ? undefined : pathEval.display;

    if (resourceCode && resourceDisplay) {
      return `(${resourceCode}: ${resourceDisplay})`;
    } else if (resourceCode) {
      return `(${resourceCode})`;
    } else if (resourceDisplay) {
      return `(${resourceDisplay})`;
    }
  }

  if (resource.id) {
    return `(${resource.id})`;
  } else {
    return '';
  }
}
