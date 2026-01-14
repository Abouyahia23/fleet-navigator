import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { mockVehicles, mockFuelEntries, mockExpenses, mockRepairTickets, mockWorkOrders } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Fuel, Receipt, Wrench, Clock, TrendingUp, Car } from 'lucide-react';

export function VehicleStats() {
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');

  const vehicle = mockVehicles.find(v => v.id === selectedVehicle);
  
  // Calculate stats for selected vehicle
  const vehicleFuelEntries = mockFuelEntries.filter(e => e.vehicleId === selectedVehicle);
  const vehicleExpenses = mockExpenses.filter(e => e.vehicleId === selectedVehicle);
  const vehicleTickets = mockRepairTickets.filter(t => t.vehicleId === selectedVehicle);
  const vehicleWorkOrders = mockWorkOrders.filter(w => w.vehicleId === selectedVehicle);

  const totalFuelCost = vehicleFuelEntries.reduce((sum, e) => sum + e.montant, 0);
  const totalFuelLiters = vehicleFuelEntries.reduce((sum, e) => sum + e.litres, 0);
  const totalDistance = vehicleFuelEntries.reduce((sum, e) => sum + e.distance, 0);
  const avgConsumption = totalDistance > 0 ? (totalFuelLiters / totalDistance) * 100 : 0;
  const totalExpenses = vehicleExpenses.reduce((sum, e) => sum + e.montant, 0);
  const totalImmobilization = vehicleWorkOrders.reduce((sum, w) => sum + (w.joursImmobilisation || 0), 0);

  // Monthly fuel consumption for selected vehicle
  const fuelHistory = vehicleFuelEntries.slice(-6).map((entry, index) => ({
    date: new Date(entry.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
    consommation: entry.consommation,
    montant: entry.montant,
    km: entry.distance,
  }));

  // All vehicles summary for comparison
  const vehicleSummary = mockVehicles.map(v => {
    const fuel = mockFuelEntries.filter(e => e.vehicleId === v.id);
    const expenses = mockExpenses.filter(e => e.vehicleId === v.id);
    const tickets = mockRepairTickets.filter(t => t.vehicleId === v.id);
    const totalFuel = fuel.reduce((s, e) => s + e.montant, 0);
    const totalExp = expenses.reduce((s, e) => s + e.montant, 0);
    const totalLiters = fuel.reduce((s, e) => s + e.litres, 0);
    const totalKm = fuel.reduce((s, e) => s + e.distance, 0);
    const avgConso = totalKm > 0 ? (totalLiters / totalKm) * 100 : 0;

    return {
      id: v.id,
      immatriculation: v.immatriculation,
      marque: v.marque,
      modele: v.modele,
      statut: v.statut,
      coutCarburant: totalFuel,
      coutDepenses: totalExp,
      coutTotal: totalFuel + totalExp,
      consommation: avgConso,
      tickets: tickets.length,
      km: totalKm,
    };
  }).sort((a, b) => b.coutTotal - a.coutTotal);

  return (
    <div className="space-y-6">
      {/* Vehicle Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Car className="w-5 h-5" />
            Sélectionner un Véhicule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
            <SelectTrigger className="w-full md:w-96">
              <SelectValue placeholder="Choisir un véhicule..." />
            </SelectTrigger>
            <SelectContent>
              {mockVehicles.map(v => (
                <SelectItem key={v.id} value={v.id}>
                  {v.immatriculation} - {v.marque} {v.modele}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Vehicle Details */}
      {vehicle && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Fuel className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Carburant Total</p>
                    <p className="text-xl font-bold">{totalFuelCost.toLocaleString()} DH</p>
                    <p className="text-xs text-muted-foreground">{totalFuelLiters.toFixed(0)} L</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-2/10">
                    <Receipt className="w-5 h-5 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dépenses</p>
                    <p className="text-xl font-bold">{totalExpenses.toLocaleString()} DH</p>
                    <p className="text-xs text-muted-foreground">{vehicleExpenses.length} opérations</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-3/10">
                    <TrendingUp className="w-5 h-5 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Consommation Moy.</p>
                    <p className="text-xl font-bold">{avgConsumption.toFixed(1)} L/100km</p>
                    <p className="text-xs text-muted-foreground">{totalDistance.toLocaleString()} km</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <Clock className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Immobilisation</p>
                    <p className="text-xl font-bold">{totalImmobilization} jours</p>
                    <p className="text-xs text-muted-foreground">{vehicleTickets.length} tickets</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fuel History Chart */}
          {fuelHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Historique Consommation</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={fuelHistory}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="consommation" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="L/100km"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Intervention History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historique Interventions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Prestataire</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicleWorkOrders.slice(0, 5).map(wo => (
                    <TableRow key={wo.id}>
                      <TableCell>{new Date(wo.dateOuverture).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell>
                        <Badge variant={wo.type === 'Préventif' ? 'default' : 'secondary'}>
                          {wo.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{wo.description}</TableCell>
                      <TableCell>{wo.prestataire}</TableCell>
                      <TableCell className="text-right">{wo.montantFacture?.toLocaleString() || '-'} DH</TableCell>
                    </TableRow>
                  ))}
                  {vehicleWorkOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Aucune intervention enregistrée
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* All Vehicles Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Classement des Véhicules par Coût Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Véhicule</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Carburant</TableHead>
                  <TableHead className="text-right">Dépenses</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Conso.</TableHead>
                  <TableHead className="text-right">Tickets</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicleSummary.slice(0, 10).map((v, index) => (
                  <TableRow 
                    key={v.id} 
                    className={selectedVehicle === v.id ? 'bg-accent' : ''}
                    onClick={() => setSelectedVehicle(v.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{v.immatriculation}</p>
                        <p className="text-xs text-muted-foreground">{v.marque} {v.modele}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={v.statut === 'Actif' ? 'default' : v.statut === 'Immobilisé' ? 'secondary' : 'outline'}>
                        {v.statut}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{v.coutCarburant.toLocaleString()} DH</TableCell>
                    <TableCell className="text-right">{v.coutDepenses.toLocaleString()} DH</TableCell>
                    <TableCell className="text-right font-medium">{v.coutTotal.toLocaleString()} DH</TableCell>
                    <TableCell className="text-right">{v.consommation.toFixed(1)} L/100</TableCell>
                    <TableCell className="text-right">{v.tickets}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
