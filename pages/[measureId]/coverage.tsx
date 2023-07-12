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
      <Center>
        <div>
          <Group>
            <BackButton />
            <h2>Clause coverage for measure bundle: {`${measureId}`}</h2>
          </Group>
          <div className={classes.highlightedMarkup}>{parse(clauseCoverageHTML)}</div>
        </div>
      </Center>
    );
  } else
    return (
      <div>
        <Group>
          <BackButton />
          <h2>No clause coverage results available for measure bundle: {`${measureId}`} </h2>
        </Group>
      </div>
    );
};

export default ClauseCoveragePage;
