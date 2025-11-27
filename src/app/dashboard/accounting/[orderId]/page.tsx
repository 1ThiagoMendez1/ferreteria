import { getAccountingOrderDetail } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, DollarSign, TrendingUp, Package } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPercent(value: number | null): string {
  if (value === null) return 'N/A';
  return `${(value * 100).toFixed(1)}%`;
}

export default async function AccountingOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const session = await getServerSession(authOptions);

  // Solo admin o usuarios con permiso 'accounting' pueden ver el detalle
  if (!session || (session.user.role !== 'admin' && !session.user.permissions.includes('accounting'))) {
    redirect('/dashboard');
  }

  const { orderId } = await params;
  const order = await getAccountingOrderDetail(orderId);

  if (!order) {
    notFound();
  }

  const overallMargin = order.totalSale > 0 
    ? ((order.totalProfit / order.totalSale) * 100) 
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/accounting">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Pedido #{order.orderCode}
          </h1>
          <p className="text-muted-foreground">
            {new Date(order.date).toLocaleDateString('es-CO', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            {order.customerName && ` • ${order.customerName}`}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Venta</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(order.totalSale)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Costo</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(order.totalCost)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${order.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(order.totalProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              Margen: {overallMargin.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Productos</CardTitle>
          <CardDescription>
            Desglose de costos y ganancias por producto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-center">Cantidad</TableHead>
                <TableHead className="text-right">Precio Venta</TableHead>
                <TableHead className="text-right">Costo Base</TableHead>
                <TableHead className="text-right">Margen</TableHead>
                <TableHead className="text-right">Total Venta</TableHead>
                <TableHead className="text-right">Total Costo</TableHead>
                <TableHead className="text-right">Ganancia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item, index) => {
                const itemMargin = item.lineTotal > 0 
                  ? ((item.lineProfit / item.lineTotal) * 100) 
                  : 0;
                
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {item.productName}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{item.quantity}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.unitBase !== null ? formatCurrency(item.unitBase) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.unitMargin !== null ? (
                        <Badge variant={item.unitMargin >= 0.2 ? 'default' : item.unitMargin >= 0.1 ? 'secondary' : 'destructive'}>
                          {formatPercent(item.unitMargin)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatCurrency(item.lineTotal)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {formatCurrency(item.lineCost)}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${item.lineProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(item.lineProfit)}
                      <span className="text-xs text-muted-foreground ml-1">
                        ({itemMargin.toFixed(1)}%)
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Totals Row */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-end gap-8">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Venta</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(order.totalSale)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Costo</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(order.totalCost)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Ganancia Neta</p>
                <p className={`text-lg font-bold ${order.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(order.totalProfit)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}