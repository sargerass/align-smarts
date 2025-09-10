import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { seedUsers } from '@/data/seedData';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    
    try {
      const success = await login(email);
      if (!success) {
        toast({
          title: "Error de acceso",
          description: "Email no encontrado en el sistema",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const demoUsers = seedUsers.slice(0, 6); // Show first 6 users for demo

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-bold text-xl">A</span>
            </div>
            <CardTitle>Acelera Corp</CardTitle>
            <CardDescription>Plataforma de Objetivos SMART</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                placeholder="tu.email@aceleracorp.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ingresar
              </Button>
            </form>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">Usuarios demo:</p>
              <div className="grid grid-cols-2 gap-2">
                {demoUsers.slice(0, 4).map((user) => (
                  <Button
                    key={user.id}
                    variant="outline"
                    size="sm"
                    onClick={() => !isLoading && setEmail(user.email)}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    {user.role}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}