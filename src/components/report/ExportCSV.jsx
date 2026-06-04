import { useState, useMemo } from 'react';
import { Modal, Button, Group, Text, Stack } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import { CSVLink } from 'react-csv';
import { useTranslation } from 'react-i18next';
import { formatLabel } from '../../tools/format';

function sanitizeRow(row) {
  if (!row || typeof row !== 'object') return row;
  const sanitized = {};
  for (const [key, value] of Object.entries(row)) {
    if (Array.isArray(value)) {
      sanitized[key] = value.length;
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = JSON.stringify(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

function sanitizeData(data) {
  if (!data || !Array.isArray(data)) return [];
  return data.map(sanitizeRow);
}

function useDynamicHeaders(data, userHeaders, t, excludeIdColumns) {
  return useMemo(() => {
    if (userHeaders && userHeaders.length > 0) return userHeaders;
    if (!data || data.length === 0) return [];
    const firstItem = data[0];
    if (!firstItem || typeof firstItem !== 'object') return [];
    const keys = excludeIdColumns
      ? Object.keys(firstItem).filter((k) => !k.endsWith('Id'))
      : Object.keys(firstItem);
    return keys.map((key) => ({
      label: formatLabel(key, t),
      key,
    }));
  }, [data, userHeaders, t, excludeIdColumns]);
}

const ExportCSV = ({ data, fileName, headers, excludeIdColumns = true }) => {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);
  const dynamicHeaders = useDynamicHeaders(data, headers, t, excludeIdColumns);

  const handleConfirm = () => {
    setOpened(false);
  };

  return (
    <>
      <Button
        variant="light"
        color="teal"
        size="sm"
        leftSection={<IconDownload size={16} />}
        onClick={() => setOpened(true)}
      >
        {t('Export CSV')}
      </Button>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={t('Export Report')}
        centered
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">
            {t('Are you sure you want to export this report as a CSV file?')}
          </Text>
          <Text size="xs" c="dimmed">
            {t('{count} rows will be exported.', { count: data?.length || 0 })}
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setOpened(false)}>
              {t('Cancel')}
            </Button>
            <CSVLink
              data={sanitizeData(data)}
              headers={dynamicHeaders}
              filename={fileName || 'report.csv'}
              target="_blank"
              onClick={handleConfirm}
            >
              <Button color="teal" type="button">
                {t('Download')}
              </Button>
            </CSVLink>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default ExportCSV;
