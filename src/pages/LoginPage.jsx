import { useState } from 'react';
import {
  Container,
  Paper,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Stack,
  Alert,
} from '@mantine/core';
import { IconLogin, IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError(t('Please enter both email and password.'));
      return;
    }

    const result = await login(email.trim(), password);
    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <Container size={420} my={80}>
      <Title ta="center" fw={900}>
        {t('Aquarium Manager')}
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        {t('Sign in to manage your store')}
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            {error && (
              <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
                {error}
              </Alert>
            )}

            <TextInput
              label={t('Email')}
              placeholder={t('you@example.com')}
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              required
              autoFocus
            />

            <PasswordInput
              label={t('Password')}
              placeholder={t('Your password')}
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
            />

            <Button
              type="submit"
              fullWidth
              leftSection={<IconLogin size={16} />}
              loading={loading}
            >
              {t('Sign in')}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
