import { Grid } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useRecoilState } from 'recoil';
import { measurementPeriodState } from '../state/atoms/measurementPeriod';

export default function DateSelectors() {
  const [period, setPeriod] = useRecoilState(measurementPeriodState);
  return (
    <Grid>
      <Grid.Col span={6}>
        <DatePicker
          placeholder="Select start date"
          label="Measurement Period Start"
          value={period.start}
          onChange={start => setPeriod({ ...period, start })}
        />
      </Grid.Col>
      <Grid.Col span={6}>
        <DatePicker
          placeholder="Select end date"
          label="Measurement Period End"
          value={period.end}
          onChange={end => setPeriod({ ...period, end })}
        />
      </Grid.Col>
    </Grid>
  );
}
