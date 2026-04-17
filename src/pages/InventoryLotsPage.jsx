import { useState, useEffect } from 'react';
import { 
  Button, Table, Modal, TextInput, Select, Textarea, Group, Text, 
  ActionIcon, Box, Badge, Tabs, NumberInput 
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconAlertTriangle } from '@tabler/icons-react';
import { inventoryLotsApi } from '../api/inventoryLots';
import { speciesApi } from '../api/species';
import { suppliersApi } from '../api/suppliers';

function InventoryLotsPage() {
  const [lots, setLots] = useState([]);
  const [species, setSpecies] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [mortalityOpened, { open: openMortality, close: closeMortality }] = useDisclosure(false);
  const [selectedLot, setSelectedLot] = useState(null);

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
    } catch (error) {
      notifications.show({ title: 'Error', message: 'Failed to load data', color: 'red' });
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await inventoryLotsApi.create(formData);
      notifications.show({ title: 'Success', message: 'Lot created' });
      close();
      resetForm();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.ErrorMessage || 'Failed to create lot',
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
      notifications.show({ title: 'Success', message: 'Mortality registered' });
      closeMortality();
      setMortalityData({ Date: new Date().toISOString().split('T')[0], Quantity: 0, Cause: 'Disease', Notes: '' });
    } catch (error) {
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
    if (stock === 0) return { label: 'Empty', color: 'red' };
    if (stock < 10) return { label: 'Low', color: 'yellow' };
    return { label: 'Available', color: 'green' };
  };

  const speciesMap = {};
  species.forEach(s => speciesMap[s.Id] = s.CommonName);
  
  const supplierMap = {};
  suppliers.forEach(s => supplierMap[s.Id] = s.Name);

  const rows = lots.map((item) => {
    const status = getStockStatus(item);
    return (
      <Table.Tr key={item.Id}>
        <Table.Td>{speciesMap[item.SpeciesId] || 'Unknown'}</Table.Td>
        <Table.Td>{supplierMap[item.SupplierId] || 'Unknown'}</Table.Td>
        <Table.Td>{new Date(item.ArrivalDate).toLocaleDateString()}</Table.Td>
        <Table.Td>{item.InitialQuantity}</Table.Td>
        <Table.Td>{item.CurrentStock || 0}</Table.Td>
        <Table.Td>
          <Badge color={status.color}>{status.label}</Badge>
        </Table.Td>
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
      <Tabs defaultValue="list">
        <Tabs.List mb="md">
          <Tabs.Tab value="list">Inventory Lots</Tabs.Tab>
          <Tabs.Tab value="create">Create Lot</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="list">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Species</Table.Th>
                <Table.Th>Supplier</Table.Th>
                <Table.Th>Arrival Date</Table.Th>
                <Table.Th>Initial Qty</Table.Th>
                <Table.Th>Current Stock</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="create">
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <Select
              label="Species"
              required
              data={species.map(s => ({ value: s.Id.toString(), label: s.CommonName }))}
              value={formData.SpeciesId?.toString() || ''}
              onChange={(value) => setFormData({ ...formData, SpeciesId: parseInt(value) })}
              mb="sm"
            />
            <Select
              label="Supplier"
              required
              data={suppliers.map(s => ({ value: s.Id.toString(), label: s.Name }))}
              value={formData.SupplierId?.toString() || ''}
              onChange={(value) => setFormData({ ...formData, SupplierId: parseInt(value) })}
              mb="sm"
            />
            <TextInput
              label="Arrival Date"
              type="date"
              required
              value={formData.ArrivalDate}
              onChange={(e) => setFormData({ ...formData, ArrivalDate: e.target.value })}
              mb="sm"
            />
            <Group grow mb="sm">
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
              mb="sm"
            />
            <Textarea
              label="Notes"
              value={formData.Notes}
              onChange={(e) => setFormData({ ...formData, Notes: e.target.value })}
              mb="md"
            />
            <Button type="submit" loading={loading}>Create Lot</Button>
          </form>
        </Tabs.Panel>
      </Tabs>

      <Modal opened={mortalityOpened} onClose={closeMortality} title="Register Mortality">
        {selectedLot && (
          <form onSubmit={(e) => { e.preventDefault(); handleRegisterMortality(); }}>
            <Text mb="sm">Lot: {speciesMap[selectedLot.SpeciesId]} (Stock: {selectedLot.CurrentStock || 0})</Text>
            <TextInput
              label="Date"
              type="date"
              required
              value={mortalityData.Date}
              onChange={(e) => setMortalityData({ ...mortalityData, Date: e.target.value })}
              mb="sm"
            />
            <NumberInput
              label="Quantity"
              required
              min={1}
              max={selectedLot.CurrentStock || 0}
              value={mortalityData.Quantity}
              onChange={(value) => setMortalityData({ ...mortalityData, Quantity: value || 0 })}
              mb="sm"
            />
            <Select
              label="Cause"
              value={mortalityData.Cause}
              onChange={(value) => setMortalityData({ ...mortalityData, Cause: value })}
              data={['Disease', 'Water Quality', 'Transport', 'Aggression', 'Unknown', 'Old Age']}
              mb="sm"
            />
            <Textarea
              label="Notes"
              value={mortalityData.Notes}
              onChange={(e) => setMortalityData({ ...mortalityData, Notes: e.target.value })}
              mb="md"
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={closeMortality}>Cancel</Button>
              <Button type="submit" loading={loading}>Register</Button>
            </Group>
          </form>
        )}
      </Modal>
    </Box>
  );
}

export default InventoryLotsPage;
