import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useVehicles } from '@/hooks/useVehicles';
import { useFuelEntries } from '@/hooks/useFuelEntries';
import { useExpenses } from '@/hooks/useExpenses';
import { useRepairTickets } from '@/hooks/useRepairTickets';
import { useWorkOrders } from '@/hooks/useWorkOrders';
import { useSites } from '@/hooks/useSites';
import { useStructures } from '@/hooks/useStructures';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FileSpreadsheet, FileText, Download, CalendarIcon, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type ReportType = 'vehicles' | 'fuel' | 'expenses' | 'tickets' | 'workorders' | 'global';

const reportTypes = [
  { id: 'global', label: 'Synthèse Globale', description: 'Vue d\'ensemble du parc' },
  { id: 'vehicles', label: 'Liste des Véhicules', description: 'Détail complet de tous les véhicules' },
  { id: 'fuel', label: 'Consommation Carburant', description: 'Historique des pleins et consommations' },
  { id: 'expenses', label: 'Dépenses', description: 'Toutes les dépenses du parc' },
  { id: 'tickets', label: 'Tickets Réparation', description: 'Historique des demandes de réparation' },
  { id: 'workorders', label: 'Ordres de Travail', description: 'Historique des interventions' },
];

export function ReportExport() {
  const [reportType, setReportType] = useState<ReportType>('global');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [selectedSite, setSelectedSite] = useState<string>('all');
  const [selectedStructure, setSelectedStructure] = useState<string>('all');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);

  const { data: vehicles = [] } = useVehicles();
  const { data: fuelEntries = [] } = useFuelEntries();
  const { data: expenses = [] } = useExpenses();
  const { data: tickets = [] } = useRepairTickets();
  const { data: workOrders = [] } = useWorkOrders();
  const { data: sites = [] } = useSites();
  const { data: structures = [] } = useStructures();

  const generateCSV = (data: any[], filename: string) => {
    if (data.length === 0) { toast.error('Aucune donnée à exporter'); return; }
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(';'),
      ...data.map(row => headers.map(h => {
        const value = row[h];
        if (typeof value === 'string' && value.includes(';')) return `"${value}"`;
        return value ?? '';
      }).join(';'))
    ].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    toast.success('Export Excel/CSV généré avec succès');
  };

  const handleExportExcel = () => {
    let data: any[] = [];
    let filename = '';

    switch (reportType) {
      case 'global':
      case 'vehicles':
        data = vehicles.map(v => ({
          'Immatriculation': v.immatriculation, 'Marque': v.marque, 'Modèle': v.modele, 'Énergie': v.energie, 'Statut': v.statut, 'Affectataire': v.affectataire || '',
        }));
        filename = reportType === 'global' ? 'synthese_parc' : 'liste_vehicules';
        break;
      case 'fuel':
        data = fuelEntries.map(e => ({
          'Date': e.date, 'Véhicule': (e as any).vehicle?.immatriculation || '', 'KM Compteur': e.km_compteur, 'Distance': e.distance || '', 'Litres': e.litres, 'Montant (DZD)': e.montant, 'Station': (e as any).station?.nom || '', 'Consommation': e.consommation ? Number(e.consommation).toFixed(2) : '',
        }));
        filename = 'consommation_carburant';
        break;
      case 'expenses':
        data = expenses.map(e => ({
          'Date': e.date, 'Véhicule': (e as any).vehicle?.immatriculation || '', 'Catégorie': e.categorie, 'Prestataire': (e as any).prestataire?.nom || '', 'Montant (DZD)': e.montant, 'N° Facture': e.numero_facture || '',
        }));
        filename = 'depenses';
        break;
      case 'tickets':
        data = tickets.map(t => ({
          'Numéro': t.numero, 'Date': t.date_demande, 'Véhicule': (t as any).vehicle?.immatriculation || '', 'Symptôme': t.symptome, 'Priorité': t.priorite, 'Statut': t.statut,
        }));
        filename = 'tickets_reparation';
        break;
      case 'workorders':
        data = workOrders.map(w => ({
          'Numéro': w.numero, 'Date': w.date_ouverture, 'Véhicule': (w as any).vehicle?.immatriculation || '', 'Type': w.type, 'Description': w.description, 'Statut': w.statut, 'Devis': w.montant_devis || '', 'Facture': w.montant_facture || '',
        }));
        filename = 'ordres_travail';
        break;
    }

    generateCSV(data, filename);
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) { toast.error('Impossible d\'ouvrir la fenêtre d\'impression'); return; }
    const report = reportTypes.find(r => r.id === reportType);
    const today = format(new Date(), 'dd/MM/yyyy', { locale: fr });
    const totalFuel = fuelEntries.reduce((s, e) => s + Number(e.montant), 0);
    const totalExp = expenses.reduce((s, e) => s + Number(e.montant), 0);

    printWindow.document.write(`<!DOCTYPE html><html><head><title>${report?.label}</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#333}h1{color:#1a1a1a;border-bottom:2px solid #3b82f6;padding-bottom:10px}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{border:1px solid #e5e7eb;padding:12px;text-align:left}th{background-color:#f3f4f6}@media print{body{padding:20px}}</style></head><body><h1>📊 ${report?.label}</h1><p>Généré le ${today}</p><h2>Indicateurs</h2><table><tr><td><strong>Véhicules</strong></td><td>${vehicles.length}</td></tr><tr><td><strong>Carburant</strong></td><td>${totalFuel.toLocaleString()} DZD</td></tr><tr><td><strong>Dépenses</strong></td><td>${totalExp.toLocaleString()} DZD</td></tr><tr><td><strong>Total</strong></td><td>${(totalFuel + totalExp).toLocaleString()} DZD</td></tr></table><script>window.print();</script></body></html>`);
    printWindow.document.close();
    toast.success('Rapport PDF prêt pour impression');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Type de Rapport</CardTitle><CardDescription>Sélectionnez le rapport à générer</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map(type => (
              <div key={type.id} onClick={() => setReportType(type.id as ReportType)} className={cn("p-4 rounded-lg border-2 cursor-pointer transition-all", reportType === type.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}>
                <p className="font-medium">{type.label}</p>
                <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Filter className="w-5 h-5" />Filtres</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Date de début</Label>
              <Popover><PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{dateFrom ? format(dateFrom, 'dd/MM/yyyy', { locale: fr }) : "Sélectionner"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} locale={fr} /></PopoverContent></Popover>
            </div>
            <div className="space-y-2">
              <Label>Date de fin</Label>
              <Popover><PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateTo && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{dateTo ? format(dateTo, 'dd/MM/yyyy', { locale: fr }) : "Sélectionner"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dateTo} onSelect={setDateTo} locale={fr} /></PopoverContent></Popover>
            </div>
            <div className="space-y-2">
              <Label>Site</Label>
              <Select value={selectedSite} onValueChange={setSelectedSite}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tous les sites</SelectItem>{sites.map(site => (<SelectItem key={site.id} value={site.id}>{site.nom}</SelectItem>))}</SelectContent></Select>
            </div>
            <div className="space-y-2">
              <Label>Structure</Label>
              <Select value={selectedStructure} onValueChange={setSelectedStructure}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Toutes les structures</SelectItem>{structures.map(s => (<SelectItem key={s.id} value={s.id}>{s.nom}</SelectItem>))}</SelectContent></Select>
            </div>
          </div>
          <div className="flex flex-wrap gap-6 mt-6 pt-4 border-t">
            <div className="flex items-center gap-2"><Checkbox id="includeCharts" checked={includeCharts} onCheckedChange={(checked) => setIncludeCharts(!!checked)} /><Label htmlFor="includeCharts" className="cursor-pointer">Inclure les graphiques (PDF)</Label></div>
            <div className="flex items-center gap-2"><Checkbox id="includeDetails" checked={includeDetails} onCheckedChange={(checked) => setIncludeDetails(!!checked)} /><Label htmlFor="includeDetails" className="cursor-pointer">Inclure les détails complets</Label></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Download className="w-5 h-5" />Exporter</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button onClick={handleExportExcel} className="flex items-center gap-2"><FileSpreadsheet className="w-5 h-5" />Exporter Excel/CSV</Button>
            <Button onClick={handleExportPDF} variant="outline" className="flex items-center gap-2"><FileText className="w-5 h-5" />Exporter PDF</Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">Le fichier CSV peut être ouvert dans Microsoft Excel ou Google Sheets.</p>
        </CardContent>
      </Card>
    </div>
  );
}
