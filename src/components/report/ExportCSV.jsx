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

function useDynamicHeaders(data, userHeaders) {
  return useMemo(() => {
    if (userHeaders && userHeaders.length > 0) return userHeaders;
    if (!data || data.length === 0) return [];
    const firstItem = data[0];
    if (!firstItem || typeof firstItem !== 'object') return [];
    return Object.keys(firstItem).map((key) => ({
      label: formatLabel(key),
      key,
    }));
  }, [data, userHeaders]);
}

const ExportCSV = ({ data, fileName, headers }) => {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);
  const dynamicHeaders = useDynamicHeaders(data, headers);

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
        title="Export Report"
        centered
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">
            Are you sure you want to export this report as a CSV file?
          </Text>
          <Text size="xs" c="dimmed">
            {data?.length || 0} rows will be exported.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setOpened(false)}>
              Cancel
            </Button>
            <CSVLink
              data={sanitizeData(data)}
              headers={dynamicHeaders}
              filename={fileName || 'report.csv'}
              target="_blank"
              onClick={handleConfirm}
            >
              <Button color="teal" type="button">
                Download
              </Button>
            </CSVLink>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default ExportCSV;
