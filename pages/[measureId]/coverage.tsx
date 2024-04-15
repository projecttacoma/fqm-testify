import { Container, Group, ScrollArea, Tabs } from '@mantine/core';
import parse from 'html-react-parser';
import { useRouter } from 'next/router';
import BackButton from '../../components/BackButton';
import classes from './coverage.module.css';

const ClauseCoveragePage = () => {
  const router = useRouter();
  const { clauseCoverageHTML, clauseUncoverageHTML, measureId } = router.query;

  if (
    typeof clauseCoverageHTML === 'string' &&
    clauseCoverageHTML.length > 0 &&
    typeof clauseUncoverageHTML === 'string' &&
    clauseUncoverageHTML.length > 0
  ) {
    return (
      <Container size={'90%'}>
        <Group>
          <BackButton />
          <h2>Clause coverage for measure bundle: {`${measureId}`}</h2>
        </Group>
        <Tabs defaultValue="coverage" classNames={classes}>
          <Tabs.List grow>
            <Tabs.Tab value="coverage" /*leftSection={<IconPhoto style={iconStyle} />} */>Coverage</Tabs.Tab>
            <Tabs.Tab value="uncoverage" /*leftSection={<IconMessageCircle style={iconStyle} />}*/>Uncoverage</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="coverage">
            <ScrollArea>
              <div>{parse(clauseCoverageHTML)}</div>
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="uncoverage">
            <ScrollArea>
              <div>{parse(clauseUncoverageHTML)}</div>
            </ScrollArea>
          </Tabs.Panel>
        </Tabs>
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
