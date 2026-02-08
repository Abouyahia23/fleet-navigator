import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useUsers, useUpdateUserRole, useToggleUserActive } from '@/hooks/useUsers';
import { Users, Shield, UserCog, User, Loader2, Search, CheckCircle, XCircle, Key } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Permission {
  id: string;
  label: string;
  description: string;
  roles: ('admin' | 'gestionnaire' | 'utilisateur')[];
}

const permissions: Permission[] = [
  { id: 'manage_users', label: 'Gestion des utilisateurs', description: 'Créer, modifier et supprimer des utilisateurs', roles: ['admin'] },
  { id: 'manage_roles', label: 'Gestion des rôles', description: 'Attribuer et modifier les rôles', roles: ['admin'] },
  { id: 'manage_vehicles', label: 'Gestion des véhicules', description: 'CRUD complet sur les véhicules', roles: ['admin', 'gestionnaire'] },
  { id: 'manage_fuel', label: 'Gestion du carburant', description: 'Saisie et consultation des pleins', roles: ['admin', 'gestionnaire', 'utilisateur'] },
  { id: 'manage_tickets', label: 'Gestion des tickets', description: 'Créer et gérer les tickets de réparation', roles: ['admin', 'gestionnaire', 'utilisateur'] },
  { id: 'manage_work_orders', label: 'Gestion des OT', description: 'Créer et clôturer les ordres de travail', roles: ['admin', 'gestionnaire'] },
  { id: 'manage_expenses', label: 'Gestion des dépenses', description: 'Saisie et validation des dépenses', roles: ['admin', 'gestionnaire'] },
  { id: 'manage_planning', label: 'Gestion du planning', description: 'Planifier les maintenances', roles: ['admin', 'gestionnaire'] },
  { id: 'view_statistics', label: 'Statistiques', description: 'Consulter les rapports et statistiques', roles: ['admin', 'gestionnaire'] },
  { id: 'manage_referentials', label: 'Gestion des référentiels', description: 'Gérer sites, structures, prestataires...', roles: ['admin'] },
  { id: 'export_reports', label: 'Export des rapports', description: 'Exporter les données en PDF/Excel', roles: ['admin', 'gestionnaire'] },
  { id: 'manage_alerts', label: 'Gestion des alertes', description: 'Configurer et traiter les alertes', roles: ['admin', 'gestionnaire'] },
];

