import { getAccountingSummary, getAccountingTotals } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Package, ShoppingCart, Calculator } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

// Forzamos esta página a ser dinámica para que siempre muestre los pedidos/ventas actualizados en producción
export const dynamic = 'force-dynamic';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export default async function AccountingPage() {
  const session = await getServerSession(authOptions);

  // Solo admin o usuarios con permiso 'accounting' pueden entrar
  if (!session || (session.user.role !== 'admin' && !session.user.permissions.includes('accounting'))) {
    redirect('/dashboard');
  }

  const [orders, totals] = await Promise.all([
    getAccountingSummary(),
    getAccountingTotals(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contabilidad</h1>
        <p className="text-muted-foreground">
          Resumen de ventas, costos y ganancias de pedidos entregados
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totals.totalSales)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totals.totalOrders} pedidos entregados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costos Totales</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totals.totalCosts)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totals.totalItems} productos vendidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totals.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totals.totalProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ventas - Costos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margen de Ganancia</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totals.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercent(totals.profitMargin)}
            </div>
            <p className="text-xs text-muted-foreground">
              Porcentaje de ganancia promedio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Pedidos Entregados
          </CardTitle>
          <CardDescription>
            Detalle de ventas, costos y ganancias por pedido
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay pedidos entregados aún.</p>
              <p className="text-sm">Los pedidos aparecerán aquí cuando se marquen como entregados.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead className="text-right">Venta</TableHead>
                  <TableHead className="text-right">Costo</TableHead>
                  <TableHead className="text-right">Ganancia</TableHead>
                  <TableHead className="text-right">Margen</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const margin = order.totalSale > 0 
                    ? ((order.totalProfit / order.totalSale) * 100) 
                    : 0;
                  
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono font-medium">
                        {order.orderCode}
                      </TableCell>
                      <TableCell>
                        {new Date(order.date).toLocaleDateString('es-CO', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{order.itemCount} items</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatCurrency(order.totalSale)}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {formatCurrency(order.totalCost)}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${order.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(order.totalProfit)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={margin >= 20 ? 'default' : margin >= 10 ? 'secondary' : 'destructive'}>
                          {formatPercent(margin)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link href={`/dashboard/accounting/${order.id}`}>
                          <Button variant="ghost" size="sm">
                            Ver detalle
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}