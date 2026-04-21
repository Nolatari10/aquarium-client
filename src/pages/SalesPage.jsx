import { useState, useEffect } from 'react';
import {
  Button, Table, Modal, TextInput, Select, NumberInput, Group, Text,
  Box, Card, Badge, ActionIcon, Divider, Stack, Paper
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconTrash, IconSearch } from '@tabler/icons-react';
import { salesApi } from '../api/sales';
import { catalogApi } from '../api/catalog';

function SalesPage() {
  const [sales, setSales] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [opened, { open, close }] = useDisclosure(false);

  const [saleData, setSaleData] = useState({
    CustomerName: '',
    Date: new Date().toISOString().split('T')[0],
    Items: []
  });

  const [newItem, setNewItem] = useState({
    SpeciesId: null,
    Quantity: 1,
    UnitPrice: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [salesRes, catalogRes] = await Promise.all([
        salesApi.getAll(),
        catalogApi.getAll()
      ]);
      setSales(salesRes.data);
      setCatalog(catalogRes.data);
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to load data', color: 'red' });
    }
  };

  const handleAddItem = () => {
    if (!newItem.SpeciesId) {
      notifications.show({ title: 'Error', message: 'Select a species', color: 'red' });
      return;
    }
    
    setSaleData({
      ...saleData,
      Items: [...saleData.Items, { ...newItem }]
    });
    setNewItem({ SpeciesId: null, Quantity: 1, UnitPrice: 0 });
  };

  const handleRemoveItem = (index) => {
    const items = saleData.Items.filter((_, i) => i !== index);
    setSaleData({ ...saleData, Items: items });
  };

  const handleCreateSale = async () => {
    if (saleData.Items.length === 0) {
      notifications.show({ title: 'Error', message: 'Add at least one item', color: 'red' });
      return;
    }

    try {
      setLoading(true);
      await salesApi.create({
        CustomerName: saleData.CustomerName,
        Date: saleData.Date,
        Items: saleData.Items
      });
      notifications.show({ title: 'Success', message: 'Sale created', color: 'green' });
      close();
      resetForm();
      loadData();
    } catch (e) {
      notifications.show({
        title: 'Error',
        message: e.response?.data?.ErrorMessage || 'Failed to create sale',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSaleData({ CustomerName: '', Date: new Date().toISOString().split('T')[0], Items: [] });
    setNewItem({ SpeciesId: null, Quantity: 1, UnitPrice: 0 });
  };

  const catalogMap = {};
  catalog.forEach(c => catalogMap[c.SpeciesId] = c.CommonName);

  const calculateTotal = () => {
    return saleData.Items.reduce((sum, item) => sum + (item.Quantity * item.UnitPrice), 0);
  };

  const filteredSales = sales.filter(s =>
    !search || s.CustomerName?.toLowerCase().includes(search.toLowerCase())
  );

  const rows = filteredSales.slice(0, 20).map((sale) => {
    const total = sale.Items?.reduce((sum, item) => sum + (item.Quantity * item.UnitPrice), 0) || 0;
    return (
      <Table.Tr key={sale.Id}>
        <Table.Td>{new Date(sale.Date).toLocaleDateString()}</Table.Td>
        <Table.Td fw={500}>{sale.CustomerName}</Table.Td>
        <Table.Td>{sale.Items.length} items</Table.Td>
        <Table.Td>
          <Badge color="green" variant="light">
            ${total.toFixed(2)}
          </Badge>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Box>
      <Group justify="space-between" mb="lg">
        <Box>
          <Text size="xl" fw={700}>Sales</Text>
          <Text size="sm" c="dimmed">{filteredSales.length} transactions recorded</Text>
        </Box>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>
          New Sale
        </Button>
      </Group>

      <TextInput
        placeholder="Search by customer..."
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        mb="lg"
        style={{ maxWidth: 320 }}
      />

      {filteredSales.length > 0 ? (
        <Card padding="lg" radius="md" withBorder>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Customer</Table.Th>
                <Table.Th>Items</Table.Th>
                <Table.Th>Total</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </Card>
      ) : (
        <Stack align="center" py="xl">
          <Text c="dimmed">No sales found</Text>
          <Button variant="light" onClick={open}>Record your first sale</Button>
        </Stack>
      )}

      <Modal opened={opened} onClose={close} title="Create Sale" size="lg">
        <Stack gap="sm">
          <TextInput
            label="Customer Name"
            required
            value={saleData.CustomerName}
            onChange={(e) => setSaleData({ ...saleData, CustomerName: e.target.value })}
          />
          
          <TextInput
            label="Date"
            type="date"
            required
            value={saleData.Date}
            onChange={(e) => setSaleData({ ...saleData, Date: e.target.value })}
          />

          <Text fw={500} size="sm" mt="sm">Add Items</Text>
          <Group grow>
            <Select
              label="Species"
              data={catalog.map(c => ({ value: c.SpeciesId.toString(), label: c.CommonName }))}
              value={newItem.SpeciesId?.toString() || ''}
              onChange={(value) => setNewItem({ ...newItem, SpeciesId: parseInt(value) })}
            />
            <NumberInput
              label="Quantity"
              min={1}
              value={newItem.Quantity}
              onChange={(value) => setNewItem({ ...newItem, Quantity: value || 1 })}
            />
            <NumberInput
              label="Unit Price"
              min={0}
              step={0.01}
              value={newItem.UnitPrice}
              onChange={(value) => setNewItem({ ...newItem, UnitPrice: value || 0 })}
            />
          </Group>
          <Button variant="light" onClick={handleAddItem}>
            Add Item
          </Button>

          {saleData.Items.length > 0 && (
            <>
              <Divider my="md" />
              <Text fw={500} size="sm">Items:</Text>
              {saleData.Items.map((item, index) => (
                <Paper key={index} p="sm" radius="sm" withBorder>
                  <Group justify="space-between">
                    <Text size="sm">
                      {catalogMap[item.SpeciesId]} - Qty: {item.Quantity} x ${item.UnitPrice.toFixed(2)}
                    </Text>
                    <Group gap="xs">
                      <Text fw={700}>${(item.Quantity * item.UnitPrice).toFixed(2)}</Text>
                      <ActionIcon color="red" variant="subtle" onClick={() => handleRemoveItem(index)}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Paper>
              ))}
              <Divider my="md" />
              <Group justify="space-between">
                <Text fw={700} size="lg">Total:</Text>
                <Text fw={700} size="lg" c="green">${calculateTotal().toFixed(2)}</Text>
              </Group>
            </>
          )}

          <Group justify="flex-end" mt="xl">
            <Button variant="default" onClick={close}>Cancel</Button>
            <Button onClick={handleCreateSale} loading={loading}>Create Sale</Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}

export default SalesPage;