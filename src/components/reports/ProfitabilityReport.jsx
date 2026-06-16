import { useState } from 'react'
import { Text, Card, Table, Group, Button, TextInput, SimpleGrid, Stack, Paper, Badge } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { reportsApi } from '../../api/reports'
import ExportCSV from '../report/ExportCSV'
import ExportPDF from '../report/ExportPDF'
import { useAuth } from '../../hooks/useAuth'

export default function ProfitabilityReport({ t }) {
  const { user } = useAuth();
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30*86400000).toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
  })

  const load = async () => {
    if (!filters.startDate || !filters.endDate) {
      notifications.show({ title: t('Error'), message: t('Select date range'), color: 'red' })
      return
    }
    try {
      setLoading(true)
      const r = await reportsApi.getProfitability(filters.startDate, filters.endDate)
      setReport(r.data)
    } catch {
      notifications.show({ title: t('Error'), message: t('Failed to load profitability report'), color: 'red' })
    } finally { setLoading(false) }
  }

  return (
    <Stack gap="lg">
      <Paper p="lg" radius="md" withBorder>
        <Stack gap="sm">
          <Text fw={500} size="sm">{t('Filters')}</Text>
          <Group grow>
            <TextInput type="date" label={t('Start Date')} value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
            <TextInput type="date" label={t('End Date')} value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
          </Group>
          <Group justify="space-between">
            <Button onClick={load} loading={loading} variant="light">{t('Load Report')}</Button>
            {report && (
              <Group gap="xs">
                <ExportCSV data={report.BySpecies || []} fileName="profitability_report.csv" />
                <ExportPDF data={report} title={t('Profitability Report')} fileName="Profitability_Report.pdf" tenantName={user?.tenantName} />
              </Group>
            )}
          </Group>
        </Stack>
      </Paper>

      {!report && !loading && (
        <Paper p="xl" ta="center" withBorder><Text c="dimmed">{t('No data loaded')}</Text></Paper>
      )}

      {report && report.BySpecies.length === 0 ? (
        <Paper p="xl" ta="center" withBorder><Text c="dimmed">{t('No sales in selected period')}</Text></Paper>
      ) : report && (
        <>
          <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="lg">
            <Card padding="lg" radius="md" withBorder><Text size="sm" c="dimmed">{t('Total Revenue')}</Text><Text size="xl" fw={700} c="teal.7">${report.TotalRevenue.toFixed(2)}</Text></Card>
            <Card padding="lg" radius="md" withBorder><Text size="sm" c="dimmed">{t('Total Cost')}</Text><Text size="xl" fw={700} c="orange.7">${report.TotalCost.toFixed(2)}</Text></Card>
            <Card padding="lg" radius="md" withBorder><Text size="sm" c="dimmed">{t('Gross Profit')}</Text><Text size="xl" fw={700} c={report.GrossProfit >= 0 ? 'green.7' : 'red.7'}>${report.GrossProfit.toFixed(2)}</Text></Card>
            <Card padding="lg" radius="md" withBorder><Text size="sm" c="dimmed">{t('Profit Margin')}</Text><Text size="xl" fw={700} c={report.ProfitMarginPercent >= 0 ? 'green.7' : 'red.7'}>{report.ProfitMarginPercent}%</Text></Card>
          </SimpleGrid>
          <Card padding="lg" radius="md" withBorder>
            <Text fw={700} mb="md">{t('Profitability by Species')}</Text>
            <Table>
              <Table.Thead><Table.Tr><Table.Th>{t('Species')}</Table.Th><Table.Th>{t('Category')}</Table.Th><Table.Th>{t('Sold')}</Table.Th><Table.Th>{t('Revenue')}</Table.Th><Table.Th>{t('Cost')}</Table.Th><Table.Th>{t('Profit')}</Table.Th><Table.Th>{t('Margin')}</Table.Th></Table.Tr></Table.Thead>
              <Table.Tbody>
                {report.BySpecies.map((s) => (
                  <Table.Tr key={s.SpeciesId} style={s.Profit < 0 ? { backgroundColor: 'rgba(255,0,0,0.04)' } : undefined}>
                    <Table.Td fw={500}>{s.CommonName}</Table.Td><Table.Td>{s.Category}</Table.Td><Table.Td>{s.QuantitySold}</Table.Td><Table.Td>${s.Revenue.toFixed(2)}</Table.Td><Table.Td>${s.Cost.toFixed(2)}</Table.Td>
                    <Table.Td fw={500} c={s.Profit >= 0 ? 'green.7' : 'red.7'}>${s.Profit.toFixed(2)}</Table.Td>
                    <Table.Td><Badge color={s.MarginPercent >= 0 ? 'green' : 'red'} variant="light">{s.MarginPercent}%</Badge></Table.Td>
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
