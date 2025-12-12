import { TrendingUp, Users, Package, DollarSign } from 'lucide-react';

export function DashboardHome() {
  const summaryCards = [
    {
      title: 'Ventas Totales',
      value: '$124,500',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Usuarios Activos',
      value: '1,234',
      change: '+8.2%',
      trend: 'up',
      icon: Users,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Paquetes Turísticos',
      value: '87',
      change: '+5.4%',
      trend: 'up',
      icon: Package,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Ingresos Mensuales',
      value: '$45,200',
      change: '+15.3%',
      trend: 'up',
      icon: TrendingUp,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <div className="flex items-center gap-1 text-green-600 text-xs">
                  <TrendingUp className="w-3 h-3" />
                  <span>{card.change}</span>
                </div>
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

      {/* Recent Activity Section */}
      <div className="mt-8 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-6">
        <h2 className="text-[var(--color-text-primary)] mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="px-4 py-3 bg-[var(--color-primary-blue)] hover:bg-[var(--color-primary-blue-hover)] text-white rounded-md transition-colors text-left">
            Crear Nuevo Paquete
          </button>
          <button className="px-4 py-3 bg-[var(--color-background)] hover:bg-[var(--color-border)] text-[var(--color-text-primary)] rounded-md transition-colors text-left border border-[var(--color-border)]">
            Agregar Promoción
          </button>
          <button className="px-4 py-3 bg-[var(--color-background)] hover:bg-[var(--color-border)] text-[var(--color-text-primary)] rounded-md transition-colors text-left border border-[var(--color-border)]">
            Generar Reporte
          </button>
        </div>
      </div>
    </div>
  );
}