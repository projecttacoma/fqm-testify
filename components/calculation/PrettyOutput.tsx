import { Button, Collapse, Paper } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { StatementResult } from 'fqm-execution';

export interface PrettyOutputProps {
  statement: StatementResult | undefined;
}

export default function PrettyOutput({ statement }: PrettyOutputProps) {
  const [opened, { toggle }] = useDisclosure(false);
  const buttonText = opened ? 'Hide Results' : 'Show Results';

  return (
    <>
      <Button fullWidth compact variant="outline" color="gray" onClick={toggle} w={120}>
        {buttonText}
      </Button>
      <Collapse in={opened}>
        <Paper shadow="xs" pl={8}>
          <pre>{statement?.pretty}</pre>
        </Paper>
      </Collapse>
    </>
  );
}
