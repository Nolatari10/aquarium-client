import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Group, Stack, Text, TextInput, NumberInput, Select, Switch, Textarea, Box } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { tanksApi } from '../../api/tanks';
import { extractErrorMessage } from '../../tools/errorUtils';
import { useTranslation } from 'react-i18next';

const TANK_TYPES = [
  { value: 'PlantedHighTech', label: 'Planted High-Tech' },
  { value: 'PlantedLowTech', label: 'Planted Low-Tech' },
  { value: 'Aquascape', label: 'Aquascape' },
  { value: 'Biotope', label: 'Biotope' },
  { value: 'Shrimp', label: 'Shrimp' },
  { value: 'Breeding', label: 'Breeding' },
  { value: 'Quarantine', label: 'Quarantine' },
  { value: 'Other', label: 'Other' },
];

function TankCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    Name: '',
    SizeLiters: '',
    TankType: '',
    Substrate: '',
    Co2Injection: false,
    LightDescription: '',
    FilterDescription: '',
    HeaterSetpointCelsius: '',
  });

  const isPlanted = form.TankType === 'PlantedHighTech' || form.TankType === 'PlantedLowTech';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.Name.trim()) return notifications.show({ title: t('Error'), message: t('Name is required'), color: 'red' });
    if (!form.SizeLiters || form.SizeLiters <= 0) return notifications.show({ title: t('Error'), message: t('Size must be > 0'), color: 'red' });
    if (!form.TankType) return notifications.show({ title: t('Error'), message: t('Type is required'), color: 'red' });

    try {
      setLoading(true);
      const data = {
        ...form,
        SizeLiters: parseFloat(form.SizeLiters),
        HeaterSetpointCelsius: form.HeaterSetpointCelsius ? parseFloat(form.HeaterSetpointCelsius) : null,
      };
      await tanksApi.create(data);
      notifications.show({ title: t('Success'), message: t('Tank created'), color: 'green' });
      navigate('/tanks');
    } catch (e) {
      notifications.show({ title: t('Error'), message: extractErrorMessage(e), color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const set = (key, value) => setForm({ ...form, [key]: value });

  return (
    <Box maw={700}>
      <Text size="xl" fw={700} mb="lg">{t('New Tank')}</Text>
      <Card shadow="sm" p="lg" radius="md">
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput label={t("Name")} required value={form.Name} onChange={(e) => set('Name', e.target.value)} placeholder={t("e.g. 60P Iwagumi")} />
            <Group grow>
              <NumberInput label={t("Size (L)")} required min={0} value={form.SizeLiters || ''} onChange={(v) => set('SizeLiters', v)} placeholder="60" />
              <Select label={t("Tank Type")} required data={TANK_TYPES} value={form.TankType} onChange={(v) => set('TankType', v)} placeholder={t("Select type")} />
            </Group>
            {isPlanted && (
              <>
                <Switch label={t("CO₂ Injection")} checked={form.Co2Injection} onChange={(e) => set('Co2Injection', e.currentTarget.checked)} />
                {form.Co2Injection && <Text size="xs" c="dimmed">{t('CO₂ and fertilization logging will be available for this tank.')}</Text>}
              </>
            )}
            <TextInput label={t("Substrate")} value={form.Substrate} onChange={(e) => set('Substrate', e.target.value)} placeholder={t("e.g. ADA Amazonia")} />
            <Textarea label={t("Light")} value={form.LightDescription} onChange={(e) => set('LightDescription', e.target.value)} placeholder={t("e.g. Chihiros WRGB II @ 60%")} />
            <Textarea label={t("Filter")} value={form.FilterDescription} onChange={(e) => set('FilterDescription', e.target.value)} placeholder={t("e.g. Eheim 2217")} />
            <NumberInput label={t("Heater Setpoint (°C)")} min={0} max={40} value={form.HeaterSetpointCelsius || ''} onChange={(v) => set('HeaterSetpointCelsius', v)} placeholder="25" />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={() => navigate('/tanks')} disabled={loading}>{t('Cancel')}</Button>
              <Button type="submit" loading={loading}>{t('Create Tank')}</Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </Box>
  );
}

export default TankCreatePage;
