import { useState, useEffect, useCallback } from 'react';
import { Group, SimpleGrid, Box, Button, Stack, Text, Paper } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import {
  IconFish, IconPackage, IconShoppingCart, IconCash,
  IconAlertTriangle, IconSkull, IconArrowRight,
  IconPlus, IconDroplet,
} from '@tabler/icons-react';
import { catalogApi } from '../api/catalog';
import { salesApi } from '../api/sales';
import { reportsApi } from '../api/reports';
import { alertsApi } from '../api/alerts';
import { useTranslation } from 'react-i18next';
import { MetricCard, PageHero, SectionCard, StatusBadge, AsyncStateWrapper } from '../components/ui';

function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [highMortalityAlerts, setHighMortalityAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      setError(false);
      setLoading(true);
      const [catalog, sales, stockReport] = await Promise.all([
        catalogApi.getAll(1, 1000),
        salesApi.getAll(1, 1000),
        reportsApi.getStockReport(),
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
        totalRevenue,
        lowStockCount,
      });

      setRecentSales(salesData.slice(-5).reverse());

      try {
        const alertsData = await alertsApi.getActiveHighMortalityAlerts();
        setHighMortalityAlerts(alertsData.data || []);
      } catch {
        setHighMortalityAlerts([]);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return (
    <Box>
      <PageHero
        title={t('Dashboard')}
        description={t('Operations overview — monitor stock, sales, and tank health')}
      />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mb="xl">
        <MetricCard
          title={t('Active Species')}
          value={loading ? '...' : stats?.totalSpecies ?? 0}
          icon={IconFish}
          color="aqua"
          description={t('in catalog')}
          onClick={() => navigate('/species')}
        />
        <MetricCard
          title={t('Live Stock')}
          value={loading ? '...' : stats?.totalStock ?? 0}
          icon={IconDroplet}
          color="green"
          description={t('units across inventory')}
          onClick={() => navigate('/inventory')}
        />
        <MetricCard
          title={t('Sales')}
          value={loading ? '...' : stats?.recentSales ?? 0}
          icon={IconShoppingCart}
          color="yellow"
          description={t('transactions recorded')}
          onClick={() => navigate('/sales')}
        />
        <MetricCard
          title={t('Revenue')}
          value={loading ? '...' : `$${(stats?.totalRevenue ?? 0).toFixed(2)}`}
          icon={IconCash}
          color="blue"
          description={t('total sales revenue')}
          onClick={() => navigate('/reports')}
        />
      </SimpleGrid>

      {error ? (
        <SectionCard>
          <AsyncStateWrapper error errorMessage={t('Failed to load dashboard data')} onRetry={loadDashboardData} />
        </SectionCard>
      ) : (
        <>

      {stats?.lowStockCount > 0 && (
        <Paper
          p="md"
          mb="lg"
          radius="md"
          style={{
            background: 'var(--aqua-scheme-surface1)',
            border: '1px solid rgba(242, 185, 75, 0.2)',
          }}
        >
          <Group gap="sm">
            <IconAlertTriangle size={20} style={{ color: 'var(--aqua-warning)' }} />
            <Box style={{ flex: 1 }}>
              <Text size="sm" fw={600}>{t('Low Stock Alert')}</Text>
              <Text size="xs" c="dimmed">
                {stats.lowStockCount} {t('species have fewer than 10 units remaining')}
              </Text>
            </Box>
            <Button variant="light" color="yellow" size="xs" onClick={() => navigate('/inventory')}>
              {t('Review')}
            </Button>
          </Group>
        </Paper>
      )}

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg" mb="lg">
        <SectionCard title={t('Quick Actions')}>
          <SimpleGrid cols={2} spacing="sm">
            {[
              { label: t('Add Species'), icon: IconPlus, color: 'aqua', to: '/species' },
              { label: t('Bulk Receive'), icon: IconPackage, color: 'green', to: '/inventory/bulk-receive' },
              { label: t('Record Sale'), icon: IconShoppingCart, color: 'yellow', to: '/sales' },
              { label: t('View Reports'), icon: IconArrowRight, color: 'blue', to: '/reports' },
            ].map((action) => (
              <Button
                key={action.label}
                variant="light"
                color={action.color}
                fullWidth
                leftSection={<action.icon size={16} />}
                onClick={() => navigate(action.to)}
                style={{ justifyContent: 'flex-start' }}
              >
                {action.label}
              </Button>
            ))}
          </SimpleGrid>
        </SectionCard>

        <SectionCard
          title={t('Recent Sales')}
          action={
            <Button variant="subtle" size="xs" onClick={() => navigate('/sales')} color="aqua">
              {t('View All')}
            </Button>
          }
        >
          {recentSales.length > 0 ? (
            <Stack gap="xs">
              {recentSales.map((sale) => {
                const total = sale.Items?.reduce((sum, item) => sum + (item.Quantity * item.UnitPrice), 0) || 0;
                return (
                  <Paper
                    key={sale.Id}
                    p="sm"
                    radius="md"
                    className="raised-card"
                  >
                    <Group justify="space-between">
                      <Box>
                        <Text size="sm" fw={500}>{sale.CustomerName}</Text>
                        <Text size="xs" c="dimmed">
                          {new Date(sale.Date).toLocaleDateString()}
                        </Text>
                      </Box>
                      <StatusBadge status="ok" label={`$${total.toFixed(2)}`} />
                    </Group>
                  </Paper>
                );
              })}
            </Stack>
          ) : (
            <AsyncStateWrapper empty emptyTitle={t('No sales yet')} emptyDescription={t('Sales will appear here')} />
          )}
        </SectionCard>
      </SimpleGrid>

      {highMortalityAlerts.length > 0 && (
        <SectionCard
          title={t('High Mortality Alerts')}
          action={
            <Button variant="subtle" size="xs" onClick={() => navigate('/alerts')} color="aqua">
              {t('Configure')}
            </Button>
          }
        >
          <Stack gap="xs">
            {highMortalityAlerts.slice(0, 5).map((alert, i) => (
              <Paper
                key={alert.LotId}
                p="sm"
                radius="md"
                style={{
                  background: 'var(--aqua-scheme-surface1)',
                  border: '1px solid rgba(245, 108, 108, 0.15)',
                  animation: `aqua-slide-up 0.3s ease ${i * 60}ms both`,
                }}
              >
                <Group justify="space-between" wrap="wrap">
                  <Group gap="sm">
                    <IconSkull size={18} style={{ color: 'var(--aqua-error)' }} />
                    <Box>
                      <Text size="sm" fw={600}>{alert.SpeciesName}</Text>
                      <Text size="xs" c="dimmed">
                        {alert.SupplierName && `${alert.SupplierName} · `}
                        Lot #{alert.LotId} · Stock: {alert.CurrentStock}
                      </Text>
                    </Box>
                  </Group>
                  <Group gap="xs">
                    <StatusBadge status="error" label={`${alert.MortalityRatePercent}%`} />
                    <Text size="xs" c="red.5" fw={500}>-${alert.CostLost?.toFixed(2)}</Text>
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
        </SectionCard>
      )}
      </>
      )}
    </Box>
  );
}

export default DashboardPage;
