import { useState, useEffect } from 'react';
import { Card, Text, SimpleGrid, Group, Badge, Box } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { catalogApi } from '../api/catalog';


function CatalogPage() {
  const [catalog, setCatalog] = useState([]);
  function ImageCatalog() {
    return (<img src={catalog.ImageURL} alt={catalog.CommonName} style={{ width: '100%', height: 'auto' }} />);
  }
  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      const response = await catalogApi.getAll();
       console.log('Catalog data:', response.data); 
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

  return (
    <Box>
      <Text size="xl" fw={700} mb="md">Available Stock Catalog</Text>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {catalog.map((item) => (
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
