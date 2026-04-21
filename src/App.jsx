import { AppShell, Burger, Group, Text, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  IconDashboard,
  IconFish,
  IconUsers,
  IconPackage,
  IconShoppingCart,
  IconBook,
  IconReport
} from '@tabler/icons-react';
import DashboardPage from './pages/DashboardPage';
import SpeciesPage from './pages/SpeciesPage';
import SuppliersPage from './pages/SuppliersPage';
import InventoryLotsPage from './pages/InventoryLotsPage';
import SalesPage from './pages/SalesPage';
import CatalogPage from './pages/CatalogPage';
import ReportsPage from './pages/ReportsPage';

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
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const location = useLocation();

  const handleNavClick = () => {
    closeMobile();
  };

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
              Aquarium Manager
            </Text>
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
                if (!isActive) e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-1)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <link.icon size={20} />
              <Text size="sm" fw={isActive ? 600 : 400}>{link.label}</Text>
            </UnstyledButton>
          );
        })}
      </AppShell.Navbar>

      <AppShell.Main>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/species" element={<SpeciesPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/inventory" element={<InventoryLotsPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;