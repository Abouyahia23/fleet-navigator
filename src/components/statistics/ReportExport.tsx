import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { mockVehicles, mockFuelEntries, mockExpenses, mockRepairTickets, mockWorkOrders, sites, structures } from '@/data/mockData';
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

  const generateCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error('Aucune donnée à exporter');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(';'),
      ...data.map(row => headers.map(h => {
        const value = row[h];
        if (typeof value === 'string' && value.includes(';')) {
          return `"${value}"`;
        }
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

  const filterData = <T extends { vehicleId?: string }>(data: T[]) => {
    return data.filter(item => {
      const vehicle = mockVehicles.find(v => v.id === item.vehicleId);
      if (selectedSite !== 'all' && vehicle?.site !== selectedSite) return false;
      if (selectedStructure !== 'all' && vehicle?.structure !== selectedStructure) return false;
      return true;
    });
  };

  const handleExportExcel = () => {
    let data: any[] = [];
    let filename = '';

    switch (reportType) {
      case 'global':
        data = mockVehicles.map(v => ({
          'Immatriculation': v.immatriculation,
          'Marque': v.marque,
          'Modèle': v.modele,
          'Énergie': v.energie,
          'Site': v.site,
          'Structure': v.structure,
          'Statut': v.statut,
          'Affectataire': v.affectataire,
        }));
        filename = 'synthese_parc';
        break;
      case 'vehicles':
        data = mockVehicles.map(v => ({
          'Immatriculation': v.immatriculation,
          'Marque': v.marque,
          'Modèle': v.modele,
          'Catégorie': v.categorie,
          'Énergie': v.energie,
          'Année': v.annee || '',
          'VIN': v.vin || '',
          'Site': v.site,
          'Structure': v.structure,
          'Affectataire': v.affectataire,
          'Email Affectataire': v.affectataireEmail || '',
          'Gestionnaire': v.gestionnaireParc,
          'Chauffeur Référent': v.chauffeurReferent || '',
          'Statut': v.statut,
          'Date Mise en Service': v.dateMiseEnService || '',
          'Fin Assurance': v.finAssurance || '',
          'Fin CT': v.finCT || '',
          'Observations': v.observations || '',
        }));
        filename = 'liste_vehicules';
        break;
      case 'fuel':
        data = filterData(mockFuelEntries).map(e => ({
          'Date': e.date,
          'Immatriculation': e.immatriculation,
          'KM Compteur': e.kmCompteur,
          'Distance': e.distance,
          'Litres': e.litres,
          'Montant (DH)': e.montant,
          'Station': e.station,
          'Mode Paiement': e.modePaiement,
          'Consommation (L/100)': e.consommation.toFixed(2),
          'Coût/km (DH)': e.coutKm.toFixed(2),
          'Observations': e.observations || '',
        }));
        filename = 'consommation_carburant';
        break;
      case 'expenses':
        data = filterData(mockExpenses).map(e => ({
          'Date': e.date,
          'Immatriculation': e.immatriculation,
          'Catégorie': e.categorie,
          'Prestataire': e.prestataire,
          'Montant (DH)': e.montant,
          'Mode Paiement': e.modePaiement,
          'N° Facture': e.numeroFacture || '',
          'Lié à': e.lieLa,
          'Référence': e.referenceOTTicket || '',
          'Observations': e.observations || '',
        }));
        filename = 'depenses';
        break;
      case 'tickets':
        data = filterData(mockRepairTickets).map(t => ({
          'ID': t.id,
          'Date Demande': t.dateDemande,
          'Immatriculation': t.immatriculation,
          'Site': t.site,
          'Structure': t.structure,
          'KM': t.km,
          'Symptôme': t.symptome,
          'Priorité': t.priorite,
          'Statut': t.statut,
          'Chauffeur': t.chauffeur || '',
          'Prestataire': t.prestataire || '',
          'Observations': t.observations || '',
        }));
        filename = 'tickets_reparation';
        break;
      case 'workorders':
        data = filterData(mockWorkOrders).map(w => ({
          'ID': w.id,
          'Date Ouverture': w.dateOuverture,
          'Immatriculation': w.immatriculation,
          'Type': w.type,
          'Catégorie': w.categorie,
          'Description': w.description,
          'Prestataire': w.prestataire,
          'Date RDV': w.dateRDV || '',
          'Date Entrée': w.dateEntree || '',
          'Date Sortie': w.dateSortie || '',
          'Statut': w.statut,
          'Montant Devis': w.montantDevis || '',
          'Montant Facture': w.montantFacture || '',
          'Jours Immob.': w.joursImmobilisation || '',
          'Garantie': w.garantie ? 'Oui' : 'Non',
        }));
        filename = 'ordres_travail';
        break;
    }

    // Filter by site/structure for vehicle-based reports
    if (['global', 'vehicles'].includes(reportType)) {
      data = data.filter((item: any) => {
        if (selectedSite !== 'all' && item['Site'] !== selectedSite) return false;
        if (selectedStructure !== 'all' && item['Structure'] !== selectedStructure) return false;
        return true;
      });
    }

    generateCSV(data, filename);
  };

  const handleExportPDF = () => {
    // Create a printable HTML page
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Impossible d\'ouvrir la fenêtre d\'impression');
      return;
    }

    const report = reportTypes.find(r => r.id === reportType);
    const today = format(new Date(), 'dd/MM/yyyy', { locale: fr });

    let content = '';
    
    switch (reportType) {
      case 'global':
        const totalVehicles = mockVehicles.length;
        const activeVehicles = mockVehicles.filter(v => v.statut === 'Actif').length;
        const totalFuel = mockFuelEntries.reduce((s, e) => s + e.montant, 0);
        const totalExpenses = mockExpenses.reduce((s, e) => s + e.montant, 0);

        content = `
          <h2>Indicateurs Clés</h2>
          <table>
            <tr><td><strong>Total Véhicules</strong></td><td>${totalVehicles}</td></tr>
            <tr><td><strong>Véhicules Actifs</strong></td><td>${activeVehicles}</td></tr>
            <tr><td><strong>Coût Carburant Total</strong></td><td>${totalFuel.toLocaleString()} DH</td></tr>
            <tr><td><strong>Dépenses Totales</strong></td><td>${totalExpenses.toLocaleString()} DH</td></tr>
            <tr><td><strong>Coût Total</strong></td><td>${(totalFuel + totalExpenses).toLocaleString()} DH</td></tr>
          </table>
        `;
        break;
      default:
        content = `<p>Exportez au format Excel/CSV pour obtenir les données détaillées.</p>`;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${report?.label} - Parc Auto</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          h1 { color: #1a1a1a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
          th { background-color: #f3f4f6; font-weight: 600; }
          .header { display: flex; justify-content: space-between; align-items: center; }
          .date { color: #6b7280; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 ${report?.label}</h1>
          <span class="date">Généré le ${today}</span>
        </div>
        <p>${report?.description}</p>
        ${content}
        <script>window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();

    toast.success('Rapport PDF prêt pour impression');
  };

  return (
    <div className="space-y-6">
      {/* Report Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Type de Rapport</CardTitle>
          <CardDescription>Sélectionnez le rapport à générer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map(type => (
              <div
                key={type.id}
                onClick={() => setReportType(type.id as ReportType)}
                className={cn(
                  "p-4 rounded-lg border-2 cursor-pointer transition-all",
                  reportType === type.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <p className="font-medium">{type.label}</p>
                <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date de début</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, 'dd/MM/yyyy', { locale: fr }) : "Sélectionner"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Date de fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, 'dd/MM/yyyy', { locale: fr }) : "Sélectionner"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Site Filter */}
            <div className="space-y-2">
              <Label>Site</Label>
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les sites</SelectItem>
                  {sites.map(site => (
                    <SelectItem key={site} value={site}>{site}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Structure Filter */}
            <div className="space-y-2">
              <Label>Structure</Label>
              <Select value={selectedStructure} onValueChange={setSelectedStructure}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les structures</SelectItem>
                  {structures.map(structure => (
                    <SelectItem key={structure} value={structure}>{structure}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-wrap gap-6 mt-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="includeCharts"
                checked={includeCharts}
                onCheckedChange={(checked) => setIncludeCharts(!!checked)}
              />
              <Label htmlFor="includeCharts" className="cursor-pointer">
                Inclure les graphiques (PDF uniquement)
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="includeDetails"
                checked={includeDetails}
                onCheckedChange={(checked) => setIncludeDetails(!!checked)}
              />
              <Label htmlFor="includeDetails" className="cursor-pointer">
                Inclure les détails complets
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exporter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button onClick={handleExportExcel} className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Exporter Excel/CSV
            </Button>
            <Button onClick={handleExportPDF} variant="outline" className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Exporter PDF
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Le fichier Excel/CSV peut être ouvert directement dans Microsoft Excel ou Google Sheets.
            Le PDF s'ouvre dans une nouvelle fenêtre pour impression.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
