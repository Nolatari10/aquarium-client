import { AppShell, Burger, Group, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { NavLink, Routes, Route } from 'react-router-dom';
import { 
  IconDashboard, IconFish, IconUsers, IconPackage, 
  IconShoppingCart, IconBook, IconReport 
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
  { icon: IconPackage, label: 'Inventory Lots', to: '/inventory' },
  { icon: IconShoppingCart, label: 'Sales', to: '/sales' },
  { icon: IconBook, label: 'Catalog', to: '/catalog' },
  { icon: IconReport, label: 'Reports', to: '/reports' },
];

function App() {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
          <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
          <Text fw={700} size="xl">Aquarium Manager</Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: isActive ? 'white' : 'var(--mantine-color-text)',
              backgroundColor: isActive ? 'var(--mantine-color-blue-filled)' : 'transparent',
              marginBottom: '4px',
            })}
          >
            <link.icon size={20} />
            <span>{link.label}</span>
          </NavLink>
        ))}
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