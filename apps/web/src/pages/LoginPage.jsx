import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('[LoginPage] Rendered. Current user:', currentUser?.id);
  }, [currentUser]);

  if (currentUser && !isSubmitting) {
    console.log('[LoginPage] User already logged in, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[LoginPage] Form submitted for email:', email);
    setError('');
    setDebugInfo(null);
    setIsSubmitting(true);

    try {
      const user = await login(email, password);
      
      console.log('Login successful. Role:', user.rol, 'Email:', user.email);
      
      if (!user.rol || user.rol.trim() === '') {
        setError('Error: No role assigned. Contact administrator.');
        setIsSubmitting(false);
        return;
      }

      // Display debug info before redirecting
      setDebugInfo({
        email: user.email,
        role: user.rol,
        name: user.nombre_completo
      });

      // Add a small delay to ensure state updates propagate and user sees the success state
      setTimeout(() => {
        console.log('[LoginPage] Navigating to dashboard after delay');
        navigate('/dashboard');
      }, 500);

    } catch (err) {
      console.error('[LoginPage] Error en handleSubmit:', err);
      
      // Enhanced error handling for connection failures
      if (err.isAbort || err.message === 'Failed to fetch') {
        setError('Error de conexión con el servidor. Por favor, verifica tu conexión a internet o contacta a soporte.');
      } else {
        setError('Usuario no encontrado o credenciales inválidas.');
      }
      
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-3xl pointer-events-none"></div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white font-serif italic text-3xl mx-auto mb-4 shadow-lg">A</div>
          <h1 className="text-3xl font-bold font-serif text-foreground">Aloeve Art Studio</h1>
          <p className="text-muted-foreground mt-2">Sistema de Gestión Integral</p>
        </div>

        <Card className="shadow-xl border-0 rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">Ingresa tus credenciales para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {debugInfo && (
                <Alert className="bg-green-50 border-green-200 text-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <div className="font-medium mb-1">Autenticación exitosa</div>
                    <div className="text-xs opacity-90">
                      Email: {debugInfo.email}<br/>
                      Rol asignado: <span className="font-bold">{debugInfo.role}</span>
                    </div>
                    <div className="text-xs mt-2 animate-pulse">Redirigiendo al dashboard...</div>
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="nombre@aloeveartstudio.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="bg-white text-gray-900"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="bg-white text-gray-900"
                  disabled={isSubmitting}
                />
              </div>
              
              <Button type="submit" className="w-full h-11 text-base mt-6" disabled={isSubmitting}>
                {isSubmitting && !debugInfo ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Verificando...
                  </>
                ) : (
                  'Ingresar al Sistema'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center text-xs text-muted-foreground mt-8">
          &copy; {new Date().getFullYear()} Aloeve Art Studio. Acceso restringido.
        </p>
      </motion.div>
    </div>
  );
}