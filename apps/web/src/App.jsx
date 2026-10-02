import React from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { CartProvider } from './contexts/CartContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PermissionProtectedRoute from './components/PermissionProtectedRoute.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import CartPanel from './components/CartPanel.jsx';
import { Loader2 } from 'lucide-react';

// Pages
import LoginPage from './pages/LoginPage.jsx';
import ExecutiveDashboard from './pages/ExecutiveDashboard.jsx';
import UsersManagementPage from './pages/UsersManagementPage.jsx';
import RolesManagementPage from './pages/RolesManagementPage.jsx';
import ActivityLogsPage from './pages/ActivityLogsPage.jsx';
import DiagnosticsPage from './pages/DiagnosticsPage.jsx';
import PermissionsControlPage from './pages/PermissionsControlPage.jsx';
import InventoryPage from './pages/InventoryPage.jsx';

// Apps
import FinancesApp from './pages/FinancesApp.jsx';
import AgendaApp from './pages/AgendaApp.jsx';
import CRMApp from './pages/CRMApp.jsx';

// POS Pages
import POSCatalogPage from './pages/POSCatalogPage.jsx';
import POSCheckoutPage from './pages/POSCheckoutPage.jsx';
import POSSalesHistoryPage from './pages/POSSalesHistoryPage.jsx';

const HomePage = () => <Navigate to="/login" replace />;

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/20 w-full">
      <Header />
      <CartPanel />
      <main className="flex-1 w-full flex flex-col">
        <Routes>
          {/* General Dashboard */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <ExecutiveDashboard />
            </ProtectedRoute>
          } />

          {/* Admin / Config Routes */}
          <Route path="/usuarios" element={
            <PermissionProtectedRoute requiredPermission="usuarios">
              <UsersManagementPage />
            </PermissionProtectedRoute>
          } />
          <Route path="/roles" element={
            <PermissionProtectedRoute requiredPermission="gestionar_roles">
              <RolesManagementPage />
            </PermissionProtectedRoute>
          } />
          <Route path="/logs" element={
            <PermissionProtectedRoute requiredPermission="configuracion">
              <ActivityLogsPage />
            </PermissionProtectedRoute>
          } />
          <Route path="/admin/permissions" element={
            <PermissionProtectedRoute requiredPermission="gestionar_roles">
              <PermissionsControlPage />
            </PermissionProtectedRoute>
          } />
          
          {/* App Modules */}
          <Route path="/crm/*" element={
            <PermissionProtectedRoute requiredPermission="crm">
              <CRMApp />
            </PermissionProtectedRoute>
          } />
          <Route path="/agenda/*" element={
            <PermissionProtectedRoute requiredPermission="agenda">
              <AgendaApp />
            </PermissionProtectedRoute>
          } />
          <Route path="/inventario" element={
            <PermissionProtectedRoute requiredPermission="inventario">
              <InventoryPage />
            </PermissionProtectedRoute>
          } />
          <Route path="/finanzas/*" element={
            <PermissionProtectedRoute requiredPermission="reportes">
              <FinancesApp />
            </PermissionProtectedRoute>
          } />
          
          {/* POS Routes */}
          <Route path="/pos" element={
            <PermissionProtectedRoute requiredPermission="punto_venta">
              <POSCatalogPage />
            </PermissionProtectedRoute>
          } />
          <Route path="/pos/checkout" element={
            <PermissionProtectedRoute requiredPermission="crear_venta">
              <POSCheckoutPage />
            </PermissionProtectedRoute>
          } />
          <Route path="/pos/historial" element={
            <PermissionProtectedRoute requiredPermission="ver_historial_ventas">
              <POSSalesHistoryPage />
            </PermissionProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background w-full">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium">Iniciando aplicación...</p>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/diagnostics" element={<DiagnosticsPage />} />
        <Route path="/*" element={<MainLayout />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;