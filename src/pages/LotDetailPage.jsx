import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Text, Card, Group, Stack, Badge, Paper, SimpleGrid, Loader,
  Table, Timeline, ThemeIcon, Button, ActionIcon
} from '@mantine/core';
import {
  IconArrowLeft, IconPackage, IconSkull, IconShoppingCart, IconClock,
  IconCalendar, IconReceipt
} from '@tabler/icons-react';
import { LoadingState, EmptyState } from '../components/ui';
import { inventoryLotsApi } from '../api/inventoryLots';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';

function LotDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await inventoryLotsApi.getHistory(id);
      setHistory(res.data);
    } catch {
      notifications.show({ title: t('Error'), message: t('Failed to load lot history'), color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;

  if (!history) {
    return (
      <Box>
        <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={() => navigate('/inventory')} mb="lg">
          {t('Back to Inventory')}
        </Button>
        <EmptyState title={t('Lot not found')} />
      </Box>
    );
  }

  const getStockStatus = () => {
    if (history.CurrentStock === 0) return { label: t('Empty'), color: 'red' };
    if (history.CurrentStock < 10) return { label: t('Low'), color: 'yellow' };
    return { label: t('Available'), color: 'green' };
  };

  const status = getStockStatus();
  const soldTotal = history.Events
    .filter(e => e.EventType === 'Sold')
    .reduce((sum, e) => sum + e.Quantity, 0);
  const mortalityTotal = history.Events
    .filter(e => e.EventType === 'Mortality')
    .reduce((sum, e) => sum + e.Quantity, 0);

  return (
    <Box>
      <Group justify="space-between" mb="lg">
        <Group gap="sm">
          <ActionIcon variant="subtle" onClick={() => navigate('/inventory')}>
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Box>
            <Text size="xl" fw={700}>
              {t('Lot #{id} — {name}', { id: history.LotId, name: history.SpeciesName })}
            </Text>
            {history.VariantName && (
              <Text size="sm" c="dimmed">{history.VariantName}</Text>
            )}
          </Box>
        </Group>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mb="xl">
        <Card padding="lg" radius="md" withBorder>
          <Group gap="sm">
            <ThemeIcon color="blue" variant="light" size="lg"><IconPackage size={18} /></ThemeIcon>
            <Box>
              <Text size="xs" c="dimmed">{t('Current Stock')}</Text>
              <Text size="lg" fw={700}>{history.CurrentStock}</Text>
              <Badge color={status.color} variant="light" size="xs">{status.label}</Badge>
            </Box>
          </Group>
        </Card>

        <Card padding="lg" radius="md" withBorder>
          <Group gap="sm">
            <ThemeIcon color="green" variant="light" size="lg"><IconShoppingCart size={18} /></ThemeIcon>
            <Box>
              <Text size="xs" c="dimmed">{t('Sold')}</Text>
              <Text size="lg" fw={700}>{soldTotal}</Text>
              <Text size="xs" c="dimmed">{t('{pct}% of initial', { pct: history.InitialQuantity > 0 ? Math.round(soldTotal / history.InitialQuantity * 100) : 0 })}</Text>
            </Box>
          </Group>
        </Card>

        <Card padding="lg" radius="md" withBorder>
          <Group gap="sm">
            <ThemeIcon color="red" variant="light" size="lg"><IconSkull size={18} /></ThemeIcon>
            <Box>
              <Text size="xs" c="dimmed">{t('Non-Sold Mortality')}</Text>
              <Text size="lg" fw={700}>{mortalityTotal}</Text>
              <Text size="xs" c="dimmed">{t('+ {doa} DOA', { doa: history.DeadOnArrival })}</Text>
            </Box>
          </Group>
        </Card>

        <Card padding="lg" radius="md" withBorder>
          <Group gap="sm">
            <ThemeIcon color="teal" variant="light" size="lg"><IconReceipt size={18} /></ThemeIcon>
            <Box>
              <Text size="xs" c="dimmed">{t('Unit Cost')}</Text>
              <Text size="lg" fw={700}>${history.UnitCost.toFixed(2)}</Text>
              <Text size="xs" c="dimmed">{t('Initial: {qty}', { qty: history.InitialQuantity })}</Text>
            </Box>
          </Group>
        </Card>
      </SimpleGrid>

      <Card padding="lg" radius="md" withBorder mb="lg">
        <Text fw={700} mb="md">{t('Lot Information')}</Text>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          <Box>
            <Text size="xs" c="dimmed">{t('Supplier')}</Text>
            <Text size="sm" fw={500}>{history.SupplierName || '—'}</Text>
          </Box>
          <Box>
            <Text size="xs" c="dimmed">{t('Arrival Date')}</Text>
            <Text size="sm" fw={500}>{new Date(history.ArrivalDate).toLocaleDateString()}</Text>
          </Box>
          <Box>
            <Text size="xs" c="dimmed">{t('Batch Number')}</Text>
            <Text size="sm" fw={500}>{history.BatchNumber || '—'}</Text>
          </Box>
          <Box>
            <Text size="xs" c="dimmed">{t('Initial Quantity')}</Text>
            <Text size="sm" fw={500}>{history.InitialQuantity}</Text>
          </Box>
          <Box>
            <Text size="xs" c="dimmed">{t('Dead on Arrival')}</Text>
            <Text size="sm" fw={500}>{history.DeadOnArrival}</Text>
          </Box>
          <Box>
            <Text size="xs" c="dimmed">{t('Total Losses')}</Text>
            <Text size="sm" fw={500}>{history.InitialQuantity - history.CurrentStock}</Text>
          </Box>
        </SimpleGrid>
      </Card>

      <Card padding="lg" radius="md" withBorder>
        <Text fw={700} mb="lg">{t('History Timeline')}</Text>

        {history.Events.length === 0 ? (
          <Text c="dimmed">{t('No events recorded')}</Text>
        ) : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('Date')}</Table.Th>
                <Table.Th>{t('Event')}</Table.Th>
                <Table.Th>{t('Quantity')}</Table.Th>
                <Table.Th>{t('Details')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {[...history.Events].reverse().map((event, i) => {
                const icon = event.EventType === 'Arrival'
                  ? <IconPackage size={16} />
                  : event.EventType === 'Sold'
                    ? <IconShoppingCart size={16} />
                    : <IconSkull size={16} />;
                const color = event.EventType === 'Arrival'
                  ? 'blue'
                  : event.EventType === 'Sold'
                    ? 'green'
                    : 'red';

                return (
                  <Table.Tr key={i} style={event.EventType === 'Mortality' && event.Cause !== 'Sold' ? { backgroundColor: 'rgba(255,0,0,0.02)' } : undefined}>
                    <Table.Td>
                      <Group gap="xs">
                        <IconCalendar size={14} color="var(--mantine-color-gray-5)" />
                        {new Date(event.Date).toLocaleDateString()}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={color} variant="light" leftSection={icon}>
                        {t(event.EventType)}
                      </Badge>
                    </Table.Td>
                    <Table.Td fw={500}>{event.Quantity > 0 ? `-${event.Quantity}` : `${event.Quantity}`}</Table.Td>
                    <Table.Td>
                      <Text size="xs">
                        {event.Cause && event.EventType !== 'Arrival' && `${event.Cause}`}
                        {event.Notes && ` — ${event.Notes}`}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        )}
      </Card>
    </Box>
  );
}

export default LotDetailPage;
