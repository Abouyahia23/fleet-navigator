import { Car, Fuel, Wrench, AlertTriangle, Clock, Loader2 } from 'lucide-react';
import { StatCard } from './StatCard';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useRepairTickets } from '@/hooks/useRepairTickets';
import { useWorkOrders } from '@/hooks/useWorkOrders';
import { useVehicles } from '@/hooks/useVehicles';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: tickets = [] } = useRepairTickets();
  const { data: workOrders = [] } = useWorkOrders();
  const { data: vehicles = [] } = useVehicles();

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const vehicleStatusData = [
    { name: 'Actif', value: vehicles.filter(v => v.statut === 'Actif').length, color: 'hsl(145, 65%, 40%)' },
    { name: 'Immobilisé', value: vehicles.filter(v => v.statut === 'Immobilisé').length, color: 'hsl(38, 92%, 50%)' },
    { name: 'Sorti', value: vehicles.filter(v => v.statut === 'Sorti').length, color: 'hsl(0, 75%, 55%)' },
  ];

  // Données pour le graphique (à améliorer avec vraies données)
  const fuelData = [
    { month: 'Jan', depense: 45000 },
    { month: 'Fév', depense: 52000 },
    { month: 'Mar', depense: 48000 },
    { month: 'Avr', depense: 61000 },
    { month: 'Mai', depense: 55000 },
    { month: 'Juin', depense: 67000 },
  ];

  const openTickets = tickets.filter(t => t.statut !== 'Clôturé');
  const openWorkOrders = workOrders.filter(wo => wo.statut !== 'Clôturé');

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Véhicules"
          value={stats?.totalVehicles || 0}
          subtitle={`${stats?.activeVehicles || 0} actifs`}
          icon={Car}
          variant="primary"
        />
        <StatCard
          title="Tickets Ouverts"
          value={stats?.openTickets || 0}
          subtitle="En attente de traitement"
          icon={Wrench}
          variant={(stats?.openTickets || 0) > 0 ? 'warning' : 'success'}
        />
        <StatCard
          title="Carburant (Mois)"
          value={`${((stats?.monthlyFuelCost || 0) / 1000).toFixed(0)}K DZD`}
          icon={Fuel}
          trend={{ value: 12, positive: false }}
        />
        <StatCard
          title="Alertes Admin"
          value={stats?.alertsCount || 0}
          subtitle="Échéances < 30 jours"
          icon={AlertTriangle}
          variant={(stats?.alertsCount || 0) > 0 ? 'accent' : 'default'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fuel Expenses Chart */}
        <div className="lg:col-span-2 card-elevated p-6">
          <h3 className="text-lg font-semibold mb-4">Dépenses Carburant (6 derniers mois)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fuelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v/1000}K`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value.toLocaleString()} DZD`, 'Dépense']}
                />
                <Bar dataKey="depense" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Status Pie */}
        <div className="card-elevated p-6">
          <h3 className="text-lg font-semibold mb-4">État du Parc</h3>
          <div className="h-72 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={vehicleStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {vehicleStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2">
              {vehicleStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tickets */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Tickets Récents</h3>
            <span className="badge-info">{tickets.length} tickets</span>
          </div>
          <div className="space-y-3">
            {openTickets.slice(0, 4).map((ticket) => (
              <div 
                key={ticket.id} 
                className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  ticket.priorite === 'Urgente' ? 'bg-destructive/10 text-destructive' :
                  ticket.priorite === 'Haute' ? 'bg-warning/10 text-warning' :
                  'bg-primary/10 text-primary'
                }`}>
                  <Wrench className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{ticket.symptome}</p>
                  <p className="text-xs text-muted-foreground">{ticket.numero}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  ticket.statut === 'Ouvert' ? 'badge-warning' :
                  ticket.statut === 'En cours' ? 'badge-info' :
                  'badge-success'
                }`}>
                  {ticket.statut}
                </span>
              </div>
            ))}
            {openTickets.length === 0 && (
              <p className="text-center text-muted-foreground py-4">Aucun ticket ouvert</p>
            )}
          </div>
        </div>

        {/* Upcoming Maintenance */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Ordres de Travail en Cours</h3>
            <span className="badge-info">{openWorkOrders.length} OT</span>
          </div>
          <div className="space-y-3">
            {openWorkOrders.slice(0, 4).map((wo) => (
              <div 
                key={wo.id} 
                className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{wo.description}</p>
                  <p className="text-xs text-muted-foreground">{wo.numero}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{wo.date_rdv || 'Non planifié'}</p>
                  <span className={`text-xs ${
                    wo.type === 'Préventif' ? 'text-success' : 'text-warning'
                  }`}>
                    {wo.type}
                  </span>
                </div>
              </div>
            ))}
            {openWorkOrders.length === 0 && (
              <p className="text-center text-muted-foreground py-4">Aucun OT en cours</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
