import { Outlet, NavLink, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '../services/database';
import { 
  Plane, 
  Package, 
  Tag, 
  Users, 
  Map, 
  BarChart3, 
  LogOut,
  User,
  Building2,
  Home,
  Shield,
  Briefcase
} from 'lucide-react';

export function DashboardLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Handle logout logic
    navigate('/');
  };

  const [currentUser, setCurrentUser] = useState<{ email?: string; role?: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const user = await getCurrentUser();
        console.log('DashboardLayout: current user fetched', user);
        if (user) {
          setCurrentUser({ email: user.email_usu, role: user.nombre_rol || user.role });
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const navItems = [
    { path: '/dashboard/airlines', label: 'Gestión de Aerolíneas', icon: Plane },
    { path: '/dashboard/packages', label: 'Paquetes Turísticos', icon: Package },
    { path: '/dashboard/promotions', label: 'Promociones', icon: Tag },
    { path: '/dashboard/roles', label: 'Roles de Usuario', icon: Shield },
    { path: '/dashboard/user-management', label: 'Gestión de Usuarios', icon: Users },
    { path: '/dashboard/itinerary', label: 'Crear Itinerario', icon: Map },
    { path: '/dashboard/my-bookings', label: 'Mis Reservas', icon: Briefcase },
    { path: '/dashboard/reports', label: 'Reportes', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex">
      {/* Left Sidebar */}
      <aside className="w-64 bg-[var(--color-card)] border-r border-[var(--color-border)] flex flex-col">
        {/* Logo Section */}
        <div className="p-6 border-b border-[var(--color-border)]">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 w-full hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-[var(--color-primary-blue)] rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-[var(--color-text-primary)]">ViajesUCAB</h2>
            </div>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                        isActive
                          ? 'bg-[var(--color-primary-blue)] text-white'
                          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-background)] hover:text-[var(--color-text-primary)]'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-[var(--color-card)] border-b border-[var(--color-border)] px-8 py-4">
          <div className="flex items-center justify-end gap-6">
            {/* User Profile Section */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--color-primary-blue-light)] rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[var(--color-text-primary)]">{currentUser?.email || 'Usuario Admin'}</p>
                <p className="text-[var(--color-text-secondary)] text-xs">{currentUser?.role || 'Administrador'}</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-background)] hover:bg-[var(--color-border)] text-[var(--color-text-primary)] rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}