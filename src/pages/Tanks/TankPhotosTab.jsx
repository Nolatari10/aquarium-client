import { useState, useEffect, useCallback } from 'react';
import { Button, Group, Stack, Text, Modal, TextInput, Textarea, SimpleGrid, Image, ActionIcon, Loader, Card } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconTrash, IconPhoto } from '@tabler/icons-react';
import { tanksApi } from '../../api/tanks';
import { useConfirmModal } from '../../hooks/useConfirmModal';
import { useTranslation } from 'react-i18next';
function TankPhotosTab({ tankId }) {
  const { t } = useTranslation();
  const { confirm, ConfirmModal } = useConfirmModal();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  const [viewPhoto, setViewPhoto] = useState(null);
  const [form, setForm] = useState({
    TakenAt: new Date().toISOString().slice(0, 16),
    ImageUrl: '',
    Caption: '',
    LinkedLogType: '',
    LinkedLogId: '',
  });

  const loadPhotos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await tanksApi.getPhotos(tankId, { pageSize: 50 });
      setPhotos(res.data || []);
    } catch {
      notifications.show({ title: t('Error'), message: t('Failed to load photos'), color: 'red' });
    } finally { setLoading(false); }
  }, [tankId]);

  useEffect(() => { loadPhotos(); }, [loadPhotos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ImageUrl.trim()) return notifications.show({ title: t('Error'), message: t('Image URL is required'), color: 'red' });
    try {
      const data = {
        ...form,
        LinkedLogId: form.LinkedLogId ? parseInt(form.LinkedLogId) : null,
        LinkedLogType: form.LinkedLogType || null,
      };
      await tanksApi.addPhoto(tankId, data);
      notifications.show({ title: t('Success'), message: t('Photo added'), color: 'green' });
      close();
      setForm({ TakenAt: new Date().toISOString().slice(0, 16), ImageUrl: '', Caption: '', LinkedLogType: '', LinkedLogId: '' });
      loadPhotos();
    } catch {
      notifications.show({ title: t('Error'), message: t('Failed to save'), color: 'red' });
    }
  };

  const handleDelete = async (photoId) => {
    if (!(await confirm(t('Delete this photo?')))) return;
    try {
      await tanksApi.deletePhoto(photoId);
      notifications.show({ title: t('Success'), message: t('Photo deleted'), color: 'green' });
      loadPhotos();
    } catch {
      notifications.show({ title: t('Error'), message: t('Failed to delete'), color: 'red' });
    }
  };

  return (
    <Stack>
      <Group justify="space-between">
        <Text fw={600}>{t('Photos')} ({photos.length})</Text>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>{t('Add Photo')}</Button>
      </Group>

      {loading ? <Loader /> : photos.length > 0 ? (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
          {photos.map(p => (
            <Card key={p.Id} shadow="sm" padding="sm" radius="md">
              <Card.Section>
                <Image
                  src={p.ImageUrl}
                  height={200}
                  fit="cover"
                  alt={p.Caption || t('Tank photo')}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setViewPhoto(p)}
                  fallbackSrc={`data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#eee" width="200" height="200"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#999" font-size="14">No image</text></svg>')}`}
                />
              </Card.Section>
              <Stack gap={4} mt="sm">
                <Text size="xs" c="dimmed">{new Date(p.TakenAt).toLocaleDateString()}</Text>
                {p.Caption && <Text size="sm">{p.Caption}</Text>}
                {p.LinkedLogType && <Text size="xs" c="teal">{t('Linked: {type}', { type: p.LinkedLogType })}</Text>}
                <ActionIcon variant="subtle" color="red" size="sm" onClick={() => handleDelete(p.Id)} style={{ alignSelf: 'flex-end' }}>
                  <IconTrash size={14} />
                </ActionIcon>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      ) : <Text c="dimmed" ta="center" py="md">{t('No photos added yet.')}</Text>}

      <Modal opened={opened} onClose={close} title={t('Add Photo')} size="md">
        <form onSubmit={handleSubmit}>
          <Stack gap="sm">
            <TextInput type="datetime-local" label={t('Date/Time')} value={form.TakenAt} onChange={(e) => setForm({ ...form, TakenAt: e.target.value })} />
            <TextInput label={t('Image URL')} required value={form.ImageUrl} onChange={(e) => setForm({ ...form, ImageUrl: e.target.value })} placeholder={t('https://...')} />
            <Textarea label={t('Caption')} value={form.Caption} onChange={(e) => setForm({ ...form, Caption: e.target.value })} placeholder={t('Post-trim, algae outbreak, etc.')} />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={close}>{t('Cancel')}</Button>
              <Button type="submit">{t('Save')}</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal opened={!!viewPhoto} onClose={() => setViewPhoto(null)} size="xl" title={viewPhoto?.Caption || t('Photo')}>
        {viewPhoto && (
          <Stack>
            <Image src={viewPhoto.ImageUrl} fit="contain" height={500} alt={viewPhoto.Caption} />
            <Text size="sm" c="dimmed">{new Date(viewPhoto.TakenAt).toLocaleDateString()}</Text>
            {viewPhoto.LinkedLogType && <Text size="xs" c="teal">{t('Linked to: {type}', { type: viewPhoto.LinkedLogType })}</Text>}
          </Stack>
        )}
      </Modal>
      {ConfirmModal}
    </Stack>
  );
}

export default TankPhotosTab;
