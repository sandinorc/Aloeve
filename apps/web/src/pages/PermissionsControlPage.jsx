import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import PermissionsControl from '@/components/PermissionsControl.jsx';

export default function PermissionsControlPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Helmet>
        <title>Control de Permisos | Aloeve Studio</title>
        <meta name="description" content="Gestión de roles y permisos de usuarios del sistema" />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Control de Permisos</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Administra los roles y niveles de acceso de todo el personal.
          </p>
        </div>

        <PermissionsControl />
      </motion.div>
    </div>
  );
}