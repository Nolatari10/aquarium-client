import { useState, useEffect } from 'react';
import { Text, Tabs, Card, Table, Group, Badge, Button, TextInput, Select, Box, SimpleGrid, Stack, Paper, Tooltip, ThemeIcon } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertTriangle, IconCheck, IconClock } from '@tabler/icons-react';
import { reportsApi } from '../api/reports';
import { suppliersApi } from '../api/suppliers';
import { catalogApi } from '../api/catalog';
import ExportCSV from '../components/report/ExportCSV';
import ExportPDF from '../components/report/ExportPDF';
import { useTranslation } from 'react-i18next';

function getDefaultStart() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

function getDefaultEnd() {
  return new Date().toISOString().slice(0, 10);
}

function ReportsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('stock');
  const [loadingStock, setLoadingStock] = useState(false);
  const [loadingMortality, setLoadingMortality] = useState(false);
  const [loadingSales, setLoadingSales] = useState(false);
  const [loadingValuation, setLoadingValuation] = useState(false);
  const [loadingSupplierPerf, setLoadingSupplierPerf] = useState(false);
  const [loadingTurnover, setLoadingTurnover] = useState(false);
  const [loadingProfitability, setLoadingProfitability] = useState(false);

  const [stockReport, setStockReport] = useState(null);
  const [mortalityReport, setMortalityReport] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [valuationReport, setValuationReport] = useState(null);
  const [supplierPerfReport, setSupplierPerfReport] = useState(null);
  const [turnoverReport, setTurnoverReport] = useState(null);
  const [profitabilityReport, setProfitabilityReport] = useState(null);

  const [speciesList, setSpeciesList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);

  const [mortalityFilters, setMortalityFilters] = useState({
    startDate: getDefaultStart(),
    endDate: getDefaultEnd(),
    speciesId: null,
    supplierId: null,
  });

  const [salesFilters, setSalesFilters] = useState({
    startDate: getDefaultStart(),
    endDate: getDefaultEnd(),
  });

  const [supplierPerfFilters, setSupplierPerfFilters] = useState({
    startDate: getDefaultStart(),
    endDate: getDefaultEnd(),
  });

  const [turnoverFilters, setTurnoverFilters] = useState({
    speciesId: null,
    supplierId: null,
  });

  const [profitabilityFilters, setProfitabilityFilters] = useState({
    startDate: getDefaultStart(),
    endDate: getDefaultEnd(),
  });

  useEffect(() => {
    Promise.all([
      catalogApi.getAll(1, 1000).then(r => setSpeciesList(r.data?.Items || [])).catch(() => {}),
      suppliersApi.getAll().then(r => setSupplierList(r.data || [])).catch(() => {}),
    ]);
  }, []);

  useEffect(() => {
    if (activeTab === 'stock' && !stockReport) loadStockReport();
    else if (activeTab === 'mortality' && !mortalityReport) loadMortalityReport();
    else if (activeTab === 'valuation' && !valuationReport) loadValuationReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadStockReport = async () => {
    try { setLoadingStock(true); const r = await reportsApi.getStockReport(); setStockReport(r.data); }
    catch { notifications.show({ title: 'Error', message: t('Failed to load stock report'), color: 'red' }); }
    finally { setLoadingStock(false); }
  };

  const loadMortalityReport = async () => {
    try {
      setLoadingMortality(true);
      const params = {};
      if (mortalityFilters.startDate) params.startDate = mortalityFilters.startDate;
      if (mortalityFilters.endDate) params.endDate = mortalityFilters.endDate;
      if (mortalityFilters.speciesId) params.speciesId = mortalityFilters.speciesId;
      if (mortalityFilters.supplierId) params.supplierId = mortalityFilters.supplierId;
      const r = await reportsApi.getMortalityReport(params);
      setMortalityReport(r.data);
    } catch {
      notifications.show({ title: 'Error', message: t('Failed to load mortality report'), color: 'red' });
    } finally { setLoadingMortality(false); }
  };

  const loadSalesReport = async () => {
    if (!salesFilters.startDate || !salesFilters.endDate) {
      notifications.show({ title: 'Error', message: t('Select date range'), color: 'red' });
      return;
    }
    try { setLoadingSales(true); const r = await reportsApi.getSalesReport(salesFilters.startDate, salesFilters.endDate, 1, 50); setSalesReport(r.data); }
    catch { notifications.show({ title: 'Error', message: t('Failed to load sales report'), color: 'red' }); }
    finally { setLoadingSales(false); }
  };

  const loadValuationReport = async () => {
    try { setLoadingValuation(true); const r = await reportsApi.getInventoryValuation(); setValuationReport(r.data); }
    catch { notifications.show({ title: 'Error', message: t('Failed to load valuation report'), color: 'red' }); }
    finally { setLoadingValuation(false); }
  };

  const loadSupplierPerformance = async () => {
    try {
      setLoadingSupplierPerf(true);
      const params = {};
      if (supplierPerfFilters.startDate) params.startDate = supplierPerfFilters.startDate;
      if (supplierPerfFilters.endDate) params.endDate = supplierPerfFilters.endDate;
      const r = await reportsApi.getSupplierPerformance(params);
      setSupplierPerfReport(r.data);
    } catch {
      notifications.show({ title: 'Error', message: t('Failed to load supplier performance'), color: 'red' });
    } finally { setLoadingSupplierPerf(false); }
  };

  const loadInventoryTurnover = async () => {
    try {
      setLoadingTurnover(true);
      const params = {};
      if (turnoverFilters.speciesId) params.speciesId = turnoverFilters.speciesId;
      if (turnoverFilters.supplierId) params.supplierId = turnoverFilters.supplierId;
      const r = await reportsApi.getInventoryTurnover(params);
      setTurnoverReport(r.data);
    } catch {
      notifications.show({ title: 'Error', message: t('Failed to load turnover report'), color: 'red' });
    } finally { setLoadingTurnover(false); }
  };

  const loadProfitability = async () => {
    if (!profitabilityFilters.startDate || !profitabilityFilters.endDate) {
      notifications.show({ title: 'Error', message: t('Select date range'), color: 'red' });
      return;
    }
    try {
      setLoadingProfitability(true);
      const r = await reportsApi.getProfitability(profitabilityFilters.startDate, profitabilityFilters.endDate);
      setProfitabilityReport(r.data);
    } catch {
      notifications.show({ title: 'Error', message: t('Failed to load profitability report'), color: 'red' });
    } finally { setLoadingProfitability(false); }
  };

  const speciesOptions = speciesList.filter(s => s.Id != null).map(s => ({ value: String(s.Id), label: s.CommonName }));
  const supplierOptions = supplierList.filter(s => s.Id != null).map(s => ({ value: String(s.Id), label: s.Name }));

  return (
    <Box>
      <Text size="xl" fw={700} mb="lg">{t('Reports')}</Text>

      <Tabs value={activeTab} onChange={setActiveTab} keepMounted={false}>
        <Tabs.List mb="lg">
          <Tabs.Tab value="stock">{t('Stock')}</Tabs.Tab>
          <Tabs.Tab value="mortality">{t('Mortality')}</Tabs.Tab>
          <Tabs.Tab value="sales">{t('Sales')}</Tabs.Tab>
          <Tabs.Tab value="valuation">{t('Valuation')}</Tabs.Tab>
          <Tabs.Tab value="supplier-performance">{t('Suppliers')}</Tabs.Tab>
          <Tabs.Tab value="inventory-turnover">{t('Aging')}</Tabs.Tab>
          <Tabs.Tab value="profitability">{t('Profitability')}</Tabs.Tab>
        </Tabs.List>

        {/* STOCK REPORT */}
        <Tabs.Panel value="stock">
          <Stack gap="lg">
            <Group justify="space-between">
              <Button onClick={loadStockReport} loading={loadingStock} variant="light">
                {stockReport ? t('Refresh') : t('Load Stock Report')}
              </Button>
              {stockReport && (
                <Group gap="xs">
                  <ExportCSV data={stockReport.Items || []} fileName="stock_report.csv" />
                  <ExportPDF data={stockReport} title={t('Stock Report')} fileName="Stock_Report.pdf" />
                </Group>
              )}
            </Group>

            {!stockReport && !loadingStock && (
              <Paper p="xl" ta="center" withBorder><Text c="dimmed">{t('No data loaded')}</Text></Paper>
            )}

            {stockReport && stockReport.Items.length === 0 ? (
              <Paper p="xl" ta="center" withBorder><Text c="dimmed">{t('No stock to report')}</Text></Paper>
            ) : stockReport && (
              <>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                  <Card padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">{t('Total Species')}</Text>
                    <Text size="xl" fw={700}>{stockReport.TotalSpecies}</Text>
                  </Card>
                  <Card padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">{t('Total Stock')}</Text>
                    <Text size="xl" fw={700} c="teal.7">{stockReport.TotalStock}</Text>
                  </Card>
                  <Card padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">{t('Total Cost Value')}</Text>
                    <Text size="xl" fw={700} c="teal.7">${stockReport.Items.reduce((s, i) => s + i.TotalCostValue, 0).toFixed(2)}</Text>
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

        {/* MORTALITY REPORT */}
        <Tabs.Panel value="mortality">
          <Stack gap="lg">
            <Paper p="lg" radius="md" withBorder>
              <Stack gap="sm">
                <Text fw={500} size="sm">{t('Filters')}</Text>
                <Group grow>
                  <TextInput label={t('Start Date')} type="date" value={mortalityFilters.startDate} onChange={(e) => setMortalityFilters({ ...mortalityFilters, startDate: e.target.value })} />
                  <TextInput label={t('End Date')} type="date" value={mortalityFilters.endDate} onChange={(e) => setMortalityFilters({ ...mortalityFilters, endDate: e.target.value })} />
                </Group>
                <Group grow>
                  <Select label={t('Species')} placeholder={t('All species')} data={speciesOptions} value={mortalityFilters.speciesId} onChange={(v) => setMortalityFilters({ ...mortalityFilters, speciesId: v })} clearable />
                  <Select label={t('Supplier')} placeholder={t('All suppliers')} data={supplierOptions} value={mortalityFilters.supplierId} onChange={(v) => setMortalityFilters({ ...mortalityFilters, supplierId: v })} clearable />
                </Group>
                <Group justify="space-between">
                  <Button onClick={loadMortalityReport} loading={loadingMortality} variant="light">{t('Load Report')}</Button>
                  {mortalityReport && (
                    <Group gap="xs">
                      <ExportCSV data={mortalityReport.Summaries || []} fileName="mortality_report.csv" />
                      <ExportPDF data={mortalityReport} title={t('Mortality Report')} fileName="Mortality_Report.pdf" />
                    </Group>
                  )}
                </Group>
              </Stack>
            </Paper>

            {!mortalityReport && !loadingMortality && (
              <Paper p="xl" ta="center" withBorder><Text c="dimmed">{t('No data loaded')}</Text></Paper>
            )}

            {mortalityReport && mortalityReport.Summaries.length === 0 ? (
              <Paper p="xl" ta="center" withBorder><Text c="dimmed">{t('No mortality records for this period')}</Text></Paper>
            ) : mortalityReport && (
              <>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                  <Card padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">{t('Total Deaths')}</Text>
                    <Text size="xl" fw={700} c="red.7">{mortalityReport.TotalDeaths}</Text>
                  </Card>
                  <Card padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">{t('Sold')}</Text>
                    <Text size="xl" fw={700} c="green.7">{mortalityReport.TotalSold}</Text>
                  </Card>
                  <Card padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">{t('Other Causes')}</Text>
                    <Text size="xl" fw={700} c="orange.7">{mortalityReport.TotalOtherCauses}</Text>
                  </Card>
                </SimpleGrid>

                <Stack gap="sm">
                  {mortalityReport.Summaries.map((summary, idx) => (
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
        </Tabs.Panel>

        {/* SALES REPORT */}
        <Tabs.Panel value="sales">
          <Stack gap="lg">
            <Paper p="lg" radius="md" withBorder>
              <Stack gap="sm">
                <Text fw={500} size="sm">{t('Date Range')}</Text>
                <Group grow>
                  <TextInput label={t('Start Date')} type="date" value={salesFilters.startDate} onChange={(e) => setSalesFilters({ ...salesFilters, startDate: e.target.value })} />
                  <TextInput label={t('End Date')} type="date" value={salesFilters.endDate} onChange={(e) => setSalesFilters({ ...salesFilters, endDate: e.target.value })} />
                </Group>
                <Group justify="space-between">
                  <Button onClick={loadSalesReport} loading={loadingSales} variant="light">{t('Load Report')}</Button>
                  {salesReport && (
                    <Group gap="xs">
                      <ExportCSV data={salesReport.Sales || []} fileName="sales_report.csv" />
                      <ExportPDF data={salesReport} title={t('Sales Report')} subtitle={salesFilters.startDate && salesFilters.endDate ? `${salesFilters.startDate} — ${salesFilters.endDate}` : undefined} fileName="Sales_Report.pdf" />
                    </Group>
                  )}
                </Group>
              </Stack>
            </Paper>

            {!salesReport && !loadingSales && (
              <Paper p="xl" ta="center" withBorder><Text c="dimmed">{t('No data loaded')}</Text></Paper>
            )}

            {salesReport && salesReport.Sales.length === 0 ? (
              <Paper p="xl" ta="center" withBorder><Text c="dimmed">{t('No sales in this period')}</Text></Paper>
            ) : salesReport && (
              <>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                  <Card padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">{t('Total Revenue')}</Text>
                    <Text size="xl" fw={700} c="green.7">${salesReport.TotalRevenue.toFixed(2)}</Text>
                  </Card>
                  <Card padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">{t('Items Sold')}</Text>
                    <Text size="xl" fw={700}>{salesReport.TotalItemsSold}</Text>
                  </Card>
                </SimpleGrid>

                <Card padding="lg" radius="md" withBorder>
                  <Text fw={700} mb="md">{t('Top Selling Species')}</Text>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>{t('Species')}</Table.Th>
                        <Table.Th>{t('Qty Sold')}</Table.Th>
                        <Table.Th>{t('Revenue')}</Table.Th>
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
                  <Text fw={700} mb="md">{t('Recent Sales')}</Text>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>{t('Date')}</Table.Th>
                        <Table.Th>{t('Customer')}</Table.Th>
                        <Table.Th>{t('Items')}</Table.Th>
                        <Table.Th>{t('Total')}</Table.Th>
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

        {/* VALUATION REPORT */}
        <Tabs.Panel value="valuation">
          <Stack gap="lg">
            <Group justify="space-between">
              <Button onClick={loadValuationReport} loading={loadingValuation} variant="light">
                {valuationReport ? t('Refresh') : t('Load Valuation Report')}
              </Button>
              {valuationReport && (
                <Group gap="xs">
                  <ExportCSV data={valuationReport.ByCategory || []} fileName="valuation_report.csv" />
                  <ExportPDF data={valuationReport} title={t('Valuation Report')} fileName="Valuation_Report.pdf" />
                </Group>
              )}
            </Group>

            {!valuationReport && !loadingValuation && (
              <Paper p="xl" ta="center" withBorder><Text c="dimmed">{t('No data loaded')}</Text></Paper>
            )}

            {valuationReport && valuationReport.TotalLots === 0 ? (
              <Paper p="xl" ta="center" withBorder><Text c="dimmed">{t('No stock to value')}</Text></Paper>
            ) : valuationReport && (
              <>
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
                  <Card padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">{t('Total Units')}</Text>
                    <Text size="xl" fw={700}>{valuationReport.TotalUnitsInStock}</Text>
                  </Card>
                  <Card padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">{t('Total Cost')}</Text>
                    <Text size="xl" fw={700} c="teal.7">${valuationReport.TotalCostValue.toFixed(2)}</Text>
                  </Card>
                  <Card padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">{t('Lots')}</Text>
                    <Text size="xl" fw={700}>{valuationReport.TotalLots}</Text>
                  </Card>
                  <Card padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">{t('Avg Cost/Unit')}</Text>
                    <Text size="xl" fw={700}>${valuationReport.AverageUnitCost.toFixed(2)}</Text>
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

        {/* SUPPLIER PERFORMANCE REPORT */}
        <Tabs.Panel value="supplier-performance">
          <Stack gap="lg">
            <Paper p="lg" radius="md" withBorder>
              <Stack gap="sm">
                <Text fw={500} size="sm">{t('Date Range')}</Text>
                <Group grow>
                  <TextInput label={t('Start Date')} type="date" value={supplierPerfFilters.startDate} onChange={(e) => setSupplierPerfFilters({ ...supplierPerfFilters, startDate: e.target.value })} />
                  <TextInput label={t('End Date')} type="date" value={supplierPerfFilters.endDate} onChange={(e) => setSupplierPerfFilters({ ...supplierPerfFilters, endDate: e.target.value })} />
                </Group>
                <Group justify="space-between">
                  <Button onClick={loadSupplierPerformance} loading={loadingSupplierPerf} variant="light">{t('Load Report')}</Button>
                  {supplierPerfReport && (
                    <Group gap="xs">
                      <ExportCSV data={supplierPerfReport.Suppliers || []} fileName="supplier_performance.csv" />
                      <ExportPDF data={supplierPerfReport} title={t('Supplier Performance')} fileName="Supplier_Performance.pdf" />
                    </Group>
                  )}
                </Group>
              </Stack>
            </Paper>

            {!supplierPerfReport && !loadingSupplierPerf && (
              <Paper p="xl" ta="center" withBorder><Text c="dimmed">{t('No data loaded')}</Text></Paper>
            )}

            {supplierPerfReport && supplierPerfReport.Suppliers.length === 0 ? (
              <Paper p="xl" ta="center" withBorder><Text c="dimmed">{t('No supplier data available')}</Text></Paper>
            ) : supplierPerfReport && (
              <>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                  <Card padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">{t('Suppliers Evaluated')}</Text>
                    <Text size="xl" fw={700}>{supplierPerfReport.Suppliers.length}</Text>
                  </Card>
                  <Card padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">{t('Cost Lost to Mortality')}</Text>
                    <Text size="xl" fw={700} c="red.7">${supplierPerfReport.TotalCostLost.toFixed(2)}</Text>
                  </Card>
                  <Card padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">{t('Avg Mortality Rate')}</Text>
                    <Text size="xl" fw={700} c={supplierPerfReport.AverageMortalityRate > 10 ? 'red.7' : 'teal.7'}>{supplierPerfReport.AverageMortalityRate}%</Text>
                  </Card>
                </SimpleGrid>

                <Card padding="lg" radius="md" withBorder>
                  <Text fw={700} mb="md">{t('Supplier Performance Ranking')}</Text>
                  <Text size="xs" c="dimmed" mb="sm">{t('Ranked by mortality rate — worst performers first')}</Text>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>#</Table.Th>
                        <Table.Th>{t('Supplier')}</Table.Th>
                        <Table.Th>{t('Lots')}</Table.Th>
                        <Table.Th>{t('DOA')}</Table.Th>
                        <Table.Th>{t('Non-Sold Mortality')}</Table.Th>
                        <Table.Th>{t('Cost Lost')}</Table.Th>
                        <Table.Th>{t('Mortality Rate')}</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {supplierPerfReport.Suppliers.map((s) => (
                        <Table.Tr key={s.SupplierId} style={s.MortalityRatePercent > 15 ? { backgroundColor: 'rgba(255,0,0,0.04)' } : undefined}>
                          <Table.Td fw={500}>{s.Rank}</Table.Td>
                          <Table.Td fw={500}>{s.SupplierName}</Table.Td>
                          <Table.Td>{s.TotalLotsReceived}</Table.Td>
                          <Table.Td>{s.TotalDOA}</Table.Td>
                          <Table.Td>{s.NonSoldMortality}</Table.Td>
                          <Table.Td>${s.CostLostToMortality.toFixed(2)}</Table.Td>
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
        </Tabs.Panel>

        {/* INVENTORY TURNOVER / AGING REPORT */}
        <Tabs.Panel value="inventory-turnover">
          <Stack gap="lg">
            <Paper p="lg" radius="md" withBorder>
              <Stack gap="sm">
                <Text fw={500} size="sm">{t('Filters')}</Text>
                <Group grow>
                  <Select label={t('Species')} placeholder={t('All species')} data={speciesOptions} value={turnoverFilters.speciesId} onChange={(v) => setTurnoverFilters({ ...turnoverFilters, speciesId: v })} clearable />
                  <Select label={t('Supplier')} placeholder={t('All suppliers')} data={supplierOptions} value={turnoverFilters.supplierId} onChange={(v) => setTurnoverFilters({ ...turnoverFilters, supplierId: v })} clearable />
                </Group>
                <Group justify="space-between">
                  <Button onClick={loadInventoryTurnover} loading={loadingTurnover} variant="light">{t('Load Report')}</Button>
                  {turnoverReport && (
                    <Group gap="xs">
                      <ExportCSV data={turnoverReport.Lots || []} fileName="inventory_aging.csv" />
                      <ExportPDF data={turnoverReport} title={t('Inventory Aging')} fileName="Inventory_Aging.pdf" />
                    </Group>
                  )}
                </Group>
              </Stack>
            </Paper>

            {!turnoverReport && !loadingTurnover && (
              <Paper p="xl" ta="center" withBorder><Text c="dimmed">{t('No data loaded')}</Text></Paper>
            )}

            {turnoverReport && turnoverReport.Lots.length === 0 ? (
              <Paper p="xl" ta="center" withBorder><Text c="dimmed">{t('No open lots to analyze')}</Text></Paper>
            ) : turnoverReport && (
              <>
                <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="lg">
                  <Card padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">{t('Fresh')} (&lt;30d)</Text>
                    <Text size="xl" fw={700} c="green.7">{turnoverReport.FreshLots}</Text>
                  </Card>
                  <Card padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">{t('Aging')} (30-90d)</Text>
                    <Text size="xl" fw={700} c="orange.7">{turnoverReport.AgingLots}</Text>
                  </Card>
                  <Card padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">{t('Old')} (&gt;90d)</Text>
                    <Text size="xl" fw={700} c="red.7">{turnoverReport.OldLots}</Text>
                  </Card>
                  <Card padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">{t('Avg Days in Stock')}</Text>
                    <Text size="xl" fw={700}>{turnoverReport.AverageDaysInStock}</Text>
                  </Card>
                </SimpleGrid>

                <Card padding="lg" radius="md" withBorder>
                  <Text fw={700} mb="md">{t('Lot Aging Detail')}</Text>
                  <Text size="xs" c="dimmed" mb="sm">{t('Old lots (&gt;90 days) highlighted — consider discounting or promoting')}</Text>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>{t('Species')}</Table.Th>
                        <Table.Th>{t('Supplier')}</Table.Th>
                        <Table.Th>{t('Arrived')}</Table.Th>
                        <Table.Th>{t('Days')}</Table.Th>
                        <Table.Th>{t('Stock')}</Table.Th>
                        <Table.Th>{t('Sold')}</Table.Th>
                        <Table.Th>{t('Status')}</Table.Th>
                        <Table.Th>{t('Cost at Risk')}</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {turnoverReport.Lots.map((lot) => (
                        <Table.Tr key={lot.LotId} style={lot.AgingStatus === 'Old' ? { backgroundColor: 'rgba(255,0,0,0.06)' } : lot.AgingStatus === 'Aging' ? { backgroundColor: 'rgba(255,165,0,0.04)' } : undefined}>
                          <Table.Td fw={500}>{lot.SpeciesName}</Table.Td>
                          <Table.Td>{lot.SupplierName || '—'}</Table.Td>
                          <Table.Td>{new Date(lot.ArrivalDate).toLocaleDateString()}</Table.Td>
                          <Table.Td>{lot.DaysInStock}</Table.Td>
                          <Table.Td>{lot.CurrentStock}</Table.Td>
                          <Table.Td>{lot.SoldQuantity}</Table.Td>
                          <Table.Td>
                            <Badge color={lot.AgingStatus === 'Old' ? 'red' : lot.AgingStatus === 'Aging' ? 'orange' : 'green'} variant="light" leftSection={lot.AgingStatus === 'Old' ? <IconClock size={12} /> : lot.AgingStatus === 'Aging' ? <IconAlertTriangle size={12} /> : <IconCheck size={12} />}>
                              {lot.AgingStatus}
                            </Badge>
                          </Table.Td>
                          <Table.Td fw={500} c={lot.AgingStatus === 'Old' ? 'red.7' : undefined}>${lot.CostAtRisk.toFixed(2)}</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Card>
              </>
            )}
          </Stack>
        </Tabs.Panel>

        {/* PROFITABILITY REPORT */}
        <Tabs.Panel value="profitability">
          <Stack gap="lg">
            <Paper p="lg" radius="md" withBorder>
              <Stack gap="sm">
                <Text fw={500} size="sm">{t('Filters')}</Text>
                <Group grow>
                  <TextInput type="date" label={t('Start Date')} value={profitabilityFilters.startDate} onChange={(e) => setProfitabilityFilters({ ...profitabilityFilters, startDate: e.target.value })} />
                  <TextInput type="date" label={t('End Date')} value={profitabilityFilters.endDate} onChange={(e) => setProfitabilityFilters({ ...profitabilityFilters, endDate: e.target.value })} />
                </Group>
                <Group justify="space-between">
                  <Button onClick={loadProfitability} loading={loadingProfitability} variant="light">{t('Load Report')}</Button>
                  {profitabilityReport && (
                    <Group gap="xs">
                      <ExportCSV data={profitabilityReport.BySpecies || []} fileName="profitability_report.csv" />
                      <ExportPDF data={profitabilityReport} title={t('Profitability Report')} fileName="Profitability_Report.pdf" />
                    </Group>
                  )}
                </Group>
              </Stack>
            </Paper>

            {!profitabilityReport && !loadingProfitability && (
              <Paper p="xl" ta="center" withBorder><Text c="dimmed">{t('No data loaded')}</Text></Paper>
            )}

            {profitabilityReport && profitabilityReport.BySpecies.length === 0 ? (
              <Paper p="xl" ta="center" withBorder><Text c="dimmed">{t('No sales in selected period')}</Text></Paper>
            ) : profitabilityReport && (
              <>
                <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="lg">
                  <Card padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">{t('Total Revenue')}</Text>
                    <Text size="xl" fw={700} c="teal.7">${profitabilityReport.TotalRevenue.toFixed(2)}</Text>
                  </Card>
                  <Card padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">{t('Total Cost')}</Text>
                    <Text size="xl" fw={700} c="orange.7">${profitabilityReport.TotalCost.toFixed(2)}</Text>
                  </Card>
                  <Card padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">{t('Gross Profit')}</Text>
                    <Text size="xl" fw={700} c={profitabilityReport.GrossProfit >= 0 ? 'green.7' : 'red.7'}>${profitabilityReport.GrossProfit.toFixed(2)}</Text>
                  </Card>
                  <Card padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">{t('Profit Margin')}</Text>
                    <Text size="xl" fw={700} c={profitabilityReport.ProfitMarginPercent >= 0 ? 'green.7' : 'red.7'}>{profitabilityReport.ProfitMarginPercent}%</Text>
                  </Card>
                </SimpleGrid>

                <Card padding="lg" radius="md" withBorder>
                  <Text fw={700} mb="md">{t('Profitability by Species')}</Text>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>{t('Species')}</Table.Th>
                        <Table.Th>{t('Category')}</Table.Th>
                        <Table.Th>{t('Sold')}</Table.Th>
                        <Table.Th>{t('Revenue')}</Table.Th>
                        <Table.Th>{t('Cost')}</Table.Th>
                        <Table.Th>{t('Profit')}</Table.Th>
                        <Table.Th>{t('Margin')}</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {profitabilityReport.BySpecies.map((s) => (
                        <Table.Tr key={s.SpeciesId} style={s.Profit < 0 ? { backgroundColor: 'rgba(255,0,0,0.04)' } : undefined}>
                          <Table.Td fw={500}>{s.CommonName}</Table.Td>
                          <Table.Td>{s.Category}</Table.Td>
                          <Table.Td>{s.QuantitySold}</Table.Td>
                          <Table.Td>${s.Revenue.toFixed(2)}</Table.Td>
                          <Table.Td>${s.Cost.toFixed(2)}</Table.Td>
                          <Table.Td fw={500} c={s.Profit >= 0 ? 'green.7' : 'red.7'}>${s.Profit.toFixed(2)}</Table.Td>
                          <Table.Td>
                            <Badge color={s.MarginPercent >= 0 ? 'green' : 'red'} variant="light">{s.MarginPercent}%</Badge>
                          </Table.Td>
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
