import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, Group, Stack, Text, Table, Modal, Select, NumberInput, Textarea, Loader, Progress, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus } from '@tabler/icons-react';
import { tanksApi } from '../../api/tanks';
import { useTranslation } from 'react-i18next';

const MAINTENANCE_TYPE_VALUES = ['WaterChange', 'FilterCleaning', 'PlantTrimming', 'SubstrateVacuuming', 'GlassCleaning', 'EquipmentCheck', 'Other'];

const MAINTENANCE_TYPE_LABELS = {
  WaterChange: 'Water Change',
  FilterCleaning: 'Filter Cleaning',
  PlantTrimming: 'Plant Trimming',
  SubstrateVacuuming: 'Substrate Vacuum',
  GlassCleaning: 'Glass Cleaning',
  EquipmentCheck: 'Equipment Check',
  Other: 'Other',
};

const TYPE_ICONS = {
  WaterChange: '💧', FilterCleaning: '🔧', PlantTrimming: '✂️',
  SubstrateVacuuming: '🧹', GlassCleaning: '🪟', EquipmentCheck: '⚙️', Other: '📋'
};

function TankMaintenanceTab({ tankId }) {
  const { t } = useTranslation();

  const maintenanceTypes = useMemo(() =>
    MAINTENANCE_TYPE_VALUES.map((v) => ({
      value: v,
      label: t(MAINTENANCE_TYPE_LABELS[v]),
    })), [t]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  const [form, setForm] = useState({
    PerformedAt: new Date().toISOString().slice(0, 16),
    MaintenanceType: '',
    WaterChangePercent: '',
    WaterChangeLiters: '',
    DurationMinutes: '',
    Notes: '',
    ReminderFrequencyDays: '',
  });

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await tanksApi.getMaintenance(tankId, { pageSize: 50 });
      setLogs(res.data || []);
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to load maintenance', color: 'red' });
    } finally { setLoading(false); }
  }, [tankId]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {};
      for (const [k, v] of Object.entries(form)) {
        if (v === '' || v === null) continue;
        if (k === 'WaterChangePercent' || k === 'DurationMinutes' || k === 'ReminderFrequencyDays')
          data[k] = parseInt(v);
        else if (k === 'WaterChangeLiters')
          data[k] = parseFloat(v);
        else
          data[k] = v;
      }

      await tanksApi.addMaintenance(tankId, data);
      notifications.show({ title: 'Success', message: 'Maintenance logged', color: 'green' });
      close();
      setForm({ PerformedAt: new Date().toISOString().slice(0, 16), MaintenanceType: '', WaterChangePercent: '', WaterChangeLiters: '', DurationMinutes: '', Notes: '', ReminderFrequencyDays: '' });
      loadLogs();
    } catch (e) {
      const msg = e.response?.data?.ErrorMessage || e.response?.data?.title || 'Failed to save';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    }
  };

  const setF = (key, val) => setForm({ ...form, [key]: val });

  const grouped = {};
  logs.forEach(l => {
    const month = new Date(l.PerformedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!grouped[month]) grouped[month] = [];
    grouped[month].push(l);
  });

  return (
    <Stack>
      <Group justify="space-between">
        <Text fw={600}>{t('Maintenance History')} ({logs.length})</Text>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>{t('Log Maintenance')}</Button>
      </Group>

      {loading ? <Loader /> : Object.keys(grouped).length > 0 ? Object.entries(grouped).map(([month, entries]) => (
        <Stack key={month} gap="xs">
          <Text size="sm" fw={600} c="dimmed" mt="sm">{month}</Text>
          {entries.map(l => (
            <Group key={l.Id} gap="sm" p="sm" style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 8 }}>
              <Text size="xl">{TYPE_ICONS[l.MaintenanceType] || '📋'}</Text>
              <Stack gap={2} style={{ flex: 1 }}>
                <Group gap="xs">
                  <Text fw={500}>{t(MAINTENANCE_TYPE_LABELS[l.MaintenanceType] || l.MaintenanceType)}</Text>
                  <Text size="xs" c="dimmed">{new Date(l.PerformedAt).toLocaleDateString()}</Text>
                </Group>
                {l.WaterChangePercent != null && (
                  <Progress value={l.WaterChangePercent} size="sm" color="blue" w="100%" />
                )}
                {l.Notes && <Text size="xs">{l.Notes}</Text>}
                {l.ReminderFrequencyDays && <Text size="xs" c="teal">Reminder: every {l.ReminderFrequencyDays} days</Text>}
              </Stack>
            </Group>
          ))}
        </Stack>
      )) : <Text c="dimmed" ta="center" py="md">{t('No maintenance logged yet.')}</Text>}

      <Modal opened={opened} onClose={close} title={t('Log Maintenance')} size="md">
        <form onSubmit={handleSubmit}>
          <Stack gap="sm">
            <TextInput type="datetime-local" label={t('Date/Time')} value={form.PerformedAt} onChange={(e) => setF('PerformedAt', e.target.value)} />
            <Select label={t('Type')} required data={maintenanceTypes} value={form.MaintenanceType} onChange={(v) => setF('MaintenanceType', v)} />
            {form.MaintenanceType === 'WaterChange' && (
              <>
                <NumberInput label={t('Water Change (%)')} min={0} max={100} value={form.WaterChangePercent || ''} onChange={(v) => setF('WaterChangePercent', v)} />
                <NumberInput label={t('Volume (L)')} min={0} value={form.WaterChangeLiters || ''} onChange={(v) => setF('WaterChangeLiters', v)} />
              </>
            )}
            <NumberInput label={t('Duration (min)')} min={0} value={form.DurationMinutes || ''} onChange={(v) => setF('DurationMinutes', v)} />
            <NumberInput label={t('Reminder (days)')} min={0} value={form.ReminderFrequencyDays || ''} onChange={(v) => setF('ReminderFrequencyDays', v)} placeholder="e.g. 7 for weekly" />
            <Textarea label={t('Notes')} value={form.Notes} onChange={(e) => setF('Notes', e.target.value)} />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={close}>{t('Cancel')}</Button>
              <Button type="submit">{t('Save')}</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}

export default TankMaintenanceTab;
