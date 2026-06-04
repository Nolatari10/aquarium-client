import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, Group, Stack, Text, Table, Modal, Select, NumberInput, Textarea, Badge, Switch, Loader, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus } from '@tabler/icons-react';
import { tanksApi } from '../../api/tanks';
import { fertilizerPresetsApi } from '../../api/fertilizerPresets';
import { extractErrorMessage } from '../../tools/errorUtils';
import { useTranslation } from 'react-i18next';

const FERTILIZER_TYPE_VALUES = ['Macro', 'Micro', 'AllInOne', 'Iron', 'Potassium', 'Other'];

const FERTILIZER_TYPE_LABELS = {
  Macro: 'Macro', Micro: 'Micro', AllInOne: 'All-in-One',
  Iron: 'Iron', Potassium: 'Potassium', Other: 'Other',
};

const DOSE_UNITS = ['ml', 'grams', 'pumps', 'drops', 'tsp'];

// Logs fertilizer doses with product preset selection, estimated ppm additions,
// and flags for scheduled vs one-off adjustments.
function TankFertilizationTab({ tankId }) {
  const { t } = useTranslation();

  const typeOptions = useMemo(() =>
    FERTILIZER_TYPE_VALUES.map((v) => ({
      value: v,
      label: t(FERTILIZER_TYPE_LABELS[v]),
    })), [t]);
  const [logs, setLogs] = useState([]);
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  const [form, setForm] = useState({
    DosedAt: new Date().toISOString().slice(0, 16),
    FertilizerPresetId: '', FertilizerType: 'AllInOne',
    DoseAmount: '', DoseUnit: 'ml',
    EstimatedNitratePpm: '', EstimatedPhosphatePpm: '',
    EstimatedPotassiumPpm: '', EstimatedIronPpm: '',
    IsScheduled: true, IsAdjustment: false, Notes: '',
  });

  // Loads both fertilization logs and fertilizer presets in parallel
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [logsRes, presetsRes] = await Promise.all([
        tanksApi.getFertilization(tankId, { pageSize: 100 }),
        fertilizerPresetsApi.getAll(),
      ]);
      setLogs(logsRes.data || []);
      setPresets(presetsRes.data || []);
    } catch { notifications.show({ title: 'Error', message: 'Failed to load data', color: 'red' }); }
    finally { setLoading(false); }
  }, [tankId]);

  useEffect(() => { loadData(); }, [loadData]);

  // When a preset is selected, auto-fills dose amount, unit, and estimated ppm values
  const handlePresetSelect = (val) => {
    const p = presets.find(pr => pr.Id === parseInt(val));
    if (p) {
      setForm({
        ...form, FertilizerPresetId: val, FertilizerType: p.FertilizerType,
        DoseAmount: p.DefaultDoseAmount, DoseUnit: p.DefaultDoseUnit,
        EstimatedNitratePpm: p.NitratePerDose || '', EstimatedPhosphatePpm: p.PhosphatePerDose || '',
        EstimatedPotassiumPpm: p.PotassiumPerDose || '', EstimatedIronPpm: p.IronPerDose || '',
      });
    } else { setForm({ ...form, FertilizerPresetId: '' }); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        DosedAt: form.DosedAt ? new Date(form.DosedAt).toISOString() : new Date().toISOString(),
        FertilizerPresetId: form.FertilizerPresetId ? parseInt(form.FertilizerPresetId) : null,
        FertilizerType: form.FertilizerType, DoseAmount: parseFloat(form.DoseAmount), DoseUnit: form.DoseUnit,
        EstimatedNitratePpm: form.EstimatedNitratePpm ? parseFloat(form.EstimatedNitratePpm) : null,
        EstimatedPhosphatePpm: form.EstimatedPhosphatePpm ? parseFloat(form.EstimatedPhosphatePpm) : null,
        EstimatedPotassiumPpm: form.EstimatedPotassiumPpm ? parseFloat(form.EstimatedPotassiumPpm) : null,
        EstimatedIronPpm: form.EstimatedIronPpm ? parseFloat(form.EstimatedIronPpm) : null,
        IsScheduled: form.IsScheduled, IsAdjustment: form.IsAdjustment, Notes: form.Notes || null,
      };
      await tanksApi.addFertilization(tankId, data);
      notifications.show({ title: 'Success', message: 'Dose logged', color: 'green' });
      close();
      setForm({ DosedAt: new Date().toISOString().slice(0, 16), FertilizerPresetId: '',
        FertilizerType: 'AllInOne', DoseAmount: '', DoseUnit: 'ml',
        EstimatedNitratePpm: '', EstimatedPhosphatePpm: '', EstimatedPotassiumPpm: '',
        EstimatedIronPpm: '', IsScheduled: true, IsAdjustment: false, Notes: '' });
      loadData();
    } catch (e) {
      notifications.show({ title: 'Error', message: extractErrorMessage(e), color: 'red' });
    }
  };

  const setF = (key, val) => setForm({ ...form, [key]: val });

  const presetOptions = [
    { value: '', label: t('Custom / One-off') },
    ...presets.map(p => ({ value: String(p.Id), label: `${p.Name} (${p.DefaultDoseAmount}${p.DefaultDoseUnit})` })),
  ];

  const rows = logs.slice(0, 50).map(l => (
    <Table.Tr key={l.Id}>
      <Table.Td>{new Date(l.DosedAt).toLocaleDateString()}</Table.Td>
      <Table.Td>{l.FertilizerPresetName || t('Custom')}</Table.Td>
      <Table.Td><Badge variant="light" size="sm" color={l.FertilizerType === 'Macro' ? 'green' : l.FertilizerType === 'Micro' ? 'blue' : 'teal'}>{t(FERTILIZER_TYPE_LABELS[l.FertilizerType] || l.FertilizerType)}</Badge></Table.Td>
      <Table.Td>{l.DoseAmount} {l.DoseUnit}</Table.Td>
      <Table.Td>{[l.EstimatedNitratePpm, l.EstimatedPhosphatePpm, l.EstimatedPotassiumPpm, l.EstimatedIronPpm].some(v => v != null) ? `${l.EstimatedNitratePpm != null ? `NO₃:${l.EstimatedNitratePpm} ` : ''}${l.EstimatedPhosphatePpm != null ? `PO₄:${l.EstimatedPhosphatePpm} ` : ''}${l.EstimatedPotassiumPpm != null ? `K:${l.EstimatedPotassiumPpm} ` : ''}${l.EstimatedIronPpm != null ? `Fe:${l.EstimatedIronPpm}` : ''}` : '—'}</Table.Td>
      <Table.Td>
        {l.IsAdjustment && <Badge size="xs" color="orange">{t('Adjusted')}</Badge>}
        {!l.IsScheduled && !l.IsAdjustment && <Badge size="xs" color="gray">{t('One-off')}</Badge>}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack>
      <Group justify="space-between">
        <Text fw={600}>{t('Fertilization Log')} ({logs.length})</Text>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>{t('Log Dose')}</Button>
      </Group>

      {loading ? <Loader /> : logs.length > 0 ? (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('Date')}</Table.Th><Table.Th>{t('Product')}</Table.Th><Table.Th>{t('Type')}</Table.Th>
              <Table.Th>{t('Dose')}</Table.Th><Table.Th>{t('Est. Nutrients (ppm)')}</Table.Th><Table.Th>{t('Flags')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      ) : <Text c="dimmed" ta="center" py="md">{t('No doses logged yet.')}</Text>}

      <Modal opened={opened} onClose={close} title={t('Log Fertilizer Dose')} size="md">
        <form onSubmit={handleSubmit}>
          <Stack gap="sm">
            <TextInput type="datetime-local" label={t('Date/Time')} value={form.DosedAt} onChange={(e) => setF('DosedAt', e.target.value)} />
            <Select label={t('Fertilizer')} data={presetOptions} value={form.FertilizerPresetId} onChange={handlePresetSelect} searchable placeholder={t('Select or type custom')} />
            <Select label={t('Type')} data={typeOptions} value={form.FertilizerType} onChange={(v) => setF('FertilizerType', v)} />
            <Group grow>
              <NumberInput label={t('Dose Amount')} required min={0} value={form.DoseAmount || ''} onChange={(v) => setF('DoseAmount', v)} decimalScale={2} />
              <Select label={t('Unit')} data={DOSE_UNITS} value={form.DoseUnit} onChange={(v) => setF('DoseUnit', v)} />
            </Group>
            <Text size="sm" fw={600}>{t('Estimated Nutrients Added (ppm)')}</Text>
            <Group grow>
              <NumberInput label={t('NO₃')} value={form.EstimatedNitratePpm || ''} onChange={(v) => setF('EstimatedNitratePpm', v)} decimalScale={3} />
              <NumberInput label={t('PO₄')} value={form.EstimatedPhosphatePpm || ''} onChange={(v) => setF('EstimatedPhosphatePpm', v)} decimalScale={3} />
            </Group>
            <Group grow>
              <NumberInput label={t('K')} value={form.EstimatedPotassiumPpm || ''} onChange={(v) => setF('EstimatedPotassiumPpm', v)} decimalScale={3} />
              <NumberInput label={t('Fe')} value={form.EstimatedIronPpm || ''} onChange={(v) => setF('EstimatedIronPpm', v)} decimalScale={3} />
            </Group>
            <Group grow>
              <Switch label={t('Scheduled dose')} checked={form.IsScheduled} onChange={(e) => setF('IsScheduled', e.currentTarget.checked)} />
              <Switch label={t('One-off adjustment')} checked={form.IsAdjustment} onChange={(e) => setF('IsAdjustment', e.currentTarget.checked)} />
            </Group>
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

export default TankFertilizationTab;
