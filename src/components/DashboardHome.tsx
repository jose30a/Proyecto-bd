import { useEffect, useState } from 'react';
import { TrendingUp, Users, Package, DollarSign } from 'lucide-react';

interface DashboardStats {
  total_sales: string;
  active_users: string;
  total_packages: string;
  monthly_revenue: string;
}

export function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/function/get_dashboard_stats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ params: [] }),
        });
        const result = await response.json();
        if (result.success && result.data && result.data.length > 0) {
          setStats(result.data[0]);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  const summaryCards = [
    {
      title: 'Ventas Totales',
      value: stats ? `$${Number(stats.total_sales).toLocaleString()}` : 'Loading...',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Usuarios Activos',
      value: stats ? Number(stats.active_users).toLocaleString() : 'Loading...',
      change: '+8.2%',
      trend: 'up',
      icon: Users,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Paquetes Turísticos',
      value: stats ? Number(stats.total_packages).toLocaleString() : 'Loading...',
      change: '+5.4%',
      trend: 'up',
      icon: Package,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },

  ];

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-[var(--color-text-primary)] mb-2">
          Bienvenido al Panel de ViajesUCAB
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Aquí está un resumen del rendimiento de tu agencia de viajes
        </p>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                {/* 
                <div className="flex items-center gap-1 text-green-600 text-xs">
                  <TrendingUp className="w-3 h-3" />
                  <span>{card.change}</span>
                </div>
                */}
              </div>
              <h3 className="text-[var(--color-text-secondary)] text-sm mb-1">
                {card.title}
              </h3>
              <p className="text-[var(--color-text-primary)] text-2xl">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}