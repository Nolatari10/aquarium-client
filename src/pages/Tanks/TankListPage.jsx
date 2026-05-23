import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Group, Text, ActionIcon, Badge, Box, Stack, TextInput, Select, ThemeIcon, Loader } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconEye, IconTrash, IconSearch, IconFish } from '@tabler/icons-react';
import { tanksApi } from '../../api/tanks';
import { useTranslation } from 'react-i18next';

const styles = `
@keyframes rowEnter {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes pulseBtn {
  0%, 100% { box-shadow: 0 0 0 0 rgba(12, 166, 120, 0.4); }
  50% { box-shadow: 0 0 0 10px rgba(12, 166, 120, 0); }
}
`;

// Maps backend enum values to human-readable labels and badge colors
const TANK_TYPE_LABELS = {
  PlantedHighTech: 'Planted High-Tech',
  PlantedLowTech: 'Planted Low-Tech',
  Aquascape: 'Aquascape',
  Biotope: 'Biotope',
  Shrimp: 'Shrimp',
  Breeding: 'Breeding',
  Quarantine: 'Quarantine',
  Other: 'Other',
};

const TANK_TYPE_COLORS = {
  PlantedHighTech: 'teal',
  PlantedLowTech: 'green',
  Aquascape: 'blue',
  Biotope: 'grape',
  Shrimp: 'red',
  Breeding: 'orange',
  Quarantine: 'yellow',
  Other: 'gray',
};

