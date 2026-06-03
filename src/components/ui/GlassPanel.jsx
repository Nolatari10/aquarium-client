import { Box } from '@mantine/core';

export default function GlassPanel({ children, style, ...props }) {
  return (
    <Box
      className="glass-panel"
      p="lg"
      {...props}
      style={{
        boxShadow: 'var(--aqua-scheme-shadow-sm)',
        ...style,
      }}
    >
      {children}
    </Box>
  );
}
