import { useState } from 'react'
import { Text, Card, Table, Group, Button, TextInput, Select, SimpleGrid, Stack, Paper, Badge, Tooltip, ThemeIcon } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconAlertTriangle, IconCheck } from '@tabler/icons-react'
import { reportsApi } from '../../api/reports'
import ExportCSV from '../report/ExportCSV'
import ExportPDF from '../report/ExportPDF'
import { useAuth } from '../../hooks/useAuth'

export default function MortalityReportView({ t, speciesOptions, supplierOptions }) {
  const { user } = useAuth();
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30*86400000).toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    speciesId: null,
    supplierId: null,
  })

  const load = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate
      if (filters.speciesId) params.speciesId = filters.speciesId
      if (filters.supplierId) params.supplierId = filters.supplierId
      const r = await reportsApi.getMortalityReport(params)
      setReport(r.data)
    } catch {
      notifications.show({ title: t('Error'), message: t('Failed to load mortality report'), color: 'red' })
    } finally { setLoading(false) }
  }

  return (
    <Stack gap="lg">
      <Paper p="lg" radius="md" withBorder>
        <Stack gap="sm">
          <Text fw={500} size="sm">{t('Filters')}</Text>
          <Group grow>
            <TextInput label={t('Start Date')} type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
            <TextInput label={t('End Date')} type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
          </Group>
          <Group grow>
            <Select label={t('Species')} placeholder={t('All species')} data={speciesOptions} value={filters.speciesId} onChange={(v) => setFilters({ ...filters, speciesId: v })} clearable />
            <Select label={t('Supplier')} placeholder={t('All suppliers')} data={supplierOptions} value={filters.supplierId} onChange={(v) => setFilters({ ...filters, supplierId: v })} clearable />
          </Group>
          <Group justify="space-between">
            <Button onClick={load} loading={loading} variant="light">{t('Load Report')}</Button>
            {report && (
              <Group gap="xs">
                <ExportCSV data={report.Summaries || []} fileName="mortality_report.csv" />
                <ExportPDF data={report} title={t('Mortality Report')} fileName="Mortality_Report.pdf" tenantName={user?.tenantName} />
              </Group>
            )}
          </Group>
        </Stack>
      </Paper>

      {!report && !loading && (
        <Paper p="xl" ta="center" withBorder><Text c="dimmed">{t('No data loaded')}</Text></Paper>
      )}

      {report && report.Summaries.length === 0 ? (
        <Paper p="xl" ta="center" withBorder><Text c="dimmed">{t('No mortality records for this period')}</Text></Paper>
      ) : report && (
        <>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            <Card padding="lg" radius="md" withBorder>
              <Text size="sm" c="dimmed">{t('Total Deaths')}</Text>
              <Text size="xl" fw={700} c="red.7">{report.TotalDeaths}</Text>
            </Card>
            <Card padding="lg" radius="md" withBorder>
              <Text size="sm" c="dimmed">{t('Sold')}</Text>
              <Text size="xl" fw={700} c="green.7">{report.TotalSold}</Text>
            </Card>
            <Card padding="lg" radius="md" withBorder>
              <Text size="sm" c="dimmed">{t('Other Causes')}</Text>
              <Text size="xl" fw={700} c="orange.7">{report.TotalOtherCauses}</Text>
            </Card>
          </SimpleGrid>
          <Stack gap="sm">
            {report.Summaries.map((summary, idx) => (
              <Card key={idx} padding="lg" radius="md" withBorder>
                <Group justify="space-between" mb="sm">
                  <Group gap="xs">
                    <Text fw={700}>{summary.CommonName}</Text>
                    {summary.SupplierName && <Text size="xs" c="dimmed">via {summary.SupplierName}</Text>}
                  </Group>
                  <Group gap="xs">
                    {summary.OtherCauses > 0 && <Tooltip label={`${summary.OtherCauses} non-sold deaths`}><ThemeIcon color="orange" variant="light" size="sm"><IconAlertTriangle size={12} /></ThemeIcon></Tooltip>}
                    <Badge color="red">{summary.TotalDeaths} {t('deaths')}</Badge>
                  </Group>
                </Group>
                <Group gap="md">
                  <Badge color="green" variant="light">{t('Sold')}: {summary.Sold}</Badge>
                  <Badge color="orange" variant="light">{t('Other')}: {summary.OtherCauses}</Badge>
                </Group>
              </Card>
            ))}
          </Stack>
        </>
      )}
    </Stack>
  )
}
