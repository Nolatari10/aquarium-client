import { useState, useEffect, useCallback } from 'react';
import { Card, Text, SimpleGrid, Group, Badge, Box, TextInput, Stack, Pagination, Loader, Image } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconSearch } from '@tabler/icons-react';
import { catalogApi } from '../api/catalog';
import { useTranslation } from 'react-i18next';
function CatalogPage() {
  const [catalog, setCatalog] = useState([]);
  const [searchField, setSearchField] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [listLoading, setListLoading] = useState(false);
  const pageSize = 12;
  const { t } = useTranslation();

  const loadCatalog = useCallback(async (p) => {
    try {
      setListLoading(true);
      const response = await catalogApi.getAll(p, pageSize);
      const data = response.data;
      setCatalog(data.Items || []);
      setTotalPages(data.TotalPages || 1);
    } catch {
      notifications.show({ title: t('Error'), message: t('Failed to load catalog'), color: 'red' });
    } finally {
      setListLoading(false);
    }
  }, [pageSize, t]);

  useEffect(() => {
    loadCatalog(page);
  }, [page, loadCatalog]);

  const getStockBadge = (stock) => {
    if (stock === 0) return <Badge color="red">{t('Out of Stock')}</Badge>;
    if (stock < 10) return <Badge color="yellow">{stock} {t('(Low)')}</Badge>;
    return <Badge color="green">{stock} {t('Available')}</Badge>;
  };

  const searchTerm = searchField.toLowerCase();
  const filteredCatalog = catalog.filter((item) => {
    if (!searchTerm) return true;
    return (
      (item.CommonName || '').toLowerCase().includes(searchTerm) ||
      (item.VariantName || '').toLowerCase().includes(searchTerm) ||
      (item.ScientificName || '').toLowerCase().includes(searchTerm) ||
      (item.Category || '').toLowerCase().includes(searchTerm)
    );
  });

  return (
    <Box>
      <Group justify="space-between" mb="lg">
        <Box>
          <Text size="xl" fw={700}>{t('Catalog')}</Text>
          <Text size="sm" c="dimmed">{filteredCatalog.length} {t('items with available stock')}</Text>
        </Box>
      </Group>

      <TextInput
        placeholder={t('Search by name, scientific name or category...')}
        leftSection={<IconSearch size={16} />}
        value={searchField}
        onChange={(e) => setSearchField(e.target.value)}
        mb="lg"
        style={{ maxWidth: 360 }}
      />

      {listLoading ? (
        <Stack align="center" py="xl"><Loader /></Stack>
      ) : filteredCatalog.length > 0 ? (
        <>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {filteredCatalog.map((item) => (
            <Card key={item.SpeciesVariantId} padding="lg" radius="md" withBorder>
              {item.ImageUrl && (
                <Card.Section mb="sm">
                  <Image src={item.ImageUrl} height={120} fit="cover" alt={item.VariantName} />
                </Card.Section>
              )}
              <Group justify="space-between" mb="xs">
                <Box>
                
                  {item.VariantName !== 'Standard' && (
                    <Text fw={700} size="lg" >{item.CommonName}</Text>
                  )}
                    <Text fw={200} size="lg" c="dimmed" fs="italic">
                    {item.VariantName !== 'Standard' ? item.VariantName : item.CommonName}
                  </Text>
                </Box>
                {getStockBadge(item.TotalStock)}
              </Group>
              
              <Text size="sm" c="dimmed" mb="md" fs="italic">{item.ScientificName}</Text>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">{t('Variety')}</Text>
                <Text size="sm" fw={500}>{item.VariantName}</Text>
              </Group>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">{t('Units Available')}</Text>
                <Text size="sm" fw={500}>{item.TotalStock}</Text>
              </Group>

              <Group justify="space-between">
                <Text size="sm" c="dimmed">{t('Latest Unit Cost')}</Text>
                <Text size="sm" fw={500}>${item.LatestUnitCost?.toFixed(2) || '0.00'}</Text>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
          <Group justify="center" mt="lg">
            <Pagination total={totalPages} value={page} onChange={(p) => setPage(p)} />
          </Group>
        </>
      ) : (
        <Stack align="center" py="xl">
          <Text c="dimmed">{t('No species with available stock')}</Text>
          <Text size="xs" c="dimmed">{t('Create inventory lots to see them here')}</Text>
        </Stack>
      )}
    </Box>
  );
}

export default CatalogPage;
