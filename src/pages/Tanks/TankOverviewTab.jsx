import { useState, useEffect, useCallback } from 'react';
import { Card, Group, SimpleGrid, Text, Stack, Badge, Table, Loader } from '@mantine/core';
import { IconTestPipe, IconDroplet, IconTool, IconPhoto } from '@tabler/icons-react';
import { tanksApi } from '../../api/tanks';
import TankVisual from './TankVisual';
import { useTranslation } from 'react-i18next';

function TankOverviewTab({ tank }) {
  const { t } = useTranslation();
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTimeline = useCallback(async () => {
    try {
      setLoading(true);
      const res = await tanksApi.getTimeline(tank.Id, { pageSize: 10 });
      setTimeline(res.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [tank.Id]);

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  const latestWater = timeline.find(e => e.EntryType === 'WaterParameter')?.Data;
  const latestDose = timeline.find(e => e.EntryType === 'Fertilization')?.Data;
  const latestMaint = timeline.find(e => e.EntryType === 'Maintenance')?.Data;

  const statCard = (icon, title, value, sub) => (
    <Card shadow="sm" padding="md" radius="md">
      <Group gap="xs" mb="xs">
        {icon}
        <Text size="sm" fw={600} c="dimmed">{title}</Text>
      </Group>
      <Text size="lg" fw={700}>{value || '—'}</Text>
      {sub && <Text size="xs" c="dimmed" mt={4}>{sub}</Text>}
    </Card>
  );

  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : t('Never');

  const renderTimelineEntry = (entry) => {
    const d = entry.Data;
    switch (entry.EntryType) {
      case 'WaterParameter':
        return (
          <Table.Tr key={`w-${d.Id}`}>
            <Table.Td><Badge size="xs" color="blue" variant="light"><IconTestPipe size={12} style={{marginRight:4}} />{t('Test')}</Badge></Table.Td>
            <Table.Td>{formatDate(d.MeasuredAt)}</Table.Td>
            <Table.Td>
              {d.pH != null && `pH: ${d.pH} `}
              {d.NitratePpm != null && `NO₃: ${d.NitratePpm} `}
              {d.PhosphatePpm != null && `PO₄: ${d.PhosphatePpm}`}
            </Table.Td>
          </Table.Tr>
        );
      case 'Fertilization':
        return (
          <Table.Tr key={`f-${d.Id}`}>
            <Table.Td><Badge size="xs" color="green" variant="light"><IconDroplet size={12} style={{marginRight:4}} />{t('Dose')}</Badge></Table.Td>
            <Table.Td>{formatDate(d.DosedAt)}</Table.Td>
            <Table.Td>{d.FertilizerPresetName || d.FertilizerType} {d.DoseAmount}{d.DoseUnit}</Table.Td>
          </Table.Tr>
        );
      case 'Maintenance':
        return (
          <Table.Tr key={`m-${d.Id}`}>
            <Table.Td><Badge size="xs" color="orange" variant="light"><IconTool size={12} style={{marginRight:4}} />{t('Maintenance')}</Badge></Table.Td>
            <Table.Td>{formatDate(d.PerformedAt)}</Table.Td>
            <Table.Td>{d.MaintenanceType}{d.WaterChangePercent ? ` ${d.WaterChangePercent}%` : ''}</Table.Td>
          </Table.Tr>
        );
      case 'Photo':
        return (
          <Table.Tr key={`p-${d.Id}`}>
            <Table.Td><Badge size="xs" color="grape" variant="light"><IconPhoto size={12} style={{marginRight:4}} />{t('Photo')}</Badge></Table.Td>
            <Table.Td>{formatDate(d.TakenAt)}</Table.Td>
            <Table.Td>{d.Caption || t('Untitled photo')}</Table.Td>
          </Table.Tr>
        );
      default: return null;
    }
  };

  return (
    <Stack>
      <TankVisual tank={tank} />

      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
        {statCard(
          <IconTestPipe size={20} style={{ color: 'var(--mantine-color-blue-6)' }} />,
          t('Last Water Test'),
          formatDate(latestWater?.MeasuredAt),
          latestWater ? `pH: ${latestWater.pH ?? '—'}, NO₃: ${latestWater.NitratePpm ?? '—'}` : null
        )}
        {statCard(
          <IconDroplet size={20} style={{ color: 'var(--mantine-color-green-6)' }} />,
          t('Last Dose'),
          formatDate(latestDose?.DosedAt),
          latestDose ? `${latestDose.FertilizerPresetName || latestDose.FertilizerType} ${latestDose.DoseAmount}${latestDose.DoseUnit}` : null
        )}
        {statCard(
          <IconTool size={20} style={{ color: 'var(--mantine-color-orange-6)' }} />,
          t('Last Maintenance'),
          formatDate(latestMaint?.PerformedAt),
          latestMaint ? `${latestMaint.MaintenanceType}${latestMaint.WaterChangePercent ? ` ${latestMaint.WaterChangePercent}%` : ''}` : null
        )}
        {statCard(
          <IconPhoto size={20} style={{ color: 'var(--mantine-color-grape-6)' }} />,
          t('Photos'),
          tank.PhotoCount || 0,
          t('Total entries')
        )}
      </SimpleGrid>

      <Card shadow="sm" padding="md" radius="md" mt="sm">
        <Text fw={600} mb="sm">{t('Tank Details')}</Text>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Text size="sm"><strong>{t('Substrate')}:</strong> {tank.Substrate || '—'}</Text>
          <Text size="sm"><strong>{t('CO₂')}:</strong> {tank.Co2Injection ? 'Yes' : 'No'}</Text>
          <Text size="sm"><strong>{t('Light')}:</strong> {tank.LightDescription || '—'}</Text>
          <Text size="sm"><strong>{t('Filter')}:</strong> {tank.FilterDescription || '—'}</Text>
          {tank.HeaterSetpointCelsius != null && <Text size="sm"><strong>{t('Heater')}:</strong> {tank.HeaterSetpointCelsius}°C</Text>}
        </SimpleGrid>
      </Card>

      <Card shadow="sm" padding="md" radius="md" mt="xs">
        <Text fw={600} mb="sm">{t('Recent Activity')}</Text>
        {loading ? <Loader size="sm" /> : timeline.length > 0 ? (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('Type')}</Table.Th>
                <Table.Th>{t('Date')}</Table.Th>
                <Table.Th>{t('Details')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {timeline.map(renderTimelineEntry)}
            </Table.Tbody>
          </Table>
        ) : <Text size="sm" c="dimmed" ta="center" py="md">No activity yet. Start logging!</Text>}
      </Card>
    </Stack>
  );
}

export default TankOverviewTab;
