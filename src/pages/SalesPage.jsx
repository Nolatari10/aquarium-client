import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Button, Table, Modal, TextInput, Select, NumberInput, Group, Text,
  Box, Card, Badge, ActionIcon, Stack, Paper, Pagination, Loader, Tooltip
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconPlus, IconTrash, IconSearch, IconShoppingCart, IconCash, IconAlertTriangle
} from '@tabler/icons-react';
import { salesApi } from '../api/sales';
import { catalogApi } from '../api/catalog';
import { useTranslation } from 'react-i18next';
import { PageHero, StatusBadge, SectionCard } from '../components/ui';

let itemIdCounter = 0;
function nextItemId() { return ++itemIdCounter; }

function emptyItem() {
  return {
    _key: nextItemId(),
    SpeciesId: null,
    SpeciesVariantId: null,
    Quantity: 1,
    UnitPrice: '',
  };
}

function SalesPage() {
  const { t } = useTranslation();

  const [sales, setSales] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [saving, setSaving] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;
  const [search, setSearch] = useState('');
  const [opened, { open, close }] = useDisclosure(false);
  const [fieldErrors, setFieldErrors] = useState([]);

  const [saleData, setSaleData] = useState({
    CustomerName: '',
    Date: new Date().toISOString().split('T')[0],
  });
  const [items, setItems] = useState([emptyItem()]);

  const cellRefs = useRef({});
  const getCellRef = (rowIdx, col) => `${rowIdx}-${col}`;

  const loadCatalog = useCallback(async () => {
    try {
      const res = await catalogApi.getAll(1, 1000);
      setCatalog(res.data?.Items || []);
    } catch { /* ignore */ }
  }, []);

  const loadSales = useCallback(async (p) => {
    try {
      setListLoading(true);
      const res = await salesApi.getAll(p, pageSize);
      const data = res.data;
      setSales(data.Items || []);
      setTotalPages(data.TotalPages || 1);
    } catch {
      notifications.show({ title: 'Error', message: t('Failed to load data'), color: 'red' });
    } finally {
      setListLoading(false);
    }
  }, [pageSize, t]);

  useEffect(() => {
    loadCatalog();
    loadSales(1);
  }, [loadCatalog, loadSales]);

  useEffect(() => { loadSales(page); }, [page, loadSales]);

  const refreshSales = () => { setPage(1); loadSales(1); };

  // ── Catalog lookup maps ──
  const catalogByVariant = {};
  catalog.forEach(c => {
    catalogByVariant[c.SpeciesVariantId] = c;
  });

  const variantOptions = catalog.map(c => {
    const label = c.VariantName && c.VariantName !== 'Standard'
      ? `${c.CommonName} (${c.VariantName})`
      : c.CommonName;
    const stock = c.TotalStock || 0;
    return {
      value: c.SpeciesVariantId.toString(),
      label: `${label}  ·  ${stock > 0 ? `Stock: ${stock}` : 'Out of stock'}`,
    };
  });

  // ── Item editing ──
  const updateItem = (idx, field, value) => {
    setItems(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };

      if (field === 'SpeciesVariantId') {
        const catEntry = catalogByVariant[value];
        updated[idx].SpeciesId = catEntry?.SpeciesId || null;
      }

      return updated;
    });
  };

  const addItem = () => setItems(prev => [...prev, emptyItem()]);

  const removeItem = (idx) => {
    setItems(prev => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== idx);
    });
  };

  const focusCell = (rowIdx, col) => {
    setTimeout(() => {
      const el = cellRefs.current[getCellRef(rowIdx, col)];
      if (el) el.focus();
    }, 0);
  };

  const getFieldRef = (rowIdx, col) => (el) => {
    cellRefs.current[getCellRef(rowIdx, col)] = el;
  };

  const handleFieldKeyDown = (e, rowIdx, field) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const order = ['SpeciesVariantId', 'Quantity', 'UnitPrice'];
      const currentIdx = order.indexOf(field);
      const nextField = order[currentIdx + 1];
      if (nextField) {
        focusCell(rowIdx, nextField);
      } else if (rowIdx === items.length - 1) {
        addItem();
        setTimeout(() => focusCell(rowIdx + 1, 'SpeciesVariantId'), 0);
      } else {
        focusCell(rowIdx + 1, 'SpeciesVariantId');
      }
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  // ── Validation ──
  const validate = () => {
    const errors = [];
    const validItems = items.filter(i => i.SpeciesVariantId);
    if (!saleData.CustomerName?.trim()) {
      errors.push(t('Customer name is required'));
    }
    if (!saleData.Date) {
      errors.push(t('Date is required'));
    }
    if (validItems.length === 0) {
      errors.push(t('Add at least one item'));
    }
    validItems.forEach((item, i) => {
      const label = variantOptions.find(o => o.value === item.SpeciesVariantId?.toString())?.label || `Item ${i + 1}`;
      if (!item.Quantity || Number(item.Quantity) <= 0) {
        errors.push(`${label}: ${t('Quantity must be at least 1')}`);
      }
      if (item.UnitPrice === '' || Number(item.UnitPrice) < 0) {
        errors.push(`${label}: ${t('Invalid unit price')}`);
      }
    });
    return errors;
  };

  // ── Submit ──
  const handleSubmit = async () => {
    const errors = validate();
    if (errors.length > 0) {
      setFieldErrors(errors);
      notifications.show({
        title: t('Validation Error'),
        message: errors.slice(0, 3).join('; ') + (errors.length > 3 ? '...' : ''),
        color: 'red',
      });
      return;
    }
    setFieldErrors([]);

    try {
      setSaving(true);
      const payload = {
        CustomerName: saleData.CustomerName,
        Date: saleData.Date,
        Items: items
          .filter(i => i.SpeciesVariantId)
          .map(i => ({
            SpeciesId: Number(i.SpeciesId),
            SpeciesVariantId: i.SpeciesVariantId ? Number(i.SpeciesVariantId) : null,
            Quantity: Number(i.Quantity),
            UnitPrice: Number(i.UnitPrice) || 0,
          })),
      };

      const result = await salesApi.create(payload);
      const total = result.data?.TotalAmount || 0;
      const itemCount = result.data?.Items?.length || payload.Items.length;
      notifications.show({
        title: t('Success'),
        message: `${t('Sale created')} — $${total.toFixed(2)} (${itemCount} ${t('items')})`,
        color: 'green',
      });
      close();
      resetForm();
      refreshSales();
    } catch (e) {
      notifications.show({
        title: t('Error'),
        message: e.response?.data?.ErrorMessage || e.response?.data || t('Failed to create sale'),
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSaleData({ CustomerName: '', Date: new Date().toISOString().split('T')[0] });
    setItems([emptyItem()]);
    setFieldErrors([]);
  };

  // ── Derived data ──
  const activeItems = items.filter(i => i.SpeciesVariantId);
  const totalAmount = activeItems.reduce(
    (sum, item) => sum + (Number(item.Quantity) || 0) * (Number(item.UnitPrice) || 0), 0
  );

  const filteredSales = sales.filter(s =>
    !search || s.CustomerName?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Sales list rows ──
  const rows = filteredSales.map(sale => {
    const total = sale.Items?.reduce((sum, item) => sum + (item.Quantity * item.UnitPrice), 0) || 0;
    return (
      <Table.Tr key={sale.Id}>
        <Table.Td>{new Date(sale.Date).toLocaleDateString()}</Table.Td>
        <Table.Td fw={500}>{sale.CustomerName}</Table.Td>
        <Table.Td>{sale.Items?.length || 0} {t('items')}</Table.Td>
        <Table.Td>
          <StatusBadge status="ok" label={`$${total.toFixed(2)}`} />
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Box>
      <PageHero
        title={t('Sales')}
        description={`${filteredSales.length} ${t('transactions recorded')}`}
        action={
          <Button leftSection={<IconPlus size={16} />} onClick={open} color="aqua">
            {t('New Sale')}
          </Button>
        }
      />

      <TextInput
        placeholder={t('Search by customer...')}
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        mb="lg"
        style={{ maxWidth: 320 }}
      />

      {listLoading ? (
        <Stack align="center" py="xl"><Loader color="aqua" /></Stack>
      ) : filteredSales.length > 0 ? (
        <SectionCard>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('Date')}</Table.Th>
                <Table.Th>{t('Customer')}</Table.Th>
                <Table.Th>{t('Items')}</Table.Th>
                <Table.Th>{t('Total')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
          {totalPages > 1 && (
            <Group justify="center" mt="md">
              <Pagination total={totalPages} value={page} onChange={(p) => setPage(p)} />
            </Group>
          )}
        </SectionCard>
      ) : (
        <Paper p="xl" radius="md" ta="center" style={{ border: '1px solid var(--aqua-scheme-border)' }}>
          <Stack align="center" gap="md">
            <IconShoppingCart size={40} stroke={1.5} style={{ color: 'var(--aqua-scheme-text-faint)' }} />
            <Box>
              <Text fw={500}>{t('No sales found')}</Text>
              <Text size="sm" c="dimmed">{t('Record your first sale to start tracking revenue')}</Text>
            </Box>
            <Button variant="light" color="aqua" onClick={open}>{t('Record your first sale')}</Button>
          </Stack>
        </Paper>
      )}

      <Modal opened={opened} onClose={close} title={t('Create Sale')} size="xl">
        <Stack gap="md">
          {/* Sale-level fields */}
          <Group grow>
            <TextInput
              label={t('Customer Name')}
              required
              value={saleData.CustomerName}
              onChange={(e) => setSaleData({ ...saleData, CustomerName: e.target.value })}
              error={fieldErrors.includes(t('Customer name is required')) || undefined}
            />
            <TextInput
              label={t('Date')}
              type="date"
              required
              value={saleData.Date}
              onChange={(e) => setSaleData({ ...saleData, Date: e.target.value })}
            />
          </Group>

          {/* Items header */}
          <Group justify="space-between" mt="sm">
            <Text fw={600} size="sm">{t('Sale Items')} ({activeItems.length})</Text>
            <Text size="xs" c="dimmed">{t('Enter to add row')}</Text>
          </Group>

          {/* Editable items table */}
          <Paper p={0} radius="md" style={{ border: '1px solid var(--aqua-scheme-border)', overflowX: 'auto' }}>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ minWidth: 220 }}>{t('Species')}</Table.Th>
                  <Table.Th style={{ minWidth: 80 }}>{t('Qty')}</Table.Th>
                  <Table.Th style={{ minWidth: 100 }}>{t('Unit Price')}</Table.Th>
                  <Table.Th style={{ minWidth: 90 }}>{t('Subtotal')}</Table.Th>
                  <Table.Th style={{ minWidth: 50 }}></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {items.map((item, idx) => {
                  const catEntry = item.SpeciesVariantId ? catalogByVariant[Number(item.SpeciesVariantId)] : null;
                  const stock = catEntry?.TotalStock || 0;
                  const subtotal = (Number(item.Quantity) || 0) * (Number(item.UnitPrice) || 0);
                  const isLowStock = item.SpeciesVariantId && stock < (Number(item.Quantity) || 0);

                  return (
                    <Table.Tr key={item._key}>
                      <Table.Td>
                        <Select
                          placeholder={t('Search species...')}
                          searchable
                          clearable
                          data={variantOptions}
                          value={item.SpeciesVariantId?.toString() || null}
                          onChange={(value) => updateItem(idx, 'SpeciesVariantId', value ? Number(value) : null)}
                          onKeyDown={(e) => handleFieldKeyDown(e, idx, 'SpeciesVariantId')}
                          ref={getFieldRef(idx, 'SpeciesVariantId')}
                          styles={{ input: { border: 'none', background: 'transparent' } }}
                        />
                      </Table.Td>
                      <Table.Td>
                        <NumberInput
                          min={1}
                          hideControls
                          value={item.Quantity}
                          onChange={(value) => updateItem(idx, 'Quantity', value)}
                          onKeyDown={(e) => handleFieldKeyDown(e, idx, 'Quantity')}
                          ref={getFieldRef(idx, 'Quantity')}
                          error={isLowStock ? '!' : undefined}
                          styles={{ input: { border: 'none', background: 'transparent' } }}
                        />
                      </Table.Td>
                      <Table.Td>
                        <NumberInput
                          min={0}
                          decimalScale={2}
                          step={0.01}
                          hideControls
                          value={item.UnitPrice}
                          onChange={(value) => updateItem(idx, 'UnitPrice', value)}
                          onKeyDown={(e) => handleFieldKeyDown(e, idx, 'UnitPrice')}
                          ref={getFieldRef(idx, 'UnitPrice')}
                          styles={{ input: { border: 'none', background: 'transparent' } }}
                        />
                      </Table.Td>
                      <Table.Td>
                        <Group gap={4}>
                          <Text size="sm" fw={600} c={isLowStock ? 'red.5' : undefined}>
                            ${subtotal.toFixed(2)}
                          </Text>
                          {isLowStock && (
                            <Tooltip label={`${t('Only')} ${stock} ${t('in stock')}`}>
                              <IconAlertTriangle size={14} style={{ color: 'var(--aqua-warning)' }} />
                            </Tooltip>
                          )}
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => removeItem(idx)}
                          disabled={items.filter(i => i.SpeciesVariantId).length <= 1 && item.SpeciesVariantId}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Paper>

          <Button
            variant="light"
            size="xs"
            leftSection={<IconPlus size={14} />}
            onClick={addItem}
          >
            {t('Add Row')}
          </Button>

          {/* Total summary */}
          {activeItems.length > 0 && (
            <Paper
              p="md"
              radius="md"
              style={{
                background: 'var(--aqua-scheme-surface2)',
                border: '1px solid var(--aqua-scheme-border)',
              }}
            >
              <Group justify="space-between" align="center">
                <Box>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>{t('Total')}</Text>
                  <Text size="xs" c="dimmed">{activeItems.length} {t('items')}</Text>
                </Box>
                <Text size="xl" fw={700} style={{ color: 'var(--aqua-accent)' }}>
                  ${totalAmount.toFixed(2)}
                </Text>
              </Group>
            </Paper>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={close}>{t('Cancel')}</Button>
            <Button onClick={handleSubmit} loading={saving} color="aqua" leftSection={<IconCash size={16} />}>
              {t('Create Sale')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}

export default SalesPage;
