import { getWarehouseRotation } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Package, ArrowUpRight, ArrowRight, ArrowDownRight } from 'lucide-react';
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

type RotationFilter = 'alta' | 'media' | 'baja' | 'todas';

function RotationBadge({ rotation }: { rotation: 'alta' | 'media' | 'baja' }) {
  if (rotation === 'alta') {
    return (
      <Badge className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1">
        <ArrowUpRight className="h-3 w-3" />
        Alta rotación
      </Badge>
    );
  }
  if (rotation === 'media') {
    return (
      <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black flex items-center gap-1">
        <ArrowRight className="h-3 w-3" />
        Media rotación
      </Badge>
    );
  }
  return (
    <Badge className="bg-gray-500 hover:bg-gray-600 text-white flex items-center gap-1">
      <ArrowDownRight className="h-3 w-3" />
      Baja rotación
    </Badge>
  );
}

function RotationLegend() {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-3 w-3 rounded-full bg-green-600" />
        50 o más unidades vendidas (Alta rotación)
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex h-3 w-3 rounded-full bg-yellow-500" />
        10 - 49 unidades (Media rotación)
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex h-3 w-3 rounded-full bg-gray-500" />
        1 - 9 unidades (Baja rotación)
      </div>
    </div>
  );
}

async function WarehouseContent({ periodDays }: { periodDays: number }) {
  const rotation = await getWarehouseRotation(periodDays);

  const alta = rotation.products.filter((p) => p.rotation === 'alta');
  const media = rotation.products.filter((p) => p.rotation === 'media');
  const baja = rotation.products.filter((p) => p.rotation === 'baja');

  return (
    <div className="flex flex-col gap-6">
      {/* Resumen superior */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alta rotación</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{alta.length}</div>
            <p className="text-xs text-muted-foreground">
              Productos que se mueven rápido en los últimos {rotation.periodDays} días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Media rotación</CardTitle>
            <ArrowRight className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{media.length}</div>
            <p className="text-xs text-muted-foreground">
              Productos con movimiento moderado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Baja rotación</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-700">{baja.length}</div>
            <p className="text-xs text-muted-foreground">
              Productos que casi no se mueven
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Rotación de productos
          </CardTitle>
          <CardDescription>
            Clasificación de productos por rotación en los últimos {rotation.periodDays} días.
          </CardDescription>
          <div className="mt-2">
            <RotationLegend />
          </div>
        </CardHeader>
        <CardContent>
          {rotation.products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron movimientos de productos en este periodo.</p>
              <p className="text-sm">
                Cuando se entreguen pedidos que incluyan productos, sus movimientos aparecerán aquí.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-center">Stock actual</TableHead>
                  <TableHead className="text-center">Unidades vendidas</TableHead>
                  <TableHead className="text-right">Rotación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rotation.products.map((p) => (
                  <TableRow key={p.productId}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.categoryName || '-'}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{p.currentStock}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge>{p.quantitySold}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <RotationBadge rotation={p.rotation} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default async function WarehousePage() {
  const session = await getServerSession(authOptions);

  // Solo admin o usuarios con permiso 'warehouse' pueden entrar
  if (!session || (session.user.role !== 'admin' && !session.user.permissions.includes('warehouse'))) {
    redirect('/dashboard');
  }

  // De momento usamos un periodo fijo de 30 días para clasificar movimientos
  const periodDays = 30;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Almacén</h1>
        <p className="text-muted-foreground">
          Movimientos de productos clasificados por alta, media y baja rotación.
        </p>
      </div>

      <Suspense fallback={<div className="text-sm text-muted-foreground">Cargando movimientos de almacén...</div>}>
        <WarehouseContent periodDays={periodDays} />
      </Suspense>
    </div>
  );
}