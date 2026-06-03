import { Center, Loader, Text, Button, Stack } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';

export function LoadingState({ height = 200 }) {
  return (
    <Center style={{ height }}>
      <Stack align="center" gap="sm">
        <Loader color="aqua" size="md" />
        <Text size="sm" c="dimmed">Loading...</Text>
      </Stack>
    </Center>
  );
}

export function ErrorState({ message = 'Something went wrong', onRetry, height = 200 }) {
  return (
    <Center style={{ height }}>
      <Stack align="center" gap="md">
        <Text size="sm" c="red.5" ta="center" maw={280}>{message}</Text>
        {onRetry && (
          <Button
            variant="light"
            color="aqua"
            size="sm"
            leftSection={<IconRefresh size={14} />}
            onClick={onRetry}
          >
            Retry
          </Button>
        )}
      </Stack>
    </Center>
  );
}

export function EmptyState({
  title = 'No data',
  description = 'There is nothing here yet.',
  action,
  height = 200,
  icon: Icon,
}) {
  return (
    <Center style={{ height }}>
      <Stack align="center" gap="sm" maw={320}>
        {Icon && (
          <div style={{ opacity: 0.4 }}>
            <Icon size={40} stroke={1.5} style={{ color: 'var(--aqua-text-faint)' }} />
          </div>
        )}
        <Text size="sm" fw={500} ta="center">{title}</Text>
        <Text size="xs" c="dimmed" ta="center">{description}</Text>
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
