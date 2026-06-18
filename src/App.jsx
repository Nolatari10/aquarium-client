import { AppShell, Burger, Group, Text, UnstyledButton, Button, Badge, ActionIcon, useMantineColorScheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import {
  IconDashboard,
  IconFish,
  IconUsers,
  IconUser,
  IconPackage,
  IconShoppingCart,
  IconBook,
  IconReport,
  IconLogout,
  IconSun,
  IconMoon,
  IconDroplet,
  IconBell,
  IconId,
} from '@tabler/icons-react';
import DashboardPage from './pages/DashboardPage';
import SpeciesPage from './pages/SpeciesPage';
import SuppliersPage from './pages/SuppliersPage';
import CustomersPage from './pages/CustomersPage';
import InventoryLotsPage from './pages/InventoryLotsPage';
import BulkReceiveInventoryPage from './pages/BulkReceiveInventoryPage';
import LotDetailPage from './pages/LotDetailPage';
import SalesPage from './pages/SalesPage';
import CatalogPage from './pages/CatalogPage';
import ReportsPage from './pages/ReportsPage';
import LoginPage from './pages/LoginPage';
import TankListPage from './pages/Tanks/TankListPage';
import TankCreatePage from './pages/Tanks/TankCreatePage';
import TankDetailPage from './pages/Tanks/TankDetailPage';
import AlertConfigsPage from './pages/AlertConfigsPage';
import UserManagementPage from './pages/UserManagementPage';
import { useAuth } from './hooks/useAuth';
import { RequireAuth } from './components/auth/RequireAuth';
import { useTranslation } from 'react-i18next';

const navLinks = [
  { icon: IconDashboard, label: 'Dashboard', to: '/' },
  { icon: IconFish, label: 'Species', to: '/species' },
  { icon: IconUsers, label: 'Suppliers', to: '/suppliers' },
  { icon: IconId, label: 'Customers', to: '/customers' },
  { icon: IconPackage, label: 'Inventory', to: '/inventory' },
  { icon: IconShoppingCart, label: 'Sales', to: '/sales' },
  { icon: IconBook, label: 'Catalog', to: '/catalog' },
  { icon: IconReport, label: 'Reports', to: '/reports' },
  { icon: IconDroplet, label: 'Tanks', to: '/tanks' },
  { icon: IconBell, label: 'Alerts', to: '/alerts' },
  { icon: IconUser, label: 'Users', to: '/users', roleRequired: 'Owner' },
];

function App() {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const location = useLocation();

  const visibleNavLinks = navLinks.filter(link => !link.roleRequired || user?.role === link.roleRequired);

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
      <AppShell.Header style={{
        background: 'var(--aqua-scheme-header-bg)',
        borderBottom: '1px solid var(--aqua-scheme-border)',
      }}>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
            <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
            <Text fw={700} size="lg" style={{ color: 'var(--aqua-accent)', letterSpacing: '-0.01em' }}>
              {user?.tenantName || t('Aquarium Manager')}
            </Text>
          </Group>
          <Group gap="sm">
              <Badge variant="light" color={user?.role === 'Owner' ? 'teal' : 'blue'}>
                {t(user?.role || '')}
              </Badge>
            <ActionIcon
              variant="default"
              onClick={toggleColorScheme}
              size="lg"
               aria-label={t('Toggle color scheme')}
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
              {t('Logout')}
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" style={{
        background: 'var(--aqua-scheme-navbar-bg)',
        borderRight: '1px solid var(--aqua-scheme-border)',
      }}>
        {visibleNavLinks.map((link) => {
          const isActive = location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to));
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
                padding: '10px 14px',
                borderRadius: 8,
                textDecoration: 'none',
                color: isActive ? 'var(--aqua-scheme-text-primary)' : 'var(--aqua-scheme-text-secondary)',
                backgroundColor: isActive ? 'rgba(34, 199, 201, 0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(34, 199, 201, 0.2)' : '1px solid transparent',
                marginBottom: 4,
                width: '100%',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                fontWeight: isActive ? 600 : 400,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--aqua-scheme-surface-raised)';
                  e.currentTarget.style.color = 'var(--aqua-scheme-text-primary)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--aqua-scheme-text-secondary)';
                  e.currentTarget.style.transform = '';
                }
              }}
            >
              <link.icon size={20} style={{ opacity: isActive ? 1 : 0.65 }} />
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
          <Route path="/customers" element={<RequireAuth><CustomersPage /></RequireAuth>} />
          <Route path="/inventory" element={<RequireAuth><InventoryLotsPage /></RequireAuth>} />
          <Route path="/inventory/bulk-receive" element={<RequireAuth><BulkReceiveInventoryPage /></RequireAuth>} />
          <Route path="/inventory/:id" element={<RequireAuth><LotDetailPage /></RequireAuth>} />
          <Route path="/sales" element={<RequireAuth><SalesPage /></RequireAuth>} />
          <Route path="/catalog" element={<RequireAuth><CatalogPage /></RequireAuth>} />
          <Route path="/reports" element={<RequireAuth><ReportsPage /></RequireAuth>} />
          <Route path="/tanks" element={<RequireAuth><TankListPage /></RequireAuth>} />
          <Route path="/tanks/new" element={<RequireAuth><TankCreatePage /></RequireAuth>} />
          <Route path="/tanks/:id" element={<RequireAuth><TankDetailPage /></RequireAuth>} />
          <Route path="/alerts" element={<RequireAuth><AlertConfigsPage /></RequireAuth>} />
          <Route path="/users" element={<RequireAuth><UserManagementPage /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
