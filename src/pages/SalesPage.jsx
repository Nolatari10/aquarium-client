import { useState, useEffect } from 'react';
import {
  Button, Table, Modal, TextInput, Select, NumberInput, Group, Text,
  Box, Card, Badge, ActionIcon, Divider, Stack, Paper, Pagination, Loader
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconTrash, IconSearch } from '@tabler/icons-react';
import { salesApi } from '../api/sales';
import { catalogApi } from '../api/catalog';
import { useTranslation } from 'react-i18next';

function SalesPage() {
  const { t } = useTranslation();
  const [sales, setSales] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;
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
    loadCatalog();
    loadSales(1);
  }, []);

  useEffect(() => { loadSales(page); }, [page]);

  const loadCatalog = async () => {
    try {
      const res = await catalogApi.getAll(1, 1000);
      setCatalog(res.data.Items || []);
    } catch { /* ignore */ }
  };

  const loadSales = async (p) => {
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
  };

  const refreshSales = () => { setPage(1); loadSales(1); };

  const handleAddItem = () => {
    if (!newItem.SpeciesId) {
      notifications.show({ title: 'Error', message: t('Select a species'), color: 'red' });
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
      notifications.show({ title: 'Error', message: t('Add at least one item'), color: 'red' });
      return;
    }

    try {
      setLoading(true);
      await salesApi.create({
        CustomerName: saleData.CustomerName,
        Date: saleData.Date,
        Items: saleData.Items
      });
      notifications.show({ title: 'Success', message: t('Sale created'), color: 'green' });
      close();
      resetForm();
      refreshSales;
    } catch (e) {
      notifications.show({
        title: 'Error',
        message: e.response?.data?.ErrorMessage || t('Failed to create sale'),
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

  const rows = filteredSales.map((sale) => {
    const total = sale.Items?.reduce((sum, item) => sum + (item.Quantity * item.UnitPrice), 0) || 0;
    return (
      <Table.Tr key={sale.Id}>
        <Table.Td>{new Date(sale.Date).toLocaleDateString()}</Table.Td>
        <Table.Td fw={500}>{sale.CustomerName}</Table.Td>
        <Table.Td>{sale.Items.length} {t('items')}</Table.Td>
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
          <Text size="xl" fw={700}>{t('Sales')}</Text>
          <Text size="sm" c="dimmed">{filteredSales.length} {t('transactions recorded')}</Text>
        </Box>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>
          {t('New Sale')}
        </Button>
      </Group>

      <TextInput
        placeholder={t('Search by customer...')}
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
                <Table.Th>{t('Date')}</Table.Th>
                <Table.Th>{t('Customer')}</Table.Th>
                <Table.Th>{t('Items')}</Table.Th>
                <Table.Th>{t('Total')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
          <Group justify="center" mt="md">
            <Pagination total={totalPages} value={page} onChange={(p) => setPage(p)} />
          </Group>
        </Card>
      ) : listLoading ? (
        <Stack align="center" py="xl"><Loader /></Stack>
      ) : (
        <Stack align="center" py="xl">
          <Text c="dimmed">{t('No sales found')}</Text>
          <Button variant="light" onClick={open}>{t('Record your first sale')}</Button>
        </Stack>
      )}

      <Modal opened={opened} onClose={close} title={t('Create Sale')} size="lg">
        <Stack gap="sm">
          <TextInput
            label={t('Customer Name')}
            required
            value={saleData.CustomerName}
            onChange={(e) => setSaleData({ ...saleData, CustomerName: e.target.value })}
          />
          
          <TextInput
            label={t('Date')}
            type="date"
            required
            value={saleData.Date}
            onChange={(e) => setSaleData({ ...saleData, Date: e.target.value })}
          />

          <Text fw={500} size="sm" mt="sm">Add Items</Text>
          <Group grow>
            <Select
              label={t('Species')}
              data={catalog.map(c => ({ value: c.SpeciesId.toString(), label: c.CommonName }))}
              value={newItem.SpeciesId?.toString() || ''}
              onChange={(value) => setNewItem({ ...newItem, SpeciesId: parseInt(value) })}
            />
            <NumberInput
              label={t('Quantity')}
              min={1}
              value={newItem.Quantity}
              onChange={(value) => setNewItem({ ...newItem, Quantity: value || 1 })}
            />
            <NumberInput
              label={t('Unit Price')}
              min={0}
              step={0.01}
              value={newItem.UnitPrice}
              onChange={(value) => setNewItem({ ...newItem, UnitPrice: value || 0 })}
            />
          </Group>
          <Button variant="light" onClick={handleAddItem}>
            {t('Add Item')}
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
                <Text fw={700} size="lg">{t('Total')}:</Text>
                <Text fw={700} size="lg" c="green">${calculateTotal().toFixed(2)}</Text>
              </Group>
            </>
          )}

          <Group justify="flex-end" mt="xl">
            <Button variant="default" onClick={close}>{t('Cancel')}</Button>
            <Button onClick={handleCreateSale} loading={loading}>{t('Create')}</Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}

export default SalesPage;