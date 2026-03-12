import { useState } from 'react';
import { Plus, Receipt, TrendingUp, Loader2, Download } from 'lucide-react';
import { useExpenses, useCreateExpense } from '@/hooks/useExpenses';
import { useVehicles } from '@/hooks/useVehicles';
import { usePrestataires } from '@/hooks/usePrestataires';
import { useAuth } from '@/contexts/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { exportToCsv } from '@/lib/exportUtils';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type ExpenseCategory = Database['public']['Enums']['expense_category'];
type ExpenseLink = Database['public']['Enums']['expense_link'];
type PaymentMethod = Database['public']['Enums']['payment_method'];

export function ExpenseList() {
  const { data: expenses = [], isLoading } = useExpenses();
  const { data: vehicles = [] } = useVehicles();
  const { data: prestataires = [] } = usePrestataires();
  const createExpense = useCreateExpense();
  const { user } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: '',
    lieLa: 'Libre' as ExpenseLink,
    categorie: 'Divers' as ExpenseCategory,
    prestataireId: '',
    montant: '',
    numeroFacture: '',
    modePaiement: 'Cash' as PaymentMethod,
    observations: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createExpense.mutate({
      vehicle_id: formData.vehicleId,
      lie_a: formData.lieLa,
      categorie: formData.categorie,
      prestataire_id: formData.prestataireId || null,
      montant: parseFloat(formData.montant),
      numero_facture: formData.numeroFacture || null,
      mode_paiement: formData.modePaiement,
      observations: formData.observations || null,
      created_by: user?.id || null,
    }, {
      onSuccess: () => {
        toast.success('Dépense enregistrée');
        setShowForm(false);
        setFormData({
          vehicleId: '',
          lieLa: 'Libre',
          categorie: 'Divers',
          prestataireId: '',
          montant: '',
          numeroFacture: '',
          modePaiement: 'Cash',
          observations: '',
        });
      },
      onError: (error) => {
        toast.error('Erreur', { description: error.message });
      },
    });
  };

  // Stats by category
  const categoryStats = expenses.reduce((acc, exp) => {
    acc[exp.categorie] = (acc[exp.categorie] || 0) + Number(exp.montant);
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(categoryStats).map(([name, value]) => ({ name, value }));
  const COLORS = ['hsl(215, 80%, 45%)', 'hsl(25, 95%, 55%)', 'hsl(145, 65%, 40%)', 'hsl(38, 92%, 50%)', 'hsl(0, 75%, 55%)'];
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.montant), 0);
  const categories: ExpenseCategory[] = ['Pièces', "Main d'œuvre", 'Diagnostic', 'Remorquage', 'Divers'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Dépenses</h2>
          <p className="text-sm text-muted-foreground">Suivi des dépenses par véhicule</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const data = expenses.map(e => ({
                'Date': e.date, 'Véhicule': (e as any).vehicle?.immatriculation || '',
                'Catégorie': e.categorie, 'Prestataire': (e as any).prestataire?.nom || '',
                'Montant (DZD)': e.montant, 'N° Facture': e.numero_facture || '',
                'Mode Paiement': e.mode_paiement,
              }));
              if (!data.length) { toast.info('Aucune donnée à exporter'); return; }
              exportToCsv(data, 'depenses');
              toast.success('Export CSV généré');
            }}
            className="btn-secondary"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            <Plus className="w-4 h-4" />
            Nouvelle Dépense
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card-elevated p-6">
          <h3 className="text-lg font-semibold mb-4">Répartition par Catégorie</h3>
          <div className="flex items-center gap-8">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value.toLocaleString()} DZD`, '']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {chartData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value.toLocaleString()} DZD</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="stat-card gradient-primary text-primary-foreground">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm opacity-80">Total Dépenses</p>
          <p className="text-3xl font-bold mt-1">{totalExpenses.toLocaleString()} DZD</p>
          <p className="text-sm opacity-70 mt-2">{expenses.length} transactions</p>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card-elevated p-6 animate-fade-in">
          <h3 className="text-lg font-semibold mb-4">Nouvelle Dépense</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Véhicule *</label>
                <select value={formData.vehicleId} onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })} className="input-field" required>
                  <option value="">Sélectionner...</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.immatriculation} - {v.marque} {v.modele}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Lié à</label>
                <select value={formData.lieLa} onChange={(e) => setFormData({ ...formData, lieLa: e.target.value as ExpenseLink })} className="input-field">
                  <option value="Libre">Libre</option>
                  <option value="OT">Ordre de Travail</option>
                  <option value="Ticket">Ticket</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Catégorie</label>
                <select value={formData.categorie} onChange={(e) => setFormData({ ...formData, categorie: e.target.value as ExpenseCategory })} className="input-field">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Montant (DZD) *</label>
                <input type="number" value={formData.montant} onChange={(e) => setFormData({ ...formData, montant: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Prestataire</label>
                <select value={formData.prestataireId} onChange={(e) => setFormData({ ...formData, prestataireId: e.target.value })} className="input-field">
                  <option value="">Sélectionner...</option>
                  {prestataires.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">N° Facture</label>
                <input type="text" value={formData.numeroFacture} onChange={(e) => setFormData({ ...formData, numeroFacture: e.target.value })} className="input-field" />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="submit" className="btn-primary" disabled={createExpense.isPending}>
                <Receipt className="w-4 h-4" />
                Enregistrer
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expenses Table */}
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="table-header text-left py-4 px-4">Date</th>
                <th className="table-header text-left py-4 px-4">Véhicule</th>
                <th className="table-header text-left py-4 px-4">Catégorie</th>
                <th className="table-header text-left py-4 px-4">Prestataire</th>
                <th className="table-header text-right py-4 px-4">Montant</th>
                <th className="table-header text-left py-4 px-4">Facture</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-4 text-sm">{expense.date}</td>
                  <td className="py-3 px-4 text-sm font-medium">{(expense as any).vehicle?.immatriculation || '-'}</td>
                  <td className="py-3 px-4">
                    <span className="badge-info">{expense.categorie}</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{(expense as any).prestataire?.nom || '-'}</td>
                  <td className="py-3 px-4 text-sm font-bold text-right">{Number(expense.montant).toLocaleString()} DZD</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{expense.numero_facture || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {expenses.length === 0 && (
        <div className="text-center py-12">
          <Receipt className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Aucune dépense enregistrée</p>
        </div>
      )}
    </div>
  );
}
