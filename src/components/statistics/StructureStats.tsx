import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useVehicles } from '@/hooks/useVehicles';
import { useFuelEntries } from '@/hooks/useFuelEntries';
import { useExpenses } from '@/hooks/useExpenses';
import { useRepairTickets } from '@/hooks/useRepairTickets';
import { useSites } from '@/hooks/useSites';
import { useStructures } from '@/hooks/useStructures';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Building2, MapPin, Loader2 } from 'lucide-react';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function StructureStats() {
  const [view, setView] = useState<'site' | 'structure'>('site');

  const { data: vehicles = [], isLoading: vLoading } = useVehicles();
  const { data: fuelEntries = [] } = useFuelEntries();
  const { data: expenses = [] } = useExpenses();
  const { data: tickets = [] } = useRepairTickets();
  const { data: sites = [] } = useSites();
  const { data: structures = [] } = useStructures();

  if (vLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const computeStats = (groupKey: 'site_id' | 'structure_id', items: { id: string; nom: string }[]) => {
    return items.map(item => {
      const groupVehicles = vehicles.filter(v => v[groupKey] === item.id);
      const vehicleIds = groupVehicles.map(v => v.id);
      const fuelCost = fuelEntries.filter(e => vehicleIds.includes(e.vehicle_id)).reduce((s, e) => s + Number(e.montant), 0);
      const expenseCost = expenses.filter(e => vehicleIds.includes(e.vehicle_id)).reduce((s, e) => s + Number(e.montant), 0);
      const ticketCount = tickets.filter(t => vehicleIds.includes(t.vehicle_id)).length;
      const activeVehicles = groupVehicles.filter(v => v.statut === 'Actif').length;
      return {
        name: item.nom,
        vehicules: groupVehicles.length,
        actifs: activeVehicles,
        carburant: fuelCost,
        depenses: expenseCost,
        total: fuelCost + expenseCost,
        tickets: ticketCount,
        coutMoyen: groupVehicles.length > 0 ? (fuelCost + expenseCost) / groupVehicles.length : 0,
      };
    }).filter(s => s.vehicules > 0).sort((a, b) => b.total - a.total);
  };

  const siteStats = computeStats('site_id', sites);
  const structureStats = computeStats('structure_id', structures);
  const currentStats = view === 'site' ? siteStats : structureStats;

  const vehicleDistribution = currentStats.map(s => ({
    name: s.name.length > 15 ? s.name.substring(0, 15) + '...' : s.name,
    value: s.vehicules,
  }));

  const costComparison = currentStats.slice(0, 8).map(s => ({
    name: s.name.length > 12 ? s.name.substring(0, 12) + '...' : s.name,
    carburant: s.carburant,
    depenses: s.depenses,
  }));

  const tooltipStyle = { backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <Tabs value={view} onValueChange={(v) => setView(v as 'site' | 'structure')}>
            <TabsList>
              <TabsTrigger value="site" className="flex items-center gap-2"><MapPin className="w-4 h-4" />Par Site</TabsTrigger>
              <TabsTrigger value="structure" className="flex items-center gap-2"><Building2 className="w-4 h-4" />Par Structure</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Répartition des Véhicules</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={vehicleDistribution} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {vehicleDistribution.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip formatter={(value: number) => [value, 'Véhicules']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Comparaison des Coûts</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costComparison}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" angle={-45} textAnchor="end" height={80} />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value.toLocaleString()} DZD`]} />
                <Legend />
                <Bar dataKey="carburant" name="Carburant" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="depenses" name="Dépenses" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Détail par {view === 'site' ? 'Site' : 'Structure'}</CardTitle></CardHeader>
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
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="font-medium">{stat.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{stat.vehicules}</TableCell>
                    <TableCell className="text-center"><Badge variant={stat.actifs === stat.vehicules ? 'default' : 'secondary'}>{stat.actifs}</Badge></TableCell>
                    <TableCell className="text-right">{stat.carburant.toLocaleString()} DZD</TableCell>
                    <TableCell className="text-right">{stat.depenses.toLocaleString()} DZD</TableCell>
                    <TableCell className="text-right font-medium">{stat.total.toLocaleString()} DZD</TableCell>
                    <TableCell className="text-right text-muted-foreground">{Math.round(stat.coutMoyen).toLocaleString()} DZD</TableCell>
                    <TableCell className="text-center"><Badge variant={stat.tickets > 5 ? 'destructive' : 'outline'}>{stat.tickets}</Badge></TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-medium">
                  <TableCell>TOTAL</TableCell>
                  <TableCell className="text-center">{currentStats.reduce((s, stat) => s + stat.vehicules, 0)}</TableCell>
                  <TableCell className="text-center">{currentStats.reduce((s, stat) => s + stat.actifs, 0)}</TableCell>
                  <TableCell className="text-right">{currentStats.reduce((s, stat) => s + stat.carburant, 0).toLocaleString()} DZD</TableCell>
                  <TableCell className="text-right">{currentStats.reduce((s, stat) => s + stat.depenses, 0).toLocaleString()} DZD</TableCell>
                  <TableCell className="text-right">{currentStats.reduce((s, stat) => s + stat.total, 0).toLocaleString()} DZD</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-center">{currentStats.reduce((s, stat) => s + stat.tickets, 0)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
