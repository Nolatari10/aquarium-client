import { useState, useEffect, useCallback } from 'react';
import { Button, Table, Modal, TextInput, Textarea, Select, Switch, Group, Text, ActionIcon, Box, Stack, Badge } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconEdit, IconTrash, IconSearch, IconUsers } from '@tabler/icons-react';
import { customersApi } from '../api/customersApi';
import { useConfirmModal } from '../hooks/useConfirmModal';
import { useTranslation } from 'react-i18next';
import { PageHero, SectionCard } from '../components/ui';

function CustomersPage() {
  const { t } = useTranslation();
  const { confirm, ConfirmModal } = useConfirmModal();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [opened, { open, close }] = useDisclosure(false);

  const [formData, setFormData] = useState({
    Name: '',
    CustomerType: 'Retail',
    ContactName: '',
    Phone: '',
    Email: '',
    Notes: '',
    IsActive: true,
  });

  const loadCustomers = useCallback(async () => {
    try {
      const response = await customersApi.getAll();
      setCustomers(response.data);
      setFilteredCustomers(response.data);
    } catch {
      notifications.show({ title: t('Error'), message: t('Failed to load customers'), color: 'red' });
    }
  }, [t]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    const term = search.toLowerCase();
    const filtered = customers.filter(c =>
      c.Name?.toLowerCase().includes(term) ||
      c.Email?.toLowerCase().includes(term) ||
      c.Phone?.toLowerCase().includes(term) ||
      c.ContactName?.toLowerCase().includes(term)
    );
    setFilteredCustomers(filtered);
  }, [search, customers]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (editingCustomer) {
        await customersApi.update(editingCustomer.Id, formData);
        notifications.show({ title: t('Success'), message: t('Customer updated'), color: 'green' });
      } else {
        await customersApi.create(formData);
        notifications.show({ title: t('Success'), message: t('Customer created'), color: 'green' });
      }
      close();
      resetForm();
      loadCustomers();
    } catch (e) {
      notifications.show({
        title: t('Error'),
        message: e.response?.data?.ErrorMessage || t('Operation failed'),
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingCustomer(item);
    setFormData({
      Name: item.Name || '',
      CustomerType: item.CustomerType || t('Retail'),
      ContactName: item.ContactName || '',
      Phone: item.Phone || '',
      Email: item.Email || '',
      Notes: item.Notes || '',
      IsActive: item.IsActive !== false,
    });
    open();
  };

  const handleDelete = async (id) => {
    if (!(await confirm(t('Are you sure you want to delete this customer?')))) return;
    try {
      await customersApi.delete(id);
      notifications.show({ title: t('Success'), message: t('Customer deleted'), color: 'green' });
      loadCustomers();
    } catch (e) {
      notifications.show({
        title: t('Error'),
        message: e.response?.data?.ErrorMessage || t('Failed to delete customer'),
        color: 'red',
      });
    }
  };

  const resetForm = () => {
    setEditingCustomer(null);
    setFormData({ Name: '', CustomerType: t('Retail'), ContactName: '', Phone: '', Email: '', Notes: '', IsActive: true });
  };

  const handleOpen = () => {
    resetForm();
    open();
  };

  const getTypeColor = (type) => type === 'Wholesale' ? 'teal' : 'blue';

  const rows = filteredCustomers.map((item) => (
    <Table.Tr key={item.Id}>
      <Table.Td fw={500}>{item.Name}</Table.Td>
      <Table.Td>
        <Badge color={getTypeColor(item.CustomerType)} variant="light">
          {item.CustomerType === 'Wholesale' ? t('Wholesale') : t('Retail')}
        </Badge>
      </Table.Td>
      <Table.Td>{item.ContactName || '—'}</Table.Td>
      <Table.Td>{item.Phone || '—'}</Table.Td>
      <Table.Td>{item.Email || '—'}</Table.Td>
      <Table.Td>
        <Badge color={item.IsActive ? 'green' : 'gray'} variant="light" size="sm">
          {item.IsActive ? t('Active') : t('Inactive')}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(item)}>
            <IconEdit size={18} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(item.Id)}>
            <IconTrash size={18} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Box>
      <PageHero
        title={t('Customers')}
        description={`${filteredCustomers.length} ${t('customers registered')}`}
        action={
          <Button leftSection={<IconPlus size={16} />} onClick={handleOpen} color="aqua">
            {t('Add Customer')}
          </Button>
        }
      />

      <TextInput
        placeholder={t('Search customers...')}
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        mb="lg"
        style={{ maxWidth: 320 }}
      />

      {filteredCustomers.length > 0 ? (
        <SectionCard>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('Name')}</Table.Th>
                <Table.Th>{t('Type')}</Table.Th>
                <Table.Th>{t('Contact')}</Table.Th>
                <Table.Th>{t('Phone')}</Table.Th>
                <Table.Th>{t('Email')}</Table.Th>
                <Table.Th>{t('Status')}</Table.Th>
                <Table.Th>{t('Actions')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </SectionCard>
      ) : (
        <SectionCard>
          <Stack align="center" py="xl" gap="md">
            <IconUsers size={40} stroke={1.5} style={{ color: 'var(--aqua-scheme-text-faint)' }} />
            <Box ta="center">
              <Text fw={500}>{t('No customers found')}</Text>
              <Text size="sm" c="dimmed">{t('Register your first customer to start tracking B2B and B2C sales')}</Text>
            </Box>
            <Button variant="light" color="aqua" onClick={handleOpen}>{t('Add your first customer')}</Button>
          </Stack>
        </SectionCard>
      )}

      <Modal opened={opened} onClose={close} title={editingCustomer ? t('Edit Customer') : t('Add Customer')} size="lg">
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <Stack gap="sm">
            <Group grow>
              <TextInput
                label={t('Name')}
                required
                value={formData.Name}
                onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
              />
              <Select
                label={t('Customer Type')}
                required
                data={[
                  { value: 'Retail', label: t('Retail / Final Customer') },
                  { value: 'Wholesale', label: t('Wholesale / Business') },
                ]}
                value={formData.CustomerType}
                onChange={(value) => setFormData({ ...formData, CustomerType: value })}
              />
            </Group>
            <Group grow>
              <TextInput
                label={t('Contact Name')}
                value={formData.ContactName}
                onChange={(e) => setFormData({ ...formData, ContactName: e.target.value })}
              />
              <TextInput
                label={t('Phone')}
                value={formData.Phone}
                onChange={(e) => setFormData({ ...formData, Phone: e.target.value })}
              />
            </Group>
            <TextInput
              label={t('Email')}
              type="email"
              value={formData.Email}
              onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
            />
            <Textarea
              label={t('Notes')}
              value={formData.Notes}
              onChange={(e) => setFormData({ ...formData, Notes: e.target.value })}
            />
            <Switch
              label={t('Active')}
              checked={formData.IsActive}
              onChange={(e) => setFormData({ ...formData, IsActive: e.currentTarget.checked })}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={close} disabled={loading}>{t('Cancel')}</Button>
              <Button type="submit" loading={loading} color="aqua">
                {editingCustomer ? t('Update') : t('Create')}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
      {ConfirmModal}
    </Box>
  );
}

export default CustomersPage;
