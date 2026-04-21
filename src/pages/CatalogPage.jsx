import { useState, useEffect } from 'react';
import { Card, Text, SimpleGrid, Group, Badge, Box, TextInput, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconSearch } from '@tabler/icons-react';
import { catalogApi } from '../api/catalog';

function CatalogPage() {
  const [catalog, setCatalog] = useState([]);
  const [searchField, setSearchField] = useState('');

  const loadCatalog = async () => {
    try {
      const response = await catalogApi.getAll();
      setCatalog(response.data);
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to load catalog', color: 'red' });
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCatalog();
  }, []);

  const getStockBadge = (stock) => {
    if (stock === 0) return <Badge color="red">Out of Stock</Badge>;
    if (stock < 10) return <Badge color="yellow">{stock} (Low)</Badge>;
    return <Badge color="green">{stock} Available</Badge>;
  };

  const searchTerm = searchField.toLowerCase();
  const filteredCatalog = catalog.filter((item) => {
    if (!searchTerm) return true;
    return (
      (item.CommonName || '').toLowerCase().includes(searchTerm) ||
      (item.ScientificName || '').toLowerCase().includes(searchTerm) ||
      (item.Category || '').toLowerCase().includes(searchTerm)
    );
  });

  return (
    <Box>
      <Group justify="space-between" mb="lg">
        <Box>
          <Text size="xl" fw={700}>Catalog</Text>
          <Text size="sm" c="dimmed">{filteredCatalog.length} items with available stock</Text>
        </Box>
      </Group>

      <TextInput
        placeholder="Search by name, scientific name or category..."
        leftSection={<IconSearch size={16} />}
        value={searchField}
        onChange={(e) => setSearchField(e.target.value)}
        mb="lg"
        style={{ maxWidth: 360 }}
      />

      {filteredCatalog.length > 0 ? (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {filteredCatalog.map((item) => (
            <Card key={item.SpeciesId} padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="sm">
                <Text fw={700} size="lg">{item.CommonName}</Text>
                {getStockBadge(item.TotalStock)}
              </Group>
              
              <Text size="sm" c="dimmed" mb="md" fs="italic">{item.ScientificName}</Text>

              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">Category</Text>
                <Text size="sm" fw={500}>{item.Category}</Text>
              </Group>
              
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">Variety</Text>
                <Text size="sm" fw={500}>{item.Variety}</Text>
              </Group>
              
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">Units Available</Text>
                <Text size="sm" fw={500}>{item.CurrentBiologicalStock}</Text>
              </Group>
              
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Oldest Lot</Text>
                <Text size="sm" fw={500}>
                  {item.OldestArrivalDate ? new Date(item.OldestArrivalDate).toLocaleDateString() : 'N/A'}
                </Text>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        <Stack align="center" py="xl">
          <Text c="dimmed">No species with available stock</Text>
          <Text size="xs" c="dimmed">Create inventory lots to see them here</Text>
        </Stack>
      )}
    </Box>
  );
}

export default CatalogPage;