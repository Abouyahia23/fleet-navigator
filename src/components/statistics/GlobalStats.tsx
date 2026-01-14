import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockVehicles, mockFuelEntries, mockExpenses, mockRepairTickets, mockWorkOrders } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area } from 'recharts';
import { Car, Fuel, Wrench, Receipt, TrendingUp, TrendingDown, Clock, AlertTriangle } from 'lucide-react';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function GlobalStats() {
  // Calculate global statistics
  const totalVehicles = mockVehicles.length;
  const activeVehicles = mockVehicles.filter(v => v.statut === 'Actif').length;
  const immobilizedVehicles = mockVehicles.filter(v => v.statut === 'Immobilisé').length;
  
  const totalFuelCost = mockFuelEntries.reduce((sum, e) => sum + e.montant, 0);
  const totalFuelLiters = mockFuelEntries.reduce((sum, e) => sum + e.litres, 0);
  const totalDistance = mockFuelEntries.reduce((sum, e) => sum + e.distance, 0);
  const avgConsumption = totalDistance > 0 ? (totalFuelLiters / totalDistance) * 100 : 0;
  
  const totalExpenses = mockExpenses.reduce((sum, e) => sum + e.montant, 0);
  const totalMaintenanceCost = totalFuelCost + totalExpenses;
  
  const openTickets = mockRepairTickets.filter(t => t.statut !== 'Clôturé').length;
  const avgImmobilization = mockWorkOrders.filter(w => w.joursImmobilisation).reduce((sum, w) => sum + (w.joursImmobilisation || 0), 0) / mockWorkOrders.filter(w => w.joursImmobilisation).length || 0;

  // Monthly expenses data
  const monthlyData = [
    { month: 'Jan', carburant: 12500, entretien: 8500, reparations: 4200 },
    { month: 'Fév', carburant: 11800, entretien: 6200, reparations: 7800 },
    { month: 'Mar', carburant: 13200, entretien: 9100, reparations: 3100 },
    { month: 'Avr', carburant: 12100, entretien: 5800, reparations: 6500 },
    { month: 'Mai', carburant: 14500, entretien: 7200, reparations: 2900 },
    { month: 'Juin', carburant: 15200, entretien: 8900, reparations: 5200 },
  ];

  // Vehicle status distribution
  const statusData = [
    { name: 'Actif', value: activeVehicles, color: 'hsl(var(--chart-1))' },
    { name: 'Immobilisé', value: immobilizedVehicles, color: 'hsl(var(--chart-2))' },
    { name: 'Sorti', value: mockVehicles.filter(v => v.statut === 'Sorti').length, color: 'hsl(var(--chart-3))' },
  ];

  // Energy distribution
  const energyData = [
    { name: 'Diesel', value: mockVehicles.filter(v => v.energie === 'Diesel').length },
    { name: 'Essence', value: mockVehicles.filter(v => v.energie === 'Essence').length },
    { name: 'GPL', value: mockVehicles.filter(v => v.energie === 'GPL').length },
  ];

  // Expense categories
  const expenseCategories = [
    { name: 'Pièces', value: mockExpenses.filter(e => e.categorie === 'Pièces').reduce((s, e) => s + e.montant, 0) },
    { name: 'Main d\'œuvre', value: mockExpenses.filter(e => e.categorie === 'Main d\'œuvre').reduce((s, e) => s + e.montant, 0) },
    { name: 'Diagnostic', value: mockExpenses.filter(e => e.categorie === 'Diagnostic').reduce((s, e) => s + e.montant, 0) },
    { name: 'Remorquage', value: mockExpenses.filter(e => e.categorie === 'Remorquage').reduce((s, e) => s + e.montant, 0) },
    { name: 'Divers', value: mockExpenses.filter(e => e.categorie === 'Divers').reduce((s, e) => s + e.montant, 0) },
  ];

  // Consumption trend
  const consumptionTrend = [
    { month: 'Jan', consommation: 8.2 },
    { month: 'Fév', consommation: 8.5 },
    { month: 'Mar', consommation: 7.9 },
    { month: 'Avr', consommation: 8.1 },
    { month: 'Mai', consommation: 7.8 },
    { month: 'Juin', consommation: 8.0 },
  ];

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
              <div className="p-3 rounded-full bg-primary/20">
                <Car className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-1/10 to-chart-1/5 border-chart-1/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Coût Carburant</p>
                <p className="text-3xl font-bold text-foreground">{totalFuelCost.toLocaleString()} DH</p>
                <p className="text-xs text-chart-1 mt-1">{totalFuelLiters.toFixed(0)} L consommés</p>
              </div>
              <div className="p-3 rounded-full bg-chart-1/20">
                <Fuel className="w-6 h-6 text-chart-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-2/10 to-chart-2/5 border-chart-2/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Dépenses</p>
                <p className="text-3xl font-bold text-foreground">{totalExpenses.toLocaleString()} DH</p>
                <p className="text-xs text-chart-2 mt-1">{mockExpenses.length} opérations</p>
              </div>
              <div className="p-3 rounded-full bg-chart-2/20">
                <Receipt className="w-6 h-6 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-3/10 to-chart-3/5 border-chart-3/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tickets Ouverts</p>
                <p className="text-3xl font-bold text-foreground">{openTickets}</p>
                <p className="text-xs text-chart-3 mt-1">~{avgImmobilization.toFixed(1)} j immob. moy</p>
              </div>
              <div className="p-3 rounded-full bg-chart-3/20">
                <Wrench className="w-6 h-6 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Évolution des Coûts Mensuels</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value.toLocaleString()} DH`]}
                />
                <Legend />
                <Area type="monotone" dataKey="carburant" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} name="Carburant" />
                <Area type="monotone" dataKey="entretien" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.6} name="Entretien" />
                <Area type="monotone" dataKey="reparations" stackId="1" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.6} name="Réparations" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Répartition du Parc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2 text-center">Par Statut</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
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
                    <Pie
                      data={energyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {energyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
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
          <CardHeader>
            <CardTitle className="text-lg">Répartition des Dépenses par Catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expenseCategories} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="name" type="category" width={100} className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value.toLocaleString()} DH`]}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tendance Consommation (L/100km)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={consumptionTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis domain={[7, 9]} className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)} L/100km`]}
                />
                <Line 
                  type="monotone" 
                  dataKey="consommation" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