export function UserManagement() {
  const { data: users, isLoading } = useUsers();
  const updateRole = useUpdateUserRole();
  const toggleActive = useToggleUserActive();
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showPermissions, setShowPermissions] = useState(false);

  const filteredUsers = users?.filter(user => {
    const matchesFilter = filter === 'all' || user.role === filter;
    const matchesSearch = 
      user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'gestionnaire' | 'utilisateur') => {
    try {
      await updateRole.mutateAsync({ userId, role: newRole });
      toast.success('Rôle mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du rôle');
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await toggleActive.mutateAsync({ id, actif: !currentActive });
      toast.success(currentActive ? 'Utilisateur désactivé' : 'Utilisateur activé');
    } catch (error) {
      toast.error('Erreur lors de la modification');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-500 hover:bg-red-600"><Shield className="h-3 w-3 mr-1" />Admin</Badge>;
      case 'gestionnaire':
        return <Badge className="bg-blue-500 hover:bg-blue-600"><UserCog className="h-3 w-3 mr-1" />Gestionnaire</Badge>;
      default:
        return <Badge variant="secondary"><User className="h-3 w-3 mr-1" />Utilisateur</Badge>;
    }
  };

  const selectedUser = users?.find(u => u.user_id === selectedUserId);
  const userPermissions = selectedUser ? permissions.filter(p => p.roles.includes(selectedUser.role)) : [];

  const stats = {
    total: users?.length || 0,
    admins: users?.filter(u => u.role === 'admin').length || 0,
    gestionnaires: users?.filter(u => u.role === 'gestionnaire').length || 0,
    utilisateurs: users?.filter(u => u.role === 'utilisateur').length || 0,
    actifs: users?.filter(u => u.actif !== false).length || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.admins}</p>
              <p className="text-xs text-muted-foreground">Admins</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <UserCog className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.gestionnaires}</p>
              <p className="text-xs text-muted-foreground">Gestionnaires</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.utilisateurs}</p>
              <p className="text-xs text-muted-foreground">Utilisateurs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.actifs}</p>
              <p className="text-xs text-muted-foreground">Actifs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users"><Users className="w-4 h-4 mr-2" />Utilisateurs</TabsTrigger>
          <TabsTrigger value="permissions"><Key className="w-4 h-4 mr-2" />Privilèges</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Gestion des Utilisateurs
                  </CardTitle>
                  <CardDescription>Gérer les comptes utilisateurs et leurs rôles</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    className="pl-10" 
                    placeholder="Rechercher par nom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filtrer par rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les rôles</SelectItem>
                    <SelectItem value="admin">Administrateurs</SelectItem>
                    <SelectItem value="gestionnaire">Gestionnaires</SelectItem>
                    <SelectItem value="utilisateur">Utilisateurs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Users Table */}
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôle actuel</TableHead>
                      <TableHead>Changer le rôle</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers?.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {user.prenom?.[0] || ''}{user.nom[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{user.prenom} {user.nom}</p>
                              <p className="text-xs text-muted-foreground">ID: {user.user_id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{user.email}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(value) => handleRoleChange(user.user_id, value as 'admin' | 'gestionnaire' | 'utilisateur')}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Administrateur</SelectItem>
                              <SelectItem value="gestionnaire">Gestionnaire</SelectItem>
                              <SelectItem value="utilisateur">Utilisateur</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={user.actif !== false}
                              onCheckedChange={() => handleToggleActive(user.id, user.actif !== false)}
                            />
                            <Badge variant={user.actif !== false ? 'default' : 'secondary'}>
                              {user.actif !== false ? 'Actif' : 'Inactif'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedUserId(user.user_id);
                              setShowPermissions(true);
                            }}
                          >
                            <Key className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredUsers?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Aucun utilisateur trouvé
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Matrice des Privilèges
              </CardTitle>
              <CardDescription>Aperçu des permissions par rôle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[300px]">Permission</TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Shield className="w-4 h-4 text-red-500" />
                          Admin
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <UserCog className="w-4 h-4 text-blue-500" />
                          Gestionnaire
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <User className="w-4 h-4 text-muted-foreground" />
                          Utilisateur
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissions.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{permission.label}</p>
                            <p className="text-xs text-muted-foreground">{permission.description}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {permission.roles.includes('admin') ? (
                            <CheckCircle className="w-5 h-5 text-success mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-muted-foreground/30 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {permission.roles.includes('gestionnaire') ? (
                            <CheckCircle className="w-5 h-5 text-success mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-muted-foreground/30 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {permission.roles.includes('utilisateur') ? (
                            <CheckCircle className="w-5 h-5 text-success mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-muted-foreground/30 mx-auto" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Permissions Dialog */}
      <Dialog open={showPermissions} onOpenChange={setShowPermissions}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Privilèges de l'utilisateur</DialogTitle>
            <DialogDescription>
              {selectedUser?.prenom} {selectedUser?.nom} - {getRoleBadge(selectedUser?.role || 'utilisateur')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {userPermissions.map((permission) => (
              <div key={permission.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{permission.label}</p>
                  <p className="text-xs text-muted-foreground">{permission.description}</p>
                </div>
              </div>
            ))}
            {permissions.filter(p => !p.roles.includes(selectedUser?.role || 'utilisateur')).map((permission) => (
              <div key={permission.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 opacity-50">
                <XCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{permission.label}</p>
                  <p className="text-xs text-muted-foreground">{permission.description}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
