import { useRouter } from 'next/router';
import { Button, Tooltip } from '@mantine/core';
import { ArrowNarrowLeft } from 'tabler-icons-react';

const BackButton = () => {
  const router = useRouter();
  return (
    <Tooltip label="Show the previous page" openDelay={1000}>
      <Button
        data-testid="back-button"
        aria-label="Back Button"
        onClick={() => router.back()}
        radius="md"
        size="sm"
        style={{
          float: 'left',
          marginLeft: '5px'
        }}
      >
        <ArrowNarrowLeft size="36" />
      </Button>
    </Tooltip>
  );
};

export default BackButton;
