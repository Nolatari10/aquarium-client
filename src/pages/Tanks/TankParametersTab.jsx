import { useState, useEffect, useCallback } from 'react';
import { Button, Group, Stack, Text, Table, Modal, TextInput, NumberInput, Textarea, Loader } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus } from '@tabler/icons-react';
import { tanksApi } from '../../api/tanks';
import { useTranslation } from 'react-i18next';
// Common test kit fields shown by default; advanced fields (Fe, GH, KH, TDS, CO₂, salinity) hidden behind "+ Show advanced"
const PARAM_FIELDS = [
  { key: 'pH', label: 'pH', advanced: false },
  { key: 'TemperatureCelsius', label: 'Temp (°C)', advanced: false },
  { key: 'AmmoniaPpm', label: 'Ammonia (ppm)', advanced: false },
  { key: 'NitritePpm', label: 'Nitrite (ppm)', advanced: false },
  { key: 'NitratePpm', label: 'Nitrate (ppm)', advanced: false },
  { key: 'PhosphatePpm', label: 'Phosphate (ppm)', advanced: true },
  { key: 'PotassiumPpm', label: 'Potassium (ppm)', advanced: true },
  { key: 'IronPpm', label: 'Iron (ppm)', advanced: true },
  { key: 'GeneralHardness', label: 'GH (dGH)', advanced: true },
  { key: 'CarbonateHardness', label: 'KH (dKH)', advanced: true },
  { key: 'TdsPpm', label: 'TDS (ppm)', advanced: true },
  { key: 'Co2Ppm', label: 'CO₂ (ppm)', advanced: true },
  { key: 'SalinityPpt', label: 'Salinity (ppt)', advanced: true },
];

// Displays water test results in a table with an expandable log form.
// Users log only what they measure — all fields are nullable.
function TankParametersTab({ tankId }) {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [form, setForm] = useState({ MeasuredAt: new Date().toISOString().slice(0, 16), Notes: '' });

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await tanksApi.getWaterParameters(tankId, { pageSize: 100 });
      setLogs(res.data || []);
    } catch { notifications.show({ title: 'Error', message: t('Failed to load parameters'), color: 'red' }); }
    finally { setLoading(false); }
  }, [tankId]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form };
      if (data.MeasuredAt) data.MeasuredAt = new Date(data.MeasuredAt).toISOString();
      PARAM_FIELDS.forEach(f => { if (data[f.key]) data[f.key] = parseFloat(data[f.key]); });

      await tanksApi.addWaterParameter(tankId, data);
      notifications.show({ title: 'Success', message: t('Test result logged'), color: 'green' });
      close();
      setForm({ MeasuredAt: new Date().toISOString().slice(0, 16), Notes: '' });
      setShowAdvanced(false);
      loadLogs();
    } catch { notifications.show({ title: 'Error', message: t('Failed to save'), color: 'red' }); }
  };

  const setF = (key, val) => setForm({ ...form, [key]: val });
  const fields = PARAM_FIELDS.filter(f => !f.advanced || showAdvanced);

  const rows = logs.slice(0, 30).map(l => (
    <Table.Tr key={l.Id}>
      <Table.Td>{new Date(l.MeasuredAt).toLocaleDateString()}</Table.Td>
      <Table.Td>{l.pH != null ? l.pH : '—'}</Table.Td>
      <Table.Td>{l.TemperatureCelsius != null ? l.TemperatureCelsius : '—'}</Table.Td>
      <Table.Td>{l.AmmoniaPpm != null ? l.AmmoniaPpm : '—'}</Table.Td>
      <Table.Td>{l.NitritePpm != null ? l.NitritePpm : '—'}</Table.Td>
      <Table.Td>{l.NitratePpm != null ? l.NitratePpm : '—'}</Table.Td>
      <Table.Td>{l.PhosphatePpm != null ? l.PhosphatePpm : '—'}</Table.Td>
      <Table.Td style={{ maxWidth: 200 }}><Text size="xs" lineClamp={2}>{l.Notes || '—'}</Text></Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack>
      <Group justify="space-between">
        <Text fw={600}>{t('Water Test Results')} ({logs.length})</Text>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>{t('Log Test')}</Button>
      </Group>

      {loading ? <Loader /> : logs.length > 0 ? (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('Date')}</Table.Th><Table.Th>{t('pH')}</Table.Th><Table.Th>{t('Temp')}</Table.Th>
              <Table.Th>{t('NH₃')}</Table.Th><Table.Th>{t('NO₂')}</Table.Th><Table.Th>{t('NO₃')}</Table.Th>
              <Table.Th>{t('PO₄')}</Table.Th><Table.Th>{t('Notes')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      ) : <Text c="dimmed" ta="center" py="md">{t('No water tests logged yet.')}</Text>}

      <Modal opened={opened} onClose={close} title={t('Log Water Test')} size="lg">
        <form onSubmit={handleSubmit}>
          <Stack gap="sm">
            <TextInput type="datetime-local" label={t('Date/Time')} value={form.MeasuredAt} onChange={(e) => setF('MeasuredAt', e.target.value)} />
            {fields.map(f => (
              <NumberInput key={f.key} label={t(f.label)} value={form[f.key] || ''} onChange={(v) => setF(f.key, v)} decimalScale={3} />
            ))}
            <Text size="xs" c="teal" style={{ cursor: 'pointer' }} onClick={() => setShowAdvanced(!showAdvanced)}>
              {showAdvanced ? t('Hide advanced') : t('Show advanced fields (GH, KH, TDS, CO₂, etc.)')}
            </Text>
            <Textarea label={t('Notes')} value={form.Notes || ''} onChange={(e) => setF('Notes', e.target.value)} placeholder={t('How do plants/fish look?')} />
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

export default TankParametersTab;
