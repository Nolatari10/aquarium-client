import { useState, useEffect } from 'react';
import { Button, Table, Modal, TextInput, Select, Group, Text, ActionIcon, Box, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconEdit, IconTrash, IconSearch } from '@tabler/icons-react';
import { speciesApi } from '../api/species';

function SpeciesPage() {
  const [species, setSpecies] = useState([]);
  const [filteredSpecies, setFilteredSpecies] = useState([]);
  const [editingSpecies, setEditingSpecies] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [opened, { open, close }] = useDisclosure(false);

  const [formData, setFormData] = useState({
    CommonName: '',
    ScientificName: '',
    Category: 'Fish',
    MinTemperature: 0,
    MaxTemperature: 0,
    MinPH: 0,
    MaxPH: 0,
    ImageUrl: ''
  });

  useEffect(() => {
    loadSpecies();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    const filtered = species.filter(s =>
      s.CommonName?.toLowerCase().includes(term) ||
      s.ScientificName?.toLowerCase().includes(term) ||
      s.Category?.toLowerCase().includes(term)
    );
    setFilteredSpecies(filtered);
  }, [search, species]);

  const loadSpecies = async () => {
    try {
      const response = await speciesApi.getAll();
      setSpecies(response.data);
      setFilteredSpecies(response.data);
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to load species',
        color: 'red'
      });
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (editingSpecies) {
        await speciesApi.update(editingSpecies.Id, formData);
        notifications.show({ title: 'Success', message: 'Species updated', color: 'green' });
      } else {
        await speciesApi.create(formData);
        notifications.show({ title: 'Success', message: 'Species created', color: 'green' });
      }
      close();
      resetForm();
      loadSpecies();
    } catch (e) {
      notifications.show({
        title: 'Error',
        message: e.response?.data?.ErrorMessage || 'Operation failed',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingSpecies(item);
    setFormData({
      CommonName: item.CommonName || '',
      ScientificName: item.ScientificName || '',
      Category: item.Category || 'Fish',
      MinTemperature: item.MinTemperature || 0,
      MaxTemperature: item.MaxTemperature || 0,
      MinPH: item.MinPH || 0,
      MaxPH: item.MaxPH || 0,
      ImageUrl: item.ImageUrl || ''
    });
    open();
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this species?')) return;
    
    try {
      await speciesApi.delete(id);
      notifications.show({ title: 'Success', message: 'Species deleted', color: 'green' });
      loadSpecies();
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete species',
        color: 'red'
      });
    }
  };

  const resetForm = () => {
    setEditingSpecies(null);
    setFormData({
      CommonName: '',
      ScientificName: '',
      Category: 'Fish',
      MinTemperature: 0,
      MaxTemperature: 0,
      MinPH: 0,
      MaxPH: 0,
      ImageUrl: ''
    });
  };

  const handleOpen = () => {
    resetForm();
    open();
  };

  const rows = filteredSpecies.map((item) => (
    <Table.Tr key={item.Id}>
      <Table.Td fw={500}>{item.CommonName}</Table.Td>
      <Table.Td><Text size="sm" fs="italic">{item.ScientificName}</Text></Table.Td>
      <Table.Td>{item.Category}</Table.Td>
      <Table.Td>{item.MinTemperature} - {item.MaxTemperature}°C</Table.Td>
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
          <Text size="xl" fw={700}>Species Management</Text>
          <Text size="sm" c="dimmed">{filteredSpecies.length} species in catalog</Text>
        </Box>
        <Button leftSection={<IconPlus size={16} />} onClick={handleOpen}>
          Add Species
        </Button>
      </Group>

      <TextInput
        placeholder="Search species..."
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        mb="lg"
        style={{ maxWidth: 320 }}
      />

      {filteredSpecies.length > 0 ? (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Common Name</Table.Th>
              <Table.Th>Scientific Name</Table.Th>
              <Table.Th>Category</Table.Th>
              <Table.Th>Temperature</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      ) : (
        <Stack align="center" py="xl">
          <Text c="dimmed">No species found</Text>
          <Button variant="light" onClick={handleOpen}>Add your first species</Button>
        </Stack>
      )}

      <Modal opened={opened} onClose={close} title={editingSpecies ? 'Edit Species' : 'Add Species'} size="md">
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <Stack gap="sm">
            <TextInput
              label="Common Name"
              required
              value={formData.CommonName}
              onChange={(e) => setFormData({ ...formData, CommonName: e.target.value })}
            />
            <TextInput
              label="Scientific Name"
              required
              value={formData.ScientificName}
              onChange={(e) => setFormData({ ...formData, ScientificName: e.target.value })}
            />
            <Select
              label="Category"
              value={formData.Category}
              onChange={(value) => setFormData({ ...formData, Category: value })}
              data={['Fish', 'Invertebrate', 'Plant', 'Coral', 'Other']}
            />
            <Group grow>
              <TextInput
                label="Min Temp (°C)"
                type="number"
                step="0.1"
                value={formData.MinTemperature}
                onChange={(e) => setFormData({ ...formData, MinTemperature: parseFloat(e.target.value) })}
              />
              <TextInput
                label="Max Temp (°C)"
                type="number"
                step="0.1"
                value={formData.MaxTemperature}
                onChange={(e) => setFormData({ ...formData, MaxTemperature: parseFloat(e.target.value) })}
              />
            </Group>
            <Group grow>
              <TextInput
                label="Min pH"
                type="number"
                step="0.1"
                value={formData.MinPH}
                onChange={(e) => setFormData({ ...formData, MinPH: parseFloat(e.target.value) })}
              />
              <TextInput
                label="Max pH"
                type="number"
                step="0.1"
                value={formData.MaxPH}
                onChange={(e) => setFormData({ ...formData, MaxPH: parseFloat(e.target.value) })}
              />
            </Group>
            <TextInput
              label="Image URL"
              value={formData.ImageUrl}
              onChange={(e) => setFormData({ ...formData, ImageUrl: e.target.value })}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={close} disabled={loading}>Cancel</Button>
              <Button type="submit" loading={loading}>
                {editingSpecies ? 'Update' : 'Create'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Box>
  );
}

export default SpeciesPage;