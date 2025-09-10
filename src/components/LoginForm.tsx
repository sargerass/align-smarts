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
    <div className="min-h-screen bg-gradient-to-br from-brand-light-gold to-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-brand-gold rounded-2xl flex items-center justify-center mb-4">
              <span className="text-brand-black font-bold text-2xl">A</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold">Acelera Corp</h1>
          <p className="text-muted-foreground">Plataforma de Objetivos SMART</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Login Form */}
          <Card>
            <CardHeader>
              <CardTitle>Iniciar Sesión</CardTitle>
              <CardDescription>
                Ingresa tu email para acceder a la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Demo Users */}
          <Card>
            <CardHeader>
              <CardTitle>Usuarios Demo</CardTitle>
              <CardDescription>
                Haz click en cualquier usuario para acceder
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {demoUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => !isLoading && setEmail(user.email)}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
                >
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant="secondary">{user.role}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Features Preview */}
        <Card className="bg-card/50 backdrop-blur">
          <CardContent className="pt-6">
            <div className="grid sm:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl mb-2">🎯</div>
                <h3 className="font-semibold">Objetivos SMART</h3>
                <p className="text-sm text-muted-foreground">
                  Validación automática con IA
                </p>
              </div>
              <div>
                <div className="text-2xl mb-2">🏢</div>
                <h3 className="font-semibold">Organigrama</h3>
                <p className="text-sm text-muted-foreground">
                  Alineación organizacional
                </p>
              </div>
              <div>
                <div className="text-2xl mb-2">📈</div>
                <h3 className="font-semibold">Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Métricas y tendencias
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}