import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, Group, Text, Badge, ActionIcon, Box, Loader, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft } from '@tabler/icons-react';
import { tanksApi } from '../../api/tanks';
import { TANK_TYPE_LABELS } from '../../constants/tankConstants';
import { useTranslation } from 'react-i18next';
import TankOverviewTab from './TankOverviewTab';
import TankParametersTab from './TankParametersTab';
import TankMaintenanceTab from './TankMaintenanceTab';
import TankFertilizationTab from './TankFertilizationTab';
import TankPhotosTab from './TankPhotosTab';

const tabStyles = `
@keyframes tabEnter {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

// Container page with tabbed navigation: Overview, Parameters, Maintenance, Fertilization, Photos.
// Each tab is a separate component that receives the tank ID as a prop.
function TankDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [tank, setTank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Loads full tank detail (with indicators) on mount
  const loadTank = useCallback(async () => {
    try {
      setLoading(true);
      const res = await tanksApi.getById(id);
      setTank(res.data);
    } catch {
      notifications.show({ title: 'Error', message: t('Failed to load tank'), color: 'red' });
      navigate('/tanks');
    } finally { setLoading(false); }
  }, [id, t, navigate]);

  useEffect(() => { loadTank(); }, [loadTank]);

  if (loading) return <Stack align="center" py="xl"><Loader /></Stack>;
  if (!tank) return <Text>{t('Tank not found')}</Text>;

  return (
    <Box>
      <style>{tabStyles}</style>
      <Group mb="md" justify="space-between">
        <Group gap="sm">
          <ActionIcon variant="subtle" onClick={() => navigate('/tanks')} style={{ transition: 'transform 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(-3px)'} onMouseLeave={(e) => e.currentTarget.style.transform = ''}><IconArrowLeft size={20} /></ActionIcon>
          <Box>
            <Group gap="xs">
              <Text size="xl" fw={700}>{tank.Name}</Text>
              <Badge variant="outline">{t(TANK_TYPE_LABELS[tank.TankType] || tank.TankType)}</Badge>
              <Badge variant="light" color={tank.IsActive ? 'green' : 'gray'}>
                {tank.IsActive ? t('Active') : t('Inactive')}
              </Badge>
            </Group>
            <Text size="sm" c="dimmed">
              {tank.SizeLiters}L{tank.Substrate ? ` · ${tank.Substrate}` : ''}{tank.Co2Injection ? ' · CO₂' : ''}
            </Text>
          </Box>
        </Group>
      </Group>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="overview">{t('Overview')}</Tabs.Tab>
          <Tabs.Tab value="parameters">{t('Parameters')}</Tabs.Tab>
          <Tabs.Tab value="maintenance">{t('Maintenance')}</Tabs.Tab>
          <Tabs.Tab value="fertilization">{t('Fertilization')}</Tabs.Tab>
          <Tabs.Tab value="photos">{t('Photos')}</Tabs.Tab>
        </Tabs.List>

        <div key={activeTab} style={{ animation: 'tabEnter 0.25s ease both' }}>
          <Tabs.Panel value="overview" pt="md">
            <TankOverviewTab tank={tank} onUpdate={loadTank} />
          </Tabs.Panel>
          <Tabs.Panel value="parameters" pt="md">
            <TankParametersTab tankId={tank.Id} />
          </Tabs.Panel>
          <Tabs.Panel value="maintenance" pt="md">
            <TankMaintenanceTab tankId={tank.Id} />
          </Tabs.Panel>
          <Tabs.Panel value="fertilization" pt="md">
            <TankFertilizationTab tankId={tank.Id} />
          </Tabs.Panel>
          <Tabs.Panel value="photos" pt="md">
            <TankPhotosTab tankId={tank.Id} />
          </Tabs.Panel>
        </div>
      </Tabs>
    </Box>
  );
}

export default TankDetailPage;
