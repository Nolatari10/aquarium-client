import { useState, useEffect, useCallback } from 'react';
import { Button, Table, Modal, TextInput, Textarea, Group, Text, ActionIcon, Box, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconEdit, IconTrash, IconSearch } from '@tabler/icons-react';
import { suppliersApi } from '../api/suppliers';
import { useTranslation } from 'react-i18next';

function SuppliersPage() {
  const { t } = useTranslation();
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [opened, { open, close }] = useDisclosure(false);

  const [formData, setFormData] = useState({
    Name: '',
    ContactInfo: '',
    Phone: '',
    Email: '',
    Notes: ''
  });

  const loadSuppliers = useCallback(async () => {
    try {
      const response = await suppliersApi.getAll();
      setSuppliers(response.data);
      setFilteredSuppliers(response.data);
    } catch {
      notifications.show({ title: t('Error'), message: t('Failed to load suppliers'), color: 'red' });
    }
  }, [t]);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  useEffect(() => {
    const term = search.toLowerCase();
    const filtered = suppliers.filter(s =>
      s.Name?.toLowerCase().includes(term) ||
      s.Email?.toLowerCase().includes(term) ||
      s.Phone?.toLowerCase().includes(term)
    );
    setFilteredSuppliers(filtered);
  }, [search, suppliers]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (editingSupplier) {
        await suppliersApi.update(editingSupplier.Id, formData);
        notifications.show({ title: t('Success'), message: t('Supplier updated'), color: 'green' });
      } else {
        await suppliersApi.create(formData);
        notifications.show({ title: t('Success'), message: t('Supplier created'), color: 'green' });
      }
      close();
      resetForm();
      loadSuppliers();
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
    setEditingSupplier(item);
    setFormData({
      Name: item.Name || '',
      ContactInfo: item.ContactInfo || '',
      Phone: item.Phone || '',
      Email: item.Email || '',
      Notes: item.Notes || ''
    });
    open();
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    
    try {
      await suppliersApi.delete(id);
      notifications.show({ title: t('Success'), message: t('Supplier deleted'), color: 'green' });
      loadSuppliers();
    } catch {
      notifications.show({ title: t('Error'), message: t('Failed to delete supplier'), color: 'red' });
    }
  };

  const resetForm = () => {
    setEditingSupplier(null);
    setFormData({ Name: '', ContactInfo: '', Phone: '', Email: '', Notes: '' });
  };

  const handleOpen = () => {
    resetForm();
    open();
  };

  const rows = filteredSuppliers.map((item) => (
    <Table.Tr key={item.Id}>
      <Table.Td fw={500}>{item.Name}</Table.Td>
      <Table.Td>{item.Phone}</Table.Td>
      <Table.Td>{item.Email}</Table.Td>
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
      <Group justify="space-between" mb="lg">
        <Box>
          <Text size="xl" fw={700}>suppliers</Text>
          <Text size="sm" c="dimmed">{filteredSuppliers.length} {t('Suppliers registered')}</Text>
        </Box>
        <Button leftSection={<IconPlus size={16} />} onClick={handleOpen}>
          {t('Add Supplier')}
        </Button>
      </Group>

      <TextInput
        placeholder={t('Search suppliers...')}
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        mb="lg"
        style={{ maxWidth: 320 }}
      />

      {filteredSuppliers.length > 0 ? (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Phone</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      ) : (
        <Stack align="center" py="xl">
          <Text c="dimmed">{t('No suppliers found')}</Text>
          <Button variant="light" onClick={handleOpen}>{t('Add your first supplier')}</Button>
        </Stack>
      )}

      <Modal opened={opened} onClose={close} title={editingSupplier ? t('Edit Supplier') : t('Add Supplier')} size="md">
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <Stack gap="sm">
            <TextInput
              label="Name"
              required
              value={formData.Name}
              onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
            />
            <TextInput
              label="Phone"
              value={formData.Phone}
              onChange={(e) => setFormData({ ...formData, Phone: e.target.value })}
            />
            <TextInput
              label="Email"
              type="email"
              value={formData.Email}
              onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
            />
            <Textarea
              label={t('Contact Info')}
              value={formData.ContactInfo}
              onChange={(e) => setFormData({ ...formData, ContactInfo: e.target.value })}
            />
            <Textarea
              label="Notes"
              value={formData.Notes}
              onChange={(e) => setFormData({ ...formData, Notes: e.target.value })}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={close} disabled={loading}>{t('Cancel')}</Button>
              <Button type="submit" loading={loading}>
                {editingSupplier ? t('Update') : t('Create')}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Box>
  );
}

export default SuppliersPage;