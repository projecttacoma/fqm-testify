import { Container, Group, ScrollArea, SegmentedControl, Tabs } from '@mantine/core';
import parse from 'html-react-parser';
import { useRouter } from 'next/router';
import BackButton from '../../components/BackButton';
import classes from './coverage.module.css';
import { useState } from 'react';

const ClauseCoveragePage = () => {
  const router = useRouter();
  const { clauseCoverageHTML, clauseUncoverageHTML, measureId } = router.query;
  const [covValue, setCovValue] = useState('coverage');
  const [activeTab, setActiveTab] = useState<string | null>('0');

  if (
    typeof clauseCoverageHTML === 'string' &&
    clauseCoverageHTML.length > 0 &&
    typeof clauseUncoverageHTML === 'string' &&
    clauseUncoverageHTML.length > 0
  ) {
    const coverageRecord: Record<string, string> = JSON.parse(clauseCoverageHTML);
    const uncoverageRecord: Record<string, string> = JSON.parse(clauseUncoverageHTML);

    return (
      <Container size={'90%'}>
        <Group>
          <BackButton />
          <h2>Clause coverage for measure bundle: {`${measureId}`}</h2>
        </Group>
        <SegmentedControl
          value={covValue}
          onChange={setCovValue}
          data={[
            { label: 'Coverage', value: 'coverage' },
            { label: 'Uncoverage', value: 'uncoverage' }
          ]}
        />
        {covValue === 'coverage' ? (
          Object.keys(coverageRecord).length > 1 ? (
            <div>
              <Tabs value={activeTab} onTabChange={setActiveTab} classNames={classes}>
                <Tabs.List className={classes.tabsList}>
                  {Object.keys(coverageRecord).map((key, index) => (
                    <Tabs.Tab value={index.toString()} key={key}>
                      {key}
                    </Tabs.Tab>
                  ))}
                </Tabs.List>
                {Object.keys(coverageRecord).map((key, index) => (
                  <Tabs.Panel value={index.toString()} key={key} className={classes.tabsPanel}>
                    <ScrollArea>
                      <div>{parse(coverageRecord[key])}</div>
                    </ScrollArea>
                  </Tabs.Panel>
                ))}
              </Tabs>
            </div>
          ) : (
            <div>{parse(coverageRecord[Object.keys(coverageRecord)[0]])}</div>
          )
        ) : Object.keys(uncoverageRecord).length > 1 ? (
          <div>
            <Tabs value={activeTab} onTabChange={setActiveTab} classNames={classes}>
              <Tabs.List className={classes.tabsList}>
                {Object.keys(uncoverageRecord).map((key, index) => (
                  <Tabs.Tab value={index.toString()} key={key}>
                    {key}
                  </Tabs.Tab>
                ))}
              </Tabs.List>
              {Object.keys(uncoverageRecord).map((key, index) => (
                <Tabs.Panel value={index.toString()} key={key} className={classes.tabsPanel}>
                  <ScrollArea>
                    <div>{parse(uncoverageRecord[key])}</div>
                  </ScrollArea>
                </Tabs.Panel>
              ))}
            </Tabs>
          </div>
        ) : (
          <div>{parse(uncoverageRecord[Object.keys(uncoverageRecord)[0]])}</div>
        )}
      </Container>
    );
  } else {
    return (
      <div>
        <Group>
          <BackButton />
          <h2>No clause coverage results available for measure bundle: {`${measureId}`} </h2>
        </Group>
      </div>
    );
  }
};

export default ClauseCoveragePage;
