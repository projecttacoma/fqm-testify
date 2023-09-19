import type { NextPage } from 'next';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  ActionIcon,
  Anchor,
  Box,
  Button,
  createStyles,
  Divider,
  Grid,
  Group,
  Popover,
  Space,
  Stack,
  Switch,
  Text
} from '@mantine/core';
import { useRecoilValue, useRecoilState } from 'recoil';
import MeasureFileUpload from '../components/measure-upload/MeasureFileUpload';
import DateSelectors from '../components/measure-upload/DateSelectors';
import { measureBundleState } from '../state/atoms/measureBundle';
import MeasureFileUploadHeader from '../components/utils/MeasureFileUploadHeader';
import MeasureRepositoryUploadHeader from '../components/utils/MeasureRespositoryUploadHeader';
import UploadErrorLog from '../components/measure-upload/UploadErrorLog';
import MeasureRepositoryUpload from '../components/measure-upload/MeasureRepositoryUpload';
import { MeasureUploadError } from '../util/measureUploadUtils';
import { trustMetaProfileState } from '../state/atoms/trustMetaProfile';
import { InfoCircle } from 'tabler-icons-react';

const useStyles = createStyles(theme => ({
  headerContainer: {
    height: '100%'
  },
  inputContainer: {
    [theme.fn.largerThan('md')]: {
      width: '900px'
    }
  },
  divider: {
    margin: '48px 0px 48px 0px'
  }
}));

const Home: NextPage = () => {
  const measureBundle = useRecoilValue(measureBundleState);
  const [trustMetaProfile, setUseTrustMetaProfile] = useRecoilState(trustMetaProfileState);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorLog, setErrorLog] = useState<MeasureUploadError[]>([]);
  const [datesValid, setDatesValid] = useState(false);
  const [trustMetaPopoverOpened, setTrustMetaPopoverOpened] = useState(false);

  const { classes } = useStyles();

  const isNextDisabled = !(measureBundle.content && datesValid);

  const logError = useCallback(
    (error: MeasureUploadError) => {
      setErrorLog([error, ...errorLog]);
    },
    [errorLog]
  );

  useEffect(() => {
    if (measureBundle.content != null) {
      setUploadSuccess(true);
      setErrorLog([]);
    } else {
      setUploadSuccess(false);
    }
  }, [measureBundle]);

  return (
    <>
      <Stack pt={24} align="center">
        <Stack className={classes.inputContainer}>
          <Grid columns={3}>
            <Grid.Col sm={3} md={1}>
              <Group align="center" className={classes.headerContainer}>
                <MeasureFileUploadHeader />
              </Group>
            </Grid.Col>
            <Grid.Col sm={3} md={2}>
              <Stack>
                <MeasureFileUpload logError={logError} />
                <MeasureRepositoryUploadHeader />
                <MeasureRepositoryUpload logError={logError} />
              </Stack>
            </Grid.Col>
          </Grid>
          <Divider className={classes.divider} />
          <Grid columns={3}>
            <Grid.Col sm={3} md={1}>
              <Group align="center" className={classes.headerContainer}>
                <div>
                  <Text size="xl" weight="bold">
                    Step 2:
                  </Text>
                  <Text weight="lighter">Set your Measurement Period</Text>
                </div>
              </Group>
            </Grid.Col>
            <Grid.Col sm={3} md={2}>
              <DateSelectors setDatesValid={setDatesValid} />
            </Grid.Col>
            <Grid.Col sm={3} md={1}>
              <Space h="md" />
              <Text weight="lighter">Filter out resources that do not have a valid meta.profile attribute</Text>
            </Grid.Col>
            <Grid.Col sm={3} md={2}>
              <Space h="md" />
              <Group position="center" align="center">
                <Switch
                  label="Use trustMetaProfile"
                  onLabel="YES"
                  offLabel="NO"
                  size="lg"
                  checked={trustMetaProfile}
                  onChange={event => setUseTrustMetaProfile(event.currentTarget.checked)}
                />
                <Popover opened={trustMetaPopoverOpened} onClose={() => setTrustMetaPopoverOpened(false)} width={500}>
                  <Popover.Target>
                    <ActionIcon aria-label={'More Information'} onClick={() => setTrustMetaPopoverOpened(o => !o)}>
                      <InfoCircle size={20} />
                    </ActionIcon>
                  </Popover.Target>
                  <Popover.Dropdown>
                    If set to use trustMetaProfile, trust the content of meta.profile as a source of truth for what
                    profiles the data that cql-exec-fhir grabs validates against. Read more about trustMetaProfile{' '}
                    <Anchor href="https://github.com/projecttacoma/fqm-execution#metaprofile-checking">here</Anchor>.
                  </Popover.Dropdown>
                </Popover>
              </Group>
            </Grid.Col>
          </Grid>
          <Divider className={classes.divider} />
          <Group position="right">
            <Link
              href="/generate-test-cases"
              style={{
                pointerEvents: isNextDisabled ? 'none' : 'all'
              }}
            >
              <Button disabled={isNextDisabled}>Next</Button>
            </Link>
          </Group>
          <Box pb={24}>
            <UploadErrorLog uploadSuccess={uploadSuccess} errorLog={errorLog} />
          </Box>
        </Stack>
      </Stack>
    </>
  );
};

export default Home;
