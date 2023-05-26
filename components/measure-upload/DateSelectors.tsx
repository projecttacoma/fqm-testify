import { Grid } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { measurementPeriodEndState, measurementPeriodStartState } from '../../state/atoms/measurementPeriod';

interface DateSelectorsProps {
  setDatesValid: (val: boolean) => void;
}

export default function DateSelectors({ setDatesValid }: DateSelectorsProps) {
  const [periodStart, setPeriodStart] = useRecoilState(measurementPeriodStartState);
  const [periodEnd, setPeriodEnd] = useRecoilState(measurementPeriodEndState);
  const [dateInputError, setDateInputError] = useState<string | null>(null);

  useEffect(() => {
    if (periodStart && periodEnd) {
      if (periodStart.valueOf() > periodEnd.valueOf()) {
        setDateInputError('Period start must come before period end');
        setDatesValid(false);
      } else {
        setDatesValid(true);
        setDateInputError(null);
      }
    } else {
      setDatesValid(false);
    }
  }, [periodStart, periodEnd, setDatesValid]);

  return (
    <Grid>
      <Grid.Col span={6}>
        <DateInput
          required
          label="Start"
          value={periodStart}
          onChange={setPeriodStart}
          icon={<IconCalendar size={25} />}
          defaultLevel="decade"
          placeholder="yyyy-mm-dd"
          error={dateInputError}
        />
      </Grid.Col>
      <Grid.Col span={6}>
        <DateInput
          required
          label="End"
          value={periodEnd}
          onChange={setPeriodEnd}
          icon={<IconCalendar size={25} />}
          defaultLevel="decade"
          placeholder="yyyy-mm-dd"
          error={dateInputError}
        />
      </Grid.Col>
    </Grid>
  );
}
