import { Badge } from '@mantine/core';

const STATUS_COLORS = {
  ok: 'green',
  active: 'green',
  available: 'green',
  healthy: 'green',
  warning: 'yellow',
  low: 'yellow',
  pending: 'yellow',
  due: 'yellow',
  error: 'red',
  empty: 'red',
  critical: 'red',
  dead: 'red',
  inactive: 'gray',
  neutral: 'gray',
};

export default function StatusBadge({ status, color, label, size = 'sm' }) {
  const resolvedColor = color || STATUS_COLORS[status?.toLowerCase()] || 'gray';

  return (
    <Badge
      color={resolvedColor}
      variant="light"
      size={size}
      style={{
        fontWeight: 600,
        textTransform: 'none',
        letterSpacing: '0.01em',
      }}
    >
      {label || status}
    </Badge>
  );
}
