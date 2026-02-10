import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useVehicles } from '@/hooks/useVehicles';
import { useFuelEntries } from '@/hooks/useFuelEntries';
import { useExpenses } from '@/hooks/useExpenses';
import { useRepairTickets } from '@/hooks/useRepairTickets';
import { useWorkOrders } from '@/hooks/useWorkOrders';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area } from 'recharts';
import { Car, Fuel, Wrench, Receipt, Loader2 } from 'lucide-react';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function GlobalStats() {
  const { data: vehicles = [], isLoading: vLoading } = useVehicles();
  const { data: fuelEntries = [], isLoading: fLoading } = useFuelEntries();
  const { data: expenses = [], isLoading: eLoading } = useExpenses();
  const { data: tickets = [], isLoading: tLoading } = useRepairTickets();
  const { data: workOrders = [] } = useWorkOrders();

  const isLoading = vLoading || fLoading || eLoading || tLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.statut === 'Actif').length;
  const immobilizedVehicles = vehicles.filter(v => v.statut === 'Immobilisé').length;

  const totalFuelCost = fuelEntries.reduce((sum, e) => sum + Number(e.montant), 0);
  const totalFuelLiters = fuelEntries.reduce((sum, e) => sum + Number(e.litres), 0);
  const totalDistance = fuelEntries.reduce((sum, e) => sum + (Number(e.distance) || 0), 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.montant), 0);
  const openTickets = tickets.filter(t => t.statut !== 'Clôturé').length;

  // Monthly data from real entries
  const monthlyMap: Record<string, { carburant: number; depenses: number }> = {};
  fuelEntries.forEach(e => {
    const month = new Date(e.date).toLocaleDateString('fr-FR', { month: 'short' });
    if (!monthlyMap[month]) monthlyMap[month] = { carburant: 0, depenses: 0 };
    monthlyMap[month].carburant += Number(e.montant);
  });
  expenses.forEach(e => {
    const month = new Date(e.date).toLocaleDateString('fr-FR', { month: 'short' });
    if (!monthlyMap[month]) monthlyMap[month] = { carburant: 0, depenses: 0 };
    monthlyMap[month].depenses += Number(e.montant);
  });
  const monthlyData = Object.entries(monthlyMap).map(([month, data]) => ({ month, ...data }));

  // Vehicle status distribution
  const statusData = [
    { name: 'Actif', value: activeVehicles, color: 'hsl(var(--chart-1))' },
    { name: 'Immobilisé', value: immobilizedVehicles, color: 'hsl(var(--chart-2))' },
    { name: 'Sorti', value: vehicles.filter(v => v.statut === 'Sorti').length, color: 'hsl(var(--chart-3))' },
  ];

  // Energy distribution
  const energyData = [
    { name: 'Diesel', value: vehicles.filter(v => v.energie === 'Diesel').length },
    { name: 'Essence', value: vehicles.filter(v => v.energie === 'Essence').length },
    { name: 'GPL', value: vehicles.filter(v => v.energie === 'GPL').length },
  ];

  // Expense categories
  const expenseCategories = [
    { name: 'Pièces', value: expenses.filter(e => e.categorie === 'Pièces').reduce((s, e) => s + Number(e.montant), 0) },
    { name: "Main d'œuvre", value: expenses.filter(e => e.categorie === "Main d'œuvre").reduce((s, e) => s + Number(e.montant), 0) },
    { name: 'Diagnostic', value: expenses.filter(e => e.categorie === 'Diagnostic').reduce((s, e) => s + Number(e.montant), 0) },
    { name: 'Remorquage', value: expenses.filter(e => e.categorie === 'Remorquage').reduce((s, e) => s + Number(e.montant), 0) },
    { name: 'Divers', value: expenses.filter(e => e.categorie === 'Divers').reduce((s, e) => s + Number(e.montant), 0) },
  ];

  // Consumption trend from real data
  const consumptionByMonth: Record<string, { litres: number; distance: number }> = {};
  fuelEntries.forEach(e => {
    const month = new Date(e.date).toLocaleDateString('fr-FR', { month: 'short' });
    if (!consumptionByMonth[month]) consumptionByMonth[month] = { litres: 0, distance: 0 };
    consumptionByMonth[month].litres += Number(e.litres);
    consumptionByMonth[month].distance += Number(e.distance) || 0;
  });
  const consumptionTrend = Object.entries(consumptionByMonth).map(([month, data]) => ({
    month,
    consommation: data.distance > 0 ? (data.litres / data.distance) * 100 : 0,
  }));

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px'
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Véhicules</p>
                <p className="text-3xl font-bold text-foreground">{totalVehicles}</p>
                <p className="text-xs text-primary mt-1">{activeVehicles} actifs</p>
              </div>
              <div className="p-3 rounded-full bg-primary/20"><Car className="w-6 h-6 text-primary" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-1/10 to-chart-1/5 border-chart-1/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Coût Carburant</p>
                <p className="text-3xl font-bold text-foreground">{totalFuelCost.toLocaleString()} DZD</p>
                <p className="text-xs text-chart-1 mt-1">{totalFuelLiters.toFixed(0)} L consommés</p>
              </div>
              <div className="p-3 rounded-full bg-chart-1/20"><Fuel className="w-6 h-6 text-chart-1" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-2/10 to-chart-2/5 border-chart-2/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Dépenses</p>
                <p className="text-3xl font-bold text-foreground">{totalExpenses.toLocaleString()} DZD</p>
                <p className="text-xs text-chart-2 mt-1">{expenses.length} opérations</p>
              </div>
              <div className="p-3 rounded-full bg-chart-2/20"><Receipt className="w-6 h-6 text-chart-2" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-3/10 to-chart-3/5 border-chart-3/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tickets Ouverts</p>
                <p className="text-3xl font-bold text-foreground">{openTickets}</p>
                <p className="text-xs text-chart-3 mt-1">{tickets.length} total</p>
              </div>
              <div className="p-3 rounded-full bg-chart-3/20"><Wrench className="w-6 h-6 text-chart-3" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Évolution des Coûts Mensuels</CardTitle></CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value.toLocaleString()} DZD`]} />
                  <Legend />
                  <Area type="monotone" dataKey="carburant" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} name="Carburant" />
                  <Area type="monotone" dataKey="depenses" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.6} name="Dépenses" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">Aucune donnée disponible</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Répartition du Parc</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2 text-center">Par Statut</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                      {statusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [value, 'Véhicules']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  {statusData.map((item, i) => (
                    <div key={i} className="flex items-center gap-1 text-xs">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2 text-center">Par Énergie</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={energyData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                      {energyData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [value, 'Véhicules']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  {energyData.map((item, i) => (
                    <div key={i} className="flex items-center gap-1 text-xs">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Répartition des Dépenses par Catégorie</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expenseCategories} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="name" type="category" width={100} className="text-xs" />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value.toLocaleString()} DZD`]} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Tendance Consommation (L/100km)</CardTitle></CardHeader>
          <CardContent>
            {consumptionTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={consumptionTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value.toFixed(1)} L/100km`]} />
                  <Line type="monotone" dataKey="consommation" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">Aucune donnée de consommation</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
