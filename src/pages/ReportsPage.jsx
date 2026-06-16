import { useState, useEffect } from 'react'
import { Tabs, Box, Text } from '@mantine/core'
import { catalogApi } from '../api/catalog'
import { speciesApi } from '../api/species'
import { suppliersApi } from '../api/suppliers'
import { useTranslation } from 'react-i18next'
import StockReport from '../components/reports/StockReport'
import MortalityReportView from '../components/reports/MortalityReportView'
import SalesReportView from '../components/reports/SalesReportView'
import ValuationReport from '../components/reports/ValuationReport'
import SupplierPerformanceReport from '../components/reports/SupplierPerformanceReport'
import TurnoverReport from '../components/reports/TurnoverReport'
import ProfitabilityReport from '../components/reports/ProfitabilityReport'

function ReportsPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('stock')
  const [speciesList, setSpeciesList] = useState([])
  const [supplierList, setSupplierList] = useState([])

  useEffect(() => {
    Promise.all([
      speciesApi.getAll(1, 10000).then(r => setSpeciesList(r.data?.Items || [])).catch(() => {}),
      suppliersApi.getAll().then(r => setSupplierList(r.data || [])).catch(() => {}),
    ])
  }, [])

  const speciesOptions = speciesList.filter(s => s.Id != null).map(s => ({ value: String(s.Id), label: s.CommonName }))
  const supplierOptions = supplierList.filter(s => s.Id != null).map(s => ({ value: String(s.Id), label: s.Name }))

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

        <Tabs.Panel value="stock"><StockReport t={t} /></Tabs.Panel>
        <Tabs.Panel value="mortality"><MortalityReportView t={t} speciesOptions={speciesOptions} supplierOptions={supplierOptions} /></Tabs.Panel>
        <Tabs.Panel value="sales"><SalesReportView t={t} /></Tabs.Panel>
        <Tabs.Panel value="valuation"><ValuationReport t={t} /></Tabs.Panel>
        <Tabs.Panel value="supplier-performance"><SupplierPerformanceReport t={t} speciesOptions={speciesOptions} supplierOptions={supplierOptions} /></Tabs.Panel>
        <Tabs.Panel value="inventory-turnover"><TurnoverReport t={t} speciesOptions={speciesOptions} supplierOptions={supplierOptions} /></Tabs.Panel>
        <Tabs.Panel value="profitability"><ProfitabilityReport t={t} /></Tabs.Panel>
      </Tabs>
    </Box>
  )
}

export default ReportsPage
