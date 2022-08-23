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
  const { html, measureId } = router.query;
  if (typeof html === 'string') {
    return (
      <>
        <Group>
          <BackButton />
          <h2>Clause coverage for measure: {`${measureId}`}</h2>
        </Group>
        <Center>
          <div
            className={classes.highlightedMarkup}
            style={{
              maxHeight: '55vh',
              overflow: 'scroll'
            }}
          >
            {parse(html)}
          </div>
        </Center>
      </>
    );
  } else return (<div></div>);
};

export default ClauseCoveragePage;
