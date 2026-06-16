import { useState, useEffect, useCallback } from 'react';
import { Button, TextInput, Textarea, Group, Text, ActionIcon, Badge, Stack, Paper, Modal, Loader } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { speciesVariantsApi } from '../api/speciesVariantsApi';
import { useTranslation } from 'react-i18next';

export default function SpeciesVariantManager({ speciesId, speciesName }) {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ VariantName: '', Notes: '', ImageUrl: '' });
  const { t } = useTranslation();

  const loadVariants = useCallback(async () => {
    try {
      setLoading(true);
      const r = await speciesVariantsApi.getBySpeciesId(speciesId);
      setVariants(r.data || []);
    } catch {
      notifications.show({ title: t('Error'), message: t('Failed to load variants'), color: 'red' });
    } finally {
      setLoading(false);
    }
  }, [speciesId]);

  useEffect(() => {
    if (speciesId) loadVariants();
  }, [speciesId, loadVariants]);

  const handleCreate = () => {
    setEditing(null);
    setForm({ VariantName: '', Notes: '', ImageUrl: '' });
    openEdit();
  };

  const handleEdit = (variant) => {
    setEditing(variant);
    setForm({
      VariantName: variant.VariantName || '',
      Notes: variant.Notes || '',
      ImageUrl: variant.ImageUrl || ''
    });
    openEdit();
  };

  const handleSubmit = async () => {
    if (!form.VariantName.trim()) {
      notifications.show({ title: t('Error'), message: t('Variant name is required.'), color: 'red' });
      return;
    }
    try {
      if (editing) {
        await speciesVariantsApi.update(speciesId, editing.Id, form);
        notifications.show({ title: t('Success'), message: t('Variant updated'), color: 'green' });
      } else {
        await speciesVariantsApi.create(speciesId, form);
        notifications.show({ title: t('Success'), message: t('Variant created'), color: 'green' });
      }
      closeEdit();
      loadVariants();
    } catch (e) {
      notifications.show({
        title: t('Error'),
        message: e.response?.data?.ErrorMessage || t('Operation failed'),
        color: 'red'
      });
    }
  };

  const handleDelete = async (variant) => {
    if (variant.InventoryLotCount > 0) {
      notifications.show({
        title: t('Warning'),
        message: t('Cannot delete this variant because it has linked inventory lots.'),
        color: 'orange'
      });
      return;
    }
    try {
      await speciesVariantsApi.delete(speciesId, variant.Id);
      notifications.show({ title: t('Success'), message: t('Variant deleted'), color: 'green' });
      loadVariants();
    } catch (e) {
      notifications.show({
        title: t('Error'),
        message: e.response?.data?.ErrorMessage || t('Failed to delete variant'),
        color: 'red'
      });
    }
  };

  return (
    <>
      <Paper p="md" radius="md" withBorder>
        <Group justify="space-between" mb="sm">
          <Text fw={600} size="sm">Variants — {speciesName}</Text>
          <Button size="xs" leftSection={<IconPlus size={14} />} onClick={handleCreate}>
            {t('Add Variant')}
          </Button>
        </Group>

        {loading ? (
          <Loader size="sm" />
        ) : variants.length === 0 ? (
          <Text size="sm" c="dimmed">{t('No variants defined. Each species has at least a "Standard" variant.')}</Text>
        ) : (
          <Stack gap="xs">
            {variants.map(v => (
              <Group key={v.Id} justify="space-between" wrap="nowrap">
                <Group gap="xs">
                  <Text size="sm" fw={500}>
                    {v.VariantName}
                    {v.VariantName === 'Standard' && (
                      <Badge size="xs" variant="light" color="blue" ml={4}>{t('default')}</Badge>
                    )}
                  </Text>
                  {v.InventoryLotCount > 0 && (
                    <Badge size="xs" variant="light" color="teal">{t('{count} lot(s)', { count: v.InventoryLotCount })}</Badge>
                  )}
                </Group>
                <Group gap={4}>
                  <ActionIcon variant="subtle" size="sm" color="blue" onClick={() => handleEdit(v)}>
                    <IconEdit size={14} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    color={v.InventoryLotCount > 0 ? 'gray' : 'red'}
                    disabled={v.InventoryLotCount > 0}
                    onClick={() => handleDelete(v)}
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </Group>
              </Group>
            ))}
          </Stack>
        )}
      </Paper>

      <Modal opened={editOpened} onClose={closeEdit} title={editing ? t('Edit Variant') : t('Add Variant')}>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <Stack gap="sm">
            <TextInput
              label={t('Variant Name')}
              required
              placeholder={t('e.g. Halfmoon Blue, Crowntail')}
              value={form.VariantName}
              onChange={(e) => setForm({ ...form, VariantName: e.target.value })}
            />
            <TextInput
              label={t('Image URL')}
              placeholder={t('https://...')}
              value={form.ImageUrl}
              onChange={(e) => setForm({ ...form, ImageUrl: e.target.value })}
            />
            <Textarea
              label="Notes"
              value={form.Notes}
              onChange={(e) => setForm({ ...form, Notes: e.target.value })}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={closeEdit}>{t('Cancel')}</Button>
              <Button type="submit">{editing ? t('Update') : t('Create')}</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
