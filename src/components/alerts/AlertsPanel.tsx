import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAlerts, useMarkAlertAsRead, useResolveAlert, useDeleteAlert, useGenerateAlerts } from '@/hooks/useAlerts';
import { Bell, AlertTriangle, Check, Trash2, RefreshCw, Loader2, Car, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function AlertsPanel() {
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  const { data: alerts, isLoading } = useAlerts({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
  });
  
  const markAsRead = useMarkAlertAsRead();
  const resolveAlert = useResolveAlert();
  const deleteAlert = useDeleteAlert();
  const generateAlerts = useGenerateAlerts();

  const handleGenerateAlerts = async () => {
    try {
      const count = await generateAlerts.mutateAsync();
      toast.success(`${count} alertes générées`);
    } catch (error) {
      toast.error('Erreur lors de la génération des alertes');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente': return 'bg-red-500';
      case 'haute': return 'bg-orange-500';
      case 'normale': return 'bg-blue-500';
      case 'basse': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'assurance':
      case 'ct':
      case 'gpl':
      case 'vignette':
        return <Calendar className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      assurance: 'Assurance',
      ct: 'Contrôle Technique',
      gpl: 'GPL',
      vignette: 'Vignette',
      consommation: 'Consommation',
      immobilisation: 'Immobilisation',
      maintenance: 'Maintenance',
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Alertes
          {alerts && alerts.length > 0 && (
            <Badge variant="destructive">{alerts.length}</Badge>
          )}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous types</SelectItem>
              <SelectItem value="assurance">Assurance</SelectItem>
              <SelectItem value="ct">CT</SelectItem>
              <SelectItem value="gpl">GPL</SelectItem>
              <SelectItem value="vignette">Vignette</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="active">Actives</SelectItem>
              <SelectItem value="read">Lues</SelectItem>
              <SelectItem value="resolved">Résolues</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleGenerateAlerts} disabled={generateAlerts.isPending}>
            <RefreshCw className={`h-4 w-4 mr-2 ${generateAlerts.isPending ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts?.map((alert) => (
            <div key={alert.id} className={`flex items-center justify-between p-4 border rounded-lg ${alert.status === 'resolved' ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${getPriorityColor(alert.priority)} text-white`}>
                  {getTypeIcon(alert.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{alert.message}</p>
                    <Badge variant="outline">{getTypeLabel(alert.type)}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {alert.vehicle && (
                      <span className="flex items-center gap-1">
                        <Car className="h-3 w-3" />
                        {alert.vehicle.immatriculation}
                      </span>
                    )}
                    {alert.due_date && (
                      <span>• Échéance: {format(new Date(alert.due_date), 'dd MMM yyyy', { locale: fr })}</span>
                    )}
                    <span>• {format(new Date(alert.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {alert.status === 'active' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAsRead.mutate(alert.id)}
                  >
                    Marquer lu
                  </Button>
                )}
                {alert.status !== 'resolved' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resolveAlert.mutate(alert.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteAlert.mutate(alert.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {alerts?.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Aucune alerte
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
