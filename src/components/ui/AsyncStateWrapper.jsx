import { Center, Loader, Text, Button, Stack } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export function LoadingState({ height = 200 }) {
  const { t } = useTranslation();
  return (
    <Center style={{ height }}>
      <Stack align="center" gap="sm">
        <Loader color="aqua" size="md" />
        <Text size="sm" c="dimmed">{t('Loading...')}</Text>
      </Stack>
    </Center>
  );
}

export function ErrorState({ message, onRetry, height = 200 }) {
  const { t } = useTranslation();
  return (
    <Center style={{ height }}>
      <Stack align="center" gap="md">
        <Text size="sm" c="red.5" ta="center" maw={280}>{message || t('Something went wrong')}</Text>
        {onRetry && (
          <Button
            variant="light"
            color="aqua"
            size="sm"
            leftSection={<IconRefresh size={14} />}
            onClick={onRetry}
          >
            {t('Retry')}
          </Button>
        )}
      </Stack>
    </Center>
  );
}

export function EmptyState({
  title,
  description,
  action,
  height = 200,
  icon: Icon,
}) {
  const { t } = useTranslation();
  return (
    <Center style={{ height }}>
      <Stack align="center" gap="sm" maw={320}>
        {Icon && (
          <div style={{ opacity: 0.4 }}>
            <Icon size={40} stroke={1.5} style={{ color: 'var(--aqua-text-faint)' }} />
          </div>
        )}
        <Text size="sm" fw={500} ta="center">{title || t('No data')}</Text>
        <Text size="xs" c="dimmed" ta="center">{description || t('There is nothing here yet.')}</Text>
        {action}
      </Stack>
    </Center>
  );
}

export default function AsyncStateWrapper({
  loading,
  error,
  errorMessage,
  onRetry,
  empty,
  emptyTitle,
  emptyDescription,
  emptyAction,
  emptyIcon,
  height,
  children,
}) {
  if (loading) return <LoadingState height={height} />;
  if (error) return <ErrorState message={errorMessage} onRetry={onRetry} height={height} />;
  if (empty) return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} icon={emptyIcon} height={height} />;
  return children;
}
