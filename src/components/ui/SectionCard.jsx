import { Card, Group, Text } from '@mantine/core';

export default function SectionCard({
  title,
  subtitle,
  action,
  children,
  ...props
}) {
  return (
    <Card
      className="glow-card"
      {...props}
      style={{
        background: 'var(--aqua-scheme-card-gradient)',
        ...props.style,
      }}
    >
      {(title || action) && (
        <Group justify="space-between" mb="md">
          <div>
            {title && (
              <Text size="sm" fw={600} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.04em' }}>
                {title}
              </Text>
            )}
            {subtitle && <Text size="xs" c="dimmed" mt={2}>{subtitle}</Text>}
          </div>
          {action}
        </Group>
      )}
      {children}
    </Card>
  );
}
