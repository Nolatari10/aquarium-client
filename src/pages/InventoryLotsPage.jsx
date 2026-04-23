import { useState, useEffect } from 'react';
import {
  Button, Table, Modal, TextInput, Select, Textarea, Group, Text,
  ActionIcon, Box, Badge, Tabs, NumberInput, Stack, Paper
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconAlertTriangle, IconSearch } from '@tabler/icons-react';
import { inventoryLotsApi } from '../api/inventoryLots';
import { speciesApi } from '../api/species';
import { suppliersApi } from '../api/suppliers';
import { useTranslation } from 'react-i18next';
function InventoryLotsPage() {
  const [lots, setLots] = useState([]);
  const [species, setSpecies] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [, { open, close }] = useDisclosure(false);
  const [mortalityOpened, { open: openMortality, close: closeMortality }] = useDisclosure(false);
  const [selectedLot, setSelectedLot] = useState(null);
  const {t, i18n} = useTranslation();
  const [formData, setFormData] = useState({
    SpeciesId: null,
    SupplierId: null,
    ArrivalDate: new Date().toISOString().split('T')[0],
    InitialQuantity: 0,
    DeadOnArrival: 0,
    UnitCost: 0,
    Notes: ''
  });

  const [mortalityData, setMortalityData] = useState({
    Date: new Date().toISOString().split('T')[0],
    Quantity: 0,
    Cause: 'Disease',
    Notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [speciesRes, suppliersRes, inventoryRes] = await Promise.all([
        speciesApi.getAll(),
        suppliersApi.getAll(),
        inventoryLotsApi.getAll()
      ]);
      setSpecies(speciesRes.data);
      setSuppliers(suppliersRes.data);
      setLots(inventoryRes.data);
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to load data', color: 'red' });
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await inventoryLotsApi.create(formData);
      notifications.show({ title: 'Success', message: 'Lot created', color: 'green' });
      close();
      resetForm();
      loadData();
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
        ...mortalityData
      });
      notifications.show({ title: 'Success', message: 'Mortality registered', color: 'green' });
      closeMortality();
      setMortalityData({ Date: new Date().toISOString().split('T')[0], Quantity: 0, Cause: 'Disease', Notes: '' });
      loadData();
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
      SpeciesId: null,
      SupplierId: null,
      ArrivalDate: new Date().toISOString().split('T')[0],
      InitialQuantity: 0,
      DeadOnArrival: 0,
      UnitCost: 0,
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

  const speciesMap = {};
  species.forEach(s => speciesMap[s.Id] = s.CommonName);
  
  const supplierMap = {};
  suppliers.forEach(s => supplierMap[s.Id] = s.Name);

  const filteredLots = lots.filter(lot =>
    !search ||
    (speciesMap[lot.SpeciesId] || '').toLowerCase().includes(search.toLowerCase()) ||
    (supplierMap[lot.SupplierId] || '').toLowerCase().includes(search.toLowerCase())
  );

  const rows = filteredLots.map((item) => {
    const status = getStockStatus(item);
    return (
      <Table.Tr key={item.Id}>
        <Table.Td fw={500}>{speciesMap[item.SpeciesId] || 'Unknown'}</Table.Td>
        <Table.Td>{supplierMap[item.SupplierId] || 'Unknown'}</Table.Td>
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
        <Button leftSection={<IconPlus size={16} />} onClick={open}>
          {t('Create Lot')}
        </Button>
      </Group>

      <Tabs defaultValue="list">
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
        </Tabs.Panel>

        <Tabs.Panel value="create">
          <Paper p="lg" radius="md" withBorder style={{ maxWidth: 600 }}>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              <Stack gap="sm">
                <Select
                  label="Species"
                  required
                  data={species.map(s => ({ value: s.Id.toString(), label: s.CommonName }))}
                  value={formData.SpeciesId?.toString() || ''}
                  onChange={(value) => setFormData({ ...formData, SpeciesId: parseInt(value) })}
                />
                <Select
                  label="Supplier"
                  required
                  data={suppliers.map(s => ({ value: s.Id.toString(), label: s.Name }))}
                  value={formData.SupplierId?.toString() || ''}
                  onChange={(value) => setFormData({ ...formData, SupplierId: parseInt(value) })}
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
                    onChange={(value) => setFormData({ ...formData, InitialQuantity: value || 0 })}
                  />
                  <NumberInput
                    label="Dead on Arrival"
                    min={0}
                    value={formData.DeadOnArrival}
                    onChange={(value) => setFormData({ ...formData, DeadOnArrival: value || 0 })}
                  />
                </Group>
                <NumberInput
                  label="Unit Cost"
                  required
                  min={0}
                  step={0.01}
                  value={formData.UnitCost}
                  onChange={(value) => setFormData({ ...formData, UnitCost: value || 0 })}
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
              <Text size="sm">Lot: {speciesMap[selectedLot.SpeciesId]} (Stock: {selectedLot.CurrentStock || 0})</Text>
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
                onChange={(value) => setMortalityData({ ...mortalityData, Quantity: value || 0 })}
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