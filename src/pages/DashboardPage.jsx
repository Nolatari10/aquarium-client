import { useState, useEffect } from 'react';
import { Grid, Card, Text, Group, Badge, Title, SimpleGrid } from '@mantine/core';
import { IconFish, IconPackage, IconShoppingCart, IconAlertTriangle } from '@tabler/icons-react';
import { catalogApi } from '../api/catalog';
import { salesApi } from '../api/sales';
import { reportsApi } from '../api/reports';

function DashboardPage() {
  const [stats, setStats] = useState({
    totalSpecies: 0,
    totalStock: 0,
    recentSales: 0,
    highMortality: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [catalog, sales, stockReport] = await Promise.all([
        catalogApi.getAll(),
        salesApi.getAll(),
        reportsApi.getStockReport()
      ]);

      setStats({
        totalSpecies: stockReport.data.TotalSpecies || 0,
        totalStock: stockReport.data.TotalStock || 0,
        recentSales: sales.data.length || 0,
        highMortality: 0 // Calculate from mortality report
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: 'Total Species',
      value: stats.totalSpecies,
      icon: IconFish,
      color: 'blue'
    },
    {
      title: 'Total Stock',
      value: stats.totalStock,
      icon: IconPackage,
      color: 'green'
    },
    {
      title: 'Total Sales',
      value: stats.recentSales,
      icon: IconShoppingCart,
      color: 'violet'
    },
    {
      title: 'Alerts',
      value: stats.highMortality,
      icon: IconAlertTriangle,
      color: 'red'
    }
  ];

  return (
    <div>
      <Title order={2} mb="md">Dashboard</Title>
      
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
        {cards.map((card) => (
          <Card key={card.title} shadow="sm" padding="lg" radius="md">
            <Group justify="space-between" mb="xs">
              <Text fw={500}>{card.title}</Text>
              <card.icon color={`var(--mantine-color-${card.color}-6)`} size={24} />
            </Group>
            <Text size="xxxl" fw={700} c={`${card.color}.6`}>
              {loading ? '...' : card.value}
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      <Card mt="xl" shadow="sm" padding="lg" radius="md">
        <Title order={4} mb="md">Welcome to Aquarium Manager</Title>
        <Text>
          Use the sidebar navigation to access different features:
        </Text>
        <ul style={{ marginTop: '1rem' }}>
          <li><strong>Species</strong>: Manage your aquatic species catalog</li>
          <li><strong>Suppliers</strong>: Track suppliers and breeders</li>
          <li><strong>Inventory Lots</strong>: Manage incoming stock and mortality</li>
          <li><strong>Sales</strong>: Record sales with FIFO stock deduction</li>
          <li><strong>Catalog</strong>: View available species with stock</li>
          <li><strong>Reports</strong>: Generate stock, mortality, and sales reports</li>
        </ul>
      </Card>
    </div>
  );
}

export default DashboardPage;
