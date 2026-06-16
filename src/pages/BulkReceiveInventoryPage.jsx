import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Button, Paper, Group, Text, TextInput, NumberInput,
  Select, ActionIcon, Table, Badge, Tooltip
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconPlus, IconTrash, IconCopy, IconDeviceFloppy } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { inventoryLotsApi } from '../api/inventoryLots';
import { suppliersApi } from '../api/suppliers';
import { useSpeciesVariantOptions } from '../hooks/useSpeciesVariantOptions';
import { useTranslation } from 'react-i18next';

let rowIdCounter = 0;
function nextRowId() {
  return ++rowIdCounter;
}

function emptyRow(defaultSupplierId, defaultArrivalDate, defaultNotes) {
  return {
    _key: nextRowId(),
    SpeciesVariantId: null,
    speciesLabel: '',
    SupplierId: defaultSupplierId ?? null,
    ArrivalDate: defaultArrivalDate ?? new Date().toISOString().split('T')[0],
    InitialQuantity: '',
    DeadOnArrival: '',
    UnitCost: '',
    Notes: defaultNotes ?? '',
  };
}

function BulkReceiveInventoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { options: variantOptions } = useSpeciesVariantOptions();
  const [suppliers, setSuppliers] = useState([]);
  const [saving, setSaving] = useState(false);

  const [headerSupplierId, setHeaderSupplierId] = useState(null);
  const [headerArrivalDate, setHeaderArrivalDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [headerNotes, setHeaderNotes] = useState('');

  const [rows, setRows] = useState(() => [
    emptyRow(null, headerArrivalDate, ''),
  ]);

  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  const cellRefs = useRef({});

  const getCellRef = (rowIdx, col) => `${rowIdx}-${col}`;

  useEffect(() => {
    suppliersApi.getAll().then(r => setSuppliers(r.data || [])).catch(() => {});
  }, []);

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, emptyRow(headerSupplierId, headerArrivalDate, headerNotes)]);
  }, [headerSupplierId, headerArrivalDate, headerNotes]);

  const removeRow = useCallback((idx) => {
    setRows((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== idx);
    });
  }, []);

  const duplicateRow = useCallback((idx) => {
    setRows((prev) => {
      const source = prev[idx];
      if (!source) return prev;
      const cloned = { ...source, _key: nextRowId() };
      return [...prev.slice(0, idx + 1), cloned, ...prev.slice(idx + 1)];
    });
  }, []);

  const updateCell = useCallback((idx, field, value) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };

      if (field === 'SpeciesVariantId') {
        const found = variantOptions.find((o) => o.value === value?.toString());
        updated[idx].speciesLabel = found?.label ?? '';
      }

      return updated;
    });
  }, [variantOptions]);

  const focusCell = useCallback((rowIdx, col, select) => {
    const key = getCellRef(rowIdx, col);
    setTimeout(() => {
      const el = cellRefs.current[key];
      if (el) {
        el.focus();
        if (select && el.select) el.select();
      }
    }, 0);
  }, []);

  const handleSubmit = useCallback(async () => {
    const currentRows = rowsRef.current;

    const errors = [];
    if (currentRows.length === 0 || currentRows.every((r) => !r.SpeciesVariantId)) {
      errors.push(t('At least one row with species/variant is required.'));
    }
    currentRows.forEach((row, i) => {
      if (row.SpeciesVariantId && (!row.InitialQuantity || Number(row.InitialQuantity) <= 0)) {
        errors.push(t('Row {row}: Initial quantity must be greater than zero.', { row: i + 1 }));
      }
      if (row.SpeciesVariantId && (!row.UnitCost || Number(row.UnitCost) <= 0)) {
        errors.push(t('Row {row}: Unit cost must be greater than zero.', { row: i + 1 }));
      }
      if (row.SpeciesVariantId && Number(row.DeadOnArrival) < 0) {
        errors.push(t('Row {row}: Dead on arrival must not be negative.', { row: i + 1 }));
      }
      if (
        row.SpeciesVariantId &&
        Number(row.DeadOnArrival) > Number(row.InitialQuantity)
      ) {
        errors.push(
          t('Row {row}: Dead on arrival cannot exceed the initial quantity.', { row: i + 1 })
        );
      }
    });

    if (errors.length > 0) {
      notifications.show({
        title: t('Error'),
        message: errors.join('; '),
        color: 'red',
      });
      return;
    }

    try {
      setSaving(true);
      const items = currentRows
        .filter((r) => r.SpeciesVariantId)
        .map((r) => ({
          SpeciesVariantId: Number(r.SpeciesVariantId),
          SupplierId: r.SupplierId || headerSupplierId || null,
          ArrivalDate: r.ArrivalDate || headerArrivalDate,
          InitialQuantity: Number(r.InitialQuantity) || 0,
          DeadOnArrival: Number(r.DeadOnArrival) || 0,
          UnitCost: Number(r.UnitCost) || 0,
          Notes: r.Notes || undefined,
        }));

      const result = await inventoryLotsApi.createBulk({ Items: items });
      notifications.show({
        title: t('Success'),
        message: t('{count} lots created ({total} units)', { count: result.data.TotalCreated, total: result.data.TotalQuantity }),
        color: 'green',
      });
      setRows([emptyRow(headerSupplierId, headerArrivalDate, headerNotes)]);
    } catch (e) {
      notifications.show({
        title: t('Error'),
        message: e.response?.data?.ErrorMessage || t('Failed to create lots'),
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  }, [t, headerSupplierId, headerArrivalDate, headerNotes]);

  const handleSubmitRef = useRef(handleSubmit);
  handleSubmitRef.current = handleSubmit;

  const handleFieldKeyDown = useCallback(
    (e, rowIdx, field, isLastField) => {
      const currentRows = rowsRef.current;

      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (isLastField) {
          if (rowIdx === currentRows.length - 1) {
            addRow();
            setTimeout(() => focusCell(rowIdx + 1, 'SpeciesVariantId', false), 0);
          } else {
            focusCell(rowIdx + 1, 'SpeciesVariantId', false);
          }
        } else {
          const fieldOrder = [
            'SpeciesVariantId', 'InitialQuantity', 'DeadOnArrival',
            'UnitCost', 'Notes',
          ];
          const currentIdx = fieldOrder.indexOf(field);
          const nextField = fieldOrder[currentIdx + 1];
          if (nextField) focusCell(rowIdx, nextField, true);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmitRef.current();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        duplicateRow(rowIdx);
      }
    },
    [addRow, focusCell, duplicateRow]
  );

  const getFieldRef = useCallback((rowIdx, col) => (el) => {
    cellRefs.current[getCellRef(rowIdx, col)] = el;
  }, []);

  const activeRows = rows.filter((r) => r.SpeciesVariantId).length;

  const supplierOptions = suppliers.map((s) => ({
    value: s.Id.toString(),
    label: s.Name,
  }));

  return (
    <Box>
      <Group justify="space-between" mb="lg">
        <Box>
          <Group gap="sm" mb={4}>
            <ActionIcon
              variant="subtle"
              onClick={() => navigate('/inventory')}
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Text size="xl" fw={700}>{t('Bulk Receive Inventory')}</Text>
          </Group>
          <Text size="sm" c="dimmed">
            {rows.length} {t('rows')} &middot; {activeRows} {t('valid')}
          </Text>
        </Box>
      </Group>

      <Paper p="md" radius="md" withBorder mb="lg">
        <Group grow align="flex-end">
          <Select
            label={t('Default Supplier')}
            placeholder={t('Select supplier')}
            clearable
            searchable
            data={supplierOptions}
            value={headerSupplierId?.toString() || null}
            onChange={(v) => setHeaderSupplierId(v ? Number(v) : null)}
          />
          <TextInput
            label={t('Default Arrival Date')}
            type="date"
            value={headerArrivalDate}
            onChange={(e) => setHeaderArrivalDate(e.target.value)}
          />
          <TextInput
            label={t('Global Notes')}
            placeholder={t('Applied to new rows')}
            value={headerNotes}
            onChange={(e) => setHeaderNotes(e.target.value)}
          />
        </Group>
      </Paper>

      <Paper p={0} radius="md" withBorder mb="lg" style={{ overflowX: 'auto' }}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ minWidth: 240 }}>{t('Species — Variant')}</Table.Th>
              <Table.Th style={{ minWidth: 100 }}>{t('Qty')}</Table.Th>
              <Table.Th style={{ minWidth: 80 }}>{t('DOA')}</Table.Th>
              <Table.Th style={{ minWidth: 110 }}>{t('Unit Cost')}</Table.Th>
              <Table.Th style={{ minWidth: 160 }}>{t('Notes')}</Table.Th>
              <Table.Th style={{ minWidth: 90 }}>{t('Actions')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((row, idx) => (
              <Table.Tr key={row._key}>
                <Table.Td>
                  <Select
                    placeholder={t('Search species...')}
                    searchable
                    clearable
                    data={variantOptions}
                    value={row.SpeciesVariantId?.toString() || null}
                    onChange={(value) =>
                      updateCell(idx, 'SpeciesVariantId', value ? Number(value) : null)
                    }
                    onKeyDown={(e) => handleFieldKeyDown(e, idx, 'SpeciesVariantId', false)}
                    ref={getFieldRef(idx, 'SpeciesVariantId')}
                    styles={{ input: { border: 'none', background: 'transparent' } }}
                  />
                </Table.Td>
                <Table.Td>
                  <NumberInput
                    min={0}
                    hideControls
                    value={row.InitialQuantity}
                    onChange={(value) => updateCell(idx, 'InitialQuantity', value)}
                    onKeyDown={(e) => handleFieldKeyDown(e, idx, 'InitialQuantity', false)}
                    ref={getFieldRef(idx, 'InitialQuantity')}
                    styles={{ input: { border: 'none', background: 'transparent' } }}
                  />
                </Table.Td>
                <Table.Td>
                  <NumberInput
                    min={0}
                    hideControls
                    value={row.DeadOnArrival}
                    onChange={(value) => updateCell(idx, 'DeadOnArrival', value)}
                    onKeyDown={(e) => handleFieldKeyDown(e, idx, 'DeadOnArrival', false)}
                    ref={getFieldRef(idx, 'DeadOnArrival')}
                    styles={{ input: { border: 'none', background: 'transparent' } }}
                  />
                </Table.Td>
                <Table.Td>
                  <NumberInput
                    min={0}
                    decimalScale={2}
                    step={0.01}
                    hideControls
                    value={row.UnitCost}
                    onChange={(value) => updateCell(idx, 'UnitCost', value)}
                    onKeyDown={(e) => handleFieldKeyDown(e, idx, 'UnitCost', false)}
                    ref={getFieldRef(idx, 'UnitCost')}
                    styles={{ input: { border: 'none', background: 'transparent' } }}
                  />
                </Table.Td>
                <Table.Td>
                  <TextInput
                    value={row.Notes || ''}
                    onChange={(e) => updateCell(idx, 'Notes', e.target.value)}
                    onKeyDown={(e) => handleFieldKeyDown(e, idx, 'Notes', true)}
                    ref={getFieldRef(idx, 'Notes')}
                    styles={{ input: { border: 'none', background: 'transparent' } }}
                  />
                </Table.Td>
                <Table.Td>
                  <Group gap={4} wrap="nowrap">
                    <Tooltip label={t('Duplicate row (Ctrl+D)')}>
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => duplicateRow(idx)}
                      >
                        <IconCopy size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label={t('Remove row')}>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => removeRow(idx)}
                        disabled={rows.length <= 1}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      <Group justify="space-between">
        <Group gap="sm">
          <Button
            variant="outline"
            leftSection={<IconPlus size={16} />}
            onClick={addRow}
          >
            {t('Add Row')}
          </Button>
          <Badge size="lg" variant="light">
            {rows.length} {t('rows')}
          </Badge>
          {activeRows > 0 && (
            <Badge size="lg" variant="light" color="teal">
              {activeRows} {t('valid')}
            </Badge>
          )}
        </Group>
        <Group gap="sm">
          <Text size="xs" c="dimmed">
            {t('Ctrl+Enter to submit')}
          </Text>
          <Button
            leftSection={<IconDeviceFloppy size={16} />}
            onClick={handleSubmit}
            loading={saving}
            color="teal"
            size="md"
          >
            {t('Create All Lots')}
          </Button>
        </Group>
      </Group>
    </Box>
  );
}

export default BulkReceiveInventoryPage;
