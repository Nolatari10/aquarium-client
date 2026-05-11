import { AppShell, Burger, Group, Text, UnstyledButton, Button, Badge, ActionIcon, useMantineColorScheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import {
  IconDashboard,
  IconFish,
  IconUsers,
  IconPackage,
  IconShoppingCart,
  IconBook,
  IconReport,
  IconLogout,
  IconSun,
  IconMoon,
} from '@tabler/icons-react';
import DashboardPage from './pages/DashboardPage';
import SpeciesPage from './pages/SpeciesPage';
import SuppliersPage from './pages/SuppliersPage';
import InventoryLotsPage from './pages/InventoryLotsPage';
import SalesPage from './pages/SalesPage';
import CatalogPage from './pages/CatalogPage';
import ReportsPage from './pages/ReportsPage';
import LoginPage from './pages/LoginPage';
import { useAuth } from './hooks/useAuth';
import { RequireAuth } from './components/auth/RequireAuth';
import { useTranslation } from 'react-i18next';

const navLinks = [
  { icon: IconDashboard, label: 'Dashboard', to: '/' },
  { icon: IconFish, label: 'Species', to: '/species' },
  { icon: IconUsers, label: 'Suppliers', to: '/suppliers' },
  { icon: IconPackage, label: 'Inventory', to: '/inventory' },
  { icon: IconShoppingCart, label: 'Sales', to: '/sales' },
  { icon: IconBook, label: 'Catalog', to: '/catalog' },
  { icon: IconReport, label: 'Reports', to: '/reports' },
];

function App() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const location = useLocation();

  const handleNavClick = () => {
    closeMobile();
  };

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 260,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="lg"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
            <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
            <Text fw={700} size="lg" c="teal.6">
              {t('Aquarium Manager')}
            </Text>
          </Group>
          <Group gap="sm">
            <Badge variant="light" color={user?.role === 'Owner' ? 'teal' : 'blue'}>
              {user?.role || ''}
            </Badge>
            <ActionIcon
              variant="default"
              onClick={toggleColorScheme}
              size="lg"
              aria-label="Toggle color scheme"
            >
              {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
            </ActionIcon>
            <Button
              variant="subtle"
              color="gray"
              size="sm"
              leftSection={<IconLogout size={16} />}
              onClick={logout}
            >
              Logout
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <UnstyledButton
              key={link.to}
              component={Link}
              to={link.to}
              onClick={handleNavClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 8,
                textDecoration: 'none',
                color: isActive ? 'var(--mantine-color-white)' : 'var(--mantine-color-text)',
                backgroundColor: isActive ? 'var(--mantine-color-teal-6)' : 'transparent',
                marginBottom: 4,
                width: '100%',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = colorScheme === 'dark' ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-1)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <link.icon size={20} />
              <Text size="sm" fw={isActive ? 600 : 400}>{t(link.label)}</Text>
            </UnstyledButton>
          );
        })}
      </AppShell.Navbar>

      <AppShell.Main>
        <Routes>
          <Route path="/" element={<RequireAuth><DashboardPage /></RequireAuth>} />
          <Route path="/species" element={<RequireAuth><SpeciesPage /></RequireAuth>} />
          <Route path="/suppliers" element={<RequireAuth><SuppliersPage /></RequireAuth>} />
          <Route path="/inventory" element={<RequireAuth><InventoryLotsPage /></RequireAuth>} />
          <Route path="/sales" element={<RequireAuth><SalesPage /></RequireAuth>} />
          <Route path="/catalog" element={<RequireAuth><CatalogPage /></RequireAuth>} />
          <Route path="/reports" element={<RequireAuth><ReportsPage /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
