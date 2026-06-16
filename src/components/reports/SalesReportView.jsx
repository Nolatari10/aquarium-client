import { useState } from 'react'
import { Text, Card, Table, Group, Button, TextInput, SimpleGrid, Stack, Paper, Badge } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { reportsApi } from '../../api/reports'
import ExportCSV from '../report/ExportCSV'
import ExportPDF from '../report/ExportPDF'
import { useAuth } from '../../hooks/useAuth'

export default function SalesReportView({ t }) {
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
    try { setLoading(true); const r = await reportsApi.getSalesReport(filters.startDate, filters.endDate, 1, 50); setReport(r.data) }
    catch { notifications.show({ title: t('Error'), message: t('Failed to load sales report'), color: 'red' }) }
    finally { setLoading(false) }
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
                <ExportCSV data={report.Sales || []} fileName="sales_report.csv" />
                <ExportPDF data={report} title={t('Sales Report')} subtitle={filters.startDate && filters.endDate ? `${filters.startDate} — ${filters.endDate}` : undefined} fileName="Sales_Report.pdf" tenantName={user?.tenantName} />
              </Group>
            )}
          </Group>
        </Stack>
      </Paper>

      {!report && !loading && (
        <Paper p="xl" ta="center" withBorder><Text c="dimmed">{t('No data loaded')}</Text></Paper>
      )}

      {report && report.Sales.length === 0 ? (
        <Paper p="xl" ta="center" withBorder><Text c="dimmed">{t('No sales in this period')}</Text></Paper>
      ) : report && (
        <>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            <Card padding="lg" radius="md" withBorder>
              <Text size="sm" c="dimmed">{t('Total Revenue')}</Text>
              <Text size="xl" fw={700} c="green.7">${report.TotalRevenue.toFixed(2)}</Text>
            </Card>
            <Card padding="lg" radius="md" withBorder>
              <Text size="sm" c="dimmed">{t('Items Sold')}</Text>
              <Text size="xl" fw={700}>{report.TotalItemsSold}</Text>
            </Card>
          </SimpleGrid>
          <Card padding="lg" radius="md" withBorder>
            <Text fw={700} mb="md">{t('Top Selling Species')}</Text>
            <Table>
              <Table.Thead>
                <Table.Tr><Table.Th>{t('Species')}</Table.Th><Table.Th>{t('Qty Sold')}</Table.Th><Table.Th>{t('Revenue')}</Table.Th></Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {report.TopSpecies.map((s, idx) => (
                  <Table.Tr key={idx}><Table.Td fw={500}>{s.CommonName}</Table.Td><Table.Td>{s.TotalQuantitySold}</Table.Td><Table.Td>${s.TotalRevenue.toFixed(2)}</Table.Td></Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
          <Card padding="lg" radius="md" withBorder>
            <Text fw={700} mb="md">{t('Recent Sales')}</Text>
            <Table>
              <Table.Thead>
                <Table.Tr><Table.Th>{t('Date')}</Table.Th><Table.Th>{t('Customer')}</Table.Th><Table.Th>{t('Items')}</Table.Th><Table.Th>{t('Total')}</Table.Th></Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {report.Sales.slice(0, 10).map((sale, idx) => (
                  <Table.Tr key={idx}><Table.Td>{new Date(sale.Date).toLocaleDateString()}</Table.Td><Table.Td fw={500}>{sale.CustomerName}</Table.Td><Table.Td>{sale.ItemCount}</Table.Td><Table.Td><Badge color="green" variant="light">${sale.TotalAmount.toFixed(2)}</Badge></Table.Td></Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        </>
      )}
    </Stack>
  )
}
