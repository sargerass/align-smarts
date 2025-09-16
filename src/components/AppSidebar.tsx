import { Link, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Target, 
  Network, 
  TrendingUp, 
  Settings,
  LogOut,
  ChevronUp,
  User2
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/authStore';

export function AppSidebar() {
  const location = useLocation();
  const { currentUser, logout } = useAuthStore();
  const { state } = useSidebar();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/goals', label: 'Objetivos', icon: Target },
    { path: '/organization', label: 'Organigrama', icon: Network },
    { path: '/analytics', label: 'Analytics', icon: TrendingUp },
  ];

  if (currentUser?.role === 'ADMIN') {
    navItems.push({ path: '/admin', label: 'Admin', icon: Settings });
  }

  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b">
        <Link to="/" className="flex items-center gap-3 px-2 py-3">
          <div className="w-8 h-8 bg-brand-gold rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-brand-black font-bold text-lg">A</span>
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="font-bold text-base text-foreground truncate">Acelera Corp</h1>
              <p className="text-xs text-muted-foreground truncate">SMART Goals</p>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={isCollapsed ? item.label : undefined}
                    >
                      <Link to={item.path} className="flex items-center gap-3">
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {!isCollapsed && <span>{item.label}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-brand-gold text-brand-black font-semibold">
                      {currentUser?.name?.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{currentUser?.name}</span>
                      <Badge variant="secondary" className="text-xs w-fit">
                        {currentUser?.role}
                      </Badge>
                    </div>
                  )}
                  {!isCollapsed && <ChevronUp className="ml-auto size-4" />}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isCollapsed ? "right" : "bottom"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem className="gap-2 p-2" onClick={logout}>
                  <LogOut className="h-4 w-4 text-muted-foreground" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}