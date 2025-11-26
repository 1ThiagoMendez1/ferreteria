'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Permission {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: {
    name: string;
  };
  permissions: Array<{
    permission: {
      name: string;
      id: string;
    };
  }>;
}

export default function UserPermissionsPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const userId = params.userId as string;

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchData();
  }, [session, status, userId]);

  const fetchData = async () => {
    try {
      // Fetch user
      const userResponse = await fetch(`/api/users/${userId}`);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
        setSelectedPermissions(userData.permissions.map((up: any) => up.permission.id));
      }

      // Fetch all permissions
      const permissionsResponse = await fetch('/api/permissions');
      if (permissionsResponse.ok) {
        const permissionsData = await permissionsResponse.json();
        setPermissions(permissionsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setSelectedPermissions(prev =>
      checked
        ? [...prev, permissionId]
        : prev.filter(id => id !== permissionId)
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/users/${userId}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: selectedPermissions }),
      });

      if (response.ok) {
        toast.success('Permisos actualizados');
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al actualizar permisos');
      }
    } catch (error) {
      toast.error('Error al actualizar permisos');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <div>Usuario no encontrado</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" asChild>
          <Link href="/dashboard/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Permisos de Usuario</h1>
          <p className="text-muted-foreground">
            Gestiona los permisos de acceso para {user.name}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Usuario</CardTitle>
          <CardDescription>
            <div className="flex items-center space-x-4 mt-2">
              <span><strong>Nombre:</strong> {user.name}</span>
              <span><strong>Email:</strong> {user.email}</span>
              <Badge variant={user.role.name === 'admin' ? 'default' : 'secondary'}>
                {user.role.name === 'admin' ? 'Administrador' : 'Vendedor'}
              </Badge>
            </div>
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permisos de Dashboard</CardTitle>
          <CardDescription>
            Selecciona las secciones del dashboard a las que este usuario tendrá acceso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {permissions.map((permission) => (
              <div key={permission.id} className="flex items-center space-x-2">
                <Checkbox
                  id={permission.id}
                  checked={selectedPermissions.includes(permission.id)}
                  onCheckedChange={(checked) =>
                    handlePermissionChange(permission.id, checked as boolean)
                  }
                />
                <label
                  htmlFor={permission.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {getPermissionDisplayName(permission.name)}
                </label>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Guardando...' : 'Guardar Permisos'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getPermissionDisplayName(permissionName: string): string {
  const names: Record<string, string> = {
    dashboard: 'Panel de Control',
    products: 'Productos',
    orders: 'Pedidos',
    sales: 'Ventas en Tienda',
    consultations: 'Asesorías',
    users: 'Gestión de Usuarios'
  };
  return names[permissionName] || permissionName;
}