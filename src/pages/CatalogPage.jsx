import { useState, useEffect } from 'react';
import { Card, Text, SimpleGrid, Group, Badge, Box, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { catalogApi } from '../api/catalog';


function CatalogPage() {
  const [catalog, setCatalog] = useState([]);
  const [searchField, setSearchField] = useState('');
  function ImageCatalog() {
    return (<img src={catalog.ImageURL} alt={catalog.CommonName} style={{ width: '100%', height: 'auto' }} />);
  }
  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      const response = await catalogApi.getAll();
      
      setCatalog(response.data);
    } catch (error) {
      notifications.show({ title: 'Error', message: 'Failed to load catalog', color: 'red' });
    }
  };

  const getStockBadge = (stock) => {
    if (stock === 0) return <Badge color="red">Out of Stock</Badge>;
    if (stock < 10) return <Badge color="yellow">{stock} (Low)</Badge>;
    return <Badge color="green">{stock} Disponible</Badge>;
  };

  const searchTerm = searchField.toLowerCase();

  // Filter catalog based on search term
 const filteredCatalog = catalog.filter((item) => {
    if (!searchTerm) return true; // si no hay búsqueda, se muestra todo

    const commonName = (item.CommonName || '').toLowerCase();
    const scientificName = (item.ScientificName || '').toLowerCase();
    const category = (item.Category || '').toLowerCase();

    // Coincidir por nombre común, científico o categoría
    return (
      commonName.includes(searchTerm) ||
      scientificName.includes(searchTerm) ||
      category.includes(searchTerm)
    );
  });
  return (
    <Box><Group justify="space-between" mb="md">
      <Text size="xl" fw={700} mb="md">Available Stock Catalog</Text>
 <TextInput
          placeholder="Search by name, scientific name or category"
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
          style={{ maxWidth: 320 }}
        />
    </Group>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {filteredCatalog.map((item) => (
          <Card key={item.SpeciesId} shadow="sm" padding="lg" radius="md">
            <Group justify="space-between" mb="xs">
              <Text fw={700} size="lg">{item.CommonName}</Text>
              {getStockBadge(item.TotalStock)}
            </Group>
            
            <Text size="sm" c="dimmed" mb="md">{item.ScientificName}</Text>
            
            <Group justify="space-between" mb="xs">
              <Text size="sm">Variedad:</Text>
              <Text size="sm" fw={500}>{item.Variety}</Text>
            </Group>
            
            <Group justify="space-between" mb="xs">
              <Text size="sm">Unidades disponibles:</Text>
              <Text size="sm" fw={500}>{item.CurrentBiologicalStock}</Text>
            </Group>
            
            <Group justify="space-between">
              <Text size="sm">Oldest Lot:</Text>
              <Text size="sm" fw={500}>
                {item.OldestArrivalDate ? new Date(item.OldestArrivalDate).toLocaleDateString() : 'N/A'}
              </Text>
            </Group>

            <Group justify="space-between" mb="xs">
              <Text size="sm">Image:</Text>
              <img src={item.ImageUrl} alt={item.CommonName}  style={{ width: '100px', height: 'auto' }}
  onError={(e) => {
    e.currentTarget.src = '/no-image-available.png';
  }}/>
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      {catalog.length === 0 && (
        <Text c="dimmed" ta="center" mt="xl">
          No species with available stock. Create inventory lots to see them here.
        </Text>
      )}
    </Box>
  );
}

export default CatalogPage;
