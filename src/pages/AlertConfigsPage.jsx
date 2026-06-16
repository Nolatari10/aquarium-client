import { useState, useEffect } from 'react';
import { Box, Text, Card, Stack, Group, Switch, NumberInput, Button, Paper, Alert } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { alertsApi } from '../api/alerts';
import { LoadingState, EmptyState } from '../components/ui';
import { useTranslation } from 'react-i18next';

function formatAlertType(t, type) {
  const labels = {
    HighMortalityRate: t('High Mortality Rate')
  };
  return labels[type] || type;
}

function getAlertDescription(t, type) {
  const descriptions = {
    HighMortalityRate: t('Alert when daily mortality rate exceeds this percentage.')
  };
  return descriptions[type] || '';
}

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
      notifications.show({ title: t('Error'), message: t('Failed to load alert configs'), color: 'red' });
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
        <LoadingState />
      ) : configs.length === 0 ? (
        <EmptyState title={t('No alert configs found')} description={t('Run database migrations to seed defaults.')} />
      ) : (
        <Stack gap="md">
          {configs.map((config) => (
            <Card key={config.Id} padding="lg" radius="md" withBorder>
              <Group justify="space-between" wrap="wrap">
                <Box style={{ flex: 1 }}>
                  <Text fw={600}>{formatAlertType(t, config.AlertType)}</Text>
                  <Text size="xs" c="dimmed" mt={4}>{getAlertDescription(t, config.AlertType)}</Text>
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

export default AlertConfigsPage;
