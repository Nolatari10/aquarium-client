import { useState } from 'react'
import { Text, Card, Table, Group, Button, TextInput, Select, SimpleGrid, Stack, Paper, Badge, Tooltip, ThemeIcon } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconAlertTriangle, IconCheck } from '@tabler/icons-react'
import { reportsApi } from '../../api/reports'
import ExportCSV from '../report/ExportCSV'
import ExportPDF from '../report/ExportPDF'
import { useAuth } from '../../hooks/useAuth'

export default function SupplierPerformanceReport({ t, speciesOptions, supplierOptions }) {
  const { user } = useAuth();
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30*86400000).toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
  })

  const load = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate
      const r = await reportsApi.getSupplierPerformance(params)
      setReport(r.data)
    } catch {
      notifications.show({ title: t('Error'), message: t('Failed to load supplier performance'), color: 'red' })
    } finally { setLoading(false) }
  }

  return (
    <Stack gap="lg">
      <Paper p="lg" radius="md" withBorder>
        <Stack gap="sm">
          <Text fw={500} size="sm">{t('Date Range')}</Text>
          <Group grow>
            <TextInput label={t('Start Date')} type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
            <TextInput label={t('End Date')} type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
          </Group>
          <Group justify="space-between">
            <Button onClick={load} loading={loading} variant="light">{t('Load Report')}</Button>
            {report && (
              <Group gap="xs">
                <ExportCSV data={report.Suppliers || []} fileName="supplier_performance.csv" />
                <ExportPDF data={report} title={t('Supplier Performance')} fileName="Supplier_Performance.pdf" tenantName={user?.tenantName} />
              </Group>
            )}
          </Group>
        </Stack>
      </Paper>

      {!report && !loading && (
        <Paper p="xl" ta="center" withBorder><Text c="dimmed">{t('No data loaded')}</Text></Paper>
      )}

      {report && report.Suppliers.length === 0 ? (
        <Paper p="xl" ta="center" withBorder><Text c="dimmed">{t('No supplier data available')}</Text></Paper>
      ) : report && (
        <>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            <Card padding="lg" radius="md" withBorder><Text size="sm" c="dimmed">{t('Suppliers Evaluated')}</Text><Text size="xl" fw={700}>{report.Suppliers.length}</Text></Card>
            <Card padding="lg" radius="md" withBorder><Text size="sm" c="dimmed">{t('Cost Lost to Mortality')}</Text><Text size="xl" fw={700} c="red.7">${report.TotalCostLost.toFixed(2)}</Text></Card>
            <Card padding="lg" radius="md" withBorder><Text size="sm" c="dimmed">{t('Avg Mortality Rate')}</Text><Text size="xl" fw={700} c={report.AverageMortalityRate > 10 ? 'red.7' : 'teal.7'}>{report.AverageMortalityRate}%</Text></Card>
          </SimpleGrid>
          <Card padding="lg" radius="md" withBorder>
            <Text fw={700} mb="md">{t('Supplier Performance Ranking')}</Text>
            <Text size="xs" c="dimmed" mb="sm">{t('Ranked by mortality rate — worst performers first')}</Text>
            <Table>
              <Table.Thead><Table.Tr><Table.Th>#</Table.Th><Table.Th>{t('Supplier')}</Table.Th><Table.Th>{t('Lots')}</Table.Th><Table.Th>{t('DOA')}</Table.Th><Table.Th>{t('Non-Sold Mortality')}</Table.Th><Table.Th>{t('Cost Lost')}</Table.Th><Table.Th>{t('Mortality Rate')}</Table.Th></Table.Tr></Table.Thead>
              <Table.Tbody>
                {report.Suppliers.map((s) => (
                  <Table.Tr key={s.SupplierId} style={s.MortalityRatePercent > 15 ? { backgroundColor: 'rgba(255,0,0,0.04)' } : undefined}>
                    <Table.Td fw={500}>{s.Rank}</Table.Td><Table.Td fw={500}>{s.SupplierName}</Table.Td><Table.Td>{s.TotalLotsReceived}</Table.Td><Table.Td>{s.TotalDOA}</Table.Td><Table.Td>{s.NonSoldMortality}</Table.Td><Table.Td>${s.CostLostToMortality.toFixed(2)}</Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        {s.MortalityRatePercent > 15 && <Tooltip label={t('High mortality — consider review')}><ThemeIcon color="red" variant="light" size="sm"><IconAlertTriangle size={12} /></ThemeIcon></Tooltip>}
                        {s.MortalityRatePercent <= 5 && <Tooltip label={t('Good performance')}><ThemeIcon color="green" variant="light" size="sm"><IconCheck size={12} /></ThemeIcon></Tooltip>}
                        <Badge color={s.MortalityRatePercent > 15 ? 'red' : s.MortalityRatePercent > 5 ? 'orange' : 'green'} variant="light">{s.MortalityRatePercent}%</Badge>
                      </Group>
                    </Table.Td>
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
