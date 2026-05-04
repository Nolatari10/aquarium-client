import { useState } from 'react';
import { Text, Tabs, Card, Table, Group, Badge, Button, TextInput, Box, SimpleGrid, Stack, Paper } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { reportsApi } from '../api/reports';
import ExportCSV from '../components/report/ExportCSV';
import ExportPDF from '../components/report/ExportPDF';
import { useTranslation } from 'react-i18next';

function ReportsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [stockReport, setStockReport] = useState(null);
  const [mortalityReport, setMortalityReport] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [valuationReport, setValuationReport] = useState(null);

  const [mortalityFilters, setMortalityFilters] = useState({
    startDate: '',
    endDate: '',
    speciesId: ''
  });

  const [salesFilters, setSalesFilters] = useState({
    startDate: '',
    endDate: ''
  });

  const loadStockReport = async () => {
    try {
      setLoading(true);
      const response = await reportsApi.getStockReport();
      setStockReport(response.data);
    } catch {
      notifications.show({ title: 'Error', message: t('Failed to load stock report'), color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const loadMortalityReport = async () => {
    try {
      setLoading(true);
      const params = {};
      if (mortalityFilters.startDate) params.startDate = mortalityFilters.startDate;
      if (mortalityFilters.endDate) params.endDate = mortalityFilters.endDate;
      if (mortalityFilters.speciesId) params.speciesId = mortalityFilters.speciesId;
      const response = await reportsApi.getMortalityReport(params);
      setMortalityReport(response.data);
    } catch {
      notifications.show({ title: 'Error', message: t('Failed to load mortality report'), color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const loadSalesReport = async () => {
    if (!salesFilters.startDate || !salesFilters.endDate) {
      notifications.show({ title: 'Error', message: t('Select date range'), color: 'red' });
      return;
    }
    try {
      setLoading(true);
      const response = await reportsApi.getSalesReport(salesFilters.startDate, salesFilters.endDate);
      setSalesReport(response.data);
    } catch {
      notifications.show({ title: 'Error', message: t('Failed to load sales report'), color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const loadValuationReport = async () => {
    try {
      setLoading(true);
      const response = await reportsApi.getInventoryValuation();
      setValuationReport(response.data);
    } catch {
      notifications.show({ title: 'Error', message: t('Failed to load valuation report'), color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Text size="xl" fw={700} mb="lg">{t('Reports')}</Text>

      <Tabs defaultValue="stock" keepMounted={false}>
        <Tabs.List mb="lg">
          <Tabs.Tab value="stock">{t('Stock')}</Tabs.Tab>
          <Tabs.Tab value="mortality">{t('Mortality')}</Tabs.Tab>
          <Tabs.Tab value="sales">{t('Sales')}</Tabs.Tab>
          <Tabs.Tab value="valuation">{t('Valuation')}</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="stock">
          <Stack gap="lg">
            <Group justify="space-between">
              <Button onClick={loadStockReport} loading={loading} variant="light">
                {t('Load Stock Report')}
              </Button>
              {stockReport && (
                <Group gap="xs">
                  <ExportCSV
                    data={stockReport.Items || []}
                    fileName="stock_report.csv"
                  />
                  <ExportPDF
                    data={stockReport}
                    title={t('Stock Report')}
                    fileName="Stock_Report.pdf"
                  />
                </Group>
              )}
            </Group>

            {stockReport && (
              <>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                  <Card padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">Total Species</Text>
                    <Text size="xl" fw={700}>{stockReport.TotalSpecies}</Text>
                  </Card>
                  <Card padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">Total Stock</Text>
                    <Text size="xl" fw={700} c="teal.7">{stockReport.TotalStock}</Text>
                  </Card>
                </SimpleGrid>

                <Card padding="lg" radius="md" withBorder>
                  <Text fw={700} mb="md">Current Stock by Species</Text>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Species</Table.Th>
                        <Table.Th>Category</Table.Th>
                        <Table.Th>Current Stock</Table.Th>
                        <Table.Th>Cost Value</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {stockReport.Items.map((item, idx) => (
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
        </Tabs.Panel>

        <Tabs.Panel value="mortality">
          <Stack gap="lg">
            <Paper p="lg" radius="md" withBorder style={{ maxWidth: 500 }}>
              <Stack gap="sm">
                <Text fw={500} size="sm">Filters</Text>
                <Group grow>
                  <TextInput
                    label="Start Date"
                    type="date"
                    value={mortalityFilters.startDate}
                    onChange={(e) => setMortalityFilters({ ...mortalityFilters, startDate: e.target.value })}
                  />
                  <TextInput
                    label="End Date"
                    type="date"
                    value={mortalityFilters.endDate}
                    onChange={(e) => setMortalityFilters({ ...mortalityFilters, endDate: e.target.value })}
                  />
                </Group>
                <Group justify="space-between">
                  <Button onClick={loadMortalityReport} loading={loading} variant="light">
                    Load Report
                  </Button>
                  {mortalityReport && (
                    <Group gap="xs">
                      <ExportCSV
                        data={mortalityReport.Summaries || []}
                        fileName="mortality_report.csv"
                      />
                      <ExportPDF
                        data={mortalityReport}
                        title={t('Mortality Report')}
                        fileName="Mortality_Report.pdf"
                      />
                    </Group>
                  )}
                </Group>
              </Stack>
            </Paper>

            {mortalityReport && (
              <>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                  <Card padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">Total Deaths</Text>
                    <Text size="xl" fw={700} c="red.7">{mortalityReport.TotalDeaths}</Text>
                  </Card>
                  <Card padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">Sold</Text>
                    <Text size="xl" fw={700} c="green.7">{mortalityReport.TotalSold}</Text>
                  </Card>
                  <Card padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">Other Causes</Text>
                    <Text size="xl" fw={700} c="orange.7">{mortalityReport.TotalOtherCauses}</Text>
                  </Card>
                </SimpleGrid>

                <Stack gap="sm">
                  {mortalityReport.Summaries.map((summary, idx) => (
                    <Card key={idx} padding="lg" radius="md" withBorder>
                      <Group justify="space-between" mb="sm">
                        <Text fw={700}>{summary.CommonName}</Text>
                        <Badge color="red">{summary.TotalDeaths} deaths</Badge>
                      </Group>
                      <Group gap="md">
                        <Badge color="green" variant="light">Sold: {summary.Sold}</Badge>
                        <Badge color="orange" variant="light">Other: {summary.OtherCauses}</Badge>
                      </Group>
                    </Card>
                  ))}
                </Stack>
              </>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="sales">
          <Stack gap="lg">
            <Paper p="lg" radius="md" withBorder style={{ maxWidth: 500 }}>
              <Stack gap="sm">
                <Text fw={500} size="sm">Date Range</Text>
                <Group grow>
                  <TextInput
                    label="Start Date"
                    type="date"
                    value={salesFilters.startDate}
                    onChange={(e) => setSalesFilters({ ...salesFilters, startDate: e.target.value })}
                  />
                  <TextInput
                    label="End Date"
                    type="date"
                    value={salesFilters.endDate}
                    onChange={(e) => setSalesFilters({ ...salesFilters, endDate: e.target.value })}
                  />
                </Group>
                <Group justify="space-between">
                  <Button onClick={loadSalesReport} loading={loading} variant="light">
                    Load Report
                  </Button>
                  {salesReport && (
                    <Group gap="xs">
                      <ExportCSV
                        data={salesReport.Sales || []}
                        fileName="sales_report.csv"
                      />
                      <ExportPDF
                        data={salesReport}
                        title={t('Sales Report')}
                        subtitle={salesFilters.startDate && salesFilters.endDate
                          ? `${salesFilters.startDate} — ${salesFilters.endDate}`
                          : undefined}
                        fileName="Sales_Report.pdf"
                      />
                    </Group>
                  )}
                </Group>
              </Stack>
            </Paper>

            {salesReport && (
              <>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                  <Card padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">Total Revenue</Text>
                    <Text size="xl" fw={700} c="green.7">${salesReport.TotalRevenue.toFixed(2)}</Text>
                  </Card>
                  <Card padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">Items Sold</Text>
                    <Text size="xl" fw={700}>{salesReport.TotalItemsSold}</Text>
                  </Card>
                </SimpleGrid>

                <Card padding="lg" radius="md" withBorder>
                  <Text fw={700} mb="md">Top Species by Sales</Text>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Species</Table.Th>
                        <Table.Th>Quantity Sold</Table.Th>
                        <Table.Th>Revenue</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {salesReport.TopSpecies.map((species, idx) => (
                        <Table.Tr key={idx}>
                          <Table.Td fw={500}>{species.CommonName}</Table.Td>
                          <Table.Td>{species.TotalQuantitySold}</Table.Td>
                          <Table.Td>${species.TotalRevenue.toFixed(2)}</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Card>

                <Card padding="lg" radius="md" withBorder>
                  <Text fw={700} mb="md">Recent Sales</Text>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Date</Table.Th>
                        <Table.Th>Customer</Table.Th>
                        <Table.Th>Items</Table.Th>
                        <Table.Th>Total</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {salesReport.Sales.slice(0, 10).map((sale, idx) => (
                        <Table.Tr key={idx}>
                          <Table.Td>{new Date(sale.Date).toLocaleDateString()}</Table.Td>
                          <Table.Td fw={500}>{sale.CustomerName}</Table.Td>
                          <Table.Td>{sale.ItemCount}</Table.Td>
                          <Table.Td><Badge color="green" variant="light">${sale.TotalAmount.toFixed(2)}</Badge></Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Card>
              </>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="valuation">
          <Stack gap="lg">
            <Group justify="space-between">
              <Button onClick={loadValuationReport} loading={loading} variant="light">
                Load Valuation Report
              </Button>
              {valuationReport && (
                <Group gap="xs">
                  <ExportCSV
                    data={valuationReport.ByCategory || []}
                    fileName="valuation_report.csv"
                  />
                  <ExportPDF
                    data={valuationReport}
                    title={t('Valuation Report')}
                    fileName="Valuation_Report.pdf"
                  />
                </Group>
              )}
            </Group>

            {valuationReport && (
              <>
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
                  <Card padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">Total Units</Text>
                    <Text size="xl" fw={700}>{valuationReport.TotalUnitsInStock}</Text>
                  </Card>
                  <Card padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">Total Cost</Text>
                    <Text size="xl" fw={700} c="teal.7">${valuationReport.TotalCostValue.toFixed(2)}</Text>
                  </Card>
                  <Card padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">Total Lots</Text>
                    <Text size="xl" fw={700}>{valuationReport.TotalLots}</Text>
                  </Card>
                  <Card padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">Avg Cost/Unit</Text>
                    <Text size="xl" fw={700}>${valuationReport.AverageUnitCost.toFixed(2)}</Text>
                  </Card>
                </SimpleGrid>

                <Card padding="lg" radius="md" withBorder>
                  <Text fw={700} mb="md">Valuation by Category</Text>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Category</Table.Th>
                        <Table.Th>Units in Stock</Table.Th>
                        <Table.Th>Total Cost Value</Table.Th>
                        <Table.Th>Avg Unit Cost</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {valuationReport.ByCategory.map((cat, idx) => (
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
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
}

export default ReportsPage;
