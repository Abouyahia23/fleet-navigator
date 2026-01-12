import { Car, Fuel, Wrench, Receipt, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { StatCard } from './StatCard';
import { mockVehicles, mockFuelEntries, mockRepairTickets, mockWorkOrders, mockExpenses } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const fuelData = [
  { month: 'Jan', depense: 45000 },
  { month: 'Fév', depense: 52000 },
  { month: 'Mar', depense: 48000 },
  { month: 'Avr', depense: 61000 },
  { month: 'Mai', depense: 55000 },
  { month: 'Juin', depense: 67000 },
];

const vehicleStatusData = [
  { name: 'Actif', value: mockVehicles.filter(v => v.statut === 'Actif').length, color: 'hsl(145, 65%, 40%)' },
  { name: 'Immobilisé', value: mockVehicles.filter(v => v.statut === 'Immobilisé').length, color: 'hsl(38, 92%, 50%)' },
  { name: 'Sorti', value: mockVehicles.filter(v => v.statut === 'Sorti').length, color: 'hsl(0, 75%, 55%)' },
];

export function Dashboard() {
  const totalVehicles = mockVehicles.length;
  const activeVehicles = mockVehicles.filter(v => v.statut === 'Actif').length;
  const openTickets = mockRepairTickets.filter(t => t.statut !== 'Clôturé').length;
  const totalFuelExpense = mockFuelEntries.reduce((sum, f) => sum + f.montant, 0);
  const totalExpenses = mockExpenses.reduce((sum, e) => sum + e.montant, 0);

  const upcomingAlerts = mockVehicles.filter(v => {
    const today = new Date();
    const assurance = v.finAssurance ? new Date(v.finAssurance) : null;
    const ct = v.finCT ? new Date(v.finCT) : null;
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    return (assurance && assurance.getTime() - today.getTime() < thirtyDays) ||
           (ct && ct.getTime() - today.getTime() < thirtyDays);
  }).length;

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Véhicules"
          value={totalVehicles}
          subtitle={`${activeVehicles} actifs`}
          icon={Car}
          variant="primary"
        />
        <StatCard
          title="Tickets Ouverts"
          value={openTickets}
          subtitle="En attente de traitement"
          icon={Wrench}
          variant={openTickets > 0 ? 'warning' : 'success'}
        />
        <StatCard
          title="Carburant (Mois)"
          value={`${(totalFuelExpense / 1000).toFixed(0)}K DZD`}
          icon={Fuel}
          trend={{ value: 12, positive: false }}
        />
        <StatCard
          title="Alertes Admin"
          value={upcomingAlerts}
          subtitle="Échéances < 30 jours"
          icon={AlertTriangle}
          variant={upcomingAlerts > 0 ? 'accent' : 'default'}
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
            <span className="badge-info">{mockRepairTickets.length} tickets</span>
          </div>
          <div className="space-y-3">
            {mockRepairTickets.slice(0, 4).map((ticket) => (
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
                  <p className="text-xs text-muted-foreground">{ticket.immatriculation} • {ticket.site}</p>
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
          </div>
        </div>

        {/* Upcoming Maintenance */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Prochains RDV Entretien</h3>
            <span className="badge-info">Cette semaine</span>
          </div>
          <div className="space-y-3">
            {mockWorkOrders.filter(wo => wo.statut !== 'Clôturé').slice(0, 4).map((wo) => (
              <div 
                key={wo.id} 
                className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{wo.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {wo.immatriculation} • {wo.prestataire}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{wo.dateRDV || 'Non planifié'}</p>
                  <span className={`text-xs ${
                    wo.type === 'Préventif' ? 'text-success' : 'text-warning'
                  }`}>
                    {wo.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
