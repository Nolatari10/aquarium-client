import { useState, useEffect } from 'react';
import { Button, Table, Modal, TextInput, Textarea, Group, Text, ActionIcon, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { suppliersApi } from '../api/suppliers';

function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);

  const [formData, setFormData] = useState({
    Name: '',
    ContactInfo: '',
    Phone: '',
    Email: '',
    Notes: ''
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const response = await suppliersApi.getAll();
      setSuppliers(response.data);
    } catch (error) {
      notifications.show({ title: 'Error', message: 'Failed to load suppliers', color: 'red' });
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (editingSupplier) {
        await suppliersApi.update(editingSupplier.Id, formData);
        notifications.show({ title: 'Success', message: 'Supplier updated' });
      } else {
        await suppliersApi.create(formData);
        notifications.show({ title: 'Success', message: 'Supplier created' });
      }
      close();
      resetForm();
      loadSuppliers();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.ErrorMessage || 'Operation failed',
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
      notifications.show({ title: 'Success', message: 'Supplier deleted' });
      loadSuppliers();
    } catch (error) {
      notifications.show({ title: 'Error', message: 'Failed to delete supplier', color: 'red' });
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

  const rows = suppliers.map((item) => (
    <Table.Tr key={item.Id}>
      <Table.Td>{item.Name}</Table.Td>
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
      <Group justify="space-between" mb="md">
        <Text size="xl" fw={700}>Suppliers Management</Text>
        <Button leftSection={<IconPlus size={16} />} onClick={handleOpen}>
          Add Supplier
        </Button>
      </Group>

      <Table striped highlightOnHover>
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

      <Modal opened={opened} onClose={close} title={editingSupplier ? 'Edit Supplier' : 'Add Supplier'}>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <TextInput
            label="Name"
            required
            value={formData.Name}
            onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
            mb="sm"
          />
          <TextInput
            label="Phone"
            value={formData.Phone}
            onChange={(e) => setFormData({ ...formData, Phone: e.target.value })}
            mb="sm"
          />
          <TextInput
            label="Email"
            type="email"
            value={formData.Email}
            onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
            mb="sm"
          />
          <Textarea
            label="Contact Info"
            value={formData.ContactInfo}
            onChange={(e) => setFormData({ ...formData, ContactInfo: e.target.value })}
            mb="sm"
          />
          <Textarea
            label="Notes"
            value={formData.Notes}
            onChange={(e) => setFormData({ ...formData, Notes: e.target.value })}
            mb="md"
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={close} disabled={loading}>Cancel</Button>
            <Button type="submit" loading={loading}>
              {editingSupplier ? 'Update' : 'Create'}
            </Button>
          </Group>
        </form>
      </Modal>
    </Box>
  );
}

export default SuppliersPage;
