import { ActionIcon, createStyles, Group, Popover, Table, Text } from '@mantine/core';
import { useRecoilValue } from 'recoil';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { useMemo, useState } from 'react';
import { getMeasurePopulationsForSelection, MultiSelectData, getPopShorthand } from '../../util/MeasurePopulations';
import { InfoCircle } from 'tabler-icons-react';
import { detailedResultLookupState } from '../../state/atoms/detailedResultLookup';
import { DetailedPopulationGroupResult, PopulationResult } from 'fqm-execution/build/types/Calculator';
import React from 'react';

const useStyles = createStyles({
  highlightRed: {
    backgroundColor: '#edd8d0',
    color: '#a63b12',
    borderBottomColor: '#a63b12',
    borderBottomStyle: 'double'
  },
  highlightGreen: {
    backgroundColor: '#ccebe0',
    color: '#20744c',
    borderBottomColor: '#20744c',
    borderBottomStyle: 'solid'
  }
});

export interface DesiredPopulations {
  [key: string]: number;
}
export interface ResultValues {
  resource: string;
  desired: Record<string, number | undefined>;
  actual: Record<string, number | undefined>;
}

export default function PopulationComparisonTable({ patientId }: { patientId: string }) {
  const { classes } = useStyles();
  const measureBundle = useRecoilValue(measureBundleState);
  const detailedResultLookup = useRecoilValue(detailedResultLookupState);
  const currentPatients = useRecoilValue(patientTestCaseState);

  const measure = useMemo(() => {
    return measureBundle.content?.entry?.find(e => e.resource?.resourceType === 'Measure')?.resource as fhir4.Measure;
  }, [measureBundle]);

  /**
   * Creates a key that can be used to represent the population associated with a particular population result.
   * This key can be used to show the user what population the results are relevant for. It generally uses the
   * criteria expression, but makes adjustments for measure observations where the expression may not be unique.
   */
  function keyForResult(result: PopulationResult, group: DetailedPopulationGroupResult | undefined) {
    let key = getPopShorthand(result.populationType);

    if (!key) {
      throw new Error(
        'Population Type not found in measure population valueset: http://hl7.org/fhir/valueset-measure-population.html'
      );
    }

    if (result.populationType === 'measure-observation' && result.criteriaReferenceId) {
      const obsPop = group?.populationResults?.find(
        pr => pr.populationId === result.criteriaReferenceId
      )?.populationType;
      if (obsPop) {
        key = `${key}-${getPopShorthand(obsPop)} (${result.criteriaExpression})`;
      } else {
        throw new Error('Observation result criteriaReferenceId has no corresponding population');
      }
    }
    return key;
  }

  /**
   * Creates an object where the population is the key and the value is 0 or 1:
   * 0 if that population is not a desired population and 1 if it is.
   */
  function constructPatientDesiredValuesArray(measurePopulations: MultiSelectData[]) {
    const desiredPopulations: DesiredPopulations = {};
    measurePopulations.forEach(measurePopulation => {
      if (currentPatients[patientId].desiredPopulations?.includes(measurePopulation.value)) {
        desiredPopulations[measurePopulation.label] = 1;
      } else {
        desiredPopulations[measurePopulation.label] = 0;
      }
    });
    return desiredPopulations;
  }

  /**
   * Creates a ResultValues object for the Patient overall results. Specifies resource (Patient),
   * desired population values, and actual population values. Desired and actual are key/value pairs,
   * where the population label (criteria) is the key and the value is 0/1 for proportion measures:
   * 0 if that population is not desired (or actual) and 1 if that population is desired (or actual).
   * For ratio measures, the value is the number of episodes in the population rather than a boolean 0/1.
   */
  function constructPatientValues(group: DetailedPopulationGroupResult | undefined) {
    const desiredPopulations = constructPatientDesiredValuesArray(getMeasurePopulationsForSelection(measure));
    const patientValues: ResultValues = {
      resource: 'Patient',
      desired: {},
      actual: {}
    };
    if (!group?.episodeResults) {
      // generate boolean population scores for patient-based measures
      group?.populationResults?.forEach(result => {
        const key = keyForResult(result, group);

        patientValues['actual'][key] = result?.result === true ? 1 : 0;
        patientValues['desired'][key] = desiredPopulations[key];
      });
    } else {
      // generate episode count population scores for episode-based measures
      if (group?.episodeResults.length === 0) {
        // show population keys with 0 results if there are no episodes
        group?.populationResults?.forEach(result => {
          const key = keyForResult(result, group);
          patientValues['actual'][key] = 0;
          // TODO: placeholder -1 value until we can set a desired total number of episodes per population
          patientValues['desired'][key] = -1;
        });
      } else {
        // generate number of episodes for each population for ratio measures
        group.episodeResults.forEach(er => {
          er.populationResults.forEach(result => {
            const key = keyForResult(result, group);

            if (result.populationType === 'measure-observation') {
              patientValues['actual'][key] = undefined;
              patientValues['desired'][key] = undefined;
            } else {
              // TODO: placeholder -1 value until we can set a desired total number of episodes per population
              patientValues['desired'][key] = -1;
              if (!patientValues['actual'][key]) patientValues['actual'][key] = 0;
              if (result.result) {
                patientValues['actual'][key] = (patientValues['actual'][key] as number) + 1;
              }
            }
          });
        });
      }
    }

    return patientValues;
  }

  /**
   * Creates an array of ResultValues objects for each of the Episode results. Specifies resource (which episode),
   * desired population values, and actual population values. Desired and actual are key/value pairs,
   * where the population label (criteria) is the key and the value is 0/1 or the observation value if the population
   * is a measure observation.
   */
  function constructEpisodeValues(group: DetailedPopulationGroupResult | undefined) {
    const results = group?.episodeResults?.map(er => {
      const episode = currentPatients[patientId].resources.find(r => r.resource?.id === er.episodeId)?.resource;
      const keys = er.populationResults.map(pr => keyForResult(pr, group));
      // TODO: placeholder until episodes have desired results: all values currently -1
      const desired = keys.reduce((acc: Record<string, number | undefined>, cv) => {
        acc[cv] = -1;
        return acc;
      }, {});
      const actual = er.populationResults.reduce((acc: Record<string, number | undefined>, pr: PopulationResult) => {
        const key = keyForResult(pr, group);
        const value =
          pr.populationType === 'measure-observation'
            ? pr.observations?.[0] // observation
            : pr.result
            ? 1
            : 0; // population
        acc[key] = value;
        return acc;
      }, {});
      return {
        resource: `${episode?.resourceType}: ${episode?.id}`,
        desired: desired,
        actual: actual
      };
    });
    return results ?? [];
  }

  /**
   * Creates table rows for a single set of result values. These rows specify this resource (patient or episode),
   * desired population values, and actual population values.
   */
  function rowsForResult(result: ResultValues, pops: string[]) {
    const disabled = Object.values(result.desired).includes(-1);
    return (
      <React.Fragment key={result.resource}>
        <tr key={`row-${result.resource}`}>
          <td>
            <b>{result.resource}</b>
          </td>
        </tr>
        {
          /* TODO: Remove this guard once we get rid of -1 placeholder values for desired populations */
          disabled ? (
            // TODO: get rid of empty row once once we get rid of -1 placeholder values for desired populations
            <tr key={`${result.resource}-desired`}>
              <td>Desired (Unavailable)</td>
            </tr>
          ) : (
            <tr key={`${result.resource}-desired`}>
              <td>Desired</td>
              {pops.map(p => {
                if (result.desired[p] === undefined) {
                  return <td key={`${result.resource}-desired-${p}`}>N/A</td>;
                } else if (result.desired[p] === result.actual[p]) {
                  return (
                    <td className={classes.highlightGreen} key={`${result.resource}-desired-${p}`}>
                      {result.desired[p]}
                    </td>
                  );
                } else {
                  return (
                    <td className={classes.highlightRed} key={`${result.resource}-desired-${p}`}>
                      {result.desired[p]}
                    </td>
                  );
                }
              })}
            </tr>
          )
        }

        <tr key={`${result.resource}-actual`}>
          <td>Actual</td>
          {pops.map(p => {
            if (result.actual[p] === undefined) {
              return <td key={`${result.resource}-actual-${p}`}>N/A</td>;
            } else if (disabled) {
              // TODO: remove this disabled check and cell option once desired populations are setable for episode measures
              return <td key={`${result.resource}-actual-${p}`}>{result.actual[p]}</td>;
            } else if (result.desired[p] === result.actual[p]) {
              return (
                <td className={classes.highlightGreen} key={`${result.resource}-actual-${p}`}>
                  {result.actual[p]}
                </td>
              );
            } else {
              return (
                <td className={classes.highlightRed} key={`${result.resource}-actual-${p}`}>
                  {result.actual[p]}
                </td>
              );
            }
          })}
        </tr>
      </React.Fragment>
    );
  }

  if (measure) {
    const group = detailedResultLookup[patientId]?.detailedResults?.[0];
    const allValues = [constructPatientValues(group), ...constructEpisodeValues(group)];
    const pops = Object.keys(allValues[0].actual); //patient actual keys

    return (
      <>
        <div />

        <Table horizontalSpacing="xl">
          <thead>
            <tr>
              <th />
              {pops.map(p => (
                <th key={p}>{p}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allValues.map(r => {
              return rowsForResult(r, pops);
            })}
          </tbody>
        </Table>
      </>
    );
  } else {
    return <Text>Measure highlighting not available</Text>;
  }
}

export function PopulationComparisonTableControl() {
  const [opened, setOpened] = useState(false);
  return (
    <Group>
      <div style={{ paddingRight: 5 }}>
        <Text size="xl" weight={700}>
          Population Comparison Table
        </Text>
      </div>
      <div>
        <Popover opened={opened} onClose={() => setOpened(false)} width={500}>
          <Popover.Target>
            <ActionIcon
              aria-label={'More Information'}
              onClick={e => {
                e.stopPropagation();
                setOpened(o => !o);
              }}
            >
              <InfoCircle size={20} />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>
            The Population Comparison Table shows patient and episode population results for the patient selected. For
            patient-based measures, patient results show 0 or 1 to indicate belonging to a population. Actual and
            desired populations are compared to highlight cells green if they match and red if they don&apos;t match.
            <br />
            <br />
            For episode-based measures, the table shows patient level totals that indicate how many episodes are in each
            population. Episode population results show a 0 or 1, and episode observation results show the observed
            value for that episode.
            <br />
            <br />
            See the{' '}
            <a href="https://github.com/projecttacoma/fqm-testify#reading-the-population-comparison-table">
              fqm-testify README
            </a>{' '}
            for more information.
          </Popover.Dropdown>
        </Popover>
      </div>
    </Group>
  );
}
