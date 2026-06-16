import { useState } from 'react'
import { Text, Card, Table, Group, Button, Select, SimpleGrid, Stack, Paper, Badge } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconAlertTriangle, IconCheck, IconClock } from '@tabler/icons-react'
import { reportsApi } from '../../api/reports'
import ExportCSV from '../report/ExportCSV'
import ExportPDF from '../report/ExportPDF'
import { useAuth } from '../../hooks/useAuth'

export default function TurnoverReport({ t, speciesOptions, supplierOptions }) {
  const { user } = useAuth();
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ speciesId: null, supplierId: null })

  const load = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filters.speciesId) params.speciesId = filters.speciesId
      if (filters.supplierId) params.supplierId = filters.supplierId
      const r = await reportsApi.getInventoryTurnover(params)
      setReport(r.data)
    } catch {
      notifications.show({ title: t('Error'), message: t('Failed to load turnover report'), color: 'red' })
    } finally { setLoading(false) }
  }

  return (
    <Stack gap="lg">
      <Paper p="lg" radius="md" withBorder>
        <Stack gap="sm">
          <Text fw={500} size="sm">{t('Filters')}</Text>
          <Group grow>
            <Select label={t('Species')} placeholder={t('All species')} data={speciesOptions} value={filters.speciesId} onChange={(v) => setFilters({ ...filters, speciesId: v })} clearable />
            <Select label={t('Supplier')} placeholder={t('All suppliers')} data={supplierOptions} value={filters.supplierId} onChange={(v) => setFilters({ ...filters, supplierId: v })} clearable />
          </Group>
          <Group justify="space-between">
            <Button onClick={load} loading={loading} variant="light">{t('Load Report')}</Button>
            {report && (
              <Group gap="xs">
                <ExportCSV data={report.Lots || []} fileName="inventory_aging.csv" />
                <ExportPDF data={report} title={t('Inventory Aging')} fileName="Inventory_Aging.pdf" tenantName={user?.tenantName} />
              </Group>
            )}
          </Group>
        </Stack>
      </Paper>

      {!report && !loading && (
        <Paper p="xl" ta="center" withBorder><Text c="dimmed">{t('No data loaded')}</Text></Paper>
      )}

      {report && report.Lots.length === 0 ? (
        <Paper p="xl" ta="center" withBorder><Text c="dimmed">{t('No open lots to analyze')}</Text></Paper>
      ) : report && (
        <>
          <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="lg">
            <Card padding="lg" radius="md" withBorder><Text size="sm" c="dimmed">{t('Fresh')} (&lt;30d)</Text><Text size="xl" fw={700} c="green.7">{report.FreshLots}</Text></Card>
            <Card padding="lg" radius="md" withBorder><Text size="sm" c="dimmed">{t('Aging')} (30-90d)</Text><Text size="xl" fw={700} c="orange.7">{report.AgingLots}</Text></Card>
            <Card padding="lg" radius="md" withBorder><Text size="sm" c="dimmed">{t('Old')} (&gt;90d)</Text><Text size="xl" fw={700} c="red.7">{report.OldLots}</Text></Card>
            <Card padding="lg" radius="md" withBorder><Text size="sm" c="dimmed">{t('Avg Days in Stock')}</Text><Text size="xl" fw={700}>{report.AverageDaysInStock}</Text></Card>
          </SimpleGrid>
          <Card padding="lg" radius="md" withBorder>
            <Text fw={700} mb="md">{t('Lot Aging Detail')}</Text>
            <Text size="xs" c="dimmed" mb="sm">{t('Old lots (&gt;90 days) highlighted — consider discounting or promoting')}</Text>
            <Table>
              <Table.Thead><Table.Tr><Table.Th>{t('Species')}</Table.Th><Table.Th>{t('Supplier')}</Table.Th><Table.Th>{t('Arrived')}</Table.Th><Table.Th>{t('Days')}</Table.Th><Table.Th>{t('Stock')}</Table.Th><Table.Th>{t('Sold')}</Table.Th><Table.Th>{t('Status')}</Table.Th><Table.Th>{t('Cost at Risk')}</Table.Th></Table.Tr></Table.Thead>
              <Table.Tbody>
                {report.Lots.map((lot) => (
                  <Table.Tr key={lot.LotId} style={lot.AgingStatus === 'Old' ? { backgroundColor: 'rgba(255,0,0,0.06)' } : lot.AgingStatus === 'Aging' ? { backgroundColor: 'rgba(255,165,0,0.04)' } : undefined}>
                    <Table.Td fw={500}>{lot.SpeciesName}</Table.Td><Table.Td>{lot.SupplierName || '—'}</Table.Td><Table.Td>{new Date(lot.ArrivalDate).toLocaleDateString()}</Table.Td><Table.Td>{lot.DaysInStock}</Table.Td><Table.Td>{lot.CurrentStock}</Table.Td><Table.Td>{lot.SoldQuantity}</Table.Td>
                    <Table.Td><Badge color={lot.AgingStatus === 'Old' ? 'red' : lot.AgingStatus === 'Aging' ? 'orange' : 'green'} variant="light" leftSection={lot.AgingStatus === 'Old' ? <IconClock size={12} /> : lot.AgingStatus === 'Aging' ? <IconAlertTriangle size={12} /> : <IconCheck size={12} />}>{lot.AgingStatus}</Badge></Table.Td>
                    <Table.Td fw={500} c={lot.AgingStatus === 'Old' ? 'red.7' : undefined}>${lot.CostAtRisk.toFixed(2)}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        </>
      )}
    </Stack>
  )
}
