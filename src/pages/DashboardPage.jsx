import { useState, useEffect, useCallback } from 'react';
import { Card, Text, Group, SimpleGrid, Box, Title, Button, Stack, Badge, Paper } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconFish, IconPackage, IconShoppingCart, IconAlertTriangle, IconPlus, IconArrowRight, IconSkull } from '@tabler/icons-react';
import { catalogApi } from '../api/catalog';
import { salesApi } from '../api/sales';
import { reportsApi } from '../api/reports';
import { alertsApi } from '../api/alerts';
import { useTranslation } from 'react-i18next';

const kpiStyles = `
@keyframes kpiEnter {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
`;
function DashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalSpecies: 0,
    totalStock: 0,
    recentSales: 0,
    totalRevenue: 0,
    lowStockCount: 0
  });
  const [recentSales, setRecentSales] = useState([]);
  const [highMortalityAlerts, setHighMortalityAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadDashboardData = useCallback(async () => {
    try {
      const [catalog, sales, stockReport] = await Promise.all([
        catalogApi.getAll(1, 1000),
        salesApi.getAll(1, 1000),
        reportsApi.getStockReport()
      ]);

      const salesData = sales.data?.Items || [];
      const catalogData = catalog.data?.Items || [];
      const stockData = stockReport.data || {};

      const totalRevenue = salesData.reduce((sum, sale) => {
        return sum + (sale.Items?.reduce((itemSum, item) => itemSum + (item.Quantity * item.UnitPrice), 0) || 0);
      }, 0);

      const lowStockCount = catalogData.filter(item => item.TotalStock < 10).length;

      setStats({
        totalSpecies: stockData.TotalSpecies || 0,
        totalStock: stockData.TotalStock || 0,
        recentSales: salesData.length || 0,
        totalRevenue: totalRevenue,
        lowStockCount: lowStockCount
      });

      setRecentSales(salesData.slice(-5).reverse());

      const alertsData = await alertsApi.getActiveHighMortalityAlerts();
      setHighMortalityAlerts(alertsData.data || []);
    } catch {
      console.error(t('Error loading dashboard'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const kpiCards = [
    {
      title: t('Total Species'),
      value: stats.totalSpecies,
      icon: IconFish,
      color: 'teal',
      description: t('Active species in catalog')
    },
    {
      title: t('Total Stock'),
      value: stats.totalStock,
      icon: IconPackage,
      color: 'green',
      description: t('Units across all inventory')
    },
    {
      title: t('Total Sales'),
      value: stats.recentSales,
      icon: IconShoppingCart,
      color: 'violet',
      description: t('Transactions recorded')
    },
    {
      title: t('Revenue'),
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: IconPackage,
      color: 'blue',
      description: t('Total sales revenue')
    }
  ];

  const quickActions = [
    { label: t('Add Species'), to: '/species', color: 'teal' },
    { label: t('New Inventory'), to: '/inventory', color: 'green' },
    { label: t('Record Sale'), to: '/sales', color: 'violet' },
    { label: t('View Reports'), to: '/reports', color: 'blue' },
  ];

  return (
    <Box>
      <style>{kpiStyles}</style>
      <Group justify="space-between" mb="xl">
        <Box>
          <Title order={2} mb={4}>{t('Dashboard')}</Title>
          <Text c="dimmed" size="sm">{t('Welcome to your Aquarium Manager')}</Text>
        </Box>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mb="xl">
        {kpiCards.map((card, index) => (
          <Card key={card.title} padding="lg" radius="md" withBorder style={{
            animation: `kpiEnter 0.4s ease ${index * 80}ms both`,
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'default',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--mantine-shadow-md)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            <Group justify="space-between" mb="md">
              <Text size="sm" c="dimmed" fw={500}>{card.title}</Text>
              <card.icon size={24} color={`var(--mantine-color-${card.color}-6)`} />
            </Group>
            <Text size="xl" fw={700} c={`${card.color}.7`}>
              {loading ? '...' : card.value}
            </Text>
            <Text size="xs" c="dimmed" mt={4}>{card.description}</Text>
          </Card>
        ))}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        <Card padding="lg" radius="md" withBorder>
          <Text fw={700} mb="md">{t('Quick Actions')}</Text>
          <SimpleGrid cols={2} spacing="sm">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="light"
                color={action.color}
                fullWidth
                rightSection={<IconArrowRight size={16} />}
                onClick={() => navigate(action.to)}
              >
                {action.label}
              </Button>
            ))}
          </SimpleGrid>

          {stats.lowStockCount > 0 && (
            <Paper p="md" mt="md" radius="md" bg="orange.0">
              <Group gap="sm">
                <IconAlertTriangle size={20} color="var(--mantine-color-orange-6)" />
                <Box>
                  <Text size="sm" fw={500}>{t('Low Stock Alert')}</Text>
                  <Text size="xs" c="dimmed">{stats.lowStockCount} species with low stock levels</Text>
                </Box>
              </Group>
            </Paper>
          )}
        </Card>

        <Card padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <Text fw={700}>{t('Recent Sales')}</Text>
            <Button variant="subtle" size="xs" onClick={() => navigate('/sales')}>
              {t('View All')}
            </Button>
          </Group>

          {recentSales.length > 0 ? (
            <Stack gap="sm">
              {recentSales.map((sale) => {
                const total = sale.Items?.reduce((sum, item) => sum + (item.Quantity * item.UnitPrice), 0) || 0;
                return (
                  <Paper key={sale.Id} p="sm" radius="sm" withBorder>
                    <Group justify="space-between">
                      <Box>
                        <Text size="sm" fw={500}>{sale.CustomerName}</Text>
                        <Text size="xs" c="dimmed">{new Date(sale.Date).toLocaleDateString()}</Text>
                      </Box>
                      <Badge color="green" variant="light">
                        ${total.toFixed(2)}
                      </Badge>
                    </Group>
                  </Paper>
                );
              })}
            </Stack>
          ) : (
            <Text c="dimmed" size="sm" ta="center" py="xl">
              No recent sales yet
            </Text>
          )}
        </Card>
      </SimpleGrid>

      {highMortalityAlerts.length > 0 && (
        <Card padding="lg" radius="md" withBorder mt="lg">
          <Group justify="space-between" mb="md">
            <Group gap="sm">
              <IconSkull size={22} color="var(--mantine-color-red-6)" />
              <Box>
                <Text fw={700}>{t('High Mortality Alert')}</Text>
                <Text size="xs" c="dimmed">{highMortalityAlerts.length} lot(s) exceeding mortality threshold</Text>
              </Box>
            </Group>
            <Button variant="subtle" size="xs" onClick={() => navigate('/alerts')}>
              {t('Configure Alerts')}
            </Button>
          </Group>

          <Stack gap="xs">
            {highMortalityAlerts.slice(0, 5).map((alert) => (
              <Paper key={alert.LotId} p="sm" radius="sm" withBorder bg="red.0">
                <Group justify="space-between" wrap="wrap">
                  <Box>
                    <Text size="sm" fw={500}>{alert.SpeciesName}</Text>
                    <Text size="xs" c="dimmed">
                      {alert.SupplierName && `${alert.SupplierName} · `}
                      Lot #{alert.LotId} · Arrived {new Date(alert.ArrivalDate).toLocaleDateString()} · Stock: {alert.CurrentStock}
                    </Text>
                  </Box>
                  <Group gap="xs">
                    <Badge color="red" variant="filled">{alert.MortalityRatePercent}% mortality</Badge>
                    <Badge color="orange" variant="light">-${alert.CostLost.toFixed(2)}</Badge>
                  </Group>
                </Group>
              </Paper>
            ))}
            {highMortalityAlerts.length > 5 && (
              <Text size="xs" c="dimmed" ta="center">
                {t('And {count} more...', { count: highMortalityAlerts.length - 5 })}
              </Text>
            )}
          </Stack>
        </Card>
      )}
    </Box>
  );
}

export default DashboardPage;