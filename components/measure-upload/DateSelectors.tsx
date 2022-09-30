import { Grid } from '@mantine/core';
import { DateRangePicker } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons';
import { useRecoilState } from 'recoil';
import { measurementPeriodState } from '../../state/atoms/measurementPeriod';

export default function DateSelectors() {
  const [period, setPeriod] = useRecoilState(measurementPeriodState);
  return (
    <Grid>
      <Grid.Col span={12}>
        <DateRangePicker
          placeholder="Select Measurement Period Range"
          label="Measurement Period Range"
          value={[period.start, period.end]}
          onChange={period => {
            setPeriod({ start: period[0], end: period[1] });
          }}
          icon={<IconCalendar size={25} />}
        ></DateRangePicker>
      </Grid.Col>
    </Grid>
  );
}
