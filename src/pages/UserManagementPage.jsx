import { useState, useEffect, useCallback } from 'react';
import {
  Box, Text, Card, Stack, Group, TextInput, PasswordInput, Button,
  Table, Badge, ActionIcon, Paper, Divider, Alert, Loader
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTrash, IconUserPlus, IconKey, IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { usersApi } from '../api/users';
import { useAuth } from '../hooks/useAuth';
import { useConfirmModal } from '../hooks/useConfirmModal';
import { useTranslation } from 'react-i18next';

function UserManagementPage() {
  const { t } = useTranslation();
  const { confirm, ConfirmModal } = useConfirmModal();
  const { user } = useAuth();
  const isOwner = user?.role === 'Owner';

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwdLoading, setPwdLoading] = useState(false);

  const [empForm, setEmpForm] = useState({ email: '', password: '' });
  const [empLoading, setEmpLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const res = await usersApi.getAll();
      setUsers(res.data || []);
    } catch {
      notifications.show({ title: t('Error'), message: t('Failed to load users'), color: 'red' });
    } finally { setLoadingUsers(false); }
  }, [t]);

  useEffect(() => {
    if (isOwner) loadUsers();
  }, [isOwner, loadUsers]);

  const handleChangePassword = async () => {
    if (!pwdForm.currentPassword || !pwdForm.newPassword) {
      notifications.show({ title: t('Error'), message: t('All fields are required'), color: 'red' });
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirm) {
      notifications.show({ title: t('Error'), message: t('Passwords do not match'), color: 'red' });
      return;
    }
    if (pwdForm.newPassword.length < 6) {
      notifications.show({ title: t('Error'), message: t('Password must be at least 6 characters'), color: 'red' });
      return;
    }
    try {
      setPwdLoading(true);
      if (pwdForm.currentPassword === pwdForm.newPassword) {
        notifications.show({ title: t('Error'), message: t('New password cannot be the same as current password'), color: 'red' });
        return;
      }
      await usersApi.changePassword(pwdForm.currentPassword, pwdForm.newPassword);
      notifications.show({ title: t('Success'), message: t('Password changed'), color: 'green', icon: <IconCheck size={16} /> });
      setPwdForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (e) {
      notifications.show({
        title: t('Error'),
        message: e.response?.data?.message || t('Failed to change password'),
        color: 'red'
      });
    } finally { setPwdLoading(false); }
  };

  const handleRegisterEmployee = async () => {
    if (!empForm.email.trim() || !empForm.password) {
      notifications.show({ title: t('Error'), message: t('Email and password are required'), color: 'red' });
      return;
    }
    if (empForm.password.length < 6) {
      notifications.show({ title: t('Error'), message: t('Password must be at least 6 characters'), color: 'red' });
      return;
    }
    try {
      setEmpLoading(true);
      await usersApi.registerEmployee(empForm.email.trim(), empForm.password);
      notifications.show({ title: t('Success'), message: t('Employee registered'), color: 'green' });
      setEmpForm({ email: '', password: '' });
      loadUsers();
    } catch (e) {
      notifications.show({
        title: t('Error'),
        message: e.response?.data?.message || t('Failed to register employee'),
        color: 'red'
      });
    } finally { setEmpLoading(false); }
  };

  const handleDeleteUser = async (u) => {
    if (!(await confirm(t('Delete user {email}? This cannot be undone.', { email: u.Email })))) return;
    try {
      await usersApi.delete(u.Id);
      notifications.show({ title: t('Deleted'), message: t('User removed'), color: 'green' });
      loadUsers();
    } catch (e) {
      notifications.show({
        title: t('Error'),
        message: e.response?.data?.message || t('Failed to delete user'),
        color: 'red'
      });
    }
  };

  return (
    <Box>
      <Text size="xl" fw={700} mb="lg">{t('User Management')}</Text>

      <Card padding="lg" radius="md" withBorder mb="lg">
        <Group gap="sm" mb="md">
          <IconKey size={22} color="var(--mantine-color-teal-6)" />
          <Box>
            <Text fw={700}>{t('Change Password')}</Text>
            <Text size="xs" c="dimmed">{t('Update your account password')}</Text>
          </Box>
        </Group>

        <Stack gap="sm" maw={400}>
          <PasswordInput
            label={t('Current Password')}
            value={pwdForm.currentPassword}
            onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
          />
          <PasswordInput
            label={t('New Password')}
            value={pwdForm.newPassword}
            onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
          />
          <PasswordInput
            label={t('Confirm New Password')}
            value={pwdForm.confirm}
            onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
          />
          <Button onClick={handleChangePassword} loading={pwdLoading} variant="light" color="teal">
            {t('Change Password')}
          </Button>
        </Stack>
      </Card>

      {isOwner && (
        <>
          <Card padding="lg" radius="md" withBorder mb="lg">
            <Group gap="sm" mb="md">
              <IconUserPlus size={22} color="var(--mantine-color-blue-6)" />
              <Box>
                <Text fw={700}>{t('Register Employee')}</Text>
                <Text size="xs" c="dimmed">{t('Create an employee account with limited permissions')}</Text>
              </Box>
            </Group>

            <Stack gap="sm" maw={400}>
              <TextInput
                label={t('Email')}
                type="email"
                placeholder="employee@example.com"
                value={empForm.email}
                onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
              />
              <PasswordInput
                label={t('Password')}
                value={empForm.password}
                onChange={(e) => setEmpForm({ ...empForm, password: e.target.value })}
              />
              <Button onClick={handleRegisterEmployee} loading={empLoading} variant="light" color="blue">
                {t('Register Employee')}
              </Button>
            </Stack>
          </Card>

          <Card padding="lg" radius="md" withBorder>
            <Text fw={700} mb="md">{t('Users')} ({users.length})</Text>

            {loadingUsers ? (
              <Stack align="center" py="md"><Loader /></Stack>
            ) : users.length === 0 ? (
              <Text c="dimmed">{t('No users found')}</Text>
            ) : (
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>ID</Table.Th>
                    <Table.Th>{t('Email')}</Table.Th>
                    <Table.Th>{t('Role')}</Table.Th>
                    <Table.Th>{t('Actions')}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {users.map((u) => (
                    <Table.Tr key={u.Id}>
                      <Table.Td>{u.Id}</Table.Td>
                      <Table.Td fw={500}>{u.Email}</Table.Td>
                      <Table.Td>
                        <Badge color={u.Role === 'Owner' ? 'teal' : 'blue'} variant="light">
                          {u.Role}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => handleDeleteUser(u)}
                          disabled={u.Id === user.userId}
                          title={u.Id === user.userId ? t('Cannot delete yourself') : t('Delete user')}
                        >
                          <IconTrash size={18} />
                        </ActionIcon>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Card>
        </>
      )}
      {ConfirmModal}
    </Box>
  );
}

export default UserManagementPage;
