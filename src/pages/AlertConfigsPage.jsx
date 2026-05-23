import { useState, useEffect } from 'react';
import { Box, Text, Card, Stack, Group, Switch, NumberInput, Button, Paper, Alert } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { alertsApi } from '../api/alerts';
import { useTranslation } from 'react-i18next';

function AlertConfigsPage() {
  const { t } = useTranslation();
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfigs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const res = await alertsApi.getConfigs();
      setConfigs(res.data || []);
    } catch {
      notifications.show({ title: 'Error', message: t('Failed to load alert configs'), color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (config) => {
    try {
      setSaving(true);
      await alertsApi.updateConfig(config.Id, {
        ThresholdValue: config.ThresholdValue,
        IsEnabled: config.IsEnabled
      });
      notifications.show({ title: t('Saved'), message: t('Alert config updated'), color: 'green', icon: <IconCheck size={16} /> });
    } catch {
      notifications.show({ title: t('Error'), message: t('Failed to update alert config'), color: 'red' });
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (id, field, value) => {
    setConfigs(prev => prev.map(c => c.Id === id ? { ...c, [field]: value } : c));
  };

  return (
    <Box>
      <Text size="xl" fw={700} mb="lg">{t('Alert Configuration')}</Text>

      <Alert color="blue" variant="light" icon={<IconAlertCircle size={16} />} mb="lg">
        {t('Configure alert thresholds. When exceeded, alerts appear on the Dashboard.')}
      </Alert>

      {loading ? (
        <Text c="dimmed">{t('Loading...')}</Text>
      ) : configs.length === 0 ? (
        <Paper p="xl" ta="center" withBorder>
          <Text c="dimmed">{t('No alert configs found. Run database migrations to seed defaults.')}</Text>
        </Paper>
      ) : (
        <Stack gap="md">
          {configs.map((config) => (
            <Card key={config.Id} padding="lg" radius="md" withBorder>
              <Group justify="space-between" wrap="wrap">
                <Box style={{ flex: 1 }}>
                  <Text fw={600}>{t(formatAlertType(config.AlertType))}</Text>
                  <Text size="xs" c="dimmed" mt={4}>{t(getAlertDescription(config.AlertType))}</Text>
                </Box>
                <Switch
                  label={t('Enabled')}
                  checked={config.IsEnabled}
                  onChange={(e) => updateConfig(config.Id, 'IsEnabled', e.target.checked)}
                />
              </Group>

              <Group mt="md" align="end">
                <NumberInput
                  label={t('Threshold')}
                  value={config.ThresholdValue}
                  onChange={(v) => updateConfig(config.Id, 'ThresholdValue', v)}
                  min={0}
                  max={100}
                  suffix="%"
                  decimalScale={1}
                  style={{ width: 140 }}
                />
                <Button
                  onClick={() => handleSave(config)}
                  loading={saving}
                  variant="light"
                  color="teal"
                >
                  {t('Save')}
                </Button>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}

function formatAlertType(type) {
  
  const labels = {
    HighMortalityRate: 'High Mortality Rate'
  };
  return labels[type] || type;
}

function getAlertDescription(type) {
  const descriptions = {
    HighMortalityRate: 'Alert when a lot exceeds this non-sold mortality percentage'
  };
  return descriptions[type] || '';
}

export default AlertConfigsPage;
