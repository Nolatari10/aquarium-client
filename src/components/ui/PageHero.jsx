import { Box, Group, Text, Button } from '@mantine/core';

export default function PageHero({
  title,
  description,
  action,
  children,
}) {
  return (
    <Box className="page-hero">
      <Group justify="space-between" align="flex-start" mb="md">
        <Box>
          <Text size="xl" fw={700} c="var(--aqua-text-primary)" style={{ letterSpacing: '-0.01em' }}>
            {title}
          </Text>
          {description && (
            <Text size="sm" c="var(--aqua-text-secondary)" mt={2}>
              {description}
            </Text>
          )}
        </Box>
        {action}
      </Group>
      {children}
    </Box>
  );
}
