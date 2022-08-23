import { Center, createStyles, Group } from '@mantine/core';
import { useRouter } from 'next/router';
import BackButton from '../../components/BackButton';
import parse from 'html-react-parser';

const useStyles = createStyles(() => ({
  highlightedMarkup: {
    '& pre': {
      whiteSpace: 'pre-wrap'
    }
  }
}));

const ClauseCoveragePage = () => {
  const { classes } = useStyles();
  const router = useRouter();
  const { clauseCoverageHTML, measureId } = router.query;
  if (typeof clauseCoverageHTML === 'string' && clauseCoverageHTML.length > 0) {
    return (
      <>
        <Group>
          <BackButton />
          <h2>Clause coverage for measure bundle: {`${measureId}`}</h2>
        </Group>
        <Center>
          <div
            className={classes.highlightedMarkup}
            style={{
              maxHeight: '55vh',
              overflow: 'scroll'
            }}
          >
            {parse(clauseCoverageHTML)}
          </div>
        </Center>
      </>
    );
  } else return (
    <>
    <Group>
      <BackButton />
      <h2>No clause coverage results available for measure bundle: {`${measureId}`} </h2>
    </Group>
    </>
  );
};

export default ClauseCoveragePage;
