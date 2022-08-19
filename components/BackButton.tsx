import { useRouter } from 'next/router';
import { Button } from '@mantine/core';
import { ArrowNarrowLeft } from 'tabler-icons-react';

const BackButton = () => {
  const router = useRouter();
  return (
    <Button
      data-testid="back-button"
      aria-label="Back Button"
      onClick={() => router.back()}
      radius="md"
      size="sm"
      style={{
        float: 'left'
      }}
    >
      <ArrowNarrowLeft size="36" />
    </Button>
  );
};

export default BackButton;
