import { useRecoilValue } from 'recoil';
import { detailedResultLookupState } from '../../state/atoms/detailedResultLookup';
import { useMemo, useState } from 'react';
import { Tabs, createStyles } from '@mantine/core';
import GroupResults from './GroupResults';

export default function ResultPanel({ patientId }: { patientId: string }) {
  const detailedResultLookup = useRecoilValue(detailedResultLookupState);
  const [activeTab, setActiveTab] = useState<string | null>('first');

  const detailedResults = useMemo(() => {
    return detailedResultLookup[patientId]?.detailedResults;
  }, [detailedResultLookup, patientId]);

  const groupTabs = detailedResults?.map(dr => (
    <Tabs.Tab value={dr.groupId} key={dr.groupId}>
      {dr.groupId}
    </Tabs.Tab>
  ));

  const groupPanels = detailedResults?.map(dr => (
    <Tabs.Panel value={dr.groupId} key={dr.groupId}>
      <GroupResults patientId={patientId} dr={dr} />
    </Tabs.Panel>
  ));

  return (
    <>
      <Tabs value={activeTab} onTabChange={setActiveTab}>
        <Tabs.List>{groupTabs}</Tabs.List>
        {groupPanels}
      </Tabs>
    </>
  );
}