// Displays all tanks for the current user with quick indicators (last test, dose, maintenance) and filters by type/status
function TankListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tanks, setTanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);

  // Fetches tanks with optional type/status filters from the API
  const loadTanks = useCallback(async () => {
    try {
      setLoading(true);
      const params = { isActive: true };
      if (typeFilter) params.tankType = typeFilter;
      if (statusFilter === 'inactive') params.isActive = false;

      const res = await tanksApi.getAll(params);
      let data = res.data || [];
      if (statusFilter === 'warning') {
        data = data.filter(t => t.WarningCount > 0);
      }
      setTanks(data);
    } catch {
      notifications.show({ title: t('Error'), message: t('Failed to load tanks'), color: 'red' });
    } finally { setLoading(false); }
  }, [typeFilter, statusFilter, t]);

  useEffect(() => { loadTanks(); }, [loadTanks]);

  // Soft-deletes a tank and refreshes the list
  const handleDelete = async (id) => {
    if (!confirm(t('Are you sure you want to delete this tank?'))) return;
    try {
      await tanksApi.delete(id);
      notifications.show({ title: t('Success'), message: t('Tank deleted'), color: 'green' });
      loadTanks();
    } catch {
      notifications.show({ title: t('Error'), message: t('Failed to delete tank'), color: 'red' });
    }
  };

  // Client-side search filter on tank name
  const filtered = tanks.filter(t => t.Name?.toLowerCase().includes(search.toLowerCase()));

  // Determines status badge: red if no test in 14 days, yellow if >7 days, green otherwise
  const statusIcon = (tank) => {
    const now = new Date();
    const lastTest = tank.LastWaterTestAt ? new Date(tank.LastWaterTestAt) : null;
    if (!lastTest || (now - lastTest) > 14 * 86400000) return { color: 'red', label: t('Needs test') };
    if ((now - lastTest) > 7 * 86400000) return { color: 'yellow', label: t('Due soon') };
    return { color: 'green', label: 'OK' };
  };

  const rows = filtered.map((tank, index) => {
    const stat = statusIcon(tank);
    return (
      <Table.Tr key={tank.Id} style={{ animation: `rowEnter 0.35s ease ${index * 45}ms both` }}>
        <Table.Td>
          <Group gap="xs">
            <ThemeIcon variant="light" size="sm" color={t(TANK_TYPE_COLORS[tank.TankType] || 'gray')}>
              <IconFish size={14} />
            </ThemeIcon>
            <Text fw={600} style={{ cursor: 'pointer', transition: 'color 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--mantine-color-teal-6)'} onMouseLeave={(e) => e.currentTarget.style.color = ''} onClick={() => navigate(`/tanks/${tank.Id}`)}>{tank.Name}</Text>
          </Group>
        </Table.Td>
        <Table.Td><Badge variant="outline" color={t(TANK_TYPE_COLORS[tank.TankType] || 'gray')}>{t(TANK_TYPE_LABELS[tank.TankType] || tank.TankType)}</Badge></Table.Td>
        <Table.Td>{tank.SizeLiters}L</Table.Td>
        <Table.Td><Text size="xs" c="dimmed">{tank.OwnerEmail || '—'}</Text></Table.Td>
        <Table.Td>
          <Text size="xs" c={tank.LastWaterTestAt ? 'dimmed' : 'gray'}>
            {tank.LastWaterTestAt ? new Date(tank.LastWaterTestAt).toLocaleDateString() : '—'}
          </Text>
          {tank.LastWaterTestSummary && <Text size="xs">{tank.LastWaterTestSummary}</Text>}
        </Table.Td>
        <Table.Td>
          <Text size="xs" c={tank.LastDoseAt ? 'dimmed' : 'gray'}>
            {tank.LastDoseAt ? new Date(tank.LastDoseAt).toLocaleDateString() : '—'}
          </Text>
          {tank.LastDoseSummary && <Text size="xs">{tank.LastDoseSummary}</Text>}
        </Table.Td>
        <Table.Td>
          <Text size="xs" c={tank.LastMaintenanceAt ? 'dimmed' : 'gray'}>
            {tank.LastMaintenanceAt ? new Date(tank.LastMaintenanceAt).toLocaleDateString() : '—'}
          </Text>
          {tank.LastMaintenanceSummary && <Text size="xs">{tank.LastMaintenanceSummary}</Text>}
        </Table.Td>
        <Table.Td><Badge size="xs" color={stat.color} variant="light">{stat.label}</Badge></Table.Td>
        <Table.Td>
          <Group gap="xs">
            <ActionIcon variant="subtle" color="blue" onClick={() => navigate(`/tanks/${tank.Id}`)} style={{ transition: 'transform 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'} onMouseLeave={(e) => e.currentTarget.style.transform = ''}><IconEye size={18} /></ActionIcon>
            <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(tank.Id)} style={{ transition: 'transform 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'} onMouseLeave={(e) => e.currentTarget.style.transform = ''}><IconTrash size={18} /></ActionIcon>
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Box>
      <style>{styles}</style>
      <Group justify="space-between" mb="lg">
        <Box>
          <Text size="xl" fw={700}>{t('My Tanks')}</Text>
          <Text size="sm" c="dimmed">{filtered.length} {t('tank(s) tracked')}</Text>
        </Box>
        <Button leftSection={<IconPlus size={16} />} onClick={() => navigate('/tanks/new')} style={{ animation: 'pulseBtn 2s ease 1s 1' }}>{t('Add Tank')}</Button>
      </Group>

      <Group mb="lg" gap="sm" style={{ animation: 'fadeIn 0.4s ease both' }}>
        <TextInput
          placeholder={t("Search tanks...")}
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 280 }}
        />
        <Select
          placeholder={t("All types")}
          data={Object.entries(TANK_TYPE_LABELS).map(([k, v]) => ({ value: k, label: t(v) }))}
          value={typeFilter}
          onChange={setTypeFilter}
          clearable
          w={200}
        />
        <Select
          placeholder={t("All status")}
          data={[
            { value: 'warning', label: t('Needs attention') },
            { value: 'inactive', label: t('Inactive') },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
          clearable
          w={180}
        />
      </Group>

      {loading ? (
        <Stack align="center" py="xl"><Loader /></Stack>
      ) : filtered.length > 0 ? (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('Name')}</Table.Th>
              <Table.Th>{t('Type')}</Table.Th>
              <Table.Th>{t('Size')}</Table.Th>
              <Table.Th>{t('Managed By')}</Table.Th>
              <Table.Th>{t('Last Test')}</Table.Th>
              <Table.Th>{t('Last Dose')}</Table.Th>
              <Table.Th>{t('Last Maint.')}</Table.Th>
              <Table.Th>{t('Status')}</Table.Th>
              <Table.Th>{t('Actions')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      ) : (
        <Stack align="center" py="xl" style={{ animation: 'fadeIn 0.5s ease both' }}>
          <Text c="dimmed">{t('No tanks found')}</Text>
          <Button variant="light" onClick={() => navigate('/tanks/new')}>{t('Add your first tank')}</Button>
        </Stack>
      )}
    </Box>
  );
}

export default TankListPage;
