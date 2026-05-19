import { useState, useEffect } from 'react';
import {
  Button, Table, Modal, TextInput, Select, Textarea, Group, Text,
  ActionIcon, Box, Badge, Tabs, NumberInput, Stack, Paper, Pagination, Loader
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconAlertTriangle, IconSearch } from '@tabler/icons-react';
import { inventoryLotsApi } from '../api/inventoryLots';
import { speciesApi } from '../api/species';
import { speciesVariantsApi } from '../api/speciesVariantsApi';
import { suppliersApi } from '../api/suppliers';
import { useTranslation } from 'react-i18next';

function InventoryLotsPage() {
  const [lots, setLots] = useState([]);
  const [variantOptions, setVariantOptions] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [mortalityOpened, { open: openMortality, close: closeMortality }] = useDisclosure(false);
  const [selectedLot, setSelectedLot] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [listLoading, setListLoading] = useState(false);
  const pageSize = 20;
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    SpeciesVariantId: null,
    SupplierId: null,
    ArrivalDate: new Date().toISOString().split('T')[0],
    InitialQuantity: '',
    DeadOnArrival: '',
    UnitCost: '',
    Notes: ''
  });

  const [mortalityData, setMortalityData] = useState({
    Date: new Date().toISOString().split('T')[0],
    Quantity: '',
    Cause: 'Disease',
    Notes: ''
  });

  useEffect(() => {
    loadDropdowns();
    loadLots(1);
  }, []);

  useEffect(() => { loadLots(page); }, [page]);

  const loadDropdowns = async () => {
    try {
      const [speciesResult, suppliersResult] = await Promise.allSettled([
        speciesApi.getAll(1, 1000),
        suppliersApi.getAll(),
      ]);
      if (speciesResult.status === 'fulfilled') {
        const speciesList = speciesResult.value.data.Items || [];

        // Load all variants for all species in parallel
        const variantPromises = speciesList.map(s =>
          speciesVariantsApi.getBySpeciesId(s.Id)
            .then(r => r.data || [])
            .catch(() => [])
        );
        const allVariantArrays = await Promise.allSettled(variantPromises);

        // Build combined dropdown: CommonName — VariantName → SpeciesVariantId
        const combined = [];
        speciesList.forEach((s, i) => {
          const vars = allVariantArrays[i]?.status === 'fulfilled' ? allVariantArrays[i].value : [];
          vars.forEach(v => {
            combined.push({
              value: v.Id.toString(),
              label: `${s.CommonName} — ${v.VariantName}`
            });
          });
        });
        setVariantOptions(combined);
      }
      if (suppliersResult.status === 'fulfilled') setSuppliers(suppliersResult.value.data);
    } catch { /* ignore */ }
  };

  const loadLots = async (p) => {
    try {
      setListLoading(true);
      const result = await inventoryLotsApi.getAll(p, pageSize);
      const data = result.data;
      setLots(data.Items || []);
      setTotalPages(data.TotalPages || 1);
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to load data', color: 'red' });
    } finally {
      setListLoading(false);
    }
  };

  const refreshLots = () => { setPage(1); loadLots(1); };

  const handleSubmit = async () => {
    if (!formData.SpeciesVariantId) {
      notifications.show({ title: 'Error', message: 'Please select a species variant.', color: 'red' });
      return;
    }
    try {
      setLoading(true);
      await inventoryLotsApi.create({
        ...formData,
        InitialQuantity: formData.InitialQuantity === '' ? 0 : parseInt(formData.InitialQuantity),
        DeadOnArrival: formData.DeadOnArrival === '' ? 0 : parseInt(formData.DeadOnArrival),
        UnitCost: formData.UnitCost === '' ? 0 : parseFloat(formData.UnitCost),
      });
      notifications.show({ title: 'Success', message: 'Lot created', color: 'green' });
      setActiveTab('list');
      resetForm();
      refreshLots();
    } catch (e) {
      notifications.show({
        title: 'Error',
        message: e.response?.data?.ErrorMessage || 'Failed to create lot',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterMortality = async () => {
    if (!selectedLot) return;
    try {
      setLoading(true);
      await inventoryLotsApi.registerMortality({
        InventoryLotId: selectedLot.Id,
        ...mortalityData,
        Quantity: mortalityData.Quantity === '' ? 0 : parseInt(mortalityData.Quantity),
      });
      notifications.show({ title: 'Success', message: 'Mortality registered', color: 'green' });
      closeMortality();
      setMortalityData({ Date: new Date().toISOString().split('T')[0], Quantity: '', Cause: 'Disease', Notes: '' });
      refreshLots();
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to register mortality',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      SpeciesVariantId: null,
      SupplierId: null,
      ArrivalDate: new Date().toISOString().split('T')[0],
      InitialQuantity: '',
      DeadOnArrival: '',
      UnitCost: '',
      Notes: ''
    });
  };

  const handleOpenMortality = (lot) => {
    setSelectedLot(lot);
    openMortality();
  };

  const getStockStatus = (lot) => {
    const stock = lot.CurrentStock || 0;
    if (stock === 0) return { label: t('Empty'), color: 'red' };
    if (stock < 10) return { label: t('Low'), color: 'yellow' };
    return { label: t('Available'), color: 'green' };
  };

  const supplierMap = {};
  suppliers.forEach(s => supplierMap[s.Id] = s.Name);

  const displayName = (lot) => {
    if (lot.VariantName && lot.VariantName !== 'Standard') {
      return `${lot.SpeciesCommonName} — ${lot.VariantName}`;
    }
    return lot.SpeciesCommonName || lot.SpeciesName || 'Unknown';
  };

  const filteredLots = lots.filter(lot =>
    !search ||
    (lot.SpeciesCommonName || '').toLowerCase().includes(search.toLowerCase()) ||
    (lot.VariantName || '').toLowerCase().includes(search.toLowerCase()) ||
    (lot.SpeciesName || '').toLowerCase().includes(search.toLowerCase()) ||
    (supplierMap[lot.SupplierId] || '').toLowerCase().includes(search.toLowerCase())
  );

  const rows = filteredLots.map((item) => {
    const status = getStockStatus(item);
    return (
      <Table.Tr key={item.Id}>
        <Table.Td fw={500}>
          {displayName(item)}
        </Table.Td>
        <Table.Td>{supplierMap[item.SupplierId] || 'N/A'}</Table.Td>
        <Table.Td>{new Date(item.ArrivalDate).toLocaleDateString()}</Table.Td>
        <Table.Td>{item.InitialQuantity}</Table.Td>
        <Table.Td>{item.CurrentStock || 0}</Table.Td>
        <Table.Td><Badge color={status.color}>{status.label}</Badge></Table.Td>
        <Table.Td>
          <ActionIcon variant="subtle" color="orange" onClick={() => handleOpenMortality(item)}>
            <IconAlertTriangle size={18} />
          </ActionIcon>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Box>
      <Group justify="space-between" mb="lg">
        <Box>
          <Text size="xl" fw={700}>{t('Inventory')}</Text>
          <Text size="sm" c="dimmed">{filteredLots.length} {t('lots tracked')}</Text>
        </Box>
        <Button leftSection={<IconPlus size={16} />} onClick={() => setActiveTab('create')}>
          {t('Create Lot')}
        </Button>
      </Group>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List mb="md">
          <Tabs.Tab value="list">{t('Inventory Lots')}</Tabs.Tab>
          <Tabs.Tab value="create">{t('Create Lot')}</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="list">
          <TextInput
            placeholder={t('Search lots...')}
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            mb="lg"
            style={{ maxWidth: 320 }}
          />

          {listLoading ? (
            <Stack align="center" py="xl"><Loader /></Stack>
          ) : (
            <>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t('Species')}</Table.Th>
                    <Table.Th>{t('Supplier')}</Table.Th>
                    <Table.Th>{t('Arrival Date')}</Table.Th>
                    <Table.Th>{t('Initial Qty')}</Table.Th>
                    <Table.Th>{t('Current Stock')}</Table.Th>
                    <Table.Th>{t('Status')}</Table.Th>
                    <Table.Th>{t('Actions')}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
              </Table>
              <Group justify="center" mt="md">
                <Pagination total={totalPages} value={page} onChange={(p) => setPage(p)} />
              </Group>
            </>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="create">
          <Paper p="lg" radius="md" withBorder style={{ maxWidth: 600 }}>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              <Stack gap="sm">
                <Select
                  label="Species — Variant"
                  placeholder="Select species and variant"
                  required
                  searchable
                  data={variantOptions}
                  value={formData.SpeciesVariantId?.toString() || null}
                  onChange={(value) => setFormData({ ...formData, SpeciesVariantId: value ? parseInt(value) : null })}
                />
                <Select
                  label="Supplier"
                  clearable
                  data={suppliers.map(s => ({ value: s.Id.toString(), label: s.Name }))}
                  value={formData.SupplierId?.toString() || ''}
                  onChange={(value) => setFormData({ ...formData, SupplierId: value ? parseInt(value) : null })}
                />
                <TextInput
                  label="Arrival Date"
                  type="date"
                  required
                  value={formData.ArrivalDate}
                  onChange={(e) => setFormData({ ...formData, ArrivalDate: e.target.value })}
                />
                <Group grow>
                  <NumberInput
                    label="Initial Quantity"
                    required
                    min={0}
                    value={formData.InitialQuantity}
                    onChange={(value) => setFormData({ ...formData, InitialQuantity: value })}
                  />
                  <NumberInput
                    label="Dead on Arrival"
                    min={0}
                    value={formData.DeadOnArrival}
                    onChange={(value) => setFormData({ ...formData, DeadOnArrival: value })}
                  />
                </Group>
                <NumberInput
                  label="Unit Cost"
                  required
                  min={0}
                  step={0.01}
                  value={formData.UnitCost}
                  onChange={(value) => setFormData({ ...formData, UnitCost: value })}
                />
                <Textarea
                  label="Notes"
                  value={formData.Notes}
                  onChange={(e) => setFormData({ ...formData, Notes: e.target.value })}
                />
                <Button type="submit" loading={loading}>Create Lot</Button>
              </Stack>
            </form>
          </Paper>
        </Tabs.Panel>
      </Tabs>

      <Modal opened={mortalityOpened} onClose={closeMortality} title="Register Mortality">
        {selectedLot && (
          <form onSubmit={(e) => { e.preventDefault(); handleRegisterMortality(); }}>
            <Stack gap="sm">
              <Text size="sm">Lot: {displayName(selectedLot)} (Stock: {selectedLot.CurrentStock || 0})</Text>
              <TextInput
                label="Date"
                type="date"
                required
                value={mortalityData.Date}
                onChange={(e) => setMortalityData({ ...mortalityData, Date: e.target.value })}
              />
              <NumberInput
                label="Quantity"
                required
                min={1}
                max={selectedLot.CurrentStock || 0}
                value={mortalityData.Quantity}
                onChange={(value) => setMortalityData({ ...mortalityData, Quantity: value })}
              />
              <Select
                label="Cause"
                value={mortalityData.Cause}
                onChange={(value) => setMortalityData({ ...mortalityData, Cause: value })}
                data={['Disease', 'Water Quality', 'Transport', 'Aggression', 'Unknown', 'Old Age']}
              />
              <Textarea
                label="Notes"
                value={mortalityData.Notes}
                onChange={(e) => setMortalityData({ ...mortalityData, Notes: e.target.value })}
              />
              <Group justify="flex-end" mt="md">
                <Button variant="default" onClick={closeMortality}>Cancel</Button>
                <Button type="submit" loading={loading}>Register</Button>
              </Group>
            </Stack>
          </form>
        )}
      </Modal>
    </Box>
  );
}

export default InventoryLotsPage;
