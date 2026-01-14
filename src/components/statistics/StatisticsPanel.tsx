import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VehicleStats } from './VehicleStats';
import { GlobalStats } from './GlobalStats';
import { StructureStats } from './StructureStats';
import { ReportExport } from './ReportExport';
import { BarChart3, Car, Building2, FileDown } from 'lucide-react';

export function StatisticsPanel() {
  const [activeTab, setActiveTab] = useState('global');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">États Statistiques</h2>
          <p className="text-muted-foreground">Analyse complète du parc automobile</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="global" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Stats Globales</span>
          </TabsTrigger>
          <TabsTrigger value="vehicle" className="flex items-center gap-2">
            <Car className="w-4 h-4" />
            <span className="hidden sm:inline">Par Véhicule</span>
          </TabsTrigger>
          <TabsTrigger value="structure" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Par Structure</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="mt-6">
          <GlobalStats />
        </TabsContent>

        <TabsContent value="vehicle" className="mt-6">
          <VehicleStats />
        </TabsContent>

        <TabsContent value="structure" className="mt-6">
          <StructureStats />
        </TabsContent>

        <TabsContent value="export" className="mt-6">
          <ReportExport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
