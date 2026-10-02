import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, RefreshCw, Trash2, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import apiServerClient from '@/lib/apiServerClient.js';
import pb from '@/lib/pocketbaseClient.js';

const TARGET_ID = '5jzqlp3ld9e0pwk';

export default function DiagnosticsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authState, setAuthState] = useState({
    isValid: false,
    token: '',
    model: null,
    decodedToken: null
  });

  const decodeJWT = (token) => {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return { error: 'Invalid token format' };
    }
  };

  const updateAuthState = () => {
    setAuthState({
      isValid: pb.authStore.isValid,
      token: pb.authStore.token,
      model: pb.authStore.model,
      decodedToken: decodeJWT(pb.authStore.token)
    });
  };

  const fetchDiagnostics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiServerClient.fetch(`/diagnostics/find-id/${TARGET_ID}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setReport(data);
    } catch (err) {
      console.error('Error fetching diagnostics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateAuthState();
    fetchDiagnostics();

    // Listen to auth store changes
    const unsubscribe = pb.authStore.onChange(() => {
      updateAuthState();
    });

    return () => unsubscribe();
  }, []);

  const handleClearAuthStore = () => {
    console.log('[DIAGNOSTICS] Clearing pb.authStore manually');
    pb.authStore.clear();
    updateAuthState();
  };

  const handleResetAll = () => {
    console.log('[DIAGNOSTICS] Resetting all storage manually');
    pb.authStore.clear();
    localStorage.clear();
    sessionStorage.clear();
    updateAuthState();
    window.location.reload();
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            Panel de Diagnóstico Crítico
          </h1>
          <p className="text-muted-foreground mt-1">
            Investigación del ID corrupto: <code className="bg-muted px-1 py-0.5 rounded">{TARGET_ID}</code>
          </p>
        </div>
        <Button onClick={fetchDiagnostics} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar Reporte
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Auth Store Status */}
        <Card className="border-destructive/20 shadow-sm">
          <CardHeader className="bg-destructive/5 pb-4">
            <CardTitle className="text-lg flex items-center justify-between">
              Estado Local (pb.authStore)
              <Badge variant={authState.isValid ? "default" : "secondary"}>
                {authState.isValid ? "Válido" : "Inválido"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Modelo Actual:</h3>
              <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-40 border">
                {authState.model ? JSON.stringify(authState.model, null, 2) : 'null'}
              </pre>
              {authState.model?.id === TARGET_ID && (
                <Alert variant="destructive" className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>¡ALERTA CRÍTICA!</AlertTitle>
                  <AlertDescription>El ID corrupto está actualmente en el authStore local.</AlertDescription>
                </Alert>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">JWT Decodificado:</h3>
              <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-40 border">
                {authState.decodedToken ? JSON.stringify(authState.decodedToken, null, 2) : 'No token'}
              </pre>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="destructive" onClick={handleClearAuthStore} className="flex-1">
                <Trash2 className="h-4 w-4 mr-2" />
                Limpiar AuthStore
              </Button>
              <Button variant="outline" onClick={handleResetAll} className="flex-1 border-destructive text-destructive hover:bg-destructive/10">
                <RefreshCw className="h-4 w-4 mr-2" />
                Resetear Todo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Backend Report */}
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/50 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5" />
              Reporte de Base de Datos (Backend)
            </CardTitle>
            <CardDescription>
              Búsqueda exhaustiva en todas las colecciones
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p>Escaneando base de datos...</p>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error de conexión</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : report ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg border">
                  <span className="font-medium">Total de ocurrencias:</span>
                  <Badge variant={report.total_occurrences > 0 ? "destructive" : "secondary"} className="text-base px-3 py-1">
                    {report.total_occurrences}
                  </Badge>
                </div>

                {report.total_occurrences === 0 ? (
                  <div className="text-center py-8 text-muted-foreground bg-green-50/50 rounded-lg border border-green-100">
                    <p className="text-green-600 font-medium">¡Excelente! No se encontraron rastros del ID en la base de datos.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm text-muted-foreground">Detalle por colección:</h3>
                    {report.found_in.map((item, idx) => (
                      <div key={idx} className="border rounded-lg overflow-hidden">
                        <div className="bg-muted px-4 py-2 flex justify-between items-center border-b">
                          <span className="font-semibold capitalize">{item.collection}</span>
                          <Badge variant="outline">{item.count} registros</Badge>
                        </div>
                        <div className="p-0">
                          <pre className="text-xs p-4 overflow-auto max-h-60 bg-slate-950 text-slate-50 m-0">
                            {JSON.stringify(item.records, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}