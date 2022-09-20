import { Grid } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons';
import { useRecoilState } from 'recoil';
import { measurementPeriodState } from '../../state/atoms/measurementPeriod';

export default function DateSelectors() {
  const [period, setPeriod] = useRecoilState(measurementPeriodState);
  return (
    <Grid>
      <Grid.Col span={5}>
        <DatePicker
          placeholder="Select start date"
          label="Measurement Period Start"
          value={period.start}
          onChange={start => setPeriod({ ...period, start })}
          icon={<IconCalendar size={16} />}
        />
      </Grid.Col>
      <Grid.Col span={5}>
        <DatePicker
          placeholder="Select end date"
          label="Measurement Period End"
          value={period.end}
          onChange={end => setPeriod({ ...period, end })}
          icon={<IconCalendar size={16} />}
        />
      </Grid.Col>
    </Grid>
  );
}
