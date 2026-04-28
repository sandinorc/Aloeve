import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  Package, 
  DollarSign, 
  LogOut, 
  Menu,
  Store,
  Activity,
  UserCircle,
  Shield,
  ShoppingCart,
  Settings
} from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import pb from '@/lib/pocketbaseClient';

export default function Header() {
  const { currentUser, logout, hasPermission } = useAuth();
  const { cartItems, setIsCartOpen } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Dynamic navigation based on permissions
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true }, // Always show dashboard
    { path: '/crm', label: 'CRM', icon: Users, show: hasPermission('crm') },
    { path: '/agenda', label: 'Agenda', icon: CalendarDays, show: hasPermission('agenda') },
    { path: '/inventario', label: 'Inventario', icon: Package, show: hasPermission('inventario') },
    { path: '/finanzas', label: 'Finanzas', icon: DollarSign, show: hasPermission('reportes') || currentUser?.rol === 'Admin' }, // Adjust as needed
    { path: '/pos', label: 'Punto de Venta', icon: Store, show: hasPermission('punto_venta') },
  ];

  const filteredNavItems = navItems.filter(item => item.show);

  const isActive = (path) => location.pathname.startsWith(path);
  
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="bg-white dark:bg-card border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-serif font-bold text-xl">A</span>
            </div>
            <span className="font-serif font-bold text-xl hidden sm:block text-foreground">Aloeve Studio</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 ml-6">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              if (item.path === '/agenda') {
                return (
                  <DropdownMenu key={item.path}>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant={active ? "secondary" : "ghost"} 
                        className={`gap-2 ${active ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'text-muted-foreground'}`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuItem onClick={() => navigate('/agenda')}>
                        <CalendarDays className="w-4 h-4 mr-2" /> Vista General
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/agenda/facilitadores')}>
                        <UserCircle className="w-4 h-4 mr-2" /> Facilitadores
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }

              return (
                <Link key={item.path} to={item.path}>
                  <Button 
                    variant={active ? "secondary" : "ghost"} 
                    className={`gap-2 ${active ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'text-muted-foreground'}`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Cart Button */}
          {currentUser && hasPermission('punto_venta') && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative" 
              onClick={() => setIsCartOpen(true)}
              aria-label="Abrir carrito"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[350px]">
              <div className="flex items-center gap-2 mb-8 mt-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-serif font-bold text-xl">A</span>
                </div>
                <span className="font-serif font-bold text-xl">Aloeve Studio</span>
              </div>
              <nav className="flex flex-col gap-2">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link key={item.path} to={item.path}>
                      <Button 
                        variant={active ? "secondary" : "ghost"} 
                        className={`w-full justify-start gap-3 ${active ? 'bg-primary/10 text-primary' : ''}`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
                
                {(hasPermission('usuarios') || hasPermission('gestionar_roles') || hasPermission('configuracion')) && (
                  <>
                    <div className="my-2 border-t border-border"></div>
                    {hasPermission('usuarios') && (
                      <Link to="/usuarios">
                        <Button variant="ghost" className="w-full justify-start gap-3">
                          <Users className="w-5 h-5" />
                          Gestión de Usuarios
                        </Button>
                      </Link>
                    )}
                    {hasPermission('gestionar_roles') && (
                      <Link to="/roles">
                        <Button variant="ghost" className="w-full justify-start gap-3">
                          <Shield className="w-5 h-5" />
                          Roles y Permisos
                        </Button>
                      </Link>
                    )}
                    {hasPermission('configuracion') && (
                      <Link to="/logs">
                        <Button variant="ghost" className="w-full justify-start gap-3">
                          <Activity className="w-5 h-5" />
                          Logs de Actividad
                        </Button>
                      </Link>
                    )}
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          {/* User Menu */}
          {currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={currentUser.avatar ? pb.files.getUrl(currentUser, currentUser.avatar) : ''} alt={currentUser.nombre_completo} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {currentUser.nombre_completo?.substring(0, 2).toUpperCase() || 'US'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.nombre_completo}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser.email}
                    </p>
                    <div className="mt-2">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {currentUser.rol || 'Usuario'}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {hasPermission('usuarios') && (
                  <DropdownMenuItem onClick={() => navigate('/usuarios')}>
                    <Users className="mr-2 h-4 w-4" />
                    <span>Usuarios</span>
                  </DropdownMenuItem>
                )}
                {hasPermission('gestionar_roles') && (
                  <DropdownMenuItem onClick={() => navigate('/roles')}>
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Roles y Permisos</span>
                  </DropdownMenuItem>
                )}
                {hasPermission('configuracion') && (
                  <DropdownMenuItem onClick={() => navigate('/logs')}>
                    <Activity className="mr-2 h-4 w-4" />
                    <span>Logs de Actividad</span>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}