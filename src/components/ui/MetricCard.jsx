import { Card, Group, Text } from '@mantine/core';

export default function MetricCard({
  title,
  value,
  icon: Icon,
  color = 'aqua',
  description,
  delta,
  deltaLabel,
  onClick,
  style,
}) {
  const isClickable = !!onClick;
  return (
    <Card
      className="glow-card kpi-enter"
      onClick={onClick}
      style={{
        cursor: isClickable ? 'pointer' : 'default',
        background: 'var(--aqua-scheme-card-gradient)',
        ...style,
      }}
    >
      <Group justify="space-between" mb={8}>
        <Text size="xs" fw={600} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>
          {title}
        </Text>
        {Icon && (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `rgba(var(--mantine-color-${color}-rgb), 0.12)`,
            }}
          >
            <Icon size={18} style={{ color: `var(--mantine-color-${color}-filled)` }} />
          </div>
        )}
      </Group>
      <Text size="1.625rem" fw={700} lh="1.2" mb={4}>
        {value}
      </Text>
      {(description || delta !== undefined) && (
        <Group gap="xs" mt={4}>
          {delta !== undefined && (
            <Text
              size="xs"
              fw={600}
              c={Number(delta) >= 0 ? 'green.5' : 'red.5'}
            >
              {Number(delta) >= 0 ? '+' : ''}{delta}
            </Text>
          )}
          <Text size="xs" c="dimmed">
            {deltaLabel || description}
          </Text>
        </Group>
      )}
    </Card>
  );
}
