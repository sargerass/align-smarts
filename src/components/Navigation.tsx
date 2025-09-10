import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Home, 
  Target, 
  Network, 
  TrendingUp, 
  Settings,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

export function Navigation() {
  const location = useLocation();
  const { currentUser, logout } = useAuthStore();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/goals', label: 'Objetivos', icon: Target },
    { path: '/organization', label: 'Organigrama', icon: Network },
    { path: '/analytics', label: 'Analytics', icon: TrendingUp },
  ];

  if (currentUser?.role === 'ADMIN') {
    navItems.push({ path: '/admin', label: 'Admin', icon: Settings });
  }

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-gold rounded-lg flex items-center justify-center">
              <span className="text-brand-black font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">Acelera Corp</h1>
              <p className="text-xs text-muted-foreground">SMART Goals Platform</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "default" : "ghost"}
                  asChild
                  className={cn(
                    "gap-2",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                >
                  <Link to={item.path}>
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">{currentUser?.name}</p>
              <Badge variant="secondary" className="text-xs">
                {currentUser?.role}
              </Badge>
            </div>
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-brand-gold text-brand-black font-semibold">
                {currentUser?.name?.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-3">
          <div className="flex space-x-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  asChild
                  className={cn(
                    "gap-1 text-xs whitespace-nowrap",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                >
                  <Link to={item.path}>
                    <Icon className="w-3 h-3" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}