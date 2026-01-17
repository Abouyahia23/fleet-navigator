import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useUsers, useUpdateUserRole, useToggleUserActive } from '@/hooks/useUsers';
import { Users, Shield, UserCog, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function UserManagement() {
  const { data: users, isLoading } = useUsers();
  const updateRole = useUpdateUserRole();
  const toggleActive = useToggleUserActive();
  const [filter, setFilter] = useState<string>('all');

  const filteredUsers = users?.filter(user => {
    if (filter === 'all') return true;
    return user.role === filter;
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
        return <Badge className="bg-red-500"><Shield className="h-3 w-3 mr-1" />Admin</Badge>;
      case 'gestionnaire':
        return <Badge className="bg-blue-500"><UserCog className="h-3 w-3 mr-1" />Gestionnaire</Badge>;
      default:
        return <Badge variant="secondary"><User className="h-3 w-3 mr-1" />Utilisateur</Badge>;
    }
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
          <Users className="h-5 w-5" />
          Gestion des Utilisateurs
        </CardTitle>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            <SelectItem value="admin">Administrateurs</SelectItem>
            <SelectItem value="gestionnaire">Gestionnaires</SelectItem>
            <SelectItem value="utilisateur">Utilisateurs</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredUsers?.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {user.prenom?.[0] || ''}{user.nom[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{user.prenom} {user.nom}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                {getRoleBadge(user.role)}
              </div>
              <div className="flex items-center gap-4">
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
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Actif</span>
                  <Switch
                    checked={user.actif !== false}
                    onCheckedChange={() => handleToggleActive(user.id, user.actif !== false)}
                  />
                </div>
              </div>
            </div>
          ))}
          {filteredUsers?.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Aucun utilisateur trouvé
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
