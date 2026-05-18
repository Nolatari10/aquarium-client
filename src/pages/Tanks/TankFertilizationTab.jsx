import { useState, useEffect } from 'react';
import { Button, Group, Stack, Text, Table, Modal, Select, NumberInput, Textarea, Badge, Switch, Loader, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus } from '@tabler/icons-react';
import { tanksApi } from '../../api/tanks';
import { fertilizerPresetsApi } from '../../api/fertilizerPresets';
import { extractErrorMessage } from '../../tools/errorUtils';

const FERTILIZER_TYPE_LABELS = {
  Macro: 'Macro', Micro: 'Micro', AllInOne: 'All-in-One',
  Iron: 'Iron', Potassium: 'Potassium', Other: 'Other',
};
const DOSE_UNITS = ['ml', 'grams', 'pumps', 'drops', 'tsp'];

// Logs fertilizer doses with product preset selection, estimated ppm additions,
// and flags for scheduled vs one-off adjustments.
function TankFertilizationTab({ tankId }) {
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
  const loadData = async () => {
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
  };

  useEffect(() => { loadData(); }, [tankId]);

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
    { value: '', label: 'Custom / One-off' },
    ...presets.map(p => ({ value: String(p.Id), label: `${p.Name} (${p.DefaultDoseAmount}${p.DefaultDoseUnit})` })),
  ];

  const rows = logs.slice(0, 50).map(l => (
    <Table.Tr key={l.Id}>
      <Table.Td>{new Date(l.DosedAt).toLocaleDateString()}</Table.Td>
      <Table.Td>{l.FertilizerPresetName || 'Custom'}</Table.Td>
      <Table.Td><Badge variant="light" size="sm" color={l.FertilizerType === 'Macro' ? 'green' : l.FertilizerType === 'Micro' ? 'blue' : 'teal'}>{FERTILIZER_TYPE_LABELS[l.FertilizerType] || l.FertilizerType}</Badge></Table.Td>
      <Table.Td>{l.DoseAmount} {l.DoseUnit}</Table.Td>
      <Table.Td>{[l.EstimatedNitratePpm, l.EstimatedPhosphatePpm, l.EstimatedPotassiumPpm, l.EstimatedIronPpm].some(v => v != null) ? `${l.EstimatedNitratePpm != null ? `NO₃:${l.EstimatedNitratePpm} ` : ''}${l.EstimatedPhosphatePpm != null ? `PO₄:${l.EstimatedPhosphatePpm} ` : ''}${l.EstimatedPotassiumPpm != null ? `K:${l.EstimatedPotassiumPpm} ` : ''}${l.EstimatedIronPpm != null ? `Fe:${l.EstimatedIronPpm}` : ''}` : '—'}</Table.Td>
      <Table.Td>
        {l.IsAdjustment && <Badge size="xs" color="orange">Adjusted</Badge>}
        {!l.IsScheduled && !l.IsAdjustment && <Badge size="xs" color="gray">One-off</Badge>}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack>
      <Group justify="space-between">
        <Text fw={600}>Fertilization Log ({logs.length})</Text>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>Log Dose</Button>
      </Group>

      {loading ? <Loader /> : logs.length > 0 ? (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Date</Table.Th><Table.Th>Product</Table.Th><Table.Th>Type</Table.Th>
              <Table.Th>Dose</Table.Th><Table.Th>Est. Nutrients (ppm)</Table.Th><Table.Th>Flags</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      ) : <Text c="dimmed" ta="center" py="md">No doses logged yet.</Text>}

      <Modal opened={opened} onClose={close} title="Log Fertilizer Dose" size="md">
        <form onSubmit={handleSubmit}>
          <Stack gap="sm">
            <TextInput type="datetime-local" label="Date/Time" value={form.DosedAt} onChange={(e) => setF('DosedAt', e.target.value)} />
            <Select label="Fertilizer" data={presetOptions} value={form.FertilizerPresetId} onChange={handlePresetSelect} searchable placeholder="Select or type custom" />
            <Select label="Type" data={Object.entries(FERTILIZER_TYPE_LABELS).map(([k, v]) => ({ value: k, label: v }))} value={form.FertilizerType} onChange={(v) => setF('FertilizerType', v)} />
            <Group grow>
              <NumberInput label="Dose Amount" required min={0} value={form.DoseAmount || ''} onChange={(v) => setF('DoseAmount', v)} decimalScale={2} />
              <Select label="Unit" data={DOSE_UNITS} value={form.DoseUnit} onChange={(v) => setF('DoseUnit', v)} />
            </Group>
            <Text size="sm" fw={600}>Estimated Nutrients Added (ppm)</Text>
            <Group grow>
              <NumberInput label="NO₃" value={form.EstimatedNitratePpm || ''} onChange={(v) => setF('EstimatedNitratePpm', v)} decimalScale={3} />
              <NumberInput label="PO₄" value={form.EstimatedPhosphatePpm || ''} onChange={(v) => setF('EstimatedPhosphatePpm', v)} decimalScale={3} />
            </Group>
            <Group grow>
              <NumberInput label="K" value={form.EstimatedPotassiumPpm || ''} onChange={(v) => setF('EstimatedPotassiumPpm', v)} decimalScale={3} />
              <NumberInput label="Fe" value={form.EstimatedIronPpm || ''} onChange={(v) => setF('EstimatedIronPpm', v)} decimalScale={3} />
            </Group>
            <Group grow>
              <Switch label="Scheduled dose" checked={form.IsScheduled} onChange={(e) => setF('IsScheduled', e.currentTarget.checked)} />
              <Switch label="One-off adjustment" checked={form.IsAdjustment} onChange={(e) => setF('IsAdjustment', e.currentTarget.checked)} />
            </Group>
            <Textarea label="Notes" value={form.Notes} onChange={(e) => setF('Notes', e.target.value)} />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={close}>Cancel</Button>
              <Button type="submit">Save</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}

export default TankFertilizationTab;
