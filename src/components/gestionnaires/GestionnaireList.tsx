import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Edit, Mail, Phone, Building2, MapPin, UserCog, Trash2, Loader2 } from 'lucide-react';
import { useGestionnaires, useCreateGestionnaire, useUpdateGestionnaire, useDeleteGestionnaire, useToggleGestionnaireActive } from '@/hooks/useGestionnaires';
import { useUsers } from '@/hooks/useUsers';
import { useSites } from '@/hooks/useSites';
import { useStructures } from '@/hooks/useStructures';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FormData {
  profile_id: string;
  site_id: string | null;
  structure_id: string | null;
  actif: boolean;
  date_affectation: string;
  observations: string;
}

export function GestionnaireList() {
  const { data: gestionnaires = [], isLoading } = useGestionnaires();
  const { data: users = [] } = useUsers();
  const { data: sites = [] } = useSites();
  const { data: structures = [] } = useStructures();
  
  const createGestionnaire = useCreateGestionnaire();
  const updateGestionnaire = useUpdateGestionnaire();
  const deleteGestionnaire = useDeleteGestionnaire();
  const toggleActive = useToggleGestionnaireActive();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSite, setFilterSite] = useState<string>('all');
  const [filterActif, setFilterActif] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGestionnaire, setEditingGestionnaire] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    profile_id: '',
    site_id: null,
    structure_id: null,
    actif: true,
    date_affectation: new Date().toISOString().split('T')[0],
    observations: '',
  });

  // Filtrer les utilisateurs qui ne sont pas encore gestionnaires
  const availableUsers = users.filter(user => 
    !gestionnaires.some(g => g.profile_id === user.id) || 
    (editingGestionnaire && gestionnaires.find(g => g.id === editingGestionnaire)?.profile_id === user.id)
  );

  const filteredGestionnaires = gestionnaires.filter((g) => {
    const matchesSearch = 
      g.profile?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.profile?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSite = filterSite === 'all' || g.site_id === filterSite;
    const matchesActif = filterActif === 'all' || 
      (filterActif === 'actif' && g.actif) || 
      (filterActif === 'inactif' && !g.actif);
    return matchesSearch && matchesSite && matchesActif;
  });

  const handleOpenDialog = (gestionnaireId?: string) => {
    if (gestionnaireId) {
      const gestionnaire = gestionnaires.find(g => g.id === gestionnaireId);
      if (gestionnaire) {
        setEditingGestionnaire(gestionnaireId);
        setFormData({
          profile_id: gestionnaire.profile_id,
          site_id: gestionnaire.site_id,
          structure_id: gestionnaire.structure_id,
          actif: gestionnaire.actif,
          date_affectation: gestionnaire.date_affectation,
          observations: gestionnaire.observations || '',
        });
      }
    } else {
      setEditingGestionnaire(null);
      setFormData({
        profile_id: '',
        site_id: null,
        structure_id: null,
        actif: true,
        date_affectation: new Date().toISOString().split('T')[0],
        observations: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingGestionnaire) {
        await updateGestionnaire.mutateAsync({
          id: editingGestionnaire,
          site_id: formData.site_id,
          structure_id: formData.structure_id,
          actif: formData.actif,
          date_affectation: formData.date_affectation,
          observations: formData.observations || null,
        });
        toast.success('Gestionnaire mis à jour');
      } else {
        await createGestionnaire.mutateAsync({
          profile_id: formData.profile_id,
          site_id: formData.site_id,
          structure_id: formData.structure_id,
          actif: formData.actif,
          date_affectation: formData.date_affectation,
          observations: formData.observations || null,
        });
        toast.success('Gestionnaire créé');
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Erreur lors de l\'opération');
      console.error(error);
    }
  };

  const handleToggleActif = async (id: string, currentActif: boolean) => {
    try {
      await toggleActive.mutateAsync({ id, actif: !currentActif });
      toast.success(currentActif ? 'Gestionnaire désactivé' : 'Gestionnaire activé');
    } catch (error) {
      toast.error('Erreur lors de la modification');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteGestionnaire.mutateAsync(deleteConfirmId);
      toast.success('Gestionnaire supprimé');
      setDeleteConfirmId(null);
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const actifs = gestionnaires.filter(g => g.actif).length;
  const inactifs = gestionnaires.filter(g => !g.actif).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-modern">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center">
              <UserCog className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{gestionnaires.length}</p>
              <p className="text-sm text-muted-foreground">Total Gestionnaires</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
              <UserCog className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{actifs}</p>
              <p className="text-sm text-muted-foreground">Actifs</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <UserCog className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{inactifs}</p>
              <p className="text-sm text-muted-foreground">Inactifs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card className="card-modern">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg font-semibold">Liste des Gestionnaires</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary text-primary-foreground" onClick={() => handleOpenDialog()}>
                  <Plus className="w-4 h-4 mr-2" /> Nouveau Gestionnaire
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingGestionnaire ? 'Modifier le Gestionnaire' : 'Nouveau Gestionnaire'}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {!editingGestionnaire && (
                    <div className="space-y-2">
                      <Label>Utilisateur *</Label>
                      <Select 
                        value={formData.profile_id} 
                        onValueChange={(v) => setFormData({...formData, profile_id: v})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un utilisateur" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableUsers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.prenom} {user.nom} - {user.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Site</Label>
                      <Select 
                        value={formData.site_id || 'none'} 
                        onValueChange={(v) => setFormData({...formData, site_id: v === 'none' ? null : v})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Aucun</SelectItem>
                          {sites.map((site) => (
                            <SelectItem key={site.id} value={site.id}>{site.nom}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Structure</Label>
                      <Select 
                        value={formData.structure_id || 'none'} 
                        onValueChange={(v) => setFormData({...formData, structure_id: v === 'none' ? null : v})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Aucune</SelectItem>
                          {structures.map((structure) => (
                            <SelectItem key={structure.id} value={structure.id}>{structure.nom}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Date d'affectation</Label>
                    <Input 
                      type="date"
                      value={formData.date_affectation} 
                      onChange={(e) => setFormData({...formData, date_affectation: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch 
                      checked={formData.actif} 
                      onCheckedChange={(checked) => setFormData({...formData, actif: checked})}
                    />
                    <Label>Actif</Label>
                  </div>
                  <div className="space-y-2">
                    <Label>Observations</Label>
                    <Textarea 
                      value={formData.observations} 
                      onChange={(e) => setFormData({...formData, observations: e.target.value})}
                      placeholder="Notes ou remarques..."
                      rows={2}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                  <Button 
                    className="gradient-primary text-primary-foreground"
                    onClick={handleSubmit}
                    disabled={(!editingGestionnaire && !formData.profile_id) || createGestionnaire.isPending || updateGestionnaire.isPending}
                  >
                    {(createGestionnaire.isPending || updateGestionnaire.isPending) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {editingGestionnaire ? 'Mettre à jour' : 'Créer'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                className="pl-10" 
                placeholder="Rechercher par nom, prénom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterSite} onValueChange={setFilterSite}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrer par site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les sites</SelectItem>
                {sites.map((site) => (
                  <SelectItem key={site.id} value={site.id}>{site.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterActif} onValueChange={setFilterActif}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="actif">Actifs</SelectItem>
                <SelectItem value="inactif">Inactifs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Gestionnaire</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Site / Structure</TableHead>
                  <TableHead>Affectation</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGestionnaires.map((gestionnaire) => (
                  <TableRow key={gestionnaire.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {gestionnaire.profile?.prenom?.[0] || ''}{gestionnaire.profile?.nom?.[0] || ''}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{gestionnaire.profile?.prenom} {gestionnaire.profile?.nom}</p>
                          <p className="text-xs text-muted-foreground">ID: {gestionnaire.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          <span>{gestionnaire.profile?.email || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          <span>{gestionnaire.profile?.telephone || '-'}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span>{gestionnaire.site?.nom || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="w-3 h-3 text-muted-foreground" />
                          <span>{gestionnaire.structure?.nom || '-'}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{new Date(gestionnaire.date_affectation).toLocaleDateString('fr-FR')}</p>
                      {gestionnaire.observations && (
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">{gestionnaire.observations}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={gestionnaire.actif} 
                          onCheckedChange={() => handleToggleActif(gestionnaire.id, gestionnaire.actif)}
                        />
                        <Badge variant={gestionnaire.actif ? 'default' : 'secondary'}>
                          {gestionnaire.actif ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleOpenDialog(gestionnaire.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteConfirmId(gestionnaire.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredGestionnaires.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Aucun gestionnaire trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce gestionnaire ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
