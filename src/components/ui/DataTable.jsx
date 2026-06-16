import { Table, Pagination, Group, Loader, Stack, Center, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { EmptyState } from './AsyncStateWrapper'

export default function DataTable({
  columns,
  rows,
  loading,
  page,
  totalPages,
  onPageChange,
  emptyMessage,
  emptyDescription,
  rowKey = 'Id',
  children,
}) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <Center py="xl">
        <Stack align="center" gap="sm">
          <Loader color="aqua" size="md" />
          <Text size="sm" c="dimmed">{t('Loading...')}</Text>
        </Stack>
      </Center>
    )
  }

  if (!rows || rows.length === 0) {
    return <EmptyState title={emptyMessage || t('No data found')} description={emptyDescription} height={180} />
  }

  return (
    <>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            {columns.map(col => (
              <Table.Th key={col.key || col.label}>{col.label}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {children || rows.map(row => (
            <Table.Tr key={row[rowKey] || row.id}>
              {columns.map(col => (
                <Table.Td key={col.key || col.label}>
                  {col.render ? col.render(row) : row[col.key]}
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      {totalPages > 1 && (
        <Group justify="center" mt="lg">
          <Pagination total={totalPages} value={page} onChange={onPageChange} />
        </Group>
      )}
    </>
  )
}
