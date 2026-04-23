import { useState } from 'react';
import { Modal, Button, Group, Text, Stack } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import { CSVLink } from 'react-csv';
import { useTranslation } from 'react-i18next';
const ExportCSV = ({ data, fileName, headers }) => {
  const { t, i18n } = useTranslation();
  const [opened, setOpened] = useState(false);

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
              data={data || []}
              headers={headers || []}
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