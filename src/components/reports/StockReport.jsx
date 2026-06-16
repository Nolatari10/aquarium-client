import { useState } from 'react'
import { Text, Card, Table, Group, Button, SimpleGrid, Stack, Paper, Badge } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { reportsApi } from '../../api/reports'
import ExportCSV from '../report/ExportCSV'
import ExportPDF from '../report/ExportPDF'
import { useAuth } from '../../hooks/useAuth'

export default function StockReport({ t }) {
  const { user } = useAuth();
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    try { setLoading(true); const r = await reportsApi.getStockReport(); setReport(r.data) }
    catch { notifications.show({ title: t('Error'), message: t('Failed to load stock report'), color: 'red' }) }
    finally { setLoading(false) }
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Button onClick={load} loading={loading} variant="light">
          {report ? t('Refresh') : t('Load Stock Report')}
        </Button>
        {report && (
          <Group gap="xs">
            <ExportCSV data={report.Items || []} fileName="stock_report.csv" />
            <ExportPDF data={report} title={t('Stock Report')} fileName="Stock_Report.pdf" tenantName={user?.tenantName} />
          </Group>
        )}
      </Group>

      {!report && !loading && (
        <Paper p="xl" ta="center" withBorder><Text c="dimmed">{t('No data loaded')}</Text></Paper>
      )}

      {report && report.Items.length === 0 ? (
        <Paper p="xl" ta="center" withBorder><Text c="dimmed">{t('No stock to report')}</Text></Paper>
      ) : report && (
        <>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            <Card padding="lg" radius="md" withBorder>
              <Text size="sm" c="dimmed">{t('Total Species')}</Text>
              <Text size="xl" fw={700}>{report.TotalSpecies}</Text>
            </Card>
            <Card padding="lg" radius="md" withBorder>
              <Text size="sm" c="dimmed">{t('Total Stock')}</Text>
              <Text size="xl" fw={700} c="teal.7">{report.TotalStock}</Text>
            </Card>
            <Card padding="lg" radius="md" withBorder>
              <Text size="sm" c="dimmed">{t('Total Cost Value')}</Text>
              <Text size="xl" fw={700} c="teal.7">${report.Items.reduce((s, i) => s + i.TotalCostValue, 0).toFixed(2)}</Text>
            </Card>
          </SimpleGrid>
          <Card padding="lg" radius="md" withBorder>
            <Text fw={700} mb="md">{t('Current Stock by Species')}</Text>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('Species')}</Table.Th>
                  <Table.Th>{t('Category')}</Table.Th>
                  <Table.Th>{t('In Stock')}</Table.Th>
                  <Table.Th>{t('Cost Value')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {report.Items.map((item, idx) => (
                  <Table.Tr key={idx}>
                    <Table.Td fw={500}>{item.CommonName}</Table.Td>
                    <Table.Td><Badge variant="light" size="sm">{item.Category}</Badge></Table.Td>
                    <Table.Td>{item.CurrentStock}</Table.Td>
                    <Table.Td>${item.TotalCostValue.toFixed(2)}</Table.Td>
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
