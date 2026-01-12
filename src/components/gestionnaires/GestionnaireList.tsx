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
import { Plus, Search, Edit, Mail, Phone, Building2, MapPin, UserCog } from 'lucide-react';
import { mockGestionnaires, sites, structures } from '@/data/mockData';
import { Gestionnaire } from '@/types/fleet';

export function GestionnaireList() {
  const [gestionnaires, setGestionnaires] = useState<Gestionnaire[]>(mockGestionnaires);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSite, setFilterSite] = useState<string>('all');
  const [filterActif, setFilterActif] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGestionnaire, setEditingGestionnaire] = useState<Gestionnaire | null>(null);
  const [formData, setFormData] = useState<Partial<Gestionnaire>>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    site: '',
    structure: '',
    actif: true,
    dateAffectation: new Date().toISOString().split('T')[0],
    observations: '',
  });

  const filteredGestionnaires = gestionnaires.filter((g) => {
    const matchesSearch = 
      g.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSite = filterSite === 'all' || g.site === filterSite;
    const matchesActif = filterActif === 'all' || 
      (filterActif === 'actif' && g.actif) || 
      (filterActif === 'inactif' && !g.actif);
    return matchesSearch && matchesSite && matchesActif;
  });

  const handleOpenDialog = (gestionnaire?: Gestionnaire) => {
    if (gestionnaire) {
      setEditingGestionnaire(gestionnaire);
      setFormData(gestionnaire);
    } else {
      setEditingGestionnaire(null);
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        site: '',
        structure: '',
        actif: true,
        dateAffectation: new Date().toISOString().split('T')[0],
        observations: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingGestionnaire) {
      setGestionnaires(gestionnaires.map(g => 
        g.id === editingGestionnaire.id 
          ? { ...g, ...formData } as Gestionnaire
          : g
      ));
    } else {
      const newGestionnaire: Gestionnaire = {
        id: `G${String(gestionnaires.length + 1).padStart(3, '0')}`,
        nom: formData.nom || '',
        prenom: formData.prenom || '',
        email: formData.email || '',
        telephone: formData.telephone || '',
        site: formData.site || '',
        structure: formData.structure || '',
        actif: formData.actif ?? true,
        dateAffectation: formData.dateAffectation || new Date().toISOString().split('T')[0],
        observations: formData.observations,
      };
      setGestionnaires([...gestionnaires, newGestionnaire]);
    }
    setIsDialogOpen(false);
  };

  const toggleActif = (id: string) => {
    setGestionnaires(gestionnaires.map(g => 
      g.id === id ? { ...g, actif: !g.actif } : g
    ));
  };

  const actifs = gestionnaires.filter(g => g.actif).length;
  const inactifs = gestionnaires.filter(g => !g.actif).length;

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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nom *</Label>
                      <Input 
                        value={formData.nom || ''} 
                        onChange={(e) => setFormData({...formData, nom: e.target.value})}
                        placeholder="Nom de famille"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Prénom *</Label>
                      <Input 
                        value={formData.prenom || ''} 
                        onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                        placeholder="Prénom"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input 
                      type="email"
                      value={formData.email || ''} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="email@company.dz"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Téléphone *</Label>
                    <Input 
                      value={formData.telephone || ''} 
                      onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                      placeholder="0555 12 34 56"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Site *</Label>
                      <Select 
                        value={formData.site || ''} 
                        onValueChange={(v) => setFormData({...formData, site: v})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {sites.map((site) => (
                            <SelectItem key={site} value={site}>{site}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Structure *</Label>
                      <Select 
                        value={formData.structure || ''} 
                        onValueChange={(v) => setFormData({...formData, structure: v})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {structures.map((structure) => (
                            <SelectItem key={structure} value={structure}>{structure}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Date d'affectation</Label>
                    <Input 
                      type="date"
                      value={formData.dateAffectation || ''} 
                      onChange={(e) => setFormData({...formData, dateAffectation: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch 
                      checked={formData.actif ?? true} 
                      onCheckedChange={(checked) => setFormData({...formData, actif: checked})}
                    />
                    <Label>Actif</Label>
                  </div>
                  <div className="space-y-2">
                    <Label>Observations</Label>
                    <Textarea 
                      value={formData.observations || ''} 
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
                    disabled={!formData.nom || !formData.prenom || !formData.email || !formData.telephone || !formData.site || !formData.structure}
                  >
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
                  <SelectItem key={site} value={site}>{site}</SelectItem>
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
                            {gestionnaire.prenom[0]}{gestionnaire.nom[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{gestionnaire.prenom} {gestionnaire.nom}</p>
                          <p className="text-xs text-muted-foreground">{gestionnaire.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          <span>{gestionnaire.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          <span>{gestionnaire.telephone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span>{gestionnaire.site}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="w-3 h-3 text-muted-foreground" />
                          <span>{gestionnaire.structure}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{new Date(gestionnaire.dateAffectation).toLocaleDateString('fr-FR')}</p>
                      {gestionnaire.observations && (
                        <p className="text-xs text-muted-foreground">{gestionnaire.observations}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={gestionnaire.actif} 
                          onCheckedChange={() => toggleActif(gestionnaire.id)}
                        />
                        <Badge variant={gestionnaire.actif ? 'default' : 'secondary'}>
                          {gestionnaire.actif ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleOpenDialog(gestionnaire)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
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
    </div>
  );
}
