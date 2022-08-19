import { Center } from '@mantine/core';
import { useRouter } from 'next/router';
import BackButton from '../../components/BackButton';

const ClauseCoveragePage = () => {
  const router = useRouter();
  const { measureId } = router.query;
  return (
    <div>
      <BackButton />
      <Center>
        <h2>Clause coverage for measure: {`${measureId}`}</h2>
      </Center>
    </div>
  );
};

export default ClauseCoveragePage;
