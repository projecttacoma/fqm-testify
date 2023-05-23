import { Grid } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons';
import { useRecoilState } from 'recoil';
import { measurementPeriodEndState, measurementPeriodStartState } from '../../state/atoms/measurementPeriod';

export default function DateSelectors() {
  const [periodStart, setPeriodStart] = useRecoilState(measurementPeriodStartState);
  const [periodEnd, setPeriodEnd] = useRecoilState(measurementPeriodEndState);

  return (
    <Grid>
      <Grid.Col span={6}>
        <DateInput
          label="Start"
          value={periodStart}
          onChange={setPeriodStart}
          icon={<IconCalendar size={25} />}
          defaultLevel="decade"
          placeholder="yyyy-mm-dd"
        />
      </Grid.Col>
      <Grid.Col span={6}>
        <DateInput
          label="End"
          value={periodEnd}
          onChange={setPeriodEnd}
          icon={<IconCalendar size={25} />}
          defaultLevel="decade"
          placeholder="yyyy-mm-dd"
        />
      </Grid.Col>
    </Grid>
  );
}
