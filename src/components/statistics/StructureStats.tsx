import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { mockVehicles, mockFuelEntries, mockExpenses, mockRepairTickets } from '@/data/mockData';
import { sites, structures } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Building2, MapPin } from 'lucide-react';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function StructureStats() {
  const [view, setView] = useState<'site' | 'structure'>('site');

  // Calculate stats by site
  const siteStats = sites.map(site => {
    const siteVehicles = mockVehicles.filter(v => v.site === site);
    const vehicleIds = siteVehicles.map(v => v.id);
    
    const fuelCost = mockFuelEntries.filter(e => vehicleIds.includes(e.vehicleId)).reduce((s, e) => s + e.montant, 0);
    const expenseCost = mockExpenses.filter(e => vehicleIds.includes(e.vehicleId)).reduce((s, e) => s + e.montant, 0);
    const tickets = mockRepairTickets.filter(t => vehicleIds.includes(t.vehicleId)).length;
    const activeVehicles = siteVehicles.filter(v => v.statut === 'Actif').length;

    return {
      name: site,
      vehicules: siteVehicles.length,
      actifs: activeVehicles,
      carburant: fuelCost,
      depenses: expenseCost,
      total: fuelCost + expenseCost,
      tickets,
      coutMoyen: siteVehicles.length > 0 ? (fuelCost + expenseCost) / siteVehicles.length : 0,
    };
  }).filter(s => s.vehicules > 0).sort((a, b) => b.total - a.total);

  // Calculate stats by structure
  const structureStats = structures.map(structure => {
    const structVehicles = mockVehicles.filter(v => v.structure === structure);
    const vehicleIds = structVehicles.map(v => v.id);
    
    const fuelCost = mockFuelEntries.filter(e => vehicleIds.includes(e.vehicleId)).reduce((s, e) => s + e.montant, 0);
    const expenseCost = mockExpenses.filter(e => vehicleIds.includes(e.vehicleId)).reduce((s, e) => s + e.montant, 0);
    const tickets = mockRepairTickets.filter(t => vehicleIds.includes(t.vehicleId)).length;
    const activeVehicles = structVehicles.filter(v => v.statut === 'Actif').length;

    return {
      name: structure,
      vehicules: structVehicles.length,
      actifs: activeVehicles,
      carburant: fuelCost,
      depenses: expenseCost,
      total: fuelCost + expenseCost,
      tickets,
      coutMoyen: structVehicles.length > 0 ? (fuelCost + expenseCost) / structVehicles.length : 0,
    };
  }).filter(s => s.vehicules > 0).sort((a, b) => b.total - a.total);

  const currentStats = view === 'site' ? siteStats : structureStats;

  // Data for charts
  const vehicleDistribution = currentStats.map(s => ({
    name: s.name.length > 15 ? s.name.substring(0, 15) + '...' : s.name,
    value: s.vehicules,
  }));

  const costComparison = currentStats.slice(0, 8).map(s => ({
    name: s.name.length > 12 ? s.name.substring(0, 12) + '...' : s.name,
    carburant: s.carburant,
    depenses: s.depenses,
  }));

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={view} onValueChange={(v) => setView(v as 'site' | 'structure')}>
            <TabsList>
              <TabsTrigger value="site" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Par Site
              </TabsTrigger>
              <TabsTrigger value="structure" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Par Structure
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Répartition des Véhicules</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={vehicleDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {vehicleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value, 'Véhicules']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Comparaison des Coûts</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costComparison}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" angle={-45} textAnchor="end" height={80} />
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
                <Bar dataKey="carburant" name="Carburant" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="depenses" name="Dépenses" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detail Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Détail par {view === 'site' ? 'Site' : 'Structure'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{view === 'site' ? 'Site' : 'Structure'}</TableHead>
                  <TableHead className="text-center">Véhicules</TableHead>
                  <TableHead className="text-center">Actifs</TableHead>
                  <TableHead className="text-right">Carburant</TableHead>
                  <TableHead className="text-right">Dépenses</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Coût/Véh.</TableHead>
                  <TableHead className="text-center">Tickets</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentStats.map((stat, index) => (
                  <TableRow key={stat.name}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{stat.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{stat.vehicules}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={stat.actifs === stat.vehicules ? 'default' : 'secondary'}>
                        {stat.actifs}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{stat.carburant.toLocaleString()} DH</TableCell>
                    <TableCell className="text-right">{stat.depenses.toLocaleString()} DH</TableCell>
                    <TableCell className="text-right font-medium">{stat.total.toLocaleString()} DH</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {stat.coutMoyen.toLocaleString()} DH
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={stat.tickets > 5 ? 'destructive' : 'outline'}>
                        {stat.tickets}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {/* Total Row */}
                <TableRow className="bg-muted/50 font-medium">
                  <TableCell>TOTAL</TableCell>
                  <TableCell className="text-center">
                    {currentStats.reduce((s, stat) => s + stat.vehicules, 0)}
                  </TableCell>
                  <TableCell className="text-center">
                    {currentStats.reduce((s, stat) => s + stat.actifs, 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {currentStats.reduce((s, stat) => s + stat.carburant, 0).toLocaleString()} DH
                  </TableCell>
                  <TableCell className="text-right">
                    {currentStats.reduce((s, stat) => s + stat.depenses, 0).toLocaleString()} DH
                  </TableCell>
                  <TableCell className="text-right">
                    {currentStats.reduce((s, stat) => s + stat.total, 0).toLocaleString()} DH
                  </TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-center">
                    {currentStats.reduce((s, stat) => s + stat.tickets, 0)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
