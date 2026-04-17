import { useState } from 'react';
import { Tabs, Card, Text, Table, Group, Badge, Button, TextInput, Select, Box, SimpleGrid, Divider } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { reportsApi } from '../api/reports';

function ReportsPage() {
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
    } catch (error) {
      notifications.show({ title: 'Error', message: 'Failed to load stock report', color: 'red' });
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
    } catch (error) {
      notifications.show({ title: 'Error', message: 'Failed to load mortality report', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const loadSalesReport = async () => {
    if (!salesFilters.startDate || !salesFilters.endDate) {
      notifications.show({ title: 'Error', message: 'Select date range', color: 'red' });
      return;
    }

    try {
      setLoading(true);
      const response = await reportsApi.getSalesReport(salesFilters.startDate, salesFilters.endDate);
      setSalesReport(response.data);
    } catch (error) {
      notifications.show({ title: 'Error', message: 'Failed to load sales report', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const loadValuationReport = async () => {
    try {
      setLoading(true);
      const response = await reportsApi.getInventoryValuation();
      setValuationReport(response.data);
    } catch (error) {
      notifications.show({ title: 'Error', message: 'Failed to load valuation report', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Text size="xl" fw={700} mb="md">Reports</Text>

      <Tabs defaultValue="stock">
        <Tabs.List>
          <Tabs.Tab value="stock">Stock Report</Tabs.Tab>
          <Tabs.Tab value="mortality">Mortality Report</Tabs.Tab>
          <Tabs.Tab value="sales">Sales Report</Tabs.Tab>
          <Tabs.Tab value="valuation">Inventory Valuation</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="stock">
          <Card shadow="sm" padding="lg" radius="md" mt="md">
            <Group justify="space-between" mb="md">
              <Text fw={500}>Current Stock by Species</Text>
              <Button onClick={loadStockReport} loading={loading}>Load Report</Button>
            </Group>

            {stockReport && (
              <>
                <SimpleGrid cols={2} mb="md">
                  <Card padding="sm">
                    <Text size="sm" c="dimmed">Total Species</Text>
                    <Text size="xl" fw={700}>{stockReport.TotalSpecies}</Text>
                  </Card>
                  <Card padding="sm">
                    <Text size="sm" c="dimmed">Total Stock</Text>
                    <Text size="xl" fw={700}>{stockReport.TotalStock}</Text>
                  </Card>
                </SimpleGrid>

                <Table striped>
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
                        <Table.Td>{item.CommonName}</Table.Td>
                        <Table.Td>{item.Category}</Table.Td>
                        <Table.Td>{item.CurrentStock}</Table.Td>
                        <Table.Td>${item.TotalCostValue.toFixed(2)}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </>
            )}
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="mortality">
          <Card shadow="sm" padding="lg" radius="md" mt="md">
            <Group justify="space-between" mb="md">
              <Text fw={500}>Mortality Analysis</Text>
              <Button onClick={loadMortalityReport} loading={loading}>Load Report</Button>
            </Group>

            <Group grow mb="md">
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

            {mortalityReport && (
              <>
                <SimpleGrid cols={3} mb="md">
                  <Card padding="sm">
                    <Text size="sm" c="dimmed">Total Deaths</Text>
                    <Text size="xl" fw={700}>{mortalityReport.TotalDeaths}</Text>
                  </Card>
                  <Card padding="sm">
                    <Text size="sm" c="dimmed">Sold</Text>
                    <Text size="xl" fw={700} c="green">{mortalityReport.TotalSold}</Text>
                  </Card>
                  <Card padding="sm">
                    <Text size="sm" c="dimmed">Other Causes</Text>
                    <Text size="xl" fw={700} c="red">{mortalityReport.TotalOtherCauses}</Text>
                  </Card>
                </SimpleGrid>

                {mortalityReport.Summaries.map((summary, idx) => (
                  <Card key={idx} padding="sm" mb="sm">
                    <Text fw={700} mb="xs">{summary.CommonName}</Text>
                    <Group gap="md">
                      <Badge color="red">Deaths: {summary.TotalDeaths}</Badge>
                      <Badge color="green">Sold: {summary.Sold}</Badge>
                      <Badge color="orange">Other: {summary.OtherCauses}</Badge>
                    </Group>
                  </Card>
                ))}
              </>
            )}
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="sales">
          <Card shadow="sm" padding="lg" radius="md" mt="md">
            <Group justify="space-between" mb="md">
              <Text fw={500}>Sales Performance</Text>
              <Button onClick={loadSalesReport} loading={loading}>Load Report</Button>
            </Group>

            <Group grow mb="md">
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

            {salesReport && (
              <>
                <SimpleGrid cols={2} mb="md">
                  <Card padding="sm">
                    <Text size="sm" c="dimmed">Total Revenue</Text>
                    <Text size="xl" fw={700} c="green">${salesReport.TotalRevenue.toFixed(2)}</Text>
                  </Card>
                  <Card padding="sm">
                    <Text size="sm" c="dimmed">Items Sold</Text>
                    <Text size="xl" fw={700}>{salesReport.TotalItemsSold}</Text>
                  </Card>
                </SimpleGrid>

                <Text fw={500} mb="xs">Top Species by Sales</Text>
                <Table striped mb="md">
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
                        <Table.Td>{species.CommonName}</Table.Td>
                        <Table.Td>{species.TotalQuantitySold}</Table.Td>
                        <Table.Td>${species.TotalRevenue.toFixed(2)}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>

                <Text fw={500} mb="xs">Recent Sales</Text>
                <Table striped>
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
                        <Table.Td>{sale.CustomerName}</Table.Td>
                        <Table.Td>{sale.ItemCount}</Table.Td>
                        <Table.Td>${sale.TotalAmount.toFixed(2)}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </>
            )}
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="valuation">
          <Card shadow="sm" padding="lg" radius="md" mt="md">
            <Group justify="space-between" mb="md">
              <Text fw={500}>Inventory Valuation</Text>
              <Button onClick={loadValuationReport} loading={loading}>Load Report</Button>
            </Group>

            {valuationReport && (
              <>
                <SimpleGrid cols={4} mb="md">
                  <Card padding="sm">
                    <Text size="sm" c="dimmed">Total Units</Text>
                    <Text size="xl" fw={700}>{valuationReport.TotalUnitsInStock}</Text>
                  </Card>
                  <Card padding="sm">
                    <Text size="sm" c="dimmed">Total Cost</Text>
                    <Text size="xl" fw={700} c="blue">${valuationReport.TotalCostValue.toFixed(2)}</Text>
                  </Card>
                  <Card padding="sm">
                    <Text size="sm" c="dimmed">Total Lots</Text>
                    <Text size="xl" fw={700}>{valuationReport.TotalLots}</Text>
                  </Card>
                  <Card padding="sm">
                    <Text size="sm" c="dimmed">Avg Cost/Unit</Text>
                    <Text size="xl" fw={700}>${valuationReport.AverageUnitCost.toFixed(2)}</Text>
                  </Card>
                </SimpleGrid>

                <Divider my="md" />
                <Text fw={500} mb="md">Valuation by Category</Text>
                <Table striped>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Category</Table.Th>
                      <Table.Th>Units in Stock</Table.Th>
                      <Table.Th>Total Cost Value</Table.Th>
                      <Table.Th>Average Unit Cost</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {valuationReport.ByCategory.map((cat, idx) => (
                      <Table.Tr key={idx}>
                        <Table.Td>{cat.Category}</Table.Td>
                        <Table.Td>{cat.UnitsInStock}</Table.Td>
                        <Table.Td>${cat.TotalCostValue.toFixed(2)}</Table.Td>
                        <Table.Td>${cat.AverageUnitCost.toFixed(2)}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </>
            )}
          </Card>
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
}

export default ReportsPage;
