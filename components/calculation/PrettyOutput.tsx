import { Button, Collapse, Paper, Space } from '@mantine/core';
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
      <div style={{ width: 120 }}>
        <Button fullWidth compact variant="outline" color="gray" onClick={toggle}>
          {buttonText}
        </Button>
      </div>
      <Collapse in={opened}>
        <Space />
        <Paper shadow="xs">
          <pre>{statement?.pretty}</pre>
        </Paper>
      </Collapse>
    </>
  );
}
