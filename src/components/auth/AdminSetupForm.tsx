import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AdminSetupFormProps {
  onComplete: () => void;
}

export function AdminSetupForm({ onComplete }: AdminSetupFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();

  const handleCreateAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const nom = formData.get('nom') as string;
    const prenom = formData.get('prenom') as string;

    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            nom,
            prenom,
          },
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Erreur lors de la création du compte');
      }

      // 2. Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 3. Update the user role to admin
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: 'admin' })
        .eq('user_id', authData.user.id);

      if (roleError) {
        // If update fails, try insert
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: 'admin',
          });

        if (insertError) {
          console.error('Error setting admin role:', insertError);
          // Don't throw - the user is created, just role assignment failed
        }
      }

      setIsComplete(true);
      toast.success('Compte administrateur créé avec succès!');

      // Auto login after creation
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!signInError) {
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        onComplete();
      }
    } catch (error: any) {
      console.error('Admin creation error:', error);
      toast.error('Erreur lors de la création', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isComplete) {
    return (
      <Card className="w-full max-w-md border-green-500/50 bg-green-500/5">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-600">Administrateur créé!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Redirection en cours...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-amber-500/50 bg-amber-500/5">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-amber-600" />
        </div>
        <CardTitle className="text-xl">Configuration initiale</CardTitle>
        <CardDescription>
          Aucun administrateur détecté. Créez le premier compte admin pour commencer.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="admin-nom">Nom *</Label>
              <Input
                id="admin-nom"
                name="nom"
                type="text"
                placeholder="Dupont"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-prenom">Prénom</Label>
              <Input
                id="admin-prenom"
                name="prenom"
                type="text"
                placeholder="Jean"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="admin-email">Email *</Label>
            <Input
              id="admin-email"
              name="email"
              type="email"
              placeholder="admin@entreprise.com"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="admin-password">Mot de passe *</Label>
            <Input
              id="admin-password"
              name="password"
              type="password"
              placeholder="••••••••"
              minLength={6}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="admin-confirm">Confirmer le mot de passe *</Label>
            <Input
              id="admin-confirm"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              minLength={6}
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Créer le compte administrateur
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
