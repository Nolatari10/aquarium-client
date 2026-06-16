import { useState } from 'react'
import { Text, Card, Table, Group, Button, SimpleGrid, Stack, Paper, Badge } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { reportsApi } from '../../api/reports'
import ExportCSV from '../report/ExportCSV'
import ExportPDF from '../report/ExportPDF'
import { useAuth } from '../../hooks/useAuth'

export default function ValuationReport({ t }) {
  const { user } = useAuth();
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    try { setLoading(true); const r = await reportsApi.getInventoryValuation(); setReport(r.data) }
    catch { notifications.show({ title: t('Error'), message: t('Failed to load valuation report'), color: 'red' }) }
    finally { setLoading(false) }
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Button onClick={load} loading={loading} variant="light">
          {report ? t('Refresh') : t('Load Valuation Report')}
        </Button>
        {report && (
          <Group gap="xs">
            <ExportCSV data={report.ByCategory || []} fileName="valuation_report.csv" />
            <ExportPDF data={report} title={t('Valuation Report')} fileName="Valuation_Report.pdf" tenantName={user?.tenantName} />
          </Group>
        )}
      </Group>

      {!report && !loading && (
        <Paper p="xl" ta="center" withBorder><Text c="dimmed">{t('No data loaded')}</Text></Paper>
      )}

      {report && report.TotalLots === 0 ? (
        <Paper p="xl" ta="center" withBorder><Text c="dimmed">{t('No stock to value')}</Text></Paper>
      ) : report && (
        <>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
            <Card padding="lg" radius="md" withBorder>
              <Text size="sm" c="dimmed">{t('Total Units')}</Text>
              <Text size="xl" fw={700}>{report.TotalUnitsInStock}</Text>
            </Card>
            <Card padding="lg" radius="md" withBorder>
              <Text size="sm" c="dimmed">{t('Total Cost')}</Text>
              <Text size="xl" fw={700} c="teal.7">${report.TotalCostValue.toFixed(2)}</Text>
            </Card>
            <Card padding="lg" radius="md" withBorder>
              <Text size="sm" c="dimmed">{t('Lots')}</Text>
              <Text size="xl" fw={700}>{report.TotalLots}</Text>
            </Card>
            <Card padding="lg" radius="md" withBorder>
              <Text size="sm" c="dimmed">{t('Avg Cost/Unit')}</Text>
              <Text size="xl" fw={700}>${report.AverageUnitCost.toFixed(2)}</Text>
            </Card>
          </SimpleGrid>
          <Card padding="lg" radius="md" withBorder>
            <Text fw={700} mb="md">{t('Valuation by Category')}</Text>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('Category')}</Table.Th>
                  <Table.Th>{t('Units')}</Table.Th>
                  <Table.Th>{t('Cost Value')}</Table.Th>
                  <Table.Th>{t('Avg Cost')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {report.ByCategory.map((cat, idx) => (
                  <Table.Tr key={idx}>
                    <Table.Td><Badge variant="light" size="sm">{cat.Category}</Badge></Table.Td>
                    <Table.Td>{cat.UnitsInStock}</Table.Td>
                    <Table.Td>${cat.TotalCostValue.toFixed(2)}</Table.Td>
                    <Table.Td>${cat.AverageUnitCost.toFixed(2)}</Table.Td>
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
